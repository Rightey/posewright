import { Bone, Object3D, Quaternion, Vector3 } from "three";
import type { Segment } from "./proportions.ts";
import { restDirection } from "./proportions.ts";
import type { IkTargets, Vec3 } from "./types.ts";

const _from = new Vector3();
const _to = new Vector3();
const _inv = new Quaternion();
const _align = new Quaternion();
const _swing = new Quaternion();
const _twist = new Quaternion();

/**
 * Two-bone IK (law of cosines) with a pole vector.
 * The bend is pushed toward `pole`. The target is clamped to the reachable range
 * so the bones keep their rest lengths.
 */
export function solveElbow(
  root: Vector3,
  target: Vector3,
  len1: number,
  len2: number,
  pole: Vector3,
  out: Vector3,
): Vector3 {
  const axis = new Vector3().subVectors(target, root);
  let dist = axis.length();
  const max = Math.max(len1, len2, len1 + len2 - 1e-4);
  const min = Math.abs(len1 - len2) + 1e-4;
  const reach = Math.min(Math.max(dist, min), len1 + len2 - 1e-4);
  if (dist < 1e-8) axis.set(0, 1, 0);
  else axis.multiplyScalar(1 / dist);
  dist = reach;

  const cosA = (len1 * len1 + dist * dist - len2 * len2) / (2 * len1 * dist);
  const along = Math.min(1, Math.max(-1, cosA)) * len1;
  const height = Math.sqrt(Math.max(0, len1 * len1 - along * along));
  out.copy(root).addScaledVector(axis, along);

  const side = new Vector3().subVectors(pole, root);
  side.addScaledVector(axis, -side.dot(axis));
  if (side.lengthSq() < 1e-8) {
    side.set(0, 0, 1).addScaledVector(axis, -axis.z);
    if (side.lengthSq() < 1e-8) side.set(0, 1, 0).addScaledVector(axis, -axis.y);
  }
  side.normalize();
  out.addScaledVector(side, height);
  return out;
}

function boneLength(seg: Segment): number {
  return Math.hypot(seg.tail.x - seg.head.x, seg.tail.y - seg.head.y, seg.tail.z - seg.head.z);
}

/**
 * Aim `bone` so its rest axis points along `worldDir`, keeping the twist it
 * already had. Preserving twist means enabling IK on an unchanged pose does
 * not spin the chest or the palms.
 */
function aim(bone: Bone, restDir: Vector3, worldDir: Vector3) {
  const parent = bone.parent;
  _inv.identity();
  if (parent) parent.getWorldQuaternion(_inv).invert();
  _to.copy(worldDir).normalize().applyQuaternion(_inv);
  _from.copy(restDir).normalize();
  if (_to.lengthSq() < 1e-10 || _from.lengthSq() < 1e-10) return;
  if (_from.dot(_to) < -0.999) {
    // 180° flip: pick a stable axis perpendicular to the rest direction.
    const axis = Math.abs(_from.y) < 0.9 ? new Vector3(0, 1, 0) : new Vector3(1, 0, 0);
    axis.cross(_from).normalize();
    _align.setFromAxisAngle(axis, Math.PI);
  } else {
    _align.setFromUnitVectors(_from, _to);
  }
  const currentDir = _from.clone().applyQuaternion(bone.quaternion);
  if (currentDir.lengthSq() < 1e-10) {
    bone.quaternion.copy(_align);
    return;
  }
  currentDir.normalize();
  if (_from.dot(currentDir) < -0.999) {
    bone.quaternion.copy(_align);
    return;
  }
  _swing.setFromUnitVectors(_from, currentDir);
  _twist.copy(_swing).invert().multiply(bone.quaternion);
  bone.quaternion.copy(_align).multiply(_twist);
}

function aimTwo(
  upper: Bone,
  lower: Bone,
  upperRest: Vector3,
  lowerRest: Vector3,
  root: Vector3,
  mid: Vector3,
  end: Vector3,
) {
  aim(upper, upperRest, new Vector3().subVectors(mid, root));
  upper.updateWorldMatrix(true, false);
  aim(lower, lowerRest, new Vector3().subVectors(end, mid));
  lower.updateWorldMatrix(true, false);
}

function asVec(v: Vec3): Vector3 {
  return new Vector3(v.x, v.y, v.z);
}

function restVec(seg: Segment): Vector3 {
  const d = restDirection(seg);
  return new Vector3(d.x, d.y, d.z);
}

/**
 * FABRIK. `lengths[i]` joins point i to i+1. Point 0 is pinned.
 * Used for the spine / neck chain (more than two bones).
 */
export function fabrik(points: Vector3[], lengths: number[], target: Vector3, iterations = 8): Vector3[] {
  const p = points.map((v) => v.clone());
  const origin = p[0].clone();
  const n = p.length;
  for (let it = 0; it < iterations; it++) {
    p[n - 1].copy(target);
    for (let i = n - 2; i >= 0; i--) {
      const dir = p[i].clone().sub(p[i + 1]);
      const d = dir.length() || 1e-6;
      dir.multiplyScalar(lengths[i] / d);
      p[i].copy(p[i + 1]).add(dir);
    }
    p[0].copy(origin);
    for (let i = 0; i < n - 1; i++) {
      const dir = p[i + 1].clone().sub(p[i]);
      const d = dir.length() || 1e-6;
      dir.multiplyScalar(lengths[i] / d);
      p[i + 1].copy(p[i]).add(dir);
    }
  }
  return p;
}

/**
 * Targets are in the skinned mesh's local space (figure space).
 * Elbows bend toward figure −Z (behind), knees toward +Z (forward).
 */
export function solveIk(bones: Map<string, Bone>, segments: Map<string, Segment>, targets: IkTargets, mesh: Object3D) {
  mesh.updateWorldMatrix(true, true);
  solveSpine(bones, segments, targets.head, mesh);
  mesh.updateWorldMatrix(true, true);
  solveLimb(bones, segments, "upperArm.L", "lowerArm.L", targets.handL, new Vector3(0, -0.25, -1), mesh);
  solveLimb(bones, segments, "upperArm.R", "lowerArm.R", targets.handR, new Vector3(0, -0.25, -1), mesh);
  solveLimb(bones, segments, "upperLeg.L", "lowerLeg.L", targets.footL, new Vector3(0, -0.15, 1), mesh);
  solveLimb(bones, segments, "upperLeg.R", "lowerLeg.R", targets.footR, new Vector3(0, -0.15, 1), mesh);
  mesh.updateWorldMatrix(true, true);
}

function solveLimb(
  bones: Map<string, Bone>,
  segments: Map<string, Segment>,
  upperName: string,
  lowerName: string,
  targetLocal: Vec3,
  poleOffset: Vector3,
  mesh: Object3D,
) {
  const upper = bones.get(upperName);
  const lower = bones.get(lowerName);
  const su = segments.get(upperName);
  const sl = segments.get(lowerName);
  if (!upper || !lower || !su || !sl) return;
  upper.updateWorldMatrix(true, false);
  const rootPos = new Vector3();
  upper.getWorldPosition(rootPos);
  const localRoot = mesh.worldToLocal(rootPos.clone());
  const pole = mesh.localToWorld(localRoot.add(poleOffset));
  const target = mesh.localToWorld(asVec(targetLocal));
  const len1 = Math.max(1e-4, boneLength(su));
  const len2 = Math.max(1e-4, boneLength(sl));
  const axis = new Vector3().subVectors(target, rootPos);
  let dist = axis.length() || 1e-6;
  const reach = Math.min(Math.max(dist, Math.abs(len1 - len2) + 1e-4), len1 + len2 - 1e-4);
  const clamped = rootPos.clone().add(axis.multiplyScalar(reach / dist));
  const mid = solveElbow(rootPos, clamped, len1, len2, pole, new Vector3());
  aimTwo(upper, lower, restVec(su), restVec(sl), rootPos, mid, clamped);
}

function solveSpine(bones: Map<string, Bone>, segments: Map<string, Segment>, headTarget: Vec3, mesh: Object3D) {
  const names = ["spine", "abdomen", "chest", "neck", "head"] as const;
  const joints: Bone[] = [];
  const segs: Segment[] = [];
  for (const n of names) {
    const b = bones.get(n);
    const s = segments.get(n);
    if (!b || !s) return;
    joints.push(b);
    segs.push(s);
  }
  const lengths = segs.slice(0, -1).map((s) => boneLength(s));
  joints[0].updateWorldMatrix(true, false);
  const points = [new Vector3()];
  joints[0].getWorldPosition(points[0]);
  for (let i = 1; i < joints.length; i++) {
    const p = new Vector3();
    joints[i].getWorldPosition(p);
    if (p.distanceTo(points[i - 1]) < 1e-4) p.copy(points[i - 1]).add(new Vector3(0, lengths[i - 1], 0));
    points.push(p);
  }
  const goal = mesh.localToWorld(asVec(headTarget));
  const solved = fabrik(points, lengths, goal, 8);
  for (let i = 0; i < joints.length - 1; i++) {
    const dir = new Vector3().subVectors(solved[i + 1], solved[i]);
    aim(joints[i], restVec(segs[i]), dir);
    joints[i].updateWorldMatrix(true, true);
  }
}
