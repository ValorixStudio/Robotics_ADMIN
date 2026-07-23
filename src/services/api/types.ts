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
  description?: string;
  instructorName: string;
  moduleCount: number;
  coverColor: string;
  subject?: string;
  subjectId?: string;
  subjectImage?: string;
  classLevel?: string;
  ageRange?: string;
  videoCount?: number;
  schedule?: string;
  projects?: Array<{
    title: string;
    summaries: string[];
    videoUrl?: string;
    videoFileName?: string;
  }>;
  upcoming?: Array<{
    day: string;
    title: string;
  }>;
  readyFormat?: string[];
  status?: Exclude<CourseStatus, "ALL"> | "Published" | "Draft" | "Archived";
}

export interface UpdateCourseRequest {
  title?: string;
  description?: string;
  instructorName?: string;
  moduleCount?: number;
  coverColor?: string;
  progress?: number;
  studentCount?: number;
  subject?: string;
  subjectId?: string;
  subjectImage?: string;
  classLevel?: string;
  ageRange?: string;
  videoCount?: number;
  schedule?: string;
  projects?: CreateCourseRequest["projects"];
  upcoming?: CreateCourseRequest["upcoming"];
  readyFormat?: string[];
  status?: CreateCourseRequest["status"];
}

export interface Course extends CreateCourseRequest {
  id: string;
  progress?: number;
  studentCount?: number;
  status?: Exclude<CourseStatus, "ALL">;
  createdAt?: string;
  updatedAt?: string;
}

export type CurriculumModuleStatus = "Draft" | "Live";

export interface CreateCurriculumModuleRequest {
  week: number;
  class?: string;
  engineeringLevel?: string;
  description: string;
  theoryTopics: string[];
  practicalActivities: string[];
  status?: CurriculumModuleStatus;
  courseId?: string | null;
}

export type UpdateCurriculumModuleRequest = Partial<CreateCurriculumModuleRequest>;

export interface CurriculumModule extends CreateCurriculumModuleRequest {
  id: string;
  status: CurriculumModuleStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface StudentQuizStats {
  solved: number;
  total: number;
  correct: number;
  totalQuestions: number;
  averageTimeSeconds: number;
}

export interface Student {
  id: string;
  name: string;
  email?: string;
  grade: number | string;
  courses: number;
  attendance?: string;
  status: "Active" | "Inactive";
  quizStats: StudentQuizStats;
}

export interface CreateStudentRequest {
  name: string;
  email?: string;
  grade: number | string;
  courses?: number;
  status?: "Active" | "Inactive";
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
