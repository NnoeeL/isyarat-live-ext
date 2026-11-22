import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';

/**
 * Standard MediaPipe 21-point hand skeleton connections for visualization.
 */
export const HAND_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4],       // Thumb
  [0, 5], [5, 6], [6, 7], [7, 8],       // Index
  [5, 9], [9, 10], [10, 11], [11, 12],  // Middle
  [9, 13], [13, 14], [14, 15], [15, 16],// Ring
  [13, 17], [0, 17], [17, 18], [18, 19], [19, 20], // Pinky & Palm
];

export const LANDMARK_COUNT = 21;
export const FEATURE_DIMENSION = LANDMARK_COUNT * 3; // 63

/**
 * Normalizes 21 3D hand landmarks into a translation-invariant and scale-invariant
 * 63-element feature vector suitable for fast KNN classification.
 *
 * 1. Translates all landmarks so wrist (index 0) is at the origin (0, 0, 0).
 * 2. Divides all coordinates by the maximum Euclidean distance from the wrist
 *    (falls back to 1 to prevent division by zero).
 *
 * @param {Array<{x: number, y: number, z?: number}>} landmarks
 * @returns {number[] | null} 63-element normalized vector or null if invalid
 */
export function normalizeLandmarks(landmarks) {
  if (!Array.isArray(landmarks) || landmarks.length !== LANDMARK_COUNT) {
    return null;
  }

  const wrist = landmarks[0];
  if (!wrist || typeof wrist.x !== 'number' || typeof wrist.y !== 'number') {
    return null;
  }

  const wx = wrist.x;
  const wy = wrist.y;

  const centered = new Array(FEATURE_DIMENSION);
  let maxDist = 0;

  for (let i = 0; i < LANDMARK_COUNT; i++) {
    const pt = landmarks[i];
    const dx = pt.x - wx;
    const dy = pt.y - wy;

    const base = i * 3;
    centered[base] = dx;
    centered[base + 1] = dy;
    // Zero monocular Z so live webcam landmarks match 2D-dominant CSV datasets cleanly
    centered[base + 2] = 0;

    const dist = Math.hypot(dx, dy);
    if (dist > maxDist) {
      maxDist = dist;
    }
  }

  const scale = maxDist > 1e-6 ? maxDist : 1;
  for (let i = 0; i < FEATURE_DIMENSION; i++) {
    centered[i] = Number((centered[i] / scale).toFixed(5));
  }

  return centered;
}

/**
 * Flip X coordinates of a normalized 63-D hand vector so left-hand, right-hand,
 * and mirrored video streams match identically in KNN.
 * @param {number[]} vector
 * @returns {number[]}
 */
export function mirrorVectorX(vector) {
  if (!Array.isArray(vector) || vector.length !== FEATURE_DIMENSION) {
    return vector;
  }
  const out = new Array(FEATURE_DIMENSION);
  for (let i = 0; i < FEATURE_DIMENSION; i += 3) {
    out[i] = -vector[i];
    out[i + 1] = vector[i + 1];
    out[i + 2] = vector[i + 2];
  }
  return out;
}

function dist2D(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/**
 * Fast (<0.1ms), scale-invariant & left/right-hand-invariant geometric classifier
 * for core Indonesian everyday sign language postures (BISINDO / SIBI).
 *
 * @param {Array<{x: number, y: number, z?: number}>} landmarks
 * @returns {{ label: string, confidence: number } | null}
 */
export function classifyGeometricSign(landmarks) {
  if (!Array.isArray(landmarks) || landmarks.length !== LANDMARK_COUNT) {
    return null;
  }

  const wrist = landmarks[0];
  const thumbCMC = landmarks[1];
  const thumbMCP = landmarks[2];
  const thumbIP = landmarks[3];
  const thumbTip = landmarks[4];

  const indexMCP = landmarks[5];
  const indexPIP = landmarks[6];
  const indexTip = landmarks[8];

  const middleMCP = landmarks[9];
  const middlePIP = landmarks[10];
  const middleTip = landmarks[12];

  const ringMCP = landmarks[13];
  const ringPIP = landmarks[14];
  const ringTip = landmarks[16];

  const pinkyMCP = landmarks[17];
  const pinkyPIP = landmarks[18];
  const pinkyTip = landmarks[20];

  const palmSize = dist2D(wrist, middleMCP);
  if (palmSize < 0.025) return null;

  const isFingerExtended = (mcp, pip, tip) =>
    dist2D(tip, wrist) > dist2D(pip, wrist) * 1.12 &&
    dist2D(tip, mcp) > dist2D(pip, mcp) * 1.28;

  const indexExt = isFingerExtended(indexMCP, indexPIP, indexTip);
  const middleExt = isFingerExtended(middleMCP, middlePIP, middleTip);
  const ringExt = isFingerExtended(ringMCP, ringPIP, ringTip);
  const pinkyExt = isFingerExtended(pinkyMCP, pinkyPIP, pinkyTip);
  const extCount =
    Number(indexExt) + Number(middleExt) + Number(ringExt) + Number(pinkyExt);

  const thumbOut =
    dist2D(thumbTip, indexMCP) > palmSize * 0.68 &&
    dist2D(thumbTip, pinkyMCP) > palmSize * 0.9;

  const thumbStraightUp =
    dist2D(thumbTip, indexPIP) > palmSize * 0.55 &&
    thumbTip.y < thumbIP.y - palmSize * 0.1 &&
    thumbTip.y < indexMCP.y - palmSize * 0.2;

  const thumbStraightDown =
    dist2D(thumbTip, indexPIP) > palmSize * 0.55 &&
    thumbTip.y > thumbIP.y + palmSize * 0.1 &&
    thumbTip.y > indexMCP.y + palmSize * 0.2;

  // Hand orientation vector (wrist -> middle MCP)
  const vx = middleMCP.x - wrist.x;
  const vy = middleMCP.y - wrist.y;
  const isHorizontal = Math.abs(vx) > Math.abs(vy) * 1.05;
  const isVerticalUp = vy < -Math.abs(vx) * 0.65;

  // 1. BAGUS (Thumbs Up 👍)
  if (extCount === 0 && thumbStraightUp) {
    return { label: 'BAGUS', confidence: 0.96 };
  }

  // 2. TIDAK (Thumbs Down 👎)
  if (extCount === 0 && thumbStraightDown) {
    return { label: 'TIDAK', confidence: 0.95 };
  }

  // 3. SAYA (Tangan mendatar di depan dada — telapak terbuka atau menunjuk dada)
  if (isHorizontal && (extCount >= 3 || (indexExt && extCount === 1))) {
    return { label: 'SAYA', confidence: 0.95 };
  }

  // 4. OKE (Ujung jempol & telunjuk menyatu bentuk O 👌, 3 jari lain terbuka)
  if (
    dist2D(thumbTip, indexTip) < palmSize * 0.45 &&
    middleExt &&
    ringExt &&
    pinkyExt
  ) {
    return { label: 'OKE', confidence: 0.95 };
  }

  // 5. SUKA / CINTA (Pose ILY 🤟: Jempol + Telunjuk + Kelingking terbuka, Tengah + Manis lipat)
  if (thumbOut && indexExt && !middleExt && !ringExt && pinkyExt) {
    return { label: 'SUKA', confidence: 0.96 };
  }

  // 6. KAMU (Menunjuk dengan 1 jari telunjuk ☝️)
  if (indexExt && !middleExt && !ringExt && !pinkyExt && !isHorizontal) {
    return { label: 'KAMU', confidence: 0.94 };
  }

  // 7. TEMAN (2 jari V ✌️: Telunjuk + Tengah terbuka)
  if (indexExt && middleExt && !ringExt && !pinkyExt) {
    return { label: 'TEMAN', confidence: 0.94 };
  }

  // 8. KITA (3 jari W: Telunjuk + Tengah + Manis terbuka, Kelingking lipat)
  if (indexExt && middleExt && ringExt && !pinkyExt) {
    return { label: 'KITA', confidence: 0.93 };
  }

  // 9. HALO vs TERIMA KASIH (4 jari tegak ke atas ✋ vs 🤚)
  if (isVerticalUp && indexExt && middleExt && ringExt && pinkyExt) {
    const spread = dist2D(indexTip, pinkyTip) / palmSize;
    if (spread >= 1.12 && thumbOut) {
      return { label: 'HALO', confidence: 0.95 };
    }
    return { label: 'TERIMA KASIH', confidence: 0.92 };
  }

  // 10. KENAPA (Jempol + Kelingking terbuka 🤙)
  if (thumbOut && !indexExt && !middleExt && !ringExt && pinkyExt) {
    return { label: 'KENAPA', confidence: 0.93 };
  }

  // 11. INGAT (Hanya Kelingking tegak)
  if (!thumbOut && !indexExt && !middleExt && !ringExt && pinkyExt) {
    return { label: 'INGAT', confidence: 0.92 };
  }

  // 12. MAKAN (Ujung jempol, telunjuk, dan jari tengah menguncup bertemu 🤌)
  if (
    !ringExt &&
    !pinkyExt &&
    dist2D(thumbTip, indexTip) < palmSize * 0.48 &&
    dist2D(thumbTip, middleTip) < palmSize * 0.52 &&
    dist2D(thumbCMC, thumbTip) > palmSize * 0.5
  ) {
    return { label: 'MAKAN', confidence: 0.91 };
  }

  // 13. MAAF (Kepalan tangan di depan dada ✊)
  if (extCount === 0 && !thumbOut && isVerticalUp) {
    return { label: 'MAAF', confidence: 0.89 };
  }

  return null;
}

/**
 * Geometric recognizer for SIBI Alphabet Letters (A-Z) from 21 hand landmarks.
 * Recognizes distinct single-hand alphabet shapes in <0.1ms.
 *
 * @param {Array<{x: number, y: number, z?: number}>} landmarks
 * @returns {{ label: string, confidence: number } | null}
 */
export function classifyGeometricLetter(landmarks) {
  if (!Array.isArray(landmarks) || landmarks.length !== LANDMARK_COUNT) {
    return null;
  }

  const wrist = landmarks[0];
  const thumbMCP = landmarks[2];
  const thumbIP = landmarks[3];
  const thumbTip = landmarks[4];

  const indexMCP = landmarks[5];
  const indexPIP = landmarks[6];
  const indexTip = landmarks[8];

  const middleMCP = landmarks[9];
  const middlePIP = landmarks[10];
  const middleTip = landmarks[12];

  const ringMCP = landmarks[13];
  const ringPIP = landmarks[14];
  const ringTip = landmarks[16];

  const pinkyMCP = landmarks[17];
  const pinkyPIP = landmarks[18];
  const pinkyTip = landmarks[20];

  const palmSize = dist2D(wrist, middleMCP);
  if (palmSize < 0.025) return null;

  const isFingerExtended = (mcp, pip, tip) =>
    dist2D(tip, wrist) > dist2D(pip, wrist) * 1.12 &&
    dist2D(tip, mcp) > dist2D(pip, mcp) * 1.28;

  const indexExt = isFingerExtended(indexMCP, indexPIP, indexTip);
  const middleExt = isFingerExtended(middleMCP, middlePIP, middleTip);
  const ringExt = isFingerExtended(ringMCP, ringPIP, ringTip);
  const pinkyExt = isFingerExtended(pinkyMCP, pinkyPIP, pinkyTip);
  const extCount =
    Number(indexExt) + Number(middleExt) + Number(ringExt) + Number(pinkyExt);

  const thumbOut =
    dist2D(thumbTip, indexMCP) > palmSize * 0.65 &&
    dist2D(thumbTip, pinkyMCP) > palmSize * 0.88;

  const vx = middleMCP.x - wrist.x;
  const vy = middleMCP.y - wrist.y;
  const isHorizontal = Math.abs(vx) > Math.abs(vy) * 1.1;
  const isPointingDown = vy > Math.abs(vx) * 0.65;

  // Huruf P & Q (mengarah ke bawah)
  if (isPointingDown || indexTip.y > indexMCP.y + palmSize * 0.35) {
    if (indexExt && middleExt && !ringExt && !pinkyExt) {
      return { label: 'P', confidence: 0.92 };
    }
    if (indexExt && !middleExt && !ringExt && !pinkyExt) {
      return { label: 'Q', confidence: 0.92 };
    }
  }

  // Huruf C, O, X, A, S, T, N, M, E (ketika 4 jari tidak tegak lurus)
  if (extCount === 0) {
    const thumbIndexDist = dist2D(thumbTip, indexTip);
    const thumbMiddleDist = dist2D(thumbTip, middleTip);
    const indexTipToWrist = dist2D(indexTip, wrist);
    const middleTipToWrist = dist2D(middleTip, wrist);

    // O: ujung jempol bertemu ujung telunjuk & tengah membentuk lingkaran tertutup
    if (
      thumbIndexDist < palmSize * 0.36 &&
      thumbMiddleDist < palmSize * 0.44
    ) {
      return { label: 'O', confidence: 0.94 };
    }

    // C: jempol & keempat jari melengkung terbuka membentuk busur huruf C (ada celah terbuka jelas)
    if (
      thumbIndexDist >= palmSize * 0.42 &&
      thumbIndexDist <= palmSize * 1.25 &&
      indexTipToWrist > palmSize * 1.05 &&
      middleTipToWrist > palmSize * 1.05 &&
      dist2D(indexTip, indexMCP) > palmSize * 0.55
    ) {
      return { label: 'C', confidence: 0.94 };
    }

    // X: telunjuk setengah menekuk seperti kait, 3 jari lain mengepal rapat
    if (
      indexTipToWrist > palmSize * 1.15 &&
      middleTipToWrist < palmSize * 0.98 &&
      dist2D(ringTip, wrist) < palmSize * 0.98 &&
      dist2D(pinkyTip, wrist) < palmSize * 0.98
    ) {
      return { label: 'X', confidence: 0.92 };
    }

    // A: kepalan tangan dengan jempol menempel tegak di samping telunjuk
    if (
      thumbTip.y < indexPIP.y + palmSize * 0.15 &&
      dist2D(thumbTip, indexPIP) < palmSize * 0.62 &&
      dist2D(thumbTip, ringPIP) > palmSize * 0.55
    ) {
      return { label: 'A', confidence: 0.95 };
    }

    // T: jempol diselipkan di antara telunjuk & jari tengah
    if (
      dist2D(thumbTip, indexPIP) < palmSize * 0.42 &&
      dist2D(thumbTip, middlePIP) < palmSize * 0.45 &&
      thumbTip.y < middleMCP.y
    ) {
      return { label: 'T', confidence: 0.89 };
    }

    // N: jempol diselipkan di antara jari tengah & manis
    if (
      dist2D(thumbTip, middlePIP) < palmSize * 0.4 &&
      dist2D(thumbTip, ringPIP) < palmSize * 0.45 &&
      thumbTip.y > indexPIP.y
    ) {
      return { label: 'N', confidence: 0.88 };
    }

    // M: jempol diselipkan di antara jari manis & kelingking
    if (
      dist2D(thumbTip, ringPIP) < palmSize * 0.42 &&
      dist2D(thumbTip, pinkyPIP) < palmSize * 0.48
    ) {
      return { label: 'M', confidence: 0.88 };
    }

    // S: kepalan tangan dengan jempol melintang di depan jari tengah
    if (dist2D(thumbTip, middlePIP) < palmSize * 0.52) {
      return { label: 'S', confidence: 0.91 };
    }

    // E: jempol ditekuk di bawah ujung keempat jari
    if (thumbTip.y > indexTip.y && dist2D(thumbTip, pinkyMCP) < palmSize * 0.78) {
      return { label: 'E', confidence: 0.9 };
    }
  }

  // Huruf B: 4 jari tegak rapat, jempol ditekuk ke dalam telapak (!thumbOut)
  if (indexExt && middleExt && ringExt && pinkyExt && !thumbOut) {
    return { label: 'B', confidence: 0.95 };
  }

  // Huruf F: jempol & telunjuk menyatu, 3 jari lain tegak
  if (
    dist2D(thumbTip, indexTip) < palmSize * 0.44 &&
    middleExt &&
    ringExt &&
    pinkyExt
  ) {
    return { label: 'F', confidence: 0.94 };
  }

  // Huruf L vs D vs G (1 jari telunjuk terbuka)
  if (indexExt && !middleExt && !ringExt && !pinkyExt) {
    if (isHorizontal) {
      return { label: 'G', confidence: 0.92 };
    }
    if (thumbOut && dist2D(thumbTip, indexMCP) > palmSize * 0.72) {
      return { label: 'L', confidence: 0.95 };
    }
    return { label: 'D', confidence: 0.93 };
  }

  // Huruf U vs V vs R vs K vs H (2 jari: telunjuk & tengah terbuka)
  if (indexExt && middleExt && !ringExt && !pinkyExt) {
    if (isHorizontal) {
      return { label: 'H', confidence: 0.93 };
    }
    const spread = dist2D(indexTip, middleTip) / palmSize;
    if (spread < 0.22) {
      return { label: 'R', confidence: 0.92 };
    }
    if (spread < 0.36) {
      return { label: 'U', confidence: 0.93 };
    }
    if (thumbOut && thumbTip.y < middleMCP.y) {
      return { label: 'K', confidence: 0.91 };
    }
    return { label: 'V', confidence: 0.94 };
  }

  // Huruf W: 3 jari (telunjuk, tengah, manis) terbuka
  if (indexExt && middleExt && ringExt && !pinkyExt) {
    return { label: 'W', confidence: 0.94 };
  }

  // Huruf I vs Y (kelingking terbuka)
  if (!indexExt && !middleExt && !ringExt && pinkyExt) {
    if (thumbOut) {
      return { label: 'Y', confidence: 0.95 };
    }
    return { label: 'I', confidence: 0.94 };
  }

  return null;
}

/**
 * Wrapper around MediaPipe HandLandmarker running 100% locally via bundled WASM & model.
 */
export class HandDetector {
  constructor(options = {}) {
    this.numHands = options.numHands ?? 2;
    this.minHandDetectionConfidence = options.minHandDetectionConfidence ?? 0.5;
    this.minHandPresenceConfidence = options.minHandPresenceConfidence ?? 0.5;
    this.minTrackingConfidence = options.minTrackingConfidence ?? 0.5;
    this.landmarker = null;
    this.isInitializing = false;
    this.lastTimestamp = -1;
  }

  /**
   * Initialize HandLandmarker using local extension WASM and task model assets.
   * @param {{ wasmPath: string, modelAssetPath: string, delegate?: 'GPU'|'CPU' }} config
   */
  async init({ wasmPath, modelAssetPath, delegate = 'GPU' }) {
    if (this.landmarker) return this.landmarker;
    if (this.isInitializing) return null;

    this.isInitializing = true;
    try {
      const vision = await FilesetResolver.forVisionTasks(wasmPath);

      try {
        this.landmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath,
            delegate,
          },
          runningMode: 'VIDEO',
          numHands: this.numHands,
          minHandDetectionConfidence: this.minHandDetectionConfidence,
          minHandPresenceConfidence: this.minHandPresenceConfidence,
          minTrackingConfidence: this.minTrackingConfidence,
        });
      } catch (gpuError) {
        if (delegate === 'GPU') {
          // Graceful fallback to CPU when WebGL/GPU delegate is unavailable
          this.landmarker = await HandLandmarker.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath,
              delegate: 'CPU',
            },
            runningMode: 'VIDEO',
            numHands: this.numHands,
            minHandDetectionConfidence: this.minHandDetectionConfidence,
            minHandPresenceConfidence: this.minHandPresenceConfidence,
            minTrackingConfidence: this.minTrackingConfidence,
          });
        } else {
          throw gpuError;
        }
      }

      return this.landmarker;
    } finally {
      this.isInitializing = false;
    }
  }

  get isReady() {
    return Boolean(this.landmarker);
  }

  /**
   * Run inference on a single HTMLVideoElement frame.
   * Ensures strictly increasing timestamps required by MediaPipe VIDEO mode.
   *
   * @param {HTMLVideoElement} videoElement
   * @param {number} [timestampMs]
   * @returns {{ landmarks: Array<Array<{x:number,y:number,z:number}>>, vectors: number[][], handedness: string[] } | null}
   */
  detectVideoFrame(videoElement, timestampMs = performance.now()) {
    if (!this.landmarker || !videoElement) return null;
    if (
      videoElement.readyState < 2 ||
      videoElement.videoWidth === 0 ||
      videoElement.videoHeight === 0
    ) {
      return null;
    }

    const safeTimestamp =
      timestampMs <= this.lastTimestamp ? this.lastTimestamp + 1 : timestampMs;
    this.lastTimestamp = safeTimestamp;

    const result = this.landmarker.detectForVideo(videoElement, safeTimestamp);
    if (!result || !result.landmarks || result.landmarks.length === 0) {
      return { landmarks: [], vectors: [], handedness: [] };
    }

    const vectors = [];
    for (const hand of result.landmarks) {
      const vec = normalizeLandmarks(hand);
      if (vec) vectors.push(vec);
    }

    const handedness = (result.handednesses || []).map(
      (h) => h?.[0]?.categoryName || 'Unknown'
    );

    return {
      landmarks: result.landmarks,
      vectors,
      handedness,
    };
  }

  dispose() {
    if (this.landmarker) {
      try {
        this.landmarker.close();
      } catch {
        // Ignore cleanup error
      }
      this.landmarker = null;
    }
  }
}
