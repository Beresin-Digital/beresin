/**
 * Indonesian strings for shared chrome and sections.
 *
 * Translation rules followed here: faithful to the English source, plain
 * honest Indonesian, no invented numbers or promises, no em/en dashes.
 * Page-specific copy lives in the page files, not here.
 */
import type { Dict } from "./types";

export const id: Dict = {
  site: {
    region: "Jawa Barat",
    country: "Indonesia",
  },
  nav: {
    home: "Beranda",
    services: "Layanan",
    portfolio: "Portofolio",
    about: "Tentang",
    articles: "Artikel",
    contact: "Kontak",
    menuAria: "Menu navigasi",
    homeSr: "— beranda",
    getInTouch: "Hubungi Kami",
    chatWhatsapp: "Chat di WhatsApp",
  },
  footer: {
    description:
      "Partner solusi digital dan pengembangan untuk website, aplikasi mobile, aplikasi web kustom, solusi IoT, integrasi sistem, dan desain grafis.",
    navigation: "Navigasi",
    contact: "Kontak",
    rights: "Hak cipta dilindungi undang-undang.",
    cookiePreferences: "Preferensi Cookie",
    privacy: "Kebijakan Privasi",
    terms: "Syarat & Ketentuan",
    menu: {
      home: "Beranda",
      services: "Layanan",
      portfolio: "Portofolio",
      clients: "Klien",
      articles: "Artikel",
      schoolDirectory: "Direktori Sekolah",
      about: "Tentang",
    },
  },
  contactForm: {
    honeypot: "Jangan diisi",
    nameLabel: "Nama Lengkap",
    namePlaceholder: "Nama Anda",
    phoneLabel: "WhatsApp / Nomor Telepon",
    phonePlaceholder: "0812xxxxxxx",
    emailLabel: "Email",
    emailOptional: "(opsional)",
    emailPlaceholder: "nama@perusahaan.com",
    messageLabel: "Kebutuhan Proyek",
    messagePlaceholder: "Website / Aplikasi Web Kustom / Aplikasi Mobile / Integrasi / IoT...",
    submit: "Kirim Pesan →",
    privacyBefore: "Dengan mengirim formulir ini, Anda menyetujui pemrosesan data Anda sesuai dengan ",
    privacyLink: "Kebijakan Privasi",
    privacyAfter: " kami.",
  },
  consultModal: {
    badge: "Ajukan Proyek",
    title: "Konsultasi Proyek",
    lead: "Tim Beresin Digital akan menghubungi Anda kembali dengan estimasi awal.",
    closeLabel: "Tutup dialog",
  },
  formStatus: {
    success:
      "Terima kasih! Pesan Anda sudah kami terima. Tim Beresin Digital akan menghubungi Anda kembali.",
    rateLimited:
      "Terlalu banyak percobaan dari jaringan ini. Silakan coba lagi dalam beberapa menit, atau hubungi kami langsung lewat WhatsApp.",
    system:
      "Maaf, kami tidak dapat menyimpan pesan Anda karena kendala teknis. Silakan coba lagi sesaat lagi, atau hubungi kami langsung lewat WhatsApp.",
    checkBefore: "Silakan periksa kolom ",
    checkAfter: " sebelum mengirim.",
    fields: {
      nama: "nama lengkap",
      telepon: "nomor WhatsApp / telepon",
      email: "alamat email",
      pesan: "kebutuhan proyek",
      required: "wajib",
    },
  },
  hero: {
    badge: "SOLUSI DIGITAL",
    headlineRest: "DIBANGUN UNTUK BISNIS ANDA.",
    leadStart: "Kami merancang dan membangun ",
    leadEmphasis: "website, aplikasi, dan solusi digital kustom",
    leadEnd: " yang membantu bisnis bekerja lebih cerdas dan bertumbuh.",
    ctaDiscuss: "Diskusikan Proyek Anda",
    ctaExplore: "Jelajahi Karya Kami",
    strip: "WEBSITE · APLIKASI · SISTEM KUSTOM",
  },
  servicesSection: {
    eyebrow: "Apa yang kami kerjakan",
    heading: "Website, aplikasi, integrasi, dan desain yang dibangun sesuai bisnis Anda.",
    allServices: "Semua layanan →",
  },
  clientsSection: {
    eyebrow: "Partner Tepercaya",
    heading: "Dipercaya bisnis dan tim",
    lead: "Partner pengembangan dan desain untuk perusahaan, yayasan pendidikan, dan agensi.",
  },
  aboutSection: {
    eyebrow: "Siapa kami",
    heading: "Solusi digital, dibangun sesuai bisnis Anda.",
    lead: "Beresin Digital membantu bisnis membangun dan mengembangkan solusi digitalnya, dari website profesional hingga aplikasi dan sistem kustom. Kami memadukan desain yang jelas dengan rekayasa yang andal, dan bekerja dengan timeline yang terstruktur.",
    badges: [
      "Pengiriman terstruktur dan ruang lingkup yang jelas",
      "Dipercaya bisnis, sekolah, dan agensi",
    ],
    coverTitle: "Yang kami kerjakan",
    coverLink: "Lihat detail layanan →",
  },
  portfolioSection: {
    eyebrow: "Karya Pilihan",
    heading: "Karya yang bisa kami tunjukkan.",
    lead: "Contoh solusi yang kami bangun. Karya konsep diberi label dengan jelas, kami hanya menampilkan proyek yang sudah diserahkan sebagai proyek yang sudah diserahkan.",
    viewAll: "Lihat semua karya",
  },
  whySection: {
    eyebrow: "Kenapa Memilih Kami",
    heading: "Kenapa bekerja dengan kami.",
    lead: "Empat hal yang berlaku, baik saat Anda memesan website maupun sistem yang dijalankan bisnis.",
  },
  partnershipSection: {
    eyebrow: "Kemitraan",
    heading: "Mari membangun bersama.",
    lead: "Di luar klien langsung, kami bekerja sebagai partner pengembangan untuk tim dan agensi yang membutuhkan pengerjaan build, di bawah brand Anda atau brand kami.",
    cta: "Diskusikan Kemitraan",
  },
  articlesSection: {
    eyebrow: "Insight",
    heading: "Catatan dan panduan dari tim kami.",
    allArticles: "Semua artikel →",
    readMore: "Baca selengkapnya",
    moreArticles: "Artikel lainnya",
    minRead: "mnt baca",
  },
  processSection: {
    eyebrow: "Proses Kami",
    heading: "Lima langkah, tanpa kejutan.",
    lead: "Proses yang sama berlaku untuk satu halaman situs maupun sistem kustom penuh. Anda selalu tahu apa yang sedang dikerjakan dan apa yang akan Anda terima di setiap tahap.",
  },
  principlesSection: {
    eyebrow: "Prinsip dan Cara Kami Bekerja",
    heading: "Cara kami bekerja.",
    lead: "Enam hal yang berlaku di setiap proyek, apa pun ukurannya. Ini bukan sekadar nilai pajangan, Anda bisa menuntut semuanya dari kami.",
  },
  faqSection: {
    heading: "Pertanyaan yang sering diajukan.",
    lead: "Hal-hal yang paling sering ditanyakan klien dan partner sebelum memulai proyek.",
  },
  serviceDetail: {
    serviceLabel: "Layanan",
    whatYouGet: "Yang Anda dapatkan",
    bestFor: "Cocok untuk",
    discussService: "Diskusikan layanan ini",
    discussVerb: "Diskusikan",
  },
  projectCard: {
    viewDetails: "Lihat detail",
    viewDetailsAria: "Lihat detail: ",
  },
  portfolioModal: {
    closeLabel: "Tutup detail proyek",
  },
  notFound: {
    badge: "Error 404",
    heading: "Halaman tidak ditemukan",
    lead: "Tautan yang Anda ikuti mungkin sudah dipindahkan atau memang tidak pernah ada. Kembali ke beranda, atau hubungi kami langsung jika Anda mencari sesuatu yang spesifik.",
    backHome: "Kembali ke Beranda",
    contactUs: "Hubungi Kami",
    quickLinksLabel: "Tautan cepat",
  },
  legal: {
    updatedLabel: "Terakhir diperbarui:",
  },
  images: {
    heroTeam: "Tim Beresin Digital berkolaborasi mengerjakan proyek digital",
  },
  switcher: {
    ariaLabel: "Ganti bahasa",
  },
  waMessages: {
    discussProject: "Halo Beresin Digital, saya ingin mendiskusikan proyek digital.",
    arrangeVisit: "Halo Beresin Digital, saya ingin mengatur kunjungan ke kantor Anda.",
  },
  modalSubjects: {
    discussProject: "Diskusikan Proyek Anda",
    serviceConsultation: "Konsultasi Layanan",
    askArticles: "Tanya Soal Artikel",
    partnership: "Diskusikan Kemitraan",
  },
};
