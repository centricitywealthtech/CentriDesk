"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  Plus, Search, Download, Pencil, Trash2,
  ChevronUp, ChevronDown, Filter, CheckCircle2, Circle,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";

type SubscriptionRecord = {
  id: string;
  vendor: string;
  department: string;
  useFor: string;
  servicesProviding: string;
  nature: string;
  subscriptionAmount: number;
  subscriptionType: string;
  date: string;
  renewalDate: string | null;
  paidOneTime: boolean;
  createdAt: string;
  updatedAt: string;
  updatedByName: string;
  createdBy: { id: string; name: string };
};

const TYPE_FILTER_OPTIONS = [
  { value: "", label: "All Types" },
  { value: "ONE_TIME", label: "One Time" },
  { value: "MONTHLY", label: "Monthly" },
  { value: "ANNUAL", label: "Annual" },
];

const SORTABLE_COLS = [
  { field: "vendor", label: "Vendor" },
  { field: "department", label: "Department" },
  { field: "nature", label: "Nature" },
  { field: "servicesProviding", label: "Services Providing" },
  { field: "subscriptionAmount", label: "Amount (₹)" },
  { field: "subscriptionType", label: "Type" },
  { field: "paidOneTime", label: "Paid One Time" },
  { field: "date", label: "Date" },
  { field: "renewalDate", label: "Renewal Date" },
  { field: "updatedByName", label: "Updated By" },
] as const;

type SortField = typeof SORTABLE_COLS[number]["field"];

export function SubscriptionTable() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";

  const [records, setRecords] = useState<SubscriptionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [sortField, setSortField] = useState<SortField>("createdAt" as SortField);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (typeFilter) params.set("type", typeFilter);
    const res = await fetch(`/api/subscriptions?${params}`);
    const data = await res.json();
    setRecords(data);
    setLoading(false);
  }, [search, typeFilter]);

  useEffect(() => {
    const t = setTimeout(fetchRecords, 300);
    return () => clearTimeout(t);
  }, [fetchRecords]);

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  }

  const sorted = [...records].sort((a, b) => {
    const av = a[sortField as keyof SubscriptionRecord] ?? "";
    const bv = b[sortField as keyof SubscriptionRecord] ?? "";
    return sortDir === "asc"
      ? String(av).localeCompare(String(bv))
      : String(bv).localeCompare(String(av));
  });

  async function handleDelete(id: string) {
    if (!confirm("Delete this record? This cannot be undone.")) return;
    setDeletingId(id);
    await fetch(`/api/subscriptions/${id}`, { method: "DELETE" });
    setDeletingId(null);
    fetchRecords();
  }

  function SortIcon({ field }: { field: SortField }) {
    if (sortField !== field) return <ChevronUp size={12} className="text-gray-300" />;
    return sortDir === "asc"
      ? <ChevronUp size={12} className="text-[#E8952A]" />
      : <ChevronDown size={12} className="text-[#E8952A]" />;
  }

  function typeBadge(type: string) {
    if (type === "ONE_TIME") return <span className="badge-one-time">One Time</span>;
    if (type === "MONTHLY") return <span className="badge-monthly">Monthly</span>;
    return <span className="badge-annual">Annual</span>;
  }

  const colSpan = SORTABLE_COLS.length + 1;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search vendor, department…"
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E8952A] focus:border-transparent"
            />
          </div>
          <div className="relative">
            <Filter size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E8952A] focus:border-transparent bg-white appearance-none cursor-pointer"
            >
              {TYPE_FILTER_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <a href="/api/subscriptions/export" className="btn-secondary">
              <Download size={14} />
              Export Excel
            </a>
          )}
          <Link href="/subscriptions/new" className="btn-primary">
            <Plus size={14} />
            Add Record
          </Link>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                {SORTABLE_COLS.map(({ field, label }) => (
                  <th
                    key={field}
                    onClick={() => toggleSort(field)}
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide cursor-pointer hover:text-gray-700 select-none whitespace-nowrap"
                  >
                    <span className="flex items-center gap-1">
                      {label}
                      <SortIcon field={field} />
                    </span>
                  </th>
                ))}
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading && Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-b border-gray-50">
                  <td className="px-4 py-3"><Skeleton className="h-4 w-36" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-28" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-28" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-5 w-16 rounded-full" /></td>
                  <td className="px-4 py-3 text-center"><Skeleton className="h-4 w-4 rounded-full mx-auto" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 justify-end">
                      <Skeleton className="h-7 w-7 rounded-md" />
                      <Skeleton className="h-7 w-7 rounded-md" />
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && sorted.length === 0 && (
                <tr>
                  <td colSpan={colSpan} className="text-center py-12 text-gray-400 text-sm">
                    No records found.{" "}
                    <Link href="/subscriptions/new" className="text-[#E8952A] hover:underline">
                      Add one?
                    </Link>
                  </td>
                </tr>
              )}
              {sorted.map((row) => {
                const canEdit = isAdmin || row.createdBy.id === session?.user?.id;
                return (
                  <tr key={row.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                      {row.vendor}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{row.department}</td>
                    <td className="px-4 py-3 text-gray-600 truncate" style={{ maxWidth: 160, width: 160 }} title={row.nature}>
                      {row.nature}
                    </td>
                    <td className="px-4 py-3 text-gray-600 truncate" style={{ maxWidth: 160, width: 160 }} title={row.servicesProviding}>
                      {row.servicesProviding}
                    </td>
                    <td className="px-4 py-3 text-gray-900 font-medium whitespace-nowrap">
                      {formatCurrency(row.subscriptionAmount)}
                    </td>
                    <td className="px-4 py-3">{typeBadge(row.subscriptionType)}</td>
                    <td className="px-4 py-3 text-center">
                      {row.paidOneTime
                        ? <CheckCircle2 size={16} className="text-green-500 mx-auto" />
                        : <Circle size={16} className="text-gray-300 mx-auto" />}
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      {formatDate(row.date)}
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      {formatDate(row.renewalDate)}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                      {row.updatedByName || row.createdBy.name}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        {canEdit && (
                          <>
                            <Link
                              href={`/subscriptions/${row.id}/edit`}
                              className="p-1.5 rounded-md text-gray-400 hover:text-[#E8952A] hover:bg-orange-50 transition-colors"
                              title="Edit"
                            >
                              <Pencil size={14} />
                            </Link>
                            <button
                              onClick={() => handleDelete(row.id)}
                              disabled={deletingId === row.id}
                              className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {!loading && sorted.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/30">
            <p className="text-xs text-gray-400">
              {sorted.length} record{sorted.length !== 1 ? "s" : ""}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
