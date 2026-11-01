"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import type { Group, Mesh } from "three";
import { SceneShell } from "./scene-shell";
import type { ScenePalette } from "./palette";

/**
 * The plan as a path.
 *
 * Each week is a platform, rising toward the target role at the far end. It
 * encodes two things a progress bar cannot: that the weeks are sequenced, and
 * that the target is still ahead of the last one. The marker floating over the
 * current week is where you actually are.
 */

export interface PathStep {
  label: string;
  status: "completed" | "current" | "upcoming";
  /** Share of the week's committed minutes that are done, 0 to 1. */
  progress: number;
}

function Platform({
  step,
  index,
  total,
  palette,
}: {
  step: PathStep;
  index: number;
  total: number;
  palette: ScenePalette;
}) {
  const mesh = useRef<Mesh>(null);
  const spacing = 1.34;
  const x = (index - (total - 1) / 2) * spacing;
  const y = index * 0.17;

  const done = step.status === "completed";
  const current = step.status === "current";

  useFrame(({ clock }) => {
    if (!mesh.current || !current) return;
    // Only the current week breathes. If every platform pulsed, none of them
    // would be telling you anything.
    const pulse = 1 + Math.sin(clock.elapsedTime * 1.6) * 0.03;
    mesh.current.scale.set(pulse, 1, pulse);
  });

  return (
    <group position={[x, y, 0]}>
      <mesh ref={mesh} position={[0, -0.06, 0]}>
        <cylinderGeometry args={[0.44, 0.47, 0.13, 6]} />
        <meshStandardMaterial
          color={done || current ? palette.rim : palette.figureDark}
          roughness={done ? 0.24 : 0.62}
          metalness={done ? 0.45 : 0.15}
          // Completed and current both glow; upcoming weeks stay matte, which
          // is what makes the sequence legible at a glance.
          emissive={done || current ? palette.rim : palette.figure}
          emissiveIntensity={current ? 0.6 : done ? 0.32 : 0.12}
          transparent={step.status === "upcoming"}
          opacity={step.status === "upcoming" ? 0.72 : 1}
        />
      </mesh>

      {/* Completed weeks carry a filled cap; the current one carries a ring. */}
      {done && (
        <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.3, 6]} />
          <meshBasicMaterial color={palette.rim} transparent opacity={0.55} />
        </mesh>
      )}
      {current && (
        <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.24, 0.31, 6]} />
          <meshBasicMaterial color={palette.rim} />
        </mesh>
      )}

      {current && (
        <Float speed={2.1} rotationIntensity={0.7} floatIntensity={0.5}>
          <mesh position={[0, 0.58, 0]}>
            <icosahedronGeometry args={[0.15, 1]} />
            <meshStandardMaterial
              color={palette.rim}
              emissive={palette.rim}
              emissiveIntensity={0.7}
              roughness={0.2}
              metalness={0.5}
            />
          </mesh>
        </Float>
      )}
    </group>
  );
}

function PathScene({ steps, palette }: { steps: PathStep[]; palette: ScenePalette }) {
  const stage = useRef<Group>(null);

  useFrame(({ clock }) => {
    if (!stage.current) return;
    // A slow sway, not a spin. The path has a direction and spinning it would
    // destroy the left-to-right reading.
    stage.current.rotation.y = -0.44 + Math.sin(clock.elapsedTime * 0.22) * 0.09;
  });

  const spacing = 1.34;
  const goalX = (steps.length - (steps.length - 1) / 2) * spacing - 0.2;

  return (
    <>
      <ambientLight intensity={1.8} />
      <directionalLight position={[3, 5, 4]} intensity={2.6} color={palette.key} />
      <pointLight position={[-3, 1, 3]} intensity={2.2} color={palette.rim} />
      <pointLight position={[2, 2, 4]} intensity={1.4} color={palette.key} />

      {/* Shifted left so the goal pillar at the far end stays in frame. */}
      {/* Uniform scale keeps longer plans (8 weeks) inside the frame. */}
      <group ref={stage} position={[-0.3, -0.18, 0]} scale={Math.min(1, 5 / (steps.length + 1))}>
        {steps.map((step, index) => (
          <Platform
            key={step.label}
            step={step}
            index={index}
            total={steps.length}
            palette={palette}
          />
        ))}

        {/* The target role: taller, unreached, deliberately set apart. */}
        <group position={[goalX, steps.length * 0.17 + 0.2, 0]}>
          <mesh>
            <cylinderGeometry args={[0.1, 0.1, 0.86, 12]} />
            <meshStandardMaterial
              color={palette.figure}
              roughness={0.35}
              metalness={0.5}
              transparent
              opacity={0.55}
            />
          </mesh>
          <Float speed={1.5} rotationIntensity={1.1} floatIntensity={0.35}>
            <mesh position={[0, 0.66, 0]}>
              <octahedronGeometry args={[0.22, 0]} />
              <meshStandardMaterial
                color={palette.key}
                emissive={palette.key}
                emissiveIntensity={0.4}
                roughness={0.25}
                metalness={0.6}
              />
            </mesh>
          </Float>
        </group>
      </group>
    </>
  );
}

export function CareerPath3D({
  steps,
  className,
  fallback,
}: {
  steps: PathStep[];
  className?: string;
  fallback: React.ReactNode;
}) {
  return (
    <SceneShell
      className={className}
      // Low camera: a near top-down view flattens the platforms into ellipses
      // and loses the rise toward the goal, which is the whole point.
      canvasProps={{ camera: { position: [0.3, 0.78, 5.2], fov: 40 } }}
      fallback={fallback}
    >
      {(palette) => <PathScene steps={steps} palette={palette} />}
    </SceneShell>
  );
}
