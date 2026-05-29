import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import { join, extname } from "path";
import { randomUUID } from "crypto";

const ALLOWED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
];

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const formData = await req.formData();
  const name = formData.get("name") as string;
  const category = formData.get("category") as string;
  const file = formData.get("file") as File | null;

  if (!name || !category || !file) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Only .docx and .pdf files are allowed" }, { status: 400 });
  }

  const ext = extname(file.name) || ".docx";
  const filename = `${randomUUID()}${ext}`;
  const uploadDir = join(process.cwd(), "uploads", "forms");

  await mkdir(uploadDir, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(join(uploadDir, filename), buffer);

  const record = await prisma.formLibrary.create({
    data: {
      name,
      category,
      filePath: `uploads/forms/${filename}`,
      originalFileName: file.name,
      uploadedById: session.user.id,
    },
    include: { uploadedBy: { select: { name: true } } },
  });

  return NextResponse.json(record, { status: 201 });
}
