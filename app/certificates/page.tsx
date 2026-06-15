export default function CertificatesPage() {
  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight text-gray-800">Certificates</h1>
      <p className="text-sm text-gray-500 -mt-4">Issue and manage completion certificates</p>

      <div className="flex justify-end">
        <button className="px-4 py-2 rounded-xl bg-[#006aa0] hover:bg-[#005a8a] text-white text-xs font-semibold transition-colors">+ Issue Certificate</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { emoji:"🏅", type:"Certificate of Completion", name:"Arjun Patel",  course:"Robotics 101 · Jun 2026",      locked:false },
          { emoji:"🏅", type:"Certificate of Excellence", name:"Rohit Kumar",  course:"Python Basics · May 2026",     locked:false },
          { emoji:"🔒", type:"Pending Issue",             name:"Priya Sharma", course:"Python Basics · Not completed", locked:true  },
        ].map(c => (
          <div key={c.name} className={`bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-6 text-center shadow-sm relative overflow-hidden ${c.locked ? "opacity-60" : ""}`}>
            <div className="text-4xl mb-3">{c.emoji}</div>
            <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">{c.type}</div>
            <div className="text-base font-bold text-[#006aa0] mb-1">{c.name}</div>
            <div className="text-xs text-gray-400 mb-4">{c.course}</div>
            {c.locked
              ? <button className="w-full py-2 rounded-xl border border-gray-200 text-gray-500 text-xs font-semibold hover:bg-white transition-colors">Send Reminder</button>
              : <button className="w-full py-2 rounded-xl bg-[#006aa0] hover:bg-[#005a8a] text-white text-xs font-semibold transition-colors">Download PDF</button>
            }
          </div>
        ))}
      </div>
    </>
  );
}