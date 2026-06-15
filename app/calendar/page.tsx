export default function CalendarPage() {
  const calEvents = [10, 12, 14, 18, 19, 20, 21, 22, 25];
  const calDays   = Array.from({ length: 30 }, (_, i) => i + 1);
  const calOffset = 1; // June 1 2026 = Monday

  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight text-gray-800">Calendar</h1>
      <p className="text-sm text-gray-500 -mt-4">Schedule and manage academic events</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-800">📅 June 2026</h3>
            <div className="flex gap-1">
              <button className="px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-600 hover:bg-gray-50 transition-colors">‹</button>
              <button className="px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-600 hover:bg-gray-50 transition-colors">›</button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1 mb-1">
            {["S","M","T","W","T","F","S"].map((d, i) => (
              <div key={i} className="text-center text-[10px] font-bold text-gray-400 py-1">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: calOffset }, (_, i) => <div key={`empty-${i}`} />)}
            {calDays.map(d => (
              <div key={d}
                className={`text-center py-1.5 text-xs rounded-lg cursor-pointer transition-colors relative
                  ${d === 12 ? "bg-[#006aa0] text-white font-bold" : "hover:bg-gray-100 text-gray-700"}
                  ${calEvents.includes(d) && d !== 12 ? "font-semibold" : ""}`}>
                {d}
                {calEvents.includes(d) && d !== 12 && (
                  <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-orange-400" />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-800">📌 Upcoming Events</h3>
            <button className="px-3 py-1.5 rounded-lg bg-[#006aa0] text-white text-xs font-semibold hover:bg-[#005a8a] transition-colors">+ Add Event</button>
          </div>
          {[
            { icon:"📝", iconBg:"bg-red-50",   title:"Circuit Analysis Deadline", sub:"Jun 12 · Electronics",  tag:"Overdue",  tagC:"bg-red-100 text-red-700"    },
            { icon:"🎥", iconBg:"bg-blue-50",  title:"Python Live Class",         sub:"Jun 12, 3:00 PM",       tag:"Today",    tagC:"bg-blue-100 text-blue-700"   },
            { icon:"❓", iconBg:"bg-amber-50", title:"Algebra Quiz",              sub:"Jun 14, 10:00 AM",      tag:"Upcoming", tagC:"bg-amber-100 text-amber-700" },
            { icon:"📋", iconBg:"bg-red-50",   title:"Mid-term Exams Start",      sub:"Jun 18 — Jun 22",       tag:"Exam Week",tagC:"bg-red-100 text-red-700"    },
          ].map(ev => (
            <div key={ev.title} className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${ev.iconBg}`}>{ev.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-800 text-sm">{ev.title}</div>
                <div className="text-[11px] text-gray-400">{ev.sub}</div>
              </div>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${ev.tagC}`}>{ev.tag}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}