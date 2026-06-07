import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { User } from "@/lib/models/User";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, email, password } = body;

  if (!name || !email || !password) {
    return NextResponse.json({ error: "All fields are required." }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
  }

  await connectDB();
  const existing = await User.findOne({ email }).lean();
  if (existing) {
    return NextResponse.json({ error: "An account with this email already exists." }, { status: 400 });
  }

  const hashed = await bcrypt.hash(password, 12);
  await User.create({ name, email, password: hashed, role: "USER" });
  return NextResponse.json({ success: true }, { status: 201 });
}
