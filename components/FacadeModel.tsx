"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const STONE = "#dcd5c6";
const STONE_DARK = "#c4bca9";
const STONE_SHADOW = "#a89f8e";
const JOINT = "#b8b0a0";

// ─── Materials (shared instances) ────────────────────────────────────────
function useMats() {
  return useMemo(() => ({
    stone: new THREE.MeshStandardMaterial({ color: STONE, roughness: 0.9, metalness: 0.01 }),
    dark:  new THREE.MeshStandardMaterial({ color: STONE_DARK, roughness: 0.95, metalness: 0.01 }),
    shadow:new THREE.MeshStandardMaterial({ color: STONE_SHADOW, roughness: 1, metalness: 0 }),
    joint: new THREE.MeshStandardMaterial({ color: JOINT, roughness: 1 }),
  }), []);
}

// ─── Fluted Column ───────────────────────────────────────────────────────
function FlutedColumn({ mat }: { mat: ReturnType<typeof useMats> }) {
  const N_FLUTES = 20;
  const R_SHAFT  = 0.31;
  const H_SHAFT  = 4.1;

  // Base profile for the shaft (entasis - swells slightly mid-shaft)
  const profile = useMemo(() => {
    const pts: THREE.Vector2[] = [];
    const steps = 24;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps; // 0..1 bottom to top
      const entasis = Math.sin(t * Math.PI) * 0.018; // slight bulge
      const taper = t * 0.05; // narrows toward top
      pts.push(new THREE.Vector2(R_SHAFT + entasis - taper, -H_SHAFT / 2 + t * H_SHAFT));
    }
    return pts;
  }, []);

  const shaftGeo = useMemo(() => new THREE.LatheGeometry(profile, 32), [profile]);

  // Flute grooves: thin dark vertical strips on the surface
  const flutes = useMemo(() => {
    return Array.from({ length: N_FLUTES }, (_, i) => {
      const angle = (i / N_FLUTES) * Math.PI * 2;
      return { angle, x: Math.cos(angle) * (R_SHAFT + 0.005), z: Math.sin(angle) * (R_SHAFT + 0.005) };
    });
  }, []);

  return (
    <group>
      {/* Plinth */}
      <mesh position={[0, -H_SHAFT / 2 - 0.24, 0]} material={mat.dark}>
        <boxGeometry args={[1.1, 0.22, 1.1]} />
      </mesh>
      {/* Lower base torus */}
      <mesh position={[0, -H_SHAFT / 2 + 0.06, 0]} rotation={[Math.PI / 2, 0, 0]} material={mat.stone}>
        <torusGeometry args={[0.38, 0.07, 8, 32]} />
      </mesh>
      {/* Shaft */}
      <mesh geometry={shaftGeo} material={mat.stone} />
      {/* Flute grooves */}
      {flutes.map(({ angle, x, z }, i) => (
        <mesh key={i} position={[x, 0, z]} rotation={[0, -angle, 0]} material={mat.shadow}>
          <boxGeometry args={[0.025, H_SHAFT - 0.3, 0.012]} />
        </mesh>
      ))}
      {/* Neck ring */}
      <mesh position={[0, H_SHAFT / 2 - 0.28, 0]} rotation={[Math.PI / 2, 0, 0]} material={mat.joint}>
        <torusGeometry args={[0.27, 0.045, 8, 32]} />
      </mesh>
      {/* Echinus (curved disc) */}
      <mesh position={[0, H_SHAFT / 2 - 0.02, 0]} material={mat.stone}>
        <cylinderGeometry args={[0.52, 0.27, 0.28, 24]} />
      </mesh>
      {/* Abacus */}
      <mesh position={[0, H_SHAFT / 2 + 0.2, 0]} material={mat.dark}>
        <boxGeometry args={[1.1, 0.16, 1.1]} />
      </mesh>
    </group>
  );
}

// ─── Voussoir Arch ──────────────────────────────────────────────────────
// Builds proper trapezoidal (wedge) voussoir geometry that radiates from
// the arch centre — no z-fighting, clean mortar joints.
function makeVoussGeo(angle: number, angStep: number, Ri: number, Ro: number, depth: number) {
  const half = angStep * 0.46; // slight gap → mortar joint
  const a0 = angle - half;
  const a1 = angle + half;

  // 8 vertices: front face then back face
  const v = new Float32Array([
    // front (z = +depth/2)
    Math.cos(a0) * Ri, Math.sin(a0) * Ri,  depth / 2,   // 0 inner-left
    Math.cos(a1) * Ri, Math.sin(a1) * Ri,  depth / 2,   // 1 inner-right
    Math.cos(a1) * Ro, Math.sin(a1) * Ro,  depth / 2,   // 2 outer-right
    Math.cos(a0) * Ro, Math.sin(a0) * Ro,  depth / 2,   // 3 outer-left
    // back (z = -depth/2)
    Math.cos(a0) * Ri, Math.sin(a0) * Ri, -depth / 2,   // 4
    Math.cos(a1) * Ri, Math.sin(a1) * Ri, -depth / 2,   // 5
    Math.cos(a1) * Ro, Math.sin(a1) * Ro, -depth / 2,   // 6
    Math.cos(a0) * Ro, Math.sin(a0) * Ro, -depth / 2,   // 7
  ]);

  const idx = [
    0,1,2, 0,2,3,   // front
    4,6,5, 4,7,6,   // back
    0,4,5, 0,5,1,   // inner arc
    3,2,6, 3,6,7,   // outer arc
    0,3,7, 0,7,4,   // left radial
    1,5,6, 1,6,2,   // right radial
  ];

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(v, 3));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  return geo;
}

function VoussiorArch({ mat }: { mat: ReturnType<typeof useMats> }) {
  const N     = 13;
  const Ro    = 1.72;
  const Ri    = 1.20;
  const DEPTH = 0.52;
  const angStep = Math.PI / (N - 1);

  const voussGeos = useMemo(
    () =>
      Array.from({ length: N }, (_, i) => {
        const t     = i / (N - 1);
        const angle = Math.PI * (1 - t);
        return {
          geo:   makeVoussGeo(angle, angStep, Ri, Ro, DEPTH),
          isKey: i === Math.floor(N / 2),
        };
      }),
    []
  );

  // Spandrel — pushed back slightly so it sits behind the voussoirs
  const spandrel = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-3.6, 0);
    s.lineTo(-(Ro + 0.02), 0);
    for (let i = 0; i <= 20; i++) {
      const a = Math.PI - (i / 20) * Math.PI;
      s.lineTo(Math.cos(a) * (Ro + 0.02), Math.sin(a) * (Ro + 0.02));
    }
    s.lineTo(Ro + 0.02, 0);
    s.lineTo(3.6, 0);
    s.lineTo(3.6, 0.28);
    s.lineTo(-3.6, 0.28);
    s.closePath();
    return new THREE.ExtrudeGeometry(s, { depth: DEPTH * 0.7, bevelEnabled: false });
  }, []);

  // Prominent keystone shape (pointed drop ornament)
  const keystoneGeo = useMemo(() => {
    const ks = new THREE.Shape();
    ks.moveTo(-0.2, 0);
    ks.lineTo(0.2, 0);
    ks.lineTo(0.22, 0.55);
    ks.lineTo(0, 0.78);   // point
    ks.lineTo(-0.22, 0.55);
    ks.closePath();
    return new THREE.ExtrudeGeometry(ks, { depth: DEPTH + 0.1, bevelEnabled: false });
  }, []);

  return (
    <group>
      {/* Impost blocks */}
      {([-1.55, 1.55] as const).map((x) => (
        <mesh key={x} position={[x, -0.12, 0]} material={mat.dark}>
          <boxGeometry args={[0.82, 0.38, DEPTH + 0.1]} />
        </mesh>
      ))}

      {/* Spandrel — behind voussoirs (z offset) */}
      <mesh geometry={spandrel} material={mat.dark} position={[0, 0, -(DEPTH * 0.7) / 2 - 0.01]} />

      {/* Proper wedge voussoir stones */}
      {voussGeos.map(({ geo, isKey }, i) => (
        <mesh key={i} geometry={geo} material={isKey ? mat.dark : mat.stone} castShadow />
      ))}

      {/* Keystone drop ornament centred at arch crown */}
      <mesh
        geometry={keystoneGeo}
        material={mat.shadow}
        position={[-0.0, Ri - 0.04, -DEPTH / 2 - 0.02]}
      />

      {/* Acroterion finial above keystone */}
      <mesh position={[0, Ro + 0.46, 0]} material={mat.stone}>
        <cylinderGeometry args={[0.08, 0.14, 0.28, 12]} />
      </mesh>
      <mesh position={[0, Ro + 0.64, 0]} material={mat.dark}>
        <sphereGeometry args={[0.09, 10, 8]} />
      </mesh>
    </group>
  );
}

// ─── Entablature (architrave + frieze + cornice) ─────────────────────────
function Entablature({ mat }: { mat: ReturnType<typeof useMats> }) {
  return (
    <group>
      {/* Architrave */}
      <mesh position={[0, 0, 0]} material={mat.stone}>
        <boxGeometry args={[5.6, 0.28, 0.56]} />
      </mesh>
      {/* Frieze — slightly recessed */}
      <mesh position={[0, 0.34, -0.06]} material={mat.dark}>
        <boxGeometry args={[5.6, 0.4, 0.44]} />
      </mesh>
      {/* Triglyphs on frieze */}
      {[-2, -0.8, 0, 0.8, 2].map((x, i) => (
        <mesh key={i} position={[x, 0.34, 0.08]} material={mat.shadow}>
          <boxGeometry args={[0.22, 0.42, 0.06]} />
        </mesh>
      ))}
      {/* Cornice (big projecting slab) */}
      <mesh position={[0, 0.72, 0.06]} material={mat.stone}>
        <boxGeometry args={[5.8, 0.22, 0.7]} />
      </mesh>
      {/* Cornice shadow line */}
      <mesh position={[0, 0.62, 0.38]} material={mat.shadow}>
        <boxGeometry args={[5.8, 0.06, 0.08]} />
      </mesh>
      {/* Pediment triangle */}
      <mesh position={[0, 1.22, 0]} material={mat.stone}>
        <boxGeometry args={[4.2, 0.14, 0.54]} />
      </mesh>
    </group>
  );
}

// ─── Wall with window + pilasters ───────────────────────────────────────
function Wall({ mat }: { mat: ReturnType<typeof useMats> }) {
  return (
    <group position={[0, 0, -0.95]}>
      {/* Main wall slab */}
      <mesh material={mat.dark} castShadow receiveShadow>
        <boxGeometry args={[5.6, 6.4, 0.44]} />
      </mesh>
      {/* Pilasters (flat columns on wall surface) */}
      {[-1.55, 1.55].map((x) => (
        <group key={x} position={[x, 0, 0.24]}>
          <mesh material={mat.stone}>
            <boxGeometry args={[0.28, 6.4, 0.12]} />
          </mesh>
          {/* Pilaster capital */}
          <mesh position={[0, 2.9, 0]} material={mat.dark}>
            <boxGeometry args={[0.44, 0.18, 0.16]} />
          </mesh>
        </group>
      ))}
      {/* Horizontal string course */}
      {[0.8, -1.6].map((y, i) => (
        <mesh key={i} position={[0, y, 0.24]} material={mat.joint}>
          <boxGeometry args={[5.6, 0.1, 0.1]} />
        </mesh>
      ))}
      {/* Window surround (arch entry) */}
      <mesh position={[0, -0.4, 0.26]} material={mat.stone}>
        <boxGeometry args={[2.2, 0.14, 0.1]} />
      </mesh>
      {[-0.96, 0.96].map((x) => (
        <mesh key={x} position={[x, 0.5, 0.26]} material={mat.stone}>
          <boxGeometry args={[0.14, 1.8, 0.1]} />
        </mesh>
      ))}
      {/* Soldier course above window */}
      <mesh position={[0, 1.44, 0.26]} material={mat.dark}>
        <boxGeometry args={[2.2, 0.18, 0.12]} />
      </mesh>
    </group>
  );
}

// ─── Main scene ─────────────────────────────────────────────────────────
export default function FacadeModel({
  scrollRef,
  pointerRef,
  quality = "high",
}: {
  scrollRef: React.MutableRefObject<number>;
  pointerRef: React.MutableRefObject<{ x: number; y: number }>;
  quality?: "high" | "low";
}) {
  const group = useRef<THREE.Group>(null);
  const mat = useMats();
  const reveal = useRef(0);

  useFrame((state, delta) => {
    reveal.current = Math.min(1, reveal.current + delta * 0.5);
    const r = reveal.current;
    const scroll = scrollRef.current;
    const p = pointerRef.current;

    if (!group.current) return;
    const targetY = Math.sin(state.clock.elapsedTime * 0.1) * 0.14 + p.x * 0.38 + scroll * 1.2;
    const targetX = -p.y * 0.18 + scroll * 0.2;
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, targetY, 0.055);
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, targetX, 0.055);
    group.current.position.y = THREE.MathUtils.lerp(group.current.position.y, -0.4 - scroll * 0.5, 0.055);
    const s = 0.88 + THREE.MathUtils.smoothstep(r, 0, 1) * 0.12;
    group.current.scale.setScalar(s);
  });

  return (
    <group ref={group} dispose={null}>
      <Wall mat={mat} />

      {/* Columns */}
      {[-1.55, 1.55].map((x) => (
        <group key={x} position={[x, -0.45, 0]}>
          <FlutedColumn mat={mat} />
        </group>
      ))}

      {/* Arch centered between columns */}
      <group position={[0, 1.82, 0.08]}>
        <VoussiorArch mat={mat} />
      </group>

      {/* Entablature */}
      <group position={[0, 3.76, 0.06]}>
        <Entablature mat={mat} />
      </group>

      {/* Step / Stylobate at base */}
      <mesh position={[0, -2.82, 0]} material={mat.dark}>
        <boxGeometry args={[5.8, 0.18, 1.4]} />
      </mesh>
      <mesh position={[0, -2.64, -0.1]} material={mat.stone}>
        <boxGeometry args={[5.6, 0.1, 1.2]} />
      </mesh>
    </group>
  );
}
