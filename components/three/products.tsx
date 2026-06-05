"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { createLimestone } from "./stone";

// ──────────────────────────────────────────────────────────────────────────────
// Shared, photoreal-textured stone materials. One limestone texture set is
// generated and tinted per-tone (cheap), so every product + the showroom share
// a consistent surface. CLIENT ONLY.
// ──────────────────────────────────────────────────────────────────────────────
export type StoneMats = {
  stone: THREE.MeshPhysicalMaterial;
  light: THREE.MeshPhysicalMaterial;
  mid:   THREE.MeshPhysicalMaterial;
  dark:  THREE.MeshPhysicalMaterial;
  foam:  THREE.MeshPhysicalMaterial;
  joint: THREE.MeshPhysicalMaterial;
  reed:  THREE.MeshPhysicalMaterial;
};

export function useStoneMaterials(repeat = 1): StoneMats {
  return useMemo(() => {
    const maps = createLimestone({ base: "#F1EBDD", contrast: 0.17, size: 512, repeat });
    const mk = (color: string, o?: { rough?: number; cc?: number; nrm?: number; env?: number }) =>
      new THREE.MeshPhysicalMaterial({
        map: maps.map,
        normalMap: maps.normalMap,
        roughnessMap: maps.roughnessMap,
        color: new THREE.Color(color),
        roughness: o?.rough ?? 0.92,
        metalness: 0,
        clearcoat: o?.cc ?? 0.05,
        clearcoatRoughness: 0.85,
        normalScale: new THREE.Vector2(o?.nrm ?? 0.55, o?.nrm ?? 0.55),
        envMapIntensity: o?.env ?? 0.6,
      });
    return {
      light: mk("#FBF6EC", { rough: 0.84, cc: 0.10, env: 0.8 }),
      stone: mk("#ECE4D2", { rough: 0.90, cc: 0.07, env: 0.65 }),
      mid:   mk("#D6CDB8", { rough: 0.94, cc: 0.04, env: 0.5 }),
      dark:  mk("#AFA690", { rough: 0.97, cc: 0.02, env: 0.4 }),
      foam:  mk("#F2EEE4", { rough: 0.96, cc: 0.03, nrm: 0.35, env: 0.45 }),
      joint: mk("#8C8478", { rough: 1.0,  cc: 0.0,  nrm: 0.4,  env: 0.3 }),
      reed:  mk("#F7F1E2", { rough: 0.82, cc: 0.12, env: 0.75 }),
    };
  }, [repeat]);
}

// ──────────────────────────────────────────────────────────────────────────────
// 1 · Foam Stone Panel
// ──────────────────────────────────────────────────────────────────────────────
export function FoamStonePanel({ m, spin = true }: { m: StoneMats; spin?: boolean }) {
  const ref = useRef<THREE.Group>(null);
  const t = useRef(0);
  useFrame((_, dt) => {
    if (!ref.current || !spin) return;
    t.current += dt * 0.3;
    ref.current.rotation.y = Math.sin(t.current * 0.5) * 0.6;
    ref.current.rotation.x = Math.sin(t.current * 0.3) * 0.07;
  });

  const stones = useMemo(() => {
    const list: { x: number; y: number; mat: THREE.Material }[] = [];
    const cols = 2, rows = 3, sw = 0.58, sh = 0.25, gap = 0.055;
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++)
        list.push({
          x: -sw / 2 - gap / 2 + c * (sw + gap),
          y: (-rows * sh - (rows - 1) * gap) / 2 + gap / 2 + r * (sh + gap) + sh / 2,
          mat: (r + c) % 2 === 0 ? m.light : m.stone,
        });
    return list;
  }, [m]);

  return (
    <group ref={ref} rotation={[0.12, 0.3, 0]}>
      <mesh material={m.foam} castShadow><boxGeometry args={[1.40, 0.92, 0.26]} /></mesh>
      {stones.map((s, i) => (
        <mesh key={i} position={[s.x, s.y, 0.15]} material={s.mat} castShadow>
          <boxGeometry args={[0.58, 0.25, 0.06]} />
        </mesh>
      ))}
      {[0.16, -0.16].map((y, i) => (
        <mesh key={i} position={[0, y, 0.14]} material={m.joint}><boxGeometry args={[1.25, 0.022, 0.02]} /></mesh>
      ))}
      <mesh position={[0, 0, 0.14]} material={m.joint}><boxGeometry args={[0.022, 0.84, 0.02]} /></mesh>
      <mesh position={[0, -0.48, 0.05]} material={m.mid}><boxGeometry args={[1.40, 0.04, 0.30]} /></mesh>
    </group>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// 2 · Cornice Molding
// ──────────────────────────────────────────────────────────────────────────────
export function CorniceModel({ m, spin = true }: { m: StoneMats; spin?: boolean }) {
  const ref = useRef<THREE.Group>(null);
  const t = useRef(0.4);
  useFrame((_, dt) => {
    if (!ref.current || !spin) return;
    t.current += dt * 0.26;
    ref.current.rotation.y = Math.sin(t.current * 0.5) * 0.65 + 0.3;
  });

  const profile = () => {
    const s = new THREE.Shape();
    s.moveTo(0, 0); s.lineTo(0.62, 0); s.lineTo(0.62, 0.08); s.lineTo(0.22, 0.08);
    s.lineTo(0.22, 0.22); s.lineTo(0.40, 0.22); s.lineTo(0.40, 0.34); s.lineTo(0.58, 0.34);
    s.lineTo(0.58, 0.48); s.lineTo(0.72, 0.48); s.lineTo(0.72, 0.60); s.lineTo(0.62, 0.60);
    s.lineTo(0.62, 0.70); s.lineTo(0.00, 0.70); s.closePath();
    return s;
  };
  const corniceGeo = useMemo(() => new THREE.ExtrudeGeometry(profile(), { depth: 1.70, bevelEnabled: false }), []);
  const capGeo = useMemo(() => new THREE.ShapeGeometry(profile()), []);

  return (
    <group ref={ref} position={[-0.42, -0.25, -0.85]}>
      <mesh geometry={corniceGeo} material={m.stone} castShadow />
      <mesh geometry={capGeo} material={m.mid} />
      <mesh geometry={capGeo} material={m.mid} position={[0, 0, 1.70]} />
      {Array.from({ length: 6 }, (_, i) => (
        <mesh key={i} position={[0.50, 0.42, 0.14 + i * 0.26]} material={m.light}>
          <boxGeometry args={[0.18, 0.12, 0.17]} />
        </mesh>
      ))}
    </group>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// 3 · Column Capital
// ──────────────────────────────────────────────────────────────────────────────
export function ColumnCapital({ m, spin = true }: { m: StoneMats; spin?: boolean }) {
  const ref = useRef<THREE.Group>(null);
  const t = useRef(-0.3);

  const echinusGeo = useMemo(() => {
    const pts: THREE.Vector2[] = [];
    for (let i = 0; i <= 20; i++) {
      const u = i / 20, e = u * u * (3 - 2 * u);
      pts.push(new THREE.Vector2(0.21 + e * 0.16, -0.14 + u * 0.30));
    }
    return new THREE.LatheGeometry(pts, 48);
  }, []);
  const shaftGeo = useMemo(() => {
    const pts: THREE.Vector2[] = [];
    for (let i = 0; i <= 16; i++) {
      const u = i / 16;
      pts.push(new THREE.Vector2(0.27 + Math.sin(u * Math.PI) * 0.012 - u * 0.022, -0.90 + u * 0.90));
    }
    return new THREE.LatheGeometry(pts, 64);
  }, []);

  const N = 16;
  const sinPN = Math.sin(Math.PI / N);
  const REED_R = (0.27 * sinPN) / (1 + sinPN);
  const REED_D = 0.27 / (1 + sinPN);

  useFrame((_, dt) => {
    if (!ref.current || !spin) return;
    t.current += dt * 0.32;
    ref.current.rotation.y = t.current * 0.5;
  });

  return (
    <group ref={ref} position={[0, 0.10, 0]}>
      <mesh geometry={shaftGeo} material={m.stone} castShadow />
      {Array.from({ length: N }, (_, i) => {
        const a = (i / N) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * REED_D, -0.45, Math.sin(a) * REED_D]} material={m.reed} castShadow>
            <cylinderGeometry args={[REED_R * 0.85, REED_R, 0.82, 12]} />
          </mesh>
        );
      })}
      {[0.36, 0.30, 0.24].map((off, i) => (
        <mesh key={i} position={[0, off - 0.52, 0]} rotation={[Math.PI / 2, 0, 0]} material={m.mid}>
          <torusGeometry args={[0.22, 0.016, 8, 48]} />
        </mesh>
      ))}
      <mesh geometry={echinusGeo} position={[0, -0.14, 0]} material={m.stone} castShadow />
      <mesh position={[0, 0.30, 0]} material={m.light} castShadow><boxGeometry args={[0.88, 0.12, 0.88]} /></mesh>
      <mesh position={[0, 0.23, 0]} material={m.mid}><boxGeometry args={[0.92, 0.030, 0.92]} /></mesh>
      <mesh position={[0, -0.92, 0]} rotation={[Math.PI / 2, 0, 0]} material={m.stone}>
        <torusGeometry args={[0.30, 0.060, 10, 64]} />
      </mesh>
      <mesh position={[0, -1.04, 0]} material={m.mid}><boxGeometry args={[0.72, 0.18, 0.72]} /></mesh>
    </group>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// 4 · Arch Section
// ──────────────────────────────────────────────────────────────────────────────
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

export function ArchSection({ m, spin = true }: { m: StoneMats; spin?: boolean }) {
  const ref = useRef<THREE.Group>(null);
  const t = useRef(0.6);
  const Ri = 0.55, Ro = 0.90, D = 0.40, N = 7;
  const step = Math.PI / (N - 1);
  const stones = useMemo(
    () => Array.from({ length: N }, (_, i) => ({
      geo: archStone(Math.PI * (1 - i / (N - 1)), step, Ri, Ro, D, i % 2 === 0 ? 0.010 : -0.006),
      mat: i === Math.floor(N / 2) ? m.light : i % 2 === 0 ? m.light : m.stone,
    })),
    [m],
  );
  const archivoltGeo = useMemo(() => {
    const s = new THREE.Shape();
    for (let i = 0; i <= 60; i++) {
      const a = (i / 60) * Math.PI;
      (s as any)[i === 0 ? "moveTo" : "lineTo"](Math.cos(a) * (Ro + 0.10), Math.sin(a) * (Ro + 0.10));
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
    if (!ref.current || !spin) return;
    t.current += dt * 0.24;
    ref.current.rotation.y = Math.sin(t.current * 0.4) * 0.55;
    ref.current.rotation.x = Math.sin(t.current * 0.25) * 0.06;
  });

  return (
    <group ref={ref} position={[0, -0.05, 0]}>
      {stones.map(({ geo, mat }, i) => <mesh key={i} geometry={geo} material={mat} castShadow />)}
      <mesh position={[0, Ri + 0.18, 0.02]} material={m.light} castShadow><boxGeometry args={[0.28, 0.48, D + 0.08]} /></mesh>
      <mesh geometry={archivoltGeo} material={m.mid} position={[0, 0, D * 0.08]} castShadow />
      {([-1, 1] as const).map((s, i) => (
        <group key={i}>
          <mesh position={[s * (Ri + 0.26), -0.12, 0]} material={m.mid} castShadow><boxGeometry args={[0.44, 0.30, D + 0.10]} /></mesh>
          <mesh position={[s * (Ri + 0.26), -0.62, 0]} material={m.stone} castShadow><boxGeometry args={[0.44, 0.70, D + 0.06]} /></mesh>
        </group>
      ))}
    </group>
  );
}

// ── Dispatcher ────────────────────────────────────────────────────────────────
export function ProductModel({ index, m, spin = true }: { index: number; m: StoneMats; spin?: boolean }) {
  if (index === 0) return <FoamStonePanel m={m} spin={spin} />;
  if (index === 1) return <CorniceModel   m={m} spin={spin} />;
  if (index === 2) return <ColumnCapital  m={m} spin={spin} />;
  if (index === 3) return <ArchSection    m={m} spin={spin} />;
  return null;
}

export const PRODUCT_META = [
  { n: "01", name: "Foam Stone",            tag: "Wall Cladding",   detail: "EPS core + cement-polymer stone coat. 80% lighter than natural stone — no extra structural load, fast to install." },
  { n: "02", name: "Decorative Moldings",   tag: "Cornices & Trim", detail: "Cornices, window surrounds, sills and string-courses cut to exact dimensions. Pre-finished, ready to fix." },
  { n: "03", name: "Columns & Capitals",    tag: "Structural Decor",detail: "Full column kits — reeded shaft, Doric to Corinthian capital, base & plinth. Stacks and bonds on site." },
  { n: "04", name: "Architectural Arches",  tag: "Entry Systems",   detail: "Semicircular & segmental arch kits with precision-cut voussoirs, keystone, impost blocks & archivolt." },
];
