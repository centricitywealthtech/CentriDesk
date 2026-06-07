import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { FormNotification } from "@/lib/models/FormNotification";
import { redis } from "@/lib/redis";

export async function PATCH(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const notif = await FormNotification.findById(params.id).lean();
  if (!notif || notif.userId.toString() !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await FormNotification.findByIdAndUpdate(params.id, { read: true });
  try { await redis.del(`form-notifs:${session.user.id}`); } catch { /* ignore */ }
  return NextResponse.json({ success: true });
}
