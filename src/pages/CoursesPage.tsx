import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { courseApi } from "@/services/api";
import type { Course as ApiCourse } from "@/services/api/types";

type CourseStatus = "Published" | "Draft" | "Archived";
type ApiStatus = "PUBLISHED" | "DRAFT" | "ARCHIVED" | "ALL";

interface ProjectItem {
  title: string;
  summaries: string[];
  videoUrl?: string;
  videoFileName?: string;
}

interface UpcomingTask {
  day: string;
  title: string;
}

interface AdminCourse {
  id: string;
  title: string;
  subject: string;
  instructorName: string;
  classLevel: string;
  ageRange: string;
  studentCount: number;
  videoCount: number;
  schedule: string;
  status: CourseStatus;
  coverColor: string;
  projects: ProjectItem[];
  upcoming: UpcomingTask[];
  readyFormat: string[];
}

export type { AdminCourse, ProjectItem, UpcomingTask, CourseStatus };

export const colors = ["#0ea5e9", "#22c55e", "#f59e0b", "#e51b72", "#7c3aed", "#14b8a6"];

const PAGE_LIMIT = 50;

const FILTER_TO_API_STATUS: Record<"All" | CourseStatus, ApiStatus> = {
  All: "ALL",
  Published: "PUBLISHED",
  Draft: "DRAFT",
  Archived: "ARCHIVED",
};

function statusFromApi(status?: string): CourseStatus {
  if (status === "PUBLISHED") return "Published";
  if (status === "ARCHIVED") return "Archived";
  return "Draft";
}

function fromApiCourse(course: any): AdminCourse {
  return {
    id: course.id,
    title: course.title,
    subject: course.subjectName ?? course.subject?.name ?? "General",
    instructorName: course.instructorName,
    classLevel: course.classLevel ?? "Class 6",
    ageRange: course.ageRange ?? "11-12",
    studentCount: course.studentCount ?? 0,
    videoCount: course.videoCount ?? course.moduleCount ?? 0,
    schedule: course.schedule ?? "Weekly",
    status: statusFromApi(course.status),
    coverColor: course.coverColor || colors[0],
    projects: (course.projects || []).map((p: any) => ({
      title: p.title,
      summaries: Array.isArray(p.summaries) && p.summaries.length ? p.summaries : [""],
      videoUrl: p.videoUrl,
      videoFileName: p.videoFileName,
    })),
    upcoming: course.upcoming || [],
    readyFormat: course.readyFormat || [],
  };
}

export default function CoursesPage() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [filter, setFilter] = useState<"All" | CourseStatus>("All");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState<"idle" | "loading">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let isMounted = true;
    setStatus("loading");
    courseApi
      .list({ page, limit: PAGE_LIMIT, status: FILTER_TO_API_STATUS[filter] })
      .then((response) => {
        if (!isMounted) return;
        const data = response;
        console.log("Courses API Response:", data);
        const apiCourses = (data.courses || []).map(fromApiCourse);
        setCourses(apiCourses);
        setTotalPages(data.pagination?.pages ?? 1);
        setTotal(data.pagination?.total ?? apiCourses.length);
        setStatus("idle");
      })
      .catch(() => {
        if (!isMounted) return;
        setCourses([]);
        setStatus("idle");
        setMessage("Courses load nahi ho paye.");
      });
    return () => {
      isMounted = false;
    };
  }, [page, filter]);

  const changeFilter = (tab: "All" | CourseStatus) => {
    setFilter(tab);
    setPage(1);
  };

  const updateStatus = async (course: AdminCourse, nextStatus: CourseStatus) => {
    try {
      if (nextStatus === "Published") await courseApi.publish(course.id);
      if (nextStatus === "Archived") await courseApi.archive(course.id);
      setCourses((prev) => prev.map((c) => (c.id === course.id ? { ...c, status: nextStatus } : c)));
      setMessage(`Course ${nextStatus} ho gaya.`);
    } catch {
      setMessage("Status update fail ho gaya.");
    }
  };

  const deleteCourse = async (course: AdminCourse) => {
    try {
      await courseApi.remove(course.id);
      setCourses((prev) => prev.filter((c) => c.id !== course.id));
      setTotal((t) => Math.max(0, t - 1));
      setMessage("Course delete ho gaya.");
    } catch {
      setMessage("Delete fail ho gaya.");
    }
  };

  return (
    <>
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-800">Courses</h1>
          <p className="mt-1 text-sm text-gray-500">Projects aur videos ke saath student-facing course banayein.</p>
        </div>
        <button
          onClick={() => navigate("/add-courses", { state: { mode: "create" } })}
          className="rounded-xl bg-[#e51b72] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#bd145c]"
        >
          + New Course
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
          {(["All", "Published", "Draft", "Archived"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => changeFilter(tab)}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${filter === tab ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-800"}`}
            >
              {tab}
            </button>
          ))}
        </div>
        {message && <span className="text-xs font-semibold text-gray-500">{message}</span>}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full min-w-[860px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-xs font-semibold uppercase text-gray-500">
              <th className="p-4 text-left">Course</th>
              <th className="p-4 text-left">Projects</th>
              <th className="p-4 text-left">Audience</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {courses.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-xs font-semibold text-gray-400">
                  {status === "loading" ? "Loading..." : 'Koi course nahi mila. "+ New Course" se banayein.'}
                </td>
              </tr>
            )}
            {courses.map((course) => (
              <tr key={course.id} className="hover:bg-gray-50/50">
                <td className="p-4">
                  <div className="font-bold text-gray-900">{course.title}</div>
                  <div className="text-xs font-semibold text-gray-400">
                    {course.subject} | {course.instructorName}
                  </div>
                </td>
                <td className="p-4">
                  <div className="text-xs font-bold text-gray-600">
                    {course.projects.length} projects, {course.videoCount} videos
                  </div>
                  <div className="mt-0.5 text-[11px] text-gray-400">
                    {course.projects.filter((p) => p.videoUrl).length} / {course.projects.length} videos attached
                  </div>
                </td>
                <td className="p-4 text-xs font-bold text-gray-600">
                  {course.classLevel}, age {course.ageRange}
                </td>
                <td className="p-4">
                  <span className="rounded-full bg-sky-50 px-2 py-1 text-[11px] font-bold text-sky-700">
                    {course.status}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => navigate("/add-courses", { state: { mode: "edit", courseId: course.id } })}
                      className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                    >
                      Edit
                    </button>
                    {course.status !== "Published" && (
                      <button
                        onClick={() => updateStatus(course, "Published")}
                        className="rounded-lg border border-green-200 px-3 py-1.5 text-xs font-semibold text-green-700 hover:bg-green-50"
                      >
                        Publish
                      </button>
                    )}
                    {course.status !== "Archived" && (
                      <button
                        onClick={() => updateStatus(course, "Archived")}
                        className="rounded-lg border border-amber-200 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-50"
                      >
                        Archive
                      </button>
                    )}
                    <button
                      onClick={() => deleteCourse(course)}
                      className="rounded-lg border border-red-100 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {total > 0 && (
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-semibold text-gray-500">
            Page {page} of {totalPages} · {total} total courses
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </>
  );
}