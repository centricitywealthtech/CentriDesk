"use client";

import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { ChevronRight, Home, LogOut, User } from "lucide-react";
import { NotificationBell } from "./NotificationBell";

const PAGE_LABELS: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/subscriptions": "Subscriptions",
  "/subscriptions/new": "Add Subscription",
  "/admin/users": "User Management",
  "/admin/users/new": "Add User",
  "/system-request": "Forms Library",
  "/tracking": "Form Tracking",
  "/it-request": "IT Request Form",
};

export function Topbar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  const pageLabel =
    Object.entries(PAGE_LABELS)
      .reverse()
      .find(([key]) => pathname.startsWith(key))?.[1] ?? "Page";

  return (
    <header className="fixed top-0 left-14 right-0 h-12 bg-[#1C1C1E] flex items-center justify-between px-5 z-40">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm">
        <Home size={13} className="text-gray-400" />
        <ChevronRight size={12} className="text-gray-600" />
        <span className="bg-[#E8952A] text-white text-xs font-medium px-3 py-0.5 rounded-sm">
          {pageLabel}
        </span>
      </nav>

      {/* Right side */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#E8952A] flex items-center justify-center">
            <User size={14} className="text-white" />
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-white text-xs font-medium leading-tight">
              {session?.user?.name}
            </p>
            <p className="text-gray-400 text-[10px] leading-tight capitalize">
              {session?.user?.role?.toLowerCase()}
            </p>
          </div>
        </div>

        <NotificationBell />

        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          title="Sign out"
          className="text-gray-400 hover:text-white transition-colors p-1"
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
}
