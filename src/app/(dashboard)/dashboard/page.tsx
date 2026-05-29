import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { FileText, TrendingUp, RefreshCw, DollarSign } from "lucide-react";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") redirect("/subscriptions/new");

  const [total, monthly, annual, oneTime] = await Promise.all([
    prisma.vendorSubscription.count(),
    prisma.vendorSubscription.count({ where: { subscriptionType: "MONTHLY" } }),
    prisma.vendorSubscription.count({ where: { subscriptionType: "ANNUAL" } }),
    prisma.vendorSubscription.count({ where: { subscriptionType: "ONE_TIME" } }),
  ]);

  const [totalSpend, monthlySpend, annualSpend, oneTimeSpend] = await Promise.all([
    prisma.vendorSubscription.aggregate({ _sum: { subscriptionAmount: true } }),
    prisma.vendorSubscription.aggregate({ _sum: { subscriptionAmount: true }, where: { subscriptionType: "MONTHLY" } }),
    prisma.vendorSubscription.aggregate({ _sum: { subscriptionAmount: true }, where: { subscriptionType: "ANNUAL" } }),
    prisma.vendorSubscription.aggregate({ _sum: { subscriptionAmount: true }, where: { subscriptionType: "ONE_TIME" } }),
  ]);

  const recentRecords = await prisma.vendorSubscription.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { createdBy: { select: { name: true } } },
  });

  const stats = [
    {
      label: "Total Subscriptions",
      value: total,
      icon: FileText,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Total Spend (₹)",
      value: formatCurrency(totalSpend._sum.subscriptionAmount ?? 0),
      icon: DollarSign,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Monthly Expense",
      value: formatCurrency(monthlySpend._sum.subscriptionAmount ?? 0),
      icon: RefreshCw,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      label: "Annual Expense",
      value: formatCurrency(annualSpend._sum.subscriptionAmount ?? 0),
      icon: TrendingUp,
      color: "text-[#E8952A]",
      bg: "bg-orange-50",
    },
  ];

  const breakdown = [
    {
      label: "One-Time Subscription",
      count: oneTime,
      amount: formatCurrency(oneTimeSpend._sum.subscriptionAmount ?? 0),
      countColor: "text-blue-600",
    },
    {
      label: "Monthly Subscription",
      count: monthly,
      amount: formatCurrency(monthlySpend._sum.subscriptionAmount ?? 0),
      countColor: "text-purple-600",
    },
    {
      label: "Annual Subscription",
      count: annual,
      amount: formatCurrency(annualSpend._sum.subscriptionAmount ?? 0),
      countColor: "text-[#E8952A]",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">
          Good day, {session?.user?.name?.split(" ")[0]} 👋
        </h1>
        <p className="text-gray-500 text-sm mt-0.5">
          Here&apos;s an overview of your vendor subscriptions
        </p>
      </div>

      {/* Row 1 — stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                {stat.label}
              </p>
              <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center`}>
                <stat.icon size={15} className={stat.color} />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Row 2 — breakdown by type */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {breakdown.map((b) => (
          <div key={b.label} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              {b.label}
            </p>
            <p className={`text-2xl font-bold ${b.countColor}`}>{b.count}</p>
            <p className="text-sm text-gray-500 mt-1">{b.amount}</p>
          </div>
        ))}
      </div>

      {/* Recent records */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">Recent Entries</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {recentRecords.length === 0 && (
            <p className="text-center text-gray-400 text-sm py-10">No records yet.</p>
          )}
          {recentRecords.map((rec) => (
            <div key={rec.id} className="px-5 py-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">{rec.vendor}</p>
                <p className="text-xs text-gray-500">{rec.department} · {rec.createdBy.name}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">
                  {formatCurrency(rec.subscriptionAmount)}
                </p>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  rec.subscriptionType === "MONTHLY" ? "bg-purple-100 text-purple-700" :
                  rec.subscriptionType === "ANNUAL" ? "bg-green-100 text-green-700" :
                  "bg-blue-100 text-blue-700"
                }`}>
                  {rec.subscriptionType === "ONE_TIME" ? "One Time" :
                   rec.subscriptionType === "MONTHLY" ? "Monthly" : "Annual"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
