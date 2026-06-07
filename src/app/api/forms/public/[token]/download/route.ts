import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { FormTracking } from "@/lib/models/FormTracking";
import { FormLibrary } from "@/lib/models/FormLibrary";
import { readFile } from "fs/promises";
import { join } from "path";

export async function GET(_req: NextRequest, { params }: { params: { token: string } }) {
  await connectDB();
  const tracking = await FormTracking.findOne({ shareToken: params.token }).lean();
  if (!tracking) return new NextResponse("Link not found or expired.", { status: 404 });

  const form = await FormLibrary.findById(tracking.formId).lean();
  if (!form) return new NextResponse("Form not found.", { status: 404 });

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
    return new NextResponse("File not found on server.", { status: 404 });
  }
}
