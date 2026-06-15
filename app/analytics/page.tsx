"use client";
import { ProgressBar } from "@/app/ui";

const BUILT_IN_ROLES = [
  { name: "Student",     color: "bg-blue-100 text-blue-800",     description: "Enrolled learners"    },
  { name: "Teacher",     color: "bg-teal-100 text-teal-800",     description: "Instructors & faculty" },
  { name: "Super Admin", color: "bg-purple-100 text-purple-800", description: "Full platform access"  },
];

const USERS = [
  { role: "Student" }, { role: "Teacher" }, { role: "Student" },
  { role: "Student" }, { role: "Teacher" }, { role: "Student" },
];

export default function AnalyticsPage() {
  const totalUsers = USERS.length;

  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight text-gray-800">Platform Analytics</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-gray-700 mb-4">Role Distribution</h3>
          <div className="space-y-3">
            {BUILT_IN_ROLES.map(role => {
              const count = USERS.filter(u => u.role === role.name).length;
              const pct   = totalUsers ? Math.round((count / totalUsers) * 100) : 0;
              return (
                <div key={role.name}>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${role.color}`}>{role.name}</span>
                    <b>{count} ({pct}%)</b>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#006aa0] rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-gray-700 mb-4">Weekly User Activity</h3>
          <div className="flex items-end gap-3 h-24 pt-2">
            {[60, 80, 95, 70, 55, 35, 20].map((val, idx) => (
              <div key={idx} className="flex flex-col items-center gap-1 flex-1">
                <div className={`w-full rounded-t-md ${idx === 2 ? "bg-teal-400" : "bg-[#006aa0]"}`} style={{ height: `${val}%` }} />
                <span className="text-[10px] text-gray-400 font-bold mt-1">{["M","T","W","T","F","S","S"][idx]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm lg:col-span-2">
          <h3 className="text-sm font-bold text-gray-700 mb-4">All Roles Summary</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  {["Role","Type","Description","Users"].map(h => (
                    <th key={h} className="p-3 text-left font-bold uppercase tracking-wider text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {BUILT_IN_ROLES.map(role => {
                  const count = USERS.filter(u => u.role === role.name).length;
                  return (
                    <tr key={role.name} className="hover:bg-gray-50">
                      <td className="p-3"><span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${role.color}`}>{role.name}</span></td>
                      <td className="p-3"><span className="text-[10px] font-semibold px-2 py-0.5 rounded border border-gray-200 text-gray-500 bg-gray-50">Built-in</span></td>
                      <td className="p-3 text-gray-500">{role.description}</td>
                      <td className="p-3 font-mono font-bold text-gray-700">{count}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm lg:col-span-2">
          <h3 className="text-sm font-bold text-gray-700 mb-4">📊 Subject Performance</h3>
          <ProgressBar label="Robotics"    value={88} color="bg-gradient-to-r from-blue-500 to-cyan-400" />
          <ProgressBar label="Coding"      value={82} color="bg-gradient-to-r from-green-500 to-emerald-400" />
          <ProgressBar label="Mathematics" value={71} color="bg-gradient-to-r from-orange-400 to-amber-300" />
          <ProgressBar label="Electronics" value={65} color="bg-gradient-to-r from-purple-500 to-fuchsia-400" />
          <ProgressBar label="AI & ML"     value={60} color="bg-gradient-to-r from-rose-500 to-pink-400" />
        </div>
      </div>
    </>
  );
}