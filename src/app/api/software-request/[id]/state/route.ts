import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session-user";
import { prisma } from "@/lib/prisma";

const TERMINAL = ["Approved", "Rejected"];

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { state } = await req.json();

  const row = await prisma.softwareRequest.findUnique({ where: { id: params.id } });
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (TERMINAL.includes(row.state)) {
    return NextResponse.json({ error: "Cannot change a terminal state" }, { status: 400 });
  }

  const updated = await prisma.softwareRequest.update({
    where: { id: params.id },
    data: { state },
  });

  return NextResponse.json(updated);
}
