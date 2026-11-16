/** Store-only ZIP (method 0). Enough for a handful of PNGs, no extra dependency. */

function crc32(buf: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  return (c ^ 0xffffffff) >>> 0;
}

function u16(n: number): number[] {
  return [n & 255, (n >> 8) & 255];
}
function u32(n: number): number[] {
  return [n & 255, (n >> 8) & 255, (n >> 16) & 255, (n >> 24) & 255];
}

export type ZipItem = { name: string; data: Uint8Array };

export function encodeZip(items: ZipItem[]): Uint8Array {
  const local: Uint8Array[] = [];
  const central: number[] = [];
  let offset = 0;
  for (const item of items) {
    const name = new TextEncoder().encode(item.name);
    const crc = crc32(item.data);
    const localHdr = [
      ...u32(0x04034b50),
      ...u16(20),
      ...u16(0),
      ...u16(0), // store
      ...u16(0),
      ...u16(0),
      ...u32(crc),
      ...u32(item.data.length),
      ...u32(item.data.length),
      ...u16(name.length),
      ...u16(0),
    ];
    const localBytes = new Uint8Array(localHdr.length + name.length + item.data.length);
    localBytes.set(localHdr, 0);
    localBytes.set(name, localHdr.length);
    localBytes.set(item.data, localHdr.length + name.length);
    local.push(localBytes);

    const centralHdr = [
      ...u32(0x02014b50),
      ...u16(20),
      ...u16(20),
      ...u16(0),
      ...u16(0),
      ...u16(0),
      ...u16(0),
      ...u32(crc),
      ...u32(item.data.length),
      ...u32(item.data.length),
      ...u16(name.length),
      ...u16(0),
      ...u16(0),
      ...u16(0),
      ...u16(0),
      ...u32(0),
      ...u32(offset),
      ...Array.from(name),
    ];
    central.push(...centralHdr);
    offset += localBytes.length;
  }
  const centralBytes = new Uint8Array(central);
  const end = [
    ...u32(0x06054b50),
    ...u16(0),
    ...u16(0),
    ...u16(items.length),
    ...u16(items.length),
    ...u32(centralBytes.length),
    ...u32(offset),
    ...u16(0),
  ];
  let n = centralBytes.length + end.length;
  for (const p of local) n += p.length;
  const out = new Uint8Array(n);
  let o = 0;
  for (const p of local) {
    out.set(p, o);
    o += p.length;
  }
  out.set(centralBytes, o);
  o += centralBytes.length;
  out.set(end, o);
  return out;
}

export function zipBlob(items: ZipItem[]): Blob {
  const bytes = encodeZip(items);
  return new Blob([bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer], {
    type: "application/zip",
  });
}
