"use client";

import {
  Component,
  ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Canvas } from "@react-three/fiber";
import { ContactShadows, PerspectiveCamera } from "@react-three/drei";
import FacadeModel from "./FacadeModel";

class GLBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function Fallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="h-[60%] w-[60%] rounded-[40%] bg-[radial-gradient(circle_at_50%_40%,rgba(0,129,0,0.35),transparent_70%)] blur-2xl" />
    </div>
  );
}

export default function Hero3D() {
  const scrollRef = useRef(0);
  const pointerRef = useRef({ x: 0, y: 0 });
  const [quality, setQuality] = useState<"high" | "low">("high");
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mqReduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mqSmall = window.matchMedia("(max-width: 768px)");
    const apply = () => {
      setReduced(mqReduce.matches);
      setQuality(mqSmall.matches ? "low" : "high");
    };
    apply();
    mqReduce.addEventListener("change", apply);
    mqSmall.addEventListener("change", apply);

    const onScroll = () => {
      scrollRef.current = Math.min(
        1,
        Math.max(0, window.scrollY / (window.innerHeight * 1.6))
      );
    };
    const onPointer = (e: MouseEvent) => {
      if (reduced) return;
      pointerRef.current.x = (e.clientX / window.innerWidth - 0.5) * 1;
      pointerRef.current.y = (e.clientY / window.innerHeight - 0.5) * 1;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("mousemove", onPointer);
    onScroll();
    return () => {
      mqReduce.removeEventListener("change", apply);
      mqSmall.removeEventListener("change", apply);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("mousemove", onPointer);
    };
  }, [reduced]);

  const shadows = quality === "high";
  const dpr = useMemo<[number, number]>(
    () => (quality === "high" ? [1, 1.8] : [1, 1.4]),
    [quality]
  );

  return (
    <GLBoundary fallback={<Fallback />}>
      <Canvas
        shadows={shadows}
        dpr={dpr}
        frameloop={reduced ? "demand" : "always"}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        className="!absolute inset-0"
      >
        <PerspectiveCamera makeDefault position={[0, 1.2, 9.8]} fov={40} />

        {/* Warm midday sun from upper-right */}
        <ambientLight intensity={0.38} color="#f8f0e0" />
        <hemisphereLight color="#fffbe8" groundColor="#1c1a16" intensity={0.55} />
        <directionalLight
          position={[6, 10, 7]}
          intensity={2.6}
          color="#fff8ee"
          castShadow={shadows}
          shadow-mapSize={[1024, 1024]}
          shadow-bias={-0.0003}
        />
        {/* Cool fill from left */}
        <directionalLight position={[-5, 3, 4]} intensity={0.7} color="#d8e8ff" />
        {/* Brand-green subtle rim from below-back */}
        <pointLight position={[-3, -1, -4]} intensity={shadows ? 45 : 22} color="#00b400" distance={18} />
        {/* Soft front fill */}
        <pointLight position={[0, 2, 8]} intensity={0.8} color="#ffffff" distance={20} />

        <FacadeModel
          scrollRef={scrollRef}
          pointerRef={pointerRef}
          quality={quality}
        />

        {shadows && (
          <ContactShadows
            position={[0, -2.65, 0]}
            opacity={0.55}
            scale={14}
            blur={2.6}
            far={5}
            resolution={512}
            color="#000000"
          />
        )}
      </Canvas>
    </GLBoundary>
  );
}
