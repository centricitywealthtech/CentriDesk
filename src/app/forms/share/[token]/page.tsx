"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Download, Send, CheckCircle2, Loader2, FileText, AlertCircle, Upload, FileCheck } from "lucide-react";

type FormField = {
  id: string;
  label: string;
  fieldType: string;
  options: string;
  required: boolean;
};

type FormInfo = {
  name: string;
  category: string;
  originalFileName: string;
  uploadedBy: { name: string };
  formFields: FormField[];
};

const inputCls =
  "w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-[#E8952A]/30 focus:border-[#E8952A] transition-all";
const labelCls = "block text-sm font-medium text-gray-700 mb-1.5";

function DynamicField({
  field, value, onChange,
}: {
  field: FormField; value: string; onChange: (v: string) => void;
}) {
  const opts = field.options ? field.options.split(",").map((o) => o.trim()).filter(Boolean) : [];
  if (field.fieldType === "textarea") {
    return (
      <textarea value={value} onChange={(e) => onChange(e.target.value)}
        required={field.required} rows={3}
        className={inputCls + " resize-none"}
        placeholder={`Enter ${field.label.toLowerCase()}`} />
    );
  }
  if (field.fieldType === "select" && opts.length > 0) {
    return (
      <select value={value} onChange={(e) => onChange(e.target.value)}
        required={field.required} className={inputCls}>
        <option value="">Select…</option>
        {opts.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    );
  }
  const type = field.fieldType === "email" ? "email"
    : field.fieldType === "number" ? "number"
    : field.fieldType === "date" ? "date" : "text";
  return (
    <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
      required={field.required} className={inputCls}
      placeholder={`Enter ${field.label.toLowerCase()}`} />
  );
}

export default function ShareFormPage() {
  const { token } = useParams<{ token: string }>();

  const [formInfo, setFormInfo] = useState<FormInfo | null>(null);
  const [notFound, setNotFound] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [dept, setDept] = useState("");
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [submittedFile, setSubmittedFile] = useState<File | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetch(`/api/forms/share/${token}`)
      .then(async (r) => {
        if (!r.ok) { setNotFound(true); return; }
        const data: FormInfo = await r.json();
        setFormInfo(data);
        const init: Record<string, string> = {};
        data.formFields.forEach((f) => { init[f.id] = ""; });
        setFieldValues(init);
      })
      .catch(() => setNotFound(true));
  }, [token]);

  async function handleDownload() {
    if (!formInfo) return;
    setDownloading(true);
    try {
      const res = await fetch(`/api/forms/share/${token}/file`);
      if (!res.ok) { setError("File not available."); return; }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url;
      a.download = formInfo.originalFileName; a.click();
      URL.revokeObjectURL(url);
    } catch { setError("Download failed."); }
    finally { setDownloading(false); }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const labeledValues = formInfo?.formFields.map((f) => ({
      label: f.label,
      value: fieldValues[f.id] ?? "",
    }));

    const fd = new FormData();
    fd.append("requesteeName", name);
    fd.append("requesteeEmail", email);
    fd.append("requesteeDept", dept);
    fd.append("fieldValues", JSON.stringify(labeledValues ?? []));
    if (submittedFile) fd.append("file", submittedFile);

    try {
      const res = await fetch(`/api/forms/share/${token}/submit`, { method: "POST", body: fd });
      if (res.ok) {
        setSubmitted(true);
      } else {
        const d = await res.json();
        setError(d.error ?? "Submission failed. Please try again.");
      }
    } catch { setError("Submission failed. Please try again."); }
    finally { setSubmitting(false); }
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-md w-full text-center">
          <AlertCircle size={40} className="text-red-400 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Link Not Found</h2>
          <p className="text-sm text-gray-500">This link may have expired or is invalid.</p>
        </div>
      </div>
    );
  }

  if (!formInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 size={28} className="animate-spin text-[#E8952A]" />
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-md w-full text-center">
          <CheckCircle2 size={48} className="text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Request Submitted</h2>
          <p className="text-sm text-gray-500 mb-1">
            Your request for <strong className="text-gray-700">{formInfo.name}</strong> has been received.
          </p>
          <p className="text-sm text-gray-400">The team will review and get back to you.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-lg">

        {/* Header */}
        <div className="px-8 pt-8 pb-6 border-b border-gray-100">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#E8952A]/10 flex items-center justify-center shrink-0 mt-0.5">
              <FileText size={20} className="text-[#E8952A]" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">{formInfo.category}</p>
              <h1 className="text-base font-semibold text-gray-900 leading-tight">{formInfo.name}</h1>
              <p className="text-xs text-gray-400 mt-0.5">Shared by <span className="text-gray-600 font-medium">{formInfo.uploadedBy.name}</span></p>
            </div>
          </div>

          {/* Info strip */}
          <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
            <div className="bg-gray-50 rounded-lg px-3 py-2">
              <span className="text-gray-400">Form Name</span>
              <p className="font-medium text-gray-700 mt-0.5 truncate">{formInfo.name}</p>
            </div>
            <div className="bg-gray-50 rounded-lg px-3 py-2">
              <span className="text-gray-400">Shared By</span>
              <p className="font-medium text-gray-700 mt-0.5">{formInfo.uploadedBy.name}</p>
            </div>
          </div>

          <button onClick={handleDownload} disabled={downloading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-[#E8952A]/40 text-sm font-medium text-[#E8952A] hover:bg-[#E8952A]/5 transition-colors disabled:opacity-50">
            {downloading ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
            {downloading ? "Downloading…" : "Download Blank Form"}
          </button>
          <p className="text-[11px] text-gray-400 text-center mt-1.5">
            Download, fill it out, then upload the completed form below.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-8 py-6 space-y-4">

          {/* Fixed identity fields */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Your Details</p>
            <div className="space-y-3">
              <div>
                <label className={labelCls}>Full Name <span className="text-red-500">*</span></label>
                <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Your full name" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Email Address <span className="text-red-500">*</span></label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="name@company.com" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Department <span className="text-gray-400 font-normal">(optional)</span></label>
                <input value={dept} onChange={(e) => setDept(e.target.value)} placeholder="e.g. Technology" className={inputCls} />
              </div>
            </div>
          </div>

          {/* Dynamic form fields */}
          {formInfo.formFields.length > 0 && (
            <div className="border-t border-gray-100 pt-4 space-y-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Form Details</p>
              {formInfo.formFields.map((field) => (
                <div key={field.id}>
                  <label className={labelCls}>
                    {field.label}
                    {field.required && <span className="text-red-500 ml-0.5">*</span>}
                  </label>
                  <DynamicField
                    field={field}
                    value={fieldValues[field.id] ?? ""}
                    onChange={(v) => setFieldValues((prev) => ({ ...prev, [field.id]: v }))}
                  />
                </div>
              ))}
            </div>
          )}

          {/* File upload */}
          <div className="border-t border-gray-100 pt-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Upload Completed Form</p>
            <label className="block cursor-pointer">
              <div className={`w-full border-2 border-dashed rounded-lg px-4 py-5 text-center transition-colors ${submittedFile ? "border-green-300 bg-green-50" : "border-gray-200 hover:border-[#E8952A]/40 hover:bg-[#E8952A]/5"}`}>
                {submittedFile ? (
                  <div className="flex items-center justify-center gap-2">
                    <FileCheck size={16} className="text-green-500" />
                    <span className="text-sm font-medium text-green-700">{submittedFile.name}</span>
                  </div>
                ) : (
                  <>
                    <Upload size={20} className="text-gray-300 mx-auto mb-1.5" />
                    <p className="text-sm text-gray-500">Click to upload your filled form</p>
                    <p className="text-xs text-gray-400 mt-0.5">.pdf or .docx accepted</p>
                  </>
                )}
              </div>
              <input
                type="file"
                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                className="hidden"
                onChange={(e) => setSubmittedFile(e.target.files?.[0] ?? null)}
              />
            </label>
          </div>

          {error && (
            <p className="text-red-500 text-xs flex items-center gap-1.5">
              <AlertCircle size={13} /> {error}
            </p>
          )}

          <button type="submit" disabled={submitting}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#E8952A] text-white text-sm font-semibold hover:bg-[#d4841f] transition-colors disabled:opacity-60">
            {submitting ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
            {submitting ? "Submitting…" : "Submit Request"}
          </button>
        </form>

        <div className="px-8 pb-6 text-center">
          <p className="text-[11px] text-gray-400">Powered by CentriDesk</p>
        </div>
      </div>
    </div>
  );
}
