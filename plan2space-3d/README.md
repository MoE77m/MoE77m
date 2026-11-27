# Plan2Space 3D

Interaktiver **Grundriss-zu-3D- & Renovierungs-Simulator** mit Echtzeit-Budgetrechner.
Next.js (App Router) · TypeScript · Tailwind CSS v4 · three.js / React Three Fiber · zustand · Claude Vision API.

## Lokal starten

```bash
cd plan2space-3d
npm install
cp .env.local.example .env.local   # optional: API-Key eintragen (siehe unten)
npm run dev                        # http://localhost:3000
```

Weitere Befehle:

```bash
npm run build && npm start   # Produktions-Build
npm test                     # Unit-Tests der Kalkulation (node:test + tsx)
npm run lint
```

## API-Key eintragen (KI-Grundriss-Analyse)

In `.env.local` (Projektordner `plan2space-3d/`):

```
ANTHROPIC_API_KEY=sk-ant-...
# optional: ANTHROPIC_MODEL=claude-sonnet-4-6   (Standard: claude-sonnet-5-5)
```

Dev-Server danach neu starten. **Ohne Key** läuft der Demo-Modus: Die Upload-Funktion zeigt einen Hinweis und
lädt nach 1,5 s einen der drei fertigen Beispiel-Grundrisse. Der Key liegt nur serverseitig
(`src/app/api/analyze-floorplan/route.ts`) und gelangt nie in den Browser.

## Bedienung

| Aktion | So geht's |
| --- | --- |
| Material anwenden | Tab **Böden/Wände** → Material wählen → im 3D-Fenster auf Boden/Wand klicken (oder erst klicken, dann Material wählen) |
| Ganzes Haus | „Auf alle Räume anwenden“ |
| Möbel | Tab **Möbel** → „+ Add“ → ziehen (10-cm-Raster optional), **R** = 45° drehen (Shift+R rückwärts), **Entf** = löschen |
| Kameras | **3D-Ansicht** (Orbit, ziehen = drehen, Rechtsklick = verschieben) · **2D-Maße** (Draufsicht mit Maßketten) · **Begehen** (1,70 m, WASD/Pfeile, Maus ziehen = umschauen, Shift = schneller) |
| Undo/Redo | Buttons oben oder Strg+Z / Strg+Y |
| Licht | Regler „Tageszeit“ unten im Viewport |
| Export | „Kostenaufstellung als PDF / Druckansicht exportieren“ → Druckdialog → „Als PDF speichern“ |
| Pro-Report | „Renovierungs-Report erstellen (PDF)“ → Paywall-Demo → „Pro freischalten“ |

## Architektur

```
src/
  types/floorplan.ts        Datenmodell (FloorplanData: meta, rooms, walls+openings, furniture)
  data/catalog.ts           Material- & Preiskatalog, Möbelkatalog
  data/samples.ts           3 Beispiel-Grundrisse (1-Zimmer, 3-Zimmer, Loft)
  utils/calculations.ts     Shoelace-Fläche, Netto-Wandfläche, Raum-/Gesamtkosten, Verschnitt
  utils/calculations.test.ts Unit-Tests
  utils/geometry.ts         Wand-Zerlegung (echte Aussparungen), Kollision, Polygon-Helfer
  utils/textures.ts         Prozedurale Canvas-Texturen (Parkett, Beton, Fliese, Teppich, Putz, Akustik, Klinker)
  utils/validate.ts         Strikte Validierung/Normalisierung der KI-JSON-Antwort
  store/useStudio.ts        zustand: Plan, Undo/Redo, Auswahl, Kamera, Budget-Einstellungen
  components/Scene3D.tsx    R3F-Canvas; scene/* = Böden, Wände, Möbel, Kamera, Licht, Maßketten
  components/*              Topbar, Sidebars, Viewport-Overlays, Upload-/Paywall-Modal, Druck-Report
  app/api/analyze-floorplan Vision-Route (Claude) + Mock-Fallback
```

## Berechnungslogik (kurz)

- **Bodenfläche:** Gaußsche Trapezformel über die Raum-Polygone (Wandmittellinien).
- **Netto-Wandfläche (eine Seite):** `Länge × Deckenhöhe − Σ(Türen/Fenster)`.
- **Zuordnung:** Pro Wand werden beide Seiten per Stichproben den angrenzenden Räumen zugeordnet →
  Innenwände zählen für **beide** Räume, Außenwände nur für die Innenseite.
- **Kosten:** Fläche × €/m² (Material + Verlegung); Verschnitt (0–20 %, Standard 10 %) wird auf die Zwischensumme aufgeschlagen.

## Hinweise / Grenzen des MVP

- Preise sind Richtwerte, keine Angebote. Vorarbeiten, Sockelleisten, Entsorgung und MwSt.-Ausweis fehlen.
- Möbel sind nicht Teil des Budgets (nur maßstabsgetreue Planung).
- KI-Ergebnisse sind Schätzungen (Maßstab über Türbreite ≈ 0,90 m) und sollten geprüft werden.
- Der 3D-Teil braucht WebGL (aktueller Desktop-Browser empfohlen).
