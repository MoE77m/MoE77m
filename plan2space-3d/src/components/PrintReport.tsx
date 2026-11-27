"use client";

import { useEffect, useMemo, useState } from "react";

import { getFloorMaterial, getSurfaceMaterial } from "@/data/catalog";
import { useStudio } from "@/store/useStudio";
import type { FloorplanData } from "@/types/floorplan";
import { computeBudget, polygonArea } from "@/utils/calculations";
import { formatEUR, formatEUR2, formatM2 } from "@/utils/format";
import { interiorPoint, planBounds, resolveOpenings, wallLength } from "@/utils/geometry";

/** Vektor-Grundriss (Meter-Koordinaten) für den Ausdruck. */
function PlanSvg({ plan }: { plan: FloorplanData }) {
  const b = planBounds(plan);
  const pad = 0.8;
  return (
    <svg
      viewBox={`${b.minX - pad} ${b.minZ - pad} ${b.width + pad * 2} ${b.depth + pad * 2}`}
      className="h-auto w-full max-h-[85mm]"
      role="img"
      aria-label="Grundriss"
    >
      {plan.rooms.map((r) => (
        <polygon
          key={r.id}
          points={r.polygon.map((p) => `${p.x},${p.z}`).join(" ")}
          fill={getFloorMaterial(r.floorMaterialId).color}
          fillOpacity={0.75}
        />
      ))}
      {plan.walls.map((w) => {
        const L = wallLength(w);
        if (L < 0.01) return null;
        const ux = (w.end.x - w.start.x) / L;
        const uz = (w.end.z - w.start.z) / L;
        return (
          <g key={w.id}>
            <line
              x1={w.start.x}
              y1={w.start.z}
              x2={w.end.x}
              y2={w.end.z}
              stroke="#222"
              strokeWidth={w.thickness}
              strokeLinecap="square"
            />
            {resolveOpenings(w, plan.meta.ceilingHeightMeters).map((o, i) => (
              <g key={i}>
                <line
                  x1={w.start.x + ux * o.a}
                  y1={w.start.z + uz * o.a}
                  x2={w.start.x + ux * o.b}
                  y2={w.start.z + uz * o.b}
                  stroke="#fff"
                  strokeWidth={w.thickness + 0.02}
                />
                <line
                  x1={w.start.x + ux * o.a}
                  y1={w.start.z + uz * o.a}
                  x2={w.start.x + ux * o.b}
                  y2={w.start.z + uz * o.b}
                  stroke={o.opening.type === "window" ? "#2b7bd3" : "#a0693a"}
                  strokeWidth={o.opening.type === "window" ? 0.05 : 0.04}
                />
              </g>
            ))}
          </g>
        );
      })}
      {plan.rooms.map((r) => {
        const c = interiorPoint(r.polygon);
        return (
          <text key={r.id} x={c.x} y={c.z} textAnchor="middle" fontSize={0.32} fill="#111" fontWeight={700}>
            {r.name}
            <tspan x={c.x} dy={0.38} fontWeight={400} fontSize={0.27}>
              {formatM2(polygonArea(r.polygon))}
            </tspan>
          </text>
        );
      })}
    </svg>
  );
}

export function PrintReport() {
  const plan = useStudio((s) => s.plan);
  const waste = useStudio((s) => s.wastePercent);
  const variant = useStudio((s) => s.printVariant);
  const budget = useMemo(() => computeBudget(plan, waste), [plan, waste]);
  const [date, setDate] = useState("");
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDate(new Date().toLocaleDateString("de-DE", { day: "2-digit", month: "long", year: "numeric" }));
  }, []);

  const report = variant === "report";
  const th = "border-b-2 border-slate-800 px-2 py-1.5 text-left text-[11px] font-bold uppercase tracking-wide";
  const td = "border-b border-slate-300 px-2 py-1.5 text-[12px]";
  const num = "text-right tabular-nums";

  return (
    <div id="print-root" className="hidden bg-white p-0 text-[12px] text-slate-900">
      <header className="mb-5 flex items-end justify-between border-b-2 border-slate-900 pb-3">
        <div>
          <div className="text-[11px] font-bold tracking-widest text-slate-500 uppercase">Plan2Space 3D</div>
          <h1 className="text-2xl font-bold">
            {report ? "Renovierungs-Report" : "Kostenaufstellung / Budgetübersicht"}
          </h1>
          <div className="mt-0.5 text-[13px] text-slate-600">{plan.meta.name}</div>
        </div>
        <div className="text-right text-[11px] text-slate-600">
          <div>Stand: {date || "—"}</div>
          <div>Deckenhöhe: {plan.meta.ceilingHeightMeters.toFixed(2).replace(".", ",")} m</div>
          <div>Verschnitt-Puffer: {budget.wastePercent} %</div>
        </div>
      </header>

      {report && (
        <section className="print-avoid-break mb-5">
          <h2 className="mb-2 text-sm font-bold uppercase">Grundriss</h2>
          <div className="rounded border border-slate-300 p-2">
            <PlanSvg plan={plan} />
          </div>
        </section>
      )}

      <section className="print-avoid-break mb-5 flex items-center justify-between rounded border-2 border-slate-900 bg-slate-100 px-4 py-3">
        <div>
          <div className="text-[11px] font-bold text-slate-600 uppercase">Geschätzte Gesamtkosten (inkl. Verschnitt)</div>
          <div className="text-3xl font-bold tabular-nums">{formatEUR2(budget.totalCost)}</div>
        </div>
        <div className="text-right text-[11px] text-slate-600">
          <div>Boden {formatM2(budget.floorArea)}</div>
          <div>Wand {formatM2(budget.wallArea)}</div>
        </div>
      </section>

      <section className="mb-5">
        <h2 className="mb-2 text-sm font-bold uppercase">Aufstellung nach Räumen</h2>
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className={th}>Raum</th>
              <th className={th}>Bodenbelag</th>
              <th className={`${th} text-right`}>Boden m²</th>
              <th className={`${th} text-right`}>Boden €</th>
              <th className={`${th} text-right`}>Wand m²</th>
              <th className={`${th} text-right`}>Wand €</th>
              <th className={`${th} text-right`}>Teilsumme</th>
            </tr>
          </thead>
          <tbody>
            {budget.rooms.map((r) => (
              <tr key={r.roomId} className="print-avoid-break">
                <td className={`${td} font-semibold`}>{r.name}</td>
                <td className={td}>{getFloorMaterial(r.floorMaterialId).name}</td>
                <td className={`${td} ${num}`}>{r.floorArea.toFixed(1).replace(".", ",")}</td>
                <td className={`${td} ${num}`}>{formatEUR2(r.floorCost)}</td>
                <td className={`${td} ${num}`}>{r.wallArea.toFixed(1).replace(".", ",")}</td>
                <td className={`${td} ${num}`}>{formatEUR2(r.wallCost)}</td>
                <td className={`${td} ${num} font-semibold`}>{formatEUR2(r.subtotal)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={6} className={`${td} text-right`}>
                Zwischensumme Material + Verlegung
              </td>
              <td className={`${td} ${num} font-semibold`}>{formatEUR2(budget.netCost)}</td>
            </tr>
            <tr>
              <td colSpan={6} className={`${td} text-right`}>
                Verschnitt-Puffer ({budget.wastePercent} %)
              </td>
              <td className={`${td} ${num}`}>{formatEUR2(budget.wasteCost)}</td>
            </tr>
            <tr>
              <td colSpan={6} className="px-2 py-2 text-right text-[13px] font-bold">
                Gesamtsumme
              </td>
              <td className="px-2 py-2 text-right text-[14px] font-bold tabular-nums">{formatEUR2(budget.totalCost)}</td>
            </tr>
          </tfoot>
        </table>
      </section>

      <section className="print-avoid-break mb-5">
        <h2 className="mb-2 text-sm font-bold uppercase">Materialliste (inkl. Verschnitt)</h2>
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className={th}>Material</th>
              <th className={th}>Art</th>
              <th className={`${th} text-right`}>m² netto</th>
              <th className={`${th} text-right`}>m² inkl. Verschnitt</th>
              <th className={`${th} text-right`}>€/m²</th>
              <th className={`${th} text-right`}>Kosten</th>
            </tr>
          </thead>
          <tbody>
            {budget.materials.map((m) => (
              <tr key={`${m.kind}-${m.materialId}`}>
                <td className={td}>
                  <span
                    className="mr-2 inline-block size-3 rounded-sm border border-slate-400 align-middle"
                    style={{ background: getSurfaceMaterial(m.materialId).color }}
                  />
                  {m.name}
                </td>
                <td className={td}>{m.kind === "floor" ? "Boden" : "Wand"}</td>
                <td className={`${td} ${num}`}>{m.areaNet.toFixed(1).replace(".", ",")}</td>
                <td className={`${td} ${num}`}>{m.areaWithWaste.toFixed(1).replace(".", ",")}</td>
                <td className={`${td} ${num}`}>{m.pricePerM2}</td>
                <td className={`${td} ${num} font-semibold`}>{formatEUR(m.cost)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {report && plan.furniture.length > 0 && (
        <section className="print-avoid-break mb-5">
          <h2 className="mb-2 text-sm font-bold uppercase">Möblierung (nicht im Budget enthalten)</h2>
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className={th}>Möbel</th>
                <th className={th}>Maße B × H × T</th>
              </tr>
            </thead>
            <tbody>
              {plan.furniture.map((f) => (
                <tr key={f.id}>
                  <td className={td}>{f.name}</td>
                  <td className={td}>{f.dimensions.map((d) => d.toFixed(2).replace(".", ",")).join(" × ")} m</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      <section className="print-avoid-break text-[10.5px] leading-relaxed text-slate-600">
        <h2 className="mb-1 text-[11px] font-bold text-slate-800 uppercase">Annahmen &amp; Hinweise</h2>
        <ul className="list-disc pl-4">
          <li>Preise sind Richtwerte in € pro m² inkl. Material und geschätzter Verlegung; keine verbindliche Angebotsabgabe.</li>
          <li>Wandfläche netto = Länge × Deckenhöhe − Türen/Fenster. Innenwände werden für beide angrenzenden Räume gerechnet, Außenwände nur auf der Innenseite.</li>
          <li>Grundlage der Flächen sind die Wandmittellinien des Grundrisses; reale Maße können abweichen. Bitte vor Bestellung aufmaßen.</li>
          <li>Der Verschnitt-Puffer wird auf alle Flächen aufgeschlagen. Vorarbeiten (Untergrund, Entsorgung), Sockelleisten und MwSt.-Ausweis sind nicht enthalten.</li>
        </ul>
        {report && <div className="mt-2">Erstellt mit Plan2Space 3D – Pro-Report.</div>}
      </section>
    </div>
  );
}
