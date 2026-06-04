"use client";

import dynamic from "next/dynamic";
import { useRef, useState, useMemo, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

// ── Shared material helpers ────────────────────────────────────────────────────
function mat(color: string, rough = 0.82, cc = 0.10) {
  return new THREE.MeshPhysicalMaterial({ color, roughness: rough, metalness: 0, clearcoat: cc, clearcoatRoughness: 0.88 });
}
const M_STONE  = mat("#EAE3D1", 0.82, 0.10);
const M_LIGHT  = mat("#F3EDE0", 0.74, 0.14);
const M_MID    = mat("#D6CFBD", 0.88, 0.05);
const M_DARK   = mat("#B0A99C", 0.95, 0.02);
const M_FOAM   = mat("#EEEAE2", 0.90, 0.04);
const M_JOINT  = mat("#8A8076", 1.00, 0.00);
const M_REED   = mat("#F0EAD8", 0.72, 0.16);

// ── Foam Stone Panel ──────────────────────────────────────────────────────────
function FoamStonePanel({ hovered }: { hovered: boolean }) {
  const ref = useRef<THREE.Group>(null);
  const rot = useRef(0);

  useFrame((_, dt) => {
    if (!ref.current) return;
    const speed = hovered ? 0.8 : 0.25;
    rot.current += dt * speed;
    ref.current.rotation.y = Math.sin(rot.current * 0.5) * 0.6;
    ref.current.rotation.x = Math.sin(rot.current * 0.3) * 0.08;
    const s = THREE.MathUtils.lerp(ref.current.scale.x, hovered ? 1.08 : 1.0, 0.07);
    ref.current.scale.setScalar(s);
  });

  // 2×3 grid of stone faces
  const stones = useMemo(() => {
    const list: { x: number; y: number; mat: THREE.Material }[] = [];
    const cols = 2, rows = 3;
    const sw = 0.58, sh = 0.25; // stone width/height
    const gap = 0.055;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        list.push({
          x: -sw / 2 - gap / 2 + c * (sw + gap),
          y: (-rows * sh - (rows - 1) * gap) / 2 + gap / 2 + r * (sh + gap) + sh / 2,
          mat: (r + c) % 2 === 0 ? M_LIGHT : M_STONE,
        });
      }
    }
    return list;
  }, []);

  return (
    <group ref={ref} rotation={[0.12, 0.3, 0]}>
      {/* Foam core slab (EPS — slightly greenish-white) */}
      <mesh material={M_FOAM} castShadow>
        <boxGeometry args={[1.40, 0.92, 0.26]} />
      </mesh>
      {/* Stone face tiles */}
      {stones.map((s, i) => (
        <mesh key={i} position={[s.x, s.y, 0.15]} material={s.mat} castShadow>
          <boxGeometry args={[0.58, 0.25, 0.06]} />
        </mesh>
      ))}
      {/* Mortar / joint lines (horizontal) */}
      {[0.16, -0.16].map((y, i) => (
        <mesh key={i} position={[0, y, 0.14]} material={M_JOINT}>
          <boxGeometry args={[1.25, 0.022, 0.02]} />
        </mesh>
      ))}
      {/* Mortar / joint line (vertical) */}
      <mesh position={[0, 0, 0.14]} material={M_JOINT}>
        <boxGeometry args={[0.022, 0.84, 0.02]} />
      </mesh>
      {/* Bottom label edge (shows EPS cross-section) */}
      <mesh position={[0, -0.48, 0.05]} material={M_MID}>
        <boxGeometry args={[1.40, 0.04, 0.30]} />
      </mesh>
    </group>
  );
}

// ── Decorative Cornice Molding ────────────────────────────────────────────────
function CorniceModel({ hovered }: { hovered: boolean }) {
  const ref = useRef<THREE.Group>(null);
  const rot = useRef(0.4);

  useFrame((_, dt) => {
    if (!ref.current) return;
    const speed = hovered ? 0.7 : 0.22;
    rot.current += dt * speed;
    ref.current.rotation.y = Math.sin(rot.current * 0.5) * 0.65 + 0.3;
    const s = THREE.MathUtils.lerp(ref.current.scale.x, hovered ? 1.08 : 1.0, 0.07);
    ref.current.scale.setScalar(s);
  });

  // Classical cornice profile — extruded along Z
  const corniceGeo = useMemo(() => {
    const s = new THREE.Shape();
    // Start at bottom-left, draw the cross-section profile
    s.moveTo(0, 0);
    s.lineTo(0.62, 0);          // bottom run
    s.lineTo(0.62, 0.08);       // lower fascia
    s.lineTo(0.22, 0.08);
    s.lineTo(0.22, 0.22);       // frieze recessed
    s.lineTo(0.40, 0.22);
    s.lineTo(0.40, 0.34);       // second fascia
    s.lineTo(0.58, 0.34);
    s.lineTo(0.58, 0.48);       // bed mould
    s.lineTo(0.72, 0.48);
    s.lineTo(0.72, 0.60);       // corona
    s.lineTo(0.62, 0.60);
    s.lineTo(0.62, 0.70);       // cymatium
    s.lineTo(0.00, 0.70);       // top — back to left
    s.closePath();
    return new THREE.ExtrudeGeometry(s, { depth: 1.70, bevelEnabled: false });
  }, []);

  const cBotGeo = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, 0); s.lineTo(0.62, 0); s.lineTo(0.62, 0.08); s.lineTo(0.22, 0.08);
    s.lineTo(0.22, 0.22); s.lineTo(0.40, 0.22); s.lineTo(0.40, 0.34); s.lineTo(0.58, 0.34);
    s.lineTo(0.58, 0.48); s.lineTo(0.72, 0.48); s.lineTo(0.72, 0.60); s.lineTo(0.62, 0.60);
    s.lineTo(0.62, 0.70); s.lineTo(0.00, 0.70); s.closePath();
    return new THREE.ShapeGeometry(s);
  }, []);

  return (
    <group ref={ref} position={[-0.36, -0.25, -0.85]}>
      <mesh geometry={corniceGeo} material={M_STONE} castShadow />
      {/* End caps */}
      <mesh geometry={cBotGeo} material={M_MID} />
      <mesh geometry={cBotGeo} material={M_MID} position={[0, 0, 1.70]} />
      {/* Dentil row along the top */}
      {Array.from({ length: 6 }, (_, i) => (
        <mesh key={i} position={[0.50, 0.42, 0.14 + i * 0.26]} material={M_LIGHT}>
          <boxGeometry args={[0.18, 0.12, 0.17]} />
        </mesh>
      ))}
    </group>
  );
}

// ── Column Capital ─────────────────────────────────────────────────────────────
function ColumnCapital({ hovered }: { hovered: boolean }) {
  const ref = useRef<THREE.Group>(null);
  const rot = useRef(-0.3);

  // Echinus profile
  const echinusGeo = useMemo(() => {
    const pts: THREE.Vector2[] = [];
    for (let i = 0; i <= 20; i++) {
      const t = i / 20;
      const ease = t * t * (3 - 2 * t);
      pts.push(new THREE.Vector2(0.21 + ease * 0.16, -0.14 + t * 0.30));
    }
    return new THREE.LatheGeometry(pts, 48);
  }, []);

  // Short shaft segment
  const shaftGeo = useMemo(() => {
    const pts: THREE.Vector2[] = [];
    for (let i = 0; i <= 16; i++) {
      const t = i / 16;
      const ent = Math.sin(t * Math.PI) * 0.012;
      pts.push(new THREE.Vector2(0.27 + ent - t * 0.022, -0.90 + t * 0.90));
    }
    return new THREE.LatheGeometry(pts, 64);
  }, []);

  // 16 reeds on the shaft
  const N = 16;
  const sinPN = Math.sin(Math.PI / N);
  const REED_R = (0.27 * sinPN) / (1 + sinPN);
  const REED_D = 0.27 / (1 + sinPN);

  useFrame((_, dt) => {
    if (!ref.current) return;
    const speed = hovered ? 0.9 : 0.28;
    rot.current += dt * speed;
    ref.current.rotation.y = rot.current * 0.5;
    const s = THREE.MathUtils.lerp(ref.current.scale.x, hovered ? 1.08 : 1.0, 0.07);
    ref.current.scale.setScalar(s);
  });

  return (
    <group ref={ref} position={[0, 0.10, 0]}>
      {/* Shaft */}
      <mesh geometry={shaftGeo} material={M_STONE} castShadow />
      {/* Reeds */}
      {Array.from({ length: N }, (_, i) => {
        const a = (i / N) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * REED_D, -0.45, Math.sin(a) * REED_D]} material={M_REED} castShadow>
            <cylinderGeometry args={[REED_R * 0.85, REED_R, 0.82, 12]} />
          </mesh>
        );
      })}
      {/* 3 annulet rings */}
      {[0.36, 0.30, 0.24].map((offset, i) => (
        <mesh key={i} position={[0, offset - 0.52, 0]} rotation={[Math.PI / 2, 0, 0]} material={M_MID}>
          <torusGeometry args={[0.22, 0.016, 8, 48]} />
        </mesh>
      ))}
      {/* Echinus */}
      <mesh geometry={echinusGeo} position={[0, -0.14, 0]} material={M_STONE} castShadow />
      {/* Abacus */}
      <mesh position={[0, 0.30, 0]} material={M_LIGHT} castShadow>
        <boxGeometry args={[0.88, 0.12, 0.88]} />
      </mesh>
      <mesh position={[0, 0.23, 0]} material={M_MID}>
        <boxGeometry args={[0.92, 0.030, 0.92]} />
      </mesh>
      {/* Base torus */}
      <mesh position={[0, -0.92, 0]} rotation={[Math.PI / 2, 0, 0]} material={M_STONE}>
        <torusGeometry args={[0.30, 0.060, 10, 64]} />
      </mesh>
      <mesh position={[0, -1.04, 0]} material={M_MID}>
        <boxGeometry args={[0.72, 0.18, 0.72]} />
      </mesh>
    </group>
  );
}

// ── Arch / Keystone Section ────────────────────────────────────────────────────
function ArchSection({ hovered }: { hovered: boolean }) {
  const ref = useRef<THREE.Group>(null);
  const rot = useRef(0.6);

  function archStone(angle: number, step: number, Ri: number, Ro: number, D: number, zOff = 0) {
    const h = step * 0.480;
    const a0 = angle - h, a1 = angle + h;
    const fz = D / 2 + zOff, bz = -D / 2 + zOff;
    const v = new Float32Array([
      Math.cos(a0)*Ri, Math.sin(a0)*Ri, fz, Math.cos(a1)*Ri, Math.sin(a1)*Ri, fz,
      Math.cos(a1)*Ro, Math.sin(a1)*Ro, fz, Math.cos(a0)*Ro, Math.sin(a0)*Ro, fz,
      Math.cos(a0)*Ri, Math.sin(a0)*Ri, bz, Math.cos(a1)*Ri, Math.sin(a1)*Ri, bz,
      Math.cos(a1)*Ro, Math.sin(a1)*Ro, bz, Math.cos(a0)*Ro, Math.sin(a0)*Ro, bz,
    ]);
    const idx = [0,1,2,0,2,3,4,6,5,4,7,6,0,4,5,0,5,1,3,2,6,3,6,7,0,3,7,0,7,4,1,5,6,1,6,2];
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(v, 3));
    g.setIndex(idx); g.computeVertexNormals();
    return g;
  }

  const Ri = 0.55, Ro = 0.90, D = 0.40, N = 7;
  const step = Math.PI / (N - 1);
  const stones = useMemo(
    () => Array.from({ length: N }, (_, i) => ({
      geo: archStone(Math.PI * (1 - i / (N - 1)), step, Ri, Ro, D, i % 2 === 0 ? 0.010 : -0.006),
      mat: i === Math.floor(N / 2) ? M_LIGHT : i % 2 === 0 ? M_LIGHT : M_STONE,
    })),
    [],
  );

  useFrame((_, dt) => {
    if (!ref.current) return;
    const speed = hovered ? 0.75 : 0.20;
    rot.current += dt * speed;
    ref.current.rotation.y = Math.sin(rot.current * 0.4) * 0.55;
    ref.current.rotation.x = Math.sin(rot.current * 0.25) * 0.06;
    const s = THREE.MathUtils.lerp(ref.current.scale.x, hovered ? 1.08 : 1.0, 0.07);
    ref.current.scale.setScalar(s);
  });

  return (
    <group ref={ref} position={[0, -0.05, 0]}>
      {/* Voussoir ring */}
      {stones.map(({ geo, mat }, i) => (
        <mesh key={i} geometry={geo} material={mat} castShadow />
      ))}
      {/* Keystone proud */}
      <mesh position={[0, Ri + 0.18, 0.02]} material={M_LIGHT} castShadow>
        <boxGeometry args={[0.28, 0.48, D + 0.08]} />
      </mesh>
      {/* Archivolt band */}
      {useMemo(() => {
        const s = new THREE.Shape();
        for (let i = 0; i <= 60; i++) {
          const a = (i / 60) * Math.PI;
          const fn = i === 0 ? "moveTo" : "lineTo";
          (s as any)[fn](Math.cos(a) * (Ro + 0.10), Math.sin(a) * (Ro + 0.10));
        }
        s.lineTo(Ro + 0.01, 0);
        for (let i = 60; i >= 0; i--) {
          const a = (i / 60) * Math.PI;
          s.lineTo(Math.cos(a) * (Ro + 0.01), Math.sin(a) * (Ro + 0.01));
        }
        s.closePath();
        const g = new THREE.ExtrudeGeometry(s, { depth: D * 0.6, bevelEnabled: false });
        return <mesh geometry={g} material={M_MID} position={[0, 0, D * 0.08]} castShadow />;
      }, [])}
      {/* Springer / impost blocks */}
      {([-1, 1] as const).map((s, i) => (
        <mesh key={i} position={[s * (Ri + 0.26), -0.12, 0]} material={M_MID} castShadow>
          <boxGeometry args={[0.44, 0.30, D + 0.10]} />
        </mesh>
      ))}
      {/* Pier stubs */}
      {([-1, 1] as const).map((s, i) => (
        <mesh key={i} position={[s * (Ri + 0.26), -0.62, 0]} material={M_STONE} castShadow>
          <boxGeometry args={[0.44, 0.70, D + 0.06]} />
        </mesh>
      ))}
    </group>
  );
}

// ── Per-model spotlight ────────────────────────────────────────────────────────
function ModelLight({ x, hovered }: { x: number; hovered: boolean }) {
  return (
    <>
      <pointLight
        position={[x, 2.8, 2.4]}
        intensity={hovered ? 38 : 22}
        color="#fff4e0"
        distance={7}
        decay={2}
      />
      <pointLight
        position={[x - 1.2, 1.0, 1.6]}
        intensity={hovered ? 6 : 3}
        color="#d0e4ff"
        distance={5}
        decay={2}
      />
    </>
  );
}

// ── Scene inside Canvas ───────────────────────────────────────────────────────
const SPACING = 3.2;
const POSITIONS = [-SPACING * 1.5, -SPACING * 0.5, SPACING * 0.5, SPACING * 1.5];

function Scene3D({ hovered }: { hovered: number | null }) {
  return (
    <>
      <ambientLight intensity={0.30} color="#f8f0e0" />
      {POSITIONS.map((x, i) => (
        <ModelLight key={i} x={x} hovered={hovered === i} />
      ))}

      {/* Model 0 — Foam Stone */}
      <group position={[POSITIONS[0], 0, 0]}>
        <FoamStonePanel hovered={hovered === 0} />
      </group>

      {/* Model 1 — Cornice Molding */}
      <group position={[POSITIONS[1], 0, 0]}>
        <CorniceModel hovered={hovered === 1} />
      </group>

      {/* Model 2 — Column Capital */}
      <group position={[POSITIONS[2], 0, 0]}>
        <ColumnCapital hovered={hovered === 2} />
      </group>

      {/* Model 3 — Arch Section */}
      <group position={[POSITIONS[3], 0, 0]}>
        <ArchSection hovered={hovered === 3} />
      </group>

      {/* Invisible hover planes for raycasting — one per model */}
      {POSITIONS.map((x, i) => (
        <mesh
          key={i}
          position={[x, 0, 1.2]}
          visible={false}
          onPointerEnter={() => {
            // handled in parent via state
          }}
        >
          <planeGeometry args={[SPACING * 0.90, 3.2]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
      ))}
    </>
  );
}

// ── Product info cards ─────────────────────────────────────────────────────────
const CARDS = [
  {
    n:    "01",
    name: "Foam Stone",
    tag:  "Wall Cladding",
    body: "Expanded Polystyrene (EPS) core bonded with a cement-polymer stone coat. 80% lighter than real stone — no extra structural load, no heavy lifting, no delays.",
  },
  {
    n:    "02",
    name: "Decorative Moldings",
    tag:  "Cornices & Trim",
    body: "Classical cornice, window surround, string-course, and sill profiles cut to your exact dimensions. Pre-finished and ready to fix in one working day.",
  },
  {
    n:    "03",
    name: "Columns & Capitals",
    tag:  "Structural Decor",
    body: "Full column kits — reeded or fluted shaft, Doric to Corinthian capital, plinth and base. Supplied as segments that stack and bond on site in hours.",
  },
  {
    n:    "04",
    name: "Architectural Arches",
    tag:  "Entry Systems",
    body: "Semicircular and segmental arch kits with precision-cut voussoirs. The keystones, impost blocks, and archivolt mouldings ship as a complete set.",
  },
];

// ── Wrapper component ─────────────────────────────────────────────────────────
function ProductShowcase3DInner() {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <section className="bg-[#0c0b09] py-24 md:py-32">
      <div className="container-x mb-10">
        <span className="eyebrow">Products in 3D</span>
        <h2 className="mt-4 max-w-2xl font-display text-4xl font-bold leading-[1.05] tracking-tight text-white md:text-5xl">
          Every element, crafted
          <br />
          <span className="text-brand-green">in detail</span>
        </h2>
        <p className="mt-4 max-w-lg text-base leading-relaxed text-white/50">
          Hover over each model to inspect it. All products are manufactured at
          our Jordan facility — custom sizes on request.
        </p>
      </div>

      {/* 3D Canvas */}
      <div
        className="relative w-full"
        style={{ height: "clamp(280px, 40vw, 520px)" }}
        onPointerLeave={() => setHovered(null)}
      >
        <Canvas
          dpr={[1, 1.6]}
          camera={{ position: [0, 0.2, 12], fov: 52 }}
          gl={{
            antialias: true,
            alpha: false,
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 0.92,
          }}
          className="!absolute inset-0"
          onCreated={({ scene }) => {
            scene.background = new THREE.Color("#0c0b09");
          }}
          onPointerMove={(e) => {
            const w = (e.currentTarget as HTMLElement).clientWidth;
            const x = e.clientX - (e.currentTarget as HTMLElement).getBoundingClientRect().left;
            const frac = x / w;
            const idx = Math.floor(frac * 4);
            setHovered(Math.max(0, Math.min(3, idx)));
          }}
        >
          <Suspense fallback={null}>
            <Scene3D hovered={hovered} />
          </Suspense>
        </Canvas>

        {/* Hover hint labels — overlay on canvas */}
        <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-around px-4">
          {CARDS.map((c, i) => (
            <div
              key={i}
              className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${
                hovered === i
                  ? "bg-brand-green text-white scale-105"
                  : "bg-white/8 text-white/40"
              }`}
            >
              {c.tag}
            </div>
          ))}
        </div>
      </div>

      {/* Description cards */}
      <div className="container-x mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {CARDS.map((c, i) => (
          <div
            key={i}
            className={`cursor-default rounded-2xl border p-6 transition-all duration-300 ${
              hovered === i
                ? "border-brand-green/50 bg-white/5 shadow-[0_0_30px_rgba(0,129,0,0.12)]"
                : "border-white/8 bg-white/3"
            }`}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            <span className="font-display text-4xl font-extrabold text-white/10">{c.n}</span>
            <span
              className={`mt-1 block text-xs font-semibold uppercase tracking-widest transition-colors ${
                hovered === i ? "text-brand-green" : "text-white/30"
              }`}
            >
              {c.tag}
            </span>
            <h3 className="mt-3 font-display text-xl font-semibold text-white">{c.name}</h3>
            <p className="mt-2 text-sm leading-relaxed text-white/50">{c.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// Export with no-SSR (Three.js requires browser)
export default dynamic(() => Promise.resolve(ProductShowcase3DInner), { ssr: false });
