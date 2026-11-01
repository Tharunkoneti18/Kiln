"use client";

import { useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import { Vector3, type Group, type Mesh } from "three";
import type { Skill } from "@/lib/mock/types";
import { SceneShell } from "./scene-shell";
import type { ScenePalette } from "./palette";
import { cn } from "@/lib/utils";

/**
 * Skill map as a constellation around the target role.
 *
 * Three variables are encoded at once, which is what earns the third
 * dimension here: distance from the core is how far the skill is from being
 * proven, node size is how much the role asks for it, and colour is the
 * evidence state. A flat chart can show two of those legibly, not three.
 *
 * The canvas is decorative in the accessibility tree. The skill list beside
 * it in the page is the real control surface, and both drive the same
 * selection state.
 */

const STATE_DISTANCE: Record<Skill["state"], number> = {
  demonstrated: 1.45,
  supported: 2.1,
  transferable: 2.65,
  gap: 3.25,
  unknown: 3.7,
};

/** Even distribution over a sphere, so clusters are meaningful not accidental. */
function fibonacciDirection(index: number, total: number) {
  const golden = Math.PI * (3 - Math.sqrt(5));
  const y = 1 - (index / Math.max(1, total - 1)) * 2;
  const radius = Math.sqrt(Math.max(0, 1 - y * y));
  const theta = golden * index;
  return [Math.cos(theta) * radius, y * 0.72, Math.sin(theta) * radius] as const;
}

interface NodeLayout {
  skill: Skill;
  position: [number, number, number];
  size: number;
}

function SkillNode({
  node,
  palette,
  selected,
  onSelect,
}: {
  node: NodeLayout;
  palette: ScenePalette;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  const mesh = useRef<Mesh>(null);
  const targetScale = useRef(new Vector3());
  const [hovered, setHovered] = useState(false);
  const colour = palette.state[node.skill.state];
  const emphasised = selected || hovered;

  useFrame(({ clock }) => {
    if (!mesh.current) return;
    // Eased approach to the target scale rather than a CSS-style transition,
    // because the value changes inside the render loop.
    const target = node.size * (selected ? 1.5 : hovered ? 1.28 : 1);
    mesh.current.scale.lerp(targetScale.current.setScalar(target), 0.14);
    // A slow bob keyed to each node's own offset keeps the field alive without
    // anything pulsing in unison.
    mesh.current.position.y =
      node.position[1] + Math.sin(clock.elapsedTime * 0.7 + node.position[0] * 2) * 0.045;
  });

  return (
    <group>
      <mesh
        ref={mesh}
        position={node.position}
        onPointerOver={(event) => {
          event.stopPropagation();
          setHovered(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = "";
        }}
        onClick={(event) => {
          event.stopPropagation();
          onSelect(node.skill.id);
        }}
      >
        <icosahedronGeometry args={[1, node.skill.state === "unknown" ? 0 : 2]} />
        <meshStandardMaterial
          color={colour}
          roughness={node.skill.state === "demonstrated" ? 0.28 : 0.62}
          metalness={node.skill.state === "demonstrated" ? 0.35 : 0.08}
          emissive={colour}
          emissiveIntensity={emphasised ? 0.55 : 0.12}
          // Unknown skills read as unresolved rather than absent.
          transparent={node.skill.state === "unknown"}
          opacity={node.skill.state === "unknown" ? 0.55 : 1}
        />
      </mesh>

      {emphasised && (
        <Html position={node.position} center distanceFactor={9} zIndexRange={[20, 0]}>
          <span
            className={cn(
              "pointer-events-none -translate-y-7 rounded-full border px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap",
              "bg-popover/95 text-popover-foreground border-border shadow-sm backdrop-blur-sm",
            )}
          >
            {node.skill.label}
          </span>
        </Html>
      )}
    </group>
  );
}

function Spoke({
  to,
  colour,
  confidence,
}: {
  to: [number, number, number];
  colour: string;
  confidence: number;
}) {
  // A thin cylinder rather than a line primitive, because line widths above
  // 1px are not portable across WebGL implementations.
  const length = Math.sqrt(to[0] ** 2 + to[1] ** 2 + to[2] ** 2);
  const midpoint: [number, number, number] = [to[0] / 2, to[1] / 2, to[2] / 2];
  const quaternion = useMemo(() => {
    const direction = [to[0] / length, to[1] / length, to[2] / length];
    // Rotate the cylinder's +Y axis onto the node direction.
    const axis = [direction[2], 0, -direction[0]];
    const angle = Math.acos(Math.max(-1, Math.min(1, direction[1])));
    const axisLength = Math.hypot(axis[0], axis[1], axis[2]) || 1;
    const half = angle / 2;
    const sin = Math.sin(half);
    return [
      (axis[0] / axisLength) * sin,
      (axis[1] / axisLength) * sin,
      (axis[2] / axisLength) * sin,
      Math.cos(half),
    ] as [number, number, number, number];
  }, [length, to]);

  return (
    <mesh position={midpoint} quaternion={quaternion}>
      <cylinderGeometry args={[0.012, 0.012, length, 6]} />
      <meshBasicMaterial color={colour} transparent opacity={0.1 + confidence * 0.3} />
    </mesh>
  );
}

function ConstellationScene({
  skills,
  palette,
  selectedId,
  onSelect,
}: {
  skills: Skill[];
  palette: ScenePalette;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const field = useRef<Group>(null);

  const nodes = useMemo<NodeLayout[]>(
    () =>
      skills.map((skill, index) => {
        const [dx, dy, dz] = fibonacciDirection(index, skills.length);
        const distance = STATE_DISTANCE[skill.state];
        return {
          skill,
          position: [dx * distance, dy * distance, dz * distance],
          // Importance drives area, so the mapping is to the square root.
          size: 0.1 + Math.sqrt(skill.importance / 100) * 0.17,
        };
      }),
    [skills],
  );

  useFrame((_, delta) => {
    if (field.current) field.current.rotation.y += delta * 0.055;
  });

  return (
    <>
      <ambientLight intensity={1.1} />
      <directionalLight position={[4, 6, 5]} intensity={1.9} color={palette.key} />
      <pointLight position={[-4, -1, -3]} intensity={1.5} color={palette.rim} />

      <group ref={field}>
        {/* The target role sits at the centre: everything is measured from it. */}
        <mesh>
          <icosahedronGeometry args={[0.46, 3]} />
          <meshStandardMaterial
            color={palette.figure}
            roughness={0.22}
            metalness={0.55}
            emissive={palette.rim}
            emissiveIntensity={0.3}
          />
        </mesh>
        <mesh>
          <icosahedronGeometry args={[0.72, 1]} />
          <meshBasicMaterial color={palette.rim} wireframe transparent opacity={0.16} />
        </mesh>

        {nodes.map((node) => (
          <Spoke
            key={"spoke-" + node.skill.id}
            to={node.position}
            colour={palette.state[node.skill.state]}
            confidence={node.skill.confidence}
          />
        ))}
        {nodes.map((node) => (
          <SkillNode
            key={node.skill.id}
            node={node}
            palette={palette}
            selected={selectedId === node.skill.id}
            onSelect={onSelect}
          />
        ))}
      </group>

      <OrbitControls
        enablePan={false}
        enableZoom={false}
        minPolarAngle={Math.PI / 3.6}
        maxPolarAngle={Math.PI / 1.7}
        rotateSpeed={0.55}
      />
    </>
  );
}

export function SkillConstellation({
  skills,
  selectedId,
  onSelect,
  className,
}: {
  skills: Skill[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  className?: string;
}) {
  return (
    <SceneShell
      className={className}
      canvasProps={{ camera: { position: [0, 1.6, 7.4], fov: 42 } }}
      fallback={<ConstellationFallback skills={skills} />}
    >
      {(palette) => (
        <ConstellationScene
          skills={skills}
          palette={palette}
          selectedId={selectedId}
          onSelect={onSelect}
        />
      )}
    </SceneShell>
  );
}

/**
 * Shown under reduced motion, without WebGL, or if the scene throws. It keeps
 * the same encoding (distance as rings, colour as state) in two dimensions.
 */
function ConstellationFallback({ skills }: { skills: Skill[] }) {
  const byState = (["demonstrated", "supported", "transferable", "gap", "unknown"] as const).map(
    (state) => ({ state, items: skills.filter((skill) => skill.state === state) }),
  );

  return (
    <div className="grid size-full place-items-center p-6">
      <div className="flex w-full max-w-sm flex-col gap-3">
        {byState
          .filter((row) => row.items.length > 0)
          .map((row) => (
            <div key={row.state} className="flex items-start gap-3">
              <span
                aria-hidden="true"
                className="mt-1.5 size-2.5 shrink-0 rounded-full"
                style={{ background: "var(--state-" + row.state + ")" }}
              />
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="text-[11.5px] font-bold tracking-wide capitalize">
                  {row.state}
                </span>
                <span className="text-muted-foreground text-[12px] leading-snug">
                  {row.items.map((item) => item.label).join(", ")}
                </span>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
