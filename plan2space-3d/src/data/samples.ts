import type { FloorplanData, Opening, Point2, Wall } from "@/types/floorplan";

const T = 0.15;

const door = (positionRatio: number, width = 0.9): Opening => ({
  type: "door",
  positionRatio,
  width,
  height: 2.1,
  elevation: 0,
});
const win = (positionRatio: number, width = 1.4, height = 1.3, elevation = 0.9): Opening => ({
  type: "window",
  positionRatio,
  width,
  height,
  elevation,
});

const wall = (
  id: string,
  x1: number,
  z1: number,
  x2: number,
  z2: number,
  openings: Opening[] = [],
  wallMaterialId = "white-plaster",
): Wall => ({
  id,
  start: { x: x1, z: z1 },
  end: { x: x2, z: z2 },
  thickness: T,
  wallMaterialId,
  openings,
});

const rect = (x1: number, z1: number, x2: number, z2: number): Point2[] => [
  { x: x1, z: z1 },
  { x: x2, z: z1 },
  { x: x2, z: z2 },
  { x: x1, z: z2 },
];

/* ---------------------------------------------------------------- */
/* 1) 1-Zimmer-Apartment, 8,0 × 4,5 m                                */
/* ---------------------------------------------------------------- */
export const apartment1: FloorplanData = {
  meta: { name: "1-Zimmer-Apartment (36 m²)", ceilingHeightMeters: 2.5, unit: "meters" },
  rooms: [
    { id: "r-living", name: "Wohn-/Schlafraum", polygon: rect(0, 0, 4.6, 4.5), floorMaterialId: "oak-parquet" },
    { id: "r-kitchen", name: "Küche", polygon: rect(4.6, 0, 8, 2.6), floorMaterialId: "ceramic-tile" },
    { id: "r-bath", name: "Bad", polygon: rect(4.6, 2.6, 8, 4.5), floorMaterialId: "ceramic-tile" },
  ],
  walls: [
    wall("w-n1", 0, 0, 4.6, 0, [win(0.75, 1.6, 1.4, 0.8)]),
    wall("w-n2", 4.6, 0, 8, 0, [win(0.5, 1.0)]),
    wall("w-e1", 8, 0, 8, 2.6),
    wall("w-e2", 8, 2.6, 8, 4.5, [win(0.5, 0.6, 0.6, 1.5)]),
    wall("w-s2", 8, 4.5, 4.6, 4.5),
    wall("w-s1", 4.6, 4.5, 0, 4.5, [door(0.13), win(0.62, 1.8, 1.4, 0.8)]),
    wall("w-w", 0, 4.5, 0, 0, [win(0.7, 1.3)]),
    wall("w-d1", 4.6, 0, 4.6, 2.6, [door(0.5, 1.0)]),
    wall("w-d2", 4.6, 2.6, 4.6, 4.5, [door(0.5, 0.8)]),
    wall("w-d3", 4.6, 2.6, 8, 2.6),
  ],
  furniture: [
    { id: "f-bed", catalogId: "bed-double", name: "Doppelbett 180×200", position: [1.1, 0.45, 1.2], rotationY: -Math.PI / 2, dimensions: [2.1, 0.9, 1.9] },
    { id: "f-wardrobe", catalogId: "wardrobe", name: "Kleiderschrank", position: [0.4, 1.1, 3.35], rotationY: Math.PI / 2, dimensions: [2.0, 2.2, 0.6] },
    { id: "f-sofa", catalogId: "sofa-3seat", name: "3-Sitzer Sofa", position: [3.55, 0.425, 1.9], rotationY: -Math.PI / 2, dimensions: [2.2, 0.85, 0.95] },
    { id: "f-desk", catalogId: "desk-setup", name: "Home-Office Schreibtisch", position: [2.3, 0.375, 4.0], rotationY: Math.PI, dimensions: [1.6, 0.75, 0.8] },
    { id: "f-kitchen", catalogId: "kitchen-block", name: "Küchenzeile Standard", position: [6.3, 0.45, 0.4], rotationY: 0, dimensions: [3.0, 0.9, 0.6] },
  ],
};

/* ---------------------------------------------------------------- */
/* 2) 3-Zimmer-Wohnung, 10,0 × 8,0 m                                 */
/* ---------------------------------------------------------------- */
export const apartment3: FloorplanData = {
  meta: { name: "3-Zimmer-Wohnung (80 m²)", ceilingHeightMeters: 2.5, unit: "meters" },
  rooms: [
    { id: "r-living", name: "Wohnzimmer", polygon: rect(0, 0, 5.6, 4.5), floorMaterialId: "oak-parquet" },
    { id: "r-kitchen", name: "Küche", polygon: rect(5.6, 0, 10, 4.5), floorMaterialId: "ceramic-tile" },
    { id: "r-bed", name: "Schlafzimmer", polygon: rect(0, 4.5, 3.8, 8), floorMaterialId: "carpet-warm" },
    { id: "r-bath", name: "Bad", polygon: rect(3.8, 4.5, 5.6, 8), floorMaterialId: "ceramic-tile" },
    { id: "r-hall", name: "Flur", polygon: rect(5.6, 4.5, 7.6, 8), floorMaterialId: "concrete-loft" },
    { id: "r-office", name: "Arbeitszimmer", polygon: rect(7.6, 4.5, 10, 8), floorMaterialId: "oak-parquet" },
  ],
  walls: [
    // Nord
    wall("w-n1", 0, 0, 5.6, 0, [win(0.28, 1.4, 1.4, 0.8), win(0.72, 1.4, 1.4, 0.8)]),
    wall("w-n2", 5.6, 0, 10, 0, [win(0.5, 1.2, 1.2, 1.0)]),
    // Ost
    wall("w-e1", 10, 0, 10, 4.5, [win(0.5, 1.2, 1.3, 0.9)]),
    wall("w-e2", 10, 4.5, 10, 8, [win(0.5, 1.4, 1.4, 0.8)]),
    // Süd
    wall("w-s1", 10, 8, 7.6, 8, [win(0.5, 1.4, 1.4, 0.8)]),
    wall("w-s2", 7.6, 8, 5.6, 8, [door(0.5, 1.0)]),
    wall("w-s3", 5.6, 8, 3.8, 8, [win(0.5, 0.6, 0.6, 1.5)]),
    wall("w-s4", 3.8, 8, 0, 8, [win(0.5, 1.6, 1.4, 0.8)]),
    // West
    wall("w-w1", 0, 8, 0, 4.5, [win(0.5, 1.2, 1.3, 0.9)]),
    wall("w-w2", 0, 4.5, 0, 0, [win(0.5, 1.4, 1.4, 0.8)]),
    // Innenwand z = 4,5
    wall("w-i1", 0, 4.5, 3.8, 4.5, [door(0.5)]),
    wall("w-i2", 3.8, 4.5, 5.6, 4.5),
    wall("w-i3", 5.6, 4.5, 7.6, 4.5, [door(0.5)]),
    wall("w-i4", 7.6, 4.5, 10, 4.5),
    // Innenwände vertikal
    wall("w-v1", 5.6, 0, 5.6, 4.5, [door(0.55, 1.6)]),
    wall("w-v2", 3.8, 4.5, 3.8, 8),
    wall("w-v3", 5.6, 4.5, 5.6, 8, [door(0.5, 0.8)]),
    wall("w-v4", 7.6, 4.5, 7.6, 8, [door(0.5)]),
  ],
  furniture: [
    { id: "f-sofa", catalogId: "sofa-3seat", name: "3-Sitzer Sofa", position: [4.0, 0.425, 3.9], rotationY: Math.PI, dimensions: [2.2, 0.85, 0.95] },
    { id: "f-table", catalogId: "dining-table", name: "Esstisch (6 Personen)", position: [2.9, 0.38, 1.6], rotationY: 0, dimensions: [1.8, 0.76, 0.9] },
    { id: "f-kitchen", catalogId: "kitchen-block", name: "Küchenzeile Standard", position: [7.9, 0.45, 0.4], rotationY: 0, dimensions: [3.0, 0.9, 0.6] },
    { id: "f-bed", catalogId: "bed-double", name: "Doppelbett 180×200", position: [1.2, 0.45, 6.3], rotationY: 0, dimensions: [2.1, 0.9, 1.9] },
    { id: "f-wardrobe", catalogId: "wardrobe", name: "Kleiderschrank", position: [3.425, 1.1, 6.2], rotationY: -Math.PI / 2, dimensions: [2.0, 2.2, 0.6] },
    { id: "f-desk", catalogId: "desk-setup", name: "Home-Office Schreibtisch", position: [9.5, 0.375, 6.2], rotationY: -Math.PI / 2, dimensions: [1.6, 0.75, 0.8] },
  ],
};

/* ---------------------------------------------------------------- */
/* 3) Offenes Loft, 14,0 × 8,0 m (L-förmiger Hauptraum)              */
/* ---------------------------------------------------------------- */
export const loft: FloorplanData = {
  meta: { name: "Offenes Loft (92 m² + Nebenräume)", ceilingHeightMeters: 3.2, unit: "meters" },
  rooms: [
    {
      id: "r-loft",
      name: "Loft (Wohnen & Kochen)",
      polygon: [
        { x: 0, z: 0 },
        { x: 14, z: 0 },
        { x: 14, z: 4 },
        { x: 9, z: 4 },
        { x: 9, z: 8 },
        { x: 0, z: 8 },
      ],
      floorMaterialId: "concrete-loft",
    },
    { id: "r-bed", name: "Schlafzimmer", polygon: rect(9, 4, 12, 8), floorMaterialId: "oak-parquet" },
    { id: "r-bath", name: "Bad", polygon: rect(12, 4, 14, 8), floorMaterialId: "ceramic-tile" },
  ],
  walls: [
    wall("w-n", 0, 0, 14, 0, [win(0.2, 2.4, 1.8, 0.9), win(0.5, 2.4, 1.8, 0.9), win(0.8, 2.4, 1.6, 1.0)], "exposed-brick"),
    wall("w-e1", 14, 0, 14, 4, [win(0.5, 2.0, 1.8, 0.9)], "exposed-brick"),
    wall("w-e2", 14, 4, 14, 8, [win(0.5, 0.7, 0.6, 1.8)]),
    wall("w-s1", 14, 8, 12, 8),
    wall("w-s2", 12, 8, 9, 8, [win(0.5, 1.4, 1.5, 0.9)]),
    wall("w-s3", 9, 8, 0, 8, [door(0.06, 1.0), win(0.35, 2.2, 1.8, 0.9), win(0.7, 2.2, 1.8, 0.9)], "exposed-brick"),
    wall("w-w", 0, 8, 0, 0, [win(0.3, 2.0, 1.8, 0.9), win(0.7, 2.0, 1.8, 0.9)], "exposed-brick"),
    wall("w-i1", 9, 4, 12, 4),
    wall("w-i2", 12, 4, 14, 4),
    wall("w-i3", 9, 4, 9, 8, [door(0.15)], "acoustic-wood"),
    wall("w-i4", 12, 4, 12, 8, [door(0.35, 0.8)]),
  ],
  furniture: [
    { id: "f-kitchen", catalogId: "kitchen-block", name: "Küchenzeile Standard", position: [11.6, 0.45, 0.4], rotationY: 0, dimensions: [3.0, 0.9, 0.6] },
    { id: "f-table", catalogId: "dining-table", name: "Esstisch (6 Personen)", position: [11.0, 0.38, 2.3], rotationY: 0, dimensions: [1.8, 0.76, 0.9] },
    { id: "f-sofa", catalogId: "sofa-3seat", name: "3-Sitzer Sofa", position: [4.2, 0.425, 5.3], rotationY: Math.PI, dimensions: [2.2, 0.85, 0.95] },
    { id: "f-desk", catalogId: "desk-setup", name: "Home-Office Schreibtisch", position: [2.2, 0.375, 7.5], rotationY: Math.PI, dimensions: [1.6, 0.75, 0.8] },
    { id: "f-bed", catalogId: "bed-double", name: "Doppelbett 180×200", position: [10.2, 0.45, 6.0], rotationY: 0, dimensions: [2.1, 0.9, 1.9] },
    { id: "f-wardrobe", catalogId: "wardrobe", name: "Kleiderschrank", position: [10.9, 1.1, 7.675], rotationY: Math.PI, dimensions: [2.0, 2.2, 0.6] },
  ],
};

export interface SamplePlan {
  id: string;
  label: string;
  plan: FloorplanData;
}

export const samplePlans: SamplePlan[] = [
  { id: "apartment-3", label: "3-Zimmer-Wohnung", plan: apartment3 },
  { id: "apartment-1", label: "1-Zimmer-Apartment", plan: apartment1 },
  { id: "loft", label: "Offenes Loft", plan: loft },
];

export const DEFAULT_SAMPLE_ID = "apartment-3";

export function getSample(id: string): SamplePlan | undefined {
  return samplePlans.find((s) => s.id === id);
}
