import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { SubjectPicker } from "@/components/SubjectPicker";
import { MediaUrlPicker } from "@/components/MediaUrlPicker";
import { componentGuideApi } from "@/services/api";
import { tutorialListApi } from "@/config/apiUrls";
import { useSetter } from "@/hooks/setter";

type Language = "english" | "hindi" | "hinglish" | "spanish" | "french";
type Pricing = "free" | "premium";
type CKEditorConstructor = React.ComponentProps<typeof CKEditor>["editor"];

const classicEditor = ClassicEditor as unknown as CKEditorConstructor;

const LANGUAGE_OPTIONS: { value: Language; label: string }[] = [
  { value: "english", label: "English" },
  { value: "hindi", label: "Hindi" },
];

interface ChapterEntry {
  time: string;
  title: string;
}

export interface LanguageContent {
  title: string;
  description: string;
  chapters: string;
  videoUrl?: string;
  videoFileName?: string;
  thumbnailUrl?: string;
  thumbnailFileName?: string;
}

export interface TutorialFormState {
  id?: string;
  slug: string;
  classLevel: string;
  subject: string;
  subjectId: string;
  languages: Language[];
  content: Partial<Record<Language, LanguageContent>>;
  pricing: Pricing;
}

// Field-level validation error map. Top-level keys: "classLevel", "languages", "subject".
// Per-language keys are namespaced as "<field>-<lang>", e.g. "title-english".
type FormErrors = Record<string, string>;

const CLASS_LEVELS = [
  "Class 6",
  "Class 7",
  "Class 8",
  "Class 9",
  "Class 10",
  "Class 11",
  "Class 12",
];

const emptyLanguageContent = (): LanguageContent => ({
  title: "",
  description: "",
  chapters: "",
});

const emptyForm: TutorialFormState = {
  slug: "",
  classLevel: "",
  subject: "",
  subjectId: "",
  languages: ["english"],
  content: { english: emptyLanguageContent() },
  pricing: "free",
};

function richTextToPlainText(value: string) {
  return value
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();
}

function languageLabel(lang: Language) {
  return LANGUAGE_OPTIONS.find((l) => l.value === lang)?.label ?? lang;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function parseChapters(raw: string): ChapterEntry[] {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [time, ...rest] = line.split(" - ");
      return { time: (time || "").trim(), title: rest.join(" - ").trim() };
    })
    .filter((c) => c.time && c.title);
}

const label = "block text-sm font-semibold text-gray-700 mb-2";
const helpText = "mt-1 block text-[11px] text-gray-400";
const errorText = "mt-1 block text-[12px] font-semibold text-red-600";
const inputBase =
  "w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 outline-none transition-colors focus:border-[#e51b72] focus:ring-1 focus:ring-[#e51b72] disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400";
const inputErrorClass =
  "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500";

// Helper to compose the base input class with an optional error state
function fieldClass(hasError: boolean, extra = "") {
  return `${inputBase} ${extra} ${hasError ? inputErrorClass : ""}`.trim();
}

export default function AddTutorialPage() {
  const { callSetter } = useSetter();
  const navigate = useNavigate();
  const location = useLocation() as { state?: { mode?: "create" | "edit"; tutorialId?: string } };
  const mode = location.state?.mode ?? "create";
  console.log("AddTutorialPage mode:", mode, "location.state:", location.state); // Debugging: Log the mode and location state
  const incomingTutorial = location.state?.tutorial;

  const [form, setForm] = useState<TutorialFormState>(emptyForm);
  const [loadingTutorial, setLoadingTutorial] = useState(mode === "edit");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const languageMenuRef = useRef<HTMLDivElement>(null);
  const [errors, setErrors] = useState<FormErrors>({});

  
useEffect(() => {
  if (mode !== "edit" || !incomingTutorial) return;

  const t = incomingTutorial;
  const languages: Language[] = Array.isArray(t.languages) && t.languages.length ? t.languages : ["english"];
  const content: Partial<Record<Language, LanguageContent>> = {};

  languages.forEach((lang) => {
    const c = t.content?.[lang] ?? {};
    content[lang] = {
      title: c.title ?? "",
      description: c.description ?? "",
      chapters: Array.isArray(c.chapters)
        ? c.chapters.map((ch: ChapterEntry) => `${ch.time} - ${ch.title}`).join("\n")
        : c.chapters ?? "",
      videoUrl: c.videoUrl,
      videoFileName: c.videoFileName,
      thumbnailUrl: c.thumbnailUrl,
      thumbnailFileName: c.thumbnailFileName,
    };
  });

  setForm({
    id: t.id,
    slug: t.slug ?? "",
    classLevel: t.classLevel ?? "",
    subject: t.subjectName ?? "",
    subjectId: t.subjectId ?? "",
    languages,
    content,
    pricing: t.pricing ?? "free",
  });
}, [mode, incomingTutorial]);

  // Close the language dropdown when clicking outside of it
  useEffect(() => {
    if (!languageMenuOpen) return;
    const onClickOutside = (e: MouseEvent) => {
      if (languageMenuRef.current && !languageMenuRef.current.contains(e.target as Node)) {
        setLanguageMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [languageMenuOpen]);

  // Clears a single error key, if present, e.g. when the user starts fixing that field
  const clearError = (key: string) => {
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const update = <K extends keyof TutorialFormState>(key: K, value: TutorialFormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const onClassChange = (classLevel: string) => {
    setForm((prev) => ({ ...prev, classLevel }));
    clearError("classLevel");
  };

  const toggleLanguage = (lang: Language) => {
    setForm((prev) => {
      const isSelected = prev.languages.includes(lang);
      if (isSelected) {
        if (prev.languages.length === 1) return prev;
        const c = prev.content[lang];
        const hasContent = c && (c.title.trim() || richTextToPlainText(c.description));
        if (hasContent && !window.confirm(`Remove the ${languageLabel(lang)} section? Its content will be deleted.`)) {
          return prev;
        }
        const nextContent = { ...prev.content };
        delete nextContent[lang];
        return { ...prev, languages: prev.languages.filter((l) => l !== lang), content: nextContent };
      }
      return {
        ...prev,
        languages: [...prev.languages, lang],
        content: { ...prev.content, [lang]: prev.content[lang] ?? emptyLanguageContent() },
      };
    });
    clearError("languages");
  };

  const updateLanguageField = <K extends keyof LanguageContent>(
    lang: Language,
    key: K,
    value: LanguageContent[K],
  ) => {
    setForm((prev) => ({
      ...prev,
      content: {
        ...prev.content,
        [lang]: { ...(prev.content[lang] ?? emptyLanguageContent()), [key]: value },
      },
    }));
    clearError(`${String(key)}-${lang}`);
  };

  const primaryTitle = useMemo(() => {
    const primaryLang = form.languages[0];
    return primaryLang ? form.content[primaryLang]?.title ?? "" : "";
  }, [form.languages, form.content]);

  const languagesSummary = useMemo(
    () => (form.languages.length ? form.languages.map(languageLabel).join(", ") : "Select language(s)"),
    [form.languages],
  );

  const buildPayload = () => ({
    ...(mode === "edit" && form.id ? { id: form.id } : {}),
    slug: form.slug.trim() || slugify(primaryTitle),
    classLevel: form.classLevel,
    subjectId: form.subjectId,
    subjectName: form.subject,
    pricing: form.pricing,
    languages: form.languages,
    content: form.languages.reduce((acc, lang) => {
      const c = form.content[lang] ?? emptyLanguageContent();
      acc[lang] = {
        title: c.title.trim(),
        description: c.description,
        chapters: parseChapters(c.chapters),
        videoUrl: c.videoUrl,
        videoFileName: c.videoFileName,
        thumbnailUrl: c.thumbnailUrl,
        thumbnailFileName: c.thumbnailFileName,
      };
      return acc;
    }, {} as Record<string, unknown>),
  });

  // Central validation: checks top-level fields and every selected language's content.
  // Returns the full error map so the caller can both set state and check emptiness.
  const validateForm = (): FormErrors => {
    const next: FormErrors = {};

    if (!form.classLevel) {
      next.classLevel = "Please select a class.";
    }
    if (!form.subjectId) {
      next.subject = "Please select a subject.";
    }
    if (form.languages.length === 0) {
      next.languages = "Please select at least one language.";
    }

    form.languages.forEach((lang) => {
      const c = form.content[lang] ?? emptyLanguageContent();
      if (!c.title.trim()) {
        next[`title-${lang}`] = `Title is required for ${languageLabel(lang)}.`;
      }
      if (!richTextToPlainText(c.description)) {
        next[`description-${lang}`] = `Description is required for ${languageLabel(lang)}.`;
      }
      if (!c.videoUrl) {
        next[`videoUrl-${lang}`] = `Video is required for ${languageLabel(lang)}.`;
      }
      if (!c.thumbnailUrl) {
        next[`thumbnailUrl-${lang}`] = `Thumbnail is required for ${languageLabel(lang)}.`;
      }
    });

    return next;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateForm();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      setMessage("Please fix the highlighted fields below.");
      return;
    }

    setMessage("");
    console.log("Submitting tutorial with payload:", buildPayload()); // Debugging: Log the payload before submission
    setSaving(true);
    try {
      const payload = buildPayload();

      const apiUrl = mode === "edit" && form.id ? `${tutorialListApi}/${form.id}` : tutorialListApi;

      await callSetter({
        url: apiUrl,
        bodyData: payload,
      });

      setMessage(mode === "edit" ? "Tutorial updated successfully." : "Tutorial saved successfully.");
      setTimeout(() => navigate("/tutorials"), 500);
    } catch {
      setMessage("Save failed, please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loadingTutorial) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 text-sm font-semibold text-gray-500">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-40 border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {mode === "edit" ? "Edit Tutorial" : "Upload Tutorial"}
            </h1>
            <p className="mt-1 text-sm text-gray-500">Add video details, assets, chapters, and access settings</p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/tutorials")}
            className="text-2xl text-gray-400 transition-colors hover:text-gray-600"
            aria-label="Back to tutorials"
          >
            x
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="mx-auto max-w-6xl space-y-8 px-6 py-8">
        <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
          <h2 className="mb-6 text-lg font-bold text-gray-900">Tutorial Information</h2>

          <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className={label} htmlFor="classLevel">
                  Class <span className="text-red-600">*</span>
                </label>
                <select
                  id="classLevel"
                  className={fieldClass(!!errors.classLevel)}
                  value={form.classLevel}
                  onChange={(e) => onClassChange(e.target.value)}
                  aria-invalid={!!errors.classLevel}
                  aria-describedby={errors.classLevel ? "classLevel-error" : undefined}
                >
                  <option value="">Select Class</option>
                  {CLASS_LEVELS.map((cls) => (
                    <option key={cls} value={cls}>
                      {cls}
                    </option>
                  ))}
                </select>
                {errors.classLevel && (
                  <span id="classLevel-error" className={errorText}>
                    {errors.classLevel}
                  </span>
                )}
              </div>

              <div ref={languageMenuRef} className="relative">
                <label className={label} htmlFor="languages">
                  Language(s) <span className="text-red-600">*</span>
                </label>
                <button
                  id="languages"
                  type="button"
                  onClick={() => setLanguageMenuOpen((open) => !open)}
                  className={fieldClass(!!errors.languages, "flex items-center justify-between text-left")}
                  aria-invalid={!!errors.languages}
                  aria-describedby={errors.languages ? "languages-error" : undefined}
                >
                  <span className={form.languages.length ? "text-gray-800" : "text-gray-400"}>
                    {languagesSummary}
                  </span>
                  <span className="ml-2 text-gray-400">{languageMenuOpen ? "▲" : "▼"}</span>
                </button>

                {languageMenuOpen && (
                  <div className="absolute z-20 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg">
                    {LANGUAGE_OPTIONS.map((opt) => {
                      const checked = form.languages.includes(opt.value);
                      return (
                        <label
                          key={opt.value}
                          className="flex cursor-pointer items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleLanguage(opt.value)}
                            className="h-4 w-4 rounded border-gray-300 text-[#e51b72] focus:ring-[#e51b72]"
                          />
                          {opt.label}
                        </label>
                      );
                    })}
                  </div>
                )}
                {errors.languages ? (
                  <span id="languages-error" className={errorText}>
                    {errors.languages}
                  </span>
                ) : (
                  <span className={helpText}>You can select more than one language at the same time.</span>
                )}
              </div>
            </div>

            <div>
              <label className={label} htmlFor="subject">
                Subject <span className="text-red-600">*</span>
              </label>
              <div className={errors.subject ? "rounded-lg ring-1 ring-red-500" : ""}>
                <SubjectPicker
                  value={form.subject}
                  onChange={(name: string, id?: string) => {
                    setForm((prev) => ({
                      ...prev,
                      subject: name,
                      subjectId: name ? (id ?? prev.subjectId) : "",
                    }));
                    clearError("subject");
                  }}
                />
              </div>
              {errors.subject && <span className={errorText}>{errors.subject}</span>}
            </div>
          </div>
        </div>

        {form.languages.map((lang) => {
          const content = form.content[lang] ?? emptyLanguageContent();
          const titleError = errors[`title-${lang}`];
          const descriptionError = errors[`description-${lang}`];
          const videoError = errors[`videoUrl-${lang}`];
          const thumbnailError = errors[`thumbnailUrl-${lang}`];
          return (
            <div key={lang} className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">{languageLabel(lang)} Content</h2>
                <span className="rounded-full bg-[#fdeef4] px-3 py-1 text-[11px] font-bold text-[#e51b72]">
                  {languageLabel(lang)}
                </span>
              </div>

              <div className="space-y-6">
                <div>
                  <label className={label} htmlFor={`title-${lang}`}>
                    Title <span className="text-red-600">*</span>
                  </label>
                  <input
                    id={`title-${lang}`}
                    type="text"
                    className={fieldClass(!!titleError)}
                    placeholder="e.g., CSS Grid Mastery Tutorial"
                    value={content.title}
                    onChange={(e) => updateLanguageField(lang, "title", e.target.value)}
                    aria-invalid={!!titleError}
                    aria-describedby={titleError ? `title-${lang}-error` : undefined}
                  />
                  {titleError && (
                    <span id={`title-${lang}-error`} className={errorText}>
                      {titleError}
                    </span>
                  )}
                </div>

                <div>
                  <label className={label}>
                    Detailed Description <span className="text-red-600">*</span>
                  </label>
                  <div
                    className={`overflow-hidden rounded-lg border bg-white text-sm focus-within:ring-1 ${
                      descriptionError
                        ? "border-red-500 focus-within:border-red-500 focus-within:ring-red-500"
                        : "border-gray-300 focus-within:border-[#e51b72] focus-within:ring-[#e51b72]"
                    }`}
                  >
                    <CKEditor
                      editor={classicEditor}
                      data={content.description}
                      onChange={(_event: unknown, editor: { getData: () => string }) =>
                        updateLanguageField(lang, "description", editor.getData())
                      }
                      config={{
                        toolbar: [
                          "heading",
                          "|",
                          "bold",
                          "italic",
                          "underline",
                          "|",
                          "bulletedList",
                          "numberedList",
                          "|",
                          "link",
                          "blockQuote",
                          "|",
                          "undo",
                          "redo",
                        ],
                        placeholder: "Provide a detailed roadmap of this lesson...",
                      }}
                    />
                  </div>
                  {descriptionError && <span className={errorText}>{descriptionError}</span>}
                </div>

                <div>
                  <label className={label}>
                    Main Video File <span className="text-red-600">*</span>
                  </label>
                  <div className={videoError ? "rounded-lg ring-1 ring-red-500" : ""}>
                    <MediaUrlPicker
                      value={content.videoUrl}
                      label=""
                      mediaType="VIDEO"
                      accept="video/*"
                      emptyText="Select Media"
                      uploadFile={async (file) => componentGuideApi.uploadMedia(file)}
                      onChange={(url) => {
                        updateLanguageField(lang, "videoUrl", url);
                        updateLanguageField(lang, "videoFileName", url.split("/").pop() || "Selected video");
                      }}
                    />
                  </div>
                  {videoError && <span className={errorText}>{videoError}</span>}
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className={label} htmlFor={`thumbnail-${lang}`}>
                      Thumbnail Poster <span className="text-red-600">*</span>
                    </label>
                    <div className={thumbnailError ? "rounded-lg ring-1 ring-red-500" : ""}>
                      <MediaUrlPicker
                        value={content.thumbnailUrl}
                        label=""
                        mediaType="IMAGE"
                        accept="image/*"
                        emptyText="Select Media"
                        uploadFile={async (file) => componentGuideApi.uploadMedia(file)}
                        onChange={(url) => {
                          updateLanguageField(lang, "thumbnailUrl", url);
                          updateLanguageField(lang, "thumbnailFileName", url.split("/").pop() || "Selected image");
                        }}
                      />
                    </div>
                    {thumbnailError && <span className={errorText}>{thumbnailError}</span>}
                  </div>

                  {lang === form.languages[0] && (
                    <div>
                      <label className={label}>Pricing Tier</label>
                      <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
                        {(["free", "premium"] as const).map((tier) => (
                          <button
                            key={tier}
                            type="button"
                            onClick={() => update("pricing", tier)}
                            className={`flex-1 rounded-md px-3 py-2.5 text-sm font-semibold capitalize transition-all ${
                              form.pricing === tier
                                ? "bg-white text-gray-800 shadow-sm"
                                : "text-gray-500 hover:text-gray-700"
                            }`}
                          >
                            {tier}
                          </button>
                        ))}
                      </div>
                      <span className={helpText}>Pricing applies at the tutorial level, shared across all languages.</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className={label} htmlFor={`chapters-${lang}`}>
                    Video Timestamps / Chapters
                  </label>
                  <textarea
                    id={`chapters-${lang}`}
                    className={`${inputBase} min-h-[110px] resize-y leading-6`}
                    placeholder={"00:00 - Introduction\n02:15 - Project Setup\n05:40 - Writing Code"}
                    value={content.chapters}
                    onChange={(e) => updateLanguageField(lang, "chapters", e.target.value)}
                  />
                  <span className={helpText}>Enter one chapter per line: "HH:MM - Title".</span>
                </div>
              </div>
            </div>
          );
        })}

        {message && (
          <div
            className={`rounded-lg border p-4 text-sm font-semibold shadow-sm ${
              Object.keys(errors).length > 0
                ? "border-red-200 bg-red-50 text-red-600"
                : "border-gray-200 bg-white text-gray-600"
            }`}
          >
            {message}
          </div>
        )}

        <div className="flex gap-4 pb-8">
          <button
            type="button"
            onClick={() => navigate("/tutorials")}
            className="flex-1 rounded-lg border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 rounded-lg bg-[#e51b72] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#bd145c] disabled:opacity-50"
          >
            {saving ? "Saving..." : mode === "edit" ? "Update Tutorial" : "Publish Tutorial"}
          </button>
        </div>
      </form>
    </div>
  );
}