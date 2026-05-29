import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <Sidebar />
      <Topbar />
      <main className="ml-14 pt-12 min-h-screen">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
