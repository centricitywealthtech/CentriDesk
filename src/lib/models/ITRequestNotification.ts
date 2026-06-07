import mongoose, { Schema, Document, Types } from "mongoose";

export interface IITRequestNotification extends Document {
  id: string;
  userId: Types.ObjectId;
  message: string;
  softwareRequestId: Types.ObjectId;
  read: boolean;
  createdAt: Date;
}

const ITRequestNotificationSchema = new Schema<IITRequestNotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true },
    softwareRequestId: { type: Schema.Types.ObjectId, ref: "SoftwareRequest", required: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

export const ITRequestNotification =
  (mongoose.models.ITRequestNotification as mongoose.Model<IITRequestNotification>) ||
  mongoose.model<IITRequestNotification>("ITRequestNotification", ITRequestNotificationSchema);
