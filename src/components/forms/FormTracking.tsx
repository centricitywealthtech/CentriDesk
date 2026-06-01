"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Filter, X, Loader2, CheckCircle2, XCircle, Eye, FileDown } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatDate } from "@/lib/utils";

type TrackingRow = {
  id: string;
  form: { id: string; name: string };
  sharedBy: { id: string; name: string };
  requesteeName: string;
  requesteeEmail: string;
  requesteeDept: string;
  state: string;
  submissionData: string;
  submittedFileName: string;
  submittedFilePath: string;
  createdAt: string;
  updatedAt: string;
};

type SubmissionEntry = { label: string; value: string };

const STATES = ["Submitted", "Shared", "Acknowledged", "In Review", "Pending Approval", "Approved", "Rejected"];
const TERMINAL_STATES = ["Approved", "Rejected"];

function stateBadgeClass(state: string) {
  switch (state) {
    case "Approved": return "bg-green-100 text-green-700";
    case "Rejected": return "bg-red-100 text-red-700";
    case "Pending Approval": return "bg-yellow-100 text-yellow-700";
    case "In Review": return "bg-blue-100 text-blue-700";
    case "Acknowledged": return "bg-purple-100 text-purple-700";
    case "Submitted": return "bg-orange-100 text-orange-700";
    default: return "bg-gray-100 text-gray-600";
  }
}

function Toast({ message, type, onClose }: { message: string; type: "success" | "error"; onClose: () => void }) {
  return (
    <div className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-sm font-medium text-white ${type === "success" ? "bg-green-600" : "bg-red-600"}`}>
      {message}
      <button onClick={onClose}><X size={14} /></button>
    </div>
  );
}

function DetailsModal({ row, onClose }: { row: TrackingRow; onClose: () => void }) {
  const [downloading, setDownloading] = useState(false);
  let entries: SubmissionEntry[] = [];
  try { if (row.submissionData) entries = JSON.parse(row.submissionData); } catch { /* ignore */ }

  async function downloadSubmitted() {
    setDownloading(true);
    try {
      const res = await fetch(`/api/tracking/${row.id}/submitted-file`);
      if (!res.ok) return;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = row.submittedFileName; a.click();
      URL.revokeObjectURL(url);
    } finally { setDownloading(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">{row.form.name}</h3>
            <p className="text-xs text-gray-400 mt-0.5">Submitted by {row.requesteeName} · {formatDate(row.createdAt)}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
        </div>

        <div className="px-6 py-5 overflow-y-auto space-y-4">
          {/* Fixed fields */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Requestee Details</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-400">Form Name</p>
                <p className="text-sm font-medium text-gray-900">{row.form.name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Shared By</p>
                <p className="text-sm font-medium text-gray-900">{row.sharedBy.name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Full Name</p>
                <p className="text-sm text-gray-900">{row.requesteeName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Email</p>
                <p className="text-sm text-gray-900 break-all">{row.requesteeEmail}</p>
              </div>
              {row.requesteeDept && (
                <div>
                  <p className="text-xs text-gray-400">Department</p>
                  <p className="text-sm text-gray-900">{row.requesteeDept}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-gray-400">State</p>
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold mt-0.5 ${stateBadgeClass(row.state)}`}>{row.state}</span>
              </div>
            </div>
          </div>

          {/* Dynamic form responses */}
          {entries.length > 0 && (
            <div className="border-t border-gray-100 pt-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Form Responses</p>
              <div className="space-y-3">
                {entries.map((entry, i) => (
                  <div key={i}>
                    <p className="text-xs text-gray-400 mb-0.5">{entry.label}</p>
                    <p className="text-sm text-gray-900 bg-gray-50 rounded-lg px-3 py-2 min-h-[32px]">
                      {entry.value || <span className="text-gray-300 italic">—</span>}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submitted file */}
          {row.submittedFileName && (
            <div className="border-t border-gray-100 pt-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Submitted File</p>
              <div className="flex items-center gap-3 bg-green-50 border border-green-100 rounded-lg px-3 py-2.5">
                <FileDown size={16} className="text-green-600 shrink-0" />
                <span className="text-sm text-green-800 font-medium flex-1 truncate">{row.submittedFileName}</span>
                <button
                  onClick={downloadSubmitted}
                  disabled={downloading}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 transition-colors shrink-0"
                >
                  {downloading ? <Loader2 size={12} className="animate-spin" /> : <FileDown size={12} />}
                  Download
                </button>
              </div>
            </div>
          )}

          {!row.submittedFileName && (
            <div className="border-t border-gray-100 pt-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Submitted File</p>
              <p className="text-xs text-gray-400 italic">No file uploaded by requestee yet.</p>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 shrink-0 flex justify-end">
          <button onClick={onClose} className="btn-primary">Close</button>
        </div>
      </div>
    </div>
  );
}

export function FormTrackingTable() {
  useSession();

  const [rows, setRows] = useState<TrackingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [stateFilter, setStateFilter] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [detailRow, setDetailRow] = useState<TrackingRow | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchRows = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (stateFilter) params.set("state", stateFilter);
    const res = await fetch(`/api/tracking?${params}`);
    if (res.ok) setRows(await res.json());
    setLoading(false);
  }, [stateFilter]);

  useEffect(() => { fetchRows(); }, [fetchRows]);

  async function handleStateChange(rowId: string, newState: string) {
    setUpdatingId(rowId);
    const res = await fetch(`/api/tracking/${rowId}/state`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ state: newState }),
    });
    if (res.ok) {
      setRows((prev) => prev.map((r) => r.id === rowId ? { ...r, state: newState, updatedAt: new Date().toISOString() } : r));
      showToast(`Status updated to "${newState}"`);
    } else {
      showToast("Failed to update status", "error");
    }
    setUpdatingId(null);
  }

  async function downloadSubmittedFile(row: TrackingRow) {
    const res = await fetch(`/api/tracking/${row.id}/submitted-file`);
    if (!res.ok) { showToast("File not available", "error"); return; }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = row.submittedFileName; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {detailRow && <DetailsModal row={detailRow} onClose={() => setDetailRow(null)} />}

      {/* Toolbar */}
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
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Form Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Shared By</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Requestee</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Email</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">State</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Submitted File</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Date</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading && Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 8 }).map((__, j) => (
                    <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
                  ))}
                </tr>
              ))}
              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-gray-400 text-sm">
                    No submissions yet. Share a form link from <strong className="text-gray-500">Forms Library</strong> to get started.
                  </td>
                </tr>
              )}
              {!loading && rows.map((row) => {
                const isTerminal = TERMINAL_STATES.includes(row.state);
                const isUpdating = updatingId === row.id;
                const hasFile = !!row.submittedFileName;
                return (
                  <tr key={row.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap max-w-[160px] truncate" title={row.form.name}>
                      {row.form.name}
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{row.sharedBy.name}</td>
                    <td className="px-4 py-3 text-gray-900 whitespace-nowrap">{row.requesteeName}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{row.requesteeEmail}</td>
                    <td className="px-4 py-3">
                      {isTerminal ? (
                        <div className="flex items-center gap-1.5">
                          {row.state === "Approved"
                            ? <CheckCircle2 size={14} className="text-green-500 shrink-0" />
                            : <XCircle size={14} className="text-red-500 shrink-0" />}
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${stateBadgeClass(row.state)}`}>
                            {row.state}
                          </span>
                        </div>
                      ) : (
                        <div className="relative">
                          {isUpdating && <Loader2 size={12} className="animate-spin absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />}
                          <select value={row.state} onChange={(e) => handleStateChange(row.id, e.target.value)}
                            disabled={isUpdating}
                            className={`pr-8 pl-2 py-1 rounded-lg border text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#E8952A]/30 cursor-pointer transition-colors ${stateBadgeClass(row.state)} border-transparent bg-opacity-80 disabled:opacity-60`}>
                            {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {hasFile ? (
                        <button
                          onClick={() => downloadSubmittedFile(row)}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 transition-colors whitespace-nowrap"
                          title={row.submittedFileName}
                        >
                          <FileDown size={12} /> Download
                        </button>
                      ) : (
                        <span className="text-xs text-gray-300 italic">Not uploaded</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{formatDate(row.createdAt)}</td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => setDetailRow(row)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                        title="View full submission">
                        <Eye size={13} /> View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {!loading && rows.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/30">
            <p className="text-xs text-gray-400">{rows.length} row{rows.length !== 1 ? "s" : ""}</p>
          </div>
        )}
      </div>
    </div>
  );
}
