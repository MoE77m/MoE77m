"use client";

import { Box, Eye, Footprints, Redo2, Ruler, Undo2, Upload } from "lucide-react";

import { samplePlans } from "@/data/samples";
import { useStudio } from "@/store/useStudio";
import type { CameraMode } from "@/types/floorplan";

const MODES: Array<{ id: CameraMode; label: string; icon: React.ReactNode }> = [
  { id: "orbit", label: "3D-Ansicht", icon: <Eye size={15} /> },
  { id: "top", label: "2D-Maße", icon: <Ruler size={15} /> },
  { id: "walk", label: "Begehen (1.70m)", icon: <Footprints size={15} /> },
];

export function Topbar() {
  const planId = useStudio((s) => s.planId);
  const mode = useStudio((s) => s.cameraMode);
  const canUndo = useStudio((s) => s.past.length > 0);
  const canRedo = useStudio((s) => s.future.length > 0);
  const loadSample = useStudio((s) => s.loadSample);
  const setMode = useStudio((s) => s.setCameraMode);
  const setUploadOpen = useStudio((s) => s.setUploadOpen);
  const undo = useStudio((s) => s.undo);
  const redo = useStudio((s) => s.redo);
  const planName = useStudio((s) => s.plan.meta.name);

  return (
    <header className="flex min-h-14 shrink-0 flex-wrap items-center gap-x-4 gap-y-2 border-b border-line bg-panel px-4 py-2 lg:h-14 lg:flex-nowrap lg:py-0">
      <div className="flex items-center gap-2">
        <div className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-accent to-accent2 text-white shadow-lg shadow-accent/30">
          <Box size={18} strokeWidth={2.4} />
        </div>
        <span className="text-[15px] font-semibold tracking-tight">
          Plan2Space <span className="text-accent2">3D</span>
        </span>
      </div>

      <div className="flex items-center gap-2">
        <label className="sr-only" htmlFor="plan-select">
          Grundriss wählen
        </label>
        <select
          id="plan-select"
          value={samplePlans.some((s) => s.id === planId) ? planId : "custom"}
          onChange={(e) => e.target.value !== "custom" && loadSample(e.target.value)}
          className="h-9 max-w-52 rounded-lg border border-line bg-panel2 px-3 text-[13px] text-ink"
          title={planName}
        >
          {samplePlans.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
          {!samplePlans.some((s) => s.id === planId) && <option value="custom">{planName}</option>}
        </select>
        <button
          onClick={() => setUploadOpen(true)}
          className="flex h-9 items-center gap-2 rounded-lg bg-accent px-3 text-[13px] font-medium text-white transition hover:brightness-110"
        >
          <Upload size={15} /> Grundriss hochladen (KI)
        </button>
      </div>

      <div className="mx-auto flex rounded-lg border border-line bg-panel2 p-0.5" role="tablist" aria-label="Kameramodus">
        {MODES.map((m) => (
          <button
            key={m.id}
            role="tab"
            aria-selected={mode === m.id}
            onClick={() => setMode(m.id)}
            className={`flex h-8 items-center gap-1.5 rounded-md px-3 text-[13px] transition ${
              mode === m.id ? "bg-accent text-white shadow" : "text-mute hover:text-ink"
            }`}
          >
            {m.icon}
            <span className="hidden sm:inline">{m.label}</span>
          </button>
        ))}
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={undo}
          disabled={!canUndo}
          className="grid size-9 place-items-center rounded-lg border border-line bg-panel2 text-ink hover:bg-white/5 disabled:opacity-35"
          title="Rückgängig (Strg+Z)"
          aria-label="Rückgängig"
        >
          <Undo2 size={16} />
        </button>
        <button
          onClick={redo}
          disabled={!canRedo}
          className="grid size-9 place-items-center rounded-lg border border-line bg-panel2 text-ink hover:bg-white/5 disabled:opacity-35"
          title="Wiederholen (Strg+Y)"
          aria-label="Wiederholen"
        >
          <Redo2 size={16} />
        </button>
      </div>
    </header>
  );
}
