import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { VendorSubscription } from "@/lib/models/VendorSubscription";
import * as XLSX from "xlsx";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectDB();
  const records = await VendorSubscription.find()
    .populate("createdById", "name")
    .sort({ createdAt: -1 })
    .lean();

  const rows = records.map((r) => ({
    Vendor: r.vendor,
    Department: r.department,
    "Use For": r.useFor,
    "Services Providing": r.servicesProviding,
    Nature: r.nature,
    "Subscription Amount (₹)": r.subscriptionAmount,
    "Subscription Type":
      r.subscriptionType === "ONE_TIME" ? "One Time" :
      r.subscriptionType === "MONTHLY" ? "Monthly" : "Annual",
    "Paid One Time": r.paidOneTime ? "Yes" : "No",
    Date: r.date ? new Date(r.date).toLocaleDateString("en-IN") : "",
    "Renewal Date": r.renewalDate ? new Date(r.renewalDate).toLocaleDateString("en-IN") : "",
    "Requested By": r.requestedBy,
    "Approved By": r.approvedBy,
    Relation: r.relation,
    "Created By": (r.createdById as { name?: string })?.name ?? "",
    "Last Updated By": r.updatedByName,
    "Created At": new Date(r.createdAt).toLocaleDateString("en-IN"),
  }));

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows);
  ws["!cols"] = [
    { wch: 25 }, { wch: 15 }, { wch: 20 }, { wch: 30 },
    { wch: 15 }, { wch: 22 }, { wch: 18 }, { wch: 14 },
    { wch: 14 }, { wch: 18 }, { wch: 18 }, { wch: 14 },
  ];
  XLSX.utils.book_append_sheet(wb, ws, "Subscriptions");
  const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="subscriptions-${new Date().toISOString().split("T")[0]}.xlsx"`,
    },
  });
}
