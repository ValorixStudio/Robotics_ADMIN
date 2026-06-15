import { Link } from "react-router-dom";

export default function StudentsPage() {
  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight text-gray-800">Students</h1>
      <p className="text-sm text-gray-500 -mt-4">Manage all enrolled learners</p>

      <div className="flex items-center justify-between">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          {["All","Active","Inactive"].map(t => (
            <button key={t} className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${t === "All" ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-800"}`}>{t}</button>
          ))}
        </div>
        <button className="px-4 py-2 rounded-xl bg-[#006aa0] hover:bg-[#005a8a] text-white text-xs font-semibold transition-colors">+ Add Student</button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead><tr className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 uppercase font-semibold">
              <th className="p-4 text-left">Student</th><th className="p-4 text-left">Grade</th>
              <th className="p-4 text-left">Courses</th><th className="p-4 text-left">Score</th>
              <th className="p-4 text-left">Attendance</th><th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Action</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-100">
              {[
                { name:"Arjun Patel",  id:"STU12345", grade:10, courses:3, score:"92%", scoreC:"text-green-600", att:"95%", attC:"bg-green-100 text-green-700", status:"Active",   stC:"bg-green-100 text-green-700", bg:"bg-indigo-500"  },
                { name:"Priya Sharma", id:"STU12346", grade:9,  courses:2, score:"71%", scoreC:"text-orange-500",att:"82%", attC:"bg-amber-100 text-amber-700",  status:"Active",   stC:"bg-green-100 text-green-700", bg:"bg-purple-500"  },
                { name:"Rohit Kumar",  id:"STU12347", grade:11, courses:4, score:"88%", scoreC:"text-green-600", att:"91%", attC:"bg-green-100 text-green-700",  status:"Active",   stC:"bg-green-100 text-green-700", bg:"bg-emerald-500" },
                { name:"Sneha Rao",    id:"STU12348", grade:10, courses:2, score:"79%", scoreC:"text-orange-500",att:"78%", attC:"bg-amber-100 text-amber-700",  status:"Inactive", stC:"bg-amber-100 text-amber-700", bg:"bg-orange-500"  },
              ].map(s => (
                <tr key={s.id} className="hover:bg-gray-50/50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center text-white font-bold text-xs flex-shrink-0`}>{s.name[0]}</div>
                      <div>
                        <div className="font-semibold text-gray-800">{s.name}</div>
                        <div className="text-[10px] font-mono text-gray-400">{s.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-gray-600 text-xs">{s.grade}</td>
                  <td className="p-4 text-gray-600 text-xs">{s.courses}</td>
                  <td className="p-4"><b className={`text-xs ${s.scoreC}`}>{s.score}</b></td>
                  <td className="p-4"><span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${s.attC}`}>{s.att}</span></td>
                  <td className="p-4"><span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${s.stC}`}>{s.status}</span></td>
                  <td className="p-4">
                    <Link to="/learnerprofile" className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-600 hover:bg-gray-50 transition-colors">Profile</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
