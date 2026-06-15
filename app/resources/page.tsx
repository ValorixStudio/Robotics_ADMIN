export default function ResourcesPage() {
  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight text-gray-800">Resources</h1>
      <p className="text-sm text-gray-500 -mt-4">Files, PDFs, videos and more</p>

      <div className="flex items-center justify-between">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          {["All","PDFs","Videos","Links"].map(t => (
            <button key={t} className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${t === "All" ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-800"}`}>{t}</button>
          ))}
        </div>
        <button className="px-4 py-2 rounded-xl bg-[#006aa0] hover:bg-[#005a8a] text-white text-xs font-semibold transition-colors">+ Upload Resource</button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead><tr className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 uppercase font-semibold">
              <th className="p-4 text-left">File Name</th><th className="p-4 text-left">Type</th>
              <th className="p-4 text-left">Course</th><th className="p-4 text-left">Uploaded By</th>
              <th className="p-4 text-left">Downloads</th><th className="p-4 text-left">Date</th>
              <th className="p-4"></th>
            </tr></thead>
            <tbody className="divide-y divide-gray-100">
              {[
                { name:"📄 Robotics Handbook.pdf", type:"PDF",   typeC:"bg-red-100 text-red-700",   course:"Robotics 101",  by:"Ms. Kapoor", dl:"142", date:"Jun 1",  action:"⬇" },
                { name:"🎥 Intro to Sensors.mp4",  type:"Video", typeC:"bg-blue-100 text-blue-700", course:"Robotics 101",  by:"Ms. Kapoor", dl:"98",  date:"Jun 3",  action:"▶" },
                { name:"📄 Python Cheatsheet.pdf", type:"PDF",   typeC:"bg-red-100 text-red-700",   course:"Python Basics", by:"Mr. Sharma", dl:"210", date:"May 28", action:"⬇" },
                { name:"🔗 Arduino Docs",           type:"Link",  typeC:"bg-cyan-100 text-cyan-700", course:"Robotics 101",  by:"Admin",      dl:"—",   date:"May 20", action:"↗" },
              ].map(r => (
                <tr key={r.name} className="hover:bg-gray-50/50">
                  <td className="p-4 font-semibold text-gray-800 text-xs">{r.name}</td>
                  <td className="p-4"><span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${r.typeC}`}>{r.type}</span></td>
                  <td className="p-4 text-gray-500 text-xs">{r.course}</td>
                  <td className="p-4 text-gray-500 text-xs">{r.by}</td>
                  <td className="p-4 text-gray-700 font-mono text-xs">{r.dl}</td>
                  <td className="p-4 text-gray-400 text-xs">{r.date}</td>
                  <td className="p-4"><button className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-600 hover:bg-gray-50 transition-colors">{r.action}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}