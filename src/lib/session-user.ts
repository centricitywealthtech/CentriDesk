import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { User } from "@/lib/models/User";

export async function getSessionUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;
  await connectDB();
  const user = await User.findOne({ email: session.user.email })
    .select("name email role")
    .lean();
  if (!user) return null;
  return {
    id: (user._id as { toString(): string }).toString(),
    name: user.name,
    email: user.email,
    role: user.role,
  };
}
