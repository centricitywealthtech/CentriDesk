import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { VendorSubscription } from "@/lib/models/VendorSubscription";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toJSON(r: any) {
  return { ...r, id: r._id?.toString() };
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const record = await VendorSubscription.findById(params.id).populate("createdById", "name").lean();
  if (!record) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(toJSON(record));
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const record = await VendorSubscription.findById(params.id).lean();
  if (!record) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isAdmin = session.user.role === "ADMIN";
  if (!isAdmin && record.createdById.toString() !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const updated = await VendorSubscription.findByIdAndUpdate(
    params.id,
    {
      vendor: body.vendor, department: body.department, useFor: body.useFor,
      servicesProviding: body.servicesProviding, nature: body.nature,
      subscriptionAmount: parseFloat(body.subscriptionAmount),
      subscriptionType: body.subscriptionType,
      date: new Date(body.date),
      renewalDate: body.renewalDate ? new Date(body.renewalDate) : undefined,
      paidOneTime: body.subscriptionType === "ONE_TIME",
      updatedByName: session.user.name ?? "",
      requestedBy: body.requestedBy ?? "",
      approvedBy: body.approvedBy ?? "",
      relation: body.approvedBy ? (body.relation ?? "") : "",
    },
    { new: true }
  ).lean();

  return NextResponse.json(toJSON(updated));
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const record = await VendorSubscription.findById(params.id).lean();
  if (!record) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isAdmin = session.user.role === "ADMIN";
  if (!isAdmin && record.createdById.toString() !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await VendorSubscription.findByIdAndDelete(params.id);
  return NextResponse.json({ success: true });
}
