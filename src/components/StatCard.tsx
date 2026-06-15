"use client";

export function StatCard({
  label,
  value,
  delta,
  deltaColor,
  icon,
  iconBg,
}: {
  label: string;
  value: string;
  delta: string;
  deltaColor?: string;
  icon: string;
  iconBg: string;
}) {
  return (
    <div className="bg-gradient-to-br from-black via-gray-900 to-gray-100 border border-gray-300 rounded-xl p-6 shadow-sm relative overflow-hidden">
      <div className="text-xs text-gray-300 font-bold uppercase tracking-wider mb-1">{label}</div>
      <div className="text-3xl font-bold tracking-tight mb-1 text-white">{value}</div>
      <p className={`text-xs font-medium mt-1 ${deltaColor ?? "text-gray-200"}`}>{delta}</p>
      <div className={`absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-xl flex items-center justify-center text-xl ${iconBg}`}>
        {icon}
      </div>
    </div>
  );
}
