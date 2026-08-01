import { deflateSync } from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const SIZE = 48;
const SS = 4;

const COLORS = {
  cream: [245, 240, 232],
  body: [239, 232, 220],
  crimson: [185, 28, 28],
  ink: [58, 44, 27],
  gold: [202, 138, 4],
};

function sdRoundRect(px, py, x0, y0, x1, y1, r) {
  const qx = Math.abs(px - (x0 + x1) / 2) - (x1 - x0) / 2 + r;
  const qy = Math.abs(py - (y0 + y1) / 2) - (y1 - y0) / 2 + r;
  return Math.min(Math.max(qx, qy), 0) + Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) - r;
}

function sdSegment(px, py, ax, ay, bx, by) {
  const abx = bx - ax;
  const aby = by - ay;
  const len2 = abx * abx + aby * aby;
  const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, ((px - ax) * abx + (py - ay) * aby) / len2));
  return Math.hypot(px - (ax + abx * t), py - (ay + aby * t));
}

function bezierPoints(p0, p1, p2, p3, steps = 48) {
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const u = 1 - t;
    const x = u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0];
    const y = u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1];
    pts.push([x, y]);
  }
  return pts;
}

function distToPolyline(px, py, pts) {
  let best = Infinity;
  for (let i = 0; i < pts.length - 1; i++) {
    best = Math.min(best, sdSegment(px, py, pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1]));
  }
  return best;
}

const BODY = { x0: 10, y0: 16, x1: 38, y1: 38, r: 2 };
const COVER = { x0: 10, y0: 14, x1: 38, y1: 18, r: 2 };

const TEXT_LINES = [
  [16, 22, 32, 22],
  [16, 27, 28, 27],
  [16, 32, 24, 32],
];

const QUILL = bezierPoints([34, 10], [32, 12], [31.5, 15], [31.5, 17]).concat(
  bezierPoints([31.5, 17], [32.5, 20.5], [34, 21], [34, 21]).slice(1),
);

function shapeFor(px, py, maskable, scale, ox, oy) {
  const sx = ox + (px - SIZE / 2) * scale;
  const sy = oy + (py - SIZE / 2) * scale;

  const bodySd = sdRoundRect(sx, sy, BODY.x0, BODY.y0, BODY.x1, BODY.y1, BODY.r);
  const coverSd = sdRoundRect(sx, sy, COVER.x0, COVER.y0, COVER.x1, COVER.y1, COVER.r);

  const bgSd = maskable
    ? -1
    : sdRoundRect(sx, sy, 0, 0, SIZE, SIZE, 8);

  if (bgSd <= 0) return COLORS.cream;
  if (coverSd <= 0) return COLORS.crimson;
  if (Math.abs(bodySd) <= 1.4 / 2) return COLORS.crimson;
  if (bodySd <= 0) return COLORS.body;
  for (const [ax, ay, bx, by] of TEXT_LINES) {
    if (sdSegment(sx, sy, ax, ay, bx, by) <= 0.7) return COLORS.ink;
  }
  if (distToPolyline(sx, sy, QUILL) <= 0.75) return COLORS.crimson;
  if (Math.hypot(sx - 34, sy - 10) <= 2.5) return COLORS.gold;
  return null;
}

function render(size, maskable) {
  const scale = 1;
  const ox = 0;
  const oy = 0;
  const contentScale = maskable ? 0.66 : 1;
  const pixels = Buffer.alloc(size * size * 4);

  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      let r = 0;
      let g = 0;
      let b = 0;
      let count = 0;
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const u = (px + (sx + 0.5) / SS) / size * SIZE;
          const v = (py + (sy + 0.5) / SS) / size * SIZE;
          const color = shapeFor(u, v, maskable, contentScale, ox, oy);
          if (color) {
            r += color[0];
            g += color[1];
            b += color[2];
            count++;
          }
        }
      }
      const i = (py * size + px) * 4;
      if (count === 0) {
        pixels[i + 3] = 0;
        continue;
      }
      pixels[i] = Math.round(r / count);
      pixels[i + 1] = Math.round(g / count);
      pixels[i + 2] = Math.round(b / count);
      pixels[i + 3] = 255;
    }
  }
  return pixels;
}

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const typeBuf = Buffer.from(type, 'ascii');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])));
  return Buffer.concat([len, typeBuf, data, crc]);
}

function encodePng(pixels, size) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const raw = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0;
    pixels.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4);
  }

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const outDir = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'public', 'icons');
mkdirSync(outDir, { recursive: true });

const targets = [
  { file: 'icon-192.png', size: 192, maskable: false },
  { file: 'icon-512.png', size: 512, maskable: false },
  { file: 'maskable-512.png', size: 512, maskable: true },
  { file: 'apple-touch-icon-180.png', size: 180, maskable: false },
];

for (const t of targets) {
  const path = join(outDir, t.file);
  writeFileSync(path, encodePng(render(t.size, t.maskable), t.size));
  console.log(`wrote ${path}`);
}
