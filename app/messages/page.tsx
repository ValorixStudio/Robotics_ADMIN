export default function MessagesPage() {
  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight text-gray-800">Messages</h1>
      <p className="text-sm text-gray-500 -mt-4">Internal communication hub</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-800">📨 Inbox</h3>
            <button className="px-3 py-1.5 rounded-lg bg-[#006aa0] text-white text-xs font-semibold hover:bg-[#005a8a] transition-colors">+ Compose</button>
          </div>
          {[
            { from:"Arjun Patel",  preview:"Sir, I have a doubt in Module 3 assignment…",   time:"2m ago",    bg:"bg-indigo-500"  },
            { from:"Priya Sharma", preview:"Can I get an extension for the circuit lab?",    time:"1h ago",    bg:"bg-purple-500"  },
            { from:"Ms. Kapoor",  preview:"Uploaded new lecture notes for Module 4",         time:"3h ago",    bg:"bg-green-500"   },
            { from:"Mr. Sharma",  preview:"New quiz scheduled for Friday, please confirm",   time:"Yesterday", bg:"bg-orange-400"  },
          ].map(m => (
            <div key={m.from} className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0 cursor-pointer hover:bg-gray-50 rounded-lg px-2 -mx-2 transition-colors">
              <div className={`w-9 h-9 rounded-xl ${m.bg} flex items-center justify-center text-white font-bold text-xs flex-shrink-0`}>{m.from[0]}</div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-800 text-xs">{m.from}</div>
                <div className="text-[11px] text-gray-400 truncate">{m.preview}</div>
              </div>
              <span className="text-[10px] text-gray-300 font-mono flex-shrink-0">{m.time}</span>
            </div>
          ))}
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col gap-4">
          <h3 className="text-sm font-bold text-gray-800">💬 Arjun Patel — Thread</h3>
          <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs text-gray-700 leading-relaxed">
            Sir, I have a doubt in Module 3 assignment. The servo control code isn&apos;t working as expected. Should I use PWM directly or through the library?
          </div>
          <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-xs text-blue-800 leading-relaxed ml-5">
            Hi Arjun! Use the Servo.h library — it simplifies PWM handling. Check the example in Module 2 resources. Let me know if still stuck.
          </div>
          <div className="flex gap-2 mt-auto">
            <input className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-gray-800 outline-none focus:border-[#006aa0] transition-colors" placeholder="Type a reply…" />
            <button className="px-4 py-2 rounded-xl bg-[#006aa0] hover:bg-[#005a8a] text-white text-xs font-semibold transition-colors">Send</button>
          </div>
        </div>
      </div>
    </>
  );
}