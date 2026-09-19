#!/usr/bin/env node
/**
 * Trim the client logo PNGs to their ink: drop transparent AND near-white padding, add a 2 px margin, write to
 * public/clients/trimmed/. The sources are inconsistent in padding, weight and resolution (CLIENT-QUESTIONS.md
 * Q17); trimming gives object-contain a comparable optical box for each. Pure Node, no dependencies.
 *
 *   node scripts/trim-logos.mjs
 */
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

const SRC = "public/clients";
const OUT = "public/clients/trimmed";
fs.mkdirSync(OUT, { recursive: true });

// --- minimal PNG decode (8-bit RGB/RGBA/gray, non-interlaced) -------------------------------------------
function decode(buf) {
  let off = 8, w, h, colorType, idat = [];
  while (off < buf.length) {
    const len = buf.readUInt32BE(off), type = buf.toString("ascii", off + 4, off + 8);
    const data = buf.subarray(off + 8, off + 8 + len);
    if (type === "IHDR") { w = data.readUInt32BE(0); h = data.readUInt32BE(4); if (data[8] !== 8 || data[12] !== 0) throw new Error("unsupported PNG"); colorType = data[9]; }
    if (type === "IDAT") idat.push(data);
    off += 12 + len;
  }
  const bpp = { 0: 1, 2: 3, 4: 2, 6: 4 }[colorType];
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const stride = w * bpp;
  const px = new Uint8Array(w * h * 4);
  let prev = Buffer.alloc(stride);
  for (let y = 0; y < h; y++) {
    const f = raw[y * (stride + 1)];
    const line = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    const cur = Buffer.alloc(stride);
    for (let i = 0; i < stride; i++) {
      const a = i >= bpp ? cur[i - bpp] : 0, b = prev[i], c = i >= bpp ? prev[i - bpp] : 0;
      let x = line[i];
      if (f === 1) x += a; else if (f === 2) x += b; else if (f === 3) x += (a + b) >> 1;
      else if (f === 4) { const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c); x += pa <= pb && pa <= pc ? a : pb <= pc ? b : c; }
      cur[i] = x & 255;
    }
    for (let x = 0; x < w; x++) {
      const o = (y * w + x) * 4, s = x * bpp;
      if (colorType === 6) { px[o] = cur[s]; px[o + 1] = cur[s + 1]; px[o + 2] = cur[s + 2]; px[o + 3] = cur[s + 3]; }
      else if (colorType === 2) { px[o] = cur[s]; px[o + 1] = cur[s + 1]; px[o + 2] = cur[s + 2]; px[o + 3] = 255; }
      else if (colorType === 4) { px[o] = px[o + 1] = px[o + 2] = cur[s]; px[o + 3] = cur[s + 1]; }
      else { px[o] = px[o + 1] = px[o + 2] = cur[s]; px[o + 3] = 255; }
    }
    prev = cur;
  }
  return { w, h, px };
}

// --- minimal PNG encode (RGBA, filter 0) --------------------------------------------------------------------
const CRC = new Int32Array(256);
for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; CRC[n] = c; }
function crc32(b) { let c = -1; for (let i = 0; i < b.length; i++) c = CRC[(c ^ b[i]) & 255] ^ (c >>> 8); return (c ^ -1) >>> 0; }
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}
function encode(w, h, px) {
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 6;
  const raw = Buffer.alloc((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) { raw[y * (w * 4 + 1)] = 0; Buffer.from(px.buffer, px.byteOffset + y * w * 4, w * 4).copy(raw, y * (w * 4 + 1) + 1); }
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", ihdr), chunk("IDAT", zlib.deflateSync(raw, { level: 9 })), chunk("IEND", Buffer.alloc(0))]);
}

const ink = (px, o) => px[o + 3] > 24 && !(px[o] > 240 && px[o + 1] > 240 && px[o + 2] > 240);

for (const file of fs.readdirSync(SRC).filter((f) => f.endsWith(".png"))) {
  const { w, h, px } = decode(fs.readFileSync(path.join(SRC, file)));
  let x0 = w, y0 = h, x1 = -1, y1 = -1;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (ink(px, (y * w + x) * 4)) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
  if (x1 < 0) { console.log(file, "no ink"); continue; }
  const pad = 2;
  x0 = Math.max(0, x0 - pad); y0 = Math.max(0, y0 - pad); x1 = Math.min(w - 1, x1 + pad); y1 = Math.min(h - 1, y1 + pad);
  const cw = x1 - x0 + 1, ch = y1 - y0 + 1;
  const out = new Uint8Array(cw * ch * 4);
  for (let y = 0; y < ch; y++) for (let x = 0; x < cw; x++) {
    const s = ((y + y0) * w + (x + x0)) * 4, o = (y * cw + x) * 4;
    // white background → transparent, so the silhouette treatment sees only ink
    const white = px[s] > 240 && px[s + 1] > 240 && px[s + 2] > 240;
    out[o] = px[s]; out[o + 1] = px[s + 1]; out[o + 2] = px[s + 2]; out[o + 3] = white ? 0 : px[s + 3];
  }
  fs.writeFileSync(path.join(OUT, file), encode(cw, ch, out));
  console.log(`${file.padEnd(20)} ${w}x${h} → ${cw}x${ch}  aspect ${(cw / ch).toFixed(2)}`);
}
