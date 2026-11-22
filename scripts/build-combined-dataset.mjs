import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { normalizeLandmarks } from '../src/content/detector.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SIBI_CSV = path.join(ROOT, 'scripts/data/hands_SIBI_training.csv');
const OUTPUT_JSON = path.join(ROOT, 'public/models/default-dataset.json');

/**
 * Builds the combined default dataset (datasetVersion: 3):
 * 1. All 272 SIBI A-Z letter samples from hands_SIBI_training.csv
 * 2. Up to 18 representative center-frame samples per WL-BISINDO word if already extracted
 */
function buildCombinedDataset() {
  const samples = [];

  // 1. Load existing WL-BISINDO word samples (if present in default-dataset.json)
  if (fs.existsSync(OUTPUT_JSON)) {
    try {
      const existing = JSON.parse(fs.readFileSync(OUTPUT_JSON, 'utf8'));
      const wordCounts = {};
      for (const item of existing.samples || []) {
        if (!item?.label || item.label.length <= 1) continue;
        wordCounts[item.label] = (wordCounts[item.label] || 0) + 1;
        // Keep up to 16 clean samples per word so letters & words stay balanced
        if (wordCounts[item.label] <= 16) {
          samples.push({ label: item.label, vector: item.vector });
        }
      }
    } catch {
      // Ignore parse errors
    }
  }

  const wordSampleCount = samples.length;

  // 2. Load SIBI A-Z alphabet samples from hands_SIBI_training.csv
  if (fs.existsSync(SIBI_CSV)) {
    const raw = fs.readFileSync(SIBI_CSV, 'utf8').trim();
    const lines = raw.split(/\r?\n/).filter(Boolean);
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
      if (vector) {
        samples.push({ label, vector });
      }
    }
  }

  const letterSampleCount = samples.length - wordSampleCount;
  const labels = new Set(samples.map((s) => s.label));

  const payload = {
    version: 1,
    datasetVersion: 3,
    source: 'Combined SIBI A-Z (272 samples) + WL-BISINDO (32 words)',
    updatedAt: new Date().toISOString(),
    samples,
  };

  fs.mkdirSync(path.dirname(OUTPUT_JSON), { recursive: true });
  fs.writeFileSync(OUTPUT_JSON, JSON.stringify(payload), 'utf8');
  console.log(
    `[dataset] Built combined default-dataset.json (v3): ${letterSampleCount} A-Z letter samples + ${wordSampleCount} word samples = ${samples.length} total samples across ${labels.size} labels.`
  );
}

buildCombinedDataset();
