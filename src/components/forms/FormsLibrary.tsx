"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import {
  Upload, Download, Link2, Filter, X, Loader2, FileText, FileCheck,
  Copy, CheckCheck, Plus, Trash2,
} from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatDate } from "@/lib/utils";

type Form = {
  id: string;
  name: string;
  category: string;
  originalFileName: string;
  createdAt: string;
  uploadedBy: { name: string };
  shareToken: string | null;
};

type FieldDef = {
  label: string;
  fieldType: string;
  options: string;
  required: boolean;
};

const CATEGORIES = ["IT", "HR", "Finance", "Legal", "Other"];
const FIELD_TYPES = [
  { value: "text", label: "Text" },
  { value: "textarea", label: "Paragraph" },
  { value: "number", label: "Number" },
  { value: "email", label: "Email" },
  { value: "date", label: "Date" },
  { value: "select", label: "Dropdown" },
];
const ALLOWED_EXT = [".pdf", ".docx", ".doc"];

function Toast({ message, type, onClose }: { message: string; type: "success" | "error"; onClose: () => void }) {
  return (
    <div className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-sm font-medium text-white ${type === "success" ? "bg-green-600" : "bg-red-600"}`}>
      {message}
      <button onClick={onClose}><X size={14} /></button>
    </div>
  );
}

function Modal({ title, onClose, children, wide }: { title: string; onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className={`bg-white rounded-xl shadow-2xl w-full mx-4 max-h-[90vh] flex flex-col ${wide ? "max-w-2xl" : "max-w-md"}`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
        </div>
        <div className="px-6 py-5 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

const inputCls = "w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-[#E8952A]/30 focus:border-[#E8952A] transition-all";
const labelCls = "block text-sm font-medium text-gray-700 mb-1.5";

function FieldBuilder({ fields, onChange }: { fields: FieldDef[]; onChange: (f: FieldDef[]) => void }) {
  function add() {
    onChange([...fields, { label: "", fieldType: "text", options: "", required: false }]);
  }
  function remove(i: number) {
    onChange(fields.filter((_, idx) => idx !== i));
  }
  function update(i: number, key: keyof FieldDef, val: string | boolean) {
    onChange(fields.map((f, idx) => idx === i ? { ...f, [key]: val } : f));
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Form Fields</p>
        <button
          type="button"
          onClick={add}
          className="flex items-center gap-1 text-xs font-medium text-[#E8952A] hover:text-[#d4841f] transition-colors"
        >
          <Plus size={13} /> Add Field
        </button>
      </div>

      {fields.length === 0 && (
        <p className="text-xs text-gray-400 text-center py-3 border border-dashed border-gray-200 rounded-lg">
          No fields added — the link will show only Name, Email &amp; Department.
        </p>
      )}

      {fields.map((f, i) => (
        <div key={i} className="border border-gray-100 rounded-lg p-3 space-y-2 bg-gray-50/50">
          <div className="flex items-center gap-2">
            <input
              value={f.label}
              onChange={(e) => update(i, "label", e.target.value)}
              placeholder="Field label"
              className="flex-1 border border-gray-200 rounded-md px-2.5 py-1.5 text-xs text-gray-900 bg-white focus:outline-none focus:ring-1 focus:ring-[#E8952A]"
            />
            <select
              value={f.fieldType}
              onChange={(e) => update(i, "fieldType", e.target.value)}
              className="border border-gray-200 rounded-md px-2 py-1.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#E8952A]"
            >
              {FIELD_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            <button type="button" onClick={() => remove(i)} className="text-gray-300 hover:text-red-400 transition-colors">
              <Trash2 size={14} />
            </button>
          </div>
          <div className="flex items-center gap-4">
            {f.fieldType === "select" && (
              <input
                value={f.options}
                onChange={(e) => update(i, "options", e.target.value)}
                placeholder="Options: Option 1, Option 2, Option 3"
                className="flex-1 border border-gray-200 rounded-md px-2.5 py-1.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#E8952A]"
              />
            )}
            <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer select-none ml-auto">
              <input
                type="checkbox"
                checked={f.required}
                onChange={(e) => update(i, "required", e.target.checked)}
                className="accent-[#E8952A]"
              />
              Required
            </label>
          </div>
        </div>
      ))}
    </div>
  );
}

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
  const [uploadFields, setUploadFields] = useState<FieldDef[]>([]);
  const [uploadError, setUploadError] = useState("");
  const [uploading, setUploading] = useState(false);

  // Share link modal
  const [shareForm, setShareForm] = useState<Form | null>(null);
  const [shareLink, setShareLink] = useState<string>("");
  const [generatingLink, setGeneratingLink] = useState(false);
  const [copied, setCopied] = useState(false);

  const [downloading, setDownloading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ message: msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchForms = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/forms");
    if (res.ok) setForms(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchForms(); }, [fetchForms]);

  async function openShareModal(form: Form) {
    setCopied(false);
    setShareForm(form);
    if (form.shareToken) {
      setShareLink(`${window.location.origin}/forms/share/${form.shareToken}`);
      return;
    }
    setGeneratingLink(true);
    const res = await fetch(`/api/forms/${form.id}/share-link`, { method: "POST" });
    setGeneratingLink(false);
    if (res.ok) {
      const { shareToken } = await res.json();
      setShareLink(`${window.location.origin}/forms/share/${shareToken}`);
      setForms((prev) => prev.map((f) => f.id === form.id ? { ...f, shareToken } : f));
    } else {
      showToast("Failed to generate link", "error");
      setShareForm(null);
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareLink);
    } catch {
      const el = document.createElement("textarea");
      el.value = shareLink;
      el.style.position = "fixed";
      el.style.opacity = "0";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  async function downloadFile(formId: string, filename: string) {
    setDownloading(formId);
    try {
      const res = await fetch(`/api/forms/${formId}/download`);
      if (!res.ok) { showToast("File not found on server", "error"); return; }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = filename; a.click();
      URL.revokeObjectURL(url);
    } catch {
      showToast("Download failed", "error");
    } finally {
      setDownloading(null);
    }
  }

  function resetUploadModal() {
    setUploadName(""); setUploadCategory(""); setUploadFile(null);
    setUploadFields([]); setUploadError("");
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    setUploadError("");
    if (!uploadFile) { setUploadError("Please select a file"); return; }
    const ext = "." + (uploadFile.name.split(".").pop()?.toLowerCase() ?? "");
    if (!ALLOWED_EXT.includes(ext)) { setUploadError("Only .docx and .pdf files are allowed"); return; }

    setUploading(true);
    const fd = new FormData();
    fd.append("name", uploadName);
    fd.append("category", uploadCategory);
    fd.append("file", uploadFile);
    fd.append("fields", JSON.stringify(uploadFields));

    const res = await fetch("/api/forms/upload", { method: "POST", body: fd });
    setUploading(false);
    if (!res.ok) {
      const d = await res.json();
      setUploadError(d.error ?? "Upload failed");
      return;
    }
    setShowUpload(false);
    resetUploadModal();
    await fetchForms();
    showToast("Form uploaded successfully");
  }

  const filtered = categoryFilter ? forms.filter((f) => f.category === categoryFilter) : forms;

  return (
    <div className="space-y-4">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative">
          <Filter size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
            className="pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E8952A] bg-white">
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        {isAdmin && (
          <button onClick={() => { setShowUpload(true); setUploadError(""); }} className="btn-primary">
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
                <tr key={i}>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-48" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-16" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
                  <td className="px-4 py-3 text-right"><div className="flex gap-2 justify-end"><Skeleton className="h-7 w-24 rounded-md" /><Skeleton className="h-7 w-24 rounded-md" /></div></td>
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
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">{form.category}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{form.uploadedBy.name}</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{formatDate(form.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => openShareModal(form)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-[#E8952A] text-white hover:bg-[#d4841f] transition-colors"
                      >
                        <Link2 size={13} /> Share Link
                      </button>
                      <button
                        onClick={() => downloadFile(form.id, form.originalFileName)}
                        disabled={downloading === form.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
                      >
                        {downloading === form.id ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
                        Download
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
        <Modal title="Upload Form" onClose={() => { setShowUpload(false); resetUploadModal(); }} wide>
          <form onSubmit={handleUpload} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 sm:col-span-1">
                <label className={labelCls}>Form Name <span className="text-red-500">*</span></label>
                <input value={uploadName} onChange={(e) => setUploadName(e.target.value)} required placeholder="e.g. Software Installation Form" className={inputCls} />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className={labelCls}>Category <span className="text-red-500">*</span></label>
                <select value={uploadCategory} onChange={(e) => setUploadCategory(e.target.value)} required className={inputCls}>
                  <option value="">Select category</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className={labelCls}>File <span className="text-red-500">*</span> <span className="text-gray-400 font-normal">(.docx or .pdf)</span></label>
              <input
                type="file"
                accept=".docx,.pdf,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={(e) => {
                  const f = e.target.files?.[0] ?? null;
                  if (f) {
                    const ext = "." + (f.name.split(".").pop()?.toLowerCase() ?? "");
                    if (!ALLOWED_EXT.includes(ext)) { setUploadError("Only .docx and .pdf files are allowed"); setUploadFile(null); return; }
                  }
                  setUploadError(""); setUploadFile(f);
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

            <div className="border-t border-gray-100 pt-4">
              <FieldBuilder fields={uploadFields} onChange={setUploadFields} />
            </div>

            {uploadError && <p className="text-red-500 text-xs">{uploadError}</p>}

            <div className="flex justify-end gap-3 pt-1">
              <button type="button" onClick={() => { setShowUpload(false); resetUploadModal(); }} className="btn-secondary">
                <X size={14} /> Cancel
              </button>
              <button type="submit" disabled={uploading} className="btn-primary">
                {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                {uploading ? "Uploading..." : "Upload"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Share Link Modal */}
      {shareForm && (
        <Modal title={`Share — ${shareForm.name}`} onClose={() => { setShareForm(null); setCopied(false); }}>
          <div className="space-y-4">
            <p className="text-xs text-gray-500 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2.5">
              Send this link to the requestee. They will fill in the form fields, download the document, and submit — the record will appear automatically in <strong>Form Tracking</strong>.
            </p>
            {generatingLink ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 size={20} className="animate-spin text-[#E8952A]" />
              </div>
            ) : (
              <div>
                <label className={labelCls}>Shareable Link</label>
                <div className="flex items-center gap-2">
                  <input readOnly value={shareLink}
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-600 bg-gray-50 focus:outline-none"
                    onClick={(e) => (e.target as HTMLInputElement).select()} />
                  <button onClick={copyLink}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors shrink-0 ${copied ? "bg-green-100 text-green-700" : "bg-[#E8952A] text-white hover:bg-[#d4841f]"}`}>
                    {copied ? <><CheckCheck size={13} /> Copied!</> : <><Copy size={13} /> Copy</>}
                  </button>
                </div>
                <p className="text-[11px] text-gray-400 mt-1.5">Anyone with this link can fill and submit — no login required.</p>
              </div>
            )}
            <div className="flex justify-end pt-1">
              <button onClick={() => { setShareForm(null); setCopied(false); }} className="btn-primary">Done</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
