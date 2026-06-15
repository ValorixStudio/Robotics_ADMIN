import { Routes, Route } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import DashboardPage from "@/components/DashboardPage";
import ComponentsPage from "@/pages/ComponentsPage";
import PlaceholderPage from "@/pages/PlaceholderPage";
import PageNotFound from "@/pages/PageNotFound";

const ROUTES = [
  { path: "/analytics", label: "Analytics", description: "View key platform metrics and activity summaries." },
  { path: "/courses", label: "Courses", description: "Manage and review your available courses." },
  { path: "/curriculum", label: "Curriculum", description: "Organize your curriculum and learning tracks." },
  { path: "/assignments", label: "Assignments", description: "Review and grade assignments." },
  { path: "/quizzes", label: "Quizzes", description: "Create and manage quizzes." },
  { path: "/liveclass", label: "Live Classes", description: "Plan and monitor live sessions." },
  { path: "/resources", label: "Resources", description: "Upload and share learning resources." },
  { path: "/students", label: "Students", description: "View student rosters and performance." },
  { path: "/teachers", label: "Teachers", description: "Manage teacher accounts and schedules." },
  { path: "/learnerprofile", label: "Learner Profile", description: "Inspect individual learner progress." },
  { path: "/attendance", label: "Attendance", description: "Track attendance and participation." },
  { path: "/leaderboard", label: "Leaderboard", description: "See top performers across the platform." },
  { path: "/announcements", label: "Announcements", description: "Send platform-wide announcements." },
  { path: "/messages", label: "Messages", description: "Handle inbox messages and notifications." },
  { path: "/calendar", label: "Calendar", description: "View the course and event calendar." },
  { path: "/circuits", label: "Circuits", description: "Browse the circuits component library." },
  { path: "/3d_model", label: "3D Models", description: "Access the 3D model library and viewer." },
  { path: "/grades", label: "Grades & Reports", description: "Open grade reports and analytics." },
  { path: "/certificates", label: "Certificates", description: "Issue certificates and credential badges." },
  { path: "/settings", label: "Settings", description: "Configure dashboard and account settings." },
];

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
            <Route path="/components" element={<ComponentsPage />} />
            {ROUTES.map(route => (
              <Route
                key={route.path}
                path={route.path}
                element={<PlaceholderPage title={route.label} description={route.description} />}
              />
            ))}
            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
