import { useEffect, useMemo, useState } from "react";
import MDEditor from "@uiw/react-md-editor";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import { MediaUrlPicker } from "@/components";
import { API_BASE_URL } from "@/config/apiUrls";
import { componentGuideApi } from "@/services/api";
import type {
  ComponentGuide,
  CreateCircuitRequest,
  GuideLink,
  GuideMediaType,
  GuideSection,
} from "@/services/api/types";

type EditableSection = Omit<GuideSection, "sortOrder" | "links"> & {
  id: string;
  links: GuideLink[];
};

type FormStatus = "idle" | "saving" | "success" | "error";

type ToastMessage = {
  type: "success" | "error";
  text: string;
};

type ValidationErrors = Record<string, true>;

type ComponentPreset = {
  id: string;
  name: string;
  slug: string;
  iconUrl: string;
  sections: GuideSection[];
};

type ComponentDraft = {
  id?: string;
  name: string;
};

const COMPONENT_PRESETS_STORAGE_KEY = "admin-component-guide-presets";

const defaultComponentPresets: ComponentPreset[] = [
  {
    id: "led",
    name: "LED",
    slug: "led",
    iconUrl: "/uploads/guides/LED_ICON.png",
    sections: [
      {
        title: "Description",
        content: "This device is a light-emitting diode.",
        sortOrder: 0,
      },
      {
        title: "How it works",
        content:
          "LEDs are made from semiconductor materials that emit light when current flows through them in the correct direction. Add a resistor in series to limit current flow.",
        sortOrder: 1,
      },
      {
        title: "Connect it",
        content:
          "Connect the positive anode to higher voltage and the negative cathode to lower voltage. LEDs are polarized and will not light when connected backwards.",
        mediaType: "IMAGE",
        mediaUrl: "/uploads/guides/LED_CONNECTION.png",
        sortOrder: 2,
      },
      {
        title: "How it is used",
        content: "Select the device to edit its name and color.",
        mediaType: "IMAGE",
        mediaUrl: "/uploads/guides/LED_USAGE.png",
        sortOrder: 3,
      },
      {
        title: "Get started",
        content: "Drag the starter circuit into your design for a working example of how to use this part.",
        mediaType: "IMAGE",
        mediaUrl: "/uploads/guides/LED_STARTER.png",
        sortOrder: 4,
      },
      {
        title: "More information",
        content: "Additional information about this device can be found on these pages.",
        links: [
          {
            label: "LEDs - Instructables",
            url: "https://www.instructables.com/LEDs-for-Beginners/",
          },
          {
            label: "Ohms Law - Instructables",
            url: "https://www.instructables.com/Ohms-Law/",
          },
          {
            label: "LED Series Resistor Calculator",
            url: "https://www.digikey.com/en/resources/conversion-calculators/conversion-calculator-led-series-resistor",
          },
        ],
        sortOrder: 5,
      },
    ],
  },
  {
    id: "push-button",
    name: "Push Button",
    slug: "push-button",
    iconUrl: "/uploads/guides/PUSH_BUTTON_ICON.png",
    sections: [
      {
        title: "Description",
        content: "This device is a momentary push button switch.",
        sortOrder: 0,
      },
      {
        title: "How it works",
        content:
          "A push button connects or disconnects a circuit only while it is pressed. Use a pull-up or pull-down resistor so the input has a stable state.",
        sortOrder: 1,
      },
    ],
  },
  {
    id: "buzzer",
    name: "Buzzer",
    slug: "buzzer",
    iconUrl: "/uploads/guides/BUZZER_ICON.png",
    sections: [
      {
        title: "Description",
        content: "This device converts an electrical signal into sound.",
        sortOrder: 0,
      },
      {
        title: "Connect it",
        content:
          "Connect the positive pin to the control output and the negative pin to ground. Use a driver transistor when the buzzer needs more current than the controller pin can provide.",
        sortOrder: 1,
      },
    ],
  },
];

const makeId = () => `${Date.now()}-${Math.random().toString(36).slice(2)}`;

const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const inputClass =
  "w-full rounded-lg border border-gray-200 bg-white px-3.5 py-3 text-sm text-gray-800 shadow-sm outline-none transition-colors focus:border-[#e51b72] focus:ring-2 focus:ring-[#e51b72]/10";

const errorInputClass =
  "border-red-400 bg-red-50/40 focus:border-red-500 focus:ring-2 focus:ring-red-500/10";

const labelClass = "mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-gray-500";

const safeText = (value: unknown) => (typeof value === "string" ? value : "");

const absoluteAssetUrl = (url: string) => {
  const cleanUrl = safeText(url).trim();
  if (!cleanUrl) return "";
  if (/^https?:\/\//i.test(cleanUrl)) return cleanUrl;

  return `${API_BASE_URL.replace(/\/$/, "")}/${cleanUrl.replace(/^\//, "")}`;
};

const emptyComponentDraft: ComponentDraft = {
  name: "",
};

function createComponentSections(componentName: string, description = `This device is ${componentName}.`): GuideSection[] {
  return [
    {
      title: "Description",
      content: description,
      sortOrder: 0,
    },
    {
      title: "How it works",
      content: `${componentName} guide working details can be added here.`,
      sortOrder: 1,
    },
    {
      title: "Connect it",
      content: `Add connection instructions for ${componentName}.`,
      mediaType: "IMAGE",
      mediaUrl: "",
      sortOrder: 2,
    },
    {
      title: "How it is used",
      content: `Add usage instructions for ${componentName}.`,
      mediaType: "IMAGE",
      mediaUrl: "",
      sortOrder: 3,
    },
    {
      title: "Get started",
      content: `Drag the starter circuit into your design for a working example of how to use this part.`,
      mediaType: "IMAGE",
      mediaUrl: "",
      sortOrder: 4,
    },
    {
      title: "More information",
      content: "Additional information about this device can be found on these pages.",
      links: [],
      sortOrder: 5,
    },
  ];
}

function ensureSixSections(componentName: string, sections: GuideSection[]) {
  const defaultSections = createComponentSections(componentName);
  const mergedSections = [...sections];

  defaultSections.forEach((defaultSection) => {
    const hasSection = mergedSections.some((section) => section.title === defaultSection.title);
    if (!hasSection) mergedSections.push(defaultSection);
  });

  return mergedSections
    .slice()
    .sort((first, second) => (first.sortOrder ?? 0) - (second.sortOrder ?? 0))
    .map((section, index) => ({ ...section, sortOrder: index }));
}

function readComponentPresets(): ComponentPreset[] {
  if (typeof window === "undefined") return defaultComponentPresets;

  try {
    const storedValue = window.localStorage.getItem(COMPONENT_PRESETS_STORAGE_KEY);
    const parsedValue = storedValue ? JSON.parse(storedValue) : null;

    if (!Array.isArray(parsedValue) || parsedValue.length === 0) return defaultComponentPresets;

    return parsedValue.filter(
      (item): item is ComponentPreset =>
        typeof item?.id === "string" &&
        typeof item?.name === "string" &&
        typeof item?.slug === "string" &&
        Array.isArray(item?.sections),
    );
  } catch {
    return defaultComponentPresets;
  }
}

function writeComponentPresets(presets: ComponentPreset[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(COMPONENT_PRESETS_STORAGE_KEY, JSON.stringify(presets));
}

function makeEditableSections(sections: GuideSection[]): EditableSection[] {
  return sections.map((section, index) => ({
    id: `${slugify(section.title || "section") || "section"}-${index}`,
    title: section.title,
    content: section.content,
    mediaType: section.mediaType,
    mediaUrl: section.mediaUrl,
    links: section.links ?? [],
  }));
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10 4v12M4 10h12" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 6h12" />
      <path d="M8 6V4h4v2" />
      <path d="m6 6 .7 10h6.6L14 6" />
      <path d="M8.5 9v4M11.5 9v4" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 14.5V16h1.5L15 6.5 13.5 5 4 14.5Z" />
      <path d="m12.5 6 1.5 1.5" />
    </svg>
  );
}

function normalizeSections(sections: EditableSection[]): GuideSection[] {
  return sections.map((section, index) => {
    const cleanLinks = section.links.filter(
      (link) => safeText(link.label).trim() && safeText(link.url).trim(),
    );
    const normalized: GuideSection = {
      title: safeText(section.title).trim(),
      content: safeText(section.content).trim(),
      sortOrder: index,
    };

    const mediaUrl = safeText(section.mediaUrl).trim();
    if (section.mediaType && mediaUrl) {
      normalized.mediaType = section.mediaType;
      normalized.mediaUrl = absoluteAssetUrl(mediaUrl);
    }

    if (cleanLinks.length > 0) {
      normalized.links = cleanLinks.map((link) => ({
        label: safeText(link.label).trim(),
        url: safeText(link.url).trim(),
      }));
    }

    return normalized;
  });
}

function getGuideDescription(guide: ComponentGuide) {
  const descriptionSection =
    guide.sections?.find((section) => section.title.toLowerCase() === "description") ??
    guide.sections?.[0];

  return descriptionSection?.content || "-";
}

function getGuideId(guide: ComponentGuide) {
  return guide.id ?? guide._id ?? guide.slug;
}

export default function CircuitsPage() {
  const [componentOptions, setComponentOptions] = useState<ComponentPreset[]>(readComponentPresets);
  const initialComponent = componentOptions[0] ?? defaultComponentPresets[0];
  const [selectedComponentId, setSelectedComponentId] = useState(initialComponent.id);
  const [name, setName] = useState(initialComponent.name);
  const [slug, setSlug] = useState(initialComponent.slug);
  const [iconUrl, setIconUrl] = useState(initialComponent.iconUrl);
  const [sections, setSections] = useState<EditableSection[]>(
    makeEditableSections(ensureSixSections(initialComponent.name, initialComponent.sections)),
  );
  const [status, setStatus] = useState<FormStatus>("idle");
  const [message, setMessage] = useState("");
  const [toastMessage, setToastMessage] = useState<ToastMessage | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [guides, setGuides] = useState<ComponentGuide[]>([]);
  const [isListLoading, setIsListLoading] = useState(false);
  const [listMessage, setListMessage] = useState("");
  const [editingGuideId, setEditingGuideId] = useState<string | number | null>(null);
  const [editingGuideName, setEditingGuideName] = useState("");
  const [isComponentModalOpen, setIsComponentModalOpen] = useState(false);
  const [componentDraft, setComponentDraft] = useState<ComponentDraft>(emptyComponentDraft);
  const [editingComponentId, setEditingComponentId] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  const payload = useMemo<CreateCircuitRequest>(
    () => ({
      name: safeText(name).trim(),
      slug: safeText(slug).trim(),
      iconUrl: safeText(iconUrl).trim() ? absoluteAssetUrl(iconUrl) : undefined,
      sections: normalizeSections(sections),
    }),
    [iconUrl, name, sections, slug],
  );

  const applyComponentPreset = (presetId: string) => {
    const preset = componentOptions.find((item) => item.id === presetId);
    if (!preset) return;

    setSelectedComponentId(preset.id);
    setName(preset.name);
    setSlug(preset.slug);
    setIconUrl(preset.iconUrl);
    setSections(makeEditableSections(ensureSixSections(preset.name, preset.sections)));
    setStatus("idle");
    setMessage("");
    setToastMessage(null);
    setValidationErrors({});
  };

  const getSectionErrorKey = (sectionId: string, field: "title" | "content") =>
    `${sectionId}.${field}`;

  const clearSectionError = (sectionId: string, field: "title" | "content") => {
    const errorKey = getSectionErrorKey(sectionId, field);
    setValidationErrors((current) => {
      if (!current[errorKey]) return current;
      const nextErrors = { ...current };
      delete nextErrors[errorKey];
      return nextErrors;
    });
  };

  const loadGuides = async () => {
    try {
      setIsListLoading(true);
      setListMessage("");
      const guideList = await componentGuideApi.list();
      setGuides(guideList);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unable to load component guides.";
      setListMessage(errorMessage);
      setToastMessage({ type: "error", text: errorMessage });
    } finally {
      setIsListLoading(false);
    }
  };

  useEffect(() => {
    void loadGuides();
  }, []);

  useEffect(() => {
    if (!toastMessage) return;

    const timeoutId = window.setTimeout(() => setToastMessage(null), 2000);
    return () => window.clearTimeout(timeoutId);
  }, [toastMessage]);

  const openAddGuideForm = () => {
    applyComponentPreset(componentOptions[0]?.id ?? defaultComponentPresets[0].id);
    setEditingGuideId(null);
    setEditingGuideName("");
    setMessage("");
    setStatus("idle");
    setValidationErrors({});
    setIsFormOpen(true);
  };

  const openEditGuideForm = (guide: ComponentGuide) => {
    const preset = componentOptions.find((item) => item.slug === guide.slug);

    setSelectedComponentId(preset?.id ?? guide.slug);
    setName(guide.name);
    setSlug(guide.slug);
    setIconUrl(guide.iconUrl ?? "");
    setSections(makeEditableSections(guide.sections ?? []));
    setEditingGuideId(getGuideId(guide));
    setEditingGuideName(guide.name);
    setStatus("idle");
    setMessage("");
    setToastMessage(null);
    setValidationErrors({});
    setIsFormOpen(true);
  };

  const deleteGuide = async (guide: ComponentGuide) => {
    const guideId = getGuideId(guide);
    if (!window.confirm(`Delete ${guide.name}?`)) return;

    try {
      setToastMessage(null);
      await componentGuideApi.remove(guideId);
      setToastMessage({ type: "success", text: "Component guide deleted successfully." });
      await loadGuides();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unable to delete the component guide.";
      setToastMessage({ type: "error", text: errorMessage });
    }
  };

  const openAddComponentModal = () => {
    setEditingComponentId(null);
    setComponentDraft(emptyComponentDraft);
    setIsComponentModalOpen(true);
  };

  const openEditComponentModal = () => {
    const selectedComponent = componentOptions.find((item) => item.id === selectedComponentId);
    if (!selectedComponent) return;

    setEditingComponentId(selectedComponent.id);
    setComponentDraft({
      id: selectedComponent.id,
      name: selectedComponent.name,
    });
    setIsComponentModalOpen(true);
  };

  const saveComponent = (event: React.FormEvent) => {
    event.preventDefault();

    const componentName = safeText(componentDraft.name).trim();
    const componentSlug = slugify(componentName);
    const description = `This device is ${componentName}.`;

    if (!componentName || !componentSlug) {
      setToastMessage({ type: "error", text: "Component name is required." });
      return;
    }

    const nextComponent: ComponentPreset = {
      id: editingComponentId ?? componentSlug,
      name: componentName,
      slug: componentSlug,
      iconUrl: "",
      sections: createComponentSections(componentName, description),
    };

    if (
      componentOptions.some(
        (item) => item.slug === componentSlug && item.id !== editingComponentId,
      )
    ) {
      setToastMessage({ type: "error", text: "A component with this slug already exists." });
      return;
    }

    const nextOptions =
      editingComponentId === null
        ? [nextComponent, ...componentOptions]
        : componentOptions.map((item) => (item.id === editingComponentId ? nextComponent : item));

    setComponentOptions(nextOptions);
    writeComponentPresets(nextOptions);
    setIsComponentModalOpen(false);
    setEditingComponentId(null);
    setComponentDraft(emptyComponentDraft);
    setToastMessage({
      type: "success",
      text: editingComponentId === null ? "Component added successfully." : "Component updated successfully.",
    });
    setSelectedComponentId(nextComponent.id);
    setName(nextComponent.name);
    setSlug(nextComponent.slug);
    setIconUrl(nextComponent.iconUrl);
    setSections(makeEditableSections(ensureSixSections(nextComponent.name, nextComponent.sections)));
  };

  const deleteSelectedComponent = () => {
    const selectedComponent = componentOptions.find((item) => item.id === selectedComponentId);
    if (!selectedComponent) return;

    if (componentOptions.length === 1) {
      setToastMessage({ type: "error", text: "At least one component is required." });
      return;
    }

    if (!window.confirm(`Delete component ${selectedComponent.name}?`)) return;

    const nextOptions = componentOptions.filter((item) => item.id !== selectedComponent.id);
    setComponentOptions(nextOptions);
    writeComponentPresets(nextOptions);
    setToastMessage({ type: "success", text: "Component deleted successfully." });
    applyComponentPreset(nextOptions[0].id);
  };

  const updateSection = (id: string, updates: Partial<EditableSection>) => {
    setSections((current) =>
      current.map((section) => (section.id === id ? { ...section, ...updates } : section)),
    );
  };

  const updateLink = (sectionId: string, linkIndex: number, updates: Partial<GuideLink>) => {
    setSections((current) =>
      current.map((section) => {
        if (section.id !== sectionId) return section;
        return {
          ...section,
          links: section.links.map((link, index) =>
            index === linkIndex ? { ...link, ...updates } : link,
          ),
        };
      }),
    );
  };

  const addSection = () => {
    const newSection: EditableSection = {
      id: makeId(),
      title: "New section",
      content: "",
      links: [],
    };

    setSections((current) => [...current, newSection]);
  };

  const removeSection = (sectionId: string) => {
    setSections((current) => current.filter((section) => section.id !== sectionId));
  };

  const addLink = (sectionId: string) => {
    setSections((current) =>
      current.map((section) =>
        section.id === sectionId
          ? { ...section, links: [...section.links, { label: "", url: "" }] }
          : section,
      ),
    );
  };

  const removeLink = (sectionId: string, linkIndex: number) => {
    setSections((current) =>
      current.map((section) =>
        section.id === sectionId
          ? { ...section, links: section.links.filter((_, index) => index !== linkIndex) }
          : section,
      ),
    );
  };

  const submitCircuit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus("saving");
    setMessage("");

    try {
      if (!payload.name || !payload.slug) {
        throw new Error("Name and slug are required.");
      }

      const nextValidationErrors: ValidationErrors = {};
      sections.forEach((section) => {
        if (!safeText(section.title).trim()) {
          nextValidationErrors[getSectionErrorKey(section.id, "title")] = true;
        }

        if (!safeText(section.content).trim()) {
          nextValidationErrors[getSectionErrorKey(section.id, "content")] = true;
        }
      });

      if (Object.keys(nextValidationErrors).length > 0) {
        setValidationErrors(nextValidationErrors);
        throw new Error("Every section needs a title and content.");
      }

      setValidationErrors({});

      if (editingGuideId !== null) {
        await componentGuideApi.update(editingGuideId, payload);
      } else {
        await componentGuideApi.create(payload);
      }
      setStatus("success");
      setMessage(
        editingGuideId !== null ? "Component guide updated successfully." : "Component guide saved successfully.",
      );
      setToastMessage({
        type: "success",
        text: editingGuideId !== null
          ? "Component guide updated successfully."
          : "Component guide saved successfully.",
      });
      setEditingGuideId(null);
      setEditingGuideName("");
      setIsFormOpen(false);
      void loadGuides();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unable to save the component guide.";
      setStatus("error");
      setMessage(errorMessage);
      setToastMessage({ type: "error", text: errorMessage });
    }
  };

  const toast = toastMessage && (
    <div className="fixed right-6 top-24 z-[9999] max-w-sm">
      <div
        className={`rounded-xl border px-4 py-3 text-sm font-semibold shadow-lg ${
          toastMessage.type === "success"
            ? "border-green-100 bg-green-50 text-green-700"
            : "border-red-100 bg-red-50 text-red-700"
        }`}
      >
        {toastMessage.text}
      </div>
    </div>
  );

  if (!isFormOpen) {
    return (
      <div className="space-y-6">
        {toast}

        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Circuit Guides</h1>
            <p className="mt-2 max-w-2xl text-sm text-gray-500">
              Saved component guides are listed here.
            </p>
          </div>
          <button
            type="button"
            onClick={openAddGuideForm}
            className="inline-flex items-center gap-2 rounded-lg bg-[#e51b72] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-[#bd145c]"
          >
            <PlusIcon />
            Add Guide
          </button>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 bg-gray-50/70 px-5 py-4">
            <div>
              <h2 className="text-sm font-bold text-gray-900">Guide List</h2>
              <p className="mt-1 text-xs text-gray-500">Review saved guide content before adding another one.</p>
            </div>
            <span className="rounded-full bg-white px-3 py-1.5 text-[11px] font-bold text-gray-500 shadow-sm ring-1 ring-gray-100">
              {guides.length} guide{guides.length === 1 ? "" : "s"}
            </span>
          </div>

          {listMessage && (
            <div className="m-5 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
              {listMessage}
            </div>
          )}

          {isListLoading ? (
            <div className="p-10 text-center text-sm font-semibold text-gray-400">Loading guides...</div>
          ) : guides.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-sm font-bold text-gray-700">No guides saved yet</p>
              <p className="mt-1 text-xs text-gray-400">Click Add Guide to create the first one.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead className="bg-gray-50 text-[11px] uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="w-[30%] px-5 py-3 font-bold">Name</th>
                    <th className="px-5 py-3 font-bold">Description</th>
                    <th className="w-36 px-5 py-3 text-center font-bold">Sections</th>
                    <th className="w-36 px-5 py-3 text-right font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {guides.map((guide) => (
                    <tr key={guide.id ?? guide.slug} className="hover:bg-gray-50/70">
                      <td className="px-5 py-4">
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-pink-50 text-sm font-bold text-[#e51b72]">
                            {guide.name.slice(0, 1).toUpperCase()}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate font-bold text-gray-900">{guide.name}</p>
                            <p className="mt-1 truncate text-xs text-gray-400">{guide.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <p className="line-clamp-2 max-w-3xl text-sm leading-6 text-gray-500">
                          {getGuideDescription(guide)}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className="inline-flex min-w-20 items-center justify-center rounded-lg bg-gray-100 px-3 py-2 text-xs font-bold text-gray-700">
                          {guide.sections?.length ?? 0} section{(guide.sections?.length ?? 0) === 1 ? "" : "s"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEditGuideForm(guide)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition-colors hover:border-[#e51b72] hover:text-[#e51b72]"
                            aria-label={`Edit ${guide.name}`}
                            title="Edit"
                          >
                            <EditIcon />
                          </button>
                          <button
                            type="button"
                            onClick={() => void deleteGuide(guide)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-100 bg-white text-red-600 transition-colors hover:bg-red-50"
                            aria-label={`Delete ${guide.name}`}
                            title="Delete"
                          >
                            <TrashIcon />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {toast}

      {isComponentModalOpen && (
        <div
          className="fixed inset-0 z-[250] flex items-center justify-center bg-gray-950/45 p-4"
          onMouseDown={() => setIsComponentModalOpen(false)}
        >
          <div
            className="w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-2xl"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="border-b border-gray-100 bg-gray-50 px-5 py-4">
              <h2 className="text-sm font-bold text-gray-900">
                {editingComponentId === null ? "Add Component" : "Edit Component"}
              </h2>
              <p className="mt-1 text-xs text-gray-500">
                This controls the options shown in Select Component.
              </p>
            </div>

            <form onSubmit={saveComponent} className="space-y-4 p-5">
              <label className="block">
                <span className={labelClass}>Name</span>
                <input
                  value={componentDraft.name}
                  onChange={(event) =>
                    setComponentDraft((current) => ({ ...current, name: event.target.value }))
                  }
                  className={inputClass}
                  placeholder="Motor"
                  required
                />
              </label>

              <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
                <button
                  type="button"
                  onClick={() => setIsComponentModalOpen(false)}
                  className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#e51b72] px-4 py-2 text-xs font-bold text-white hover:bg-[#bd145c]"
                >
                  {editingComponentId === null ? "Add Component" : "Update Component"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            {editingGuideId !== null ? "Edit Guide" : "Add Guide"}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-gray-500">
            {editingGuideId !== null
              ? `Update guide information for ${editingGuideName}.`
              : "Create circuit guide information and add sections as needed."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setEditingGuideId(null);
              setEditingGuideName("");
              setValidationErrors({});
              setIsFormOpen(false);
            }}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-xs font-bold text-gray-600 shadow-sm transition-colors hover:bg-gray-50"
          >
            Back
          </button>
          <button
            type="button"
            onClick={addSection}
            className="inline-flex items-center gap-2 rounded-lg bg-[#e51b72] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-[#bd145c]"
          >
            <PlusIcon />
            Add Section
          </button>
        </div>
      </div>

      <form onSubmit={submitCircuit} className="space-y-5">
        <section className="space-y-5">
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="grid gap-4 border-b border-gray-100 bg-gray-50/70 px-5 py-4 lg:grid-cols-[minmax(260px,420px)_1fr_auto] lg:items-end">
              <label className="block">
                <span className={labelClass}>Select Component</span>
                <select
                  value={selectedComponentId}
                  onChange={(event) => applyComponentPreset(event.target.value)}
                  className={inputClass}
                >
                  {componentOptions.map((preset) => (
                    <option key={preset.id} value={preset.id}>
                      {preset.name}
                    </option>
                  ))}
                  {editingGuideId !== null && !componentOptions.some((preset) => preset.id === selectedComponentId) && (
                    <option value={selectedComponentId}>{name}</option>
                  )}
                </select>
              </label>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={openAddComponentModal}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-pink-100 bg-white text-[#e51b72] shadow-sm hover:bg-pink-50"
                  aria-label="Add component"
                  title="Add component"
                >
                  <PlusIcon />
                </button>
                <button
                  type="button"
                  onClick={openEditComponentModal}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 shadow-sm hover:text-[#e51b72]"
                  aria-label="Edit selected component"
                  title="Edit component"
                >
                  <EditIcon />
                </button>
                <button
                  type="button"
                  onClick={deleteSelectedComponent}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-100 bg-white text-red-600 shadow-sm hover:bg-red-50"
                  aria-label="Delete selected component"
                  title="Delete component"
                >
                  <TrashIcon />
                </button>
              </div>

              <div className="rounded-full bg-white px-3 py-1.5 text-[11px] font-bold text-gray-500 shadow-sm ring-1 ring-gray-100">
                {sections.length} section{sections.length === 1 ? "" : "s"}
              </div>
            </div>
          </div>

          {sections.map((section, index) => (
            <div key={section.id} className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 bg-white px-5 py-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#e51b72] text-sm font-bold text-white shadow-sm">
                    {index + 1}
                  </div>
                  <div className="min-w-0">
                    <h2 className="truncate text-sm font-bold text-gray-900">{section.title || `Section ${index + 1}`}</h2>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-gray-500">
                        Order {index}
                      </span>
                      {section.mediaType && section.mediaUrl?.trim() && (
                        <span className="rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-bold text-sky-700">
                          {section.mediaType}
                        </span>
                      )}
                      {section.links.length > 0 && (
                        <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                          {section.links.length} links
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => removeSection(section.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-100 text-red-600 transition-colors hover:bg-red-50"
                      aria-label="Remove section"
                    >
                      <TrashIcon />
                    </button>
                  )}
                </div>
              </div>

              <div className="p-5">
                <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.8fr)]">
                  <label className="block">
                    <span className={labelClass}>Title</span>
                    <input
                      value={section.title}
                      onChange={(event) => {
                        updateSection(section.id, { title: event.target.value });
                        clearSectionError(section.id, "title");
                      }}
                      className={`${inputClass} ${
                        validationErrors[getSectionErrorKey(section.id, "title")] ? errorInputClass : ""
                      }`}
                      required
                    />
                    {validationErrors[getSectionErrorKey(section.id, "title")] && (
                      <p className="mt-1.5 text-[11px] font-semibold text-red-600">Title is required.</p>
                    )}
                  </label>
                  <div className="grid gap-4 sm:grid-cols-[150px_minmax(0,1fr)]">
                    <label className="block">
                      <span className={labelClass}>Media Type</span>
                      <select
                        value={section.mediaType ?? ""}
                        onChange={(event) =>
                          updateSection(section.id, {
                            mediaType: event.target.value
                              ? (event.target.value as GuideMediaType)
                              : undefined,
                          })
                        }
                        className={inputClass}
                      >
                        <option value="">None</option>
                        <option value="IMAGE">IMAGE</option>
                        <option value="VIDEO">VIDEO</option>
                      </select>
                    </label>
                    <MediaUrlPicker
                      value={section.mediaUrl}
                      mediaType={section.mediaType ?? "IMAGE"}
                      accept={section.mediaType === "VIDEO" ? "video/*" : "image/*"}
                      emptyText={section.mediaType === "VIDEO" ? "Click to select video" : "Click to select image"}
                      uploadFile={async (file) => {
                        const uploaded = await componentGuideApi.uploadMedia(file);
                        return uploaded;
                      }}
                      onChange={(url, selectedMediaType) =>
                        updateSection(section.id, {
                          mediaType: selectedMediaType,
                          mediaUrl: url,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="mt-4" data-color-mode="light">
                  <span className={labelClass}>Content</span>
                  <div
                    className={
                      validationErrors[getSectionErrorKey(section.id, "content")]
                        ? "rounded-md border border-red-400 bg-red-50/30 p-0.5 ring-2 ring-red-500/10"
                        : ""
                    }
                  >
                    <MDEditor
                      value={section.content}
                      onChange={(value) => {
                        updateSection(section.id, { content: value ?? "" });
                        clearSectionError(section.id, "content");
                      }}
                      height={220}
                      preview="edit"
                      textareaProps={{
                        placeholder: "Write section content. Use **bold**, lists, links, or short notes.",
                      }}
                    />
                  </div>
                  {validationErrors[getSectionErrorKey(section.id, "content")] && (
                    <p className="mt-1.5 text-[11px] font-semibold text-red-600">Content is required.</p>
                  )}
                </div>

                <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50/70 p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h3 className="text-xs font-bold text-gray-700">Links</h3>
                    <button
                      type="button"
                      onClick={() => addLink(section.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-[11px] font-bold text-gray-600 hover:text-[#e51b72]"
                    >
                      <PlusIcon />
                      Add Link
                    </button>
                  </div>

                  {section.links.length === 0 ? (
                    <p className="text-xs text-gray-400">No links in this section.</p>
                  ) : (
                    <div className="space-y-3">
                      {section.links.map((link, linkIndex) => (
                        <div key={`${section.id}-${linkIndex}`} className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_auto]">
                          <input
                            value={link.label}
                            onChange={(event) =>
                              updateLink(section.id, linkIndex, { label: event.target.value })
                            }
                            className={inputClass}
                            placeholder="Label"
                          />
                          <input
                            value={link.url}
                            onChange={(event) =>
                              updateLink(section.id, linkIndex, { url: event.target.value })
                            }
                            className={inputClass}
                            placeholder="https://example.com"
                          />
                          <button
                            type="button"
                            onClick={() => removeLink(section.id, linkIndex)}
                            className="flex h-10 w-10 items-center justify-center rounded-lg border border-red-100 text-red-600 hover:bg-red-50"
                            aria-label="Remove link"
                          >
                            <TrashIcon />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </section>

        <div className="sticky bottom-4 z-10 rounded-xl border border-gray-200 bg-white/95 p-4 shadow-lg backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {message && (
              <div
                className={`rounded-lg px-3 py-2 text-xs font-semibold ${
                  status === "success"
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {message}
              </div>
            )}
            <div className="ml-auto flex items-center gap-3">
              <button
                type="submit"
                disabled={status === "saving"}
                className="rounded-lg bg-[#e51b72] px-6 py-3 text-xs font-bold text-white shadow-sm transition-colors hover:bg-[#bd145c] disabled:cursor-wait disabled:opacity-70"
              >
                {status === "saving" ? "Saving..." : editingGuideId !== null ? "Update Guide" : "Save Guide"}
              </button>
            </div>
          </div>
        </div>
      </form>

    </div>
  );
}
