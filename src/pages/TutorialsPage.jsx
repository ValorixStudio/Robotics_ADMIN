import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { tutorialListApi } from "@/config/apiUrls";
import { useSetter } from "@/hooks/setter";

export const colors = ["#0ea5e9", "#22c55e", "#f59e0b", "#e51b72", "#7c3aed", "#14b8a6"];

const PAGE_LIMIT = 10; // API pagination default limit is 10

const FILTER_TO_API_STATUS = {
  All: "ALL",
  Published: "published",
  Draft: "draft",
  Archived: "archived",
};

// Fallback status when the backend does not return a status.
function statusFromApi(status) {
  if (status === "published") return "Published";
  if (status === "archived") return "Archived";
  return "Draft"; // Default fallback status
}

function fromApiTutorial(item) {
  // Pahla available language nikalne ke liye dynamic check
  const selectedLang = Array.isArray(item.languages) && item.languages.length > 0 ? item.languages[0] : "english";
  const contentMap = item.content?.[selectedLang] ?? {};

  return {
    id: item.id,
    slug: item.slug,
    title: contentMap.title || item.slug || "Untitled Tutorial",
    subject: item.subjectName ?? "General",
    classLevel: item.classLevel ?? "N/A",
    pricing: item.pricing ?? "free",
    languages: item.languages || ["english"],
    videoCount: Array.isArray(contentMap.chapters) ? contentMap.chapters.length : 0,
    status: statusFromApi(item.status), // Handles missing status from the API.
    thumbnail: contentMap.thumbnailUrl || null,
  };
}

export default function TutorialsPage() {
  const navigate = useNavigate();
  const { callSetter } = useSetter();
  const [tutorials, setTutorials] = useState([]);
  const [filter, setFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");
  const [confirmModal, setConfirmModal] = useState({ visible: false, type: null, tutorial: null, nextStatus: null });

  useEffect(() => {
    let isMounted = true;
    setStatus("loading");

    const queryParams = new URLSearchParams({
      page: String(page),
      limit: String(PAGE_LIMIT),
    });

    // Filtering logic safely injected
    if (filter !== "All") {
      queryParams.append("status", FILTER_TO_API_STATUS[filter]);
    }

    fetch(`${tutorialListApi}?${queryParams.toString()}`)
      .then((res) => res.json())
      .then((response) => {
        if (!isMounted) return;
        
        if (response.ok) {
          const tutorialsList = response.tutorials || [];
          const mappedTutorials = tutorialsList.map(fromApiTutorial);
          
          setTutorials(mappedTutorials);
          setTotalPages(response.pagination?.pages ?? 1);
          setTotal(response.pagination?.total ?? mappedTutorials.length);
        } else {
          setMessage("Failed to load data from server.");
        }
        setStatus("idle");
      })
      .catch(() => {
        if (!isMounted) return;
        setTutorials([]);
        setStatus("idle");
        setMessage("Failed to load tutorials.");
      });

    return () => {
      isMounted = false;
    };
  }, [page, filter]);

  // Automatically hide alert messages.
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const changeFilter = (tab) => {
    setFilter(tab);
    setPage(1);
  };

  // Open confirm modal for delete
  const openDeleteConfirm = (tutorial) =>
    setConfirmModal({ visible: true, type: "delete", tutorial, nextStatus: null });

  // Open confirm modal for status change
  const openStatusConfirm = (tutorial, nextStatus) =>
    setConfirmModal({ visible: true, type: "status", tutorial, nextStatus });

  const closeConfirm = () => setConfirmModal({ visible: false, type: null, tutorial: null, nextStatus: null });

  const handleConfirm = async () => {
    const { type, tutorial, nextStatus } = confirmModal;
    if (!tutorial) return closeConfirm();

    if (type === "delete") {
      try {
        const res = await fetch(`${tutorialListApi}/${tutorial.id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("delete-failed");
        setTutorials((prev) => prev.filter((t) => t.id !== tutorial.id));
        setTotal((t) => Math.max(0, t - 1));
        setMessage("Tutorial deleted.");
      } catch (e) {
        setMessage("Delete failed.");
      } finally {
        closeConfirm();
      }
      return;
    }

    if (type === "status") {
      try {
        await callSetter({
          url: `${tutorialListApi}/${tutorial.id}/status`,
          bodyData: { status: FILTER_TO_API_STATUS[nextStatus] },
          method: "patch",
        });
        setTutorials((prev) => prev.map((t) => (t.id === tutorial.id ? { ...t, status: nextStatus } : t)));
        const statusMap = { Published: "Published", Archived: "Archived", Draft: "Draft" };
        setMessage(`Tutorial ${statusMap[nextStatus] || nextStatus}.`);
      } catch (e) {
        setMessage("Status update failed.");
      } finally {
        closeConfirm();
      }
      return;
    }
  };

  return (
    <div className="space-y-6 p-2">
      {/* Top Header Section */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Tutorials Management</h1>
          <p className="mt-1 text-sm text-gray-500">Manage multilingual tutorials, assets, and class mappings.</p>
        </div>
        <button
          onClick={() => navigate("/add-tutorials", { state: { mode: "create" } })}
          className="inline-flex items-center justify-center rounded-xl bg-[#e51b72] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#bd145c] active:scale-[0.98]"
        >
          + New Tutorial
        </button>
      </div>

      {/* Filter and Notification Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-2">
        <div className="flex gap-1 rounded-xl bg-gray-100 p-1">
          {["All", "Published", "Draft", "Archived"].map((tab) => (
            <button
              key={tab}
              onClick={() => changeFilter(tab)}
              className={`rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
                filter === tab 
                  ? "bg-white text-gray-900 shadow-sm" 
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        {message && (
          <div className="rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-medium text-white shadow-sm animate-fade-in">
            {message}
          </div>
        )}
      </div>

      {/* Main Table Interface */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/70 text-xs font-bold uppercase tracking-wider text-gray-500">
                <th className="p-4">Info / Title</th>
                <th className="p-4">Class Target</th>
                <th className="p-4">Available Languages</th>
                <th className="p-4">Pricing</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {status === "loading" ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-sm font-medium text-gray-400">
                    Loading data...
                  </td>
                </tr>
              ) : tutorials.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-sm font-medium text-gray-400">
                    No tutorials found. Add a new tutorial.
                  </td>
                </tr>
              ) : (
                tutorials.map((tutorial) => (
                  <tr key={tutorial.id} className="transition-colors hover:bg-gray-50/40">
                    {/* Title with Thumbnail fallback */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-14 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-[10px] font-bold text-gray-400 overflow-hidden border border-gray-200">
                          {tutorial.thumbnail ? (
                            <img src={`${tutorial.thumbnail}`} alt="" className="h-full w-full object-cover" />
                          ) : (
                            "VIDEO"
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 text-[15px]">{tutorial.title}</div>
                          <div className="text-xs text-gray-400 font-mono mt-0.5">/{tutorial.slug}</div>
                        </div>
                      </div>
                    </td>

                    {/* Class Level Target */}
                    <td className="p-4">
                      <span className="inline-flex items-center rounded-md bg-purple-50 px-2 py-1 text-xs font-semibold text-purple-700 ring-1 ring-inset ring-purple-700/10">
                        {tutorial.classLevel}
                      </span>
                      <div className="mt-1 text-xs text-gray-400 font-medium">{tutorial.subject}</div>
                    </td>

                    {/* Languages Tag Badges */}
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {tutorial.languages.map((lang) => (
                          <span key={lang} className="rounded bg-gray-100 px-2 py-0.5 text-[11px] font-bold uppercase text-gray-600 border border-gray-200">
                            {lang}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Pricing */}
                    <td className="p-4">
                      <span className={`inline-flex items-center text-xs font-bold uppercase ${
                        tutorial.pricing === "free" ? "text-green-600" : "text-amber-600"
                      }`}>
                        {tutorial.pricing}
                      </span>
                    </td>

                    {/* Current System Status */}
                    <td className="p-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        tutorial.status === "Published" 
                          ? "bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20" 
                          : tutorial.status === "Archived"
                          ? "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20"
                          : "bg-gray-100 text-gray-700 ring-1 ring-inset ring-gray-600/10"
                      }`}>
                        {tutorial.status}
                      </span>
                    </td>

                    {/* Functional Buttons */}
                    <td className="p-4">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => navigate("/add-tutorials", { state: { mode: "edit", tutorialId: tutorial.id } })}
                          className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
                        >
                          Edit
                        </button>
                        {tutorial.status !== "Published" && (
                          <button
                            onClick={() => openStatusConfirm(tutorial, "Published")}
                            className="rounded-lg border border-transparent bg-green-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-green-700"
                          >
                            Publish
                          </button>
                        )}
                        {tutorial.status !== "Archived" && (
                          <button
                            onClick={() => openStatusConfirm(tutorial, "Archived")}
                            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-amber-700 shadow-sm hover:bg-amber-50"
                          >
                            Archive
                          </button>
                        )}
                        <button
                          onClick={() => openDeleteConfirm(tutorial)}
                          className="rounded-lg border border-red-100 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 shadow-sm hover:bg-red-50/80"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmModal.visible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={closeConfirm} />
          <div className="z-10 mx-4 max-w-lg rounded-lg bg-white p-6 shadow-lg">
              <h3 className="mb-4 text-lg font-bold text-gray-900">Confirm</h3>
              <p className="mb-6 text-sm text-gray-700">
                {confirmModal.type === "delete"
                  ? "Are you sure you want to delete this tutorial?"
                  : `Are you sure you want to ${
                      confirmModal.nextStatus === "Published" ? "publish" : confirmModal.nextStatus === "Archived" ? "archive" : String(confirmModal.nextStatus).toLowerCase()
                    } this tutorial?`}
              </p>
            <div className="flex justify-end gap-2">
              <button onClick={closeConfirm} className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-semibold">
                Cancel
              </button>
              <button onClick={handleConfirm} className="rounded-lg bg-[#e51b72] px-3 py-1.5 text-sm font-semibold text-white">
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pagination Controls */}
      {total > 0 && (
        <div className="flex items-center justify-between gap-3 border-t border-gray-100 pt-2">
          <span className="text-xs font-semibold text-gray-500">
            Page {page} of {totalPages} · {total} items total
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
