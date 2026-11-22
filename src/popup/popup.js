const SUPPORTED_HOSTS = [
  { host: 'meet.google.com', name: 'Google Meet' },
  { host: 'web.whatsapp.com', name: 'WhatsApp Web' },
  { host: 'umingle.com', name: 'Umingle' },
];

function detectPlatform(url = '') {
  try {
    const { hostname } = new URL(url);
    return SUPPORTED_HOSTS.find(
      (item) => hostname === item.host || hostname.endsWith(`.${item.host}`)
    );
  } catch {
    return null;
  }
}

async function initPopup() {
  const toggleEl = document.getElementById('toggle-enabled');
  const platformEl = document.getElementById('platform-status');
  const labelsEl = document.getElementById('stat-labels');
  const samplesEl = document.getElementById('stat-samples');
  const quickTrainBtn = document.getElementById('btn-quick-train');

  const state = await chrome.runtime.sendMessage({ type: 'GET_STATE' });
  if (state?.ok) {
    toggleEl.checked = Boolean(state.enabled);
    labelsEl.textContent = String(state.labelCount ?? 0);
    samplesEl.textContent = String(state.sampleCount ?? 0);
  }

  const [activeTab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });
  const platform = detectPlatform(activeTab?.url);

  if (platform) {
    platformEl.textContent = `Terhubung ke ${platform.name}`;
    quickTrainBtn.disabled = false;
  } else {
    platformEl.textContent = 'Buka Umingle, WhatsApp Web, atau Meet';
    quickTrainBtn.disabled = true;
  }

  toggleEl.addEventListener('change', async () => {
    await chrome.runtime.sendMessage({
      type: 'SET_ENABLED',
      enabled: toggleEl.checked,
    });
  });

  quickTrainBtn.addEventListener('click', async () => {
    if (!activeTab?.id) return;
    try {
      await chrome.tabs.sendMessage(activeTab.id, { type: 'OPEN_QUICK_TRAIN' });
      window.close();
    } catch {
      platformEl.textContent = 'Muat ulang halaman video call terlebih dahulu.';
    }
  });
}

initPopup();
