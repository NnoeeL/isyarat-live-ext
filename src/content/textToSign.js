/**
 * Indonesian Text / Voice -> Sign (SIBI/BISINDO) engine.
 * Includes lightweight Indonesian stemming, 65+ everyday word-level signs,
 * common multi-word phrases, and automatic A-Z fingerspelling fallback.
 */

// 32 real human model demo videos (WL-BISINDO) bundled locally in public/signs/words/
export const WORD_VIDEOS = {
  air: 'signs/words/air.mp4',
  belajar: 'signs/words/belajar.mp4',
  cari: 'signs/words/cari.mp4',
  hari: 'signs/words/hari.mp4',
  ingat: 'signs/words/ingat.mp4',
  lagi: 'signs/words/lagi.mp4',
  maaf: 'signs/words/maaf.mp4',
  makan: 'signs/words/makan.mp4',
  motor: 'signs/words/motor.mp4',
  saya: 'signs/words/saya.mp4',
  aku: 'signs/words/saya.mp4',
  terima: 'signs/words/terima.mp4',
  tuli: 'signs/words/tuli.mp4',
  apa: 'signs/words/apa.mp4',
  siapa: 'signs/words/siapa.mp4',
  kapan: 'signs/words/kapan.mp4',
  dimana: 'signs/words/dimana.mp4',
  mana: 'signs/words/dimana.mp4',
  mengapa: 'signs/words/mengapa.mp4',
  kenapa: 'signs/words/mengapa.mp4',
  bagaimana: 'signs/words/bagaimana.mp4',
  merah: 'signs/words/merah.mp4',
  kuning: 'signs/words/kuning.mp4',
  hijau: 'signs/words/hijau.mp4',
  hitam: 'signs/words/hitam.mp4',
  dengar: 'signs/words/dengar.mp4',
  berangkat: 'signs/words/berangkat.mp4',
  pergi: 'signs/words/berangkat.mp4',
  datang: 'signs/words/datang.mp4',
  teman: 'signs/words/teman.mp4',
  keluarga: 'signs/words/keluarga.mp4',
  rumah: 'signs/words/rumah.mp4',
  pagi: 'signs/words/pagi.mp4',
  siang: 'signs/words/siang.mp4',
  sore: 'signs/words/sore.mp4',
  malam: 'signs/words/malam.mp4',
};

export const SIGN_DICTIONARY = {
  // Kata benda, warna & kata tambahan WL-BISINDO (punya video model manusia asli)
  air: { label: 'AIR', cue: 'Isyarat BISINDO untuk "Air"', icon: '💧' },
  cari: { label: 'CARI', cue: 'Isyarat BISINDO untuk "Cari"', icon: '🔍' },
  hari: { label: 'HARI', cue: 'Isyarat BISINDO untuk "Hari"', icon: '📅' },
  lagi: { label: 'LAGI', cue: 'Isyarat BISINDO untuk "Lagi"', icon: '🔁' },
  motor: { label: 'MOTOR', cue: 'Isyarat BISINDO untuk "Motor"', icon: '🏍️' },
  tuli: { label: 'TULI', cue: 'Isyarat BISINDO untuk "Tuli"', icon: '🤟' },
  mengapa: { label: 'MENGAPA', cue: 'Isyarat BISINDO untuk "Mengapa"', icon: '🤔' },
  merah: { label: 'MERAH', cue: 'Isyarat BISINDO untuk warna "Merah"', icon: '🔴' },
  kuning: { label: 'KUNING', cue: 'Isyarat BISINDO untuk warna "Kuning"', icon: '🟡' },
  hijau: { label: 'HIJAU', cue: 'Isyarat BISINDO untuk warna "Hijau"', icon: '🟢' },
  hitam: { label: 'HITAM', cue: 'Isyarat BISINDO untuk warna "Hitam"', icon: '⚫' },
  berangkat: { label: 'BERANGKAT', cue: 'Isyarat BISINDO untuk "Berangkat"', icon: '🚶' },

  // Kata ganti orang
  aku: { label: 'AKU', cue: 'Tunjuk dada sendiri dengan jari telunjuk', icon: '☝️' },
  saya: { label: 'SAYA', cue: 'Tunjuk dada sendiri dengan jari telunjuk', icon: '☝️' },
  kamu: { label: 'KAMU', cue: 'Tunjuk ke arah lawan bicara dengan jari telunjuk', icon: '👉' },
  anda: { label: 'ANDA', cue: 'Arahkan telapak tangan terbuka ke arah lawan bicara', icon: '🫱' },
  kita: { label: 'KITA', cue: 'Gerakkan jari telunjuk melingkar dari bahu kanan ke bahu kiri', icon: '🤝' },
  kami: { label: 'KAMI', cue: 'Sentuh bahu kanan lalu bahu kiri dengan jari telunjuk', icon: '👥' },
  dia: { label: 'DIA', cue: 'Tunjuk ke samping dengan jari telunjuk', icon: '👈' },
  mereka: { label: 'MEREKA', cue: 'Sapukan jari telunjuk menyamping mencakup beberapa orang', icon: '👥' },

  // Salam & sopan santun
  halo: { label: 'HALO', cue: 'Lambaikan telapak tangan terbuka di samping kepala', icon: '👋' },
  hai: { label: 'HAI', cue: 'Lambaikan telapak tangan terbuka ke arah lawan bicara', icon: '👋' },
  selamat: { label: 'SELAMAT', cue: 'Tepuk kedua tangan atau rangkul tangan di depan dada', icon: '🎉' },
  terima: { label: 'TERIMA KASIH', cue: 'Sentuh dagu dengan ujung jari lalu gerakkan maju', icon: '🙏' },
  sama: { label: 'SAMA-SAMA', cue: 'Arahkan kedua telapak tangan terbuka bergantian ke depan', icon: '🤲' },
  maaf: { label: 'MAAF', cue: 'Kepalkan tangan dan putar lembut di depan dada', icon: '🤝' },
  tolong: { label: 'TOLONG', cue: 'Letakkan kepalan tangan dengan ibu jari ke atas di atas telapak tangan lain, angkat bersama', icon: '🤲' },
  permisi: { label: 'PERMISI', cue: 'Usap punggung tangan kiri dengan ujung jari kanan ke depan', icon: '🙇' },

  // Perasaan & ekspresi
  suka: { label: 'SUKA', cue: 'Letakkan ibu jari & jari tengah di dada lalu tarik maju sambil menguncup', icon: '💚' },
  cinta: { label: 'CINTA', cue: 'Silangkan kedua tangan di depan dada seperti memeluk', icon: '🫶' },
  sayang: { label: 'SAYANG', cue: 'Silangkan kedua tangan di dada dengan lembut', icon: '❤️' },
  senang: { label: 'SENANG', cue: 'Usap dada ke atas dengan telapak tangan terbuka sambil tersenyum', icon: '😊' },
  bahagia: { label: 'BAHAGIA', cue: 'Gerakkan kedua telapak tangan ke atas di depan dada berulang kali', icon: '😄' },
  sedih: { label: 'SEDIH', cue: 'Turunkan kedua telapak tangan di depan wajah secara perlahan', icon: '😢' },
  marah: { label: 'MARAH', cue: 'Tekuk jari seperti cakar di depan wajah lalu tarik ke depan', icon: '😠' },
  takut: { label: 'TAKUT', cue: 'Buka kedua tangan di depan dada lalu getarkan sedikit ke dalam', icon: '😨' },
  capek: { label: 'CAPEK', cue: 'Letakkan kedua tangan di dada lalu turunkan bahu sambil menghela', icon: '😮‍💨' },
  sakit: { label: 'SAKIT', cue: 'Putar kedua jari telunjuk saling berhadapan di dekat bagian yang sakit', icon: '🤕' },
  lapar: { label: 'LAPAR', cue: 'Bentuk tangan huruf C lalu turunkan dari dada ke perut', icon: '🍽️' },
  haus: { label: 'HAUS', cue: 'Tarik jari telunjuk turun di sepanjang leher', icon: '💧' },

  // Respon & kata sifat dasar
  ya: { label: 'YA', cue: 'Kepalkan tangan lalu anggukkan pergelangan tangan ke bawah', icon: '👍' },
  iya: { label: 'IYA', cue: 'Kepalkan tangan lalu anggukkan pergelangan tangan ke bawah', icon: '👍' },
  oke: { label: 'OKE', cue: 'Temukan ujung ibu jari & telunjuk membentuk lingkaran O, 3 jari lain tegak', icon: '👌' },
  tidak: { label: 'TIDAK', cue: 'Gelengkan telapak tangan atau jari telunjuk ke kiri dan kanan', icon: '🙅' },
  bukan: { label: 'BUKAN', cue: 'Letakkan ibu jari di bawah dagu lalu jentikkan ke depan', icon: '🚫' },
  bagus: { label: 'BAGUS', cue: 'Acungkan ibu jari ke atas dengan mantap', icon: '👍' },
  baik: { label: 'BAIK', cue: 'Sentuh dagu dengan telapak tangan lalu turunkan ke telapak tangan lain', icon: '✨' },
  buruk: { label: 'BURUK', cue: 'Sentuh dagu lalu balikkan telapak tangan mengarah ke bawah', icon: '👎' },
  besar: { label: 'BESAR', cue: 'Rentangkan kedua tangan menjauh ke kiri dan kanan', icon: '↔️' },
  kecil: { label: 'KECIL', cue: 'Dekatkan kedua telapak tangan saling berhadapan', icon: '🤏' },
  banyak: { label: 'BANYAK', cue: 'Buka kedua kepalan tangan melebar berkali-kali', icon: '🙌' },
  sedikit: { label: 'SEDIKIT', cue: 'Jepit tipis ujung ibu jari dan jari telunjuk', icon: '🤏' },
  cepat: { label: 'CEPAT', cue: 'Tarik kedua tangan bentuk L ke belakang dengan cepat', icon: '⚡' },
  pelan: { label: 'PELAN', cue: 'Usap punggung tangan kiri perlahan ke atas dengan tangan kanan', icon: '🐢' },

  // Kata kerja sehari-hari
  mau: { label: 'MAU', cue: 'Buka kedua telapak tangan menghadap atas lalu tarik ke arah tubuh', icon: '🙋' },
  ingin: { label: 'INGIN', cue: 'Tarik kedua tangan terbuka ke arah dada', icon: '🙋' },
  bisa: { label: 'BISA', cue: 'Kepalkan kedua tangan lalu turunkan bersamaan dengan mantap', icon: '💪' },
  makan: { label: 'MAKAN', cue: 'Kuncupkan jari lalu arahkan ke mulut dua kali', icon: '🍽️' },
  minum: { label: 'MINUM', cue: 'Bentuk huruf C dengan tangan lalu miringkan ke arah mulut', icon: '🥤' },
  tidur: { label: 'TIDUR', cue: 'Tempelkan kedua telapak tangan di samping pipi sambil memiringkan kepala', icon: '😴' },
  bangun: { label: 'BANGUN', cue: 'Buka ibu jari & telunjuk di dekat mata seperti kelopak mata terbuka', icon: '👀' },
  pergi: { label: 'PERGI', cue: 'Arahkan kedua jari telunjuk maju menjauh dari tubuh', icon: '🚶' },
  datang: { label: 'DATANG', cue: 'Gerakkan jari telunjuk dari depan menuju ke arah tubuh', icon: '👋' },
  pulang: { label: 'PULANG', cue: 'Kuncupkan jari sentuh pipi lalu arahkan ke bentuk atap rumah', icon: '🏠' },
  kerja: { label: 'KERJA', cue: 'Ketukkan pergelangan kepalan tangan kanan di atas kepalan tangan kiri', icon: '💼' },
  belajar: { label: 'BELAJAR', cue: 'Buka telapak tangan kiri seperti buku, tangan kanan mengambil ke arah dahi', icon: '📖' },
  tunggu: { label: 'TUNGGU', cue: 'Angkat kedua telapak tangan terbuka menghadap atas lalu gerakkan jari ringan', icon: '⏳' },
  lihat: { label: 'LIHAT', cue: 'Bentuk huruf V dengan telunjuk & jari tengah, arahkan dari mata ke depan', icon: '👁️' },
  dengar: { label: 'DENGAR', cue: 'Tunjuk atau lengkungkan tangan di belakang telinga', icon: '👂' },
  bicara: { label: 'BICARA', cue: 'Gerakkan jari telunjuk memutar kecil di depan mulut', icon: '🗣️' },
  paham: { label: 'PAHAM', cue: 'Jentikkan jari telunjuk tegak di samping pelipis', icon: '💡' },
  erti: { label: 'MENGERTI', cue: 'Jentikkan jari telunjuk tegak di samping pelipis', icon: '💡' },
  tahu: { label: 'TAHU', cue: 'Ketuk pelipis dahi dengan ujung jari-jari tangan kanan', icon: '🧠' },
  ingat: { label: 'INGAT', cue: 'Sentuh dahi dengan ibu jari lalu tempelkan ke ibu jari tangan kiri', icon: '💭' },
  lupa: { label: 'LUPA', cue: 'Usap dahi dari kiri ke kanan lalu kuncupkan jari', icon: '🤷' },

  // Kata tanya
  apa: { label: 'APA', cue: 'Buka kedua telapak tangan menghadap atas sambil digoyangkan ringan', icon: '❓' },
  siapa: { label: 'SIAPA', cue: 'Lingkarkan jari telunjuk di sekitar dagu/mulut', icon: '❓' },
  dimana: { label: 'DI MANA', cue: 'Angkat jari telunjuk lalu goyangkan ke kiri dan kanan', icon: '📍' },
  mana: { label: 'MANA', cue: 'Angkat jari telunjuk lalu goyangkan ke kiri dan kanan', icon: '📍' },
  kapan: { label: 'KAPAN', cue: 'Putar jari telunjuk kanan mengelilingi ujung telunjuk kiri lalu sentuhkan', icon: '🕒' },
  kenapa: { label: 'KENAPA', cue: 'Sentuh dahi lalu tarik tangan keluar membentuk huruf Y', icon: '🤔' },
  bagaimana: { label: 'BAGAIMANA', cue: 'Temukan punggung kedua tangan lalu putar terbuka ke atas', icon: '❓' },

  // Waktu, orang & tempat
  nama: { label: 'NAMA', cue: 'Ketukkan jari telunjuk & tengah kanan di atas jari telunjuk & tengah kiri', icon: '🏷️' },
  kabar: { label: 'KABAR', cue: 'Buka kedua telapak tangan dari dada ke arah depan', icon: '💬' },
  pagi: { label: 'PAGI', cue: 'Angkat lengan kanan seperti matahari terbit di atas lengan kiri', icon: '🌅' },
  siang: { label: 'SIANG', cue: 'Tegakkan lengan kanan di atas lengan kiri seperti matahari di atas kepala', icon: '☀️' },
  sore: { label: 'SORE', cue: 'Miringkan lengan kanan turun perlahan di atas lengan kiri', icon: '🌇' },
  malam: { label: 'MALAM', cue: 'Lengkungkan telapak tangan kanan turun melewati pergelangan tangan kiri', icon: '🌙' },
  rumah: { label: 'RUMAH', cue: 'Temukan ujung jari kedua tangan membentuk atap segitiga', icon: '🏠' },
  sekolah: { label: 'SEKOLAH', cue: 'Tepukkan kedua telapak tangan dua kali dengan ritmis', icon: '🏫' },
  teman: { label: 'TEMAN', cue: 'Kaitkan kedua jari telunjuk saling bertautan bergantian', icon: '🤝' },
  keluarga: { label: 'KELUARGA', cue: 'Bentuk huruf F dengan kedua tangan lalu buat lingkaran ke depan', icon: '👨‍👩‍👧‍👦' },
  ibu: { label: 'IBU', cue: 'Sentuh dagu dengan ibu jari dari telapak tangan terbuka', icon: '👩' },
  ayah: { label: 'AYAH', cue: 'Sentuh dahi dengan ibu jari dari telapak tangan terbuka', icon: '👨' },
};

const MULTI_WORD_PHRASES = [
  { phrase: 'terima kasih', key: 'terima' },
  { phrase: 'sama sama', key: 'sama' },
  { phrase: 'apa kabar', key: 'kabar' },
  { phrase: 'di mana', key: 'dimana' },
];

const SUFFIX_RE = /(lah|kah|tah|pun|nya|ku|mu)$/;
const DERIVATIONAL_SUFFIX_RE = /(kan|an|i)$/;

/**
 * Basic Indonesian stemmer (Nazief-Adriani inspired lightweight rules).
 * Preserves dictionary words and roots >= 3 characters.
 *
 * @param {string} rawWord
 * @returns {string}
 */
export function stemIndonesian(rawWord) {
  let word = String(rawWord || '')
    .toLowerCase()
    .replace(/[^a-z-]/g, '');

  if (!word) return '';

  // Handle reduplication (e.g. "rumah-rumah" -> "rumah")
  if (word.includes('-')) {
    const parts = word.split('-').filter(Boolean);
    if (parts.length === 2 && parts[0] === parts[1]) {
      word = parts[0];
    } else {
      word = parts[0] || '';
    }
  }

  if (SIGN_DICTIONARY[word] || word.length <= 3) {
    return word;
  }

  // Strip particle/possessive suffixes
  if (SUFFIX_RE.test(word)) {
    const candidate = word.replace(SUFFIX_RE, '');
    if (candidate.length >= 3) {
      word = candidate;
      if (SIGN_DICTIONARY[word]) return word;
    }
  }

  // Strip common prefixes
  const prefixRules = [
    [/^meny([aiueo])/, 's$1'],
    [/^meng([aiueo])/, '$1'],
    [/^meng/, ''],
    [/^men([aiueo])/, 't$1'],
    [/^men/, ''],
    [/^mem([aiueo])/, 'p$1'],
    [/^mem/, ''],
    [/^me/, ''],
    [/^peng/, ''],
    [/^pen/, ''],
    [/^pem/, ''],
    [/^ber/, ''],
    [/^ter/, ''],
    [/^di/, ''],
    [/^ke/, ''],
    [/^se/, ''],
  ];

  // Prefer any prefix stripping that directly matches SIGN_DICTIONARY
  let fallbackWord = null;
  for (const [pattern, replacement] of prefixRules) {
    if (pattern.test(word)) {
      const candidate = word.replace(pattern, replacement);
      if (candidate.length >= 3) {
        if (SIGN_DICTIONARY[candidate]) return candidate;
        if (fallbackWord === null) fallbackWord = candidate;
      }
    }
  }
  if (fallbackWord !== null) {
    word = fallbackWord;
  }

  // Strip derivational suffix (-kan, -an, -i)
  if (DERIVATIONAL_SUFFIX_RE.test(word)) {
    const candidate = word.replace(DERIVATIONAL_SUFFIX_RE, '');
    if (candidate.length >= 3) {
      if (SIGN_DICTIONARY[candidate]) return candidate;
      word = candidate;
    }
  }

  return word;
}

// Finger posture definitions for A-Z inline SVG data URLs (immune to host-page img-src CSP)
const ALPHABET_POSTURES = {
  a: { fingers: [1, 0, 0, 0, 0], hint: 'Kepal, ibu jari di sisi' },
  b: { fingers: [0, 1, 1, 1, 1], hint: '4 jari tegak, ibu jari lipat' },
  c: { fingers: [0.5, 0.5, 0.5, 0.5, 0.5], hint: 'Tangan melengkung bentuk C' },
  d: { fingers: [0.5, 1, 0, 0, 0], hint: 'Telunjuk tegak, jari lain melingkar' },
  e: { fingers: [0, 0.5, 0.5, 0.5, 0.5], hint: 'Ujung jari menekuk ke telapak' },
  f: { fingers: [0.5, 0.5, 1, 1, 1], hint: 'Ibu jari & telunjuk bertemu, 3 tegak' },
  g: { fingers: [0.5, 1, 0, 0, 0], hint: 'Telunjuk & ibu jari sejajar ke samping' },
  h: { fingers: [0, 1, 1, 0, 0], hint: 'Telunjuk & tengah lurus ke samping' },
  i: { fingers: [0, 0, 0, 0, 1], hint: 'Kelingking tegak, jari lain kepal' },
  j: { fingers: [0, 0, 0, 0, 1], hint: 'Kelingking tegak lalu lengkungkan J' },
  k: { fingers: [0.5, 1, 1, 0, 0], hint: 'Telunjuk & tengah V, ibu jari di tengah' },
  l: { fingers: [1, 1, 0, 0, 0], hint: 'Ibu jari & telunjuk bentuk L' },
  m: { fingers: [0, 0.5, 0.5, 0.5, 0], hint: '3 jari menutupi ibu jari' },
  n: { fingers: [0, 0.5, 0.5, 0, 0], hint: '2 jari menutupi ibu jari' },
  o: { fingers: [0.5, 0.5, 0.5, 0.5, 0.5], hint: 'Semua ujung jari bertemu bentuk O' },
  p: { fingers: [0.5, 1, 0.5, 0, 0], hint: 'Seperti K mengarah ke bawah' },
  q: { fingers: [0.5, 0.5, 0, 0, 0], hint: 'Seperti G mengarah ke bawah' },
  r: { fingers: [0, 1, 1, 0, 0], hint: 'Telunjuk & jari tengah menyilang' },
  s: { fingers: [0.5, 0, 0, 0, 0], hint: 'Kepalan erat, ibu jari di depan' },
  t: { fingers: [0.5, 0.5, 0, 0, 0], hint: 'Ibu jari diselipkan di bawah telunjuk' },
  u: { fingers: [0, 1, 1, 0, 0], hint: 'Telunjuk & tengah rapat tegak' },
  v: { fingers: [0, 1, 1, 0, 0], hint: 'Telunjuk & tengah terbuka bentuk V' },
  w: { fingers: [0, 1, 1, 1, 0], hint: '3 jari tengah terbuka bentuk W' },
  x: { fingers: [0, 0.5, 0, 0, 0], hint: 'Telunjuk melengkung seperti kait' },
  y: { fingers: [1, 0, 0, 0, 1], hint: 'Ibu jari & kelingking terbuka' },
  z: { fingers: [0, 1, 0, 0, 0], hint: 'Telunjuk menggambar huruf Z di udara' },
};

export function createLetterSvgDataUrl(letter) {
  const ch = String(letter || 'a').toLowerCase();
  const info = ALPHABET_POSTURES[ch] || ALPHABET_POSTURES.a;
  const [thumb, idx, mid, ring, pinky] = info.fingers;
  const fh = (v) => (v === 1 ? 38 : v === 0.5 ? 22 : 10);
  const fc = (v) => (v === 1 ? '#4d7c6f' : v === 0.5 ? '#789d91' : '#d6d3cd');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120"><rect width="120" height="120" rx="20" fill="#ffffff" stroke="#e7e5e4" stroke-width="2"/><rect x="8" y="8" width="28" height="28" rx="8" fill="#4d7c6f"/><text x="22" y="27" text-anchor="middle" font-family="system-ui,sans-serif" font-size="16" font-weight="700" fill="#ffffff">${ch.toUpperCase()}</text><g transform="translate(22, 18)"><rect x="${thumb === 1 ? 4 : 12}" y="${thumb === 1 ? 48 : 56}" width="11" height="${thumb === 1 ? 26 : 16}" rx="5.5" transform="rotate(${thumb === 1 ? -35 : -15} 10 60)" fill="${fc(thumb)}"/><rect x="20" y="${54 - fh(idx)}" width="11" height="${fh(idx)}" rx="5.5" fill="${fc(idx)}"/><rect x="34" y="${52 - fh(mid)}" width="11" height="${fh(mid)}" rx="5.5" fill="${fc(mid)}"/><rect x="48" y="${54 - fh(ring)}" width="11" height="${fh(ring)}" rx="5.5" fill="${fc(ring)}"/><rect x="62" y="${58 - fh(pinky)}" width="10" height="${fh(pinky)}" rx="5" fill="${fc(pinky)}"/><rect x="18" y="50" width="54" height="32" rx="14" fill="#e7e5e4" stroke="#a8a29e" stroke-width="1.2"/></g></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Default asset resolver: uses inline data URL for A-Z SVGs so host-page img-src CSP
 * (like WhatsApp Web) never blocks images, and chrome.runtime.getURL otherwise.
 * @param {string} relativePath
 * @returns {string}
 */
export function defaultAssetResolver(relativePath) {
  const svgMatch = String(relativePath || '').match(/^signs\/([a-z])\.svg$/i);
  if (svgMatch) {
    return createLetterSvgDataUrl(svgMatch[1]);
  }
  if (typeof chrome !== 'undefined' && chrome?.runtime?.getURL) {
    return chrome.runtime.getURL(relativePath);
  }
  return relativePath;
}

/**
 * Convert Indonesian text into a sequence of playable sign frames.
 * Matched dictionary words emit a 'word' step; unknown words emit 'letter'
 * fingerspelling steps pointing to `signs/{a-z}.svg`.
 *
 * @param {string} text
 * @param {(path: string) => string} [assetResolver]
 */
export function translateTextToSignSequence(
  text,
  assetResolver = defaultAssetResolver
) {
  let normalized = String(text || '')
    .toLowerCase()
    .replace(/[^\p{L}\s-]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!normalized) return [];

  // Replace known multi-word phrases with single lookup tokens
  for (const { phrase, key } of MULTI_WORD_PHRASES) {
    const re = new RegExp(`\\b${phrase}\\b`, 'g');
    normalized = normalized.replace(re, `__phrase_${key}__`);
  }

  const tokens = normalized.split(' ').filter(Boolean);
  const sequence = [];

  for (const token of tokens) {
    const phraseMatch = token.match(/^__phrase_([a-z]+)__$/);
    if (phraseMatch) {
      const key = phraseMatch[1];
      const entry = SIGN_DICTIONARY[key];
      if (entry) {
        const videoRel = WORD_VIDEOS[key];
        sequence.push({
          type: 'word',
          label: entry.label,
          sourceWord: entry.label.toLowerCase(),
          cue: entry.cue,
          icon: entry.icon,
          videoPath: videoRel,
          videoUrl: videoRel ? assetResolver(videoRel) : undefined,
          durationMs: videoRel ? 2600 : 1400,
        });
        continue;
      }
    }

    const stemmed = stemIndonesian(token);
    const matchedKey = SIGN_DICTIONARY[token]
      ? token
      : SIGN_DICTIONARY[stemmed]
        ? stemmed
        : null;
    const dictEntry = matchedKey ? SIGN_DICTIONARY[matchedKey] : null;

    if (dictEntry) {
      const videoRel = WORD_VIDEOS[matchedKey];
      sequence.push({
        type: 'word',
        label: dictEntry.label,
        sourceWord: token,
        cue: dictEntry.cue,
        icon: dictEntry.icon,
        videoPath: videoRel,
        videoUrl: videoRel ? assetResolver(videoRel) : undefined,
        durationMs: videoRel ? 2600 : 1300,
      });
    } else {
      // Fallback: fingerspell A-Z using local SVG assets
      const letters = token.replace(/[^a-z]/g, '');
      for (const ch of letters) {
        sequence.push({
          type: 'letter',
          label: ch.toUpperCase(),
          sourceWord: token,
          cue: `Eja huruf "${ch.toUpperCase()}" (SIBI/BISINDO)`,
          assetUrl: assetResolver(`signs/${ch}.svg`),
          durationMs: 800,
        });
      }
    }
  }

  return sequence;
}
