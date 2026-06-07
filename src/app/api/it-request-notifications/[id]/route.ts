import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session-user";
import { connectDB } from "@/lib/db";
import { ITRequestNotification } from "@/lib/models/ITRequestNotification";
import { redis } from "@/lib/redis";

export async function PATCH(_req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  await ITRequestNotification.updateOne({ _id: params.id, userId: user.id }, { read: true });

  try { await redis.del(`it-notifs:${user.id}`); } catch { /* ignore */ }
  return NextResponse.json({ ok: true });
}
