import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session-user";
import { prisma } from "@/lib/prisma";

export async function PATCH(_req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.iTRequestNotification.updateMany({
    where: { id: params.id, userId: user.id },
    data: { read: true },
  });

  return NextResponse.json({ ok: true });
}
