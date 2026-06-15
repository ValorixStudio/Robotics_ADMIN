const DASHBOARD_USERS = [
  { status: "Active" },
  { status: "Active" },
  { status: "Active" },
  { status: "Active" },
  { status: "Pending" },
  { status: "Inactive" },
] as const;

const DASHBOARD_ROLES = ["Student", "Teacher"];

export default function DashboardPage() {
  const totalUsers = DASHBOARD_USERS.length;
  const activeUsers = DASHBOARD_USERS.filter((user) => user.status === "Active").length;

  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight text-gray-800">Dashboard Overview</h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-1 text-xs font-bold uppercase tracking-wider text-gray-400">Total Users</div>
          <div className="text-3xl font-bold tracking-tight text-blue-600">{totalUsers}</div>
          <p className="mt-2 text-xs text-gray-500">All registered accounts</p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-1 text-xs font-bold uppercase tracking-wider text-gray-400">Active Users</div>
          <div className="text-3xl font-bold tracking-tight text-green-600">{activeUsers}</div>
          <p className="mt-2 text-xs font-medium text-green-600">{Math.round((activeUsers / totalUsers) * 100)}% of total</p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-1 text-xs font-bold uppercase tracking-wider text-gray-400">Total Roles</div>
          <div className="text-3xl font-bold tracking-tight text-purple-600">{DASHBOARD_ROLES.length}</div>
          <p className="mt-2 text-xs text-gray-500">Student and Teacher roles</p>
        </div>
      </div>
    </>
  );
}
