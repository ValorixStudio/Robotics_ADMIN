import { useMemo, useState } from "react";

type PermissionCategory = "Academic" | "People" | "Communication" | "Administration";

interface Permission {
  id: string;
  name: string;
  description: string;
  category: PermissionCategory;
}

interface Role {
  id: string;
  name: string;
  description: string;
  color: string;
  permissions: string[];
  userCount: number;
  protected?: boolean;
}

const PERMISSIONS: Permission[] = [
  { id: "view_courses", name: "View courses", description: "Browse courses and learning modules", category: "Academic" },
  { id: "create_courses", name: "Create courses", description: "Create new courses and modules", category: "Academic" },
  { id: "edit_courses", name: "Edit courses", description: "Update course content and settings", category: "Academic" },
  { id: "delete_courses", name: "Delete courses", description: "Remove courses from the platform", category: "Academic" },
  { id: "grade_assignments", name: "Grade assignments", description: "Review and score student submissions", category: "Academic" },
  { id: "view_students", name: "View students", description: "Access student profiles and progress", category: "People" },
  { id: "manage_students", name: "Manage students", description: "Add, edit, and deactivate students", category: "People" },
  { id: "view_teachers", name: "View teachers", description: "Access teacher profiles", category: "People" },
  { id: "manage_teachers", name: "Manage teachers", description: "Add, edit, and deactivate teachers", category: "People" },
  { id: "manage_attendance", name: "Manage attendance", description: "View and update attendance records", category: "People" },
  { id: "send_messages", name: "Send messages", description: "Message students and teachers", category: "Communication" },
  { id: "manage_announcements", name: "Manage announcements", description: "Create and publish announcements", category: "Communication" },
  { id: "manage_roles", name: "Manage roles", description: "Create, edit, and remove custom roles", category: "Administration" },
  { id: "manage_permissions", name: "Manage permissions", description: "Change access for each role", category: "Administration" },
  { id: "view_reports", name: "View reports", description: "Access analytics and system reports", category: "Administration" },
  { id: "manage_settings", name: "Manage settings", description: "Change organization-wide settings", category: "Administration" },
];

const INITIAL_ROLES: Role[] = [
  {
    id: "super-admin",
    name: "Super Admin",
    description: "Complete access to every workspace and setting.",
    color: "bg-violet-500",
    permissions: PERMISSIONS.map((permission) => permission.id),
    userCount: 2,
    protected: true,
  },
  {
    id: "teacher",
    name: "Teacher",
    description: "Manage classes, learners, and academic content.",
    color: "bg-emerald-500",
    permissions: [
      "view_courses", "create_courses", "edit_courses", "grade_assignments", "view_students",
      "manage_students", "manage_attendance", "send_messages", "manage_announcements", "view_reports",
    ],
    userCount: 12,
  },
  {
    id: "student",
    name: "Student",
    description: "Access assigned learning content and communication.",
    color: "bg-blue-500",
    permissions: ["view_courses", "send_messages"],
    userCount: 126,
  },
  {
    id: "content-manager",
    name: "Content Manager",
    description: "Build and maintain curriculum content.",
    color: "bg-amber-500",
    permissions: ["view_courses", "create_courses", "edit_courses", "delete_courses", "manage_announcements"],
    userCount: 4,
  },
];

const CATEGORIES: PermissionCategory[] = ["Academic", "People", "Communication", "Administration"];
function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 3 5 6v5c0 4.6 2.8 8.1 7 10 4.2-1.9 7-5.4 7-10V6l-7-3Z" />
      <path d="m9.5 12 1.7 1.7 3.6-3.8" />
    </svg>
  );
}

function ChevronIcon({ collapsed }: { collapsed: boolean }) {
  return (
    <svg viewBox="0 0 20 20" className={`h-4 w-4 transition-transform ${collapsed ? "-rotate-90" : "rotate-0"}`} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m5 7.5 5 5 5-5" />
    </svg>
  );
}

export default function RoleAndPermissionPage() {
  const [roles, setRoles] = useState<Role[]>(INITIAL_ROLES);
  const [activeRoleId, setActiveRoleId] = useState(INITIAL_ROLES[0].id);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [roleName, setRoleName] = useState("");
  const [roleDescription, setRoleDescription] = useState("");
  const [saved, setSaved] = useState(false);
  const [collapsedCategories, setCollapsedCategories] = useState<PermissionCategory[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [roleNameError, setRoleNameError] = useState("");

  const activeRole = roles.find((role) => role.id === activeRoleId) ?? roles[0];
  const filteredPermissions = useMemo(() => {
    const query = search.trim().toLowerCase();
    return query
      ? PERMISSIONS.filter((permission) => `${permission.name} ${permission.description}`.toLowerCase().includes(query))
      : PERMISSIONS;
  }, [search]);

  const updateActiveRole = (updater: (role: Role) => Role) => {
    setRoles((current) => current.map((role) => (role.id === activeRole.id ? updater(role) : role)));
    setSaved(false);
  };

  const togglePermission = (permissionId: string) => {
    updateActiveRole((role) => ({
      ...role,
      permissions: role.permissions.includes(permissionId)
        ? role.permissions.filter((id) => id !== permissionId)
        : [...role.permissions, permissionId],
    }));
  };

  const toggleCategory = (category: PermissionCategory) => {
    const categoryIds = PERMISSIONS.filter((permission) => permission.category === category).map((permission) => permission.id);
    const hasEveryPermission = categoryIds.every((id) => activeRole.permissions.includes(id));
    updateActiveRole((role) => ({
      ...role,
      permissions: hasEveryPermission
        ? role.permissions.filter((id) => !categoryIds.includes(id))
        : Array.from(new Set([...role.permissions, ...categoryIds])),
    }));
  };

  const toggleCategoryBlock = (category: PermissionCategory) => {
    setCollapsedCategories((current) =>
      current.includes(category) ? current.filter((item) => item !== category) : [...current, category]
    );
  };

  const allBlocksHidden = CATEGORIES.every((category) => collapsedCategories.includes(category));

  const toggleAllBlocks = () => {
    setCollapsedCategories(allBlocksHidden ? [] : [...CATEGORIES]);
  };

  const addRole = (event: React.FormEvent) => {
    event.preventDefault();
    const name = roleName.trim();
    if (!name) {
      setRoleNameError("Please enter a role name.");
      return;
    }
    if (roles.some((role) => role.name.toLowerCase() === name.toLowerCase())) {
      setRoleNameError("A role with this name already exists.");
      return;
    }

    const id = `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`;
    const newRole: Role = {
      id,
      name,
      description: roleDescription.trim() || "Custom access role.",
      color: "bg-blue-500",
      permissions: [],
      userCount: 0,
    };
    setRoles((current) => [...current, newRole]);
    setActiveRoleId(id);
    setRoleName("");
    setRoleDescription("");
    setRoleNameError("");
    setShowModal(false);
  };

  const deleteActiveRole = () => {
    if (activeRole.protected) return;
    const remainingRoles = roles.filter((role) => role.id !== activeRole.id);
    setRoles(remainingRoles);
    setActiveRoleId(remainingRoles[0].id);
    setShowDeleteConfirm(false);
  };

  const permissionProgress = Math.round((activeRole.permissions.length / PERMISSIONS.length) * 100);

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Roles & Permissions</h1>
        </div>

      </div>

      <div className="grid min-h-[650px] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-[#111113] dark:shadow-black/30 lg:h-[calc(100vh-190px)] lg:grid-cols-[290px_minmax(0,1fr)]">
        <aside className="flex flex-col border-b border-gray-200 bg-gray-50/70 dark:border-zinc-800 dark:bg-[#171719] lg:border-b-0 lg:border-r">
          <div className="border-b border-gray-200 p-4 dark:border-zinc-800">
            <button
              onClick={() => { setRoleNameError(""); setShowModal(true); }}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#e51b72] px-4 py-3 text-xs font-bold text-white shadow-sm transition-colors hover:bg-[#bd145c]"
            >
              <span className="text-base leading-none">+</span> Add new role
            </button>
          </div>

          <div className="flex-1 p-3">
            <div className="flex items-center justify-between px-2 py-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">Role list</span>
              <span className="rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-bold text-gray-500 dark:bg-zinc-800 dark:text-zinc-400">{roles.length}</span>
            </div>
            <div className="space-y-1.5">
              {roles.map((role) => {
                const isActive = role.id === activeRole.id;
                return (
                  <button
                    key={role.id}
                    onClick={() => { setActiveRoleId(role.id); setSaved(false); }}
                    className={`w-full rounded-xl border p-3 text-left transition-all ${
                      isActive
                        ? "border-pink-300 bg-white shadow-sm ring-1 ring-pink-100 dark:border-[#e51b72]/60 dark:bg-[#232326] dark:ring-[#e51b72]/20"
                        : "border-transparent hover:border-gray-200 hover:bg-white dark:hover:border-zinc-700 dark:hover:bg-[#202023]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`h-9 w-1 rounded-full ${role.color}`} />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2 font-bold text-gray-800">
                          <span className="truncate text-sm">{role.name}</span>
                          {role.protected && <span className="rounded bg-violet-50 px-1.5 py-0.5 text-[9px] uppercase text-violet-600 dark:bg-violet-500/15 dark:text-violet-300">Core</span>}
                        </span>
                        <span className="mt-0.5 block text-[11px] text-gray-400">
                          {role.userCount} users - {role.permissions.length} permissions
                        </span>
                      </span>
                      <span className={`text-lg ${isActive ? "text-[#e51b72]" : "text-gray-300"}`}>›</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        <section className="flex min-w-0 flex-col lg:min-h-0">
          <div className="border-b border-gray-200 px-5 py-5 dark:border-zinc-800 dark:bg-[#141416] sm:px-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-sm ${activeRole.color}`}>
                  <ShieldIcon />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-bold text-gray-900">{activeRole.name}</h2>
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-500 dark:bg-zinc-800 dark:text-zinc-400">{activeRole.userCount} assigned</span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">{activeRole.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!activeRole.protected && (
                  <button onClick={() => setShowDeleteConfirm(true)} className="rounded-xl border border-red-100 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50">
                    Delete role
                  </button>
                )}
                <button
                  onClick={() => { setSaved(true); window.setTimeout(() => setSaved(false), 1800); }}
                  className="rounded-xl bg-[#e51b72] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#bd145c]"
                >
                  {saved ? "Permissions saved" : "Save changes"}
                </button>
              </div>
            </div>
          </div>

          <div className="p-5 dark:bg-[#111113] sm:p-7 lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-gray-800">Permission access</h3>
                <p className="mt-1 text-xs text-gray-500"><span className="font-bold text-[#e51b72]">{activeRole.permissions.length} of {PERMISSIONS.length}</span> permissions enabled</p>
                <div className="mt-2 h-1.5 w-48 overflow-hidden rounded-full bg-gray-100 dark:bg-zinc-800">
                  <div className="h-full rounded-full bg-[#e51b72] transition-all" style={{ width: `${permissionProgress}%` }} />
                </div>
              </div>
              <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
                <button
                  onClick={toggleAllBlocks}
                  className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-xs font-bold text-gray-600 transition-colors hover:border-pink-200 hover:text-[#e51b72] dark:border-zinc-700 dark:bg-[#19191c] dark:text-zinc-300 dark:hover:border-[#e51b72]/50"
                >
                  {allBlocksHidden ? "Expand all" : "Collapse all"}
                </button>
                <label className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-gray-400 focus-within:border-[#e51b72] dark:border-zinc-700 dark:bg-[#19191c] dark:text-zinc-500 sm:w-64 sm:flex-none">
                  <SearchIcon />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search permissions"
                    className="w-full bg-transparent text-xs text-gray-700 outline-none placeholder:text-gray-400 dark:text-zinc-200 dark:placeholder:text-zinc-600"
                  />
                  {search && <button type="button" onClick={() => setSearch("")} className="rounded p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700" aria-label="Clear permission search">x</button>}
                </label>
              </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
              {CATEGORIES.map((category) => {
                const allCategoryPermissions = PERMISSIONS.filter((permission) => permission.category === category);
                const visiblePermissions = filteredPermissions.filter((permission) => permission.category === category);
                if (visiblePermissions.length === 0) return null;
                const selectedCount = allCategoryPermissions.filter((permission) => activeRole.permissions.includes(permission.id)).length;
                const allSelected = selectedCount === allCategoryPermissions.length;
                const isCollapsed = collapsedCategories.includes(category);

                return (
                  <div key={category} className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-zinc-700 dark:bg-[#18181b]">
                    <div className={`flex items-center justify-between bg-gray-50/80 px-4 py-3 dark:bg-[#232326] ${isCollapsed ? "" : "border-b border-gray-100 dark:border-zinc-700"}`}>
                      <button
                        onClick={() => toggleCategoryBlock(category)}
                        aria-expanded={!isCollapsed}
                        className="flex min-w-0 flex-1 items-center gap-3 text-left"
                      >
                        <span className="text-gray-400"><ChevronIcon collapsed={isCollapsed} /></span>
                        <span>
                          <span className="block text-xs font-bold text-gray-800">{category}</span>
                          <span className="mt-0.5 block text-[10px] text-gray-400">{selectedCount} of {allCategoryPermissions.length} selected</span>
                        </span>
                      </button>
                      <button onClick={() => toggleCategory(category)} className="ml-3 text-[11px] font-bold text-[#e51b72] hover:underline">
                        {allSelected ? "Clear all" : "Select all"}
                      </button>
                    </div>
                    {!isCollapsed && (
                      <div className="divide-y divide-gray-100 dark:divide-zinc-700">
                        {visiblePermissions.map((permission) => {
                          const enabled = activeRole.permissions.includes(permission.id);
                          return (
                            <label key={permission.id} className="flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors hover:bg-pink-50/30 dark:hover:bg-white/[0.035]">
                              <input
                                type="checkbox"
                                checked={enabled}
                                onChange={() => togglePermission(permission.id)}
                                className="sr-only"
                              />
                              <span className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${enabled ? "bg-[#e51b72]" : "bg-gray-200 dark:bg-zinc-700"}`}>
                                <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform dark:bg-zinc-100 ${enabled ? "translate-x-[18px]" : "translate-x-0.5"}`} />
                              </span>
                              <span className="min-w-0">
                                <span className="block text-xs font-semibold text-gray-700">{permission.name}</span>
                                <span className="mt-0.5 block text-[10px] leading-4 text-gray-400">{permission.description}</span>
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {filteredPermissions.length === 0 && (
              <div className="rounded-xl border border-dashed border-gray-200 py-12 text-center">
                <p className="text-sm font-semibold text-gray-600">No permissions found</p>
                <p className="mt-1 text-xs text-gray-400">Try a different search term.</p>
                <button onClick={() => setSearch("")} className="mt-3 text-xs font-bold text-[#e51b72] hover:underline">Clear search</button>
              </div>
            )}
          </div>
        </section>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-gray-950/45 p-4" onMouseDown={() => setShowModal(false)}>
          <form onSubmit={addRole} onMouseDown={(event) => event.stopPropagation()} className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-[#18181b]">
            <div className="bg-[#e51b72] px-6 py-5 text-white">
              <h2 className="text-base font-bold">Add new role</h2>
              <p className="mt-1 text-xs text-white/70">Create the role first, then configure its permissions.</p>
            </div>
            <div className="space-y-4 p-6">
              <label className="block">
                <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-gray-500">Role name</span>
                <input autoFocus value={roleName} onChange={(event) => { setRoleName(event.target.value); setRoleNameError(""); }} placeholder="e.g. Lab Coordinator" className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:border-[#e51b72] ${roleNameError ? "border-red-300 bg-red-50/40" : "border-gray-200"}`} />
                {roleNameError && <span className="mt-1.5 block text-[11px] font-medium text-red-600">{roleNameError}</span>}
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-gray-500">Description</span>
                <textarea value={roleDescription} onChange={(event) => setRoleDescription(event.target.value)} placeholder="What can this role do?" rows={3} className="w-full resize-none rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#e51b72]" />
              </label>
            </div>
            <div className="flex justify-end gap-2 border-t border-gray-100 bg-gray-50 px-6 py-4 dark:border-zinc-700 dark:bg-[#202023]">
              <button type="button" onClick={() => setShowModal(false)} className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-white">Cancel</button>
              <button type="submit" className="rounded-xl bg-[#e51b72] px-4 py-2 text-xs font-bold text-white hover:bg-[#bd145c]">Create role</button>
            </div>
          </form>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[210] flex items-center justify-center bg-gray-950/45 p-4" onMouseDown={() => setShowDeleteConfirm(false)}>
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl dark:bg-[#18181b]" onMouseDown={(event) => event.stopPropagation()}>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-xl font-bold text-red-600">!</div>
            <h2 className="mt-4 text-base font-bold text-gray-900">Delete {activeRole.name}?</h2>
            <p className="mt-2 text-xs leading-5 text-gray-500">This role has {activeRole.userCount} assigned users. Deleting it cannot be undone.</p>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setShowDeleteConfirm(false)} className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50">Keep role</button>
              <button onClick={deleteActiveRole} className="rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700">Delete role</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
