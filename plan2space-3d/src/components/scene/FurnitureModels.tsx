"use client";

import { Edges } from "@react-three/drei";
import { useThree, type ThreeEvent } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

import { getFurnitureCatalogItem } from "@/data/catalog";
import { useStudio } from "@/store/useStudio";
import type { FurnitureItem } from "@/types/floorplan";
import { planBounds, snapValue } from "@/utils/geometry";
import { interaction, suppressNextClick } from "@/utils/interaction";

type V3 = [number, number, number];

function B({ p, s, c, r = 0.7, m = 0 }: { p: V3; s: V3; c: string; r?: number; m?: number }) {
  return (
    <mesh position={p} castShadow receiveShadow>
      <boxGeometry args={s} />
      <meshStandardMaterial color={c} roughness={r} metalness={m} />
    </mesh>
  );
}

function Sofa({ d: [w, h, d], c }: { d: V3; c: string }) {
  const seatH = 0.42;
  const cushionW = (w - 0.48) / 3;
  return (
    <group>
      <B p={[0, seatH / 2, 0]} s={[w, seatH, d]} c={c} r={0.95} />
      <B p={[0, seatH + (h - seatH) / 2, -d / 2 + 0.12]} s={[w, h - seatH, 0.24]} c={c} r={0.95} />
      {[-1, 1].map((k) => (
        <B key={k} p={[k * (w / 2 - 0.12), 0.31, 0]} s={[0.24, 0.62, d]} c={c} r={0.95} />
      ))}
      {[-1, 0, 1].map((k) => (
        <B key={k} p={[k * (cushionW + 0.01), seatH + 0.07, 0.1]} s={[cushionW, 0.14, d - 0.34]} c="#6f7fa1" r={1} />
      ))}
    </group>
  );
}

function Bed({ d: [w, h, d], c }: { d: V3; c: string }) {
  return (
    <group>
      <B p={[0, 0.15, 0]} s={[w, 0.3, d]} c="#7a5a3c" r={0.6} />
      <B p={[0.05, 0.41, 0]} s={[w - 0.15, 0.22, d - 0.1]} c="#ece9e2" r={1} />
      <B p={[-w / 2 + 0.05, h / 2, 0]} s={[0.1, h, d]} c="#7a5a3c" r={0.6} />
      <B p={[0.35, 0.56, 0]} s={[w * 0.62, 0.1, d - 0.08]} c={c === "#d9d4cc" ? "#8da2b8" : c} r={1} />
      {[-1, 1].map((k) => (
        <B key={k} p={[-w / 2 + 0.4, 0.58, (k * d) / 4]} s={[0.4, 0.14, 0.7]} c="#fafafa" r={1} />
      ))}
    </group>
  );
}

function DiningTable({ d: [w, h, d], c }: { d: V3; c: string }) {
  const legs: V3[] = [
    [w / 2 - 0.09, (h - 0.04) / 2, d / 2 - 0.09],
    [-w / 2 + 0.09, (h - 0.04) / 2, d / 2 - 0.09],
    [w / 2 - 0.09, (h - 0.04) / 2, -d / 2 + 0.09],
    [-w / 2 + 0.09, (h - 0.04) / 2, -d / 2 + 0.09],
  ];
  const chairs: Array<[number, number]> = [];
  for (const x of [-0.55, 0, 0.55]) for (const side of [-1, 1]) chairs.push([x, side]);
  return (
    <group>
      <B p={[0, h - 0.02, 0]} s={[w, 0.04, d]} c={c} r={0.5} />
      {legs.map((p, i) => (
        <B key={i} p={p} s={[0.07, h - 0.04, 0.07]} c={c} r={0.5} />
      ))}
      {chairs.map(([x, side], i) => (
        <group key={i} position={[x, 0, side * (d / 2 + 0.12)]}>
          <B p={[0, 0.45, 0]} s={[0.42, 0.04, 0.42]} c="#3f4652" r={0.8} />
          <B p={[0, 0.7, side * 0.19]} s={[0.42, 0.46, 0.04]} c="#3f4652" r={0.8} />
          {[-1, 1].map((kx) =>
            [-1, 1].map((kz) => <B key={`${kx}${kz}`} p={[kx * 0.18, 0.22, kz * 0.18]} s={[0.03, 0.44, 0.03]} c="#2b2f36" />),
          )}
        </group>
      ))}
    </group>
  );
}

function KitchenBlock({ d: [w, h, d], c }: { d: V3; c: string }) {
  return (
    <group>
      <B p={[0, (h - 0.04) / 2, 0]} s={[w, h - 0.04, d]} c={c} r={0.4} />
      <B p={[0, h - 0.02, 0]} s={[w + 0.02, 0.04, d + 0.02]} c="#34363b" r={0.25} m={0.1} />
      {[-0.75, -0.25, 0.25, 0.75].map((k) => (
        <B key={k} p={[k * (w / 2) * 1.0, (h - 0.04) / 2, d / 2 + 0.004]} s={[0.012, h - 0.12, 0.006]} c="#b9b5ab" />
      ))}
      <B p={[-w / 4, h + 0.001, 0]} s={[0.62, 0.012, 0.4]} c="#8b9096" r={0.2} m={0.8} />
      {[
        [w / 4 - 0.15, -0.1],
        [w / 4 + 0.15, -0.1],
        [w / 4 - 0.15, 0.12],
        [w / 4 + 0.15, 0.12],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, h + 0.008, z]} castShadow>
          <cylinderGeometry args={[0.08, 0.08, 0.012, 20]} />
          <meshStandardMaterial color="#111214" roughness={0.3} />
        </mesh>
      ))}
    </group>
  );
}

function Wardrobe({ d: [w, h, d], c }: { d: V3; c: string }) {
  return (
    <group>
      <B p={[0, h / 2, 0]} s={[w, h, d]} c={c} r={0.55} />
      {[-w / 3, 0, w / 3].map((x) => (
        <B key={x} p={[x, h / 2, d / 2 + 0.004]} s={[0.012, h - 0.1, 0.006]} c="#9a958b" />
      ))}
      {[-w / 6, w / 6].map((x) => (
        <B key={x} p={[x, 1.0, d / 2 + 0.02]} s={[0.02, 0.35, 0.03]} c="#6b6f75" r={0.3} m={0.8} />
      ))}
    </group>
  );
}

function Desk({ d: [w, h, d], c }: { d: V3; c: string }) {
  return (
    <group>
      <B p={[0, h - 0.02, 0]} s={[w, 0.04, d]} c={c} r={0.55} />
      {[-1, 1].map((k) => (
        <B key={k} p={[k * (w / 2 - 0.03), (h - 0.04) / 2, 0]} s={[0.04, h - 0.04, d - 0.08]} c="#2d3036" r={0.5} />
      ))}
      <B p={[0, h - 0.24, -d / 2 + 0.05]} s={[w - 0.1, 0.38, 0.02]} c="#2d3036" r={0.5} />
      <B p={[0, h + 0.08, -d / 2 + 0.2]} s={[0.05, 0.16, 0.05]} c="#1a1b1e" />
      <B p={[0, h + 0.27, -d / 2 + 0.2]} s={[0.62, 0.36, 0.025]} c="#0f1013" r={0.2} />
      <B p={[0, h + 0.27, -d / 2 + 0.213]} s={[0.58, 0.32, 0.004]} c="#2a3f66" r={0.1} />
      <B p={[0, h + 0.01, 0.12]} s={[0.42, 0.015, 0.14]} c="#202226" />
    </group>
  );
}

function Model({ item, color }: { item: FurnitureItem; color: string }) {
  const d = item.dimensions as V3;
  // Modelle wachsen nach unten aus dem Bodenpunkt (y = 0).
  switch (item.catalogId) {
    case "sofa-3seat":
      return <Sofa d={d} c={color} />;
    case "bed-double":
      return <Bed d={d} c={color} />;
    case "dining-table":
      return <DiningTable d={d} c={color} />;
    case "kitchen-block":
      return <KitchenBlock d={d} c={color} />;
    case "wardrobe":
      return <Wardrobe d={d} c={color} />;
    case "desk-setup":
      return <Desk d={d} c={color} />;
    default:
      return <B p={[0, d[1] / 2, 0]} s={d} c={color} />;
  }
}

const GROUND = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

function FurnitureNode({ item }: { item: FurnitureItem }) {
  const get = useThree((s) => s.get);
  const selected = useStudio((s) => s.selection?.kind === "furniture" && s.selection.id === item.id);
  const color = getFurnitureCatalogItem(item.catalogId)?.color ?? "#999999";
  const ray = useRef(new THREE.Raycaster());
  const [w, h, d] = item.dimensions;

  const groundHit = (clientX: number, clientY: number): THREE.Vector3 | null => {
    const { camera, gl } = get();
    const rect = gl.domElement.getBoundingClientRect();
    const ndc = new THREE.Vector2(((clientX - rect.left) / rect.width) * 2 - 1, -(((clientY - rect.top) / rect.height) * 2 - 1));
    ray.current.setFromCamera(ndc, camera);
    return ray.current.ray.intersectPlane(GROUND, new THREE.Vector3());
  };

  const onPointerDown = (e: ThreeEvent<PointerEvent>) => {
    const st = useStudio.getState();
    if (e.button !== 0 || st.cameraMode === "walk") return;
    e.stopPropagation();
    st.select({ kind: "furniture", id: item.id });

    const start = groundHit(e.nativeEvent.clientX, e.nativeEvent.clientY);
    if (!start) return;
    const current = st.plan.furniture.find((f) => f.id === item.id) ?? item;
    const offX = current.position[0] - start.x;
    const offZ = current.position[2] - start.z;
    const bounds = planBounds(st.plan);

    const controls = get().controls as { enabled: boolean } | null;
    if (controls) controls.enabled = false;
    document.body.style.cursor = "grabbing";
    interaction.dragging = true;
    st.setHover(null);

    let started = false;
    const move = (ev: PointerEvent) => {
      const hit = groundHit(ev.clientX, ev.clientY);
      if (!hit) return;
      let x = hit.x + offX;
      let z = hit.z + offZ;
      if (useStudio.getState().snap) {
        x = snapValue(x, 0.1);
        z = snapValue(z, 0.1);
      }
      x = Math.min(bounds.maxX + 1, Math.max(bounds.minX - 1, x));
      z = Math.min(bounds.maxZ + 1, Math.max(bounds.minZ - 1, z));
      const cur = useStudio.getState().plan.furniture.find((f) => f.id === item.id);
      if (!cur || (Math.abs(cur.position[0] - x) < 1e-6 && Math.abs(cur.position[2] - z) < 1e-6)) return;
      if (!started) {
        started = true;
        useStudio.getState().beginFurnitureDrag(); // ein Undo-Schritt pro Drag
      }
      useStudio.getState().moveFurniture(item.id, x, z);
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      if (controls) controls.enabled = true;
      document.body.style.cursor = "";
      interaction.dragging = false;
      suppressNextClick();
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  };

  return (
    <group
      position={[item.position[0], 0, item.position[2]]}
      rotation={[0, item.rotationY, 0]}
      onPointerDown={onPointerDown}
      onPointerOver={() => {
        if (useStudio.getState().cameraMode !== "walk") document.body.style.cursor = "grab";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "";
      }}
    >
      <Model item={item} color={color} />
      {/* unsichtbare Hitbox über die gesamte Maß-Box (leichtes Greifen) */}
      <mesh position={[0, h / 2, 0]}>
        <boxGeometry args={[w, h, d]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        {selected && <Edges color="#22d3ee" threshold={15} />}
      </mesh>
    </group>
  );
}

export function Furniture() {
  const furniture = useStudio((s) => s.plan.furniture);
  return (
    <>
      {furniture.map((f) => (
        <FurnitureNode key={f.id} item={f} />
      ))}
    </>
  );
}
