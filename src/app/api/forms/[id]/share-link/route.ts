import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getSessionUser } from "@/lib/session-user";
import { connectDB } from "@/lib/db";
import { FormLibrary } from "@/lib/models/FormLibrary";

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  let form = await FormLibrary.findById(params.id).lean();
  if (!form) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let { shareToken } = form;
  if (!shareToken) {
    shareToken = randomUUID();
    await FormLibrary.findByIdAndUpdate(params.id, { shareToken });
  }

  return NextResponse.json({ shareToken });
}
