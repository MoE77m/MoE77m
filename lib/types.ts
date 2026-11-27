export interface NavLink {
  label: string;
  href: `#${string}`;
}

/** Röstgrad auf einer Skala von 1 (sehr hell) bis 5 (dunkel). */
export type RoastLevel = 1 | 2 | 3 | 4 | 5;

export interface RoastItem {
  id: string;
  name: string;
  /** Varietät, z. B. „Heirloom“ oder „Bourbon, Caturra“ */
  variety: string;
  /** Herkunftsregion inkl. Land */
  origin: string;
  process: string;
  altitude: string;
  tastingNotes: string[];
  roastLevel: RoastLevel;
  /** Preis in Euro */
  price: number;
  /** Packungsgröße in Gramm */
  weight: number;
  description: string;
  recommendedFor: string;
  image: {
    src: string;
    alt: string;
  };
}

export type MenuCategory = "Espresso & Milch" | "Filterkaffee" | "Gebäck";

export interface MenuItem {
  name: string;
  description: string;
  /** Preis in Euro */
  price: number;
  category: MenuCategory;
  tag?: string;
}

export interface OpeningHours {
  days: string;
  hours: string;
}

export interface ReservationRequest {
  name: string;
  email: string;
  guests: number;
  date: string;
  time: string;
}
