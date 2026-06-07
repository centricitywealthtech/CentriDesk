import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { User } from "@/lib/models/User";
import { VendorSubscription } from "@/lib/models/VendorSubscription";
import bcrypt from "bcryptjs";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectDB();
  const users = await User.find().select("name email role isActive createdAt").sort({ createdAt: -1 }).lean();

  const withCounts = await Promise.all(
    users.map(async (u) => {
      const count = await VendorSubscription.countDocuments({ createdById: u._id });
      return {
        id: (u._id as { toString(): string }).toString(),
        name: u.name, email: u.email, role: u.role,
        isActive: u.isActive, createdAt: u.createdAt,
        _count: { subscriptions: count },
      };
    })
  );

  return NextResponse.json(withCounts);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  await connectDB();

  const exists = await User.findOne({ email: body.email }).lean();
  if (exists) return NextResponse.json({ error: "Email already in use" }, { status: 400 });

  const hashed = await bcrypt.hash(body.password, 12);
  const user = await User.create({ name: body.name, email: body.email, password: hashed, role: body.role ?? "USER" });

  return NextResponse.json(
    { id: user._id.toString(), name: user.name, email: user.email, role: user.role },
    { status: 201 }
  );
}
