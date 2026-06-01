import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getSessionUser } from "@/lib/session-user";
import { prisma } from "@/lib/prisma";

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await prisma.formLibrary.findUnique({ where: { id: params.id } });
  if (!form) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let { shareToken } = form;
  if (!shareToken) {
    shareToken = randomUUID();
    await prisma.formLibrary.update({ where: { id: params.id }, data: { shareToken } });
  }

  return NextResponse.json({ shareToken });
}
