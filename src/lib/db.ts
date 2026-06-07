import mongoose from "mongoose";

const MONGODB_URI = process.env.DATABASE_URL ?? "mongodb://localhost:27017/centridesk";

const globalForMongoose = globalThis as unknown as { mongoose: typeof mongoose | undefined };

export async function connectDB() {
  if (globalForMongoose.mongoose?.connection.readyState === 1) return;
  await mongoose.connect(MONGODB_URI);
  if (process.env.NODE_ENV !== "production") globalForMongoose.mongoose = mongoose;
}
