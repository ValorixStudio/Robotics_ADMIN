import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Clock3, RefreshCw, Save, Search } from "lucide-react";
import { API_BASE_URL } from "@/config/apiUrls";
import { useGetter } from "@/hooks/getter";
import { useSetter } from "@/hooks/setter";

type QuizAttempt = {
  id: string;
  courseId?: string | null;
  classLevel?: string;
  quizIds?: string[];
  score: number;
  total: number;
  percentage: number;
  timeToSolveSeconds?: number;
  createdAt: string;
  status?: "pending" | "checked" | "completed" | "submitted";
  student?: {
    id?: string;
    name?: string;
    email?: string;
    classLevel?: string | null;
  } | null;
  course?: {
    title?: string;
    instructorName?: string;
  } | null;
};

type ReviewQuestion = {
  id: string;
  prompt: string;
  imageUrl?: string;
  questionImageUrl?: string;
  questionImage?: string;
  image?: string;
  questionType?: string;
  options: string[];
  answer: string;
  explanation?: string;
  selectedAnswer?: string;
  timeSpentSeconds?: number;
  marksObtained?: number;
  questionMarks?: number;
};

type ReviewSection = {
  key: string;
  label: string;
  heading: string;
  bloomLevel: string;
  targetMarks: number;
  targetTimeMinutes: number;
  questions: ReviewQuestion[];
};

type ReviewDetails = {
  attempt: QuizAttempt;
  sections: ReviewSection[];
};

function formatDuration(seconds = 0) {
  if (!seconds || seconds <= 0) return "Not tracked";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes <= 0) return `${remainingSeconds}s`;
  return `${minutes}m ${remainingSeconds}s`;
}

function formatSolvedMinutes(seconds = 0) {
  if (!seconds || seconds <= 0) return "Not tracked";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes <= 0) return `${remainingSeconds} sec`;
  return `${minutes} min${remainingSeconds ? ` ${remainingSeconds} sec` : ""}`;
}

function getMediaPreviewUrl(url?: string) {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;

  return `${API_BASE_URL.replace(/\/$/, "")}/${url.replace(/^\//, "")}`;
}

function getQuestionImageUrl(question: ReviewQuestion) {
  return question.imageUrl || question.questionImageUrl || question.questionImage || question.image || "";
}

function statusText(status?: string) {
  if (status === "checked" || status === "completed") return "Checked";
  return "Pending";
}

function studentLabel(attempt?: QuizAttempt | null) {
  return attempt?.student?.name || attempt?.student?.email || "Student";
}

export default function QuizReviewPage() {
  const { callGetter } = useGetter();
  const { callSetter } = useSetter();
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [selectedAttemptId, setSelectedAttemptId] = useState("");
  const [details, setDetails] = useState<ReviewDetails | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [statusFilter, setStatusFilter] = useState<"pending" | "checked" | "all">("pending");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const selectedAttempt = details?.attempt ?? attempts.find((attempt) => attempt.id === selectedAttemptId) ?? null;
  const isChecked = selectedAttempt?.status === "checked" || selectedAttempt?.status === "completed";

  const filteredAttempts = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return attempts;
    return attempts.filter((attempt) =>
      [
        attempt.student?.name,
        attempt.student?.email,
        attempt.course?.title,
        attempt.classLevel,
        attempt.status,
        attempt.id,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(needle)),
    );
  }, [attempts, query]);

  const totalDraftMarks = useMemo(
    () => Object.values(scores).reduce((sum, value) => sum + (Number(value) || 0), 0),
    [scores],
  );

  const totalReviewMarks = useMemo(
    () =>
      details?.sections.reduce(
        (sum, section) =>
          sum + section.questions.reduce((questionSum, question) => questionSum + Number(question.questionMarks ?? 1), 0),
        0,
      ) ?? selectedAttempt?.total ?? 0,
    [details, selectedAttempt?.total],
  );

  async function loadAttempts(nextStatus = statusFilter) {
    setLoading(true);
    setError("");
    try {
      const data = await callGetter<{ attempts?: QuizAttempt[]; ok?: boolean }>({
        url: `${API_BASE_URL}/quizzes/review-attempts`,
        bodyData: { status: nextStatus },
      });
      if (!data || data.ok === false) throw new Error("Invalid attempts response");
      const nextAttempts = Array.isArray(data?.attempts) ? data.attempts : [];
      setAttempts(nextAttempts);
      if (!selectedAttemptId && nextAttempts[0]?.id) {
        setSelectedAttemptId(nextAttempts[0].id);
      }
    } catch (loadError) {
      console.error(loadError);
      setError("Could not load quiz attempts.");
    } finally {
      setLoading(false);
    }
  }

  async function loadDetails(attemptId: string) {
    if (!attemptId) return;
    setDetailsLoading(true);
    setError("");
    try {
      const data = await callGetter<ReviewDetails & { ok?: boolean }>({
        url: `${API_BASE_URL}/quizzes/history-detials`,
        bodyData: { attemptId },
      });
      if (!data || data.ok === false || !data?.attempt || !Array.isArray(data?.sections)) {
        throw new Error("Invalid review response");
      }
      setDetails(data);
      const nextScores: Record<string, number> = {};
      data.sections.forEach((section: ReviewSection) => {
        section.questions.forEach((question) => {
          nextScores[question.id] = Number(question.marksObtained ?? 0);
        });
      });
      setScores(nextScores);
    } catch (loadError) {
      console.error(loadError);
      setError("Could not load review details.");
    } finally {
      setDetailsLoading(false);
    }
  }

  async function saveMarks() {
    if (!selectedAttemptId || !details) return;
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const payload = {
        scores: details.sections.flatMap((section) =>
          section.questions.map((question) => {
            const maxMarks = Number(question.questionMarks ?? 1);

            return {
              quizId: question.id,
              marksObtained: Math.min(maxMarks, Math.max(0, Number(scores[question.id] ?? 0))),
            };
          }),
        ),
      };
      const data = await callSetter<ReviewDetails & { ok?: boolean }>({
        url: `${API_BASE_URL}/quizzes/review-attempts/${selectedAttemptId}/grade`,
        method: "put",
        bodyData: payload,
      });
      if (!data || data.ok === false || !data?.attempt || !Array.isArray(data?.sections)) {
        throw new Error("Invalid grade response");
      }
      setDetails({ attempt: data.attempt, sections: data.sections });
      setAttempts((current) =>
        current.map((attempt) => (attempt.id === data.attempt.id ? data.attempt : attempt)),
      );
      setMessage("Marks saved. Quiz status is now checked.");
    } catch (saveError) {
      console.error(saveError);
      setError("Could not save marks.");
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    void loadAttempts(statusFilter);
  }, [statusFilter]);

  useEffect(() => {
    if (selectedAttemptId) void loadDetails(selectedAttemptId);
  }, [selectedAttemptId]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-950">Quiz Review</h1>
          <p className="mt-1 text-sm font-semibold text-gray-500">
            Teachers can review pending student attempts and assign marks for each question.
          </p>
        </div>
        <button
          type="button"
          onClick={() => loadAttempts(statusFilter)}
          className="inline-flex h-10 items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 text-sm font-bold text-gray-700 hover:bg-gray-50"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {(message || error) && (
        <div className={`rounded-lg border px-4 py-3 text-sm font-bold ${error ? "border-red-200 bg-red-50 text-red-700" : "border-green-200 bg-green-50 text-green-700"}`}>
          {error || message}
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex gap-2">
            {(["pending", "checked", "all"] as const).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`h-9 rounded-md px-3 text-xs font-black capitalize ${statusFilter === status ? "bg-[#e51b72] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
              >
                {status}
              </button>
            ))}
          </div>

          <label className="mt-4 flex h-10 items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-500">
            <Search size={16} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search class, course, attempt..."
              className="min-w-0 flex-1 bg-transparent font-semibold outline-none"
            />
          </label>

          <div className="mt-4 space-y-2">
            {loading && <div className="py-8 text-center text-sm font-bold text-gray-500">Loading attempts...</div>}
            {!loading && filteredAttempts.length === 0 && (
              <div className="rounded-lg bg-gray-50 p-4 text-sm font-bold text-gray-500">No attempts found.</div>
            )}
            {!loading && filteredAttempts.map((attempt) => (
              <button
                key={attempt.id}
                type="button"
                onClick={() => setSelectedAttemptId(attempt.id)}
                className={`w-full rounded-lg border p-3 text-left transition ${selectedAttemptId === attempt.id ? "border-[#e51b72] bg-[#fff3f8]" : "border-gray-200 bg-white hover:bg-gray-50"}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-black text-gray-950">{attempt.course?.title || attempt.classLevel || "Quiz"}</div>
                    <div className="mt-1 text-xs font-black text-[#e51b72]">{studentLabel(attempt)}</div>
                    <div className="mt-1 text-xs font-bold text-gray-500">{new Date(attempt.createdAt).toLocaleDateString()}</div>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase ${statusText(attempt.status) === "Checked" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
                    {statusText(attempt.status)}
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[11px] font-bold text-gray-500">
                  <span className="rounded-md bg-gray-50 px-2 py-1">{attempt.total} Qs</span>
                  <span className="rounded-md bg-gray-50 px-2 py-1">{formatSolvedMinutes(attempt.timeToSolveSeconds)}</span>
                  <span className="rounded-md bg-gray-50 px-2 py-1">{attempt.score}/{attempt.total}</span>
                </div>
              </button>
            ))}
          </div>
        </aside>

        <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          {!selectedAttempt && (
            <div className="py-16 text-center text-sm font-bold text-gray-500">Select an attempt to review.</div>
          )}

          {selectedAttempt && (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-4">
                <div>
                  <h2 className="text-xl font-black text-gray-950">{selectedAttempt.course?.title || "Quiz attempt"}</h2>
                  <p className="mt-1 text-sm font-black text-[#e51b72]">
                    Student: {studentLabel(selectedAttempt)}
                    {selectedAttempt.student?.email && selectedAttempt.student.email !== selectedAttempt.student.name
                      ? ` (${selectedAttempt.student.email})`
                      : ""}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-gray-500">
                    {selectedAttempt.classLevel || "Class"} · {new Date(selectedAttempt.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="grid gap-2 sm:grid-cols-3">
                  <span className="rounded-lg bg-gray-50 px-3 py-2 text-xs font-black text-gray-600">
                    Status: {statusText(selectedAttempt.status)}
                  </span>
                  <span className="rounded-lg border border-[#e51b72]/20 bg-[#fff3f8] px-3 py-2 text-xs font-black text-[#e51b72]">
                    Solved in: {formatSolvedMinutes(selectedAttempt.timeToSolveSeconds)}
                  </span>
                  <span className="rounded-lg bg-gray-50 px-3 py-2 text-xs font-black text-gray-600">
                    Draft marks: {totalDraftMarks}/{totalReviewMarks}
                  </span>
                </div>
              </div>

              {detailsLoading && <div className="py-12 text-center text-sm font-bold text-gray-500">Loading review...</div>}

              {!detailsLoading && details?.sections.map((section) => (
                <div key={section.key} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h3 className="text-base font-black text-gray-950">{section.label} - {section.heading}</h3>
                      <p className="text-xs font-bold text-gray-500">{section.bloomLevel || "Review section"}</p>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-gray-500">
                      {section.questions.length} questions
                    </span>
                  </div>

                  <div className="space-y-3">
                    {section.questions.map((question, questionIndex) => {
                      const isShortQuestion = String(question.questionType ?? "").toLowerCase() === "short";
                      const tipsText = question.explanation || "Review the student's written response and assign marks based on the expected concept.";
                      const maxMarks = Number(question.questionMarks ?? 1);
                      const questionImageUrl = getQuestionImageUrl(question);

                      return (
                      <div key={question.id} className="rounded-lg border border-gray-200 bg-white p-4">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-black text-gray-950">
                              {questionIndex + 1}. {question.prompt || (questionImageUrl ? "Image question" : "Question")}
                            </p>
                            {questionImageUrl && (
                              <div className="mt-3 max-w-xl overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                                <img
                                  src={getMediaPreviewUrl(questionImageUrl)}
                                  alt="Question"
                                  className="max-h-80 w-full object-contain"
                                />
                              </div>
                            )}
                            <div className="mt-3 grid gap-2 text-sm font-semibold text-gray-600 md:grid-cols-2">
                              <div className="rounded-md bg-gray-50 p-3">
                                <span className="font-black text-gray-900">Student answer: </span>
                                {question.selectedAnswer || "Not answered"}
                              </div>
                              <div className="rounded-md bg-gray-50 p-3">
                                <span className="font-black text-gray-900">
                                  {isShortQuestion ? "Tips: " : "Correct answer: "}
                                </span>
                                {isShortQuestion ? tipsText : question.answer || "Not available"}
                              </div>
                            </div>
                            <div className="mt-2 text-xs font-bold text-gray-500">
                              Time spent: {formatDuration(question.timeSpentSeconds)}
                            </div>
                          </div>

                          <label className="w-32">
                            <span className="mb-1 flex items-center justify-between text-xs font-black uppercase text-gray-500">
                              <span>Marks</span>
                              <span className="rounded-full bg-[#fff1f6] px-2 py-0.5 text-[10px] text-[#e51b72]">
                                Max {maxMarks}
                              </span>
                            </span>
                            <input
                              type="number"
                              min={0}
                              max={maxMarks}
                              value={scores[question.id] ?? 0}
                              onChange={(event) => {
                                const nextValue = Math.min(
                                  maxMarks,
                                  Math.max(0, Number(event.target.value) || 0),
                                );

                                setScores((current) => ({
                                  ...current,
                                  [question.id]: nextValue,
                                }));
                              }}
                              className="h-11 w-full rounded-lg border border-gray-200 px-3 text-center text-sm font-black outline-none focus:border-[#e51b72]"
                            />
                          </label>
                        </div>
                      </div>
                    );
                    })}
                  </div>
                </div>
              ))}

              <div className="sticky bottom-0 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 bg-white py-4">
                <div className="text-sm font-bold text-gray-500">
                  After saving, the status will become <span className="text-gray-950">Checked</span>.
                </div>
                <button
                  type="button"
                  disabled={saving || !details}
                  onClick={saveMarks}
                  className="inline-flex h-11 items-center gap-2 rounded-lg bg-[#e51b72] px-5 text-sm font-black text-white shadow-sm transition hover:bg-[#c91560] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? <RefreshCw size={17} className="animate-spin" /> : <Save size={17} />}
                  {saving ? "Saving..." : "Save marks"}
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
