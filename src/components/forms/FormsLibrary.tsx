"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Upload, Download, Share2, Filter, X, Loader2, FileText, FileCheck } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatDate } from "@/lib/utils";

type Form = {
  id: string;
  name: string;
  category: string;
  originalFileName: string;
  createdAt: string;
  uploadedBy: { name: string };
};

const CATEGORIES = ["IT", "HR", "Finance", "Legal", "Other"];
const ALLOWED_MIME = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
];

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

export function FormsLibrary() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";

  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("");

  // Upload modal
  const [showUpload, setShowUpload] = useState(false);
  const [uploadName, setUploadName] = useState("");
  const [uploadCategory, setUploadCategory] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState("");
  const [uploading, setUploading] = useState(false);

  // Share & Download modal
  const [shareForm, setShareForm] = useState<Form | null>(null);
  const [shareeName, setShareeName] = useState("");
  const [shareeEmail, setShareeEmail] = useState("");
  const [shareeDept, setShareeDept] = useState("");
  const [shareError, setShareError] = useState("");
  const [sharing, setSharing] = useState(false);

  const [downloading, setDownloading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchForms = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/forms");
    if (res.ok) setForms(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchForms(); }, [fetchForms]);

  async function downloadFile(formId: string, filename: string, setId?: (id: string | null) => void) {
    setId?.(formId);
    try {
      const res = await fetch(`/api/forms/${formId}/download`);
      if (!res.ok) { showToast("File not found on server", "error"); return; }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      showToast("Download failed", "error");
    } finally {
      setId?.(null);
    }
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    setUploadError("");
    if (!uploadFile) { setUploadError("Please select a file"); return; }
    if (!ALLOWED_MIME.includes(uploadFile.type)) {
      setUploadError("Only .docx and .pdf files are allowed");
      return;
    }
    setUploading(true);
    const fd = new FormData();
    fd.append("name", uploadName);
    fd.append("category", uploadCategory);
    fd.append("file", uploadFile);
    const res = await fetch("/api/forms/upload", { method: "POST", body: fd });
    setUploading(false);
    if (!res.ok) {
      const d = await res.json();
      setUploadError(d.error ?? "Upload failed");
      return;
    }
    setShowUpload(false);
    setUploadName(""); setUploadCategory(""); setUploadFile(null);
    await fetchForms();
    showToast("Form uploaded successfully");
  }

  async function handleShareAndDownload(e: React.FormEvent) {
    e.preventDefault();
    if (!shareForm) return;
    setShareError("");
    setSharing(true);
    const res = await fetch("/api/tracking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        formId: shareForm.id,
        requesteeName: shareeName,
        requesteeEmail: shareeEmail,
        requesteeDept: shareeDept,
      }),
    });
    if (!res.ok) {
      const d = await res.json();
      setShareError(d.error ?? "Failed to create tracking row");
      setSharing(false);
      return;
    }
    setSharing(false);
    setShareForm(null);
    setShareeName(""); setShareeEmail(""); setShareeDept("");
    await downloadFile(shareForm.id, shareForm.originalFileName);
    showToast("Tracking row created. Form downloaded.");
  }

  const filtered = categoryFilter ? forms.filter((f) => f.category === categoryFilter) : forms;

  return (
    <div className="space-y-4">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative">
          <Filter size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E8952A] bg-white"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        {isAdmin && (
          <button
            onClick={() => { setShowUpload(true); setUploadError(""); }}
            className="btn-primary"
          >
            <Upload size={14} /> Upload Form
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Form Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Category</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Uploaded By</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Upload Date</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading && Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="border-b border-gray-50">
                  <td className="px-4 py-3"><Skeleton className="h-4 w-48" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-16" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
                  <td className="px-4 py-3"><div className="flex gap-2 justify-end"><Skeleton className="h-7 w-32 rounded-md" /><Skeleton className="h-7 w-24 rounded-md" /></div></td>
                </tr>
              ))}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-gray-400 text-sm">
                    No forms found.{isAdmin && <> <button onClick={() => setShowUpload(true)} className="text-[#E8952A] hover:underline">Upload one?</button></>}
                  </td>
                </tr>
              )}
              {!loading && filtered.map((form) => (
                <tr key={form.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <FileText size={15} className="text-gray-400 shrink-0" />
                      <span className="font-medium text-gray-900">{form.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                      {form.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{form.uploadedBy.name}</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{formatDate(form.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      {/* Share & Download — primary */}
                      <button
                        title="Share & Download — creates a tracking row"
                        onClick={() => { setShareForm(form); setShareError(""); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                      >
                        <Share2 size={13} /> Share & Download
                      </button>
                      {/* Quick Download — secondary */}
                      <button
                        title="Quick Download — no tracking row created"
                        onClick={() => downloadFile(form.id, form.originalFileName, setDownloading)}
                        disabled={downloading === form.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
                      >
                        {downloading === form.id
                          ? <Loader2 size={13} className="animate-spin" />
                          : <Download size={13} />}
                        Quick Download
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && filtered.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/30">
            <p className="text-xs text-gray-400">{filtered.length} form{filtered.length !== 1 ? "s" : ""}</p>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <Modal title="Upload Form" onClose={() => setShowUpload(false)}>
          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label className={labelCls}>Form Name <span className="text-red-500">*</span></label>
              <input value={uploadName} onChange={(e) => setUploadName(e.target.value)} required placeholder="e.g. Software Installation Approval Form" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Category <span className="text-red-500">*</span></label>
              <select value={uploadCategory} onChange={(e) => setUploadCategory(e.target.value)} required className={inputCls}>
                <option value="">Select category</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>File <span className="text-red-500">*</span> <span className="text-gray-400 font-normal">(.docx or .pdf)</span></label>
              <input
                type="file"
                accept=".docx,.pdf,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={(e) => {
                  const f = e.target.files?.[0] ?? null;
                  if (f && !ALLOWED_MIME.includes(f.type)) {
                    setUploadError("Only .docx and .pdf files are allowed");
                    setUploadFile(null);
                  } else {
                    setUploadError("");
                    setUploadFile(f);
                  }
                }}
                required
                className="w-full border border-gray-200 rounded-lg px-3.5 py-2 text-sm text-gray-700 bg-white file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-[#E8952A]/10 file:text-[#E8952A] hover:file:bg-[#E8952A]/20"
              />
              {uploadFile && (
                <div className="flex items-center gap-1.5 mt-1.5">
                  <FileCheck size={13} className="text-green-500" />
                  <span className="text-xs text-gray-500">{uploadFile.name}</span>
                </div>
              )}
            </div>
            {uploadError && <p className="text-red-500 text-xs">{uploadError}</p>}
            <div className="flex justify-end gap-3 pt-1">
              <button type="button" onClick={() => setShowUpload(false)} className="btn-secondary"><X size={14} /> Cancel</button>
              <button type="submit" disabled={uploading} className="btn-primary">
                {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                {uploading ? "Uploading..." : "Upload"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Share & Download Modal */}
      {shareForm && (
        <Modal title={`Share & Download — ${shareForm.name}`} onClose={() => setShareForm(null)}>
          <form onSubmit={handleShareAndDownload} className="space-y-4">
            <p className="text-xs text-gray-500 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
              A tracking row will be created with state <strong>Shared</strong>, then the file will download.
            </p>
            <div>
              <label className={labelCls}>Requestee Name <span className="text-red-500">*</span></label>
              <input value={shareeName} onChange={(e) => setShareeName(e.target.value)} required placeholder="Full name" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Requestee Email <span className="text-red-500">*</span></label>
              <input type="email" value={shareeEmail} onChange={(e) => setShareeEmail(e.target.value)} required placeholder="email@company.com" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Requestee Department <span className="text-gray-400 font-normal">(optional)</span></label>
              <input value={shareeDept} onChange={(e) => setShareeDept(e.target.value)} placeholder="e.g. Technology" className={inputCls} />
            </div>
            {shareError && <p className="text-red-500 text-xs">{shareError}</p>}
            <div className="flex justify-end gap-3 pt-1">
              <button type="button" onClick={() => setShareForm(null)} className="btn-secondary"><X size={14} /> Cancel</button>
              <button type="submit" disabled={sharing} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 transition-colors">
                {sharing ? <Loader2 size={14} className="animate-spin" /> : <Share2 size={14} />}
                {sharing ? "Creating..." : "Share & Download"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
