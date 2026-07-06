import { API_URLS } from "@/config/apiUrls";
import apiClient from "@/lib/apiClient";
import type {
  CreateCurriculumModuleRequest,
  CurriculumModule,
  EntityId,
  UpdateCurriculumModuleRequest,
} from "@/services/api/types";

type DataResponse<T> = T | { data: T };

function unwrapData<T>(response: DataResponse<T>) {
  return "data" in Object(response) ? (response as { data: T }).data : (response as T);
}

export const curriculumModuleApi = {
  async list(): Promise<CurriculumModule[]> {
    const { data } = await apiClient.get<DataResponse<CurriculumModule[]>>(
      API_URLS.curriculumModules.list,
    );
    return unwrapData(data);
  },

  async create(module: CreateCurriculumModuleRequest): Promise<CurriculumModule> {
    const { data } = await apiClient.post<DataResponse<CurriculumModule>>(
      API_URLS.curriculumModules.create,
      module,
    );
    return unwrapData(data);
  },

  async update(
    moduleId: EntityId,
    changes: UpdateCurriculumModuleRequest,
  ): Promise<CurriculumModule> {
    const { data } = await apiClient.patch<DataResponse<CurriculumModule>>(
      API_URLS.curriculumModules.byId(moduleId),
      changes,
    );
    return unwrapData(data);
  },

  async remove(moduleId: EntityId): Promise<void> {
    await apiClient.delete(API_URLS.curriculumModules.byId(moduleId));
  },
};
