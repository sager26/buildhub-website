"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import * as THREE from "three";

// ─── Palette (cream limestone, like page-14 catalog villa) ─────────────────
const C = {
  stone:      "#D6CEBC",   // main facade
  stoneLight: "#E4DDD0",   // protruding/sun-facing surfaces
  stoneMid:   "#C8C0AE",   // recessed, shadow side
  stoneDark:  "#B0A898",   // deep recesses, soffit
  joint:      "#9A9387",   // mortar joints, flute grooves
  accent:     "#CBC3B0",   // secondary surfaces
};

// ─── Shared materials ────────────────────────────────────────────────────────
function useMats() {
  return useMemo(() => {
    const mk = (color: string, rough = 0.88, cc = 0.08) =>
      new THREE.MeshPhysicalMaterial({ color, roughness: rough, metalness: 0, clearcoat: cc, clearcoatRoughness: 0.9 });
    return {
      stone:      mk(C.stone),
      light:      mk(C.stoneLight, 0.82, 0.1),
      mid:        mk(C.stoneMid, 0.92),
      dark:       mk(C.stoneDark, 0.96, 0),
      joint:      mk(C.joint, 1.0, 0),
      accent:     mk(C.accent, 0.9),
    };
  }, []);
}
type Mats = ReturnType<typeof useMats>;

// ─── Column ──────────────────────────────────────────────────────────────────
const COL_H  = 4.2;   // shaft height
const COL_R  = 0.19;  // base radius

function makeShaftProfile() {
  const pts: THREE.Vector2[] = [];
  const steps = 32;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const entasis = Math.sin(t * Math.PI) * 0.016;
    const taper   = t * 0.042;
    pts.push(new THREE.Vector2(COL_R + entasis - taper, -COL_H / 2 + t * COL_H));
  }
  return pts;
}

function Column({ m }: { m: Mats }) {
  const shaftGeo = useMemo(() => new THREE.LatheGeometry(makeShaftProfile(), 36), []);
  const N = 24;
  const flutes = useMemo(() =>
    Array.from({ length: N }, (_, i) => {
      const a = (i / N) * Math.PI * 2;
      return { x: Math.cos(a) * (COL_R + 0.004), z: Math.sin(a) * (COL_R + 0.004), a };
    }), []);

  return (
    <group>
      {/* Base plinth */}
      <mesh position={[0, -COL_H / 2 - 0.23, 0]} material={m.mid} castShadow>
        <boxGeometry args={[0.58, 0.20, 0.58]} />
      </mesh>
      {/* Lower torus */}
      <mesh position={[0, -COL_H / 2 + 0.07, 0]} rotation={[Math.PI / 2, 0, 0]} material={m.stone}>
        <torusGeometry args={[0.24, 0.065, 8, 36]} />
      </mesh>
      {/* Shaft */}
      <mesh geometry={shaftGeo} material={m.stone} castShadow />
      {/* Flute grooves */}
      {flutes.map(({ x, z, a }, i) => (
        <mesh key={i} position={[x, 0, z]} rotation={[0, -a, 0]} material={m.joint}>
          <boxGeometry args={[0.018, COL_H - 0.35, 0.009]} />
        </mesh>
      ))}
      {/* Neck astragal */}
      <mesh position={[0, COL_H / 2 - 0.26, 0]} rotation={[Math.PI / 2, 0, 0]} material={m.accent}>
        <torusGeometry args={[0.175, 0.038, 8, 36]} />
      </mesh>
      {/* Echinus (bell of capital) */}
      <mesh position={[0, COL_H / 2 - 0.05, 0]} material={m.stone} castShadow>
        <cylinderGeometry args={[0.30, 0.175, 0.22, 24]} />
      </mesh>
      {/* Capital bell detail – acanthus tier */}
      <mesh position={[0, COL_H / 2 + 0.12, 0]} material={m.light} castShadow>
        <cylinderGeometry args={[0.38, 0.30, 0.18, 24]} />
      </mesh>
      {/* Abacus slab */}
      <mesh position={[0, COL_H / 2 + 0.26, 0]} material={m.mid} castShadow>
        <boxGeometry args={[0.82, 0.14, 0.82]} />
      </mesh>
    </group>
  );
}

// ─── Voussoir arch (proper trapezoidal BufferGeometry) ───────────────────────
function makeVG(angle: number, step: number, Ri: number, Ro: number, d: number) {
  const h = step * 0.45;
  const a0 = angle - h, a1 = angle + h;
  const v = new Float32Array([
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

function Arch({ m, Ro = 1.0, Ri = 0.68, depth = 0.48, n = 13 }: {
  m: Mats; Ro?: number; Ri?: number; depth?: number; n?: number;
}) {
  const step = Math.PI / (n - 1);
  const vgs = useMemo(() =>
    Array.from({ length: n }, (_, i) => ({
      geo:   makeVG(Math.PI * (1 - i / (n - 1)), step, Ri, Ro, depth),
      isKey: i === Math.floor(n / 2),
    })), []);

  // Spandrel fill (behind voussoirs)
  const spandrelGeo = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-(Ro + 0.05), 0);
    for (let i = 0; i <= 20; i++) {
      const a = Math.PI - (i / 20) * Math.PI;
      s.lineTo(Math.cos(a) * (Ro + 0.04), Math.sin(a) * (Ro + 0.04));
    }
    s.lineTo(Ro + 0.05, 0);
    s.lineTo(Ro + 0.05 + 1.2, 0);
    s.lineTo(Ro + 0.05 + 1.2, 0.24);
    s.lineTo(-(Ro + 0.05 + 1.2), 0.24);
    s.lineTo(-(Ro + 0.05 + 1.2), 0);
    s.closePath();
    return new THREE.ExtrudeGeometry(s, { depth: depth * 0.65, bevelEnabled: false });
  }, []);

  return (
    <group>
      {/* Impost corbels */}
      {([-Ro - 0.05, Ro + 0.05] as const).map((x, i) => (
        <mesh key={i} position={[x * (i === 0 ? -1 : 1) * 0 + (i === 0 ? -(Ro + 0.05) : Ro + 0.05) * 0 + (i === 0 ? -Ri * 0.5 - 0.24 : Ri * 0.5 + 0.24), -0.1, 0]} material={m.mid}>
          <boxGeometry args={[0.5, 0.3, depth + 0.08]} />
        </mesh>
      ))}
      {/* Spandrel */}
      <mesh geometry={spandrelGeo} material={m.mid} position={[0, 0, -(depth * 0.65) / 2 - 0.01]} />
      {/* Voussoirs */}
      {vgs.map(({ geo, isKey }, i) => (
        <mesh key={i} geometry={geo} material={isKey ? m.dark : m.stone} castShadow />
      ))}
      {/* Keystone drop */}
      <mesh position={[0, Ri - 0.02, 0]} material={m.dark}>
        <boxGeometry args={[0.28, 0.52, depth + 0.04]} />
      </mesh>
      {/* Crown finial */}
      <mesh position={[0, Ro + 0.28, 0]} material={m.light}>
        <cylinderGeometry args={[0.07, 0.12, 0.26, 10]} />
      </mesh>
    </group>
  );
}

// ─── Baluster ────────────────────────────────────────────────────────────────
function makeBalusterProfile() {
  const pts: THREE.Vector2[] = [];
  const shapes = [
    [0, 0.06], [0.065, 0.06], [0.065, 0.10],
    [0.05, 0.14], [0.09, 0.24], [0.09, 0.44],
    [0.065, 0.56], [0.065, 0.60], [0, 0.60],
  ];
  for (const [r, y] of shapes) pts.push(new THREE.Vector2(r, y));
  return pts;
}

const BALUSTER_GEO = (() => {
  const g = new THREE.LatheGeometry(makeBalusterProfile(), 12);
  return g;
})();

function Balustrade({ m, w, count = 10 }: { m: Mats; w: number; count?: number }) {
  const spacing = w / (count + 1);
  return (
    <group>
      {/* Rail top */}
      <mesh position={[0, 0.66, 0]} material={m.light} castShadow>
        <boxGeometry args={[w + 0.1, 0.08, 0.14]} />
      </mesh>
      {/* Base rail */}
      <mesh position={[0, 0.04, 0]} material={m.light} castShadow>
        <boxGeometry args={[w + 0.1, 0.08, 0.14]} />
      </mesh>
      {/* Balusters */}
      {Array.from({ length: count }, (_, i) => (
        <mesh key={i} geometry={BALUSTER_GEO}
          position={[-w / 2 + spacing * (i + 1), 0, 0]}
          material={m.stone} castShadow
        />
      ))}
    </group>
  );
}

// ─── Window with arched top ───────────────────────────────────────────────────
function ArchedWindow({ m, w = 0.6, h = 1.4, depth = 0.12 }: { m: Mats; w?: number; h?: number; depth?: number }) {
  const archGeo = useMemo(() => {
    const shape = new THREE.Shape();
    const r = w / 2;
    shape.moveTo(-r, 0);
    shape.lineTo(r, 0);
    shape.lineTo(r, h - r);
    shape.absarc(0, h - r, r, 0, Math.PI, false);
    shape.closePath();

    const hole = new THREE.Path();
    const ri = r - 0.08;
    hole.moveTo(-ri, 0.05);
    hole.lineTo(ri, 0.05);
    hole.lineTo(ri, h - r - 0.02);
    hole.absarc(0, h - r - 0.02, ri, 0, Math.PI, false);
    hole.closePath();
    shape.holes.push(hole);

    return new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false });
  }, [w, h, depth]);

  return (
    <group>
      <mesh geometry={archGeo} material={m.light} position={[-w / 2, 0, -depth / 2]} castShadow />
      {/* Sill */}
      <mesh position={[0, -0.04, depth * 0.2]} material={m.accent}>
        <boxGeometry args={[w + 0.18, 0.08, 0.18]} />
      </mesh>
    </group>
  );
}

// ─── Entablature ──────────────────────────────────────────────────────────────
function Entablature({ m, w = 6.8 }: { m: Mats; w?: number }) {
  const triglyphs = [-2.4, -1.2, 0, 1.2, 2.4];
  return (
    <group>
      {/* Architrave (3-fascia) */}
      <mesh position={[0, 0.0, 0]} material={m.stone} castShadow>
        <boxGeometry args={[w, 0.22, 0.52]} />
      </mesh>
      <mesh position={[0, 0.26, 0.03]} material={m.light} castShadow>
        <boxGeometry args={[w, 0.08, 0.48]} />
      </mesh>
      {/* Frieze */}
      <mesh position={[0, 0.42, -0.04]} material={m.mid} castShadow>
        <boxGeometry args={[w, 0.38, 0.42]} />
      </mesh>
      {/* Triglyphs */}
      {triglyphs.map((x, i) => (
        <group key={i} position={[x, 0.42, 0.12]}>
          <mesh material={m.dark}>
            <boxGeometry args={[0.20, 0.40, 0.06]} />
          </mesh>
          {[-0.06, 0.06].map((dx, j) => (
            <mesh key={j} position={[dx, 0, 0.04]} material={m.dark}>
              <boxGeometry args={[0.048, 0.40, 0.06]} />
            </mesh>
          ))}
        </group>
      ))}
      {/* Cornice — projects forward */}
      <mesh position={[0, 0.76, 0.10]} material={m.light} castShadow>
        <boxGeometry args={[w + 0.22, 0.18, 0.72]} />
      </mesh>
      {/* Cornice shadow line */}
      <mesh position={[0, 0.68, 0.46]} material={m.dark}>
        <boxGeometry args={[w + 0.22, 0.04, 0.04]} />
      </mesh>
      {/* Dentils */}
      {Array.from({ length: 20 }, (_, i) => (
        <mesh key={i} position={[-w / 2 + 0.2 + i * 0.32, 0.62, 0.36]} material={m.mid}>
          <boxGeometry args={[0.18, 0.12, 0.14]} />
        </mesh>
      ))}
    </group>
  );
}

// ─── Upper floor / parapet ────────────────────────────────────────────────────
function UpperFloor({ m, w = 6.4 }: { m: Mats; w?: number }) {
  const winW = 0.72, winH = 1.5;
  const winPositions = [-2.1, 0, 2.1];

  return (
    <group>
      {/* Wall */}
      <mesh material={m.mid} castShadow receiveShadow>
        <boxGeometry args={[w, 2.2, 0.38]} />
      </mesh>
      {/* Pilasters at column positions */}
      {[-2.2, -1.05, 1.05, 2.2].map((x, i) => (
        <mesh key={i} position={[x, 0, 0.22]} material={m.stone} castShadow>
          <boxGeometry args={[0.22, 2.2, 0.10]} />
        </mesh>
      ))}
      {/* Windows */}
      {winPositions.map((x, i) => (
        <group key={i} position={[x, 0.0, 0.20]}>
          <ArchedWindow m={m} w={winW} h={winH} depth={0.10} />
        </group>
      ))}
      {/* Top string course */}
      <mesh position={[0, 1.14, 0.22]} material={m.light} castShadow>
        <boxGeometry args={[w + 0.18, 0.10, 0.18]} />
      </mesh>
      {/* Parapet / top cornice */}
      <mesh position={[0, 1.28, 0.06]} material={m.light} castShadow>
        <boxGeometry args={[w + 0.36, 0.20, 0.58]} />
      </mesh>
      {/* Parapet blocks */}
      {Array.from({ length: 7 }, (_, i) => (
        <mesh key={i} position={[-2.7 + i * 0.9, 1.56, 0.06]} material={m.stone} castShadow>
          <boxGeometry args={[0.52, 0.38, 0.54]} />
        </mesh>
      ))}
    </group>
  );
}

// ─── Main scene ───────────────────────────────────────────────────────────────
export default function FacadeModel({
  scrollRef,
  pointerRef,
  quality = "high",
}: {
  scrollRef:   React.MutableRefObject<number>;
  pointerRef:  React.MutableRefObject<{ x: number; y: number }>;
  quality?:    "high" | "low";
}) {
  const group  = useRef<THREE.Group>(null);
  const reveal = useRef(0);
  const m      = useMats();

  useFrame((state, delta) => {
    reveal.current = Math.min(1, reveal.current + delta * 0.45);
    const r  = reveal.current;
    const sc = scrollRef.current;
    const p  = pointerRef.current;
    if (!group.current) return;

    const targetY = Math.sin(state.clock.elapsedTime * 0.08) * 0.08
      + p.x * 0.30
      + sc * 0.9;
    const targetX = -p.y * 0.12 + sc * 0.14;
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, targetY, 0.05);
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, targetX, 0.05);
    group.current.position.y = THREE.MathUtils.lerp(group.current.position.y, -0.5 - sc * 0.6, 0.05);

    const scale = 0.86 + THREE.MathUtils.smoothstep(r, 0, 1) * 0.14;
    group.current.scale.setScalar(scale);
  });

  // Column X positions (matching classical proportions of page-14 villa)
  const colPositions = [-2.28, -1.08, 1.08, 2.28];
  const ARCH_RO = 1.02, ARCH_RI = 0.70;

  return (
    <group ref={group} dispose={null}>
      <Environment preset="city" />

      {/* ── Background wall ── */}
      <mesh position={[0, 0.6, -0.72]} material={m.mid} receiveShadow>
        <boxGeometry args={[7.2, 6.8, 0.28]} />
      </mesh>
      {/* String course at ground-floor top */}
      <mesh position={[0, 2.22, -0.52]} material={m.accent} castShadow>
        <boxGeometry args={[7.2, 0.12, 0.22]} />
      </mesh>

      {/* ── Columns ── */}
      {colPositions.map((x) => (
        <group key={x} position={[x, -0.38, 0]}>
          <Column m={m} />
        </group>
      ))}

      {/* ── Central arch ── */}
      <group position={[0, 1.48, 0.06]}>
        <Arch m={m} Ro={ARCH_RO} Ri={ARCH_RI} depth={0.50} n={15} />
      </group>

      {/* ── Side arched windows (flanking entry) ── */}
      {[-1.68, 1.68].map((x, i) => (
        <group key={i} position={[x, 0.52, 0.12]}>
          <ArchedWindow m={m} w={0.58} h={1.12} depth={0.10} />
        </group>
      ))}

      {/* ── Entablature ── */}
      <group position={[0, 4.26, 0.04]}>
        <Entablature m={m} w={6.8} />
      </group>

      {/* ── Balustrade over central arch ── */}
      <group position={[0, 5.30, 0.34]}>
        <Balustrade m={m} w={2.0} count={8} />
      </group>

      {/* ── Upper floor ── */}
      <group position={[0, 6.22, -0.24]}>
        <UpperFloor m={m} w={6.4} />
      </group>

      {/* ── Stylobate / steps ── */}
      <mesh position={[0, -2.88, 0.06]} material={m.light} castShadow>
        <boxGeometry args={[7.4, 0.16, 1.30]} />
      </mesh>
      <mesh position={[0, -3.04, -0.02]} material={m.stone} castShadow>
        <boxGeometry args={[7.6, 0.16, 1.12]} />
      </mesh>
      <mesh position={[0, -3.20, -0.10]} material={m.mid} castShadow>
        <boxGeometry args={[7.8, 0.16, 0.94]} />
      </mesh>
    </group>
  );
}
