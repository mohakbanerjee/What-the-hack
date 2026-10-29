"use client";

export function PhotoPick({
  label,
  capture,
  onFile,
  tone = "ghost",
}: {
  label: string;
  capture?: "environment" | "user";
  onFile: (file: File) => void;
  tone?: "sun" | "ghost";
}) {
  const toneClass =
    tone === "sun"
      ? "bg-sun text-ink shadow-[0_0_24px_rgba(255,225,74,0.35)]"
      : "border border-white/15 bg-white/5 text-white";
  return (
    <label
      className={`relative inline-flex min-h-14 cursor-pointer items-center justify-center rounded-full px-6 text-lg font-bold ${toneClass}`}
    >
      {label}
      <input
        type="file"
        accept="image/*"
        capture={capture}
        className="absolute inset-0 z-10 cursor-pointer opacity-0"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onFile(file);
          event.currentTarget.value = "";
        }}
      />
    </label>
  );
}
