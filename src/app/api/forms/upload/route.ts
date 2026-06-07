import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session-user";
import { connectDB } from "@/lib/db";
import { FormLibrary } from "@/lib/models/FormLibrary";
import { FormField } from "@/lib/models/FormField";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";

const ALLOWED_EXT = [".pdf", ".docx", ".doc"];

type FieldInput = { label: string; fieldType: string; options: string; required: boolean };

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let formData: FormData;
  try { formData = await req.formData(); }
  catch { return NextResponse.json({ error: "Failed to parse form data" }, { status: 400 }); }

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
  await writeFile(join(uploadDir, filename), Buffer.from(await file.arrayBuffer()));

  await connectDB();
  const record = await FormLibrary.create({
    name, category,
    filePath: `uploads/forms/${filename}`,
    originalFileName: file.name,
    uploadedById: user.id,
    shareToken: randomUUID(),
  });

  const fields: FieldInput[] = fieldsJson ? JSON.parse(fieldsJson) : [];
  const validFields = fields.filter((f) => f.label?.trim());
  if (validFields.length > 0) {
    await FormField.insertMany(
      validFields.map((f, i) => ({
        formId: record._id,
        label: f.label.trim(),
        fieldType: f.fieldType || "text",
        options: f.options || "",
        required: f.required ?? false,
        order: i,
      }))
    );
  }

  return NextResponse.json({ ...record.toJSON(), id: record._id.toString() }, { status: 201 });
}
