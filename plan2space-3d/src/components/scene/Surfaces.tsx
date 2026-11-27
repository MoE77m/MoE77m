"use client";

import { Edges, Line } from "@react-three/drei";
import type { ThreeEvent } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import * as THREE from "three";

import { getFloorMaterial, getWallMaterial } from "@/data/catalog";
import { useStudio } from "@/store/useStudio";
import type { Room, Wall } from "@/types/floorplan";
import { buildWallBoxes, resolveOpenings, wallLength, type WallBox } from "@/utils/geometry";
import { interaction } from "@/utils/interaction";
import { getMaterialTexture } from "@/utils/textures";

const HOVER_EMISSIVE = "#6d5dfc";
const ACCENT = "#22d3ee";

/* ------------------------------------------------------------------ */
/* Gemeinsame Interaktion                                              */
/* ------------------------------------------------------------------ */

function useSurfaceHandlers(kind: "room" | "wall", id: string) {
  const setHover = useStudio((s) => s.setHover);
  const setHoverPos = useStudio((s) => s.setHoverPos);

  return useMemo(
    () => ({
      // Wände/Böden blockieren pointerdown, damit dahinterliegende Möbel nicht "durchgeklickt" werden.
      onPointerDown: (e: ThreeEvent<PointerEvent>) => e.stopPropagation(),
      onPointerMove: (e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        if (interaction.dragging) return; // kein Tooltip/Highlight beim Möbel-Ziehen
        setHover({ kind, id });
        setHoverPos(e.nativeEvent.clientX, e.nativeEvent.clientY);
      },
      onPointerOut: () => {
        const cur = useStudio.getState().hover;
        if (cur?.kind === kind && cur.id === id) setHover(null);
      },
      onClick: (e: ThreeEvent<MouseEvent>) => {
        if (e.delta > 4 || interaction.suppressClick) return;
        e.stopPropagation();
        const s = useStudio.getState();
        s.select({ kind, id });
        // Klick-zum-Ändern: aktuell gewähltes Material der Sidebar anwenden
        if (kind === "room" && s.tab === "floors") s.setRoomFloor(id, s.activeFloorMaterialId);
        if (kind === "wall" && s.tab === "walls") s.setWallMaterial(id, s.activeWallMaterialId);
      },
    }),
    [kind, id, setHover, setHoverPos],
  );
}

/* ------------------------------------------------------------------ */
/* Böden                                                               */
/* ------------------------------------------------------------------ */

function RoomFloor({ room }: { room: Room }) {
  const handlers = useSurfaceHandlers("room", room.id);
  const hovered = useStudio((s) => s.hover?.kind === "room" && s.hover.id === room.id);
  const selected = useStudio((s) => s.selection?.kind === "room" && s.selection.id === room.id);
  const mat = getFloorMaterial(room.floorMaterialId);
  const texture = useMemo(() => getMaterialTexture(mat.id), [mat.id]);

  // Shape in der XY-Ebene (y = -z), danach flach legen → UVs bleiben in Metern (kein Verzerren).
  const geometry = useMemo(() => {
    const shape = new THREE.Shape(room.polygon.map((p) => new THREE.Vector2(p.x, -p.z)));
    const g = new THREE.ShapeGeometry(shape);
    g.rotateX(-Math.PI / 2);
    return g;
  }, [room.polygon]);
  useEffect(() => () => geometry.dispose(), [geometry]);

  const outline = useMemo(
    () => [...room.polygon, room.polygon[0]].map((p) => [p.x, 0.02, p.z] as [number, number, number]),
    [room.polygon],
  );

  return (
    <group>
      <mesh geometry={geometry} receiveShadow {...handlers}>
        <meshStandardMaterial
          map={texture}
          roughness={mat.roughness}
          metalness={mat.metalness}
          emissive={hovered ? HOVER_EMISSIVE : "#000000"}
          emissiveIntensity={hovered ? 0.35 : 0}
        />
      </mesh>
      {selected && <Line points={outline} color={ACCENT} lineWidth={3} />}
    </group>
  );
}

export function Floors() {
  const rooms = useStudio((s) => s.plan.rooms);
  return (
    <>
      {rooms.map((r) => (
        <RoomFloor key={r.id} room={r} />
      ))}
    </>
  );
}

/** Decken – nur im Ego-Modus, damit es sich wie ein echter Raum anfühlt. */
export function Ceilings() {
  const rooms = useStudio((s) => s.plan.rooms);
  const H = useStudio((s) => s.plan.meta.ceilingHeightMeters);
  const geos = useMemo(
    () =>
      rooms.map((r) => {
        const g = new THREE.ShapeGeometry(new THREE.Shape(r.polygon.map((p) => new THREE.Vector2(p.x, p.z))));
        g.rotateX(Math.PI / 2);
        return g;
      }),
    [rooms],
  );
  useEffect(() => () => geos.forEach((g) => g.dispose()), [geos]);
  return (
    <>
      {geos.map((g, i) => (
        <mesh key={rooms[i].id} geometry={g} position={[0, H, 0]}>
          <meshStandardMaterial color="#f2f0eb" roughness={0.95} emissive="#f2f0eb" emissiveIntensity={0.4} />
        </mesh>
      ))}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Wände mit echten Aussparungen                                       */
/* ------------------------------------------------------------------ */

function WallPiece({
  box,
  thickness,
  materialId,
  hovered,
  selected,
}: {
  box: WallBox;
  thickness: number;
  materialId: string;
  hovered: boolean;
  selected: boolean;
}) {
  const mat = getWallMaterial(materialId);
  const texture = useMemo(() => getMaterialTexture(mat.id), [mat.id]);

  // Box mit UVs in Metern, damit Fliesen/Lamellen/Klinker maßstabsgetreu bleiben.
  const geometry = useMemo(() => {
    const w = box.u1 - box.u0;
    const h = box.y1 - box.y0;
    const cx = (box.u0 + box.u1) / 2;
    const cy = (box.y0 + box.y1) / 2;
    const g = new THREE.BoxGeometry(w, h, thickness);
    const pos = g.attributes.position;
    const nor = g.attributes.normal;
    const uv = g.attributes.uv;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i) + cx;
      const y = pos.getY(i) + cy;
      const z = pos.getZ(i);
      if (Math.abs(nor.getZ(i)) > 0.5) uv.setXY(i, x, y);
      else if (Math.abs(nor.getX(i)) > 0.5) uv.setXY(i, z, y);
      else uv.setXY(i, x, z);
    }
    g.translate(cx, cy, 0);
    return g;
  }, [box, thickness]);
  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <mesh geometry={geometry} castShadow receiveShadow>
      <meshStandardMaterial
        map={texture}
        roughness={mat.roughness}
        metalness={mat.metalness}
        emissive={hovered ? HOVER_EMISSIVE : "#000000"}
        emissiveIntensity={hovered ? 0.4 : 0}
      />
      {selected && <Edges color={ACCENT} threshold={20} />}
    </mesh>
  );
}

const FRAME = "#eceae4";

function WindowFitting({ a, b, bottom, top, t }: { a: number; b: number; bottom: number; top: number; t: number }) {
  const w = b - a;
  const h = top - bottom;
  const f = 0.05;
  const depth = Math.min(t * 0.7, 0.1);
  const cx = (a + b) / 2;
  const cy = (bottom + top) / 2;
  return (
    <group position={[cx, cy, 0]}>
      {/* Rahmen */}
      <mesh position={[0, h / 2 - f / 2, 0]} castShadow>
        <boxGeometry args={[w, f, depth]} />
        <meshStandardMaterial color={FRAME} roughness={0.5} />
      </mesh>
      <mesh position={[0, -h / 2 + f / 2, 0]} castShadow>
        <boxGeometry args={[w, f, depth]} />
        <meshStandardMaterial color={FRAME} roughness={0.5} />
      </mesh>
      <mesh position={[-w / 2 + f / 2, 0, 0]} castShadow>
        <boxGeometry args={[f, h, depth]} />
        <meshStandardMaterial color={FRAME} roughness={0.5} />
      </mesh>
      <mesh position={[w / 2 - f / 2, 0, 0]} castShadow>
        <boxGeometry args={[f, h, depth]} />
        <meshStandardMaterial color={FRAME} roughness={0.5} />
      </mesh>
      {w > 1.1 && (
        <mesh castShadow>
          <boxGeometry args={[0.035, h - 2 * f, depth * 0.8]} />
          <meshStandardMaterial color={FRAME} roughness={0.5} />
        </mesh>
      )}
      {/* Glas: leicht transparent und reflektierend */}
      <mesh>
        <planeGeometry args={[w - 2 * f, h - 2 * f]} />
        <meshPhysicalMaterial
          color="#bfe4f7"
          transparent
          opacity={0.22}
          roughness={0.04}
          metalness={0.1}
          clearcoat={1}
          clearcoatRoughness={0.03}
          envMapIntensity={1.6}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

function DoorFitting({ a, b, top, t }: { a: number; b: number; top: number; t: number }) {
  const w = b - a;
  const f = 0.06;
  const depth = t + 0.02;
  const hasLeaf = w <= 1.15;
  return (
    <group>
      <mesh position={[a + f / 2, top / 2, 0]} castShadow>
        <boxGeometry args={[f, top, depth]} />
        <meshStandardMaterial color={FRAME} roughness={0.55} />
      </mesh>
      <mesh position={[b - f / 2, top / 2, 0]} castShadow>
        <boxGeometry args={[f, top, depth]} />
        <meshStandardMaterial color={FRAME} roughness={0.55} />
      </mesh>
      <mesh position={[(a + b) / 2, top - f / 2, 0]} castShadow>
        <boxGeometry args={[w, f, depth]} />
        <meshStandardMaterial color={FRAME} roughness={0.55} />
      </mesh>
      {hasLeaf && (
        // Tür leicht geöffnet (Scharnier links)
        <group position={[a + f, 0, 0]} rotation={[0, -1.15, 0]}>
          <mesh position={[(w - 2 * f) / 2, (top - f) / 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[w - 2 * f, top - f, 0.04]} />
            <meshStandardMaterial color="#b58d62" roughness={0.6} />
          </mesh>
          <mesh position={[w - 2 * f - 0.08, 1.0, 0.04]} castShadow>
            <boxGeometry args={[0.12, 0.02, 0.02]} />
            <meshStandardMaterial color="#9aa0a6" metalness={0.8} roughness={0.3} />
          </mesh>
        </group>
      )}
    </group>
  );
}

function WallMesh({ wall, index, height, cut }: { wall: Wall; index: number; height: number; cut: boolean }) {
  const handlers = useSurfaceHandlers("wall", wall.id);
  const hovered = useStudio((s) => s.hover?.kind === "wall" && s.hover.id === wall.id);
  const selected = useStudio((s) => s.selection?.kind === "wall" && s.selection.id === wall.id);

  const effective = (cut ? Math.min(height, 1.1) : height) - (index % 7) * 0.0007; // gegen Z-Fighting an Ecken
  const boxes = useMemo(() => buildWallBoxes(wall, effective), [wall, effective]);
  const fittings = useMemo(() => (cut ? [] : resolveOpenings(wall, effective)), [wall, effective, cut]);
  const angle = -Math.atan2(wall.end.z - wall.start.z, wall.end.x - wall.start.x);

  return (
    <group position={[wall.start.x, 0, wall.start.z]} rotation={[0, angle, 0]}>
      <group {...handlers}>
        {boxes.map((box, i) => (
          <WallPiece
            key={i}
            box={box}
            thickness={wall.thickness}
            materialId={wall.wallMaterialId}
            hovered={hovered}
            selected={selected}
          />
        ))}
      </group>
      {fittings.map((o, i) =>
        o.opening.type === "window" ? (
          <WindowFitting key={i} a={o.a} b={o.b} bottom={o.bottom} top={o.top} t={wall.thickness} />
        ) : (
          <DoorFitting key={i} a={o.a} b={o.b} top={o.top} t={wall.thickness} />
        ),
      )}
    </group>
  );
}

export function Walls({ cut }: { cut: boolean }) {
  const walls = useStudio((s) => s.plan.walls);
  const H = useStudio((s) => s.plan.meta.ceilingHeightMeters);
  return (
    <>
      {walls
        .filter((w) => wallLength(w) > 0.01)
        .map((w, i) => (
          <WallMesh key={w.id} wall={w} index={i} height={H} cut={cut} />
        ))}
    </>
  );
}
