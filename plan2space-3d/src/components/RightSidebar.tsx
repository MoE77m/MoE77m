"use client";

import { ChevronDown, FileText, Lock, Printer } from "lucide-react";
import { useMemo } from "react";

import { getFloorMaterial } from "@/data/catalog";
import { useStudio } from "@/store/useStudio";
import { computeBudget } from "@/utils/calculations";
import { formatEUR, formatM2 } from "@/utils/format";
import { triggerPrint } from "@/utils/print";

import { ProBadge, TextureSwatch } from "./ui";

export function RightSidebar() {
  const plan = useStudio((s) => s.plan);
  const waste = useStudio((s) => s.wastePercent);
  const setWaste = useStudio((s) => s.setWastePercent);
  const pro = useStudio((s) => s.pro);
  const setPaywallOpen = useStudio((s) => s.setPaywallOpen);
  const select = useStudio((s) => s.select);

  const budget = useMemo(() => computeBudget(plan, waste), [plan, waste]);

  return (
    <aside className="order-3 flex w-full shrink-0 flex-col border-line bg-panel lg:w-[340px] lg:border-l">
      <div className="border-b border-line p-4">
        <div className="text-[11px] font-semibold tracking-wider text-mute uppercase">Geschätzte Gesamtkosten</div>
        <div
          className="mt-1 bg-gradient-to-r from-white to-accent2 bg-clip-text text-[40px] leading-tight font-bold tracking-tight text-transparent tabular-nums"
          aria-live="polite"
        >
          {formatEUR(budget.totalCost)}
        </div>
        <div className="text-[12px] text-mute">
          {formatM2(budget.floorArea)} Boden · {formatM2(budget.wallArea)} Wand · inkl. {budget.wastePercent} % Verschnitt
        </div>

        <dl className="mt-3 space-y-1 text-[13px]">
          <Row label="Bodenbeläge" value={formatEUR(budget.floorCost)} />
          <Row label="Wandbeläge" value={formatEUR(budget.wallCost)} />
          <Row label="Zwischensumme" value={formatEUR(budget.netCost)} muted />
          <Row label={`Verschnitt-Puffer (${budget.wastePercent} %)`} value={`+ ${formatEUR(budget.wasteCost)}`} muted />
        </dl>

        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between text-[12px]">
            <label htmlFor="waste" className="font-medium">
              Verschnitt-Puffer
            </label>
            <span className="rounded bg-white/10 px-1.5 py-0.5 font-semibold tabular-nums">{waste} %</span>
          </div>
          <input
            id="waste"
            type="range"
            min={0}
            max={20}
            step={1}
            value={waste}
            onChange={(e) => setWaste(Number(e.target.value))}
            className="w-full"
          />
          <div className="mt-1 flex justify-between text-[10px] text-mute">
            <span>0 %</span>
            <span>Standard 10 %</span>
            <span>20 %</span>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        <h3 className="px-1 pb-2 text-[11px] font-semibold tracking-wider text-mute uppercase">Räume im Detail</h3>
        <div className="space-y-1.5">
          {budget.rooms.map((r) => {
            const mat = getFloorMaterial(r.floorMaterialId);
            return (
              <details key={r.roomId} className="group rounded-xl border border-line bg-panel2">
                <summary
                  className="flex cursor-pointer list-none items-center gap-2 p-2.5 [&::-webkit-details-marker]:hidden"
                  onClick={() => select({ kind: "room", id: r.roomId })}
                >
                  <TextureSwatch materialId={mat.id} size={30} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-medium">{r.name}</span>
                    <span className="block text-[11px] text-mute">{formatM2(r.floorArea)}</span>
                  </span>
                  <span className="text-[13px] font-semibold tabular-nums">{formatEUR(r.subtotal)}</span>
                  <ChevronDown size={15} className="text-mute transition group-open:rotate-180" />
                </summary>
                <dl className="space-y-1 border-t border-line px-3 py-2.5 text-[12px]">
                  <Row label={`Boden · ${mat.name}`} value="" />
                  <Row label={`${formatM2(r.floorArea)} × ${mat.pricePerM2} €`} value={formatEUR(r.floorCost)} muted />
                  <Row label="Wandfläche (netto, alle Seiten)" value="" />
                  <Row label={formatM2(r.wallArea)} value={formatEUR(r.wallCost)} muted />
                  <div className="flex justify-between border-t border-line pt-1.5 font-semibold">
                    <dt>Teilsumme</dt>
                    <dd className="tabular-nums">{formatEUR(r.subtotal)}</dd>
                  </div>
                </dl>
              </details>
            );
          })}
        </div>
      </div>

      <div className="space-y-2 border-t border-line p-3">
        <button
          onClick={() => triggerPrint("costs")}
          className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-line bg-panel2 text-[13px] font-medium hover:bg-white/5"
        >
          <Printer size={15} /> Kostenaufstellung als PDF / Druckansicht exportieren
        </button>
        <button
          onClick={() => (pro ? triggerPrint("report") : setPaywallOpen(true))}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-accent to-accent2 text-[13px] font-semibold text-white shadow-lg shadow-accent/25 transition hover:brightness-110"
        >
          {pro ? <FileText size={16} /> : <Lock size={15} />}
          Renovierungs-Report erstellen (PDF)
          <ProBadge unlocked={pro} />
        </button>
        <p className="text-center text-[10.5px] leading-snug text-mute">
          Unverbindliche Schätzung auf Basis von Richtwerten (±15 %). Im Druckdialog „Als PDF speichern“ wählen.
        </p>
      </div>
    </aside>
  );
}

function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className={`flex items-baseline justify-between gap-3 ${muted ? "text-mute" : ""}`}>
      <dt className="min-w-0 truncate">{label}</dt>
      <dd className="font-medium tabular-nums">{value}</dd>
    </div>
  );
}
