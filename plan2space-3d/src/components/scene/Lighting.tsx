"use client";

import { Environment, Lightformer } from "@react-three/drei";
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";

import { useStudio } from "@/store/useStudio";
import { planBounds } from "@/utils/geometry";

/** Studio-Setup: prozedurale Environment-Map (keine externen HDRIs), Sonne mit Schatten, Fülllicht. */
export function Lighting() {
  const hour = useStudio((s) => s.sunHour);
  const plan = useStudio((s) => s.plan);
  const b = useMemo(() => planBounds(plan), [plan]);
  const light = useRef<THREE.DirectionalLight>(null);

  const t = THREE.MathUtils.clamp((hour - 6) / 14, 0, 1);
  const A = t * Math.PI;
  const sinA = Math.sin(A);
  const elev = THREE.MathUtils.degToRad(9 + 54 * sinA);
  const R = b.span * 2 + 14;
  const position: [number, number, number] = [
    b.cx + Math.cos(A) * R * Math.cos(elev),
    R * Math.sin(elev),
    b.cz + (0.45 + 0.55 * sinA) * R * Math.cos(elev),
  ];
  const color = useMemo(
    () => new THREE.Color("#ff9d57").lerp(new THREE.Color("#fff6e8"), Math.pow(sinA, 0.5)),
    [sinA],
  );
  const intensity = 0.5 + 2.6 * Math.pow(sinA, 0.6);
  const extent = b.span * 0.85 + 4;

  useLayoutEffect(() => {
    const l = light.current;
    if (!l) return;
    const c = l.shadow.camera;
    c.left = -extent;
    c.right = extent;
    c.top = extent;
    c.bottom = -extent;
    c.near = 1;
    c.far = R * 3;
    c.updateProjectionMatrix();
    l.target.position.set(b.cx, 0, b.cz);
    l.target.updateMatrixWorld();
  }, [extent, R, b.cx, b.cz]);

  return (
    <>
      <ambientLight intensity={0.28} />
      <hemisphereLight args={["#dfe8ff", "#3a3326", 0.35]} />
      <directionalLight
        ref={light}
        position={position}
        intensity={intensity}
        color={color}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0005}
        shadow-normalBias={0.03}
      >
        <object3D attach="target" position={[b.cx, 0, b.cz]} />
      </directionalLight>
      <Environment resolution={256} environmentIntensity={0.6}>
        <Lightformer form="rect" intensity={3} position={[0, 9, 0]} rotation-x={Math.PI / 2} scale={[24, 24, 1]} color="#ffffff" />
        <Lightformer form="rect" intensity={1.4} position={[-10, 3, 2]} rotation-y={Math.PI / 2} scale={[14, 6, 1]} color="#cfe0ff" />
        <Lightformer form="rect" intensity={1.1} position={[10, 3, -3]} rotation-y={-Math.PI / 2} scale={[14, 6, 1]} color="#ffd9b0" />
        <Lightformer form="ring" intensity={1.5} position={[0, 4, 10]} scale={6} color="#b9a8ff" />
      </Environment>
    </>
  );
}
