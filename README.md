# Glut & Bohne – Kaffeerösterei & Café

Responsive Landingpage mit **Next.js (App Router, TypeScript)**, **Tailwind CSS v4** und **lucide-react**.

## Start

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
npm run typecheck
```

## Struktur

```
app/
  layout.tsx         Metadaten, Fonts (Cormorant Garamond + Plus Jakarta Sans via next/font)
  page.tsx           Setzt die Sektionen zusammen
  globals.css        Design-Tokens (@theme): Farben, Fonts, Animationen
components/
  Navbar.tsx         Fixiert, transparent → Blur beim Scrollen, Hamburger-Menü mobil
  Hero.tsx           Fullscreen-Hero mit next/image (priority) + Overlay
  Philosophy.tsx     Direct Trade, Trommelröstung, Café-Konzept (2 Spalten + Bildkomposition)
  RoastsShowcase.tsx Röstungs-Karten mit Tasting Notes, Röstgrad-Balken, ausklappbaren Details
  CafeMenu.tsx       Menü-Auszug (Espresso, Filter, Gebäck)
  LocationContact.tsx Adresse, Öffnungszeiten, Reservierungsformular mit Validierung
  Footer.tsx
  SectionHeading.tsx Wiederverwendbare Sektionsüberschrift
lib/
  types.ts           Interfaces (RoastItem, MenuItem, ReservationRequest …)
  data.ts            Mock-Daten, Kontakt, Hilfsfunktionen
```

## Farben (Tailwind-Utilities)

| Token          | Wert      | Beispiel             |
| -------------- | --------- | -------------------- |
| `cream`        | `#F9F6F0` | `bg-cream`           |
| `linen`        | `#F5F2EB` | `bg-linen`           |
| `sand`         | `#D8CEC2` | `border-sand`        |
| `copper`       | `#B86B43` | `text-copper`        |
| `espresso`     | `#181412` | `bg-espresso`        |

## Hinweise

- Bilder werden von `images.unsplash.com` geladen (in `next.config.ts` freigegeben).
- Das Reservierungsformular simuliert den Versand; in `handleSubmit` (`components/LocationContact.tsx`)
  kann ein echter API-Call (z. B. Route Handler unter `app/api/reservation/route.ts`) ergänzt werden.
