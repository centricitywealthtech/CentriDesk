import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session-user";
import { connectDB } from "@/lib/db";
import { FormTracking } from "@/lib/models/FormTracking";
import { readFile } from "fs/promises";
import { join } from "path";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const tracking = await FormTracking.findById(params.id).select("submittedFilePath submittedFileName").lean();
  if (!tracking?.submittedFilePath) {
    return new NextResponse("No file submitted.", { status: 404 });
  }

  try {
    const buffer = await readFile(join(process.cwd(), tracking.submittedFilePath));
    const name = tracking.submittedFileName.toLowerCase();
    const contentType = name.endsWith(".pdf")
      ? "application/pdf"
      : "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${tracking.submittedFileName}"`,
      },
    });
  } catch {
    return new NextResponse("File not found on server.", { status: 404 });
  }
}
