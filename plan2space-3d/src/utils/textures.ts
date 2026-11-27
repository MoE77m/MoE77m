/**
 * Prozedurale Texturen (HTML5-Canvas) – keine externen Bilder.
 * Alle Painter arbeiten in Bruchteilen der Kantenlänge S und sind daher
 * in jeder Auflösung nutzbar (3D-Textur 512 px, Vorschau-Kachel 96 px).
 */
import * as THREE from "three";

import { getSurfaceMaterial } from "@/data/catalog";

type Rand = () => number;
type Ctx = CanvasRenderingContext2D;

function mulberry32(seed: number): Rand {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const range = (r: Rand, a: number, b: number) => a + (b - a) * r();

/** Pixelrauschen (hell/dunkel) über die gesamte Fläche. */
function addNoise(ctx: Ctx, S: number, amount: number, r: Rand) {
  const img = ctx.getImageData(0, 0, S, S);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = (r() - 0.5) * 2 * amount;
    d[i] += n;
    d[i + 1] += n;
    d[i + 2] += n;
  }
  ctx.putImageData(img, 0, 0);
}

/** Zeichnet mit Wrap-around, damit die Kachel nahtlos wiederholbar bleibt. */
function wrapped(S: number, x: number, y: number, rad: number, draw: (px: number, py: number) => void) {
  for (const dx of [-S, 0, S]) {
    for (const dy of [-S, 0, S]) {
      const px = x + dx;
      const py = y + dy;
      if (px + rad < 0 || px - rad > S || py + rad < 0 || py - rad > S) continue;
      draw(px, py);
    }
  }
}

function blotches(ctx: Ctx, S: number, r: Rand, count: number, minR: number, maxR: number, alpha: number) {
  for (let i = 0; i < count; i++) {
    const x = r() * S;
    const y = r() * S;
    const rad = range(r, minR, maxR) * S;
    const light = r() > 0.5;
    wrapped(S, x, y, rad, (px, py) => {
      const g = ctx.createRadialGradient(px, py, 0, px, py, rad);
      const c = light ? "255,255,255" : "0,0,0";
      g.addColorStop(0, `rgba(${c},${alpha * range(r, 0.5, 1)})`);
      g.addColorStop(1, `rgba(${c},0)`);
      ctx.fillStyle = g;
      ctx.fillRect(px - rad, py - rad, rad * 2, rad * 2);
    });
  }
}

/* ------------------------------ Böden ------------------------------ */

function paintOakParquet(ctx: Ctx, S: number, r: Rand) {
  ctx.fillStyle = "#b98a56";
  ctx.fillRect(0, 0, S, S);
  const rows = 10;
  const rowH = S / rows;
  const plankLen = S / 2;
  for (let row = 0; row < rows; row++) {
    const offset = r() * plankLen;
    for (let k = -1; k < 3; k++) {
      const x0 = offset + k * plankLen;
      const y0 = row * rowH;
      const hue = range(r, 27, 34);
      const sat = range(r, 38, 52);
      const lig = range(r, 48, 62);
      const grainSeed = r();
      for (const sx of [0, -S, S]) {
        const x = x0 + sx;
        if (x + plankLen < 0 || x > S) continue;
        ctx.fillStyle = `hsl(${hue} ${sat}% ${lig}%)`;
        ctx.fillRect(x, y0, plankLen, rowH);
        // Maserung: leicht gewellte, längliche Linien
        const gr = mulberry32(Math.floor(grainSeed * 1e9));
        for (let i = 0; i < 16; i++) {
          const gy = y0 + gr() * rowH;
          const amp = range(gr, 0.4, 2.4) * (S / 512);
          const freq = range(gr, 0.01, 0.035) * (512 / S);
          const ph = gr() * 6.28;
          ctx.strokeStyle = `rgba(${gr() > 0.3 ? "88,52,22" : "230,190,140"},${range(gr, 0.06, 0.22)})`;
          ctx.lineWidth = range(gr, 0.5, 1.4) * (S / 512);
          ctx.beginPath();
          for (let px = 0; px <= plankLen; px += 6) {
            const py = gy + Math.sin(px * freq + ph) * amp;
            if (px === 0) ctx.moveTo(x + px, py);
            else ctx.lineTo(x + px, py);
          }
          ctx.stroke();
        }
        if (gr() > 0.82) {
          // Ast
          const kx = x + gr() * plankLen;
          const ky = y0 + rowH / 2;
          const g = ctx.createRadialGradient(kx, ky, 0, kx, ky, rowH * 0.3);
          g.addColorStop(0, "rgba(70,38,14,0.55)");
          g.addColorStop(1, "rgba(70,38,14,0)");
          ctx.fillStyle = g;
          ctx.fillRect(kx - rowH, ky - rowH, rowH * 2, rowH * 2);
        }
        // Fugen
        ctx.fillStyle = "rgba(45,26,10,0.45)";
        ctx.fillRect(x, y0, Math.max(1, S / 400), rowH);
        ctx.fillRect(x, y0, plankLen, Math.max(1, S / 340));
      }
    }
  }
  addNoise(ctx, S, 7, r);
}

function paintConcrete(ctx: Ctx, S: number, r: Rand) {
  ctx.fillStyle = "#8e9195";
  ctx.fillRect(0, 0, S, S);
  blotches(ctx, S, r, 70, 0.08, 0.3, 0.09);
  // Kellenzüge
  for (let i = 0; i < 90; i++) {
    const x = r() * S;
    const y = r() * S;
    const len = range(r, 0.1, 0.35) * S;
    const ang = range(r, -0.5, 0.5);
    ctx.strokeStyle = `rgba(${r() > 0.5 ? "255,255,255" : "0,0,0"},${range(r, 0.015, 0.045)})`;
    ctx.lineWidth = range(r, 6, 22) * (S / 512);
    ctx.lineCap = "round";
    wrapped(S, x, y, len, (px, py) => {
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px + Math.cos(ang) * len, py + Math.sin(ang) * len);
      ctx.stroke();
    });
  }
  // Poren
  for (let i = 0; i < 160; i++) {
    const x = r() * S;
    const y = r() * S;
    const rad = range(r, 0.6, 1.8) * (S / 512);
    ctx.fillStyle = `rgba(40,42,46,${range(r, 0.2, 0.5)})`;
    ctx.beginPath();
    ctx.arc(x, y, rad, 0, 6.28);
    ctx.fill();
  }
  addNoise(ctx, S, 9, r);
}

function paintCeramicTile(ctx: Ctx, S: number, r: Rand) {
  const n = 2;
  const t = S / n;
  const grout = Math.max(2, S / 128);
  ctx.fillStyle = "#17181a";
  ctx.fillRect(0, 0, S, S);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const lig = range(r, 22, 28);
      const x = i * t + grout / 2;
      const y = j * t + grout / 2;
      const w = t - grout;
      const g = ctx.createLinearGradient(x, y, x + w, y + w);
      g.addColorStop(0, `hsl(215 6% ${lig + 4}%)`);
      g.addColorStop(1, `hsl(215 6% ${lig - 3}%)`);
      ctx.fillStyle = g;
      ctx.fillRect(x, y, w, w);
      // Speckles
      for (let k = 0; k < 260; k++) {
        ctx.fillStyle = `rgba(${r() > 0.5 ? "200,205,215" : "0,0,0"},${range(r, 0.04, 0.16)})`;
        const s = range(r, 0.6, 1.6) * (S / 512);
        ctx.fillRect(x + r() * w, y + r() * w, s, s);
      }
      // Kantenlicht
      ctx.strokeStyle = "rgba(255,255,255,0.07)";
      ctx.lineWidth = Math.max(1, S / 512);
      ctx.strokeRect(x + 0.5, y + 0.5, w - 1, w - 1);
    }
  }
  addNoise(ctx, S, 4, r);
}

function paintCarpet(ctx: Ctx, S: number, r: Rand) {
  ctx.fillStyle = "#cdb592";
  ctx.fillRect(0, 0, S, S);
  addNoise(ctx, S, 16, r);
  const fibers = Math.floor(S * S * 0.03);
  for (let i = 0; i < fibers; i++) {
    const x = r() * S;
    const y = r() * S;
    const ang = r() * 6.28;
    const len = range(r, 1.5, 4.5) * (S / 512);
    ctx.strokeStyle = r() > 0.5 ? `rgba(255,248,230,${range(r, 0.1, 0.3)})` : `rgba(110,85,55,${range(r, 0.1, 0.3)})`;
    ctx.lineWidth = Math.max(0.6, S / 512);
    wrapped(S, x, y, len, (px, py) => {
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px + Math.cos(ang) * len, py + Math.sin(ang) * len);
      ctx.stroke();
    });
  }
  blotches(ctx, S, r, 30, 0.1, 0.3, 0.05);
}

/* ------------------------------ Wände ------------------------------ */

function paintFlat(base: string, noise: number, blots: number) {
  return (ctx: Ctx, S: number, r: Rand) => {
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, S, S);
    blotches(ctx, S, r, blots, 0.1, 0.4, 0.045);
    addNoise(ctx, S, noise, r);
  };
}

function paintAcoustic(ctx: Ctx, S: number, r: Rand) {
  const slats = 13;
  const pitch = S / slats;
  const w = pitch * 0.74;
  // Filzträger
  ctx.fillStyle = "#2f2f32";
  ctx.fillRect(0, 0, S, S);
  for (let i = 0; i < 1800; i++) {
    ctx.fillStyle = `rgba(${r() > 0.5 ? "90,90,95" : "0,0,0"},${range(r, 0.08, 0.25)})`;
    ctx.fillRect(r() * S, r() * S, 1.4 * (S / 512), 1.4 * (S / 512));
  }
  for (let i = 0; i < slats; i++) {
    const x = i * pitch + (pitch - w) / 2;
    const hue = range(r, 29, 36);
    const lig = range(r, 52, 63);
    const g = ctx.createLinearGradient(x, 0, x + w, 0);
    g.addColorStop(0, `hsl(${hue} 42% ${lig - 7}%)`);
    g.addColorStop(0.5, `hsl(${hue} 46% ${lig + 3}%)`);
    g.addColorStop(1, `hsl(${hue} 42% ${lig - 8}%)`);
    ctx.fillStyle = g;
    ctx.fillRect(x, 0, w, S);
    // senkrechte Maserung
    for (let k = 0; k < 9; k++) {
      const gx = x + r() * w;
      ctx.strokeStyle = `rgba(${r() > 0.4 ? "85,50,22" : "235,200,150"},${range(r, 0.06, 0.2)})`;
      ctx.lineWidth = range(r, 0.5, 1.2) * (S / 512);
      ctx.beginPath();
      ctx.moveTo(gx, 0);
      for (let py = 0; py <= S; py += 16) {
        ctx.lineTo(gx + Math.sin(py * 0.02 + k) * 1.5 * (S / 512), py);
      }
      ctx.stroke();
    }
  }
  addNoise(ctx, S, 5, r);
}

function paintBrick(ctx: Ctx, S: number, r: Rand) {
  const rows = 10;
  const rowH = S / rows;
  const bw = S / 3;
  const joint = Math.max(2, S * 0.012);
  ctx.fillStyle = "#b9b3a8"; // Fuge
  ctx.fillRect(0, 0, S, S);
  for (let row = 0; row < rows; row++) {
    const off = row % 2 === 0 ? 0 : bw / 2;
    for (let k = -1; k < 4; k++) {
      const x = k * bw + off + joint / 2;
      const y = row * rowH + joint / 2;
      const w = bw - joint;
      const h = rowH - joint;
      const hue = range(r, 6, 18);
      const sat = range(r, 38, 55);
      const lig = range(r, 31, 45);
      ctx.fillStyle = `hsl(${hue} ${sat}% ${lig}%)`;
      ctx.fillRect(x, y, w, h);
      // Brennflecken
      for (let i = 0; i < 40; i++) {
        ctx.fillStyle = `rgba(${r() > 0.5 ? "30,14,8" : "230,170,130"},${range(r, 0.05, 0.2)})`;
        const s = range(r, 1, 4) * (S / 512);
        ctx.fillRect(x + r() * w, y + r() * h, s, s);
      }
      ctx.fillStyle = "rgba(255,255,255,0.08)";
      ctx.fillRect(x, y, w, Math.max(1, S / 300));
    }
  }
  addNoise(ctx, S, 8, r);
}

const painters: Record<string, (ctx: Ctx, S: number, r: Rand) => void> = {
  "oak-parquet": paintOakParquet,
  "concrete-loft": paintConcrete,
  "ceramic-tile": paintCeramicTile,
  "carpet-warm": paintCarpet,
  "white-plaster": paintFlat("#f3f1ec", 4, 14),
  "sage-green": paintFlat("#9fb396", 5, 16),
  "acoustic-wood": paintAcoustic,
  "exposed-brick": paintBrick,
};

/** Zeichnet die Textur eines Materials in einen beliebigen quadratischen Canvas-Kontext. */
export function paintMaterial(ctx: Ctx, materialId: string, size: number) {
  const painter = painters[materialId];
  if (!painter) {
    ctx.fillStyle = getSurfaceMaterial(materialId).color;
    ctx.fillRect(0, 0, size, size);
    return;
  }
  painter(ctx, size, mulberry32(hashString(materialId)));
}

/* ----------------------- Three.js-Textur + Swatch ----------------------- */

const textureCache = new Map<string, THREE.CanvasTexture>();

/**
 * Nahtlos wiederholbare Textur; die Wiederholung ist auf Meter normiert
 * (UV-Koordinaten der Geometrien sind in Metern) → keine Verzerrung.
 */
export function getMaterialTexture(materialId: string): THREE.CanvasTexture {
  const cached = textureCache.get(materialId);
  if (cached) return cached;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 512;
  const ctx = canvas.getContext("2d")!;
  paintMaterial(ctx, materialId, 512);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  const tile = getSurfaceMaterial(materialId).tileSizeM;
  tex.repeat.set(1 / tile, 1 / tile);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  textureCache.set(materialId, tex);
  return tex;
}

const swatchCanvasCache = new Map<string, HTMLCanvasElement>();

/** Kleiner gecachter Canvas mit der Textur (für Sidebar-Kacheln). */
export function getSwatchCanvas(materialId: string, size = 128): HTMLCanvasElement {
  const key = `${materialId}:${size}`;
  const hit = swatchCanvasCache.get(key);
  if (hit) return hit;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  paintMaterial(canvas.getContext("2d")!, materialId, size);
  swatchCanvasCache.set(key, canvas);
  return canvas;
}

/** Data-URL einer Vorschau-Kachel (für Druck-Report). */
export function getSwatchDataUrl(materialId: string, size = 96): string {
  return getSwatchCanvas(materialId, size).toDataURL("image/png");
}
