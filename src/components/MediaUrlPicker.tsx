import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/config/apiUrls";
import type { GuideMediaType, MediaUploadResponse } from "@/services/api/types";

type PickerStatus = "idle" | "saving" | "error";

const MEDIA_LIBRARY_STORAGE_KEY = "admin-media-url-library";

interface MediaUrlPickerProps {
  value?: string;
  label?: string;
  accept?: string;
  emptyText?: string;
  mediaType?: GuideMediaType;
  uploadFile: (file: File) => Promise<string | MediaUploadResponse>;
  onChange: (url: string, mediaType: GuideMediaType) => void;
  onUploaded?: (url: string) => void;
}

const toSafeString = (value: unknown) => (typeof value === "string" ? value : "");

const getMediaPreviewUrl = (url: string) => {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;

  return `${API_BASE_URL.replace(/\/$/, "")}/${url.replace(/^\//, "")}`;
};

const inferMediaType = (url: string, fallback: GuideMediaType = "IMAGE"): GuideMediaType => {
  const cleanUrl = url.split("?")[0].toLowerCase();
  if (/\.(mp4|webm|ogg|mov|m4v)$/i.test(cleanUrl)) return "VIDEO";
  if (/\.(png|jpe?g|webp|gif|svg)$/i.test(cleanUrl)) return "IMAGE";
  return fallback;
};

const getFileMediaType = (file: File): GuideMediaType =>
  file.type.startsWith("video/") ? "VIDEO" : "IMAGE";

const getUploadResult = (result: string | MediaUploadResponse, fallbackType: GuideMediaType) => {
  if (typeof result === "string") {
    return { url: result, type: inferMediaType(result, fallbackType) };
  }

  return {
    url: result.url,
    type: result.type ?? inferMediaType(result.url, fallbackType),
  };
};

function ImageIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3.5 5.5A2 2 0 0 1 5.5 3.5h9a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-9a2 2 0 0 1-2-2v-9Z" />
      <path d="m4 13 3.5-3.5 2.5 2.5 1.5-1.5L16 15" />
      <path d="M13.5 7.5h.01" />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10 14V4" />
      <path d="m6 8 4-4 4 4" />
      <path d="M4 14v1.5A1.5 1.5 0 0 0 5.5 17h9a1.5 1.5 0 0 0 1.5-1.5V14" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m5 5 10 10M15 5 5 15" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 6h12" />
      <path d="M8 6V4h4v2" />
      <path d="m6 6 .7 10h6.6L14 6" />
      <path d="M8.5 9v4M11.5 9v4" />
    </svg>
  );
}

function readStoredMediaUrls(): string[] {
  if (typeof window === "undefined") return [];

  try {
    const storedValue = window.localStorage.getItem(MEDIA_LIBRARY_STORAGE_KEY);
    const parsedValue = storedValue ? JSON.parse(storedValue) : [];
    return Array.isArray(parsedValue)
      ? parsedValue.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
      : [];
  } catch {
    return [];
  }
}

function writeStoredMediaUrls(urls: string[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(MEDIA_LIBRARY_STORAGE_KEY, JSON.stringify(urls));
}

export function MediaUrlPicker({
  value,
  label = "Media URL",
  accept = "image/*",
  emptyText = "Click to select image",
  mediaType = "IMAGE",
  uploadFile,
  onChange,
  onUploaded,
}: MediaUrlPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [uploadedPreviewUrl, setUploadedPreviewUrl] = useState("");
  const [storedMediaUrls, setStoredMediaUrls] = useState<string[]>([]);
  const [selectedMediaUrls, setSelectedMediaUrls] = useState<string[]>([]);
  const [status, setStatus] = useState<PickerStatus>("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl("");
      return;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  const resetModal = () => {
    setSelectedFile(null);
    setUploadedPreviewUrl("");
    setSelectedMediaUrls(value ? [value] : []);
    setStatus("idle");
    setMessage("");
  };

  const openModal = () => {
    resetModal();
    setStoredMediaUrls(readStoredMediaUrls());
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    resetModal();
  };

  const rememberMediaUrl = (url: unknown) => {
    const normalizedUrl = toSafeString(url).trim();
    if (!normalizedUrl) return;

    setStoredMediaUrls((currentUrls) => {
      const nextUrls = [normalizedUrl, ...currentUrls.filter((item) => item !== normalizedUrl)];
      writeStoredMediaUrls(nextUrls);
      return nextUrls;
    });
  };

  const toggleSelectedMedia = (url: string) => {
    const normalizedUrl = toSafeString(url).trim();
    if (!normalizedUrl) return;

    setSelectedMediaUrls((currentUrls) =>
      currentUrls.includes(normalizedUrl)
        ? currentUrls.filter((item) => item !== normalizedUrl)
        : [...currentUrls, normalizedUrl],
    );
  };

  const deleteStoredMedia = (url: string) => {
    const normalizedUrl = toSafeString(url).trim();
    if (!normalizedUrl) return;

    setStoredMediaUrls((currentUrls) => {
      const nextUrls = currentUrls.filter((item) => item !== normalizedUrl);
      writeStoredMediaUrls(nextUrls);
      return nextUrls;
    });
    setSelectedMediaUrls((currentUrls) => currentUrls.filter((item) => item !== normalizedUrl));

    if (uploadedPreviewUrl === normalizedUrl) {
      setUploadedPreviewUrl("");
    }
  };

  const doneSelecting = () => {
    const latestUrl = selectedMediaUrls.at(-1);

    if (latestUrl) {
      onChange(latestUrl, inferMediaType(latestUrl, mediaType));
      onUploaded?.(latestUrl);
    }
    closeModal();
  };

  const uploadFileObject = async (file: File | null) => {
    if (!file) {
      setStatus("error");
      setMessage("Please select a media file first.");
      return;
    }

    try {
      setStatus("saving");
      setMessage("");

      const uploaded = getUploadResult(await uploadFile(file), getFileMediaType(file));
      const normalizedUrl = toSafeString(uploaded.url).trim();
      if (!normalizedUrl) {
        throw new Error("Upload completed, but the server did not return a media URL.");
      }

      rememberMediaUrl(normalizedUrl);
      setUploadedPreviewUrl(normalizedUrl);
      setSelectedMediaUrls((currentUrls) =>
        currentUrls.includes(normalizedUrl) ? currentUrls : [...currentUrls, normalizedUrl],
      );
      setStatus("idle");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Unable to upload media.");
    }
  };

  const handleFileChange = (file: File | null) => {
    setSelectedFile(file);
    setStatus("idle");
    setMessage("");

      if (file) void uploadFileObject(file);
  };

  return (
    <div className="block">
      <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-gray-500">
        {label}
      </span>

      <button
        type="button"
        onClick={openModal}
        className="group flex min-h-[58px] w-full items-center gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2 text-left text-sm text-gray-800 outline-none transition-colors hover:border-[#e51b72] hover:bg-pink-50/30 focus:border-[#e51b72] focus:ring-2 focus:ring-[#e51b72]/10"
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-50 text-gray-400 group-hover:border-pink-200 group-hover:text-[#e51b72]">
          {value && inferMediaType(value, mediaType) === "VIDEO" ? (
            <video src={getMediaPreviewUrl(value)} className="h-full w-full object-cover" muted />
          ) : value ? (
            <img src={getMediaPreviewUrl(value)} alt="" className="h-full w-full object-cover" />
          ) : (
            <ImageIcon />
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className={value ? "block truncate font-semibold text-gray-800" : "block font-semibold text-gray-500"}>
            {value ? `${inferMediaType(value, mediaType) === "VIDEO" ? "Video" : "Image"} selected` : emptyText}
          </span>
          <span className="mt-0.5 block truncate text-[11px] text-gray-400">
            {value || (mediaType === "VIDEO" ? "Upload MP4, WEBM, MOV, or OGG" : "Upload PNG, JPG, WEBP, or GIF")}
          </span>
        </span>
        <span className="shrink-0 rounded-md bg-gray-100 px-2.5 py-1.5 text-[10px] font-bold text-gray-500 group-hover:bg-[#e51b72] group-hover:text-white">
          Browse
        </span>
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-[220] flex items-center justify-center bg-gray-950/45 p-4"
          onMouseDown={closeModal}
        >
          <div
            className="w-full max-w-4xl overflow-hidden rounded-xl bg-white shadow-2xl"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-gray-100 bg-gray-50 px-5 py-4">
              <div>
                <h2 className="text-sm font-bold text-gray-900">Select Media</h2>
                <p className="mt-1 text-xs text-gray-500">
                  Upload a new file or select one from your saved media list.
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
                aria-label="Close media picker"
              >
                <CloseIcon />
              </button>
            </div>

            <div className="space-y-5 p-5">
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-3 transition-colors hover:border-[#e51b72] hover:bg-pink-50/40">
                  <input
                    type="file"
                    accept={accept}
                    className="sr-only"
                    onChange={(event) => handleFileChange(event.target.files?.[0] ?? null)}
                  />
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-50 text-[#e51b72]">
                    {previewUrl && selectedFile?.type.startsWith("video/") ? (
                      <video src={previewUrl} className="h-full w-full object-cover" muted />
                    ) : previewUrl || uploadedPreviewUrl ? (
                      <img
                        src={previewUrl || getMediaPreviewUrl(uploadedPreviewUrl)}
                        alt=""
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <UploadIcon />
                    )}
                  </span>
                  <span className="flex min-w-0 flex-col justify-center">
                    <span className="text-sm font-bold text-gray-800">
                      {status === "saving" ? "Uploading media..." : "Click to upload media"}
                    </span>
                  </span>
                </label>

                {message && (
                  <div className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
                    {message}
                  </div>
                )}

              <div className="min-w-0">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wide text-gray-600">Saved Media</h3>
                    <p className="mt-1 text-xs text-gray-400">Select, unselect, or delete media.</p>
                  </div>
                </div>

                {storedMediaUrls.length === 0 ? (
                  <div className="flex min-h-64 items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50 px-5 text-center">
                    <div>
                      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white text-gray-400 shadow-sm">
                        <ImageIcon />
                      </div>
                      <p className="text-sm font-bold text-gray-700">No saved media yet</p>
                      <p className="mt-1 text-xs text-gray-400">
                        Uploaded media will appear here automatically.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="grid max-h-[360px] grid-cols-2 gap-3 overflow-y-auto pr-1 sm:grid-cols-4">
                    {storedMediaUrls.map((mediaUrl) => {
                      const isSelected = selectedMediaUrls.includes(mediaUrl);
                      const previewMediaUrl = getMediaPreviewUrl(mediaUrl);
                      const savedMediaType = inferMediaType(mediaUrl, mediaType);
                      return (
                        <div
                          key={mediaUrl}
                          className={`group relative overflow-hidden rounded-xl border bg-white text-left shadow-sm transition-all hover:border-[#e51b72] hover:shadow-md ${
                            isSelected ? "border-[#e51b72] ring-2 ring-[#e51b72]/15" : "border-gray-200"
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => toggleSelectedMedia(mediaUrl)}
                            className="block w-full"
                          >
                            <span className="block h-28 bg-gray-100">
                              {savedMediaType === "VIDEO" ? (
                                <video src={previewMediaUrl} className="h-full w-full object-cover" muted />
                              ) : (
                                <img src={previewMediaUrl} alt="" className="h-full w-full object-cover" />
                              )}
                            </span>
                          </button>
                          <span className="absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-md bg-white/95 shadow-sm ring-1 ring-gray-200">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelectedMedia(mediaUrl)}
                              className="h-4 w-4 cursor-pointer accent-[#e51b72]"
                              aria-label="Select saved image"
                            />
                          </span>
                          <span className="absolute right-2 top-2">
                            <button
                              type="button"
                              onClick={() => deleteStoredMedia(mediaUrl)}
                              className="flex h-7 w-7 items-center justify-center rounded-md bg-white/95 text-red-600 shadow-sm ring-1 ring-red-100 hover:bg-red-50"
                              aria-label="Delete saved image"
                            >
                              <TrashIcon />
                            </button>
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-gray-100 bg-gray-50 px-5 py-4">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={doneSelecting}
                disabled={status === "saving" || selectedMediaUrls.length === 0}
                className="rounded-lg bg-[#e51b72] px-4 py-2 text-xs font-bold text-white hover:bg-[#bd145c] disabled:cursor-not-allowed disabled:opacity-70"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
