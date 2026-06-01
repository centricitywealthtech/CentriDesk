import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session-user";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";

const ALLOWED_EXT = [".pdf", ".docx", ".doc"];

type FieldInput = {
  label: string;
  fieldType: string;
  options: string;
  required: boolean;
};

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Failed to parse form data" }, { status: 400 });
  }

  const name = formData.get("name") as string;
  const category = formData.get("category") as string;
  const file = formData.get("file") as File | null;
  const fieldsJson = formData.get("fields") as string | null;

  if (!name || !category || !file) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const ext = "." + (file.name.split(".").pop()?.toLowerCase() ?? "");
  if (!ALLOWED_EXT.includes(ext)) {
    return NextResponse.json({ error: "Only .docx and .pdf files are allowed" }, { status: 400 });
  }

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
      uploadedById: user.id,
      shareToken: randomUUID(),
    },
    include: { uploadedBy: { select: { name: true } } },
  });

  // Create form fields
  const fields: FieldInput[] = fieldsJson ? JSON.parse(fieldsJson) : [];
  for (let i = 0; i < fields.length; i++) {
    const f = fields[i];
    if (f.label?.trim()) {
      await prisma.formField.create({
        data: {
          formId: record.id,
          label: f.label.trim(),
          fieldType: f.fieldType || "text",
          options: f.options || "",
          required: f.required ?? false,
          order: i,
        },
      });
    }
  }

  return NextResponse.json(record, { status: 201 });
}
