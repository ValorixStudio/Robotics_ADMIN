import { API_URLS } from "@/config/apiUrls";
import apiClient from "@/lib/apiClient";
import type {
  Course,
  CourseListParams,
  CreateCourseRequest,
  EntityId,
  PaginatedResponse,
  UpdateCourseRequest,
} from "@/services/api/types";

export const courseApi = {
  async list(params: CourseListParams = {}): Promise<PaginatedResponse<Course>> {
    const { data } = await apiClient.get<PaginatedResponse<Course>>(API_URLS.courses.list, {
      params: { page: 1, limit: 20, status: "ALL", ...params },
    });
    return data;
  },

  async create(course: CreateCourseRequest): Promise<Course> {
    const { data } = await apiClient.post<Course>(API_URLS.courses.create, course);
    return data;
  },

  async update(courseId: EntityId, changes: UpdateCourseRequest): Promise<Course> {
    const { data } = await apiClient.patch<Course>(API_URLS.courses.byId(courseId), changes);
    return data;
  },

  async publish(courseId: EntityId): Promise<Course> {
    const { data } = await apiClient.post<Course>(API_URLS.courses.publish(courseId));
    return data;
  },

  async archive(courseId: EntityId): Promise<Course> {
    const { data } = await apiClient.post<Course>(API_URLS.courses.archive(courseId));
    return data;
  },

  async remove(courseId: EntityId): Promise<void> {
    await apiClient.delete(API_URLS.courses.byId(courseId));
  },
};
