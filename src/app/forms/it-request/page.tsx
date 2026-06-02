"use client";

import { useState } from "react";
import { Send, CheckCircle2, Loader2, AlertCircle, Monitor } from "lucide-react";

const inputCls = "w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-[#E8952A]/30 focus:border-[#E8952A] transition-all";
const labelCls = "block text-sm font-medium text-gray-700 mb-1.5";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
        <span className="text-xs font-bold text-[#E8952A] uppercase tracking-widest">{title}</span>
      </div>
      {children}
    </div>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>;
}

export default function SoftwareRequestForm() {
  const [form, setForm] = useState({
    requestedBy: "", employeeId: "", department: "", designation: "",
    emailId: "", requestDate: "",
    softwareName: "", softwareVersion: "", vendorName: "", softwareCategory: "",
    licenseType: "", licensesRequired: "", installationOn: "",
    purposeOfInstallation: "", businessImpact: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  function set(key: keyof typeof form, val: string) {
    setForm((prev) => ({ ...prev, [key]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/software-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) { setSubmitted(true); }
      else { const d = await res.json(); setError(d.error ?? "Submission failed."); }
    } catch { setError("Submission failed. Please try again."); }
    finally { setSubmitting(false); }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 max-w-md w-full text-center">
          <CheckCircle2 size={52} className="text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Request Submitted</h2>
          <p className="text-sm text-gray-500">Your software installation request has been received and will be reviewed by the IT team.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-8 py-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#E8952A]/10 flex items-center justify-center shrink-0">
              <Monitor size={22} className="text-[#E8952A]" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Centricity · IT Department</p>
              <h1 className="text-lg font-bold text-gray-900">Software Installation Approval Form</h1>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 px-8 py-8 space-y-8">

          {/* Section 1 */}
          <Section title="1. Request Details">
            <Row>
              <div>
                <label className={labelCls}>Requested By <span className="text-red-500">*</span></label>
                <input value={form.requestedBy} onChange={(e) => set("requestedBy", e.target.value)} required placeholder="Full name" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Employee ID</label>
                <input value={form.employeeId} onChange={(e) => set("employeeId", e.target.value)} placeholder="EMP-001" className={inputCls} />
              </div>
            </Row>
            <Row>
              <div>
                <label className={labelCls}>Department</label>
                <input value={form.department} onChange={(e) => set("department", e.target.value)} placeholder="e.g. Technology" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Designation</label>
                <input value={form.designation} onChange={(e) => set("designation", e.target.value)} placeholder="e.g. Software Engineer" className={inputCls} />
              </div>
            </Row>
            <Row>
              <div>
                <label className={labelCls}>Email ID <span className="text-red-500">*</span></label>
                <input type="email" value={form.emailId} onChange={(e) => set("emailId", e.target.value)} required placeholder="name@centricity.com" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Request Date</label>
                <input type="date" value={form.requestDate} onChange={(e) => set("requestDate", e.target.value)} className={inputCls} />
              </div>
            </Row>
          </Section>

          {/* Section 2 */}
          <Section title="2. Software Details">
            <Row>
              <div>
                <label className={labelCls}>Software Name <span className="text-red-500">*</span></label>
                <input value={form.softwareName} onChange={(e) => set("softwareName", e.target.value)} required placeholder="e.g. Microsoft Visio" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Software Version</label>
                <input value={form.softwareVersion} onChange={(e) => set("softwareVersion", e.target.value)} placeholder="e.g. 2024" className={inputCls} />
              </div>
            </Row>
            <Row>
              <div>
                <label className={labelCls}>Vendor / Publisher Name</label>
                <input value={form.vendorName} onChange={(e) => set("vendorName", e.target.value)} placeholder="e.g. Microsoft" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Software Category</label>
                <input value={form.softwareCategory} onChange={(e) => set("softwareCategory", e.target.value)} placeholder="e.g. Diagramming Tool" className={inputCls} />
              </div>
            </Row>
            <Row>
              <div>
                <label className={labelCls}>License Type</label>
                <select value={form.licenseType} onChange={(e) => set("licenseType", e.target.value)} className={inputCls}>
                  <option value="">Select…</option>
                  <option>Trial</option>
                  <option>Licensed</option>
                  <option>Open Source</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Number of Licenses Required</label>
                <input type="number" min="1" value={form.licensesRequired} onChange={(e) => set("licensesRequired", e.target.value)} placeholder="1" className={inputCls} />
              </div>
            </Row>
            <div>
              <label className={labelCls}>Installation Required On</label>
              <select value={form.installationOn} onChange={(e) => set("installationOn", e.target.value)} className={inputCls}>
                <option value="">Select…</option>
                <option>Desktop</option>
                <option>Laptop</option>
                <option>Server</option>
                <option>Particular User</option>
              </select>
            </div>
          </Section>

          {/* Section 3 */}
          <Section title="3. Business Justification">
            <div>
              <label className={labelCls}>Purpose of Software Installation</label>
              <textarea value={form.purposeOfInstallation} onChange={(e) => set("purposeOfInstallation", e.target.value)}
                rows={3} placeholder="Describe why this software is needed…" className={inputCls + " resize-none"} />
            </div>
            <div>
              <label className={labelCls}>Business Impact if Not Installed</label>
              <textarea value={form.businessImpact} onChange={(e) => set("businessImpact", e.target.value)}
                rows={3} placeholder="Describe the impact if this request is not approved…" className={inputCls + " resize-none"} />
            </div>
          </Section>

          {error && (
            <p className="text-red-500 text-xs flex items-center gap-1.5">
              <AlertCircle size={13} /> {error}
            </p>
          )}

          <button type="submit" disabled={submitting}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#E8952A] text-white text-sm font-semibold hover:bg-[#d4841f] transition-colors disabled:opacity-60">
            {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            {submitting ? "Submitting…" : "Submit Request"}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-4">Powered by CentriDesk</p>
      </div>
    </div>
  );
}
