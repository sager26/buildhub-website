"use client";

import dynamic from "next/dynamic";
import { useRef, useState, useMemo, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { AnimatePresence, motion } from "framer-motion";
import * as THREE from "three";

// ── Shared materials ───────────────────────────────────────────────────────────
function mat(color: string, rough = 0.82, cc = 0.10) {
  return new THREE.MeshPhysicalMaterial({ color, roughness: rough, metalness: 0, clearcoat: cc, clearcoatRoughness: 0.88 });
}
const M_STONE = mat("#EAE3D1", 0.82, 0.10);
const M_LIGHT = mat("#F3EDE0", 0.74, 0.14);
const M_MID   = mat("#D6CFBD", 0.88, 0.05);
const M_FOAM  = mat("#EEEAE2", 0.90, 0.04);
const M_JOINT = mat("#8A8076", 1.00, 0.00);
const M_REED  = mat("#F0EAD8", 0.72, 0.16);

// ── Foam Stone Panel ──────────────────────────────────────────────────────────
function FoamStonePanel({ hovered, preview = false }: { hovered: boolean; preview?: boolean }) {
  const ref = useRef<THREE.Group>(null);
  const rot = useRef(0);

  useFrame((_, dt) => {
    if (!ref.current || preview) return;
    rot.current += dt * (hovered ? 0.8 : 0.25);
    ref.current.rotation.y = Math.sin(rot.current * 0.5) * 0.6;
    ref.current.rotation.x = Math.sin(rot.current * 0.3) * 0.08;
    const s = THREE.MathUtils.lerp(ref.current.scale.x, hovered ? 1.06 : 1.0, 0.07);
    ref.current.scale.setScalar(s);
  });

  const stones = useMemo(() => {
    const list: { x: number; y: number; m: THREE.Material }[] = [];
    const cols = 2, rows = 3, sw = 0.58, sh = 0.25, gap = 0.055;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        list.push({
          x: -sw / 2 - gap / 2 + c * (sw + gap),
          y: (-rows * sh - (rows - 1) * gap) / 2 + gap / 2 + r * (sh + gap) + sh / 2,
          m: (r + c) % 2 === 0 ? M_LIGHT : M_STONE,
        });
      }
    }
    return list;
  }, []);

  return (
    <group ref={ref} rotation={preview ? [0.1, 0.4, 0] : [0.12, 0.3, 0]}>
      <mesh material={M_FOAM} castShadow><boxGeometry args={[1.40, 0.92, 0.26]} /></mesh>
      {stones.map((s, i) => (
        <mesh key={i} position={[s.x, s.y, 0.15]} material={s.m} castShadow>
          <boxGeometry args={[0.58, 0.25, 0.06]} />
        </mesh>
      ))}
      {[0.16, -0.16].map((y, i) => (
        <mesh key={i} position={[0, y, 0.14]} material={M_JOINT}>
          <boxGeometry args={[1.25, 0.022, 0.02]} />
        </mesh>
      ))}
      <mesh position={[0, 0, 0.14]} material={M_JOINT}>
        <boxGeometry args={[0.022, 0.84, 0.02]} />
      </mesh>
      <mesh position={[0, -0.48, 0.05]} material={M_MID}>
        <boxGeometry args={[1.40, 0.04, 0.30]} />
      </mesh>
    </group>
  );
}

// ── Cornice Molding ───────────────────────────────────────────────────────────
function CorniceModel({ hovered, preview = false }: { hovered: boolean; preview?: boolean }) {
  const ref = useRef<THREE.Group>(null);
  const rot = useRef(0.4);

  useFrame((_, dt) => {
    if (!ref.current || preview) return;
    rot.current += dt * (hovered ? 0.7 : 0.22);
    ref.current.rotation.y = Math.sin(rot.current * 0.5) * 0.65 + 0.3;
    const s = THREE.MathUtils.lerp(ref.current.scale.x, hovered ? 1.06 : 1.0, 0.07);
    ref.current.scale.setScalar(s);
  });

  const corniceGeo = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, 0); s.lineTo(0.62, 0); s.lineTo(0.62, 0.08); s.lineTo(0.22, 0.08);
    s.lineTo(0.22, 0.22); s.lineTo(0.40, 0.22); s.lineTo(0.40, 0.34); s.lineTo(0.58, 0.34);
    s.lineTo(0.58, 0.48); s.lineTo(0.72, 0.48); s.lineTo(0.72, 0.60); s.lineTo(0.62, 0.60);
    s.lineTo(0.62, 0.70); s.lineTo(0.00, 0.70); s.closePath();
    return new THREE.ExtrudeGeometry(s, { depth: 1.70, bevelEnabled: false });
  }, []);

  const capGeo = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, 0); s.lineTo(0.62, 0); s.lineTo(0.62, 0.08); s.lineTo(0.22, 0.08);
    s.lineTo(0.22, 0.22); s.lineTo(0.40, 0.22); s.lineTo(0.40, 0.34); s.lineTo(0.58, 0.34);
    s.lineTo(0.58, 0.48); s.lineTo(0.72, 0.48); s.lineTo(0.72, 0.60); s.lineTo(0.62, 0.60);
    s.lineTo(0.62, 0.70); s.lineTo(0.00, 0.70); s.closePath();
    return new THREE.ShapeGeometry(s);
  }, []);

  return (
    <group ref={ref} position={preview ? [-0.5, -0.25, -0.85] : [-0.36, -0.25, -0.85]}>
      <mesh geometry={corniceGeo} material={M_STONE} castShadow />
      <mesh geometry={capGeo} material={M_MID} />
      <mesh geometry={capGeo} material={M_MID} position={[0, 0, 1.70]} />
      {Array.from({ length: 6 }, (_, i) => (
        <mesh key={i} position={[0.50, 0.42, 0.14 + i * 0.26]} material={M_LIGHT}>
          <boxGeometry args={[0.18, 0.12, 0.17]} />
        </mesh>
      ))}
    </group>
  );
}

// ── Column Capital ─────────────────────────────────────────────────────────────
function ColumnCapital({ hovered, preview = false }: { hovered: boolean; preview?: boolean }) {
  const ref = useRef<THREE.Group>(null);
  const rot = useRef(-0.3);

  const echinusGeo = useMemo(() => {
    const pts: THREE.Vector2[] = [];
    for (let i = 0; i <= 20; i++) {
      const t = i / 20, e = t * t * (3 - 2 * t);
      pts.push(new THREE.Vector2(0.21 + e * 0.16, -0.14 + t * 0.30));
    }
    return new THREE.LatheGeometry(pts, 48);
  }, []);

  const shaftGeo = useMemo(() => {
    const pts: THREE.Vector2[] = [];
    for (let i = 0; i <= 16; i++) {
      const t = i / 16;
      pts.push(new THREE.Vector2(0.27 + Math.sin(t * Math.PI) * 0.012 - t * 0.022, -0.90 + t * 0.90));
    }
    return new THREE.LatheGeometry(pts, 64);
  }, []);

  const N = 16;
  const sinPN = Math.sin(Math.PI / N);
  const REED_R = (0.27 * sinPN) / (1 + sinPN);
  const REED_D = 0.27 / (1 + sinPN);

  useFrame((_, dt) => {
    if (!ref.current || preview) return;
    rot.current += dt * (hovered ? 0.9 : 0.28);
    ref.current.rotation.y = rot.current * 0.5;
    const s = THREE.MathUtils.lerp(ref.current.scale.x, hovered ? 1.06 : 1.0, 0.07);
    ref.current.scale.setScalar(s);
  });

  return (
    <group ref={ref} position={[0, 0.10, 0]}>
      <mesh geometry={shaftGeo} material={M_STONE} castShadow />
      {Array.from({ length: N }, (_, i) => {
        const a = (i / N) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * REED_D, -0.45, Math.sin(a) * REED_D]} material={M_REED} castShadow>
            <cylinderGeometry args={[REED_R * 0.85, REED_R, 0.82, 12]} />
          </mesh>
        );
      })}
      {[0.36, 0.30, 0.24].map((off, i) => (
        <mesh key={i} position={[0, off - 0.52, 0]} rotation={[Math.PI / 2, 0, 0]} material={M_MID}>
          <torusGeometry args={[0.22, 0.016, 8, 48]} />
        </mesh>
      ))}
      <mesh geometry={echinusGeo} position={[0, -0.14, 0]} material={M_STONE} castShadow />
      <mesh position={[0, 0.30, 0]} material={M_LIGHT} castShadow>
        <boxGeometry args={[0.88, 0.12, 0.88]} />
      </mesh>
      <mesh position={[0, 0.23, 0]} material={M_MID}>
        <boxGeometry args={[0.92, 0.030, 0.92]} />
      </mesh>
      <mesh position={[0, -0.92, 0]} rotation={[Math.PI / 2, 0, 0]} material={M_STONE}>
        <torusGeometry args={[0.30, 0.060, 10, 64]} />
      </mesh>
      <mesh position={[0, -1.04, 0]} material={M_MID}>
        <boxGeometry args={[0.72, 0.18, 0.72]} />
      </mesh>
    </group>
  );
}

// ── Arch Section ──────────────────────────────────────────────────────────────
function ArchSection({ hovered, preview = false }: { hovered: boolean; preview?: boolean }) {
  const ref = useRef<THREE.Group>(null);
  const rot = useRef(0.6);

  function archStone(angle: number, step: number, Ri: number, Ro: number, D: number, zOff = 0) {
    const h = step * 0.480;
    const [a0, a1] = [angle - h, angle + h];
    const [fz, bz] = [D / 2 + zOff, -D / 2 + zOff];
    const v = new Float32Array([
      Math.cos(a0)*Ri, Math.sin(a0)*Ri, fz,  Math.cos(a1)*Ri, Math.sin(a1)*Ri, fz,
      Math.cos(a1)*Ro, Math.sin(a1)*Ro, fz,  Math.cos(a0)*Ro, Math.sin(a0)*Ro, fz,
      Math.cos(a0)*Ri, Math.sin(a0)*Ri, bz,  Math.cos(a1)*Ri, Math.sin(a1)*Ri, bz,
      Math.cos(a1)*Ro, Math.sin(a1)*Ro, bz,  Math.cos(a0)*Ro, Math.sin(a0)*Ro, bz,
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
      m: i === Math.floor(N / 2) ? M_LIGHT : i % 2 === 0 ? M_LIGHT : M_STONE,
    })),
    [],
  );

  const archivoltGeo = useMemo(() => {
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
    return new THREE.ExtrudeGeometry(s, { depth: D * 0.6, bevelEnabled: false });
  }, []);

  useFrame((_, dt) => {
    if (!ref.current || preview) return;
    rot.current += dt * (hovered ? 0.75 : 0.20);
    ref.current.rotation.y = Math.sin(rot.current * 0.4) * 0.55;
    ref.current.rotation.x = Math.sin(rot.current * 0.25) * 0.06;
    const s = THREE.MathUtils.lerp(ref.current.scale.x, hovered ? 1.06 : 1.0, 0.07);
    ref.current.scale.setScalar(s);
  });

  return (
    <group ref={ref} position={[0, -0.05, 0]}>
      {stones.map(({ geo, m }, i) => <mesh key={i} geometry={geo} material={m} castShadow />)}
      <mesh position={[0, Ri + 0.18, 0.02]} material={M_LIGHT} castShadow>
        <boxGeometry args={[0.28, 0.48, D + 0.08]} />
      </mesh>
      <mesh geometry={archivoltGeo} material={M_MID} position={[0, 0, D * 0.08]} castShadow />
      {([-1, 1] as const).map((s, i) => (
        <group key={i}>
          <mesh position={[s * (Ri + 0.26), -0.12, 0]} material={M_MID} castShadow>
            <boxGeometry args={[0.44, 0.30, D + 0.10]} />
          </mesh>
          <mesh position={[s * (Ri + 0.26), -0.62, 0]} material={M_STONE} castShadow>
            <boxGeometry args={[0.44, 0.70, D + 0.06]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ── Render the right model by index ───────────────────────────────────────────
function ModelByIndex({ index, hovered = false, preview = false }: {
  index: number; hovered?: boolean; preview?: boolean;
}) {
  if (index === 0) return <FoamStonePanel hovered={hovered} preview={preview} />;
  if (index === 1) return <CorniceModel   hovered={hovered} preview={preview} />;
  if (index === 2) return <ColumnCapital  hovered={hovered} preview={preview} />;
  if (index === 3) return <ArchSection    hovered={hovered} preview={preview} />;
  return null;
}

// ── Per-model spotlight ────────────────────────────────────────────────────────
function ModelLight({ x, hovered }: { x: number; hovered: boolean }) {
  return (
    <>
      <pointLight position={[x, 3.0, 2.6]} intensity={hovered ? 48 : 28} color="#fff4e0" distance={7} decay={2} />
      <pointLight position={[x - 1.0, 0.8, 1.4]} intensity={hovered ? 8 : 4} color="#d0e4ff" distance={5} decay={2} />
    </>
  );
}

// ── Main showcase scene ────────────────────────────────────────────────────────
const SPACING = 2.50;
const POSITIONS = [-SPACING * 1.5, -SPACING * 0.5, SPACING * 0.5, SPACING * 1.5];

function ShowcaseScene({ hovered }: { hovered: number | null }) {
  return (
    <>
      <ambientLight intensity={0.28} color="#f8f0e0" />
      {POSITIONS.map((x, i) => (
        <ModelLight key={i} x={x} hovered={hovered === i} />
      ))}
      {POSITIONS.map((x, i) => (
        <group key={i} position={[x, 0, 0]} scale={[1.35, 1.35, 1.35]}>
          <ModelByIndex index={i} hovered={hovered === i} />
        </group>
      ))}
    </>
  );
}

// ── Preview scene (single model, large, with OrbitControls) ───────────────────
function PreviewScene({ index }: { index: number }) {
  return (
    <>
      <ambientLight intensity={0.35} color="#f8f0e0" />
      <pointLight position={[2.5, 3.5, 3.0]} intensity={80} color="#fff4e0" distance={12} decay={2} />
      <pointLight position={[-2.0, 1.0, 1.5]} intensity={18} color="#cce0ff" distance={8} decay={2} />
      <pointLight position={[0, -1, 2]} intensity={6} color="#fff0cc" distance={6} decay={2} />
      <group scale={[1.8, 1.8, 1.8]}>
        <ModelByIndex index={index} preview />
      </group>
      <OrbitControls
        autoRotate
        autoRotateSpeed={1.8}
        enableZoom={false}
        enablePan={false}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI * 0.72}
      />
    </>
  );
}

// ── Product data ───────────────────────────────────────────────────────────────
const CARDS = [
  {
    n: "01", name: "Foam Stone", tag: "Wall Cladding",
    body: "Expanded Polystyrene (EPS) core bonded with a cement-polymer stone coat. 80% lighter than real stone — no extra structural load, no heavy lifting, no delays.",
    detail: "Each panel arrives pre-coated and ready to bond. Standard sizes from 50×30 cm, custom dimensions available. Surface finishes include smooth limestone, rough travertine, and split-face textures.",
  },
  {
    n: "02", name: "Decorative Moldings", tag: "Cornices & Trim",
    body: "Classical cornice, window surround, string-course, and sill profiles cut to your exact dimensions. Pre-finished and ready to fix in one working day.",
    detail: "Profiles available from simple fascias to full five-part cornices. All pieces are mitre-cut on delivery. Compatible with BuildHub column and arch systems for complete facade coordination.",
  },
  {
    n: "03", name: "Columns & Capitals", tag: "Structural Decor",
    body: "Full column kits — reeded or fluted shaft, Doric to Corinthian capital, plinth and base. Supplied as segments that stack and bond on site in hours.",
    detail: "Available diameters: 25 cm to 60 cm. Heights from 2 m to 6 m in standard kits, unlimited with custom stacking. Capitals: Doric, Ionic, Corinthian, and modern smooth variants.",
  },
  {
    n: "04", name: "Architectural Arches", tag: "Entry Systems",
    body: "Semicircular and segmental arch kits with precision-cut voussoirs. The keystones, impost blocks, and archivolt mouldings ship as a complete set.",
    detail: "Clear spans from 80 cm to 4 m. Voussoirs are precision-numbered for fast site assembly. Available profiles: plain, rusticated, and fully moulded archivolt with keystone drop.",
  },
];

// ── Preview modal ─────────────────────────────────────────────────────────────
function PreviewModal({
  index,
  onClose,
  onPrev,
  onNext,
}: {
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const card = CARDS[index];

  return (
    <motion.div
      className="fixed inset-0 z-[400] flex flex-col md:flex-row bg-[#0c0b09]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.28 }}
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute right-5 top-5 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/8 text-white/70 transition hover:bg-white/15 hover:text-white"
        aria-label="Close"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M2 2L14 14M14 2L2 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
      </button>

      {/* Prev / Next */}
      <button
        onClick={onPrev}
        className="absolute left-4 top-1/2 z-10 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/8 text-white/70 transition hover:bg-white/15 hover:text-white"
        aria-label="Previous"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M11 4L5 9L11 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      <button
        onClick={onNext}
        className="absolute right-4 top-1/2 z-10 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/8 text-white/70 transition hover:bg-white/15 hover:text-white"
        aria-label="Next"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M7 4L13 9L7 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* 3D canvas — takes up most of the space */}
      <div className="relative flex-1">
        <Canvas
          key={index}            // remounts canvas when index changes
          dpr={[1, 1.8]}
          camera={{ position: [0, 0.2, 3.6], fov: 50 }}
          gl={{
            antialias: true,
            alpha: false,
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 0.90,
          }}
          className="!absolute inset-0"
          onCreated={({ scene }) => { scene.background = new THREE.Color("#0c0b09"); }}
        >
          <Suspense fallback={null}>
            <PreviewScene index={index} />
          </Suspense>
        </Canvas>
        {/* Drag hint */}
        <p className="pointer-events-none absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-medium text-white/40 backdrop-blur-sm">
          Drag to rotate · {index + 1} / {CARDS.length}
        </p>
      </div>

      {/* Info panel */}
      <motion.div
        key={`info-${index}`}
        className="flex flex-col justify-center border-t border-white/10 p-8 md:w-[360px] md:border-l md:border-t-0 md:p-12"
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.35, delay: 0.10 }}
      >
        <span className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-green">
          {card.tag}
        </span>
        <h2 className="mt-3 font-display text-3xl font-bold text-white md:text-4xl">
          {card.name}
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-white/60">
          {card.body}
        </p>
        <p className="mt-4 text-sm leading-relaxed text-white/40">
          {card.detail}
        </p>

        {/* Progress dots */}
        <div className="mt-8 flex gap-2">
          {CARDS.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === index ? "w-6 bg-brand-green" : "w-1.5 bg-white/20"
              }`}
            />
          ))}
        </div>

        <a
          href="https://wa.me/962797435635"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-brand-green px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#00b400]"
        >
          Get a Quote
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M1 7h12M7 1l6 6-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </a>
      </motion.div>
    </motion.div>
  );
}

// ── Main section ──────────────────────────────────────────────────────────────
function ProductShowcase3DInner() {
  const [hovered, setHovered]       = useState<number | null>(null);
  const [selected, setSelected]     = useState<number | null>(null);

  const handleCanvasPointerMove = (e: React.PointerEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const frac = (e.clientX - rect.left) / rect.width;
    setHovered(Math.max(0, Math.min(3, Math.floor(frac * 4))));
  };

  return (
    <>
      <section className="bg-[#0c0b09] py-24 md:py-32">
        <div className="container-x mb-10">
          <span className="eyebrow">Products in 3D</span>
          <h2 className="mt-4 max-w-2xl font-display text-4xl font-bold leading-[1.05] tracking-tight text-white md:text-5xl">
            Every element, crafted
            <br />
            <span className="text-brand-green">in detail</span>
          </h2>
          <p className="mt-4 max-w-lg text-base leading-relaxed text-white/50">
            Hover to inspect — tap or click to explore each product up close.
          </p>
        </div>

        {/* 3D Canvas — larger height for bigger models */}
        <div
          className="relative w-full cursor-pointer"
          style={{ height: "clamp(340px, 46vw, 600px)" }}
          onPointerMove={handleCanvasPointerMove}
          onPointerLeave={() => setHovered(null)}
          onClick={() => hovered !== null && setSelected(hovered)}
        >
          <Canvas
            dpr={[1, 1.7]}
            camera={{ position: [0, 0.15, 9.0], fov: 60 }}
            gl={{
              antialias: true,
              alpha: false,
              toneMapping: THREE.ACESFilmicToneMapping,
              toneMappingExposure: 0.92,
            }}
            className="!absolute inset-0"
            onCreated={({ scene }) => { scene.background = new THREE.Color("#0c0b09"); }}
          >
            <Suspense fallback={null}>
              <ShowcaseScene hovered={hovered} />
            </Suspense>
          </Canvas>

          {/* Tap-to-preview hint overlay */}
          <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-around px-4">
            {CARDS.map((c, i) => (
              <div
                key={i}
                className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${
                  hovered === i
                    ? "scale-105 bg-brand-green text-white"
                    : "bg-white/8 text-white/35"
                }`}
              >
                {c.tag}
              </div>
            ))}
          </div>
        </div>

        {/* Description cards — click to open preview */}
        <div className="container-x mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CARDS.map((c, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className={`group cursor-pointer rounded-2xl border p-6 text-left transition-all duration-300 ${
                hovered === i
                  ? "border-brand-green/50 bg-white/6 shadow-[0_0_32px_rgba(0,129,0,0.14)]"
                  : "border-white/8 bg-white/3 hover:border-white/20 hover:bg-white/5"
              }`}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              <span className="font-display text-4xl font-extrabold text-white/10">{c.n}</span>
              <span className={`mt-1 block text-xs font-semibold uppercase tracking-widest transition-colors ${
                hovered === i ? "text-brand-green" : "text-white/30"
              }`}>
                {c.tag}
              </span>
              <h3 className="mt-3 font-display text-xl font-semibold text-white">{c.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/50">{c.body}</p>
              <span className={`mt-4 inline-flex items-center gap-1.5 text-xs font-semibold transition-colors ${
                hovered === i ? "text-brand-green" : "text-white/25 group-hover:text-white/50"
              }`}>
                Explore in 3D
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M1 6h10M6 1l5 5-5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Preview modal */}
      <AnimatePresence>
        {selected !== null && (
          <PreviewModal
            index={selected}
            onClose={() => setSelected(null)}
            onPrev={() => setSelected(s => Math.max(0, (s ?? 0) - 1))}
            onNext={() => setSelected(s => Math.min(CARDS.length - 1, (s ?? 0) + 1))}
          />
        )}
      </AnimatePresence>
    </>
  );
}

export default dynamic(() => Promise.resolve(ProductShowcase3DInner), { ssr: false });
