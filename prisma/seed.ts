import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const MONGODB_URI = process.env.DATABASE_URL ?? "mongodb://localhost:27017/centridesk";

async function main() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB");

  const UserSchema = new mongoose.Schema({ name: String, email: { type: String, unique: true }, password: String, role: String, isActive: { type: Boolean, default: true } }, { timestamps: true });
  const User = mongoose.models.User || mongoose.model("User", UserSchema);

  const SubSchema = new mongoose.Schema({
    vendor: String, department: String, useFor: String, servicesProviding: String, nature: String,
    subscriptionAmount: Number, subscriptionType: String, date: Date, renewalDate: Date,
    paidOneTime: Boolean, createdById: mongoose.Schema.Types.ObjectId,
    updatedByName: String, requestedBy: String, approvedBy: String, relation: String,
  }, { timestamps: true });
  const VendorSubscription = mongoose.models.VendorSubscription || mongoose.model("VendorSubscription", SubSchema);

  const adminPassword = await bcrypt.hash("admin@123", 12);
  const userPassword = await bcrypt.hash("user@123", 12);

  let admin = await User.findOne({ email: "admin@company.com" });
  if (!admin) {
    admin = await User.create({ name: "Admin User", email: "admin@company.com", password: adminPassword, role: "ADMIN" });
  }

  let user = await User.findOne({ email: "user@company.com" });
  if (!user) {
    user = await User.create({ name: "John Doe", email: "user@company.com", password: userPassword, role: "USER" });
  }

  const existing = await VendorSubscription.countDocuments();
  if (existing === 0) {
    await VendorSubscription.insertMany([
      { vendor: "Futurris Digital Pvt Ltd", department: "Technology", useFor: "Design Vendor", servicesProviding: "UX design for Platform", nature: "Platform design services", subscriptionAmount: 100000, subscriptionType: "ANNUAL", paidOneTime: false, date: new Date("2027-05-27"), renewalDate: new Date("2028-05-27"), createdById: admin._id, updatedByName: admin.name },
      { vendor: "NSE Indices Limited", department: "Technology", useFor: "Tech Platform", servicesProviding: "Market Data for platform", nature: "Data subscription of NSE equity", subscriptionAmount: 25000, subscriptionType: "MONTHLY", paidOneTime: false, date: new Date("2027-06-15"), renewalDate: new Date("2028-06-15"), createdById: admin._id, updatedByName: admin.name },
      { vendor: "AWS India", department: "Technology", useFor: "Cloud Infrastructure", servicesProviding: "Cloud hosting and compute", nature: "Cloud services", subscriptionAmount: 50000, subscriptionType: "MONTHLY", paidOneTime: false, date: new Date("2027-01-01"), renewalDate: new Date("2027-12-31"), createdById: user._id, updatedByName: user.name },
      { vendor: "Adobe Systems", department: "Design", useFor: "Design Tools", servicesProviding: "Creative Cloud licenses", nature: "Design software", subscriptionAmount: 75000, subscriptionType: "ANNUAL", paidOneTime: false, date: new Date("2027-04-01"), renewalDate: new Date("2028-04-01"), createdById: user._id, updatedByName: user.name },
      { vendor: "Zoom Video Communications", department: "HR", useFor: "Video Conferencing", servicesProviding: "Team video calls", nature: "Communication tool", subscriptionAmount: 15000, subscriptionType: "ANNUAL", paidOneTime: false, date: new Date("2027-03-01"), renewalDate: new Date("2028-03-01"), createdById: admin._id, updatedByName: admin.name },
    ]);
  }

  console.log("✅ Seed complete!");
  console.log("  Admin: admin@company.com / admin@123");
  console.log("  User:  user@company.com  / user@123");
  await mongoose.disconnect();
}

main().catch(console.error);
