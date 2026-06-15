import { useState } from "react";

const DASHBOARD_ROLES = ["Student", "Teacher"] as const;

interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: (typeof DASHBOARD_ROLES)[number];
  status: "Active" | "Inactive" | "Pending";
  avatarBg: string;
}

const INITIAL_USERS: UserRecord[] = [
  { id: "STU12345", name: "Arjun Patel", email: "arjun@educore.in", role: "Student", status: "Active", avatarBg: "from-blue-500 to-indigo-500" },
  { id: "TCH98765", name: "Ms. Kapoor", email: "kapoor@educore.in", role: "Teacher", status: "Active", avatarBg: "from-teal-400 to-blue-500" },
  { id: "STU12346", name: "Priya Sharma", email: "priya@educore.in", role: "Student", status: "Active", avatarBg: "from-purple-400 to-pink-500" },
  { id: "STU12347", name: "Rohit Kumar", email: "rohit@educore.in", role: "Student", status: "Active", avatarBg: "from-emerald-400 to-teal-500" },
  { id: "TCH98766", name: "Dr. Verma", email: "verma@educore.in", role: "Teacher", status: "Pending", avatarBg: "from-orange-400 to-purple-500" },
  { id: "STU12348", name: "Sneha Rao", email: "sneha@educore.in", role: "Student", status: "Inactive", avatarBg: "from-amber-400 to-red-500" },
];

export default function DashboardPage() {
  const [users, setUsers] = useState<UserRecord[]>(INITIAL_USERS);
  const [selectedRole, setSelectedRole] = useState<"All" | UserRecord["role"]>("All");

  const totalUsers = users.length;
  const activeUsers = users.filter((user) => user.status === "Active").length;
  const filteredUsers = users.filter((user) => selectedRole === "All" || user.role === selectedRole);

  const updateRole = (id: string, role: UserRecord["role"]) => {
    setUsers((current) => current.map((user) => (user.id === id ? { ...user, role } : user)));
  };

  const toggleStatus = (id: string) => {
    setUsers((current) => current.map((user) => (
      user.id === id
        ? { ...user, status: user.status === "Active" ? "Inactive" : "Active" }
        : user
    )));
  };

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

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col items-start justify-between gap-4 border-b border-gray-200 p-6 sm:flex-row sm:items-center">
          <h3 className="text-lg font-semibold text-gray-800">Users Access Directory</h3>
          <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
            {(["All", ...DASHBOARD_ROLES] as const).map((role) => (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${selectedRole === role ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-800"}`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 font-semibold text-gray-600">
                <th className="p-4 text-xs uppercase tracking-wider">User</th>
                <th className="p-4 text-xs uppercase tracking-wider">Email</th>
                <th className="p-4 text-xs uppercase tracking-wider">Role</th>
                <th className="p-4 text-xs uppercase tracking-wider">Status</th>
                <th className="p-4 text-right text-xs uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="transition-colors hover:bg-gray-50/50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${user.avatarBg} text-xs font-bold text-white shadow-sm`}>{user.name.charAt(0)}</div>
                      <div>
                        <div className="font-semibold text-gray-800">{user.name}</div>
                        <div className="font-mono text-[11px] text-gray-400">{user.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-xs font-medium text-gray-600">{user.email}</td>
                  <td className="p-4">
                    <select
                      value={user.role}
                      onChange={(event) => updateRole(user.id, event.target.value as UserRecord["role"])}
                      className="cursor-pointer rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-700 outline-none focus:border-[#e51b72]"
                    >
                      {DASHBOARD_ROLES.map((role) => <option key={role} value={role}>{role}</option>)}
                    </select>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${user.status === "Active" ? "bg-green-100 text-green-800" : user.status === "Inactive" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"}`}>{user.status}</span>
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={() => toggleStatus(user.id)} className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${user.status === "Active" ? "border-red-200 bg-red-50 text-red-600 hover:bg-red-100" : "border-green-200 bg-green-50 text-green-600 hover:bg-green-100"}`}>
                      {user.status === "Active" ? "Suspend" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between border-t border-gray-100 px-6 py-3 text-xs text-gray-400">
          <span>Showing {filteredUsers.length} of {totalUsers} users</span>
          <span>{activeUsers} active</span>
        </div>
      </div>
    </>
  );
}
