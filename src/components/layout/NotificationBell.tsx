"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Bell, X, CalendarClock, ClipboardCheck, Monitor } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type ExpiringRecord = {
  id: string;
  vendor: string;
  renewalDate: string;
  subscriptionType: string;
  department: string;
};

type FormNotif = {
  id: string;
  message: string;
  trackingId: string;
  createdAt: string;
  read: boolean;
};

type ITReqNotif = {
  id: string;
  message: string;
  softwareRequestId: string;
  createdAt: string;
  read: boolean;
};

type Tab = "renewal" | "requests" | "it";

function daysUntil(dateStr: string): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function urgencyColor(days: number) {
  if (days <= 3) return "text-red-500 bg-red-50 border-red-100";
  if (days <= 7) return "text-orange-500 bg-orange-50 border-orange-100";
  return "text-yellow-600 bg-yellow-50 border-yellow-100";
}

function daysLabel(days: number) {
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  return `In ${days} days`;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function NotificationBell() {
  const router = useRouter();
  const [renewals, setRenewals] = useState<ExpiringRecord[]>([]);
  const [formNotifs, setFormNotifs] = useState<FormNotif[]>([]);
  const [itNotifs, setItNotifs] = useState<ITReqNotif[]>([]);
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("renewal");
  const ref = useRef<HTMLDivElement>(null);

  const fetchRenewals = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) setRenewals(await res.json());
    } catch { /* ignore */ }
  }, []);

  const fetchFormNotifs = useCallback(async () => {
    try {
      const res = await fetch("/api/form-notifications");
      if (res.ok) setFormNotifs(await res.json());
    } catch { /* ignore */ }
  }, []);

  const fetchItNotifs = useCallback(async () => {
    try {
      const res = await fetch("/api/it-request-notifications");
      if (res.ok) setItNotifs(await res.json());
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    fetchRenewals();
    fetchFormNotifs();
    fetchItNotifs();
    const r = setInterval(fetchRenewals, 5 * 60 * 1000);
    const f = setInterval(fetchFormNotifs, 30 * 1000);
    const i = setInterval(fetchItNotifs, 30 * 1000);
    return () => { clearInterval(r); clearInterval(f); clearInterval(i); };
  }, [fetchRenewals, fetchFormNotifs, fetchItNotifs]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  async function handleFormNotifClick(notif: FormNotif) {
    await fetch(`/api/form-notifications/${notif.id}`, { method: "PATCH" });
    setFormNotifs((prev) => prev.filter((n) => n.id !== notif.id));
    setOpen(false);
    router.push(`/tracking`);
  }

  async function handleItNotifClick(notif: ITReqNotif) {
    await fetch(`/api/it-request-notifications/${notif.id}`, { method: "PATCH" });
    setItNotifs((prev) => prev.filter((n) => n.id !== notif.id));
    setOpen(false);
    router.push(`/it-request`);
  }

  const totalCount = renewals.length + formNotifs.length + itNotifs.length;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        title="Notifications"
        className="relative p-1 text-gray-400 hover:text-white transition-colors"
      >
        <Bell size={16} />
        {totalCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center leading-none">
            {totalCount > 9 ? "9+" : totalCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-9 w-80 bg-[#1C1C1E] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 pt-3 pb-0">
            <span className="text-white text-xs font-semibold">Notifications</span>
            <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-white">
              <X size={14} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 px-4 pt-2 pb-0 border-b border-white/10">
            <button
              onClick={() => setTab("renewal")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium rounded-t transition-colors border-b-2 -mb-px ${
                tab === "renewal" ? "text-[#E8952A] border-[#E8952A]" : "text-gray-400 border-transparent hover:text-gray-200"
              }`}
            >
              <CalendarClock size={11} />
              Renewal
              {renewals.length > 0 && (
                <span className="bg-red-500 text-white text-[8px] font-bold px-1 py-0.5 rounded-full leading-none">
                  {renewals.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setTab("requests")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium rounded-t transition-colors border-b-2 -mb-px ${
                tab === "requests" ? "text-[#E8952A] border-[#E8952A]" : "text-gray-400 border-transparent hover:text-gray-200"
              }`}
            >
              <ClipboardCheck size={11} />
              Requests
              {formNotifs.length > 0 && (
                <span className="bg-red-500 text-white text-[8px] font-bold px-1 py-0.5 rounded-full leading-none">
                  {formNotifs.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setTab("it")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium rounded-t transition-colors border-b-2 -mb-px ${
                tab === "it" ? "text-[#E8952A] border-[#E8952A]" : "text-gray-400 border-transparent hover:text-gray-200"
              }`}
            >
              <Monitor size={11} />
              IT Requests
              {itNotifs.length > 0 && (
                <span className="bg-red-500 text-white text-[8px] font-bold px-1 py-0.5 rounded-full leading-none">
                  {itNotifs.length}
                </span>
              )}
            </button>
          </div>

          {/* Content */}
          <div className="max-h-72 overflow-y-auto">
            {tab === "renewal" && (
              renewals.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <CalendarClock size={24} className="text-gray-600 mx-auto mb-2" />
                  <p className="text-gray-500 text-xs">No renewals due in the next 2 weeks</p>
                </div>
              ) : (
                renewals.map((rec) => {
                  const days = daysUntil(rec.renewalDate);
                  return (
                    <Link
                      key={rec.id}
                      href={`/subscriptions/${rec.id}/edit`}
                      onClick={() => {
                        setRenewals((prev) => prev.filter((r) => r.id !== rec.id));
                        setOpen(false);
                      }}
                      className="flex items-start gap-3 px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <div className={`mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold border ${urgencyColor(days)} shrink-0`}>
                        {daysLabel(days)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-white text-xs font-medium truncate">{rec.vendor}</p>
                        <p className="text-gray-400 text-[11px] truncate">{rec.department}</p>
                      </div>
                    </Link>
                  );
                })
              )
            )}

            {tab === "requests" && (
              formNotifs.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <ClipboardCheck size={24} className="text-gray-600 mx-auto mb-2" />
                  <p className="text-gray-500 text-xs">No new request notifications</p>
                </div>
              ) : (
                formNotifs.map((notif) => (
                  <button
                    key={notif.id}
                    onClick={() => handleFormNotifClick(notif)}
                    className="w-full text-left flex items-start gap-3 px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <div className="w-2 h-2 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-white text-xs leading-snug">{notif.message}</p>
                      <p className="text-gray-500 text-[10px] mt-0.5">{timeAgo(notif.createdAt)}</p>
                    </div>
                  </button>
                ))
              )
            )}

            {tab === "it" && (
              itNotifs.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <Monitor size={24} className="text-gray-600 mx-auto mb-2" />
                  <p className="text-gray-500 text-xs">No new IT request notifications</p>
                </div>
              ) : (
                itNotifs.map((notif) => (
                  <button
                    key={notif.id}
                    onClick={() => handleItNotifClick(notif)}
                    className="w-full text-left flex items-start gap-3 px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <div className="w-2 h-2 rounded-full bg-[#E8952A] mt-1.5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-white text-xs leading-snug">{notif.message}</p>
                      <p className="text-gray-500 text-[10px] mt-0.5">{timeAgo(notif.createdAt)}</p>
                    </div>
                  </button>
                ))
              )
            )}
          </div>

          {tab === "renewal" && renewals.length > 0 && (
            <div className="px-4 py-2 border-t border-white/10">
              <p className="text-gray-500 text-[10px] text-center">Click a vendor to review &amp; update</p>
            </div>
          )}
          {tab === "requests" && formNotifs.length > 0 && (
            <div className="px-4 py-2 border-t border-white/10">
              <p className="text-gray-500 text-[10px] text-center">Click a notification to go to Form Tracking</p>
            </div>
          )}
          {tab === "it" && itNotifs.length > 0 && (
            <div className="px-4 py-2 border-t border-white/10">
              <p className="text-gray-500 text-[10px] text-center">Click a notification to go to IT Requests</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
