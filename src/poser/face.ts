/**
 * Face anchors in head-bone local space.
 * +X is the figure's left, +Y up the skull, +Z out the face.
 * Head bone origin is the skull base (top of the neck).
 *
 * The 68-point set follows the iBUG / dlib order:
 * 0–16 jaw (person's right ear → chin → person's left ear),
 * 17–21 person's right brow, 22–26 person's left brow,
 * 27–30 nose bridge, 31–35 nose base,
 * 36–41 person's right eye, 42–47 person's left eye,
 * 48–59 outer mouth, 60–67 inner mouth.
 * Person's right is -X when the figure faces +Z.
 */

import type { FaceShape, Vec3 } from "./types.ts";

export function headAnchors(headLen: number): Record<string, Vec3> {
  const s = headLen;
  return {
    nose: { x: 0, y: s * 0.4, z: s * 0.48 },
    left_eye: { x: s * 0.16, y: s * 0.58, z: s * 0.38 },
    right_eye: { x: -s * 0.16, y: s * 0.58, z: s * 0.38 },
    left_ear: { x: s * 0.4, y: s * 0.52, z: 0.0 },
    right_ear: { x: -s * 0.4, y: s * 0.52, z: 0.0 },
  };
}

function p(headLen: number, x: number, y: number, z: number): Vec3 {
  return { x: x * headLen, y: y * headLen, z: z * headLen };
}

export function faceLandmarks(headLen: number): Vec3[] {
  const pts: Vec3[] = [];
  // Jaw, person's right (−X) to person's left (+X), dipping at the chin.
  for (let i = 0; i <= 16; i++) {
    const t = i / 16;
    const x = -0.38 + 0.76 * t;
    const y = 0.55 - Math.sin(Math.PI * t) * 0.4;
    const z = 0.06 + Math.sin(Math.PI * t) * 0.28;
    pts.push(p(headLen, x, y, z));
  }
  // Brows. 17–21 person's right, 22–26 person's left.
  const brow = (x0: number, x1: number, arch: number) => {
    for (let i = 0; i < 5; i++) {
      const t = i / 4;
      const x = x0 + (x1 - x0) * t;
      const y = 0.7 + Math.sin(Math.PI * t) * 0.035 * arch;
      pts.push(p(headLen, x, y, 0.36));
    }
  };
  brow(-0.3, -0.08, 1);
  brow(0.08, 0.3, 1);
  // Nose bridge 27–30, top to tip.
  for (let i = 0; i < 4; i++) {
    const t = i / 3;
    pts.push(p(headLen, 0, 0.66 - t * 0.22, 0.34 + t * 0.14));
  }
  // Nose base 31–35, person's right to left.
  const noseX = [-0.12, -0.06, 0, 0.06, 0.12];
  const noseZ = [0.4, 0.44, 0.48, 0.44, 0.4];
  for (let i = 0; i < 5; i++) pts.push(p(headLen, noseX[i], 0.38, noseZ[i]));
  // Eyes. 36–41 right, 42–47 left. Six points around each eye, starting at the outer corner.
  const eye = (sign: number) => {
    const cx = sign * 0.16;
    const cy = 0.58;
    const rx = 0.07;
    const ry = 0.03;
    // outer, top-outer, top-inner, inner, bottom-inner, bottom-outer
    const ang = [Math.PI, Math.PI * 1.35, Math.PI * 1.7, 0, Math.PI * 0.35, Math.PI * 0.7];
    // Flip so person's right eye (sign -1) starts at its outer corner (more negative X).
    for (const a of ang) {
      const x = cx + Math.cos(a) * rx * sign * -1;
      const y = cy + Math.sin(a) * ry;
      pts.push(p(headLen, x, y, 0.38));
    }
  };
  eye(-1);
  eye(1);
  // Outer mouth 48–59. 12 points.
  const mouth = (n: number, rx: number, ry: number, y: number, z: number) => {
    for (let i = 0; i < n; i++) {
      const a = Math.PI + (i / n) * Math.PI * 2;
      // Start at person's right corner and go across the upper lip, then lower.
      const upper = i < n / 2;
      const t = upper ? i / (n / 2) : (i - n / 2) / (n / 2);
      const x = -rx + t * 2 * rx;
      const yy = y + (upper ? Math.sin(Math.PI * t) * ry : -Math.sin(Math.PI * t) * ry * 1.15);
      pts.push(p(headLen, x, yy, z));
    }
  };
  mouth(12, 0.13, 0.035, 0.28, 0.4);
  // Inner mouth 60–67. 8 points.
  mouth(8, 0.08, 0.02, 0.275, 0.39);
  if (pts.length !== 68) {
    throw new Error(`face landmarks must be 68, got ${pts.length}`);
  }
  return pts;
}

export const NEUTRAL_FACE: FaceShape = { jaw: 0, smile: 0, brow: 0, blink: 0, mouth: 1 };

export const FACE_PRESETS: { id: string; name: string; face: FaceShape }[] = [
  { id: "neutral", name: "Neutral", face: { ...NEUTRAL_FACE } },
  { id: "smile", name: "Smile", face: { jaw: 0.08, smile: 0.85, brow: 0.15, blink: 0, mouth: 1.15 } },
  { id: "surprise", name: "Surprise", face: { jaw: 0.55, smile: 0.05, brow: 0.9, blink: 0, mouth: 0.9 } },
  { id: "frown", name: "Frown", face: { jaw: 0, smile: -0.75, brow: -0.65, blink: 0.08, mouth: 0.9 } },
  { id: "blink", name: "Blink", face: { jaw: 0, smile: 0, brow: -0.15, blink: 1, mouth: 1 } },
  { id: "talk", name: "Talk", face: { jaw: 0.62, smile: 0.12, brow: 0.05, blink: 0, mouth: 1.05 } },
];

function clip(v: number, lo: number, hi: number, fallback: number): number {
  return Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : fallback;
}

/** Fill missing fields and keep each control inside its slider range. */
export function clampFace(raw?: Partial<FaceShape> | null): FaceShape {
  return {
    jaw: clip(raw?.jaw ?? 0, 0, 1, 0),
    smile: clip(raw?.smile ?? 0, -1, 1, 0),
    brow: clip(raw?.brow ?? 0, -1, 1, 0),
    blink: clip(raw?.blink ?? 0, 0, 1, 0),
    mouth: clip(raw?.mouth ?? 1, 0.55, 1.7, 1),
  };
}

/**
 * 68 iBUG points after the expression controls. Neutral matches `faceLandmarks`.
 * Index groups follow the comment at the top of this file.
 */
export function shapedLandmarks(headLen: number, raw?: Partial<FaceShape> | null): Vec3[] {
  const shape = clampFace(raw);
  const pts = faceLandmarks(headLen).map((p) => ({ ...p }));
  const s = headLen;
  const jaw = shape.jaw;
  for (let i = 0; i <= 16; i++) {
    const t = 1 - Math.abs(i - 8) / 8;
    pts[i].y -= s * 0.16 * jaw * (0.35 + 0.65 * t);
    pts[i].z += s * 0.03 * jaw * t;
  }
  for (let i = 17; i <= 26; i++) pts[i].y += s * 0.06 * shape.brow;
  const shut = (from: number, to: number) => {
    let cy = 0;
    for (let i = from; i <= to; i++) cy += pts[i].y;
    cy /= to - from + 1;
    for (let i = from; i <= to; i++) pts[i].y = cy + (pts[i].y - cy) * (1 - shape.blink * 0.92);
  };
  shut(36, 41);
  shut(42, 47);
  for (let i = 48; i < 68; i++) {
    const corner = Math.min(1, Math.abs(pts[i].x) / (s * 0.13 || 1));
    const side = pts[i].x < 0 ? -1 : 1;
    pts[i].x += side * s * 0.045 * shape.smile * (0.35 + corner);
    pts[i].y += s * 0.04 * shape.smile * corner;
    pts[i].x *= shape.mouth;
  }
  let mouthY = 0;
  for (let i = 48; i < 68; i++) mouthY += pts[i].y;
  mouthY /= 20;
  for (let i = 48; i < 68; i++) {
    if (pts[i].y > mouthY + s * 0.004) continue;
    pts[i].y -= s * 0.11 * jaw;
    pts[i].z += s * 0.02 * jaw;
  }
  return pts;
}

/** Polyline pairs for the landmark overlay. Not used by the OpenPose export. */
export function faceLineIndices(): number[] {
  const chain = (ids: number[], close = false) => {
    const out: number[] = [];
    for (let i = 0; i < ids.length - 1; i++) out.push(ids[i], ids[i + 1]);
    if (close && ids.length > 1) out.push(ids[ids.length - 1], ids[0]);
    return out;
  };
  const seq = (a: number, b: number) => {
    const ids: number[] = [];
    for (let i = a; i <= b; i++) ids.push(i);
    return ids;
  };
  return [
    ...chain(seq(0, 16)),
    ...chain(seq(17, 21)),
    ...chain(seq(22, 26)),
    ...chain(seq(27, 30)),
    ...chain(seq(31, 35)),
    ...chain(seq(36, 41), true),
    ...chain(seq(42, 47), true),
    ...chain(seq(48, 59), true),
    ...chain(seq(60, 67), true),
  ];
}

export type FaceGroup = {
  id: string;
  title: string;
  from: number;
  to: number;
  /** Closed loops use the short way around, so the first and last points are neighbors. */
  ring: boolean;
  names: string[];
};

function faceGroup(id: string, title: string, from: number, to: number, ring: boolean, names: string[]): FaceGroup {
  if (names.length !== to - from + 1) throw new Error(`${title} names do not match ${from}–${to}`);
  return { id, title, from, to, ring, names };
}

/** Regions of the 68-point set. The list shows these, not one flat row per point. */
export const FACE_GROUPS: FaceGroup[] = [
  faceGroup("jaw", "Jaw", 0, 16, false, [
    "Right ear",
    "Right jaw 1",
    "Right jaw 2",
    "Right jaw 3",
    "Right jaw 4",
    "Right jaw 5",
    "Right jaw 6",
    "Right jaw 7",
    "Chin",
    "Left jaw 7",
    "Left jaw 6",
    "Left jaw 5",
    "Left jaw 4",
    "Left jaw 3",
    "Left jaw 2",
    "Left jaw 1",
    "Left ear",
  ]),
  faceGroup("browR", "Right brow", 17, 21, false, ["Outer", "Outer mid", "Arch", "Inner mid", "Inner"]),
  faceGroup("browL", "Left brow", 22, 26, false, ["Inner", "Inner mid", "Arch", "Outer mid", "Outer"]),
  faceGroup("nose", "Nose", 27, 35, false, [
    "Bridge top",
    "Bridge",
    "Bridge low",
    "Tip",
    "Right wing",
    "Right base",
    "Center",
    "Left base",
    "Left wing",
  ]),
  faceGroup("eyeR", "Right eye", 36, 41, true, ["Outer", "Upper outer", "Upper inner", "Inner", "Lower inner", "Lower outer"]),
  faceGroup("eyeL", "Left eye", 42, 47, true, ["Outer", "Upper outer", "Upper inner", "Inner", "Lower inner", "Lower outer"]),
  faceGroup("mouth", "Outer mouth", 48, 59, true, [
    "Right corner",
    "Upper 1",
    "Upper 2",
    "Upper center",
    "Upper 4",
    "Upper 5",
    "Lower 1",
    "Lower 2",
    "Lower 3",
    "Lower center",
    "Lower 5",
    "Lower 6",
  ]),
  faceGroup("inner", "Inner mouth", 60, 67, true, [
    "Right",
    "Upper 1",
    "Upper center",
    "Upper 3",
    "Lower 1",
    "Lower 2",
    "Lower center",
    "Lower 4",
  ]),
];

export function faceGroupOf(index: number): FaceGroup {
  return FACE_GROUPS.find((g) => index >= g.from && index <= g.to) ?? FACE_GROUPS[0];
}

const OFFSET_LIMIT = 0.12;

export function emptyFaceOffsets(): Vec3[] {
  return Array.from({ length: 68 }, () => ({ x: 0, y: 0, z: 0 }));
}

/** Missing or short lists become 68 zeros. Each axis stays inside a few centimeters. */
export function clampFaceOffsets(raw?: Vec3[] | null): Vec3[] {
  const out = emptyFaceOffsets();
  if (!Array.isArray(raw)) return out;
  for (let i = 0; i < 68; i++) {
    const v = raw[i];
    if (!v) continue;
    out[i] = {
      x: clip(v.x, -OFFSET_LIMIT, OFFSET_LIMIT, 0),
      y: clip(v.y, -OFFSET_LIMIT, OFFSET_LIMIT, 0),
      z: clip(v.z, -OFFSET_LIMIT, OFFSET_LIMIT, 0),
    };
  }
  return out;
}

/** Shaped landmarks plus the hand-placed offsets. */
export function posedLandmarks(headLen: number, face?: Partial<FaceShape> | null, offsets?: Vec3[] | null): Vec3[] {
  const pts = shapedLandmarks(headLen, face);
  const off = clampFaceOffsets(offsets);
  for (let i = 0; i < 68; i++) {
    pts[i].x += off[i].x;
    pts[i].y += off[i].y;
    pts[i].z += off[i].z;
  }
  return pts;
}

/** Partner index across the face, or null for a center point. X flips, Y and Z do not. */
export const FACE_MIRROR: (number | null)[] = (() => {
  const pts = faceLandmarks(1);
  return pts.map((p, i) => {
    let best = -1;
    let bestD = 0.035;
    for (let j = 0; j < pts.length; j++) {
      if (j === i) continue;
      const q = pts[j];
      const d = Math.abs(p.x + q.x) + Math.abs(p.y - q.y) + Math.abs(p.z - q.z);
      if (d < bestD) {
        bestD = d;
        best = j;
      }
    }
    return best < 0 ? null : best;
  });
})();

/** Weights for one drag. 1 on the grabbed point, falling off along its group. */
export function faceWeights(index: number, isolate: boolean): Float64Array {
  const w = new Float64Array(68);
  if (index < 0 || index > 67) return w;
  if (isolate) {
    w[index] = 1;
    return w;
  }
  const g = faceGroupOf(index);
  const n = g.to - g.from + 1;
  const sigma = 1.25;
  const localIndex = index - g.from;
  for (let i = g.from; i <= g.to; i++) {
    let d = Math.abs(i - g.from - localIndex);
    if (g.ring) d = Math.min(d, n - d);
    const weight = Math.exp(-(d * d) / (sigma * sigma));
    if (weight >= 0.05) w[i] = weight;
  }
  return w;
}

/**
 * Copy `base` and add `delta`. Neighbors in the same region follow unless `isolate`.
 * Mirror copies the move to the other side with X flipped, and does not stack on top of a stronger weight.
 */
export function applyFaceOffset(
  base: Vec3[] | null | undefined,
  index: number,
  delta: Vec3,
  opts: { isolate: boolean; mirror: boolean },
): Vec3[] {
  const out = clampFaceOffsets(base);
  if (index < 0 || index > 67) return out;
  const weights = faceWeights(index, opts.isolate);
  const accW = new Float64Array(68);
  const acc = emptyFaceOffsets();
  const consider = (i: number, d: Vec3, w: number) => {
    if (i < 0 || i > 67 || w <= accW[i]) return;
    accW[i] = w;
    acc[i] = { x: d.x * w, y: d.y * w, z: d.z * w };
  };
  for (let i = 0; i < 68; i++) {
    const w = weights[i];
    if (w < 0.05) continue;
    consider(i, delta, w);
    if (!opts.mirror) continue;
    const partner = FACE_MIRROR[i];
    if (partner == null) continue;
    consider(partner, { x: -delta.x, y: delta.y, z: delta.z }, w);
  }
  for (let i = 0; i < 68; i++) {
    if (accW[i] <= 0) continue;
    out[i] = { x: out[i].x + acc[i].x, y: out[i].y + acc[i].y, z: out[i].z + acc[i].z };
  }
  return clampFaceOffsets(out);
}
