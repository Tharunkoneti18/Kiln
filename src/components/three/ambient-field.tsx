"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Color, type ShaderMaterial } from "three";
import { SceneShell } from "./scene-shell";
import type { ScenePalette } from "./palette";

/**
 * Ambient shader backdrop for the dashboard hero.
 *
 * It sits behind live text, so contrast is the governing constraint: the
 * shader output is deliberately low amplitude and is mixed toward the page
 * background rather than drawn at full strength. Anything more energetic here
 * would cost readability for decoration, which is the wrong trade on the one
 * screen people open every day.
 */

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  precision mediump float;

  varying vec2 vUv;
  uniform float uTime;
  uniform vec2 uAspect;
  uniform vec3 uBase;
  uniform vec3 uTeal;
  uniform vec3 uWarm;

  // Cheap value noise. Good enough for soft, slow bands and far cheaper than
  // a full simplex implementation on a backdrop nobody looks at directly.
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  float fbm(vec2 p) {
    float total = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 4; i++) {
      total += noise(p) * amplitude;
      p *= 2.02;
      amplitude *= 0.5;
    }
    return total;
  }

  void main() {
    vec2 uv = (vUv - 0.5) * uAspect + 0.5;

    // Two drifting fields at different speeds, so the motion never loops
    // visibly within the time anyone spends on the page.
    float slow = fbm(uv * 2.1 + vec2(uTime * 0.016, uTime * -0.011));
    float fast = fbm(uv * 3.6 + vec2(uTime * -0.027, uTime * 0.019));

    vec3 colour = uBase;
    colour = mix(colour, uTeal, smoothstep(0.42, 0.92, slow) * 0.5);
    colour = mix(colour, uWarm, smoothstep(0.58, 1.0, fast) * 0.18);

    // Fade toward the edges so the panel has no hard shader boundary.
    float edge = smoothstep(0.0, 0.42, vUv.y) * smoothstep(1.0, 0.62, vUv.y);
    float sides = smoothstep(0.0, 0.3, vUv.x) * smoothstep(1.0, 0.72, vUv.x);

    gl_FragColor = vec4(colour, 0.9 * mix(0.35, 1.0, edge * sides));
  }
`;

function FieldPlane({ palette }: { palette: ScenePalette }) {
  const material = useRef<ShaderMaterial>(null);
  const { viewport } = useThree();

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uAspect: { value: [1, 1] as [number, number] },
      uBase: { value: new Color(palette.base) },
      uTeal: { value: new Color(palette.rim) },
      uWarm: { value: new Color(palette.key) },
    }),
    // Rebuilt on theme change so the backdrop follows light and dark.
    [palette.base, palette.key, palette.rim],
  );

  useFrame((_, delta) => {
    if (!material.current) return;
    material.current.uniforms.uTime.value += delta;
    material.current.uniforms.uAspect.value = [
      Math.max(1, viewport.width / viewport.height),
      1,
    ];
  });

  return (
    <mesh scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={material}
        key={palette.base}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
      />
    </mesh>
  );
}

export function AmbientField({ className }: { className?: string }) {
  return (
    <SceneShell
      className={className}
      // Decorative, so reduced motion drops it entirely rather than freezing it.
      motionCritical={false}
      canvasProps={{ camera: { position: [0, 0, 1], fov: 50 }, dpr: [1, 1.25] }}
      fallback={
        // Static equivalent: the same two hues, no movement.
        <div className="from-primary/[0.09] via-background to-background size-full bg-gradient-to-br" />
      }
    >
      {(palette) => <FieldPlane palette={palette} />}
    </SceneShell>
  );
}
