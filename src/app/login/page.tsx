"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";

type Mode = "signin" | "signup";

export default function LoginPage() {
  const router = useRouter();
  const { status } = useSession();
  const [mode, setMode] = useState<Mode>("signin");

  // If already logged in, kick them to subscriptions
  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/subscriptions");
    }
  }, [status, router]);

  // Sign in
  const [siEmail, setSiEmail] = useState("");
  const [siPassword, setSiPassword] = useState("");
  const [siShowPwd, setSiShowPwd] = useState(false);
  const [siError, setSiError] = useState("");
  const [siLoading, setSiLoading] = useState(false);

  // Sign up
  const [suName, setSuName] = useState("");
  const [suEmail, setSuEmail] = useState("");
  const [suPassword, setSuPassword] = useState("");
  const [suConfirm, setSuConfirm] = useState("");
  const [suShowPwd, setSuShowPwd] = useState(false);
  const [suShowConfirm, setSuShowConfirm] = useState(false);
  const [suError, setSuError] = useState("");
  const [suSuccess, setSuSuccess] = useState(false);
  const [suLoading, setSuLoading] = useState(false);

  async function redirectByRole() {
    router.replace("/subscriptions");
  }

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setSiError("");
    setSiLoading(true);
    const result = await signIn("credentials", {
      email: siEmail,
      password: siPassword,
      redirect: false,
    });
    setSiLoading(false);
    if (result?.error) {
      setSiError("Invalid email or password.");
    } else {
      await redirectByRole();
    }
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setSuError("");
    if (suPassword !== suConfirm) {
      setSuError("Passwords do not match.");
      return;
    }
    setSuLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: suName, email: suEmail, password: suPassword }),
    });
    const data = await res.json();
    setSuLoading(false);
    if (!res.ok) {
      setSuError(data.error ?? "Registration failed.");
      return;
    }
    setSuSuccess(true);
    const result = await signIn("credentials", {
      email: suEmail,
      password: suPassword,
      redirect: false,
    });
    if (!result?.error) await redirectByRole();
    else { setMode("signin"); setSiEmail(suEmail); }
  }

  return (
    <div className="min-h-screen flex">

      {/* ── LEFT PANEL ── */}
      <div className="hidden lg:flex lg:w-[58%] relative flex-col overflow-hidden"
        style={{ background: "linear-gradient(160deg,#0f1b2d 0%,#162540 50%,#0d1a30 100%)" }}
      >
        {/* Subtle grid overlay */}
        <div className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px,transparent 1px),
                              linear-gradient(90deg,rgba(255,255,255,0.5) 1px,transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />

        {/* Radial glow */}
        <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] rounded-full opacity-10"
          style={{ background: "radial-gradient(circle,#4a90d9 0%,transparent 70%)" }}
        />

        {/* Mock dashboard card — decorative */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] opacity-20 pointer-events-none select-none">
          <div className="bg-white/10 rounded-2xl p-5 border border-white/10 backdrop-blur-sm">
            <div className="text-white text-xs font-semibold mb-3 uppercase tracking-widest opacity-60">
              Subscription Overview
            </div>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {["₹3.2L", "₹85K", "₹50K"].map((v, i) => (
                <div key={i} className="bg-white/10 rounded-lg p-3">
                  <div className="text-[10px] text-white/50 mb-1">
                    {["Annual","Monthly","One-time"][i]}
                  </div>
                  <div className="text-white text-sm font-bold">{v}</div>
                </div>
              ))}
            </div>
            {[80, 55, 35].map((w, i) => (
              <div key={i} className="mb-2">
                <div className="h-2 bg-white/10 rounded-full">
                  <div className="h-2 rounded-full bg-white/30" style={{ width: `${w}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Logo — top left */}
        <div className="relative z-10 p-8 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full border-2 border-white/80 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2a10 10 0 0 1 0 20" />
              <path d="M2 12h20" />
            </svg>
          </div>
          <div>
            <p className="text-white font-bold text-lg leading-tight">Vendor Suite</p>
            <p className="text-white/50 text-[10px] tracking-wider uppercase">Internal Platform</p>
          </div>
        </div>

        {/* Bottom welcome text */}
        <div className="relative z-10 mt-auto p-10">
          <h2 className="text-white text-4xl font-bold leading-tight mb-3">
            Welcome to<br />Vendor Suite
          </h2>
          <p className="text-white/60 text-base">
            Your subscriptions, managed in one place.
          </p>

          {/* Stats row */}
          <div className="mt-8 flex items-center gap-6">
            {[
              { label: "Vendors Tracked", value: "50+" },
              { label: "Departments", value: "10" },
              { label: "Active Users", value: "20+" },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-white text-xl font-bold">{s.value}</p>
                <p className="text-white/40 text-xs mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex-1 bg-black flex items-center justify-center px-8 py-12">
        <div className="w-full max-w-[360px]">

          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="w-8 h-8 rounded-full border-2 border-white/70 flex items-center justify-center">
              <span className="text-white text-xs font-bold">VS</span>
            </div>
            <span className="text-white font-bold">Vendor Suite</span>
          </div>

          {/* Mode heading */}
          <h1 className="text-white text-3xl font-semibold text-center mb-8">
            {mode === "signin" ? "Sign In" : "Sign Up"}
          </h1>

          {/* ── SIGN IN FORM ── */}
          {mode === "signin" && (
            <form onSubmit={handleSignIn} className="space-y-5">
              <div>
                <label className="block text-white/80 text-sm mb-2">User Name</label>
                <input
                  type="email"
                  value={siEmail}
                  onChange={(e) => setSiEmail(e.target.value)}
                  required
                  placeholder="User Name"
                  className="w-full bg-[#f0f0f0] text-gray-800 placeholder-gray-400 rounded px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#7B5541]"
                />
              </div>

              <div>
                <label className="block text-white/80 text-sm mb-2">Password</label>
                <div className="relative">
                  <input
                    type={siShowPwd ? "text" : "password"}
                    value={siPassword}
                    onChange={(e) => setSiPassword(e.target.value)}
                    required
                    placeholder="Password"
                    className="w-full bg-[#f0f0f0] text-gray-800 placeholder-gray-400 rounded px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#7B5541] pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setSiShowPwd(!siShowPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {siShowPwd ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                </div>
              </div>

              {siError && (
                <p className="text-red-400 text-xs text-center">{siError}</p>
              )}

              <button
                type="submit"
                disabled={siLoading}
                className="w-full py-3 rounded text-white text-sm font-semibold transition-opacity disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
                style={{ background: "#7B5541" }}
              >
                {siLoading && <Loader2 size={15} className="animate-spin" />}
                {siLoading ? "Signing in..." : "Login"}
              </button>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  className="text-xs underline"
                  style={{ color: "#A0785A" }}
                >
                  Forgot Username / Password
                </button>
                <button
                  type="button"
                  onClick={() => { setMode("signup"); setSuError(""); setSuSuccess(false); }}
                  className="text-xs underline"
                  style={{ color: "#A0785A" }}
                >
                  Sign Up
                </button>
              </div>
            </form>
          )}

          {/* ── SIGN UP FORM ── */}
          {mode === "signup" && (
            <>
              {suSuccess ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                    <span className="text-green-400 text-3xl">✓</span>
                  </div>
                  <p className="text-white font-semibold text-lg">Account Created!</p>
                  <p className="text-white/50 text-sm mt-1 flex items-center justify-center gap-2">
                    <Loader2 size={14} className="animate-spin" /> Signing you in…
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div>
                    <label className="block text-white/80 text-sm mb-2">Full Name</label>
                    <input
                      type="text"
                      value={suName}
                      onChange={(e) => setSuName(e.target.value)}
                      required
                      placeholder="Full Name"
                      className="w-full bg-[#f0f0f0] text-gray-800 placeholder-gray-400 rounded px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#7B5541]"
                    />
                  </div>

                  <div>
                    <label className="block text-white/80 text-sm mb-2">Email Address</label>
                    <input
                      type="email"
                      value={suEmail}
                      onChange={(e) => setSuEmail(e.target.value)}
                      required
                      placeholder="you@company.com"
                      className="w-full bg-[#f0f0f0] text-gray-800 placeholder-gray-400 rounded px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#7B5541]"
                    />
                  </div>

                  <div>
                    <label className="block text-white/80 text-sm mb-2">Password</label>
                    <div className="relative">
                      <input
                        type={suShowPwd ? "text" : "password"}
                        value={suPassword}
                        onChange={(e) => setSuPassword(e.target.value)}
                        required
                        minLength={6}
                        placeholder="Min. 6 characters"
                        className="w-full bg-[#f0f0f0] text-gray-800 placeholder-gray-400 rounded px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#7B5541] pr-11"
                      />
                      <button
                        type="button"
                        onClick={() => setSuShowPwd(!suShowPwd)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {suShowPwd ? <Eye size={16} /> : <EyeOff size={16} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-white/80 text-sm mb-2">Confirm Password</label>
                    <div className="relative">
                      <input
                        type={suShowConfirm ? "text" : "password"}
                        value={suConfirm}
                        onChange={(e) => setSuConfirm(e.target.value)}
                        required
                        placeholder="Re-enter password"
                        className={`w-full bg-[#f0f0f0] text-gray-800 placeholder-gray-400 rounded px-4 py-3 text-sm focus:outline-none focus:ring-2 pr-11 ${
                          suConfirm && suConfirm !== suPassword
                            ? "ring-2 ring-red-400 focus:ring-red-400"
                            : "focus:ring-[#7B5541]"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setSuShowConfirm(!suShowConfirm)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {suShowConfirm ? <Eye size={16} /> : <EyeOff size={16} />}
                      </button>
                    </div>
                    {suConfirm && suConfirm !== suPassword && (
                      <p className="text-red-400 text-xs mt-1">Passwords do not match</p>
                    )}
                  </div>

                  {suError && (
                    <p className="text-red-400 text-xs text-center">{suError}</p>
                  )}

                  <button
                    type="submit"
                    disabled={suLoading}
                    className="w-full py-3 rounded text-white text-sm font-semibold transition-opacity disabled:opacity-60 flex items-center justify-center gap-2 mt-1"
                    style={{ background: "#7B5541" }}
                  >
                    {suLoading && <Loader2 size={15} className="animate-spin" />}
                    {suLoading ? "Creating account..." : "Create Account"}
                  </button>

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => { setMode("signin"); setSiError(""); }}
                      className="text-xs underline"
                      style={{ color: "#A0785A" }}
                    >
                      Already have an account? Sign In
                    </button>
                  </div>
                </form>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  );
}
