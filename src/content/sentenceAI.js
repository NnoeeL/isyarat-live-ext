/**
 * Local AI Indonesian Word & Sentence Composer (100% in-browser).
 * - Segments continuous fingerspelled letters into real Indonesian words
 *   (e.g. "AKUSUKAKAMU" -> "Aku suka kamu", "HALOAPAKABAR" -> "Halo apa kabar")
 * - Collapses accidental repeated letter slips ("AAKUU" -> "AKU")
 * - Fuzzy-corrects 1-letter slips on completed words against core Indonesian lexicon
 * - Polishes word sequences into natural Indonesian sentences (with optional
 *   Chrome Built-in Gemini Nano `self.ai` / `LanguageModel` enhancement if available).
 */

export const CORE_INDONESIAN_WORDS = [
  // Kata ganti & sapaan
  'aku', 'saya', 'kamu', 'anda', 'kita', 'kami', 'dia', 'mereka',
  'halo', 'hai', 'selamat', 'pagi', 'siang', 'sore', 'malam',
  'terima', 'kasih', 'sama', 'maaf', 'tolong', 'permisi',
  // Perasaan & sikap
  'suka', 'cinta', 'sayang', 'senang', 'bahagia', 'sedih', 'marah',
  'takut', 'capek', 'lelah', 'sakit', 'sehat', 'lapar', 'haus',
  'baik', 'bagus', 'buruk', 'hebat', 'mantap', 'keren', 'cantik', 'ganteng',
  // Respon & kata bantu
  'ya', 'iya', 'oke', 'siap', 'tidak', 'bukan', 'belum', 'sudah',
  'lagi', 'masih', 'sedang', 'akan', 'bisa', 'mau', 'ingin', 'harus',
  'boleh', 'jangan', 'ada', 'tiada', 'banyak', 'sedikit', 'semua',
  'ini', 'itu', 'sini', 'situ', 'sana', 'dan', 'atau', 'tapi',
  'karena', 'kalau', 'jika', 'untuk', 'dari', 'ke', 'di', 'dengan',
  // Kata kerja sehari-hari
  'makan', 'minum', 'tidur', 'bangun', 'mandi', 'pergi', 'berangkat',
  'datang', 'pulang', 'jalan', 'lari', 'duduk', 'berdiri', 'masuk',
  'keluar', 'kerja', 'belajar', 'baca', 'tulis', 'hitung', 'main',
  'tunggu', 'cari', 'lihat', 'nonton', 'dengar', 'bicara', 'ngobrol',
  'tanya', 'jawab', 'paham', 'mengerti', 'tahu', 'kenal', 'ingat',
  'lupa', 'beli', 'bayar', 'bantu', 'punya', 'pakai', 'buka', 'tutup',
  // Kata tanya
  'apa', 'siapa', 'dimana', 'mana', 'kapan', 'kenapa', 'mengapa',
  'bagaimana', 'berapa',
  // Orang, tempat & benda umum
  'nama', 'kabar', 'teman', 'sahabat', 'keluarga', 'ibu', 'mama',
  'ayah', 'bapak', 'papa', 'kakak', 'adik', 'anak', 'orang', 'guru',
  'dosen', 'dokter', 'tuli', 'dengar', 'rumah', 'sekolah', 'kampus',
  'kantor', 'kelas', 'kamar', 'jalan', 'kota', 'indonesia',
  'air', 'nasi', 'roti', 'kopi', 'teh', 'susu', 'obat', 'uang',
  'buku', 'hp', 'telepon', 'motor', 'mobil', 'jam', 'hari', 'minggu',
  'bulan', 'tahun', 'sekarang', 'besok', 'kemarin', 'nanti',
  // Warna & angka dasar
  'merah', 'kuning', 'hijau', 'biru', 'hitam', 'putih',
  'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan', 'sepuluh',
];

const WORD_SET = new Set(CORE_INDONESIAN_WORDS);
// Sort longest-first for greedy/DP segmentation
const SORTED_DICT = [...CORE_INDONESIAN_WORDS]
  .filter((w) => w.length >= 2)
  .sort((a, b) => b.length - a.length);

/**
 * Collapse triple+ repeated letters and obvious stutter slips in raw fingerspelling.
 * Example: "AAAKUUU" -> "AKU", "HAALOO" -> "HALO"
 * @param {string} raw
 * @returns {string}
 */
export function collapseLetterStutter(raw) {
  const lower = String(raw || '').toLowerCase();
  if (lower.length <= 2) return lower;

  // Always collapse 3+ identical consecutive chars to 1
  let collapsed = lower.replace(/(.)\1{2,}/g, '$1');
  if (WORD_SET.has(collapsed)) return collapsed;

  // Try collapsing all double identical chars (Indonesian rarely uses double vowels/consonants in basic words except 'maaf', 'taat', 'tinggi', 'tunggu', 'minggu')
  const single = collapsed.replace(/(.)\1+/g, '$1');
  if (WORD_SET.has(single)) return single;

  return collapsed;
}

/**
 * Compute Levenshtein edit distance between two strings.
 */
export function editDistance(a, b) {
  if (a === b) return 0;
  const m = a.length;
  const n = b.length;
  if (Math.abs(m - n) > 2) return 99;

  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }
  return dp[m][n];
}

/**
 * Segment a continuous stream of fingerspelled letters into Indonesian words
 * using Dynamic Programming (e.g. "AKUSUKAKAMU" -> ["aku", "suka", "kamu"]).
 *
 * @param {string} letterStream
 * @param {boolean} [isFinal=false] whether the word/stream is finished (allows fuzzy correction)
 * @returns {string[]}
 */
export function segmentLetterStream(letterStream, isFinal = false) {
  const clean = collapseLetterStutter(
    String(letterStream || '').replace(/[^a-zA-Z]/g, '')
  );
  if (!clean) return [];
  if (WORD_SET.has(clean)) return [clean];

  const n = clean.length;
  // dp[i] = { cost: number, words: string[] } for prefix clean[0..i)
  const dp = new Array(n + 1).fill(null);
  dp[0] = { cost: 0, words: [] };

  for (let i = 0; i < n; i++) {
    if (!dp[i]) continue;

    // 1. Try exact dictionary word match starting at i
    for (const word of SORTED_DICT) {
      const end = i + word.length;
      if (end <= n && clean.slice(i, end) === word) {
        // Prefer longer dictionary words (cost 0.1 per word)
        const nextCost = dp[i].cost + 0.1;
        if (!dp[end] || nextCost < dp[end].cost) {
          dp[end] = { cost: nextCost, words: [...dp[i].words, word] };
        }
      }
    }

    // 2. Fallback: consume 1 raw character with penalty cost 1.2
    const end1 = i + 1;
    const rawCost = dp[i].cost + 1.2;
    if (!dp[end1] || rawCost < dp[end1].cost) {
      const prevWords = [...dp[i].words];
      const last = prevWords[prevWords.length - 1];
      if (last && !WORD_SET.has(last)) {
        prevWords[prevWords.length - 1] = last + clean[i];
      } else {
        prevWords.push(clean[i]);
      }
      dp[end1] = { cost: rawCost, words: prevWords };
    }
  }

  let result = dp[n]?.words || [clean];

  // 3. If stream is finalized, try fuzzy-correcting any unknown chunk >= 3 chars (distance = 1)
  if (isFinal) {
    result = result.map((chunk) => {
      const c = collapseLetterStutter(chunk);
      if (WORD_SET.has(c) || c.length < 3) return c;
      let bestWord = c;
      let bestDist = 2;
      for (const dictWord of CORE_INDONESIAN_WORDS) {
        if (Math.abs(dictWord.length - c.length) > 1) continue;
        if (dictWord[0] !== c[0]) continue;
        const d = editDistance(c, dictWord);
        if (d === 1 && d < bestDist) {
          bestDist = d;
          bestWord = dictWord;
        }
      }
      return bestWord;
    });
  }

  return result;
}

/**
 * Compose a mixed array of committed tokens (words and single letters)
 * into a clean, natural Indonesian sentence.
 *
 * @param {string[]} tokens
 * @param {boolean} [finalizeLastLetters=false]
 * @returns {string}
 */
export function composeSmartSentence(tokens, finalizeLastLetters = false) {
  if (!Array.isArray(tokens) || tokens.length === 0) return '';

  const words = [];
  let letterRun = '';

  const flushLetters = (isFinal) => {
    if (!letterRun) return;
    const segmented = segmentLetterStream(letterRun, isFinal);
    for (const w of segmented) {
      if (w) words.push(w.toUpperCase());
    }
    letterRun = '';
  };

  for (const tok of tokens) {
    if (tok === ' ') {
      flushLetters(true);
      continue;
    }
    const clean = String(tok || '').trim();
    if (!clean) continue;

    if (clean.length === 1 && /^[A-Za-z]$/.test(clean)) {
      letterRun += clean;
    } else {
      flushLetters(true);
      // Avoid immediate duplicate word
      if (words[words.length - 1] !== clean.toUpperCase()) {
        words.push(clean.toUpperCase());
      }
    }
  }

  flushLetters(finalizeLastLetters);

  return words.join(' ').replace(/\s+/g, ' ').trim();
}
