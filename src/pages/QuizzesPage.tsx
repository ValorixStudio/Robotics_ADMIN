import { useEffect, useState } from "react";
import { CheckCircle2, Edit3, FilePlus2, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast, type Id } from "react-toastify";
import { LoadStatusBanner } from "../components/quizzesPage/LoadStatusBanner";
import { normalizeLevel, useQuizData } from "../components/quizzesPage/quizData";
import type { QuizSetSummary } from "../lib/types";

const gradeOptions = [
  { value: "3", label: "Class 3" },
  { value: "4", label: "Class 4" },
  { value: "5", label: "Class 5" },
  { value: "6", label: "Class 6" },
  { value: "7", label: "Class 7" },
  { value: "8", label: "Class 8" },
  { value: "9", label: "Class 9" },
  { value: "10", label: "Class 10" },
  { value: "11", label: "Class 11" },
  { value: "12", label: "Class 12" },
  { value: "engineering", label: "Engineering" },
];

function showConfirmToast({
  title,
  message,
  confirmLabel,
  variant = "primary",
  onConfirm,
}: {
  title: string;
  message: string;
  confirmLabel: string;
  variant?: "primary" | "danger";
  onConfirm: () => void;
}) {
  let toastId: Id;
  toastId = toast(
    <div className="space-y-3">
      <div>
        <p className="text-sm font-black text-gray-950">{title}</p>
        <p className="mt-1 text-xs font-semibold leading-5 text-gray-600">{message}</p>
      </div>
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() => toast.dismiss(toastId)}
          className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs font-black text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => {
            toast.dismiss(toastId);
            onConfirm();
          }}
          className={`rounded-md px-3 py-1.5 text-xs font-black text-white ${
            variant === "danger" ? "bg-red-600 hover:bg-red-700" : "bg-[#e51b72] hover:bg-[#c91662]"
          }`}
        >
          {confirmLabel}
        </button>
      </div>
    </div>,
    {
      autoClose: false,
      closeOnClick: false,
      draggable: false,
      closeButton: false,
    },
  );
}

export default function QuizzesPage() {
  const navigate = useNavigate();
  const { findCourseForLevel, loadQuizSets, updateQuizSetStatus, deleteQuizSetById } = useQuizData();
  const [level, setLevel] = useState("6");
  const [courseId, setCourseId] = useState("");
  const [classLevel, setClassLevel] = useState("");
  const [quizSets, setQuizSets] = useState<QuizSetSummary[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");

  async function loadTable(nextLevel = level) {
    setStatus("loading");
    setMessage(`Loading quizzes for ${normalizeLevel(nextLevel)}...`);
    try {
      const course = await findCourseForLevel(nextLevel);
      const sets = await loadQuizSets(course.courseId, course.classLevel);
      setCourseId(course.courseId);
      setClassLevel(course.classLevel);
      setQuizSets(sets);
      setStatus("idle");
      setMessage(`${sets.length} quiz${sets.length === 1 ? "" : "zes"} loaded for ${course.classLevel}.`);
    } catch (error) {
      setCourseId("");
      setClassLevel("");
      setQuizSets([]);
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Could not load quizzes.");
    }
  }

  useEffect(() => {
    void loadTable(level);
  }, [level]);

  function addQuiz() {
    navigate(`/quizzes/add?level=${encodeURIComponent(level)}`);
  }

  function editQuiz(quizSetId: string) {
    navigate(`/quizzes/edit/${encodeURIComponent(quizSetId)}?level=${encodeURIComponent(level)}`);
  }

  async function changeQuizStatus(quizSet: QuizSetSummary, nextStatus: "draft" | "live") {
    if (quizSet.status === nextStatus) return;

    try {
      setStatus("loading");
      setMessage(nextStatus === "live" ? "Publishing quiz..." : "Moving quiz to draft...");
      const updated = await updateQuizSetStatus(quizSet.id, nextStatus);
      setQuizSets((current) => current.map((item) => (item.id === quizSet.id ? { ...item, ...updated } : item)));
      setStatus("idle");
      setMessage(nextStatus === "live" ? "Quiz is live now." : "Quiz moved to draft.");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Could not update quiz status.");
    }
  }

  async function deleteQuiz(quizSet: QuizSetSummary) {
    if (quizSet.status === "live") return;
    try {
      await deleteQuizSetById(quizSet.id);
      setQuizSets((current) => current.filter((item) => item.id !== quizSet.id));
      setMessage("Quiz deleted.");
      setStatus("idle");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Could not delete quiz.");
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-gray-100 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-black text-gray-950">Quizzes</h1>
            <p className="mt-1 text-sm font-semibold text-gray-500">
              Select a class, review created quizzes, or open the builder to add a new quiz.
            </p>
          </div>
          <button
            type="button"
            onClick={addQuiz}
            disabled={!courseId || status === "loading"}
            className="inline-flex h-11 items-center gap-2 rounded-lg bg-[#e51b72] px-4 text-sm font-black text-white shadow-sm hover:bg-[#c91662] disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500"
          >
            <FilePlus2 className="h-4 w-4" />
            Add Quiz
          </button>
        </div>

        <div className="grid gap-4 border-b border-gray-100 p-5 md:grid-cols-[260px_minmax(0,1fr)]">
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-black uppercase tracking-wide text-gray-500">Class</span>
            <select
              value={level}
              onChange={(event) => setLevel(event.target.value)}
              className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm font-bold text-gray-900 shadow-sm outline-none focus:border-[#e51b72] focus:ring-2 focus:ring-[#e51b72]/10"
            >
              {gradeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <div className="flex items-end">
            <div className="rounded-lg bg-gray-50 px-4 py-3 text-sm font-bold text-gray-600">
              Showing {quizSets.length} quiz{quizSets.length === 1 ? "" : "zes"} for {classLevel || normalizeLevel(level)}
            </div>
          </div>
        </div>

        <div className="px-5 pt-4">
          <LoadStatusBanner status={status} message={message} />
        </div>

        <div className="overflow-x-auto p-5">
          <table className="w-full min-w-[860px] text-left">
            <thead className="bg-gray-50 text-[11px] font-black uppercase tracking-wide text-gray-500">
              <tr>
                <th className="rounded-l-lg px-4 py-3">No.</th>
                <th className="px-4 py-3">Quiz Name</th>
                <th className="px-4 py-3">Class</th>
                <th className="px-4 py-3">Questions</th>
                <th className="px-4 py-3">Sections</th>
                <th className="px-4 py-3">Status</th>
                <th className="rounded-r-lg px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {quizSets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-sm font-bold text-gray-500">
                    No quizzes found. Click Add Quiz to create one.
                  </td>
                </tr>
              ) : (
                quizSets.map((quizSet, index) => {
                  const isLive = quizSet.status === "live";
                  return (
                    <tr key={quizSet.id} className="bg-white hover:bg-gray-50">
                      <td className="px-4 py-3 font-black text-gray-900">{index + 1}</td>
                      <td className="px-4 py-3">
                        <div className="font-black text-gray-950">{quizSet.title || "Untitled quiz"}</div>
                        <div className="mt-1 text-xs font-semibold text-gray-400">{quizSet.id}</div>
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-gray-600">{quizSet.classLevel}</td>
                      <td className="px-4 py-3 text-sm font-bold text-gray-600">{quizSet._count?.questions ?? 0}</td>
                      <td className="px-4 py-3 text-sm font-bold text-gray-600">{quizSet._count?.sections ?? 0}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-black uppercase ${isLive ? "bg-gray-950 text-white" : "bg-pink-50 text-[#e51b72]"}`}>
                          {quizSet.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => editQuiz(quizSet.id)}
                            className="inline-flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-xs font-black text-gray-700 hover:bg-gray-50"
                          >
                            <Edit3 className="h-4 w-4" />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              showConfirmToast({
                                title: isLive ? "Move quiz to draft?" : "Make quiz live?",
                                message: isLive
                                  ? "Students will no longer see this quiz, and you can edit it again."
                                  : "Students will be able to attempt this quiz after it goes live.",
                                confirmLabel: isLive ? "Move Draft" : "Make Live",
                                onConfirm: () => void changeQuizStatus(quizSet, isLive ? "draft" : "live"),
                              })
                            }
                            className={`inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-xs font-black ${
                              isLive
                                ? "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
                                : "border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
                            }`}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            {isLive ? "Move Draft" : "Make Live"}
                          </button>
                          <button
                            type="button"
                            disabled={isLive}
                            onClick={() =>
                              showConfirmToast({
                                title: "Delete quiz?",
                                message: "This will delete the quiz and all of its sections and questions.",
                                confirmLabel: "Delete",
                                variant: "danger",
                                onConfirm: () => void deleteQuiz(quizSet),
                              })
                            }
                            className="inline-flex h-9 items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 text-xs font-black text-red-600 hover:bg-red-100 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
