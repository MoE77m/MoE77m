"use client";

import { Html, Line } from "@react-three/drei";
import { useMemo } from "react";

import { useStudio } from "@/store/useStudio";
import { polygonArea } from "@/utils/calculations";
import { formatM2, formatMeters } from "@/utils/format";
import { interiorPoint, planBounds, polygonBounds } from "@/utils/geometry";

type V3 = [number, number, number];
const Y = 0.08;
const COLOR = "#22d3ee";

function Chain({ from, to, label, offset = 0 }: { from: V3; to: V3; label: string; offset?: number }) {
  const horizontal = Math.abs(to[0] - from[0]) >= Math.abs(to[2] - from[2]);
  const tick = 0.12;
  const t1: V3[] = horizontal
    ? [
        [from[0], Y, from[2] - tick],
        [from[0], Y, from[2] + tick],
      ]
    : [
        [from[0] - tick, Y, from[2]],
        [from[0] + tick, Y, from[2]],
      ];
  const t2: V3[] = horizontal
    ? [
        [to[0], Y, to[2] - tick],
        [to[0], Y, to[2] + tick],
      ]
    : [
        [to[0] - tick, Y, to[2]],
        [to[0] + tick, Y, to[2]],
      ];
  const mid: V3 = [(from[0] + to[0]) / 2, Y, (from[2] + to[2]) / 2 + offset];
  return (
    <>
      <Line points={[from, to]} color={COLOR} lineWidth={1.6} />
      <Line points={t1} color={COLOR} lineWidth={1.6} />
      <Line points={t2} color={COLOR} lineWidth={1.6} />
      <Html position={mid} center zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
        <span className="dim-label">{label}</span>
      </Html>
    </>
  );
}

/** Maßketten für die 2D-Draufsicht: je Raum Breite/Tiefe + Gesamtmaße außen. */
export function DimensionChains() {
  const plan = useStudio((s) => s.plan);
  const b = useMemo(() => planBounds(plan), [plan]);

  return (
    <group>
      {plan.rooms.map((r) => {
        const rb = polygonBounds(r.polygon);
        const c = interiorPoint(r.polygon);
        const inset = 0.5;
        return (
          <group key={r.id}>
            {rb.width > 1.2 && (
              <Chain
                from={[rb.minX + 0.1, Y, rb.minZ + inset]}
                to={[rb.maxX - 0.1, Y, rb.minZ + inset]}
                label={formatMeters(rb.width)}
              />
            )}
            {rb.depth > 1.2 && (
              <Chain
                from={[rb.minX + inset, Y, rb.minZ + 0.1]}
                to={[rb.minX + inset, Y, rb.maxZ - 0.1]}
                label={formatMeters(rb.depth)}
              />
            )}
            <Html position={[c.x + 0.25, Y, c.z + 0.6]} center zIndexRange={[15, 0]} style={{ pointerEvents: "none" }}>
              <div className="room-label">
                <strong>{r.name}</strong>
                <span>{formatM2(polygonArea(r.polygon))}</span>
              </div>
            </Html>
          </group>
        );
      })}
      {/* Gesamtmaße außen */}
      <Chain from={[b.minX, Y, b.minZ - 0.9]} to={[b.maxX, Y, b.minZ - 0.9]} label={formatMeters(b.width)} />
      <Chain from={[b.minX - 0.9, Y, b.minZ]} to={[b.minX - 0.9, Y, b.maxZ]} label={formatMeters(b.depth)} />
    </group>
  );
}
