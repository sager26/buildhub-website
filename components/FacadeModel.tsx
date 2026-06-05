"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { createLimestone } from "./three/stone";

// ─── Material palette — photoreal limestone (shared texture, tinted per tone) ───
function plainMat(color: string, rough = 0.84, cc = 0.08) {
  return new THREE.MeshPhysicalMaterial({
    color, roughness: rough, metalness: 0,
    clearcoat: cc, clearcoatRoughness: 0.88,
  });
}
function useMats() {
  return useMemo(() => {
    const maps = createLimestone({ base: "#F1EBDD", contrast: 0.17, size: 512, repeat: 1 });
    const tex = (color: string, o?: { rough?: number; cc?: number; nrm?: number; env?: number }) =>
      new THREE.MeshPhysicalMaterial({
        map: maps.map, normalMap: maps.normalMap, roughnessMap: maps.roughnessMap,
        color: new THREE.Color(color),
        roughness: o?.rough ?? 0.90, metalness: 0,
        clearcoat: o?.cc ?? 0.06, clearcoatRoughness: 0.85,
        normalScale: new THREE.Vector2(o?.nrm ?? 0.5, o?.nrm ?? 0.5),
        envMapIntensity: o?.env ?? 0.55,
      });
    return {
      stone:  tex("#ECE4D2", { rough: 0.90, cc: 0.08, env: 0.6 }),  // main limestone face
      light:  tex("#FBF6EC", { rough: 0.82, cc: 0.12, env: 0.8 }),  // sun-catch surface
      mid:    tex("#D6CDB8", { rough: 0.94, cc: 0.04, env: 0.5 }),  // side / shadow face
      dark:   tex("#AFA690", { rough: 0.97, cc: 0.02, env: 0.4 }),  // deep recesses
      shadow: plainMat("#8A8480", 1.00, 0.00),                       // mortar joints
      back:   plainMat("#161410", 1.00, 0.00),                       // dark void
      frame:  plainMat("#1A1814", 1.00, 0.00),                       // logo backing
      gold:   plainMat("#C9A94C", 0.44, 0.40),                       // frame moulding
      reed:   tex("#F7F1E2", { rough: 0.80, cc: 0.14, env: 0.75 }),  // reed highlight
    };
  }, []);
}
type M = ReturnType<typeof useMats>;

// ──────────────────────────────────────────────────────────────────────────────
// COLUMN — classical Ionic-proportioned column with 20 true reeds
// ──────────────────────────────────────────────────────────────────────────────
const COL_H = 5.6;
const COL_R = 0.27;   // outer radius at base (tip of reeds)

// Core shaft: slightly under-radius so the reeds project from it
function buildCoreProfile() {
  const R_CORE = 0.212;
  const pts: THREE.Vector2[] = [];
  for (let i = 0; i <= 40; i++) {
    const t = i / 40;
    const ent = Math.sin(t * Math.PI) * 0.014;  // subtle entasis
    const tap = t * 0.036;                        // top taper
    pts.push(new THREE.Vector2(R_CORE + ent - tap, -COL_H / 2 + t * COL_H));
  }
  return pts;
}

// Echinus profile — proper classical ogee/ovolo curve
function buildEchinusProfile() {
  const pts: THREE.Vector2[] = [];
  // From neck to widest point of the bell (quadrant of an ellipse, roughly)
  const steps = 20;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    // Cubic easing: slow at bottom, fast in middle
    const ease = t * t * (3 - 2 * t);
    const r = 0.22 + ease * 0.16;    // 0.22 → 0.38
    const y = -0.14 + t * 0.30;      // -0.14 → +0.16
    pts.push(new THREE.Vector2(r, y));
  }
  return pts;
}

function Column({ m }: { m: M }) {
  // 20 reeds — classical number, gives the characteristic fluted look
  const N_REED = 20;
  // Reed dimensions proportional to column radius
  // For touching reeds: r = R_col × sin(π/N) / (1 + sin(π/N))
  const sinPN = Math.sin(Math.PI / N_REED);           // sin(9°) = 0.1564
  const REED_R_BASE = COL_R * sinPN / (1 + sinPN);    // ≈ 0.0364
  const REED_R_TOP  = REED_R_BASE * (0.210 / COL_R);  // tapers with shaft
  const REED_D      = COL_R / (1 + sinPN);             // center distance from axis ≈ 0.2336

  const coreGeo    = useMemo(() => new THREE.LatheGeometry(buildCoreProfile(), 80), []);
  const echinusGeo = useMemo(() => new THREE.LatheGeometry(buildEchinusProfile(), 40), []);

  const reedAngles = useMemo(
    () => Array.from({ length: N_REED }, (_, i) => (i / N_REED) * Math.PI * 2),
    [],
  );

  const REED_H = COL_H - 0.82; // clear of base and capital mouldings

  return (
    <group>
      {/* ── Base — Attic-style ── */}
      {/* Plinth */}
      <mesh position={[0, -COL_H / 2 - 0.25, 0]} castShadow material={m.mid}>
        <boxGeometry args={[0.76, 0.20, 0.76]} />
      </mesh>
      {/* Lower torus (large) */}
      <mesh position={[0, -COL_H / 2 + 0.03, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow material={m.stone}>
        <torusGeometry args={[0.33, 0.082, 14, 80]} />
      </mesh>
      {/* Scotia / hollow */}
      <mesh position={[0, -COL_H / 2 + 0.14, 0]} rotation={[Math.PI / 2, 0, 0]} material={m.dark}>
        <torusGeometry args={[0.275, 0.030, 10, 80]} />
      </mesh>
      {/* Upper torus (smaller) */}
      <mesh position={[0, -COL_H / 2 + 0.22, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow material={m.light}>
        <torusGeometry args={[0.265, 0.052, 12, 80]} />
      </mesh>

      {/* ── Shaft — core + 20 reeds ── */}
      <mesh geometry={coreGeo} material={m.stone} castShadow receiveShadow />
      {reedAngles.map((a, i) => (
        <mesh
          key={i}
          position={[Math.cos(a) * REED_D, 0, Math.sin(a) * REED_D]}
          castShadow
          material={m.reed}
        >
          {/* 14 segments so each reed is visibly smooth/round */}
          <cylinderGeometry args={[REED_R_TOP, REED_R_BASE, REED_H, 14, 1]} />
        </mesh>
      ))}

      {/* ── Capital — Ionic-Doric hybrid ── */}
      {/* Annulet rings (3 thin bands below the echinus) */}
      {[0.074, 0.044, 0.014].map((offset, i) => (
        <mesh key={i} position={[0, COL_H / 2 - 0.38 + offset, 0]} rotation={[Math.PI / 2, 0, 0]} material={m.mid}>
          <torusGeometry args={[0.222, 0.018, 8, 64]} />
        </mesh>
      ))}
      {/* Echinus bell */}
      <mesh
        geometry={echinusGeo}
        material={m.stone}
        position={[0, COL_H / 2 - 0.14, 0]}
        castShadow
      />
      {/* Abacus — slightly chamfered */}
      <mesh position={[0, COL_H / 2 + 0.13, 0]} castShadow material={m.light}>
        <boxGeometry args={[0.92, 0.13, 0.92]} />
      </mesh>
      {/* Abacus bottom chamfer line */}
      <mesh position={[0, COL_H / 2 + 0.065, 0]} castShadow material={m.mid}>
        <boxGeometry args={[0.96, 0.03, 0.96]} />
      </mesh>
    </group>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// VOUSSOIR — single arch stone wedge
// step * 0.490 leaves a small joint gap (= visible mortar line)
// ──────────────────────────────────────────────────────────────────────────────
function wedge(angle: number, step: number, Ri: number, Ro: number, d: number, zOff = 0) {
  const h = step * 0.490;
  const a0 = angle - h, a1 = angle + h;
  const front = d / 2 + zOff;
  const back  = -d / 2 + zOff;
  const v = new Float32Array([
    Math.cos(a0)*Ri, Math.sin(a0)*Ri,  front,
    Math.cos(a1)*Ri, Math.sin(a1)*Ri,  front,
    Math.cos(a1)*Ro, Math.sin(a1)*Ro,  front,
    Math.cos(a0)*Ro, Math.sin(a0)*Ro,  front,
    Math.cos(a0)*Ri, Math.sin(a0)*Ri,  back,
    Math.cos(a1)*Ri, Math.sin(a1)*Ri,  back,
    Math.cos(a1)*Ro, Math.sin(a1)*Ro,  back,
    Math.cos(a0)*Ro, Math.sin(a0)*Ro,  back,
  ]);
  const idx = [0,1,2,0,2,3, 4,6,5,4,7,6, 0,4,5,0,5,1, 3,2,6,3,6,7, 0,3,7,0,7,4, 1,5,6,1,6,2];
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(v, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

// ──────────────────────────────────────────────────────────────────────────────
// ARCH — full triumphal portal with rusticated voussoirs + piers to floor
// ──────────────────────────────────────────────────────────────────────────────
function Arch({ m }: { m: M }) {
  const Ro = 1.90, Ri = 1.18, D = 0.66, N = 25;
  const step = Math.PI / (N - 1);

  // Pier dimensions
  const LEG_W  = 0.64;
  const LEG_D  = D + 0.14;
  const LEG_H  = 4.94;
  const LEG_CY = -0.38 - LEG_H / 2;
  const LEG_X  = Ri + 0.34;

  // Voussoir stones — alternate slight z-offset for rusticated look
  const stones = useMemo(
    () =>
      Array.from({ length: N }, (_, i) => ({
        geo: wedge(
          Math.PI * (1 - i / (N - 1)),
          step,
          Ri, Ro, D,
          i % 2 === 0 ? 0.012 : -0.006,   // rustication depth
        ),
        // Slight tone variation: keystone lighter, alternating stone/light
        tone: i === Math.floor(N / 2) ? "key" : i % 2 === 0 ? "light" : "stone",
      })),
    [],
  );

  // Combined dark backing — tympanum + door opening
  const backGeo = useMemo(() => {
    const s = new THREE.Shape();
    const innerX = LEG_X - LEG_W / 2;
    const botY   = LEG_CY - LEG_H / 2;
    s.moveTo(-innerX, botY);
    s.lineTo( innerX, botY);
    s.lineTo( innerX, 0);
    for (let i = 0; i <= 64; i++) {
      const a = (i / 64) * Math.PI;
      s.lineTo(Math.cos(a) * (Ro + 0.06), Math.sin(a) * (Ro + 0.06));
    }
    s.lineTo(-innerX, 0);
    s.lineTo(-innerX, botY);
    s.closePath();
    return new THREE.ExtrudeGeometry(s, { depth: D * 0.72, bevelEnabled: false });
  }, []);

  // Outer archivolt moulding (two bands)
  const archivoltGeo = useMemo(() => {
    const outer = new THREE.Shape();
    for (let i = 0; i <= 80; i++) {
      const a = (i / 80) * Math.PI;
      const fn = i === 0 ? "moveTo" : "lineTo";
      (outer as any)[fn](Math.cos(a) * (Ro + 0.16), Math.sin(a) * (Ro + 0.16));
    }
    outer.lineTo(Ro + 0.03, 0);
    for (let i = 80; i >= 0; i--) {
      const a = (i / 80) * Math.PI;
      outer.lineTo(Math.cos(a) * (Ro + 0.03), Math.sin(a) * (Ro + 0.03));
    }
    outer.closePath();
    return new THREE.ExtrudeGeometry(outer, { depth: D * 0.55, bevelEnabled: false });
  }, []);

  // Inner face ring (the soffit frame inside the arch ring)
  const soffitGeo = useMemo(() => {
    const s = new THREE.Shape();
    for (let i = 0; i <= 80; i++) {
      const a = (i / 80) * Math.PI;
      const fn = i === 0 ? "moveTo" : "lineTo";
      (s as any)[fn](Math.cos(a) * (Ri - 0.06), Math.sin(a) * (Ri - 0.06));
    }
    s.lineTo(0, 0); s.closePath();
    const hole = new THREE.Path();
    for (let i = 0; i <= 80; i++) {
      const a = (i / 80) * Math.PI;
      const fn = i === 0 ? "moveTo" : "lineTo";
      (hole as any)[fn](Math.cos(a) * (Ri - 0.16), Math.sin(a) * (Ri - 0.16));
    }
    hole.lineTo(0, 0);
    s.holes = [hole];
    return new THREE.ExtrudeGeometry(s, { depth: D * 0.12, bevelEnabled: false });
  }, []);

  const matFor = (tone: string) => {
    if (tone === "key") return m.light;
    if (tone === "light") return m.light;
    return m.stone;
  };

  return (
    <group>
      {/* Dark backing */}
      <mesh geometry={backGeo} material={m.back} position={[0, 0, -D * 0.72 - 0.01]} />

      {/* Piers — stone legs to floor */}
      {([-1, 1] as const).map((s, i) => (
        <mesh key={`pier${i}`} position={[s * LEG_X, LEG_CY, 0]} castShadow material={m.mid}>
          <boxGeometry args={[LEG_W, LEG_H, LEG_D]} />
        </mesh>
      ))}
      {/* Pier vertical detail — a shallow central panel recessed into each pier */}
      {([-1, 1] as const).map((s, i) => (
        <mesh key={`panel${i}`} position={[s * LEG_X, LEG_CY + 0.4, D * 0.08]} material={m.dark}>
          <boxGeometry args={[LEG_W - 0.20, LEG_H - 1.2, 0.04]} />
        </mesh>
      ))}
      {/* Impost blocks — proud of piers, acts as spring cap */}
      {([-1, 1] as const).map((s, i) => (
        <mesh key={`imp${i}`} position={[s * LEG_X, -0.14, 0]} castShadow material={m.stone}>
          <boxGeometry args={[LEG_W + 0.14, 0.44, LEG_D + 0.10]} />
        </mesh>
      ))}
      {/* Impost shadow line (overhang bottom) */}
      {([-1, 1] as const).map((s, i) => (
        <mesh key={`impsh${i}`} position={[s * LEG_X, -0.38, 0]} material={m.dark}>
          <boxGeometry args={[LEG_W + 0.16, 0.04, LEG_D + 0.12]} />
        </mesh>
      ))}

      {/* Voussoir ring — rusticated individual stones */}
      {stones.map(({ geo, tone }, i) => (
        <mesh key={i} geometry={geo} material={matFor(tone)} castShadow receiveShadow />
      ))}
      {/* Keystone drop (proud of ring, catches the spotlight) */}
      <mesh position={[0, Ri + 0.28, D * 0.06]} castShadow material={m.light}>
        <boxGeometry args={[0.38, 0.72, D + 0.14]} />
      </mesh>
      {/* Keystone face line */}
      <mesh position={[0, Ri + 0.28, D / 2 + 0.12]} material={m.mid}>
        <boxGeometry args={[0.40, 0.76, 0.04]} />
      </mesh>

      {/* Outer archivolt moulding band */}
      <mesh geometry={archivoltGeo} material={m.mid} position={[0, 0, D * 0.08]} castShadow />
      {/* Inner soffit frame */}
      <mesh geometry={soffitGeo} material={m.dark} position={[0, 0, D / 2 + 0.02]} />
    </group>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// LOGO FRAME — centred in arch opening, warm-lit
// ──────────────────────────────────────────────────────────────────────────────
function LogoFrame({ m }: { m: M }) {
  const fw = 1.86, fh = 1.06, border = 0.10;

  return (
    <group position={[0, 0.12, 0.44]}>
      {/* Outer gold moulding */}
      <mesh castShadow material={m.gold}>
        <boxGeometry args={[fw + border * 2 + 0.08, fh + border * 2 + 0.08, 0.06]} />
      </mesh>
      {/* Inner reveal shadow */}
      <mesh position={[0, 0, 0.03]} material={m.dark}>
        <boxGeometry args={[fw + border * 2 - 0.02, fh + border * 2 - 0.02, 0.05]} />
      </mesh>
      {/* Black panel */}
      <mesh position={[0, 0, 0.05]} material={m.frame}>
        <boxGeometry args={[fw, fh, 0.04]} />
      </mesh>
      {/* Logo HTML */}
      <Html
        center
        position={[0, 0, 0.09]}
        style={{ pointerEvents: "none", userSelect: "none" }}
        zIndexRange={[0, 0]}
      >
        <div style={{ width: "200px", display: "flex", alignItems: "center", justifyContent: "center", padding: "4px 10px" }}>
          <img
            src="/logo-transparent.png"
            alt="BuildHub"
            style={{
              width: "100%", height: "auto",
              filter: "invert(1) hue-rotate(180deg) brightness(1.1)",
              display: "block",
            }}
          />
        </div>
      </Html>
    </group>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// ENTABLATURE — layered architrave / frieze / cornice
// ──────────────────────────────────────────────────────────────────────────────
function Entablature({ m, w = 6.4 }: { m: M; w?: number }) {
  const nDentils = Math.round(w / 0.30);

  return (
    <group>
      {/* Architrave — 3 stepped fascias */}
      <mesh position={[0, 0.00, 0]} material={m.stone} castShadow>
        <boxGeometry args={[w, 0.14, 0.52]} />
      </mesh>
      <mesh position={[0, 0.17, 0.03]} material={m.stone} castShadow>
        <boxGeometry args={[w, 0.14, 0.55]} />
      </mesh>
      <mesh position={[0, 0.34, 0.06]} material={m.light} castShadow>
        <boxGeometry args={[w, 0.07, 0.58]} />
      </mesh>

      {/* Frieze band */}
      <mesh position={[0, 0.52, 0.00]} material={m.mid} castShadow>
        <boxGeometry args={[w, 0.38, 0.44]} />
      </mesh>

      {/* Triglyphs evenly spaced */}
      {[-2.4, -1.2, 0, 1.2, 2.4].map((x, i) => (
        <group key={i} position={[x, 0.52, 0.14]}>
          {/* Main triglyph body */}
          <mesh material={m.dark} castShadow>
            <boxGeometry args={[0.22, 0.40, 0.06]} />
          </mesh>
          {/* Two central glyphs */}
          {[-0.06, 0.06].map((dx, j) => (
            <mesh key={j} position={[dx, 0, 0.06]} material={m.dark}>
              <boxGeometry args={[0.042, 0.40, 0.05]} />
            </mesh>
          ))}
          {/* Caps (taenia) */}
          <mesh position={[0, 0.22, 0.02]} material={m.shadow}>
            <boxGeometry args={[0.24, 0.04, 0.08]} />
          </mesh>
        </group>
      ))}

      {/* Dentil row */}
      {Array.from({ length: nDentils }, (_, i) => (
        <mesh key={i}
          position={[-w / 2 + 0.18 + i * 0.30, 0.80, 0.24]}
          material={m.mid}
        >
          <boxGeometry args={[0.18, 0.16, 0.18]} />
        </mesh>
      ))}

      {/* Cornice — three projecting layers */}
      <mesh position={[0, 0.92, 0.08]} material={m.stone} castShadow>
        <boxGeometry args={[w + 0.18, 0.10, 0.64]} />
      </mesh>
      <mesh position={[0, 1.05, 0.20]} material={m.light} castShadow>
        <boxGeometry args={[w + 0.28, 0.18, 0.80]} />
      </mesh>
      {/* Corona (flat top slab) */}
      <mesh position={[0, 1.18, 0.30]} material={m.light} castShadow>
        <boxGeometry args={[w + 0.36, 0.10, 0.96]} />
      </mesh>
      {/* Cymatium (top cap, slightly recessed) */}
      <mesh position={[0, 1.27, 0.20]} material={m.mid} castShadow>
        <boxGeometry args={[w + 0.38, 0.08, 0.88]} />
      </mesh>
      {/* Drip / shadow line under corona */}
      <mesh position={[0, 0.97, 0.56]} material={m.dark}>
        <boxGeometry args={[w + 0.28, 0.04, 0.04]} />
      </mesh>
    </group>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// BACK SCENE — architectural back wall with engaged pilasters + cornice band
// ──────────────────────────────────────────────────────────────────────────────
function BackScene({ m }: { m: M }) {
  // Pilasters — flat engaged half-columns on back wall, between real columns and arch
  const pilasterPositions = [-3.4, 3.4];

  return (
    <group position={[0, 0.6, -0.94]}>
      {/* Main back wall */}
      <mesh material={m.back} receiveShadow>
        <boxGeometry args={[8.2, 13, 0.22]} />
      </mesh>

      {/* Engaged pilasters — slightly proud of back wall */}
      {pilasterPositions.map((x, i) => (
        <group key={i} position={[x, 0, 0.14]}>
          {/* Pilaster shaft */}
          <mesh material={m.mid} castShadow>
            <boxGeometry args={[0.42, 9.2, 0.24]} />
          </mesh>
          {/* Pilaster base */}
          <mesh position={[0, -4.8, 0.02]} material={m.stone}>
            <boxGeometry args={[0.52, 0.28, 0.28]} />
          </mesh>
          {/* Pilaster capital */}
          <mesh position={[0, 4.6, 0.02]} material={m.stone}>
            <boxGeometry args={[0.56, 0.22, 0.28]} />
          </mesh>
          {/* Subtle panel recess on pilaster */}
          <mesh position={[0, 0.4, 0.12]} material={m.dark}>
            <boxGeometry args={[0.24, 7.0, 0.04]} />
          </mesh>
        </group>
      ))}

      {/* String course bands at key heights */}
      {[0.6, -2.6].map((y, i) => (
        <mesh key={i} position={[0, y, 0.13]} material={m.mid}>
          <boxGeometry args={[8.2, 0.10, 0.16]} />
        </mesh>
      ))}

      {/* Top cornice band */}
      <mesh position={[0, 5.0, 0.18]} material={m.stone} castShadow>
        <boxGeometry args={[8.2, 0.30, 0.36]} />
      </mesh>

      {/* Side walls — close the edges */}
      {([-4.3, 4.3] as const).map((x, i) => (
        <mesh key={i} position={[x, 0, 0.72]} material={m.back} receiveShadow>
          <boxGeometry args={[0.60, 13, 2.0]} />
        </mesh>
      ))}
      {/* Ceiling */}
      <mesh position={[0, 6.5, 0.72]} rotation={[Math.PI / 2, 0, 0]} material={m.back}>
        <planeGeometry args={[8.2, 2.4]} />
      </mesh>
    </group>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// STEPS — 4 dressed stone steps
// ──────────────────────────────────────────────────────────────────────────────
function Steps({ m }: { m: M }) {
  const steps = [
    { y: -3.00, z:  0.36, w: 7.2, d: 1.80, mat: m.light },
    { y: -3.18, z:  0.18, w: 7.6, d: 1.60, mat: m.stone },
    { y: -3.36, z:  0.00, w: 8.0, d: 1.40, mat: m.mid   },
    { y: -3.54, z: -0.18, w: 8.4, d: 1.20, mat: m.dark   },
  ];
  return (
    <group>
      {steps.map((s, i) => (
        <mesh key={i} position={[0, s.y, s.z]} castShadow receiveShadow material={s.mat}>
          <boxGeometry args={[s.w, 0.18, s.d]} />
        </mesh>
      ))}
    </group>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// ROOT
// ──────────────────────────────────────────────────────────────────────────────
export default function FacadeModel({
  scrollRef,
  pointerRef,
  quality = "high",
}: {
  scrollRef:  React.MutableRefObject<number>;
  pointerRef: React.MutableRefObject<{ x: number; y: number }>;
  quality?:   "high" | "low";
}) {
  const group  = useRef<THREE.Group>(null);
  const reveal = useRef(0);
  const m      = useMats();

  useFrame((state, delta) => {
    reveal.current = Math.min(1, reveal.current + delta * 0.5);
    if (!group.current) return;
    const sc = scrollRef.current;
    const p  = pointerRef.current;
    // Gentle sway + pointer parallax
    const targetY = Math.sin(state.clock.elapsedTime * 0.08) * 0.04 + p.x * 0.18 + sc * 0.8;
    const targetX = -p.y * 0.08 + sc * 0.10;
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, targetY, 0.042);
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, targetX, 0.042);
    group.current.position.y = THREE.MathUtils.lerp(group.current.position.y, -sc * 0.5, 0.05);
    // Scale-in reveal
    const s = 0.84 + THREE.MathUtils.smoothstep(reveal.current, 0, 1) * 0.16;
    group.current.scale.setScalar(s);
  });

  // Column x positions — slightly further apart for Ionic proportions
  const COL_X = 2.18;

  return (
    <group ref={group}>
      <BackScene m={m} />

      {/* Left column */}
      <group position={[-COL_X, -0.08, 0]}><Column m={m} /></group>
      {/* Right column */}
      <group position={[ COL_X, -0.08, 0]}><Column m={m} /></group>

      {/* Arch portal */}
      <group position={[0, 1.78, 0.12]}>
        <Arch m={m} />
      </group>

      {/* Logo frame — centred in arch opening */}
      <group position={[0, 1.78, 0.12]}>
        <LogoFrame m={m} />
      </group>

      {/* Entablature */}
      <group position={[0, 4.48, 0.08]}>
        <Entablature m={m} w={6.4} />
      </group>

      <Steps m={m} />
    </group>
  );
}
