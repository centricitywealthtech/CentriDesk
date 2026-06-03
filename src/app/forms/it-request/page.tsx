"use client";

import { useState } from "react";
import { Send, CheckCircle2, Loader2, AlertCircle, Monitor, Plus, Trash2 } from "lucide-react";

const inputCls = "w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-[#E8952A]/30 focus:border-[#E8952A] transition-all";
const labelCls = "block text-sm font-medium text-gray-700 mb-1.5";
const cellInputCls = "w-full min-w-[90px] border-0 border-b border-gray-200 px-1 py-1 text-sm text-gray-900 placeholder-gray-300 bg-transparent focus:outline-none focus:border-[#E8952A] transition-colors";

type VersionRow = { versionNumber: string; date: string; updatedBy: string; approvedBy: string; remarks: string };

function Section({ title, itTeam, children }: { title: string; itTeam?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-gray-100">
        <span className="text-xs font-bold text-[#E8952A] uppercase tracking-widest">{title}</span>
        {itTeam && (
          <span className="text-[10px] font-semibold text-blue-500 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">
            To be filled by IT Team
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>;
}


export default function SoftwareRequestForm({ embedded = false }: { embedded?: boolean }) {
  const [form, setForm] = useState({
    requestedBy: "", employeeId: "", department: "", designation: "",
    emailId: "", requestDate: "",
    softwareName: "", softwareVersion: "", vendorName: "", softwareCategory: "",
    licenseType: "", licensesRequired: "", installationOn: "",
    purposeOfInstallation: "", businessImpact: "",
    policyPreparedBy: "", policyReviewedBy: "", policyApprovedBy: "", policyEffectiveDate: "",
    techCompatibility: "", techAntivirusScan: "", techLicenseVerif: "",
    techVendorValidation: "", techAdminRights: "", techRemarks: "",
    secDlpCompliance: "", secRiskAssessment: "", secApprovalStatus: "", secRemarks: "",
    instCompletedBy: "", instDate: "", instSoftwareInstalled: "", instLicenseUpdated: "",
    instAssetUpdated: "", instRemarks: "",
    ackEmployeeName: "", ackSignatureDate: "",
  });

  const APPROVAL_LEVELS = [
    "Reporting Manager",
    "Department Head (if Required)",
    "IT Team",
    "Information Security Team",
    "IT Head / CTO (if required)",
  ];
  const [approvalMatrix, setApprovalMatrix] = useState(
    APPROVAL_LEVELS.map((level) => ({ level, name: "", status: "" }))
  );

  function setApproval(index: number, key: "name" | "status", val: string) {
    setApprovalMatrix((prev) => prev.map((r, i) => i === index ? { ...r, [key]: val } : r));
  }

  const [versionRows, setVersionRows] = useState<VersionRow[]>([
    { versionNumber: "", date: "", updatedBy: "", approvedBy: "", remarks: "" },
  ]);

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  function set(key: keyof typeof form, val: string) {
    setForm((prev) => ({ ...prev, [key]: val }));
  }

  function setVersion(index: number, key: keyof VersionRow, val: string) {
    setVersionRows((prev) => prev.map((r, i) => i === index ? { ...r, [key]: val } : r));
  }

  function addVersionRow() {
    setVersionRows((prev) => [...prev, { versionNumber: "", date: "", updatedBy: "", approvedBy: "", remarks: "" }]);
  }

  function removeVersionRow(index: number) {
    if (versionRows.length === 1) return;
    setVersionRows((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/software-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, versionControl: versionRows, approvalMatrix }),
      });
      if (res.ok) { setSubmitted(true); }
      else { const d = await res.json(); setError(d.error ?? "Submission failed."); }
    } catch { setError("Submission failed. Please try again."); }
    finally { setSubmitting(false); }
  }

  if (submitted) {
    return (
      <div className={embedded ? "py-16 flex items-center justify-center" : "min-h-screen bg-gray-50 flex items-center justify-center px-4"}>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 max-w-md w-full text-center">
          <CheckCircle2 size={52} className="text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Request Submitted</h2>
          <p className="text-sm text-gray-500">Your software installation request has been received and will be reviewed by the IT team.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={embedded ? "" : "min-h-screen bg-gray-50 py-10 px-4"}>
      <div className={embedded ? "space-y-6" : "max-w-3xl mx-auto"}>

        {/* Header — hidden when embedded (dashboard topbar provides context) */}
        {!embedded && (
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
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Policy Authority */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-8 py-6 space-y-4">
            <p className="text-xs font-bold text-[#E8952A] uppercase tracking-widest">IT Support Request Policy Authority</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    {["Prepared by", "Reviewed by", "Approved by", "Effective Date"].map((h) => (
                      <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-gray-100">
                    <td className="px-3 py-2">
                      <input value={form.policyPreparedBy} onChange={(e) => set("policyPreparedBy", e.target.value)} placeholder="Name / Role" className={cellInputCls} />
                    </td>
                    <td className="px-3 py-2">
                      <input value={form.policyReviewedBy} onChange={(e) => set("policyReviewedBy", e.target.value)} placeholder="Name / Role" className={cellInputCls} />
                    </td>
                    <td className="px-3 py-2">
                      <input value={form.policyApprovedBy} onChange={(e) => set("policyApprovedBy", e.target.value)} placeholder="Name / Role" className={cellInputCls} />
                    </td>
                    <td className="px-3 py-2">
                      <input type="date" value={form.policyEffectiveDate} onChange={(e) => set("policyEffectiveDate", e.target.value)} className={cellInputCls} />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Version Control */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-8 py-6 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-[#E8952A] uppercase tracking-widest">Version Control</p>
              <button type="button" onClick={addVersionRow}
                className="flex items-center gap-1 text-xs text-[#E8952A] hover:text-[#d4841f] font-medium transition-colors">
                <Plus size={13} /> Add Row
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    {["Version Number", "Date", "Updated By", "Approved By", "Remarks (Key changes)", ""].map((h, i) => (
                      <th key={i} className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {versionRows.map((row, i) => (
                    <tr key={i}>
                      <td className="px-3 py-2">
                        <input value={row.versionNumber} onChange={(e) => setVersion(i, "versionNumber", e.target.value)} placeholder="1.0" className={cellInputCls} />
                      </td>
                      <td className="px-3 py-2">
                        <input type="date" value={row.date} onChange={(e) => setVersion(i, "date", e.target.value)} className={cellInputCls} />
                      </td>
                      <td className="px-3 py-2">
                        <input value={row.updatedBy} onChange={(e) => setVersion(i, "updatedBy", e.target.value)} placeholder="Name" className={cellInputCls} />
                      </td>
                      <td className="px-3 py-2">
                        <input value={row.approvedBy} onChange={(e) => setVersion(i, "approvedBy", e.target.value)} placeholder="Name" className={cellInputCls} />
                      </td>
                      <td className="px-3 py-2">
                        <input value={row.remarks} onChange={(e) => setVersion(i, "remarks", e.target.value)} placeholder="Key changes…" className={cellInputCls} />
                      </td>
                      <td className="px-3 py-2 text-center">
                        <button type="button" onClick={() => removeVersionRow(i)} disabled={versionRows.length === 1}
                          className="text-gray-300 hover:text-red-400 disabled:opacity-0 transition-colors">
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sections 1–3 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-8 py-8 space-y-8">

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

            <Section title="4. Technical Review" itTeam>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600 w-3/4">Check Point</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600 w-1/4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {([
                      ["Compatibility Check Completed", "techCompatibility"],
                      ["Antivirus / Security Scan Completed", "techAntivirusScan"],
                      ["License Verification Completed", "techLicenseVerif"],
                      ["Vendor Validation Completed", "techVendorValidation"],
                      ["Admin Rights Required", "techAdminRights"],
                    ] as [string, keyof typeof form][]).map(([label, key]) => (
                      <tr key={key}>
                        <td className="px-4 py-2.5 text-sm text-gray-700">{label}</td>
                        <td className="px-3 py-2">
                          <select value={form[key]} onChange={(e) => set(key, e.target.value)}
                            className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#E8952A]/30 focus:border-[#E8952A] transition-all">
                            <option value="">—</option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div>
                <label className={labelCls}>IT Remarks</label>
                <textarea value={form.techRemarks} onChange={(e) => set("techRemarks", e.target.value)}
                  rows={4} placeholder="Enter IT team remarks…" className={inputCls + " resize-none"} />
              </div>
            </Section>

            <Section title="5. Information Security Review (If Applicable)" itTeam>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600 w-3/4">Field</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600 w-1/4">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {([
                      ["DLP / Compliance Review Completed", "secDlpCompliance"],
                      ["Security Risk Assessment Completed", "secRiskAssessment"],
                    ] as [string, keyof typeof form][]).map(([label, key]) => (
                      <tr key={key}>
                        <td className="px-4 py-2.5 text-sm text-gray-700">{label}</td>
                        <td className="px-3 py-2">
                          <select value={form[key]} onChange={(e) => set(key, e.target.value)}
                            className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#E8952A]/30 focus:border-[#E8952A] transition-all">
                            <option value="">—</option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                    <tr>
                      <td className="px-4 py-2.5 text-sm text-gray-700">Approved / Rejected</td>
                      <td className="px-3 py-2">
                        <input value={form.secApprovalStatus} onChange={(e) => set("secApprovalStatus", e.target.value)}
                          placeholder="Decision…" className={cellInputCls} />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div>
                <label className={labelCls}>Security Team Remarks</label>
                <textarea value={form.secRemarks} onChange={(e) => set("secRemarks", e.target.value)}
                  rows={4} placeholder="Enter security team remarks…" className={inputCls + " resize-none"} />
              </div>
            </Section>

            <Section title="6. Approval Matrix" itTeam>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600">Approval Level</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600">Name</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600">Approval Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {approvalMatrix.map((row, i) => (
                      <tr key={row.level}>
                        <td className="px-4 py-2.5 text-sm text-gray-700 whitespace-nowrap">{row.level}</td>
                        <td className="px-3 py-2">
                          <input value={row.name} onChange={(e) => setApproval(i, "name", e.target.value)}
                            placeholder="Full name" className={cellInputCls} />
                        </td>
                        <td className="px-3 py-2">
                          <select value={row.status} onChange={(e) => setApproval(i, "status", e.target.value)}
                            className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#E8952A]/30 focus:border-[#E8952A] transition-all">
                            <option value="">—</option>
                            <option value="Approved">Approved</option>
                            <option value="Rejected">Rejected</option>
                            <option value="Pending">Pending</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>

            <Section title="7. Installation Status" itTeam>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600 w-1/2">Field</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600 w-1/2">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr>
                      <td className="px-4 py-2.5 text-sm text-gray-700">Installation Completed By</td>
                      <td className="px-3 py-2">
                        <input value={form.instCompletedBy} onChange={(e) => set("instCompletedBy", e.target.value)}
                          placeholder="Full name" className={cellInputCls} />
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 text-sm text-gray-700">Installation Date</td>
                      <td className="px-3 py-2">
                        <input type="date" value={form.instDate} onChange={(e) => set("instDate", e.target.value)}
                          className={cellInputCls} />
                      </td>
                    </tr>
                    {([
                      ["Software Successfully Installed", "instSoftwareInstalled"],
                      ["License Key Updated", "instLicenseUpdated"],
                      ["Asset Inventory Updated", "instAssetUpdated"],
                    ] as [string, keyof typeof form][]).map(([label, key]) => (
                      <tr key={key}>
                        <td className="px-4 py-2.5 text-sm text-gray-700">{label}</td>
                        <td className="px-3 py-2">
                          <select value={form[key]} onChange={(e) => set(key, e.target.value)}
                            className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#E8952A]/30 focus:border-[#E8952A] transition-all">
                            <option value="">—</option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div>
                <label className={labelCls}>Final Remarks</label>
                <textarea value={form.instRemarks} onChange={(e) => set("instRemarks", e.target.value)}
                  rows={4} placeholder="Enter final remarks…" className={inputCls + " resize-none"} />
              </div>
            </Section>

            <Section title="8. Employee Acknowledgement">
              <div className="bg-gray-50 rounded-xl px-5 py-4 space-y-2 text-sm text-gray-600 border border-gray-100">
                <p className="font-medium text-gray-700 mb-2">
                  I acknowledge that the above-mentioned software has been installed on my assigned system. I understand that:
                </p>
                <ul className="space-y-1.5 list-none">
                  {[
                    "The software shall be used only for official business purposes.",
                    "Unauthorized sharing or misuse of software is prohibited.",
                    "Installation of any unapproved software is strictly restricted.",
                    "The company reserves the right to monitor software usage.",
                  ].map((point) => (
                    <li key={point} className="flex items-start gap-2">
                      <span className="mt-1 w-1.5 h-1.5 rounded-full bg-[#E8952A] shrink-0" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Row>
                <div>
                  <label className={labelCls}>Employee Name</label>
                  <input value={form.ackEmployeeName} onChange={(e) => set("ackEmployeeName", e.target.value)}
                    placeholder="Full name" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Signature Date</label>
                  <input type="date" value={form.ackSignatureDate} onChange={(e) => set("ackSignatureDate", e.target.value)}
                    className={inputCls} />
                </div>
              </Row>
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
          </div>

        </form>

        {!embedded && <p className="text-center text-xs text-gray-400 mt-4">Powered by CentriDesk</p>}
      </div>
    </div>
  );
}
