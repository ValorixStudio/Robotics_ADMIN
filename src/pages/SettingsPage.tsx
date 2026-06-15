export default function SettingsPage() {
  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight text-gray-800">Settings</h1>
      <p className="text-sm text-gray-500 -mt-4">Configure your LMS platform</p>

      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit mb-2">
        {["General","Users & Roles","Notifications","Integrations"].map(t => (
          <button key={t} className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${t === "General" ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-800"}`}>{t}</button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-gray-800 mb-4">≡ƒÅ½ School Information</h3>
          <div className="mb-4">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Institution Name</label>
            <input defaultValue="Circuit Studio" className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-[#006aa0] transition-colors" />
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Academic Year</label>
              <input defaultValue="2025-26" className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-[#006aa0] transition-colors" />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Timezone</label>
              <select className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-[#006aa0] transition-colors bg-white">
                <option>Asia/Kolkata (IST)</option>
              </select>
            </div>
          </div>
          <div className="mb-5">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Admin Email</label>
            <input type="email" defaultValue="admin@educore.in" className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-[#006aa0] transition-colors" />
          </div>
          <button className="px-5 py-2.5 rounded-xl bg-[#006aa0] hover:bg-[#005a8a] text-white text-sm font-semibold transition-colors">Save Changes</button>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-gray-800 mb-4">≡ƒöö Notification Preferences</h3>
          <div className="flex flex-col gap-5">
            {[
              { title:"Assignment Deadline Reminders", sub:"Email + SMS",       on:true  },
              { title:"New Submission Alerts",         sub:"Email only",        on:true  },
              { title:"Live Class Reminders",          sub:"Push notification", on:false },
            ].map(n => (
              <div key={n.title} className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-gray-800">{n.title}</div>
                  <div className="text-xs text-gray-400">{n.sub}</div>
                </div>
                <div className={`w-10 h-6 rounded-full relative cursor-pointer transition-colors ${n.on ? "bg-green-500" : "bg-gray-200"}`}>
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${n.on ? "right-1" : "left-1"} shadow-sm`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
