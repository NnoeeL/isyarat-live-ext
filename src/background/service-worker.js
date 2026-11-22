/**
 * Background Service Worker (Manifest V3) for Isyarat-Live.
 * Manages extension state, badge indicator, offscreen AI document lifecycle,
 * and popup <-> content messaging.
 */

const STORAGE_KEYS = {
  ENABLED: 'isyarat_enabled',
  DATASET: 'isyarat_knn_dataset',
};

const OFFSCREEN_URL = 'offscreen.html';
let creatingOffscreen = null;

async function ensureOffscreenDocument() {
  if (!chrome.offscreen) {
    throw new Error('chrome.offscreen API tidak tersedia di browser ini.');
  }

  const existingContexts = await chrome.runtime.getContexts({
    contextTypes: ['OFFSCREEN_DOCUMENT'],
    documentUrls: [chrome.runtime.getURL(OFFSCREEN_URL)],
  });

  if (existingContexts.length > 0) {
    return true;
  }

  if (creatingOffscreen) {
    await creatingOffscreen;
    return true;
  }

  creatingOffscreen = chrome.offscreen.createDocument({
    url: OFFSCREEN_URL,
    reasons: ['WORKERS'],
    justification:
      'Menjalankan MediaPipe HandLandmarker WASM 100% lokal di luar CSP halaman host.',
  });

  try {
    await creatingOffscreen;
  } finally {
    creatingOffscreen = null;
  }

  return true;
}

async function updateBadge(enabled) {
  try {
    await chrome.action.setBadgeText({ text: enabled ? 'ON' : 'OFF' });
    await chrome.action.setBadgeBackgroundColor({
      color: enabled ? '#10b981' : '#64748b',
    });
  } catch {
    // Ignore badge errors in headless/test environments
  }
}

chrome.runtime.onInstalled.addListener(async () => {
  const existing = await chrome.storage.local.get([STORAGE_KEYS.ENABLED]);
  const enabled =
    typeof existing[STORAGE_KEYS.ENABLED] === 'boolean'
      ? existing[STORAGE_KEYS.ENABLED]
      : true;

  await chrome.storage.local.set({ [STORAGE_KEYS.ENABLED]: enabled });
  await updateBadge(enabled);
});

chrome.runtime.onStartup.addListener(async () => {
  const { [STORAGE_KEYS.ENABLED]: enabled = true } =
    await chrome.storage.local.get([STORAGE_KEYS.ENABLED]);
  await updateBadge(enabled);
});

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local' && changes[STORAGE_KEYS.ENABLED]) {
    updateBadge(Boolean(changes[STORAGE_KEYS.ENABLED].newValue));
  }
});

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (!message || !message.type) return false;

  if (message.type === 'ENSURE_OFFSCREEN') {
    ensureOffscreenDocument()
      .then(() => sendResponse({ ok: true }))
      .catch((err) =>
        sendResponse({ ok: false, error: err?.message || String(err) })
      );
    return true;
  }

  if (message.type === 'LOAD_DEFAULT_DATASET') {
    fetch(chrome.runtime.getURL('models/default-dataset.json'))
      .then((r) => r.json())
      .then((dataset) => sendResponse({ ok: true, dataset }))
      .catch((err) =>
        sendResponse({ ok: false, error: err?.message || String(err) })
      );
    return true;
  }

  if (message.type === 'GET_ASSET_DATA_URL') {
    const relPath = String(message.path || '');
    const mime = relPath.endsWith('.svg')
      ? 'image/svg+xml'
      : relPath.endsWith('.mp4')
        ? 'video/mp4'
        : 'application/octet-stream';

    fetch(chrome.runtime.getURL(relPath))
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.arrayBuffer();
      })
      .then((buf) => {
        const b64 = arrayBufferToBase64(buf);
        sendResponse({ ok: true, dataUrl: `data:${mime};base64,${b64}` });
      })
      .catch((err) =>
        sendResponse({ ok: false, error: err?.message || String(err) })
      );
    return true;
  }

  if (message.type === 'SET_ENABLED') {
    const enabled = Boolean(message.enabled);
    chrome.storage.local
      .set({ [STORAGE_KEYS.ENABLED]: enabled })
      .then(async () => {
        await updateBadge(enabled);
        const tabs = await chrome.tabs.query({
          url: [
            'https://umingle.com/*',
            'https://*.umingle.com/*',
            'https://web.whatsapp.com/*',
            'https://meet.google.com/*',
          ],
        });
        for (const tab of tabs) {
          if (tab.id) {
            chrome.tabs
              .sendMessage(tab.id, { type: 'TOGGLE_ENABLED', enabled })
              .catch(() => {});
          }
        }
        sendResponse({ ok: true, enabled });
      });
    return true;
  }

  if (message.type === 'GET_STATE') {
    chrome.storage.local
      .get([STORAGE_KEYS.ENABLED, STORAGE_KEYS.DATASET])
      .then((data) => {
        const enabled =
          typeof data[STORAGE_KEYS.ENABLED] === 'boolean'
            ? data[STORAGE_KEYS.ENABLED]
            : true;
        const samples = data[STORAGE_KEYS.DATASET]?.samples || [];
        const labels = new Set(samples.map((s) => s.label));
        sendResponse({
          ok: true,
          enabled,
          sampleCount: samples.length,
          labelCount: labels.size,
        });
      });
    return true;
  }

  return false;
});
