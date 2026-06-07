import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session-user";
import { connectDB } from "@/lib/db";
import { SoftwareRequest } from "@/lib/models/SoftwareRequest";

const TERMINAL = ["Approved", "Rejected"];

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { state } = await req.json();

  await connectDB();
  const row = await SoftwareRequest.findById(params.id).lean();
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (TERMINAL.includes(row.state)) {
    return NextResponse.json({ error: "Cannot change a terminal state" }, { status: 400 });
  }

  const updated = await SoftwareRequest.findByIdAndUpdate(params.id, { state }, { new: true }).lean();
  return NextResponse.json({ ...updated, id: (updated?._id as { toString(): string })?.toString() });
}
