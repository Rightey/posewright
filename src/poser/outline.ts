/** Stroke width for anima_3dpose_outline_7000: 4px at a 768px short side. */
export function animaStrokePx(width: number, height: number): number {
  return Math.max(1, Math.round((4 * Math.min(width, height)) / 768));
}

/**
 * Complementary silhouette and overlap strokes on a shaded body plate.
 * color, depth, and mask are packed RGB, top-left origin, same size.
 * A stroke is not drawn where the body is cut by the image border.
 */
export function animaOutline(
  color: Uint8Array,
  depth: Uint8Array,
  mask: Uint8Array,
  width: number,
  height: number,
): Uint8Array {
  const stroke = animaStrokePx(width, height);
  const rad = Math.max(0, Math.round((stroke - 1) / 2));
  const n = width * height;
  const inside = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    const o = i * 3;
    inside[i] = mask[o] + mask[o + 1] + mask[o + 2] > 18 ? 1 : 0;
  }
  const edge = new Uint8Array(n);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      if (!inside[i]) continue;
      const mo = i * 3;
      for (const [nx, ny] of [
        [x - 1, y],
        [x + 1, y],
        [x, y - 1],
        [x, y + 1],
      ]) {
        if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
        const j = ny * width + nx;
        const jo = j * 3;
        const maskJump =
          Math.abs(mask[mo] - mask[jo]) + Math.abs(mask[mo + 1] - mask[jo + 1]) + Math.abs(mask[mo + 2] - mask[jo + 2]);
        if (!inside[j] || maskJump > 36 || Math.abs(depth[mo] - depth[jo]) > 22) {
          edge[i] = 1;
          break;
        }
      }
    }
  }
  const out = color.slice();
  const paint = (dest: number, src: number) => {
    const s = src * 3;
    const d = dest * 3;
    out[d] = 255 - color[s];
    out[d + 1] = 255 - color[s + 1];
    out[d + 2] = 255 - color[s + 2];
  };
  if (rad === 0) {
    for (let i = 0; i < n; i++) if (edge[i]) paint(i, i);
    return out;
  }
  const r2 = rad * rad;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      if (!edge[i]) continue;
      for (let dy = -rad; dy <= rad; dy++) {
        const yy = y + dy;
        if (yy < 0 || yy >= height) continue;
        for (let dx = -rad; dx <= rad; dx++) {
          if (dx * dx + dy * dy > r2) continue;
          const xx = x + dx;
          if (xx < 0 || xx >= width) continue;
          paint(yy * width + xx, i);
        }
      }
    }
  }
  return out;
}
