import { floorMaterials, wallMaterials } from "@/data/catalog";
import {
  DEFAULT_CEILING_HEIGHT,
  DEFAULT_WALL_THICKNESS,
  type FloorplanData,
  type Opening,
  type Point2,
  type Room,
  type Wall,
} from "@/types/floorplan";

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null;
const num = (v: unknown, fallback: number) => (typeof v === "number" && Number.isFinite(v) ? v : fallback);
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

function point(v: unknown): Point2 | null {
  if (!isObj(v)) return null;
  const x = v.x;
  const z = v.z;
  if (typeof x !== "number" || typeof z !== "number" || !Number.isFinite(x) || !Number.isFinite(z)) return null;
  return { x, z };
}

/**
 * Prüft und normalisiert das (KI-)JSON strikt gegen das FloorplanData-Schema.
 * Wirft einen Error mit verständlicher Meldung, wenn nichts Brauchbares enthalten ist.
 */
export function normalizeFloorplan(raw: unknown): FloorplanData {
  if (!isObj(raw)) throw new Error("Antwort ist kein JSON-Objekt.");

  const meta = isObj(raw.meta) ? raw.meta : {};
  const ceiling = clamp(num(meta.ceilingHeightMeters, DEFAULT_CEILING_HEIGHT), 2.0, 4.5);

  const floorIds = new Set(floorMaterials.map((m) => m.id));
  const wallIds = new Set(wallMaterials.map((m) => m.id));

  const rooms: Room[] = [];
  const rawRooms = Array.isArray(raw.rooms) ? raw.rooms : [];
  rawRooms.forEach((r, i) => {
    if (!isObj(r) || !Array.isArray(r.polygon)) return;
    const polygon = r.polygon.map(point).filter((p): p is Point2 => p !== null);
    if (polygon.length < 3) return;
    const fm = typeof r.floorMaterialId === "string" && floorIds.has(r.floorMaterialId) ? r.floorMaterialId : "oak-parquet";
    rooms.push({
      id: typeof r.id === "string" && r.id ? r.id : `room-${i + 1}`,
      name: typeof r.name === "string" && r.name ? r.name : `Raum ${i + 1}`,
      polygon,
      floorMaterialId: fm,
    });
  });
  if (rooms.length === 0) throw new Error("Es wurden keine gültigen Räume erkannt.");

  const walls: Wall[] = [];
  const rawWalls = Array.isArray(raw.walls) ? raw.walls : [];
  rawWalls.forEach((w, i) => {
    if (!isObj(w)) return;
    const start = point(w.start);
    const end = point(w.end);
    if (!start || !end || Math.hypot(end.x - start.x, end.z - start.z) < 0.2) return;
    const L = Math.hypot(end.x - start.x, end.z - start.z);
    const openings: Opening[] = [];
    (Array.isArray(w.openings) ? w.openings : []).forEach((o) => {
      if (!isObj(o)) return;
      const type = o.type === "window" ? "window" : o.type === "door" ? "door" : null;
      if (!type) return;
      const width = clamp(num(o.width, type === "door" ? 0.9 : 1.2), 0.4, Math.max(0.5, L - 0.1));
      const elevation = type === "door" ? 0 : clamp(num(o.elevation, 0.9), 0, ceiling - 0.5);
      const height = clamp(num(o.height, type === "door" ? 2.1 : 1.3), 0.3, ceiling - elevation - 0.05);
      openings.push({
        type,
        positionRatio: clamp(num(o.positionRatio, 0.5), 0.05, 0.95),
        width,
        height,
        elevation,
      });
    });
    walls.push({
      id: typeof w.id === "string" && w.id ? w.id : `wall-${i + 1}`,
      start,
      end,
      thickness: clamp(num(w.thickness, DEFAULT_WALL_THICKNESS), 0.05, 0.5),
      wallMaterialId:
        typeof w.wallMaterialId === "string" && wallIds.has(w.wallMaterialId) ? w.wallMaterialId : "white-plaster",
      openings,
    });
  });
  if (walls.length === 0) throw new Error("Es wurden keine gültigen Wände erkannt.");

  // IDs eindeutig machen
  const dedupe = <T extends { id: string }>(list: T[]) => {
    const seen = new Set<string>();
    list.forEach((item, i) => {
      if (seen.has(item.id)) item.id = `${item.id}-${i}`;
      seen.add(item.id);
    });
  };
  dedupe(rooms);
  dedupe(walls);

  return {
    meta: {
      name: typeof meta.name === "string" && meta.name ? meta.name : "Hochgeladener Grundriss",
      ceilingHeightMeters: ceiling,
      unit: "meters",
    },
    rooms,
    walls,
    furniture: [],
  };
}

/** Extrahiert das erste JSON-Objekt aus einer Modell-Antwort (auch mit ```json-Zäunen). */
export function extractJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const body = fenced ? fenced[1] : text;
  const start = body.indexOf("{");
  const end = body.lastIndexOf("}");
  if (start === -1 || end <= start) throw new Error("Kein JSON in der Modell-Antwort gefunden.");
  return JSON.parse(body.slice(start, end + 1));
}
