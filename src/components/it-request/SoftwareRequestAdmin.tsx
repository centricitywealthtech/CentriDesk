"use client";

import { useState, useEffect, useCallback } from "react";
import { Copy, CheckCheck, Filter, X, Loader2, CheckCircle2, XCircle, Eye, Monitor } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatDate } from "@/lib/utils";

type Row = {
  id: string;
  requestedBy: string;
  employeeId: string;
  department: string;
  designation: string;
  emailId: string;
  requestDate: string;
  softwareName: string;
  softwareVersion: string;
  vendorName: string;
  softwareCategory: string;
  licenseType: string;
  licensesRequired: string;
  installationOn: string;
  purposeOfInstallation: string;
  businessImpact: string;
  state: string;
  createdAt: string;
};

const STATES = ["Submitted", "IT Review", "Security Review", "Pending Approval", "Approved", "Rejected"];
const TERMINAL = ["Approved", "Rejected"];

function stateBadge(state: string) {
  switch (state) {
    case "Approved": return "bg-green-100 text-green-700";
    case "Rejected": return "bg-red-100 text-red-700";
    case "Pending Approval": return "bg-yellow-100 text-yellow-700";
    case "IT Review": return "bg-blue-100 text-blue-700";
    case "Security Review": return "bg-purple-100 text-purple-700";
    default: return "bg-orange-100 text-orange-700";
  }
}

function Toast({ message, type, onClose }: { message: string; type: "success" | "error"; onClose: () => void }) {
  return (
    <div className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-sm font-medium text-white ${type === "success" ? "bg-green-600" : "bg-red-600"}`}>
      {message}<button onClick={onClose}><X size={14} /></button>
    </div>
  );
}

function DetailModal({ row, onClose }: { row: Row; onClose: () => void }) {
  const Field = ({ label, value }: { label: string; value: string }) => (
    <div>
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <p className="text-sm text-gray-900 bg-gray-50 rounded-lg px-3 py-2 min-h-[32px]">
        {value || <span className="text-gray-300 italic">—</span>}
      </p>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl mx-4 max-h-[88vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Software Installation Request</h3>
            <p className="text-xs text-gray-400 mt-0.5">{row.requestedBy} · {formatDate(row.createdAt)}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
        </div>

        <div className="px-6 py-5 overflow-y-auto space-y-6">
          {/* Section 1 */}
          <div>
            <p className="text-xs font-bold text-[#E8952A] uppercase tracking-widest mb-3">1. Request Details</p>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Requested By" value={row.requestedBy} />
              <Field label="Employee ID" value={row.employeeId} />
              <Field label="Department" value={row.department} />
              <Field label="Designation" value={row.designation} />
              <Field label="Email ID" value={row.emailId} />
              <Field label="Request Date" value={row.requestDate} />
            </div>
          </div>

          {/* Section 2 */}
          <div>
            <p className="text-xs font-bold text-[#E8952A] uppercase tracking-widest mb-3">2. Software Details</p>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Software Name" value={row.softwareName} />
              <Field label="Software Version" value={row.softwareVersion} />
              <Field label="Vendor / Publisher" value={row.vendorName} />
              <Field label="Software Category" value={row.softwareCategory} />
              <Field label="License Type" value={row.licenseType} />
              <Field label="Licenses Required" value={row.licensesRequired} />
              <div className="col-span-2">
                <Field label="Installation Required On" value={row.installationOn} />
              </div>
            </div>
          </div>

          {/* Section 3 */}
          <div>
            <p className="text-xs font-bold text-[#E8952A] uppercase tracking-widest mb-3">3. Business Justification</p>
            <div className="space-y-3">
              <Field label="Purpose of Software Installation" value={row.purposeOfInstallation} />
              <Field label="Business Impact if Not Installed" value={row.businessImpact} />
            </div>
          </div>

          {/* Sections 4–8 placeholder */}
          <div className="border border-dashed border-gray-200 rounded-xl px-4 py-4 text-center">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Sections 4–8</p>
            <p className="text-xs text-gray-400">Technical Review · Security Review · Approval Matrix · Installation Status · Employee Acknowledgement</p>
            <p className="text-xs text-gray-300 mt-1">To be completed internally by the IT team</p>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 shrink-0 flex justify-end">
          <button onClick={onClose} className="btn-primary">Close</button>
        </div>
      </div>
    </div>
  );
}

export function SoftwareRequestAdmin() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [stateFilter, setStateFilter] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [detailRow, setDetailRow] = useState<Row | null>(null);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const shareLink = typeof window !== "undefined" ? `${window.location.origin}/forms/it-request` : "/forms/it-request";

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ message: msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchRows = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/software-request");
    if (res.ok) setRows(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchRows(); }, [fetchRows]);

  async function copyLink() {
    await navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  async function handleStateChange(id: string, state: string) {
    setUpdatingId(id);
    const res = await fetch(`/api/software-request/${id}/state`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ state }),
    });
    if (res.ok) {
      setRows((prev) => prev.map((r) => r.id === id ? { ...r, state } : r));
      showToast(`Status updated to "${state}"`);
    } else {
      showToast("Failed to update status", "error");
    }
    setUpdatingId(null);
  }

  const filtered = stateFilter ? rows.filter((r) => r.state === stateFilter) : rows;

  return (
    <div className="space-y-5">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {detailRow && <DetailModal row={detailRow} onClose={() => setDetailRow(null)} />}

      {/* Share link card */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-[#E8952A]/10 flex items-center justify-center shrink-0">
              <Monitor size={17} className="text-[#E8952A]" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-700">Software Installation Request Form</p>
              <p className="text-xs text-gray-400 truncate">{shareLink}</p>
            </div>
          </div>
          <button onClick={copyLink}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-colors shrink-0 ${copied ? "bg-green-100 text-green-700" : "bg-[#E8952A] text-white hover:bg-[#d4841f]"}`}>
            {copied ? <><CheckCheck size={13} /> Copied!</> : <><Copy size={13} /> Copy Share Link</>}
          </button>
        </div>
        <p className="text-[11px] text-gray-400 mt-2">
          Share this link with employees. They fill the form online — no login required. Submissions appear in the table below.
        </p>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <Filter size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <select value={stateFilter} onChange={(e) => setStateFilter(e.target.value)}
            className="pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E8952A] bg-white">
            <option value="">All States</option>
            {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Requested By</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Employee ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Department</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Software Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">License Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">State</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Date</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading && Array.from({ length: 4 }).map((_, i) => (
                <tr key={i}>{Array.from({ length: 8 }).map((__, j) => (
                  <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
                ))}</tr>
              ))}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-14 text-gray-400 text-sm">
                    No submissions yet. Share the form link above to start receiving requests.
                  </td>
                </tr>
              )}
              {!loading && filtered.map((row) => {
                const isTerminal = TERMINAL.includes(row.state);
                const isUpdating = updatingId === row.id;
                return (
                  <tr key={row.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">{row.requestedBy}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{row.employeeId || "—"}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{row.department || "—"}</td>
                    <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap max-w-[160px] truncate" title={row.softwareName}>{row.softwareName}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{row.licenseType || "—"}</td>
                    <td className="px-4 py-3">
                      {isTerminal ? (
                        <div className="flex items-center gap-1.5">
                          {row.state === "Approved" ? <CheckCircle2 size={14} className="text-green-500" /> : <XCircle size={14} className="text-red-500" />}
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${stateBadge(row.state)}`}>{row.state}</span>
                        </div>
                      ) : (
                        <div className="relative">
                          {isUpdating && <Loader2 size={12} className="animate-spin absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />}
                          <select value={row.state} onChange={(e) => handleStateChange(row.id, e.target.value)}
                            disabled={isUpdating}
                            className={`pr-8 pl-2 py-1 rounded-lg border text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#E8952A]/30 cursor-pointer transition-colors ${stateBadge(row.state)} border-transparent bg-opacity-80 disabled:opacity-60`}>
                            {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{formatDate(row.createdAt)}</td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => setDetailRow(row)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors">
                        <Eye size={13} /> View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {!loading && filtered.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/30">
            <p className="text-xs text-gray-400">{filtered.length} request{filtered.length !== 1 ? "s" : ""}</p>
          </div>
        )}
      </div>
    </div>
  );
}
