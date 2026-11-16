/** Framebuffer is tone-mapped linear. PNG bytes need the sRGB curve. */
export function linearRgbToSrgb(rgb: Uint8Array): Uint8Array {
  const out = new Uint8Array(rgb.length);
  for (let i = 0; i < rgb.length; i++) {
    const x = rgb[i] / 255;
    const y = x <= 0.0031308 ? x * 12.92 : 1.055 * Math.pow(x, 1 / 2.4) - 0.055;
    out[i] = Math.round(Math.min(1, Math.max(0, y)) * 255);
  }
  return out;
}

/** 8-bit RGB PNG (color type 2, no alpha). Stored zlib blocks — no compression library. */

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buf: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function adler32(data: Uint8Array): number {
  let a = 1;
  let b = 0;
  const MOD = 65521;
  for (let i = 0; i < data.length; i++) {
    a += data[i];
    b += a;
    if ((i & 0xfff) === 0) {
      a %= MOD;
      b %= MOD;
    }
  }
  a %= MOD;
  b %= MOD;
  return ((b << 16) | a) >>> 0;
}

function u32(n: number): Uint8Array {
  return new Uint8Array([(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255]);
}

function chunk(type: string, data: Uint8Array): Uint8Array {
  const t = new Uint8Array(4);
  for (let i = 0; i < 4; i++) t[i] = type.charCodeAt(i);
  const body = new Uint8Array(4 + data.length);
  body.set(t, 0);
  body.set(data, 4);
  const crc = crc32(body);
  const out = new Uint8Array(8 + data.length + 4);
  out.set(u32(data.length), 0);
  out.set(body, 4);
  out.set(u32(crc), 4 + body.length);
  return out;
}

function zlibStore(data: Uint8Array): Uint8Array {
  const parts: Uint8Array[] = [new Uint8Array([0x78, 0x01])];
  const max = 65535;
  for (let i = 0; i < data.length || (i === 0 && data.length === 0); i += max) {
    const end = Math.min(data.length, i + max);
    const len = end - i;
    const last = end >= data.length;
    const block = new Uint8Array(5 + len);
    block[0] = last ? 1 : 0;
    block[1] = len & 255;
    block[2] = (len >> 8) & 255;
    const nlen = len ^ 0xffff;
    block[3] = nlen & 255;
    block[4] = (nlen >> 8) & 255;
    block.set(data.subarray(i, end), 5);
    parts.push(block);
    if (data.length === 0) break;
  }
  const sum = adler32(data);
  parts.push(u32(sum));
  let n = 0;
  for (const p of parts) n += p.length;
  const out = new Uint8Array(n);
  let o = 0;
  for (const p of parts) {
    out.set(p, o);
    o += p.length;
  }
  return out;
}

/** `rgb` is row-major, tightly packed, length width*height*3, top row first. */
export function encodePngRGB(width: number, height: number, rgb: Uint8Array): Uint8Array {
  if (rgb.length !== width * height * 3) {
    throw new Error(`RGB buffer length ${rgb.length} != ${width}*${height}*3`);
  }
  const stride = width * 3;
  const raw = new Uint8Array((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    const dst = y * (stride + 1);
    raw[dst] = 0;
    raw.set(rgb.subarray(y * stride, y * stride + stride), dst + 1);
  }
  const ihdr = new Uint8Array(13);
  ihdr.set(u32(width), 0);
  ihdr.set(u32(height), 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // color type RGB
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  const sig = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
  const parts = [sig, chunk("IHDR", ihdr), chunk("IDAT", zlibStore(raw)), chunk("IEND", new Uint8Array())];
  let n = 0;
  for (const p of parts) n += p.length;
  const out = new Uint8Array(n);
  let o = 0;
  for (const p of parts) {
    out.set(p, o);
    o += p.length;
  }
  return out;
}

export function pngBlob(width: number, height: number, rgb: Uint8Array): Blob {
  const bytes = encodePngRGB(width, height, rgb);
  return new Blob([bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer], {
    type: "image/png",
  });
}

/** Drop alpha and, for WebGL readbacks, flip bottom-up rows. */
export function rgbaToRgb(src: Uint8Array, width: number, height: number, flipY: boolean): Uint8Array {
  const rgb = new Uint8Array(width * height * 3);
  for (let y = 0; y < height; y++) {
    const sy = flipY ? height - 1 - y : y;
    for (let x = 0; x < width; x++) {
      const i = (sy * width + x) * 4;
      const o = (y * width + x) * 3;
      rgb[o] = src[i];
      rgb[o + 1] = src[i + 1];
      rgb[o + 2] = src[i + 2];
    }
  }
  return rgb;
}

export function canvasToRgb(canvas: HTMLCanvasElement | OffscreenCanvas): Uint8Array {
  const w = canvas.width;
  const h = canvas.height;
  const ctx = (canvas as HTMLCanvasElement).getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("2D canvas unavailable");
  const img = ctx.getImageData(0, 0, w, h);
  return rgbaToRgb(new Uint8Array(img.data), w, h, false);
}
