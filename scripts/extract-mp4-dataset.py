"""
Ekstraktor offline .mp4 (misal WL-BISINDO / BISINDO 40 Kata dari Kaggle)
menjadi dataset JSON KNN siap pakai untuk Isyarat-Live Chrome Extension.

Catatan: Script ini hanya dijalankan sekali di komputer untuk menyiapkan
`public/models/default-dataset.json`. Ekstensi Chrome tetap berjalan
100% lokal di browser tanpa backend Python.

Cara pakai:
  pip install opencv-python mediapipe
  python scripts/extract-mp4-dataset.py scripts/data/kaggle
"""

import argparse
import json
import math
import os
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

try:
    import cv2
    import mediapipe as mp
    from mediapipe.tasks import python as mp_python
    from mediapipe.tasks.python import vision as mp_vision
except ImportError:
    print(
        "[ERROR] Dependensi Python belum terpasang.\n"
        "Jalankan dulu:\n"
        "  pip install opencv-python mediapipe"
    )
    sys.exit(1)

ROOT = Path(__file__).resolve().parent.parent
DEFAULT_MODEL = ROOT / "public" / "models" / "hand_landmarker.task"
DEFAULT_OUTPUT = ROOT / "public" / "models" / "default-dataset.json"

# Official WL-BISINDO label mapping (AceKinnn/WL-BISINDO, 32 Indonesian words)
WL_BISINDO_LABELS = {
    0: "AIR",
    1: "BELAJAR",
    2: "CARI",
    3: "HARI",
    4: "INGAT",
    5: "LAGI",
    6: "MAAF",
    7: "MAKAN",
    8: "MOTOR",
    9: "SAYA",
    10: "TERIMA KASIH",
    11: "TULI",
    12: "APA",
    13: "SIAPA",
    14: "KAPAN",
    15: "DI MANA",
    16: "MENGAPA",
    17: "BAGAIMANA",
    18: "MERAH",
    19: "KUNING",
    20: "HIJAU",
    21: "HITAM",
    22: "DENGAR",
    23: "BERANGKAT",
    24: "DATANG",
    25: "TEMAN",
    26: "KELUARGA",
    27: "RUMAH",
    28: "PAGI",
    29: "SIANG",
    30: "SORE",
    31: "MALAM",
}


def normalize_landmarks(landmarks):
    """Persis sama dengan normalizeLandmarks() di src/content/detector.js."""
    if not landmarks or len(landmarks) != 21:
        return None

    wx = landmarks[0].x
    wy = landmarks[0].y
    centered = [0.0] * 63
    max_dist = 0.0

    for i, pt in enumerate(landmarks):
        dx = pt.x - wx
        dy = pt.y - wy
        base = i * 3
        centered[base] = dx
        centered[base + 1] = dy
        centered[base + 2] = 0.0
        dist = math.hypot(dx, dy)
        if dist > max_dist:
            max_dist = dist

    scale = max_dist if max_dist > 1e-6 else 1.0
    return [round(v / scale, 5) for v in centered]


def infer_label(video_path: Path, input_root: Path) -> str:
    """
    Deteksi label kata otomatis:
    - Pola WL-BISINDO: signer0_label10_sample1.mp4 -> "TERIMA KASIH"
    - Subfolder kata: kaggle/AKU/vid1.mp4 -> "AKU"
    - Nama file kata: kaggle/terima_kasih_01.mp4 -> "TERIMA KASIH"
    """
    wl_match = re.search(r"label(\d+)", video_path.stem, re.IGNORECASE)
    if wl_match:
        idx = int(wl_match.group(1))
        if idx in WL_BISINDO_LABELS:
            return WL_BISINDO_LABELS[idx]

    rel = video_path.relative_to(input_root)
    if len(rel.parts) >= 2:
        raw = rel.parent.name
    else:
        raw = video_path.stem

    cleaned = re.sub(r"[_-]+", " ", raw)
    cleaned = re.sub(r"\b\d+\b", "", cleaned)
    cleaned = re.sub(r"\s+", " ", cleaned).strip().upper()
    return cleaned


def extract_video_samples(video_path: Path, landmarker, frames_per_video: int):
    cap = cv2.VideoCapture(str(video_path))
    if not cap.isOpened():
        return []

    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT)) or 0
    if total_frames <= 0:
        cap.release()
        return []

    # Ambil bagian tengah video (20% - 80%) di mana pose isyarat paling jelas
    start_f = int(total_frames * 0.2)
    end_f = max(start_f + 1, int(total_frames * 0.8))
    span = end_f - start_f
    step = max(1, span // max(1, frames_per_video))

    vectors = []
    frame_idx = start_f
    while frame_idx < end_f and len(vectors) < frames_per_video:
        cap.set(cv2.CAP_PROP_POS_FRAMES, frame_idx)
        ok, frame = cap.read()
        if not ok or frame is None:
            break

        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb)
        result = landmarker.detect(mp_image)

        if result.hand_landmarks:
            vec = normalize_landmarks(result.hand_landmarks[0])
            if vec:
                vectors.append(vec)

        frame_idx += step

    cap.release()
    return vectors


def main():
    parser = argparse.ArgumentParser(
        description="Ekstrak folder video .mp4 Kaggle menjadi dataset JSON Isyarat-Live."
    )
    parser.add_argument(
        "input_dir",
        nargs="?",
        default=str(ROOT / "scripts" / "data" / "kaggle"),
        help="Folder berisi video .mp4 (default: scripts/data/kaggle)",
    )
    parser.add_argument(
        "-o",
        "--output",
        default=str(DEFAULT_OUTPUT),
        help="File output JSON (default: public/models/default-dataset.json)",
    )
    parser.add_argument(
        "--frames",
        type=int,
        default=6,
        help="Jumlah frame sampel per video (default: 6)",
    )
    parser.add_argument(
        "--max-videos-per-label",
        type=int,
        default=15,
        help="Batas maksimal video per kata agar file JSON tetap ringan (default: 15)",
    )
    parser.add_argument(
        "--merge",
        action="store_true",
        help="Gabungkan dengan dataset JSON yang sudah ada sebelumnya",
    )
    args = parser.parse_args()

    input_root = Path(args.input_dir).resolve()
    if not input_root.exists():
        print(f"[ERROR] Folder tidak ditemukan: {input_root}")
        print("Ekstrak dulu file .zip Kaggle ke folder tersebut.")
        sys.exit(1)

    if not DEFAULT_MODEL.exists():
        print(f"[ERROR] Model MediaPipe tidak ditemukan: {DEFAULT_MODEL}")
        sys.exit(1)

    def video_sort_key(p: Path):
        m = re.match(r"signer(\d+)_label(\d+)_sample(\d+)", p.stem, re.IGNORECASE)
        if m:
            # Utamakan variasi signer (signer0..4) sebelum sample berikutnya
            return (0, int(m.group(3)), int(m.group(1)), int(m.group(2)))
        return (1, p.name)

    videos = sorted(
        (p for p in input_root.rglob("*") if p.suffix.lower() in {".mp4", ".mov", ".avi", ".mkv"}),
        key=video_sort_key,
    )
    if not videos:
        print(f"[ERROR] Tidak ada file .mp4 ditemukan di: {input_root}")
        sys.exit(1)

    print(f"[extract] Ditemukan {len(videos)} video di {input_root}")

    base_options = mp_python.BaseOptions(model_asset_path=str(DEFAULT_MODEL))
    options = mp_vision.HandLandmarkerOptions(
        base_options=base_options,
        running_mode=mp_vision.RunningMode.IMAGE,
        num_hands=1,
        min_hand_detection_confidence=0.45,
    )
    landmarker = mp_vision.HandLandmarker.create_from_options(options)

    samples = []
    out_path = Path(args.output).resolve()
    if args.merge and out_path.exists():
        try:
            existing = json.loads(out_path.read_text(encoding="utf-8"))
            if isinstance(existing.get("samples"), list):
                samples.extend(existing["samples"])
                print(f"[extract] Menggabungkan dengan {len(samples)} sampel sebelumnya.")
        except Exception:
            pass

    videos_per_label = {}
    label_counts = {}

    for idx, vid in enumerate(videos, start=1):
        label = infer_label(vid, input_root)
        if not label:
            continue
        if videos_per_label.get(label, 0) >= args.max_videos_per_label:
            continue

        vecs = extract_video_samples(vid, landmarker, args.frames)
        if vecs:
            videos_per_label[label] = videos_per_label.get(label, 0) + 1
            for vec in vecs:
                samples.append({"label": label, "vector": vec})
                label_counts[label] = label_counts.get(label, 0) + 1

        if idx % 20 == 0 or idx == len(videos):
            print(
                f"[extract] Progres {idx}/{len(videos)} video — "
                f"{len(label_counts)} kata, {len(samples)} total sampel"
            )

    landmarker.close()

    out_path.parent.mkdir(parents=True, exist_ok=True)
    payload = {
        "version": 1,
        "source": f"Extracted from MP4 ({input_root.name})",
        "updatedAt": datetime.now(timezone.utc).isoformat(),
        "samples": samples,
    }
    out_path.write_text(json.dumps(payload), encoding="utf-8")
    size_kb = out_path.stat().st_size / 1024
    print(
        f"\n[extract] Selesai! {len(samples)} sampel dari {len(label_counts)} kata "
        f"disimpan ke {out_path} ({size_kb:.1f} KB)"
    )
    print("Langkah berikutnya: jalankan `npm.cmd run build` lalu Reload ekstensi di Chrome.")


if __name__ == "__main__":
    main()
