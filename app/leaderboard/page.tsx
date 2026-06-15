export default function LeaderboardPage() {
  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight text-gray-800">Leaderboard</h1>
      <p className="text-sm text-gray-500 -mt-4">Top performing students this month</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-800">🏆 Overall Rankings</h3>
            <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
              {["Month","All Time"].map(t => (
                <button key={t} className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${t === "Month" ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-800"}`}>{t}</button>
              ))}
            </div>
          </div>
          {[
            { rank:"🥇", name:"Arjun Patel",  sub:"Robotics · Coding",   score:"2,840 pts", bg:"bg-indigo-500"  },
            { rank:"🥈", name:"Rohit Kumar",  sub:"Python · Electronics", score:"2,610 pts", bg:"bg-emerald-500" },
            { rank:"🥉", name:"Priya Sharma", sub:"Coding",               score:"2,205 pts", bg:"bg-purple-500"  },
            { rank:"04", name:"Sneha Rao",    sub:"Robotics",             score:"1,980 pts", bg:"bg-orange-400"  },
            { rank:"05", name:"Mohan Das",    sub:"Electronics",          score:"1,754 pts", bg:"bg-cyan-500"    },
          ].map(s => (
            <div key={s.name} className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0">
              <span className="w-7 text-sm font-bold text-gray-400 font-mono text-center">{s.rank}</span>
              <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center text-white font-bold text-xs flex-shrink-0`}>{s.name[0]}</div>
              <div className="flex-1">
                <div className="font-semibold text-gray-800 text-sm">{s.name}</div>
                <div className="text-[11px] text-gray-400">{s.sub}</div>
              </div>
              <span className="text-sm font-bold text-[#006aa0] font-mono">{s.score}</span>
            </div>
          ))}
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-gray-800 mb-4">🎖️ Badges Earned</h3>
          <div className="grid grid-cols-3 gap-3">
            {[
              { emoji:"🤖", label:"Bot Builder",   locked:false },
              { emoji:"🔥", label:"7-Day Streak",  locked:false },
              { emoji:"🧠", label:"Top Thinker",   locked:false },
              { emoji:"⚡", label:"Fast Finisher", locked:false },
              { emoji:"🏅", label:"Locked",        locked:true  },
              { emoji:"🌟", label:"Locked",        locked:true  },
            ].map(b => (
              <div key={b.label + b.emoji} className={`bg-gray-50 border border-gray-100 rounded-xl p-4 text-center ${b.locked ? "opacity-40" : ""}`}>
                <div className="text-2xl mb-1">{b.emoji}</div>
                <div className="text-[11px] font-semibold text-gray-700">{b.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}