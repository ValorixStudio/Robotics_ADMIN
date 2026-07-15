import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { curriculumModuleApi } from "@/services/api";
import type { CurriculumModule, CurriculumModuleStatus } from "@/services/api";

const CLASS_OPTIONS = ["Class 3", "Class 4", "Class 5", "Class 6", "Class 7", "Class 8", "Class 9", "Class 10", "Class 11", "Class 12","Engineering"] as const;
const ENGINEERING_OPTIONS = ["Beginner", "Intermediate", "Advanced"] as const;

type ClassLevel = typeof CLASS_OPTIONS[number];
type EngineeringLevel = typeof ENGINEERING_OPTIONS[number];

function toClassLevel(value?: string): ClassLevel {
  return CLASS_OPTIONS.find((option) => option === value) ?? "Class 3";
}

function toEngineeringLevel(value?: string): EngineeringLevel {
  return ENGINEERING_OPTIONS.find((option) => option === value) ?? "Beginner";
}

const sampleModule: CurriculumModule = {
  id: "sample-week-1",
  week: 1,
  class: "Class 3",
  engineeringLevel: "Beginner",
  description: "Introduction to robotic | What is CAD, Circuit & Robotics? | robotic Discussion",
  theoryTopics: [
    "What is robotic? (Science, Technology, Engineering, Maths)",
    "robotic things we use every day",
    "What is a computer? Basic parts",
    "Introduction to the word Design",
  ],
  practicalActivities: [
    "robotic show-and-tell activity",
    "Point out robotic objects in classroom",
    "Draw your favourite machine",
    "Group discussion: What do engineers do?",
  ],
  status: "Live",
};

type ModuleForm = {
  week: string;
  class: ClassLevel;
  engineeringLevel: EngineeringLevel;
  description: string;
  theoryTopics: string[];
  practicalActivities: string[];
  status: CurriculumModuleStatus;
};

const emptyModule: ModuleForm = {
  week: "1",
  class: "Class 3",
  engineeringLevel: "Beginner",
  description: "",
  theoryTopics: [""],
  practicalActivities: [""],
  status: "Draft",
};

// Modal Styles
const modalStyles = `
  @keyframes modalSlideIn {
    from {
      opacity: 0;
      transform: scale(0.95) translateY(10px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }

  @keyframes backdropFadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .modal-backdrop {
    animation: backdropFadeIn 0.2s ease-out;
  }

  .modal-content {
    animation: modalSlideIn 0.3s ease-out;
  }
`;

export default function CurriculumPage() {
  const [modules, setModules] = useState<CurriculumModule[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<ModuleForm>(emptyModule);
  const [selectedModuleId, setSelectedModuleId] = useState("");
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadModules() {
      try {
        setIsLoading(true);
        setError("");
        const nextModules = await curriculumModuleApi.list();
        if (ignore) return;
        setModules(nextModules);
        setSelectedModuleId((current) => current || nextModules[0]?.id || "");
      } catch {
        if (!ignore) setError("Could not load curriculum modules.");
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    loadModules();
    return () => {
      ignore = true;
    };
  }, []);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showForm) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showForm]);

  const previewModules = modules.length > 0 ? modules : [sampleModule];
  const selectedModule = useMemo(
    () =>
      previewModules.find((module) => module.id === selectedModuleId) ??
      previewModules[0],
    [previewModules, selectedModuleId],
  );

  const updateListValue = (
    field: "theoryTopics" | "practicalActivities",
    index: number,
    value: string,
  ) => {
    setForm((current) => ({
      ...current,
      [field]: current[field].map((item, itemIndex) => (itemIndex === index ? value : item)),
    }));
  };

  const addListValue = (field: "theoryTopics" | "practicalActivities") => {
    setForm((current) => ({ ...current, [field]: [...current[field], ""] }));
  };

  const removeListValue = (field: "theoryTopics" | "practicalActivities", index: number) => {
    setForm((current) => ({
      ...current,
      [field]: current[field].filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const openCreateForm = () => {
    setEditingModuleId(null);
    setForm(emptyModule);
    setShowForm(true);
    setError("");
  };

  const openEditForm = (module: CurriculumModule) => {
    setEditingModuleId(module.id);
    setForm({
      week: String(module.week),
      class: toClassLevel(module.class),
      engineeringLevel: toEngineeringLevel(module.engineeringLevel),
      description: module.description,
      theoryTopics: module.theoryTopics.length ? module.theoryTopics : [""],
      practicalActivities: module.practicalActivities.length ? module.practicalActivities : [""],
      status: module.status,
    });
    setSelectedModuleId(module.id);
    setShowForm(true);
    setError("");
  };

  const resetForm = () => {
    setEditingModuleId(null);
    setForm(emptyModule);
    setShowForm(false);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const theoryTopics = form.theoryTopics.map((topic) => topic.trim()).filter(Boolean);
    const practicalActivities = form.practicalActivities
      .map((activity) => activity.trim())
      .filter(Boolean);

    if (!form.description.trim() || theoryTopics.length === 0 || practicalActivities.length === 0) {
      setError("Description, Theory Topics aur Practical Activity required hai.");
      return;
    }

    try {
      setIsSaving(true);
      setError("");
      const payload = {
        week: Number(form.week),
        class: form.class,
        engineeringLevel: form.engineeringLevel,
        description: form.description.trim(),
        theoryTopics,
        practicalActivities,
        status: form.status,
      };

      const savedModule = editingModuleId
        ? await curriculumModuleApi.update(editingModuleId, payload)
        : await curriculumModuleApi.create(payload);

      setModules((current) =>
        editingModuleId
          ? current.map((module) => (module.id === savedModule.id ? savedModule : module))
          : [...current, savedModule],
      );
      setSelectedModuleId(savedModule.id);
      resetForm();
    } catch {
      setError("Could not save the module. Please check the API/server.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (moduleId: string) => {
    try {
      setError("");
      await curriculumModuleApi.remove(moduleId);
      setModules((current) => {
        const nextModules = current.filter((module) => module.id !== moduleId);
        setSelectedModuleId(nextModules[0]?.id || "");
        return nextModules;
      });
      if (editingModuleId === moduleId) resetForm();
    } catch {
      setError("Could not delete the module. Please check the API/server.");
    }
  };

  return (
    <>
      <style>{modalStyles}</style>
      <div className="min-h-screen bg-gray-50 px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-4 sm:space-y-6">
          {/* Header Section */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-800">Curriculum Builder</h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">Design and structure learning paths</p>
            </div>
            <button
              type="button"
              onClick={openCreateForm}
              className="w-full sm:w-fit rounded-lg bg-[#e51b72] px-3 sm:px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#bd145c] active:scale-95"
            >
              + Add Module
            </button>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 sm:px-4 py-3 text-xs sm:text-sm font-medium text-red-700 animate-pulse">
              {error}
            </div>
          )}

          {/* Form Modal */}
          {showForm && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 bg-black/50 z-40 modal-backdrop"
                onClick={resetForm}
              />
              
              {/* Modal Container */}
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-y-auto">
                {/* Modal Content */}
                <form
                  onSubmit={handleSubmit}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full max-w-2xl my-8 rounded-xl border border-gray-200 bg-white shadow-2xl modal-content"
                >
                  {/* Modal Header */}
                  <div className="sticky top-0 px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 bg-white flex items-center justify-between rounded-t-xl">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-800">
                      {editingModuleId ? "Edit Module" : "Add New Module"}
                    </h2>
                    <button
                      type="button"
                      onClick={resetForm}
                      className="text-gray-400 hover:text-gray-600 transition-colors active:scale-95 p-1"
                      aria-label="Close modal"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* Modal Body */}
                  <div className="px-4 sm:px-6 py-4 space-y-4 max-h-[calc(90vh-150px)] overflow-y-auto">
                    {/* Row 1: Week, Class, Status */}
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      <label className="text-sm font-semibold text-gray-700">
                        Week
                        <select
                          value={form.week}
                          onChange={(event) => setForm((current) => ({ ...current, week: event.target.value }))}
                          className="mt-2 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs sm:text-sm text-gray-800 outline-none focus:border-[#e51b72] focus:ring-2 focus:ring-[#e51b72]/15"
                        >
                          {Array.from({ length: 12 }, (_, index) => (
                            <option key={index + 1} value={index + 1}>
                              Week {index + 1}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="text-sm font-semibold text-gray-700">
                        Class
                        <select
                          value={form.class}
                          onChange={(event) =>
                            setForm((current) => ({ ...current, class: event.target.value as ClassLevel }))
                          }
                          className="mt-2 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs sm:text-sm text-gray-800 outline-none focus:border-[#e51b72] focus:ring-2 focus:ring-[#e51b72]/15"
                        >
                          {CLASS_OPTIONS.map((classOption) => (
                            <option key={classOption} value={classOption}>
                              {classOption}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="text-sm font-semibold text-gray-700">
                        Status
                        <select
                          value={form.status}
                          onChange={(event) =>
                            setForm((current) => ({
                              ...current,
                              status: event.target.value === "Live" ? "Live" : "Draft",
                            }))
                          }
                          className="mt-2 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs sm:text-sm text-gray-800 outline-none focus:border-[#e51b72] focus:ring-2 focus:ring-[#e51b72]/15"
                        >
                          <option value="Draft">Draft</option>
                          <option value="Live">Live</option>
                        </select>
                      </label>
                    </div>

                    {/* Row 2: Description */}
                    <div>
                      <label className="text-sm font-semibold text-gray-700">
                        Description
                        <input
                          type="text"
                          value={form.description}
                          onChange={(event) =>
                            setForm((current) => ({ ...current, description: event.target.value }))
                          }
                          placeholder="Introduction to robotic | What is CAD, Circuit & Robotics?"
                          className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-xs sm:text-sm text-gray-800 outline-none focus:border-[#e51b72] focus:ring-2 focus:ring-[#e51b72]/15"
                          required
                        />
                      </label>
                    </div>

                    {/* Theory Topics and Practical Activities */}
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                      <DynamicInputList
                        label="Theory Topics"
                        values={form.theoryTopics}
                        placeholder="What is robotic?"
                        onAdd={() => addListValue("theoryTopics")}
                        onRemove={(index) => removeListValue("theoryTopics", index)}
                        onChange={(index, value) => updateListValue("theoryTopics", index, value)}
                      />
                      <DynamicInputList
                        label="Practical Activity"
                        values={form.practicalActivities}
                        placeholder="robotic show-and-tell activity"
                        onAdd={() => addListValue("practicalActivities")}
                        onRemove={(index) => removeListValue("practicalActivities", index)}
                        onChange={(index, value) => updateListValue("practicalActivities", index, value)}
                      />
                    </div>
                  </div>

                  {/* Modal Footer */}
                  <div className="sticky bottom-0 px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 bg-gray-50 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end rounded-b-xl">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="w-full sm:w-auto rounded-lg border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50 active:scale-95"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="w-full sm:w-auto rounded-lg bg-[#e51b72] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#bd145c] disabled:cursor-not-allowed disabled:bg-gray-400 active:scale-95"
                    >
                      {isSaving ? "Saving..." : editingModuleId ? "Update Module" : "Save Module"}
                    </button>
                  </div>
                </form>
              </div>
            </>
          )}

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 gap-4 lg:gap-6 lg:grid-cols-[1fr_minmax(0,350px)] xl:grid-cols-[minmax(0,600px)_1fr]">
            {/* Modules Table */}
            <div className="order-2 lg:order-1 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-100 px-4 sm:px-6 py-3 sm:py-4">
                <h3 className="text-sm font-bold text-gray-800">Robotics 101 Modules</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50 text-xs uppercase text-gray-500">
                      <th className="p-2 sm:p-3 text-left whitespace-nowrap">#</th>
                      <th className="p-2 sm:p-3 text-left whitespace-nowrap">Class</th>
                      <th className="p-2 sm:p-3 text-left whitespace-nowrap hidden sm:table-cell">Level</th>
                      <th className="p-2 sm:p-3 text-left whitespace-nowrap">Lessons</th>
                      <th className="p-2 sm:p-3 text-left whitespace-nowrap hidden sm:table-cell">Status</th>
                      <th className="p-2 sm:p-3 text-right whitespace-nowrap">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {isLoading ? (
                      <tr>
                        <td className="p-3 sm:p-4 text-xs sm:text-sm text-gray-500 text-center" colSpan={6}>
                          Loading modules...
                        </td>
                      </tr>
                    ) : previewModules.length === 0 ? (
                      <tr>
                        <td className="p-3 sm:p-4 text-xs sm:text-sm text-gray-500 text-center" colSpan={6}>
                          No modules yet. Create one to get started.
                        </td>
                      </tr>
                    ) : null}
                    {previewModules.map((module) => {
                      const isSample = module.id === sampleModule.id;
                      const isSelected = selectedModule?.id === module.id;
                      return (
                        <tr
                          key={module.id}
                          onClick={() => setSelectedModuleId(module.id)}
                          className={`cursor-pointer transition-colors hover:bg-gray-50 ${
                            isSelected ? "bg-[#e51b72]/5" : ""
                          }`}
                        >
                          <td className="p-2 sm:p-3 font-mono text-xs text-gray-400">{module.week}</td>
                          <td className="p-2 sm:p-3 text-xs sm:text-sm font-medium text-gray-800">{module.class || "N/A"}</td>
                          <td className="p-2 sm:p-3 text-xs hidden sm:table-cell">
                            <span className="rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                              {module.engineeringLevel || "N/A"}
                            </span>
                          </td>
                          <td className="p-2 sm:p-3 text-xs sm:text-sm text-gray-600">
                            {Math.max(module.theoryTopics.length, module.practicalActivities.length)}
                          </td>
                          <td className="p-2 sm:p-3 text-xs hidden sm:table-cell">
                            <span
                              className={`inline-block rounded-full px-2 py-0.5 text-[10px] sm:text-[11px] font-semibold ${
                                module.status === "Live"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-amber-100 text-amber-700"
                              }`}
                            >
                              {isSample ? "Sample" : module.status}
                            </span>
                          </td>
                          <td className="p-2 sm:p-3 text-right">
                            {!isSample && (
                              <div className="flex justify-end gap-1 sm:gap-2">
                                <button
                                  type="button"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    openEditForm(module);
                                  }}
                                  className="text-xs font-semibold text-[#e51b72] hover:underline active:scale-95 py-1 px-2"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    handleDelete(module.id);
                                  }}
                                  className="text-xs font-semibold text-red-600 hover:underline active:scale-95 py-1 px-2"
                                >
                                  Delete
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Module Preview */}
            <div className="order-1 lg:order-2 rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              <div className="border-b border-gray-100 px-4 sm:px-6 py-3 sm:py-4 sticky top-0 bg-white z-10">
                <h3 className="text-sm font-bold text-gray-800">Module Preview</h3>
              </div>
              {selectedModule && <CurriculumPreview module={selectedModule} />}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

type DynamicInputListProps = {
  label: string;
  values: string[];
  placeholder: string;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onChange: (index: number, value: string) => void;
};

function DynamicInputList({
  label,
  values,
  placeholder,
  onAdd,
  onRemove,
  onChange,
}: DynamicInputListProps) {
  return (
    <div>
      <div className="mb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <span className="text-sm font-semibold text-gray-700">{label}</span>
        <button
          type="button"
          onClick={onAdd}
          className="w-full sm:w-auto rounded-md border border-gray-200 px-2.5 py-1.5 sm:py-1 text-xs font-semibold text-[#e51b72] hover:bg-[#e51b72]/5 transition-colors active:scale-95"
        >
          + Add
        </button>
      </div>
      <div className="space-y-2">
        {values.map((value, index) => (
          <div key={index} className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={value}
              onChange={(event) => onChange(index, event.target.value)}
              placeholder={placeholder}
              className="min-w-0 flex-1 rounded-lg border border-gray-200 px-3 py-2 text-xs sm:text-sm text-gray-800 outline-none focus:border-[#e51b72] focus:ring-2 focus:ring-[#e51b72]/15"
              required={index === 0}
            />
            {values.length > 1 && (
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="w-full sm:w-auto rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-500 hover:bg-gray-50 transition-colors active:scale-95"
              >
                Remove
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function CurriculumPreview({ module }: { module: CurriculumModule }) {
  const maxRows = Math.max(module.theoryTopics.length, module.practicalActivities.length);

  return (
    <div className="overflow-x-auto">
      <div className="min-w-full">
        <div className="space-y-2 bg-[#813a9d] px-3 py-3 text-white text-xs sm:text-sm">
          <div className="text-base sm:text-lg font-extrabold break-words">
            Week {module.week} -- {module.description}
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-semibold">
            <div className="rounded-md bg-white/20 px-2 py-1">{module.class || "N/A"}</div>
            <div className="rounded-md bg-white/20 px-2 py-1">{module.engineeringLevel || "N/A"}</div>
          </div>
        </div>
        
        {/* Mobile: Stacked View, Desktop: Two Column */}
        <div className="hidden sm:grid sm:grid-cols-2 border-b border-gray-300 bg-[#5a296c] text-xs sm:text-sm font-bold text-white">
          <div className="border-r border-white/40 px-3 py-2 text-center">Theory Topics</div>
          <div className="px-3 py-2 text-center">
            <span className="bg-[#1f58c8] px-1">Practical Activity</span>
          </div>
        </div>
        
        {/* Desktop Grid View */}
        <div className="hidden sm:block">
          {Array.from({ length: maxRows }, (_, index) => (
            <div
              key={index}
              className="grid grid-cols-2 border-b border-gray-300 bg-[#f7f4f8] text-xs sm:text-sm text-black"
            >
              <div className="border-r border-gray-300 px-3 py-2">
                {module.theoryTopics[index] && <span>{"\u2022"} {module.theoryTopics[index]}</span>}
              </div>
              <div className="px-3 py-2">
                {module.practicalActivities[index] && (
                  <span>{"\u25b6"} {module.practicalActivities[index]}</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Mobile Stacked View */}
        <div className="sm:hidden space-y-2 p-3 bg-white">
          <div>
            <h4 className="text-xs font-bold text-gray-700 mb-2">Theory Topics</h4>
            <ul className="space-y-1">
              {module.theoryTopics.map((topic, index) => (
                topic && (
                  <li key={index} className="text-xs text-gray-700 flex gap-2">
                    <span className="flex-shrink-0">{"\u2022"}</span>
                    <span>{topic}</span>
                  </li>
                )
              ))}
            </ul>
          </div>
          <div className="border-t border-gray-200 pt-2">
            <h4 className="text-xs font-bold text-gray-700 mb-2">Practical Activity</h4>
            <ul className="space-y-1">
              {module.practicalActivities.map((activity, index) => (
                activity && (
                  <li key={index} className="text-xs text-gray-700 flex gap-2">
                    <span className="flex-shrink-0">{"\u25b6"}</span>
                    <span>{activity}</span>
                  </li>
                )
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
