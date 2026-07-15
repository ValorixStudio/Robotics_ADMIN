import React from "react";
export function QuestionsListSection({ children }: { children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="space-y-4">{children}</div>
    </section>
  );
}
