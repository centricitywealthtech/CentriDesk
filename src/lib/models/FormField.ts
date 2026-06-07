import mongoose, { Schema, Document, Types } from "mongoose";

export interface IFormField extends Document {
  id: string;
  formId: Types.ObjectId;
  label: string;
  fieldType: string;
  options: string;
  required: boolean;
  order: number;
}

const FormFieldSchema = new Schema<IFormField>(
  {
    formId: { type: Schema.Types.ObjectId, ref: "FormLibrary", required: true },
    label: { type: String, required: true },
    fieldType: { type: String, required: true },
    options: { type: String, default: "" },
    required: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

export const FormField =
  (mongoose.models.FormField as mongoose.Model<IFormField>) ||
  mongoose.model<IFormField>("FormField", FormFieldSchema);
