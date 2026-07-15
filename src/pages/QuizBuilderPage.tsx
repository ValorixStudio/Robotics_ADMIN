import { useEffect, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { SectionManager } from "@/components/SectionManager";
import { QuizConfigHeader } from "../components/quizzesPage/Quizconfigheader";
import type { DifficultyLevel, QuizPublishStatus } from "../components/quizzesPage/Quizconfigheader";
import { QuestionsListSection } from "../components/quizzesPage/Questionslistsection";
import { SubmitQuizBar } from "../components/quizzesPage/Submitquizbar";
import { QuizStatsBanner } from "../components/quizzesPage/QuizStatsBanner";
import { LoadStatusBanner } from "../components/quizzesPage/LoadStatusBanner";
import { useQuizData } from "../components/quizzesPage/quizData";
import type { QuizQuestion, QuizSection, QuizStats } from "../lib/types";

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
  status: "draft",
  questions: [],
});

function calculateStats(sections: QuizSection[]): QuizStats {
  return sections.reduce(
    (summary, section) => {
      const questions = section.questions ?? [];
      summary.questions += questions.length;
      summary.marks += questions.reduce((sum, q) => sum + (Number(q.marks) || 0), 0);
      summary.minutes += questions.reduce((sum, q) => sum + (Number(q.timeLimitMinutes) || 0), 0);
      return summary;
    },
    { questions: 0, marks: 0, minutes: 0 },
  );
}

function validateQuiz(sections: QuizSection[]) {
  if (sections.length === 0) return "Add at least one section before saving.";

  for (const [sectionIndex, section] of sections.entries()) {
    const sectionName = section.label || `Section ${sectionIndex + 1}`;
    const questions = section.questions ?? [];

    if (!section.heading?.trim()) return `${sectionName}: section heading is required.`;
    if (!section.bloomLevel?.trim()) return `${sectionName}: Bloom's level is required.`;
    if (!Number(section.targetMarks) || Number(section.targetMarks) < 1) return `${sectionName}: target marks must be at least 1.`;
    if (!Number(section.targetTimeMinutes) || Number(section.targetTimeMinutes) < 1) return `${sectionName}: target time must be at least 1 minute.`;
    if (questions.length === 0) return `${sectionName}: add at least one question.`;

    for (const [questionIndex, question] of questions.entries()) {
      const questionName = `${sectionName}, question ${questionIndex + 1}`;
      const isImage = question.questionInputMode === "image" || Boolean(question.imageUrl);
      const isShort = question.questionType === "Short";

      if (isImage && !question.imageUrl?.trim()) return `${questionName}: question image is required.`;
      if (!isImage && !question.prompt?.trim()) return `${questionName}: question text is required.`;
      if (!isShort && !question.answer?.trim()) return `${questionName}: correct answer is required.`;
      if (isShort && !(question.tips || question.explanation || question.answer)?.trim()) return `${questionName}: tips are required.`;
      if (!Number(question.timeLimitMinutes) || Number(question.timeLimitMinutes) < 1) return `${questionName}: time must be at least 1 minute.`;
      if (!Number(question.marks) || Number(question.marks) < 1) return `${questionName}: marks must be at least 1.`;
    }
  }

  return "";
}

export default function QuizBuilderPage() {
  const navigate = useNavigate();
  const { quizSetId: routeQuizSetId } = useParams();
  const [searchParams] = useSearchParams();
  const initializedRef = useRef(false);
  const {
    findCourseForLevel,
    loadQuizSets,
    loadSavedQuizzes,
    saveQuiz,
  } = useQuizData();

  const [level, setLevel] = useState("6");
  const [difficulty, setDifficulty] = useState<DifficultyLevel>("medium");
  const [sections, setSections] = useState<QuizSection[]>([makeDefaultSection(0)]);
  const [courseId, setCourseId] = useState("");
  const [classLevel, setClassLevel] = useState("");
  const [selectedQuizSetId, setSelectedQuizSetId] = useState("");
  const [quizTitle, setQuizTitle] = useState("Quiz 1");
  const [publishStatus, setPublishStatus] = useState<QuizPublishStatus>("draft");
  const [submitStatus, setSubmitStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [submitMessage, setSubmitMessage] = useState("");
  const [loadStatus, setLoadStatus] = useState<"idle" | "loading" | "error">("idle");
  const [loadMessage, setLoadMessage] = useState("");
  const [hasSavedQuiz, setHasSavedQuiz] = useState(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    const requestedLevel = searchParams.get("level") || "6";
    const publishMode = searchParams.get("publish");
    setLevel(requestedLevel);

    async function initializeBuilder() {
      setLoadStatus("loading");
      setLoadMessage(routeQuizSetId ? "Loading quiz for edit..." : "Creating a new quiz...");
      try {
        const nextCourse = await findCourseForLevel(requestedLevel);
        const sets = await loadQuizSets(nextCourse.courseId, nextCourse.classLevel);
        setCourseId(nextCourse.courseId);
        setClassLevel(nextCourse.classLevel);

        if (routeQuizSetId) {
          const selectedSet = sets.find((item) => item.id === routeQuizSetId);
          if (!selectedSet) throw new Error("Quiz not found for this class.");
          const loadedSections = await loadSavedQuizzes(nextCourse.courseId, nextCourse.classLevel, selectedSet.id);
          const loadedStatus = loadedSections.find((section) => section.status === "live") ? "live" : "draft";
          setSelectedQuizSetId(selectedSet.id);
          setQuizTitle(selectedSet.title || "Untitled quiz");
          setSections(loadedSections);
          setPublishStatus(publishMode === "live" ? "live" : selectedSet.status || loadedStatus);
          setHasSavedQuiz(loadedSections.some((section) => (section.questions ?? []).some((question) => question.persisted)));
          setLoadMessage(`${selectedSet.title || "Quiz"} loaded.`);
        } else {
          setSelectedQuizSetId("");
          setQuizTitle(`Quiz ${sets.length + 1}`);
          setPublishStatus("draft");
          setSections([makeDefaultSection(0)]);
          setHasSavedQuiz(false);
          setLoadMessage("New quiz is ready. Add sections and questions, then save the draft.");
        }

        setLoadStatus("idle");
      } catch (error) {
        setLoadStatus("error");
        setLoadMessage(error instanceof Error ? error.message : "Could not open quiz builder.");
      }
    }

    void initializeBuilder();
  }, [routeQuizSetId, searchParams]);

  const stats = calculateStats(sections);
  const isLiveLocked = publishStatus === "live" && hasSavedQuiz;
  const saveActionLabel = publishStatus === "live" ? "Publish Quiz" : hasSavedQuiz ? "Update Draft" : "Save Draft";

  const markPendingUpdate = (message = `Changes are ready. Click ${saveActionLabel} to save them to the database.`) => {
    setSubmitStatus("idle");
    setSubmitMessage(message);
  };

  const handleAddSection = () => {
    if (isLiveLocked) return;
    setSections((prev) => [...prev, makeDefaultSection(prev.length)]);
    markPendingUpdate(`Section added. Click ${saveActionLabel} to save it to the database.`);
  };

  const handleUpdateSection = (sectionId: string, updates: Partial<QuizSection>) => {
    if (isLiveLocked) return;
    setSections((prev) => prev.map((s) => (s.id === sectionId ? { ...s, ...updates } : s)));
    markPendingUpdate(`Section updated locally. Click ${saveActionLabel} to save it to the database.`);
  };

  const handleRemoveSection = (sectionId: string) => {
    if (isLiveLocked) return;
    setSections((prev) => prev.filter((s) => s.id !== sectionId));
    markPendingUpdate(`Section deleted locally. Click ${saveActionLabel} to save the change to the database.`);
  };

  const handleAddQuestion = (sectionId: string, question: QuizQuestion) => {
    if (isLiveLocked) return;
    setSections((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, questions: [...(s.questions ?? []), question] } : s)),
    );
    markPendingUpdate(`Question added. Click ${saveActionLabel} to save it to the database.`);
  };

  const handleUpdateQuestion = (sectionId: string, questionId: string, updates: Partial<QuizQuestion>) => {
    if (isLiveLocked) return;
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? { ...s, questions: (s.questions ?? []).map((q) => (q.id === questionId ? { ...q, ...updates } : q)) }
          : s,
      ),
    );
    markPendingUpdate(`Question updated locally. Click ${saveActionLabel} to save it to the database.`);
  };

  const handleDeleteQuestion = (sectionId: string, questionId: string) => {
    if (isLiveLocked) return;
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId ? { ...s, questions: (s.questions ?? []).filter((q) => q.id !== questionId) } : s,
      ),
    );
    markPendingUpdate(`Question deleted locally. Click ${saveActionLabel} to save the change to the database.`);
  };

  const handleSubmit = async () => {
    if (isLiveLocked) {
      setSubmitStatus("error");
      setSubmitMessage("This quiz is live and cannot be edited.");
      return;
    }

    if (stats.questions === 0) {
      setSubmitStatus("error");
      setSubmitMessage("Add at least one question before submitting.");
      return;
    }

    const validationError = validateQuiz(sections);
    if (validationError) {
      setSubmitStatus("error");
      setSubmitMessage(validationError);
      return;
    }

    setSubmitStatus("saving");
    setSubmitMessage("");

    try {
      const nextCourse = courseId && classLevel ? { courseId, classLevel } : await findCourseForLevel(level);
      const sectionsWithStatus = sections.map((section) => ({
        ...section,
        status: publishStatus,
        questions: (section.questions ?? []).map((question) => ({ ...question, status: publishStatus })),
      }));
      await saveQuiz(
        nextCourse.courseId,
        nextCourse.classLevel,
        difficulty,
        sectionsWithStatus,
        selectedQuizSetId || undefined,
        quizTitle.trim() || "Untitled quiz",
        publishStatus,
      );
      navigate("/quizzes");
      setSubmitStatus("success");
      setHasSavedQuiz(true);
      setSubmitMessage(
        publishStatus === "live"
          ? `${stats.questions} question(s) published for ${nextCourse.classLevel}. This quiz is now locked.`
          : `${stats.questions} question(s) ${hasSavedQuiz ? "updated" : "saved"} as draft for ${nextCourse.classLevel}.`,
      );
    } catch (err) {
      setSubmitStatus("error");
      setSubmitMessage(err instanceof Error ? err.message : "Failed to save quiz.");
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate("/quizzes")}
          className="inline-flex h-10 items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 text-sm font-black text-gray-700 hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to quizzes
        </button>
        
      </div>

      <QuizStatsBanner sectionCount={sections.length} stats={stats} />

      <QuizConfigHeader
        level={level}
        onLevelChange={setLevel}
        difficulty={difficulty}
        onDifficultyChange={setDifficulty}
        publishStatus={publishStatus}
        onPublishStatusChange={setPublishStatus}
        locked={isLiveLocked}
      />

      <LoadStatusBanner status={loadStatus} message={loadMessage} />

      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <label className="block">
          <span className="mb-1.5 block text-[11px] font-black uppercase tracking-wide text-gray-500">Quiz Title</span>
          <input
            value={quizTitle}
            disabled={isLiveLocked}
            onChange={(event) => setQuizTitle(event.target.value)}
            className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm font-bold text-gray-950 shadow-sm outline-none focus:border-[#e51b72] focus:ring-2 focus:ring-[#e51b72]/10 disabled:bg-gray-100 disabled:text-gray-500"
            placeholder="e.g., Chapter 1 Practice Quiz"
          />
        </label>
      </section>

      <QuestionsListSection>
        <SectionManager
          sections={sections}
          onAddSection={handleAddSection}
          onUpdateSection={handleUpdateSection}
          onRemoveSection={handleRemoveSection}
          onAddQuestion={handleAddQuestion}
          onUpdateQuestion={handleUpdateQuestion}
          onDeleteQuestion={handleDeleteQuestion}
          readOnly={isLiveLocked}
        />
      </QuestionsListSection>

      <SubmitQuizBar
        payload={sections}
        submitStatus={submitStatus}
        submitMessage={submitMessage}
        stats={stats}
        actionLabel={saveActionLabel}
        idleTitle={isLiveLocked ? "Quiz is live" : publishStatus === "live" ? "Ready to publish" : hasSavedQuiz ? "Ready to update draft" : "Ready to save draft"}
        savingTitle={publishStatus === "live" ? "Publishing quiz..." : hasSavedQuiz ? "Updating draft..." : "Saving draft..."}
        successTitle={publishStatus === "live" ? "Quiz published" : hasSavedQuiz ? "Draft updated" : "Draft saved"}
        disabled={isLiveLocked}
        onSubmit={() => void handleSubmit()}
      />
    </div>
  );
}
