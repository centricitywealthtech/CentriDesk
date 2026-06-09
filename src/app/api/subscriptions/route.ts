import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { VendorSubscription } from "@/lib/models/VendorSubscription";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toJSON(r: any) {
  return { ...r, id: r._id?.toString() };
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") ?? "";
  const type = searchParams.get("type") ?? "";
  const isAdmin = session.user.role === "ADMIN";

  const query: Record<string, unknown> = {};
  if (!isAdmin) query.createdById = session.user.id;
  if (type) query.subscriptionType = type;
  if (search) {
    const re = new RegExp(search, "i");
    query.$or = [
      { vendor: re },
      { department: re },
      { nature: re },
      { useFor: re },
      { servicesProviding: re },
      { subscriptionType: re },
      { requestedBy: re },
      { approvedBy: re },
    ];
  }

  await connectDB();
  const records = await VendorSubscription.find(query)
    .populate("createdById", "name")
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json(records.map(toJSON));
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  await connectDB();

  const record = await VendorSubscription.create({
    vendor: body.vendor,
    department: body.department,
    useFor: body.useFor,
    servicesProviding: body.servicesProviding,
    nature: body.nature,
    subscriptionAmount: parseFloat(body.subscriptionAmount),
    subscriptionType: body.subscriptionType,
    date: new Date(body.date),
    renewalDate: body.renewalDate ? new Date(body.renewalDate) : undefined,
    paidOneTime: body.subscriptionType === "ONE_TIME",
    createdById: session.user.id,
    updatedByName: session.user.name ?? "",
    requestedBy: body.requestedBy ?? "",
    approvedBy: body.approvedBy ?? "",
    relation: body.approvedBy ? (body.relation ?? "") : "",
  });

  return NextResponse.json(toJSON(record.toJSON()), { status: 201 });
}
