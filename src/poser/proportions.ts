/**
 * Anthropometric layout for one humanoid, in meters, T-pose, facing +Z.
 * Figure-left is +X (so a figure facing the camera has its right limbs on image-left).
 *
 * Numbers are fractions of stature, interpolated across age, then rescaled so the
 * vertical stack (sole → top of head) equals the requested height.
 *
 * Sources (adult baselines, then age-adjusted):
 * - Drillis & Contini, 1966, body segment lengths as % of stature
 *   (upper arm 18.6, forearm 14.6, hand 10.8, thigh ~24.5, shank ~24.6,
 *   trochanter height ~53, ankle height ~4).
 * - Pheasant & Haslegrave, Bodyspace: biacromial breadth ~25.5% stature (male)
 *   and ~21.8% (female); bi-iliac hip breadth wider on female presentation.
 * - Artistic canon / CDC-ish growth: head is ~1/5.5 of stature at age 5
 *   (≈18%) and ~1/7.5 (≈13%) in adults. Legs are a smaller share of height
 *   in children. Elderly stature share shifts slightly toward the head
 *   because the spine compresses; stoop itself is applied as a pose, not a length.
 */

import type { BodyParams, Vec3 } from "./types.ts";

export type SegmentKind = "tube" | "ellipsoid" | "box";

export type Segment = {
  name: string;
  parent: string | null;
  head: Vec3;
  tail: Vec3;
  rx0: number;
  rx1: number;
  rz0: number;
  rz1: number;
  kind: SegmentKind;
  radial: number;
  rings: number;
};

const AGE = [5, 10, 15, 22, 40, 60, 80];

function sample(age: number, values: number[]): number {
  if (age <= AGE[0]) return values[0];
  const last = AGE.length - 1;
  if (age >= AGE[last]) return values[last];
  for (let i = 0; i < last; i++) {
    if (age <= AGE[i + 1]) {
      const t = (age - AGE[i]) / (AGE[i + 1] - AGE[i]);
      return values[i] * (1 - t) + values[i + 1] * t;
    }
  }
  return values[last];
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function clamp(v: number, a: number, b: number): number {
  return Math.min(b, Math.max(a, v));
}

export function heightLimits(age: number): { min: number; max: number; typical: number } {
  // Rough CDC 3rd–97th envelopes, widened a little so presets always fit.
  const min = sample(age, [95, 120, 145, 148, 148, 145, 140]);
  const max = sample(age, [125, 160, 190, 205, 205, 198, 190]);
  const typical = sample(age, [110, 140, 168, 172, 170, 166, 160]);
  return { min, max, typical };
}

export function clampParams(p: BodyParams): BodyParams {
  const lim = heightLimits(p.age);
  return {
    sex: clamp(p.sex, 0, 1),
    age: clamp(p.age, 5, 80),
    heightCm: clamp(p.heightCm, lim.min, lim.max),
    mass: clamp(p.mass, 0, 1),
    muscle: clamp(p.muscle, 0, 1),
    shoulder: clamp(p.shoulder, 0.75, 1.35),
    hip: clamp(p.hip, 0.75, 1.35),
    torso: clamp(p.torso, 0.82, 1.2),
    leg: clamp(p.leg, 0.82, 1.2),
  };
}

function add(
  segments: Segment[],
  name: string,
  parent: string | null,
  head: Vec3,
  tail: Vec3,
  rx0: number,
  rx1: number,
  rz0: number,
  rz1: number,
  kind: SegmentKind,
  radial = 8,
  rings = 4,
) {
  segments.push({ name, parent, head, tail, rx0, rx1, rz0, rz1, kind, radial, rings });
}

function norm(v: Vec3): Vec3 {
  const l = Math.hypot(v.x, v.y, v.z) || 1;
  return { x: v.x / l, y: v.y / l, z: v.z / l };
}

function scale(v: Vec3, s: number): Vec3 {
  return { x: v.x * s, y: v.y * s, z: v.z * s };
}

function mad(a: Vec3, b: Vec3, s: number): Vec3 {
  return { x: a.x + b.x * s, y: a.y + b.y * s, z: a.z + b.z * s };
}

/** Head length in meters for the current params (after height normalization). */
export function layoutFigure(raw: BodyParams, detailedFeet = true): Segment[] {
  const p = clampParams(raw);
  const H = p.heightCm / 100;
  const sex = p.sex;
  const age = p.age;

  // Fractions of stature before the torso/leg multipliers and final normalize.
  const headF = sample(age, [0.182, 0.158, 0.142, 0.133, 0.13, 0.134, 0.142]);
  const neckF = sample(age, [0.03, 0.033, 0.037, 0.042, 0.042, 0.04, 0.038]);
  const footF = sample(age, [0.038, 0.04, 0.042, 0.043, 0.043, 0.044, 0.045]);
  // Hip-joint height (trochanter) as a fraction of stature. Children are leg-short.
  const hipF = sample(age, [0.46, 0.5, 0.525, 0.532, 0.53, 0.52, 0.505]);
  const shankShare = sample(age, [0.46, 0.48, 0.5, 0.505, 0.5, 0.495, 0.49]);

  let foot = footF;
  let leg = Math.max(0.28, hipF - footF) * p.leg;
  let thigh = leg * (1 - shankShare);
  let shank = leg * shankShare;
  let neck = neckF;
  let head = headF;
  // Whatever is left is torso (hip joint → shoulder), then the torso slider biases it.
  let torso = Math.max(0.2, 1 - (foot + thigh + shank + neck + head));
  torso *= p.torso;
  const sum = foot + thigh + shank + torso + neck + head;
  const k = 1 / sum;
  foot *= k * H;
  thigh *= k * H;
  shank *= k * H;
  torso *= k * H;
  neck *= k * H;
  head *= k * H;

  const yAnkle = foot * 0.92;
  const yKnee = yAnkle + shank;
  const yHip = yKnee + thigh;
  // Three torso sections, hip → shoulder: lower back, midsection, chest.
  // Shorter tubes can share a toe-touch instead of one cylinder folding through itself.
  const yWaist = yHip + torso * 0.34;
  const yRibs = yHip + torso * 0.67;
  const yShoulder = yHip + torso;
  const yNeck = yShoulder + neck;
  const yCrown = yNeck + head;

  const shoulderW =
    H *
    lerp(0.218, 0.258, sex) *
    sample(age, [0.9, 0.95, 1, 1, 1, 0.98, 0.95]) *
    p.shoulder;
  const hipW =
    H * lerp(0.195, 0.162, sex) * sample(age, [1.06, 1.0, 0.98, 1, 1.0, 1.03, 1.06]) * p.hip;

  const mass = p.mass;
  const muscle = p.muscle;
  const slim = 0.78 + mass * 0.85;
  const msc = 0.82 + muscle * 0.6;

  const thighR = H * 0.055 * slim * (0.88 + muscle * 0.28);
  const kneeR = H * 0.038 * (0.9 + mass * 0.25) * (0.9 + muscle * 0.2);
  const ankleR = H * 0.026 * (0.9 + mass * 0.15);
  const armR = H * 0.03 * msc * (0.88 + mass * 0.22);
  const elbowR = H * 0.024 * msc;
  const wristR = H * 0.018 * (0.9 + muscle * 0.15);
  const neckR = H * 0.028 * (0.88 + mass * 0.4);
  const waistRx = hipW * 0.46 * (0.7 + mass * 0.75);
  const waistRz = H * 0.058 * (0.68 + mass * 1.05);
  const chestRx = H * lerp(0.085, 0.1, sex) * (0.82 + mass * 0.45) * (1 + muscle * 0.08);
  const chestRz = H * lerp(0.07, 0.078, sex) * (0.8 + mass * 0.6);
  const pelvisRx = hipW * 0.62;
  const pelvisRz = H * 0.07 * (0.85 + mass * 0.45);

  const upperArm = H * sample(age, [0.16, 0.17, 0.18, 0.186, 0.186, 0.182, 0.176]) * lerp(0.98, 1.02, sex);
  const forearm = H * sample(age, [0.128, 0.136, 0.142, 0.146, 0.146, 0.142, 0.138]) * lerp(0.97, 1.02, sex);
  const handLen = H * sample(age, [0.09, 0.098, 0.104, 0.108, 0.108, 0.105, 0.1]);

  const segments: Segment[] = [];
  const hip: Vec3 = { x: 0, y: yHip, z: 0 };
  const midRx = waistRx + (chestRx - waistRx) * 0.35;
  const midRz = waistRz + (chestRz - waistRz) * 0.35;
  add(segments, "hips", null, hip, { x: 0, y: yHip + torso * 0.09, z: 0 }, pelvisRx, pelvisRx, pelvisRz, pelvisRz, "ellipsoid", 10, 8);

  add(
    segments,
    "spine",
    "hips",
    hip,
    { x: 0, y: yWaist, z: 0 },
    pelvisRx * 0.78,
    waistRx,
    pelvisRz * 0.9,
    waistRz,
    "tube",
    10,
    4,
  );
  add(
    segments,
    "abdomen",
    "spine",
    { x: 0, y: yWaist, z: 0 },
    { x: 0, y: yRibs, z: 0 },
    waistRx,
    midRx,
    waistRz,
    midRz,
    "tube",
    10,
    4,
  );
  add(
    segments,
    "chest",
    "abdomen",
    { x: 0, y: yRibs, z: 0 },
    { x: 0, y: yShoulder, z: 0 },
    midRx,
    chestRx,
    midRz,
    chestRz,
    "tube",
    10,
    4,
  );
  add(
    segments,
    "neck",
    "chest",
    { x: 0, y: yShoulder, z: 0 },
    { x: 0, y: yNeck, z: 0 },
    neckR * 1.15,
    neckR,
    neckR * 1.15,
    neckR,
    "tube",
    8,
    3,
  );
  const headRx = head * 0.4;
  const headRy = head * 0.5;
  const headRz = head * 0.46;
  add(
    segments,
    "head",
    "neck",
    { x: 0, y: yNeck, z: 0 },
    { x: 0, y: yCrown, z: 0 },
    headRx,
    headRy,
    headRz,
    headRz,
    "ellipsoid",
    16,
    12,
  );

  const hipSpread = hipW * 0.38;
  const shSpread = shoulderW * 0.5;

  const arm = (
    side: "L" | "R",
    sign: number,
  ) => {
    const shoulder: Vec3 = { x: sign * shSpread, y: yShoulder, z: 0 };
    const elbow: Vec3 = { x: shoulder.x + sign * upperArm, y: yShoulder, z: 0 };
    const wrist: Vec3 = { x: elbow.x + sign * forearm, y: yShoulder, z: 0 };
    const palm = handLen * 0.5;
    const handEnd: Vec3 = { x: wrist.x + sign * palm, y: yShoulder, z: 0 };
    add(segments, `upperArm.${side}`, "chest", shoulder, elbow, armR, elbowR * 1.05, armR, elbowR, "tube", 8, 4);
    add(segments, `lowerArm.${side}`, `upperArm.${side}`, elbow, wrist, elbowR, wristR * 1.15, elbowR * 0.95, wristR, "tube", 8, 4);
    add(
      segments,
      `hand.${side}`,
      `lowerArm.${side}`,
      wrist,
      handEnd,
      handLen * 0.16,
      handLen * 0.13,
      handLen * 0.05,
      handLen * 0.035,
      "box",
      4,
      2,
    );
    addFingers(segments, side, sign, wrist, handLen);
  };

  arm("L", 1);
  arm("R", -1);

  const addLeg = (side: "L" | "R", sign: number) => {
    const hj: Vec3 = { x: sign * hipSpread, y: yHip, z: 0 };
    const kj: Vec3 = { x: sign * hipSpread, y: yKnee, z: 0 };
    const aj: Vec3 = { x: sign * hipSpread, y: yAnkle, z: 0 };
    add(segments, `upperLeg.${side}`, "hips", hj, kj, thighR, kneeR * 1.15, thighR * 0.95, kneeR, "tube", 8, 5);
    add(segments, `lowerLeg.${side}`, `upperLeg.${side}`, kj, aj, kneeR, ankleR * 1.2, kneeR * 0.95, ankleR, "tube", 8, 4);
    if (!detailedFeet) {
      const toe: Vec3 = { x: aj.x, y: yAnkle * 0.45, z: H * 0.11 };
      add(
        segments,
        `foot.${side}`,
        `lowerLeg.${side}`,
        aj,
        toe,
        H * 0.028,
        H * 0.02,
        H * 0.02,
        H * 0.014,
        "box",
        4,
        2,
      );
      return;
    }
    // Foot length is not the ankle height. Adult feet are ~15% of stature;
    // the ankle sits about a quarter of that length ahead of the heel.
    const footLen =
      H * sample(age, [0.158, 0.156, 0.152, 0.15, 0.15, 0.149, 0.147]) * lerp(0.96, 1.03, sex);
    const sole = Math.max(0.005, yAnkle * 0.16);
    const halfW0 = H * 0.022 * (0.94 + mass * 0.12);
    const halfW1 = H * 0.03 * (0.92 + mass * 0.16) * lerp(0.94, 1, sex);
    const thick0 = H * 0.016 * (0.94 + mass * 0.1);
    const thick1 = H * 0.011 * (0.94 + mass * 0.08);
    const ball: Vec3 = { x: aj.x, y: sole + thick1, z: aj.z + footLen * 0.55 };
    add(
      segments,
      `foot.${side}`,
      `lowerLeg.${side}`,
      aj,
      ball,
      halfW0,
      halfW1,
      thick0,
      thick1,
      "tube",
      8,
      4,
    );
    addToes(segments, side, sign, ball, footLen, halfW1);
  };
  addLeg("L", 1);
  addLeg("R", -1);

  return segments;
}

export const TOE_DIGITS: { name: string; bones: number }[] = [
  { name: "hallux", bones: 2 },
  { name: "second", bones: 3 },
  { name: "third", bones: 3 },
  { name: "fourth", bones: 3 },
  { name: "fifth", bones: 3 },
];

/**
 * Heel bulb for a foot segment, in figure space. The bottom lines up with the
 * ball of the foot so the sole can sit flat; the body is behind the ankle.
 */
export function footHeel(seg: Segment): { center: Vec3; rx: number; ry: number; rz: number } | null {
  if (!seg.name.startsWith("foot.") || seg.kind === "box") return null;
  const dx = seg.tail.x - seg.head.x;
  const dz = seg.tail.z - seg.head.z;
  const len = Math.hypot(dx, dz) || 1;
  const ballBottom = seg.tail.y - seg.rz1;
  const ry = Math.max(seg.rz0, (seg.head.y - ballBottom) * 0.46);
  const backEdge = Math.max(0.035, Math.min(len * 0.4, seg.rx0 * 1.7));
  const rz = backEdge * 0.62;
  return {
    center: {
      x: seg.head.x - (dx / len) * seg.rx0 * 0.05,
      y: ballBottom + ry,
      z: seg.head.z - (dz / len) * (backEdge - rz),
    },
    rx: seg.rx0 * 0.98,
    ry,
    rz,
  };
}

function addToes(
  segments: Segment[],
  side: "L" | "R",
  sign: number,
  ball: Vec3,
  footLen: number,
  halfWidth: number,
) {
  // u is medial (−) to lateral (+) in the foot's own frame. sign flips it
  // into figure X, so the big toe of each foot points toward the midline.
  const span = halfWidth * 0.92;
  const digits: { n: string; u: number; bones: number; len: number; girth: number }[] = [
    { n: "hallux", u: -0.82, bones: 2, len: 0.26, girth: 0.042 },
    { n: "second", u: -0.38, bones: 3, len: 0.22, girth: 0.026 },
    { n: "third", u: 0.02, bones: 3, len: 0.2, girth: 0.024 },
    { n: "fourth", u: 0.4, bones: 3, len: 0.17, girth: 0.022 },
    { n: "fifth", u: 0.8, bones: 3, len: 0.14, girth: 0.02 },
  ];
  for (const d of digits) {
    const lateral = sign * d.u;
    const origin: Vec3 = { x: ball.x + lateral * span, y: ball.y, z: ball.z };
    const dir = norm({ x: lateral * 0.55, y: -0.1, z: 1 });
    const total = footLen * d.len;
    const parts = d.bones === 2 ? [0.56, 0.44] : [0.46, 0.32, 0.22];
    let parent = `foot.${side}`;
    let head = origin;
    for (let i = 0; i < d.bones; i++) {
      const name = `${d.n}${i + 1}.${side}`;
      const r0 = footLen * d.girth * (1 - i * 0.18);
      const r1 = r0 * 0.76;
      const tail = mad(head, dir, total * parts[i]);
      add(segments, name, parent, head, tail, r0, r1, r0 * 0.7, r1 * 0.7, "tube", 5, 2);
      parent = name;
      head = tail;
    }
  }
}

function addFingers(segments: Segment[], side: "L" | "R", sign: number, wrist: Vec3, handLen: number) {
  const palm = handLen * 0.5;
  // Spread is in Z: thumb and index toward +Z (forward, palms down), pinky toward -Z.
  const fingers: { n: string; z: number; y: number; len: number; dirZ: number }[] = [
    { n: "index", z: 0.2, y: 0.02, len: 0.48, dirZ: 0.08 },
    { n: "middle", z: 0.02, y: 0.01, len: 0.54, dirZ: 0 },
    { n: "ring", z: -0.14, y: 0, len: 0.5, dirZ: -0.05 },
    { n: "pinky", z: -0.28, y: -0.01, len: 0.38, dirZ: -0.1 },
  ];
  for (const f of fingers) {
    const origin = {
      x: wrist.x + sign * palm,
      y: wrist.y + handLen * f.y,
      z: wrist.z + handLen * f.z,
    };
    const dir = norm({ x: sign, y: 0, z: f.dirZ });
    const total = handLen * f.len;
    const lens = [total * 0.42, total * 0.32, total * 0.26];
    let parent = `hand.${side}`;
    let head = origin;
    for (let i = 0; i < 3; i++) {
      const name = `${f.n}${i + 1}.${side}`;
      const r0 = handLen * (0.045 - i * 0.008);
      const r1 = r0 * 0.78;
      const tail = mad(head, dir, lens[i]);
      add(segments, name, parent, head, tail, r0, r1, r0 * 0.85, r1 * 0.85, "tube", 5, 2);
      parent = name;
      head = tail;
    }
  }

  // Thumb: 3 bones, angled forward and slightly down from the side of the palm.
  const thumbHead = {
    x: wrist.x + sign * palm * 0.28,
    y: wrist.y - handLen * 0.02,
    z: wrist.z + handLen * 0.1,
  };
  const thumbDir = norm({ x: sign * 0.25, y: -0.2, z: 0.9 });
  const thumbTotal = handLen * 0.42;
  const tlens = [thumbTotal * 0.38, thumbTotal * 0.32, thumbTotal * 0.3];
  let parent = `hand.${side}`;
  let head = thumbHead;
  for (let i = 0; i < 3; i++) {
    const name = `thumb${i + 1}.${side}`;
    const r0 = handLen * (0.05 - i * 0.008);
    const tail = mad(head, thumbDir, tlens[i]);
    add(segments, name, parent, head, tail, r0, r0 * 0.8, r0 * 0.8, r0 * 0.65, "tube", 5, 2);
    parent = name;
    head = tail;
  }
}

export function segmentMap(segments: Segment[]): Map<string, Segment> {
  return new Map(segments.map((s) => [s.name, s]));
}

export function restDirection(seg: Segment): Vec3 {
  return norm({
    x: seg.tail.x - seg.head.x,
    y: seg.tail.y - seg.head.y,
    z: seg.tail.z - seg.head.z,
  });
}

export function headLength(segments: Segment[]): number {
  const h = segments.find((s) => s.name === "head");
  if (!h) return 0.2;
  return Math.hypot(h.tail.x - h.head.x, h.tail.y - h.head.y, h.tail.z - h.head.z);
}

export function statureOf(segments: Segment[]): number {
  const h = segments.find((s) => s.name === "head");
  return h ? h.tail.y : 0;
}
