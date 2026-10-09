/**
 * Procurement FAQ for /layanan.
 *
 * Two kinds of answer live in this file, and they are not equal:
 *
 * 1. FACTUAL — how we work, who owns the code, where data lives, willingness to
 *    sign an NDA. These match the Terms & Conditions and Privacy Policy already
 *    published, and are safe to ship.
 *
 * 2. COMMITMENTS — anything that promises a duration, a number of revisions, or
 *    a payment schedule. Those are commercial promises the client can hold us
 *    to, so each one carries a TODO(user) marker until the owner confirms it.
 *    Do not remove a TODO without a real answer behind it.
 *
 * Answers are plain text, never HTML: the same string feeds the accordion and
 * the FAQPage JSON-LD, so nothing here can smuggle markup into structured data.
 */
export interface FaqItem {
  question: string;
  answer: string;
}

export const faqItems: FaqItem[] = [
  {
    question: 'Apakah source code dan aset desain menjadi milik kami?',
    answer:
      'Ya. Setelah pelunasan, seluruh source code aplikasi, aset desain, dan dokumen teknis menjadi milik Anda sepenuhnya. Kami tidak menahan sistem Anda sebagai sandera dan tidak memasang kunci lisensi tersembunyi.',
  },
  {
    question: 'Di mana data dan sistem kami disimpan?',
    answer:
      'Di server yang kami sewa di Indonesia, sehingga data Anda tidak keluar dari yurisdiksi Indonesia. Kami tidak menyimpan alamat IP mentah pengunjung — hanya bentuk terenkripsi (HMAC) untuk keperluan keamanan, sesuai prinsip minimalisasi data pada UU PDP.',
  },
  {
    question: 'Apakah tim kami dilatih untuk mengelola sistemnya sendiri?',
    answer:
      'Ya. Setiap proyek ditutup dengan pelatihan penggunaan dan dokumentasi tertulis. Panel admin dirancang untuk staf non-teknis, sehingga tim Anda bisa memperbarui konten dan data sehari-hari tanpa perlu menghubungi kami.',
  },
  {
    question: 'Apakah Anda bisa mengikuti proses pengadaan atau tender?',
    answer:
      'Bisa. PT Beresin Urusan DIgital adalah badan hukum resmi dengan NPWP dan rekening perusahaan, sehingga dapat mengikuti pengadaan langsung maupun tender, melengkapi dokumen administrasi, dan menerbitkan invoice resmi sesuai ketentuan instansi Anda.',
  },
  {
    question: 'Bersediakah menandatangani NDA sebelum diskusi teknis?',
    answer:
      'Bersedia. Kami memahami bahwa sebagian lembaga perlu menandatangani perjanjian kerahasiaan lebih dulu sebelum membuka data atau prosedur internal. Silakan kirimkan draf NDA Anda, atau kami sediakan draf standar untuk ditinjau.',
  },
  {
    question: 'Bagaimana skema pembayaran yang Anda terapkan?',
    // TODO(user): confirm the actual milestone split (e.g. 30/40/30) and whether
    // a DP is required before kickoff, then state it here. Until then the answer
    // deliberately points at the proposal rather than inventing percentages —
    // this string is rendered on the page AND published in FAQPage JSON-LD.
    answer:
      'Pembayaran dilakukan bertahap mengikuti progres pekerjaan, bukan sekaligus di muka. Rincian termin dan persentasenya kami tuangkan tertulis di proposal agar dapat Anda verifikasi sebelum proyek dimulai.',
  },
  {
    question: 'Berapa lama estimasi pengerjaan sebuah proyek?',
    // TODO(user): replace the hedge with real duration ranges per project type
    // once the owner confirms them.
    answer:
      'Durasi bergantung pada lingkup: website company profile jauh lebih cepat daripada sistem akademik terpadu. Estimasi waktu yang mengikat kami cantumkan di proposal setelah sesi pemetaan, bukan angka umum yang tidak bisa kami pertanggungjawabkan.',
  },
  {
    question: 'Apakah ada garansi setelah sistem diluncurkan?',
    // TODO(user): confirm the warranty window (e.g. 30/60/90 days) and what it
    // covers (bug fixes only, or also small content changes).
    answer:
      'Ada. Kami memberikan masa garansi perbaikan untuk bug atau kesalahan yang berasal dari pekerjaan kami, di luar perubahan kebutuhan baru. Durasi dan cakupannya kami sebutkan jelas di proposal.',
  },
];
