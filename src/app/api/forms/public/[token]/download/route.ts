import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readFile } from "fs/promises";
import { join } from "path";

// Public route — no auth required. Anyone with the token can download.
export async function GET(
  _req: NextRequest,
  { params }: { params: { token: string } }
) {
  const tracking = await prisma.formTracking.findUnique({
    where: { shareToken: params.token },
    include: { form: true },
  });

  if (!tracking) {
    return new NextResponse("Link not found or expired.", { status: 404 });
  }

  try {
    const filePath = join(process.cwd(), tracking.form.filePath);
    const buffer = await readFile(filePath);
    const contentType = tracking.form.originalFileName.toLowerCase().endsWith(".pdf")
      ? "application/pdf"
      : "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${tracking.form.originalFileName}"`,
      },
    });
  } catch {
    return new NextResponse("File not found on server.", { status: 404 });
  }
}
