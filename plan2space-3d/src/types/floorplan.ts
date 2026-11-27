/**
 * Zentrales, deterministisches Datenmodell für Grundrisse.
 * Alle Maße in Metern. Koordinatensystem: x = Osten (rechts), z = Süden (im Plan nach unten), y = oben.
 */

export interface Point2 {
  x: number;
  z: number;
}

export type OpeningType = "door" | "window";

export interface Opening {
  type: OpeningType;
  /** Position der Öffnungsmitte entlang der Wand: 0 (Start) bis 1 (Ende). */
  positionRatio: number;
  width: number;
  height: number;
  /** Brüstungshöhe: Abstand Unterkante Öffnung zum Boden (Türen: 0). */
  elevation: number;
}

export interface Wall {
  id: string;
  start: Point2;
  end: Point2;
  /** Wandstärke in m (Standard 0.15). */
  thickness: number;
  wallMaterialId: string;
  openings: Opening[];
}

export interface Room {
  id: string;
  name: string;
  /** Eckpunkte (Wandmitte) im Umlauf, in Metern. */
  polygon: Point2[];
  floorMaterialId: string;
}

export interface FurnitureItem {
  id: string;
  catalogId: string;
  name: string;
  /** Mittelpunkt [x, y, z] – y ist die halbe Höhe (Möbel stehen auf dem Boden). */
  position: [number, number, number];
  /** Drehung um die Hochachse in Radiant. */
  rotationY: number;
  /** [Breite (x), Höhe (y), Tiefe (z)] in Metern. */
  dimensions: [number, number, number];
}

export interface FloorplanMeta {
  name: string;
  ceilingHeightMeters: number;
  unit: "meters";
}

export interface FloorplanData {
  meta: FloorplanMeta;
  rooms: Room[];
  walls: Wall[];
  furniture: FurnitureItem[];
}

export type CameraMode = "orbit" | "top" | "walk";
export type SidebarTab = "floors" | "walls" | "furniture";

export type Selection =
  | { kind: "room"; id: string }
  | { kind: "wall"; id: string }
  | { kind: "furniture"; id: string }
  | null;

export const DEFAULT_CEILING_HEIGHT = 2.5;
export const DEFAULT_WALL_THICKNESS = 0.15;
