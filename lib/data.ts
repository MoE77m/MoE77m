import type { MenuItem, NavLink, OpeningHours, RoastItem } from "./types";

export const unsplash = (id: string, width = 1600): string =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=80`;

export const navLinks: NavLink[] = [
  { label: "Philosophie", href: "#philosophie" },
  { label: "Röstungen", href: "#roestungen" },
  { label: "Café", href: "#cafe" },
  { label: "Besuch", href: "#besuch" },
];

export const roasts: RoastItem[] = [
  {
    id: "yirgacheffe",
    name: "Yirgacheffe Konga",
    variety: "Heirloom",
    origin: "Gedeo, Äthiopien",
    process: "Gewaschen",
    altitude: "1.900 – 2.100 m",
    tastingNotes: ["Jasmin", "Bergamotte", "Pfirsich"],
    roastLevel: 1,
    price: 16.5,
    weight: 250,
    description:
      "Florale Klarheit und eine teeartige Textur – geröstet, um die feinen Aromen der Hochland-Kooperative Konga zu bewahren.",
    recommendedFor: "Pour-Over, Aeropress",
    image: {
      src: unsplash("photo-1447933601403-0c6688de566e", 900),
      alt: "Frisch geröstete, hellbraune Kaffeebohnen in einer Keramiktasse",
    },
  },
  {
    id: "huila",
    name: "Huila La Esperanza",
    variety: "Caturra, Castillo",
    origin: "Huila, Kolumbien",
    process: "Honey",
    altitude: "1.750 m",
    tastingNotes: ["Rote Johannisbeere", "Rohrzucker", "Mandel"],
    roastLevel: 2,
    price: 15.9,
    weight: 250,
    description:
      "Saftig und ausgewogen. Die Honey-Aufbereitung schenkt diesem Kaffee eine runde Süße und einen langen, sanften Abgang.",
    recommendedFor: "Filter, Batch Brew",
    image: {
      src: unsplash("photo-1559056199-641a0ac8b55e", 900),
      alt: "Kaffeebohnen auf hellem Untergrund in Nahaufnahme",
    },
  },
  {
    id: "cerrado",
    name: "Cerrado Mineiro",
    variety: "Yellow Bourbon",
    origin: "Minas Gerais, Brasilien",
    process: "Natural",
    altitude: "1.100 m",
    tastingNotes: ["Haselnuss", "Milchschokolade", "Karamell"],
    roastLevel: 3,
    price: 13.9,
    weight: 250,
    description:
      "Unser Haus-Espresso: cremig, schokoladig und verlässlich – ideal pur oder als Basis für Milchgetränke.",
    recommendedFor: "Siebträger, Mokkakanne",
    image: {
      src: unsplash("photo-1514432324607-a09d9b4aefdd", 900),
      alt: "Espresso in einer weißen Tasse auf dunklem Holztisch",
    },
  },
  {
    id: "sumatra",
    name: "Sumatra Gayo",
    variety: "Ateng, Tim Tim",
    origin: "Aceh, Indonesien",
    process: "Wet Hulled",
    altitude: "1.500 m",
    tastingNotes: ["Dunkle Schokolade", "Getrocknete Feige", "Zedernholz"],
    roastLevel: 4,
    price: 14.5,
    weight: 250,
    description:
      "Kräftig, erdig und mit tiefer Süße. In der Trommel langsam entwickelt, um Bitterkeit zu vermeiden und Körper aufzubauen.",
    recommendedFor: "French Press, Espresso",
    image: {
      src: unsplash("photo-1611854779393-1b2da9d400fe", 900),
      alt: "Dunkel geröstete Kaffeebohnen in einer Schale",
    },
  },
];

export const menuItems: MenuItem[] = [
  {
    name: "Single Origin Espresso",
    description: "Wechselnde Herkunft, doppelt gezogen – pur und unverfälscht.",
    price: 2.9,
    category: "Espresso & Milch",
    tag: "Saisonal",
  },
  {
    name: "Flat White",
    description: "Doppelter Ristretto, samtig aufgeschäumte Vollmilch.",
    price: 4.2,
    category: "Espresso & Milch",
  },
  {
    name: "Cortado",
    description: "Espresso und warme Milch zu gleichen Teilen.",
    price: 3.6,
    category: "Espresso & Milch",
  },
  {
    name: "Batch Brew",
    description: "Frisch gebrühter Filterkaffee der Woche, unbegrenzt nachgefüllt.",
    price: 3.4,
    category: "Filterkaffee",
  },
  {
    name: "Pour-Over (V60)",
    description: "Handgebrüht nach Wahl aus unserem aktuellen Röstsortiment.",
    price: 5.5,
    category: "Filterkaffee",
    tag: "Empfehlung",
  },
  {
    name: "Französisches Croissant",
    description: "Butterzart, über 72 Stunden geführt, jeden Morgen frisch.",
    price: 3.2,
    category: "Gebäck",
  },
  {
    name: "Kardamom-Knoten",
    description: "Skandinavisches Hefegebäck mit Kardamom und Perlzucker.",
    price: 3.8,
    category: "Gebäck",
  },
  {
    name: "Basque Cheesecake",
    description: "Karamellisierte Kruste, cremiger Kern, ein Hauch Meersalz.",
    price: 5.2,
    category: "Gebäck",
  },
];

export const openingHours: OpeningHours[] = [
  { days: "Montag – Freitag", hours: "07:30 – 18:00" },
  { days: "Samstag", hours: "08:30 – 18:00" },
  { days: "Sonntag", hours: "09:30 – 17:00" },
];

export const contact = {
  name: "Glut & Bohne",
  street: "Röstereistraße 12",
  city: "10999 Berlin",
  phone: "+49 30 123 456 78",
  phoneHref: "tel:+493012345678",
  email: "hallo@glutundbohne.de",
  mapsUrl: "https://www.openstreetmap.org/search?query=Berlin%20Kreuzberg",
} as const;

export const formatPrice = (value: number): string =>
  new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(value);
