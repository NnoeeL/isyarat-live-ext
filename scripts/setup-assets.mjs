import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT, 'public');
const WASM_DEST = path.join(PUBLIC_DIR, 'wasm');
const MODELS_DEST = path.join(PUBLIC_DIR, 'models');
const SIGNS_DEST = path.join(PUBLIC_DIR, 'signs');
const ICONS_DEST = path.join(PUBLIC_DIR, 'icons');

const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';

// Finger states per SIBI/BISINDO alphabet letter: [thumb, index, middle, ring, pinky]
// 1 = extended, 0.5 = curved/bent, 0 = folded
const ALPHABET_POSTURES = {
  a: { fingers: [1, 0, 0, 0, 0], hint: 'Kepal, ibu jari di sisi' },
  b: { fingers: [0, 1, 1, 1, 1], hint: '4 jari tegak, ibu jari lipat' },
  c: { fingers: [0.5, 0.5, 0.5, 0.5, 0.5], hint: 'Tangan melengkung bentuk C' },
  d: { fingers: [0.5, 1, 0, 0, 0], hint: 'Telunjuk tegak, jari lain melingkar' },
  e: { fingers: [0, 0.5, 0.5, 0.5, 0.5], hint: 'Ujung jari menekuk ke telapak' },
  f: { fingers: [0.5, 0.5, 1, 1, 1], hint: 'Ibu jari & telunjuk bertemu, 3 tegak' },
  g: { fingers: [0.5, 1, 0, 0, 0], hint: 'Telunjuk & ibu jari sejajar ke samping' },
  h: { fingers: [0, 1, 1, 0, 0], hint: 'Telunjuk & tengah lurus ke samping' },
  i: { fingers: [0, 0, 0, 0, 1], hint: 'Kelingking tegak, jari lain kepal' },
  j: { fingers: [0, 0, 0, 0, 1], hint: 'Kelingking tegak lalu lengkungkan J' },
  k: { fingers: [0.5, 1, 1, 0, 0], hint: 'Telunjuk & tengah V, ibu jari di tengah' },
  l: { fingers: [1, 1, 0, 0, 0], hint: 'Ibu jari & telunjuk bentuk L' },
  m: { fingers: [0, 0.5, 0.5, 0.5, 0], hint: '3 jari menutupi ibu jari' },
  n: { fingers: [0, 0.5, 0.5, 0, 0], hint: '2 jari menutupi ibu jari' },
  o: { fingers: [0.5, 0.5, 0.5, 0.5, 0.5], hint: 'Semua ujung jari bertemu bentuk O' },
  p: { fingers: [0.5, 1, 0.5, 0, 0], hint: 'Seperti K mengarah ke bawah' },
  q: { fingers: [0.5, 0.5, 0, 0, 0], hint: 'Seperti G mengarah ke bawah' },
  r: { fingers: [0, 1, 1, 0, 0], hint: 'Telunjuk & jari tengah menyilang' },
  s: { fingers: [0.5, 0, 0, 0, 0], hint: 'Kepalan erat, ibu jari di depan' },
  t: { fingers: [0.5, 0.5, 0, 0, 0], hint: 'Ibu jari diselipkan di bawah telunjuk' },
  u: { fingers: [0, 1, 1, 0, 0], hint: 'Telunjuk & tengah rapat tegak' },
  v: { fingers: [0, 1, 1, 0, 0], hint: 'Telunjuk & tengah terbuka bentuk V' },
  w: { fingers: [0, 1, 1, 1, 0], hint: '3 jari tengah terbuka bentuk W' },
  x: { fingers: [0, 0.5, 0, 0, 0], hint: 'Telunjuk melengkung seperti kait' },
  y: { fingers: [1, 0, 0, 0, 1], hint: 'Ibu jari & kelingking terbuka' },
  z: { fingers: [0, 1, 0, 0, 0], hint: 'Telunjuk menggambar huruf Z di udara' },
};

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function generateSignSVGs() {
  ensureDir(SIGNS_DEST);
  for (const [letter, info] of Object.entries(ALPHABET_POSTURES)) {
    const [thumb, idx, mid, ring, pinky] = info.fingers;
    const fingerHeight = (v) => (v === 1 ? 38 : v === 0.5 ? 22 : 10);
    const fingerColor = (v) => (v === 1 ? '#34d399' : v === 0.5 ? '#38bdf8' : '#475569');

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>
  </defs>
  <rect width="120" height="120" rx="20" fill="url(#bg)" stroke="#334155" stroke-width="2"/>
  <rect x="8" y="8" width="28" height="28" rx="8" fill="#10b981"/>
  <text x="22" y="27" text-anchor="middle" font-family="system-ui,sans-serif" font-size="16" font-weight="800" fill="#022c22">${letter.toUpperCase()}</text>
  <!-- Stylized hand posture -->
  <g transform="translate(22, 16)">
    <!-- Thumb -->
    <rect x="${thumb === 1 ? 4 : 12}" y="${thumb === 1 ? 48 : 56}" width="11" height="${thumb === 1 ? 26 : 16}" rx="5.5" transform="rotate(${thumb === 1 ? -35 : -15} 10 60)" fill="${fingerColor(thumb)}"/>
    <!-- Index -->
    <rect x="20" y="${54 - fingerHeight(idx)}" width="11" height="${fingerHeight(idx)}" rx="5.5" fill="${fingerColor(idx)}"/>
    <!-- Middle -->
    <rect x="34" y="${52 - fingerHeight(mid)}" width="11" height="${fingerHeight(mid)}" rx="5.5" fill="${fingerColor(mid)}"/>
    <!-- Ring -->
    <rect x="48" y="${54 - fingerHeight(ring)}" width="11" height="${fingerHeight(ring)}" rx="5.5" fill="${fingerColor(ring)}"/>
    <!-- Pinky -->
    <rect x="62" y="${58 - fingerHeight(pinky)}" width="10" height="${fingerHeight(pinky)}" rx="5" fill="${fingerColor(pinky)}"/>
    <!-- Palm -->
    <rect x="18" y="50" width="54" height="34" rx="14" fill="#334155" stroke="#64748b" stroke-width="1.5"/>
  </g>
  <text x="60" y="111" text-anchor="middle" font-family="system-ui,sans-serif" font-size="8.5" fill="#94a3b8">${info.hint}</text>
</svg>
`;
    fs.writeFileSync(path.join(SIGNS_DEST, `${letter}.svg`), svg, 'utf8');
  }
  console.log('[setup] Generated 26 A-Z SVG signs in public/signs/');
}

// Pure-Node minimal PNG encoder for extension icons (16, 48, 128)
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) {
      c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
    }
  }
  return (c ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function createIconPNG(size) {
  const raw = Buffer.alloc((size * 4 + 1) * size);
  const cx = size / 2;
  const cy = size / 2;
  const rOuter = size * 0.46;
  const rInner = size * 0.24;

  for (let y = 0; y < size; y++) {
    const rowStart = y * (size * 4 + 1);
    raw[rowStart] = 0; // filter None
    for (let x = 0; x < size; x++) {
      const dx = x + 0.5 - cx;
      const dy = y + 0.5 - cy;
      const dist = Math.hypot(dx, dy);
      const px = rowStart + 1 + x * 4;

      if (dist <= rOuter) {
        // Emerald badge on dark slate circle
        const isAccent = dist <= rInner || (Math.abs(dx) < size * 0.08 && dy < 0 && dist < rOuter * 0.78);
        raw[px] = isAccent ? 52 : 15;
        raw[px + 1] = isAccent ? 211 : 23;
        raw[px + 2] = isAccent ? 153 : 42;
        raw[px + 3] = 255;
      } else {
        raw[px] = 0;
        raw[px + 1] = 0;
        raw[px + 2] = 0;
        raw[px + 3] = 0;
      }
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const compressed = zlib.deflateSync(raw);
  return Buffer.concat([
    signature,
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', compressed),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

function generateIcons() {
  ensureDir(ICONS_DEST);
  for (const size of [16, 48, 128]) {
    fs.writeFileSync(path.join(ICONS_DEST, `icon${size}.png`), createIconPNG(size));
  }
  console.log('[setup] Generated PNG icons (16, 48, 128) in public/icons/');
}

function copyMediaPipeWasm() {
  const srcWasm = path.join(ROOT, 'node_modules', '@mediapipe', 'tasks-vision', 'wasm');
  ensureDir(WASM_DEST);
  if (!fs.existsSync(srcWasm)) {
    console.warn('[setup] node_modules/@mediapipe/tasks-vision/wasm not found. Run npm install first.');
    return;
  }
  const files = fs.readdirSync(srcWasm);
  for (const file of files) {
    fs.copyFileSync(path.join(srcWasm, file), path.join(WASM_DEST, file));
  }
  console.log(`[setup] Copied ${files.length} MediaPipe WASM files to public/wasm/`);
}

async function downloadModel() {
  ensureDir(MODELS_DEST);
  const destFile = path.join(MODELS_DEST, 'hand_landmarker.task');
  if (fs.existsSync(destFile) && fs.statSync(destFile).size > 100_000) {
    console.log('[setup] public/models/hand_landmarker.task already exists.');
    return;
  }
  try {
    console.log('[setup] Downloading hand_landmarker.task (~7.8 MB)...');
    const res = await fetch(MODEL_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buffer = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(destFile, buffer);
    console.log(`[setup] Downloaded hand_landmarker.task (${(buffer.length / 1024 / 1024).toFixed(2)} MB)`);
  } catch (err) {
    console.warn(`[setup] Could not download hand_landmarker.task automatically (${err.message}).`);
    console.warn(`        Download manually from: ${MODEL_URL}`);
    console.warn(`        and save to: public/models/hand_landmarker.task`);
  }
}

async function main() {
  generateSignSVGs();
  generateIcons();
  copyMediaPipeWasm();
  await downloadModel();
}

main();
