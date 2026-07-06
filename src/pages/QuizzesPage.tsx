import { useEffect, useMemo, useState } from "react";
import { API_BASE_URL, API_KEY } from "@/config/apiUrls";
import { authToken } from "@/lib/authToken";

type GradeLevel = "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "11" | "12" |  "engineering";
type Difficulty = "easy" | "medium" | "hard";
type QuestionType = "MCQ" | "True/False" | "Short";

type QuizQuestion = {
  id: string;
  prompt: string;
  options: string[];
  answer: string;
  explanation: string;
  tips: string;
  type: QuestionType;
  timeLimitMinutes: number;
  marks: number;
  sectionId: string;
};

type QuizSection = {
  id: string;
  label: string;
  heading: string;
  bloomLevel: string;
  targetMarks: number;
  targetTimeMinutes: number;
};

type QuizClass = {
  id: string;
  title: string;
  instructorName?: string;
  quizCount?: number;
};

type StoredQuiz = {
  id: string;
  courseId: string;
  level: string;
  prompt: string;
  options: string[];
  answer: string;
  explanation: string;
  tips: string;
  questionType: QuestionType;
  difficulty: Difficulty;
  timeLimitMinutes: number;
  marks: number;
  sectionId: string;
};

type StudentQuizResult = {
  studentId: string;
  studentName: string;
  grade: string;
  attempted: boolean;
  correctAnswers: number;
  wrongAnswers: number;
  totalQuestions: number;
  marks: number;
  totalMarks: number;
  submittedAt?: string;
};

type RawStudentQuizResult = Partial<StudentQuizResult> & {
  id?: string;
  name?: string;
  student?: {
    id?: string;
    name?: string;
    grade?: string | number;
  };
  score?: number;
  correct?: number;
  wrong?: number;
  total?: number;
  totalScore?: number;
  hasAttempted?: boolean;
};

type QuizResultsResponse = {
  ok?: boolean;
  results?: RawStudentQuizResult[];
  students?: RawStudentQuizResult[];
  attempts?: RawStudentQuizResult[];
};

type AiDraftResponse = {
  prompt?: string;
  question?: string;
  options?: string[];
  answer?: string;
  explanation?: string;
  why?: string;
};

type ApiErrorResponse = {
  error?: string;
  message?: string;
};

type QuizValidationErrors = Partial<Record<"courseId" | "prompt" | "options" | "answer" | "timeLimitMinutes" | "marks", string>>;

const emptyManualQuestion: QuizQuestion = {
  id: "",
  prompt: "",
  options: ["", "", "", ""],
  answer: "",
  explanation: "",
  tips: "",
  type: "MCQ",
  timeLimitMinutes: 1,
  marks: 1,
  sectionId: "",
};

const emptyStoredQuizDraft: StoredQuiz = {
  id: "",
  courseId: "",
  level: "",
  prompt: "",
  options: ["", "", "", ""],
  answer: "",
  explanation: "",
  tips: "",
  questionType: "MCQ",
  difficulty: "medium",
  timeLimitMinutes: 1,
  marks: 1,
  sectionId: "",
};

const sectionLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

const nextSectionLabel = (existingCount: number) => `SECTION ${sectionLetters[existingCount % sectionLetters.length]}`;

const makeDefaultSection = (existingCount: number): QuizSection => ({
  id: makeId(),
  label: nextSectionLabel(existingCount),
  heading: existingCount === 0 ? "Remember & Recall" : "",
  bloomLevel: existingCount === 0 ? "Level 1 — Remember" : "",
  targetMarks: existingCount === 0 ? 10 : 0,
  targetTimeMinutes: existingCount === 0 ? 20 : 0,
});

const gradeOptions: { value: GradeLevel; label: string }[] = [
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

const levelLabels: Record<GradeLevel, string> = {
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

const difficultyLabels: Record<Difficulty, string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
};

const inputClass =
  "w-full rounded-lg border border-gray-200 bg-white px-3.5 py-3 text-sm text-gray-800 shadow-sm outline-none transition-colors focus:border-[#e51b72] focus:ring-2 focus:ring-[#e51b72]/10";
const errorInputClass = "border-red-400 bg-red-50/40 focus:border-red-500 focus:ring-red-500/10";
const labelClass = "mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-gray-500";
const errorTextClass = "mt-1.5 text-[11px] font-semibold text-red-600";

const makeId = () => `${Date.now()}-${Math.random().toString(36).slice(2)}`;

const sampleStudentResults: StudentQuizResult[] = [
  {
    studentId: "STU12345",
    studentName: "Arjun Patel",
    grade: "Class 10",
    attempted: true,
    correctAnswers: 8,
    wrongAnswers: 2,
    totalQuestions: 10,
    marks: 16,
    totalMarks: 20,
    submittedAt: "Today, 10:25 AM",
  },
  {
    studentId: "STU12346",
    studentName: "Priya Sharma",
    grade: "Class 9",
    attempted: true,
    correctAnswers: 6,
    wrongAnswers: 4,
    totalQuestions: 10,
    marks: 12,
    totalMarks: 20,
    submittedAt: "Yesterday, 4:10 PM",
  },
  {
    studentId: "STU12347",
    studentName: "Rohit Kumar",
    grade: "Class 11",
    attempted: false,
    correctAnswers: 0,
    wrongAnswers: 0,
    totalQuestions: 10,
    marks: 0,
    totalMarks: 20,
  },
  {
    studentId: "STU12348",
    studentName: "Sneha Rao",
    grade: "Class 10",
    attempted: true,
    correctAnswers: 7,
    wrongAnswers: 3,
    totalQuestions: 10,
    marks: 14,
    totalMarks: 20,
    submittedAt: "Jun 21, 3:35 PM",
  },
];

function normalizeStudentResult(result: RawStudentQuizResult, fallbackTotalQuestions: number): StudentQuizResult {
  const totalQuestions = result.totalQuestions ?? result.total ?? fallbackTotalQuestions;
  const correctAnswers = result.correctAnswers ?? result.correct ?? 0;
  const wrongAnswers = result.wrongAnswers ?? result.wrong ?? Math.max(totalQuestions - correctAnswers, 0);
  const totalMarks = result.totalMarks ?? result.totalScore ?? totalQuestions * 2;
  const marks = result.marks ?? result.score ?? correctAnswers * 2;
  const attempted = result.attempted ?? result.hasAttempted ?? (correctAnswers > 0 || marks > 0);

  return {
    studentId: result.studentId ?? result.student?.id ?? result.id ?? "student",
    studentName: result.studentName ?? result.student?.name ?? result.name ?? "Student",
    grade: String(result.grade ?? result.student?.grade ?? "Class"),
    attempted,
    correctAnswers: attempted ? correctAnswers : 0,
    wrongAnswers: attempted ? wrongAnswers : 0,
    totalQuestions,
    marks: attempted ? marks : 0,
    totalMarks,
    submittedAt: result.submittedAt,
  };
}

function validateQuizInput({
  courseId,
  prompt,
  options,
  answer,
  questionType,
  timeLimitMinutes,
  marks,
}: {
  courseId: string;
  prompt: string;
  options: string[];
  answer: string;
  questionType: QuestionType;
  timeLimitMinutes: number;
  marks: number;
}) {
  const errors: QuizValidationErrors = {};
  const cleanPrompt = prompt.trim();
  const cleanAnswer = answer.trim();
  const cleanOptions = options.map((option) => option.trim()).filter(Boolean);

  if (!courseId) errors.courseId = "No course found for this class.";
  if (!cleanPrompt) errors.prompt = "Question is required.";
  if (questionType !== "Short" && !cleanAnswer) errors.answer = "Correct answer is required.";

  if (questionType === "MCQ") {
    if (cleanOptions.length !== 4) {
      errors.options = "MCQ needs exactly 4 options.";
    } else if (cleanAnswer && !cleanOptions.includes(cleanAnswer)) {
      errors.answer = "Answer must exactly match one option.";
    }
  }

  if (questionType === "True/False" && cleanAnswer !== "True" && cleanAnswer !== "False") {
    errors.answer = "Answer must be True or False.";
  }

  if (!timeLimitMinutes || timeLimitMinutes <= 0) {
    errors.timeLimitMinutes = "Enter time in minutes (greater than 0).";
  }

  if (!marks || marks <= 0) {
    errors.marks = "Enter marks (greater than 0).";
  }

  return errors;
}

function getHeaders() {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const token = authToken.get();

  if (API_KEY) headers["x-api-key"] = API_KEY;
  if (token) headers.Authorization = `Bearer ${token}`;

  return headers;
}

async function requestJson<T>(path: string, init?: RequestInit) {
  const response = await fetch(`${API_BASE_URL.replace(/\/$/, "")}${path}`, {
    ...init,
    headers: {
      ...getHeaders(),
      ...init?.headers,
    },
  });
  const data = (await response.json().catch(() => ({}))) as T & ApiErrorResponse;

  if (!response.ok) {
    throw new Error(data.error ?? data.message ?? "Request failed.");
  }

  return data;
}

async function requestAiDraft(payload: {
  level: string;
  topic: string;
  difficulty: Difficulty;
  questionType: QuestionType;
  instruction: string;
}) {
  const data = await requestJson<AiDraftResponse>("/quizzes/ai-draft", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (!(data.prompt ?? data.question) || !data.answer) {
    throw new Error("AI draft response is incomplete.");
  }

  return data;
}

function IconButton({
  children,
  onClick,
  title,
}: {
  children: React.ReactNode;
  onClick: () => void;
  title: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 shadow-sm transition-colors hover:border-[#e51b72] hover:text-[#e51b72]"
    >
      {children}
    </button>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10 4v12M4 10h12" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M10 3v9" />
      <path d="m6.5 8.5 3.5 3.5 3.5-3.5" />
      <path d="M4 16h12" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 6h12" />
      <path d="M8 6V4h4v2" />
      <path d="m6 6 .7 10h6.6L14 6" />
      <path d="M8.5 9v4M11.5 9v4" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 14.5V16h1.5L15 6.5 13.5 5 4 14.5Z" />
      <path d="m12.5 6 1.5 1.5" />
    </svg>
  );
}

export default function QuizzesPage() {
  const [level, setLevel] = useState<GradeLevel>("6");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [sections, setSections] = useState<QuizSection[]>(() => [makeDefaultSection(0)]);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [quizClasses, setQuizClasses] = useState<QuizClass[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [storedQuizzes, setStoredQuizzes] = useState<StoredQuiz[]>([]);
  const [manualQuestion, setManualQuestion] = useState<QuizQuestion>(emptyManualQuestion);
  const [aiInstruction, setAiInstruction] = useState("");
  const [aiStatus, setAiStatus] = useState<"idle" | "loading" | "error">("idle");
  const [aiMessage, setAiMessage] = useState("");
  const [dbStatus, setDbStatus] = useState<"idle" | "loading" | "saving" | "error">("idle");
  const [dbMessage, setDbMessage] = useState("");
  const [editingQuizId, setEditingQuizId] = useState<string | null>(null);
  const [editingQuizDraft, setEditingQuizDraft] = useState<StoredQuiz>(emptyStoredQuizDraft);
  const [manualErrors, setManualErrors] = useState<QuizValidationErrors>({});
  const [editErrors, setEditErrors] = useState<QuizValidationErrors>({});
  const [studentResults, setStudentResults] = useState<StudentQuizResult[]>(sampleStudentResults);
  const [resultsStatus, setResultsStatus] = useState<"idle" | "loading" | "error">("idle");
  const [resultsMessage, setResultsMessage] = useState("");

  const mcqCount = questions.filter((question) => question.type === "MCQ").length;
  const shortCount = questions.filter((question) => question.type === "Short").length;
  const resultSummary = useMemo(() => {
    const attemptedCount = studentResults.filter((result) => result.attempted).length;
    const totalMarks = studentResults.reduce((sum, result) => sum + result.marks, 0);
    const averageMarks = attemptedCount > 0 ? Math.round(totalMarks / attemptedCount) : 0;

    return {
      totalStudents: studentResults.length,
      attemptedCount,
      notAttemptedCount: studentResults.length - attemptedCount,
      averageMarks,
    };
  }, [studentResults]);
  const fallbackStudentResults = useMemo(
    () => sampleStudentResults.map((result) => ({ ...result, grade: levelLabels[level] })),
    [level],
  );

  const filteredQuizClasses = useMemo(() => {
    const classLabel = levelLabels[level].toLowerCase();
    const classNumber = level === "engineering" ? "engineering" : `class ${level}`;
    return quizClasses.filter((quizClass) => {
      const title = quizClass.title.toLowerCase();
      return title.includes(classLabel) || title.includes(classNumber);
    });
  }, [level, quizClasses]);

  const selectedClass = quizClasses.find((quizClass) => quizClass.id === selectedCourseId);
  const quizTitle = `${selectedClass?.title ?? levelLabels[level]} Quiz`;

  const loadStoredQuizzes = async (courseId: string) => {
    if (!courseId) return;
    const data = await requestJson<{ ok: boolean; quizzes: StoredQuiz[] }>(
      `/quizzes?courseId=${encodeURIComponent(courseId)}`,
    );
    setStoredQuizzes(data.quizzes ?? []);
  };

  const loadStudentQuizResults = async (courseId: string) => {
    if (!courseId) {
      setStudentResults(fallbackStudentResults);
      return;
    }

    try {
      setResultsStatus("loading");
      setResultsMessage("");
      const data = await requestJson<QuizResultsResponse>(`/quizzes/results?courseId=${encodeURIComponent(courseId)}`);
      const rawResults = data.results ?? data.students ?? data.attempts ?? [];
      const totalQuestions = Math.max(storedQuizzes.length || questions.length || 10, 1);

      setStudentResults(
        rawResults.length > 0
          ? rawResults.map((result) => normalizeStudentResult(result, totalQuestions))
          : fallbackStudentResults,
      );
      setResultsStatus("idle");
    } catch {
      setStudentResults(fallbackStudentResults);
      setResultsStatus("error");
      setResultsMessage("Showing sample results until quiz result API is available.");
    }
  };

  useEffect(() => {
    const loadQuizClasses = async () => {
      try {
        setDbStatus("loading");
        const data = await requestJson<{ ok: boolean; classes: QuizClass[] }>("/quizzes/classes");
        const classes = data.classes ?? [];
        setQuizClasses(classes);
        setDbStatus("idle");
      } catch (error) {
        setDbStatus("error");
        setDbMessage(error instanceof Error ? error.message : "Unable to load classes.");
      }
    };

    void loadQuizClasses();
  }, []);

  useEffect(() => {
    setSelectedCourseId((current) => {
      if (filteredQuizClasses.some((quizClass) => quizClass.id === current)) return current;
      return filteredQuizClasses[0]?.id || "";
    });
  }, [filteredQuizClasses]);

  useEffect(() => {
    if (!selectedCourseId) {
      setStoredQuizzes([]);
      return;
    }

    const load = async () => {
      try {
        setDbStatus("loading");
        await loadStoredQuizzes(selectedCourseId);
        setDbStatus("idle");
      } catch (error) {
        setDbStatus("error");
        setDbMessage(error instanceof Error ? error.message : "Unable to load saved quizzes.");
      }
    };

    void load();
  }, [selectedCourseId]);

  useEffect(() => {
    void loadStudentQuizResults(selectedCourseId);
  }, [selectedCourseId, storedQuizzes.length, questions.length, level]);

  useEffect(() => {
    setManualQuestion((current) => {
      if (sections.some((section) => section.id === current.sectionId)) return current;
      return { ...current, sectionId: sections[0]?.id ?? "" };
    });
  }, [sections]);

  const updateQuestion = (questionId: string, updates: Partial<QuizQuestion>) => {
    setQuestions((current) =>
      current.map((question) => (question.id === questionId ? { ...question, ...updates } : question)),
    );
  };

  const updateQuestionOption = (questionId: string, optionIndex: number, value: string) => {
    setQuestions((current) =>
      current.map((question) =>
        question.id === questionId
          ? { ...question, options: question.options.map((option, index) => (index === optionIndex ? value : option)) }
          : question,
      ),
    );
  };

  const removeQuestion = (questionId: string) => {
    setQuestions((current) => current.filter((question) => question.id !== questionId));
  };

  const addSection = () => {
    setSections((current) => {
      const newSection = makeDefaultSection(current.length);
      setManualQuestion((manual) => (manual.sectionId ? manual : { ...manual, sectionId: newSection.id }));
      return [...current, newSection];
    });
  };

  const updateSection = (sectionId: string, updates: Partial<QuizSection>) => {
    setSections((current) =>
      current.map((section) => (section.id === sectionId ? { ...section, ...updates } : section)),
    );
  };

  const removeSection = (sectionId: string) => {
    setSections((current) => {
      if (current.length <= 1) return current;
      return current.filter((section) => section.id !== sectionId);
    });
  };

  const updateManualOption = (optionIndex: number, value: string) => {
    setManualQuestion((current) => ({
      ...current,
      options: current.options.map((option, index) => (index === optionIndex ? value : option)),
    }));
  };

  const startEditStoredQuiz = (quiz: StoredQuiz) => {
    setEditingQuizId(quiz.id);
    setEditingQuizDraft({
      ...quiz,
      timeLimitMinutes: quiz.timeLimitMinutes || 1,
      marks: quiz.marks || 1,
      tips: quiz.tips || "",
      sectionId: sections.some((section) => section.id === quiz.sectionId) ? quiz.sectionId : sections[0]?.id ?? "",
      options:
        quiz.questionType === "Short"
          ? []
          : quiz.questionType === "True/False"
            ? ["True", "False"]
            : [...quiz.options, "", "", "", ""].slice(0, 4),
    });
    setDbMessage("");
    setEditErrors({});
  };

  const updateEditingQuizOption = (optionIndex: number, value: string) => {
    setEditingQuizDraft((current) => ({
      ...current,
      options: current.options.map((option, index) => (index === optionIndex ? value : option)),
    }));
  };

  const saveStoredQuiz = async () => {
    if (!editingQuizId) return;
    const cleanOptions =
      editingQuizDraft.questionType === "Short"
        ? []
        : editingQuizDraft.questionType === "True/False"
          ? ["True", "False"]
          : editingQuizDraft.options.map((option) => option.trim()).filter(Boolean);
    const validationErrors = validateQuizInput({
      courseId: editingQuizDraft.courseId,
      prompt: editingQuizDraft.prompt,
      options: editingQuizDraft.options,
      answer: editingQuizDraft.answer,
      questionType: editingQuizDraft.questionType,
      timeLimitMinutes: editingQuizDraft.timeLimitMinutes,
      marks: editingQuizDraft.marks,
    });

    if (Object.keys(validationErrors).length > 0) {
      setEditErrors(validationErrors);
      setDbStatus("error");
      setDbMessage("Fix highlighted fields before saving.");
      return;
    }

    try {
      setDbStatus("saving");
      setDbMessage("");
      await requestJson<{ ok: boolean; quiz: StoredQuiz }>(`/quizzes/${editingQuizId}`, {
        method: "PUT",
        body: JSON.stringify({
          courseId: editingQuizDraft.courseId,
          level: editingQuizDraft.level || levelLabels[level],
          prompt: editingQuizDraft.prompt.trim(),
          options: cleanOptions,
          answer: editingQuizDraft.answer.trim(),
          explanation: editingQuizDraft.explanation.trim(),
          tips: editingQuizDraft.tips.trim(),
          questionType: editingQuizDraft.questionType,
          difficulty: editingQuizDraft.difficulty,
          timeLimitMinutes: editingQuizDraft.timeLimitMinutes,
          marks: editingQuizDraft.marks,
          sectionId: editingQuizDraft.sectionId,
        }),
      });
      await loadStoredQuizzes(selectedCourseId);
      setEditingQuizId(null);
      setEditingQuizDraft(emptyStoredQuizDraft);
      setEditErrors({});
      setDbStatus("idle");
      setDbMessage("Question updated.");
    } catch (error) {
      setDbStatus("error");
      setDbMessage(error instanceof Error ? error.message : "Unable to update question.");
    }
  };

  const deleteStoredQuiz = async (quizId: string) => {
    if (!window.confirm("Delete this question?")) return;

    try {
      setDbStatus("saving");
      setDbMessage("");
      await fetch(`${API_BASE_URL.replace(/\/$/, "")}/quizzes/${quizId}`, {
        method: "DELETE",
        headers: getHeaders(),
      }).then((response) => {
        if (!response.ok && response.status !== 204) throw new Error("Unable to delete question.");
      });
      await loadStoredQuizzes(selectedCourseId);
      if (editingQuizId === quizId) {
        setEditingQuizId(null);
        setEditingQuizDraft(emptyStoredQuizDraft);
      }
      setDbStatus("idle");
      setDbMessage("Question deleted.");
    } catch (error) {
      setDbStatus("error");
      setDbMessage(error instanceof Error ? error.message : "Unable to delete question.");
    }
  };

  const addManualQuestion = async () => {
    const cleanOptions =
      manualQuestion.type === "Short"
        ? []
        : manualQuestion.options.map((option) => option.trim()).filter(Boolean);
    const validationErrors = validateQuizInput({
      courseId: selectedCourseId,
      prompt: manualQuestion.prompt,
      options: manualQuestion.type === "True/False" ? ["True", "False"] : manualQuestion.options,
      answer: manualQuestion.answer,
      questionType: manualQuestion.type,
      timeLimitMinutes: manualQuestion.timeLimitMinutes,
      marks: manualQuestion.marks,
    });

    if (Object.keys(validationErrors).length > 0) {
      setManualErrors(validationErrors);
      setDbStatus("error");
      setDbMessage("Fix highlighted fields before saving.");
      return;
    }

    const nextQuestion: QuizQuestion = {
      ...manualQuestion,
      id: makeId(),
      prompt: manualQuestion.prompt.trim() || "Untitled question",
      options: manualQuestion.type === "True/False" ? ["True", "False"] : cleanOptions,
      answer:
        manualQuestion.type === "Short"
          ? manualQuestion.answer.trim()
          : manualQuestion.answer.trim() || cleanOptions[0] || "Answer required",
      explanation: manualQuestion.explanation.trim() || "Add the reason for this answer.",
      tips: manualQuestion.tips.trim(),
    };

    try {
      setDbStatus("saving");
      setDbMessage("");
      await requestJson<{ ok: boolean; quiz: StoredQuiz }>("/quizzes", {
        method: "POST",
        body: JSON.stringify({
          courseId: selectedCourseId,
          level: levelLabels[level],
          prompt: nextQuestion.prompt,
          options: nextQuestion.options,
          answer: nextQuestion.answer,
          explanation: nextQuestion.explanation,
          tips: nextQuestion.tips,
          questionType: nextQuestion.type,
          difficulty,
          timeLimitMinutes: nextQuestion.timeLimitMinutes,
          marks: nextQuestion.marks,
          sectionId: nextQuestion.sectionId,
        }),
      });
      await loadStoredQuizzes(selectedCourseId);
      setManualQuestion(emptyManualQuestion);
      setManualErrors({});
      setDbStatus("idle");
      setDbMessage("Question saved in DB.");
    } catch (error) {
      setDbStatus("error");
      setDbMessage(error instanceof Error ? error.message : "Unable to save question.");
    }
  };

  const fillManualQuestionWithAiDraft = async () => {
    if (!aiInstruction.trim()) {
      setAiStatus("error");
      setAiMessage("Type your question first, for example: What is Node.js?");
      return;
    }

    setAiStatus("loading");
    setAiMessage("");

    try {
      const serverDraft = await requestAiDraft({
        level: levelLabels[level],
        topic: selectedClass?.title ?? levelLabels[level],
        difficulty,
        questionType: manualQuestion.type,
        instruction: aiInstruction,
      });
      const draft = {
        prompt: serverDraft.prompt ?? serverDraft.question ?? "",
        options: serverDraft.options ?? [],
        answer: serverDraft.answer ?? "",
        explanation: serverDraft.explanation ?? serverDraft.why ?? "",
      };

      setManualQuestion((current) => ({
        ...current,
        prompt: draft.prompt,
        options: draft.options.length > 0 ? draft.options : current.options,
        answer: draft.answer,
        explanation: draft.explanation,
      }));
      setAiStatus("idle");
    } catch (error) {
      setAiStatus("error");
      setAiMessage(
        error instanceof Error
          ? `AI draft failed: ${error.message}`
          : "AI draft failed. Check Gemini key and backend route.",
      );
    }
  };

  const quizText = useMemo(
    () =>
      [
        quizTitle,
        `Level: ${levelLabels[level]}`,
        `Difficulty: ${difficultyLabels[difficulty]}`,
        "",
        ...sections.flatMap((sectionItem) => {
          const sectionQuestions = questions.filter(
            (question) => (question.sectionId || sections[0]?.id) === sectionItem.id,
          );
          if (sectionQuestions.length === 0) return [];

          return [
            `${sectionItem.label}${sectionItem.heading ? ` — ${sectionItem.heading}` : ""}`,
            `Bloom's Taxonomy Level: ${sectionItem.bloomLevel || "—"} | Marks: ${sectionItem.targetMarks} | Time: ~${sectionItem.targetTimeMinutes} min`,
            "",
            ...sectionQuestions.flatMap((question, index) => [
              `${index + 1}. ${question.prompt}`,
              ...question.options.map((option, optionIndex) => `   ${String.fromCharCode(65 + optionIndex)}. ${option}`),
              ...(question.type === "Short"
                ? [`Tips: ${question.tips}`]
                : [`Answer: ${question.answer}`, `Explanation: ${question.explanation}`]),
              `Time: ${question.timeLimitMinutes} min | Marks: ${question.marks}`,
              "",
            ]),
          ];
        }),
      ].join("\n"),
    [difficulty, level, questions, quizTitle, sections],
  );

  const downloadQuiz = () => {
    const blob = new Blob([quizText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${quizTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="grid gap-5 border-b border-gray-100 bg-gray-50/70 p-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Quiz Generator</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-500">
              Create editable quizzes for Class 3 to Class 12 and engineering learners.
            </p>
          </div>
          
        </div>

        <div className="grid gap-4 p-5 md:grid-cols-2">
          <label className="block">
            <span className={labelClass}>Class / Level</span>
            <select value={level} onChange={(event) => setLevel(event.target.value as GradeLevel)} className={inputClass}>
              {gradeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <div>
            <span className={labelClass}>Difficulty</span>
            <div className="grid grid-cols-3 gap-1 rounded-lg bg-gray-100 p-1">
              {(["easy", "medium", "hard"] as Difficulty[]).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setDifficulty(option)}
                  className={`rounded-md px-2 py-3 text-xs font-bold transition-colors ${
                    difficulty === option ? "bg-white text-[#e51b72] shadow-sm" : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  {difficultyLabels[option]}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-gray-100 px-5 py-4 text-[11px] font-bold text-gray-500">
          <span className="rounded-full bg-pink-50 px-3 py-1.5 text-[#e51b72]">{levelLabels[level]}</span>
          {selectedClass && <span className="rounded-full bg-gray-100 px-3 py-1.5">{selectedClass.title}</span>}
          <span className="rounded-full bg-gray-100 px-3 py-1.5">{questions.length} questions</span>
          <span className="rounded-full bg-gray-100 px-3 py-1.5">{storedQuizzes.length} saved in DB</span>
          <span className="rounded-full bg-gray-100 px-3 py-1.5">{mcqCount} MCQ</span>
          <span className="rounded-full bg-gray-100 px-3 py-1.5">{shortCount} short</span>
          {dbMessage && (
            <span className={`rounded-full px-3 py-1.5 ${dbStatus === "error" ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
              {dbMessage}
            </span>
          )}
          {!selectedCourseId && (
            <span className="rounded-full bg-red-50 px-3 py-1.5 text-red-700">
              No course found for {levelLabels[level]}
            </span>
          )}
        </div>
      </section>

     

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <main className="space-y-5">
          <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-5 py-4">
              <div>
                <h2 className="text-sm font-bold text-gray-900">{quizTitle}</h2>
                <p className="mt-1 text-xs text-gray-500">Edit questions, answers, options, and explanations in one place.</p>
              </div>
              <span className="rounded-full bg-gray-100 px-3 py-1.5 text-[11px] font-bold text-gray-600">
                {difficultyLabels[difficulty]}
              </span>
            </div>

            <div className="space-y-4 bg-gray-50/60 p-5">
              {questions.length === 0 && storedQuizzes.length === 0 && (
                <div className="rounded-xl border border-dashed border-gray-300 bg-white px-5 py-10 text-center">
                  <p className="text-sm font-bold text-gray-800">No questions yet</p>
                  <p className="mt-1 text-xs text-gray-500">Use AI Assist or add your own question from the right panel.</p>
                </div>
              )}

              {sections.map((sectionItem) => {
                const sectionStoredQuizzes = storedQuizzes.filter(
                  (quiz) => (quiz.sectionId || sections[0]?.id) === sectionItem.id,
                );
                const sectionQuestions = questions.filter(
                  (question) => (question.sectionId || sections[0]?.id) === sectionItem.id,
                );

                return (
                  <div key={sectionItem.id} className="space-y-4">
                    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <span className="inline-block rounded-full bg-gray-900 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                          {sectionItem.label}
                        </span>
                        <span className="text-[11px] font-semibold text-gray-400">
                          {sectionStoredQuizzes.length + sectionQuestions.length} question
                          {sectionStoredQuizzes.length + sectionQuestions.length === 1 ? "" : "s"}
                        </span>
                      </div>
                      <h3 className="mt-2 text-lg font-bold text-gray-900">{sectionItem.heading || "Untitled section"}</h3>
                      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                        <div className="rounded-lg bg-gray-50 px-2 py-2">
                          <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">
                            Bloom&apos;s Taxonomy Level
                          </p>
                          <p className="mt-1 text-xs font-bold text-gray-800">{sectionItem.bloomLevel || "—"}</p>
                        </div>
                        <div className="rounded-lg bg-gray-50 px-2 py-2">
                          <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">Marks</p>
                          <p className="mt-1 text-xs font-bold text-gray-800">{sectionItem.targetMarks}</p>
                        </div>
                        <div className="rounded-lg bg-gray-50 px-2 py-2">
                          <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">Time</p>
                          <p className="mt-1 text-xs font-bold text-gray-800">~{sectionItem.targetTimeMinutes} min</p>
                        </div>
                      </div>
                    </div>

              {sectionStoredQuizzes.map((quiz, index) => {
                const isEditing = editingQuizId === quiz.id;

                return (
                  <article key={quiz.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-800 text-xs font-bold text-white">
                          {index + 1}
                        </span>
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wide text-gray-400">Saved Question</p>
                          <p className="mt-1 text-xs font-semibold text-gray-500">
                            {isEditing ? editingQuizDraft.questionType : quiz.questionType}
                            {" | "}
                            {isEditing ? editingQuizDraft.level || levelLabels[level] : quiz.level || levelLabels[level]}
                            {" | "}
                            {isEditing ? editingQuizDraft.timeLimitMinutes : quiz.timeLimitMinutes || 1} min
                            {" | "}
                            {isEditing ? editingQuizDraft.marks : quiz.marks || 1} marks
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isEditing ? (
                          <>
                            <button
                              type="button"
                              onClick={() => void saveStoredQuiz()}
                              disabled={dbStatus === "saving"}
                              className="rounded-lg bg-[#e51b72] px-3 py-2 text-[11px] font-bold text-white disabled:cursor-wait disabled:opacity-70"
                            >
                              {dbStatus === "saving" ? "Saving..." : "Save"}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingQuizId(null);
                                setEditingQuizDraft(emptyStoredQuizDraft);
                                setEditErrors({});
                              }}
                              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-[11px] font-bold text-gray-600"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <IconButton title="Edit question" onClick={() => startEditStoredQuiz(quiz)}>
                              <EditIcon />
                            </IconButton>
                            <IconButton title="Delete question" onClick={() => void deleteStoredQuiz(quiz.id)}>
                              <TrashIcon />
                            </IconButton>
                          </>
                        )}
                      </div>
                    </div>

                    {isEditing ? (
                      <div className="mt-4 grid gap-4">
                        <label className="block">
                          <span className={labelClass}>Question</span>
                          <textarea
                            value={editingQuizDraft.prompt}
                            onChange={(event) =>
                              setEditingQuizDraft((current) => ({ ...current, prompt: event.target.value }))
                            }
                            rows={2}
                            className={`w-full resize-none rounded-lg border bg-white px-3.5 py-3 text-sm font-semibold leading-6 text-gray-900 shadow-sm outline-none transition-colors focus:border-[#e51b72] focus:ring-2 focus:ring-[#e51b72]/10 ${
                              editErrors.prompt ? errorInputClass : "border-gray-200"
                            }`}
                          />
                          {editErrors.prompt && <p className={errorTextClass}>{editErrors.prompt}</p>}
                        </label>

                        <label className="block">
                          <span className={labelClass}>Section</span>
                          <select
                            value={editingQuizDraft.sectionId}
                            onChange={(event) =>
                              setEditingQuizDraft((current) => ({ ...current, sectionId: event.target.value }))
                            }
                            className={inputClass}
                          >
                            {sections.map((sectionOption) => (
                              <option key={sectionOption.id} value={sectionOption.id}>
                                {sectionOption.label}
                                {sectionOption.heading ? ` — ${sectionOption.heading}` : ""}
                              </option>
                            ))}
                          </select>
                        </label>

                        <div className="grid gap-4 md:grid-cols-[180px_minmax(0,1fr)]">
                          <label className="block">
                            <span className={labelClass}>Type</span>
                            <select
                              value={editingQuizDraft.questionType}
                              onChange={(event) => {
                                const nextType = event.target.value as QuestionType;
                                setEditingQuizDraft((current) => ({
                                  ...current,
                                  questionType: nextType,
                                  options:
                                    nextType === "Short"
                                      ? []
                                      : nextType === "True/False"
                                        ? ["True", "False"]
                                        : current.options.length > 0
                                          ? [...current.options, "", "", "", ""].slice(0, 4)
                                          : ["", "", "", ""],
                                  answer: nextType === "True/False" ? "True" : current.answer,
                                }));
                              }}
                              className={inputClass}
                            >
                              <option value="MCQ">MCQ</option>
                              <option value="True/False">True/False</option>
                              <option value="Short">Short</option>
                            </select>
                          </label>

                          {editingQuizDraft.questionType !== "Short" && (
                            <label className="block">
                              <span className={labelClass}>Answer</span>
                              <input
                                value={editingQuizDraft.answer}
                                onChange={(event) =>
                                  setEditingQuizDraft((current) => ({ ...current, answer: event.target.value }))
                                }
                                className={`${inputClass} ${editErrors.answer ? errorInputClass : ""}`}
                              />
                              {editErrors.answer && <p className={errorTextClass}>{editErrors.answer}</p>}
                            </label>
                          )}
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          <label className="block">
                            <span className={labelClass}>Time (minutes)</span>
                            <input
                              type="number"
                              min={1}
                              value={editingQuizDraft.timeLimitMinutes}
                              onChange={(event) =>
                                setEditingQuizDraft((current) => ({
                                  ...current,
                                  timeLimitMinutes: Number(event.target.value) || 0,
                                }))
                              }
                              className={`${inputClass} ${editErrors.timeLimitMinutes ? errorInputClass : ""}`}
                              placeholder="e.g. 2"
                            />
                            {editErrors.timeLimitMinutes && <p className={errorTextClass}>{editErrors.timeLimitMinutes}</p>}
                          </label>

                          <label className="block">
                            <span className={labelClass}>Marks</span>
                            <input
                              type="number"
                              min={1}
                              value={editingQuizDraft.marks}
                              onChange={(event) =>
                                setEditingQuizDraft((current) => ({
                                  ...current,
                                  marks: Number(event.target.value) || 0,
                                }))
                              }
                              className={`${inputClass} ${editErrors.marks ? errorInputClass : ""}`}
                              placeholder="e.g. 2"
                            />
                            {editErrors.marks && <p className={errorTextClass}>{editErrors.marks}</p>}
                          </label>
                        </div>

                        {editingQuizDraft.options.length > 0 && (
                          <div>
                            <span className={labelClass}>Options</span>
                            <div className="grid gap-2 sm:grid-cols-2">
                              {editingQuizDraft.options.map((option, optionIndex) => (
                                <input
                                  key={`${quiz.id}-edit-${optionIndex}`}
                                  value={option}
                                  disabled={editingQuizDraft.questionType === "True/False"}
                                  onChange={(event) => updateEditingQuizOption(optionIndex, event.target.value)}
                                  className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-800 shadow-sm outline-none transition-colors focus:border-[#e51b72] focus:ring-2 focus:ring-[#e51b72]/10 disabled:bg-gray-50 disabled:text-gray-500"
                                  placeholder={`Option ${String.fromCharCode(65 + optionIndex)}`}
                                />
                              ))}
                            </div>
                            {editErrors.options && <p className={errorTextClass}>{editErrors.options}</p>}
                          </div>
                        )}

                        {editingQuizDraft.questionType === "Short" ? (
                          <label className="block">
                            <span className={labelClass}>Tips</span>
                            <textarea
                              value={editingQuizDraft.tips}
                              onChange={(event) =>
                                setEditingQuizDraft((current) => ({ ...current, tips: event.target.value }))
                              }
                              rows={2}
                              className="w-full resize-none rounded-lg border border-gray-200 bg-white px-3.5 py-3 text-sm leading-6 text-gray-700 shadow-sm outline-none transition-colors focus:border-[#e51b72] focus:ring-2 focus:ring-[#e51b72]/10"
                              placeholder="Give the student a hint to help them answer"
                            />
                          </label>
                        ) : (
                          <label className="block">
                            <span className={labelClass}>Why</span>
                            <textarea
                              value={editingQuizDraft.explanation}
                              onChange={(event) =>
                                setEditingQuizDraft((current) => ({ ...current, explanation: event.target.value }))
                              }
                              rows={2}
                              className="w-full resize-none rounded-lg border border-gray-200 bg-white px-3.5 py-3 text-sm leading-6 text-gray-700 shadow-sm outline-none transition-colors focus:border-[#e51b72] focus:ring-2 focus:ring-[#e51b72]/10"
                            />
                          </label>
                        )}
                      </div>
                    ) : (
                      <div className="mt-4 space-y-3">
                        <p className="text-sm font-bold leading-6 text-gray-900">{quiz.prompt}</p>
                        {quiz.options.length > 0 && (
                          <div className="grid gap-2 sm:grid-cols-2">
                            {quiz.options.map((option, optionIndex) => (
                              <div
                                key={`${quiz.id}-${optionIndex}`}
                                className={`rounded-lg border px-3 py-2 text-xs font-semibold ${
                                  option === quiz.answer
                                    ? "border-green-200 bg-green-50 text-green-700"
                                    : "border-gray-200 bg-gray-50 text-gray-600"
                                }`}
                              >
                                {String.fromCharCode(65 + optionIndex)}. {option}
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="rounded-lg bg-gray-50 px-3 py-2 text-xs leading-5 text-gray-600">
                          {quiz.questionType === "Short" ? (
                            quiz.tips && (
                              <>
                                <b>Tips:</b> {quiz.tips}
                                <br />
                              </>
                            )
                          ) : (
                            <>
                              <b>Answer:</b> {quiz.answer}
                              {quiz.explanation && (
                                <>
                                  <br />
                                  <b>Why:</b> {quiz.explanation}
                                </>
                              )}
                              <br />
                            </>
                          )}
                          <b>Time:</b> {quiz.timeLimitMinutes || 1} min &nbsp; <b>Marks:</b> {quiz.marks || 1}
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}

              {sectionQuestions.map((question, index) => (
                <article key={question.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#e51b72] text-xs font-bold text-white">
                        {sectionStoredQuizzes.length + index + 1}
                      </span>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-gray-400">Question {index + 1}</p>
                        <p className="mt-1 text-xs font-semibold text-gray-500">
                          {question.type} | {question.timeLimitMinutes} min | {question.marks} marks
                        </p>
                      </div>
                    </div>

                    <IconButton title="Remove question" onClick={() => removeQuestion(question.id)}>
                      <TrashIcon />
                    </IconButton>
                  </div>

                  <div className="mt-4 grid gap-4">
                    <label className="block">
                      <span className={labelClass}>Question</span>
                      <textarea
                        value={question.prompt}
                        onChange={(event) => updateQuestion(question.id, { prompt: event.target.value })}
                        rows={2}
                        className="w-full resize-none rounded-lg border border-gray-200 bg-white px-3.5 py-3 text-sm font-semibold leading-6 text-gray-900 shadow-sm outline-none transition-colors focus:border-[#e51b72] focus:ring-2 focus:ring-[#e51b72]/10"
                      />
                    </label>

                    <label className="block">
                      <span className={labelClass}>Section</span>
                      <select
                        value={question.sectionId}
                        onChange={(event) => updateQuestion(question.id, { sectionId: event.target.value })}
                        className={inputClass}
                      >
                        {sections.map((sectionOption) => (
                          <option key={sectionOption.id} value={sectionOption.id}>
                            {sectionOption.label}
                            {sectionOption.heading ? ` — ${sectionOption.heading}` : ""}
                          </option>
                        ))}
                      </select>
                    </label>

                    <div className="grid gap-4 md:grid-cols-[180px_minmax(0,1fr)]">
                      <label className="block">
                        <span className={labelClass}>Type</span>
                        <select
                          value={question.type}
                          onChange={(event) => {
                            const nextType = event.target.value as QuestionType;
                            updateQuestion(question.id, {
                              type: nextType,
                              options:
                                nextType === "Short"
                                  ? []
                                  : nextType === "True/False"
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
                          <span className={labelClass}>Answer</span>
                          <input
                            value={question.answer}
                            onChange={(event) => updateQuestion(question.id, { answer: event.target.value })}
                            className={inputClass}
                          />
                        </label>
                      )}
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <label className="block">
                        <span className={labelClass}>Time (minutes)</span>
                        <input
                          type="number"
                          min={1}
                          value={question.timeLimitMinutes}
                          onChange={(event) =>
                            updateQuestion(question.id, { timeLimitMinutes: Number(event.target.value) || 0 })
                          }
                          className={inputClass}
                        />
                      </label>

                      <label className="block">
                        <span className={labelClass}>Marks</span>
                        <input
                          type="number"
                          min={1}
                          value={question.marks}
                          onChange={(event) => updateQuestion(question.id, { marks: Number(event.target.value) || 0 })}
                          className={inputClass}
                        />
                      </label>
                    </div>

                    {question.options.length > 0 && (
                      <div>
                        <span className={labelClass}>Options</span>
                        <div className="grid gap-2 sm:grid-cols-2">
                          {question.options.map((option, optionIndex) => (
                            <label
                              key={`${question.id}-${optionIndex}`}
                              className={`rounded-lg border p-2 transition-colors ${
                                option && option === question.answer
                                  ? "border-green-200 bg-green-50"
                                  : "border-gray-200 bg-gray-50/80"
                              }`}
                            >
                              <span className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-gray-500">
                                Option {String.fromCharCode(65 + optionIndex)}
                              </span>
                              <input
                                value={option}
                                disabled={question.type === "True/False"}
                                onChange={(event) => updateQuestionOption(question.id, optionIndex, event.target.value)}
                                className="w-full rounded-md border border-transparent bg-white px-3 py-2 text-xs font-semibold text-gray-700 outline-none focus:border-[#e51b72] disabled:bg-gray-50 disabled:text-gray-500"
                              />
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    {question.type === "Short" ? (
                      <label className="block">
                        <span className={labelClass}>Tips</span>
                        <textarea
                          value={question.tips}
                          onChange={(event) => updateQuestion(question.id, { tips: event.target.value })}
                          rows={2}
                          className="w-full resize-none rounded-lg border border-gray-200 bg-white px-3.5 py-3 text-sm leading-6 text-gray-700 shadow-sm outline-none transition-colors focus:border-[#e51b72] focus:ring-2 focus:ring-[#e51b72]/10"
                          placeholder="Give the student a hint to help them answer"
                        />
                      </label>
                    ) : (
                      <label className="block">
                        <span className={labelClass}>Why</span>
                        <textarea
                          value={question.explanation}
                          onChange={(event) => updateQuestion(question.id, { explanation: event.target.value })}
                          rows={2}
                          className="w-full resize-none rounded-lg border border-gray-200 bg-white px-3.5 py-3 text-sm leading-6 text-gray-700 shadow-sm outline-none transition-colors focus:border-[#e51b72] focus:ring-2 focus:ring-[#e51b72]/10"
                        />
                      </label>
                    )}
                  </div>
                </article>
              ))}
                  </div>
                );
              })}
            </div>
          </section>
        </main>

        <aside className="space-y-5">
          <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between gap-3 border-b border-gray-100 bg-gray-50/70 px-5 py-4">
              <div>
                <h2 className="text-sm font-bold text-gray-900">Sections</h2>
                <p className="mt-1 text-xs text-gray-500">Group questions into Section A, B, C...</p>
              </div>
              <button
                type="button"
                onClick={addSection}
                className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-[#e51b72] px-3 py-2 text-[11px] font-bold text-white shadow-sm transition-colors hover:bg-[#bd145c]"
              >
                <PlusIcon />
                Add
              </button>
            </div>

            <div className="space-y-4 p-5">
              {sections.map((sectionItem, sectionIndex) => (
                <div key={sectionItem.id} className="rounded-xl border border-gray-200 bg-gray-50/60 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-full bg-gray-900 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                      {sectionItem.label}
                    </span>
                    {sections.length > 1 && (
                      <IconButton title="Remove section" onClick={() => removeSection(sectionItem.id)}>
                        <TrashIcon />
                      </IconButton>
                    )}
                  </div>

                  <label className="mt-3 block">
                    <span className={labelClass}>Heading</span>
                    <input
                      value={sectionItem.heading}
                      onChange={(event) => updateSection(sectionItem.id, { heading: event.target.value })}
                      className={inputClass}
                      placeholder="e.g. Remember & Recall"
                    />
                  </label>

                  <label className="mt-3 block">
                    <span className={labelClass}>Bloom&apos;s Taxonomy Level</span>
                    <input
                      value={sectionItem.bloomLevel}
                      onChange={(event) => updateSection(sectionItem.id, { bloomLevel: event.target.value })}
                      className={inputClass}
                      placeholder="e.g. Level 1 — Remember"
                    />
                  </label>

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <label className="block">
                      <span className={labelClass}>Marks</span>
                      <input
                        type="number"
                        min={0}
                        value={sectionItem.targetMarks}
                        onChange={(event) =>
                          updateSection(sectionItem.id, { targetMarks: Number(event.target.value) || 0 })
                        }
                        className={inputClass}
                      />
                    </label>

                    <label className="block">
                      <span className={labelClass}>Time (minutes)</span>
                      <input
                        type="number"
                        min={0}
                        value={sectionItem.targetTimeMinutes}
                        onChange={(event) =>
                          updateSection(sectionItem.id, { targetTimeMinutes: Number(event.target.value) || 0 })
                        }
                        className={inputClass}
                      />
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 bg-gray-50/70 px-5 py-4">
              <h2 className="text-sm font-bold text-gray-900">Add Question</h2>
              <p className="mt-1 text-xs text-gray-500">Write your own question or let AI help draft one.</p>
            </div>

            <div className="space-y-4 p-5">
              <div className="rounded-xl border border-pink-100 bg-pink-50/70 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wide text-[#e51b72]">AI Assist</h3>
                    <p className="mt-1 text-xs leading-5 text-gray-500">Type a question, then draft MCQ, True/False, or Short.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void fillManualQuestionWithAiDraft()}
                    disabled={aiStatus === "loading"}
                    className="shrink-0 rounded-lg bg-[#e51b72] px-3 py-2 text-[11px] font-bold text-white shadow-sm transition-colors hover:bg-[#bd145c] disabled:cursor-wait disabled:opacity-70"
                  >
                    {aiStatus === "loading" ? "Drafting..." : "Draft"}
                  </button>
                </div>
                <textarea
                  value={aiInstruction}
                  onChange={(event) => setAiInstruction(event.target.value)}
                  rows={2}
                  className="mt-3 w-full resize-none rounded-lg border border-pink-100 bg-white px-3 py-2.5 text-xs text-gray-700 outline-none transition-colors focus:border-[#e51b72] focus:ring-2 focus:ring-[#e51b72]/10"
                  placeholder="e.g. What is Node.js?"
                />
                {aiMessage && (
                  <p className="mt-2 rounded-lg bg-white/75 px-3 py-2 text-[11px] font-semibold leading-5 text-amber-700">
                    {aiMessage}
                  </p>
                )}
              </div>

              <label className="block">
                <span className={labelClass}>Section</span>
                <select
                  value={manualQuestion.sectionId}
                  onChange={(event) =>
                    setManualQuestion((current) => ({ ...current, sectionId: event.target.value }))
                  }
                  className={inputClass}
                >
                  {sections.map((sectionOption) => (
                    <option key={sectionOption.id} value={sectionOption.id}>
                      {sectionOption.label}
                      {sectionOption.heading ? ` — ${sectionOption.heading}` : ""}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className={labelClass}>Type</span>
                <select
                  value={manualQuestion.type}
                  onChange={(event) =>
                    setManualQuestion((current) => ({
                      ...current,
                      type: event.target.value as QuestionType,
                      options: event.target.value === "True/False" ? ["True", "False"] : current.options,
                    }))
                  }
                  className={inputClass}
                >
                  <option value="MCQ">MCQ</option>
                  <option value="True/False">True/False</option>
                  <option value="Short">Short</option>
                </select>
              </label>

              <label className="block">
                <span className={labelClass}>Question</span>
                <textarea
                  value={manualQuestion.prompt}
                  onChange={(event) => {
                    setManualQuestion((current) => ({ ...current, prompt: event.target.value }));
                    setManualErrors((current) => ({ ...current, prompt: undefined }));
                  }}
                  rows={4}
                  className={`w-full resize-none rounded-lg border bg-white px-3.5 py-3 text-sm text-gray-800 shadow-sm outline-none transition-colors focus:border-[#e51b72] focus:ring-2 focus:ring-[#e51b72]/10 ${
                    manualErrors.prompt ? errorInputClass : "border-gray-200"
                  }`}
                  placeholder="Write the question"
                />
                {manualErrors.prompt && <p className={errorTextClass}>{manualErrors.prompt}</p>}
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className={labelClass}>Time (minutes)</span>
                  <input
                    type="number"
                    min={1}
                    value={manualQuestion.timeLimitMinutes}
                    onChange={(event) => {
                      setManualQuestion((current) => ({
                        ...current,
                        timeLimitMinutes: Number(event.target.value) || 0,
                      }));
                      setManualErrors((current) => ({ ...current, timeLimitMinutes: undefined }));
                    }}
                    className={`${inputClass} ${manualErrors.timeLimitMinutes ? errorInputClass : ""}`}
                    placeholder="e.g. 2"
                  />
                  {manualErrors.timeLimitMinutes && <p className={errorTextClass}>{manualErrors.timeLimitMinutes}</p>}
                </label>

                <label className="block">
                  <span className={labelClass}>Marks</span>
                  <input
                    type="number"
                    min={1}
                    value={manualQuestion.marks}
                    onChange={(event) => {
                      setManualQuestion((current) => ({ ...current, marks: Number(event.target.value) || 0 }));
                      setManualErrors((current) => ({ ...current, marks: undefined }));
                    }}
                    className={`${inputClass} ${manualErrors.marks ? errorInputClass : ""}`}
                    placeholder="e.g. 2"
                  />
                  {manualErrors.marks && <p className={errorTextClass}>{manualErrors.marks}</p>}
                </label>
              </div>

              {manualQuestion.type !== "Short" && (
                <div>
                  <span className={labelClass}>Options</span>
                  <div className="space-y-2">
                    {manualQuestion.options.map((option, optionIndex) => (
                      <input
                        key={optionIndex}
                        value={option}
                        disabled={manualQuestion.type === "True/False"}
                        onChange={(event) => {
                          updateManualOption(optionIndex, event.target.value);
                          setManualErrors((current) => ({ ...current, options: undefined }));
                        }}
                        className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-gray-800 shadow-sm outline-none transition-colors focus:border-[#e51b72] focus:ring-2 focus:ring-[#e51b72]/10 disabled:bg-gray-50 disabled:text-gray-500 ${
                          manualErrors.options ? errorInputClass : "border-gray-200"
                        }`}
                        placeholder={`Option ${String.fromCharCode(65 + optionIndex)}`}
                      />
                    ))}
                  </div>
                  {manualErrors.options && <p className={errorTextClass}>{manualErrors.options}</p>}
                </div>
              )}

              {manualQuestion.type === "Short" ? (
                <label className="block">
                  <span className={labelClass}>Tips</span>
                  <textarea
                    value={manualQuestion.tips}
                    onChange={(event) =>
                      setManualQuestion((current) => ({ ...current, tips: event.target.value }))
                    }
                    rows={3}
                    className="w-full resize-none rounded-lg border border-gray-200 bg-white px-3.5 py-3 text-sm text-gray-800 shadow-sm outline-none transition-colors focus:border-[#e51b72] focus:ring-2 focus:ring-[#e51b72]/10"
                    placeholder="Give the student a hint to help them answer"
                  />
                </label>
              ) : (
                <>
                  <label className="block">
                    <span className={labelClass}>Answer</span>
                    <input
                      value={manualQuestion.answer}
                      onChange={(event) => {
                        setManualQuestion((current) => ({ ...current, answer: event.target.value }));
                        setManualErrors((current) => ({ ...current, answer: undefined }));
                      }}
                      className={`${inputClass} ${manualErrors.answer ? errorInputClass : ""}`}
                      placeholder="Correct answer"
                    />
                    {manualErrors.answer && <p className={errorTextClass}>{manualErrors.answer}</p>}
                  </label>

                  <label className="block">
                    <span className={labelClass}>Why</span>
                    <textarea
                      value={manualQuestion.explanation}
                      onChange={(event) =>
                        setManualQuestion((current) => ({ ...current, explanation: event.target.value }))
                      }
                      rows={3}
                      className="w-full resize-none rounded-lg border border-gray-200 bg-white px-3.5 py-3 text-sm text-gray-800 shadow-sm outline-none transition-colors focus:border-[#e51b72] focus:ring-2 focus:ring-[#e51b72]/10"
                      placeholder="Explain why the answer is correct"
                    />
                  </label>
                </>
              )}

              <button
                type="button"
                onClick={() => void addManualQuestion()}
                disabled={dbStatus === "saving"}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#e51b72] px-4 py-3 text-xs font-bold text-white shadow-sm transition-colors hover:bg-[#bd145c] disabled:cursor-wait disabled:opacity-70"
              >
                <PlusIcon />
                {dbStatus === "saving" ? "Saving..." : "Add Question"}
              </button>
              {manualErrors.courseId && <p className={errorTextClass}>{manualErrors.courseId}</p>}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}