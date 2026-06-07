import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session-user";
import { connectDB } from "@/lib/db";
import { FormTracking } from "@/lib/models/FormTracking";
import { FormNotification } from "@/lib/models/FormNotification";
import { User } from "@/lib/models/User";

const TERMINAL_STATES = ["Approved", "Rejected"];
const SPECIAL_STATES = ["Pending Approval", "Approved", "Rejected"];

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { state } = await req.json();

  await connectDB();
  const tracking = await FormTracking.findById(params.id).populate("formId", "name").lean();
  if (!tracking) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (TERMINAL_STATES.includes(tracking.state)) {
    return NextResponse.json({ error: "Cannot change a terminal state" }, { status: 400 });
  }

  await FormTracking.findByIdAndUpdate(params.id, { state });

  const formName = (tracking.formId as { name?: string })?.name ?? "";
  let notifyUserIds: string[] = [];
  let message = "";

  if (SPECIAL_STATES.includes(state)) {
    const admins = await User.find({ role: "ADMIN", isActive: true }).select("_id").lean();
    const seen = new Set<string>();
    const allIds = [
      ...admins.map((a) => (a._id as { toString(): string }).toString()),
      tracking.sharedById.toString(),
    ].filter((id) => { if (seen.has(id)) return false; seen.add(id); return true; });
    notifyUserIds = allIds.filter((id) => id !== user.id);
    message = state === "Pending Approval"
      ? `"${formName}" is Pending Approval`
      : `"${formName}" has been ${state}`;
  } else if (user.role === "ADMIN") {
    message = `"${formName}" moved to "${state}" by Admin`;
    notifyUserIds = tracking.sharedById.toString() !== user.id ? [tracking.sharedById.toString()] : [];
  } else {
    const admins = await User.find({ role: "ADMIN", isActive: true }).select("_id").lean();
    message = `"${formName}" moved to "${state}" by ${user.name}`;
    notifyUserIds = admins.map((a) => (a._id as { toString(): string }).toString()).filter((id) => id !== user.id);
  }

  if (notifyUserIds.length > 0) {
    await FormNotification.insertMany(notifyUserIds.map((userId) => ({ userId, message, trackingId: params.id })));
  }

  const updated = await FormTracking.findById(params.id).lean();
  return NextResponse.json({ ...updated, id: (updated?._id as { toString(): string })?.toString() });
}
