import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import BrandLogo from "@/components/BrandLogo";

type IconName = "home" | "chart" | "book" | "users" | "message" | "tool" | "shield" | "course" | "clipboard" | "file" | "quiz" | "video" | "folder" | "student" | "teacher" | "profile" | "check" | "trophy" | "bell" | "chat" | "calendar" | "circuit" | "cube" | "grade" | "certificate" | "lock" | "settings";

interface NavItem {
  id: string;
  label: string;
  icon: IconName;
  badge?: string;
  href: string;
}

interface NavGroup {
  id: string;
  label: string;
  description: string;
  icon: IconName;
  items: NavItem[];
}

const OVERVIEW_LINKS: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: "home", href: "/" },
  { id: "analytics", label: "Insights & Analytics", icon: "chart", href: "/analytics" },
];

const NAV_GROUPS: NavGroup[] = [
  {
    id: "academic",
    label: "Learning Management",
    description: "Courses and activities",
    icon: "book",
    items: [
      { id: "courses", label: "Courses", icon: "course", href: "/courses", badge: "24" },
      { id: "curriculum", label: "Curriculum", icon: "clipboard", href: "/curriculum" },
      { id: "assignments", label: "Assignments", icon: "file", href: "/assignments", badge: "8" },
      { id: "quizzes", label: "Quizzes", icon: "quiz", href: "/quizzes" },
      { id: "liveclass", label: "Live Classes", icon: "video", href: "/liveclass", badge: "2" },
      { id: "resources", label: "Resource Library", icon: "folder", href: "/resources" },
    ],
  },
  {
    id: "people",
    label: "People & Progress",
    description: "Learners and faculty",
    icon: "users",
    items: [
      { id: "students", label: "Students", icon: "student", href: "/students", badge: "126" },
      { id: "teachers", label: "Teachers", icon: "teacher", href: "/teachers" },
      { id: "learnerprofile", label: "Learner Profiles", icon: "profile", href: "/learnerprofile" },
      { id: "attendance", label: "Attendance", icon: "check", href: "/attendance" },
      { id: "leaderboard", label: "Leaderboard", icon: "trophy", href: "/leaderboard" },
    ],
  },
  {
    id: "communication",
    label: "Engagement Hub",
    description: "Updates and conversations",
    icon: "message",
    items: [
      { id: "announcements", label: "Announcements", icon: "bell", href: "/announcements" },
      { id: "messages", label: "Messages", icon: "chat", href: "/messages", badge: "3" },
      { id: "calendar", label: "Calendar", icon: "calendar", href: "/calendar" },
    ],
  },
  {
    id: "components",
    label: "Lab & Assets",
    description: "Build and manage models",
    icon: "tool",
    items: [
      { id: "circuits", label: "Circuit Library", icon: "circuit", href: "/circuits" },
      { id: "3d-models", label: "3D Model Library", icon: "cube", href: "/3d_model" },
    ],
  },
  {
    id: "admin",
    label: "Control Center",
    description: "Reports and access",
    icon: "shield",
    items: [
      { id: "grades", label: "Grades & Reports", icon: "grade", href: "/grades" },
      { id: "certificates", label: "Certificates", icon: "certificate", href: "/certificates" },
      { id: "roles", label: "Roles & Permissions", icon: "lock", href: "/roles-permissions" },
      { id: "settings", label: "Platform Settings", icon: "settings", href: "/settings" },
    ],
  },
];

const ICON_PATHS: Record<IconName, React.ReactNode> = {
  home: <><path d="m3 11 9-8 9 8" /><path d="M5 10v10h14V10M9 20v-6h6v6" /></>,
  chart: <><path d="M4 19V9M10 19V5M16 19v-7M22 19H2" /></>,
  book: <><path d="M4 5.5A3.5 3.5 0 0 1 7.5 2H11v18H7.5A3.5 3.5 0 0 0 4 23V5.5Z" /><path d="M20 5.5A3.5 3.5 0 0 0 16.5 2H13v18h3.5A3.5 3.5 0 0 1 20 23V5.5Z" /></>,
  users: <><circle cx="9" cy="8" r="3" /><path d="M3 20v-2a6 6 0 0 1 12 0v2M16 4a3 3 0 0 1 0 6M17 14a5 5 0 0 1 4 5v1" /></>,
  message: <><path d="M4 4h16v12H8l-4 4V4Z" /><path d="M8 9h8M8 12h5" /></>,
  tool: <><path d="m14 6 4-4 4 4-4 4M14 6 3 17l4 4 11-11" /></>,
  shield: <><path d="M12 3 5 6v5c0 4.5 2.8 8 7 10 4.2-2 7-5.5 7-10V6l-7-3Z" /><path d="m9 12 2 2 4-4" /></>,
  course: <><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M8 7h8M8 11h6" /></>,
  clipboard: <><rect x="5" y="4" width="14" height="17" rx="2" /><path d="M9 4V2h6v2M8 9h8M8 13h8M8 17h5" /></>,
  file: <><path d="M6 2h8l4 4v16H6V2Z" /><path d="M14 2v5h5M9 13h6M9 17h4" /></>,
  quiz: <><circle cx="12" cy="12" r="10" /><path d="M9.5 9a2.5 2.5 0 1 1 4 2c-1 .7-1.5 1.2-1.5 2.5M12 17h.01" /></>,
  video: <><rect x="3" y="5" width="14" height="14" rx="2" /><path d="m17 10 4-3v10l-4-3" /></>,
  folder: <><path d="M3 6h7l2 2h9v11H3V6Z" /></>,
  student: <><path d="m3 8 9-5 9 5-9 5-9-5Z" /><path d="M7 11v5c3 2 7 2 10 0v-5M21 8v6" /></>,
  teacher: <><circle cx="8" cy="7" r="3" /><path d="M2 21v-3a6 6 0 0 1 12 0v3M15 4h7v10h-5M18 8h2" /></>,
  profile: <><circle cx="12" cy="8" r="4" /><path d="M4 22a8 8 0 0 1 16 0" /></>,
  check: <><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M8 2v4M16 2v4M3 9h18m-13 5 2 2 5-5" /></>,
  trophy: <><path d="M8 4h8v5a4 4 0 0 1-8 0V4ZM10 13v4M14 13v4M8 21h8M7 5H3v2a4 4 0 0 0 5 4M17 5h4v2a4 4 0 0 1-5 4" /></>,
  bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></>,
  chat: <><path d="M4 4h16v13H8l-4 4V4Z" /><path d="M8 9h8M8 13h6" /></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M8 3v4M16 3v4M3 10h18" /></>,
  circuit: <><circle cx="5" cy="5" r="2" /><circle cx="19" cy="5" r="2" /><circle cx="5" cy="19" r="2" /><circle cx="19" cy="19" r="2" /><path d="M7 5h5v14h5M12 10h7" /></>,
  cube: <><path d="m12 2 9 5-9 5-9-5 9-5Z" /><path d="m3 7 9 5 9-5M3 7v10l9 5 9-5V7M12 12v10" /></>,
  grade: <><path d="M4 3h16v18H4V3Z" /><path d="M8 8h8M8 12h5M8 16h3" /></>,
  certificate: <><circle cx="12" cy="9" r="6" /><path d="m8 14-1 8 5-3 5 3-1-8" /></>,
  lock: <><rect x="4" y="10" width="16" height="12" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3M12 15v3" /></>,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.6v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z" /></>,
};

function Icon({ name, className = "h-4 w-4" }: { name: IconName; className?: string }) {
  return <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{ICON_PATHS[name]}</svg>;
}

function Chevron({ open }: { open: boolean }) {
  return <svg viewBox="0 0 20 20" className={`h-4 w-4 transition-transform duration-200 ${open ? "rotate-90" : "rotate-0"}`} fill="none" stroke="currentColor" strokeWidth="2"><path d="m7.5 5 5 5-5 5" /></svg>;
}

export default function Sidebar() {
  const location = useLocation();
  const activeGroup = NAV_GROUPS.find((group) => group.items.some((item) => item.href === location.pathname))?.id;
  const [openGroups, setOpenGroups] = useState<string[]>(activeGroup ? [activeGroup] : []);

  useEffect(() => {
    if (!activeGroup) return;
    setOpenGroups((current) => current.includes(activeGroup) ? current : [...current, activeGroup]);
  }, [activeGroup]);

  const toggleGroup = (groupId: string) => {
    setOpenGroups((current) => current.includes(groupId) ? [] : [groupId]);
  };

  return (
    <aside className="fixed left-0 top-0 z-50 flex h-screen w-64 flex-col overflow-hidden border-r border-[#3a2932] bg-[#241c21] text-white shadow-[6px_0_30px_rgba(24,12,19,0.22)]">
      <div className="flex flex-1 flex-col overflow-y-auto">
        <div className="relative shrink-0 overflow-hidden border-b border-[#eadfe5] bg-gradient-to-br from-white to-[#f7edf2] p-4 text-zinc-900">
          <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-[#e51b72]/10" />
          <div className="absolute bottom-0 left-0 h-[3px] w-full bg-gradient-to-r from-[#f4c430] via-[#e51b72] to-transparent" />
          <div className="relative"><BrandLogo compact /></div>
        </div>

        <nav className="flex-1 px-2.5 py-3">
          <div className="mb-1 flex items-center gap-2 px-2.5 pb-1 pt-1.5">
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#9b7d8d]">Overview</span>
            <span className="h-px flex-1 bg-white/10" />
          </div>
          <div className="space-y-1">
            {OVERVIEW_LINKS.map((item) => (
              <NavLink key={item.id} to={item.href} end={item.href === "/"} className={({ isActive }) => `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all ${isActive ? "bg-[#e51b72] text-white shadow-md shadow-black/20" : "text-[#c2adb8] hover:bg-white/[0.07] hover:text-white"}`}>
                {({ isActive }) => <><span className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${isActive ? "bg-white/15" : "bg-white/[0.07] text-[#9f8693] group-hover:text-white"}`}><Icon name={item.icon} /></span><span className="flex-1">{item.label}</span>{isActive && <span className="h-1.5 w-1.5 rounded-full bg-[#f4c430]" />}</>}
              </NavLink>
            ))}
          </div>

          <div className="mx-1.5 my-3 grid grid-cols-3 divide-x divide-white/10 rounded-xl border border-white/10 bg-white/[0.055] px-1 py-2.5 shadow-inner">
            {[
              { value: "126", label: "Learners" },
              { value: "24", label: "Courses" },
              { value: "3", label: "Unread" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-[11px] font-bold text-white">{stat.value}</div>
                <div className="mt-0.5 text-[7px] font-semibold uppercase tracking-wide text-[#907482]">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="mb-1 flex items-center gap-2 px-2.5 pb-1 pt-1.5">
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#9b7d8d]">Manage Workspace</span>
            <span className="h-px flex-1 bg-white/10" />
          </div>
          <div className="space-y-1">
            {NAV_GROUPS.map((group) => {
              const isOpen = openGroups.includes(group.id);
              const hasActiveChild = group.id === activeGroup;
              return (
                <div key={group.id} className="relative">
                  {hasActiveChild && <span className="absolute -left-2.5 top-2.5 h-8 w-[3px] rounded-r-full bg-gradient-to-b from-[#f4c430] to-[#e51b72]" />}
                  <button onClick={() => toggleGroup(group.id)} aria-expanded={isOpen} className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all ${hasActiveChild ? "bg-white/10 text-white shadow-sm shadow-black/20" : "text-[#c2adb8] hover:bg-white/[0.07] hover:text-white"}`}>
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${hasActiveChild ? "bg-[#e51b72] text-white shadow-sm" : "bg-white/[0.07] text-[#9f8693] group-hover:text-white"}`}><Icon name={group.icon} /></span>
                    <span className="min-w-0 flex-1"><span className="block truncate text-xs font-bold">{group.label}</span><span className={`mt-0.5 block truncate text-[9px] font-medium ${hasActiveChild ? "text-[#d8c7d0]" : "text-[#806572]"}`}>{group.description}</span></span>
                    <span className={hasActiveChild ? "text-[#f4c430]" : "text-[#806572]"}><Chevron open={isOpen} /></span>
                  </button>

                  {isOpen && (
                    <div className="relative ml-7 mt-1 space-y-0.5 border-l border-white/10 py-0.5 pl-3">
                      {group.items.map((item) => (
                        <NavLink key={item.id} to={item.href} className={({ isActive }) => `group relative flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[11px] font-semibold transition-all ${isActive ? "bg-[#e51b72]/20 text-[#ff78b3]" : "text-[#947986] hover:bg-white/[0.06] hover:text-white"}`}>
                          {({ isActive }) => <>{isActive && <span className="absolute -left-[14px] h-2 w-2 rounded-full border-2 border-[#241c21] bg-[#e51b72]" />}<span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${isActive ? "bg-[#e51b72] text-white" : "text-[#806572] group-hover:text-white"}`}><Icon name={item.icon} className="h-3.5 w-3.5" /></span><span className="min-w-0 flex-1 truncate">{item.label}</span>{item.badge && <span className={`rounded-full px-1.5 py-0.5 text-[8px] font-bold ${isActive ? "bg-[#f4c430] text-black" : "bg-white/[0.07] text-[#9b7d8d]"}`}>{item.badge}</span>}</>}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </nav>
      </div>

      <div className="border-t border-white/10 bg-[#1c1519] p-3">
      <NavLink to="/profile" className={({ isActive }) => `flex shrink-0 items-center gap-3 rounded-xl border p-3 transition-all ${isActive ? "border-[#e51b72]/50 bg-[#e51b72]/10" : "border-white/10 bg-white/5 hover:border-[#e51b72]/40 hover:bg-white/10"}`}>
        <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-[#e51b72] text-xs font-bold text-white shadow-sm">A<span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#171717] bg-[#f4c430]" /></div>
        <div className="min-w-0 flex-1"><div className="truncate text-xs font-bold text-white">Admin User</div><div className="mt-1 inline-flex rounded-full bg-[#e51b72]/15 px-1.5 py-0.5 text-[7px] font-bold uppercase tracking-wide text-[#ff5ca2]">Super Admin</div></div>
        <span className="text-zinc-600"><Chevron open={false} /></span>
      </NavLink>
      </div>
    </aside>
  );
}
