export default function TeachersPage() {
  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight text-gray-800">Teachers</h1>
      <p className="text-sm text-gray-500 -mt-4">Manage faculty and instructors</p>

      <div className="flex justify-end">
        <button className="px-4 py-2 rounded-xl bg-[#e51b72] hover:bg-[#bd145c] text-white text-xs font-semibold transition-colors">+ Add Teacher</button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead><tr className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 uppercase font-semibold">
              <th className="p-4 text-left">Teacher</th><th className="p-4 text-left">Subject</th>
              <th className="p-4 text-left">Courses</th><th className="p-4 text-left">Students</th>
              <th className="p-4 text-left">Avg Rating</th><th className="p-4 text-left">Status</th>
              <th className="p-4"></th>
            </tr></thead>
            <tbody className="divide-y divide-gray-100">
              {[
                { name:"Ms. Kapoor", subject:"Robotics",    courses:2, students:48, rating:"G¡É 4.8", status:"Active",  stC:"bg-green-100 text-green-700", bg:"bg-blue-500"   },
                { name:"Mr. Sharma", subject:"Programming", courses:1, students:36, rating:"G¡É 4.6", status:"Active",  stC:"bg-green-100 text-green-700", bg:"bg-green-500"  },
                { name:"Dr. Verma",  subject:"AI & ML",     courses:1, students:0,  rating:"G¡É GÇö",   status:"Pending", stC:"bg-amber-100 text-amber-700", bg:"bg-purple-500" },
              ].map(t => (
                <tr key={t.name} className="hover:bg-gray-50/50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg ${t.bg} flex items-center justify-center text-white font-bold text-xs flex-shrink-0`}>{t.name[0]}</div>
                      <span className="font-semibold text-gray-800">{t.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-gray-500 text-xs">{t.subject}</td>
                  <td className="p-4 text-gray-500 text-xs">{t.courses}</td>
                  <td className="p-4 text-gray-500 text-xs">{t.students}</td>
                  <td className="p-4 text-xs">{t.rating}</td>
                  <td className="p-4"><span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${t.stC}`}>{t.status}</span></td>
                  <td className="p-4 text-right"><button className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-600 hover:bg-gray-50 transition-colors">View</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
