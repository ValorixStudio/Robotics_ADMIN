/** Central registry for every backend endpoint used by the admin app. */
export const getEnvironment = () => {
  const hostname = window.location.hostname;

  if (hostname.startsWith("uat.")) return "uat";
  if (hostname.startsWith("partner.")) return "live";

  return "uat";
};

export const LIVE_API_URL = import.meta.env.VITE_LIVE_API_URL;
export const UAT_API_URL = import.meta.env.VITE_UAT_API_URL;
export const API_KEY = import.meta.env.VITE_API_KEY;
export const CRYPTO_PUBLIC_KEY = import.meta.env.VITE_CRYPTO_PUBLIC_KEY;
export const SOCKET_SECRET_ID = import.meta.env.VITE_SOCKET_SECRET_ID;

export const env = getEnvironment();
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ??
  (env === "uat" ? UAT_API_URL : LIVE_API_URL) ??
  "http://localhost:4010";

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
    byId: (guideId: ResourceId) => `/component-guides/${guideId}`,
    uploadMedia: "/component-guides/media/upload",
    mediaList: "/component-guides/media",
    deleteMedia: "/component-guides/media/delete-multiple-image",
  },
  circuits: {
    create: "/circuits",
  },
} as const;
