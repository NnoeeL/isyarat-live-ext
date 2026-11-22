import test from 'node:test';
import assert from 'node:assert/strict';

import { normalizeLandmarks, FEATURE_DIMENSION } from '../src/content/detector.js';
import { KNNClassifier, StabilityBuffer } from '../src/content/classifier.js';
import {
  stemIndonesian,
  translateTextToSignSequence,
} from '../src/content/textToSign.js';
import { composeSmartSentence } from '../src/content/sentenceAI.js';

function makeDummyHand(offsetX = 0, offsetY = 0, scale = 1) {
  return Array.from({ length: 21 }, (_, i) => ({
    x: offsetX + i * 0.02 * scale,
    y: offsetY + (i % 5) * 0.03 * scale,
    z: -0.01 * i * scale,
  }));
}

test('normalizeLandmarks returns 63-D translation & scale invariant vector', () => {
  const handA = makeDummyHand(0.1, 0.2, 1.0);
  const handB = makeDummyHand(0.75, 0.65, 2.5);

  const vecA = normalizeLandmarks(handA);
  const vecB = normalizeLandmarks(handB);

  assert.equal(vecA.length, FEATURE_DIMENSION);
  assert.equal(vecA[0], 0);
  assert.equal(vecA[1], 0);
  assert.equal(vecA[2], 0);

  for (let i = 0; i < FEATURE_DIMENSION; i++) {
    assert.ok(
      Math.abs(vecA[i] - vecB[i]) < 1e-4,
      `Mismatch at dim ${i}: ${vecA[i]} vs ${vecB[i]}`
    );
  }

  assert.equal(normalizeLandmarks([]), null);
});

test('KNNClassifier classifies vectors accurately in < 5ms and supports export/import', () => {
  const knn = new KNNClassifier({ k: 3, maxDistance: 1.5, minConfidence: 0.6 });
  const vecA = new Array(63).fill(0).map((_, i) => (i % 2 === 0 ? 0.5 : 0.1));
  const vecB = new Array(63).fill(0).map((_, i) => (i % 2 === 0 ? -0.5 : 0.9));

  for (let i = 0; i < 10; i++) {
    knn.addSample('A', vecA.map((v) => v + i * 0.002));
    knn.addSample('B', vecB.map((v) => v + i * 0.002));
  }

  const predA = knn.predict(vecA);
  assert.equal(predA.label, 'A');
  assert.ok(predA.confidence >= 0.9);
  assert.ok(predA.latencyMs < 5, `Expected <5ms, got ${predA.latencyMs}ms`);

  const predB = knn.predict(vecB);
  assert.equal(predB.label, 'B');

  // Out-of-distribution vector should return null
  const farVec = new Array(63).fill(50);
  const predFar = knn.predict(farVec);
  assert.equal(predFar.label, null);

  // Round-trip serialization
  const exported = knn.exportDataset();
  const knn2 = new KNNClassifier({ k: 3 });
  const loaded = knn2.importDataset(exported);
  assert.equal(loaded, 20);
  assert.equal(knn2.predict(vecA).label, 'A');
});

test('StabilityBuffer suppresses jitter and respects cooldown', () => {
  const buf = new StabilityBuffer({
    windowSize: 5,
    minConsensus: 4,
    cooldownMs: 1000,
  });

  assert.equal(buf.push('A', 100).committed, false);
  assert.equal(buf.push('B', 200).committed, false);
  assert.equal(buf.push('A', 300).committed, false);
  assert.equal(buf.push('A', 400).committed, false);
  const commit = buf.push('A', 500);
  assert.equal(commit.committed, true);
  assert.equal(commit.stableLabel, 'A');

  // Within cooldown: should not double-commit
  assert.equal(buf.push('A', 700).committed, false);

  // After cooldown: commits again
  assert.equal(buf.push('A', 1600).committed, true);
});

test('textToSign stems Indonesian words and falls back to A-Z SVG fingerspelling', () => {
  assert.equal(stemIndonesian('memakan'), 'makan');
  assert.equal(stemIndonesian('rumah-rumah'), 'rumah');
  assert.equal(stemIndonesian('minuman'), 'minum');

  const seq = translateTextToSignSequence(
    'Halo terima kasih Budi',
    (p) => `ext://${p}`
  );

  assert.equal(seq[0].type, 'word');
  assert.equal(seq[0].label, 'HALO');

  assert.equal(seq[1].type, 'word');
  assert.equal(seq[1].label, 'TERIMA KASIH');

  // "Budi" falls back to 4 A-Z letter SVG steps
  const spelled = seq.slice(2);
  assert.deepEqual(
    spelled.map((s) => s.label),
    ['B', 'U', 'D', 'I']
  );
  assert.equal(spelled[0].assetUrl, 'ext://signs/b.svg');

  // Word-level everyday sentence ("Aku suka kamu")
  const phraseSeq = translateTextToSignSequence('Aku suka kamu');
  assert.deepEqual(
    phraseSeq.map((s) => ({ type: s.type, label: s.label })),
    [
      { type: 'word', label: 'AKU' },
      { type: 'word', label: 'SUKA' },
      { type: 'word', label: 'KAMU' },
    ]
  );

  // Smart AI word composer segments continuous fingerspelled letters & collapses stutter
  assert.equal(
    composeSmartSentence(['A', 'K', 'U', 'S', 'U', 'K', 'A', 'K', 'A', 'M', 'U'], true),
    'AKU SUKA KAMU'
  );
  assert.equal(
    composeSmartSentence(['H', 'A', 'A', 'A', 'L', 'O', 'A', 'P', 'A', 'K', 'A', 'B', 'A', 'R'], true),
    'HALO APA KABAR'
  );
});
