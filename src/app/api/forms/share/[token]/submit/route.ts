import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { FormLibrary } from "@/lib/models/FormLibrary";
import { FormTracking } from "@/lib/models/FormTracking";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";

const ALLOWED_EXT = [".pdf", ".docx", ".doc"];

export async function POST(req: NextRequest, { params }: { params: { token: string } }) {
  await connectDB();
  const form = await FormLibrary.findOne({ shareToken: params.token }).select("_id uploadedById").lean();
  if (!form) return NextResponse.json({ error: "Link not found or expired." }, { status: 404 });

  let formData: FormData;
  try { formData = await req.formData(); }
  catch { return NextResponse.json({ error: "Failed to parse submission." }, { status: 400 }); }

  const requesteeName = formData.get("requesteeName") as string;
  const requesteeEmail = formData.get("requesteeEmail") as string;
  const requesteeDept = (formData.get("requesteeDept") as string) ?? "";
  const fieldValuesJson = (formData.get("fieldValues") as string) ?? "";
  const file = formData.get("file") as File | null;

  if (!requesteeName || !requesteeEmail) {
    return NextResponse.json({ error: "Name and email are required." }, { status: 400 });
  }

  let submittedFilePath = "";
  let submittedFileName = "";

  if (file && file.size > 0) {
    const ext = "." + (file.name.split(".").pop()?.toLowerCase() ?? "");
    if (!ALLOWED_EXT.includes(ext)) {
      return NextResponse.json({ error: "Only .pdf or .docx files accepted." }, { status: 400 });
    }
    const filename = `${randomUUID()}${ext}`;
    const uploadDir = join(process.cwd(), "uploads", "submissions");
    await mkdir(uploadDir, { recursive: true });
    await writeFile(join(uploadDir, filename), Buffer.from(await file.arrayBuffer()));
    submittedFilePath = `uploads/submissions/${filename}`;
    submittedFileName = file.name;
  }

  await FormTracking.create({
    formId: form._id,
    sharedById: form.uploadedById,
    requesteeName, requesteeEmail, requesteeDept,
    state: "Submitted",
    shareToken: randomUUID(),
    submissionData: fieldValuesJson,
    submittedFilePath,
    submittedFileName,
  });

  return NextResponse.json({ success: true }, { status: 201 });
}
