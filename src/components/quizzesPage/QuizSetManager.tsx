import { BookOpenCheck, CheckCircle2, Edit3, FilePlus2, Lock, PencilLine, Save, Trash2 } from "lucide-react";
import type { QuizSetSummary } from "@/lib/types";

interface QuizSetManagerProps {
  classLevel: string;
  quizSets: QuizSetSummary[];
  selectedQuizSetId: string;
  quizTitle: string;
  locked: boolean;
  loading?: boolean;
  onSelectQuizSet: (quizSetId: string) => void;
  onQuizTitleChange: (title: string) => void;
  onCreateQuizSet: () => void;
  onRenameQuizSet: () => void;
  onDeleteQuizSet: () => void;
  onPrepareLive: (quizSetId: string) => void;
}

const actionButtonClass =
  "inline-flex h-10 items-center justify-center gap-2 rounded-lg px-3 text-xs font-black transition-colors disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400";

function statusBadge(status: QuizSetSummary["status"]) {
  return status === "live"
    ? "border-gray-900 bg-gray-950 text-white"
    : "border-pink-200 bg-pink-50 text-[#e51b72]";
}

export function QuizSetManager({
  classLevel,
  quizSets,
  selectedQuizSetId,
  quizTitle,
  locked,
  loading = false,
  onSelectQuizSet,
  onQuizTitleChange,
  onCreateQuizSet,
  onRenameQuizSet,
  onDeleteQuizSet,
  onPrepareLive,
}: QuizSetManagerProps) {
  const selectedQuiz = quizSets.find((quizSet) => quizSet.id === selectedQuizSetId);
  const selectedStatus = selectedQuiz?.status ?? "draft";
  const selectedCount = selectedQuiz?._count?.questions ?? 0;

  return (
    <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-gray-100 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#e51b72]/10 text-[#e51b72]">
              <BookOpenCheck className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-black text-gray-950">Class Quiz Library</h2>
              <p className="text-xs font-semibold text-gray-500">
                {classLevel || "Selected class"} can have multiple quizzes. Choose one quiz before editing sections.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onCreateQuizSet}
          disabled={loading}
          className={`${actionButtonClass} bg-[#e51b72] px-4 text-white hover:bg-[#c91662]`}
        >
          <FilePlus2 className="h-4 w-4" />
          New Quiz
        </button>
      </div>

      <div className="grid gap-5 p-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.8fr)]">
        <div className="overflow-hidden rounded-lg border border-gray-200">
          <div className="flex items-center justify-between gap-3 border-b border-gray-200 bg-gray-50 px-4 py-3">
            <div>
              <h3 className="text-sm font-black text-gray-950">Created Quizzes</h3>
              <p className="text-xs font-semibold text-gray-500">{quizSets.length} quiz{quizSets.length === 1 ? "" : "zes"} for {classLevel || "this class"}</p>
            </div>
            <button
              type="button"
              onClick={onCreateQuizSet}
              disabled={loading}
              className={`${actionButtonClass} bg-[#e51b72] text-white hover:bg-[#c91662]`}
            >
              <FilePlus2 className="h-4 w-4" />
              Add Quiz
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left">
              <thead className="bg-white text-[11px] font-black uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3">No.</th>
                  <th className="px-4 py-3">Quiz Name</th>
                  <th className="px-4 py-3">Questions</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {quizSets.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-sm font-semibold text-gray-500">
                      No quizzes yet. Click Add Quiz to create the first quiz for this class.
                    </td>
                  </tr>
                ) : (
                  quizSets.map((quizSet, index) => {
                    const isSelected = quizSet.id === selectedQuizSetId;
                    const isLive = quizSet.status === "live";
                    const questionCount = quizSet._count?.questions ?? 0;

                    return (
                      <tr key={quizSet.id} className={isSelected ? "bg-pink-50/60" : "bg-white hover:bg-gray-50"}>
                        <td className="px-4 py-3">
                          <span className={`flex h-8 w-8 items-center justify-center rounded-md text-xs font-black ${isSelected ? "bg-[#e51b72] text-white" : "bg-gray-950 text-white"}`}>
                            {index + 1}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-black text-gray-950">{quizSet.title || "Untitled quiz"}</div>
                          {isSelected && <div className="mt-1 text-[11px] font-black uppercase text-[#e51b72]">Selected for editing</div>}
                        </td>
                        <td className="px-4 py-3 text-sm font-bold text-gray-600">
                          {questionCount}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-black uppercase ${statusBadge(quizSet.status)}`}>
                            {isLive && <CheckCircle2 className="h-3 w-3" />}
                            {quizSet.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              disabled={loading}
                              onClick={() => onSelectQuizSet(quizSet.id)}
                              className={`${actionButtonClass} border border-gray-200 bg-white text-gray-700 hover:bg-gray-50`}
                            >
                              <Edit3 className="h-4 w-4" />
                              Edit
                            </button>
                            <button
                              type="button"
                              disabled={loading || isLive}
                              onClick={() => onPrepareLive(quizSet.id)}
                              className={`${actionButtonClass} border border-green-200 bg-green-50 text-green-700 hover:bg-green-100`}
                            >
                              <CheckCircle2 className="h-4 w-4" />
                              Make Live
                            </button>
                            <button
                              type="button"
                              disabled={loading || isLive || quizSet.id !== selectedQuizSetId}
                              onClick={onDeleteQuizSet}
                              className={`${actionButtonClass} border border-red-200 bg-red-50 text-red-600 hover:bg-red-100`}
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
        </div>

        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="text-[11px] font-black uppercase tracking-wide text-gray-500">Selected quiz</span>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <span className={`rounded-full border px-2.5 py-1 text-[11px] font-black uppercase ${statusBadge(selectedStatus)}`}>
                  {selectedStatus}
                </span>
                <span className="rounded-full border border-gray-200 bg-white px-2.5 py-1 text-[11px] font-black text-gray-500">
                  {selectedCount} question{selectedCount === 1 ? "" : "s"}
                </span>
              </div>
            </div>

            {locked && (
              <span className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-black text-gray-600">
                <Lock className="h-4 w-4" />
                Live quiz locked
              </span>
            )}
          </div>

          <label className="block">
            <span className="mb-1.5 block text-[11px] font-black uppercase tracking-wide text-gray-500">Quiz title</span>
            <div className="relative">
              <PencilLine className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={quizTitle}
                disabled={locked || !selectedQuizSetId}
                onChange={(event) => onQuizTitleChange(event.target.value)}
                className="h-12 w-full rounded-lg border border-gray-200 bg-white pl-10 pr-3 text-sm font-bold text-gray-950 shadow-sm outline-none transition-colors placeholder:text-gray-400 focus:border-[#e51b72] focus:ring-2 focus:ring-[#e51b72]/10 disabled:bg-gray-100 disabled:text-gray-500"
                placeholder="e.g., Chapter 1 Practice Quiz"
              />
            </div>
          </label>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={locked || !selectedQuizSetId || !quizTitle.trim()}
              onClick={onRenameQuizSet}
              className={`${actionButtonClass} border border-gray-200 bg-white text-gray-700 hover:bg-gray-50`}
            >
              <Save className="h-4 w-4" />
              Save Title
            </button>
            <button
              type="button"
              disabled={locked || !selectedQuizSetId}
              onClick={onDeleteQuizSet}
              className={`${actionButtonClass} border border-red-200 bg-red-50 text-red-600 hover:bg-red-100`}
            >
              <Trash2 className="h-4 w-4" />
              Delete Quiz
            </button>
          </div>

          <p className="mt-4 text-xs font-semibold text-gray-500">
            Draft quizzes can be renamed, deleted, and edited. After a quiz is published live, it stays locked for student attempts.
          </p>
        </div>
      </div>
    </section>
  );
}
