"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// ─── Stone palette — warm cream limestone ─────────────────────────────────
const MAT = {
  stone:  { color: "#D4CBB6", roughness: 0.84, metalness: 0, clearcoat: 0.07, clearcoatRoughness: 0.9 },
  light:  { color: "#E2DAC8", roughness: 0.78, metalness: 0, clearcoat: 0.10, clearcoatRoughness: 0.85 },
  shadow: { color: "#B4ADA0", roughness: 0.92, metalness: 0, clearcoat: 0.03 },
  dark:   { color: "#9E9790", roughness: 0.96, metalness: 0, clearcoat: 0    },
  joint:  { color: "#8C8680", roughness: 1.00, metalness: 0, clearcoat: 0    },
  floor:  { color: "#6E6860", roughness: 0.88, metalness: 0.03, clearcoat: 0.04 },
  wall:   { color: "#1A1915", roughness: 1.00, metalness: 0, clearcoat: 0    },
};
type K = keyof typeof MAT;

function useMats() {
  return useMemo(() => {
    const out: Record<string, THREE.MeshPhysicalMaterial> = {};
    for (const [k, v] of Object.entries(MAT))
      out[k] = new THREE.MeshPhysicalMaterial(v as THREE.MeshPhysicalMaterialParameters);
    return out as Record<K, THREE.MeshPhysicalMaterial>;
  }, []);
}

// ─── Shaft profile with classical entasis ─────────────────────────────────
const COL_H = 5.4;
const COL_R = 0.26;

function buildShaft() {
  const pts: THREE.Vector2[] = [];
  for (let i = 0; i <= 40; i++) {
    const t = i / 40;
    const ent = Math.sin(t * Math.PI) * 0.020;   // bulge at mid-height
    const tap = t * 0.048;                          // narrows toward top
    pts.push(new THREE.Vector2(COL_R + ent - tap, -COL_H / 2 + t * COL_H));
  }
  return pts;
}

// ─── Fluted Column ────────────────────────────────────────────────────────
function Column({ m }: { m: Record<K, THREE.MeshPhysicalMaterial> }) {
  const shaftGeo = useMemo(() => new THREE.LatheGeometry(buildShaft(), 48), []);
  const N_FLUTES = 24;
  const flutes   = useMemo(() =>
    Array.from({ length: N_FLUTES }, (_, i) => {
      const a = (i / N_FLUTES) * Math.PI * 2;
      return { x: Math.cos(a) * (COL_R + 0.003), z: Math.sin(a) * (COL_R + 0.003), a };
    }), []);

  return (
    <group>
      {/* Plinth */}
      <mesh position={[0, -COL_H / 2 - 0.26, 0]} castShadow material={m.shadow}>
        <boxGeometry args={[0.70, 0.22, 0.70]} />
      </mesh>
      {/* Attic base — lower torus */}
      <mesh position={[0, -COL_H / 2 + 0.06, 0]} rotation={[Math.PI / 2, 0, 0]} material={m.stone}>
        <torusGeometry args={[0.30, 0.07, 8, 48]} />
      </mesh>
      {/* Attic base — upper torus */}
      <mesh position={[0, -COL_H / 2 + 0.18, 0]} rotation={[Math.PI / 2, 0, 0]} material={m.stone}>
        <torusGeometry args={[0.27, 0.04, 8, 48]} />
      </mesh>
      {/* Shaft */}
      <mesh geometry={shaftGeo} material={m.stone} castShadow receiveShadow />
      {/* Flute grooves — 24 dark strips */}
      {flutes.map(({ x, z, a }, i) => (
        <mesh key={i} position={[x, 0, z]} rotation={[0, -a, 0]} material={m.joint}>
          <boxGeometry args={[0.016, COL_H - 0.5, 0.007]} />
        </mesh>
      ))}
      {/* Neck ring */}
      <mesh position={[0, COL_H / 2 - 0.30, 0]} rotation={[Math.PI / 2, 0, 0]} material={m.shadow}>
        <torusGeometry args={[0.20, 0.035, 8, 48]} />
      </mesh>
      {/* Echinus — lower bell of capital */}
      <mesh position={[0, COL_H / 2 - 0.08, 0]} castShadow material={m.stone}>
        <cylinderGeometry args={[0.34, 0.20, 0.24, 24]} />
      </mesh>
      {/* Capital volute tier */}
      <mesh position={[0, COL_H / 2 + 0.14, 0]} castShadow material={m.light}>
        <cylinderGeometry args={[0.45, 0.34, 0.20, 24]} />
      </mesh>
      {/* Abacus slab */}
      <mesh position={[0, COL_H / 2 + 0.30, 0]} castShadow material={m.shadow}>
        <boxGeometry args={[0.96, 0.16, 0.96]} />
      </mesh>
      {/* Abacus cyma (edge bead) */}
      <mesh position={[0, COL_H / 2 + 0.22, 0]} rotation={[Math.PI / 2, 0, 0]} material={m.stone}>
        <torusGeometry args={[0.48, 0.026, 6, 4]} />
      </mesh>
    </group>
  );
}

// ─── Voussoir arch (wedge BufferGeometry) ─────────────────────────────────
function wedgeGeo(angle: number, step: number, Ri: number, Ro: number, d: number) {
  const h  = step * 0.44;
  const a0 = angle - h, a1 = angle + h;
  const v  = new Float32Array([
    Math.cos(a0)*Ri, Math.sin(a0)*Ri,  d/2,
    Math.cos(a1)*Ri, Math.sin(a1)*Ri,  d/2,
    Math.cos(a1)*Ro, Math.sin(a1)*Ro,  d/2,
    Math.cos(a0)*Ro, Math.sin(a0)*Ro,  d/2,
    Math.cos(a0)*Ri, Math.sin(a0)*Ri, -d/2,
    Math.cos(a1)*Ri, Math.sin(a1)*Ri, -d/2,
    Math.cos(a1)*Ro, Math.sin(a1)*Ro, -d/2,
    Math.cos(a0)*Ro, Math.sin(a0)*Ro, -d/2,
  ]);
  const idx = [0,1,2,0,2,3, 4,6,5,4,7,6, 0,4,5,0,5,1, 3,2,6,3,6,7, 0,3,7,0,7,4, 1,5,6,1,6,2];
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(v, 3));
  g.setIndex(idx); g.computeVertexNormals();
  return g;
}

function Arch({ m }: { m: Record<K, THREE.MeshPhysicalMaterial> }) {
  const Ro = 1.52, Ri = 1.00, D = 0.56, N = 15;
  const step = Math.PI / (N - 1);
  const stones = useMemo(() =>
    Array.from({ length: N }, (_, i) => ({
      geo:   wedgeGeo(Math.PI * (1 - i / (N - 1)), step, Ri, Ro, D),
      isKey: i === Math.floor(N / 2),
    })), []);

  // Solid fill behind arch (back of opening)
  const archFillGeo = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-Ro - 0.06, -0.02);
    shape.lineTo( Ro + 0.06, -0.02);
    shape.lineTo( Ro + 0.06,  0);
    for (let i = 0; i <= 32; i++) {
      const a = (i / 32) * Math.PI;
      shape.lineTo(Math.cos(a) * (Ro + 0.04), Math.sin(a) * (Ro + 0.04));
    }
    shape.lineTo(-Ro - 0.06, 0);
    shape.closePath();
    return new THREE.ExtrudeGeometry(shape, { depth: D * 0.6, bevelEnabled: false });
  }, []);

  return (
    <group>
      {/* Solid back fill (no void behind arch) */}
      <mesh geometry={archFillGeo} material={m.dark} position={[0, 0, -D * 0.6 - 0.01]} />
      {/* Impost blocks */}
      {([-1, 1] as const).map((s, i) => (
        <mesh key={i} position={[s * (Ri + 0.28), -0.12, 0]} castShadow material={m.shadow}>
          <boxGeometry args={[0.56, 0.36, D + 0.08]} />
        </mesh>
      ))}
      {/* Voussoir stones */}
      {stones.map(({ geo, isKey }, i) => (
        <mesh key={i} geometry={geo} material={isKey ? m.dark : m.stone} castShadow />
      ))}
      {/* Keystone drop */}
      <mesh position={[0, Ri - 0.02, 0]} castShadow material={m.dark}>
        <boxGeometry args={[0.34, 0.60, D + 0.06]} />
      </mesh>
      {/* Crown ornament */}
      <mesh position={[0, Ro + 0.34, 0]} material={m.light} castShadow>
        <cylinderGeometry args={[0.09, 0.14, 0.30, 12]} />
      </mesh>
    </group>
  );
}

// ─── Entablature ──────────────────────────────────────────────────────────
function Entablature({ m, w = 6.0 }: { m: Record<K, THREE.MeshPhysicalMaterial>; w?: number }) {
  const dentils = Array.from({ length: Math.round(w / 0.30) }, (_, i) => i);
  const trigs   = [-1.8, -0.6, 0.6, 1.8];
  return (
    <group>
      {/* Architrave band 1 */}
      <mesh position={[0, 0.00, 0]} material={m.stone} castShadow>
        <boxGeometry args={[w, 0.20, 0.52]} />
      </mesh>
      {/* Architrave band 2 (slight projection) */}
      <mesh position={[0, 0.22, 0.04]} material={m.light} castShadow>
        <boxGeometry args={[w, 0.08, 0.48]} />
      </mesh>
      {/* Frieze */}
      <mesh position={[0, 0.38, -0.06]} material={m.shadow} castShadow>
        <boxGeometry args={[w, 0.40, 0.38]} />
      </mesh>
      {/* Triglyphs */}
      {trigs.map((x, i) => (
        <group key={i} position={[x, 0.38, 0.13]}>
          <mesh material={m.dark}><boxGeometry args={[0.22, 0.42, 0.05]} /></mesh>
          {[-0.065, 0.065].map((dx, j) => (
            <mesh key={j} position={[dx, 0, 0.04]} material={m.dark}>
              <boxGeometry args={[0.048, 0.42, 0.05]} />
            </mesh>
          ))}
        </group>
      ))}
      {/* Dentils */}
      {dentils.map((i) => (
        <mesh key={i} position={[-w / 2 + 0.18 + i * 0.30, 0.66, 0.26]} material={m.shadow}>
          <boxGeometry args={[0.18, 0.14, 0.16]} />
        </mesh>
      ))}
      {/* Cornice slab — biggest projection */}
      <mesh position={[0, 0.80, 0.12]} material={m.light} castShadow>
        <boxGeometry args={[w + 0.30, 0.22, 0.74]} />
      </mesh>
      {/* Cornice shadow strip */}
      <mesh position={[0, 0.70, 0.48]} material={m.dark}>
        <boxGeometry args={[w + 0.30, 0.04, 0.04]} />
      </mesh>
    </group>
  );
}

// ─── Back wall + flanking wall piers ─────────────────────────────────────
function BackScene({ m }: { m: Record<K, THREE.MeshPhysicalMaterial> }) {
  return (
    <group position={[0, 0, -0.82]}>
      {/* Main back wall */}
      <mesh material={m.dark} receiveShadow>
        <boxGeometry args={[7.0, 10, 0.30]} />
      </mesh>
      {/* Horizontal string course */}
      {[0.8, -1.8].map((y, i) => (
        <mesh key={i} position={[0, y, 0.18]} material={m.shadow}>
          <boxGeometry args={[7.0, 0.12, 0.12]} />
        </mesh>
      ))}
      {/* Pilasters on back wall */}
      {[-2.0, -0.8, 0.8, 2.0].map((x, i) => (
        <mesh key={i} position={[x, 0, 0.18]} material={m.shadow}>
          <boxGeometry args={[0.24, 10, 0.10]} />
        </mesh>
      ))}
      {/* Side wing walls */}
      {([-3.6, 3.6] as const).map((x, i) => (
        <mesh key={i} position={[x, 0, 0.50]} material={m.dark} receiveShadow>
          <boxGeometry args={[0.50, 10, 2.0]} />
        </mesh>
      ))}
    </group>
  );
}

// ─── Steps / stylobate ────────────────────────────────────────────────────
function Steps({ m }: { m: Record<K, THREE.MeshPhysicalMaterial> }) {
  return (
    <group>
      <mesh position={[0, -3.00, 0.28]} material={m.light} castShadow receiveShadow>
        <boxGeometry args={[7.2, 0.18, 1.60]} />
      </mesh>
      <mesh position={[0, -3.18, 0.14]} material={m.stone} castShadow receiveShadow>
        <boxGeometry args={[7.5, 0.18, 1.40]} />
      </mesh>
      <mesh position={[0, -3.36, 0.00]} material={m.shadow} castShadow receiveShadow>
        <boxGeometry args={[7.8, 0.18, 1.20]} />
      </mesh>
    </group>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────
export default function FacadeModel({
  scrollRef,
  pointerRef,
  quality = "high",
}: {
  scrollRef:  React.MutableRefObject<number>;
  pointerRef: React.MutableRefObject<{ x: number; y: number }>;
  quality?:   "high" | "low";
}) {
  const group  = useRef<THREE.Group>(null);
  const reveal = useRef(0);
  const m      = useMats();

  useFrame((state, delta) => {
    reveal.current = Math.min(1, reveal.current + delta * 0.5);
    if (!group.current) return;
    const sc = scrollRef.current;
    const p  = pointerRef.current;

    // Gentle auto-sway + pointer parallax
    const targetY = Math.sin(state.clock.elapsedTime * 0.09) * 0.06 + p.x * 0.22 + sc * 0.8;
    const targetX = -p.y * 0.10 + sc * 0.12;
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, targetY, 0.045);
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, targetX, 0.045);
    group.current.position.y = THREE.MathUtils.lerp(group.current.position.y, -sc * 0.5, 0.05);

    // Scale-in reveal
    const s = 0.84 + THREE.MathUtils.smoothstep(reveal.current, 0, 1) * 0.16;
    group.current.scale.setScalar(s);
  });

  // Two large columns flanking the arch
  const COL_X = 2.10;

  return (
    <group ref={group}>
      {/* Background — fills void, no transparency gaps */}
      <BackScene m={m} />

      {/* Left column */}
      <group position={[-COL_X, -0.08, 0]}>
        <Column m={m} />
      </group>

      {/* Right column */}
      <group position={[COL_X, -0.08, 0]}>
        <Column m={m} />
      </group>

      {/* Central arch */}
      <group position={[0, 1.68, 0.10]}>
        <Arch m={m} />
      </group>

      {/* Entablature spanning both columns */}
      <group position={[0, 4.36, 0.06]}>
        <Entablature m={m} w={6.0} />
      </group>

      {/* Steps */}
      <Steps m={m} />
    </group>
  );
}
