"use client";

import { Component, ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { ContactShadows, PerspectiveCamera, SpotLight } from "@react-three/drei";
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
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_60%,rgba(0,129,0,0.15),transparent_65%)]" />
  );
}

function Floor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3.28, 0]} receiveShadow>
      <planeGeometry args={[40, 40]} />
      <meshPhysicalMaterial color="#C8C0B0" roughness={0.90} metalness={0.02}
        clearcoat={0.06} clearcoatRoughness={0.9} />
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
          alpha: false,
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 0.88,
        }}
        className="!absolute inset-0"
        onCreated={({ scene }) => {
          scene.background = new THREE.Color("#0f0e0c");
          scene.fog = new THREE.FogExp2("#0f0e0c", 0.038);
        }}
      >
        {/* Camera — low angle, looking up slightly */}
        <PerspectiveCamera makeDefault position={[0, 0.85, 9.7]} fov={47} />

        {/* ── Lighting ── */}
        {/* Warm ambient — cream stone base light */}
        <ambientLight intensity={0.55} color="#f8f0e0" />

        {/* Main sun — upper right, warm daylight */}
        <directionalLight
          position={[5, 10, 6]}
          intensity={2.8}
          color="#fff6e8"
          castShadow={shadows}
          shadow-mapSize={[2048, 2048]}
          shadow-bias={-0.0003}
          shadow-camera-near={0.5}
          shadow-camera-far={30}
          shadow-camera-left={-8}
          shadow-camera-right={8}
          shadow-camera-top={12}
          shadow-camera-bottom={-5}
        />
        {/* Cool sky fill from left */}
        <directionalLight position={[-5, 4, 3]} intensity={0.5} color="#d0e4ff" />

        {/* ── Logo spotlight — warm focused beam on the centre frame ── */}
        <SpotLight
          position={[0, 5.5, 4.5]}
          intensity={shadows ? 280 : 180}
          angle={0.22}
          penumbra={0.55}
          color="#fff0cc"
          distance={14}
          castShadow={false}
          attenuation={5}
          anglePower={4}
        />

        {/* Warm cream fill from below — lifts the stone, no colour cast */}
        <pointLight position={[-2.2, -2.4, 2.2]} intensity={14} color="#fff2dc" distance={11} decay={2} />
        <pointLight position={[ 2.2, -2.4, 2.2]} intensity={14} color="#fff2dc" distance={11} decay={2} />

        <Floor />
        <FacadeModel scrollRef={scrollRef} pointerRef={pointerRef} quality={quality} />

        {shadows && (
          <ContactShadows
            position={[0, -3.26, 0]}
            opacity={0.6}
            scale={14}
            blur={2.0}
            far={4}
            resolution={512}
            color="#000000"
          />
        )}
      </Canvas>
    </GLBoundary>
  );
}
