import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const record = await prisma.vendorSubscription.findUnique({
    where: { id: params.id },
    include: { createdBy: { select: { id: true, name: true } } },
  });

  if (!record) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(record);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const record = await prisma.vendorSubscription.findUnique({
    where: { id: params.id },
  });
  if (!record) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isAdmin = session.user.role === "ADMIN";
  if (!isAdmin && record.createdById !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const updated = await prisma.vendorSubscription.update({
    where: { id: params.id },
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
      updatedByName: session.user.name ?? "",
      requestedBy: body.requestedBy ?? "",
      approvedBy: body.approvedBy ?? "",
      relation: body.approvedBy ? (body.relation ?? "") : "",
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const record = await prisma.vendorSubscription.findUnique({
    where: { id: params.id },
  });
  if (!record) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isAdmin = session.user.role === "ADMIN";
  if (!isAdmin && record.createdById !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.vendorSubscription.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
