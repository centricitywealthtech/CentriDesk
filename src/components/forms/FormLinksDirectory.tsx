"use client";

import { useState } from "react";
import { Copy, CheckCheck, ExternalLink, Monitor, FileText } from "lucide-react";

type FormEntry = {
  name: string;
  category: string;
  description: string;
  icon: React.ReactNode;
  path: string;
};

const FORMS: FormEntry[] = [
  {
    name: "Software Installation Approval Form",
    category: "IT Department",
    description: "Request for installation of new software on company devices. Covers technical review, security review, approval matrix, and employee acknowledgement.",
    icon: <Monitor size={20} className="text-[#E8952A]" />,
    path: "/forms/it-request",
  },
];

function CopyButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  return (
    <button
      onClick={handleCopy}
      className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
        copied ? "bg-green-100 text-green-700" : "bg-[#E8952A] text-white hover:bg-[#d4841f]"
      }`}
    >
      {copied ? <><CheckCheck size={13} /> Copied!</> : <><Copy size={13} /> Copy Share Link</>}
    </button>
  );
}

export function FormLinksDirectory() {
  const origin = typeof window !== "undefined" ? window.location.origin : "";

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-[#E8952A]/10 flex items-center justify-center shrink-0">
          <FileText size={17} className="text-[#E8952A]" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-gray-800">Form Links Directory</h2>
          <p className="text-xs text-gray-400">All publicly shareable forms. Copy a link and share with employees — no login required.</p>
        </div>
      </div>

      {/* Form cards */}
      <div className="grid grid-cols-1 gap-4">
        {FORMS.map((form) => {
          const fullUrl = `${origin}${form.path}`;
          return (
            <div
              key={form.path}
              className="bg-white rounded-xl border border-gray-100 shadow-sm px-6 py-5 flex flex-col sm:flex-row sm:items-start gap-4"
            >
              {/* Icon */}
              <div className="w-10 h-10 rounded-lg bg-[#E8952A]/10 flex items-center justify-center shrink-0">
                {form.icon}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <p className="text-sm font-semibold text-gray-900">{form.name}</p>
                  <span className="px-2 py-0.5 rounded-full bg-[#E8952A]/10 text-[#E8952A] text-[10px] font-semibold uppercase tracking-wide">
                    {form.category}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mb-3">{form.description}</p>

                {/* URL row */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                    <span className="text-xs text-gray-500 truncate flex-1">{fullUrl}</span>
                    <a
                      href={fullUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-gray-400 hover:text-[#E8952A] transition-colors shrink-0"
                      title="Open form"
                    >
                      <ExternalLink size={13} />
                    </a>
                  </div>
                  <CopyButton url={fullUrl} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer note */}
      <p className="text-xs text-gray-400 text-center pt-2">
        More forms will appear here as they are added to the system.
      </p>
    </div>
  );
}
