import { useState } from "react";
import axios from "axios";
import BrandLogo from "@/components/BrandLogo";
import ThemeToggle from "@/components/ThemeToggle";
import { authApi } from "@/services/api";

interface LoginPageProps {
  onLogin: () => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState("admin@teachly.in");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Enter your email and password to continue.");
      return;
    }
    setIsSubmitting(true);
    setError("");

    try {
      await authApi.login({ email: email.trim(), password });
      onLogin();
    } catch (requestError) {
      const message = axios.isAxiosError<{ message?: string }>(requestError)
        ? requestError.response?.data?.message
        : undefined;
      setError(message ?? "Unable to sign in. Please check your credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f8f6f7] p-5 dark:bg-zinc-950">
      <ThemeToggle floating />
      <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[#e51b72]/10 blur-3xl" />
      <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-[#f4c430]/15 blur-3xl" />
      <div className="relative grid w-full max-w-4xl overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-2xl shadow-black/10 dark:border-zinc-800 dark:bg-zinc-900 lg:grid-cols-[1.05fr_1fr]">
        <section className="relative hidden overflow-hidden bg-gradient-to-br from-zinc-800 via-zinc-950 to-black p-12 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute -right-20 top-14 h-56 w-56 rounded-full border border-[#e51b72]/30" />
          <div className="absolute -right-10 top-24 h-40 w-40 rounded-full border border-[#f4c430]/20" />
          <div>
            <BrandLogo light />
            <div className="mt-12 h-1 w-16 rounded-full bg-gradient-to-r from-[#f4c430] to-[#e51b72]" />
            <h1 className="mt-6 text-3xl font-bold leading-tight">Smarter education starts with better control.</h1>
            <p className="mt-4 max-w-sm text-sm leading-6 text-white/60">Manage learners, courses, insights, and access from one focused Teachly workspace.</p>
          </div>
          <p className="text-xs uppercase tracking-[0.2em] text-white/35">Teachly Administration</p>
        </section>

        <section className="p-7 sm:p-12">
          <div className="mx-auto max-w-sm">
            <div className="lg:hidden"><BrandLogo compact /></div>
            <p className="mt-8 text-[11px] font-bold uppercase tracking-[0.18em] text-[#e51b72]">Welcome back</p>
            <h2 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">Sign in to your account</h2>
            <p className="mt-2 text-sm text-gray-500 dark:text-zinc-400">Use your administrator credentials to continue.</p>

            <form onSubmit={submitLogin} className="mt-8 space-y-5">
              <label className="block">
                <span className="mb-1.5 block text-xs font-bold text-gray-600 dark:text-zinc-300">Email address</span>
                <input type="email" value={email} onChange={(event) => { setEmail(event.target.value); setError(""); }} placeholder="admin@example.com" className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#e51b72] dark:border-zinc-700 dark:bg-zinc-950 dark:text-white" />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-bold text-gray-600 dark:text-zinc-300">Password</span>
                <div className="flex rounded-xl border border-gray-200 focus-within:border-[#e51b72] dark:border-zinc-700 dark:bg-zinc-950">
                  <input type={showPassword ? "text" : "password"} value={password} onChange={(event) => { setPassword(event.target.value); setError(""); }} placeholder="Enter your password" className="min-w-0 flex-1 rounded-xl bg-transparent px-4 py-3 text-sm outline-none dark:text-white" />
                  <button type="button" onClick={() => setShowPassword((show) => !show)} className="px-4 text-xs font-semibold text-gray-500 hover:text-[#e51b72]">{showPassword ? "Hide" : "Show"}</button>
                </div>
              </label>
              {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600">{error}</p>}
              <button type="submit" disabled={isSubmitting} className="w-full rounded-xl bg-zinc-950 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-black/10 transition-all hover:bg-[#e51b72] disabled:cursor-not-allowed disabled:opacity-60">{isSubmitting ? "Signing in..." : "Sign in"}</button>
            </form>

            <p className="mt-6 text-center text-[11px] text-gray-400">Use your Teachly administrator credentials.</p>
          </div>
        </section>
      </div>
    </main>
  );
}
