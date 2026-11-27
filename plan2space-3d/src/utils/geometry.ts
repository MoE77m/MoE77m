import type { FloorplanData, Opening, Point2, Wall } from "@/types/floorplan";

export function wallLength(w: Wall): number {
  return Math.hypot(w.end.x - w.start.x, w.end.z - w.start.z);
}

export function polygonBounds(poly: Point2[]) {
  let minX = Infinity;
  let maxX = -Infinity;
  let minZ = Infinity;
  let maxZ = -Infinity;
  for (const p of poly) {
    minX = Math.min(minX, p.x);
    maxX = Math.max(maxX, p.x);
    minZ = Math.min(minZ, p.z);
    maxZ = Math.max(maxZ, p.z);
  }
  return { minX, maxX, minZ, maxZ, width: maxX - minX, depth: maxZ - minZ };
}

/** Ray-Casting Punkt-in-Polygon. */
export function pointInPolygon(p: Point2, poly: Point2[]): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i];
    const b = poly[j];
    const intersects =
      a.z > p.z !== b.z > p.z && p.x < ((b.x - a.x) * (p.z - a.z)) / (b.z - a.z) + a.x;
    if (intersects) inside = !inside;
  }
  return inside;
}

/** Flächenschwerpunkt (Fallback: Mittel der Eckpunkte). */
export function polygonCentroid(poly: Point2[]): Point2 {
  let a = 0;
  let cx = 0;
  let cz = 0;
  for (let i = 0; i < poly.length; i++) {
    const p = poly[i];
    const q = poly[(i + 1) % poly.length];
    const cross = p.x * q.z - q.x * p.z;
    a += cross;
    cx += (p.x + q.x) * cross;
    cz += (p.z + q.z) * cross;
  }
  if (Math.abs(a) < 1e-9) {
    const n = Math.max(poly.length, 1);
    return {
      x: poly.reduce((s, p) => s + p.x, 0) / n,
      z: poly.reduce((s, p) => s + p.z, 0) / n,
    };
  }
  return { x: cx / (3 * a), z: cz / (3 * a) };
}

/** Ein garantiert im Polygon liegender Punkt (Schwerpunkt, sonst Gitter-Suche). */
export function interiorPoint(poly: Point2[]): Point2 {
  const c = polygonCentroid(poly);
  if (pointInPolygon(c, poly)) return c;
  const b = polygonBounds(poly);
  let best: Point2 = c;
  let bestD = Infinity;
  const steps = 24;
  for (let i = 0; i <= steps; i++) {
    for (let j = 0; j <= steps; j++) {
      const p = { x: b.minX + (b.width * i) / steps, z: b.minZ + (b.depth * j) / steps };
      if (!pointInPolygon(p, poly)) continue;
      const d = Math.hypot(p.x - c.x, p.z - c.z);
      if (d < bestD) {
        bestD = d;
        best = p;
      }
    }
  }
  return best;
}

export function planBounds(plan: FloorplanData) {
  const pts: Point2[] = [];
  plan.rooms.forEach((r) => pts.push(...r.polygon));
  plan.walls.forEach((w) => pts.push(w.start, w.end));
  if (pts.length === 0) pts.push({ x: 0, z: 0 }, { x: 5, z: 5 });
  const b = polygonBounds(pts);
  return {
    ...b,
    cx: (b.minX + b.maxX) / 2,
    cz: (b.minZ + b.maxZ) / 2,
    span: Math.max(b.width, b.depth, 1),
  };
}

export function snapValue(v: number, step: number): number {
  return Math.round(v / step) * step;
}

/* ------------------------------------------------------------------ */
/* Wände mit echten Aussparungen                                       */
/* ------------------------------------------------------------------ */

export interface ResolvedOpening {
  opening: Opening;
  /** Start/Ende entlang der Wand in m. */
  a: number;
  b: number;
  bottom: number;
  top: number;
}

/** Öffnungen auf die Wand begrenzen, sortieren, Überlappungen entfernen. */
export function resolveOpenings(wall: Wall, wallHeight: number): ResolvedOpening[] {
  const L = wallLength(wall);
  const list: ResolvedOpening[] = [];
  for (const opening of wall.openings) {
    const c = opening.positionRatio * L;
    const a = Math.max(c - opening.width / 2, 0.02);
    const b = Math.min(c + opening.width / 2, L - 0.02);
    const bottom = Math.max(0, opening.elevation);
    const top = Math.min(wallHeight, opening.elevation + opening.height);
    if (b - a > 0.05 && top - bottom > 0.05) list.push({ opening, a, b, bottom, top });
  }
  list.sort((p, q) => p.a - q.a);
  const out: ResolvedOpening[] = [];
  let cursor = -Infinity;
  for (const o of list) {
    if (o.a < cursor) continue; // überlappt vorherige Öffnung
    out.push(o);
    cursor = o.b;
  }
  return out;
}

export interface WallBox {
  u0: number;
  u1: number;
  y0: number;
  y1: number;
}

/**
 * Zerlegt eine Wand in echte Quader (links/rechts, über und unter den Öffnungen).
 * u ist die Koordinate entlang der Wand; die Wand wird an beiden Enden um `extend`
 * verlängert, damit Ecken geschlossen sind.
 */
export function buildWallBoxes(wall: Wall, height: number, extend = wall.thickness / 2): WallBox[] {
  const L = wallLength(wall);
  const ops = resolveOpenings(wall, height);
  const boxes: WallBox[] = [];
  let cursor = -extend;
  for (const o of ops) {
    if (o.a - cursor > 0.001) boxes.push({ u0: cursor, u1: o.a, y0: 0, y1: height });
    if (o.bottom > 0.001) boxes.push({ u0: o.a, u1: o.b, y0: 0, y1: o.bottom });
    if (o.top < height - 0.001) boxes.push({ u0: o.a, u1: o.b, y0: o.top, y1: height });
    cursor = o.b;
  }
  if (L + extend - cursor > 0.001) boxes.push({ u0: cursor, u1: L + extend, y0: 0, y1: height });
  return boxes;
}

/* ------------------------------------------------------------------ */
/* Kollision für den Ego-Modus                                         */
/* ------------------------------------------------------------------ */

export interface Blocker {
  x1: number;
  z1: number;
  x2: number;
  z2: number;
  half: number;
}

/** Wandsegmente, die den Weg blockieren (Türöffnungen sind passierbar, Fenster nicht). */
export function wallBlockers(plan: FloorplanData): Blocker[] {
  const out: Blocker[] = [];
  for (const wall of plan.walls) {
    const L = wallLength(wall);
    if (L < 1e-6) continue;
    const dx = (wall.end.x - wall.start.x) / L;
    const dz = (wall.end.z - wall.start.z) / L;
    const gaps = resolveOpenings(wall, plan.meta.ceilingHeightMeters)
      .filter((o) => o.opening.type === "door" && o.bottom < 0.05)
      .map((o) => [o.a, o.b] as const);
    let cursor = 0;
    const push = (u0: number, u1: number) => {
      if (u1 - u0 < 0.01) return;
      out.push({
        x1: wall.start.x + dx * u0,
        z1: wall.start.z + dz * u0,
        x2: wall.start.x + dx * u1,
        z2: wall.start.z + dz * u1,
        half: wall.thickness / 2,
      });
    };
    for (const [a, b] of gaps) {
      push(cursor, a);
      cursor = b;
    }
    push(cursor, L);
  }
  return out;
}

/** Schiebt einen Kreis (Radius r) aus allen Blockern heraus. */
export function resolveCollision(pos: Point2, blockers: Blocker[], radius: number): Point2 {
  let x = pos.x;
  let z = pos.z;
  for (let pass = 0; pass < 3; pass++) {
    for (const s of blockers) {
      const sx = s.x2 - s.x1;
      const sz = s.z2 - s.z1;
      const len2 = sx * sx + sz * sz || 1;
      const t = Math.max(0, Math.min(1, ((x - s.x1) * sx + (z - s.z1) * sz) / len2));
      const cx = s.x1 + sx * t;
      const cz = s.z1 + sz * t;
      const d = Math.hypot(x - cx, z - cz);
      const min = radius + s.half;
      if (d < min) {
        if (d > 1e-6) {
          x = cx + ((x - cx) / d) * min;
          z = cz + ((z - cz) / d) * min;
        } else {
          // exakt auf der Wandachse: senkrecht herausschieben
          const nl = Math.hypot(sx, sz) || 1;
          x += (-sz / nl) * min;
          z += (sx / nl) * min;
        }
      }
    }
  }
  return { x, z };
}
