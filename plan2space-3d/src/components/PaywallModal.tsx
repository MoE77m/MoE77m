"use client";

import { Check, Lock } from "lucide-react";

import { useStudio } from "@/store/useStudio";
import { triggerPrint } from "@/utils/print";

import { Modal, ProBadge } from "./ui";

const FEATURES = [
  "Detaillierter Renovierungs-Report (mehrseitig, druckfertig)",
  "Grundriss-Skizze mit Materialkacheln & Raumbuch",
  "Materialliste inkl. Verschnitt und Mengen je Belag",
  "Möbelliste und Annahmen-/Hinweisblock für Handwerker-Angebote",
];

export function PaywallModal() {
  const open = useStudio((s) => s.paywallOpen);
  const setOpen = useStudio((s) => s.setPaywallOpen);
  const unlock = useStudio((s) => s.unlockPro);
  if (!open) return null;

  return (
    <Modal title="Renovierungs-Report" onClose={() => setOpen(false)} width="max-w-md">
      <div className="relative mb-4 overflow-hidden rounded-xl border border-line bg-white p-4 text-slate-800">
        <div className="select-none blur-[3px]" aria-hidden>
          <div className="text-[11px] font-bold tracking-wide text-slate-500 uppercase">Renovierungs-Report · Vorschau</div>
          <div className="mt-1 h-2.5 w-40 rounded bg-slate-300" />
          <div className="mt-3 grid grid-cols-4 gap-1.5">
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div key={i} className="h-7 rounded bg-slate-200" />
            ))}
          </div>
          <div className="mt-3 space-y-1.5">
            {[90, 70, 80, 55].map((w, i) => (
              <div key={i} className="h-2 rounded bg-slate-200" style={{ width: `${w}%` }} />
            ))}
          </div>
        </div>
        <div className="absolute inset-0 grid place-items-center bg-white/40">
          <span className="flex items-center gap-1.5 rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white">
            <Lock size={13} /> <ProBadge /> Funktion
          </span>
        </div>
      </div>

      <ul className="space-y-2 text-[13px]">
        {FEATURES.map((f) => (
          <li key={f} className="flex gap-2">
            <Check size={16} className="mt-0.5 shrink-0 text-emerald-400" /> {f}
          </li>
        ))}
      </ul>

      <button
        onClick={() => {
          unlock();
          triggerPrint("report");
        }}
        className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-accent to-accent2 text-sm font-semibold text-white hover:brightness-110"
      >
        Pro für die Demo freischalten
      </button>
      <p className="mt-2 text-center text-[11px] text-mute">Demo-Freischaltung – keine Zahlung, nichts wird gespeichert.</p>
    </Modal>
  );
}
