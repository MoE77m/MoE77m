/**
 * Material- & Preiskatalog (deutsche Richtwerte, € pro m² inkl. Material + geschätzter Verlegung).
 * Alle Texturen werden prozedural per Canvas erzeugt (siehe utils/textures.ts) – keine externen Bilder.
 */

export interface SurfaceMaterial {
  id: string;
  name: string;
  description: string;
  /** € pro m² inkl. Material und Verlegung. */
  pricePerM2: number;
  /** Basisfarbe (Fallback + Swatch-Hintergrund). */
  color: string;
  /** Kantenlänge einer Textur-Kachel in Metern (für maßstabsgetreue UVs). */
  tileSizeM: number;
  roughness: number;
  metalness: number;
}

export const floorMaterials: SurfaceMaterial[] = [
  {
    id: "oak-parquet",
    name: "Eichenparkett Natur",
    description: "Warmer Holzton, Maserung, Dielenverband",
    pricePerM2: 68,
    color: "#b98a56",
    tileSizeM: 1.2,
    roughness: 0.55,
    metalness: 0,
  },
  {
    id: "concrete-loft",
    name: "Sichtbeton / Mikrozement",
    description: "Kühles Grau, fugenlos, Industrial-Look",
    pricePerM2: 85,
    color: "#8e9195",
    tileSizeM: 2.0,
    roughness: 0.6,
    metalness: 0.05,
  },
  {
    id: "ceramic-tile",
    name: "Feinsteinzeug Anthrazit",
    description: "Dunkle Fliese 60×60 cm mit Fuge",
    pricePerM2: 54,
    color: "#3b3e43",
    tileSizeM: 1.2,
    roughness: 0.3,
    metalness: 0.05,
  },
  {
    id: "carpet-warm",
    name: "Teppichboden Sandbeige",
    description: "Weiche Textur, warm und leise",
    pricePerM2: 32,
    color: "#cdb592",
    tileSizeM: 1.0,
    roughness: 1,
    metalness: 0,
  },
];

export const wallMaterials: SurfaceMaterial[] = [
  {
    id: "white-plaster",
    name: "Alpinaweiß Glattputz",
    description: "Klassisch hell, matt",
    pricePerM2: 14,
    color: "#f3f1ec",
    tileSizeM: 1.5,
    roughness: 0.95,
    metalness: 0,
  },
  {
    id: "sage-green",
    name: "Salbeigrün Matt",
    description: "Ruhige Wandfarbe, tiefmatt",
    pricePerM2: 18,
    color: "#9fb396",
    tileSizeM: 1.5,
    roughness: 0.95,
    metalness: 0,
  },
  {
    id: "acoustic-wood",
    name: "Akustikpaneele Eiche/Filz",
    description: "Holzlamellen auf Filz, schallabsorbierend",
    pricePerM2: 89,
    color: "#c79f6a",
    tileSizeM: 0.6,
    roughness: 0.7,
    metalness: 0,
  },
  {
    id: "exposed-brick",
    name: "Klinker-Optik Industrial",
    description: "Riemchen im Läuferverband",
    pricePerM2: 65,
    color: "#9c4f38",
    tileSizeM: 0.75,
    roughness: 0.9,
    metalness: 0,
  },
];

export interface FurnitureCatalogItem {
  id: string;
  name: string;
  /** [Breite (x), Höhe (y), Tiefe (z)] in Metern. */
  dimensions: [number, number, number];
  color: string;
}

export const furnitureCatalog: FurnitureCatalogItem[] = [
  { id: "sofa-3seat", name: "3-Sitzer Sofa", dimensions: [2.2, 0.85, 0.95], color: "#5b6b8c" },
  { id: "bed-double", name: "Doppelbett 180×200", dimensions: [2.1, 0.9, 1.9], color: "#d9d4cc" },
  { id: "dining-table", name: "Esstisch (6 Personen)", dimensions: [1.8, 0.76, 0.9], color: "#a67c52" },
  { id: "kitchen-block", name: "Küchenzeile Standard", dimensions: [3.0, 0.9, 0.6], color: "#e8e6e1" },
  { id: "wardrobe", name: "Kleiderschrank", dimensions: [2.0, 2.2, 0.6], color: "#d8d3c8" },
  { id: "desk-setup", name: "Home-Office Schreibtisch", dimensions: [1.6, 0.75, 0.8], color: "#8d6b4a" },
];

export const defaultFloorMaterialId = "oak-parquet";
export const defaultWallMaterialId = "white-plaster";

export function getFloorMaterial(id: string): SurfaceMaterial {
  return floorMaterials.find((m) => m.id === id) ?? floorMaterials[0];
}

export function getWallMaterial(id: string): SurfaceMaterial {
  return wallMaterials.find((m) => m.id === id) ?? wallMaterials[0];
}

export function getSurfaceMaterial(id: string): SurfaceMaterial {
  return (
    floorMaterials.find((m) => m.id === id) ??
    wallMaterials.find((m) => m.id === id) ??
    floorMaterials[0]
  );
}

export function getFurnitureCatalogItem(id: string): FurnitureCatalogItem | undefined {
  return furnitureCatalog.find((f) => f.id === id);
}
