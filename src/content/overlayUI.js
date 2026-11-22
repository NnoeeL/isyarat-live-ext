import { translateTextToSignSequence } from './textToSign.js';
import { composeSmartSentence } from './sentenceAI.js';

/**
 * Floating Overlay UI rendered inside an isolated Shadow DOM
 * so styles never conflict with Umingle, WhatsApp Web, or Google Meet.
 * Features:
 * - Draggable header + Collapsible floating pill
 * - Tab 1: Sign -> Teks (live prediction, confidence, transcript, TTS, video selector)
 * - Tab 2: Teks -> Sign (Indonesian stemming + animated A-Z SVG fingerspelling)
 * - Tab 3: Quick-Train (capture live KNN samples to chrome.storage.local, export/import)
 */
export class OverlayUI {
  constructor(callbacks = {}) {
    this.callbacks = callbacks;
    this.host = null;
    this.shadow = null;
    this.subtitleHost = null;
    this.subtitleShadow = null;
    this.subtitleEnabled = true;
    this.isCollapsed = false;
    this.activeTab = 'sign-to-text';
    this.transcriptTokens = [];

    // Text -> Sign playback state
    this.signSequence = [];
    this.signIndex = 0;
    this.signTimer = null;
    this.isPlayingSign = false;
    this._videoBlobCache = new Map();

    // Voice -> Sign (Web Speech API) state
    this.recognition = null;
    this.isListeningVoice = false;
    this._voiceAutoRestart = false;
    this._userPausedVoice = false;

    this._mount();
  }

  _mount() {
    const existing = document.getElementById('isyarat-live-root');
    if (existing) existing.remove();

    this.host = document.createElement('div');
    this.host.id = 'isyarat-live-root';
    this.host.style.cssText =
      'position:fixed;bottom:20px;right:20px;z-index:2147483647;font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,sans-serif;';

    this.shadow = this.host.attachShadow({ mode: 'open' });
    this.shadow.innerHTML = this._template();
    document.documentElement.appendChild(this.host);

    this._mountSubtitle();
    this._bindEvents();
    this._bindDrag();
  }

  _mountSubtitle() {
    const existingSub = document.getElementById('isyarat-live-subtitle-root');
    if (existingSub) existingSub.remove();

    this.subtitleHost = document.createElement('div');
    this.subtitleHost.id = 'isyarat-live-subtitle-root';
    this.subtitleHost.style.cssText =
      'position:fixed;left:50%;bottom:28px;transform:translateX(-50%);z-index:2147483646;pointer-events:none;max-width:80vw;transition:top 0.12s linear,left 0.12s linear;';

    this.subtitleShadow = this.subtitleHost.attachShadow({ mode: 'open' });
    this.subtitleShadow.innerHTML = `
      <style>
        :host {
          all: initial;
          font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, sans-serif;
        }
        .cc-wrap {
          display: none;
          flex-direction: column;
          align-items: center;
          gap: 5px;
        }
        .cc-wrap.visible {
          display: flex;
        }
        .cc-box {
          background: rgba(28, 25, 23, 0.82);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.14);
          color: #fafaf9;
          padding: 9px 20px;
          border-radius: 14px;
          font-size: 19px;
          font-weight: 600;
          line-height: 1.4;
          letter-spacing: -0.01em;
          text-align: center;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.28);
          max-width: 680px;
          word-break: break-word;
        }
        .cc-tag {
          font-size: 11px;
          font-weight: 500;
          color: #e7e5e4;
          background: rgba(28, 25, 23, 0.72);
          backdrop-filter: blur(8px);
          padding: 3px 10px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.12);
        }
      </style>
      <div class="cc-wrap" id="cc-wrap">
        <span class="cc-tag" id="cc-live-tag" style="display:none"></span>
        <div class="cc-box" id="cc-text"></div>
      </div>
    `;
    document.documentElement.appendChild(this.subtitleHost);
  }

  _template() {
    return `
      <style>
        :host {
          all: initial;
          font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, sans-serif;
          color: #1c1917;
        }
        * {
          box-sizing: border-box;
        }
        .panel {
          width: 344px;
          background: rgba(252, 251, 249, 0.96);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          border: 1px solid rgba(28, 25, 23, 0.09);
          border-radius: 18px;
          box-shadow: 0 18px 44px rgba(28, 25, 23, 0.14), 0 2px 6px rgba(28, 25, 23, 0.06);
          overflow: hidden;
          color: #1c1917;
          transition: opacity 0.2s ease, transform 0.2s ease;
        }
        .panel.hidden {
          display: none;
        }
        .pill {
          display: none;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          border-radius: 999px;
          background: rgba(252, 251, 249, 0.96);
          backdrop-filter: blur(14px);
          border: 1px solid rgba(28, 25, 23, 0.1);
          color: #1c1917;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: -0.01em;
          cursor: pointer;
          box-shadow: 0 10px 26px rgba(28, 25, 23, 0.12);
          user-select: none;
        }
        .pill.visible {
          display: inline-flex;
        }
        .dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #a8a29e;
          flex-shrink: 0;
        }
        .dot.live {
          background: #4d7c6f;
        }
        .dot.warn {
          background: #c28a3d;
        }
        .dot.err {
          background: #b95656;
        }
        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 14px 10px;
          background: transparent;
          cursor: grab;
          user-select: none;
        }
        .header:active {
          cursor: grabbing;
        }
        .brand {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13.5px;
          font-weight: 600;
          letter-spacing: -0.01em;
          color: #1c1917;
        }
        .header-actions {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .icon-btn {
          background: transparent;
          border: none;
          color: #78716c;
          width: 26px;
          height: 26px;
          border-radius: 8px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          transition: background 0.15s, color 0.15s;
        }
        .icon-btn:hover {
          background: #efece6;
          color: #1c1917;
        }
        .tabs {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 3px;
          margin: 0 14px;
          padding: 3px;
          background: #efece6;
          border-radius: 11px;
        }
        .tab-btn {
          background: transparent;
          border: none;
          color: #78716c;
          font-size: 11.5px;
          font-weight: 500;
          padding: 6px 6px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .tab-btn.active {
          background: #ffffff;
          color: #1c1917;
          font-weight: 600;
          box-shadow: 0 1px 3px rgba(28, 25, 23, 0.08);
        }
        .body {
          padding: 14px;
        }
        .tab-pane {
          display: none;
        }
        .tab-pane.active {
          display: block;
        }
        .mode-switch {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 3px;
          background: #efece6;
          padding: 3px;
          border-radius: 9px;
          margin-bottom: 9px;
        }
        .mode-btn {
          background: transparent;
          border: none;
          color: #78716c;
          font-size: 11px;
          font-weight: 500;
          padding: 4px 6px;
          border-radius: 7px;
          cursor: pointer;
          transition: all 0.14s ease;
        }
        .mode-btn.active {
          background: #ffffff;
          color: #2f5d50;
          font-weight: 600;
          box-shadow: 0 1px 2px rgba(28, 25, 23, 0.08);
        }
        .status-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          font-size: 11.5px;
          color: #78716c;
          margin-bottom: 10px;
        }
        .select {
          background: #f5f3ef;
          color: #44403c;
          border: 1px solid rgba(28, 25, 23, 0.09);
          border-radius: 8px;
          padding: 4px 8px;
          font-size: 11px;
          max-width: 162px;
          outline: none;
        }
        .live-card {
          background: #f5f3ef;
          border: 1px solid rgba(28, 25, 23, 0.06);
          border-radius: 14px;
          padding: 12px;
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 10px;
        }
        .source-strip {
          display: flex;
          gap: 6px;
          margin-bottom: 10px;
          overflow-x: auto;
          padding-bottom: 2px;
        }
        .source-thumb {
          position: relative;
          width: 74px;
          height: 52px;
          border-radius: 9px;
          overflow: hidden;
          background: #e7e5e4;
          border: 2px solid transparent;
          cursor: pointer;
          flex-shrink: 0;
          padding: 0;
        }
        .source-thumb.active {
          border-color: #4d7c6f;
          box-shadow: 0 2px 8px rgba(77, 124, 111, 0.25);
        }
        .source-thumb canvas {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
        }
        .source-badge {
          position: absolute;
          left: 3px;
          bottom: 3px;
          right: 3px;
          background: rgba(28, 25, 23, 0.75);
          color: #fafaf9;
          font-size: 9px;
          font-weight: 500;
          padding: 1px 4px;
          border-radius: 4px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          text-align: center;
        }
        .live-info {
          flex: 1;
          min-width: 0;
          text-align: left;
        }
        .live-label {
          font-size: 26px;
          font-weight: 700;
          letter-spacing: -0.02em;
          color: #2f5d50;
          min-height: 34px;
        }
        .live-sub {
          font-size: 11.5px;
          color: #78716c;
          margin-top: 4px;
        }
        .conf-bar {
          height: 4px;
          background: rgba(28, 25, 23, 0.08);
          border-radius: 999px;
          overflow: hidden;
          margin-top: 10px;
        }
        .conf-fill {
          height: 100%;
          width: 0%;
          background: #4d7c6f;
          border-radius: 999px;
          transition: width 0.14s ease;
        }
        .transcript-box {
          background: #ffffff;
          border: 1px solid rgba(28, 25, 23, 0.09);
          border-radius: 12px;
          padding: 10px 12px;
          min-height: 58px;
          max-height: 92px;
          overflow-y: auto;
          font-size: 13px;
          line-height: 1.5;
          color: #1c1917;
          word-break: break-word;
          margin-bottom: 10px;
        }
        .btn-row {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }
        .btn {
          flex: 1;
          background: #f5f3ef;
          color: #44403c;
          border: 1px solid rgba(28, 25, 23, 0.08);
          border-radius: 10px;
          padding: 7px 10px;
          font-size: 11.5px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.15s, border-color 0.15s;
        }
        .btn:hover {
          background: #eae6de;
        }
        .btn.primary {
          background: #4d7c6f;
          border-color: #4d7c6f;
          color: #ffffff;
          font-weight: 600;
        }
        .btn.primary:hover {
          background: #3f685d;
        }
        .btn.danger {
          background: #fdf2f2;
          border-color: rgba(185, 86, 86, 0.22);
          color: #a84848;
        }
        .btn.danger:hover {
          background: #fae5e5;
        }
        .btn.listening {
          background: #b95656;
          border-color: #b95656;
          color: #ffffff;
        }
        .input {
          width: 100%;
          background: #ffffff;
          border: 1px solid rgba(28, 25, 23, 0.12);
          border-radius: 10px;
          padding: 8px 11px;
          color: #1c1917;
          font-size: 12.5px;
          outline: none;
          transition: border-color 0.15s;
        }
        .input:focus {
          border-color: #4d7c6f;
        }
        .input::placeholder {
          color: #a8a29e;
        }
        .chips {
          display: flex;
          gap: 5px;
          flex-wrap: wrap;
          margin: 9px 0;
        }
        .chip {
          background: #f5f3ef;
          border: 1px solid rgba(28, 25, 23, 0.08);
          color: #57534e;
          border-radius: 999px;
          padding: 4px 10px;
          font-size: 11px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.15s, color 0.15s;
        }
        .chip:hover {
          background: #e8f1ee;
          border-color: rgba(77, 124, 111, 0.28);
          color: #2f5d50;
        }
        .sign-stage {
          background: #f5f3ef;
          border: 1px solid rgba(28, 25, 23, 0.06);
          border-radius: 14px;
          padding: 14px;
          min-height: 165px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          margin: 8px 0;
        }
        .sign-stage img {
          width: 96px;
          height: 96px;
          object-fit: contain;
          margin-bottom: 8px;
          border-radius: 12px;
        }
        .sign-stage video {
          width: 248px;
          height: 152px;
          object-fit: cover;
          border-radius: 12px;
          border: 1px solid rgba(28, 25, 23, 0.08);
          background: #1c1917;
          margin-bottom: 8px;
        }
        .sign-word-icon {
          font-size: 40px;
          line-height: 1.1;
          margin-bottom: 6px;
        }
        .sign-stage-title {
          font-size: 14.5px;
          font-weight: 600;
          color: #2f5d50;
          letter-spacing: -0.01em;
        }
        .sign-stage-cue {
          font-size: 11.5px;
          color: #78716c;
          margin-top: 4px;
          line-height: 1.45;
        }
        .seq-strip {
          display: flex;
          gap: 5px;
          flex-wrap: wrap;
          margin-bottom: 10px;
          max-height: 52px;
          overflow-y: auto;
        }
        .seq-item {
          font-size: 10.5px;
          padding: 3px 8px;
          border-radius: 7px;
          background: #efece6;
          color: #57534e;
          font-weight: 500;
        }
        .seq-item.current {
          background: #4d7c6f;
          color: #ffffff;
          font-weight: 600;
        }
        .train-list {
          max-height: 112px;
          overflow-y: auto;
          margin: 8px 0;
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        .train-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #f5f3ef;
          border-radius: 9px;
          padding: 6px 10px;
          font-size: 11.5px;
          color: #44403c;
        }
        .train-del {
          background: transparent;
          border: none;
          color: #a84848;
          cursor: pointer;
          font-size: 11px;
          font-weight: 500;
        }
        .hint {
          font-size: 11.5px;
          color: #78716c;
          line-height: 1.45;
          margin: 6px 0;
        }
      </style>

      <div class="pill" id="collapsed-pill" title="Buka Isyarat-Live">
        <span class="dot" id="pill-dot"></span>
        <span>Isyarat-Live</span>
      </div>

      <div class="panel" id="main-panel">
        <div class="header" id="drag-handle">
          <div class="brand">
            <span class="dot" id="header-dot"></span>
            <span>Isyarat-Live</span>
          </div>
          <div class="header-actions">
            <button class="icon-btn" id="btn-collapse" title="Minimalkan">—</button>
          </div>
        </div>

        <div class="tabs">
          <button class="tab-btn active" data-tab="sign-to-text">Sign → Teks</button>
          <button class="tab-btn" data-tab="text-to-sign">Teks → Sign</button>
          <button class="tab-btn" data-tab="quick-train">Latih Kata</button>
        </div>

        <div class="body">
          <!-- TAB 1: SIGN -> TEKS -->
          <div class="tab-pane active" id="pane-sign-to-text">
            <div class="status-row">
              <span id="status-text">Mencari video call...</span>
              <div style="display:flex;gap:4px;align-items:center;">
                <select class="select" id="video-select" title="Pilih sumber video">
                  <option value="auto">Auto (Lawan Bicara)</option>
                </select>
                <button class="btn" id="btn-swap-video" style="flex:0 0 auto;padding:4px 8px;font-size:11px;" title="Tukar sumber video (Lawan Bicara / Kamera Saya)">Tukar</button>
              </div>
            </div>

            <div class="mode-switch" title="Pilih mode deteksi: Kata + Huruf A-Z, Huruf A-Z saja, atau Kata saja">
              <button class="mode-btn active" data-mode="all">Kata + A–Z</button>
              <button class="mode-btn" data-mode="letters">Huruf A–Z</button>
              <button class="mode-btn" data-mode="words">Kata Saja</button>
            </div>

            <div class="source-strip" id="source-strip" title="Klik thumbnail untuk memilih video yang ingin diterjemahkan"></div>

            <div class="live-card">
              <div class="live-info" style="text-align:center;">
                <div class="live-label" id="live-sign">—</div>
                <div class="live-sub" id="live-meta">Menunggu gerakan tangan lawan bicara</div>
                <div class="conf-bar"><div class="conf-fill" id="conf-fill"></div></div>
              </div>
            </div>

            <div class="transcript-box" id="transcript-box">
              <span style="color:#a8a29e">Hasil terjemahan kalimat akan muncul di sini...</span>
            </div>

            <div class="hint" style="margin:0 0 8px;font-size:10.5px;">
              Mendukung <b>Huruf A–Z</b> (mis. <b>A</b> kepal jempol di samping, <b>B</b> 4 jari rapat, <b>L</b>, <b>O</b>, <b>U</b>, <b>V</b>, <b>W</b>, <b>Y</b>) & <b>Kata</b> (<b>SAYA</b> tangan di dada · <b>SUKA</b> 🤟 · <b>KAMU</b> ☝️ · <b>HALO</b> ✋ · <b>BAGUS</b> 👍 · <b>TERIMA KASIH</b> 🤚)
            </div>

            <div class="btn-row">
              <button class="btn primary" id="btn-cc" title="Tampilkan subtitle di bawah video">CC: ON</button>
              <button class="btn" id="btn-space">Spasi</button>
              <button class="btn" id="btn-speak">Baca</button>
              <button class="btn" id="btn-copy">Salin</button>
              <button class="btn danger" id="btn-clear">Hapus</button>
            </div>
          </div>

          <!-- TAB 2: TEKS / SUARA -> SIGN -->
          <div class="tab-pane" id="pane-text-to-sign">
            <div style="display:flex;gap:6px;">
              <input class="input" id="tts-input" type="text" placeholder="Bicara langsung atau ketik kata..." />
              <button class="btn" id="btn-voice-sign" style="flex:0 0 auto;min-width:74px;" title="Suara ke Isyarat (id-ID)">Suara</button>
            </div>
            <div class="chips">
              <button class="chip" data-phrase="Saya belajar di rumah">Saya belajar di rumah</button>
              <button class="chip" data-phrase="Terima kasih teman">Terima kasih teman</button>
              <button class="chip" data-phrase="Maaf saya makan">Maaf saya makan</button>
              <button class="chip" data-phrase="Pagi keluarga">Pagi keluarga</button>
            </div>

            <div class="sign-stage" id="sign-stage">
              <div class="sign-stage-cue">Suara otomatis didengarkan saat tab ini dibuka, atau ketik kalimat lalu klik <b>Terjemahkan</b>.</div>
            </div>

            <div class="seq-strip" id="seq-strip"></div>

            <div class="btn-row">
              <button class="btn primary" id="btn-translate-sign">Terjemahkan</button>
              <button class="btn" id="btn-replay-sign">Ulangi</button>
            </div>
          </div>

          <!-- TAB 3: QUICK-TRAIN -->
          <div class="tab-pane" id="pane-quick-train">
            <div class="hint">
              Pilih kata preset atau ketik label sendiri, lalu klik <b>Rekam</b> agar kata tersambung di subtitle bawah video.
            </div>
            <div class="chips" id="word-presets">
              <button class="chip train-preset" data-word="AKU">AKU</button>
              <button class="chip train-preset" data-word="SUKA">SUKA</button>
              <button class="chip train-preset" data-word="KAMU">KAMU</button>
              <button class="chip train-preset" data-word="KITA">KITA</button>
              <button class="chip train-preset" data-word="HALO">HALO</button>
              <button class="chip train-preset" data-word="TERIMA KASIH">TERIMA KASIH</button>
              <button class="chip train-preset" data-word="MAAF">MAAF</button>
              <button class="chip train-preset" data-word="TOLONG">TOLONG</button>
              <button class="chip train-preset" data-word="YA">YA</button>
              <button class="chip train-preset" data-word="TIDAK">TIDAK</button>
            </div>
            <div style="display:flex;gap:6px;margin-bottom:8px;">
              <input class="input" id="train-label" type="text" maxlength="24" placeholder="Label kata (mis. AKU, SUKA)" />
              <button class="btn primary" id="btn-record" style="flex:0 0 auto;min-width:102px;">Rekam (15x)</button>
            </div>
            <div class="hint" id="train-status">Siap merekam sampel tangan.</div>
            <div class="train-list" id="train-list"></div>
            <div class="btn-row">
              <button class="btn" id="btn-load-default" title="Muat ulang dataset bawaan (32 Kata WL-BISINDO)">Muat Default</button>
              <button class="btn" id="btn-export">Export</button>
              <button class="btn" id="btn-import">Import</button>
              <button class="btn danger" id="btn-clear-dataset">Reset</button>
            </div>
            <input type="file" id="import-file" accept="application/json" style="display:none" />
          </div>
        </div>
      </div>
    `;
  }

  _q(selector) {
    return this.shadow.querySelector(selector);
  }

  _bindEvents() {
    // Collapse / expand
    this._q('#btn-collapse').addEventListener('click', () => this.setCollapsed(true));
    this._q('#collapsed-pill').addEventListener('click', () => this.setCollapsed(false));

    // Tabs
    this.shadow.querySelectorAll('.tab-btn').forEach((btn) => {
      btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
    });

    // Recognition mode selector (Kata + A-Z / Huruf A-Z / Kata Saja)
    this.shadow.querySelectorAll('.mode-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.shadow.querySelectorAll('.mode-btn').forEach((b) =>
          b.classList.toggle('active', b === btn)
        );
        this.callbacks.onSelectRecognitionMode?.(btn.dataset.mode);
      });
    });

    // Video selector & quick swap
    this._q('#video-select').addEventListener('change', (e) => {
      this.callbacks.onSelectVideo?.(e.target.value);
    });
    this._q('#btn-swap-video').addEventListener('click', () => {
      this.callbacks.onCycleVideo?.();
    });

    // Transcript & Subtitle CC actions
    this._q('#btn-cc').addEventListener('click', () => {
      this.subtitleEnabled = !this.subtitleEnabled;
      const btn = this._q('#btn-cc');
      btn.textContent = this.subtitleEnabled ? 'CC: ON' : 'CC: OFF';
      btn.classList.toggle('primary', this.subtitleEnabled);
      this._renderSubtitle();
    });
    this._q('#btn-space').addEventListener('click', () => {
      this.appendTranscript(' ');
    });
    this._q('#btn-clear').addEventListener('click', () => {
      this.transcriptTokens = [];
      this._renderTranscript();
    });
    this._q('#btn-copy').addEventListener('click', async () => {
      const text = this.getTranscriptText();
      if (!text) return;
      try {
        await navigator.clipboard.writeText(text);
        this.setMeta('Teks disalin ke clipboard');
      } catch {
        this.setMeta('Gagal menyalin teks');
      }
    });
    this._q('#btn-speak').addEventListener('click', () => {
      const text = this.getTranscriptText();
      if (!text || typeof speechSynthesis === 'undefined') return;
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = 'id-ID';
      speechSynthesis.cancel();
      speechSynthesis.speak(utter);
    });

    // Text -> Sign
    const runTranslate = () => {
      const text = this._q('#tts-input').value.trim();
      if (!text) return;
      this.playTextToSign(text);
    };
    this._q('#btn-translate-sign').addEventListener('click', runTranslate);
    this._q('#btn-voice-sign').addEventListener('click', () => this._toggleVoiceToSign());
    this._q('#tts-input').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') runTranslate();
    });
    this._q('#btn-replay-sign').addEventListener('click', () => {
      if (this.signSequence.length > 0) {
        this.signIndex = 0;
        this._startSignPlayback();
      }
    });
    this.shadow.querySelectorAll('.chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        this._q('#tts-input').value = chip.dataset.phrase;
        this.playTextToSign(chip.dataset.phrase);
      });
    });

    // Quick-Train word presets
    this.shadow.querySelectorAll('.train-preset').forEach((chip) => {
      chip.addEventListener('click', () => {
        this._q('#train-label').value = chip.dataset.word;
        this.setTrainStatus(`Label "${chip.dataset.word}" dipilih. Klik Rekam (15x) sambil tahan isyaratnya.`);
      });
    });

    this._q('#btn-load-default').addEventListener('click', () => {
      this.callbacks.onLoadDefaultDataset?.();
    });

    // Quick-Train
    this._q('#btn-record').addEventListener('click', () => {
      const label = this._q('#train-label').value.trim();
      if (!label) {
        this.setTrainStatus('Masukkan label terlebih dahulu (contoh: A atau HALO).');
        return;
      }
      this.callbacks.onRecordLabel?.(label);
    });

    this._q('#btn-export').addEventListener('click', () => {
      this.callbacks.onExportDataset?.();
    });

    this._q('#btn-import').addEventListener('click', () => {
      this._q('#import-file').click();
    });

    this._q('#import-file').addEventListener('change', async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        const json = JSON.parse(await file.text());
        this.callbacks.onImportDataset?.(json);
      } catch {
        this.setTrainStatus('File JSON tidak valid.');
      }
      e.target.value = '';
    });

    this._q('#btn-clear-dataset').addEventListener('click', () => {
      this.callbacks.onClearDataset?.();
    });
  }

  _bindDrag() {
    const handle = this._q('#drag-handle');
    let dragging = false;
    let offsetX = 0;
    let offsetY = 0;

    handle.addEventListener('pointerdown', (e) => {
      if (e.target.closest('button')) return;
      dragging = true;
      const rect = this.host.getBoundingClientRect();
      offsetX = e.clientX - rect.left;
      offsetY = e.clientY - rect.top;
      this.host.style.right = 'auto';
      this.host.style.bottom = 'auto';
      this.host.style.left = `${rect.left}px`;
      this.host.style.top = `${rect.top}px`;
      handle.setPointerCapture(e.pointerId);
    });

    handle.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const maxX = Math.max(0, window.innerWidth - this.host.offsetWidth);
      const maxY = Math.max(0, window.innerHeight - this.host.offsetHeight);
      const nextX = Math.min(Math.max(0, e.clientX - offsetX), maxX);
      const nextY = Math.min(Math.max(0, e.clientY - offsetY), maxY);
      this.host.style.left = `${nextX}px`;
      this.host.style.top = `${nextY}px`;
    });

    const stopDrag = () => {
      dragging = false;
    };
    handle.addEventListener('pointerup', stopDrag);
    handle.addEventListener('pointercancel', stopDrag);
  }

  setVisible(visible) {
    this.host.style.display = visible ? 'block' : 'none';
    if (this.subtitleHost) {
      this.subtitleHost.style.display = visible ? 'block' : 'none';
    }
  }

  setCollapsed(collapsed) {
    this.isCollapsed = collapsed;
    this._q('#main-panel').classList.toggle('hidden', collapsed);
    this._q('#collapsed-pill').classList.toggle('visible', collapsed);
  }

  switchTab(tabName) {
    this.activeTab = tabName;
    this.shadow.querySelectorAll('.tab-btn').forEach((b) => {
      b.classList.toggle('active', b.dataset.tab === tabName);
    });
    this.shadow.querySelectorAll('.tab-pane').forEach((p) => {
      p.classList.toggle('active', p.id === `pane-${tabName}`);
    });
    // Auto-start continuous voice-to-sign when opening Teks -> Sign tab
    if (tabName === 'text-to-sign' && !this.isListeningVoice && !this._userPausedVoice) {
      this.startVoiceAutoListen();
    }
  }

  setStatus(text, state = 'idle') {
    this._q('#status-text').textContent = text;
    for (const dotId of ['#header-dot', '#pill-dot']) {
      const dot = this._q(dotId);
      dot.className = 'dot';
      if (state === 'live') dot.classList.add('live');
      if (state === 'warn') dot.classList.add('warn');
      if (state === 'err') dot.classList.add('err');
    }
  }

  setMeta(text) {
    this._q('#live-meta').textContent = text;
  }

  drawVideoPreview(_videoElement) {
    // Handled by drawAllVideoPreviews
  }

  drawAllVideoPreviews(videoEntries, activeIdx) {
    const strip = this._q('#source-strip');
    if (!strip) return;

    if (strip.children.length !== videoEntries.length) {
      strip.innerHTML = '';
      videoEntries.forEach((entry, idx) => {
        const btn = document.createElement('button');
        btn.className = 'source-thumb';
        btn.type = 'button';
        btn.title = `Klik untuk pantau ${entry.label || `Video #${idx + 1}`}`;
        btn.innerHTML = `
          <canvas width="88" height="62"></canvas>
          <span class="source-badge">${entry.label || `Video #${idx + 1}`}</span>
        `;
        btn.addEventListener('click', () => {
          this._q('#video-select').value = String(idx);
          this.callbacks.onSelectVideo?.(String(idx));
        });
        strip.appendChild(btn);
      });
    }

    Array.from(strip.children).forEach((btn, idx) => {
      btn.classList.toggle('active', idx === activeIdx);
      const canvas = btn.querySelector('canvas');
      const source = videoEntries[idx]?.video;
      if (canvas && source) {
        try {
          const ctx = canvas.getContext('2d');
          ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
        } catch {
          // Ignore draw error
        }
      }
    });
  }

  updateLivePrediction(label, confidence = 0, latencyMs = 0, holdProgress = 0) {
    this._q('#live-sign').textContent = label || '—';
    const holdPct = Math.round(Math.max(0, Math.min(1, holdProgress)) * 100);
    const confPct = Math.round(Math.max(0, Math.min(1, confidence)) * 100);
    // Bar menampilkan progres menahan pose agar pengguna tahu kapan huruf/kata terkunci
    this._q('#conf-fill').style.width = `${label ? Math.max(15, holdPct) : 0}%`;
    if (label) {
      this._q('#live-meta').textContent =
        holdPct < 100
          ? `Tahan pose "${label}" (${holdPct}%) • Keyakinan ${confPct}%`
          : `Terkunci "${label}" ✓ • Keyakinan ${confPct}%`;
    } else {
      this._q('#live-meta').textContent = 'Menunggu gerakan tangan yang stabil';
    }
    this._renderSubtitle(holdPct >= 75 ? label : null);
  }

  updateVideoOptions(videoEntries, selectedKey) {
    const select = this._q('#video-select');
    const prev = selectedKey || select.value;
    select.innerHTML = '<option value="auto">Auto (Lawan Bicara)</option>';
    videoEntries.forEach((entry, idx) => {
      const v = entry.video || entry;
      const role =
        entry.label ||
        (entry.isSelf ? 'Kamera Saya (PiP)' : 'Lawan Bicara (Utama)');
      const w = v.videoWidth || v.width || 0;
      const h = v.videoHeight || v.height || 0;
      const opt = document.createElement('option');
      opt.value = String(idx);
      opt.textContent = `#${idx + 1} ${role} (${w}×${h})`;
      select.appendChild(opt);
    });
    if ([...select.options].some((o) => o.value === prev)) {
      select.value = prev;
    }
  }

  appendTranscript(token) {
    if (token === ' ') {
      if (
        this.transcriptTokens.length > 0 &&
        this.transcriptTokens[this.transcriptTokens.length - 1] !== ' '
      ) {
        this.transcriptTokens.push(' ');
      }
    } else {
      this.transcriptTokens.push(token);
    }
    this._renderTranscript();
  }

  finalizeCurrentWord() {
    if (
      this.transcriptTokens.length > 0 &&
      this.transcriptTokens[this.transcriptTokens.length - 1] !== ' '
    ) {
      this.transcriptTokens.push(' ');
      this._renderTranscript();
    }
  }

  getTranscriptText() {
    const lastIsSpace =
      this.transcriptTokens[this.transcriptTokens.length - 1] === ' ';
    return composeSmartSentence(this.transcriptTokens, lastIsSpace);
  }

  _renderTranscript() {
    const box = this._q('#transcript-box');
    const text = this.getTranscriptText();
    box.textContent = text || 'Hasil terjemahan kalimat akan muncul di sini...';
    box.scrollTop = box.scrollHeight;
    this._renderSubtitle();
  }

  _renderSubtitle(liveLabel = null) {
    if (!this.subtitleShadow) return;
    const wrap = this.subtitleShadow.querySelector('#cc-wrap');
    const textEl = this.subtitleShadow.querySelector('#cc-text');
    const tagEl = this.subtitleShadow.querySelector('#cc-live-tag');
    const text = this.getTranscriptText().toLowerCase();

    if (!this.subtitleEnabled || (!text && !liveLabel)) {
      wrap.classList.remove('visible');
      return;
    }

    if (liveLabel && liveLabel !== '✋') {
      tagEl.style.display = 'inline-block';
      tagEl.textContent = `Terdeteksi: ${liveLabel}`;
    } else {
      tagEl.style.display = 'none';
    }

    const words = text ? text.split(/\s+/) : [];
    const recentText = words.slice(-10).join(' ');
    textEl.textContent =
      recentText || (liveLabel && liveLabel !== '✋' ? liveLabel.toLowerCase() : '');
    wrap.classList.toggle('visible', Boolean(textEl.textContent));
  }

  /**
   * Anchor the floating subtitle bar right underneath the active person's <video>.
   * @param {HTMLVideoElement | null} videoElement
   */
  syncSubtitlePosition(videoElement) {
    if (!this.subtitleHost) return;
    if (!videoElement) {
      this.subtitleHost.style.left = '50%';
      this.subtitleHost.style.top = 'auto';
      this.subtitleHost.style.bottom = '28px';
      this.subtitleHost.style.transform = 'translateX(-50%)';
      return;
    }

    const rect = videoElement.getBoundingClientRect();
    if (rect.width < 80 || rect.height < 80) return;

    const centerX = Math.min(
      Math.max(rect.left + rect.width / 2, 160),
      window.innerWidth - 160
    );
    const targetTop = Math.min(
      Math.max(rect.bottom - 56, 20),
      window.innerHeight - 64
    );

    this.subtitleHost.style.left = `${Math.round(centerX)}px`;
    this.subtitleHost.style.top = `${Math.round(targetTop)}px`;
    this.subtitleHost.style.bottom = 'auto';
    this.subtitleHost.style.transform = 'translateX(-50%)';
  }

  playTextToSign(text) {
    clearTimeout(this.signTimer);
    this.signSequence = translateTextToSignSequence(text);
    this.signIndex = 0;

    if (this.signSequence.length === 0) {
      this._q('#sign-stage').innerHTML =
        '<div class="sign-stage-cue">Tidak ada kata/huruf yang dapat diterjemahkan.</div>';
      this._q('#seq-strip').innerHTML = '';
      return;
    }

    this._renderSeqStrip();
    this._startSignPlayback();
  }

  _renderSeqStrip() {
    const strip = this._q('#seq-strip');
    strip.innerHTML = '';
    this.signSequence.forEach((step, idx) => {
      const span = document.createElement('span');
      span.className = `seq-item${idx === this.signIndex ? ' current' : ''}`;
      span.textContent = step.label;
      strip.appendChild(span);
    });
  }

  async _resolveVideoBlobUrl(videoPath, fallbackUrl) {
    if (!videoPath) return fallbackUrl;
    if (this._videoBlobCache.has(videoPath)) {
      return this._videoBlobCache.get(videoPath);
    }
    try {
      const res = await chrome.runtime.sendMessage({
        type: 'GET_ASSET_DATA_URL',
        path: videoPath,
      });
      if (res?.ok && res.dataUrl) {
        const fetched = await fetch(res.dataUrl);
        const blob = await fetched.blob();
        const blobUrl = URL.createObjectURL(blob);
        this._videoBlobCache.set(videoPath, blobUrl);
        return blobUrl;
      }
    } catch {
      // Fallback to direct URL
    }
    return fallbackUrl;
  }

  async _startSignPlayback() {
    clearTimeout(this.signTimer);
    if (this.signIndex >= this.signSequence.length) {
      this.isPlayingSign = false;
      return;
    }

    this.isPlayingSign = true;
    const currentIdx = this.signIndex;
    const step = this.signSequence[currentIdx];
    const stage = this._q('#sign-stage');

    if (step.type === 'letter' && step.assetUrl) {
      stage.innerHTML = `
        <img src="${step.assetUrl}" alt="Isyarat huruf ${step.label}" />
        <div class="sign-stage-title">Huruf ${step.label}</div>
        <div class="sign-stage-cue">${step.cue}</div>
      `;
    } else if (step.videoPath || step.videoUrl) {
      const playableUrl = await this._resolveVideoBlobUrl(
        step.videoPath,
        step.videoUrl
      );
      if (this.signIndex !== currentIdx) return;
      stage.innerHTML = `
        <video src="${playableUrl}" autoplay muted loop playsinline></video>
        <div class="sign-stage-title">${step.label}</div>
        <div class="sign-stage-cue">${step.cue}</div>
      `;
    } else {
      stage.innerHTML = `
        <div class="sign-word-icon">${step.icon || '🤟'}</div>
        <div class="sign-stage-title">${step.label}</div>
        <div class="sign-stage-cue">${step.cue}</div>
      `;
    }

    this._renderSeqStrip();

    this.signTimer = setTimeout(() => {
      this.signIndex++;
      if (this.signIndex < this.signSequence.length) {
        this._startSignPlayback();
      } else {
        this.isPlayingSign = false;
      }
    }, step.durationMs);
  }

  setTrainStatus(text) {
    this._q('#train-status').textContent = text;
  }

  renderDatasetList(labelCounts) {
    const list = this._q('#train-list');
    const entries = Object.entries(labelCounts).sort((a, b) =>
      a[0].localeCompare(b[0])
    );

    if (entries.length === 0) {
      list.innerHTML =
        '<div class="hint">Belum ada sampel. Rekam minimal 2 label agar KNN dapat membedakan isyarat.</div>';
      return;
    }

    list.innerHTML = '';
    for (const [label, count] of entries) {
      const row = document.createElement('div');
      row.className = 'train-row';
      row.innerHTML = `
        <span><b>${label}</b> — ${count} sampel</span>
        <button class="train-del" data-label="${label}">Hapus</button>
      `;
      row.querySelector('.train-del').addEventListener('click', () => {
        this.callbacks.onDeleteLabel?.(label);
      });
      list.appendChild(row);
    }
  }

  _toggleVoiceToSign() {
    if (this.isListeningVoice && this.recognition) {
      this._userPausedVoice = true;
      this._voiceAutoRestart = false;
      this.recognition.stop();
      return;
    }
    this._userPausedVoice = false;
    this.startVoiceAutoListen();
  }

  startVoiceAutoListen() {
    const SpeechRec =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRec) {
      this._q('#sign-stage').innerHTML =
        '<div class="sign-stage-cue">Browser ini tidak mendukung Web Speech API (SpeechRecognition).</div>';
      return;
    }

    if (this.isListeningVoice) return;

    const btn = this._q('#btn-voice-sign');
    const input = this._q('#tts-input');
    const stage = this._q('#sign-stage');

    const recognition = new SpeechRec();
    recognition.lang = 'id-ID';
    recognition.interimResults = true;
    recognition.continuous = true;
    recognition.maxAlternatives = 1;
    this.recognition = recognition;
    this._voiceAutoRestart = true;

    recognition.onstart = () => {
      this.isListeningVoice = true;
      btn.classList.add('listening');
      btn.textContent = 'Stop';
      stage.innerHTML =
        '<div class="sign-stage-title">Mendengarkan suara...</div><div class="sign-stage-cue">Suara yang terdengar otomatis dikonversi menjadi isyarat tangan.</div>';
    };

    recognition.onresult = (event) => {
      let interim = '';
      let finalText = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalText += transcript;
        } else {
          interim += transcript;
        }
      }

      const display = (finalText || interim).trim();
      if (display) {
        input.value = display;
      }

      if (finalText.trim()) {
        this.playTextToSign(finalText.trim());
      }
    };

    recognition.onerror = (event) => {
      if (event.error === 'no-speech') return;
      this._voiceAutoRestart = false;
      const msg =
        event.error === 'not-allowed'
          ? 'Izin mikrofon ditolak. Aktifkan izin mic di situs ini.'
          : `Gagal mengenali suara (${event.error}).`;
      stage.innerHTML = `<div class="sign-stage-cue">${msg}</div>`;
    };

    recognition.onend = () => {
      if (this._voiceAutoRestart) {
        try {
          recognition.start();
          return;
        } catch {
          this._voiceAutoRestart = false;
        }
      }
      this.isListeningVoice = false;
      btn.classList.remove('listening');
      btn.textContent = 'Suara';
    };

    try {
      recognition.start();
    } catch {
      this.isListeningVoice = false;
      btn.classList.remove('listening');
      btn.textContent = 'Suara';
    }
  }

  destroy() {
    clearTimeout(this.signTimer);
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {
        // Ignore stop error
      }
      this.recognition = null;
    }
    if (this.host) {
      this.host.remove();
      this.host = null;
    }
    if (this.subtitleHost) {
      this.subtitleHost.remove();
      this.subtitleHost = null;
    }
  }
}
