import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session-user";
import { connectDB } from "@/lib/db";
import { FormTracking } from "@/lib/models/FormTracking";
import { randomUUID } from "crypto";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toJSON(r: any) {
  return { ...r, id: r._id?.toString() };
}

export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const state = searchParams.get("state") ?? "";

  const query: Record<string, unknown> = {};
  if (state) query.state = state;

  await connectDB();
  const rows = await FormTracking.find(query)
    .populate("formId", "name")
    .populate("sharedById", "name")
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json(rows.map(toJSON));
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { formId, requesteeName, requesteeEmail, requesteeDept } = body;

  if (!formId || !requesteeName || !requesteeEmail) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  await connectDB();
  const row = await FormTracking.create({
    formId,
    sharedById: user.id,
    requesteeName,
    requesteeEmail,
    requesteeDept: requesteeDept ?? "",
    state: "Shared",
    shareToken: randomUUID(),
  });

  const populated = await FormTracking.findById(row._id)
    .populate("formId", "name")
    .populate("sharedById", "name")
    .lean();

  return NextResponse.json(toJSON(populated), { status: 201 });
}
