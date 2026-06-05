import * as THREE from "three";

// ──────────────────────────────────────────────────────────────────────────────
// Procedural limestone PBR textures — generated on a <canvas> at runtime.
// Produces tileable color + normal + roughness maps so stone reads photoreal
// (visible grain, soft weathering) without shipping any image assets.
// CLIENT ONLY — guard callers behind ssr:false / useMemo.
// ──────────────────────────────────────────────────────────────────────────────

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Tileable value-noise grid
function noiseGrid(n: number, rng: () => number) {
  const g = new Float32Array(n * n);
  for (let i = 0; i < g.length; i++) g[i] = rng();
  return g;
}

function sample(grid: Float32Array, n: number, x: number, y: number) {
  x = ((x % n) + n) % n;
  y = ((y % n) + n) % n;
  const x0 = Math.floor(x), y0 = Math.floor(y);
  const x1 = (x0 + 1) % n, y1 = (y0 + 1) % n;
  const fx = x - x0, fy = y - y0;
  // smoothstep interpolation
  const sx = fx * fx * (3 - 2 * fx);
  const sy = fy * fy * (3 - 2 * fy);
  const a = grid[y0 * n + x0], b = grid[y0 * n + x1];
  const c = grid[y1 * n + x0], d = grid[y1 * n + x1];
  return (
    a * (1 - sx) * (1 - sy) +
    b * sx * (1 - sy) +
    c * (1 - sx) * sy +
    d * sx * sy
  );
}

function fbm(grid: Float32Array, n: number, x: number, y: number, octaves: number) {
  let val = 0, amp = 0.5, freq = 1, norm = 0;
  for (let o = 0; o < octaves; o++) {
    val += amp * sample(grid, n, x * freq, y * freq);
    norm += amp;
    amp *= 0.5;
    freq *= 2;
  }
  return val / norm;
}

export type StoneTone = {
  /** base cream colour, hex */
  base: string;
  /** how much darker the low points get (0..1) */
  contrast?: number;
  /** texture px (power of two) */
  size?: number;
  /** how many times to repeat over the surface */
  repeat?: number;
};

export type StoneMaps = {
  map: THREE.CanvasTexture;
  normalMap: THREE.CanvasTexture;
  roughnessMap: THREE.CanvasTexture;
};

function hexToRgb(hex: string) {
  const h = hex.replace("#", "");
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

export function createLimestone(tone: StoneTone): StoneMaps {
  const size = tone.size ?? 512;
  const contrast = tone.contrast ?? 0.16;
  const { r, g, b } = hexToRgb(tone.base);

  const gridN = 64;
  const rng = mulberry32(Math.floor((r * 7 + g * 13 + b * 17) | 0) + 1);
  const grid = noiseGrid(gridN, rng);
  // second grid for fine grain
  const grid2 = noiseGrid(gridN, mulberry32(999 + r));

  // Build a height field first (used by color + normal + roughness)
  const h = new Float32Array(size * size);
  const scale = gridN / size * 4; // 4 tiles of base noise across the texture
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const big = fbm(grid, gridN, x * scale, y * scale, 4);
      const fine = fbm(grid2, gridN, x * scale * 4, y * scale * 4, 2);
      // combine: broad mottling + fine grain + occasional pits
      let v = big * 0.78 + fine * 0.22;
      // subtle horizontal bedding planes (limestone strata)
      v += Math.sin(y * 0.06 + big * 3) * 0.015;
      h[y * size + x] = v;
    }
  }

  // ── Colour map ──
  const cCanvas = document.createElement("canvas");
  cCanvas.width = cCanvas.height = size;
  const cctx = cCanvas.getContext("2d")!;
  const cImg = cctx.createImageData(size, size);
  for (let i = 0; i < size * size; i++) {
    const v = h[i];
    // darken in the low areas, lighten on highs
    const shade = 1 - contrast + v * (contrast * 2);
    // slight warm/cool drift for natural variation
    const warm = (v - 0.5) * 10;
    cImg.data[i * 4 + 0] = Math.max(0, Math.min(255, r * shade + warm));
    cImg.data[i * 4 + 1] = Math.max(0, Math.min(255, g * shade + warm * 0.7));
    cImg.data[i * 4 + 2] = Math.max(0, Math.min(255, b * shade + warm * 0.4));
    cImg.data[i * 4 + 3] = 255;
  }
  cctx.putImageData(cImg, 0, 0);

  // ── Roughness map ── (low areas slightly rougher)
  const rCanvas = document.createElement("canvas");
  rCanvas.width = rCanvas.height = size;
  const rctx = rCanvas.getContext("2d")!;
  const rImg = rctx.createImageData(size, size);
  for (let i = 0; i < size * size; i++) {
    const v = h[i];
    const rough = 200 + (1 - v) * 50; // 0.78..0.98 range-ish
    rImg.data[i * 4 + 0] = rough;
    rImg.data[i * 4 + 1] = rough;
    rImg.data[i * 4 + 2] = rough;
    rImg.data[i * 4 + 3] = 255;
  }
  rctx.putImageData(rImg, 0, 0);

  // ── Normal map ── (from height gradient)
  const nCanvas = document.createElement("canvas");
  nCanvas.width = nCanvas.height = size;
  const nctx = nCanvas.getContext("2d")!;
  const nImg = nctx.createImageData(size, size);
  const strength = 2.2;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = y * size + x;
      const xl = h[y * size + ((x - 1 + size) % size)];
      const xr = h[y * size + ((x + 1) % size)];
      const yt = h[((y - 1 + size) % size) * size + x];
      const yb = h[((y + 1) % size) * size + x];
      let nx = (xl - xr) * strength;
      let ny = (yt - yb) * strength;
      let nz = 1.0;
      const len = Math.hypot(nx, ny, nz) || 1;
      nx /= len; ny /= len; nz /= len;
      nImg.data[i * 4 + 0] = (nx * 0.5 + 0.5) * 255;
      nImg.data[i * 4 + 1] = (ny * 0.5 + 0.5) * 255;
      nImg.data[i * 4 + 2] = (nz * 0.5 + 0.5) * 255;
      nImg.data[i * 4 + 3] = 255;
    }
  }
  nctx.putImageData(nImg, 0, 0);

  const repeat = tone.repeat ?? 1;
  const finish = (c: HTMLCanvasElement, srgb: boolean) => {
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(repeat, repeat);
    t.anisotropy = 4;
    if (srgb) t.colorSpace = THREE.SRGBColorSpace;
    t.needsUpdate = true;
    return t;
  };

  return {
    map: finish(cCanvas, true),
    roughnessMap: finish(rCanvas, false),
    normalMap: finish(nCanvas, false),
  };
}

// Build a textured physical material from a tone
export function limestoneMaterial(tone: StoneTone, opts?: {
  roughness?: number;
  clearcoat?: number;
  normalScale?: number;
  envMapIntensity?: number;
}): THREE.MeshPhysicalMaterial {
  const maps = createLimestone(tone);
  return new THREE.MeshPhysicalMaterial({
    map: maps.map,
    normalMap: maps.normalMap,
    roughnessMap: maps.roughnessMap,
    roughness: opts?.roughness ?? 0.95,
    metalness: 0,
    clearcoat: opts?.clearcoat ?? 0.05,
    clearcoatRoughness: 0.85,
    normalScale: new THREE.Vector2(opts?.normalScale ?? 0.6, opts?.normalScale ?? 0.6),
    envMapIntensity: opts?.envMapIntensity ?? 0.55,
  });
}
