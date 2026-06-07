import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { FormLibrary } from "@/lib/models/FormLibrary";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const forms = await FormLibrary.find()
    .populate("uploadedById", "name")
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json(
    forms.map((f) => ({ ...f, id: (f._id as { toString(): string }).toString() }))
  );
}
