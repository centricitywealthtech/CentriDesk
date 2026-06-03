import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session-user";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const notifs = await prisma.iTRequestNotification.findMany({
    where: { userId: user.id, read: false },
    orderBy: { createdAt: "desc" },
    include: { softwareRequest: { select: { softwareName: true, requestedBy: true } } },
  });

  return NextResponse.json(notifs);
}
