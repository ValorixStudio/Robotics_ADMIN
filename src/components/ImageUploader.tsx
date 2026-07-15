import React, { useRef, useState } from "react";

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  disabled?: boolean;
}

export function ImageUploader({ value, onChange, label = "Upload Image", disabled = false }: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      const data = (await response.json()) as { url?: string };
      if (data.url) {
        onChange(data.url);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0];
    if (file) handleFileSelect(file);
  };

  return (
    <div className="space-y-3">
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => !disabled && fileInputRef.current?.click()}
        className={`cursor-pointer rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-center transition-colors ${
          disabled ? "cursor-not-allowed opacity-50" : "hover:border-[#e51b72] hover:bg-pink-50"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleInputChange}
          disabled={disabled || isLoading}
          className="hidden"
        />
        <div className="space-y-1">
          <p className="text-sm font-semibold text-gray-900">{label}</p>
          <p className="text-xs text-gray-500">Drag and drop or click to select (Max 5MB)</p>
        </div>
      </div>

      {isLoading && <p className="text-xs text-blue-600 font-semibold">Uploading...</p>}
      {error && <p className="text-xs text-red-600 font-semibold">{error}</p>}

      {value && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-600">Preview:</p>
          <div className="rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
            <img src={value} alt="Preview" className="h-32 w-full object-cover" />
          </div>
          <button
            type="button"
            onClick={() => onChange("")}
            disabled={isLoading}
            className="w-full rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-100 disabled:opacity-50"
          >
            Remove Image
          </button>
        </div>
      )}
    </div>
  );
}
