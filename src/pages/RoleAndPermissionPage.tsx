import React, { useState } from "react";

interface Permission {
  id: string;
  name: string;
  description: string;
  category: "Academic" | "People" | "Communication" | "Admin" | "System";
}

interface Role {
  id: string;
  name: string;
  description: string;
  color: string;
  permissions: string[];
  userCount: number;
}

const AVAILABLE_PERMISSIONS: Permission[] = [
  { id: "view_courses", name: "View Courses", description: "View all courses", category: "Academic" },
  { id: "create_courses", name: "Create Courses", description: "Create new courses", category: "Academic" },
  { id: "edit_courses", name: "Edit Courses", description: "Edit course content", category: "Academic" },
  { id: "delete_courses", name: "Delete Courses", description: "Delete courses", category: "Academic" },
  { id: "view_students", name: "View Students", description: "View student information", category: "People" },
  { id: "manage_students", name: "Manage Students", description: "Add/edit/delete students", category: "People" },
  { id: "view_teachers", name: "View Teachers", description: "View teacher information", category: "People" },
  { id: "manage_teachers", name: "Manage Teachers", description: "Add/edit/delete teachers", category: "People" },
  { id: "view_attendance", name: "View Attendance", description: "View attendance records", category: "People" },
  { id: "mark_attendance", name: "Mark Attendance", description: "Mark attendance", category: "People" },
  { id: "view_grades", name: "View Grades", description: "View grade information", category: "Academic" },
  { id: "grade_assignments", name: "Grade Assignments", description: "Grade student assignments", category: "Academic" },
  { id: "send_messages", name: "Send Messages", description: "Send messages to students", category: "Communication" },
  { id: "view_announcements", name: "View Announcements", description: "View announcements", category: "Communication" },
  { id: "create_announcements", name: "Create Announcements", description: "Create announcements", category: "Communication" },
  { id: "manage_roles", name: "Manage Roles", description: "Create and edit roles", category: "Admin" },
  { id: "manage_permissions", name: "Manage Permissions", description: "Assign permissions", category: "Admin" },
  { id: "view_system_logs", name: "View System Logs", description: "View system logs", category: "System" },
];

export default function RoleAndPermissionPage() {
  const [roles, setRoles] = useState<Role[]>([
    {
      id: "student",
      name: "Student",
      description: "Basic student access",
      color: "bg-blue-500",
      permissions: ["view_courses", "view_grades", "send_messages", "view_announcements"],
      userCount: 126,
    },
    {
      id: "teacher",
      name: "Teacher",
      description: "Teacher access with grading",
      color: "bg-green-500",
      permissions: ["view_courses", "edit_courses", "view_students", "view_attendance", "mark_attendance", "grade_assignments", "send_messages", "create_announcements"],
      userCount: 12,
    },
    {
      id: "admin",
      name: "Super Admin",
      description: "Full system access",
      color: "bg-purple-500",
      permissions: AVAILABLE_PERMISSIONS.map(p => p.id),
      userCount: 2,
    },
  ]);

  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDesc, setNewRoleDesc] = useState("");
  const [newRoleColor, setNewRoleColor] = useState("bg-indigo-500");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const colors = [
    "bg-blue-500", "bg-green-500", "bg-purple-500", "bg-red-500",
    "bg-yellow-500", "bg-pink-500", "bg-indigo-500", "bg-cyan-500",
  ];

  const openNewRoleModal = () => {
    setEditMode(false);
    setNewRoleName("");
    setNewRoleDesc("");
    setSelectedPermissions([]);
    setNewRoleColor("bg-indigo-500");
    setShowRoleModal(true);
  };

  const openEditModal = (role: Role) => {
    setEditMode(true);
    setSelectedRole(role);
    setNewRoleName(role.name);
    setNewRoleDesc(role.description);
    setSelectedPermissions(role.permissions);
    setNewRoleColor(role.color);
    setShowRoleModal(true);
  };

  const saveRole = () => {
    if (!newRoleName.trim()) return;

    if (editMode && selectedRole) {
      setRoles(roles.map(r =>
        r.id === selectedRole.id
          ? {
              ...r,
              name: newRoleName,
              description: newRoleDesc,
              color: newRoleColor,
              permissions: selectedPermissions,
            }
          : r
      ));
    } else {
      const newRole: Role = {
        id: Date.now().toString(),
        name: newRoleName,
        description: newRoleDesc,
        color: newRoleColor,
        permissions: selectedPermissions,
        userCount: 0,
      };
      setRoles([...roles, newRole]);
    }

    setShowRoleModal(false);
  };

  const deleteRole = (id: string) => {
    if (roles.length > 1) {
      setRoles(roles.filter(r => r.id !== id));
    }
  };

  const togglePermission = (permId: string) => {
    setSelectedPermissions(prev =>
      prev.includes(permId) ? prev.filter(p => p !== permId) : [...prev, permId]
    );
  };

  const permissionsByCategory = (category: string) => {
    return AVAILABLE_PERMISSIONS.filter(p => p.category === category);
  };

  const getPermissionCount = (role: Role) => role.permissions.length;

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-800">Roles & Permissions</h1>
          <p className="text-sm text-gray-500 -mt-1">Manage roles and assign permissions to users</p>
        </div>
        <button
          onClick={openNewRoleModal}
          className="px-4 py-2 rounded-xl bg-[#006aa0] hover:bg-[#005a8a] text-white text-xs font-semibold transition-colors"
        >
          + Create Role
        </button>
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {roles.map(role => (
          <div key={role.id} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            <div className={`h-2 ${role.color}`} />
            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-gray-800 text-sm">{role.name}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{role.description}</p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => openEditModal(role)}
                    className="w-7 h-7 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 flex items-center justify-center text-xs transition-colors"
                  >
                    ✏️
                  </button>
                  {roles.length > 1 && (
                    <button
                      onClick={() => deleteRole(role.id)}
                      className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center text-xs transition-colors"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex items-center gap-4 text-xs">
                  <div>
                    <div className="text-gray-400 font-medium">Permissions</div>
                    <div className="font-bold text-gray-800">{getPermissionCount(role)}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 font-medium">Users</div>
                    <div className="font-bold text-gray-800">{role.userCount}</div>
                  </div>
                </div>
                <button
                  onClick={() => openEditModal(role)}
                  className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold transition-colors"
                >
                  Manage
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Role Modal */}
      {showRoleModal && (
        <div className="fixed inset-0 z-[200] bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="bg-[#006aa0] px-6 py-4 text-white">
              <h2 className="text-sm font-bold">{editMode ? "Edit Role" : "Create New Role"}</h2>
              <p className="text-[11px] text-white/70 mt-0.5">Define role details and assign permissions</p>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Role Details */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-2">Role Name *</label>
                  <input
                    type="text"
                    value={newRoleName}
                    onChange={(e) => setNewRoleName(e.target.value)}
                    placeholder="e.g. Content Creator"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-[#006aa0] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-2">Description</label>
                  <input
                    type="text"
                    value={newRoleDesc}
                    onChange={(e) => setNewRoleDesc(e.target.value)}
                    placeholder="Role description..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-[#006aa0] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-2">Role Color</label>
                  <div className="flex gap-2 flex-wrap">
                    {colors.map(c => (
                      <button
                        key={c}
                        onClick={() => setNewRoleColor(c)}
                        className={`w-8 h-8 rounded-lg ${c} ${newRoleColor === c ? "ring-2 ring-offset-2 ring-gray-400" : ""} transition-all`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Permissions */}
              <div className="border-t pt-5">
                <h3 className="text-xs font-bold text-gray-800 mb-3">Permissions by Category</h3>
                <div className="space-y-2">
                  {["Academic", "People", "Communication", "Admin", "System"].map(category => (
                    <div key={category}>
                      <button
                        onClick={() => setExpandedCategory(expandedCategory === category ? null : category)}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 text-left font-semibold text-xs text-gray-700"
                      >
                        <span>{category}</span>
                        <span>{expandedCategory === category ? "▼" : "▶"}</span>
                      </button>
                      {expandedCategory === category && (
                        <div className="pl-4 space-y-2 py-2">
                          {permissionsByCategory(category).map(perm => (
                            <label key={perm.id} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={selectedPermissions.includes(perm.id)}
                                onChange={() => togglePermission(perm.id)}
                                className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                              />
                              <span className="text-xs text-gray-700 font-medium">{perm.name}</span>
                              <span className="text-[10px] text-gray-400">({perm.description})</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="border-t bg-gray-50 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => setShowRoleModal(false)}
                className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 font-semibold text-xs hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveRole}
                className="px-4 py-2 rounded-lg bg-[#006aa0] hover:bg-[#005a8a] text-white font-semibold text-xs transition-colors"
              >
                {editMode ? "Update Role" : "Create Role"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
