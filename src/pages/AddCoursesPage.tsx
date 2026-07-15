import { FormEvent, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { courseApi } from "@/services/api";
import { SubjectPicker } from "@/components/SubjectPicker";
import { colors, normalizeSummaries, type AdminCourse, type ProjectItem } from "./CoursesPage";

type CourseStatus = "Published" | "Draft" | "Archived";
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
    // @ts-expect-error - subjectId may not exist on older AdminCourse records yet
    subjectId: course.subjectId || "",
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
    // @ts-expect-error - subjectId may not exist on older AdminCourse type yet
    subjectId: draft.subjectId || "",
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
export default function AddCoursesPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [draft, setDraft] = useState<CourseDraft>(emptyDraft);
  const [status, setStatus] = useState<"idle" | "saving">("idle");
  const [message, setMessage] = useState("");
  const [expandedProject, setExpandedProject] = useState<number | null>(null);

  const mode = location.state?.mode || "create";
  const courseId = location.state?.courseId;
  const courseCount = location.state?.courseCount || 0;

  // Load course if editing
  useEffect(() => {
    if (mode === "edit" && courseId) {
      // const courses = loadLocalCourses();
      // const course = courses.find((c) => c.id === courseId);
      // if (course) {
      //   setDraft(draftFromCourse(course));
      // }
    } else if (mode === "create") {
      setDraft({ ...emptyDraft, coverColor: colors[courseCount % colors.length] });
    }
  }, [mode, courseId, courseCount]);

  const addProject = () => {
    setDraft((d) => ({ ...d, projects: [...d.projects, { title: "", summaries: [""], videoUrl: "", videoFileName: "" }] }));
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

    const courses =[];
    const existingCourse = courseId ? courses.find((c) => c.id === courseId) : undefined;
    const nextCourse = courseFromDraft(draft, existingCourse);

    // Full structured payload — projects/upcoming/readyFormat as real arrays,
    // plus subjectId sent alongside subject name.
    const payload = {
      title: nextCourse.title,
      subject: nextCourse.subject,
      // @ts-expect-error - subjectId may not exist on older AdminCourse type yet
      subjectId: nextCourse.subjectId || "",
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
      status: nextCourse.status,
    };

    try {
      setStatus("saving");
      setMessage("");
      if (existingCourse?.apiId) {
        const saved = await courseApi.update(existingCourse.apiId, {
          ...payload,
          progress: existingCourse.status === "Published" ? 100 : 0,
        });
        nextCourse.apiId = saved.id;
      } else {
        const saved = await courseApi.create(payload);
        nextCourse.id = saved.id;
        nextCourse.apiId = saved.id;
      }
    } catch {
      setMessage("Saved locally. The API is not available right now.");
    }

    const nextCourses = existingCourse
      ? courses.map((c) => (c.id === existingCourse.id ? nextCourse : c))
      : [nextCourse, ...courses];

    setStatus("idle");
    navigate("/courses");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-gray-200 bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {mode === "edit" ? "Edit Course" : "Create New Course"}
            </h1>
            <p className="mt-1 text-sm text-gray-500">Add project details, summaries, and videos</p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/courses")}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ✕
          </button>
        </div>
      </div>

      <form onSubmit={saveCourse} className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Basic Information Section */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Course Information</h2>

          <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
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
                  onChange={(name: string, id?: string) =>
                    setDraft({ ...draft, subject: name, subjectId: name ? (id ?? draft.subjectId) : "" })
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
            <div className="grid grid-cols-3 gap-6">
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
        </div>

        {/* Projects Section */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">Projects</h2>
            <button
              type="button"
              onClick={addProject}
              className="flex items-center gap-2 rounded-lg bg-[#e51b72] px-4 py-2 text-sm font-semibold text-white hover:bg-[#bd145c] transition-colors"
            >
              <span>+</span> Add Project
            </button>
          </div>

          <div className="space-y-6">
            {draft.projects.map((project, idx) => (
              <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                {/* Project Header */}
                <div className="bg-gray-100 border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700">
                    Project {idx + 1}
                  </span>
                  {draft.projects.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeProject(idx)}
                      className="text-sm font-semibold text-red-600 hover:text-red-700"
                    >
                      Remove Project
                    </button>
                  )}
                </div>

                {/* Project Content */}
                <div className="p-6 space-y-6">
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
                      className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left transition-colors hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-pink-50 text-[#e51b72]">
                          📝
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
                        className={`flex-shrink-0 text-gray-400 transition-transform duration-200 ${expandedProject === idx ? "rotate-180" : ""}`}
                      >
                        ▾
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
        </div>

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
