"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";

// ─── Cream / off-white limestone palette ──────────────────────────────────
function mkMat(color: string, rough = 0.86, cc = 0.07) {
  return new THREE.MeshPhysicalMaterial({ color, roughness: rough, metalness: 0, clearcoat: cc, clearcoatRoughness: 0.9 });
}
function useMats() {
  return useMemo(() => ({
    stone:  mkMat("#E8E1D0", 0.82, 0.09),   // main face — off-white
    light:  mkMat("#F0EBE0", 0.76, 0.12),   // sun-facing
    mid:    mkMat("#D8D1C0", 0.88, 0.06),   // side / shadow face
    dark:   mkMat("#B8B1A4", 0.94, 0.02),   // deep shadow / recesses
    joint:  mkMat("#9A9490", 1.00, 0.00),   // mortar joints, flute grooves
    back:   mkMat("#181610", 1.00, 0.00),   // back wall / night sky
    frame:  mkMat("#1A1814", 1.00, 0.00),   // logo frame backing
    gold:   mkMat("#C8A84A", 0.50, 0.30),   // frame moulding
  }), []);
}
type M = ReturnType<typeof useMats>;

// ─── Column ───────────────────────────────────────────────────────────────
const COL_H = 5.4, COL_R = 0.26;

function buildShaft() {
  const pts: THREE.Vector2[] = [];
  for (let i = 0; i <= 48; i++) {
    const t   = i / 48;
    const ent = Math.sin(t * Math.PI) * 0.022;
    const tap = t * 0.050;
    pts.push(new THREE.Vector2(COL_R + ent - tap, -COL_H / 2 + t * COL_H));
  }
  return pts;
}

function Column({ m }: { m: M }) {
  const shaftGeo = useMemo(() => new THREE.LatheGeometry(buildShaft(), 96), []);
  const N = 16;
  const flutes = useMemo(() => Array.from({ length: N }, (_, i) => {
    const a = (i / N) * Math.PI * 2;
    return { x: Math.cos(a) * (COL_R + 0.006), z: Math.sin(a) * (COL_R + 0.006), a };
  }), []);

  return (
    <group>
      {/* Plinth */}
      <mesh position={[0, -COL_H/2-0.26, 0]} castShadow material={m.mid}>
        <boxGeometry args={[0.70, 0.22, 0.70]} />
      </mesh>
      {/* Lower torus */}
      <mesh position={[0, -COL_H/2+0.06, 0]} rotation={[Math.PI/2,0,0]} material={m.stone}>
        <torusGeometry args={[0.30, 0.07, 8, 48]} />
      </mesh>
      {/* Upper torus */}
      <mesh position={[0, -COL_H/2+0.18, 0]} rotation={[Math.PI/2,0,0]} material={m.stone}>
        <torusGeometry args={[0.27, 0.04, 8, 48]} />
      </mesh>
      {/* Shaft */}
      <mesh geometry={shaftGeo} material={m.stone} castShadow receiveShadow />
      {/* Flutes — smooth rounded vertical reeds, soft tone (no jagged edges) */}
      {flutes.map(({ x, z }, i) => (
        <mesh key={i} position={[x, 0, z]} material={m.mid}>
          <cylinderGeometry args={[0.022, 0.018, COL_H - 0.5, 12]} />
        </mesh>
      ))}
      {/* Neck ring */}
      <mesh position={[0, COL_H/2-0.30, 0]} rotation={[Math.PI/2,0,0]} material={m.mid}>
        <torusGeometry args={[0.20, 0.035, 8, 48]} />
      </mesh>
      {/* Echinus */}
      <mesh position={[0, COL_H/2-0.08, 0]} castShadow material={m.stone}>
        <cylinderGeometry args={[0.36, 0.20, 0.26, 24]} />
      </mesh>
      {/* Capital bell */}
      <mesh position={[0, COL_H/2+0.16, 0]} castShadow material={m.light}>
        <cylinderGeometry args={[0.48, 0.36, 0.22, 24]} />
      </mesh>
      {/* Abacus */}
      <mesh position={[0, COL_H/2+0.32, 0]} castShadow material={m.mid}>
        <boxGeometry args={[1.00, 0.16, 1.00]} />
      </mesh>
    </group>
  );
}

// ─── Voussoir arch — no gaps ──────────────────────────────────────────────
function wedge(angle: number, step: number, Ri: number, Ro: number, d: number) {
  // Overlap slightly (0.520) so voussoirs read as one continuous, full arch
  const h = step * 0.520;
  const a0 = angle - h, a1 = angle + h;
  const v = new Float32Array([
    Math.cos(a0)*Ri, Math.sin(a0)*Ri,  d/2,
    Math.cos(a1)*Ri, Math.sin(a1)*Ri,  d/2,
    Math.cos(a1)*Ro, Math.sin(a1)*Ro,  d/2,
    Math.cos(a0)*Ro, Math.sin(a0)*Ro,  d/2,
    Math.cos(a0)*Ri, Math.sin(a0)*Ri, -d/2,
    Math.cos(a1)*Ri, Math.sin(a1)*Ri, -d/2,
    Math.cos(a1)*Ro, Math.sin(a1)*Ro, -d/2,
    Math.cos(a0)*Ro, Math.sin(a0)*Ro, -d/2,
  ]);
  const idx = [0,1,2,0,2,3, 4,6,5,4,7,6, 0,4,5,0,5,1, 3,2,6,3,6,7, 0,3,7,0,7,4, 1,5,6,1,6,2];
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(v, 3));
  g.setIndex(idx); g.computeVertexNormals();
  return g;
}

function Arch({ m }: { m: M }) {
  const Ro = 1.92, Ri = 1.20, D = 0.64, N = 23;
  const step = Math.PI / (N - 1);
  // Pier (leg) geometry — springs from impost down to ground
  const LEG_W = 0.62, LEG_D = D + 0.12;
  const LEG_H = 4.90;                          // tall enough to sink into steps
  const LEG_CY = -0.37 - LEG_H / 2;           // center = just below impost bottom
  const LEG_X  = Ri + 0.34;                    // x = impost x

  const stones = useMemo(() =>
    Array.from({ length: N }, (_, i) => ({
      geo: wedge(Math.PI * (1 - i / (N-1)), step, Ri, Ro, D),
      mat: i % 2 === 0 ? "stone" : "light",
    })), []);

  // Full tympanum + door-opening backing — single extruded shape
  const backGeo = useMemo(() => {
    const s = new THREE.Shape();
    // Door rectangle going down — full height of piers
    s.moveTo(-LEG_X + LEG_W/2,      LEG_CY - LEG_H/2);
    s.lineTo( LEG_X - LEG_W/2,      LEG_CY - LEG_H/2);
    s.lineTo( LEG_X - LEG_W/2,      0);
    // Semicircular tympanum
    for (let i = 0; i <= 64; i++) {
      const a = (i/64) * Math.PI;
      s.lineTo(Math.cos(a)*(Ro+0.06), Math.sin(a)*(Ro+0.06));
    }
    s.lineTo(-(LEG_X - LEG_W/2),    0);
    s.lineTo(-(LEG_X - LEG_W/2),    LEG_CY - LEG_H/2);
    s.closePath();
    return new THREE.ExtrudeGeometry(s, { depth: D*0.7, bevelEnabled: false });
  }, []);

  // Outer archivolt rim
  const rimGeo = useMemo(() => {
    const outer = new THREE.Shape();
    for (let i = 0; i <= 80; i++) {
      const a = (i/80) * Math.PI;
      const fn = i === 0 ? "moveTo" : "lineTo";
      (outer as any)[fn](Math.cos(a)*(Ro+0.14), Math.sin(a)*(Ro+0.14));
    }
    outer.lineTo(Ro+0.02, 0);
    for (let i = 80; i >= 0; i--) {
      const a = (i/80) * Math.PI;
      outer.lineTo(Math.cos(a)*(Ro+0.02), Math.sin(a)*(Ro+0.02));
    }
    outer.closePath();
    return new THREE.ExtrudeGeometry(outer, { depth: D*0.5, bevelEnabled: false });
  }, []);

  return (
    <group>
      {/* Full tympanum + door backing */}
      <mesh geometry={backGeo} material={m.back} position={[0,0,-D*0.7-0.01]} />

      {/* Piers — stone legs extending to the ground */}
      {([-1,1] as const).map((s,i) => (
        <mesh key={`pier${i}`} position={[s*LEG_X, LEG_CY, 0]} castShadow material={m.mid}>
          <boxGeometry args={[LEG_W, LEG_H, LEG_D]} />
        </mesh>
      ))}
      {/* Impost blocks (spring point caps on top of piers) */}
      {([-1,1] as const).map((s,i) => (
        <mesh key={`imp${i}`} position={[s*LEG_X, -0.16, 0]} castShadow material={m.stone}>
          <boxGeometry args={[LEG_W+0.10, 0.42, LEG_D+0.08]} />
        </mesh>
      ))}

      {/* Voussoir ring */}
      {stones.map(({ geo, mat }, i) => (
        <mesh key={i} geometry={geo} material={mat === "light" ? m.light : m.stone} castShadow receiveShadow />
      ))}
      {/* Outer archivolt moulding */}
      <mesh geometry={rimGeo} material={m.mid} position={[0,0,D*0.1]} castShadow />
      {/* Keystone */}
      <mesh position={[0, Ri+0.30, D*0.05]} castShadow material={m.light}>
        <boxGeometry args={[0.40, 0.78, D+0.10]} />
      </mesh>
    </group>
  );
}

// ─── Logo frame — mounted in arch, spotlight target ───────────────────────
function LogoFrame({ m }: { m: M }) {
  const fw = 1.90, fh = 1.10, border = 0.11;

  return (
    <group position={[0, 0.10, 0.40]}>
      {/* Outer frame moulding (gold) */}
      <mesh castShadow material={m.gold}>
        <boxGeometry args={[fw + border*2 + 0.04, fh + border*2 + 0.04, 0.06]} />
      </mesh>
      {/* Inner backing — black panel */}
      <mesh position={[0, 0, 0.04]} material={m.frame}>
        <boxGeometry args={[fw, fh, 0.04]} />
      </mesh>
      {/* Logo — rendered as HTML inside 3D canvas */}
      <Html
        center
        position={[0, 0, 0.08]}
        style={{ pointerEvents: "none", userSelect: "none" }}
        zIndexRange={[0, 0]}
      >
        <div style={{
          width: "200px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "6px 12px",
        }}>
          <img
            src="/logo-transparent.png"
            alt="BuildHub"
            style={{
              width: "100%",
              height: "auto",
              filter: "invert(1) hue-rotate(180deg) brightness(1.1)",
              display: "block",
            }}
          />
        </div>
      </Html>
    </group>
  );
}

// ─── Entablature ──────────────────────────────────────────────────────────
function Entablature({ m, w = 6.2 }: { m: M; w?: number }) {
  const dentils = Array.from({ length: Math.round(w / 0.29) }, (_, i) => i);
  return (
    <group>
      <mesh position={[0, 0.00, 0]} material={m.stone} castShadow>
        <boxGeometry args={[w, 0.22, 0.54]} />
      </mesh>
      <mesh position={[0, 0.24, 0.04]} material={m.light} castShadow>
        <boxGeometry args={[w, 0.08, 0.50]} />
      </mesh>
      {/* Frieze */}
      <mesh position={[0, 0.40, -0.05]} material={m.mid} castShadow>
        <boxGeometry args={[w, 0.40, 0.40]} />
      </mesh>
      {/* Triglyphs */}
      {[-1.8,-0.6,0.6,1.8].map((x,i) => (
        <group key={i} position={[x, 0.40, 0.12]}>
          <mesh material={m.dark}><boxGeometry args={[0.22, 0.42, 0.05]} /></mesh>
          {[-0.065,0.065].map((dx,j) => (
            <mesh key={j} position={[dx,0,0.04]} material={m.dark}>
              <boxGeometry args={[0.048, 0.42, 0.05]} />
            </mesh>
          ))}
        </group>
      ))}
      {/* Dentils */}
      {dentils.map((i) => (
        <mesh key={i} position={[-w/2+0.16+i*0.29, 0.66, 0.24]} material={m.mid}>
          <boxGeometry args={[0.17, 0.14, 0.15]} />
        </mesh>
      ))}
      {/* Cornice */}
      <mesh position={[0, 0.80, 0.12]} material={m.light} castShadow>
        <boxGeometry args={[w+0.28, 0.24, 0.76]} />
      </mesh>
      <mesh position={[0, 0.70, 0.48]} material={m.dark}>
        <boxGeometry args={[w+0.28, 0.04, 0.05]} />
      </mesh>
    </group>
  );
}

// ─── Background — closes all edges ───────────────────────────────────────
function BackScene({ m }: { m: M }) {
  return (
    <group position={[0, 1.0, -0.92]}>
      <mesh material={m.back} receiveShadow>
        <boxGeometry args={[8.0, 12, 0.24]} />
      </mesh>
      {/* String courses */}
      {[1.0, -2.0].map((y,i) => (
        <mesh key={i} position={[0, y, 0.14]} material={m.mid}>
          <boxGeometry args={[8.0, 0.12, 0.12]} />
        </mesh>
      ))}
      {/* Side walls close the sides completely */}
      {([-4.2, 4.2] as const).map((x,i) => (
        <mesh key={i} position={[x, 0, 0.6]} material={m.back} receiveShadow>
          <boxGeometry args={[0.60, 12, 2.2]} />
        </mesh>
      ))}
      {/* Ceiling plane — closes the top */}
      <mesh position={[0, 6.1, 0.6]} rotation={[Math.PI/2, 0, 0]} material={m.back}>
        <planeGeometry args={[8.0, 2.4]} />
      </mesh>
    </group>
  );
}

// ─── Steps ────────────────────────────────────────────────────────────────
function Steps({ m }: { m: M }) {
  return (
    <group>
      {[
        { y: -3.00, z: 0.28, w: 7.4, d: 1.60, mat: m.light },
        { y: -3.18, z: 0.10, w: 7.7, d: 1.40, mat: m.stone },
        { y: -3.36, z:-0.08, w: 8.0, d: 1.20, mat: m.mid   },
      ].map((s, i) => (
        <mesh key={i} position={[0, s.y, s.z]} castShadow receiveShadow material={s.mat}>
          <boxGeometry args={[s.w, 0.18, s.d]} />
        </mesh>
      ))}
    </group>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────
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
    const targetY = Math.sin(state.clock.elapsedTime * 0.09) * 0.05 + p.x * 0.20 + sc * 0.8;
    const targetX = -p.y * 0.09 + sc * 0.10;
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, targetY, 0.045);
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, targetX, 0.045);
    group.current.position.y = THREE.MathUtils.lerp(group.current.position.y, -sc * 0.5, 0.05);
    const s = 0.84 + THREE.MathUtils.smoothstep(reveal.current, 0, 1) * 0.16;
    group.current.scale.setScalar(s);
  });

  return (
    <group ref={group}>
      <BackScene m={m} />

      {/* Left column */}
      <group position={[-2.12, -0.08, 0]}><Column m={m} /></group>
      {/* Right column */}
      <group position={[ 2.12, -0.08, 0]}><Column m={m} /></group>

      {/* Arch */}
      <group position={[0, 1.72, 0.10]}>
        <Arch m={m} />
      </group>

      {/* Logo frame — centred in arch opening */}
      <group position={[0, 1.72, 0.10]}>
        <LogoFrame m={m} />
      </group>

      {/* Entablature */}
      <group position={[0, 4.42, 0.06]}>
        <Entablature m={m} w={6.2} />
      </group>

      <Steps m={m} />
    </group>
  );
}
