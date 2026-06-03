"use client";

import { useSession } from "next-auth/react";
import { SoftwareRequestAdmin } from "@/components/it-request/SoftwareRequestAdmin";
import SoftwareRequestForm from "@/app/forms/it-request/page";

export default function ITRequestPage() {
  const { data: session, status } = useSession();

  if (status === "loading") return null;

  if (session?.user?.role === "ADMIN") {
    return (
      <div className="space-y-1">
        <SoftwareRequestAdmin />
      </div>
    );
  }

  return <SoftwareRequestForm embedded />;
}
