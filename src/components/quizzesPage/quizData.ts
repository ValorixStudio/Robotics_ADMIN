import { API_BASE_URL } from "@/config/apiUrls";
import { useSetter } from "@/hooks/setter";
import { useGetter } from "@/hooks/getter";
import { buildQuizPayload } from "./Payload";

import type { QuizSection, QuizSetSummary } from "../../lib/types";

const levelLabels: Record<string, string> = {
  "3": "Class 3",
  "4": "Class 4",
  "5": "Class 5",
  "6": "Class 6",
  "7": "Class 7",
  "8": "Class 8",
  "9": "Class 9",
  "10": "Class 10",
  "11": "Class 11",
  "12": "Class 12",
  engineering: "Engineering",
};

const baseUrl = API_BASE_URL.replace(/\/$/, "");

const sectionLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

const makeId = (): string => `${Date.now()}-${Math.random().toString(36).slice(2)}`;

const nextSectionLabel = (existingCount: number): string =>
  `SECTION ${sectionLetters[existingCount % sectionLetters.length]}`;

const makeDefaultSection = (existingCount: number): QuizSection => ({
  id: makeId(),
  label: nextSectionLabel(existingCount),
  heading: existingCount === 0 ? "Remember & Recall" : "",
  bloomLevel: existingCount === 0 ? "Level 1 — Remember" : "",
  targetMarks: existingCount === 0 ? 10 : 0,
  targetTimeMinutes: existingCount === 0 ? 20 : 0,
  questions: [],
});

export const normalizeLevel = (level: string): string => levelLabels[level] ?? level;

// Raw shapes as returned by the backend (GET /quizzes?courseId=...&classLevel=...)
type RawQuizQuestion = {
  id: string;
  courseId: string;
  sectionId: string;
  level: string;
  prompt: string;
  imageUrl?: string | null;
  questionImageUrl?: string | null;
  questionImage?: string | null;
  image?: string | null;
  questionInputMode?: "text" | "image" | null;
  questionMode?: "text" | "image" | null;
  options: string[];
  answer: string;
  explanation: string;
  questionType: string;
  difficulty: string;
  status?: "draft" | "live" | null;
  timeLimitMinutes?: number | string | null;
  timeLimit?: number | string | null;
  marks?: number | string | null;
  questionMarks?: number | string | null;
  order: number;
  createdAt?: string;
  updatedAt?: string;
};

type RawQuizSection = {
  id: string;
  courseId: string;
  label: string;
  heading: string;
  bloomLevel: string;
  status?: "draft" | "live" | null;
  targetMarks: number;
  targetTimeMinutes: number;
  order: number;
  createdAt?: string;
  updatedAt?: string;
  questions: RawQuizQuestion[];
};

export function useQuizData() {
  const { callGetter } = useGetter();
  const { callSetter } = useSetter();

  const findCourseForLevel = async (level: string) => {
    const classLevel = normalizeLevel(level);
    const data = await callGetter({ url: `${baseUrl}/quizzes/classes?classLevel=${encodeURIComponent(classLevel)}` });

    if (!data || data.ok === false) throw new Error(data?.error || "Could not load quiz class.");

    const course =
      data.classes?.find((c: { title: string }) => c.title.toLowerCase() === classLevel.toLowerCase()) ??
      data.classes?.[0];

    if (!course?.id) throw new Error('');

    return { courseId: course.id as string, classLevel };
  };

  const loadQuizSets = async (courseId: string, classLevel: string): Promise<QuizSetSummary[]> => {
    const data = await callGetter({
      url: `${baseUrl}/quizzes/sets?courseId=${encodeURIComponent(courseId)}&classLevel=${encodeURIComponent(classLevel)}`,
    });

    if (!data || data.ok === false) throw new Error(data?.error || "Could not load quizzes for this class.");

    return Array.isArray(data.quizSets) ? data.quizSets : [];
  };

  const createQuizSetForClass = async (courseId: string, classLevel: string, title: string) => {
    const data = await callSetter({
      url: `${baseUrl}/quizzes/sets`,
      method: "post",
      bodyData: { courseId, classLevel, title },
    });
    if (!data || data.ok === false || !data.quizSet) throw new Error(data?.error || "Could not create quiz.");
    return data.quizSet as QuizSetSummary;
  };

  const updateQuizSetTitle = async (quizSetId: string, title: string) => {
    const data = await callSetter({
      url: `${baseUrl}/quizzes/sets/${encodeURIComponent(quizSetId)}`,
      method: "put",
      bodyData: { title },
    });
    if (!data || data.ok === false || !data.quizSet) throw new Error(data?.error || "Could not update quiz.");
    return data.quizSet as QuizSetSummary;
  };

  const deleteQuizSetById = async (quizSetId: string) => {
    await callSetter({
      url: `${baseUrl}/quizzes/sets/${encodeURIComponent(quizSetId)}`,
      method: "delete",
    });
  };

  const updateQuizSetStatus = async (quizSetId: string, status: "draft" | "live") => {
    const data = await callSetter({
      url: `${baseUrl}/quizzes/sets/${encodeURIComponent(quizSetId)}/status`,
      method: "put",
      bodyData: { status },
    });
    if (!data || data.ok === false || !data.quizSet) throw new Error(data?.error || "Could not update quiz status.");
    return data.quizSet as QuizSetSummary;
  };

  const loadSavedQuizzes = async (courseId: string, classLevel: string, quizSetId?: string): Promise<QuizSection[]> => {
    const params = new URLSearchParams({ courseId, classLevel });
    if (quizSetId) params.set("quizSetId", quizSetId);
    const data = await callGetter({ url: `${baseUrl}/quizzes?${params.toString()}` });

    if (!data || data.ok === false) throw new Error(data?.error || "Could not load quizzes for this class.");

    return mapSectionsResponse(classLevel, data.quizzes || []);
  };

  const saveQuiz = async (
    courseId: string,
    classLevel: string,
    difficulty: string,
    sections: QuizSection[],
    quizSetId: string | undefined,
    title: string,
    status: "draft" | "live" = "draft",
  ) => {
    const payload = buildQuizPayload(courseId, quizSetId, title, classLevel, difficulty, sections, status);

    const data = await callSetter({
      url: `${baseUrl}/quizzes/bulk`,
      method: "post",
      bodyData: payload,
    });

    if (!data || data.ok === false) throw new Error(data?.error || "Failed to save quiz.");

    return data;
  };

  return {
    findCourseForLevel,
    loadQuizSets,
    createQuizSetForClass,
    updateQuizSetTitle,
    deleteQuizSetById,
    updateQuizSetStatus,
    loadSavedQuizzes,
    saveQuiz,
  };
}

function mapSectionsResponse(classLevel: string, rawSections: RawQuizSection[]): QuizSection[] {
  if (!rawSections || rawSections.length === 0) return [makeDefaultSection(0)];

  return rawSections
    .slice()
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((section, index) => toSectionShape(classLevel, section, index));
}

function toSectionShape(classLevel: string, section: RawQuizSection, index: number): QuizSection {
  const base = makeDefaultSection(index);
  const questions = Array.isArray(section.questions) ? section.questions : [];

  return {
    ...base,
    id: section.id || base.id,
    label: section.label || base.label,
    heading: section.heading || `${classLevel} Saved Questions`,
    bloomLevel: section.bloomLevel || "Remember",
    status: section.status || questions.find((question) => question.status)?.status || "draft",
    targetMarks: section.targetMarks ?? questions.length,
    targetTimeMinutes: section.targetTimeMinutes ?? questions.length,
    questions: questions
      .slice()
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map(toQuestionShape),
  };
}

function toQuestionShape(quiz: RawQuizQuestion) {
  const isShort = quiz.questionType === "Short";
  const imageUrl = quiz.imageUrl || quiz.questionImageUrl || quiz.questionImage || quiz.image || "";
  const questionInputMode = quiz.questionInputMode || quiz.questionMode || (imageUrl ? "image" : "text");
  const timeLimitMinutes = Number(quiz.timeLimitMinutes ?? quiz.timeLimit ?? 1) || 1;
  const marks = Number(quiz.marks ?? quiz.questionMarks ?? 1) || 1;

  return {
    id: quiz.id,
    prompt: quiz.prompt,
    imageUrl,
    questionInputMode,
    status: quiz.status || "draft",
    questionType: quiz.questionType,
    options: quiz.options || [],
    answer: quiz.answer || "",
    explanation: isShort ? "" : quiz.explanation || "",
    tips: isShort ? quiz.explanation || "" : "",
    timeLimitMinutes,
    marks,
    persisted: true,
    dirty: false,
  };
}
