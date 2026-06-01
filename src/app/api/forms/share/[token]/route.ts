import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: { token: string } }
) {
  const form = await prisma.formLibrary.findUnique({
    where: { shareToken: params.token },
    select: {
      name: true,
      category: true,
      originalFileName: true,
      uploadedBy: { select: { name: true } },
      formFields: {
        orderBy: { order: "asc" },
        select: { id: true, label: true, fieldType: true, options: true, required: true },
      },
    },
  });
  if (!form) return NextResponse.json({ error: "Link not found or expired." }, { status: 404 });
  return NextResponse.json(form);
}
