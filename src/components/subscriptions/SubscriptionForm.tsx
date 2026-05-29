"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, X, Building2, ReceiptText } from "lucide-react";
import { SUBSCRIPTION_TYPES } from "@/lib/utils";

type FormData = {
  vendor: string;
  department: string;
  useFor: string;
  servicesProviding: string;
  nature: string;
  subscriptionAmount: string;
  subscriptionType: string;
  date: string;
  renewalDate: string;
  requestedBy: string;
  approvedBy: string;
  relation: string;
};

const DEPARTMENTS = [
  "Technology", "Finance", "HR", "Marketing", "Operations",
  "Legal", "Sales", "Product", "Design", "Business", "Other",
];

type Props = {
  initialData?: Partial<FormData>;
  editId?: string;
};

function Field({
  label,
  required,
  children,
  className,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-[#E8952A]/30 focus:border-[#E8952A] transition-all";

export function SubscriptionForm({ initialData, editId }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState<FormData>({
    vendor: initialData?.vendor ?? "",
    department: initialData?.department ?? "",
    useFor: initialData?.useFor ?? "",
    servicesProviding: initialData?.servicesProviding ?? "",
    nature: initialData?.nature ?? "",
    subscriptionAmount: initialData?.subscriptionAmount ?? "",
    subscriptionType: initialData?.subscriptionType ?? "ANNUAL",
    date: initialData?.date ?? "",
    renewalDate: initialData?.renewalDate ?? "",
    requestedBy: initialData?.requestedBy ?? "",
    approvedBy: initialData?.approvedBy ?? "",
    relation: initialData?.relation ?? "",
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
      // clear renewal date when switching to one-time
      ...(name === "subscriptionType" && value === "ONE_TIME" ? { renewalDate: "" } : {}),
    }));
  }

  const isOneTime = form.subscriptionType === "ONE_TIME";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);

    const url = editId ? `/api/subscriptions/${editId}` : "/api/subscriptions";
    const method = editId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setSaving(false);

    if (!res.ok) {
      setError("Failed to save. Please try again.");
      return;
    }

    router.push("/subscriptions");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      {/* ── VENDOR INFORMATION ── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Section header */}
        <div className="flex items-center gap-2.5 px-6 py-4 border-b border-gray-100 bg-gray-50/60">
          <div className="w-7 h-7 rounded-lg bg-[#E8952A]/10 flex items-center justify-center">
            <Building2 size={14} className="text-[#E8952A]" />
          </div>
          <h3 className="text-sm font-semibold text-gray-800">Vendor Information</h3>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5">
          <Field label="Vendor Name" required>
            <input
              name="vendor"
              value={form.vendor}
              onChange={handleChange}
              required
              placeholder="e.g. Futurris Digital Pvt Ltd"
              className={inputCls}
            />
          </Field>

          <Field label="Department" required>
            <select
              name="department"
              value={form.department}
              onChange={handleChange}
              required
              className={inputCls}
            >
              <option value="">Select Department</option>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </Field>

          <Field label="Use For" required>
            <input
              name="useFor"
              value={form.useFor}
              onChange={handleChange}
              required
              placeholder="e.g. Design Vendor"
              className={inputCls}
            />
          </Field>

          <Field label="Nature" required>
            <input
              name="nature"
              value={form.nature}
              onChange={handleChange}
              required
              placeholder="e.g. Platform design services"
              className={inputCls}
            />
          </Field>

          <Field label="Services Providing" required>
            <input
              name="servicesProviding"
              value={form.servicesProviding}
              onChange={handleChange}
              required
              placeholder="e.g. UX design for Platform"
              className={inputCls}
            />
          </Field>

          <Field label="Requested By">
            <input
              name="requestedBy"
              value={form.requestedBy}
              onChange={handleChange}
              placeholder="e.g. John Doe"
              className={inputCls}
            />
          </Field>

          <Field label="Approved By">
            <input
              name="approvedBy"
              value={form.approvedBy}
              onChange={handleChange}
              placeholder="e.g. Jane Smith"
              className={inputCls}
            />
          </Field>

          <Field label="Relation">
            <input
              name="relation"
              value={form.relation}
              onChange={handleChange}
              disabled={!form.approvedBy.trim()}
              placeholder={form.approvedBy.trim() ? "e.g. CTO, Manager" : "Fill Approved By first"}
              className={`${inputCls} ${!form.approvedBy.trim() ? "opacity-40 cursor-not-allowed bg-gray-100" : ""}`}
            />
            {!form.approvedBy.trim() && (
              <p className="text-xs text-gray-400 mt-1">Available once Approved By is filled</p>
            )}
          </Field>
        </div>
      </div>

      {/* ── SUBSCRIPTION DETAILS ── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2.5 px-6 py-4 border-b border-gray-100 bg-gray-50/60">
          <div className="w-7 h-7 rounded-lg bg-[#E8952A]/10 flex items-center justify-center">
            <ReceiptText size={14} className="text-[#E8952A]" />
          </div>
          <h3 className="text-sm font-semibold text-gray-800">Subscription Details</h3>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5">
          <Field label="Amount (₹)" required>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">₹</span>
              <input
                name="subscriptionAmount"
                value={form.subscriptionAmount}
                onChange={handleChange}
                required
                type="number"
                min="0"
                step="0.01"
                placeholder="0"
                className={`${inputCls} pl-7`}
              />
            </div>
          </Field>

          <Field label="Subscription Type" required>
            <select
              name="subscriptionType"
              value={form.subscriptionType}
              onChange={handleChange}
              required
              className={inputCls}
            >
              {SUBSCRIPTION_TYPES.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </Field>

          <Field label="Start Date" required>
            <input
              name="date"
              value={form.date}
              onChange={handleChange}
              required
              type="date"
              className={inputCls}
            />
          </Field>

          <Field label="Renewal Date" required={!isOneTime}>
            <input
              name="renewalDate"
              value={form.renewalDate}
              onChange={handleChange}
              type="date"
              required={!isOneTime}
              disabled={isOneTime}
              className={`${inputCls} ${isOneTime ? "opacity-40 cursor-not-allowed bg-gray-100" : ""}`}
            />
            {isOneTime && (
              <p className="text-xs text-gray-400 mt-1">Not applicable for one-time payments</p>
            )}
          </Field>

        </div>
      </div>

      {/* ── ACTIONS ── */}
      <div className="flex items-center justify-end gap-3 pt-1">
        <button
          type="button"
          onClick={() => router.back()}
          className="btn-secondary"
        >
          <X size={14} />
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="btn-primary"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          {saving ? "Saving..." : editId ? "Update Record" : "Save Record"}
        </button>
      </div>
    </form>
  );
}
