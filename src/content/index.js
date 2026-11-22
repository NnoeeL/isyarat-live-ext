import { KNNClassifier, StabilityBuffer } from './classifier.js';
import { OverlayUI } from './overlayUI.js';

const STORAGE_KEYS = {
  ENABLED: 'isyarat_enabled',
  DATASET: 'isyarat_knn_dataset',
  DATASET_VERSION: 'isyarat_dataset_version',
};

const CURRENT_DATASET_VERSION = 3;

const TARGET_FPS = 16;
const FRAME_INTERVAL_MS = 1000 / TARGET_FPS;
const CAPTURE_WIDTH = 256;
const CAPTURE_HEIGHT = 192;

function getElementScreenArea(el) {
  if (!el || !el.getBoundingClientRect) return 0;
  const r = el.getBoundingClientRect();
  return Math.max(0, r.width) * Math.max(0, r.height);
}

/**
 * Kumpulkan semua elemen <video> dan <canvas> panggilan video secara ringan (tanpa querySelectorAll('*')).
 */
function collectCallMediaElements() {
  const videos = [];
  const canvases = [];

  for (const el of document.querySelectorAll('video')) {
    if (
      el.readyState >= 2 &&
      el.videoWidth > 0 &&
      el.videoHeight > 0 &&
      !el.paused &&
      !el.ended
    ) {
      videos.push(el);
    }
  }

  for (const el of document.querySelectorAll('canvas')) {
    const r = el.getBoundingClientRect();
    if (
      el.width >= 100 &&
      el.height >= 100 &&
      r.width >= 100 &&
      r.height >= 100 &&
      r.width <= window.innerWidth * 0.92
    ) {
      canvases.push(el);
    }
  }

  return { videos, canvases };
}

/**
 * Klasifikasi sumber media panggilan:
 * - Di WhatsApp Web / WebRTC, <video> pertama di DOM (index 0) yang muted umumnya adalah
 *   preview kamera lokal (Kamera Saya), sedangkan <video> berikutnya (atau yang tidak muted,
 *   atau berukuran paling besar di layar) adalah Lawan Bicara.
 */
function classifyMediaSources(videos, canvases) {
  const entries = [];

  if (videos.length === 1) {
    // Jika di WhatsApp Web hanya ada 1 <video> (kamera lokal) dan ada <canvas> (layar call lawan bicara),
    // tandai <video> tersebut sebagai Kamera Saya agar <canvas> Lawan Bicara yang diprioritaskan.
    const isSelfWhenCanvasPresent = canvases.length > 0;
    entries.push({
      video: videos[0],
      isSelf: isSelfWhenCanvasPresent,
      label: isSelfWhenCanvasPresent ? 'Kamera Saya (#1)' : 'Video #1',
    });
  } else if (videos.length > 1) {
    // Cek apakah elemen <video> memiliki ukuran layar nyata atau disembunyikan (rect 0x0 seperti di WA Web)
    const maxScreenArea = Math.max(...videos.map(getElementScreenArea));

    videos.forEach((v, idx) => {
      let isSelf = false;
      if (maxScreenArea > 2500) {
        // Jika <video> terlihat di layar: kotak paling kecil (PiP) = Kamera Saya
        const area = getElementScreenArea(v);
        isSelf = area < maxScreenArea * 0.6;
      } else {
        // Jika <video> disembunyikan (WA Web): video pertama yang muted = Kamera Saya,
        // sedangkan video terakhir / tidak muted = Lawan Bicara
        const hasUnmuted = videos.some((vid) => !vid.muted);
        if (hasUnmuted) {
          isSelf = Boolean(v.muted);
        } else {
          isSelf = idx === 0;
        }
      }

      entries.push({
        video: v,
        isSelf,
        label: isSelf ? `Kamera Saya (#${idx + 1})` : `Lawan Bicara (#${idx + 1})`,
      });
    });
  }

  // Tambahkan juga <canvas> video call yang terlihat (jika WA Web merender remote peer ke canvas)
  canvases.forEach((c, idx) => {
    entries.push({
      video: c,
      isSelf: false,
      isCanvas: true,
      label: `Layar Call #${idx + 1}`,
    });
  });

  // Urutkan agar Lawan Bicara selalu di urutan pertama (#0)
  entries.sort((a, b) => Number(a.isSelf) - Number(b.isSelf));
  return entries;
}

class IsyaratLiveController {
  constructor() {
    this.enabled = true;
    this.detectorReady = false;
    this.detectorInitializing = false;
    this.inFlight = false;

    this.classifier = new KNNClassifier({
      k: 5,
      maxDistance: 1.45,
      minConfidence: 0.68,
    });
    // Tahan pose stabil ~0.55 detik (6 dari 8 frame) + jeda global 1.1 detik antar huruf/kata
    this.stability = new StabilityBuffer({
      windowSize: 8,
      minConsensus: 6,
      cooldownMs: 1600,
      globalCooldownMs: 1100,
      preventConsecutiveDuplicate: true,
      maxMotionDelta: 0.22,
    });
    this.noHandFrames = 0;

    this.ui = null;
    this.videoEntries = []; // [{ video, isSelf }]
    this.selectedVideoMode = 'auto';
    this.recognitionMode = 'all'; // 'all' (Kata + Huruf) | 'letters' (Huruf A-Z) | 'words' (Kata Saja)
    this.observer = null;
    this.rafId = null;
    this.lastFrameTime = 0;
    this.modelError = null;

    // Offscreen capture canvas for sending compact JPEG frames to MV3 offscreen AI engine
    this.captureCanvas = document.createElement('canvas');
    this.captureCanvas.width = CAPTURE_WIDTH;
    this.captureCanvas.height = CAPTURE_HEIGHT;
    this.captureCtx = this.captureCanvas.getContext('2d', {
      willReadFrequently: false,
    });

    // Quick-Train burst capture state
    this.recording = null;
  }

  async start() {
    const stored = await chrome.storage.local.get([
      STORAGE_KEYS.ENABLED,
      STORAGE_KEYS.DATASET,
      STORAGE_KEYS.DATASET_VERSION,
    ]);

    this.enabled =
      typeof stored[STORAGE_KEYS.ENABLED] === 'boolean'
        ? stored[STORAGE_KEYS.ENABLED]
        : true;

    if (
      stored[STORAGE_KEYS.DATASET]?.samples?.length > 0 &&
      stored[STORAGE_KEYS.DATASET_VERSION] === CURRENT_DATASET_VERSION
    ) {
      this.classifier.importDataset(stored[STORAGE_KEYS.DATASET], false);
    } else {
      // Auto-upgrade to combined SIBI A-Z + WL-BISINDO dataset v3
      await this._loadDefaultDataset(false);
    }

    this.ui = new OverlayUI({
      onSelectVideo: (mode) => {
        this.selectedVideoMode = mode;
      },
      onSelectRecognitionMode: (mode) => {
        this.recognitionMode = mode;
        this.stability.reset();
      },
      onCycleVideo: () => this._cycleVideoSource(),
      onRecordLabel: (label) => this._startRecording(label),
      onDeleteLabel: (label) => this._deleteLabel(label),
      onExportDataset: () => this._exportDataset(),
      onImportDataset: (json) => this._importDataset(json),
      onClearDataset: () => this._clearDataset(),
      onLoadDefaultDataset: () => this._loadDefaultDataset(true),
    });

    this.ui.renderDatasetList(this.classifier.getLabelCounts());
    this.ui.setVisible(this.enabled);

    this._listenMessages();
    this._watchVideos();

    if (this.enabled) {
      await this._ensureDetector();
      this._startLoop();
    }
  }

  _listenMessages() {
    chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      if (!message?.type) return false;

      if (message.type === 'TOGGLE_ENABLED') {
        this.setEnabled(Boolean(message.enabled));
        sendResponse({ ok: true });
        return true;
      }

      if (message.type === 'OPEN_QUICK_TRAIN') {
        this.setEnabled(true);
        this.ui.setCollapsed(false);
        this.ui.switchTab('quick-train');
        sendResponse({ ok: true });
        return true;
      }

      if (message.type === 'GET_STATUS') {
        sendResponse({
          ok: true,
          enabled: this.enabled,
          videoCount: this.videoEntries.length,
          detectorReady: this.detectorReady,
          sampleCount: this.classifier.sampleCount,
        });
        return true;
      }

      return false;
    });
  }

  async setEnabled(enabled) {
    this.enabled = enabled;
    this.ui?.setVisible(enabled);
    if (enabled) {
      await this._ensureDetector();
      this._startLoop();
    } else {
      this._stopLoop();
    }
  }

  async _ensureDetector() {
    if (this.detectorReady || this.detectorInitializing) return;

    this.detectorInitializing = true;
    this.ui.setStatus('Memuat MediaPipe lokal...', 'warn');
    try {
      const offscreenRes = await chrome.runtime.sendMessage({
        type: 'ENSURE_OFFSCREEN',
      });
      if (!offscreenRes?.ok) {
        throw new Error(offscreenRes?.error || 'Gagal membuat offscreen engine.');
      }

      const initRes = await chrome.runtime.sendMessage({
        type: 'OFFSCREEN_INIT',
      });
      if (!initRes?.ok) {
        throw new Error(initRes?.error || 'Gagal inisialisasi HandLandmarker.');
      }

      this.detectorReady = true;
      this.modelError = null;
      this.ui.setStatus('Model lokal siap', 'live');
      this.ui.setMeta('Menunggu video call lawan bicara...');
    } catch (err) {
      this.modelError = err?.message || String(err);
      this.ui.setStatus('Gagal memuat model', 'err');
      this.ui.setMeta(`Error: ${this.modelError}`);
    } finally {
      this.detectorInitializing = false;
    }
  }

  _scanVideos() {
    const { videos, canvases } = collectCallMediaElements();
    const entries = classifyMediaSources(videos, canvases);

    const changed =
      entries.length !== this.videoEntries.length ||
      entries.some(
        (e, i) =>
          e.video !== this.videoEntries[i]?.video ||
          e.isSelf !== this.videoEntries[i]?.isSelf
      );

    this.videoEntries = entries;
    if (changed) {
      this.ui?.updateVideoOptions(this.videoEntries, this.selectedVideoMode);
    }
  }

  _getActiveVideoEntry() {
    if (this.videoEntries.length === 0) return null;

    if (this.selectedVideoMode !== 'auto') {
      const idx = Number(this.selectedVideoMode);
      if (this.videoEntries[idx]) return this.videoEntries[idx];
    }

    // Jika sedang merekam Quick-Train, prioritaskan kamera sendiri jika ada
    if (this.recording) {
      const selfEntry = this.videoEntries.find((e) => e.isSelf);
      if (selfEntry) return selfEntry;
    }

    // Mode Auto: pilih sumber pertama yang bukan Kamera Saya (Lawan Bicara)
    const remoteEntry = this.videoEntries.find((e) => !e.isSelf);
    return remoteEntry || this.videoEntries[0];
  }

  _cycleVideoSource() {
    if (this.videoEntries.length <= 1) return;
    const current = this._getActiveVideoEntry();
    const curIdx = this.videoEntries.indexOf(current);
    const nextIdx = (curIdx + 1) % this.videoEntries.length;
    this.selectedVideoMode = String(nextIdx);
    this.ui?.updateVideoOptions(this.videoEntries, this.selectedVideoMode);
  }

  _watchVideos() {
    this._scanVideos();
    let scanPending = false;
    this.observer = new MutationObserver(() => {
      if (scanPending) return;
      scanPending = true;
      setTimeout(() => {
        scanPending = false;
        this._scanVideos();
      }, 1200);
    });
    this.observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
    setInterval(() => this._scanVideos(), 2000);
  }

  _startLoop() {
    if (this.rafId !== null) return;
    const tick = (now) => {
      this.rafId = requestAnimationFrame(tick);
      if (!this.enabled) return;
      if (now - this.lastFrameTime < FRAME_INTERVAL_MS) return;
      if (this.inFlight) return;
      this.lastFrameTime = now;
      this._processFrame();
    };
    this.rafId = requestAnimationFrame(tick);
  }

  _stopLoop() {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  async _processFrame() {
    if (this.modelError || !this.detectorReady) return;

    const entry = this._getActiveVideoEntry();
    this.ui.syncSubtitlePosition(entry?.video || null);

    if (!entry) {
      this.ui.setStatus('Menunggu video call aktif...', 'warn');
      return;
    }

    const activeIdx = this.videoEntries.indexOf(entry);
    const roleText =
      entry.label || (entry.isSelf ? 'Kamera Saya' : 'Lawan Bicara');
    this.ui.setStatus(
      `Aktif • ${roleText} (${this.videoEntries.length} sumber)`,
      'live'
    );
    this.ui.drawAllVideoPreviews(
      this.videoEntries,
      activeIdx,
      this.lastPreviewPoints
    );

    let dataUrl;
    try {
      // Jaga aspect ratio asli video/canvas agar tangan tidak gepeng di layar portrait HP / 16:9
      const srcW = entry.video.videoWidth || entry.video.width || CAPTURE_WIDTH;
      const srcH = entry.video.videoHeight || entry.video.height || CAPTURE_HEIGHT;
      const maxDim = 256;
      const scale = Math.min(maxDim / srcW, maxDim / srcH, 1);
      const targetW = Math.max(64, Math.round(srcW * scale));
      const targetH = Math.max(64, Math.round(srcH * scale));
      if (
        this.captureCanvas.width !== targetW ||
        this.captureCanvas.height !== targetH
      ) {
        this.captureCanvas.width = targetW;
        this.captureCanvas.height = targetH;
      }
      this.captureCtx.drawImage(entry.video, 0, 0, targetW, targetH);
      this.ui.drawVideoPreview(entry.video);
      dataUrl = this.captureCanvas.toDataURL('image/jpeg', 0.7);
    } catch {
      return;
    }

    this.inFlight = true;
    let detection;
    try {
      detection = await chrome.runtime.sendMessage({
        type: 'OFFSCREEN_DETECT_FRAME',
        dataUrl,
      });
    } catch {
      this.inFlight = false;
      return;
    }
    this.inFlight = false;

    if (!detection?.ok || !detection.vectors || detection.vectors.length === 0) {
      this.lastPreviewPoints = null;
      this.noHandFrames++;
      // Jika tangan turun/keluar kamera selama ~1.5 detik (24 frame), otomatis finalkan kata yang sedang dieja
      if (this.noHandFrames === 24) {
        this.ui.finalizeCurrentWord();
      }
      this.stability.push(null, Date.now(), null);
      this.ui.updateLivePrediction(null, 0, 0, 0);
      return;
    }

    this.noHandFrames = 0;
    this.lastPreviewPoints = detection.previewPoints || null;
    const vector = detection.vectors[0];

    // Quick-Train recording mode
    if (this.recording && this.recording.remaining > 0) {
      this.classifier.addSample(this.recording.label, vector);
      this.recording.remaining--;
      this.recording.captured++;
      this.ui.setTrainStatus(
        `Merekam "${this.recording.label}": ${this.recording.captured}/${this.recording.total} sampel...`
      );

      if (this.recording.remaining === 0) {
        const doneLabel = this.recording.label;
        const doneCount = this.recording.captured;
        this.recording = null;
        this._saveDataset().then(() => {
          this.ui.renderDatasetList(this.classifier.getLabelCounts());
          this.ui.setTrainStatus(
            `Selesai! ${doneCount} sampel "${doneLabel}" disimpan ke chrome.storage.local.`
          );
        });
      }
      return;
    }

    // Hybrid Prediction Engine (Supports 'all' = Kata + Huruf A-Z, 'letters' = Huruf A-Z, 'words' = Kata Saja)
    const mode = this.recognitionMode || 'all';
    const knnPred = this.classifier.predict(vector, mode);
    const geoWord = detection.geometricSign;
    const geoLetter = detection.geometricLetter;

    let finalLabel = null;
    let finalConfidence = 0;
    const latencyMs = knnPred.latencyMs || 0.2;

    if (mode === 'letters') {
      // Mode Huruf A-Z: utamakan geometri 24 huruf statis + KNN yang sudah dikalibrasi
      if (geoLetter?.label) {
        finalLabel = geoLetter.label;
        finalConfidence = geoLetter.confidence;
      } else if (knnPred.label) {
        finalLabel = knnPred.label;
        finalConfidence = knnPred.confidence;
      }
    } else if (mode === 'words') {
      // Mode Kata Saja
      if (knnPred.label && knnPred.distance <= 0.65 && knnPred.confidence >= 0.82) {
        finalLabel = knnPred.label;
        finalConfidence = knnPred.confidence;
      } else if (geoWord?.label) {
        finalLabel = geoWord.label;
        finalConfidence = geoWord.confidence;
      } else if (knnPred.label) {
        finalLabel = knnPred.label;
        finalConfidence = knnPred.confidence;
      }
    } else {
      // Mode Kata + Huruf A-Z (Default)
      const NON_CONFLICT_LETTERS = new Set([
        'A', 'B', 'C', 'E', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'X',
      ]);
      if (
        geoLetter?.label &&
        NON_CONFLICT_LETTERS.has(geoLetter.label)
      ) {
        finalLabel = geoLetter.label;
        finalConfidence = geoLetter.confidence;
      } else if (geoWord?.label) {
        finalLabel = geoWord.label;
        finalConfidence = geoWord.confidence;
      } else if (geoLetter?.label) {
        finalLabel = geoLetter.label;
        finalConfidence = geoLetter.confidence;
      } else if (knnPred.label) {
        finalLabel = knnPred.label;
        finalConfidence = knnPred.confidence;
      }
    }

    const stabilityResult = this.stability.push(
      finalLabel,
      Date.now(),
      vector
    );

    this.ui.updateLivePrediction(
      finalLabel,
      finalConfidence,
      latencyMs,
      stabilityResult.holdProgress ?? 0,
      Boolean(stabilityResult.inCooldown)
    );

    if (stabilityResult.committed && stabilityResult.stableLabel) {
      this.ui.appendTranscript(stabilityResult.stableLabel);
    }
  }

  _startRecording(rawLabel) {
    const label = rawLabel.trim().toUpperCase();
    if (!label) return;
    if (!this.detectorReady) {
      this.ui.setTrainStatus('Model MediaPipe belum siap.');
      return;
    }
    this.recording = { label, remaining: 15, total: 15, captured: 0 };
    this.ui.setTrainStatus(`Tahan pose "${label}" di depan kamera...`);
  }

  async _deleteLabel(label) {
    this.classifier.removeLabel(label);
    await this._saveDataset();
    this.ui.renderDatasetList(this.classifier.getLabelCounts());
    this.ui.setTrainStatus(`Label "${label}" dihapus.`);
  }

  async _clearDataset() {
    this.classifier.clear();
    await this._saveDataset();
    this.ui.renderDatasetList(this.classifier.getLabelCounts());
    this.ui.setTrainStatus('Semua sampel dataset telah dihapus.');
  }

  async _importDataset(json) {
    const added = this.classifier.importDataset(json, true);
    await this._saveDataset();
    this.ui.renderDatasetList(this.classifier.getLabelCounts());
    this.ui.setTrainStatus(`Berhasil mengimpor ${added} sampel.`);
  }

  _exportDataset() {
    const data = this.classifier.exportDataset();
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'isyarat-live-dataset.json';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    this.ui.setTrainStatus('Dataset diekspor sebagai isyarat-live-dataset.json.');
  }

  async _loadDefaultDataset(notifyUI = true) {
    try {
      const res = await chrome.runtime.sendMessage({
        type: 'LOAD_DEFAULT_DATASET',
      });
      if (!res?.ok || !res.dataset) throw new Error('Dataset kosong');
      const added = this.classifier.importDataset(res.dataset, false);
      await this._saveDataset();
      if (notifyUI && this.ui) {
        this.ui.renderDatasetList(this.classifier.getLabelCounts());
        this.ui.setTrainStatus(
          `Dataset bawaan (${added} sampel Huruf A-Z & Kata) berhasil dimuat.`
        );
      }
    } catch {
      if (notifyUI && this.ui) {
        this.ui.setTrainStatus('Dataset bawaan tidak ditemukan.');
      }
    }
  }

  async _saveDataset() {
    await chrome.storage.local.set({
      [STORAGE_KEYS.DATASET]: this.classifier.exportDataset(),
      [STORAGE_KEYS.DATASET_VERSION]: CURRENT_DATASET_VERSION,
    });
  }
}

if (!window.__ISYARAT_LIVE_BOOTED__) {
  window.__ISYARAT_LIVE_BOOTED__ = true;
  const controller = new IsyaratLiveController();
  controller.start();
}
