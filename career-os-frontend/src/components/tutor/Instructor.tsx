"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Component, useEffect, useRef, useState, type ReactNode } from "react";
import type { Group, Mesh } from "three";
import { scenePalettes, type ScenePalette } from "@/components/three/palette";

/**
 * The lesson instructor.
 *
 * Deliberately a simple stylised figure rather than a photoreal avatar: the
 * states that carry meaning are "teaching" and "ready", and a low-poly figure
 * conveys both without a lip-sync pipeline or a licensing problem.
 *
 * This component does not use SceneShell. It predates it, it is covered by a
 * test that mounts it standalone without theme context, and its own boundary
 * plus reduced-motion check already give it the same guarantees.
 */

function TeacherFigure({ speaking, palette }: { speaking: boolean; palette: ScenePalette }) {
  const figure = useRef<Group>(null);
  const face = useRef<Group>(null);
  const mouth = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    const time = clock.elapsedTime;
    if (figure.current) figure.current.position.y = -0.55 + Math.sin(time * 1.15) * 0.025;
    if (face.current) face.current.rotation.y = Math.sin(time * 0.55) * 0.035;
    // Mouth movement is a speaking indicator, not an attempt at lip sync.
    if (mouth.current)
      mouth.current.scale.y = speaking ? 0.025 + Math.abs(Math.sin(time * 11)) * 0.075 : 0.022;
  });

  return (
    <group ref={figure} position={[0, -0.55, 0]} scale={1.05}>
      <mesh position={[0, 0.05, 0]}>
        <capsuleGeometry args={[0.52, 1.02, 8, 18]} />
        <meshStandardMaterial color={palette.figure} roughness={0.48} />
      </mesh>
      <mesh position={[0, 0.48, 0.42]} rotation={[0, 0, Math.PI]}>
        <coneGeometry args={[0.19, 0.3, 5]} />
        <meshStandardMaterial color={palette.key} roughness={0.56} />
      </mesh>
      <mesh position={[0, 0.67, 0.39]}>
        <boxGeometry args={[0.18, 0.16, 0.08]} />
        <meshStandardMaterial color={palette.board} roughness={0.64} />
      </mesh>
      <mesh position={[-0.52, 0.28, 0.04]} rotation={[0, 0, -0.48]}>
        <capsuleGeometry args={[0.14, 0.62, 6, 12]} />
        <meshStandardMaterial color={palette.figure} roughness={0.5} />
      </mesh>
      <mesh position={[0.52, 0.28, 0.04]} rotation={[0, 0, 0.56]}>
        <capsuleGeometry args={[0.14, 0.62, 6, 12]} />
        <meshStandardMaterial color={palette.figure} roughness={0.5} />
      </mesh>
      <mesh position={[-0.71, -0.12, 0.16]} rotation={[0, 0, -0.16]}>
        <sphereGeometry args={[0.15, 18, 16]} />
        <meshStandardMaterial color={palette.skin} roughness={0.72} />
      </mesh>
      <mesh position={[0.72, -0.06, 0.17]} rotation={[0, 0, 0.2]}>
        <sphereGeometry args={[0.15, 18, 16]} />
        <meshStandardMaterial color={palette.skin} roughness={0.72} />
      </mesh>
      <mesh position={[0, 0.76, 0]}>
        <cylinderGeometry args={[0.17, 0.19, 0.32, 24]} />
        <meshStandardMaterial color={palette.skin} roughness={0.72} />
      </mesh>
      <group ref={face} position={[0, 1.14, 0]}>
        <mesh>
          <sphereGeometry args={[0.44, 32, 24]} />
          <meshStandardMaterial color={palette.skin} roughness={0.75} />
        </mesh>
        <mesh position={[0, 0.22, -0.035]} scale={[1.04, 0.56, 0.95]}>
          <sphereGeometry args={[0.41, 24, 18, 0, Math.PI * 2, 0, Math.PI * 0.58]} />
          <meshStandardMaterial color={palette.hair} roughness={0.82} />
        </mesh>
        <mesh position={[-0.145, 0.035, 0.381]}>
          <sphereGeometry args={[0.036, 14, 12]} />
          <meshStandardMaterial color={palette.ink} />
        </mesh>
        <mesh position={[0.145, 0.035, 0.381]}>
          <sphereGeometry args={[0.036, 14, 12]} />
          <meshStandardMaterial color={palette.ink} />
        </mesh>
        <mesh ref={mouth} position={[0, -0.16, 0.41]} scale={[0.09, 0.022, 0.018]}>
          <sphereGeometry args={[1, 18, 12]} />
          <meshStandardMaterial color="#854b47" />
        </mesh>
      </group>
    </group>
  );
}

/**
 * Static equivalent. Used under reduced motion, before mount, and whenever
 * the canvas fails. It carries the accessible name, because the canvas is
 * hidden from assistive technology.
 */
function StaticInstructor({ speaking }: { speaking: boolean }) {
  return (
    <div
      className="bg-raised relative grid h-[210px] w-full place-items-center overflow-hidden rounded-xl border"
      role="img"
      aria-label={"Career OS instructor, " + (speaking ? "speaking" : "ready to teach")}
    >
      <span
        aria-hidden="true"
        className="border-primary/30 bg-primary/10 text-primary grid size-20 place-items-center rounded-full border text-[19px] font-bold tracking-tight"
      >
        CO
      </span>
    </div>
  );
}

class InstructorBoundary extends Component<
  { children: ReactNode; speaking: boolean },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <StaticInstructor speaking={this.props.speaking} />
    ) : (
      this.props.children
    );
  }
}

export function Instructor({
  speaking,
  palette = scenePalettes.light,
}: {
  speaking: boolean;
  /** Supplied by the lesson room so the figure follows the active theme. */
  palette?: ScenePalette;
}) {
  const [reduced, setReduced] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
    if (!window.matchMedia) {
      setReduced(true);
      return;
    }
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener?.("change", update);
    return () => query.removeEventListener?.("change", update);
  }, []);

  if (reduced || !ready) return <StaticInstructor speaking={speaking} />;

  return (
    <InstructorBoundary speaking={speaking}>
      <div
        aria-hidden="true"
        className="bg-raised relative h-[210px] w-full overflow-hidden rounded-xl border"
      >
        {/* Two soft rings behind the figure, brightening while teaching. */}
        <span
          className={
            "border-primary/20 absolute top-1/2 left-1/2 size-40 -translate-x-1/2 -translate-y-1/2 rounded-full border transition-opacity duration-500 " +
            (speaking ? "opacity-100" : "opacity-40")
          }
        />
        <span
          className={
            "border-primary/12 absolute top-1/2 left-1/2 size-56 -translate-x-1/2 -translate-y-1/2 rounded-full border transition-opacity duration-500 " +
            (speaking ? "opacity-100" : "opacity-30")
          }
        />
        <Canvas camera={{ position: [0, 0.35, 4.55], fov: 34 }} dpr={[1, 1.5]}>
          <ambientLight intensity={1.35} />
          <directionalLight position={[3, 4, 5]} intensity={2.2} color={palette.key} />
          <pointLight position={[-2, 1, 2]} intensity={1.4} color={palette.rim} />
          <TeacherFigure speaking={speaking} palette={palette} />
        </Canvas>
      </div>
    </InstructorBoundary>
  );
}
