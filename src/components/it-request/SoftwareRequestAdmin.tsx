"use client";

import { useState, useEffect, useCallback } from "react";
import { Filter, X, Loader2, CheckCircle2, XCircle, Eye, Pencil } from "lucide-react";
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
  techCompatibility: string;
  techAntivirusScan: string;
  techLicenseVerif: string;
  techVendorValidation: string;
  techAdminRights: string;
  techRemarks: string;
  secDlpCompliance: string;
  secRiskAssessment: string;
  secApprovalStatus: string;
  secRemarks: string;
  approvalMatrix: string;
  instCompletedBy: string;
  instDate: string;
  instSoftwareInstalled: string;
  instLicenseUpdated: string;
  instAssetUpdated: string;
  instRemarks: string;
  ackEmployeeName: string;
  ackSignatureDate: string;
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

          {/* Section 4 */}
          <div>
            <p className="text-xs font-bold text-[#E8952A] uppercase tracking-widest mb-3">4. Technical Review</p>
            <table className="w-full text-sm border border-gray-100 rounded-lg overflow-hidden mb-3">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 w-3/4">Check Point</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {([
                  ["Compatibility Check Completed", row.techCompatibility],
                  ["Antivirus / Security Scan Completed", row.techAntivirusScan],
                  ["License Verification Completed", row.techLicenseVerif],
                  ["Vendor Validation Completed", row.techVendorValidation],
                  ["Admin Rights Required", row.techAdminRights],
                ] as [string, string][]).map(([label, val]) => (
                  <tr key={label}>
                    <td className="px-3 py-2 text-sm text-gray-700">{label}</td>
                    <td className="px-3 py-2">
                      {val ? (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${val === "Yes" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{val}</span>
                      ) : (
                        <span className="text-gray-300 italic text-xs">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Field label="IT Remarks" value={row.techRemarks} />
          </div>

          {/* Section 5 */}
          <div>
            <p className="text-xs font-bold text-[#E8952A] uppercase tracking-widest mb-3">5. Information Security Review</p>
            <table className="w-full text-sm border border-gray-100 rounded-lg overflow-hidden mb-3">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 w-3/4">Field</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {([
                  ["DLP / Compliance Review Completed", row.secDlpCompliance],
                  ["Security Risk Assessment Completed", row.secRiskAssessment],
                ] as [string, string][]).map(([label, val]) => (
                  <tr key={label}>
                    <td className="px-3 py-2 text-sm text-gray-700">{label}</td>
                    <td className="px-3 py-2">
                      {val ? (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${val === "Yes" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{val}</span>
                      ) : (
                        <span className="text-gray-300 italic text-xs">—</span>
                      )}
                    </td>
                  </tr>
                ))}
                <tr>
                  <td className="px-3 py-2 text-sm text-gray-700">Approved / Rejected</td>
                  <td className="px-3 py-2 text-sm text-gray-700">{row.secApprovalStatus || <span className="text-gray-300 italic">—</span>}</td>
                </tr>
              </tbody>
            </table>
            <Field label="Security Team Remarks" value={row.secRemarks} />
          </div>

          {/* Section 6 */}
          <div>
            <p className="text-xs font-bold text-[#E8952A] uppercase tracking-widest mb-3">6. Approval Matrix</p>
            <table className="w-full text-sm border border-gray-100 rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Approval Level</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Name</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Approval Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {(() => {
                  const matrix = row.approvalMatrix ? JSON.parse(row.approvalMatrix) : [];
                  return matrix.length > 0 ? matrix.map((r: { level: string; name: string; status: string }) => (
                    <tr key={r.level}>
                      <td className="px-3 py-2 text-sm text-gray-700 whitespace-nowrap">{r.level}</td>
                      <td className="px-3 py-2 text-sm text-gray-700">{r.name || <span className="text-gray-300 italic">—</span>}</td>
                      <td className="px-3 py-2">
                        {r.status ? (
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${r.status === "Approved" ? "bg-green-100 text-green-700" : r.status === "Rejected" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>{r.status}</span>
                        ) : <span className="text-gray-300 italic text-xs">—</span>}
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan={3} className="px-3 py-3 text-xs text-gray-300 italic text-center">No data</td></tr>
                  );
                })()}
              </tbody>
            </table>
          </div>

          {/* Section 7 */}
          <div>
            <p className="text-xs font-bold text-[#E8952A] uppercase tracking-widest mb-3">7. Installation Status</p>
            <table className="w-full text-sm border border-gray-100 rounded-lg overflow-hidden mb-3">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 w-1/2">Field</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                <tr>
                  <td className="px-3 py-2 text-sm text-gray-700">Installation Completed By</td>
                  <td className="px-3 py-2 text-sm text-gray-700">{row.instCompletedBy || <span className="text-gray-300 italic">—</span>}</td>
                </tr>
                <tr>
                  <td className="px-3 py-2 text-sm text-gray-700">Installation Date</td>
                  <td className="px-3 py-2 text-sm text-gray-700">{row.instDate || <span className="text-gray-300 italic">—</span>}</td>
                </tr>
                {([
                  ["Software Successfully Installed", row.instSoftwareInstalled],
                  ["License Key Updated", row.instLicenseUpdated],
                  ["Asset Inventory Updated", row.instAssetUpdated],
                ] as [string, string][]).map(([label, val]) => (
                  <tr key={label}>
                    <td className="px-3 py-2 text-sm text-gray-700">{label}</td>
                    <td className="px-3 py-2">
                      {val ? (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${val === "Yes" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{val}</span>
                      ) : <span className="text-gray-300 italic text-xs">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Field label="Final Remarks" value={row.instRemarks} />
          </div>

          {/* Section 8 */}
          <div>
            <p className="text-xs font-bold text-[#E8952A] uppercase tracking-widest mb-3">8. Employee Acknowledgement</p>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Employee Name" value={row.ackEmployeeName} />
              <Field label="Signature Date" value={row.ackSignatureDate} />
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 shrink-0 flex justify-end">
          <button onClick={onClose} className="btn-primary">Close</button>
        </div>
      </div>
    </div>
  );
}

const inputCls = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-[#E8952A]/30 focus:border-[#E8952A] transition-all";
const ynCls = "border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#E8952A]/30 focus:border-[#E8952A] transition-all";

function EditModal({ row, onClose, onSaved }: { row: Row; onClose: () => void; onSaved: (updated: Row) => void }) {
  const [form, setForm] = useState({ ...row });
  const [approvalRows, setApprovalRows] = useState<{ level: string; name: string; status: string }[]>(
    row.approvalMatrix ? JSON.parse(row.approvalMatrix) : []
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function set(key: keyof Row, val: string) {
    setForm((prev) => ({ ...prev, [key]: val }));
  }

  function setApproval(i: number, key: "name" | "status", val: string) {
    setApprovalRows((prev) => prev.map((r, idx) => idx === i ? { ...r, [key]: val } : r));
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/software-request/${row.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, approvalMatrix: approvalRows }),
      });
      if (res.ok) {
        const updated = await res.json();
        onSaved({ ...updated, approvalMatrix: JSON.stringify(approvalRows) });
        onClose();
      } else {
        setError("Failed to save. Please try again.");
      }
    } catch { setError("Failed to save."); }
    finally { setSaving(false); }
  }

  const Label = ({ children }: { children: React.ReactNode }) => (
    <p className="text-xs text-gray-400 mb-0.5">{children}</p>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <h3 className="text-sm font-semibold text-gray-900">Edit Request — {row.requestedBy}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
        </div>

        <div className="px-6 py-5 overflow-y-auto space-y-6">

          {/* Section 1 */}
          <div>
            <p className="text-xs font-bold text-[#E8952A] uppercase tracking-widest mb-3">1. Request Details</p>
            <div className="grid grid-cols-2 gap-3">
              {([["Requested By", "requestedBy"], ["Employee ID", "employeeId"], ["Department", "department"], ["Designation", "designation"], ["Email ID", "emailId"], ["Request Date", "requestDate"]] as [string, keyof Row][]).map(([label, key]) => (
                <div key={key}><Label>{label}</Label><input value={form[key] as string} onChange={(e) => set(key, e.target.value)} className={inputCls} /></div>
              ))}
            </div>
          </div>

          {/* Section 2 */}
          <div>
            <p className="text-xs font-bold text-[#E8952A] uppercase tracking-widest mb-3">2. Software Details</p>
            <div className="grid grid-cols-2 gap-3">
              {([["Software Name", "softwareName"], ["Software Version", "softwareVersion"], ["Vendor / Publisher", "vendorName"], ["Software Category", "softwareCategory"], ["License Type", "licenseType"], ["Licenses Required", "licensesRequired"], ["Installation On", "installationOn"]] as [string, keyof Row][]).map(([label, key]) => (
                <div key={key}><Label>{label}</Label><input value={form[key] as string} onChange={(e) => set(key, e.target.value)} className={inputCls} /></div>
              ))}
            </div>
          </div>

          {/* Section 3 */}
          <div>
            <p className="text-xs font-bold text-[#E8952A] uppercase tracking-widest mb-3">3. Business Justification</p>
            <div className="space-y-3">
              <div><Label>Purpose of Installation</Label><textarea value={form.purposeOfInstallation} onChange={(e) => set("purposeOfInstallation", e.target.value)} rows={3} className={inputCls + " resize-none"} /></div>
              <div><Label>Business Impact if Not Installed</Label><textarea value={form.businessImpact} onChange={(e) => set("businessImpact", e.target.value)} rows={3} className={inputCls + " resize-none"} /></div>
            </div>
          </div>

          {/* Section 4 */}
          <div>
            <p className="text-xs font-bold text-[#E8952A] uppercase tracking-widest mb-3">4. Technical Review</p>
            <table className="w-full text-sm border border-gray-100 rounded-lg overflow-hidden mb-3">
              <tbody className="divide-y divide-gray-50">
                {([["Compatibility Check Completed", "techCompatibility"], ["Antivirus/Security Scan Completed", "techAntivirusScan"], ["License Verification Completed", "techLicenseVerif"], ["Vendor Validation Completed", "techVendorValidation"], ["Admin Rights Required", "techAdminRights"]] as [string, keyof Row][]).map(([label, key]) => (
                  <tr key={key}><td className="px-3 py-2 text-sm text-gray-700 w-3/4">{label}</td><td className="px-3 py-2"><select value={form[key] as string} onChange={(e) => set(key, e.target.value)} className={ynCls}><option value="">—</option><option>Yes</option><option>No</option></select></td></tr>
                ))}
              </tbody>
            </table>
            <div><Label>IT Remarks</Label><textarea value={form.techRemarks} onChange={(e) => set("techRemarks", e.target.value)} rows={3} className={inputCls + " resize-none"} /></div>
          </div>

          {/* Section 5 */}
          <div>
            <p className="text-xs font-bold text-[#E8952A] uppercase tracking-widest mb-3">5. Information Security Review</p>
            <table className="w-full text-sm border border-gray-100 rounded-lg overflow-hidden mb-3">
              <tbody className="divide-y divide-gray-50">
                {([["DLP / Compliance Review Completed", "secDlpCompliance"], ["Security Risk Assessment Completed", "secRiskAssessment"]] as [string, keyof Row][]).map(([label, key]) => (
                  <tr key={key}><td className="px-3 py-2 text-sm text-gray-700 w-3/4">{label}</td><td className="px-3 py-2"><select value={form[key] as string} onChange={(e) => set(key, e.target.value)} className={ynCls}><option value="">—</option><option>Yes</option><option>No</option></select></td></tr>
                ))}
                <tr><td className="px-3 py-2 text-sm text-gray-700">Approved / Rejected</td><td className="px-3 py-2"><input value={form.secApprovalStatus} onChange={(e) => set("secApprovalStatus", e.target.value)} className={inputCls} /></td></tr>
              </tbody>
            </table>
            <div><Label>Security Team Remarks</Label><textarea value={form.secRemarks} onChange={(e) => set("secRemarks", e.target.value)} rows={3} className={inputCls + " resize-none"} /></div>
          </div>

          {/* Section 6 */}
          <div>
            <p className="text-xs font-bold text-[#E8952A] uppercase tracking-widest mb-3">6. Approval Matrix</p>
            <table className="w-full text-sm border border-gray-100 rounded-lg overflow-hidden">
              <thead><tr className="bg-gray-50 border-b border-gray-100"><th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Approval Level</th><th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Name</th><th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Status</th></tr></thead>
              <tbody className="divide-y divide-gray-50">
                {approvalRows.map((r, i) => (
                  <tr key={r.level}>
                    <td className="px-3 py-2 text-sm text-gray-700 whitespace-nowrap">{r.level}</td>
                    <td className="px-3 py-2"><input value={r.name} onChange={(e) => setApproval(i, "name", e.target.value)} placeholder="Name" className={inputCls} /></td>
                    <td className="px-3 py-2"><select value={r.status} onChange={(e) => setApproval(i, "status", e.target.value)} className={ynCls}><option value="">—</option><option>Approved</option><option>Rejected</option><option>Pending</option></select></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Section 7 */}
          <div>
            <p className="text-xs font-bold text-[#E8952A] uppercase tracking-widest mb-3">7. Installation Status</p>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div><Label>Installation Completed By</Label><input value={form.instCompletedBy} onChange={(e) => set("instCompletedBy", e.target.value)} className={inputCls} /></div>
              <div><Label>Installation Date</Label><input type="date" value={form.instDate} onChange={(e) => set("instDate", e.target.value)} className={inputCls} /></div>
            </div>
            <table className="w-full text-sm border border-gray-100 rounded-lg overflow-hidden mb-3">
              <tbody className="divide-y divide-gray-50">
                {([["Software Successfully Installed", "instSoftwareInstalled"], ["License Key Updated", "instLicenseUpdated"], ["Asset Inventory Updated", "instAssetUpdated"]] as [string, keyof Row][]).map(([label, key]) => (
                  <tr key={key}><td className="px-3 py-2 text-sm text-gray-700 w-3/4">{label}</td><td className="px-3 py-2"><select value={form[key] as string} onChange={(e) => set(key, e.target.value)} className={ynCls}><option value="">—</option><option>Yes</option><option>No</option></select></td></tr>
                ))}
              </tbody>
            </table>
            <div><Label>Final Remarks</Label><textarea value={form.instRemarks} onChange={(e) => set("instRemarks", e.target.value)} rows={3} className={inputCls + " resize-none"} /></div>
          </div>

          {/* Section 8 */}
          <div>
            <p className="text-xs font-bold text-[#E8952A] uppercase tracking-widest mb-3">8. Employee Acknowledgement</p>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Employee Name</Label><input value={form.ackEmployeeName} onChange={(e) => set("ackEmployeeName", e.target.value)} className={inputCls} /></div>
              <div><Label>Signature Date</Label><input type="date" value={form.ackSignatureDate} onChange={(e) => set("ackSignatureDate", e.target.value)} className={inputCls} /></div>
            </div>
          </div>

          {error && <p className="text-red-500 text-xs">{error}</p>}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 shrink-0 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={saving}
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-[#E8952A] text-white hover:bg-[#d4841f] transition-colors disabled:opacity-60 flex items-center gap-2">
            {saving && <Loader2 size={13} className="animate-spin" />}
            {saving ? "Saving…" : "Save Changes"}
          </button>
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
  const [editRow, setEditRow] = useState<Row | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

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
      {editRow && <EditModal row={editRow} onClose={() => setEditRow(null)} onSaved={(updated) => { setRows((prev) => prev.map((r) => r.id === updated.id ? updated : r)); showToast("Request updated successfully"); }} />}

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
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => setDetailRow(row)}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors">
                          <Eye size={13} /> View
                        </button>
                        <button onClick={() => setEditRow(row)}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-[#E8952A] hover:bg-[#E8952A]/10 transition-colors">
                          <Pencil size={13} /> Edit
                        </button>
                      </div>
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
