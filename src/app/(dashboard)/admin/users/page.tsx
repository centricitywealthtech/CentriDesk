import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { UserManagement } from "@/components/admin/UserManagement";

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") redirect("/dashboard");

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          Create and manage user accounts
        </p>
      </div>
      <UserManagement />
    </div>
  );
}
