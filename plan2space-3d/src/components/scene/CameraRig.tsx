"use client";

import { OrbitControls, OrthographicCamera, PerspectiveCamera } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

import { useStudio } from "@/store/useStudio";
import { planBounds, resolveCollision, wallBlockers } from "@/utils/geometry";

const EYE_HEIGHT = 1.7;
const BODY_RADIUS = 0.25;

function WalkControls() {
  const get = useThree((s) => s.get);
  const gl = useThree((s) => s.gl);
  const plan = useStudio((s) => s.plan);
  const start = useStudio((s) => s.walkStart);
  const blockers = useMemo(() => wallBlockers(plan), [plan]);
  const bounds = useMemo(() => planBounds(plan), [plan]);

  const yaw = useRef(0);
  const pitch = useRef(0);
  const pos = useRef({ x: start.x, z: start.z });
  const keys = useRef(new Set<string>());

  // Startposition: Raummitte, Blick zur Planmitte
  useEffect(() => {
    pos.current = { x: start.x, z: start.z };
    const dx = bounds.cx - start.x;
    const dz = bounds.cz - start.z;
    yaw.current = Math.hypot(dx, dz) > 0.3 ? Math.atan2(-dx, -dz) : 0;
    pitch.current = 0;
    const cam = get().camera;
    cam.position.set(start.x, EYE_HEIGHT, start.z);
    cam.rotation.order = "YXZ";
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [start]);

  // Tastatur
  useEffect(() => {
    const typing = (t: EventTarget | null) =>
      t instanceof HTMLElement && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT");
    const down = (e: KeyboardEvent) => {
      if (typing(e.target) || e.ctrlKey || e.metaKey) return;
      const k = e.key.toLowerCase();
      if (["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright", "shift"].includes(k)) {
        keys.current.add(k);
        if (k.startsWith("arrow")) e.preventDefault();
      }
    };
    const up = (e: KeyboardEvent) => keys.current.delete(e.key.toLowerCase());
    const blur = () => keys.current.clear();
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", blur);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", blur);
    };
  }, []);

  // Umschauen: Maus ziehen (funktioniert überall, ohne Pointer-Lock)
  useEffect(() => {
    const el = gl.domElement;
    let dragging = false;
    let lx = 0;
    let ly = 0;
    const down = (e: PointerEvent) => {
      if (e.button !== 0) return;
      dragging = true;
      lx = e.clientX;
      ly = e.clientY;
      el.setPointerCapture?.(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      if (!dragging) return;
      yaw.current -= (e.clientX - lx) * 0.0035;
      pitch.current = Math.max(-1.25, Math.min(1.25, pitch.current - (e.clientY - ly) * 0.0035));
      lx = e.clientX;
      ly = e.clientY;
    };
    const up = (e: PointerEvent) => {
      dragging = false;
      el.releasePointerCapture?.(e.pointerId);
    };
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    return () => {
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
    };
  }, [gl]);

  useFrame(({ camera }, dt) => {
    const k = keys.current;
    const step = Math.min(dt, 0.05);
    const turn = (k.has("arrowleft") ? 1 : 0) - (k.has("arrowright") ? 1 : 0);
    yaw.current += turn * 1.9 * step;

    const fwd = (k.has("w") || k.has("arrowup") ? 1 : 0) - (k.has("s") || k.has("arrowdown") ? 1 : 0);
    const side = (k.has("d") ? 1 : 0) - (k.has("a") ? 1 : 0);
    if (fwd !== 0 || side !== 0) {
      const speed = (k.has("shift") ? 3.2 : 1.7) * step;
      const sy = Math.sin(yaw.current);
      const cy = Math.cos(yaw.current);
      const len = Math.hypot(fwd, side) || 1;
      const mx = ((-sy * fwd + cy * side) / len) * speed;
      const mz = ((-cy * fwd - sy * side) / len) * speed;
      pos.current = resolveCollision(
        { x: pos.current.x + mx, z: pos.current.z + mz },
        blockers,
        BODY_RADIUS,
      );
    }
    camera.position.set(pos.current.x, EYE_HEIGHT, pos.current.z);
    camera.rotation.set(pitch.current, yaw.current, 0, "YXZ");
  });

  return null;
}

export function CameraRig() {
  const mode = useStudio((s) => s.cameraMode);
  const nonce = useStudio((s) => s.viewNonce);
  const plan = useStudio((s) => s.plan);
  const size = useThree((s) => s.size);
  const b = useMemo(() => planBounds(plan), [plan]);
  const start = useStudio((s) => s.walkStart);

  if (mode === "top") {
    const zoom = Math.min(size.width / (b.width + 5), size.height / (b.depth + 5));
    return (
      <>
        <OrthographicCamera
          key={`top-${nonce}`}
          makeDefault
          position={[b.cx, 60, b.cz + 0.001]}
          zoom={Math.max(zoom, 5)}
          near={0.1}
          far={300}
        />
        <OrbitControls
          key={`top-ctl-${nonce}`}
          makeDefault
          target={[b.cx, 0, b.cz]}
          enableRotate={false}
          screenSpacePanning
          mouseButtons={{ LEFT: THREE.MOUSE.PAN, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.PAN }}
          minZoom={8}
          maxZoom={160}
        />
      </>
    );
  }

  if (mode === "walk") {
    return (
      <>
        <PerspectiveCamera
          key={`walk-${nonce}`}
          makeDefault
          fov={72}
          near={0.05}
          far={300}
          position={[start.x, EYE_HEIGHT, start.z]}
        />
        <WalkControls key={`walk-ctl-${nonce}`} />
      </>
    );
  }

  return (
    <>
      <PerspectiveCamera
        key={`orbit-${nonce}`}
        makeDefault
        fov={42}
        near={0.1}
        far={400}
        position={[b.cx + b.span * 0.55, b.span * 0.95 + 3, b.cz + b.span * 0.95]}
      />
      <OrbitControls
        key={`orbit-ctl-${nonce}`}
        makeDefault
        target={[b.cx, 0, b.cz]}
        enableDamping
        dampingFactor={0.08}
        minDistance={2.5}
        maxDistance={b.span * 3 + 10}
        minPolarAngle={0.05}
        maxPolarAngle={Math.PI / 2 - 0.05} // nie unter den Boden
        zoomToCursor={false}
      />
    </>
  );
}
