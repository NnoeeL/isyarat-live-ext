import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import {
  normalizeLandmarks,
  classifyGeometricSign,
  classifyGeometricLetter,
} from '../content/detector.js';

/**
 * Offscreen Document AI Engine (Manifest V3).
 * Runs MediaPipe HandLandmarker 100% locally inside the extension's own origin.
 */

// Filter harmless internal MediaPipe C++ OpenGL info logs so chrome://extensions stays clean
const origWarn = console.warn.bind(console);
const origError = console.error.bind(console);
function shouldSuppressLog(args) {
  const first = String(args[0] || '');
  return (
    first.includes('OpenGL error checking is disabled') ||
    first.includes('gl_context.cc') ||
    first.includes('landmark_projection_calculator.cc')
  );
}
console.warn = (...args) => {
  if (!shouldSuppressLog(args)) origWarn(...args);
};
console.error = (...args) => {
  if (!shouldSuppressLog(args)) origError(...args);
};

let landmarker = null;
let initPromise = null;
let initError = null;
let lastVideoTimestamp = 0;

async function ensureLandmarker() {
  if (landmarker) return landmarker;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      const wasmPath = chrome.runtime.getURL('wasm');
      const modelAssetPath = chrome.runtime.getURL('models/hand_landmarker.task');
      const vision = await FilesetResolver.forVisionTasks(wasmPath);

      try {
        // VIDEO mode enables temporal landmark smoothing + faster tracking
        landmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: { modelAssetPath, delegate: 'GPU' },
          runningMode: 'VIDEO',
          numHands: 1,
          minHandDetectionConfidence: 0.55,
          minHandPresenceConfidence: 0.55,
          minTrackingConfidence: 0.55,
        });
      } catch {
        landmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: { modelAssetPath, delegate: 'CPU' },
          runningMode: 'VIDEO',
          numHands: 1,
          minHandDetectionConfidence: 0.55,
          minHandPresenceConfidence: 0.55,
          minTrackingConfidence: 0.55,
        });
      }

      initError = null;
      return landmarker;
    } catch (err) {
      initError = err?.message || String(err);
      initPromise = null;
      throw err;
    }
  })();

  return initPromise;
}

async function decodeDataUrlToBitmap(dataUrl) {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  return createImageBitmap(blob);
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (!message?.type) return false;

  if (message.type === 'OFFSCREEN_INIT') {
    ensureLandmarker()
      .then(() => sendResponse({ ok: true }))
      .catch((err) =>
        sendResponse({ ok: false, error: err?.message || String(err) })
      );
    return true;
  }

  if (message.type === 'OFFSCREEN_DETECT_FRAME') {
    (async () => {
      try {
        const detector = await ensureLandmarker();
        const bitmap = await decodeDataUrlToBitmap(message.dataUrl);
        const now = Math.floor(performance.now());
        const ts = now <= lastVideoTimestamp ? lastVideoTimestamp + 1 : now;
        lastVideoTimestamp = ts;
        const result = detector.detectForVideo(bitmap, ts);
        bitmap.close();

        if (!result?.landmarks?.length) {
          sendResponse({ ok: true, vectors: [], handedness: [] });
          return;
        }

        const vectors = [];
        for (const hand of result.landmarks) {
          const vec = normalizeLandmarks(hand);
          if (vec) vectors.push(vec);
        }

        const geometricSign = classifyGeometricSign(result.landmarks[0]);
        const geometricLetter = classifyGeometricLetter(result.landmarks[0]);
        const handedness = (result.handednesses || []).map(
          (h) => h?.[0]?.categoryName || 'Unknown'
        );

        sendResponse({
          ok: true,
          vectors,
          geometricSign,
          geometricLetter,
          handedness,
        });
      } catch (err) {
        sendResponse({
          ok: false,
          error: initError || err?.message || String(err),
        });
      }
    })();
    return true;
  }

  return false;
});
