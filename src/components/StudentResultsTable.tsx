import React from "react";

export interface StudentQuizResult {
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
}

interface StudentResultsTableProps {
  results: StudentQuizResult[];
  isLoading?: boolean;
  message?: string;
}

export function StudentResultsTable({ results, isLoading = false, message = "" }: StudentResultsTableProps) {
  const attemptedCount = results.filter((r) => r.attempted).length;
  const averageMarks = attemptedCount > 0 ? Math.round(results.reduce((sum, r) => sum + r.marks, 0) / attemptedCount) : 0;

  return (
    <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-100 bg-gray-50/70 px-5 py-4">
        <h2 className="text-sm font-bold text-gray-900">Student Performance</h2>
        <p className="mt-1 text-xs text-gray-500">Track quiz attempts and scores.</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-3 border-b border-gray-100 bg-gray-50/60 px-5 py-4 md:grid-cols-4">
        <div className="rounded-lg bg-white px-3 py-2">
          <p className="text-[11px] font-bold uppercase tracking-wide text-gray-500">Total Students</p>
          <p className="mt-1 text-lg font-bold text-gray-900">{results.length}</p>
        </div>
        <div className="rounded-lg bg-white px-3 py-2">
          <p className="text-[11px] font-bold uppercase tracking-wide text-gray-500">Attempted</p>
          <p className="mt-1 text-lg font-bold text-green-600">{attemptedCount}</p>
        </div>
        <div className="rounded-lg bg-white px-3 py-2">
          <p className="text-[11px] font-bold uppercase tracking-wide text-gray-500">Not Attempted</p>
          <p className="mt-1 text-lg font-bold text-amber-600">{results.length - attemptedCount}</p>
        </div>
        <div className="rounded-lg bg-white px-3 py-2">
          <p className="text-[11px] font-bold uppercase tracking-wide text-gray-500">Avg. Marks</p>
          <p className="mt-1 text-lg font-bold text-blue-600">{averageMarks}</p>
        </div>
      </div>

      {message && (
        <div className="border-b border-gray-100 bg-blue-50 px-5 py-3 text-xs text-blue-700 font-semibold">
          {message}
        </div>
      )}

      {/* Results Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50/70 text-xs font-bold uppercase tracking-wider text-gray-500">
              <th className="px-5 py-4">Student Name</th>
              <th className="px-5 py-4">Grade</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4 text-center">Correct</th>
              <th className="px-5 py-4 text-center">Wrong</th>
              <th className="px-5 py-4 text-center">Marks</th>
              <th className="px-5 py-4 text-right">Submitted</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="px-5 py-8 text-center text-sm text-gray-500">
                  Loading results...
                </td>
              </tr>
            ) : results.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-8 text-center text-sm text-gray-500">
                  No student results available yet.
                </td>
              </tr>
            ) : (
              results.map((result) => (
                <tr key={result.studentId} className="hover:bg-gray-50/40 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-gray-900">{result.studentName}</p>
                    <p className="mt-0.5 text-xs text-gray-500 font-mono">{result.studentId}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className="rounded-full bg-purple-50 px-2.5 py-1 text-xs font-bold text-purple-700">
                      {result.grade}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    {result.attempted ? (
                      <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-bold text-green-700">
                        Attempted
                      </span>
                    ) : (
                      <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-600">
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className="font-semibold text-green-600">{result.correctAnswers}</span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className="font-semibold text-red-600">{result.wrongAnswers}</span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <p className="font-bold text-gray-900">
                      {result.marks}
                      <span className="text-xs text-gray-500 font-normal"> / {result.totalMarks}</span>
                    </p>
                  </td>
                  <td className="px-5 py-4 text-right text-xs text-gray-500 font-medium">
                    {result.submittedAt || "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
