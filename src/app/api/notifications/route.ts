import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { VendorSubscription } from "@/lib/models/VendorSubscription";
import { redis } from "@/lib/redis";

const TTL = 120;

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json([], { status: 401 });

  const isAdmin = session.user.role === "ADMIN";
  const cacheKey = `renewals:${isAdmin ? "admin" : session.user.id}`;

  try {
    const cached = await redis.get(cacheKey);
    if (cached) return NextResponse.json(JSON.parse(cached));
  } catch { /* redis unavailable */ }

  await connectDB();
  const now = new Date();
  const in14Days = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

  const query: Record<string, unknown> = { renewalDate: { $gte: now, $lte: in14Days } };
  if (!isAdmin) query.createdById = session.user.id;

  const records = await VendorSubscription.find(query)
    .select("vendor renewalDate subscriptionType department")
    .sort({ renewalDate: 1 })
    .lean();

  const result = records.map((r) => ({ ...r, id: (r._id as { toString(): string }).toString() }));

  try { await redis.setex(cacheKey, TTL, JSON.stringify(result)); } catch { /* ignore */ }
  return NextResponse.json(result);
}
