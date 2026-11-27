"use client";

import { Magnet, MousePointerClick, RotateCw, Scissors, Sun, Trash2 } from "lucide-react";
import dynamic from "next/dynamic";

import { floorMaterials, getFloorMaterial, getWallMaterial, wallMaterials } from "@/data/catalog";
import { useStudio } from "@/store/useStudio";
import { polygonArea, wallInfo } from "@/utils/calculations";
import { formatM2, formatMeters } from "@/utils/format";

import { TextureSwatch } from "./ui";

// three.js nur im Browser laden
const Scene3D = dynamic(() => import("./Scene3D"), {
  ssr: false,
  loading: () => (
    <div className="grid h-full place-items-center text-sm text-mute">3D-Szene wird geladen …</div>
  ),
});

function HoverTooltip() {
  const hover = useStudio((s) => s.hover);
  const pos = useStudio((s) => s.hoverPos);
  const plan = useStudio((s) => s.plan);
  if (!hover) return null;

  let title = "";
  let lines: string[] = [];
  if (hover.kind === "room") {
    const room = plan.rooms.find((r) => r.id === hover.id);
    if (!room) return null;
    const mat = getFloorMaterial(room.floorMaterialId);
    title = room.name;
    lines = [formatM2(polygonArea(room.polygon)), `Boden: ${mat.name}`];
  } else {
    const wall = plan.walls.find((w) => w.id === hover.id);
    if (!wall) return null;
    const info = wallInfo(plan, wall);
    title = info.roomNames.length ? info.roomNames.join(" | ") : "Wand";
    lines = [
      `Wand · ${formatMeters(info.length)} lang · ${formatM2(info.netAreaOneSide)} netto`,
      `Belag: ${getWallMaterial(wall.wallMaterialId).name}`,
    ];
  }
  return (
    <div
      className="pointer-events-none fixed z-40 rounded-lg border border-white/15 bg-black/85 px-3 py-2 text-[12px] shadow-xl backdrop-blur"
      style={{ left: pos.x + 14, top: pos.y + 14 }}
    >
      <div className="font-semibold text-white">{title}</div>
      {lines.map((l, i) => (
        <div key={i} className="text-slate-300">
          {l}
        </div>
      ))}
    </div>
  );
}

function SelectionCard() {
  const selection = useStudio((s) => s.selection);
  const plan = useStudio((s) => s.plan);
  const setRoomFloor = useStudio((s) => s.setRoomFloor);
  const setWallMaterial = useStudio((s) => s.setWallMaterial);
  const rotate = useStudio((s) => s.rotateFurniture);
  const del = useStudio((s) => s.deleteFurniture);
  if (!selection) return null;

  const base = "absolute top-3 left-3 z-10 w-60 rounded-xl border border-white/10 bg-black/70 p-3 text-[12px] backdrop-blur";

  if (selection.kind === "room") {
    const room = plan.rooms.find((r) => r.id === selection.id);
    if (!room) return null;
    return (
      <div className={base}>
        <div className="font-semibold">{room.name}</div>
        <div className="mb-2 text-mute">{formatM2(polygonArea(room.polygon))} · Boden wechseln:</div>
        <div className="flex gap-1.5">
          {floorMaterials.map((m) => (
            <button
              key={m.id}
              title={`${m.name} – ${m.pricePerM2} €/m²`}
              onClick={() => setRoomFloor(room.id, m.id)}
              className={`rounded-md ${room.floorMaterialId === m.id ? "ring-2 ring-accent2" : "opacity-80 hover:opacity-100"}`}
            >
              <TextureSwatch materialId={m.id} size={36} />
            </button>
          ))}
        </div>
      </div>
    );
  }
  if (selection.kind === "wall") {
    const wall = plan.walls.find((w) => w.id === selection.id);
    if (!wall) return null;
    const info = wallInfo(plan, wall);
    return (
      <div className={base}>
        <div className="font-semibold">Wand · {formatMeters(info.length)}</div>
        <div className="mb-2 text-mute">
          {info.roomNames.join(" | ") || "Außenwand"} · {formatM2(info.netAreaOneSide)} netto/Seite
        </div>
        <div className="flex gap-1.5">
          {wallMaterials.map((m) => (
            <button
              key={m.id}
              title={`${m.name} – ${m.pricePerM2} €/m²`}
              onClick={() => setWallMaterial(wall.id, m.id)}
              className={`rounded-md ${wall.wallMaterialId === m.id ? "ring-2 ring-accent2" : "opacity-80 hover:opacity-100"}`}
            >
              <TextureSwatch materialId={m.id} size={36} />
            </button>
          ))}
        </div>
      </div>
    );
  }
  const f = plan.furniture.find((x) => x.id === selection.id);
  if (!f) return null;
  return (
    <div className={base}>
      <div className="font-semibold">{f.name}</div>
      <div className="mb-2 text-mute">
        {f.dimensions.map((d) => d.toFixed(2)).join(" × ")} m · {Math.round((f.rotationY * 180) / Math.PI)}°
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => rotate(f.id)}
          className="flex h-8 flex-1 items-center justify-center gap-1.5 rounded-md bg-white/10 hover:bg-white/15"
        >
          <RotateCw size={13} /> 45° <kbd className="rounded bg-black/40 px-1 text-[10px]">R</kbd>
        </button>
        <button
          onClick={() => del(f.id)}
          className="flex h-8 items-center justify-center gap-1.5 rounded-md bg-red-500/15 px-3 text-red-300 hover:bg-red-500/25"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}

function hourLabel(h: number) {
  const hh = Math.floor(h);
  const mm = Math.round((h - hh) * 60);
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

function Hints() {
  const mode = useStudio((s) => s.cameraMode);
  if (mode === "walk")
    return (
      <span>
        <b>WASD</b> / Pfeile bewegen · <b>Maus ziehen</b> umschauen · <b>Shift</b> schneller
      </span>
    );
  if (mode === "top")
    return (
      <span>
        <b>Ziehen</b> verschiebt · <b>Mausrad</b> zoomt · Maße in Metern
      </span>
    );
  return (
    <span>
      <b>Ziehen</b> dreht · <b>Rechtsklick</b> verschiebt · <b>Mausrad</b> zoomt · Klick wählt/ändert
    </span>
  );
}

function BottomBar() {
  const mode = useStudio((s) => s.cameraMode);
  const hour = useStudio((s) => s.sunHour);
  const setHour = useStudio((s) => s.setSunHour);
  const cut = useStudio((s) => s.wallCut);
  const setCut = useStudio((s) => s.setWallCut);
  const snap = useStudio((s) => s.snap);
  const setSnap = useStudio((s) => s.setSnap);
  const resetView = useStudio((s) => s.resetView);

  return (
    <div className="absolute inset-x-3 bottom-3 z-10 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 rounded-xl border border-white/10 bg-black/65 px-4 py-2 text-[12px] text-slate-300 backdrop-blur">
      <span className="flex items-center gap-1.5">
        <MousePointerClick size={14} className="text-accent2" />
        <Hints />
      </span>
      <span className="hidden h-4 w-px bg-white/15 sm:block" />
      <label className="flex items-center gap-2">
        <Sun size={14} className="text-amber-300" />
        <span className="sr-only">Tageszeit</span>
        <input
          type="range"
          min={6}
          max={20}
          step={0.25}
          value={hour}
          onChange={(e) => setHour(Number(e.target.value))}
          className="w-32"
          aria-label="Tageszeit / Sonnenstand"
        />
        <span className="w-11 tabular-nums">{hourLabel(hour)}</span>
      </label>
      {mode === "orbit" && (
        <button
          onClick={() => setCut(!cut)}
          aria-pressed={cut}
          className={`flex items-center gap-1.5 rounded-md px-2 py-1 ${cut ? "bg-accent text-white" : "bg-white/10 hover:bg-white/15"}`}
        >
          <Scissors size={13} /> Wände halbhoch
        </button>
      )}
      <button
        onClick={() => setSnap(!snap)}
        aria-pressed={snap}
        className={`flex items-center gap-1.5 rounded-md px-2 py-1 ${snap ? "bg-accent2/20 text-cyan-200" : "bg-white/10 hover:bg-white/15"}`}
        title="Möbel auf 10-cm-Raster einrasten"
      >
        <Magnet size={13} /> Snap 10 cm
      </button>
      <button onClick={resetView} className="rounded-md bg-white/10 px-2 py-1 hover:bg-white/15">
        Ansicht zurücksetzen
      </button>
    </div>
  );
}

export function Viewport() {
  return (
    <main className="relative order-1 h-[68vh] min-h-[420px] min-w-0 flex-1 touch-none overflow-hidden bg-canvas lg:order-2 lg:h-auto">
      <Scene3D />
      <SelectionCard />
      <HoverTooltip />
      <BottomBar />
    </main>
  );
}
