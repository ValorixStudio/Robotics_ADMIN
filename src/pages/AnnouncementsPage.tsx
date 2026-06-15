export default function AnnouncementsPage() {
  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight text-gray-800">Announcements</h1>
      <p className="text-sm text-gray-500 -mt-4">Post and manage school-wide messages</p>

      <div className="flex justify-end">
        <button className="px-4 py-2 rounded-xl bg-[#e51b72] hover:bg-[#bd145c] text-white text-xs font-semibold transition-colors">+ New Announcement</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-4">
          {[
            { border:"border-l-red-400",   title:"GÜán+Å Mid-term Exams: June 18GÇô22",  body:"All students must carry their ID cards. Exam hall tickets will be issued on June 15. No electronic devices allowed in examination halls.", meta:"Admin -+ Jun 9, 2026 -+ 126 students", tag:"Urgent", tagC:"bg-red-100 text-red-700"    },
            { border:"border-l-green-400", title:"=ƒîP Summer Robotics Workshop",     body:"Registration open for July batch. Limited seats available. Students with 80%+ scores in Robotics 101 get priority.", meta:"Admin -+ Jun 6, 2026 -+ 48 students",  tag:"Info",   tagC:"bg-green-100 text-green-700" },
            { border:"border-l-blue-400",  title:"=ƒôÜ New Resource Library Live",    body:"Over 200 study materials, video lectures, and practice papers are now available in the resource library.", meta:"Admin -+ Jun 3, 2026 -+ All students",  tag:"Update", tagC:"bg-blue-100 text-blue-700"   },
          ].map(a => (
            <div key={a.title} className={`bg-white border-l-4 ${a.border} border border-gray-200 rounded-r-xl p-5 shadow-sm`}>
              <div className="font-bold text-gray-800 text-sm mb-2">{a.title}</div>
              <p className="text-xs text-gray-500 leading-relaxed mb-3">{a.body}</p>
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-gray-400 font-mono">{a.meta}</span>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${a.tagC}`}>{a.tag}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-gray-800 mb-4">=ƒôè Reach Stats</h3>
          {[
            { label:"Total Announcements", value:"18",  vc:"text-gray-800"   },
            { label:"Avg Read Rate",        value:"84%", vc:"text-green-600"  },
            { label:"Urgent Notices",       value:"3",   vc:"text-red-600"    },
            { label:"This Month",           value:"5",   vc:"text-gray-800"   },
          ].map(s => (
            <div key={s.label} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0 text-xs">
              <span className="text-gray-500">{s.label}</span>
              <b className={s.vc}>{s.value}</b>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
