"use client";
import React, { useState } from "react";

// GöÇGöÇ Types GöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇ
interface Assignment {
  id: string;
  title: string;
  course: string;
  due: string;
  submittedCount: number;
  totalStudents: number;
  gradedCount: number;
  status: "Pending" | "Done" | "Overdue" | "Open";
}

const COURSES = ["Robotics 101", "Python Basics", "Electronics", "AI & ML Intro"];

export default function AssignmentsPage() {
  // GöÇGöÇ Initial State Seed GöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇ
  const [assignments, setAssignments] = useState<Assignment[]>([
    { id: "1", title: "Bot Navigation Report", course: "Robotics 101", due: "Jun 14", submittedCount: 38, totalStudents: 48, gradedCount: 30, status: "Pending" },
    { id: "2", title: "Python Functions Lab",  course: "Python Basics", due: "Jun 12", submittedCount: 36, totalStudents: 36, gradedCount: 36, status: "Done" },
    { id: "3", title: "Circuit Analysis",      course: "Electronics",  due: "Jun 10", submittedCount: 22, totalStudents: 29, gradedCount: 0,  status: "Overdue" },
    { id: "4", title: "Servo Control Code",    course: "Robotics 101", due: "Jun 18", submittedCount: 5,  totalStudents: 48, gradedCount: 0,  status: "Open" },
  ]);

  // GöÇGöÇ UI Control States GöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇ
  const [filter, setFilter] = useState<"All" | "Pending" | "Submitted" | "Overdue">("All");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // GöÇGöÇ New Assignment Form State GöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇ
  const [newTitle, setNewTitle] = useState("");
  const [newCourse, setNewCourse] = useState(COURSES[0]);
  const [newDue, setNewDue] = useState("");
  const [newTotalStudents, setNewTotalStudents] = useState(48);

  // GöÇGöÇ Actions GöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇ
  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDue) return;

    // Standard date parsing to render nicely like "Jun 14"
    const dateObj = new Date(newDue);
    const formattedDate = dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" });

    const newAssign: Assignment = {
      id: Date.now().toString(),
      title: newTitle.trim(),
      course: newCourse,
      due: formattedDate,
      submittedCount: 0,
      totalStudents: Number(newTotalStudents) || 30,
      gradedCount: 0,
      status: "Open",
    };

    setAssignments((prev) => [newAssign, ...prev]);
    
    // Reset form states
    setNewTitle("");
    setNewDue("");
    setIsModalOpen(false);
  };

  const handleQuickGrade = (id: string) => {
    setAssignments((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          const nextGraded = Math.min(a.submittedCount, a.gradedCount + 5);
          const isFullyGraded = nextGraded === a.submittedCount && a.submittedCount > 0;
          return {
            ...a,
            gradedCount: nextGraded,
            status: isFullyGraded && a.status === "Pending" ? "Done" : a.status,
          };
        }
        return a;
      })
    );
  };

  // GöÇGöÇ Status Styling Helpers GöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇ
  const getStatusConfig = (status: Assignment["status"]) => {
    switch (status) {
      case "Pending": 
        return { label: "Pending", style: "bg-amber-100 text-amber-700", btn: "Grade", btnStyle: "border-gray-200 text-gray-600 hover:bg-gray-50" };
      case "Done": 
        return { label: "Done", style: "bg-green-100 text-green-700", btn: "View", btnStyle: "border-gray-200 text-gray-600 hover:bg-gray-50" };
      case "Overdue": 
        return { label: "Overdue", style: "bg-red-100 text-red-700", btn: "Grade Now", btnStyle: "border-red-200 text-red-600 hover:bg-red-50" };
      case "Open": 
        return { label: "Open", style: "bg-blue-100 text-blue-700", btn: "View", btnStyle: "border-gray-200 text-gray-600 hover:bg-gray-50" };
    }
  };

  // GöÇGöÇ Filter Matching Rules GöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇ
  const filteredAssignments = assignments.filter((a) => {
    if (filter === "All") return true;
    if (filter === "Pending") return a.status === "Pending" || a.status === "Open";
    if (filter === "Submitted") return a.submittedCount > 0;
    if (filter === "Overdue") return a.status === "Overdue";
    return true;
  });

  return (
    <>
      {/* GöÇGöÇ PAGE TITLE FLOW GöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇ */}
      <h1 className="text-2xl font-bold tracking-tight text-gray-800">Assignments</h1>
      <p className="text-sm text-gray-500 -mt-4">Track submissions and deadlines</p>

      {/* GöÇGöÇ ACTION INTERACTION BAR GöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇ */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          {(["All", "Pending", "Submitted", "Overdue"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                filter === t ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-800"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-[#e51b72] hover:bg-[#bd145c] text-white text-xs font-semibold transition-colors"
        >
          + New Assignment
        </button>
      </div>

      {/* GöÇGöÇ CENTRAL DATA SHEET TABLE GöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇ */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 uppercase font-semibold">
                <th className="p-4 text-left">Title</th>
                <th className="p-4 text-left">Course</th>
                <th className="p-4 text-left">Due Date</th>
                <th className="p-4 text-left">Submitted</th>
                <th className="p-4 text-left">Graded</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-left">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredAssignments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-xs text-gray-400 bg-gray-50/10">
                    No individual assignments matching the parameters.
                  </td>
                </tr>
              ) : (
                filteredAssignments.map((a) => {
                  const conf = getStatusConfig(a.status);
                  return (
                    <tr key={a.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-4 font-semibold text-gray-800 text-xs">{a.title}</td>
                      <td className="p-4 text-gray-500 text-xs">{a.course}</td>
                      <td className="p-4 text-gray-500 text-xs">{a.due}</td>
                      <td className="p-4 text-gray-700 font-mono text-xs">
                        {`${a.submittedCount}/${a.totalStudents}`}
                      </td>
                      <td className="p-4 text-gray-700 font-mono text-xs">
                        {`${a.gradedCount}/${a.submittedCount}`}
                      </td>
                      <td className="p-4">
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${conf.style}`}>
                          {conf.label}
                        </span>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => handleQuickGrade(a.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${conf.btnStyle}`}
                        >
                          {conf.btn}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* GöÇGöÇ MODAL WORKSPACE FORM GöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇGöÇ */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-[200] bg-black/40 flex items-center justify-center p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[#e51b72] px-5 py-4 text-white">
              <h2 className="text-sm font-bold">Issue New Assignment</h2>
              <p className="text-[11px] text-white/70 mt-0.5">Set workspace deliverables and structural deadlines</p>
            </div>

            <form onSubmit={handleCreateAssignment} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-500 mb-1">Assignment Title *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Pid Controller System Report"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-[#e51b72]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-500 mb-1">Target Course Workspace</label>
                <select
                  value={newCourse}
                  onChange={(e) => setNewCourse(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white outline-none focus:border-[#e51b72]"
                >
                  {COURSES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-gray-500 mb-1">Due Date *</label>
                  <input
                    type="date"
                    required
                    value={newDue}
                    onChange={(e) => setNewDue(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-[#e51b72]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-gray-500 mb-1">Total Class Size</label>
                  <input
                    type="number"
                    min={1}
                    value={newTotalStudents}
                    onChange={(e) => setNewTotalStudents(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-[#e51b72]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#e51b72] hover:bg-[#bd145c] text-white font-semibold transition-colors"
                >
                  Create Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
