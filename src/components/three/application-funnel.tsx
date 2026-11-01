"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group, Mesh } from "three";
import { SceneShell } from "./scene-shell";
import type { ScenePalette } from "./palette";

/**
 * The application funnel as stacked rings.
 *
 * Radius is the count at each stage, so the taper is the drop-off. A stage
 * with no applications in it still gets a ring, drawn hollow: an empty
 * interview stage is information, and collapsing it to nothing would hide
 * the one thing the chart exists to show.
 */

export interface FunnelStage {
  stage: string;
  count: number;
}

function Ring({
  stage,
  index,
  total,
  maxCount,
  palette,
}: {
  stage: FunnelStage;
  index: number;
  total: number;
  maxCount: number;
  palette: ScenePalette;
}) {
  const mesh = useRef<Mesh>(null);
  const empty = stage.count === 0;

  // Floor the radius so an empty stage is still a visible ring.
  const radius = 0.34 + (stage.count / Math.max(1, maxCount)) * 1.18;
  const y = ((total - 1) / 2 - index) * 0.52;

  useFrame(({ clock }) => {
    if (!mesh.current) return;
    // The mesh is already rotated 90 degrees on X to lie flat, so its own
    // axis is now local Z. Spinning Y here would roll the ring edge-on.
    mesh.current.rotation.z = clock.elapsedTime * 0.2 + index * 0.4;
  });

  return (
    <group position={[0, y, 0]}>
      <mesh ref={mesh} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius, 0.055, 12, 48]} />
        <meshStandardMaterial
          color={empty ? palette.figureDark : palette.rim}
          roughness={0.3}
          metalness={0.5}
          emissive={empty ? palette.figureDark : palette.rim}
          emissiveIntensity={empty ? 0.08 : 0.4}
          transparent={empty}
          opacity={empty ? 0.55 : 1}
        />
      </mesh>

      {/* A filled disc inside each non-empty ring reads as volume. */}
      {!empty && (
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[radius - 0.05, 48]} />
          <meshBasicMaterial color={palette.rim} transparent opacity={0.1} />
        </mesh>
      )}
    </group>
  );
}

function FunnelScene({ stages, palette }: { stages: FunnelStage[]; palette: ScenePalette }) {
  const stack = useRef<Group>(null);
  const maxCount = Math.max(...stages.map((stage) => stage.count), 1);

  useFrame(({ clock }) => {
    if (!stack.current) return;
    stack.current.rotation.y = Math.sin(clock.elapsedTime * 0.18) * 0.22;
    stack.current.rotation.x = Math.sin(clock.elapsedTime * 0.12) * 0.025;
  });

  return (
    <>
      <ambientLight intensity={1.6} />
      <directionalLight position={[3, 5, 4]} intensity={2.2} color={palette.key} />
      <pointLight position={[-3, -2, 3]} intensity={1.8} color={palette.rim} />

      <group ref={stack}>
        {stages.map((stage, index) => (
          <Ring
            key={stage.stage}
            stage={stage}
            index={index}
            total={stages.length}
            maxCount={maxCount}
            palette={palette}
          />
        ))}
      </group>
    </>
  );
}

export function ApplicationFunnel3D({
  stages,
  className,
  fallback,
}: {
  stages: FunnelStage[];
  className?: string;
  fallback: React.ReactNode;
}) {
  return (
    <SceneShell
      className={className}
      // Raised and looking down: the rings lie flat, so a level camera would
      // show them edge-on as four lines instead of a taper.
      canvasProps={{ camera: { position: [0, 2.05, 4.1], fov: 42 } }}
      fallback={fallback}
    >
      {(palette) => <FunnelScene stages={stages} palette={palette} />}
    </SceneShell>
  );
}
