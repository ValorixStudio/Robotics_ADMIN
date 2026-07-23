import { FormEvent, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { ChevronDown, FileText, Plus, Trash2 } from "lucide-react";
import { courseApi } from "@/services/api";
import { SubjectPicker } from "@/components/SubjectPicker";
import { colors, fromApiCourse, type AdminCourse, type ProjectItem } from "./CoursesPage";

type CourseStatus = "Published" | "Draft" | "Archived";
type ApiCourseStatus = "PUBLISHED" | "DRAFT" | "ARCHIVED";
type CKEditorConstructor = React.ComponentProps<typeof CKEditor>["editor"];

const classicEditor = ClassicEditor as unknown as CKEditorConstructor;

const classOptions = [
  "Class 3",
  "Class 4",
  "Class 5",
  "Class 6",
  "Class 7",
  "Class 8",
  "Class 9",
  "Class 10",
  "Class 11",
  "Class 12",
  "Engineering",
];

type CourseDraft = Omit<AdminCourse, "id" | "apiId" | "projects" | "upcoming" | "readyFormat"> & {
  subjectId?: string;
  projects: ProjectItem[];
  upcomingText: string;
  readyFormatText: string;
};

const emptyDraft: CourseDraft = {
  title: "",
  subject: "",
  subjectId: "",
  subjectImage: "",
  instructorName: "Admin",
  classLevel: "Class 6",
  ageRange: "11-12",
  studentCount: 0,
  videoCount: 1,
  schedule: "Weekly",
  status: "Draft",
  coverColor: colors[0],
  projects: [{ title: "", summaries: [""], videoUrl: "", videoFileName: "" }],
  upcomingText: "",
  readyFormatText: "What They Build\nMaterials Needed\nTime & Difficulty",
};

function draftFromCourse(course: AdminCourse): CourseDraft {
  return {
    title: course.title,
    subject: course.subject || "",
    subjectId: course.subjectId || "",
    subjectImage: course.subjectImage || "",
    instructorName: course.instructorName,
    classLevel: course.classLevel,
    ageRange: course.ageRange,
    studentCount: course.studentCount,
    videoCount: course.videoCount,
    schedule: course.schedule,
    status: course.status,
    coverColor: course.coverColor,
    projects: course.projects.map((p) => ({
      ...p,
      summaries: p.summaries?.length ? [...p.summaries] : [""],
    })),
    upcomingText: course.upcoming.map((t) => `${t.day} | ${t.title}`).join("\n"),
    readyFormatText: course.readyFormat.join("\n"),
  };
}

function courseFromDraft(draft: CourseDraft, current?: AdminCourse): AdminCourse {
  const projects = draft.projects
    .filter((p) => p.title.trim())
    .map((p) => ({
      title: p.title.trim(),
      summaries: p.summaries.filter(Boolean).length ? p.summaries : ["Click to expand project details"],
      videoUrl: p.videoUrl || "",
      videoFileName: p.videoFileName || "",
    }));

  const upcoming = draft.upcomingText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [day, ...titleParts] = line.split("|");
      return { day: day.trim(), title: titleParts.join("|").trim() || "Upcoming task" };
    });

  const readyFormat = draft.readyFormatText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return {
    id: current?.id ?? crypto.randomUUID(),
    apiId: current?.apiId,
    title: draft.title.trim(),
    subject: draft.subject.trim() || "General",
    subjectId: draft.subjectId || "",
    subjectImage: draft.subjectImage || "",
    instructorName: draft.instructorName.trim() || "Admin",
    classLevel: draft.classLevel.trim() || "Class 6",
    ageRange: draft.ageRange.trim() || "11-12",
    studentCount: Number(draft.studentCount) || 0,
    videoCount: Number(draft.videoCount) || projects.length,
    schedule: draft.schedule.trim() || "Weekly",
    status: draft.status,
    coverColor: draft.coverColor,
    projects: projects.length ? projects : [{ title: "New Project", summaries: ["Click to expand project details"] }],
    upcoming: upcoming.length ? upcoming : [],
    readyFormat: readyFormat.length ? readyFormat : [],
  };
}

// ─── Video Upload Field ────────────────────────────────────────────────────────
interface VideoUploadFieldProps {
  index: number;
  project: ProjectItem;
  onChange: (index: number, updated: ProjectItem) => void;
}

function VideoUploadField({ index, project, onChange }: VideoUploadFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState("");

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["video/mp4", "video/webm", "video/ogg", "video/quicktime", "video/x-msvideo"];
    if (!allowedTypes.includes(file.type)) {
      setUploadError("Only MP4, WebM, OGG, MOV, or AVI videos are supported.");
      return;
    }
    if (file.size > 500 * 1024 * 1024) {
      setUploadError("Video must be smaller than 500MB.");
      return;
    }

    setUploadError("");
    setUploadProgress(0);

    try {
      const localUrl = URL.createObjectURL(file);
      for (let p = 10; p <= 90; p += 20) {
        await new Promise((res) => setTimeout(res, 150));
        setUploadProgress(p);
      }
      setUploadProgress(100);
      onChange(index, { ...project, videoUrl: localUrl, videoFileName: file.name });
      setTimeout(() => setUploadProgress(null), 1000);
    } catch {
      setUploadError("Upload failed. Please try again.");
      setUploadProgress(null);
    }
  };

  const clearVideo = () => {
    onChange(index, { ...project, videoUrl: "", videoFileName: "" });
    if (fileInputRef.current) fileInputRef.current.value = "";
    setUploadProgress(null);
    setUploadError("");
  };

  const isObjectUrl = project.videoUrl?.startsWith("blob:");

  return (
    <div className="space-y-3">
      <div className="flex gap-1 rounded-lg bg-gray-100 p-1 w-fit">
        <button
          type="button"
          onClick={() => { if (isObjectUrl || !project.videoUrl) clearVideo(); }}
          className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${!isObjectUrl ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
        >
          🔗 From URL
        </button>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${isObjectUrl ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
        >
          📁 Upload File
        </button>
      </div>

      {!isObjectUrl && (
        <input
          type="url"
          value={project.videoUrl || ""}
          onChange={(e) => { onChange(index, { ...project, videoUrl: e.target.value, videoFileName: "" }); setUploadError(""); }}
          placeholder="https://youtube.com/... or direct video link"
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-[#e51b72] focus:ring-1 focus:ring-[#e51b72]"
        />
      )}

      <input ref={fileInputRef} type="file" accept="video/mp4,video/webm,video/ogg,video/quicktime,video/x-msvideo" onChange={handleFileChange} className="hidden" />

      {uploadProgress !== null && (
        <div className="space-y-1.5">
          <div className="h-2 w-full rounded-full bg-gray-200">
            <div className="h-2 rounded-full bg-[#e51b72] transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
          </div>
          <p className="text-xs font-semibold text-gray-500">
            {uploadProgress < 100 ? `Uploading... ${uploadProgress}%` : "✓ Upload complete"}
          </p>
        </div>
      )}

      {project.videoFileName && uploadProgress === null && (
        <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 px-4 py-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-green-600">🎬</span>
            <span className="truncate text-xs font-semibold text-green-700">{project.videoFileName}</span>
          </div>
          <button type="button" onClick={clearVideo} className="ml-2 flex-shrink-0 text-xs font-semibold text-red-600 hover:text-red-700">
            Remove
          </button>
        </div>
      )}

      {project.videoUrl && !isObjectUrl && !project.videoFileName && (
        <div className="flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
          <span className="truncate text-xs font-semibold text-blue-700">{project.videoUrl}</span>
          <button type="button" onClick={clearVideo} className="ml-2 flex-shrink-0 text-xs font-semibold text-red-600 hover:text-red-700">
            Remove
          </button>
        </div>
      )}

      {uploadError && <p className="text-xs font-semibold text-red-600">{uploadError}</p>}
    </div>
  );
}

// ─── Project Summaries with CKEditor ──────────────────────────────────────────
interface ProjectSummariesProps {
  projectIndex: number;
  summaries: string[];
  onChange: (summaries: string[]) => void;
}

function ProjectSummaries({ projectIndex, summaries, onChange }: ProjectSummariesProps) {
  const addSummary = () => onChange([...summaries, ""]);

  const removeSummary = (i: number) => {
    if (summaries.length === 1) return;
    onChange(summaries.filter((_, idx) => idx !== i));
  };

  const updateSummary = (i: number, value: string) => {
    onChange(summaries.map((s, idx) => (idx === i ? value : s)));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-sm font-semibold text-gray-800">
            Content Sections
          </label>
          <p className="text-xs text-gray-500 mt-0.5">
            {summaries.length} section{summaries.length > 1 ? "s" : ""} · rich text supported
          </p>
        </div>
        <button
          type="button"
          onClick={addSummary}
          className="flex items-center gap-1.5 rounded-lg border border-[#e51b72] bg-white px-3 py-1.5 text-xs font-semibold text-[#e51b72] hover:bg-[#e51b72] hover:text-white transition-colors"
        >
          <span className="text-sm leading-none">+</span> Add Section
        </button>
      </div>

      {summaries.map((summary, i) => (
        <div key={`summary-${projectIndex}-${i}`} className="rounded-lg border border-gray-200 bg-white overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between bg-gray-50 px-4 py-3 border-b border-gray-200">
            <span className="text-xs font-semibold uppercase text-gray-500">
              Section {summaries.length > 1 ? i + 1 : ""}
            </span>
            {summaries.length > 1 && (
              <button
                type="button"
                onClick={() => removeSummary(i)}
                className="text-xs font-semibold text-red-600 hover:text-red-700 transition-colors"
              >
                Remove Section
              </button>
            )}
          </div>

          {/* CKEditor */}
          <div className="ck-summary-wrapper text-sm">
            <CKEditor
              key={`ck-${projectIndex}-${i}`}
              editor={classicEditor}
              data={summary}
              onChange={(_event: any, editor: any) => updateSummary(i, editor.getData())}
              config={{
                toolbar: ["bold", "italic", "underline", "|", "bulletedList", "numberedList", "|", "link"],
                placeholder: "Write project description here...",
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
type CourseSectionId = "info" | "projects";

function CourseFormSection({
  id,
  title,
  summary,
  open,
  onToggle,
  children,
  action,
}: {
  id: CourseSectionId;
  title: string;
  summary: string;
  open: boolean;
  onToggle: (id: CourseSectionId) => void;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-4 px-5 py-4">
        <button
          type="button"
          onClick={() => onToggle(id)}
          className="min-w-0 flex-1 text-left"
          aria-expanded={open}
        >
          <span className="block text-[15px] font-bold text-gray-900">{title}</span>
          <span className="mt-1 block truncate text-xs font-semibold text-gray-500">{summary}</span>
        </button>
        <div className="flex items-center gap-3">
          {action}
          <button
            type="button"
            onClick={() => onToggle(id)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-gray-50 text-gray-500 transition-colors hover:border-[#e51b72] hover:bg-pink-50 hover:text-[#e51b72]"
            aria-label={open ? `Collapse ${title}` : `Expand ${title}`}
          >
            <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
          </button>
        </div>
      </div>

      <div className={`grid transition-all duration-200 ease-in-out ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
        <div className="overflow-hidden">
          <div className="border-t border-gray-100 p-6 sm:p-8">{children}</div>
        </div>
      </div>
    </section>
  );
}

export default function AddCoursesPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const mode = location.state?.mode || "create";
  const courseId = location.state?.courseId;
  const courseCount = location.state?.courseCount || 0;

  const [draft, setDraft] = useState<CourseDraft>(emptyDraft);
  const [currentCourse, setCurrentCourse] = useState<AdminCourse | undefined>(undefined);
  const [loadingCourse, setLoadingCourse] = useState(mode === "edit");
  const [status, setStatus] = useState<"idle" | "saving">("idle");
  const [message, setMessage] = useState("");
  const [expandedProject, setExpandedProject] = useState<number | null>(null);
  const [openSections, setOpenSections] = useState<CourseSectionId[]>(["info"]);

  const toggleSection = (sectionId: CourseSectionId) => {
    setOpenSections((current) =>
      current.includes(sectionId) ? current.filter((id) => id !== sectionId) : [...current, sectionId],
    );
  };

  // Load course if editing
  useEffect(() => {
    if (mode === "edit" && courseId) {
      let isMounted = true;
      setLoadingCourse(true);
      setMessage("");

      courseApi
        .get(courseId)
        .then((course) => {
          if (!isMounted) return;
          const mappedCourse = fromApiCourse(course);
          setCurrentCourse(mappedCourse);
          setDraft(draftFromCourse(mappedCourse));
          setLoadingCourse(false);
        })
        .catch(() => {
          if (!isMounted) return;
          setMessage("Could not load course details.");
          setLoadingCourse(false);
        });

      return () => {
        isMounted = false;
      };
    } else if (mode === "create") {
      setDraft({ ...emptyDraft, coverColor: colors[courseCount % colors.length] });
      setCurrentCourse(undefined);
      setLoadingCourse(false);
    }
  }, [mode, courseId, courseCount]);

  const addProject = () => {
    setDraft((d) => ({ ...d, projects: [...d.projects, { title: "", summaries: [""], videoUrl: "", videoFileName: "" }] }));
    setOpenSections((current) => (current.includes("projects") ? current : [...current, "projects"]));
  };

  const removeProject = (index: number) => {
    setDraft((d) => ({ ...d, projects: d.projects.filter((_, i) => i !== index) }));
    if (expandedProject === index) setExpandedProject(null);
  };

  const updateProject = (index: number, updated: ProjectItem) => {
    setDraft((d) => ({ ...d, projects: d.projects.map((p, i) => (i === index ? updated : p)) }));
  };

  const updateProjectSummaries = (projectIndex: number, summaries: string[]) => {
    setDraft((d) => ({
      ...d,
      projects: d.projects.map((p, i) => (i === projectIndex ? { ...p, summaries } : p)),
    }));
  };

  const saveCourse = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draft.title.trim() || !draft.subject.trim() || !draft.classLevel.trim()) {
      setStatus("idle");
      setMessage("Course title, subject aur class required hai.");
      return;
    }

    const existingCourse = currentCourse;
    const nextCourse = courseFromDraft(draft, existingCourse);

    // Full structured payload — projects/upcoming/readyFormat as real arrays,
    // plus subjectId sent alongside subject name.
    const apiStatus: ApiCourseStatus =
      nextCourse.status === "Published" ? "PUBLISHED" : nextCourse.status === "Archived" ? "ARCHIVED" : "DRAFT";

    const payload = {
      title: nextCourse.title,
      subject: nextCourse.subject,
      subjectId: nextCourse.subjectId || "",
      subjectImage: nextCourse.subjectImage || "",
      classLevel: nextCourse.classLevel,
      ageRange: nextCourse.ageRange,
      instructorName: nextCourse.instructorName,
      moduleCount: nextCourse.projects.length,
      videoCount: nextCourse.videoCount,
      schedule: nextCourse.schedule,
      coverColor: nextCourse.coverColor,
      studentCount: nextCourse.studentCount,
      projects: nextCourse.projects,
      upcoming: nextCourse.upcoming,
      readyFormat: nextCourse.readyFormat,
      status: apiStatus,
    };

    try {
      setStatus("saving");
      setMessage("");
      if (mode === "edit" && (existingCourse?.apiId || courseId)) {
        const saved = await courseApi.update(existingCourse?.apiId || courseId, {
          ...payload,
          progress: existingCourse?.status === "Published" ? 100 : 0,
        });
        nextCourse.apiId = saved.id;
      } else {
        const saved = await courseApi.create(payload);
        nextCourse.id = saved.id;
        nextCourse.apiId = saved.id;
      }
    } catch {
      setStatus("idle");
      setMessage("Could not save course. Please try again.");
      return;
    }

    setStatus("idle");
    navigate("/courses");
  };

  if (loadingCourse) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 text-sm font-semibold text-gray-500">
        Loading course...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-gray-200 bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-[#e51b72]">
              {mode === "edit" ? "edit-courses" : "add-courses"}
            </p>
            <h1 className="mt-1 text-2xl font-bold text-gray-900">
              {mode === "edit" ? "Edit Course" : "Create Course"}
            </h1>
            <p className="mt-1 text-sm text-gray-500">Open a section, update the details, then save.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate("/courses")}
              className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50"
            >
              Back
            </button>
            <button
              type="submit"
              form="course-form"
              disabled={status === "saving"}
              className="rounded-lg bg-[#e51b72] px-5 py-2 text-xs font-bold text-white hover:bg-[#bd145c] disabled:opacity-50"
            >
              {status === "saving" ? "Saving..." : mode === "edit" ? "Update Course" : "Create Course"}
            </button>
          </div>
        </div>
      </div>

      <form id="course-form" onSubmit={saveCourse} className="max-w-6xl mx-auto px-6 py-8 space-y-5">
        <div className="grid gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:grid-cols-4">
          {[
            { label: "Course", value: draft.title || "Untitled" },
            { label: "Subject", value: draft.subject || "Not selected" },
            { label: "Class", value: draft.classLevel || "Not selected" },
            { label: "Projects", value: String(draft.projects.length) },
          ].map((item) => (
            <div key={item.label} className="rounded-lg bg-gray-50 px-4 py-3">
              <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400">{item.label}</p>
              <p className="mt-1 truncate text-sm font-bold text-gray-800">{item.value}</p>
            </div>
          ))}
        </div>
        <CourseFormSection
          id="info"
          title="Course Information"
          summary={`${draft.classLevel || "Class"} / ${draft.subject || "Subject"} / ${draft.title || "Course title"}`}
          open={openSections.includes("info")}
          onToggle={toggleSection}
        >

          <div className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Class <span className="text-red-600">*</span>
                </label>
                <select
                  value={draft.classLevel}
                  onChange={(e) => setDraft({ ...draft, classLevel: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-[#e51b72] focus:ring-1 focus:ring-[#e51b72]"
                >
                  {classOptions.map((classOption) => (
                    <option key={classOption} value={classOption}>
                      {classOption}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Subject <span className="text-red-600">*</span>
                </label>

                 <SubjectPicker
                  value={draft.subject}
                  onChange={(name: string, id?: string, image?: string) =>
                    setDraft({
                      ...draft,
                      subject: name,
                      subjectId: name ? (id ?? draft.subjectId) : "",
                      subjectImage: name ? (image ?? draft.subjectImage) : "",
                    })
                  }
                />
              </div>

              
            </div>
            {/* Course Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Course Title <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                placeholder="e.g., Web Development Basics"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-[#e51b72] focus:ring-1 focus:ring-[#e51b72]"
              />
            </div>


            {/* Three Column Layout */}
            <div className="grid gap-6 md:grid-cols-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Age Range
                </label>
                <input
                  type="text"
                  value={draft.ageRange}
                  onChange={(e) => setDraft({ ...draft, ageRange: e.target.value })}
                  placeholder="e.g., 11-12"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-[#e51b72] focus:ring-1 focus:ring-[#e51b72]"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Number of Students
                </label>
                <input
                  type="number"
                  value={draft.studentCount}
                  onChange={(e) => setDraft({ ...draft, studentCount: Number(e.target.value) })}
                  placeholder="0"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-[#e51b72] focus:ring-1 focus:ring-[#e51b72]"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Total Videos
                </label>
                <input
                  type="number"
                  value={draft.videoCount}
                  onChange={(e) => setDraft({ ...draft, videoCount: Number(e.target.value) })}
                  placeholder="0"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-[#e51b72] focus:ring-1 focus:ring-[#e51b72]"
                />
              </div>
            </div>
          </div>
        </CourseFormSection>

        <CourseFormSection
          id="projects"
          title="Projects"
          summary={`${draft.projects.length} project${draft.projects.length === 1 ? "" : "s"} / ${draft.projects.filter((project) => project.videoUrl).length} video${draft.projects.filter((project) => project.videoUrl).length === 1 ? "" : "s"} attached`}
          open={openSections.includes("projects")}
          onToggle={toggleSection}
          action={
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                addProject();
              }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#e51b72] px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#bd145c]"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Project
            </button>
          }
        >

          <div className="space-y-4">
            {draft.projects.map((project, idx) => (
              <div key={idx} className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                {/* Project Header */}
                <div className="flex items-center justify-between border-b border-gray-100 bg-white px-5 py-4">
                  <span className="rounded-md bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-700">
                    Project {idx + 1}
                  </span>
                  {draft.projects.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeProject(idx)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-red-100 bg-red-50 px-2.5 py-1.5 text-xs font-bold text-red-600 hover:bg-red-100"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Remove
                    </button>
                  )}
                </div>

                {/* Project Content */}
                <div className="space-y-5 bg-white p-5">
                  {/* Project Title */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Project Title <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={project.title}
                      onChange={(e) => updateProject(idx, { ...project, title: e.target.value })}
                      placeholder="e.g., Build a Todo App"
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-[#e51b72] focus:ring-1 focus:ring-[#e51b72]"
                    />
                  </div>

                  {/* Description Accordion */}
                  <div className="rounded-lg border border-gray-200 overflow-hidden bg-white">
                    <button
                      type="button"
                      onClick={() => setExpandedProject(expandedProject === idx ? null : idx)}
                      className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left transition-colors hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-pink-50 text-[0px] text-[#e51b72]">
                          <FileText className="h-4 w-4" />
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-800">Project Description</p>
                          <p className="truncate text-xs text-gray-500">
                            {project.summaries.filter((s) => s.trim() && s !== "<p></p>").length > 0
                              ? `${project.summaries.filter((s) => s.trim() && s !== "<p></p>").length} section${project.summaries.length > 1 ? "s" : ""} added`
                              : "No content yet — click to add"}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`inline-flex flex-shrink-0 items-center justify-center text-[0px] text-gray-400 transition-transform duration-200 ${expandedProject === idx ? "rotate-180" : ""}`}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </span>
                    </button>

                    <div
                      className={`grid transition-all duration-200 ease-in-out ${expandedProject === idx ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
                    >
                      <div className="overflow-hidden">
                        <div className="border-t border-gray-200 bg-gray-50/60 p-5">
                          <ProjectSummaries
                            projectIndex={idx}
                            summaries={project.summaries}
                            onChange={(summaries) => updateProjectSummaries(idx, summaries)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Video Section */}
                  <div className="border-t border-gray-200 pt-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Project Video
                    </label>
                    <VideoUploadField index={idx} project={project} onChange={updateProject} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CourseFormSection>

        {/* Action Buttons */}
        <div className="flex gap-4 pb-8">
          <button
            type="button"
            onClick={() => navigate("/courses")}
            className="flex-1 rounded-lg border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={status === "saving"}
            className="flex-1 rounded-lg bg-[#e51b72] px-6 py-3 text-sm font-semibold text-white hover:bg-[#bd145c] disabled:opacity-50 transition-colors"
          >
            {status === "saving" ? "Saving..." : mode === "edit" ? "Update Course" : "Create Course"}
          </button>
        </div>

        {message && (
          <div className={`p-4 rounded-lg text-sm font-semibold ${message.includes("Error") ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
            {message}
          </div>
        )}
      </form>
    </div>
  );
}
