import { Loader2 } from "lucide-react";

interface LoadStatusBannerProps {
  status: "idle" | "loading" | "error";
  message: string;
}

export function LoadStatusBanner({ status, message }: LoadStatusBannerProps) {
  if (!message) return null;

  const isError = status === "error";

  return (
    <div
      className={`rounded-lg border px-4 py-3 text-xs font-semibold ${
        isError ? "border-red-200 bg-red-50 text-red-700" : "border-gray-200 bg-white text-gray-500"
      }`}
    >
      <span className="inline-flex items-center gap-2">
        {status === "loading" && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
        {message}
      </span>
    </div>
  );
}