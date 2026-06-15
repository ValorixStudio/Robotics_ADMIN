"use client";
import { useState } from "react";

const PRESET_COLORS = [
  { label: "Blue",   value: "from-blue-500 to-indigo-500",   badge: "bg-blue-100 text-blue-800"     },
  { label: "Teal",   value: "from-teal-400 to-cyan-500",     badge: "bg-teal-100 text-teal-800"     },
  { label: "Purple", value: "from-purple-400 to-pink-500",   badge: "bg-purple-100 text-purple-800" },
  { label: "Green",  value: "from-emerald-400 to-teal-500",  badge: "bg-green-100 text-green-800"   },
  { label: "Orange", value: "from-orange-400 to-amber-500",  badge: "bg-orange-100 text-orange-800" },
  { label: "Rose",   value: "from-rose-400 to-pink-500",     badge: "bg-rose-100 text-rose-800"     },
  { label: "Violet", value: "from-violet-400 to-purple-500", badge: "bg-violet-100 text-violet-800" },
  { label: "Amber",  value: "from-amber-400 to-yellow-500",  badge: "bg-amber-100 text-amber-800"   },
];

const BUILT_IN_ROLES = [
  { name: "Student",     color: "bg-blue-100 text-blue-800",     description: "Enrolled learners"     },
  { name: "Teacher",     color: "bg-teal-100 text-teal-800",     description: "Instructors & faculty" },
  { name: "Super Admin", color: "bg-purple-100 text-purple-800", description: "Full platform access"  },
];

interface UserRecord {
  id: string; name: string; email: string; role: string;
  status: "Active" | "Inactive" | "Pending"; avatarBg: string;
}
interface CustomRole { name: string; color: string; description: string; }

export default function DashboardPage() {
  const [customRoles, setCustomRoles] = useState<CustomRole[]>([]);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showDeleteRoleConfirm, setShowDeleteRoleConfirm] = useState<string | null>(null);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDesc, setNewRoleDesc] = useState("");
  const [newRoleColor, setNewRoleColor] = useState(PRESET_COLORS[0].value);
  const [roleNameError, setRoleNameError] = useState("");
  const [selectedRoleFilter, setSelectedRoleFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const allRoles = [...BUILT_IN_ROLES, ...customRoles];

  const [users, setUsers] = useState<UserRecord[]>([
    { id: "STU12345", name: "Arjun Patel",  email: "arjun@educore.in",  role: "Student",     status: "Active",   avatarBg: "from-blue-500 to-indigo-500"   },
    { id: "TCH98765", name: "Ms. Kapoor",   email: "kapoor@educore.in", role: "Teacher",     status: "Active",   avatarBg: "from-teal-400 to-blue-500"     },
    { id: "STU12346", name: "Priya Sharma", email: "priya@educore.in",  role: "Student",     status: "Active",   avatarBg: "from-purple-400 to-pink-500"   },
    { id: "STU12347", name: "Rohit Kumar",  email: "rohit@educore.in",  role: "Student",     status: "Active",   avatarBg: "from-emerald-400 to-teal-500"  },
    { id: "TCH98766", name: "Dr. Verma",    email: "verma@educore.in",  role: "Teacher",     status: "Pending",  avatarBg: "from-orange-400 to-purple-500" },
    { id: "STU12348", name: "Sneha Rao",    email: "sneha@educore.in",  role: "Student",     status: "Inactive", avatarBg: "from-amber-400 to-red-500"     },
  ]);

  const totalUsers  = users.length;
  const activeUsers = users.filter(u => u.status === "Active").length;

  const handleRoleChange = (id: string, role: string) => setUsers(u => u.map(x => x.id === id ? { ...x, role } : x));
  const toggleUserStatus = (id: string) => setUsers(u => u.map(x => x.id === id ? { ...x, status: x.status === "Active" ? "Inactive" : "Active" } : x));

  const filteredUsers = users.filter(u => {
    const s = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.id.toLowerCase().includes(searchTerm.toLowerCase());
    const r = selectedRoleFilter === "All" || u.role === selectedRoleFilter;
    return s && r;
  });

  const openRoleModal = () => {
    setNewRoleName(""); setNewRoleDesc(""); setNewRoleColor(PRESET_COLORS[0].value); setRoleNameError("");
    setShowRoleModal(true);
  };
  const handleAddRole = () => {
    const t = newRoleName.trim();
    if (!t) { setRoleNameError("Role name is required."); return; }
    if (allRoles.some(r => r.name.toLowerCase() === t.toLowerCase())) { setRoleNameError("Role already exists."); return; }
    const badge = PRESET_COLORS.find(c => c.value === newRoleColor)?.badge ?? "bg-gray-100 text-gray-800";
    setCustomRoles(p => [...p, { name: t, color: badge, description: newRoleDesc.trim() }]);
    setShowRoleModal(false);
  };
  const handleDeleteRole = (name: string) => {
    setCustomRoles(p => p.filter(r => r.name !== name));
    setUsers(p => p.map(u => u.role === name ? { ...u, role: "Student" } : u));
    setShowDeleteRoleConfirm(null);
  };

  return (
    <>
      {/* Add Role Modal */}
      {showRoleModal && (
        <div className="fixed inset-0 z-[200] bg-black/40 flex items-center justify-center" onClick={() => setShowRoleModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-[440px] max-w-[95vw] overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="bg-[#006aa0] text-white px-6 py-4 flex items-center justify-between">
              <div>
                <div className="font-bold text-base">Create New Role</div>
                <div className="text-xs text-white/70 mt-0.5">Custom roles extend the default permission tiers</div>
              </div>
              <button onClick={() => setShowRoleModal(false)} className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center text-lg transition-colors">├ù</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">Role Name <span className="text-red-500">*</span></label>
                <input type="text" value={newRoleName} onChange={e => { setNewRoleName(e.target.value); setRoleNameError(""); }}
                  placeholder="e.g. Moderator, TA, InspectorΓÇª"
                  className={`w-full px-3 py-2.5 text-sm border rounded-xl outline-none transition-colors ${roleNameError ? "border-red-400 bg-red-50" : "border-gray-200 focus:border-[#006aa0]"}`} />
                {roleNameError && <p className="text-xs text-red-500 mt-1.5">ΓÜá∩╕Å {roleNameError}</p>}
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">Description <span className="text-gray-400 font-normal normal-case">(optional)</span></label>
                <input type="text" value={newRoleDesc} onChange={e => setNewRoleDesc(e.target.value)}
                  placeholder="What can this role do?"
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-[#006aa0] transition-colors" />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-2">Badge Colour</label>
                <div className="grid grid-cols-4 gap-2">
                  {PRESET_COLORS.map(c => (
                    <button key={c.value} onClick={() => setNewRoleColor(c.value)}
                      className={`flex items-center gap-1.5 px-2.5 py-2 rounded-xl border text-xs font-semibold transition-all ${newRoleColor === c.value ? "border-[#006aa0] bg-blue-50 text-[#006aa0]" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}>
                      <span className={`w-3 h-3 rounded-full bg-gradient-to-br ${c.value} flex-shrink-0`} />
                      {c.label}
                    </button>
                  ))}
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-xs text-gray-400">Preview:</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${PRESET_COLORS.find(c => c.value === newRoleColor)?.badge ?? "bg-gray-100 text-gray-800"}`}>
                    {newRoleName.trim() || "Role Name"}
                  </span>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2 bg-gray-50">
              <button onClick={() => setShowRoleModal(false)} className="px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-100 transition-colors">Cancel</button>
              <button onClick={handleAddRole} className="px-5 py-2 rounded-xl bg-[#006aa0] hover:bg-[#005a8a] text-white text-sm font-semibold transition-colors">Create Role</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Role Confirm */}
      {showDeleteRoleConfirm && (
        <div className="fixed inset-0 z-[200] bg-black/40 flex items-center justify-center" onClick={() => setShowDeleteRoleConfirm(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-[380px] max-w-[92vw] overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-xl">ΓÜá∩╕Å</div>
                <div>
                  <div className="font-bold text-gray-800">Delete role</div>
                  <div className="text-xs text-gray-500">Users with this role will revert to Student</div>
                </div>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed mb-5">
                Delete <strong className="text-gray-800">{showDeleteRoleConfirm}</strong>?
                {users.filter(u => u.role === showDeleteRoleConfirm).length > 0 && (
                  <span className="text-red-600 font-medium"> {users.filter(u => u.role === showDeleteRoleConfirm).length} user(s) will be affected.</span>
                )}
              </p>
              <div className="flex gap-2">
                <button onClick={() => setShowDeleteRoleConfirm(null)} className="flex-1 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
                <button onClick={() => handleDeleteRole(showDeleteRoleConfirm)} className="flex-1 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors">Delete Role</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <h1 className="text-2xl font-bold tracking-tight text-gray-800">Dashboard Overview</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Total Users</div>
          <div className="text-3xl font-bold text-blue-600 tracking-tight">{totalUsers}</div>
          <p className="text-xs text-gray-500 mt-2">All registered accounts</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Active Users</div>
          <div className="text-3xl font-bold text-green-600 tracking-tight">{activeUsers}</div>
          <p className="text-xs text-green-600 font-medium mt-2">Γåæ {Math.round((activeUsers / totalUsers) * 100)}% of total</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Total Roles</div>
          <div className="text-3xl font-bold text-purple-600 tracking-tight">{allRoles.length}</div>
          <p className="text-xs text-gray-500 mt-2">{customRoles.length} custom ┬╖ {BUILT_IN_ROLES.length} built-in</p>
        </div>
      </div>

      {/* Role Management */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-800">Role Management</h3>
            <p className="text-xs text-gray-400 mt-0.5">{allRoles.length} roles ┬╖ hover a custom role to delete</p>
          </div>
          <button onClick={openRoleModal} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#006aa0] hover:bg-[#005a8a] text-white text-xs font-semibold transition-colors">∩╝ï New Role</button>
        </div>
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {allRoles.map(role => {
            const isCustom = customRoles.some(r => r.name === role.name);
            const count    = users.filter(u => u.role === role.name).length;
            return (
              <div key={role.name} className="flex items-center justify-between px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 hover:border-gray-200 group transition-all">
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 ${role.color}`}>{role.name}</span>
                  <div className="min-w-0">
                    <div className="text-xs text-gray-500 truncate">{role.description || (isCustom ? "Custom role" : "Built-in role")}</div>
                    <div className="text-[10px] text-gray-400 font-mono">{count} user{count !== 1 ? "s" : ""}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                  {isCustom ? (
                    <button onClick={() => setShowDeleteRoleConfirm(role.name)} className="w-6 h-6 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all text-sm">≡ƒùæ</button>
                  ) : (
                    <span className="text-[10px] text-gray-300 px-1.5 py-0.5 rounded border border-gray-200">built-in</span>
                  )}
                </div>
              </div>
            );
          })}
          <button onClick={openRoleModal} className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-gray-200 text-xs font-semibold text-gray-400 hover:border-[#006aa0] hover:text-[#006aa0] transition-all">∩╝ï Create Role</button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="border-b border-gray-200 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h3 className="text-lg font-semibold text-gray-800">Users Access Directory</h3>
          <div className="flex flex-wrap gap-1 bg-gray-100 p-1 rounded-lg">
            <button onClick={() => setSelectedRoleFilter("All")} className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${selectedRoleFilter === "All" ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-800"}`}>All</button>
            {allRoles.map(r => (
              <button key={r.name} onClick={() => setSelectedRoleFilter(r.name)} className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${selectedRoleFilter === r.name ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-800"}`}>{r.name}</button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto w-full">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold">
                <th className="p-4 text-xs tracking-wider uppercase">User</th>
                <th className="p-4 text-xs tracking-wider uppercase">Email</th>
                <th className="p-4 text-xs tracking-wider uppercase">Role</th>
                <th className="p-4 text-xs tracking-wider uppercase">Status</th>
                <th className="p-4 text-xs tracking-wider uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.length > 0 ? filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-[32px] h-[32px] rounded-lg bg-gradient-to-br ${user.avatarBg} flex items-center justify-center font-bold text-xs text-white shadow-sm flex-shrink-0`}>{user.name.charAt(0)}</div>
                      <div>
                        <div className="font-semibold text-gray-800">{user.name}</div>
                        <div className="text-[11px] font-mono text-gray-400">{user.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-gray-600 font-medium text-xs">{user.email}</td>
                  <td className="p-4">
                    <select value={user.role} onChange={e => handleRoleChange(user.id, e.target.value)} className="bg-white border border-gray-200 text-gray-700 text-xs rounded-lg px-2.5 py-1.5 outline-none focus:border-[#006aa0] cursor-pointer shadow-sm">
                      {allRoles.map(r => <option key={r.name} value={r.name}>{r.name}</option>)}
                    </select>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.status === "Active" ? "bg-green-100 text-green-800" : user.status === "Inactive" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"}`}>{user.status}</span>
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={() => toggleUserStatus(user.id)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${user.status === "Active" ? "bg-red-50 border-red-200 text-red-600 hover:bg-red-100" : "bg-green-50 border-green-200 text-green-600 hover:bg-green-100"}`}>
                      {user.status === "Active" ? "Suspend" : "Activate"}
                    </button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={5} className="p-8 text-center text-sm text-gray-400">No users match the current filter.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="border-t border-gray-100 px-6 py-3 flex justify-between text-xs text-gray-400 font-mono">
          <span>Showing {filteredUsers.length} of {totalUsers} users</span>
          <span>{activeUsers} active ┬╖ {totalUsers - activeUsers} inactive</span>
        </div>
      </div>
    </>
  );
}
