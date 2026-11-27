"use client";

import { Armchair, BrickWall, Grid2x2, Layers, RotateCw, Trash2 } from "lucide-react";

import {
  floorMaterials,
  furnitureCatalog,
  wallMaterials,
  type SurfaceMaterial,
} from "@/data/catalog";
import { useStudio } from "@/store/useStudio";
import type { SidebarTab } from "@/types/floorplan";
import { formatEUR } from "@/utils/format";

import { TextureSwatch } from "./ui";

const TABS: Array<{ id: SidebarTab; label: string; icon: React.ReactNode }> = [
  { id: "floors", label: "Böden", icon: <Grid2x2 size={14} /> },
  { id: "walls", label: "Wände", icon: <BrickWall size={14} /> },
  { id: "furniture", label: "Möbel", icon: <Armchair size={14} /> },
];

function MaterialTile({
  material,
  active,
  onPick,
}: {
  material: SurfaceMaterial;
  active: boolean;
  onPick: () => void;
}) {
  return (
    <button
      onClick={onPick}
      aria-pressed={active}
      className={`group flex w-full items-center gap-3 rounded-xl border p-2 text-left transition ${
        active ? "border-accent bg-accent/10 ring-1 ring-accent/60" : "border-line bg-panel2 hover:border-white/20"
      }`}
    >
      <TextureSwatch materialId={material.id} size={52} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13px] font-medium">{material.name}</span>
        <span className="block truncate text-[11px] text-mute">{material.description}</span>
        <span className="mt-0.5 block text-[12px] font-semibold text-accent2">{material.pricePerM2} €/m²</span>
      </span>
    </button>
  );
}

export function LeftSidebar() {
  const tab = useStudio((s) => s.tab);
  const setTab = useStudio((s) => s.setTab);
  const activeFloor = useStudio((s) => s.activeFloorMaterialId);
  const activeWall = useStudio((s) => s.activeWallMaterialId);
  const setActiveFloor = useStudio((s) => s.setActiveFloorMaterial);
  const setActiveWall = useStudio((s) => s.setActiveWallMaterial);
  const selection = useStudio((s) => s.selection);
  const setRoomFloor = useStudio((s) => s.setRoomFloor);
  const setWallMaterial = useStudio((s) => s.setWallMaterial);
  const applyFloorToAll = useStudio((s) => s.applyFloorToAll);
  const applyWallToAll = useStudio((s) => s.applyWallToAll);
  const addFurniture = useStudio((s) => s.addFurniture);
  const furniture = useStudio((s) => s.plan.furniture);
  const select = useStudio((s) => s.select);
  const rotate = useStudio((s) => s.rotateFurniture);
  const del = useStudio((s) => s.deleteFurniture);
  const snap = useStudio((s) => s.snap);
  const setSnap = useStudio((s) => s.setSnap);
  const showToast = useStudio((s) => s.showToast);

  const pickFloor = (id: string) => {
    setActiveFloor(id);
    if (selection?.kind === "room") setRoomFloor(selection.id, id);
  };
  const pickWall = (id: string) => {
    setActiveWall(id);
    if (selection?.kind === "wall") setWallMaterial(selection.id, id);
  };

  return (
    <aside className="order-2 flex w-full shrink-0 flex-col border-line bg-panel lg:order-1 lg:w-[280px] lg:border-r">
      <div className="flex gap-1 border-b border-line p-2" role="tablist" aria-label="Werkzeugkasten">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg text-[13px] font-medium transition ${
              tab === t.id ? "bg-white/10 text-ink" : "text-mute hover:text-ink"
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
        {tab === "floors" && (
          <>
            <p className="px-1 text-[12px] leading-snug text-mute">
              Material wählen, dann im 3D-Fenster auf einen Boden klicken – oder zuerst einen Raum anklicken.
            </p>
            {floorMaterials.map((m) => (
              <MaterialTile key={m.id} material={m} active={activeFloor === m.id} onPick={() => pickFloor(m.id)} />
            ))}
            <button
              onClick={() => {
                applyFloorToAll(activeFloor);
                showToast("Boden auf alle Räume angewendet");
              }}
              className="mt-1 flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-accent/50 bg-accent/10 text-[13px] font-medium text-violet-200 hover:bg-accent/20"
            >
              <Layers size={15} /> Auf alle Räume anwenden
            </button>
          </>
        )}

        {tab === "walls" && (
          <>
            <p className="px-1 text-[12px] leading-snug text-mute">
              Material wählen, dann im 3D-Fenster auf eine Wand klicken. Innenwände werden für beide Seiten kalkuliert.
            </p>
            {wallMaterials.map((m) => (
              <MaterialTile key={m.id} material={m} active={activeWall === m.id} onPick={() => pickWall(m.id)} />
            ))}
            <button
              onClick={() => {
                applyWallToAll(activeWall);
                showToast("Wandbelag auf alle Wände angewendet");
              }}
              className="mt-1 flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-accent/50 bg-accent/10 text-[13px] font-medium text-violet-200 hover:bg-accent/20"
            >
              <Layers size={15} /> Auf alle Räume anwenden
            </button>
          </>
        )}

        {tab === "furniture" && (
          <>
            <p className="px-1 text-[12px] leading-snug text-mute">
              Möbel hinzufügen (maßstabsgetreu), im 3D-Fenster ziehen, mit <kbd className="rounded bg-white/10 px-1">R</kbd> um 45° drehen.
            </p>
            {furnitureCatalog.map((f) => (
              <button
                key={f.id}
                onClick={() => addFurniture(f.id)}
                className="flex w-full items-center gap-3 rounded-xl border border-line bg-panel2 p-2.5 text-left transition hover:border-white/25"
              >
                <span className="grid size-11 shrink-0 place-items-center rounded-lg" style={{ background: f.color + "33", color: f.color }}>
                  <Armchair size={20} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-medium">{f.name}</span>
                  <span className="block text-[11px] text-mute">
                    {f.dimensions[0].toFixed(2)} × {f.dimensions[1].toFixed(2)} × {f.dimensions[2].toFixed(2)} m
                  </span>
                </span>
                <span className="rounded-md bg-accent/20 px-2 py-1 text-[11px] font-semibold text-violet-200">+ Add</span>
              </button>
            ))}

            <label className="flex cursor-pointer items-center gap-2 px-1 pt-1 text-[12px] text-mute">
              <input type="checkbox" checked={snap} onChange={(e) => setSnap(e.target.checked)} className="accent-violet-500" />
              Raster-Snapping (10 cm)
            </label>

            <div className="pt-2">
              <h3 className="px-1 pb-1.5 text-[11px] font-semibold tracking-wider text-mute uppercase">
                Platziert ({furniture.length})
              </h3>
              <ul className="space-y-1">
                {furniture.map((f) => {
                  const sel = selection?.kind === "furniture" && selection.id === f.id;
                  return (
                    <li
                      key={f.id}
                      className={`flex items-center gap-1 rounded-lg border px-2 py-1.5 text-[12px] ${
                        sel ? "border-accent2/60 bg-accent2/10" : "border-line bg-panel2"
                      }`}
                    >
                      <button className="min-w-0 flex-1 truncate text-left" onClick={() => select({ kind: "furniture", id: f.id })}>
                        {f.name}
                      </button>
                      <button
                        className="grid size-7 place-items-center rounded-md text-mute hover:bg-white/10 hover:text-ink"
                        onClick={() => rotate(f.id)}
                        title="Um 45° drehen (R)"
                        aria-label="Drehen"
                      >
                        <RotateCw size={14} />
                      </button>
                      <button
                        className="grid size-7 place-items-center rounded-md text-mute hover:bg-red-500/15 hover:text-red-300"
                        onClick={() => del(f.id)}
                        title="Entfernen (Entf)"
                        aria-label="Entfernen"
                      >
                        <Trash2 size={14} />
                      </button>
                    </li>
                  );
                })}
                {furniture.length === 0 && <li className="px-1 text-[12px] text-mute">Noch keine Möbel.</li>}
              </ul>
            </div>
          </>
        )}
      </div>

      <div className="hidden border-t border-line p-3 text-[11px] text-mute lg:block">
        Preise: Richtwerte inkl. Material &amp; Verlegung ({formatEUR(14)}–{formatEUR(89)}/m²).
      </div>
    </aside>
  );
}
