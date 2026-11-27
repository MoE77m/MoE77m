"use client";

import { Grid } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useMemo } from "react";
import * as THREE from "three";

import { CameraRig } from "@/components/scene/CameraRig";
import { DimensionChains } from "@/components/scene/DimensionChains";
import { Furniture } from "@/components/scene/FurnitureModels";
import { Lighting } from "@/components/scene/Lighting";
import { Ceilings, Floors, Walls } from "@/components/scene/Surfaces";
import { useStudio } from "@/store/useStudio";
import { planBounds } from "@/utils/geometry";

function Ground() {
  const plan = useStudio((s) => s.plan);
  const b = useMemo(() => planBounds(plan), [plan]);
  return (
    <>
      {/* Schattenfänger außerhalb des Grundrisses */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[b.cx, -0.012, b.cz]} receiveShadow>
        <planeGeometry args={[b.span * 6, b.span * 6]} />
        <shadowMaterial opacity={0.28} />
      </mesh>
      <Grid
        position={[b.cx, -0.02, b.cz]}
        args={[10, 10]}
        cellSize={1}
        cellThickness={0.6}
        cellColor="#2b3040"
        sectionSize={5}
        sectionThickness={1}
        sectionColor="#3d4560"
        fadeDistance={b.span * 3 + 20}
        fadeStrength={1.4}
        infiniteGrid
      />
    </>
  );
}

export default function Scene3D() {
  const mode = useStudio((s) => s.cameraMode);
  const wallCut = useStudio((s) => s.wallCut);

  return (
    <Canvas
      shadows="percentage"
      dpr={[1, 2]}
      gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
      onPointerMissed={() => useStudio.getState().select(null)}
    >
      <color attach="background" args={["#0c0e14"]} />
      <fog attach="fog" args={["#0c0e14", 60, 220]} />
      <Lighting />
      <CameraRig />
      <Ground />
      <Floors />
      <Walls cut={wallCut && mode === "orbit"} />
      {mode === "walk" && <Ceilings />}
      <Furniture />
      {mode === "top" && <DimensionChains />}
    </Canvas>
  );
}
