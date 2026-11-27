"use client";

import { useEffect, useRef } from "react";

import { getSwatchCanvas } from "@/utils/textures";

/** Vorschau-Kachel eines Materials (prozedural gezeichnet). */
export function TextureSwatch({ materialId, size = 56, className = "" }: { materialId: string; size?: number; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const src = getSwatchCanvas(materialId, 128);
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.drawImage(src, 0, 0, c.width, c.height);
  }, [materialId]);
  return (
    <canvas
      ref={ref}
      width={size * 2}
      height={size * 2}
      style={{ width: size, height: size }}
      className={`shrink-0 rounded-md border border-white/10 ${className}`}
      aria-hidden
    />
  );
}

export function ProBadge({ unlocked }: { unlocked?: boolean }) {
  return (
    <span
      className={`rounded px-1.5 py-0.5 text-[10px] font-bold tracking-wide uppercase ${
        unlocked ? "bg-emerald-400/15 text-emerald-300" : "bg-accent/20 text-violet-200"
      }`}
    >
      {unlocked ? "Pro ✓" : "Pro"}
    </span>
  );
}

export function Modal({
  title,
  onClose,
  children,
  width = "max-w-lg",
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  width?: string;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className={`w-full ${width} rounded-2xl border border-line bg-panel shadow-2xl shadow-black/60`}>
        <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
          <h2 className="text-sm font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-md px-2 py-1 text-mute hover:bg-white/5 hover:text-ink"
            aria-label="Schließen"
          >
            ✕
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
