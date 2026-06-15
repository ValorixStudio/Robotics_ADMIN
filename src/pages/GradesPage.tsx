export default function GradesPage() {
  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight text-gray-800">Grades &amp; Reports</h1>
      <p className="text-sm text-gray-500 -mt-4">Academic performance and grade management</p>

      <div className="flex justify-end gap-3">
        <button className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 text-xs font-semibold hover:bg-gray-50 transition-colors">=ƒôÑ Export CSV</button>
        <button className="px-4 py-2 rounded-xl bg-[#e51b72] hover:bg-[#bd145c] text-white text-xs font-semibold transition-colors">=ƒôä Generate Report</button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-sm font-bold text-gray-800 mb-5">=ƒÄ» Grade Distribution</h3>
        <div className="flex items-end gap-4 h-28 px-2">
          {[
            { grade:"A+", count:18, pct:25, color:"bg-green-400"  },
            { grade:"A",  count:28, pct:40, color:"bg-green-500"  },
            { grade:"B",  count:42, pct:90, color:"bg-blue-500"   },
            { grade:"C",  count:24, pct:60, color:"bg-orange-400" },
            { grade:"D",  count:10, pct:20, color:"bg-red-400"    },
            { grade:"F",  count:4,  pct:10, color:"bg-red-300"    },
          ].map(g => (
            <div key={g.grade} className="flex flex-col items-center gap-1 flex-1">
              <div className={`w-full rounded-t-lg ${g.color}`} style={{ height: `${g.pct}%` }} />
              <span className="text-xs text-gray-500 font-medium">{g.grade}</span>
              <span className="text-[10px] font-mono text-gray-400">{g.count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="border-b border-gray-100 px-6 py-4">
          <h3 className="text-sm font-bold text-gray-800">=ƒôï Gradebook</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead><tr className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 uppercase font-semibold">
              <th className="p-4 text-left">Student</th>
              <th className="p-4 text-left">Robotics</th><th className="p-4 text-left">Python</th>
              <th className="p-4 text-left">Math</th><th className="p-4 text-left">Electronics</th>
              <th className="p-4 text-left">Avg</th><th className="p-4 text-left">Grade</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-100">
              {[
                { name:"Arjun Patel",  r:92, p:88, m:78, e:85, avg:"85.7", avgC:"text-green-600", grade:"A", gc:"bg-green-100 text-green-700" },
                { name:"Rohit Kumar",  r:85, p:91, m:84, e:79, avg:"84.7", avgC:"text-green-600", grade:"A", gc:"bg-green-100 text-green-700" },
                { name:"Priya Sharma", r:72, p:68, m:75, e:70, avg:"71.2", avgC:"text-blue-600",  grade:"B", gc:"bg-blue-100 text-blue-700"   },
                { name:"Sneha Rao",    r:78, p:74, m:65, e:71, avg:"72.0", avgC:"text-blue-600",  grade:"B", gc:"bg-blue-100 text-blue-700"   },
              ].map(s => (
                <tr key={s.name} className="hover:bg-gray-50/50">
                  <td className="p-4 font-semibold text-gray-800">{s.name}</td>
                  <td className="p-4 text-gray-600 text-xs font-mono">{s.r}</td>
                  <td className="p-4 text-gray-600 text-xs font-mono">{s.p}</td>
                  <td className="p-4 text-gray-600 text-xs font-mono">{s.m}</td>
                  <td className="p-4 text-gray-600 text-xs font-mono">{s.e}</td>
                  <td className="p-4"><b className={`text-xs ${s.avgC}`}>{s.avg}</b></td>
                  <td className="p-4"><span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${s.gc}`}>{s.grade}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
