"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Share2, Filter, X, Loader2, CheckCircle2, XCircle } from "lucide-react";
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
  createdAt: string;
  updatedAt: string;
};

type FormOption = { id: string; name: string };

const STATES = ["Shared", "Acknowledged", "In Review", "Pending Approval", "Approved", "Rejected"];
const TERMINAL_STATES = ["Approved", "Rejected"];

function stateBadgeClass(state: string) {
  switch (state) {
    case "Approved": return "bg-green-100 text-green-700";
    case "Rejected": return "bg-red-100 text-red-700";
    case "Pending Approval": return "bg-yellow-100 text-yellow-700";
    case "In Review": return "bg-blue-100 text-blue-700";
    case "Acknowledged": return "bg-purple-100 text-purple-700";
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

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

const inputCls = "w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-[#E8952A]/30 focus:border-[#E8952A] transition-all";
const labelCls = "block text-sm font-medium text-gray-700 mb-1.5";

export function FormTrackingTable() {
  useSession();

  const [rows, setRows] = useState<TrackingRow[]>([]);
  const [forms, setForms] = useState<FormOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [stateFilter, setStateFilter] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Share Form modal
  const [showShare, setShowShare] = useState(false);
  const [shareFormId, setShareFormId] = useState("");
  const [shareeName, setShareeName] = useState("");
  const [shareeEmail, setShareeEmail] = useState("");
  const [shareeDept, setShareeDept] = useState("");
  const [shareError, setShareError] = useState("");
  const [sharing, setSharing] = useState(false);

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

  const fetchForms = useCallback(async () => {
    const res = await fetch("/api/forms");
    if (res.ok) {
      const data = await res.json();
      setForms(data.map((f: { id: string; name: string }) => ({ id: f.id, name: f.name })));
    }
  }, []);

  useEffect(() => { fetchRows(); }, [fetchRows]);
  useEffect(() => { fetchForms(); }, [fetchForms]);

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

  async function handleShare(e: React.FormEvent) {
    e.preventDefault();
    setShareError("");
    if (!shareFormId) { setShareError("Please select a form"); return; }
    setSharing(true);
    const res = await fetch("/api/tracking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ formId: shareFormId, requesteeName: shareeName, requesteeEmail: shareeEmail, requesteeDept: shareeDept }),
    });
    setSharing(false);
    if (!res.ok) {
      const d = await res.json();
      setShareError(d.error ?? "Failed to share form");
      return;
    }
    setShowShare(false);
    setShareFormId(""); setShareeName(""); setShareeEmail(""); setShareeDept("");
    await fetchRows();
    showToast("Form shared. Tracking row created.");
  }

  return (
    <div className="space-y-4">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative">
          <Filter size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <select
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            className="pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E8952A] bg-white"
          >
            <option value="">All States</option>
            {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <button
          onClick={() => { setShowShare(true); setShareError(""); }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          <Share2 size={14} /> Share Form
        </button>
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
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Last Updated</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Date Shared</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading && Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-gray-50">
                  {Array.from({ length: 7 }).map((__, j) => (
                    <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
                  ))}
                </tr>
              ))}
              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400 text-sm">
                    No tracking rows yet. Share a form to get started.
                  </td>
                </tr>
              )}
              {!loading && rows.map((row) => {
                const isTerminal = TERMINAL_STATES.includes(row.state);
                const isUpdating = updatingId === row.id;
                return (
                  <tr key={row.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap max-w-[180px] truncate" title={row.form.name}>
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
                          {isUpdating && (
                            <Loader2 size={12} className="animate-spin absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                          )}
                          <select
                            value={row.state}
                            onChange={(e) => handleStateChange(row.id, e.target.value)}
                            disabled={isUpdating}
                            className={`pr-8 pl-2 py-1 rounded-lg border text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#E8952A]/30 cursor-pointer transition-colors ${stateBadgeClass(row.state)} border-transparent bg-opacity-80 disabled:opacity-60`}
                          >
                            {STATES.map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{formatDate(row.updatedAt)}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{formatDate(row.createdAt)}</td>
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

      {/* Share Form Modal */}
      {showShare && (
        <Modal title="Share Form" onClose={() => setShowShare(false)}>
          <form onSubmit={handleShare} className="space-y-4">
            <div>
              <label className={labelCls}>Form <span className="text-red-500">*</span></label>
              <select value={shareFormId} onChange={(e) => setShareFormId(e.target.value)} required className={inputCls}>
                <option value="">Select a form</option>
                {forms.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Requestee Name <span className="text-red-500">*</span></label>
              <input value={shareeName} onChange={(e) => setShareeName(e.target.value)} required placeholder="Full name" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Requestee Email <span className="text-red-500">*</span></label>
              <input type="email" value={shareeEmail} onChange={(e) => setShareeEmail(e.target.value)} required placeholder="email@company.com" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Department <span className="text-gray-400 font-normal">(optional)</span></label>
              <input value={shareeDept} onChange={(e) => setShareeDept(e.target.value)} placeholder="e.g. Technology" className={inputCls} />
            </div>
            {shareError && <p className="text-red-500 text-xs">{shareError}</p>}
            <div className="flex justify-end gap-3 pt-1">
              <button type="button" onClick={() => setShowShare(false)} className="btn-secondary"><X size={14} /> Cancel</button>
              <button type="submit" disabled={sharing} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 transition-colors">
                {sharing ? <Loader2 size={14} className="animate-spin" /> : <Share2 size={14} />}
                {sharing ? "Sharing..." : "Share Form"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
