export default function AdminProfilePage() {
  return (
    <>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#e51b72]">My account</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900">Admin Profile</h1>
        <p className="mt-1 text-sm text-gray-500">Review your account and organization details.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <section className="rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-[#e51b72] text-2xl font-bold text-white shadow-sm">A</div>
          <h2 className="mt-4 text-lg font-bold text-gray-900">Admin User</h2>
          <p className="mt-1 text-xs text-gray-400">admin@teachly.in</p>
          <span className="mt-4 inline-flex rounded-full bg-violet-50 px-3 py-1 text-[11px] font-bold text-violet-700">Super Admin</span>
          <div className="mt-6 border-t border-gray-100 pt-5 text-left">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Account status</p>
            <div className="mt-2 flex items-center gap-2 text-xs font-semibold text-emerald-600"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Active</div>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-6 py-5">
            <h2 className="text-sm font-bold text-gray-800">Profile information</h2>
            <p className="mt-1 text-xs text-gray-400">Your administrator account details.</p>
          </div>
          <div className="grid gap-5 p-6 sm:grid-cols-2">
            {[
              ["Full name", "Admin User"],
              ["Email address", "admin@teachly.in"],
              ["Role", "Super Admin"],
              ["Organization", "Teachly Education"],
              ["Department", "Management"],
              ["Last login", "Today"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl border border-gray-100 bg-gray-50/70 p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{label}</p>
                <p className="mt-1.5 text-sm font-semibold text-gray-800">{value}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
