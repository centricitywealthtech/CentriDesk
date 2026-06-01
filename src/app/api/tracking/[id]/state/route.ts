import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session-user";
import { prisma } from "@/lib/prisma";

const TERMINAL_STATES = ["Approved", "Rejected"];
const SPECIAL_STATES = ["Pending Approval", "Approved", "Rejected"];

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { state } = await req.json();

  const tracking = await prisma.formTracking.findUnique({
    where: { id: params.id },
    include: { form: true },
  });

  if (!tracking) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (TERMINAL_STATES.includes(tracking.state)) {
    return NextResponse.json({ error: "Cannot change a terminal state" }, { status: 400 });
  }

  const updated = await prisma.formTracking.update({
    where: { id: params.id },
    data: { state },
  });

  const formName = tracking.form.name;
  let notifyUserIds: string[] = [];
  let message = "";

  if (SPECIAL_STATES.includes(state)) {
    const admins = await prisma.user.findMany({ where: { role: "ADMIN", isActive: true } });
    const seen = new Set<string>();
    const allIds = [...admins.map((a) => a.id), tracking.sharedById].filter((id) => {
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });
    notifyUserIds = allIds.filter((id) => id !== user.id);
    message =
      state === "Pending Approval"
        ? `"${formName}" is Pending Approval`
        : `"${formName}" has been ${state}`;
  } else if (user.role === "ADMIN") {
    message = `"${formName}" moved to "${state}" by Admin`;
    notifyUserIds = tracking.sharedById !== user.id ? [tracking.sharedById] : [];
  } else {
    const admins = await prisma.user.findMany({ where: { role: "ADMIN", isActive: true } });
    message = `"${formName}" moved to "${state}" by ${user.name}`;
    notifyUserIds = admins.map((a) => a.id).filter((id) => id !== user.id);
  }

  for (const userId of notifyUserIds) {
    await prisma.formNotification.create({
      data: { userId, message, trackingId: params.id },
    });
  }

  return NextResponse.json(updated);
}
