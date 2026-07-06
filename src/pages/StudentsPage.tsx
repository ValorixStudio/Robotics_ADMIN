import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { studentApi } from "@/services/api";
import type { CreateStudentRequest, Student } from "@/services/api/types";

const inputClass =
  "w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-xs font-semibold text-gray-800 outline-none transition-colors focus:border-[#e51b72] focus:ring-2 focus:ring-[#e51b72]/10";

const emptyStudentForm: CreateStudentRequest = {
  name: "",
  email: "",
  grade: 10,
  courses: 0,
  status: "Active",
};

function formatTime(totalSeconds: number) {
  if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) return "0m 00s";

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.round(totalSeconds % 60);
  return `${minutes}m ${String(seconds).padStart(2, "0")}s`;
}

function getAccuracy(student: Student) {
  return student.quizStats.totalQuestions > 0
    ? Math.round((student.quizStats.correct / student.quizStats.totalQuestions) * 100)
    : 0;
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [form, setForm] = useState<CreateStudentRequest>(emptyStudentForm);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "saving" | "error">("loading");
  const [message, setMessage] = useState("");

  const loadStudents = async () => {
    try {
      setStatus("loading");
      setMessage("");
      const response = await studentApi.list();
      setStudents(response.data);
      setStatus("idle");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Unable to load students from server.");
      setStudents([]);
    }
  };

  useEffect(() => {
    void loadStudents();
  }, []);

  const summary = useMemo(() => {
    const totalSolved = students.reduce((sum, student) => sum + student.quizStats.solved, 0);
    const totalCorrect = students.reduce((sum, student) => sum + student.quizStats.correct, 0);
    const totalQuestions = students.reduce((sum, student) => sum + student.quizStats.totalQuestions, 0);
    const averageAccuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

    return {
      totalStudents: students.length,
      totalSolved,
      averageAccuracy,
      activeLearners: students.filter((student) => student.status === "Active").length,
    };
  }, [students]);

  const saveStudent = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.name.trim()) {
      setStatus("error");
      setMessage("Student name is required.");
      return;
    }

    try {
      setStatus("saving");
      setMessage("");
      await studentApi.create({
        ...form,
        name: form.name.trim(),
        email: form.email?.trim(),
      });
      setForm(emptyStudentForm);
      setIsFormOpen(false);
      await loadStudents();
      setMessage("Student saved.");
      setStatus("idle");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Unable to save student.");
    }
  };

  return (
    <>
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-800">Students</h1>
        <p className="mt-1 text-sm text-gray-500">Live student list from DB with quiz attempts, accuracy, and solve time.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          ["Total students", summary.totalStudents],
          ["Quizzes solved", summary.totalSolved],
          ["Average accuracy", `${summary.averageAccuracy}%`],
          ["Active learners", summary.activeLearners],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400">{label}</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
          {["All", "Active", "Inactive"].map((tab) => (
            <button
              key={tab}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                tab === "All" ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-800"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <button
          onClick={() => setIsFormOpen((open) => !open)}
          className="rounded-xl bg-[#e51b72] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#bd145c]"
        >
          {isFormOpen ? "Close" : "+ Add Student"}
        </button>
      </div>

      {isFormOpen && (
        <form onSubmit={saveStudent} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="grid gap-4 md:grid-cols-5">
            <label>
              <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-gray-500">Name</span>
              <input
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                className={inputClass}
                placeholder="Student name"
              />
            </label>
            <label>
              <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-gray-500">Email</span>
              <input
                type="email"
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                className={inputClass}
                placeholder="student@email.com"
              />
            </label>
            <label>
              <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-gray-500">Grade</span>
              <input
                value={form.grade}
                onChange={(event) => setForm((current) => ({ ...current, grade: event.target.value }))}
                className={inputClass}
                placeholder="10"
              />
            </label>
            <label>
              <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-gray-500">Courses</span>
              <input
                type="number"
                min={0}
                value={form.courses}
                onChange={(event) => setForm((current) => ({ ...current, courses: Number(event.target.value) }))}
                className={inputClass}
              />
            </label>
            <div className="flex items-end">
              <button
                disabled={status === "saving"}
                className="w-full rounded-lg bg-gray-900 px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-[#e51b72] disabled:cursor-wait disabled:opacity-70"
              >
                {status === "saving" ? "Saving..." : "Save student"}
              </button>
            </div>
          </div>
        </form>
      )}

      {message && (
        <div
          className={`rounded-xl border px-4 py-3 text-xs font-semibold ${
            status === "error" ? "border-red-100 bg-red-50 text-red-700" : "border-green-100 bg-green-50 text-green-700"
          }`}
        >
          {message}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-xs font-semibold uppercase text-gray-500">
                <th className="p-4 text-left">Student</th>
                <th className="p-4 text-left">Quizzes solved</th>
                <th className="p-4 text-left">Correct</th>
                <th className="p-4 text-left">Accuracy</th>
                <th className="p-4 text-left">Avg time</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-left">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {students.map((student) => {
                const accuracy = getAccuracy(student);
                const solvedPercent =
                  student.quizStats.total > 0
                    ? Math.round((student.quizStats.solved / student.quizStats.total) * 100)
                    : 0;
                const accuracyClass =
                  accuracy >= 85 ? "text-green-600" : accuracy >= 70 ? "text-orange-500" : "text-red-600";
                const statusClass =
                  student.status === "Active" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700";

                return (
                  <tr key={student.id} className="hover:bg-gray-50/50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gray-900 text-xs font-bold text-white">
                          {student.name[0]}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800">{student.name}</div>
                          <div className="font-mono text-[10px] text-gray-400">{student.id}</div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="p-4">
                      <div className="min-w-28">
                        <div className="flex justify-between text-xs font-bold text-gray-700">
                          <span>
                            {student.quizStats.solved}/{student.quizStats.total}
                          </span>
                          <span>{solvedPercent}%</span>
                        </div>
                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-100">
                          <div className="h-full rounded-full bg-[#e51b72]" style={{ width: `${solvedPercent}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-xs font-bold text-gray-700">
                      {student.quizStats.correct}/{student.quizStats.totalQuestions}
                    </td>
                    <td className="p-4">
                      <b className={`text-xs ${accuracyClass}`}>{accuracy}%</b>
                    </td>
                    <td className="p-4 text-xs font-semibold text-gray-600">
                      {formatTime(student.quizStats.averageTimeSeconds)}
                    </td>
                    <td className="p-4">
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusClass}`}>
                        {student.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <Link
                        to={`/learnerprofile?studentId=${encodeURIComponent(student.id)}`}
                        state={{ student }}
                        className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-600 transition-colors hover:bg-gray-50"
                      >
                        Profile
                      </Link>
                    </td>
                  </tr>
                );
              })}

              {students.length === 0 && (
                <tr>
                  <td colSpan={9} className="p-10 text-center">
                    <p className="text-sm font-bold text-gray-800">
                      {status === "loading" ? "Loading students..." : "No students found"}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">Connect the students API or add a new student.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
