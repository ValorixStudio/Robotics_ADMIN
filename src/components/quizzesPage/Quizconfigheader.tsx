import React from "react";
import { GraduationCap, Gauge, Lock, PencilLine } from "lucide-react";
export interface GradeOption {
  value: string;
  label: string;
}

export type DifficultyLevel = "easy" | "medium" | "hard";
export type QuizPublishStatus = "draft" | "live";

const gradeOptions: GradeOption[] = [
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

const inputClass =
  "w-full rounded-lg border border-gray-200 bg-white px-3.5 py-3 text-sm text-gray-800 shadow-sm outline-none transition-colors focus:border-[#e51b72] focus:ring-2 focus:ring-[#e51b72]/10";
const labelClass = "mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-gray-500";

const difficultyLabels: Record<DifficultyLevel, string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
};

export interface QuizConfigHeaderProps {
  level: string;
  onLevelChange: (level: string) => void;
  difficulty: DifficultyLevel;
  onDifficultyChange: (difficulty: DifficultyLevel) => void;
  publishStatus: QuizPublishStatus;
  onPublishStatusChange: (status: QuizPublishStatus) => void;
  locked?: boolean;
}

export function QuizConfigHeader({
  level,
  onLevelChange,
  difficulty,
  onDifficultyChange,
  publishStatus,
  onPublishStatusChange,
  locked = false,
}: QuizConfigHeaderProps) {

  const difficulties: DifficultyLevel[] = ["easy", "medium", "hard"];

  return (
    <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="grid gap-4 p-5 lg:grid-cols-3">
        <label className="block rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-zinc-800 dark:bg-zinc-950/50">
          <span className="mb-3 flex items-center gap-2 text-xs font-bold text-gray-800 dark:text-zinc-100">
            <GraduationCap className="h-4 w-4 text-[#e51b72]" />
            Class / Level
          </span>
          <select
            value={level}
            onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
              onLevelChange(event.target.value)
            }
            className={inputClass}
          >
            {gradeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-zinc-800 dark:bg-zinc-950/50">
          <span className="mb-3 flex items-center gap-2 text-xs font-bold text-gray-800 dark:text-zinc-100">
            <Gauge className="h-4 w-4 text-[#e51b72]" />
            Difficulty
          </span>
          <div className="grid grid-cols-3 gap-1 rounded-lg bg-white p-1 shadow-inner dark:bg-zinc-900">
            {difficulties.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => onDifficultyChange(option)}
                className={`min-h-11 rounded-md px-2 text-xs font-bold transition-all ${
                  difficulty === option
                    ? "bg-[#e51b72] text-white shadow-sm"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:hover:bg-zinc-800 dark:hover:text-white"
                }`}
              >
                {difficultyLabels[option]}
              </button>
            ))}
          </div>
          <p className={`${labelClass} mt-3 mb-0 normal-case tracking-normal text-gray-400`}>
            Choose how challenging this quiz should feel for learners.
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-zinc-800 dark:bg-zinc-950/50">
          <span className="mb-3 flex items-center gap-2 text-xs font-bold text-gray-800 dark:text-zinc-100">
            {publishStatus === "live" ? <Lock className="h-4 w-4 text-[#e51b72]" /> : <PencilLine className="h-4 w-4 text-[#e51b72]" />}
            Quiz Status
          </span>
          <div className="grid grid-cols-2 gap-1 rounded-lg bg-white p-1 shadow-inner dark:bg-zinc-900">
            {(["draft", "live"] as const).map((status) => (
              <button
                key={status}
                type="button"
                disabled={locked}
                onClick={() => onPublishStatusChange(status)}
                className={`min-h-11 rounded-md px-2 text-xs font-bold capitalize transition-all disabled:cursor-not-allowed ${
                  publishStatus === status
                    ? status === "live"
                      ? "bg-gray-950 text-white shadow-sm"
                      : "bg-[#e51b72] text-white shadow-sm"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900 disabled:hover:bg-transparent dark:hover:bg-zinc-800 dark:hover:text-white"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
          <p className={`${labelClass} mt-3 mb-0 normal-case tracking-normal text-gray-400`}>
            Live quizzes are locked and cannot be edited.
          </p>
        </div>
      </div>
    </section>
  );
}
