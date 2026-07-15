import { AlertCircle, CheckCircle2, Send, Timer, Trophy } from "lucide-react";

const buttonBase =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 text-xs font-bold shadow-sm transition-all disabled:cursor-wait disabled:opacity-70";

interface SubmitQuizBarProps {
  payload: unknown;
  submitStatus: "idle" | "saving" | "success" | "error" | string;
  submitMessage?: string;
  actionLabel?: string;
  idleTitle?: string;
  savingTitle?: string;
  successTitle?: string;
  stats?: {
    questions: number;
    marks: number;
    minutes: number;
  };
  onSubmit: () => void;
  disabled?: boolean;
}

export function SubmitQuizBar({
  payload,
  submitStatus,
  submitMessage,
  actionLabel = "Submit Quiz",
  idleTitle = "Ready to submit",
  savingTitle = "Submitting quiz...",
  successTitle = "Quiz submitted",
  stats,
  onSubmit,
  disabled = false,
}: SubmitQuizBarProps) {
  const isSaving = submitStatus === "saving";
  const isSuccess = submitStatus === "success";
  const isError = submitStatus === "error";

  const handleSubmit = () => {
    if (disabled) return;
    console.log("[SubmitQuizBar] Submit Quiz payload:", payload);
    onSubmit();
  };

  return (
    <section className="sticky bottom-4 z-20 overflow-hidden rounded-xl border border-gray-200 bg-white/95 shadow-lg backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/95">
      <div className="flex flex-col gap-4 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-lg bg-pink-50 p-2 text-[#e51b72] dark:bg-pink-500/10">
            {isSuccess ? <CheckCircle2 className="h-5 w-5" /> : isError ? <AlertCircle className="h-5 w-5" /> : <Send className="h-5 w-5" />}
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 dark:text-white">
              {isSaving ? savingTitle : isSuccess ? successTitle : isError ? "Submission needs attention" : idleTitle}
            </p>
            <p className={`mt-1 text-xs font-semibold ${isError ? "text-red-600" : isSuccess ? "text-emerald-600" : "text-gray-500 dark:text-zinc-400"}`}>
              {submitMessage || `${stats?.questions ?? 0} questions prepared. Review once, then publish.`}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-zinc-400">
            <span className="inline-flex items-center gap-1 rounded-lg bg-gray-50 px-2.5 py-2 dark:bg-zinc-950">
              <Trophy className="h-3.5 w-3.5 text-[#e51b72]" />
              {stats?.marks ?? 0} marks
            </span>
            <span className="inline-flex items-center gap-1 rounded-lg bg-gray-50 px-2.5 py-2 dark:bg-zinc-950">
              <Timer className="h-3.5 w-3.5 text-[#e51b72]" />
              {stats?.minutes ?? 0} min
            </span>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSaving || disabled}
            className={`${buttonBase} bg-[#e51b72] text-white hover:-translate-y-0.5 hover:bg-[#bd145c] disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500 disabled:hover:translate-y-0`}
          >
            <Send className="h-4 w-4" />
            {isSaving ? "Saving..." : actionLabel}
          </button>
        </div>
      </div>
    </section>
  );
}
