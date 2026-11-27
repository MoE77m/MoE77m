import { create } from "zustand";

import { defaultFloorMaterialId, getFurnitureCatalogItem } from "@/data/catalog";
import { DEFAULT_SAMPLE_ID, getSample } from "@/data/samples";
import type {
  CameraMode,
  FloorplanData,
  FurnitureItem,
  Selection,
  SidebarTab,
} from "@/types/floorplan";
import { interiorPoint, planBounds } from "@/utils/geometry";

export interface HoverTarget {
  kind: "room" | "wall";
  id: string;
}

interface StudioState {
  plan: FloorplanData;
  planId: string;
  past: FloorplanData[];
  future: FloorplanData[];

  cameraMode: CameraMode;
  tab: SidebarTab;
  activeFloorMaterialId: string;
  activeWallMaterialId: string;
  selection: Selection;
  hover: HoverTarget | null;
  hoverPos: { x: number; y: number };
  wastePercent: number;
  snap: boolean;
  wallCut: boolean;
  sunHour: number;
  walkStart: { x: number; z: number };
  viewNonce: number;

  pro: boolean;
  uploadOpen: boolean;
  paywallOpen: boolean;
  printVariant: "costs" | "report";
  toast: string | null;

  /* Plan-Aktionen (mit Undo/Redo) */
  loadPlan: (plan: FloorplanData, id: string) => void;
  loadSample: (id: string) => void;
  setRoomFloor: (roomId: string, materialId: string) => void;
  setWallMaterial: (wallId: string, materialId: string) => void;
  applyFloorToAll: (materialId: string) => void;
  applyWallToAll: (materialId: string) => void;
  addFurniture: (catalogId: string) => void;
  beginFurnitureDrag: () => void;
  moveFurniture: (id: string, x: number, z: number) => void;
  rotateFurniture: (id: string, deltaRad?: number) => void;
  deleteFurniture: (id: string) => void;
  undo: () => void;
  redo: () => void;

  /* UI-Aktionen */
  setCameraMode: (m: CameraMode) => void;
  setTab: (t: SidebarTab) => void;
  setActiveFloorMaterial: (id: string) => void;
  setActiveWallMaterial: (id: string) => void;
  select: (s: Selection) => void;
  setHover: (h: HoverTarget | null) => void;
  setHoverPos: (x: number, y: number) => void;
  setWastePercent: (v: number) => void;
  setSnap: (v: boolean) => void;
  setWallCut: (v: boolean) => void;
  setSunHour: (v: number) => void;
  setUploadOpen: (v: boolean) => void;
  setPaywallOpen: (v: boolean) => void;
  unlockPro: () => void;
  setPrintVariant: (v: "costs" | "report") => void;
  showToast: (msg: string | null) => void;
  resetView: () => void;
}

const HISTORY_LIMIT = 100;

const initial = getSample(DEFAULT_SAMPLE_ID)!;

function firstWalkStart(plan: FloorplanData, selection: Selection) {
  let room = plan.rooms[0];
  if (selection?.kind === "room") room = plan.rooms.find((r) => r.id === selection.id) ?? room;
  if (room) {
    const p = interiorPoint(room.polygon);
    return { x: p.x, z: p.z };
  }
  const b = planBounds(plan);
  return { x: b.cx, z: b.cz };
}

let furnitureCounter = 0;

export const useStudio = create<StudioState>((set, get) => {
  /** Plan ändern; optional als Undo-Schritt festhalten. */
  const mutate = (fn: (p: FloorplanData) => FloorplanData, record = true) =>
    set((s) => {
      const next = fn(s.plan);
      if (next === s.plan) return {};
      return {
        plan: next,
        past: record ? [...s.past.slice(-(HISTORY_LIMIT - 1)), s.plan] : s.past,
        future: record ? [] : s.future,
      };
    });

  return {
    plan: initial.plan,
    planId: initial.id,
    past: [],
    future: [],

    cameraMode: "orbit",
    tab: "floors",
    activeFloorMaterialId: defaultFloorMaterialId,
    activeWallMaterialId: "white-plaster",
    selection: null,
    hover: null,
    hoverPos: { x: 0, y: 0 },
    wastePercent: 10,
    snap: true,
    wallCut: false,
    sunHour: 14,
    walkStart: firstWalkStart(initial.plan, null),
    viewNonce: 0,

    pro: false,
    uploadOpen: false,
    paywallOpen: false,
    printVariant: "costs",
    toast: null,

    loadPlan: (plan, id) =>
      set((s) => ({
        plan,
        planId: id,
        past: [],
        future: [],
        selection: null,
        hover: null,
        walkStart: firstWalkStart(plan, null),
        viewNonce: s.viewNonce + 1,
      })),
    loadSample: (id) => {
      const sample = getSample(id);
      if (sample) get().loadPlan(sample.plan, sample.id);
    },

    setRoomFloor: (roomId, materialId) =>
      mutate((p) => {
        const room = p.rooms.find((r) => r.id === roomId);
        if (!room || room.floorMaterialId === materialId) return p;
        return { ...p, rooms: p.rooms.map((r) => (r.id === roomId ? { ...r, floorMaterialId: materialId } : r)) };
      }),
    setWallMaterial: (wallId, materialId) =>
      mutate((p) => {
        const wall = p.walls.find((w) => w.id === wallId);
        if (!wall || wall.wallMaterialId === materialId) return p;
        return { ...p, walls: p.walls.map((w) => (w.id === wallId ? { ...w, wallMaterialId: materialId } : w)) };
      }),
    applyFloorToAll: (materialId) =>
      mutate((p) =>
        p.rooms.every((r) => r.floorMaterialId === materialId)
          ? p
          : { ...p, rooms: p.rooms.map((r) => ({ ...r, floorMaterialId: materialId })) },
      ),
    applyWallToAll: (materialId) =>
      mutate((p) =>
        p.walls.every((w) => w.wallMaterialId === materialId)
          ? p
          : { ...p, walls: p.walls.map((w) => ({ ...w, wallMaterialId: materialId })) },
      ),

    addFurniture: (catalogId) => {
      const cat = getFurnitureCatalogItem(catalogId);
      if (!cat) return;
      const { plan, selection } = get();
      const room =
        (selection?.kind === "room" ? plan.rooms.find((r) => r.id === selection.id) : undefined) ?? plan.rooms[0];
      const base = room ? interiorPoint(room.polygon) : { x: 0, z: 0 };
      const n = plan.furniture.length % 4;
      const [w, h, d] = cat.dimensions;
      const item: FurnitureItem = {
        id: `f-${Date.now().toString(36)}-${furnitureCounter++}`,
        catalogId,
        name: cat.name,
        position: [Math.round((base.x + n * 0.3) * 10) / 10, h / 2, Math.round((base.z + n * 0.3) * 10) / 10],
        rotationY: 0,
        dimensions: [w, h, d],
      };
      mutate((p) => ({ ...p, furniture: [...p.furniture, item] }));
      set({ selection: { kind: "furniture", id: item.id } });
    },
    beginFurnitureDrag: () =>
      set((s) => ({
        past: [...s.past.slice(-(HISTORY_LIMIT - 1)), s.plan],
        future: [],
      })),
    moveFurniture: (id, x, z) =>
      mutate(
        (p) => ({
          ...p,
          furniture: p.furniture.map((f) => (f.id === id ? { ...f, position: [x, f.position[1], z] } : f)),
        }),
        false,
      ),
    rotateFurniture: (id, delta = Math.PI / 4) =>
      mutate((p) => ({
        ...p,
        furniture: p.furniture.map((f) => {
          if (f.id !== id) return f;
          let r = f.rotationY + delta;
          // auf (-2π, 2π) halten, Rundungsrauschen vermeiden
          r = Math.round(r / (Math.PI / 4)) * (Math.PI / 4);
          if (r > Math.PI * 2 - 1e-6) r -= Math.PI * 2;
          return { ...f, rotationY: r };
        }),
      })),
    deleteFurniture: (id) => {
      mutate((p) => ({ ...p, furniture: p.furniture.filter((f) => f.id !== id) }));
      const sel = get().selection;
      if (sel?.kind === "furniture" && sel.id === id) set({ selection: null });
    },

    undo: () =>
      set((s) => {
        if (s.past.length === 0) return {};
        const prev = s.past[s.past.length - 1];
        return { plan: prev, past: s.past.slice(0, -1), future: [s.plan, ...s.future].slice(0, HISTORY_LIMIT) };
      }),
    redo: () =>
      set((s) => {
        if (s.future.length === 0) return {};
        const [next, ...rest] = s.future;
        return { plan: next, past: [...s.past, s.plan], future: rest };
      }),

    setCameraMode: (m) =>
      set((s) => ({
        cameraMode: m,
        walkStart: m === "walk" ? firstWalkStart(s.plan, s.selection) : s.walkStart,
        viewNonce: s.viewNonce + 1,
      })),
    setTab: (t) => set({ tab: t }),
    setActiveFloorMaterial: (id) => set({ activeFloorMaterialId: id }),
    setActiveWallMaterial: (id) => set({ activeWallMaterialId: id }),
    select: (selection) => set({ selection }),
    setHover: (hover) =>
      set((s) => (s.hover?.id === hover?.id && s.hover?.kind === hover?.kind ? {} : { hover })),
    setHoverPos: (x, y) => set({ hoverPos: { x, y } }),
    setWastePercent: (v) => set({ wastePercent: v }),
    setSnap: (v) => set({ snap: v }),
    setWallCut: (v) => set({ wallCut: v }),
    setSunHour: (v) => set({ sunHour: v }),
    setUploadOpen: (v) => set({ uploadOpen: v }),
    setPaywallOpen: (v) => set({ paywallOpen: v }),
    unlockPro: () => set({ pro: true, paywallOpen: false }),
    setPrintVariant: (v) => set({ printVariant: v }),
    showToast: (toast) => set({ toast }),
    resetView: () => set((s) => ({ viewNonce: s.viewNonce + 1 })),
  };
});

