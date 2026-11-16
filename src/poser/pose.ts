/**
 * Pose authoring.
 *
 * Rest pose is a T-pose and every bone's local axes match the figure axes
 * (X figure-left, Y up, Z forward) because rest quaternions are identity.
 * User pose is an intrinsic XYZ Euler in degrees on top of that.
 *
 * With that convention (right-handed, column vectors, Three.js XYZ Euler):
 * - Left upper arm points +X. Negative Z lowers it to the side. Positive Z raises it.
 * - Right upper arm points -X. Positive Z lowers it. (Z limits are mirrored.)
 * - Left elbow flexion is negative Y (forearm swings toward +Z / forward).
 *   Right elbow flexion is positive Y.
 * - Both thighs point -Y. Negative X swings the foot forward (+Z).
 *   Positive X swings it backward.
 * - Both knees flex with positive X (heel toward the backside, -Z).
 * - Lower torso, mid torso, chest, neck, and head: positive X pitches forward.
 *   Share a deep bend across the three torso bones so the body curls instead of creasing.
 * - Finger curl is +Z on the left hand and -Z on the right (palms down in the T-pose).
 * - Both feet point forward. Positive X points the sole down.
 * - Toe curl is positive X on both feet. The big toe has two bones; the others have three.
 */

import type { BodyParams, EulerDeg, HandPreset, ToePreset } from "./types.ts";
import { TOE_DIGITS } from "./proportions.ts";
import { ZERO } from "./types.ts";

export type Pose = Record<string, EulerDeg>;

type Limit = { x: [number, number]; y: [number, number]; z: [number, number] };

const LIM: Record<string, Limit> = {
  spine: { x: [-25, 70], y: [-40, 40], z: [-30, 30] },
  abdomen: { x: [-20, 65], y: [-35, 35], z: [-28, 28] },
  chest: { x: [-18, 50], y: [-35, 35], z: [-28, 28] },
  neck: { x: [-30, 45], y: [-70, 70], z: [-35, 35] },
  head: { x: [-35, 45], y: [-60, 60], z: [-30, 30] },
  // Ball joint. X is twist along the arm, Y swings it forward and back, Z raises it.
  // The old X floor of -90 blocked hands-behind-the-head and then snapped the gizmo back.
  "upperArm.L": { x: [-170, 170], y: [-160, 160], z: [-170, 170] },
  "lowerArm.L": { x: [-30, 30], y: [-155, 15], z: [-25, 25] },
  "hand.L": { x: [-50, 60], y: [-40, 40], z: [-70, 70] },
  "upperLeg.L": { x: [-120, 45], y: [-45, 45], z: [-50, 70] },
  "lowerLeg.L": { x: [-8, 155], y: [-20, 20], z: [-15, 15] },
  "foot.L": { x: [-40, 50], y: [-25, 25], z: [-30, 30] },
};

const FINGER_LIM_L: Limit = { x: [-15, 20], y: [-20, 20], z: [-15, 110] };
const TOE_LIM: Limit = { x: [-40, 90], y: [-18, 18], z: [-20, 20] };
const HALLUX_LIM: Limit = { x: [-35, 75], y: [-32, 18], z: [-18, 18] };

function mirrorLimit(l: Limit): Limit {
  return {
    x: l.x,
    y: [-l.y[1], -l.y[0]],
    z: [-l.z[1], -l.z[0]],
  };
}

function toeLimit(name: string): Limit | null {
  const m = name.match(/^(hallux|second|third|fourth|fifth)\d\.[LR]$/);
  if (!m) return null;
  return m[1] === "hallux" ? HALLUX_LIM : TOE_LIM;
}

export function limitsFor(name: string): Limit | null {
  if (LIM[name]) return LIM[name];
  const toe = toeLimit(name);
  if (toe) return name.endsWith(".R") ? mirrorLimit(toe) : toe;
  if (name.endsWith(".R")) {
    const left = limitsFor(name.slice(0, -2) + ".L");
    return left ? mirrorLimit(left) : null;
  }
  if (/\d\.L$/.test(name)) return FINGER_LIM_L;
  if (/\d\.R$/.test(name)) return mirrorLimit(FINGER_LIM_L);
  return null;
}

function clamp(v: number, range: [number, number]): number {
  return Math.min(range[1], Math.max(range[0], v));
}

export function clampEuler(name: string, e: EulerDeg): EulerDeg {
  const lim = limitsFor(name);
  if (!lim) return e;
  return { x: clamp(e.x, lim.x), y: clamp(e.y, lim.y), z: clamp(e.z, lim.z) };
}

/**
 * XYZ Euler has two solutions, and each angle can jump by 360.
 * Keep the one nearest the previous pose so a drag does not flip and then hit a limit.
 */
export function nearestEuler(raw: EulerDeg, prev: EulerDeg): EulerDeg {
  const bases = [raw, { x: raw.x + 180, y: 180 - raw.y, z: raw.z + 180 }];
  let best = raw;
  let bestD = Infinity;
  for (const base of bases) {
    for (const ox of [-360, 0, 360]) {
      for (const oy of [-360, 0, 360]) {
        for (const oz of [-360, 0, 360]) {
          const c = { x: base.x + ox, y: base.y + oy, z: base.z + oz };
          const d = (c.x - prev.x) ** 2 + (c.y - prev.y) ** 2 + (c.z - prev.z) ** 2;
          if (d < bestD) {
            bestD = d;
            best = c;
          }
        }
      }
    }
  }
  return best;
}

const FINGER_NAMES = ["index", "middle", "ring", "pinky", "thumb"] as const;

/** Stable joint order for the picker and for Tab. Matches the rig, fingers included. */
export function jointNames(): string[] {
  const names = ["hips", "spine", "abdomen", "chest", "neck", "head"];
  for (const side of ["L", "R"] as const) {
    names.push(`upperArm.${side}`, `lowerArm.${side}`, `hand.${side}`);
    for (const finger of FINGER_NAMES) {
      for (let i = 1; i <= 3; i++) names.push(`${finger}${i}.${side}`);
    }
  }
  for (const side of ["L", "R"] as const) {
    names.push(`upperLeg.${side}`, `lowerLeg.${side}`, `foot.${side}`);
    for (const toe of TOE_DIGITS) {
      for (let i = 1; i <= toe.bones; i++) names.push(`${toe.name}${i}.${side}`);
    }
  }
  return names;
}

const JOINT_LABELS: Record<string, string> = {
  hips: "Hips",
  spine: "Lower torso",
  abdomen: "Mid torso",
  chest: "Chest",
  neck: "Neck",
  head: "Head",
  "upperArm.L": "Upper arm L",
  "upperArm.R": "Upper arm R",
  "lowerArm.L": "Forearm L",
  "lowerArm.R": "Forearm R",
  "hand.L": "Hand L",
  "hand.R": "Hand R",
  "upperLeg.L": "Thigh L",
  "upperLeg.R": "Thigh R",
  "lowerLeg.L": "Shin L",
  "lowerLeg.R": "Shin R",
  "foot.L": "Foot L",
  "foot.R": "Foot R",
};

export function jointLabel(name: string): string {
  if (JOINT_LABELS[name]) return JOINT_LABELS[name];
  const finger = name.match(/^(thumb|index|middle|ring|pinky)(\d)\.(L|R)$/);
  if (finger) {
    const word = finger[1][0].toUpperCase() + finger[1].slice(1);
    return `${word} ${finger[2]} ${finger[3]}`;
  }
  const toe = name.match(/^(hallux|second|third|fourth|fifth)(\d)\.(L|R)$/);
  if (!toe) return name;
  const word = toe[1] === "hallux" ? "Big toe" : `${toe[1][0].toUpperCase()}${toe[1].slice(1)} toe`;
  return `${word} ${toe[2]} ${toe[3]}`;
}

export function jointGroup(name: string): string {
  if (["hips", "spine", "abdomen", "chest", "neck", "head"].includes(name)) return "Torso";
  if (name.startsWith("upperArm.") || name.startsWith("lowerArm.") || name.startsWith("hand.")) {
    return name.endsWith(".L") ? "Left arm" : "Right arm";
  }
  if (name.startsWith("upperLeg.") || name.startsWith("lowerLeg.") || name.startsWith("foot.")) {
    return name.endsWith(".L") ? "Left leg" : "Right leg";
  }
  if (/^(hallux|second|third|fourth|fifth)/.test(name)) {
    return name.endsWith(".L") ? "Left toes" : "Right toes";
  }
  if (name.endsWith(".L")) return "Left fingers";
  if (name.endsWith(".R")) return "Right fingers";
  return "Other";
}

export type JointAngle = { name: string; x: number; y: number; z: number };

/** Every joint, including zeros, so a saved file is a full rotation table. */
export function poseToJoints(pose: Pose): JointAngle[] {
  return jointNames().map((name) => {
    const e = pose[name] ?? ZERO;
    return { name, x: e.x, y: e.y, z: e.z };
  });
}

export function jointsToPose(joints: JointAngle[]): Pose {
  const pose: Pose = {};
  for (const joint of joints) {
    if (!joint || typeof joint.name !== "string") continue;
    const x = Number(joint.x);
    const y = Number(joint.y);
    const z = Number(joint.z);
    pose[joint.name] = {
      x: Number.isFinite(x) ? x : 0,
      y: Number.isFinite(y) ? y : 0,
      z: Number.isFinite(z) ? z : 0,
    };
  }
  return pose;
}

/** Degrees of forward spine pitch blended in for older figures. Not stored in the pose. */
export function baseStoop(params: BodyParams): Pose {
  const t = Math.min(1, Math.max(0, (params.age - 55) / 25));
  const stoop = t * t * 16;
  if (stoop < 0.2) return {};
  return {
    spine: { x: stoop * 0.4, y: 0, z: 0 },
    abdomen: { x: stoop * 0.3, y: 0, z: 0 },
    chest: { x: stoop * 0.2, y: 0, z: 0 },
    neck: { x: -stoop * 0.12, y: 0, z: 0 },
  };
}

export function composedEuler(name: string, pose: Pose, params: BodyParams, limits: boolean): EulerDeg {
  const u = pose[name] ?? ZERO;
  const b = baseStoop(params)[name] ?? ZERO;
  const e = { x: u.x + b.x, y: u.y + b.y, z: u.z + b.z };
  return limits ? clampEuler(name, e) : e;
}

const HAND_CURL: Record<HandPreset, Record<string, [number, number, number]>> = {
  open: {
    thumb: [8, 6, 4],
    index: [0, 0, 0],
    middle: [0, 0, 0],
    ring: [0, 0, 0],
    pinky: [0, 0, 0],
  },
  relaxed: {
    thumb: [18, 14, 10],
    index: [18, 16, 10],
    middle: [22, 18, 12],
    ring: [24, 20, 12],
    pinky: [26, 18, 10],
  },
  fist: {
    thumb: [40, 30, 25],
    index: [85, 95, 70],
    middle: [88, 98, 72],
    ring: [88, 96, 70],
    pinky: [82, 90, 65],
  },
  point: {
    thumb: [35, 25, 18],
    index: [4, 2, 0],
    middle: [85, 95, 70],
    ring: [85, 95, 70],
    pinky: [80, 90, 65],
  },
  grip: {
    thumb: [30, 28, 20],
    index: [48, 55, 35],
    middle: [55, 62, 40],
    ring: [55, 60, 38],
    pinky: [50, 55, 32],
  },
};

const FINGERS = ["thumb", "index", "middle", "ring", "pinky"] as const;

export function writeHand(pose: Pose, side: "L" | "R", preset: HandPreset): Pose {
  const sign = side === "L" ? 1 : -1;
  const table = HAND_CURL[preset];
  for (const f of FINGERS) {
    const curls = table[f];
    for (let i = 0; i < 3; i++) {
      pose[`${f}${i + 1}.${side}`] = { x: 0, y: 0, z: sign * curls[i] };
    }
  }
  return pose;
}

const TOE_CURL: Record<ToePreset, Record<string, number[]>> = {
  open: {
    hallux: [0, 0],
    second: [0, 0, 0],
    third: [0, 0, 0],
    fourth: [0, 0, 0],
    fifth: [0, 0, 0],
  },
  relaxed: {
    hallux: [10, 8],
    second: [14, 12, 8],
    third: [16, 14, 8],
    fourth: [16, 12, 8],
    fifth: [18, 12, 6],
  },
  curl: {
    hallux: [38, 30],
    second: [48, 42, 28],
    third: [50, 44, 30],
    fourth: [48, 40, 26],
    fifth: [42, 34, 22],
  },
};

/** Plantarflex the toes. Positive X curls both feet the same way. */
export function writeToes(pose: Pose, side: "L" | "R", preset: ToePreset): Pose {
  const table = TOE_CURL[preset];
  for (const digit of TOE_DIGITS) {
    const curls = table[digit.name];
    for (let i = 0; i < digit.bones; i++) {
      pose[`${digit.name}${i + 1}.${side}`] = { x: curls[i] ?? 0, y: 0, z: 0 };
    }
  }
  return pose;
}

export function mirrorPose(pose: Pose, direction: "L2R" | "R2L"): Pose {
  const src = direction === "L2R" ? ".L" : ".R";
  const dst = direction === "L2R" ? ".R" : ".L";
  const next: Pose = { ...pose };
  for (const [name, e] of Object.entries(pose)) {
    if (!name.endsWith(src)) continue;
    const other = name.slice(0, -2) + dst;
    // Mirrored local frames: pitch (X) stays, yaw and roll flip.
    next[other] = { x: e.x, y: -e.y, z: -e.z };
  }
  return next;
}

function P(partial: Pose, hand: HandPreset = "relaxed", toes: ToePreset = "relaxed"): Pose {
  const pose: Pose = { ...partial };
  writeHand(pose, "L", hand);
  writeHand(pose, "R", hand);
  writeToes(pose, "L", toes);
  writeToes(pose, "R", toes);
  return pose;
}

export const POSE_PRESETS: { id: string; name: string; pose: Pose }[] = [
  { id: "t", name: "T-pose", pose: P({}, "open", "open") },
  {
    id: "a",
    name: "A-pose",
    pose: P(
      {
        "upperArm.L": { x: 0, y: 0, z: -42 },
        "upperArm.R": { x: 0, y: 0, z: 42 },
        "lowerArm.L": { x: 0, y: -6, z: 0 },
        "lowerArm.R": { x: 0, y: 6, z: 0 },
      },
      "relaxed",
      "open",
    ),
  },
  {
    id: "stand",
    name: "Standing",
    pose: P({
      "upperArm.L": { x: 0, y: 8, z: -74 },
      "upperArm.R": { x: 0, y: -8, z: 74 },
      "lowerArm.L": { x: 0, y: -14, z: 0 },
      "lowerArm.R": { x: 0, y: 14, z: 0 },
      "hand.L": { x: 8, y: 0, z: 0 },
      "hand.R": { x: 8, y: 0, z: 0 },
    }),
  },
  {
    id: "walk",
    name: "Walking",
    pose: P({
      "upperLeg.L": { x: -28, y: 0, z: 2 },
      "upperLeg.R": { x: 16, y: 0, z: -2 },
      "lowerLeg.L": { x: 18, y: 0, z: 0 },
      "lowerLeg.R": { x: 48, y: 0, z: 0 },
      "foot.L": { x: -8, y: 0, z: 0 },
      "foot.R": { x: 6, y: 0, z: 0 },
      "upperArm.L": { x: 12, y: 6, z: -68 },
      "upperArm.R": { x: -18, y: -6, z: 66 },
      "lowerArm.L": { x: 0, y: -28, z: 0 },
      "lowerArm.R": { x: 0, y: 18, z: 0 },
      spine: { x: 2, y: -5, z: 1 },
      abdomen: { x: 2, y: -3, z: 1 },
    }),
  },
  {
    id: "run",
    name: "Running",
    pose: P({
      "upperLeg.L": { x: -50, y: 0, z: 4 },
      "upperLeg.R": { x: 22, y: 0, z: -4 },
      "lowerLeg.L": { x: 70, y: 0, z: 0 },
      "lowerLeg.R": { x: 18, y: 0, z: 0 },
      "upperArm.L": { x: 30, y: 10, z: -50 },
      "upperArm.R": { x: -40, y: -10, z: 48 },
      "lowerArm.L": { x: 0, y: -70, z: 0 },
      "lowerArm.R": { x: 0, y: 55, z: 0 },
      spine: { x: 8, y: -6, z: 0 },
      abdomen: { x: 6, y: -4, z: 0 },
      chest: { x: 8, y: 0, z: 0 },
    }),
  },
  {
    id: "sit",
    name: "Sitting",
    pose: P({
      "upperLeg.L": { x: -88, y: 6, z: 4 },
      "upperLeg.R": { x: -88, y: -6, z: -4 },
      "lowerLeg.L": { x: 90, y: 0, z: 0 },
      "lowerLeg.R": { x: 90, y: 0, z: 0 },
      "foot.L": { x: 8, y: 0, z: 0 },
      "foot.R": { x: 8, y: 0, z: 0 },
      "upperArm.L": { x: 10, y: 20, z: -58 },
      "upperArm.R": { x: 10, y: -20, z: 58 },
      "lowerArm.L": { x: 0, y: -50, z: 0 },
      "lowerArm.R": { x: 0, y: 50, z: 0 },
      spine: { x: 5, y: 0, z: 0 },
      abdomen: { x: 3, y: 0, z: 0 },
    }),
  },
  {
    id: "crouch",
    name: "Crouching",
    pose: P({
      "upperLeg.L": { x: -70, y: 4, z: 6 },
      "upperLeg.R": { x: -70, y: -4, z: -6 },
      "lowerLeg.L": { x: 120, y: 0, z: 0 },
      "lowerLeg.R": { x: 120, y: 0, z: 0 },
      "foot.L": { x: 20, y: 0, z: 0 },
      "foot.R": { x: 20, y: 0, z: 0 },
      "upperArm.L": { x: 20, y: 15, z: -40 },
      "upperArm.R": { x: 20, y: -15, z: 40 },
      "lowerArm.L": { x: 0, y: -40, z: 0 },
      "lowerArm.R": { x: 0, y: 40, z: 0 },
      spine: { x: 14, y: 0, z: 0 },
      abdomen: { x: 12, y: 0, z: 0 },
      chest: { x: 8, y: 0, z: 0 },
    }),
  },
  {
    id: "raise",
    name: "Arms raised",
    pose: P({
      "upperArm.L": { x: 0, y: 10, z: 85 },
      "upperArm.R": { x: 0, y: -10, z: -85 },
      "lowerArm.L": { x: 0, y: -12, z: 0 },
      "lowerArm.R": { x: 0, y: 12, z: 0 },
    }),
  },
  {
    id: "fight",
    name: "Fighting stance",
    pose: P(
      {
        "upperLeg.L": { x: -22, y: 8, z: 8 },
        "upperLeg.R": { x: 12, y: -6, z: -6 },
        "lowerLeg.L": { x: 30, y: 0, z: 0 },
        "lowerLeg.R": { x: 18, y: 0, z: 0 },
        "upperArm.L": { x: 50, y: -20, z: -35 },
        "upperArm.R": { x: -10, y: 30, z: 28 },
        "lowerArm.L": { x: 0, y: -85, z: 0 },
        "lowerArm.R": { x: 0, y: 95, z: 0 },
        spine: { x: 6, y: 10, z: -2 },
        abdomen: { x: 4, y: 6, z: -2 },
        head: { x: -4, y: -10, z: 0 },
      },
      "fist",
    ),
  },
  {
    id: "fold",
    name: "Toe touch",
    pose: P({
      spine: { x: 52, y: 0, z: 0 },
      abdomen: { x: 44, y: 0, z: 0 },
      chest: { x: 30, y: 0, z: 0 },
      neck: { x: -12, y: 0, z: 0 },
      head: { x: 8, y: 0, z: 0 },
      "upperArm.L": { x: 15, y: 8, z: -78 },
      "upperArm.R": { x: 15, y: -8, z: 78 },
      "lowerArm.L": { x: 0, y: -16, z: 0 },
      "lowerArm.R": { x: 0, y: 16, z: 0 },
    }),
  },
];

export function poseById(id: string): Pose | undefined {
  return POSE_PRESETS.find((p) => p.id === id)?.pose;
}
