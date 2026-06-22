export type EntityId = string | number;

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest extends LoginRequest {
  name: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role?: string;
}

/** Supports the common response wrappers while the backend contract settles. */
export interface AuthResponse {
  accessToken?: string;
  token?: string;
  user?: AuthUser;
  data?: {
    accessToken?: string;
    token?: string;
    user?: AuthUser;
  };
}

export type CourseStatus = "ALL" | "DRAFT" | "PUBLISHED" | "ARCHIVED";

export interface CourseListParams {
  page?: number;
  limit?: number;
  status?: CourseStatus;
}

export interface CreateCourseRequest {
  title: string;
  description: string;
  instructorName: string;
  moduleCount: number;
  coverColor: string;
}

export interface UpdateCourseRequest {
  title?: string;
  description?: string;
  instructorName?: string;
  moduleCount?: number;
  coverColor?: string;
  progress?: number;
  studentCount?: number;
}

export interface Course extends CreateCourseRequest {
  id: string;
  progress?: number;
  studentCount?: number;
  status?: Exclude<CourseStatus, "ALL">;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
}

export interface CreateRoleRequest {
  name: string;
  description: string;
}

export interface UpdateRoleRequest {
  name?: string;
  description?: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions?: string[];
  usersCount?: number;
}

export type GuideMediaType = "IMAGE" | "VIDEO";

export interface GuideLink {
  label: string;
  url: string;
}

export interface GuideSection {
  title: string;
  content: string;
  sortOrder: number;
  mediaType?: GuideMediaType;
  mediaUrl?: string;
  links?: GuideLink[];
}

export interface CreateComponentGuideRequest {
  name: string;
  slug: string;
  iconUrl?: string;
  sections: GuideSection[];
}

export type UpdateComponentGuideRequest = CreateComponentGuideRequest;

export interface ComponentGuide extends CreateComponentGuideRequest {
  id: string;
  _id?: string;
}

export type CreateCircuitRequest = CreateComponentGuideRequest;

export interface Circuit extends CreateCircuitRequest {
  id: string;
}

export interface MediaUploadResponse {
  url: string;
  filename?: string;
  type?: GuideMediaType;
}
