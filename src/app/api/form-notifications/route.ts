import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { FormNotification } from "@/lib/models/FormNotification";
import { redis } from "@/lib/redis";

const TTL = 15;

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json([], { status: 401 });

  const cacheKey = `form-notifs:${session.user.id}`;
  try {
    const cached = await redis.get(cacheKey);
    if (cached) return NextResponse.json(JSON.parse(cached));
  } catch { /* redis unavailable */ }

  await connectDB();
  const notifications = await FormNotification.find({ userId: session.user.id, read: false })
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();

  const result = notifications.map((n) => ({
    ...n,
    id: (n._id as { toString(): string }).toString(),
    trackingId: n.trackingId?.toString(),
  }));

  try { await redis.setex(cacheKey, TTL, JSON.stringify(result)); } catch { /* ignore */ }
  return NextResponse.json(result);
}
