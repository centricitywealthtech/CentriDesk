import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session-user";
import { connectDB } from "@/lib/db";
import { ITRequestNotification } from "@/lib/models/ITRequestNotification";
import { redis } from "@/lib/redis";

const TTL = 15;

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const cacheKey = `it-notifs:${user.id}`;
  try {
    const cached = await redis.get(cacheKey);
    if (cached) return NextResponse.json(JSON.parse(cached));
  } catch { /* redis unavailable */ }

  await connectDB();
  const notifs = await ITRequestNotification.find({ userId: user.id, read: false })
    .sort({ createdAt: -1 })
    .lean();

  const result = notifs.map((n) => ({ ...n, id: (n._id as { toString(): string }).toString() }));
  try { await redis.setex(cacheKey, TTL, JSON.stringify(result)); } catch { /* ignore */ }
  return NextResponse.json(result);
}
