import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") ?? "";
  const type = searchParams.get("type") ?? "";

  const isAdmin = session.user.role === "ADMIN";
  const where: Record<string, unknown> = {};

  // Non-admins only see their own records
  if (!isAdmin) where.createdById = session.user.id;

  if (search) {
    where.OR = [
      { vendor: { contains: search } },
      { department: { contains: search } },
      { nature: { contains: search } },
    ];
  }
  if (type) where.subscriptionType = type;

  const records = await prisma.vendorSubscription.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { createdBy: { select: { id: true, name: true } } },
  });

  return NextResponse.json(records);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  const record = await prisma.vendorSubscription.create({
    data: {
      vendor: body.vendor,
      department: body.department,
      useFor: body.useFor,
      servicesProviding: body.servicesProviding,
      nature: body.nature,
      subscriptionAmount: parseFloat(body.subscriptionAmount),
      subscriptionType: body.subscriptionType,
      date: new Date(body.date),
      renewalDate: body.renewalDate ? new Date(body.renewalDate) : null,
      paidOneTime: body.subscriptionType === "ONE_TIME",
      createdById: session.user.id,
      updatedByName: session.user.name ?? "",
      requestedBy: body.requestedBy ?? "",
      approvedBy: body.approvedBy ?? "",
      relation: body.approvedBy ? (body.relation ?? "") : "",
    },
  });

  return NextResponse.json(record, { status: 201 });
}
