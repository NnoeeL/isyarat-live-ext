# Isyarat-Live (`isyarat-live-ext`)

[![License: MIT](https://img.shields.io/badge/License-MIT-4d7c6f.svg)](LICENSE)
[![Manifest V3](https://img.shields.io/badge/Chrome-Manifest%20V3-blue.svg)]()

Ekstensi Google Chrome (**Manifest V3**) untuk menerjemahkan bahasa isyarat Indonesia (**SIBI & BISINDO**) secara **real-time** langsung di browser pada platform video call web: **WhatsApp Web**, **Google Meet**, dan **Umingle**.

- **100% Lokal di Browser**: Tanpa backend Python, tanpa server cloud, tanpa CDN eksternal — MediaPipe `HandLandmarker` berjalan lokal di MV3 Offscreen Document (aman dari CSP ketat WhatsApp Web & Google Meet) dipadukan dengan mesin **Geometri 21-Titik + Mirror-Invariant KNN (<5ms)**.
- **Shadow DOM UI Minimalis**: Panel melayang (*draggable & collapsible*) terisolasi penuh agar tidak bentrok dengan CSS situs target.

---

## Fitur Utama

### 1. Sign → Teks + Live Subtitle di Bawah Video
- **Auto-Detect Lawan Bicara**: Memantau elemen `<video>` maupun `<canvas>` panggilan video secara otomatis, lengkap dengan deretan **thumbnail preview yang bisa diklik** dan tombol **Tukar**.
- **3 Mode Deteksi**:
  - **Kata + A–Z**: Mengenali kata sehari-hari sekaligus huruf alfabet SIBI A–Z.
  - **Huruf A–Z**: Fokus mengeja huruf A sampai Z.
  - **Kata Saja**: Fokus kata (`SAYA`, `SUKA`, `KAMU`, `KITA`, `HALO`, `TERIMA KASIH`, `MAAF`, `BAGUS`, `TIDAK`, `TEMAN`, `OKE`, `MAKAN`, + 32 kata WL-BISINDO).
- **Hold-to-Commit (Anti-Spam)**: Mengukur kecepatan gerak tangan dan meminta pose ditahan stabil ~0,6 detik agar gerakan transisi tidak memicu huruf acak.
- **Smart AI Word & Sentence Composer**: Otomatis merangkai dan memisahkan huruf ejaan nyambung menjadi kata Bahasa Indonesia (contoh: `AKUSUKAKAMU` → `AKU SUKA KAMU`) serta memperbaiki salah eja ringan.
- **Live Subtitle (`CC: ON`)**: Menampilkan hasil terjemahan kalimat tepat di bawah kotak video lawan bicara, dilengkapi tombol **Baca** (*Text-to-Speech `id-ID`*) dan **Salin**.

### 2. Suara / Teks → Hand Sign (Video Model Manusia Asli)
- **Auto Dengar (Voice → Hand Sign)**: Begitu tab **Teks → Sign** dibuka, mikrofon otomatis mendengarkan Bahasa Indonesia (*continuous*) dan langsung menerjemahkan ucapan menjadi animasi isyarat tangan.
- **32 Video Peraga Manusia Asli (WL-BISINDO)** + **80+ Kamus Kata** + **Fallback Ejaan Huruf A–Z (SVG lokal)** yang aman dari CSP WhatsApp Web.

### 3. Latih Kata (`Quick-Train`)
- Rekam pose kata atau huruf sendiri langsung dari kamera dalam 2 detik, tersimpan permanen di `chrome.storage.local` dengan fitur **Export / Import JSON**.

---

## Cara Cepat Pasang di Chrome (Tanpa Build!)

Folder **`dist/`** sudah dibundel siap pakai di dalam repo ini — kamu **tidak perlu install Node.js atau menjalankan `npm run build`** untuk langsung menggunakannya:

1. **Clone repo** (atau klik tombol hijau **Code → Download ZIP** lalu ekstrak):
   ```bash
   git clone https://github.com/NnoeeL/isyarat-live-ext.git
   ```
2. Buka **`chrome://extensions/`** di Google Chrome.
3. Aktifkan **Developer mode** (pojok kanan atas).
4. Klik **Load unpacked** lalu pilih folder:
   ```text
   isyarat-live-ext/dist
   ```
5. Buka salah satu platform video call berikut:
   - **WhatsApp Web** (`https://web.whatsapp.com`)
   - **Google Meet** (`https://meet.google.com`)
   - **Umingle** (`https://umingle.com`)
6. Panel **Isyarat-Live** otomatis muncul di pojok kanan bawah:
   - **Menerjemahkan gerakan tangan lawan bicara (`Sign → Teks`):** Mulai video call → pastikan thumbnail video lawan bicara terpilih (atau klik thumbnail-nya) → tahan pose ~0,45 detik hingga muncul `Terkunci ✓` → subtitle otomatis tampil di bawah video.
   - **Menerjemahkan suara/teks ke isyarat (`Teks → Sign`):** Buka tab **Teks → Sign** → langsung bicara dalam Bahasa Indonesia (atau ketik teks / klik chip kalimat) → video peraga BISINDO / ejaan A–Z otomatis diputar.
   - **Menambah kata baru (`Latih Kata`):** Pilih chip kata atau ketik label → klik **Rekam (15x)** sambil tahan pose tangan di depan kamera.

---

## Build Ulang dari Source (Khusus Developer)

Jika kamu mengubah kode di folder `src/` dan ingin melakukan build ulang ke `dist/`:

### Prasyarat
- **Node.js** v18+

### Langkah Build
```bash
cd isyarat-live-ext
npm install
npm run build
```

> **Catatan Windows:**
> - Jika `npm` terblokir PowerShell ExecutionPolicy, gunakan `npm.cmd` (mis. `npm.cmd install`, `npm.cmd run build`).
> - Jika Windows *Smart App Control* memblokir native binary Rollup saat build, cukup gunakan folder `dist/` yang sudah tersedia di repo ini tanpa perlu build ulang.

---

## Struktur Proyek

```text
isyarat-live-ext/
├── public/
│   ├── manifest.json             # Konfigurasi Chrome Manifest V3
│   ├── wasm/                     # File WASM MediaPipe lokal
│   ├── models/                   # hand_landmarker.task & default-dataset.json
│   ├── signs/                    # SVG A-Z & 32 video demo WL-BISINDO (signs/words/)
│   └── icons/                    # Ikon ekstensi (16, 48, 128 px)
├── src/
│   ├── content/
│   │   ├── index.js              # Entry point, deteksi <video>/<canvas>, loop real-time
│   │   ├── detector.js           # Normalisasi 21 titik + Geometri Kata & Huruf A-Z
│   │   ├── classifier.js         # Mirror-Invariant KNN + Velocity-Gated StabilityBuffer
│   │   ├── sentenceAI.js         # Perangkai kata & koreksi ejaan Bahasa Indonesia lokal
│   │   ├── textToSign.js         # Stemming Bahasa Indonesia, kamus 80+ kata, SVG A-Z
│   │   └── overlayUI.js          # Shadow DOM UI (draggable, collapsible) + Live Subtitle
│   ├── offscreen/
│   │   ├── offscreen.html        # MV3 Offscreen AI Document
│   │   └── offscreen.js          # MediaPipe HandLandmarker WASM (bebas blokir CSP)
│   ├── popup/
│   │   ├── popup.html            # Menu popup ekstensi
│   │   └── popup.js              # Toggle aktif/nonaktif & statistik dataset
│   └── background/
│       └── service-worker.js     # Manajemen state, offscreen lifecycle & asset loader
├── scripts/                      # Build Vite, setup aset, konverter CSV & MP4
├── tests/                        # Unit test (`npm test`)
├── LICENSE                       # MIT License
└── README.md
```

---

## Menjalankan Unit Test

```bash
npm test
```

---

## Lisensi & Atribusi Dataset

- **Kode Sumber Ekstensi:** Dirilis di bawah **MIT License** — lihat file [LICENSE](LICENSE).
- **Dataset Bawaan (Non-Komersial / Riset & Edukasi):**
  - **WL-BISINDO** (*Kindy, Leonali, & Lucky, BINUS University*) — berlisensi **CC BY-NC 4.0** (*Non-Commercial, Attribution required*).
  - **SIBI-Recognition** (`AJustiago/SIBI-Recognition`) — dataset koordinat MediaPipe alfabet SIBI A–Z.
  - **MediaPipe Tasks Vision** — Apache License 2.0 (Google).
