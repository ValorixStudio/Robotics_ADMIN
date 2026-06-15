import { useEffect, useRef, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import ThemeToggle from "@/components/ThemeToggle";

interface AdminLayoutProps {
  onLogout: () => void;
}

export default function AdminLayout({ onLogout }: AdminLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const menuRef = useRef<HTMLDivElement>(null);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  useEffect(() => {
    const closeMenu = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setProfileMenuOpen(false);
    };
    document.addEventListener("mousedown", closeMenu);
    return () => document.removeEventListener("mousedown", closeMenu);
  }, []);

  useEffect(() => setProfileMenuOpen(false), [location.pathname]);

  return (
    <div className="admin-shell min-h-screen text-gray-800 font-sans flex antialiased dark:text-zinc-100">
      <Sidebar />

      <div className="flex min-h-screen flex-1 flex-col pl-64">
        <header className="fixed left-64 right-0 top-0 z-40 flex h-[62px] items-center justify-between border-b border-gray-200 bg-white/95 px-7 shadow-sm backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/95">
          <div className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-zinc-400"><span className="h-2 w-2 rounded-full bg-[#e51b72]" /> Teachly Management</div>

          <div className="flex items-center gap-4">
            <div className="flex w-60 items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-[14px] py-[6px] transition-all focus-within:border-[#e51b72] focus-within:bg-white dark:border-zinc-700 dark:bg-zinc-900 dark:focus-within:bg-zinc-900">
              <input type="text" placeholder="Search name or ID..." className="w-full border-none bg-transparent text-xs text-gray-800 outline-none placeholder:text-gray-400 dark:text-zinc-100 dark:placeholder:text-zinc-600" />
            </div>

            <ThemeToggle />

            <div ref={menuRef} className="relative">
              <button
                onClick={() => setProfileMenuOpen((open) => !open)}
                aria-expanded={profileMenuOpen}
                aria-label="Open account menu"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-900 text-xs font-bold text-white shadow-sm ring-2 ring-[#e51b72]/20 transition-colors hover:bg-[#e51b72]"
              >
                A
              </button>

              {profileMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
                  <div className="border-b border-gray-100 px-4 py-3 dark:border-zinc-800">
                    <div className="text-xs font-bold text-gray-800 dark:text-white">Admin User</div>
                    <div className="mt-0.5 text-[10px] text-gray-400 dark:text-zinc-500">admin@teachly.in</div>
                  </div>
                  <div className="p-1.5">
                    <button onClick={() => navigate("/profile")} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:text-zinc-200 dark:hover:bg-zinc-800">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-pink-50 text-[#e51b72]">P</span>
                      View profile
                    </button>
                    <button onClick={onLogout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-xs font-semibold text-red-600 hover:bg-red-50">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-50">L</span>
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="relative flex flex-1 flex-col gap-6 overflow-hidden p-7 pt-[86px]">
          <div className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(rgba(24,24,27,0.018)_1px,transparent_1px),linear-gradient(90deg,rgba(24,24,27,0.018)_1px,transparent_1px)] bg-[size:34px_34px] dark:bg-[linear-gradient(rgba(255,255,255,0.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.018)_1px,transparent_1px)]" />
          <div className="pointer-events-none absolute -right-32 top-10 z-0 h-96 w-96 rounded-full bg-[#e51b72]/[0.055] blur-3xl dark:bg-[#e51b72]/[0.075]" />
          <div className="pointer-events-none absolute -bottom-48 left-1/4 z-0 h-96 w-96 rounded-full bg-[#f4c430]/[0.06] blur-3xl dark:bg-[#f4c430]/[0.035]" />
          <div className="relative z-10 flex flex-1 flex-col gap-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
