export default function CurriculumPage() {
  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight text-gray-800">Curriculum Builder</h1>
      <p className="text-sm text-gray-500 -mt-4">Design and structure learning paths</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-800">=ƒôï Robotics 101 GÇö Modules</h3>
            <button className="px-3 py-1.5 rounded-lg bg-[#e51b72] text-white text-xs font-semibold hover:bg-[#bd145c] transition-colors">+ Add Module</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead><tr className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 uppercase">
                <th className="p-3 text-left">#</th><th className="p-3 text-left">Module Title</th>
                <th className="p-3 text-left">Lessons</th><th className="p-3 text-left">Status</th><th className="p-3"></th>
              </tr></thead>
              <tbody className="divide-y divide-gray-100">
                {[
                  { n:1, title:"Intro to Robotics",       lessons:4, status:"Live",   sc:"bg-green-100 text-green-700" },
                  { n:2, title:"Sensors & Actuators",     lessons:6, status:"Live",   sc:"bg-green-100 text-green-700" },
                  { n:3, title:"Arduino Programming",     lessons:8, status:"Review", sc:"bg-blue-100 text-blue-700"   },
                  { n:4, title:"Building Your First Bot", lessons:5, status:"Draft",  sc:"bg-amber-100 text-amber-700" },
                ].map(m => (
                  <tr key={m.n} className="hover:bg-gray-50">
                    <td className="p-3 text-gray-400 font-mono text-xs">{m.n}</td>
                    <td className="p-3 font-semibold text-gray-800">{m.title}</td>
                    <td className="p-3 text-gray-500">{m.lessons}</td>
                    <td className="p-3"><span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${m.sc}`}>{m.status}</span></td>
                    <td className="p-3 text-right"><button className="text-xs font-semibold text-[#e51b72] hover:underline">Edit</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-gray-800 mb-5">=ƒù¦n+Å Learning Path</h3>
          {[
            { n:1, title:"Foundations",       sub:"Theory + Basics", status:"Done",        sc:"bg-green-100 text-green-700", dot:"bg-blue-500"   },
            { n:2, title:"Hands-on Projects", sub:"Build & Test",    status:"In Progress", sc:"bg-amber-100 text-amber-700", dot:"bg-orange-400" },
            { n:3, title:"Capstone Project",  sub:"Final Bot Build", status:"Locked",      sc:"bg-gray-100 text-gray-500",   dot:"bg-gray-300"   },
          ].map((step, idx) => (
            <div key={step.n}>
              <div className="flex items-center gap-4">
                <div className={`w-9 h-9 rounded-full ${step.dot} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>{step.n}</div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-800 text-sm">{step.title}</div>
                  <div className="text-xs text-gray-400">{step.sub}</div>
                </div>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${step.sc}`}>{step.status}</span>
              </div>
              {idx < 2 && <div className="w-0.5 h-5 bg-gray-200 ml-[17px] my-2" />}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
