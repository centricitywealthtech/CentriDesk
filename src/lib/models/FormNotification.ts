import mongoose, { Schema, Document, Types } from "mongoose";

export interface IFormNotification extends Document {
  id: string;
  userId: Types.ObjectId;
  message: string;
  trackingId: Types.ObjectId;
  read: boolean;
  createdAt: Date;
}

const FormNotificationSchema = new Schema<IFormNotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true },
    trackingId: { type: Schema.Types.ObjectId, ref: "FormTracking", required: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

export const FormNotification =
  (mongoose.models.FormNotification as mongoose.Model<IFormNotification>) ||
  mongoose.model<IFormNotification>("FormNotification", FormNotificationSchema);
