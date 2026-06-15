import { API_URLS } from "@/config/apiUrls";
import apiClient from "@/lib/apiClient";
import type {
  CreateRoleRequest,
  EntityId,
  Role,
  UpdateRoleRequest,
} from "@/services/api/types";

export const roleApi = {
  async list(): Promise<Role[]> {
    const { data } = await apiClient.get<Role[]>(API_URLS.roles.list);
    return data;
  },

  async listPermissions(): Promise<string[]> {
    const { data } = await apiClient.get<string[]>(API_URLS.roles.availablePermissions);
    return data;
  },

  async create(role: CreateRoleRequest): Promise<Role> {
    const { data } = await apiClient.post<Role>(API_URLS.roles.create, role);
    return data;
  },

  async update(roleId: EntityId, changes: UpdateRoleRequest): Promise<Role> {
    const { data } = await apiClient.patch<Role>(API_URLS.roles.byId(roleId), changes);
    return data;
  },

  async replacePermissions(roleId: EntityId, permissions: string[]): Promise<Role> {
    const { data } = await apiClient.put<Role>(API_URLS.roles.permissions(roleId), {
      permissions,
    });
    return data;
  },

  async addPermission(roleId: EntityId, permission: string): Promise<void> {
    await apiClient.post(API_URLS.roles.permission(roleId, permission));
  },

  async removePermission(roleId: EntityId, permission: string): Promise<void> {
    await apiClient.delete(API_URLS.roles.permission(roleId, permission));
  },

  async assignUser(roleId: EntityId, userId: EntityId): Promise<void> {
    await apiClient.post(API_URLS.roles.user(roleId, userId));
  },

  async unassignUser(roleId: EntityId, userId: EntityId): Promise<void> {
    await apiClient.delete(API_URLS.roles.user(roleId, userId));
  },

  async remove(roleId: EntityId): Promise<void> {
    await apiClient.delete(API_URLS.roles.byId(roleId));
  },
};
