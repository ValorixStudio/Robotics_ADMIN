import { ListChecks, Plus } from "lucide-react";
import { SectionAccordion, type QuizQuestion, type QuizSection } from "../components/quizzesPage/SectionAccordion";

interface SectionManagerProps {
  sections: QuizSection[];
  onAddSection: () => void;
  onUpdateSection: (sectionId: string, updates: Partial<QuizSection>) => void;
  onRemoveSection: (sectionId: string) => void;
  onAddQuestion: (sectionId: string, question: QuizQuestion) => void;
  onUpdateQuestion: (sectionId: string, questionId: string, updates: Partial<QuizQuestion>) => void;
  onDeleteQuestion: (sectionId: string, questionId: string) => void;
  readOnly?: boolean;
}

export function SectionManager({
  sections,
  onAddSection,
  onUpdateSection,
  onRemoveSection,
  onAddQuestion,
  onUpdateQuestion,
  onDeleteQuestion,
  readOnly = false,
}: SectionManagerProps) {
  return (
    <div className="space-y-4">
      <section className="overflow-hidden rounded-xl border border-gray-200 bg-gray-50/70 dark:border-zinc-800 dark:bg-zinc-950/50">
        <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-[#e51b72] shadow-sm dark:bg-zinc-900">
              <ListChecks className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-sm font-bold text-gray-900 dark:text-white">Question Sections</h2>
              <p className="mt-1 text-xs text-gray-500 dark:text-zinc-400">Group related questions into Section A, B, C...</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onAddSection}
            disabled={readOnly}
            className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-lg border border-[#e51b72]/15 bg-white px-3 text-xs font-bold text-[#e51b72] shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#e51b72] hover:bg-pink-50 disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-400 disabled:hover:translate-y-0 dark:bg-zinc-900 dark:hover:bg-pink-500/10"
          >
            <Plus className="h-4 w-4" />
            Add Section
          </button>
        </div>

        {sections.length === 0 && (
          <div className="px-5 py-8 text-center">
            <p className="text-xs font-semibold text-gray-500 dark:text-zinc-400">
              No sections yet. Click "Add Section" to create Section A.
            </p>
          </div>
        )}
      </section>

      {sections.map((section) => (
        <SectionAccordion
          key={section.id}
          section={section}
          onUpdateSection={onUpdateSection}
          onAddQuestion={onAddQuestion}
          onUpdateQuestion={onUpdateQuestion}
          onDeleteQuestion={onDeleteQuestion}
          onRemoveSection={onRemoveSection}
          readOnly={readOnly}
        />
      ))}
    </div>
  );
}
