import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session-user";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";

const TTL = 15; // 15 seconds

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const cacheKey = `it-notifs:${user.id}`;

  try {
    const cached = await redis.get(cacheKey);
    if (cached) return NextResponse.json(JSON.parse(cached));
  } catch { /* redis unavailable, fall through */ }

  const notifs = await prisma.iTRequestNotification.findMany({
    where: { userId: user.id, read: false },
    orderBy: { createdAt: "desc" },
    include: { softwareRequest: { select: { softwareName: true, requestedBy: true } } },
  });

  try { await redis.setex(cacheKey, TTL, JSON.stringify(notifs)); } catch { /* ignore */ }

  return NextResponse.json(notifs);
}
