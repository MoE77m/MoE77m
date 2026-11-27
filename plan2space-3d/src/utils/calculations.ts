import { getFloorMaterial, getWallMaterial } from "@/data/catalog";
import type { FloorplanData, Point2, Wall } from "@/types/floorplan";
import { pointInPolygon, polygonCentroid, wallLength } from "@/utils/geometry";

/* ------------------------------------------------------------------ */
/* Flächen                                                             */
/* ------------------------------------------------------------------ */

/** Polygonfläche in m² nach der Gaußschen Trapezformel (Shoelace), orientierungsunabhängig. */
export function polygonArea(poly: Point2[]): number {
  if (poly.length < 3) return 0;
  let sum = 0;
  for (let i = 0; i < poly.length; i++) {
    const p = poly[i];
    const q = poly[(i + 1) % poly.length];
    sum += p.x * q.z - q.x * p.z;
  }
  return Math.abs(sum) / 2;
}

/** Fläche aller Türen und Fenster einer Wand in m² (auf Wandmaße begrenzt). */
export function openingsArea(wall: Wall, ceilingHeight: number): number {
  const L = wallLength(wall);
  let area = 0;
  for (const o of wall.openings) {
    const w = Math.max(0, Math.min(o.width, L));
    const h = Math.max(0, Math.min(o.height, ceilingHeight - Math.max(0, o.elevation)));
    area += w * h;
  }
  return area;
}

/** Netto-Wandfläche EINER Seite: (Länge × Höhe) − Türen/Fenster. */
export function wallNetArea(wall: Wall, ceilingHeight: number): number {
  return Math.max(0, wallLength(wall) * ceilingHeight - openingsArea(wall, ceilingHeight));
}

/* ------------------------------------------------------------------ */
/* Zuordnung Wandseiten → Räume                                        */
/* ------------------------------------------------------------------ */

export interface SideShare {
  roomId: string;
  /** Anteil (0–1) EINER Wandseite, der an diesen Raum grenzt. */
  fraction: number;
}

const SAMPLES = 9;

/**
 * Ordnet beide Seiten einer Wand den angrenzenden Räumen zu (per Stichproben
 * entlang der Wand, leicht seitlich versetzt). Innenwände zählen daher für beide
 * Räume, Außenwände nur für die Innenseite. Wände ohne Raumkontakt werden dem
 * nächstgelegenen Raum (eine Seite) zugeschlagen.
 */
export function wallSideShares(plan: FloorplanData, wall: Wall): SideShare[] {
  const L = wallLength(wall);
  if (L < 1e-6 || plan.rooms.length === 0) return [];
  const dx = (wall.end.x - wall.start.x) / L;
  const dz = (wall.end.z - wall.start.z) / L;
  const nx = -dz;
  const nz = dx;
  const offset = wall.thickness / 2 + 0.06;

  const counts = new Map<string, number>();
  let hits = 0;
  for (let i = 0; i < SAMPLES; i++) {
    const t = (i + 0.5) / SAMPLES;
    const px = wall.start.x + dx * L * t;
    const pz = wall.start.z + dz * L * t;
    for (const side of [1, -1]) {
      const q = { x: px + nx * offset * side, z: pz + nz * offset * side };
      const room = plan.rooms.find((r) => pointInPolygon(q, r.polygon));
      if (room) {
        counts.set(room.id, (counts.get(room.id) ?? 0) + 1);
        hits++;
      }
    }
  }

  if (hits === 0) {
    const mid = { x: (wall.start.x + wall.end.x) / 2, z: (wall.start.z + wall.end.z) / 2 };
    let best = plan.rooms[0];
    let bestD = Infinity;
    for (const r of plan.rooms) {
      const c = polygonCentroid(r.polygon);
      const d = Math.hypot(c.x - mid.x, c.z - mid.z);
      if (d < bestD) {
        bestD = d;
        best = r;
      }
    }
    return [{ roomId: best.id, fraction: 1 }];
  }

  return [...counts.entries()].map(([roomId, c]) => ({ roomId, fraction: c / SAMPLES }));
}

/** Infos für Tooltips. */
export function wallInfo(plan: FloorplanData, wall: Wall) {
  const shares = wallSideShares(plan, wall);
  const names = shares
    .map((s) => plan.rooms.find((r) => r.id === s.roomId)?.name)
    .filter((n): n is string => Boolean(n));
  return {
    length: wallLength(wall),
    netAreaOneSide: wallNetArea(wall, plan.meta.ceilingHeightMeters),
    roomNames: names,
  };
}

/* ------------------------------------------------------------------ */
/* Budget                                                              */
/* ------------------------------------------------------------------ */

export interface RoomBudget {
  roomId: string;
  name: string;
  floorMaterialId: string;
  floorArea: number;
  wallArea: number;
  floorCost: number;
  wallCost: number;
  subtotal: number;
}

export interface MaterialLine {
  materialId: string;
  name: string;
  kind: "floor" | "wall";
  pricePerM2: number;
  areaNet: number;
  areaWithWaste: number;
  cost: number;
}

export interface Budget {
  rooms: RoomBudget[];
  materials: MaterialLine[];
  floorArea: number;
  wallArea: number;
  floorCost: number;
  wallCost: number;
  netCost: number;
  wastePercent: number;
  wasteCost: number;
  totalCost: number;
}

export function computeBudget(plan: FloorplanData, wastePercent: number): Budget {
  const H = plan.meta.ceilingHeightMeters;
  const waste = Math.max(0, wastePercent);

  const rooms: RoomBudget[] = plan.rooms.map((r) => {
    const mat = getFloorMaterial(r.floorMaterialId);
    const floorArea = polygonArea(r.polygon);
    return {
      roomId: r.id,
      name: r.name,
      floorMaterialId: mat.id,
      floorArea,
      wallArea: 0,
      floorCost: floorArea * mat.pricePerM2,
      wallCost: 0,
      subtotal: 0,
    };
  });
  const byId = new Map(rooms.map((r) => [r.roomId, r]));

  const matAreas = new Map<string, { kind: "floor" | "wall"; area: number }>();
  const addMat = (id: string, kind: "floor" | "wall", area: number) => {
    const key = `${kind}:${id}`;
    const cur = matAreas.get(key) ?? { kind, area: 0 };
    cur.area += area;
    matAreas.set(key, cur);
  };

  for (const r of rooms) addMat(r.floorMaterialId, "floor", r.floorArea);

  for (const wall of plan.walls) {
    const mat = getWallMaterial(wall.wallMaterialId);
    const net = wallNetArea(wall, H);
    for (const share of wallSideShares(plan, wall)) {
      const room = byId.get(share.roomId);
      if (!room) continue;
      const area = net * share.fraction;
      room.wallArea += area;
      room.wallCost += area * mat.pricePerM2;
      addMat(mat.id, "wall", area);
    }
  }

  for (const r of rooms) r.subtotal = r.floorCost + r.wallCost;

  const floorArea = rooms.reduce((s, r) => s + r.floorArea, 0);
  const wallArea = rooms.reduce((s, r) => s + r.wallArea, 0);
  const floorCost = rooms.reduce((s, r) => s + r.floorCost, 0);
  const wallCost = rooms.reduce((s, r) => s + r.wallCost, 0);
  const netCost = floorCost + wallCost;
  const wasteCost = netCost * (waste / 100);

  const materials: MaterialLine[] = [...matAreas.entries()].map(([key, v]) => {
    const id = key.slice(key.indexOf(":") + 1);
    const mat = v.kind === "floor" ? getFloorMaterial(id) : getWallMaterial(id);
    const areaWithWaste = v.area * (1 + waste / 100);
    return {
      materialId: mat.id,
      name: mat.name,
      kind: v.kind,
      pricePerM2: mat.pricePerM2,
      areaNet: v.area,
      areaWithWaste,
      cost: areaWithWaste * mat.pricePerM2,
    };
  });
  materials.sort((a, b) => (a.kind === b.kind ? b.cost - a.cost : a.kind === "floor" ? -1 : 1));

  return {
    rooms,
    materials,
    floorArea,
    wallArea,
    floorCost,
    wallCost,
    netCost,
    wastePercent: waste,
    wasteCost,
    totalCost: netCost + wasteCost,
  };
}
