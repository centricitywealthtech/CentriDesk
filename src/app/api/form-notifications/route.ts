import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";

const TTL = 15; // 15 seconds

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json([], { status: 401 });

  const cacheKey = `form-notifs:${session.user.id}`;

  try {
    const cached = await redis.get(cacheKey);
    if (cached) return NextResponse.json(JSON.parse(cached));
  } catch { /* redis unavailable, fall through */ }

  const notifications = await prisma.formNotification.findMany({
    where: { userId: session.user.id, read: false },
    orderBy: { createdAt: "desc" },
    take: 20,
    include: { tracking: { select: { id: true } } },
  });

  try { await redis.setex(cacheKey, TTL, JSON.stringify(notifications)); } catch { /* ignore */ }

  return NextResponse.json(notifications);
}
