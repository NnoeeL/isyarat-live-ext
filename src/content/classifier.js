/**
 * Lightweight pure-JavaScript K-Nearest Neighbors (KNN) classifier
 * for real-time SIBI/BISINDO hand landmark classification (< 5ms per frame).
 */

/**
 * Compute squared Euclidean distance between two equal-length numeric vectors.
 * @param {number[]} a
 * @param {number[]} b
 * @returns {number}
 */
export function squaredEuclideanDistance(a, b) {
  let sum = 0;
  const len = a.length;
  for (let i = 0; i < len; i++) {
    const d = a[i] - b[i];
    sum += d * d;
  }
  return sum;
}

export class KNNClassifier {
  /**
   * @param {{ k?: number, maxDistance?: number, minConfidence?: number }} [options]
   */
  constructor(options = {}) {
    this.k = options.k ?? 5;
    this.maxDistance = options.maxDistance ?? 2.2;
    this.minConfidence = options.minConfidence ?? 0.55;
    /** @type {Array<{ label: string, vector: number[] }>} */
    this.samples = [];
  }

  /**
   * Add a labeled 63-D feature vector sample.
   * @param {string} label
   * @param {number[]} vector
   */
  addSample(label, vector) {
    const cleanLabel = String(label || '').trim().toUpperCase();
    if (!cleanLabel || !Array.isArray(vector) || vector.length === 0) {
      return false;
    }
    this.samples.push({
      label: cleanLabel,
      vector: Array.from(vector),
    });
    return true;
  }

  /**
   * Remove all samples matching a label.
   * @param {string} label
   * @returns {number} number of removed samples
   */
  removeLabel(label) {
    const target = String(label || '').trim().toUpperCase();
    const before = this.samples.length;
    this.samples = this.samples.filter((s) => s.label !== target);
    return before - this.samples.length;
  }

  clear() {
    this.samples = [];
  }

  /**
   * Return summary counts per label.
   * @returns {Record<string, number>}
   */
  getLabelCounts() {
    const counts = {};
    for (const s of this.samples) {
      counts[s.label] = (counts[s.label] || 0) + 1;
    }
    return counts;
  }

  get sampleCount() {
    return this.samples.length;
  }

  /**
   * Classify a 63-D hand vector using distance-weighted KNN.
   * @param {number[]} vector
   * @param {'all' | 'letters' | 'words'} [mode='all']
   * @returns {{ label: string | null, confidence: number, distance: number, latencyMs: number }}
   */
  predict(vector, mode = 'all') {
    const t0 = typeof performance !== 'undefined' ? performance.now() : Date.now();

    if (!Array.isArray(vector) || this.samples.length === 0) {
      return { label: null, confidence: 0, distance: Infinity, latencyMs: 0 };
    }

    const pool =
      mode === 'letters'
        ? this.samples.filter((s) => s.label.length === 1)
        : mode === 'words'
          ? this.samples.filter((s) => s.label.length > 1)
          : this.samples;

    if (pool.length === 0) {
      return { label: null, confidence: 0, distance: Infinity, latencyMs: 0 };
    }

    const k = Math.min(this.k, pool.length);
    const distances = new Array(pool.length);

    // Prepare horizontally mirrored vector so left-hand & right-hand match identically
    const mirrored = new Array(vector.length);
    for (let j = 0; j < vector.length; j += 3) {
      mirrored[j] = -vector[j];
      mirrored[j + 1] = vector[j + 1];
      mirrored[j + 2] = vector[j + 2];
    }

    for (let i = 0; i < pool.length; i++) {
      const sample = pool[i];
      if (sample.vector.length !== vector.length) {
        distances[i] = { label: sample.label, dist: Infinity };
        continue;
      }
      const sqOrig = squaredEuclideanDistance(vector, sample.vector);
      const sqMir = squaredEuclideanDistance(mirrored, sample.vector);
      distances[i] = {
        label: sample.label,
        dist: Math.sqrt(Math.min(sqOrig, sqMir)),
      };
    }

    distances.sort((a, b) => a.dist - b.dist);
    const nearest = distances.slice(0, k);
    const bestDist = nearest[0]?.dist ?? Infinity;

    if (bestDist > this.maxDistance) {
      const t1 = typeof performance !== 'undefined' ? performance.now() : Date.now();
      return { label: null, confidence: 0, distance: bestDist, latencyMs: t1 - t0 };
    }

    const weights = {};
    let totalWeight = 0;
    const eps = 1e-4;

    for (const item of nearest) {
      if (!Number.isFinite(item.dist)) continue;
      const w = 1 / (item.dist + eps);
      weights[item.label] = (weights[item.label] || 0) + w;
      totalWeight += w;
    }

    let bestLabel = null;
    let bestWeight = 0;
    for (const [label, w] of Object.entries(weights)) {
      if (w > bestWeight) {
        bestWeight = w;
        bestLabel = label;
      }
    }

    const confidence = totalWeight > 0 ? bestWeight / totalWeight : 0;
    const t1 = typeof performance !== 'undefined' ? performance.now() : Date.now();

    if (confidence < this.minConfidence) {
      return {
        label: null,
        confidence,
        distance: bestDist,
        latencyMs: t1 - t0,
      };
    }

    return {
      label: bestLabel,
      confidence,
      distance: bestDist,
      latencyMs: t1 - t0,
    };
  }

  /**
   * Serialize dataset for chrome.storage.local or JSON export.
   */
  exportDataset() {
    return {
      version: 1,
      updatedAt: new Date().toISOString(),
      samples: this.samples,
    };
  }

  /**
   * Load dataset from serialized object.
   * @param {{ samples?: Array<{ label: string, vector: number[] }> }} data
   * @param {boolean} [merge=false]
   */
  importDataset(data, merge = false) {
    if (!data || !Array.isArray(data.samples)) return 0;
    if (!merge) {
      this.samples = [];
    }
    let added = 0;
    for (const item of data.samples) {
      if (item && this.addSample(item.label, item.vector)) {
        added++;
      }
    }
    return added;
  }
}

/**
 * Velocity-gated dwell/hold stability buffer.
 * Prevents intermediate hand transition frames from prematurely triggering letters/words.
 * Requires the hand to stay steady on the same sign for `minHoldFrames` before committing.
 */
export class StabilityBuffer {
  /**
   * @param {{
   *   windowSize?: number,
   *   minConsensus?: number,
   *   cooldownMs?: number,
   *   preventConsecutiveDuplicate?: boolean,
   *   maxMotionDelta?: number
   * }} [options]
   */
  constructor(options = {}) {
    this.windowSize = options.windowSize ?? 7;
    this.minConsensus = options.minConsensus ?? 5;
    this.cooldownMs = options.cooldownMs ?? 1200;
    this.globalCooldownMs = options.globalCooldownMs ?? 0;
    this.preventConsecutiveDuplicate =
      options.preventConsecutiveDuplicate ?? false;
    this.maxMotionDelta = options.maxMotionDelta ?? 0.22;

    this.buffer = [];
    this.prevVector = null;
    this.lastCommittedLabel = null;
    this.lastCommittedAt = 0;
  }

  /**
   * Compute normalized per-landmark motion speed between consecutive frames.
   * @param {number[] | null} vector
   * @returns {number}
   */
  _computeMotion(vector) {
    if (!Array.isArray(vector) || vector.length === 0) {
      this.prevVector = null;
      return 0;
    }
    if (!this.prevVector || this.prevVector.length !== vector.length) {
      this.prevVector = vector;
      return 0;
    }
    const sq = squaredEuclideanDistance(vector, this.prevVector);
    this.prevVector = vector;
    return Math.sqrt(sq / 21);
  }

  /**
   * Push a new frame prediction into the sliding window.
   * @param {string | null} label
   * @param {number} [nowMs]
   * @param {number[] | null} [vector] optional 63-D landmark vector for velocity gating
   * @returns {{ stableLabel: string | null, committed: boolean, holdProgress: number, candidateLabel: string | null }}
   */
  push(label, nowMs = Date.now(), vector = null) {
    const motion = vector ? this._computeMotion(vector) : 0;

    // Jeda global setelah huruf/kata terkunci agar tangan sempat pindah pose tanpa spam
    if (
      this.globalCooldownMs > 0 &&
      this.lastCommittedAt > 0 &&
      nowMs - this.lastCommittedAt < this.globalCooldownMs
    ) {
      this.buffer = [];
      return {
        stableLabel: this.lastCommittedLabel,
        committed: false,
        holdProgress: 0,
        candidateLabel: label,
        inCooldown: true,
      };
    }

    // If hand is moving rapidly between poses, do not accumulate transition predictions
    if (vector && motion > this.maxMotionDelta) {
      return {
        stableLabel: null,
        committed: false,
        holdProgress: 0,
        candidateLabel: label,
        inCooldown: false,
      };
    }

    this.buffer.push(label);
    if (this.buffer.length > this.windowSize) {
      this.buffer.shift();
    }

    if (!label) {
      if (this.buffer.every((item) => item === null)) {
        this.lastCommittedLabel = null;
      }
      return {
        stableLabel: null,
        committed: false,
        holdProgress: 0,
        candidateLabel: null,
      };
    }

    const counts = {};
    for (const item of this.buffer) {
      if (!item) continue;
      counts[item] = (counts[item] || 0) + 1;
    }

    let topLabel = null;
    let topCount = 0;
    for (const [k, count] of Object.entries(counts)) {
      if (count > topCount) {
        topCount = count;
        topLabel = k;
      }
    }

    const holdProgress = Math.min(1, topCount / Math.max(1, this.minConsensus));

    if (!topLabel || topCount < this.minConsensus) {
      return {
        stableLabel: null,
        committed: false,
        holdProgress,
        candidateLabel: topLabel,
      };
    }

    const isSameAsLast = topLabel === this.lastCommittedLabel;
    const withinCooldown =
      isSameAsLast && nowMs - this.lastCommittedAt < this.cooldownMs;

    if (withinCooldown || (this.preventConsecutiveDuplicate && isSameAsLast)) {
      return {
        stableLabel: topLabel,
        committed: false,
        holdProgress: 1,
        candidateLabel: topLabel,
      };
    }

    this.lastCommittedLabel = topLabel;
    this.lastCommittedAt = nowMs;
    return {
      stableLabel: topLabel,
      committed: true,
      holdProgress: 1,
      candidateLabel: topLabel,
    };
  }

  reset() {
    this.buffer = [];
    this.prevVector = null;
    this.lastCommittedLabel = null;
    this.lastCommittedAt = 0;
  }
}
