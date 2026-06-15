import { StatCard, ProgressBar } from "@/components";

export default function LearnerProfilePage() {
  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight text-gray-800">Learner Profile ΓÇö Arjun Patel</h1>
      <p className="text-sm text-gray-500 -mt-4">360┬░ view ┬╖ STU12345 ┬╖ Grade 10 ┬╖ Explorer &amp; Innovator</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        <StatCard label="Overall Score" value="72%" delta="Strong Learner"   deltaColor="text-blue-600"  icon="≡ƒôê" iconBg="bg-blue-50"   />
        <StatCard label="Accuracy"      value="78%" delta="Γåæ 3% this month" deltaColor="text-green-600" icon="Γ£à" iconBg="bg-green-50"  />
        <StatCard label="Time Spent"    value="64h" delta="Total learning"                               icon="ΓÅ▒∩╕Å" iconBg="bg-orange-50" />
        <StatCard label="Activities"    value="126" delta="Completed tasks"                              icon="≡ƒôÜ" iconBg="bg-cyan-50"   />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-gray-800 mb-4">≡ƒºá Cognitive Skills</h3>
          <ProgressBar label="Recall & Recognize"  value={85} color="bg-blue-500"   />
          <ProgressBar label="Interpret & Explain" value={80} color="bg-cyan-400"   />
          <ProgressBar label="Apply & Solve"       value={74} color="bg-green-500"  />
          <ProgressBar label="Dissect & Examine"   value={71} color="bg-orange-400" />
          <ProgressBar label="Judge & Justify"     value={62} color="bg-rose-500"   />
          <ProgressBar label="Innovate"            value={68} color="bg-purple-500" />
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-gray-800 mb-4">≡ƒæü∩╕Å Learning Style (VARK)</h3>
          <div className="flex items-center gap-6">
            <svg width="130" height="130" viewBox="0 0 36 36" className="flex-shrink-0">
              <circle cx="18" cy="18" r="14" fill="none" stroke="#e5e7eb" strokeWidth="4"/>
              <circle cx="18" cy="18" r="14" fill="none" stroke="#3b82f6" strokeWidth="4" strokeDasharray="39.6 48.4" strokeDashoffset="22" transform="rotate(-90 18 18)"/>
              <circle cx="18" cy="18" r="14" fill="none" stroke="#06b6d4" strokeWidth="4" strokeDasharray="26.4 61.6" strokeDashoffset="-17.6" transform="rotate(-90 18 18)"/>
              <circle cx="18" cy="18" r="14" fill="none" stroke="#f97316" strokeWidth="4" strokeDasharray="13.2 74.8" strokeDashoffset="-44" transform="rotate(-90 18 18)"/>
              <circle cx="18" cy="18" r="14" fill="none" stroke="#f43f5e" strokeWidth="4" strokeDasharray="8.8 79.2" strokeDashoffset="-57.2" transform="rotate(-90 18 18)"/>
              <text x="18" y="17" fill="#374151" fontSize="3.5" textAnchor="middle" fontFamily="Plus Jakarta Sans" fontWeight="700">VARK</text>
              <text x="18" y="21" fill="#9ca3af" fontSize="2.8" textAnchor="middle" fontFamily="Plus Jakarta Sans">Profile</text>
            </svg>
            <div className="flex flex-col gap-3">
              {[
                { color:"bg-blue-500",   label:"Visual",     pct:"45%" },
                { color:"bg-cyan-400",   label:"Kinesthetic",pct:"30%" },
                { color:"bg-orange-400", label:"Auditory",   pct:"15%" },
                { color:"bg-rose-500",   label:"Reading",    pct:"10%" },
              ].map(v => (
                <div key={v.label} className="flex items-center gap-2 text-xs">
                  <div className={`w-2.5 h-2.5 rounded-sm ${v.color} flex-shrink-0`} />
                  <span className="text-gray-600">{v.label}</span>
                  <b className="ml-auto pl-3">{v.pct}</b>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm text-center">
          <h3 className="text-sm font-bold text-gray-800 mb-4">ΓÜí Learning Speed</h3>
          <svg width="150" height="80" viewBox="0 0 150 80" className="mx-auto">
            <path d="M 15 72 A 60 60 0 0 1 135 72" fill="none" stroke="#e5e7eb" strokeWidth="12" strokeLinecap="round"/>
            <path d="M 15 72 A 60 60 0 0 1 135 72" fill="none" stroke="url(#sg)" strokeWidth="12" strokeLinecap="round" strokeDasharray="176" strokeDashoffset="52"/>
            <defs>
              <linearGradient id="sg" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#f43f5e"/>
                <stop offset="50%" stopColor="#fbbf24"/>
                <stop offset="100%" stopColor="#22c55e"/>
              </linearGradient>
            </defs>
            <line x1="75" y1="72" x2="110" y2="38" stroke="#374151" strokeWidth="2.5" strokeLinecap="round"/>
            <circle cx="75" cy="72" r="5" fill="#374151"/>
          </svg>
          <div className="text-lg font-bold text-green-600 mt-2">Fast Learner</div>
          <div className="text-xs text-gray-400">Faster than 72% of peers</div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-gray-800 mb-4">ΓÜá∩╕Å Mistake Patterns</h3>
          <ProgressBar label="Conceptual Understanding" value={35} color="bg-rose-500"   />
          <ProgressBar label="Careless Errors"          value={25} color="bg-orange-400" />
          <ProgressBar label="Step Skipping"            value={20} color="bg-orange-400" />
          <ProgressBar label="Time Management"          value={10} color="bg-green-500"  />
          <ProgressBar label="Overcomplicating"         value={10} color="bg-blue-500"   />
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-gray-800 mb-4">≡ƒÄ» Top Interests</h3>
          {[
            { emoji:"≡ƒñû", label:"Robotics",    value:90, color:"bg-cyan-400"   },
            { emoji:"≡ƒÆ╗", label:"Coding",      value:85, color:"bg-blue-500"   },
            { emoji:"≡ƒºè", label:"Design & 3D", value:75, color:"bg-purple-500" },
            { emoji:"≡ƒºá", label:"AI & ML",     value:60, color:"bg-orange-400" },
          ].map(i => (
            <div key={i.label} className="flex items-center gap-3 mb-3">
              <span className="text-lg">{i.emoji}</span>
              <div className="flex-1">
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-gray-600">{i.label}</span>
                  <b>{i.value}%</b>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${i.color}`} style={{ width: `${i.value}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-sm font-bold text-gray-800 mb-4">≡ƒÜÇ Personalized Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { emoji:"≡ƒÄô", color:"text-blue-600",   border:"hover:border-blue-300",   title:"Strengthen Evaluation Skills",  body:"Try activities involving decision-making, comparing options, and justifying solutions." },
            { emoji:"≡ƒôè", color:"text-cyan-500",   border:"hover:border-cyan-300",   title:"Improve Conceptual Clarity",    body:"Use mind maps and teach-back method to understand the 'why' behind concepts." },
            { emoji:"≡ƒÜÇ", color:"text-orange-500", border:"hover:border-orange-300", title:"Career Path",                   body:"Robotics Engineer / Product Designer / AI Developer ΓÇö best match for your strengths." },
          ].map(r => (
            <div key={r.title} className={`bg-gray-50 border border-gray-200 rounded-xl p-4 cursor-pointer transition-colors ${r.border}`}>
              <div className="text-2xl mb-2">{r.emoji}</div>
              <div className={`text-sm font-bold mb-1 ${r.color}`}>{r.title}</div>
              <div className="text-xs text-gray-500 leading-relaxed">{r.body}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
