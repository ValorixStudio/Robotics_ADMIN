import React from "react";
import { ImageUploader } from "./ImageUploader";

export interface QuizQuestion {
  id: string;
  prompt: string;
  imageUrl?: string;
  options: string[];
  answer: string;
  explanation: string;
  tips: string;
  type: "MCQ" | "True/False" | "Short";
  timeLimitMinutes: number;
  marks: number;
  sectionId: string;
}

interface QuestionCardProps {
  question: QuizQuestion;
  sectionIndex: number;
  isEditing?: boolean;
  onUpdate: (updates: Partial<QuizQuestion>) => void;
  onDelete: () => void;
  sections: Array<{ id: string; label: string; heading?: string }>;
  errors?: Record<string, string>;
}

const labelClass = "mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-gray-500";
const inputClass =
  "w-full rounded-lg border border-gray-200 bg-white px-3.5 py-3 text-sm text-gray-800 shadow-sm outline-none transition-colors focus:border-[#e51b72] focus:ring-2 focus:ring-[#e51b72]/10";
const errorInputClass = "border-red-400 bg-red-50/40 focus:border-red-500 focus:ring-red-500/10";
const errorTextClass = "mt-1.5 text-[11px] font-semibold text-red-600";

export function QuestionCard({ question, sectionIndex, isEditing = false, onUpdate, onDelete, sections, errors = {} }: QuestionCardProps) {
  const handleOptionChange = (optionIndex: number, value: string) => {
    const newOptions = [...question.options];
    newOptions[optionIndex] = value;
    onUpdate({ options: newOptions });
  };

  return (
    <article className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#e51b72] text-xs font-bold text-white">
            {sectionIndex + 1}
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-gray-400">Question</p>
            <p className="mt-1 text-xs font-semibold text-gray-500">
              {question.type} | {question.timeLimitMinutes} min | {question.marks} marks
            </p>
          </div>
        </div>

        {isEditing && (
          <button
            type="button"
            onClick={onDelete}
            className="rounded-lg border border-red-100 bg-white px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50"
          >
            Delete
          </button>
        )}
      </div>

      <div className="mt-4 grid gap-4">
        <label className="block">
          <span className={labelClass}>Question Text</span>
          <textarea
            value={question.prompt}
            onChange={(e) => onUpdate({ prompt: e.target.value })}
            rows={2}
            className={`resize-none rounded-lg border bg-white px-3.5 py-3 text-sm font-semibold leading-6 text-gray-900 shadow-sm outline-none transition-colors focus:border-[#e51b72] focus:ring-2 focus:ring-[#e51b72]/10 ${
              errors.prompt ? errorInputClass : "border-gray-200"
            }`}
            placeholder="Enter your question"
          />
          {errors.prompt && <p className={errorTextClass}>{errors.prompt}</p>}
        </label>

        <label className="block">
          <span className={labelClass}>Question Image (Optional)</span>
          <ImageUploader value={question.imageUrl || ""} onChange={(url) => onUpdate({ imageUrl: url })} />
        </label>

        <label className="block">
          <span className={labelClass}>Section</span>
          <select
            value={question.sectionId}
            onChange={(e) => onUpdate({ sectionId: e.target.value })}
            className={inputClass}
          >
            {sections.map((section) => (
              <option key={section.id} value={section.id}>
                {section.label} {section.heading ? `— ${section.heading}` : ""}
              </option>
            ))}
          </select>
        </label>

        <div className="grid gap-4 md:grid-cols-[180px_minmax(0,1fr)]">
          <label className="block">
            <span className={labelClass}>Type</span>
            <select
              value={question.type}
              onChange={(e) => {
                const newType = e.target.value as QuizQuestion["type"];
                onUpdate({
                  type: newType,
                  options:
                    newType === "Short"
                      ? []
                      : newType === "True/False"
                        ? ["True", "False"]
                        : question.options.length > 0
                          ? question.options
                          : ["", "", "", ""],
                });
              }}
              className={inputClass}
            >
              <option value="MCQ">MCQ</option>
              <option value="True/False">True/False</option>
              <option value="Short">Short</option>
            </select>
          </label>

          {question.type !== "Short" && (
            <label className="block">
              <span className={labelClass}>Correct Answer</span>
              <input
                value={question.answer}
                onChange={(e) => onUpdate({ answer: e.target.value })}
                className={`${inputClass} ${errors.answer ? errorInputClass : ""}`}
                placeholder="Select correct answer"
              />
              {errors.answer && <p className={errorTextClass}>{errors.answer}</p>}
            </label>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className={labelClass}>Time Limit (minutes)</span>
            <input
              type="number"
              min={1}
              value={question.timeLimitMinutes}
              onChange={(e) => onUpdate({ timeLimitMinutes: Number(e.target.value) || 0 })}
              className={`${inputClass} ${errors.timeLimitMinutes ? errorInputClass : ""}`}
              placeholder="e.g., 2"
            />
            {errors.timeLimitMinutes && <p className={errorTextClass}>{errors.timeLimitMinutes}</p>}
          </label>

          <label className="block">
            <span className={labelClass}>Marks</span>
            <input
              type="number"
              min={1}
              value={question.marks}
              onChange={(e) => onUpdate({ marks: Number(e.target.value) || 0 })}
              className={`${inputClass} ${errors.marks ? errorInputClass : ""}`}
              placeholder="e.g., 2"
            />
            {errors.marks && <p className={errorTextClass}>{errors.marks}</p>}
          </label>
        </div>

        {question.options.length > 0 && (
          <div>
            <span className={labelClass}>Options</span>
            <div className="grid gap-2 sm:grid-cols-2">
              {question.options.map((option, idx) => (
                <input
                  key={idx}
                  value={option}
                  disabled={question.type === "True/False"}
                  onChange={(e) => handleOptionChange(idx, e.target.value)}
                  className={`rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-800 shadow-sm outline-none transition-colors focus:border-[#e51b72] focus:ring-2 focus:ring-[#e51b72]/10 disabled:bg-gray-50 disabled:text-gray-500`}
                  placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                />
              ))}
            </div>
            {errors.options && <p className={errorTextClass}>{errors.options}</p>}
          </div>
        )}

        {question.type === "Short" ? (
          <label className="block">
            <span className={labelClass}>Tips for Students</span>
            <textarea
              value={question.tips}
              onChange={(e) => onUpdate({ tips: e.target.value })}
              rows={2}
              className="resize-none rounded-lg border border-gray-200 bg-white px-3.5 py-3 text-sm leading-6 text-gray-700 shadow-sm outline-none transition-colors focus:border-[#e51b72] focus:ring-2 focus:ring-[#e51b72]/10"
              placeholder="Provide hints to help students answer"
            />
          </label>
        ) : (
          <label className="block">
            <span className={labelClass}>Explanation / Why this answer?</span>
            <textarea
              value={question.explanation}
              onChange={(e) => onUpdate({ explanation: e.target.value })}
              rows={2}
              className="resize-none rounded-lg border border-gray-200 bg-white px-3.5 py-3 text-sm leading-6 text-gray-700 shadow-sm outline-none transition-colors focus:border-[#e51b72] focus:ring-2 focus:ring-[#e51b72]/10"
              placeholder="Explain why this answer is correct"
            />
          </label>
        )}

        {question.imageUrl && (
          <div className="rounded-lg border border-gray-200 overflow-hidden bg-gray-50 p-3">
            <p className="text-xs font-semibold text-gray-600 mb-2">Question Image Preview:</p>
            <img src={question.imageUrl} alt="Question" className="h-40 w-full object-cover rounded-md" />
          </div>
        )}
      </div>
    </article>
  );
}
