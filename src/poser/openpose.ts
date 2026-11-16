/**
 * OpenPose / DWPose drawing that matches controlnet_aux's `draw_bodypose`,
 * `draw_handpose`, and `draw_facepose` (huggingface/controlnet_aux
 * `src/controlnet_aux/open_pose/util.py`).
 *
 * Channel order: those helpers pass color tuples to OpenCV, which writes the
 * tuple into the numpy buffer in the order given. The detector then wraps that
 * buffer with PIL `Image.fromarray` (RGB, no BGR swap). The PNG colors are
 * therefore the tuples themselves: body limb 0 is RGB(255, 0, 0), hand dots
 * are RGB(0, 0, 255), face dots are white.
 *
 * controlnet_aux draws at the detect resolution (usually 512) with a fixed
 * stick width of 4 px and dot radius of 4 (face radius 3), then the image is
 * resized. We draw at the final export size, so widths scale by
 * min(width, height) / 512 to land on the same pixels a 512 draw would have
 * after upscale. Limb colors are multiplied by 0.6 before the dots are painted
 * at full brightness — that 0.6 is in the annotator, not a guess.
 *
 * Body keypoint order is COCO-18:
 * 0 nose, 1 neck, 2 R shoulder, 3 R elbow, 4 R wrist,
 * 5 L shoulder, 6 L elbow, 7 L wrist, 8 R hip, 9 R knee, 10 R ankle,
 * 11 L hip, 12 L knee, 13 L ankle, 14 R eye, 15 L eye, 16 R ear, 17 L ear.
 * Left/right are the person's own. Neck is the midpoint of the shoulders
 * (derived; it is not a bone).
 *
 * Limb pairs are 1-indexed, same list as current controlnet_aux (17 limbs;
 * the older shoulder–ear links are not in that build).
 */

export type Keypoint = { x: number; y: number; c: number };

export const COCO18 = [
  "nose",
  "neck",
  "right_shoulder",
  "right_elbow",
  "right_wrist",
  "left_shoulder",
  "left_elbow",
  "left_wrist",
  "right_hip",
  "right_knee",
  "right_ankle",
  "left_hip",
  "left_knee",
  "left_ankle",
  "right_eye",
  "left_eye",
  "right_ear",
  "left_ear",
] as const;

/** RGB, full brightness. Index matches both keypoints and the limb list below. */
export const BODY_COLORS: [number, number, number][] = [
  [255, 0, 0],
  [255, 85, 0],
  [255, 170, 0],
  [255, 255, 0],
  [170, 255, 0],
  [85, 255, 0],
  [0, 255, 0],
  [0, 255, 85],
  [0, 255, 170],
  [0, 255, 255],
  [0, 170, 255],
  [0, 85, 255],
  [0, 0, 255],
  [85, 0, 255],
  [170, 0, 255],
  [255, 0, 255],
  [255, 0, 170],
  [255, 0, 85],
];

/** 1-indexed into COCO-18, from controlnet_aux draw_bodypose. */
export const BODY_LIMBS: [number, number][] = [
  [2, 3],
  [2, 6],
  [3, 4],
  [4, 5],
  [6, 7],
  [7, 8],
  [2, 9],
  [9, 10],
  [10, 11],
  [2, 12],
  [12, 13],
  [13, 14],
  [2, 1],
  [1, 15],
  [15, 17],
  [1, 16],
  [16, 18],
];

export const HAND_EDGES: [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [0, 5],
  [5, 6],
  [6, 7],
  [7, 8],
  [0, 9],
  [9, 10],
  [10, 11],
  [11, 12],
  [0, 13],
  [13, 14],
  [14, 15],
  [15, 16],
  [0, 17],
  [17, 18],
  [18, 19],
  [19, 20],
];

export type PersonPose = {
  body: Keypoint[];
  handL: Keypoint[];
  handR: Keypoint[];
  face: Keypoint[];
};

export function emptyKeypoint(): Keypoint {
  return { x: 0, y: 0, c: 0 };
}

export function flattenKeys(keys: Keypoint[], count: number): number[] {
  const out: number[] = [];
  for (let i = 0; i < count; i++) {
    const k = keys[i];
    if (!k || k.c <= 0) out.push(0, 0, 0);
    else out.push(k.x, k.y, k.c);
  }
  return out;
}

/**
 * OpenPose-style JSON. `pose_keypoints_2d` is COCO-18 as flat [x, y, confidence]
 * in pixels. Hand (21) and face (68) arrays are included when `handsFace` is set.
 * Canvas size is recorded so a loader does not have to guess normalization.
 */
export function openPoseJson(
  people: PersonPose[],
  width: number,
  height: number,
  handsFace: boolean,
): string {
  return JSON.stringify(
    {
      version: 1.3,
      canvas_width: width,
      canvas_height: height,
      people: people.map((p) => ({
        person_id: [-1],
        pose_keypoints_2d: flattenKeys(p.body, 18),
        face_keypoints_2d: handsFace ? flattenKeys(p.face, 68) : [],
        hand_left_keypoints_2d: handsFace ? flattenKeys(p.handL, 21) : [],
        hand_right_keypoints_2d: handsFace ? flattenKeys(p.handR, 21) : [],
        pose_keypoints_3d: [],
        face_keypoints_3d: [],
        hand_left_keypoints_3d: [],
        hand_right_keypoints_3d: [],
      })),
    },
    null,
    2,
  );
}

function hsvToRgb(h: number, s: number, v: number): [number, number, number] {
  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  let r = v;
  let g = t;
  let b = p;
  switch (i % 6) {
    case 0:
      r = v;
      g = t;
      b = p;
      break;
    case 1:
      r = q;
      g = v;
      b = p;
      break;
    case 2:
      r = p;
      g = v;
      b = t;
      break;
    case 3:
      r = p;
      g = q;
      b = v;
      break;
    case 4:
      r = t;
      g = p;
      b = v;
      break;
    default:
      r = v;
      g = p;
      b = q;
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function alive(k: Keypoint | undefined): k is Keypoint {
  return !!k && k.c > 0;
}

export function drawOpenPose(
  ctx: CanvasRenderingContext2D,
  people: PersonPose[],
  width: number,
  height: number,
  opts: { handsFace: boolean; clear: boolean },
) {
  if (opts.clear) {
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, width, height);
  }
  const scale = Math.min(width, height) / 512;
  const stick = Math.max(1, 4 * scale);
  const dot = Math.max(1, 4 * scale);
  const faceDot = Math.max(1, 3 * scale);
  const handWidth = Math.max(1, 2 * scale);

  for (const person of people) {
    ctx.save();
    BODY_LIMBS.forEach(([a, b], i) => {
      const k1 = person.body[a - 1];
      const k2 = person.body[b - 1];
      if (!alive(k1) || !alive(k2)) return;
      const color = BODY_COLORS[i] ?? BODY_COLORS[0];
      const dx = k2.x - k1.x;
      const dy = k2.y - k1.y;
      const length = Math.hypot(dx, dy);
      if (length < 0.5) return;
      ctx.save();
      ctx.translate((k1.x + k2.x) / 2, (k1.y + k2.y) / 2);
      ctx.rotate(Math.atan2(dy, dx));
      ctx.fillStyle = `rgb(${Math.round(color[0] * 0.6)},${Math.round(color[1] * 0.6)},${Math.round(color[2] * 0.6)})`;
      ctx.beginPath();
      ctx.ellipse(0, 0, length / 2, stick, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
    person.body.forEach((k, i) => {
      if (!alive(k)) return;
      const color = BODY_COLORS[i] ?? [255, 255, 255];
      ctx.fillStyle = `rgb(${color[0]},${color[1]},${color[2]})`;
      ctx.beginPath();
      ctx.arc(k.x, k.y, dot, 0, Math.PI * 2);
      ctx.fill();
    });

    if (opts.handsFace) {
      for (const hand of [person.handL, person.handR]) {
        HAND_EDGES.forEach(([e1, e2], ie) => {
          const k1 = hand[e1];
          const k2 = hand[e2];
          if (!alive(k1) || !alive(k2)) return;
          const [r, g, bl] = hsvToRgb(ie / HAND_EDGES.length, 1, 1);
          ctx.strokeStyle = `rgb(${r},${g},${bl})`;
          ctx.lineWidth = handWidth;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(k1.x, k1.y);
          ctx.lineTo(k2.x, k2.y);
          ctx.stroke();
        });
        ctx.fillStyle = "rgb(0,0,255)";
        for (const k of hand) {
          if (!alive(k)) continue;
          ctx.beginPath();
          ctx.arc(k.x, k.y, dot, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.fillStyle = "rgb(255,255,255)";
      for (const k of person.face) {
        if (!alive(k)) continue;
        ctx.beginPath();
        ctx.arc(k.x, k.y, faceDot, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }
}

/** Fraction of frame height covered by confident body keypoints. Below ~0.18 is a weak ControlNet signal. */
export function bodyCoverage(people: PersonPose[], height: number): number {
  let minY = Infinity;
  let maxY = -Infinity;
  for (const p of people) {
    for (const k of p.body) {
      if (k.c <= 0) continue;
      minY = Math.min(minY, k.y);
      maxY = Math.max(maxY, k.y);
    }
  }
  if (!Number.isFinite(minY)) return 0;
  return (maxY - minY) / Math.max(1, height);
}
