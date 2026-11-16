import { PerspectiveCamera, Vector3 } from "three";

export type Pixel = { x: number; y: number; behind: boolean };

/**
 * Project a world-space point with the same math Three.js uses for `project()`:
 * world → camera (camera looks down its local −Z) → NDC → pixels with Y down.
 * A point is behind the camera when its camera-space Z is ≥ 0 (on the camera
 * plane or further back). Those keypoints are omitted from the OpenPose image.
 */
export function projectToPixel(
  point: Vector3,
  camera: PerspectiveCamera,
  width: number,
  height: number,
): Pixel {
  camera.updateMatrixWorld();
  const camSpace = point.clone().applyMatrix4(camera.matrixWorldInverse);
  const behind = camSpace.z >= -1e-4;
  const ndc = point.clone().project(camera);
  return {
    x: (ndc.x * 0.5 + 0.5) * width,
    y: (1 - (ndc.y * 0.5 + 0.5)) * height,
    behind,
  };
}

export function insideFrame(p: Pixel, width: number, height: number, margin = 0): boolean {
  return p.x >= -margin && p.y >= -margin && p.x <= width + margin && p.y <= height + margin;
}
