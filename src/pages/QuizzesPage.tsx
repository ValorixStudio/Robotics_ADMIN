export default function QuizzesPage() {
  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight text-gray-800">Quizzes</h1>
      <p className="text-sm text-gray-500 -mt-4">Create and manage assessments</p>

      <div className="flex items-center justify-between">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          {["All Quizzes","Scheduled","Results"].map(t => (
            <button key={t} className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${t === "All Quizzes" ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-800"}`}>{t}</button>
          ))}
        </div>
        <button className="px-4 py-2 rounded-xl bg-[#006aa0] hover:bg-[#005a8a] text-white text-xs font-semibold transition-colors">+ Create Quiz</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-gray-800 mb-4">Γ¥ô Quiz Builder ΓÇö Sample</h3>
          {[
            { q:"Q1. Which language is used to program Arduino?", opts:["C/C++","Python","Java","Ruby"], correct:0 },
            { q:"Q2. What does PWM stand for?", opts:["Power Wave Management","Pulse Width Modulation","Program Wire Method","Pulse Width Management"], correct:1 },
          ].map((quiz, qi) => (
            <div key={qi} className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-3">
              <div className="font-semibold text-gray-800 text-sm mb-3">{quiz.q}</div>
              {quiz.opts.map((opt, oi) => (
                <div key={oi} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs mb-1 cursor-pointer transition-colors ${oi === quiz.correct ? "bg-green-50 text-green-700 font-semibold" : "hover:bg-gray-100 text-gray-600"}`}>
                  <div className={`w-3 h-3 rounded-full border-2 flex-shrink-0 ${oi === quiz.correct ? "border-green-500 bg-green-500" : "border-gray-300"}`} />
                  {opt}
                </div>
              ))}
            </div>
          ))}
          <button className="px-4 py-2 rounded-xl bg-[#006aa0] hover:bg-[#005a8a] text-white text-xs font-semibold mt-1 transition-colors">+ Add Question</button>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-gray-800 mb-4">≡ƒôè Recent Quiz Results</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead><tr className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase font-semibold">
                <th className="p-3 text-left">Quiz</th><th className="p-3 text-left">Avg Score</th><th className="p-3 text-left">Pass Rate</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-100">
                {[
                  { quiz:"Robotics Basics", avg:"78%", pass:"88%", avgC:"text-green-600",  passC:"bg-green-100 text-green-700" },
                  { quiz:"Python Intro",    avg:"82%", pass:"91%", avgC:"text-green-600",  passC:"bg-green-100 text-green-700" },
                  { quiz:"Algebra Basics",  avg:"65%", pass:"72%", avgC:"text-orange-500", passC:"bg-amber-100 text-amber-700" },
                  { quiz:"Circuit Theory",  avg:"58%", pass:"61%", avgC:"text-red-500",    passC:"bg-red-100 text-red-700"     },
                ].map(r => (
                  <tr key={r.quiz} className="hover:bg-gray-50">
                    <td className="p-3 font-semibold text-gray-800">{r.quiz}</td>
                    <td className="p-3"><b className={r.avgC}>{r.avg}</b></td>
                    <td className="p-3"><span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${r.passC}`}>{r.pass}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
