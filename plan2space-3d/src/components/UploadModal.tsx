"use client";

import { ImagePlus, Loader2, Sparkles, TriangleAlert } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { samplePlans } from "@/data/samples";
import { useStudio } from "@/store/useStudio";
import type { FloorplanData } from "@/types/floorplan";

import { Modal } from "./ui";

const ACCEPT = ["image/png", "image/jpeg", "image/webp"];
const MAX_BYTES = 15 * 1024 * 1024;
const MIN_ANALYZE_MS = 1500;

type Status = "idle" | "analyzing" | "error";

/** Bild verkleinern (max. 1600 px) → JPEG-Data-URL; hält die Anfrage klein und API-konform. */
async function downscale(file: File): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error("Das Bild konnte nicht gelesen werden."));
      i.src = url;
    });
    const scale = Math.min(1, 1600 / Math.max(img.naturalWidth, img.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#fff"; // transparente PNGs auf Weiß
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.88);
  } finally {
    URL.revokeObjectURL(url);
  }
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

function UploadDialog() {
  const setUploadOpen = useStudio((s) => s.setUploadOpen);
  const loadPlan = useStudio((s) => s.loadPlan);
  const loadSample = useStudio((s) => s.loadSample);
  const showToast = useStudio((s) => s.showToast);

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [drag, setDrag] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const close = useCallback(() => setUploadOpen(false), [setUploadOpen]);

  const accept = (f: File | undefined) => {
    if (!f) return;
    if (!ACCEPT.includes(f.type)) {
      setError("Bitte ein PNG-, JPG- oder WEBP-Bild verwenden.");
      return;
    }
    if (f.size > MAX_BYTES) {
      setError("Die Datei ist größer als 15 MB.");
      return;
    }
    setError(null);
    setNotice(null);
    setStatus("idle");
    setFile(f);
  };

  const analyze = async () => {
    if (!file) return;
    setStatus("analyzing");
    setError(null);
    setNotice(null);
    const started = Date.now();
    try {
      const image = await downscale(file);
      const res = await fetch("/api/analyze-floorplan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image, mediaType: "image/jpeg" }),
      });
      const json = (await res.json()) as {
        mode?: "ai" | "mock";
        message?: string;
        sampleId?: string;
        plan?: FloorplanData;
        error?: string;
      };
      if (!res.ok || !json.plan) throw new Error(json.error ?? "Unbekannter Fehler bei der Analyse.");
      if (!alive.current) return;

      if (json.mode === "mock") {
        setNotice(json.message ?? "Demo-Modus: Beispiel-Grundriss wird geladen …");
        await wait(Math.max(0, MIN_ANALYZE_MS - (Date.now() - started)));
        if (!alive.current) return;
        loadPlan(json.plan, json.sampleId ?? "apartment-3");
        showToast("Demo-Modus: Beispiel-Grundriss geladen (kein API-Key gesetzt)");
      } else {
        loadPlan(json.plan, `custom-${Date.now()}`);
        showToast("Grundriss von der KI erkannt – bitte Maße prüfen");
      }
      close();
    } catch (e) {
      if (!alive.current) return;
      setStatus("error");
      setError(e instanceof Error ? e.message : "Analyse fehlgeschlagen.");
    }
  };

  return (
    <Modal title="Eigenen Grundriss hochladen" onClose={close} width="max-w-xl">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          accept(e.dataTransfer.files?.[0]);
        }}
        onClick={() => input.current?.click()}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && input.current?.click()}
        role="button"
        tabIndex={0}
        aria-label="Grundriss-Bild auswählen oder hierher ziehen"
        className={`flex min-h-48 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-5 text-center transition ${
          drag ? "border-accent2 bg-accent2/10" : "border-line bg-panel2 hover:border-white/30"
        }`}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Vorschau des Grundrisses" className="max-h-56 rounded-lg object-contain" />
        ) : (
          <>
            <ImagePlus size={30} className="text-accent" />
            <div className="text-sm font-medium">Grundriss hierher ziehen oder klicken</div>
            <div className="text-xs text-mute">PNG, JPG oder WEBP · max. 15 MB</div>
          </>
        )}
        <input
          ref={input}
          type="file"
          accept={ACCEPT.join(",")}
          className="hidden"
          onChange={(e) => accept(e.target.files?.[0])}
        />
      </div>

      {file && (
        <div className="mt-2 truncate text-xs text-mute">
          {file.name} · {(file.size / 1024).toFixed(0)} KB
        </div>
      )}

      {notice && (
        <div className="mt-3 flex gap-2 rounded-lg border border-amber-400/30 bg-amber-400/10 p-3 text-[13px] text-amber-100">
          <Sparkles size={16} className="mt-0.5 shrink-0" /> {notice}
        </div>
      )}
      {error && (
        <div className="mt-3 flex gap-2 rounded-lg border border-red-400/30 bg-red-400/10 p-3 text-[13px] text-red-100" role="alert">
          <TriangleAlert size={16} className="mt-0.5 shrink-0" /> {error}
        </div>
      )}

      <button
        onClick={analyze}
        disabled={!file || status === "analyzing"}
        className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-accent text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-40"
      >
        {status === "analyzing" ? (
          <>
            <Loader2 size={16} className="animate-spin" /> Grundriss wird analysiert …
          </>
        ) : (
          <>
            <Sparkles size={16} /> Mit KI analysieren
          </>
        )}
      </button>

      <div className="mt-4 border-t border-line pt-3">
        <div className="mb-2 text-[11px] font-semibold tracking-wider text-mute uppercase">Oder direkt ein Beispiel laden</div>
        <div className="flex flex-wrap gap-2">
          {samplePlans.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                loadSample(s.id);
                close();
              }}
              className="rounded-lg border border-line bg-panel2 px-3 py-1.5 text-[12px] hover:bg-white/5"
            >
              {s.label}
            </button>
          ))}
        </div>
        <p className="mt-3 text-[11px] leading-snug text-mute">
          Ohne <code className="rounded bg-white/10 px-1">ANTHROPIC_API_KEY</code> läuft die App im Demo-Modus und lädt nach 1,5 s
          einen Beispiel-Grundriss. Das Bild wird nur zur Analyse an die API gesendet.
        </p>
      </div>
    </Modal>
  );
}

export function UploadModal() {
  const open = useStudio((s) => s.uploadOpen);
  return open ? <UploadDialog /> : null;
}
