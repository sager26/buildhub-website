"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { createLimestone } from "./stone";

// Soft-edged box — real cast/foam-stone products have gently rounded edges,
// never razor-sharp CGI corners. radius auto-clamped to the thinnest side.
function RBox({
  args, material, position, rotation, radius = 0.04,
  castShadow = true, receiveShadow = false,
}: {
  args: [number, number, number];
  material: THREE.Material;
  position?: [number, number, number];
  rotation?: [number, number, number];
  radius?: number;
  castShadow?: boolean;
  receiveShadow?: boolean;
}) {
  const r = Math.max(0.004, Math.min(radius, Math.min(...args) * 0.42));
  return (
    <RoundedBox
      args={args} radius={r} smoothness={3} steps={1}
      position={position} rotation={rotation} material={material}
      castShadow={castShadow} receiveShadow={receiveShadow}
    />
  );
}

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
  gold:  THREE.MeshPhysicalMaterial;
  panel: THREE.MeshPhysicalMaterial;
};

export function useStoneMaterials(repeat = 1, size = 512): StoneMats {
  return useMemo(() => {
    // Smooth cast-cream finish — real EPS-coated foam stone is fine & uniform,
    // not rough sandstone. Low contrast + gentle normal = soft realistic surface.
    const maps = createLimestone({ base: "#EFE9DB", contrast: 0.08, size, repeat });
    const mk = (color: string, o?: { rough?: number; cc?: number; nrm?: number; env?: number }) =>
      new THREE.MeshPhysicalMaterial({
        map: maps.map,
        normalMap: maps.normalMap,
        roughnessMap: maps.roughnessMap,
        color: new THREE.Color(color),
        roughness: o?.rough ?? 0.8,
        metalness: 0,
        clearcoat: o?.cc ?? 0.14,           // subtle coated sheen
        clearcoatRoughness: 0.7,
        normalScale: new THREE.Vector2(o?.nrm ?? 0.22, o?.nrm ?? 0.22),
        envMapIntensity: o?.env ?? 0.7,
      });
    return {
      light: mk("#FAF5EB", { rough: 0.70, cc: 0.18, nrm: 0.16, env: 0.85 }),
      stone: mk("#EFE7D6", { rough: 0.78, cc: 0.14, nrm: 0.20, env: 0.7  }),
      mid:   mk("#DCD3C0", { rough: 0.84, cc: 0.10, nrm: 0.22, env: 0.55 }),
      dark:  mk("#B6AD98", { rough: 0.90, cc: 0.06, nrm: 0.24, env: 0.45 }),
      foam:  mk("#F4F0E6", { rough: 0.80, cc: 0.12, nrm: 0.14, env: 0.55 }),
      joint: mk("#9A9286", { rough: 0.95, cc: 0.02, nrm: 0.30, env: 0.35 }),
      reed:  mk("#F7F2E5", { rough: 0.66, cc: 0.20, nrm: 0.14, env: 0.8  }),
      gold:  new THREE.MeshPhysicalMaterial({ color: new THREE.Color("#C9A94C"), roughness: 0.40, metalness: 0.65, clearcoat: 0.5, envMapIntensity: 1.2 }),
      panel: new THREE.MeshPhysicalMaterial({ color: new THREE.Color("#171510"), roughness: 0.65, metalness: 0.1, envMapIntensity: 0.35 }),
    };
  }, [repeat, size]);
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
      <RBox args={[1.40, 0.92, 0.26]} radius={0.03} material={m.foam} />
      {stones.map((s, i) => (
        <RBox key={i} position={[s.x, s.y, 0.15]} args={[0.58, 0.25, 0.07]} radius={0.035} material={s.mat} />
      ))}
      {[0.16, -0.16].map((y, i) => (
        <mesh key={i} position={[0, y, 0.135]} material={m.joint}><boxGeometry args={[1.25, 0.022, 0.02]} /></mesh>
      ))}
      <mesh position={[0, 0, 0.135]} material={m.joint}><boxGeometry args={[0.022, 0.84, 0.02]} /></mesh>
      <RBox args={[1.40, 0.05, 0.30]} radius={0.02} position={[0, -0.48, 0.05]} material={m.mid} />
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
  const corniceGeo = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(profile(), {
      depth: 1.64, bevelEnabled: true, bevelThickness: 0.025, bevelSize: 0.022,
      bevelSegments: 3, steps: 1,
    });
    g.translate(0, 0, 0.03);
    return g;
  }, []);
  const capGeo = useMemo(() => new THREE.ShapeGeometry(profile()), []);

  return (
    <group ref={ref} position={[-0.42, -0.25, -0.85]}>
      <mesh geometry={corniceGeo} material={m.stone} castShadow />
      <mesh geometry={capGeo} material={m.mid} />
      <mesh geometry={capGeo} material={m.mid} position={[0, 0, 1.70]} />
      {Array.from({ length: 6 }, (_, i) => (
        <RBox key={i} position={[0.50, 0.42, 0.14 + i * 0.26]} args={[0.18, 0.12, 0.17]} radius={0.025} material={m.light} />
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
            <cylinderGeometry args={[REED_R * 0.85, REED_R, 0.82, 18]} />
          </mesh>
        );
      })}
      {[0.36, 0.30, 0.24].map((off, i) => (
        <mesh key={i} position={[0, off - 0.52, 0]} rotation={[Math.PI / 2, 0, 0]} material={m.mid}>
          <torusGeometry args={[0.22, 0.016, 8, 48]} />
        </mesh>
      ))}
      <mesh geometry={echinusGeo} position={[0, -0.14, 0]} material={m.stone} castShadow />
      <RBox args={[0.88, 0.12, 0.88]} radius={0.03} position={[0, 0.30, 0]} material={m.light} />
      <RBox args={[0.92, 0.030, 0.92]} radius={0.014} position={[0, 0.23, 0]} material={m.mid} />
      <mesh position={[0, -0.92, 0]} rotation={[Math.PI / 2, 0, 0]} material={m.stone}>
        <torusGeometry args={[0.30, 0.060, 16, 80]} />
      </mesh>
      <RBox args={[0.72, 0.18, 0.72]} radius={0.04} position={[0, -1.04, 0]} material={m.mid} />
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
    return new THREE.ExtrudeGeometry(s, {
      depth: D * 0.55, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.018,
      bevelSegments: 2, steps: 1,
    });
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
      <RBox args={[0.28, 0.48, D + 0.08]} radius={0.03} position={[0, Ri + 0.18, 0.02]} material={m.light} />
      <mesh geometry={archivoltGeo} material={m.mid} position={[0, 0, D * 0.08]} castShadow />
      {([-1, 1] as const).map((s, i) => (
        <group key={i}>
          <RBox args={[0.44, 0.30, D + 0.10]} radius={0.035} position={[s * (Ri + 0.26), -0.12, 0]} material={m.mid} />
          <RBox args={[0.44, 0.70, D + 0.06]} radius={0.035} position={[s * (Ri + 0.26), -0.62, 0]} material={m.stone} />
        </group>
      ))}
    </group>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// 5 · Balustrade — turned balusters between rails
// ──────────────────────────────────────────────────────────────────────────────
export function Balustrade({ m, spin = true }: { m: StoneMats; spin?: boolean }) {
  const ref = useRef<THREE.Group>(null);
  const t = useRef(0.2);
  const balusterGeo = useMemo(() => {
    const prof: [number, number][] = [
      [0.10, 0], [0.135, 0.05], [0.10, 0.12], [0.065, 0.22], [0.125, 0.33],
      [0.10, 0.44], [0.06, 0.52], [0.095, 0.60], [0.07, 0.66], [0.10, 0.70],
    ];
    return new THREE.LatheGeometry(prof.map(([r, y]) => new THREE.Vector2(r, y)), 36);
  }, []);
  useFrame((_, dt) => {
    if (!ref.current || !spin) return;
    t.current += dt * 0.3;
    ref.current.rotation.y = Math.sin(t.current * 0.5) * 0.55;
  });
  const xs = [-0.66, -0.33, 0, 0.33, 0.66];
  return (
    <group ref={ref} position={[0, -0.42, 0]}>
      <RBox args={[1.85, 0.12, 0.40]} radius={0.03} position={[0, -0.14, 0]} material={m.mid} />
      <RBox args={[1.72, 0.10, 0.32]} radius={0.025} position={[0, -0.04, 0]} material={m.stone} />
      {xs.map((x, i) => (
        <mesh key={i} geometry={balusterGeo} position={[x, 0.02, 0]} material={m.light} castShadow />
      ))}
      <RBox args={[1.72, 0.14, 0.34]} radius={0.03} position={[0, 0.80, 0]} material={m.stone} />
      <RBox args={[1.85, 0.08, 0.42]} radius={0.025} position={[0, 0.90, 0]} material={m.light} />
    </group>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// 6 · Window Surround — molded frame + sill + keystone
// ──────────────────────────────────────────────────────────────────────────────
export function WindowSurround({ m, spin = true }: { m: StoneMats; spin?: boolean }) {
  const ref = useRef<THREE.Group>(null);
  const t = useRef(-0.2);
  useFrame((_, dt) => {
    if (!ref.current || !spin) return;
    t.current += dt * 0.28;
    ref.current.rotation.y = Math.sin(t.current * 0.5) * 0.5;
  });
  const W = 1.0, H = 1.4, th = 0.18, d = 0.22;
  return (
    <group ref={ref} position={[0, 0, 0]}>
      {/* dark opening */}
      <mesh position={[0, 0, -0.06]} material={m.dark}><boxGeometry args={[W, H, 0.06]} /></mesh>
      {/* outer reveal */}
      <RBox args={[W + th * 2 + 0.06, H + th * 2 + 0.06, 0.05]} radius={0.02} position={[0, 0, -0.03]} material={m.mid} />
      {/* frame bars */}
      <RBox args={[th, H + th * 2, d]} radius={0.03} position={[-(W / 2 + th / 2), 0.04, 0]} material={m.stone} />
      <RBox args={[th, H + th * 2, d]} radius={0.03} position={[ (W / 2 + th / 2), 0.04, 0]} material={m.stone} />
      <RBox args={[W + th * 2, th, d]} radius={0.03} position={[0, (H / 2 + th / 2), 0]} material={m.stone} />
      {/* sill */}
      <RBox args={[W + th * 2 + 0.18, th + 0.06, d + 0.12]} radius={0.03} position={[0, -(H / 2 + th / 2), 0.03]} material={m.mid} />
      {/* keystone */}
      <RBox args={[0.24, 0.32, d + 0.06]} radius={0.03} position={[0, (H / 2 + th), 0.05]} material={m.light} />
    </group>
  );
}

// ── Dispatcher ────────────────────────────────────────────────────────────────
export function ProductModel({ index, m, spin = true }: { index: number; m: StoneMats; spin?: boolean }) {
  if (index === 0) return <FoamStonePanel  m={m} spin={spin} />;
  if (index === 1) return <CorniceModel    m={m} spin={spin} />;
  if (index === 2) return <ColumnCapital   m={m} spin={spin} />;
  if (index === 3) return <ArchSection     m={m} spin={spin} />;
  if (index === 4) return <Balustrade      m={m} spin={spin} />;
  if (index === 5) return <WindowSurround  m={m} spin={spin} />;
  return null;
}

export const PRODUCT_META = [
  { n: "01", name: "Foam Stone",           tag: "Wall Cladding",    detail: "EPS core + cement-polymer stone coat. 80% lighter than natural stone — no extra structural load, fast to install." },
  { n: "02", name: "Decorative Moldings",  tag: "Cornices & Trim",  detail: "Cornices, window surrounds, sills and string-courses cut to exact dimensions. Pre-finished, ready to fix." },
  { n: "03", name: "Columns & Capitals",   tag: "Structural Decor", detail: "Full column kits — reeded shaft, Doric to Corinthian capital, base & plinth. Stacks and bonds on site." },
  { n: "04", name: "Architectural Arches", tag: "Entry Systems",    detail: "Semicircular & segmental arch kits with precision-cut voussoirs, keystone, impost blocks & archivolt." },
  { n: "05", name: "Balustrades",          tag: "Railings",         detail: "Turned baluster railings for balconies, terraces and staircases. Posts, rails and balusters supplied as a kit." },
  { n: "06", name: "Window Surrounds",     tag: "Facade Trim",      detail: "Molded window & door surrounds with sill, jambs and keystone. Frames any opening with classical detail." },
];
