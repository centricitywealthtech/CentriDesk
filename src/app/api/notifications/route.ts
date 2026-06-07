import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";

const TTL = 120; // 2 minutes

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json([], { status: 401 });

  const isAdmin = session.user.role === "ADMIN";
  const cacheKey = `renewals:${isAdmin ? "admin" : session.user.id}`;

  try {
    const cached = await redis.get(cacheKey);
    if (cached) return NextResponse.json(JSON.parse(cached));
  } catch { /* redis unavailable, fall through */ }

  const now = new Date();
  const in14Days = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

  const where: Record<string, unknown> = {
    renewalDate: { gte: now, lte: in14Days },
  };
  if (!isAdmin) where.createdById = session.user.id;

  const records = await prisma.vendorSubscription.findMany({
    where,
    select: { id: true, vendor: true, renewalDate: true, subscriptionType: true, department: true },
    orderBy: { renewalDate: "asc" },
  });

  try { await redis.setex(cacheKey, TTL, JSON.stringify(records)); } catch { /* ignore */ }

  return NextResponse.json(records);
}
