import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const KAGGLE_DIR = path.join(ROOT, 'scripts/data/kaggle');
const OUT_DIR = path.join(ROOT, 'public/signs/words');

// Maps WL-BISINDO label ID -> clean filename in public/signs/words/
const LABEL_TO_FILENAME = {
  0: 'air',
  1: 'belajar',
  2: 'cari',
  3: 'hari',
  4: 'ingat',
  5: 'lagi',
  6: 'maaf',
  7: 'makan',
  8: 'motor',
  9: 'saya',
  10: 'terima',
  11: 'tuli',
  12: 'apa',
  13: 'siapa',
  14: 'kapan',
  15: 'dimana',
  16: 'mengapa',
  17: 'bagaimana',
  18: 'merah',
  19: 'kuning',
  20: 'hijau',
  21: 'hitam',
  22: 'dengar',
  23: 'berangkat',
  24: 'datang',
  25: 'teman',
  26: 'keluarga',
  27: 'rumah',
  28: 'pagi',
  29: 'siang',
  30: 'sore',
  31: 'malam',
};

fs.mkdirSync(OUT_DIR, { recursive: true });
const allFiles = fs.readdirSync(KAGGLE_DIR);

let copied = 0;
let totalBytes = 0;

for (const [labelId, slug] of Object.entries(LABEL_TO_FILENAME)) {
  const re = new RegExp(`^signer\\d+_label${labelId}_sample1\\.mp4$`, 'i');
  const candidates = allFiles
    .filter((f) => re.test(f))
    .map((f) => ({
      name: f,
      size: fs.statSync(path.join(KAGGLE_DIR, f)).size,
    }))
    .sort((a, b) => a.size - b.size);

  if (candidates.length === 0) continue;
  const pick = candidates[0];
  const dest = path.join(OUT_DIR, `${slug}.mp4`);
  fs.copyFileSync(path.join(KAGGLE_DIR, pick.name), dest);
  copied++;
  totalBytes += pick.size;
}

console.log(
  `[videos] Copied ${copied} real BISINDO demo videos (${(totalBytes / 1024 / 1024).toFixed(2)} MB) to public/signs/words/`
);
