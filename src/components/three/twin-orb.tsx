"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Sparkles } from "@react-three/drei";
import { MathUtils, type Group, type Mesh } from "three";
import type { Skill } from "@/lib/mock/types";
import { SceneShell } from "./scene-shell";
import type { ScenePalette } from "./palette";

/**
 * The Career Digital Twin as a living object.
 *
 * The core is the person: a soft, slowly breathing form. Skills orbit it on
 * three tilted rings, and the ring a skill sits on is its evidence state.
 * Demonstrated skills orbit closest, gaps farthest out, so the picture reads
 * as "what is proven is close to you". The whole system eases toward the
 * pointer with damping rather than snapping, which is what makes it feel
 * smooth instead of mechanical.
 */

const RINGS: Record<Skill["state"], { radius: number; tilt: number; speed: number }> = {
  demonstrated: { radius: 1.55, tilt: 0.35, speed: 0.22 },
  supported: { radius: 2.05, tilt: -0.5, speed: 0.16 },
  transferable: { radius: 2.05, tilt: -0.5, speed: 0.16 },
  gap: { radius: 2.6, tilt: 0.75, speed: 0.11 },
  unknown: { radius: 2.6, tilt: 0.75, speed: 0.11 },
};

function Satellite({
  skill,
  index,
  count,
  palette,
}: {
  skill: Skill;
  index: number;
  count: number;
  palette: ScenePalette;
}) {
  const mesh = useRef<Mesh>(null);
  const ring = RINGS[skill.state];
  const phase = (index / Math.max(1, count)) * Math.PI * 2;
  const size = 0.06 + (skill.importance / 100) * 0.09;

  useFrame(({ clock }) => {
    if (!mesh.current) return;
    const angle = phase + clock.elapsedTime * ring.speed;
    const x = Math.cos(angle) * ring.radius;
    const z = Math.sin(angle) * ring.radius;
    // Rotate the orbit plane around X by the ring tilt.
    mesh.current.position.set(x, z * Math.sin(ring.tilt), z * Math.cos(ring.tilt));
  });

  const colour = palette.state[skill.state];
  return (
    <mesh ref={mesh}>
      <sphereGeometry args={[size, 24, 24]} />
      <meshStandardMaterial
        color={colour}
        emissive={colour}
        emissiveIntensity={skill.state === "demonstrated" ? 0.9 : 0.45}
        roughness={0.3}
        metalness={0.3}
        transparent={skill.state === "unknown"}
        opacity={skill.state === "unknown" ? 0.5 : 1}
      />
    </mesh>
  );
}

function OrbitRing({ radius, tilt, colour }: { radius: number; tilt: number; colour: string }) {
  return (
    <mesh rotation={[Math.PI / 2 - tilt, 0, 0]}>
      <torusGeometry args={[radius, 0.004, 8, 160]} />
      <meshBasicMaterial color={colour} transparent opacity={0.28} />
    </mesh>
  );
}

function TwinScene({ skills, palette }: { skills: Skill[]; palette: ScenePalette }) {
  const system = useRef<Group>(null);
  const core = useRef<Mesh>(null);

  const byRing = useMemo(() => {
    const groups = new Map<number, Skill[]>();
    for (const skill of skills) {
      const key = RINGS[skill.state].radius;
      groups.set(key, [...(groups.get(key) ?? []), skill]);
    }
    return groups;
  }, [skills]);

  useFrame(({ pointer, clock }, delta) => {
    if (system.current) {
      // Damped follow: the system leans toward the pointer and settles.
      system.current.rotation.y = MathUtils.damp(system.current.rotation.y, pointer.x * 0.45, 2.5, delta);
      system.current.rotation.x = MathUtils.damp(system.current.rotation.x, -pointer.y * 0.25, 2.5, delta);
    }
    if (core.current) {
      const breathe = 1 + Math.sin(clock.elapsedTime * 0.9) * 0.025;
      core.current.scale.setScalar(breathe);
    }
  });

  return (
    <>
      <ambientLight intensity={0.9} />
      <directionalLight position={[3, 4, 5]} intensity={2.2} color={palette.key} />
      <pointLight position={[-3, -2, 2]} intensity={3} color={palette.violet} />
      <pointLight position={[3, 1, -2]} intensity={2.2} color={palette.rim} />

      <group ref={system}>
        <Float speed={1.4} rotationIntensity={0.25} floatIntensity={0.5}>
          <mesh ref={core}>
            <icosahedronGeometry args={[0.95, 32]} />
            <MeshDistortMaterial
              color={palette.figure}
              emissive={palette.violet}
              emissiveIntensity={0.25}
              roughness={0.15}
              metalness={0.55}
              distort={0.32}
              speed={1.6}
            />
          </mesh>
        </Float>

        <OrbitRing radius={1.55} tilt={0.35} colour={palette.rim} />
        <OrbitRing radius={2.05} tilt={-0.5} colour={palette.violet} />
        <OrbitRing radius={2.6} tilt={0.75} colour={palette.state.gap} />

        {[...byRing.entries()].map(([radius, group]) =>
          group.map((skill, index) => (
            <Satellite
              key={skill.id}
              skill={skill}
              index={index}
              count={group.length}
              palette={palette}
            />
          )),
        )}

        <Sparkles count={60} scale={6} size={2.2} speed={0.35} color={palette.rim} opacity={0.6} />
      </group>
    </>
  );
}

export function TwinOrb({
  skills,
  className,
  fallback,
}: {
  skills: Skill[];
  className?: string;
  fallback: React.ReactNode;
}) {
  return (
    <SceneShell
      className={className}
      canvasProps={{ camera: { position: [0, 0.4, 6.4], fov: 42 } }}
      fallback={fallback}
    >
      {(palette) => <TwinScene skills={skills} palette={palette} />}
    </SceneShell>
  );
}
