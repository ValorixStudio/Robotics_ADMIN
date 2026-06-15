import { Routes, Route } from "react-router-dom";
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
import PageNotFound from "@/pages/PageNotFound";

function App() {
  return (
    <div className="min-h-screen bg-[#f4f8fb] text-gray-800 font-['Plus_Jakarta_Sans'] flex antialiased">
      <Sidebar />

      <div className="flex-1 pl-64 flex flex-col min-h-screen">
        <header className="h-[62px] bg-white/95 backdrop-blur-md border-b border-gray-200 fixed top-0 left-64 right-0 z-40 flex items-center justify-between px-7 shadow-sm">
          <div className="text-xs font-medium text-gray-500">Management</div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full px-[14px] py-[6px] w-60 focus-within:border-[#006aa0] focus-within:bg-white transition-all">
              <span className="text-xs text-gray-400">🔍</span>
              <input
                type="text"
                placeholder="Search name or ID…"
                className="bg-transparent border-none outline-none text-xs text-gray-800 w-full placeholder:text-gray-400"
              />
            </div>

            <div className="w-9 h-9 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-xs text-gray-600 cursor-pointer relative hover:bg-gray-100 transition-colors">
              🔔
              <span className="absolute top-[2px] right-[2px] w-[8px] h-[8px] bg-red-500 rounded-full border border-white" />
            </div>

            <div className="w-9 h-9 rounded-full bg-[#006aa0] flex items-center justify-center text-xs font-bold text-white shadow-sm">A</div>
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
            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
