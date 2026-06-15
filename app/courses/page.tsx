"use client";
import React, { useState } from "react";

// ── Types ──────────────────────────────────────────────────────
interface Course {
  id: string;
  emoji: string;
  title: string;
  instructor: string;
  students: number;
  modules: number;
  pct: number; // Progress/Completion Percentage for the indicator bar
  color: string;
  status: "Published" | "Draft" | "Archived";
}

export default function CoursesPage() {
  // ── Initial State Seed ───────────────────────────────────────
  const [courses, setCourses] = useState<Course[]>([
    { id: "1", emoji: "🤖", title: "Robotics 101", instructor: "Ms. Kapoor", students: 48, modules: 12, pct: 78, color: "bg-blue-500", status: "Published" },
    { id: "2", emoji: "💻", title: "Python Basics", instructor: "Mr. Sharma", students: 36, modules: 8, pct: 62, color: "bg-green-500", status: "Published" },
    { id: "3", emoji: "🧠", title: "AI & ML Intro", instructor: "Dr. Verma", students: 0, modules: 6, pct: 30, color: "bg-purple-500", status: "Draft" },
    { id: "4", emoji: "⚡", title: "Electronics", instructor: "Mr. Singh", students: 29, modules: 10, pct: 55, color: "bg-orange-500", status: "Published" },
  ]);

  // ── UI Controls State ────────────────────────────────────────
  const [filter, setFilter] = useState<"All" | "Published" | "Draft" | "Archived">("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // ── New Course Form State ────────────────────────────────────
  const [newTitle, setNewTitle] = useState("");
  const [newInstructor, setNewInstructor] = useState("");
  const [newModules, setNewModules] = useState(1);
  const [newEmoji, setNewEmoji] = useState("📚");
  const [newStatus, setNewStatus] = useState<"Published" | "Draft">("Draft");

  // ── Actions ──────────────────────────────────────────────────
  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newInstructor.trim()) return;

    // Pick random accent color for the progress bar indicator
    const colors = ["bg-blue-500", "bg-green-500", "bg-purple-500", "bg-orange-500", "bg-rose-500", "bg-cyan-500"];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const newCourse: Course = {
      id: Date.now().toString(),
      emoji: newEmoji,
      title: newTitle.trim(),
      instructor: newInstructor.trim(),
      students: 0,
      modules: Number(newModules) || 1,
      pct: 0, // Starts at 0% progress
      color: randomColor,
      status: newStatus,
    };

    setCourses((prev) => [newCourse, ...prev]);
    
    // Reset Form & Close
    setNewTitle("");
    setNewInstructor("");
    setNewModules(1);
    setNewEmoji("📚");
    setNewStatus("Draft");
    setIsModalOpen(false);
  };

  const updateStatus = (id: string, nextStatus: "Published" | "Draft" | "Archived") => {
    setCourses((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: nextStatus } : c))
    );
    setActiveDropdown(null);
  };

  const handleDeleteCourse = (id: string) => {
    setCourses((prev) => prev.filter((c) => c.id !== id));
    setActiveDropdown(null);
  };

  // ── Filtered Dataset ─────────────────────────────────────────
  const filteredCourses = courses.filter((c) => filter === "All" || c.status === filter);

  // Helper matching the status colors from your original blueprint
  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Published": return "bg-green-100 text-green-700";
      case "Draft": return "bg-amber-100 text-amber-700";
      case "Archived": return "bg-gray-100 text-gray-600";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <>
      {/* ── PAGE HEADER ─────────────────────────────────────────── */}
      <h1 className="text-2xl font-bold tracking-tight text-gray-800">Courses</h1>
      <p className="text-sm text-gray-500 -mt-4">Manage all learning content</p>

      {/* ── INTERACTION BAR ─────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          {(["All", "Published", "Draft", "Archived"] as const).map((t) => (
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
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#006aa0] hover:bg-[#005a8a] text-white text-xs font-semibold transition-colors"
        >
          + New Course
        </button>
      </div>

      {/* ── COURSES GRID ────────────────────────────────────────── */}
      {filteredCourses.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-200 rounded-xl p-12 text-center text-xs text-gray-400">
          No courses found matching this status segment.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filteredCourses.map((c) => (
            <div
              key={c.id}
              className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:-translate-y-1 transition-transform relative group"
            >
              {/* Context Dropdown Menu Trigger */}
              <div className="absolute top-2 right-2 z-10">
                <button
                  onClick={() => setActiveDropdown(activeDropdown === c.id ? null : c.id)}
                  className="w-7 h-7 rounded-lg bg-white/80 backdrop-blur-sm border border-gray-100 shadow-sm flex items-center justify-center text-gray-500 hover:text-gray-800 transition-colors font-bold text-xs"
                >
                  •••
                </button>
                {activeDropdown === c.id && (
                  <div className="absolute right-0 mt-1 w-36 bg-white border border-gray-200 rounded-lg shadow-lg py-1 text-left z-20 text-xs">
                    {c.status !== "Published" && (
                      <button onClick={() => updateStatus(c.id, "Published")} className="w-full px-3 py-2 text-gray-700 hover:bg-gray-50 text-left">Set Published</button>
                    )}
                    {c.status !== "Draft" && (
                      <button onClick={() => updateStatus(c.id, "Draft")} className="w-full px-3 py-2 text-gray-700 hover:bg-gray-50 text-left">Set Draft</button>
                    )}
                    {c.status !== "Archived" && (
                      <button onClick={() => updateStatus(c.id, "Archived")} className="w-full px-3 py-2 text-gray-700 hover:bg-gray-50 text-left">Archive</button>
                    )}
                    <hr className="border-gray-100 my-1" />
                    <button onClick={() => handleDeleteCourse(c.id)} className="w-full px-3 py-2 text-red-600 hover:bg-red-50 text-left font-medium">Delete Course</button>
                  </div>
                )}
              </div>

              {/* Card Thumbnail Area */}
              <div className="h-28 bg-gray-50 flex items-center justify-center text-5xl border-b border-gray-100">
                {c.emoji}
              </div>

              {/* Card Body */}
              <div className="p-4">
                <div className="font-bold text-gray-800 text-sm mb-1 truncate" title={c.title}>
                  {c.title}
                </div>
                <div className="text-[11px] text-gray-400 mb-3 truncate">
                  {`${c.students} students · ${c.modules} modules · ${c.instructor}`}
                </div>

                {/* Progress Bar Indicator */}
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-3">
                  <div className={`h-full rounded-full ${c.color}`} style={{ width: `${c.pct}%` }} />
                </div>

                {/* Action Row */}
                <div className="flex items-center justify-between">
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${getStatusStyle(c.status)}`}>
                    {c.status}
                  </span>
                  
                  {/* Smart inline Action matching original rules context */}
                  {c.status === "Draft" ? (
                    <button
                      onClick={() => updateStatus(c.id, "Published")}
                      className="text-xs font-semibold text-[#006aa0] hover:underline"
                    >
                      Publish
                    </button>
                  ) : (
                    <button
                      onClick={() => setActiveDropdown(activeDropdown === c.id ? null : c.id)}
                      className="text-xs font-semibold text-gray-500 hover:underline"
                    >
                      Manage
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── NEW COURSE DIALOG MODAL ─────────────────────────────── */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-[200] bg-black/40 flex items-center justify-center p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[#006aa0] px-5 py-4 text-white">
              <h2 className="text-sm font-bold">Create New Learning Course</h2>
              <p className="text-[11px] text-white/70 mt-0.5">Initialize a module workspace for target students</p>
            </div>
            
            <form onSubmit={handleCreateCourse} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-4 gap-3">
                <div className="col-span-1">
                  <label className="block text-[11px] font-bold uppercase text-gray-500 mb-1">Icon</label>
                  <select
                    value={newEmoji}
                    onChange={(e) => setNewEmoji(e.target.value)}
                    className="w-full px-2 py-2 border border-gray-200 rounded-lg bg-white text-center text-sm"
                  >
                    <option value="🤖">🤖</option>
                    <option value="💻">💻</option>
                    <option value="🧠">🧠</option>
                    <option value="⚡">⚡</option>
                    <option value="📚">📚</option>
                    <option value="🔬">🔬</option>
                  </select>
                </div>
                <div className="col-span-3">
                  <label className="block text-[11px] font-bold uppercase text-gray-500 mb-1">Course Title *</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Advanced Embedded Systems"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-[#006aa0]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-gray-500 mb-1">Instructor Name *</label>
                  <input
                    type="text"
                    required
                    value={newInstructor}
                    onChange={(e) => setNewInstructor(e.target.value)}
                    placeholder="e.g. Prof. Malhotra"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-[#006aa0]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-gray-500 mb-1">Total Modules</label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={newModules}
                    onChange={(e) => setNewModules(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-[#006aa0]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-500 mb-1">Initial Visibility Status</label>
                <div className="flex gap-4 mt-1.5">
                  <label className="flex items-center gap-1.5 cursor-pointer font-medium text-gray-700">
                    <input
                      type="radio"
                      name="status"
                      checked={newStatus === "Draft"}
                      onChange={() => setNewStatus("Draft")}
                      className="accent-[#006aa0]"
                    />
                    Save as Draft
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer font-medium text-gray-700">
                    <input
                      type="radio"
                      name="status"
                      checked={newStatus === "Published"}
                      onChange={() => setNewStatus("Published")}
                      className="accent-[#006aa0]"
                    />
                    Publish Directly
                  </label>
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
                  className="px-4 py-2 rounded-xl bg-[#006aa0] hover:bg-[#005a8a] text-white font-semibold transition-colors"
                >
                  Create Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}