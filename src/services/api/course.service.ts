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

interface CourseListResponse {
  ok?: boolean;
  courses?: Course[];
  data?: Course[];
  pagination?: {
    page?: number;
    limit?: number;
    total?: number;
    pages?: number;
  };
  page?: number;
  limit?: number;
  total?: number;
}

interface CourseDetailResponse {
  course?: Course;
  data?: Course;
}

function normalizeCourseList(response: Course[] | CourseListResponse): PaginatedResponse<Course> & {
  courses: Course[];
  pagination: { page: number; limit: number; total: number; pages: number };
} {
  const courses = Array.isArray(response) ? response : response.courses ?? response.data ?? [];
  const page = Array.isArray(response) ? 1 : response.pagination?.page ?? response.page ?? 1;
  const limit = Array.isArray(response) ? courses.length : response.pagination?.limit ?? response.limit ?? courses.length;
  const total = Array.isArray(response) ? courses.length : response.pagination?.total ?? response.total ?? courses.length;
  const pages = Array.isArray(response)
    ? 1
    : response.pagination?.pages ?? Math.max(1, Math.ceil(total / Math.max(1, limit || courses.length || 1)));

  return {
    data: courses,
    courses,
    page,
    limit,
    total,
    pagination: { page, limit, total, pages },
  };
}

function normalizeCourseDetail(response: Course | CourseDetailResponse): Course {
  if ("course" in response && response.course) return response.course;
  if ("data" in response && response.data) return response.data;
  return response as Course;
}

export const courseApi = {
  async list(params: CourseListParams = {}) {
    const { data } = await apiClient.get<Course[] | CourseListResponse>(API_URLS.courses.list, {
      params: { page: 1, limit: 20, status: "ALL", ...params },
    });
    return normalizeCourseList(data);
  },

  async get(courseId: EntityId): Promise<Course> {
    const { data } = await apiClient.get<Course | CourseDetailResponse>(API_URLS.courses.byId(courseId));
    return normalizeCourseDetail(data);
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
