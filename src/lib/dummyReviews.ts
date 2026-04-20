// Ratusan ulasan dummy realistis untuk halaman publik.
// Disusun dari kombinasi nama Indonesia + perangkat + tipe perbaikan + komentar.
// Distribusi rating realistis: ~78% bintang 5, 17% bintang 4, 4% bintang 3, 1% bintang 2.

export interface DummyReview {
  id: string;
  name: string;
  initials: string;
  avatarColor: string;
  stars: number;
  text: string;
  service: string;
  device: string;
  daysAgo: number;
  verified: boolean;
}

const FIRST_NAMES_M = [
  "Andi", "Budi", "Rizky", "Dimas", "Fajar", "Hendra", "Iqbal", "Joko", "Krisna",
  "Lukman", "Maulana", "Nanda", "Oka", "Pandu", "Rama", "Surya", "Taufik", "Wahyu",
  "Yusuf", "Zaki", "Arif", "Bagas", "Candra", "Dedi", "Eko", "Faisal", "Galang",
  "Hadi", "Irfan", "Jefri", "Kurnia", "Latif", "Miko", "Naufal", "Oscar", "Putra",
  "Rendi", "Satria", "Teguh", "Umar", "Vino", "Wisnu", "Yoga", "Zulkifli", "Adit",
  "Bimo", "Cahyo", "Doni", "Eka", "Farhan", "Gema", "Haris", "Indra", "Junaedi",
];

const FIRST_NAMES_F = [
  "Siti", "Dewi", "Rina", "Maya", "Nia", "Putri", "Sari", "Tika", "Wulan",
  "Yuni", "Anisa", "Bella", "Citra", "Diah", "Endah", "Fani", "Gita", "Hesti",
  "Indah", "Jihan", "Kartika", "Laras", "Mira", "Nabila", "Olivia", "Pipit",
  "Qori", "Ratna", "Salsa", "Tiara", "Ulfa", "Vina", "Widya", "Yulia", "Zahra",
  "Ayu", "Bunga", "Cici", "Dini", "Erika", "Fitri", "Gina", "Hilda", "Intan",
  "Jessica", "Kirana", "Lani", "Mega", "Nadia", "Olla", "Putu", "Rahma",
];

const LAST_NAMES = [
  "Pratama", "Saputra", "Wijaya", "Kusuma", "Hidayat", "Nugroho", "Santoso",
  "Setiawan", "Permana", "Hakim", "Ramadhan", "Fadillah", "Maulida", "Anggraini",
  "Lestari", "Wahyuni", "Safitri", "Rahayu", "Putri", "Handayani", "Nurhaliza",
  "Alfarizi", "Ibrahim", "Suryadi", "Hartono", "Susanto", "Wibowo", "Pranoto",
  "Mahendra", "Adiwijaya", "Pertiwi", "Cahaya", "Anandita", "Rasyid", "Firdaus",
  "", "", "", "", "", // some without last name
];

const DEVICES = [
  "iPhone 11", "iPhone 12", "iPhone 13", "iPhone 14", "iPhone 15", "iPhone X",
  "iPhone 8", "iPhone 7", "Samsung A52", "Samsung A53", "Samsung A54", "Samsung S22",
  "Samsung S23", "Samsung Note 10", "Samsung M22", "Xiaomi Redmi Note 10",
  "Xiaomi Redmi Note 11", "Xiaomi Redmi Note 12", "Xiaomi 11T", "Xiaomi 12",
  "Oppo A57", "Oppo A77", "Oppo Reno 7", "Oppo Reno 8", "Vivo Y15", "Vivo Y20",
  "Vivo V25", "Realme 9", "Realme 10", "Realme C35", "Infinix Hot 12",
  "Infinix Note 12", "Tecno Spark 9", "Poco X3", "Poco X4", "Poco F4",
];

const SERVICES = [
  "Ganti LCD", "Ganti Baterai", "Ganti Konektor Charger", "Ganti Speaker",
  "Ganti Kamera", "Ganti Tombol Power", "Servis Cas Rusak", "Servis HP Kena Air",
  "Flash / Install Ulang", "Buka Pola Lupa", "Restore Data", "Ganti Casing",
  "Servis Sinyal Hilang", "Ganti Mic", "Ganti IC Power", "Pasang Tempered Glass",
  "Servis Bootloop", "Ganti Backdoor", "Ganti Frame", "Servis HP Mati Total",
];

const TEMPLATES_5 = [
  "Mantap! {service} di {device} saya selesai cuma {time}, hasilnya rapi banget. Recommended!",
  "Pelayanan ramah, teknisinya sabar jelasin masalahnya. {service} {device} saya jadi normal lagi.",
  "Udah langganan service di sini. Harga bersaing, kualitas oke. {service} kemarin bagus hasilnya.",
  "Awalnya ragu mau {service} {device}, tapi ternyata hasilnya memuaskan. Garansinya juga bonus!",
  "Top deh. {device} saya sebelumnya {problem}, setelah {service} jadi seperti baru lagi.",
  "Cepet banget proses {service}-nya. Konsumennya dijelasin detail dulu sebelum mulai. Recomended bgt!",
  "Harga sesuai kualitas. {service} {device} di sini hasilnya rapi, ga ada kendala sampai sekarang.",
  "Pertama kali nyoba di sini, sumpah ga nyesel. {device} udah {problem} parah, sekarang normal total.",
  "Pelayanan profesional, ada nota dan invoice resmi. {service} {device} nya cepet banget.",
  "Bener-bener puas. {service} di sini ga lama, sekitar {time} udah kelar. Worth it!",
  "Teknisinya ramah, suka kasih tips merawat HP juga. {service} {device} saya beres dengan rapi.",
  "Dari kemarin nyari tempat service yang amanah, akhirnya ketemu di sini. {service} hasilnya joss!",
  "Booking online gampang banget, datang langsung dikerjain. {service} {device} cuma {time}.",
  "Terima kasih sudah perbaiki {device} saya yang {problem}. Sekarang udah bisa dipake lagi 👍",
  "Pengerjaan rapi, ga ada bekas bongkar. {service} {device} hasilnya bagus banget. Lanjutkan!",
  "Servis cepat dan teliti. {device} saya sebelumnya {problem}, sekarang lancar jaya 🚀",
  "Kualitas pengerjaan top. Garansi juga jelas. Lain kali pasti ke sini lagi kalau ada masalah HP.",
  "Hp saya udah {problem} parah, di tempat lain divonis ga bisa. Di sini malah berhasil! Mantap.",
  "Pelayanan ramah, dijelasin step by step. {service} {device} dengan harga reasonable. Puas!",
  "Recomended! {service} {device} di sini cepet, harga terjangkau, dan teknisinya ramah.",
  "Bagus banget pelayanannya. {service} {device} saya selesai dalam {time}, langsung bisa dipakai.",
  "Dari awal masuk udah kerasa profesional. {service} {device} hasilnya memuaskan, garansi juga ada.",
  "Saya kasih bintang 5 karena {service}-nya benar-benar berkualitas. Tidak rewel saat saya tanya banyak.",
  "Tempatnya bersih, antrian terorganisir. {service} {device} berjalan lancar tanpa kendala.",
  "Sudah 3x service di sini, selalu memuaskan. {service} {device} kemarin pun hasilnya rapi.",
  "Tempat service paling jujur yang pernah saya temui. {service} {device} dikerjakan transparan, harga pun fair.",
  "Sumpah pelayanannya juara. {device} saya yang {problem} ditangani cepat, hasilnya seperti baru.",
  "Teknisinya berpengalaman, langsung tau masalahnya. {service} {device} cuma {time} kelar.",
  "Suka banget sama tempat ini. {service} {device} hasilnya rapi, harga ga bikin kantong jebol.",
  "Setelah {service}, {device} saya yang tadinya {problem} jadi normal lagi. Garansinya beneran ada.",
  "Pelayanan ramah, ga jutek. {service} {device} dijelasin biaya rinci dulu sebelum dikerjain. Top!",
  "Gercep banget! {service} {device} saya kelar dalam {time}. Ga bikin nunggu lama-lama.",
  "Sudah cocok di sini. {service} {device} hasilnya selalu memuaskan, ga ada drama.",
  "Lokasi strategis, parkir luas, pelayanan oke. {service} {device} hasilnya bagus banget.",
  "Recommended buat yang nyari service HP berkualitas. {service} {device} saya hasilnya sempurna.",
  "Teknisi sabar banget jawab pertanyaan saya yang awam. {service} {device} kelar dengan baik.",
  "Harga transparan, ga ada biaya siluman. {service} {device} sesuai estimasi awal. Puas banget.",
  "Dari sekian banyak tempat service, di sini yang paling profesional. {service} {device} top markotop.",
  "Garansi jelas, after sales oke. {service} {device} aman, ga perlu khawatir.",
  "Suka cara mereka kerja. {service} {device} saya rapi, ga ada cacat sedikitpun. Mantap!",
  "Servis di sini cepat dan terpercaya. {service} {device} kelar {time} aja. Lanjutkan kualitasnya!",
  "Pelayanan kelas atas, hasil maksimal. {service} {device} bener-bener bikin saya jadi pelanggan tetap.",
  "Saya rekomendasiin ke temen-temen, semua puas. {service} {device} di sini emang juara.",
  "Sparepart original, pengerjaan rapi. {service} {device} hasilnya awet sampai sekarang.",
  "{device} saya udah {problem}, di sini bisa diselamatkan. Terima kasih banyak teknisinya!",
  "Estimasi waktu akurat. {service} {device} selesai pas waktu yang dijanjikan, bahkan lebih cepat.",
  "Pelayanan VIP rasanya. {service} {device} dikerjain teliti, hasil bagus, harga wajar.",
  "Cocok banget buat orang sibuk. Booking online, datang, {time} kelar. {service} {device} mantap.",
  "Sangat profesional. {service} {device} dilengkapi nota resmi dan garansi. Terpercaya!",
  "Service paling worth it di kota ini. {service} {device} hasilnya premium, harga standar.",
];

const TEMPLATES_4 = [
  "Pelayanan oke, {service} {device} hasilnya bagus. Cuma agak rame jadi nunggu dikit. Overall puas.",
  "Hasil bagus, harga reasonable. Mungkin bisa dipercepat lagi pengerjaannya. Tapi tetap recommended.",
  "{service} {device} sudah selesai dengan baik. Sedikit lama dari estimasi tapi hasilnya rapi.",
  "Cukup puas dengan {service} {device}. Tempatnya rame jadi harus sabar nunggu, tapi hasilnya oke.",
  "Servisnya bagus, cuma awal masuk agak lama dilayani. {service} {device}-nya sendiri sih top.",
  "{service} {device} hasilnya rapi. Tapi waktu pengerjaan agak lebih lama dari yang dijanjikan.",
  "Overall bagus. {service} berhasil, cuma ekspektasi waktunya kurang sesuai. Tetap saya rekomendasikan.",
];

const TEMPLATES_3 = [
  "Hasil {service} {device} oke, tapi pengerjaan lumayan lama. Mungkin perlu tambahan teknisi.",
  "Lumayan, {service}-nya beres. Tapi komunikasi update progress bisa ditingkatkan.",
  "Cukup. {service} {device} berhasil tapi prosesnya lebih lama dari estimasi yang diberikan.",
];

const TEMPLATES_2 = [
  "Hasil {service} bagus, tapi sempat ada miskomunikasi soal estimasi biaya. Semoga ke depannya lebih baik.",
];

const PROBLEMS = [
  "mati total", "ngeblank", "bootloop", "LCD pecah", "baterai cepat habis",
  "ga bisa dicas", "speaker pecah", "kamera blur", "tombol power keras",
  "kena air", "sinyal hilang", "mic ga jelas", "restart sendiri",
];

const TIMES = ["30 menit", "1 jam", "45 menit", "kurang dari sejam", "2 jam", "sehari"];

const AVATAR_COLORS = [
  "from-blue-500 to-blue-600",
  "from-emerald-500 to-emerald-600",
  "from-amber-500 to-orange-500",
  "from-pink-500 to-rose-500",
  "from-violet-500 to-purple-500",
  "from-cyan-500 to-teal-500",
  "from-red-500 to-rose-600",
  "from-indigo-500 to-blue-600",
  "from-yellow-500 to-amber-500",
  "from-fuchsia-500 to-pink-500",
];

// Deterministic PRNG (mulberry32) — same output every render
const mulberry32 = (seed: number) => {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const pick = <T,>(arr: T[], rnd: () => number): T => arr[Math.floor(rnd() * arr.length)];

const fillTemplate = (
  tpl: string,
  rnd: () => number,
  service: string,
  device: string,
) =>
  tpl
    .split("{service}").join(service)
    .split("{device}").join(device)
    .split("{problem}").join(pick(PROBLEMS, rnd))
    .split("{time}").join(pick(TIMES, rnd));

const buildReviews = (count: number): DummyReview[] => {
  const rnd = mulberry32(20240101);
  const reviews: DummyReview[] = [];
  for (let i = 0; i < count; i++) {
    const isMale = rnd() > 0.45;
    const first = isMale ? pick(FIRST_NAMES_M, rnd) : pick(FIRST_NAMES_F, rnd);
    const last = pick(LAST_NAMES, rnd);
    const fullName = (last ? `${first} ${last}` : first).trim();

    // Rating distribution lebih positif: 5(88%) 4(10%) 3(2%)
    const r = rnd();
    let stars = 5;
    let tpl: string;
    if (r > 0.98) {
      stars = 3;
      tpl = pick(TEMPLATES_3, rnd);
    } else if (r > 0.88) {
      stars = 4;
      tpl = pick(TEMPLATES_4, rnd);
    } else {
      tpl = pick(TEMPLATES_5, rnd);
    }

    const device = pick(DEVICES, rnd);
    const service = pick(SERVICES, rnd);
    const text = fillTemplate(tpl, rnd, service, device);
    const initials = fullName
      .split(" ")
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase();

    reviews.push({
      id: `r-${i}`,
      name: fullName,
      initials,
      avatarColor: pick(AVATAR_COLORS, rnd),
      stars,
      text,
      service,
      device,
      daysAgo: Math.floor(rnd() * 365) + 1,
      verified: rnd() > 0.18,
    });
  }
  // sort newest first
  return reviews.sort((a, b) => a.daysAgo - b.daysAgo);
};

// Lazy-built so importing this module is cheap (no work at module load).
let _reviews: DummyReview[] | null = null;
let _stats: { total: number; average: number; breakdown: { stars: number; count: number; percent: number }[] } | null = null;

const computeStats = (reviews: DummyReview[]) => {
  const total = reviews.length;
  const sum = reviews.reduce((a, r) => a + r.stars, 0);
  const avg = sum / total;
  const counts = [0, 0, 0, 0, 0];
  reviews.forEach((r) => counts[r.stars - 1]++);
  return {
    total,
    average: Number(avg.toFixed(1)),
    breakdown: counts
      .map((c, i) => ({ stars: i + 1, count: c, percent: Math.round((c / total) * 100) }))
      .reverse(),
  };
};

export const getDummyReviews = (): DummyReview[] => {
  if (!_reviews) _reviews = buildReviews(1248);
  return _reviews;
};

export const getReviewStats = () => {
  if (!_stats) _stats = computeStats(getDummyReviews());
  return _stats;
};

export const formatRelativeDays = (days: number): string => {
  if (days <= 0) return "Hari ini";
  if (days === 1) return "Kemarin";
  if (days < 7) return `${days} hari lalu`;
  if (days < 30) return `${Math.floor(days / 7)} minggu lalu`;
  if (days < 365) return `${Math.floor(days / 30)} bulan lalu`;
  return `${Math.floor(days / 365)} tahun lalu`;
};

