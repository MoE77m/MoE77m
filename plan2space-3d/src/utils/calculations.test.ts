/**
 * Unit-Tests (Node-Testrunner):  npm test
 */
import assert from "node:assert/strict";
import { test } from "node:test";

import type { FloorplanData } from "@/types/floorplan";
import {
  computeBudget,
  openingsArea,
  polygonArea,
  wallNetArea,
  wallSideShares,
} from "@/utils/calculations";
import { buildWallBoxes, resolveCollision, wallBlockers } from "@/utils/geometry";

const close = (a: number, b: number, eps = 1e-6) =>
  assert.ok(Math.abs(a - b) < eps, `${a} ≉ ${b}`);

/** Zwei 4×3-m-Räume nebeneinander, Trennwand mit Tür, Außenwand mit Fenster. */
function twoRoomPlan(): FloorplanData {
  const wall = (id: string, x1: number, z1: number, x2: number, z2: number, openings = [] as FloorplanData["walls"][0]["openings"]) => ({
    id,
    start: { x: x1, z: z1 },
    end: { x: x2, z: z2 },
    thickness: 0.15,
    wallMaterialId: "white-plaster",
    openings,
  });
  return {
    meta: { name: "test", ceilingHeightMeters: 2.5, unit: "meters" },
    rooms: [
      {
        id: "a",
        name: "A",
        floorMaterialId: "oak-parquet",
        polygon: [
          { x: 0, z: 0 },
          { x: 4, z: 0 },
          { x: 4, z: 3 },
          { x: 0, z: 3 },
        ],
      },
      {
        id: "b",
        name: "B",
        floorMaterialId: "ceramic-tile",
        polygon: [
          { x: 4, z: 0 },
          { x: 8, z: 0 },
          { x: 8, z: 3 },
          { x: 4, z: 3 },
        ],
      },
    ],
    walls: [
      wall("n1", 0, 0, 4, 0),
      wall("n2", 4, 0, 8, 0),
      wall("e", 8, 0, 8, 3),
      wall("s2", 8, 3, 4, 3),
      wall("s1", 4, 3, 0, 3, [{ type: "window", positionRatio: 0.5, width: 2, height: 1.2, elevation: 1 }]),
      wall("w", 0, 3, 0, 0),
      wall("mid", 4, 0, 4, 3, [{ type: "door", positionRatio: 0.5, width: 1, height: 2.1, elevation: 0 }]),
    ],
    furniture: [],
  };
}

test("polygonArea: Rechteck 4 × 5 = 20 m²", () => {
  close(
    polygonArea([
      { x: 0, z: 0 },
      { x: 4, z: 0 },
      { x: 4, z: 5 },
      { x: 0, z: 5 },
    ]),
    20,
  );
});

test("polygonArea: unabhängig von Umlaufsinn und Verschiebung", () => {
  const cw = [
    { x: 10, z: 10 },
    { x: 10, z: 13 },
    { x: 14, z: 13 },
    { x: 14, z: 10 },
  ];
  close(polygonArea(cw), 12);
  close(polygonArea([...cw].reverse()), 12);
});

test("polygonArea: L-Form (4×4 minus 2×2 = 12) und Dreieck", () => {
  close(
    polygonArea([
      { x: 0, z: 0 },
      { x: 4, z: 0 },
      { x: 4, z: 2 },
      { x: 2, z: 2 },
      { x: 2, z: 4 },
      { x: 0, z: 4 },
    ]),
    12,
  );
  close(
    polygonArea([
      { x: 0, z: 0 },
      { x: 6, z: 0 },
      { x: 0, z: 4 },
    ]),
    12,
  );
  assert.equal(polygonArea([{ x: 0, z: 0 }, { x: 1, z: 1 }]), 0);
});

test("Netto-Wandfläche = Länge × Höhe − Öffnungen", () => {
  const plan = twoRoomPlan();
  const s1 = plan.walls.find((w) => w.id === "s1")!;
  close(openingsArea(s1, 2.5), 2 * 1.2);
  close(wallNetArea(s1, 2.5), 4 * 2.5 - 2.4);
  const mid = plan.walls.find((w) => w.id === "mid")!;
  close(wallNetArea(mid, 2.5), 3 * 2.5 - 2.1);
});

test("Innenwand zählt für beide Räume, Außenwand nur für die Innenseite", () => {
  const plan = twoRoomPlan();
  const mid = wallSideShares(plan, plan.walls.find((w) => w.id === "mid")!);
  assert.equal(mid.length, 2);
  mid.forEach((s) => close(s.fraction, 1));
  const north = wallSideShares(plan, plan.walls.find((w) => w.id === "n1")!);
  assert.equal(north.length, 1);
  assert.equal(north[0].roomId, "a");
  close(north[0].fraction, 1);
});

test("computeBudget: Summen, Verschnitt und Raumaufteilung", () => {
  const plan = twoRoomPlan();
  const b = computeBudget(plan, 10);
  close(b.floorArea, 24);
  // Boden: A 12 m² × 68 + B 12 m² × 54
  close(b.floorCost, 12 * 68 + 12 * 54);
  // Wände (14 €/m²): A = n1 + s1 + w + mid; B = n2 + e + s2 + mid
  const aWall = 10 + (10 - 2.4) + 7.5 + (7.5 - 2.1);
  const bWall = 10 + 7.5 + 10 + (7.5 - 2.1);
  close(b.rooms[0].wallArea, aWall);
  close(b.rooms[1].wallArea, bWall);
  close(b.wallArea, aWall + bWall);
  close(b.wallCost, (aWall + bWall) * 14);
  close(b.netCost, b.floorCost + b.wallCost);
  close(b.wasteCost, b.netCost * 0.1);
  close(b.totalCost, b.netCost * 1.1);
  close(
    b.rooms.reduce((s, r) => s + r.subtotal, 0),
    b.netCost,
  );
  // Materialliste enthält Verschnitt
  const parquet = b.materials.find((m) => m.materialId === "oak-parquet")!;
  close(parquet.areaWithWaste, 12 * 1.1);
});

test("computeBudget: 0 % Verschnitt", () => {
  const b = computeBudget(twoRoomPlan(), 0);
  close(b.wasteCost, 0);
  close(b.totalCost, b.netCost);
});

test("buildWallBoxes: echte Aussparungen (Tür, Fenster mit Brüstung)", () => {
  const plan = twoRoomPlan();
  // Tür: links + rechts + Sturz = 3 Boxen
  const door = buildWallBoxes(plan.walls.find((w) => w.id === "mid")!, 2.5, 0);
  assert.equal(door.length, 3);
  assert.ok(door.some((b) => b.y0 === 0 && b.y1 === 2.5 && b.u0 < 0.5));
  assert.ok(door.some((b) => b.y0 > 2 && b.y1 === 2.5)); // Sturz
  // Fenster: links + rechts + Brüstung + Sturz = 4 Boxen
  const win = buildWallBoxes(plan.walls.find((w) => w.id === "s1")!, 2.5, 0);
  assert.equal(win.length, 4);
  assert.ok(win.some((b) => b.y0 === 0 && b.y1 === 1)); // Brüstung
  // Fläche der Frontansicht = Brutto − Öffnung
  const front = win.reduce((s, b) => s + (b.u1 - b.u0) * (b.y1 - b.y0), 0);
  close(front, 4 * 2.5 - 2 * 1.2);
});

test("Ego-Kollision: Türen sind passierbar, Wände und Fenster blockieren", () => {
  const plan = twoRoomPlan();
  const blockers = wallBlockers(plan);
  // Durch die Tür in der Trennwand (x = 4, z = 1.5 ± 0.5) kann man gehen:
  const throughDoor = resolveCollision({ x: 4, z: 1.5 }, blockers, 0.25);
  close(throughDoor.x, 4);
  close(throughDoor.z, 1.5);
  // Neben der Tür (z = 0.5) wird man aus der Wand geschoben:
  const atWall = resolveCollision({ x: 4.01, z: 0.5 }, blockers, 0.25);
  assert.ok(Math.abs(atWall.x - 4) >= 0.25 + 0.075 - 1e-6);
  // Fenster (elevation 1) ist keine Tür → blockiert weiter
  const atWindow = resolveCollision({ x: 2, z: 3 }, blockers, 0.25);
  assert.ok(Math.abs(atWindow.z - 3) >= 0.25 + 0.075 - 1e-6);
});
