"use client";

import { useState } from "react";

export default function MediaUploadField({
  label,
  kind,
  value,
  onChange,
}: {
  label: string;
  kind: "image" | "video";
  value: string;
  onChange: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "UPLOAD_FAILED");
      }
      const data = await res.json();
      onChange(data.url);
    } catch {
      setError("Tải lên thất bại (định dạng/kích thước không hợp lệ)");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>

      {value ? (
        <div className="mb-2 flex items-center gap-2">
          {kind === "image" ? (
            // eslint-disable-next-line @next/next/no-img-element -- MinIO-proxied upload, not optimizable by next/image
            <img src={value} alt="" className="h-16 w-16 rounded-lg object-cover border border-neutral-200" />
          ) : (
            <video src={value} className="h-16 w-24 rounded-lg border border-neutral-200" muted />
          )}
          <button
            type="button"
            onClick={() => onChange("")}
            className="text-sm text-red-500 hover:underline"
          >
            Xóa
          </button>
        </div>
      ) : null}

      <input
        type="file"
        accept={kind === "image" ? "image/jpeg,image/png,image/webp,image/gif" : "video/mp4,video/webm,video/quicktime"}
        disabled={uploading}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
        className="w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-neutral-100 file:px-3 file:py-1.5 file:text-sm file:font-medium hover:file:bg-neutral-200"
      />
      {uploading && <p className="text-xs text-neutral-400 mt-1">Đang tải lên...</p>}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
