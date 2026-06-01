import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session-user";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const state = searchParams.get("state") ?? "";

  const where: Record<string, unknown> = {};
  if (state) where.state = state;

  const rows = await prisma.formTracking.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      form: { select: { id: true, name: true } },
      sharedBy: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { formId, requesteeName, requesteeEmail, requesteeDept } = body;

  if (!formId || !requesteeName || !requesteeEmail) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const row = await prisma.formTracking.create({
    data: {
      formId,
      sharedById: user.id,
      requesteeName,
      requesteeEmail,
      requesteeDept: requesteeDept ?? "",
      state: "Shared",
    },
    include: {
      form: { select: { id: true, name: true } },
      sharedBy: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json(row, { status: 201 });
}
