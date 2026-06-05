"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, useMemo, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, OrbitControls, Sparkles, ContactShadows } from "@react-three/drei";
import { AnimatePresence, motion } from "framer-motion";
import * as THREE from "three";
import {
  useStoneMaterials,
  ProductModel,
  PRODUCT_META,
  type StoneMats,
} from "./three/products";
import { createLimestone } from "./three/stone";

// ── Pedestal layout down the hall ──────────────────────────────────────────────
const PEDESTALS = [
  { x: -2.2, z: -5,  scale: 1.5  },
  { x:  2.2, z: -10, scale: 1.35 },
  { x: -2.2, z: -15, scale: 1.35 },
  { x:  2.2, z: -20, scale: 1.35 },
];
const CAM_START = 3;
const CAM_END = -23;

// ── Hall (floor / walls / ceiling) ──────────────────────────────────────────────
function Hall() {
  const floorMaps = useMemo(
    () => createLimestone({ base: "#E2DBC8", contrast: 0.12, size: 512, repeat: 10 }),
    [],
  );
  const wallMaps = useMemo(
    () => createLimestone({ base: "#16140F", contrast: 0.25, size: 512, repeat: 6 }),
    [],
  );
  const floorMat = useMemo(
    () => new THREE.MeshPhysicalMaterial({
      map: floorMaps.map, normalMap: floorMaps.normalMap, roughnessMap: floorMaps.roughnessMap,
      roughness: 0.5, metalness: 0, clearcoat: 0.3, clearcoatRoughness: 0.5,
      normalScale: new THREE.Vector2(0.4, 0.4), envMapIntensity: 0.7,
    }),
    [floorMaps],
  );
  const wallMat = useMemo(
    () => new THREE.MeshStandardMaterial({
      map: wallMaps.map, normalMap: wallMaps.normalMap, roughnessMap: wallMaps.roughnessMap,
      roughness: 0.95, metalness: 0, color: new THREE.Color("#15130E"),
      normalScale: new THREE.Vector2(0.3, 0.3),
    }),
    [wallMaps],
  );

  return (
    <group>
      {/* Floor — polished limestone with reflection */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, -10]} receiveShadow material={floorMat}>
        <planeGeometry args={[16, 44]} />
      </mesh>
      {/* Side walls */}
      <mesh rotation={[0, Math.PI / 2, 0]} position={[-6, 2.5, -10]} material={wallMat}>
        <planeGeometry args={[44, 10]} />
      </mesh>
      <mesh rotation={[0, -Math.PI / 2, 0]} position={[6, 2.5, -10]} material={wallMat}>
        <planeGeometry args={[44, 10]} />
      </mesh>
      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 6, -10]} material={wallMat}>
        <planeGeometry args={[16, 44]} />
      </mesh>
      {/* Far back wall */}
      <mesh position={[0, 2.5, -24]} material={wallMat}>
        <planeGeometry args={[16, 10]} />
      </mesh>
    </group>
  );
}

// ── A single pedestal + its product + spotlight ──────────────────────────────────
function PedestalDisplay({
  index, m, active, onSelect,
}: {
  index: number; m: StoneMats; active: boolean; onSelect: (i: number) => void;
}) {
  const p = PEDESTALS[index];
  const spotRef = useRef<THREE.SpotLight>(null);
  const target = useMemo(() => new THREE.Object3D(), []);
  const [hover, setHover] = useState(false);

  useFrame(() => {
    if (spotRef.current) {
      const want = active ? 90 : 32;
      spotRef.current.intensity = THREE.MathUtils.lerp(spotRef.current.intensity, want, 0.08);
    }
  });

  return (
    <group position={[p.x, 0, p.z]}>
      {/* Spotlight from above */}
      <primitive object={target} position={[0, 0, 0]} />
      <spotLight
        ref={spotRef}
        position={[0, 5.5, 0.6]}
        target={target}
        angle={0.5}
        penumbra={0.7}
        intensity={32}
        distance={12}
        color="#fff3da"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      {/* Pedestal base */}
      <group
        onPointerOver={(e) => { e.stopPropagation(); setHover(true); document.body.style.cursor = "pointer"; }}
        onPointerOut={() => { setHover(false); document.body.style.cursor = "auto"; }}
        onClick={(e) => { e.stopPropagation(); onSelect(index); }}
      >
        {/* plinth */}
        <mesh position={[0, -1.18, 0]} material={m.mid} castShadow receiveShadow>
          <boxGeometry args={[1.5, 0.20, 1.5]} />
        </mesh>
        <mesh position={[0, -0.62, 0]} material={m.stone} castShadow>
          <boxGeometry args={[1.15, 1.0, 1.15]} />
        </mesh>
        <mesh position={[0, -0.07, 0]} material={m.light} castShadow>
          <boxGeometry args={[1.4, 0.14, 1.4]} />
        </mesh>
        {/* Product sits on top */}
        <group position={[0, 0.95, 0]} scale={[p.scale, p.scale, p.scale]}>
          <ProductModel index={index} m={m} spin />
        </group>
        {/* hover ring glow */}
        {hover && (
          <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.95, 1.05, 48]} />
            <meshBasicMaterial color="#00b400" transparent opacity={0.5} />
          </mesh>
        )}
      </group>
      <ContactShadows position={[0, 0.04, 0]} opacity={0.45} scale={3} blur={2.2} far={2} resolution={256} color="#000000" />
    </group>
  );
}

// ── Camera rig — travels down the hall with scroll progress ──────────────────────
function CameraRig({
  progressRef, onActive,
}: {
  progressRef: React.MutableRefObject<number>;
  onActive: (i: number) => void;
}) {
  const { camera } = useThree();
  const lookTarget = useRef(new THREE.Vector3(0, 0.4, -6));
  const lastActive = useRef(-1);

  useFrame((state) => {
    const p = progressRef.current;
    const camZ = THREE.MathUtils.lerp(CAM_START, CAM_END, p);
    // gentle bob + breathing
    const bob = Math.sin(state.clock.elapsedTime * 0.6) * 0.04;
    camera.position.set(0, 1.05 + bob, camZ);

    // which pedestal are we nearest / approaching?
    let nearest = 0, best = Infinity;
    PEDESTALS.forEach((ped, i) => {
      const d = Math.abs(ped.z - (camZ - 4));
      if (d < best) { best = d; nearest = i; }
    });
    if (nearest !== lastActive.current) {
      lastActive.current = nearest;
      onActive(nearest);
    }

    // look toward the active pedestal, ahead down the hall
    const ped = PEDESTALS[nearest];
    const tx = ped.x * 0.42;
    const ty = 0.85;
    const tz = camZ - 6;
    lookTarget.current.lerp(new THREE.Vector3(tx, ty, tz), 0.06);
    camera.lookAt(lookTarget.current);
  });

  return null;
}

// ── Scene ────────────────────────────────────────────────────────────────────────
function SceneWithActive({
  progressRef, activeIndex, setActive, onSelect, quality,
}: {
  progressRef: React.MutableRefObject<number>;
  activeIndex: number;
  setActive: (i: number) => void;
  onSelect: (i: number) => void;
  quality: "high" | "low";
}) {
  const m = useStoneMaterials(1);
  return (
    <>
      <CameraRig progressRef={progressRef} onActive={setActive} />
      <Environment preset="apartment" environmentIntensity={0.35} />
      <ambientLight intensity={0.25} color="#f5ecda" />
      <directionalLight position={[3, 6, 6]} intensity={0.8} color="#fff0d8" />
      <Hall />
      {PEDESTALS.map((_, i) => (
        <PedestalDisplay key={i} index={i} m={m} active={i === activeIndex} onSelect={onSelect} />
      ))}
      {quality === "high" && (
        <Sparkles count={60} scale={[12, 5, 40]} position={[0, 2, -10]} size={1.5} speed={0.25} opacity={0.35} color="#fff0d0" />
      )}
    </>
  );
}

// ── Inspect modal (click a pedestal) ─────────────────────────────────────────────
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
  const m = useStoneMaterials(1);
  const meta = PRODUCT_META[index];
  return (
    <motion.div
      className="fixed inset-0 z-[400] flex flex-col bg-[#0c0b09]"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}
    >
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
            onCreated={({ scene }) => { scene.background = new THREE.Color("#0c0b09"); }}
            className="!absolute inset-0">
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
          <a href="https://wa.me/962797435635" target="_blank" rel="noopener noreferrer"
            className="mt-7 inline-flex items-center justify-center gap-2 rounded-full bg-brand-green px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#00b400]">
            Get a Quote
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 7h12M7 1l6 6-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </a>
        </motion.div>
      </div>
    </motion.div>
  );
}

// ── Section wrapper ───────────────────────────────────────────────────────────────
function Showroom3DInner() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const [active, setActive] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [quality, setQuality] = useState<"high" | "low">("high");

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

  const meta = PRODUCT_META[active];

  return (
    <>
      {/* Tall section = scroll distance; canvas is sticky inside it */}
      <section ref={sectionRef} className="relative bg-[#0c0b09]" style={{ height: "360vh" }}>
        <div className="sticky top-0 h-screen w-full overflow-hidden">
          <Canvas
            shadows={quality === "high"}
            dpr={quality === "high" ? [1, 1.7] : [1, 1.2]}
            camera={{ position: [0, 1.05, CAM_START], fov: 60 }}
            gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 0.9 }}
            onCreated={({ scene }) => {
              scene.background = new THREE.Color("#0c0b09");
              scene.fog = new THREE.FogExp2("#0c0b09", 0.028);
            }}
            className="!absolute inset-0"
          >
            <Suspense fallback={null}>
              <SceneWithActive
                progressRef={progressRef}
                activeIndex={active}
                setActive={setActive}
                onSelect={setSelected}
                quality={quality}
              />
            </Suspense>
          </Canvas>

          {/* Heading overlay (top) */}
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 bg-gradient-to-b from-black/70 to-transparent px-6 pb-16 pt-10 md:px-12">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-green">The Showroom</span>
            <h2 className="mt-2 max-w-xl font-display text-3xl font-bold leading-[1.05] text-white md:text-5xl">
              Walk the collection
            </h2>
            <p className="mt-2 max-w-sm text-sm text-white/50">Scroll to move through the hall · click any piece to inspect it in 3D</p>
          </div>

          {/* Active product caption (bottom-left) */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/80 to-transparent px-6 pb-10 pt-20 md:px-12">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.4 }}
                className="max-w-md"
              >
                <span className="font-display text-5xl font-extrabold text-white/12">{meta.n}</span>
                <span className="ml-1 text-xs font-semibold uppercase tracking-[0.28em] text-brand-green">{meta.tag}</span>
                <h3 className="mt-1 font-display text-2xl font-bold text-white md:text-3xl">{meta.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/55">{meta.detail}</p>
                <button
                  onClick={() => setSelected(active)}
                  className="pointer-events-auto mt-4 inline-flex items-center gap-2 rounded-full border border-white/25 px-5 py-2 text-xs font-semibold text-white/80 transition hover:border-brand-green hover:text-brand-green"
                >
                  Inspect in 3D
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M1 6h10M6 1l5 5-5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              </motion.div>
            </AnimatePresence>

            {/* Progress dots */}
            <div className="mt-6 flex gap-2">
              {PRODUCT_META.map((_, i) => (
                <span key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === active ? "w-7 bg-brand-green" : "w-1.5 bg-white/25"}`} />
              ))}
            </div>
          </div>

          {/* Scroll hint — only at start */}
          {active === 0 && (
            <motion.div
              className="pointer-events-none absolute bottom-6 left-1/2 z-10 -translate-x-1/2 hidden flex-col items-center gap-1 text-white/40 md:flex"
              animate={{ opacity: [0.3, 0.7, 0.3] }} transition={{ repeat: Infinity, duration: 2 }}
            >
              <span className="text-[10px] uppercase tracking-[0.3em]">Scroll to explore</span>
            </motion.div>
          )}
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
