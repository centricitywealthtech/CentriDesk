import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const TERMINAL_STATES = ["Approved", "Rejected"];
const SPECIAL_STATES = ["Pending Approval", "Approved", "Rejected"];

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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

  // Determine who to notify
  const isAdmin = session.user.role === "ADMIN";
  const callerId = session.user.id;
  const formName = tracking.form.name;
  let notifyUserIds: string[] = [];
  let message = "";

  if (SPECIAL_STATES.includes(state)) {
    const admins = await prisma.user.findMany({ where: { role: "ADMIN", isActive: true } });
    const allIds = [...new Set([...admins.map((a) => a.id), tracking.sharedById])];
    notifyUserIds = allIds.filter((id) => id !== callerId);
    message =
      state === "Pending Approval"
        ? `"${formName}" is Pending Approval`
        : `"${formName}" has been ${state}`;
  } else if (isAdmin) {
    message = `"${formName}" moved to "${state}" by Admin`;
    notifyUserIds = tracking.sharedById !== callerId ? [tracking.sharedById] : [];
  } else {
    const admins = await prisma.user.findMany({ where: { role: "ADMIN", isActive: true } });
    message = `"${formName}" moved to "${state}" by ${session.user.name}`;
    notifyUserIds = admins.map((a) => a.id).filter((id) => id !== callerId);
  }

  for (const userId of notifyUserIds) {
    await prisma.formNotification.create({
      data: { userId, message, trackingId: params.id },
    });
  }

  return NextResponse.json(updated);
}
