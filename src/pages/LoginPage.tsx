import { useState } from "react";

interface LoginPageProps {
  onLogin: () => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState("admin@circuitstudio.com");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const submitLogin = (event: React.FormEvent) => {
    event.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Enter your email and password to continue.");
      return;
    }
    onLogin();
  };

  return (
    <main className="min-h-screen bg-[#f4f8fb] p-5 flex items-center justify-center">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-xl lg:grid-cols-[1.05fr_1fr]">
        <section className="hidden bg-[#006aa0] p-12 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-xl font-bold">CS</div>
            <h1 className="mt-8 text-3xl font-bold leading-tight">Manage learning with confidence.</h1>
            <p className="mt-4 max-w-sm text-sm leading-6 text-white/70">Access courses, students, analytics, roles, and the complete Circuit Studio workspace.</p>
          </div>
          <p className="text-xs text-white/60">Circuit Studio Admin Dashboard</p>
        </section>

        <section className="p-7 sm:p-12">
          <div className="mx-auto max-w-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-sm font-bold text-[#006aa0] lg:hidden">CS</div>
            <p className="mt-8 text-[11px] font-bold uppercase tracking-[0.18em] text-[#006aa0]">Welcome back</p>
            <h2 className="mt-2 text-2xl font-bold text-gray-900">Sign in to your account</h2>
            <p className="mt-2 text-sm text-gray-500">Use your administrator credentials to continue.</p>

            <form onSubmit={submitLogin} className="mt-8 space-y-5">
              <label className="block">
                <span className="mb-1.5 block text-xs font-bold text-gray-600">Email address</span>
                <input type="email" value={email} onChange={(event) => { setEmail(event.target.value); setError(""); }} placeholder="admin@example.com" className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#006aa0]" />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-bold text-gray-600">Password</span>
                <div className="flex rounded-xl border border-gray-200 focus-within:border-[#006aa0]">
                  <input type={showPassword ? "text" : "password"} value={password} onChange={(event) => { setPassword(event.target.value); setError(""); }} placeholder="Enter your password" className="min-w-0 flex-1 rounded-xl px-4 py-3 text-sm outline-none" />
                  <button type="button" onClick={() => setShowPassword((show) => !show)} className="px-4 text-xs font-semibold text-gray-500 hover:text-[#006aa0]">{showPassword ? "Hide" : "Show"}</button>
                </div>
              </label>
              {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600">{error}</p>}
              <button type="submit" className="w-full rounded-xl bg-[#006aa0] px-4 py-3 text-sm font-bold text-white shadow-sm hover:bg-[#005a8a]">Sign in</button>
            </form>

            <p className="mt-6 text-center text-[11px] text-gray-400">Demo login: use any non-empty password.</p>
          </div>
        </section>
      </div>
    </main>
  );
}
