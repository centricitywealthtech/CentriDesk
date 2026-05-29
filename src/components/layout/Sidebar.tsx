"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { LayoutDashboard, FileText, Users, ClipboardList, ListChecks } from "lucide-react";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";

  const navItems = [
    ...(isAdmin ? [{ href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" }] : []),
    { href: "/subscriptions", icon: FileText, label: "Expenses" },
    { href: "/system-request", icon: ClipboardList, label: "Forms Library" },
    { href: "/tracking", icon: ListChecks, label: "Form Tracking" },
    ...(isAdmin ? [{ href: "/admin/users", icon: Users, label: "Users" }] : []),
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-14 bg-[#1C1C1E] flex flex-col items-center py-3 z-50">
      {/* Logo mark */}
      <div className="w-9 h-9 rounded-lg bg-[#E8952A] flex items-center justify-center mb-6 flex-shrink-0">
        <span className="text-white font-bold text-sm">VS</span>
      </div>

      {/* Nav */}
      <nav className="flex flex-col items-center gap-1 flex-1 w-full px-1.5">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active =
            href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              title={label}
              className={cn(
                "w-full flex items-center justify-center h-10 rounded-lg transition-colors",
                active
                  ? "bg-[#E8952A] text-white"
                  : "text-gray-400 hover:bg-[#2A2A2E] hover:text-white"
              )}
            >
              <Icon size={18} />
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
