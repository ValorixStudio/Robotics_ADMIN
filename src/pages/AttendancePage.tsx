import { StatCard } from "@/components";

export default function AttendancePage() {
  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight text-gray-800">Attendance</h1>
      <p className="text-sm text-gray-500 -mt-4">Track and manage student attendance</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        <StatCard label="Present Today"  value="112" delta="of 126 students" deltaColor="text-gray-500"   icon="Γ£à" iconBg="bg-green-50"  />
        <StatCard label="Absent Today"   value="14"  delta="5 notified"      deltaColor="text-red-500"    icon="Γ¥î" iconBg="bg-red-50"    />
        <StatCard label="Avg Attendance" value="88%" delta="This month"                                   icon="≡ƒôè" iconBg="bg-blue-50"   />
        <StatCard label="At Risk"        value="7"   delta="Below 75%"       deltaColor="text-orange-500" icon="ΓÜá∩╕Å" iconBg="bg-orange-50" />
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-sm font-bold text-gray-800 mb-4">≡ƒöÑ Attendance Heatmap ΓÇö June 2026</h3>
        <div className="flex gap-1.5 mb-2">
          {["Mon","Tue","Wed","Thu","Fri"].map(d => (
            <div key={d} className="w-6 text-[10px] text-center text-gray-400 font-semibold">{d}</div>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5 max-w-[160px]">
          {Array.from({ length: 25 }, (_, i) => {
            const opacityVals = [0.1, 0.2, 0.35, 0.55, 0.7, 0.8, 1];
            const op = opacityVals[i % opacityVals.length];
            return (
              <div key={i} className="w-6 h-6 rounded cursor-pointer hover:scale-110 transition-transform"
                style={{ backgroundColor: `rgba(34,197,94,${op})` }}
                title={`${Math.round(op * 100)}% attendance`} />
            );
          })}
        </div>
        <div className="flex items-center gap-2 mt-4 text-xs text-gray-400">
          <span>Low</span>
          {[0.1, 0.35, 0.65, 1].map(op => (
            <div key={op} className="w-4 h-4 rounded" style={{ backgroundColor: `rgba(34,197,94,${op})` }} />
          ))}
          <span>High</span>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-800">≡ƒôï Today&apos;s Register</h3>
          <button className="px-3 py-1.5 rounded-lg bg-[#006aa0] text-white text-xs font-semibold hover:bg-[#005a8a] transition-colors">Mark Attendance</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead><tr className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 uppercase font-semibold">
              <th className="p-4 text-left">Student</th><th className="p-4 text-left">Grade</th>
              <th className="p-4 text-left">Check-in</th><th className="p-4 text-left">Status</th><th className="p-4"></th>
            </tr></thead>
            <tbody className="divide-y divide-gray-100">
              {[
                { name:"Arjun Patel",  grade:10, checkin:"08:45 AM", status:"Present", sc:"bg-green-100 text-green-700", bg:"bg-indigo-500"  },
                { name:"Priya Sharma", grade:9,  checkin:"ΓÇö",        status:"Absent",  sc:"bg-red-100 text-red-700",     bg:"bg-purple-500"  },
                { name:"Rohit Kumar",  grade:11, checkin:"09:02 AM", status:"Present", sc:"bg-green-100 text-green-700", bg:"bg-emerald-500" },
              ].map(s => (
                <tr key={s.name} className="hover:bg-gray-50/50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center text-white font-bold text-xs flex-shrink-0`}>{s.name[0]}</div>
                      <span className="font-semibold text-gray-800">{s.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-gray-500 text-xs">{s.grade}</td>
                  <td className="p-4 text-gray-500 font-mono text-xs">{s.checkin}</td>
                  <td className="p-4"><span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${s.sc}`}>{s.status}</span></td>
                  <td className="p-4 text-right"><button className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-600 hover:bg-gray-50 transition-colors">Edit</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
