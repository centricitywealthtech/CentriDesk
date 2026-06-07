import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { FormLibrary } from "@/lib/models/FormLibrary";
import { FormField } from "@/lib/models/FormField";

export async function GET(_req: NextRequest, { params }: { params: { token: string } }) {
  await connectDB();
  const form = await FormLibrary.findOne({ shareToken: params.token })
    .populate("uploadedById", "name")
    .lean();

  if (!form) return NextResponse.json({ error: "Link not found or expired." }, { status: 404 });

  const fields = await FormField.find({ formId: form._id }).sort({ order: 1 }).lean();

  return NextResponse.json({
    name: form.name,
    category: form.category,
    originalFileName: form.originalFileName,
    uploadedBy: { name: (form.uploadedById as { name?: string })?.name ?? "" },
    formFields: fields.map((f) => ({
      id: (f._id as { toString(): string }).toString(),
      label: f.label, fieldType: f.fieldType, options: f.options, required: f.required,
    })),
  });
}
