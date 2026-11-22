import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { normalizeLandmarks } from '../src/content/detector.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const INPUT_CSV =
  process.argv[2] || path.join(ROOT, 'scripts/data/hands_SIBI_training.csv');
const OUTPUT_JSON =
  process.argv[3] || path.join(ROOT, 'public/models/default-dataset.json');

function convertCsvToDataset(csvPath, outPath) {
  const raw = fs.readFileSync(csvPath, 'utf8').trim();
  const lines = raw.split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) {
    throw new Error('CSV tidak memiliki baris data.');
  }

  const samples = [];
  const labelCounts = {};

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',');
    if (cols.length < 64) continue;

    const label = cols[0].trim().toUpperCase();
    if (!label) continue;

    const landmarks = [];
    let valid = true;
    for (let p = 0; p < 21; p++) {
      const x = Number(cols[1 + p * 3]);
      const y = Number(cols[2 + p * 3]);
      const z = Number(cols[3 + p * 3]);
      if (!Number.isFinite(x) || !Number.isFinite(y)) {
        valid = false;
        break;
      }
      landmarks.push({ x, y, z: Number.isFinite(z) ? z : 0 });
    }

    if (!valid) continue;
    const vector = normalizeLandmarks(landmarks);
    if (!vector) continue;

    samples.push({ label, vector });
    labelCounts[label] = (labelCounts[label] || 0) + 1;
  }

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  const payload = {
    version: 1,
    source: 'AJustiago/SIBI-Recognition (hands_SIBI_training.csv)',
    updatedAt: new Date().toISOString(),
    samples,
  };

  fs.writeFileSync(outPath, JSON.stringify(payload), 'utf8');
  console.log(
    `[convert] Saved ${samples.length} samples across ${Object.keys(labelCounts).length} labels to ${path.relative(ROOT, outPath)}`
  );
}

convertCsvToDataset(INPUT_CSV, OUTPUT_JSON);
