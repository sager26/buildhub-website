"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, useMemo, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, OrbitControls, Sparkles, ContactShadows, useTexture, Html } from "@react-three/drei";
import { AnimatePresence, motion } from "framer-motion";
import * as THREE from "three";
import {
  useStoneMaterials,
  ProductModel,
  PRODUCT_META,
  type StoneMats,
} from "./three/products";
import { createLimestone } from "./three/stone";
import MagneticButton from "./ui/MagneticButton";
import { HERO, WHATSAPP_QUOTE } from "@/lib/constants";
import { EASE } from "@/lib/motion";

// ── Layout ──────────────────────────────────────────────────────────────────────
const PEDESTALS = [
  { x: -2.3, z: -5,  scale: 1.5  },
  { x:  2.3, z: -9,  scale: 1.35 },
  { x: -2.3, z: -13, scale: 1.35 },
  { x:  2.3, z: -17, scale: 1.35 },
  { x: -2.3, z: -21, scale: 1.4  },
  { x:  2.3, z: -25, scale: 1.35 },
];
const CAM_START = 8;
const CAM_END = -27.5;
const HALL_ENTER_Z = -3; // camZ below this → inside the hall (show product captions)

type Quality = "high" | "low";

// ── Entrance portal with the BuildHub logo plaque ─────────────────────────────────
function LogoPlaque({ m }: { m: StoneMats }) {
  const tex = useTexture("/logo-transparent.png");
  // logo PNG is 724×128 → aspect 5.656:1 (wide banner). Match it exactly.
  const LOGO_ASPECT = 724 / 128;
  const LOGO_W = 3.05;
  const LOGO_H = LOGO_W / LOGO_ASPECT;
  return (
    <group position={[0, 3.1, 0.32]}>
      {/* gold frame */}
      <mesh material={m.gold} castShadow><boxGeometry args={[3.62, 1.06, 0.12]} /></mesh>
      {/* self-illuminated cream plaque — reads as a lit sign even in the dark hall */}
      <mesh position={[0, 0, 0.07]}>
        <boxGeometry args={[3.38, 0.82, 0.07]} />
        <meshStandardMaterial color="#FAF4E6" emissive="#F0E7D2" emissiveIntensity={0.55} roughness={0.55} metalness={0} />
      </mesh>
      {/* logo — unlit (always full brightness), correct aspect */}
      <mesh position={[0, 0, 0.115]}>
        <planeGeometry args={[LOGO_W, LOGO_H]} />
        <meshBasicMaterial map={tex} transparent toneMapped={false} />
      </mesh>
    </group>
  );
}

function EntrancePortal({ m }: { m: StoneMats }) {
  const Col = ({ x }: { x: number }) => (
    <group position={[x, 0, 0]}>
      <mesh position={[0, -1.32, 0]} material={m.mid} castShadow receiveShadow><boxGeometry args={[0.95, 0.34, 0.95]} /></mesh>
      <mesh position={[0, -1.1, 0]} rotation={[Math.PI / 2, 0, 0]} material={m.stone}><torusGeometry args={[0.34, 0.07, 10, 40]} /></mesh>
      <mesh position={[0, 0.45, 0]} material={m.stone} castShadow><cylinderGeometry args={[0.30, 0.36, 3.1, 40]} /></mesh>
      <mesh position={[0, 2.06, 0]} material={m.stone} castShadow><cylinderGeometry args={[0.46, 0.32, 0.30, 40]} /></mesh>
      <mesh position={[0, 2.28, 0]} material={m.light} castShadow><boxGeometry args={[0.98, 0.16, 0.98]} /></mesh>
    </group>
  );

  return (
    <group position={[0, 0, 0.5]}>
      <Col x={-2.7} />
      <Col x={2.7} />

      {/* Arch spanning the opening (half torus) */}
      <mesh position={[0, 0.55, 0]} material={m.stone} castShadow>
        <torusGeometry args={[2.25, 0.26, 16, 44, Math.PI]} />
      </mesh>
      {/* arch springer corbels */}
      {([-1, 1] as const).map((s, i) => (
        <mesh key={i} position={[s * 2.25, 0.5, 0]} material={m.mid} castShadow><boxGeometry args={[0.5, 0.4, 0.6]} /></mesh>
      ))}
      {/* keystone */}
      <mesh position={[0, 2.78, 0]} material={m.light} castShadow><boxGeometry args={[0.34, 0.5, 0.6]} /></mesh>

      {/* Entablature beam */}
      <mesh position={[0, 3.05, 0]} material={m.stone} castShadow><boxGeometry args={[6.4, 0.42, 0.7]} /></mesh>
      <mesh position={[0, 3.30, 0.05]} material={m.light} castShadow><boxGeometry args={[6.8, 0.20, 0.85]} /></mesh>

      <Suspense fallback={null}>
        <LogoPlaque m={m} />
      </Suspense>
    </group>
  );
}

// ── Hall ──────────────────────────────────────────────────────────────────────────
function Hall({ texSize }: { texSize: number }) {
  const floorMaps = useMemo(() => createLimestone({ base: "#E2DBC8", contrast: 0.12, size: texSize, repeat: 12 }), [texSize]);
  const wallMaps  = useMemo(() => createLimestone({ base: "#16140F", contrast: 0.25, size: texSize, repeat: 7  }), [texSize]);
  const floorMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    map: floorMaps.map, normalMap: floorMaps.normalMap, roughnessMap: floorMaps.roughnessMap,
    roughness: 0.5, metalness: 0, clearcoat: 0.3, clearcoatRoughness: 0.5,
    normalScale: new THREE.Vector2(0.4, 0.4), envMapIntensity: 0.7,
  }), [floorMaps]);
  const wallMat = useMemo(() => new THREE.MeshStandardMaterial({
    map: wallMaps.map, normalMap: wallMaps.normalMap, roughnessMap: wallMaps.roughnessMap,
    roughness: 0.95, metalness: 0, color: new THREE.Color("#15130E"),
    normalScale: new THREE.Vector2(0.3, 0.3),
  }), [wallMaps]);

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, -10]} receiveShadow material={floorMat}>
        <planeGeometry args={[16, 48]} />
      </mesh>
      <mesh rotation={[0, Math.PI / 2, 0]} position={[-6, 2.5, -10]} material={wallMat}><planeGeometry args={[48, 10]} /></mesh>
      <mesh rotation={[0, -Math.PI / 2, 0]} position={[6, 2.5, -10]} material={wallMat}><planeGeometry args={[48, 10]} /></mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 6, -10]} material={wallMat}><planeGeometry args={[16, 48]} /></mesh>
      <mesh position={[0, 2.5, -28]} material={wallMat}><planeGeometry args={[16, 10]} /></mesh>
    </group>
  );
}

// ── Pedestal + product + spotlight ────────────────────────────────────────────────
function PedestalDisplay({
  index, m, active, spin, onSelect,
}: {
  index: number; m: StoneMats; active: boolean; spin: boolean; onSelect: (i: number) => void;
}) {
  const p = PEDESTALS[index];
  const spotRef = useRef<THREE.SpotLight>(null);
  const target = useMemo(() => new THREE.Object3D(), []);
  const [hover, setHover] = useState(false);

  useFrame(() => {
    if (spotRef.current) {
      const want = active ? 95 : 30;
      spotRef.current.intensity = THREE.MathUtils.lerp(spotRef.current.intensity, want, 0.08);
    }
  });

  return (
    <group position={[p.x, 0, p.z]}>
      <primitive object={target} position={[0, 0, 0]} />
      <spotLight
        ref={spotRef}
        position={[0, 5.5, 0.6]}
        target={target}
        angle={0.5}
        penumbra={0.7}
        intensity={30}
        distance={12}
        color="#fff3da"
        castShadow={false}
      />
      <group
        onPointerOver={(e) => { e.stopPropagation(); setHover(true); document.body.style.cursor = "pointer"; }}
        onPointerOut={() => { setHover(false); document.body.style.cursor = "auto"; }}
        onClick={(e) => { e.stopPropagation(); onSelect(index); }}
      >
        <mesh position={[0, -1.18, 0]} material={m.mid} castShadow receiveShadow><boxGeometry args={[1.5, 0.20, 1.5]} /></mesh>
        <mesh position={[0, -0.62, 0]} material={m.stone} castShadow><boxGeometry args={[1.15, 1.0, 1.15]} /></mesh>
        <mesh position={[0, -0.07, 0]} material={m.light} castShadow><boxGeometry args={[1.4, 0.14, 1.4]} /></mesh>
        <group position={[0, 0.95, 0]} scale={[p.scale, p.scale, p.scale]}>
          <ProductModel index={index} m={m} spin={spin} />
        </group>
        {hover && (
          <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.95, 1.05, 48]} />
            <meshBasicMaterial color="#00b400" transparent opacity={0.5} />
          </mesh>
        )}
      </group>
      {/* baked once (frames=1) → soft grounding blob at near-zero per-frame cost */}
      <ContactShadows position={[0, 0.04, 0]} opacity={0.4} scale={3} blur={2.4} far={2} resolution={128} frames={1} color="#000000" />
    </group>
  );
}

// ── Camera rig ────────────────────────────────────────────────────────────────────
function CameraRig({
  progressRef, onActive,
}: {
  progressRef: React.MutableRefObject<number>;
  onActive: (i: number) => void;
}) {
  const { camera } = useThree();
  const lookTarget = useRef(new THREE.Vector3(0, 1.4, -6));
  const lastActive = useRef(-2);
  const smoothP = useRef(0);

  useFrame((state, dt) => {
    // Cinematic damping: ease the camera toward the scroll target so the glide
    // feels premium and any scroll micro-jitter is absorbed.
    const k = 1 - Math.pow(0.0015, dt); // frame-rate-independent smoothing
    smoothP.current = THREE.MathUtils.lerp(smoothP.current, progressRef.current, k);
    const p = smoothP.current;
    const camZ = THREE.MathUtils.lerp(CAM_START, CAM_END, p);
    const bob = Math.sin(state.clock.elapsedTime * 0.6) * 0.04;
    camera.position.set(0, 1.15 + bob, camZ);

    let activeIdx = -1;
    let lookX = 0, lookY = 1.4;
    if (camZ <= HALL_ENTER_Z) {
      // inside hall — pick nearest pedestal
      let nearest = 0, best = Infinity;
      PEDESTALS.forEach((ped, i) => {
        const d = Math.abs(ped.z - (camZ - 4));
        if (d < best) { best = d; nearest = i; }
      });
      activeIdx = nearest;
      lookX = PEDESTALS[nearest].x * 0.42;
      lookY = 0.85;
    } else {
      // approaching the portal — look right at the sign so it's centred & clear
      lookY = 2.55;
    }

    if (activeIdx !== lastActive.current) {
      lastActive.current = activeIdx;
      onActive(activeIdx);
    }

    const tz = camZ - 6;
    lookTarget.current.lerp(new THREE.Vector3(lookX, lookY, tz), 0.06);
    camera.lookAt(lookTarget.current);
  });
  return null;
}

// ── Scene ────────────────────────────────────────────────────────────────────────
function ShowroomScene({
  progressRef, activeIndex, setActive, onSelect, quality,
}: {
  progressRef: React.MutableRefObject<number>;
  activeIndex: number;
  setActive: (i: number) => void;
  onSelect: (i: number) => void;
  quality: Quality;
}) {
  const high = quality === "high";
  const m = useStoneMaterials(1, high ? 448 : 256);

  return (
    <>
      <CameraRig progressRef={progressRef} onActive={setActive} />
      <Environment preset="apartment" environmentIntensity={0.35} />
      <ambientLight intensity={0.26} color="#f5ecda" />
      <directionalLight position={[3, 6, 8]} intensity={0.9} color="#fff0d8" />
      {/* bright wash on the logo sign so it reads as a lit storefront sign */}
      <spotLight position={[0, 4.4, 5.5]} target-position={[0, 3.1, 0.8]} angle={0.45} penumbra={0.75} intensity={high ? 130 : 90} color="#fff4dc" distance={16} />
      <pointLight position={[0, 3.1, 2.4]} intensity={high ? 14 : 9} color="#fff2d6" distance={5} decay={2} />

      <Hall texSize={high ? 448 : 256} />
      <EntrancePortal m={m} />

      {PEDESTALS.map((_, i) => (
        <PedestalDisplay
          key={i}
          index={i}
          m={m}
          active={i === activeIndex}
          spin={high || i === activeIndex}
          onSelect={onSelect}
        />
      ))}

      {high && (
        <Sparkles count={70} scale={[12, 5, 46]} position={[0, 2, -10]} size={1.5} speed={0.22} opacity={0.32} color="#fff0d0" />
      )}
    </>
  );
}

// ── Inspect modal ──────────────────────────────────────────────────────────────────
function InspectScene({ index, m }: { index: number; m: StoneMats }) {
  return (
    <>
      <Environment preset="studio" environmentIntensity={0.4} />
      <ambientLight intensity={0.35} color="#f8f0e0" />
      <spotLight position={[3, 5, 4]} angle={0.5} penumbra={0.7} intensity={120} color="#fff4e0" distance={14} />
      <pointLight position={[-3, 1, 2]} intensity={16} color="#cfe0ff" distance={9} />
      <group scale={[1.7, 1.7, 1.7]} position={[0, -0.2, 0]}>
        <ProductModel index={index} m={m} spin={false} />
      </group>
      <OrbitControls autoRotate autoRotateSpeed={1.6} enableZoom={false} enablePan={false}
        minPolarAngle={Math.PI / 4} maxPolarAngle={Math.PI * 0.72} />
    </>
  );
}

function InspectModal({ index, onClose, onPrev, onNext }: {
  index: number; onClose: () => void; onPrev: () => void; onNext: () => void;
}) {
  const m = useStoneMaterials(1, 512);
  const meta = PRODUCT_META[index];
  return (
    <motion.div className="fixed inset-0 z-[400] flex flex-col bg-[#0c0b09]"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
      <div className="relative z-10 flex shrink-0 items-center justify-between border-b border-white/10 px-5 py-3">
        <div className="flex items-center gap-3">
          <button onClick={onPrev} className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/8 text-white/70 transition hover:bg-white/15 hover:text-white" aria-label="Previous">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <span className="text-xs font-semibold tabular-nums text-white/40">{index + 1} / {PRODUCT_META.length}</span>
          <button onClick={onNext} className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/8 text-white/70 transition hover:bg-white/15 hover:text-white" aria-label="Next">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <span className="ml-2 font-display text-sm font-semibold text-white/60">{meta.name}</span>
        </div>
        <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/8 text-white/70 transition hover:bg-white/15 hover:text-white" aria-label="Close">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 2L12 12M12 2L2 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
        </button>
      </div>
      <div className="flex flex-1 flex-col overflow-hidden md:flex-row">
        <div className="relative min-h-0 flex-1">
          <Canvas key={index} dpr={[1, 1.8]} camera={{ position: [0, 0.3, 4], fov: 48 }}
            gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 0.95 }}
            onCreated={({ scene }) => { scene.background = new THREE.Color("#0c0b09"); }} className="!absolute inset-0">
            <Suspense fallback={null}><InspectScene index={index} m={m} /></Suspense>
          </Canvas>
          <p className="pointer-events-none absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full border border-white/12 bg-white/5 px-4 py-1.5 text-xs font-medium text-white/35 backdrop-blur-sm">Drag to rotate</p>
        </div>
        <motion.div key={`info-${index}`} className="flex flex-col justify-center border-t border-white/10 px-8 py-8 md:w-[340px] md:border-l md:border-t-0 md:px-10 md:py-12"
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.08 }}>
          <span className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-green">{meta.tag}</span>
          <h2 className="mt-3 font-display text-2xl font-bold text-white md:text-3xl">{meta.name}</h2>
          <p className="mt-4 text-sm leading-relaxed text-white/55">{meta.detail}</p>
          <div className="mt-7 flex gap-2">
            {PRODUCT_META.map((_, i) => (
              <button key={i} onClick={() => { if (i < index) onPrev(); else if (i > index) onNext(); }}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === index ? "w-6 bg-brand-green" : "w-1.5 bg-white/20 hover:bg-white/40"}`} />
            ))}
          </div>
          <a href={WHATSAPP_QUOTE} target="_blank" rel="noopener noreferrer"
            className="mt-7 inline-flex items-center justify-center gap-2 rounded-full bg-brand-green px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#00b400]">
            Get a Quote
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 7h12M7 1l6 6-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </a>
        </motion.div>
      </div>
    </motion.div>
  );
}

// ── Section wrapper ────────────────────────────────────────────────────────────────
const heroWords = HERO.title.split(" ");

function Showroom3DInner() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const [active, setActive] = useState(-1);
  const [selected, setSelected] = useState<number | null>(null);
  const [quality, setQuality] = useState<Quality>("high");

  useEffect(() => {
    const small = window.matchMedia("(max-width: 768px)");
    const setQ = () => setQuality(small.matches ? "low" : "high");
    setQ();
    small.addEventListener("change", setQ);
    const onScroll = () => {
      const el = sectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      progressRef.current = Math.min(1, Math.max(0, -rect.top / (total || 1)));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      small.removeEventListener("change", setQ);
    };
  }, []);

  const atEntrance = active === -1;
  const meta = active >= 0 ? PRODUCT_META[active] : null;

  return (
    <>
      <section id="top" ref={sectionRef} className="relative bg-[#0c0b09]" style={{ height: "420vh" }}>
        <div className="sticky top-0 h-screen w-full overflow-hidden">
          <Canvas
            shadows={false}
            dpr={quality === "high" ? [1, 1.5] : [1, 1.1]}
            camera={{ position: [0, 1.15, CAM_START], fov: 60 }}
            gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 0.92, powerPreference: "high-performance" }}
            onCreated={({ scene }) => {
              scene.background = new THREE.Color("#0c0b09");
              scene.fog = new THREE.FogExp2("#0c0b09", 0.026);
            }}
            className="!absolute inset-0"
          >
            <Suspense fallback={null}>
              <ShowroomScene
                progressRef={progressRef}
                activeIndex={active}
                setActive={setActive}
                onSelect={setSelected}
                quality={quality}
              />
            </Suspense>
          </Canvas>

          {/* top vignette for nav legibility — kept short so it never covers the sign */}
          <div className="pointer-events-none absolute inset-x-0 top-0 z-[5] h-20 bg-gradient-to-b from-black/55 to-transparent" />
          {/* bottom fade into white page */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] h-40 bg-gradient-to-t from-[#fafaf9] to-transparent" />

          {/* ── Entrance hero overlay ── */}
          <AnimatePresence>
            {atEntrance && (
              <motion.div
                className="absolute inset-x-0 bottom-0 z-10 flex flex-col justify-end px-6 pb-24 md:px-12 md:pb-16"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <div className="mx-auto w-full max-w-7xl">
                  <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/25 px-3.5 py-1.5 backdrop-blur-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-green" />
                    <span className="text-[10px] font-semibold uppercase tracking-[0.26em] text-white/70 sm:text-[11px]">{HERO.eyebrow}</span>
                  </div>
                  <h1 className="max-w-2xl font-display text-[2.4rem] font-extrabold leading-[0.95] tracking-tight text-white drop-shadow-lg sm:text-5xl lg:text-6xl">
                    {heroWords.map((w, i) => (
                      <span key={i} className="mr-[0.18em] inline-block overflow-hidden pb-1">
                        <motion.span className="inline-block" initial={{ y: "110%" }} animate={{ y: 0 }}
                          transition={{ delay: 0.3 + i * 0.12, duration: 0.9, ease: EASE }}>
                          {i === heroWords.length - 1 ? <span className="text-brand-green">{w}</span> : w}
                        </motion.span>
                      </span>
                    ))}
                  </h1>
                  <motion.p className="mt-4 hidden max-w-md text-sm leading-relaxed text-white/65 drop-shadow sm:block md:text-base"
                    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 0.7 }}>
                    {HERO.body}
                  </motion.p>
                  <motion.div className="mt-6 flex flex-wrap items-center gap-3 sm:gap-4"
                    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.0, duration: 0.7 }}>
                    <MagneticButton href={WHATSAPP_QUOTE} external cursorLabel="Chat">
                      Get a Quote
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </MagneticButton>
                    <MagneticButton href="#products" variant="ghost" cursorLabel="View">Explore Products</MagneticButton>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Product caption (in the hall) ── */}
          <AnimatePresence>
            {!atEntrance && meta && (
              <motion.div
                className="absolute inset-x-0 bottom-0 z-10 px-6 pb-12 pt-20 md:px-12"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
              >
                <div className="mx-auto w-full max-w-7xl">
                  <AnimatePresence mode="wait">
                    <motion.div key={active} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.4 }} className="max-w-md">
                      <span className="font-display text-5xl font-extrabold text-white/12">{meta.n}</span>
                      <span className="ml-1 text-xs font-semibold uppercase tracking-[0.28em] text-brand-green">{meta.tag}</span>
                      <h3 className="mt-1 font-display text-2xl font-bold text-white md:text-3xl">{meta.name}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-white/60">{meta.detail}</p>
                      <button onClick={() => setSelected(active)} className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/25 px-5 py-2 text-xs font-semibold text-white/80 transition hover:border-brand-green hover:text-brand-green">
                        Inspect in 3D
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M1 6h10M6 1l5 5-5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </button>
                    </motion.div>
                  </AnimatePresence>
                  <div className="mt-6 flex gap-2">
                    {PRODUCT_META.map((_, i) => (
                      <span key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === active ? "w-7 bg-brand-green" : "w-1.5 bg-white/25"}`} />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      <AnimatePresence>
        {selected !== null && (
          <InspectModal
            index={selected}
            onClose={() => setSelected(null)}
            onPrev={() => setSelected((s) => Math.max(0, (s ?? 0) - 1))}
            onNext={() => setSelected((s) => Math.min(PRODUCT_META.length - 1, (s ?? 0) + 1))}
          />
        )}
      </AnimatePresence>
    </>
  );
}

export default dynamic(() => Promise.resolve(Showroom3DInner), { ssr: false });
