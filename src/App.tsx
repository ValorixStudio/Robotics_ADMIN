import { useEffect, useRef, useState } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import DashboardPage from "@/pages/DashboardPage";
import ComponentsPage from "@/pages/ComponentsPage";
import AnalyticsPage from "@/pages/AnalyticsPage";
import AssignmentsPage from "@/pages/AssignmentsPage";
import ResourcesPage from "@/pages/ResourcesPage";
import CoursesPage from "@/pages/CoursesPage";
import CurriculumPage from "@/pages/CurriculumPage";
import QuizzesPage from "@/pages/QuizzesPage";
import LiveclassPage from "@/pages/LiveclassPage";
import StudentsPage from "@/pages/StudentsPage";
import TeachersPage from "@/pages/TeachersPage";
import LearnerprofilePage from "@/pages/LearnerprofilePage";
import AttendancePage from "@/pages/AttendancePage";
import LeaderboardPage from "@/pages/LeaderboardPage";
import AnnouncementsPage from "@/pages/AnnouncementsPage";
import MessagesPage from "@/pages/MessagesPage";
import CalendarPage from "@/pages/CalendarPage";
import CircuitsPage from "@/pages/CircuitsPage";
import ThreeDModelPage from "@/pages/ThreeDModelPage";
import GradesPage from "@/pages/GradesPage";
import CertificatesPage from "@/pages/CertificatesPage";
import SettingsPage from "@/pages/SettingsPage";
import RoleAndPermissionPage from "@/pages/RoleAndPermissionPage";
import AdminProfilePage from "@/pages/AdminProfilePage";
import LoginPage from "@/pages/LoginPage";
import PageNotFound from "@/pages/PageNotFound";

const AUTH_STORAGE_KEY = "circuit-studio-admin-auth";

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const menuRef = useRef<HTMLDivElement>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem(AUTH_STORAGE_KEY) === "true");
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  useEffect(() => {
    const closeMenu = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setProfileMenuOpen(false);
    };
    document.addEventListener("mousedown", closeMenu);
    return () => document.removeEventListener("mousedown", closeMenu);
  }, []);

  useEffect(() => setProfileMenuOpen(false), [location.pathname]);

  const handleLogin = () => {
    localStorage.setItem(AUTH_STORAGE_KEY, "true");
    setIsAuthenticated(true);
    navigate("/", { replace: true });
  };

  const handleLogout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setIsAuthenticated(false);
    setProfileMenuOpen(false);
    navigate("/login", { replace: true });
  };

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  if (location.pathname === "/login") return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen bg-[#f4f8fb] text-gray-800 font-['Plus_Jakarta_Sans'] flex antialiased">
      <Sidebar />

      <div className="flex-1 pl-64 flex flex-col min-h-screen">
        <header className="h-[62px] bg-white/95 backdrop-blur-md border-b border-gray-200 fixed top-0 left-64 right-0 z-40 flex items-center justify-between px-7 shadow-sm">
          <div className="text-xs font-medium text-gray-500">Management</div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full px-[14px] py-[6px] w-60 focus-within:border-[#006aa0] focus-within:bg-white transition-all">
              <span className="text-xs text-gray-400">S</span>
              <input type="text" placeholder="Search name or ID..." className="bg-transparent border-none outline-none text-xs text-gray-800 w-full placeholder:text-gray-400" />
            </div>

            <div className="w-9 h-9 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-xs text-gray-600 cursor-pointer relative hover:bg-gray-100 transition-colors">
              N
              <span className="absolute top-[2px] right-[2px] w-[8px] h-[8px] bg-red-500 rounded-full border border-white" />
            </div>

            <div ref={menuRef} className="relative">
              <button
                onClick={() => setProfileMenuOpen((open) => !open)}
                aria-expanded={profileMenuOpen}
                aria-label="Open account menu"
                className="w-9 h-9 rounded-full bg-[#006aa0] flex items-center justify-center text-xs font-bold text-white shadow-sm hover:bg-[#005a8a] transition-colors"
              >
                A
              </button>

              {profileMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
                  <div className="border-b border-gray-100 px-4 py-3">
                    <div className="text-xs font-bold text-gray-800">Admin User</div>
                    <div className="mt-0.5 text-[10px] text-gray-400">admin@circuitstudio.com</div>
                  </div>
                  <div className="p-1.5">
                    <button onClick={() => navigate("/profile")} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-xs font-semibold text-gray-700 hover:bg-gray-50">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-[#006aa0]">P</span>
                      View profile
                    </button>
                    <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-xs font-semibold text-red-600 hover:bg-red-50">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-50">L</span>
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="pt-[86px] p-7 flex-1 flex flex-col gap-6">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/components" element={<ComponentsPage />} />
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/curriculum" element={<CurriculumPage />} />
            <Route path="/assignments" element={<AssignmentsPage />} />
            <Route path="/quizzes" element={<QuizzesPage />} />
            <Route path="/liveclass" element={<LiveclassPage />} />
            <Route path="/resources" element={<ResourcesPage />} />
            <Route path="/students" element={<StudentsPage />} />
            <Route path="/teachers" element={<TeachersPage />} />
            <Route path="/learnerprofile" element={<LearnerprofilePage />} />
            <Route path="/attendance" element={<AttendancePage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/announcements" element={<AnnouncementsPage />} />
            <Route path="/messages" element={<MessagesPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/circuits" element={<CircuitsPage />} />
            <Route path="/3d_model" element={<ThreeDModelPage />} />
            <Route path="/grades" element={<GradesPage />} />
            <Route path="/certificates" element={<CertificatesPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/roles-permissions" element={<RoleAndPermissionPage />} />
            <Route path="/profile" element={<AdminProfilePage />} />
            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
