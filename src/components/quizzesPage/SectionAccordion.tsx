import { useEffect, useRef, useState } from "react";
import { ChevronDown, Clock3, Copy, Edit3, FileText, ImageIcon, Plus, Target, Trash2, X } from "lucide-react";
import { MediaUrlPicker } from "@/components/MediaUrlPicker";
import { API_BASE_URL } from "@/config/apiUrls";
import { componentGuideApi } from "@/services/api/componentGuide.service";

export interface QuizQuestion {
  id: string;
  prompt: string;
  imageUrl?: string;
  questionInputMode?: QuestionInputMode;
  status?: "draft" | "live";
  questionType: "MCQ" | "True/False" | "Short" | string;
  options?: string[];
  answer?: string;
  explanation?: string;
  tips?: string;
  timeLimitMinutes?: number;
  marks?: number;
  persisted?: boolean;
  dirty?: boolean;
}

export interface QuizSection {
  id: string;
  label: string;
  status?: "draft" | "live";
  heading?: string;
  bloomLevel?: string;
  targetMarks?: number;
  targetTimeMinutes?: number;
  questions?: QuizQuestion[];
}

interface SectionAccordionProps {
  section: QuizSection;
  onUpdateSection: (sectionId: string, updates: Partial<QuizSection>) => void;
  onAddQuestion: (sectionId: string, question: QuizQuestion) => void;
  onUpdateQuestion: (sectionId: string, questionId: string, updates: Partial<QuizQuestion>) => void;
  onDeleteQuestion: (sectionId: string, questionId: string) => void;
  onRemoveSection: (sectionId: string) => void;
  readOnly?: boolean;
}

type QuestionInputMode = "text" | "image";
type DraftQuestion = Omit<QuizQuestion, "id"> & {
  questionInputMode?: QuestionInputMode;
};
type QuestionErrors = Partial<Record<keyof DraftQuestion, string>>;

const labelClass = "mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-gray-500 dark:text-zinc-400";
const inputClass =
  "w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm outline-none transition-colors focus:border-[#e51b72] focus:ring-2 focus:ring-[#e51b72]/10 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white";
const errorInputClass = "border-red-300 focus:border-red-500 focus:ring-red-100";
const errorTextClass = "mt-1 text-xs font-semibold text-red-600";
const metaBadgeClass =
  "inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-2.5 py-1 text-[10px] font-black uppercase text-gray-500 shadow-sm dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300";

const getMediaPreviewUrl = (url: string) => {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;

  return `${API_BASE_URL.replace(/\/$/, "")}/${url.replace(/^\//, "")}`;
};

const emptyQuestionDraft = (): DraftQuestion => ({
  questionInputMode: "text",
  prompt: "",
  imageUrl: "",
  questionType: "MCQ",
  options: ["", "", "", ""],
  answer: "",
  explanation: "",
  tips: "",
  timeLimitMinutes: 1,
  marks: 1,
});

const makeLocalId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `tmp-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

function validateQuestion(draft: DraftQuestion) {
  const nextErrors: QuestionErrors = {};
  if ((draft.questionInputMode ?? "text") === "image") {
    if (!draft.imageUrl?.trim()) nextErrors.imageUrl = "Question image is required.";
  } else if (!draft.prompt.trim()) {
    nextErrors.prompt = "Question text is required.";
  }
  if (draft.questionType !== "Short" && !draft.answer?.trim()) nextErrors.answer = "Answer is required.";
  if (draft.questionType === "MCQ" && (draft.options ?? []).filter((option) => option.trim()).length !== 4) {
    nextErrors.options = "MCQ needs exactly 4 options.";
  }
  if (!draft.timeLimitMinutes || draft.timeLimitMinutes < 1) nextErrors.timeLimitMinutes = "Must be at least 1.";
  if (!draft.marks || draft.marks < 1) nextErrors.marks = "Must be at least 1.";
  return nextErrors;
}

function toQuestionDraftForSave(draft: DraftQuestion): Omit<QuizQuestion, "id"> {
  const questionInputMode = draft.questionInputMode ?? "text";

  if (questionInputMode === "image") {
    return { ...draft, questionInputMode, prompt: "" };
  }

  return { ...draft, questionInputMode, imageUrl: "" };
}

function typeChangeOptions(nextType: string, currentOptions: string[] = []) {
  if (nextType === "Short") return [];
  if (nextType === "True/False") return ["True", "False"];
  return currentOptions.length > 0 ? [...currentOptions, "", "", "", ""].slice(0, 4) : ["", "", "", ""];
}

function IconButton({
  children,
  onClick,
  title,
  danger = false,
}: {
  children: React.ReactNode;
  onClick: () => void;
  title: string;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border bg-white shadow-sm transition-colors dark:bg-zinc-950 ${
        danger
          ? "border-red-100 text-red-500 hover:bg-red-50 dark:border-red-500/20 dark:hover:bg-red-500/10"
          : "border-gray-200 text-gray-500 hover:border-[#e51b72] hover:text-[#e51b72] dark:border-zinc-700 dark:text-zinc-400"
      }`}
    >
      {children}
    </button>
  );
}

function QuestionFormFields({
  draft,
  errors,
  onChange,
  promptRef,
}: {
  draft: DraftQuestion;
  errors: QuestionErrors;
  onChange: (updates: Partial<DraftQuestion>) => void;
  promptRef?: React.RefObject<HTMLTextAreaElement | null>;
}) {
  const updateOption = (optionIndex: number, value: string) => {
    onChange({ options: (draft.options ?? []).map((option, index) => (index === optionIndex ? value : option)) });
  };
  const questionInputMode = draft.questionInputMode ?? "text";

  return (
    <div className="grid gap-4">
      <label className="block">
        <span className={labelClass}>Question</span>
        <select
          value={questionInputMode}
          onChange={(event) => {
            const nextMode = event.target.value as QuestionInputMode;
            onChange(nextMode === "image" ? { questionInputMode: nextMode, prompt: "" } : { questionInputMode: nextMode, imageUrl: "" });
          }}
          className={inputClass}
        >
          <option value="text">Text</option>
          <option value="image">Image</option>
        </select>
      </label>

      {questionInputMode === "text" ? (
        <label className="block">
          <span className={labelClass}>Question Text</span>
          <textarea
            ref={promptRef}
            value={draft.prompt}
            onChange={(event) => onChange({ prompt: event.target.value })}
            rows={2}
            className={`${inputClass} ${errors.prompt ? errorInputClass : ""} resize-none`}
            placeholder="Write the question"
          />
          {errors.prompt && <p className={errorTextClass}>{errors.prompt}</p>}
        </label>
      ) : (
        <div>
          <MediaUrlPicker
            value={draft.imageUrl || ""}
            label="Question Image"
            accept="image/*"
            emptyText="Upload question image"
            mediaType="IMAGE"
            uploadFile={async (file) => componentGuideApi.uploadMedia(file)}
            onChange={(url) => onChange({ imageUrl: url })}
          />
          {draft.imageUrl && (
            <button
              type="button"
              onClick={() => onChange({ imageUrl: "" })}
              className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-100"
            >
              Remove question image
            </button>
          )}
          {errors.imageUrl && <p className={errorTextClass}>{errors.imageUrl}</p>}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-[180px_minmax(0,1fr)]">
        <label className="block">
          <span className={labelClass}>Type</span>
          <select
            value={draft.questionType}
            onChange={(event) =>
              onChange({
                questionType: event.target.value,
                options: typeChangeOptions(event.target.value, draft.options),
                answer: event.target.value === "True/False" ? "True" : "",
              })
            }
            className={inputClass}
          >
            <option value="MCQ">MCQ</option>
            <option value="True/False">True/False</option>
            <option value="Short">Short</option>
          </select>
        </label>

        {draft.questionType !== "Short" && (
          <label className="block">
            <span className={labelClass}>Correct Answer</span>
            <input
              value={draft.answer ?? ""}
              onChange={(event) => onChange({ answer: event.target.value })}
              className={`${inputClass} ${errors.answer ? errorInputClass : ""}`}
              placeholder="Correct answer"
            />
            {errors.answer && <p className={errorTextClass}>{errors.answer}</p>}
          </label>
        )}
      </div>

      {draft.questionType !== "Short" && (
        <div>
          <span className={labelClass}>Options</span>
          <div className="grid gap-2 sm:grid-cols-2">
            {(draft.options ?? []).map((option, optionIndex) => (
              <input
                key={optionIndex}
                value={option}
                disabled={draft.questionType === "True/False"}
                onChange={(event) => updateOption(optionIndex, event.target.value)}
                className={`${inputClass} ${errors.options ? errorInputClass : ""} disabled:bg-gray-50 dark:disabled:bg-zinc-900`}
                placeholder={`Option ${String.fromCharCode(65 + optionIndex)}`}
              />
            ))}
          </div>
          {errors.options && <p className={errorTextClass}>{errors.options}</p>}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className={labelClass}>Time (minutes)</span>
          <input
            type="number"
            min={1}
            value={draft.timeLimitMinutes ?? 1}
            onChange={(event) => onChange({ timeLimitMinutes: Number(event.target.value) || 0 })}
            className={`${inputClass} ${errors.timeLimitMinutes ? errorInputClass : ""}`}
          />
          {errors.timeLimitMinutes && <p className={errorTextClass}>{errors.timeLimitMinutes}</p>}
        </label>

        <label className="block">
          <span className={labelClass}>Marks</span>
          <input
            type="number"
            min={1}
            value={draft.marks ?? 1}
            onChange={(event) => onChange({ marks: Number(event.target.value) || 0 })}
            className={`${inputClass} ${errors.marks ? errorInputClass : ""}`}
          />
          {errors.marks && <p className={errorTextClass}>{errors.marks}</p>}
        </label>
      </div>

      <label className="block">
        <span className={labelClass}>{draft.questionType === "Short" ? "Tips" : "Explanation"}</span>
        <textarea
          value={draft.questionType === "Short" ? draft.tips ?? "" : draft.explanation ?? ""}
          onChange={(event) =>
            onChange(draft.questionType === "Short" ? { tips: event.target.value } : { explanation: event.target.value })
          }
          rows={2}
          className={`${inputClass} resize-none`}
          placeholder={draft.questionType === "Short" ? "Give the student a hint" : "Explain why the answer is correct"}
        />
      </label>
    </div>
  );
}

function AddQuestionCard({
  onSave,
  onRemove,
  autoFocus,
}: {
  onSave: (draft: DraftQuestion) => void;
  onRemove: () => void;
  autoFocus: boolean;
}) {
  const [draft, setDraft] = useState(emptyQuestionDraft);
  const [errors, setErrors] = useState<QuestionErrors>({});
  const promptRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (autoFocus) promptRef.current?.focus();
  }, [autoFocus]);

  const handleSave = () => {
    const nextErrors = validateQuestion(draft);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    onSave(toQuestionDraftForSave(draft));
  };

  return (
    <div className="rounded-lg border border-[#e51b72]/30 bg-pink-50/70 p-4 dark:bg-pink-500/10">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-xs font-bold uppercase text-[#e51b72]">New question</p>
        <button type="button" onClick={onRemove} className="inline-flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-red-600">
          <X className="h-3.5 w-3.5" />
          Remove
        </button>
      </div>

      <QuestionFormFields
        draft={draft}
        errors={errors}
        onChange={(updates) => setDraft((current) => ({ ...current, ...updates }))}
        promptRef={promptRef}
      />

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={handleSave}
          className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-[#e51b72] px-3 text-xs font-bold text-white transition-colors hover:bg-[#bd145c]"
        >
          Save Question
        </button>
        <span className="text-[10px] font-semibold text-gray-400">You can add multiple draft cards before saving.</span>
      </div>
    </div>
  );
}

function EditQuestionCard({
  question,
  onSave,
  onCancel,
}: {
  question: QuizQuestion;
  onSave: (draft: DraftQuestion) => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState<DraftQuestion>(() => ({
    ...emptyQuestionDraft(),
    ...question,
    questionInputMode: question.imageUrl ? "image" : "text",
  }));
  const [errors, setErrors] = useState<QuestionErrors>({});

  const handleSave = () => {
    const nextErrors = validateQuestion(draft);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    onSave(toQuestionDraftForSave(draft));
  };

  return (
    <div className="mt-4 grid gap-4 border-t border-pink-200 pt-4 dark:border-pink-500/20">
      <QuestionFormFields
        draft={draft}
        errors={errors}
        onChange={(updates) => setDraft((current) => ({ ...current, ...updates }))}
      />
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleSave}
          className="flex-1 rounded-lg bg-[#e51b72] px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-[#bd145c]"
        >
          Update Question
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-600 transition-colors hover:bg-gray-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export function SectionAccordion({
  section,
  onUpdateSection,
  onAddQuestion,
  onUpdateQuestion,
  onDeleteQuestion,
  onRemoveSection,
  readOnly = false,
}: SectionAccordionProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [addingCards, setAddingCards] = useState<string[]>([]);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);

  const questions = section.questions ?? [];
  const totalMarks = questions.reduce((sum, question) => sum + (Number(question.marks) || 0), 0);
  const totalTime = questions.reduce((sum, question) => sum + (Number(question.timeLimitMinutes) || 0), 0);

  const updateSectionField = (field: keyof QuizSection, value: string | number) => {
    if (readOnly) return;
    onUpdateSection(section.id, { [field]: value });
  };

  const handleDuplicateQuestion = (question: QuizQuestion) => {
    if (readOnly) return;
    const { id: _id, ...rest } = question;
    onAddQuestion(section.id, {
      ...rest,
      id: makeLocalId(),
      prompt: rest.imageUrl && !rest.prompt ? "" : `${rest.prompt || "Question"} (copy)`,
    });
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="w-full border-b border-gray-100 px-5 py-4 text-left transition-colors hover:bg-gray-50 dark:border-zinc-800 dark:hover:bg-zinc-950/70"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="shrink-0 rounded-lg bg-[#e51b72] px-3 py-1.5 text-xs font-bold text-white">{section.label}</span>
            <div className="min-w-0">
              <h3 className="truncate text-sm font-bold text-gray-900 dark:text-white">{section.heading?.trim() || "Untitled section"}</h3>
              <p className="mt-1 text-xs font-semibold text-gray-500 dark:text-zinc-400">
                {questions.length} question{questions.length === 1 ? "" : "s"} · {totalMarks} marks · {totalTime} min
              </p>
            </div>
          </div>
          <ChevronDown className={`h-5 w-5 shrink-0 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </div>
      </button>

      <div className={`grid transition-[grid-template-rows] duration-200 ease-out ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
        <div className="overflow-hidden">
          <div className="space-y-4 p-5">
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-zinc-800 dark:bg-zinc-950/50">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-gray-500 shadow-sm dark:bg-zinc-900 dark:text-zinc-400">
                  Target: {section.targetMarks || 0} marks / {section.targetTimeMinutes || 0} min
                </span>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <label className="block">
                  <span className={labelClass}>Section Heading</span>
                  <input
                    type="text"
                    disabled={readOnly}
                    value={section.heading || ""}
                    onChange={(event) => updateSectionField("heading", event.target.value)}
                    placeholder="e.g., Basic Concepts"
                    className={inputClass}
                  />
                </label>

                <label className="block">
                  <span className={labelClass}>Bloom's Level</span>
                  <select
                    disabled={readOnly}
                    value={section.bloomLevel || ""}
                    onChange={(event) => updateSectionField("bloomLevel", event.target.value)}
                    className={inputClass}
                  >
                    <option value="">Select...</option>
                    <option value="Remember">Remember</option>
                    <option value="Understand">Understand</option>
                    <option value="Apply">Apply</option>
                    <option value="Analyze">Analyze</option>
                    <option value="Evaluate">Evaluate</option>
                    <option value="Create">Create</option>
                  </select>
                </label>

                <label className="block">
                  <span className={labelClass}>Target Marks</span>
                  <input
                    type="number"
                    min={1}
                    disabled={readOnly}
                    value={section.targetMarks || ""}
                    onChange={(event) => updateSectionField("targetMarks", Number(event.target.value) || 0)}
                    className={inputClass}
                  />
                </label>

                <label className="block">
                  <span className={labelClass}>Target Time (minutes)</span>
                  <input
                    type="number"
                    min={1}
                    disabled={readOnly}
                    value={section.targetTimeMinutes || ""}
                    onChange={(event) => updateSectionField("targetTimeMinutes", Number(event.target.value) || 0)}
                    className={inputClass}
                  />
                </label>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <h4 className="text-xs font-bold uppercase text-gray-600 dark:text-zinc-300">Questions ({questions.length})</h4>
                <button
                  type="button"
                  disabled={readOnly}
                  onClick={() => setAddingCards((prev) => [...prev, makeLocalId()])}
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[#e51b72] px-3 text-xs font-bold text-white transition-colors hover:bg-[#bd145c] disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500"
                >
                  <Plus className="h-4 w-4" />
                  Add Question
                </button>
              </div>

              {questions.length === 0 && addingCards.length === 0 && (
                <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center dark:border-zinc-700 dark:bg-zinc-950/50">
                  <p className="text-sm font-bold text-gray-700 dark:text-zinc-200">No questions yet</p>
                  <p className="mt-1 text-xs font-semibold text-gray-500 dark:text-zinc-400">Add the first question to start building this section.</p>
                </div>
              )}

              {questions.map((question, index) => {
                const isEditing = editingQuestionId === question.id;
                const isImageQuestion = Boolean(question.imageUrl);
                const answerPreview = question.questionType === "Short" ? question.tips || question.explanation : question.answer;

                return (
                  <div
                    key={question.id}
                    className={`overflow-hidden rounded-xl border transition-all ${
                      isEditing
                        ? "border-[#e51b72]/50 bg-[#fff7fb] shadow-sm dark:bg-pink-500/10"
                        : "border-gray-200 bg-white shadow-sm hover:border-pink-200 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950/40"
                    }`}
                  >
                    <div className="flex flex-col gap-4 p-4 lg:flex-row lg:items-start">
                      <div className="flex min-w-0 flex-1 gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-950 text-sm font-black text-white shadow-sm">
                          {index + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap gap-2">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fff1f6] px-2.5 py-1 text-[10px] font-black uppercase text-[#e51b72]">
                              {isImageQuestion ? <ImageIcon className="h-3 w-3" /> : <FileText className="h-3 w-3" />}
                              {question.questionType || "MCQ"}
                            </span>
                            <span className={metaBadgeClass}>
                              <Clock3 className="h-3 w-3" />
                              {question.timeLimitMinutes || 1} min
                            </span>
                            <span className={metaBadgeClass}>
                              <Target className="h-3 w-3" />
                              {question.marks || 1} marks
                            </span>
                          </div>
                          <p className="hidden">
                            {question.questionType || "MCQ"} · {question.timeLimitMinutes || 1} min · {question.marks || 1} marks
                          </p>
                          <p className="mt-3 text-sm font-black leading-6 text-gray-950 dark:text-zinc-100">
                            {question.prompt || (question.imageUrl ? "Image question" : "Untitled")}
                          </p>
                          {answerPreview && (
                            <p className="mt-2 line-clamp-2 text-xs font-semibold leading-5 text-gray-500 dark:text-zinc-400">
                              {question.questionType === "Short" ? "Tips: " : "Answer: "}
                              {answerPreview}
                            </p>
                          )}
                          {question.imageUrl && (
                            <div className="mt-4 max-w-md overflow-hidden rounded-xl border border-gray-200 bg-white shadow-inner dark:border-zinc-700 dark:bg-zinc-900">
                              <div className="flex items-center gap-1.5 border-b border-gray-100 px-3 py-1.5 text-[10px] font-black uppercase text-gray-500 dark:border-zinc-800">
                                <ImageIcon className="h-3 w-3" />
                                Question image
                              </div>
                              <img src={getMediaPreviewUrl(question.imageUrl)} alt="Question" className="h-44 w-full object-contain" />
                            </div>
                          )}
                        </div>
                      </div>

                      {!isEditing && !readOnly && (
                        <div className="flex shrink-0 items-center justify-end gap-2 rounded-xl bg-gray-50 p-1.5 dark:bg-zinc-900">
                          <IconButton title="Duplicate" onClick={() => handleDuplicateQuestion(question)}>
                            <Copy className="h-4 w-4" />
                          </IconButton>
                          <IconButton title="Edit" onClick={() => setEditingQuestionId(question.id)}>
                            <Edit3 className="h-4 w-4" />
                          </IconButton>
                          <IconButton
                            title="Delete"
                            danger
                            onClick={() => {
                              if (window.confirm("Delete this question?")) onDeleteQuestion(section.id, question.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </IconButton>
                        </div>
                      )}
                    </div>

                    {isEditing && !readOnly && (
                      <div className="border-t border-pink-100 bg-white p-4 dark:border-pink-500/10 dark:bg-zinc-950">
                        <EditQuestionCard
                          question={question}
                          onSave={(draft) => {
                            onUpdateQuestion(section.id, question.id, draft);
                            setEditingQuestionId(null);
                          }}
                          onCancel={() => setEditingQuestionId(null)}
                        />
                      </div>
                    )}
                  </div>
                );
              })}

              {addingCards.map((item, cardIndex) => (
                <AddQuestionCard
                  key={item}
                  autoFocus={cardIndex === addingCards.length - 1}
                  onSave={(draft) => {
                    onAddQuestion(section.id, { ...draft, id: makeLocalId() });
                    setAddingCards((prev) => prev.filter((entry) => entry !== item));
                  }}
                  onRemove={() => setAddingCards((prev) => prev.filter((entry) => entry !== item))}
                />
              ))}
            </div>

            <div className="flex justify-end border-t border-gray-100 pt-4 dark:border-zinc-800">
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm("Delete this section and all its questions?")) onRemoveSection(section.id);
                  }}
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 text-xs font-bold text-red-600 transition-colors hover:bg-red-100 dark:border-red-500/20 dark:bg-red-500/10"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Section
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
