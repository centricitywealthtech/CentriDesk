import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { FormLibrary } from "@/lib/models/FormLibrary";
import { readFile } from "fs/promises";
import { join } from "path";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const form = await FormLibrary.findById(params.id).lean();
  if (!form) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    const buffer = await readFile(join(process.cwd(), form.filePath));
    const contentType = form.originalFileName.toLowerCase().endsWith(".pdf")
      ? "application/pdf"
      : "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${form.originalFileName}"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "File not found on disk" }, { status: 404 });
  }
}
