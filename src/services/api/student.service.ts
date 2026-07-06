import { API_URLS } from "@/config/apiUrls";
import apiClient from "@/lib/apiClient";
import type { CreateStudentRequest, PaginatedResponse, Student } from "@/services/api/types";

type StudentListResponse = PaginatedResponse<Student> | Student[] | { students: Student[] };

function normalizeStudentList(response: StudentListResponse): PaginatedResponse<Student> {
  if (Array.isArray(response)) {
    return {
      data: response,
      page: 1,
      limit: response.length,
      total: response.length,
    };
  }

  if ("students" in response) {
    return {
      data: response.students,
      page: 1,
      limit: response.students.length,
      total: response.students.length,
    };
  }

  return response;
}

export const studentApi = {
  async list(): Promise<PaginatedResponse<Student>> {
    const { data } = await apiClient.get<StudentListResponse>(API_URLS.students.list);
    return normalizeStudentList(data);
  },

  async create(student: CreateStudentRequest): Promise<Student> {
    const { data } = await apiClient.post<Student>(API_URLS.students.create, student);
    return data;
  },
};
