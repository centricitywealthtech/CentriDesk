import mongoose, { Schema, Document, Types } from "mongoose";

export interface IVendorSubscription extends Document {
  id: string;
  vendor: string;
  department: string;
  useFor: string;
  servicesProviding: string;
  nature: string;
  subscriptionAmount: number;
  subscriptionType: string;
  date: Date;
  renewalDate?: Date;
  paidOneTime: boolean;
  createdById: Types.ObjectId;
  updatedByName: string;
  requestedBy: string;
  approvedBy: string;
  relation: string;
  createdAt: Date;
  updatedAt: Date;
}

const VendorSubscriptionSchema = new Schema<IVendorSubscription>(
  {
    vendor: { type: String, required: true },
    department: { type: String, required: true },
    useFor: { type: String, required: true },
    servicesProviding: { type: String, required: true },
    nature: { type: String, required: true },
    subscriptionAmount: { type: Number, required: true },
    subscriptionType: { type: String, required: true },
    date: { type: Date, required: true },
    renewalDate: { type: Date },
    paidOneTime: { type: Boolean, default: false },
    createdById: { type: Schema.Types.ObjectId, ref: "User", required: true },
    updatedByName: { type: String, default: "" },
    requestedBy: { type: String, default: "" },
    approvedBy: { type: String, default: "" },
    relation: { type: String, default: "" },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

export const VendorSubscription =
  (mongoose.models.VendorSubscription as mongoose.Model<IVendorSubscription>) ||
  mongoose.model<IVendorSubscription>("VendorSubscription", VendorSubscriptionSchema);
