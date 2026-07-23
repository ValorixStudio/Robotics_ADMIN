import { useEffect, useState } from "react";
import { MediaUrlPicker } from "./MediaUrlPicker";
import { componentGuideApi } from "@/services/api";
import { API_BASE_URL } from "@/config/apiUrls";
import { useGetter } from "@/hooks/getter";
import { useSetter } from "@/hooks/setter";

export interface Subject {
  id: string;
  name: string;
  image: string; // data URL / uploaded media URL
}

function getMediaPreviewUrl(url?: string) {
  if (!url) return "";
  if (/^(https?:|blob:|data:)/i.test(url)) return url;

  return `${API_BASE_URL.replace(/\/$/, "")}/${url.replace(/^\//, "")}`;
}

// ─── Add / Edit Subject Modal ───────────────────────────────────────
interface SubjectModalProps {
  editingSubject: Subject | null; // null = create mode
  onClose: () => void;
  onSaved: (subject: Subject, previousName?: string) => void;
}

function SubjectModal({ editingSubject, onClose, onSaved }: SubjectModalProps) {
  const { callSetter } = useSetter();
  const [name, setName] = useState(editingSubject?.name || "");
  const [imagePreview, setImagePreview] = useState<string>(editingSubject?.image || "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      setError("Subject name is required.");
      return;
    }

    setError("");
    setSaving(true);

    try {
      const previousName = editingSubject?.name;

      if (editingSubject) {
        const response = await callSetter({
          url: `${API_BASE_URL.replace(/\/$/, "")}/subjects/update`,
          bodyData: {
            id: editingSubject.id,
            name: name.trim(),
            image: imagePreview,
          },
        });
        const updatedSubject: Subject = response?.data ?? {
          ...editingSubject,
          name: name.trim(),
          image: imagePreview,
        };
        onSaved(updatedSubject, previousName);
      } else {
        const response = await callSetter({
          url: `${API_BASE_URL.replace(/\/$/, "")}/subjects/add`,
          bodyData: {
            name: name.trim(),
            image: imagePreview,
          },
        });
        const newSubject: Subject = response?.data;
        onSaved(newSubject);
      }
    } catch {
      setError("Couldn't save the subject. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-lg bg-white shadow-lg">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h3 className="text-lg font-bold text-gray-900">
            {editingSubject ? "Edit Subject" : "Add Subject"}
          </h3>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">
            ✕
          </button>
        </div>

        <div className="space-y-5 px-6 py-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Subject Name <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Robotics, Python, Electronics"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-[#e51b72] focus:ring-1 focus:ring-[#e51b72]"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Subject Image</label>
            <MediaUrlPicker
              value={imagePreview}
              label=""
              mediaType="IMAGE"
              accept="image/*"
              emptyText="Select Image"
              uploadFile={async (file) => componentGuideApi.uploadMedia(file)}
              onChange={(url) => {
                setImagePreview(url);
                setError("");
              }}
            />
          </div>

          {error && <p className="text-xs font-semibold text-red-600">{error}</p>}
        </div>

        <div className="flex gap-3 border-t border-gray-200 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex-1 rounded-lg bg-[#e51b72] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#bd145c] disabled:opacity-50"
          >
            {saving ? "Saving..." : editingSubject ? "Save Changes" : "Add Subject"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Delete Confirm ──────────────────────────────────────────────────
function DeleteConfirm({
  subjectName,
  deleting,
  error,
  onCancel,
  onConfirm,
}: {
  subjectName: string;
  deleting: boolean;
  error: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-sm rounded-lg bg-white shadow-lg p-6">
        <h3 className="text-base font-bold text-gray-900 mb-2">Delete Subject?</h3>
        <p className="text-sm text-gray-600 mb-4">
          Are you sure you want to delete "{subjectName}"? This will only remove it from the
          subjects list — courses that already have this subject selected won't be affected.
        </p>
        {error && <p className="text-xs font-semibold text-red-600 mb-4">{error}</p>}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={deleting}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Subject Picker (replaces the plain text input) ────────────────
interface SubjectPickerProps {
  value: string;
  onChange: (name: string, id?: string, image?: string) => void;
}

export function SubjectPicker({ value, onChange }: SubjectPickerProps) {
  const { callGetter } = useGetter();
  const { callSetter } = useSetter();

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [modalSubject, setModalSubject] = useState<Subject | null | undefined>(undefined); // undefined = closed, null = create, Subject = edit
  const [deletingSubject, setDeletingSubject] = useState<Subject | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [showList, setShowList] = useState(false);

  const fetchSubjects = async () => {
    setLoading(true);
    setLoadError("");
    try {
      const response = await callGetter({
        url: `${API_BASE_URL.replace(/\/$/, "")}/subjects`,
      });
      setSubjects(response?.data ?? []);
    } catch {
      setLoadError("Couldn't load subjects.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const selected = subjects.find((s) => s.name === value);

  const handleSaved = (subject: Subject, previousName?: string) => {
    setSubjects((current) => {
      const exists = current.some((s) => s.id === subject.id);
      return exists ? current.map((s) => (s.id === subject.id ? subject : s)) : [subject, ...current];
    });
    if (previousName && previousName === value) {
      onChange(subject.name, subject.id, subject.image);
    } else if (!previousName) {
      onChange(subject.name, subject.id, subject.image); // newly created subject gets auto-selected
    }
    setModalSubject(undefined);
    setShowList(false);
  };

  const handleDelete = async () => {
    if (!deletingSubject) return;
    setDeleting(true);
    setDeleteError("");
    try {
      await callSetter({
        url: `${API_BASE_URL.replace(/\/$/, "")}/subjects/delete`,
        bodyData: { id: deletingSubject.id },
      });
      setSubjects((current) => current.filter((s) => s.id !== deletingSubject.id));
      if (value === deletingSubject.name) {
        onChange("", undefined, undefined); // clear selection if the deleted subject was selected
      }
      setDeletingSubject(null);
    } catch {
      setDeleteError("Couldn't delete the subject. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setShowList((s) => !s)}
          className="flex flex-1 items-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none hover:border-[#e51b72] text-left"
        >
          {selected?.image && (
            <img src={getMediaPreviewUrl(selected.image)} alt="" className="h-6 w-6 rounded object-cover flex-shrink-0" />
          )}
          <span className={value ? "text-gray-900" : "text-gray-400"}>
            {value || "Select or add a subject"}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setModalSubject(null)}
          className="flex items-center gap-1 rounded-lg border border-[#e51b72] px-3 py-2.5 text-xs font-semibold text-[#e51b72] hover:bg-pink-50 whitespace-nowrap"
        >
          <span>+</span> Add Subject
        </button>
      </div>

      {showList && (
        <div className="absolute z-20 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg max-h-64 overflow-y-auto">
          {loading && <p className="px-4 py-3 text-xs font-semibold text-gray-400">Loading subjects...</p>}

          {!loading && loadError && (
            <div className="px-4 py-3">
              <p className="text-xs font-semibold text-red-600 mb-2">{loadError}</p>
              <button
                type="button"
                onClick={fetchSubjects}
                className="text-xs font-semibold text-[#e51b72] hover:underline"
              >
                Retry
              </button>
            </div>
          )}

          {!loading && !loadError && subjects.length === 0 && (
            <p className="px-4 py-3 text-xs font-semibold text-gray-400">No subjects yet.</p>
          )}

          {!loading &&
            !loadError &&
            subjects.map((s) => (
              <div key={s.id} className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50">
                <button
                  type="button"
                  onClick={() => {
                    onChange(s.name, s.id, s.image);
                    setShowList(false);
                  }}
                  className="flex flex-1 items-center gap-3 text-left min-w-0"
                >
                  {s.image ? (
                    <img src={getMediaPreviewUrl(s.image)} alt="" className="h-7 w-7 rounded object-cover flex-shrink-0" />
                  ) : (
                    <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded bg-gray-100 text-xs">
                      📘
                    </span>
                  )}
                  <span className="truncate text-gray-800">{s.name}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setModalSubject(s)}
                  title="Edit"
                  className="flex-shrink-0 rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-[#e51b72]"
                >
                  ✏️
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDeleteError("");
                    setDeletingSubject(s);
                  }}
                  title="Delete"
                  className="flex-shrink-0 rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-red-600"
                >
                  🗑️
                </button>
              </div>
            ))}
        </div>
      )}

      {modalSubject !== undefined && (
        <SubjectModal
          editingSubject={modalSubject}
          onClose={() => setModalSubject(undefined)}
          onSaved={handleSaved}
        />
      )}

      {deletingSubject && (
        <DeleteConfirm
          subjectName={deletingSubject.name}
          deleting={deleting}
          error={deleteError}
          onCancel={() => {
            setDeletingSubject(null);
            setDeleteError("");
          }}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}
