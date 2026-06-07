import mongoose, { Schema, Document, Types } from "mongoose";

export interface IFormLibrary extends Document {
  id: string;
  name: string;
  category: string;
  filePath: string;
  originalFileName: string;
  uploadedById: Types.ObjectId;
  shareToken?: string;
  createdAt: Date;
}

const FormLibrarySchema = new Schema<IFormLibrary>(
  {
    name: { type: String, required: true },
    category: { type: String, required: true },
    filePath: { type: String, required: true },
    originalFileName: { type: String, required: true },
    uploadedById: { type: Schema.Types.ObjectId, ref: "User", required: true },
    shareToken: { type: String, unique: true, sparse: true },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

export const FormLibrary =
  (mongoose.models.FormLibrary as mongoose.Model<IFormLibrary>) ||
  mongoose.model<IFormLibrary>("FormLibrary", FormLibrarySchema);
