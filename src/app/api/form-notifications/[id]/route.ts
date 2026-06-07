import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";

export async function PATCH(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const notif = await prisma.formNotification.findUnique({ where: { id: params.id } });
  if (!notif || notif.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.formNotification.update({ where: { id: params.id }, data: { read: true } });

  try { await redis.del(`form-notifs:${session.user.id}`); } catch { /* ignore */ }

  return NextResponse.json({ success: true });
}
