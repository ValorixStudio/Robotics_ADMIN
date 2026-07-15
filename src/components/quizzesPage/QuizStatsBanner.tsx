import { BookOpen, Clock, FileQuestion, Layers3, Trophy } from "lucide-react";
import type { QuizStats } from "../../lib/types";

interface QuizStatsBannerProps {
  sectionCount: number;
  stats: QuizStats;
}

export function QuizStatsBanner({ sectionCount, stats }: QuizStatsBannerProps) {
  return (
    <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="grid gap-5 border-b border-gray-100 bg-[#171717] px-5 py-5 text-white md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-pink-100">
            <BookOpen className="h-3.5 w-3.5" />
            Quiz Builder
          </div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Create a polished quiz</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-300">
            Set the class and difficulty, group questions by section, then submit everything in one smooth flow.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center sm:min-w-[360px]">
          <StatBox icon={<Layers3 className="mx-auto mb-1 h-4 w-4 text-[#f4c430]" />} value={sectionCount} label="Sections" />
          <StatBox icon={<FileQuestion className="mx-auto mb-1 h-4 w-4 text-[#f4c430]" />} value={stats.questions} label="Questions" />
          <StatBox icon={<Trophy className="mx-auto mb-1 h-4 w-4 text-[#f4c430]" />} value={stats.marks} label="Marks" />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 px-5 py-3 text-xs font-semibold text-gray-500">
        <span className="inline-flex items-center gap-2">
          <Clock className="h-4 w-4 text-[#e51b72]" />
          Estimated time: {stats.minutes || 0} min
        </span>
        <span className="h-1 w-1 rounded-full bg-gray-300" />
        <span>Changes stay local until you submit.</span>
      </div>
    </section>
  );
}

function StatBox({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <div className="rounded-lg bg-white/10 px-3 py-3">
      {icon}
      <p className="text-lg font-bold">{value}</p>
      <p className="text-[10px] font-semibold uppercase text-zinc-300">{label}</p>
    </div>
  );
}