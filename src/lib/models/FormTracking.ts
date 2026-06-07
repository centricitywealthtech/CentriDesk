import mongoose, { Schema, Document, Types } from "mongoose";

export interface IFormTracking extends Document {
  id: string;
  formId: Types.ObjectId;
  sharedById: Types.ObjectId;
  requesteeName: string;
  requesteeEmail: string;
  requesteeDept: string;
  state: string;
  shareToken: string;
  submissionData: string;
  submittedFilePath: string;
  submittedFileName: string;
  createdAt: Date;
  updatedAt: Date;
}

const FormTrackingSchema = new Schema<IFormTracking>(
  {
    formId: { type: Schema.Types.ObjectId, ref: "FormLibrary", required: true },
    sharedById: { type: Schema.Types.ObjectId, ref: "User", required: true },
    requesteeName: { type: String, required: true },
    requesteeEmail: { type: String, required: true },
    requesteeDept: { type: String, default: "" },
    state: { type: String, default: "Shared" },
    shareToken: { type: String, required: true, unique: true },
    submissionData: { type: String, default: "" },
    submittedFilePath: { type: String, default: "" },
    submittedFileName: { type: String, default: "" },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

export const FormTracking =
  (mongoose.models.FormTracking as mongoose.Model<IFormTracking>) ||
  mongoose.model<IFormTracking>("FormTracking", FormTrackingSchema);
