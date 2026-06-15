"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  id: string;
  label: string;
  icon: string;
  badge?: string;
  href: string;
}

const NAV_SECTIONS: { label: string; items: NavItem[] }[] = [
  {
    label: "Overview",
    items: [
      { id: "dashboard", label: "Dashboard", icon: "⊞", href: "/" },
      { id: "analytics", label: "Analytics",  icon: "📈", href: "/analytics" },
    ],
  },
  {
    label: "Academic",
    items: [
      { id: "courses",     label: "Courses",      icon: "📚", href: "/courses",     badge: "24" },
      { id: "curriculum",  label: "Curriculum",   icon: "📋", href: "/curriculum"              },
      { id: "assignments", label: "Assignments",  icon: "📝", href: "/assignments", badge: "8" },
      { id: "quizzes",     label: "Quizzes",      icon: "❓", href: "/quizzes"                 },
      { id: "liveclass",   label: "Live Classes", icon: "🎥", href: "/liveclass",   badge: "2" },
      { id: "resources",   label: "Resources",    icon: "🗂️", href: "/resources"               },
    ],
  },
  {
    label: "People",
    items: [
      { id: "students",       label: "Students",        icon: "👩‍🎓", href: "/students",       badge: "126" },
      { id: "teachers",       label: "Teachers",        icon: "👨‍🏫", href: "/teachers"                    },
      { id: "learnerprofile", label: "Learner Profile", icon: "🧠", href: "/learnerprofile"               },
      { id: "attendance",     label: "Attendance",      icon: "✅", href: "/attendance"                   },
      { id: "leaderboard",    label: "Leaderboard",     icon: "🏆", href: "/leaderboard"                  },
    ],
  },
  {
    label: "Communication",
    items: [
      { id: "announcements", label: "Announcements", icon: "📢", href: "/announcements"          },
      { id: "messages",      label: "Messages",      icon: "💬", href: "/messages", badge: "3"   },
      { id: "calendar",      label: "Calendar",      icon: "📅", href: "/calendar"               },
    ],
  },
  {
    label: "Components",
    items: [
      { id: "circuits",  label: "Circuits",  icon: "🔧", href: "/circuits", badge: "Manage"  },
      { id: "3d-models", label: "3D Models", icon: "📦", href: "/3d_models",     badge: "Library" },
    ],
  },
  {
    label: "Admin",
    items: [
      { id: "grades",       label: "Grades & Reports", icon: "🎯", href: "/grades"       },
      { id: "certificates", label: "Certificates",     icon: "🏅", href: "/certificates" },
      { id: "settings",     label: "Settings",         icon: "⚙️", href: "/settings"     },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-64 h-screen bg-white border-r border-gray-200 fixed top-0 left-0 z-50 flex flex-col shadow-sm overflow-hidden">
      <div className="flex flex-col flex-1 overflow-y-auto">

        {/* Brand */}
        <div className="p-5 flex items-center gap-3 border-b border-gray-100 bg-[#006aa0] text-white shrink-0">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-xl shadow-sm">
            🎓
          </div>
          <div>
            <div className="text-sm font-bold tracking-tight">Circuit Studio</div>
            <div className="text-[10px] text-white/70">Admin Dashboard</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3">
          {NAV_SECTIONS.map(section => (
            <div key={section.label} className="mb-1">
              <div className="px-[18px] pt-3 pb-1.5 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                {section.label}
              </div>
              {section.items.map(item => {
                const active = isActive(item.href);
                return (
                  <Link key={item.id} href={item.href} className="block">
                    <span
                      className={`w-full flex items-center gap-[9px] px-[18px] py-[10px] text-xs font-semibold border-l-4 transition-all
                      ${active
                        ? "bg-blue-50 text-[#006aa0] border-[#006aa0]"
                        : "text-gray-600 border-transparent hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      <span className="text-base w-5 text-center flex-shrink-0">{item.icon}</span>
                      <span className="flex-1">{item.label}</span>
                      {item.badge && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                          {item.badge}
                        </span>
                      )}
                    </span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* Footer */}
      <div className="p-[18px] border-t border-gray-100 flex items-center gap-[10px] bg-gray-50 shrink-0">
        <div className="w-[34px] h-[34px] rounded-full bg-[#006aa0] flex items-center justify-center font-bold text-xs text-white">
          A
        </div>
        <div>
          <div className="text-xs font-bold text-gray-800">Admin User</div>
          <div className="text-[10px] text-gray-400 font-medium">Super Admin</div>
        </div>
      </div>
    </aside>
  );
}