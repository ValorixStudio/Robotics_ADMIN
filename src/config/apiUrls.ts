/** Central registry for every backend endpoint used by the admin app. */
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4010";

type ResourceId = string | number;

export const API_URLS = {
  auth: {
    login: "/auth/login",
    register: "/auth/register",
    profile: "/auth/me",
  },
  courses: {
    list: "/courses",
    create: "/courses",
    byId: (courseId: ResourceId) => `/courses/${courseId}`,
    publish: (courseId: ResourceId) => `/courses/${courseId}/publish`,
    archive: (courseId: ResourceId) => `/courses/${courseId}/archive`,
  },
  roles: {
    list: "/roles",
    create: "/roles",
    availablePermissions: "/roles/permissions",
    byId: (roleId: ResourceId) => `/roles/${roleId}`,
    permissions: (roleId: ResourceId) => `/roles/${roleId}/permissions`,
    permission: (roleId: ResourceId, permission: string) =>
      `/roles/${roleId}/permissions/${encodeURIComponent(permission)}`,
    user: (roleId: ResourceId, userId: ResourceId) =>
      `/roles/${roleId}/users/${userId}`,
  },
  componentGuides: {
    create: "/component-guides",
    uploadMedia: "/component-guides/media/upload",
  },
} as const;
