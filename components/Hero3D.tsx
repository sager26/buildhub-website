"use client";

import { Component, ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { ContactShadows, PerspectiveCamera, Environment } from "@react-three/drei";
import * as THREE from "three";
import FacadeModel from "./FacadeModel";

class GLBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function Fallback() {
  return (
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_60%,rgba(0,129,0,0.18),transparent_65%)]" />
  );
}

/** Stone floor plane that receives shadows */
function Floor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3.28, 0]} receiveShadow>
      <planeGeometry args={[40, 40]} />
      <meshPhysicalMaterial
        color="#928B7F"
        roughness={0.88}
        metalness={0.04}
        clearcoat={0.08}
        clearcoatRoughness={0.9}
      />
    </mesh>
  );
}

/** Back wall / sky plane fills the void behind the facade */
function BackWall() {
  return (
    <mesh position={[0, 2, -5.5]} receiveShadow>
      <planeGeometry args={[24, 18]} />
      <meshPhysicalMaterial color="#1a1914" roughness={1} metalness={0} />
    </mesh>
  );
}

export default function Hero3D() {
  const scrollRef  = useRef(0);
  const pointerRef = useRef({ x: 0, y: 0 });
  const [quality, setQuality] = useState<"high" | "low">("high");
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mqReduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mqSmall  = window.matchMedia("(max-width: 768px)");
    const apply = () => {
      setReduced(mqReduce.matches);
      setQuality(mqSmall.matches ? "low" : "high");
    };
    apply();
    mqReduce.addEventListener("change", apply);
    mqSmall.addEventListener("change", apply);

    const onScroll = () => {
      scrollRef.current = Math.min(1, Math.max(0, window.scrollY / (window.innerHeight * 1.6)));
    };
    const onPointer = (e: MouseEvent) => {
      if (reduced) return;
      pointerRef.current.x = (e.clientX / window.innerWidth  - 0.5);
      pointerRef.current.y = (e.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener("scroll",    onScroll,  { passive: true });
    window.addEventListener("mousemove", onPointer);
    onScroll();
    return () => {
      mqReduce.removeEventListener("change", apply);
      mqSmall .removeEventListener("change", apply);
      window.removeEventListener("scroll",    onScroll);
      window.removeEventListener("mousemove", onPointer);
    };
  }, [reduced]);

  const shadows = quality === "high";
  const dpr = useMemo<[number, number]>(
    () => (quality === "high" ? [1, 1.8] : [1, 1.2]), [quality]
  );

  return (
    <GLBoundary fallback={<Fallback />}>
      <Canvas
        shadows={shadows}
        dpr={dpr}
        frameloop={reduced ? "demand" : "always"}
        gl={{
          antialias: true,
          alpha: false,                                   // ← solid background
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 0.82,
        }}
        className="!absolute inset-0"
        onCreated={({ scene }) => {
          scene.background = new THREE.Color("#0e0d0b");  // dark warm black
          scene.fog = new THREE.FogExp2("#0e0d0b", 0.045); // atmospheric depth
        }}
      >
        {/* Camera — slight low angle, framing the full facade */}
        <PerspectiveCamera makeDefault position={[0, -0.6, 10.5]} fov={44} />

        {/* ── Lighting ── */}
        {/* Soft warm ambient */}
        <ambientLight intensity={0.22} color="#f5ece0" />

        {/* Main sun — upper right, warm */}
        <directionalLight
          position={[5, 9, 6]}
          intensity={3.2}
          color="#fff4e0"
          castShadow={shadows}
          shadow-mapSize={[2048, 2048]}
          shadow-bias={-0.0003}
          shadow-camera-near={0.5}
          shadow-camera-far={30}
          shadow-camera-left={-8}
          shadow-camera-right={8}
          shadow-camera-top={10}
          shadow-camera-bottom={-5}
        />
        {/* Cool sky fill — left */}
        <directionalLight position={[-6, 4, 3]} intensity={0.55} color="#c8daf0" />

        {/* Green architectural uplights — from ground level */}
        <pointLight position={[-2.4, -2.6, 1.8]} intensity={110} color="#00cc44" distance={14} decay={2} />
        <pointLight position={[ 2.4, -2.6, 1.8]} intensity={110} color="#00cc44" distance={14} decay={2} />
        {/* Centre uplight on arch */}
        <pointLight position={[0, -1.5, 2.0]} intensity={55} color="#00dd55" distance={10} decay={2} />

        {/* Subtle rim from back-top for silhouette */}
        <pointLight position={[0, 8, -4]} intensity={18} color="#ffe8c0" distance={20} decay={2} />

        {/* ── Scene objects ── */}
        <Environment preset="night" background={false} />
        <BackWall />
        <Floor />

        <FacadeModel
          scrollRef={scrollRef}
          pointerRef={pointerRef}
          quality={quality}
        />

        {shadows && (
          <ContactShadows
            position={[0, -3.26, 0]}
            opacity={0.7}
            scale={16}
            blur={2.2}
            far={4}
            resolution={512}
            color="#000000"
          />
        )}
      </Canvas>
    </GLBoundary>
  );
}
