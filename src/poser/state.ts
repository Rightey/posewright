import { NEUTRAL_FACE, emptyFaceOffsets } from "./face.ts";
import { v3, type BodyParams, type ExportSettings, type FigureData, type SceneState } from "./types.ts";
import { clampParams } from "./proportions.ts";
import { poseById, writeHand, type Pose } from "./pose.ts";

export const FIGURE_COLORS = ["#3ecfb2", "#e0a045", "#d4654f", "#7aa2d4"];

export const BODY_PRESETS: { id: string; name: string; params: BodyParams }[] = [
  {
    id: "adult-f",
    name: "Adult female average",
    params: { sex: 0.05, age: 30, heightCm: 163, mass: 0.42, muscle: 0.28, shoulder: 1, hip: 1.02, torso: 1, leg: 1 },
  },
  {
    id: "adult-m",
    name: "Adult male muscular",
    params: { sex: 1, age: 28, heightCm: 181, mass: 0.55, muscle: 0.88, shoulder: 1.12, hip: 0.96, torso: 1.02, leg: 1 },
  },
  {
    id: "child",
    name: "Child 6y",
    params: { sex: 0.5, age: 6, heightCm: 115, mass: 0.38, muscle: 0.18, shoulder: 0.98, hip: 1, torso: 1, leg: 0.98 },
  },
  {
    id: "teen",
    name: "Teen male slim",
    params: { sex: 0.85, age: 15, heightCm: 170, mass: 0.22, muscle: 0.32, shoulder: 0.96, hip: 0.94, torso: 1, leg: 1.05 },
  },
  {
    id: "elder-f",
    name: "Elderly female",
    params: { sex: 0.08, age: 78, heightCm: 156, mass: 0.5, muscle: 0.12, shoulder: 0.94, hip: 1.06, torso: 0.96, leg: 0.97 },
  },
  {
    id: "heavy-m",
    name: "Heavy adult male",
    params: { sex: 0.92, age: 45, heightCm: 178, mass: 0.94, muscle: 0.34, shoulder: 1.06, hip: 1.1, torso: 1.05, leg: 0.98 },
  },
];

const ZERO_TARGETS = {
  handL: v3(),
  handR: v3(),
  footL: v3(),
  footR: v3(),
  head: v3(),
  pelvis: v3(),
};

export function defaultExport(): ExportSettings {
  return {
    preset: "768",
    width: 768,
    height: 768,
    includeHandsFace: false,
    hideOccluded: false,
    wireThickness: 1.35,
    wireInvert: false,
    wireColored: false,
    wireXray: false,
    wireAA: false,
    depthAuto: true,
    overlay: "off",
  };
}

export function makeFigure(index: number, presetId = "adult-f"): FigureData {
  const preset = BODY_PRESETS.find((p) => p.id === presetId) ?? BODY_PRESETS[0];
  const pose: Pose = { ...(poseById("stand") ?? {}) };
  writeHand(pose, "L", "relaxed");
  writeHand(pose, "R", "relaxed");
  return {
    id: `f${index}`,
    name: `Figure ${index}`,
    color: FIGURE_COLORS[(index - 1) % FIGURE_COLORS.length],
    visible: true,
    params: clampParams({ ...preset.params }),
    position: v3((index - 1) * 0.85 - 0, 0, 0),
    rotationY: 0,
    scale: 1,
    pose,
    ik: false,
    ikTargets: { ...ZERO_TARGETS, handL: v3(), handR: v3(), footL: v3(), footR: v3(), head: v3(), pelvis: v3() },
    pelvisOffset: v3(),
    detailedFeet: false,
    detailedHead: false,
    face: { ...NEUTRAL_FACE },
    faceOffsets: emptyFaceOffsets(),
    faceMirror: true,
  };
}

export function defaultScene(): SceneState {
  return {
    figures: [makeFigure(1, "adult-f")],
    selection: { figureId: "f1", bone: null },
    tool: "rotate",
    jointLimits: true,
    showJoints: true,
    showBody: true,
    showGrid: true,
    export: defaultExport(),
    warning: "",
  };
}

export function stamp(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
}

export function downloadBlob(blob: Blob, filename: string) {
  const a = document.createElement("a");
  const url = URL.createObjectURL(blob);
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v)) as T;
}
