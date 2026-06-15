import { useState } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import AdminLayout from "@/components/AdminLayout";
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
import { authToken } from "@/lib/authToken";
import { authApi } from "@/services/api";

const AUTH_STORAGE_KEY = "circuit-studio-admin-auth";

function App() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(() =>
    Boolean(authToken.get() || localStorage.getItem(AUTH_STORAGE_KEY) === "true"),
  );

  const handleLogin = () => {
    localStorage.setItem(AUTH_STORAGE_KEY, "true");
    setIsAuthenticated(true);
    navigate("/", { replace: true });
  };

  const handleLogout = () => {
    authApi.logout();
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setIsAuthenticated(false);
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

  return (
    <Routes>
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route element={<AdminLayout onLogout={handleLogout} />}>
        <Route index element={<DashboardPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="components" element={<ComponentsPage />} />
        <Route path="courses" element={<CoursesPage />} />
        <Route path="curriculum" element={<CurriculumPage />} />
        <Route path="assignments" element={<AssignmentsPage />} />
        <Route path="quizzes" element={<QuizzesPage />} />
        <Route path="liveclass" element={<LiveclassPage />} />
        <Route path="resources" element={<ResourcesPage />} />
        <Route path="students" element={<StudentsPage />} />
        <Route path="teachers" element={<TeachersPage />} />
        <Route path="learnerprofile" element={<LearnerprofilePage />} />
        <Route path="attendance" element={<AttendancePage />} />
        <Route path="leaderboard" element={<LeaderboardPage />} />
        <Route path="announcements" element={<AnnouncementsPage />} />
        <Route path="messages" element={<MessagesPage />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="circuits" element={<CircuitsPage />} />
        <Route path="3d_model" element={<ThreeDModelPage />} />
        <Route path="grades" element={<GradesPage />} />
        <Route path="certificates" element={<CertificatesPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="roles-permissions" element={<RoleAndPermissionPage />} />
        <Route path="profile" element={<AdminProfilePage />} />
        <Route path="*" element={<PageNotFound />} />
      </Route>
    </Routes>
  );
}

export default App;
