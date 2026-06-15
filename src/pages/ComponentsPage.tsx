import { ProgressBar } from "@/components/ProgressBar";
import { StatCard } from "@/components/StatCard";

export default function ComponentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-800">Components Library</h1>
        <p className="mt-2 text-sm text-gray-500 max-w-2xl">
          This page shows reusable UI components used across the dashboard. Components are stored in the shared `src/components/` folder to keep the app organized.
        </p>
      </div>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">StatCard</h2>
          <div className="space-y-4">
            <StatCard label="Total Users" value="132" delta="Active users this month" icon="👥" iconBg="bg-blue-500/20" />
            <StatCard label="New Signups" value="24" delta="Compared to last week" icon="✨" iconBg="bg-green-500/20" />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">ProgressBar</h2>
          <ProgressBar label="Student progress" value={78} color="bg-blue-500" />
          <ProgressBar label="Quiz completion" value={54} color="bg-purple-500" />
          <ProgressBar label="Certificate delivery" value={91} color="bg-emerald-500" />
        </div>
      </section>
    </div>
  );
}
