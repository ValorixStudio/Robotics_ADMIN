import type { QuizSection } from "../../lib/types";

export function buildQuizPayload(
  courseId: string,
  quizSetId: string | undefined,
  title: string,
  classLevel: string,
  difficulty: string,
  sections: QuizSection[],
  status: "draft" | "live" = "draft",
) {
  return {
    courseId,
    ...(quizSetId ? { quizSetId } : {}),
    title,
    classLevel,
    difficulty,
    status,
    sections: sections.map((section, sectionIndex) => buildSectionPayload(section, sectionIndex, difficulty)),
  };
}

function buildSectionPayload(section: QuizSection, sectionIndex: number, difficulty: string) {
  return {
    id: section.id,
    label: section.label || `SECTION ${String.fromCharCode(65 + sectionIndex)}`,
    heading: section.heading || "",
    bloomLevel: section.bloomLevel || "",
    targetMarks: Number(section.targetMarks) || 0,
    targetTimeMinutes: Number(section.targetTimeMinutes) || 0,
    status: section.status || "draft",
    order: sectionIndex,
    questions: (section.questions || []).map((question, questionIndex) =>
      buildQuestionPayload(question, questionIndex, difficulty),
    ),
  };
}

function buildQuestionPayload(
  question: QuizSection["questions"] extends (infer Q)[] | undefined ? Q : never,
  questionIndex: number,
  difficulty: string,
) {
  const isShort = question.questionType === "Short";
  const timeLimitMinutes = Number(question.timeLimitMinutes) || 0;
  const marks = Number(question.marks) || 0;
  const rawQuestion = question as typeof question & { questionImageUrl?: string; questionMode?: "text" | "image" };
  const imageUrl = (rawQuestion.imageUrl || rawQuestion.questionImageUrl || "").trim();
  const questionInputMode = imageUrl ? "image" : rawQuestion.questionInputMode || rawQuestion.questionMode || "text";

  return {
    id: question.id,
    questionInputMode,
    questionMode: questionInputMode,
    questionType: (question.questionType || "SHORT").toUpperCase(),
    difficulty,
    prompt: questionInputMode === "image" ? "" : question.prompt || "",
    imageUrl: questionInputMode === "image" ? imageUrl : "",
    questionImageUrl: questionInputMode === "image" ? imageUrl : "",
    options: isShort ? [] : question.options || [],
    answer: isShort ? question.answer || question.tips || "" : question.answer || "",
    explanation: isShort ? question.tips || question.explanation || "" : question.explanation || "",
    timeLimitMinutes,
    marks,
    questionMarks: marks,
    order: questionIndex,
  };
}
