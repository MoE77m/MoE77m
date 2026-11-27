import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

import { samplePlans } from "@/data/samples";
import { extractJson, normalizeFloorplan } from "@/utils/validate";

const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5";
const ALLOWED = ["image/png", "image/jpeg", "image/webp"] as const;
type AllowedType = (typeof ALLOWED)[number];

const SYSTEM_PROMPT = `Du bist ein präziser Bauzeichner-Assistent. Du analysierst ein Bild eines Wohnungs-Grundrisses und gibst AUSSCHLIESSLICH ein JSON-Objekt zurück (kein Text davor oder danach, keine Erklärungen, kein Markdown).

KOORDINATENSYSTEM
- Einheit: Meter. Ursprung (0,0) = linke obere Ecke des Grundrisses (kleinste x/z-Werte).
- x wächst nach rechts (Osten), z wächst im Bild nach unten (Süden).
- Maßstab: Verwende, wenn keine Maßangaben im Plan stehen, eine Standard-Innentür mit ca. 0,90 m Breite als Referenz. Ist eine Maßstabsleiste oder sind Maße beschriftet, haben diese Vorrang. Runde auf 0,05 m.

SCHEMA (TypeScript)
{
  "meta": { "name": string, "ceilingHeightMeters": number /* Standard 2.5 */, "unit": "meters" },
  "rooms": [ { "id": string, "name": string /* z.B. Wohnzimmer, Küche, Schlafzimmer, Bad, Flur */,
               "polygon": [ { "x": number, "z": number } ] /* Eckpunkte entlang der Wandmitten, im Umlauf, min. 3 */,
               "floorMaterialId": "oak-parquet" | "concrete-loft" | "ceramic-tile" | "carpet-warm" } ],
  "walls": [ { "id": string,
               "start": { "x": number, "z": number }, "end": { "x": number, "z": number },
               "thickness": number /* Außenwand 0.2, Innenwand 0.1–0.15 */,
               "wallMaterialId": "white-plaster" | "sage-green" | "acoustic-wood" | "exposed-brick",
               "openings": [ { "type": "door" | "window",
                               "positionRatio": number /* 0..1, Mitte der Öffnung entlang start→end */,
                               "width": number, "height": number, "elevation": number } ] } ],
  "furniture": []
}

REGELN
1. Jeder Raum ist ein geschlossenes Polygon (nicht-rechteckige Räume sind erlaubt). Benachbarte Räume teilen sich exakt dieselben Eckpunkte entlang gemeinsamer Wände.
2. Jede Wand verläuft geradlinig zwischen zwei Punkten. Teile Wände an Abzweigungen und an Raumgrenzen, sodass jede Wand an genau denselben Räumen anliegt (Außenwand: ein Raum, Innenwand: zwei Räume).
3. Türen: elevation 0, height ca. 2.1, width 0.8–1.0 (Durchgänge ohne Tür als "door" mit größerer Breite). Fenster: elevation ca. 0.9, height ca. 1.3, width 0.6–2.4 (bodentiefe Fenster: elevation 0).
4. Standard-Materialien: Wohn-/Schlafräume "oak-parquet", Bad/Küche/Flur "ceramic-tile", Wände "white-plaster".
5. "furniture" bleibt ein leeres Array.
6. Wenn Teile unleserlich sind, schätze plausibel – gib trotzdem ein vollständiges, konsistentes JSON zurück.`;

function mockResponse(reason: string, seed: number) {
  const sample = samplePlans[seed % samplePlans.length];
  return NextResponse.json({
    mode: "mock" as const,
    reason,
    message:
      "Kein ANTHROPIC_API_KEY gesetzt – Demo-Modus: Es wird ein Beispiel-Grundriss geladen. Trage deinen Key in .env.local ein, um echte KI-Analyse zu nutzen.",
    sampleId: sample.id,
    plan: sample.plan,
  });
}

export async function POST(req: Request) {
  let body: { image?: string; mediaType?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Ungültige Anfrage (JSON erwartet)." }, { status: 400 });
  }

  let data = typeof body.image === "string" ? body.image : "";
  let mediaType = typeof body.mediaType === "string" ? body.mediaType : "";
  const m = data.match(/^data:([\w/+.-]+);base64,/);
  if (m) {
    mediaType = mediaType || m[1];
    data = data.slice(m[0].length);
  }
  if (!data) return NextResponse.json({ error: "Kein Bild übermittelt." }, { status: 400 });
  if (!ALLOWED.includes(mediaType as AllowedType)) {
    return NextResponse.json({ error: "Nur PNG, JPG oder WEBP werden unterstützt." }, { status: 415 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return mockResponse("no_api_key", data.length);

  try {
    const client = new Anthropic({ apiKey });
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 8000,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: mediaType as AllowedType, data } },
            {
              type: "text",
              text: "Analysiere diesen Grundriss und gib das JSON gemäß Schema zurück. Nur JSON.",
            },
          ],
        },
      ],
    });

    const text = response.content
      .map((block) => (block.type === "text" ? block.text : ""))
      .join("\n");
    const plan = normalizeFloorplan(extractJson(text));
    return NextResponse.json({ mode: "ai" as const, plan });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unbekannter Fehler";
    return NextResponse.json({ error: `Analyse fehlgeschlagen: ${message}` }, { status: 502 });
  }
}
