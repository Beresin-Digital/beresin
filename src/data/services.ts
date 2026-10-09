/**
 * Static marketing copy for the three service pillars.
 * This is editorial content, not CMS content — edit here and redeploy.
 *
 * `deliverables` and `audience` are only rendered on /layanan (the detailed page).
 * The homepage section keeps the compact `description`-only presentation.
 */
import type { SiteImage } from '../assets/images/manifest';
import { images } from '../assets/images/manifest';

export interface Service {
  /** Stable id, also used as the anchor for deep links. */
  id: string;
  title: string;
  /** One-line summary — used by the compact homepage section. */
  description: string;
  /** 2–3 sentence expansion — used by the detailed /layanan sections. */
  longDescription: string;
  /** Concrete things the client receives. */
  deliverables: string[];
  /** Who this pillar is for. */
  audience: string[];
  /** Renders the highlighted lime card in the middle of the grid. */
  featured?: boolean;
  image: SiteImage;
}

export const services: Service[] = [
  {
    id: 'web-app',
    title: 'Web & App Development',
    description:
      'Website perusahaan, aplikasi web custom, e-commerce, dan aplikasi mobile iOS/Android berkinerja tinggi.',
    longDescription:
      'Kami membangun website dan aplikasi yang cepat, aman, dan bisa dikelola tim Anda sendiri. Setiap proyek dimulai dari pemetaan proses bisnis, bukan dari template — supaya sistem yang jadi benar-benar mengikuti cara kerja Anda, bukan sebaliknya.',
    deliverables: [
      'Website company profile & landing page kampanye',
      'Aplikasi web custom: panel admin & dashboard pengguna',
      'E-commerce dan katalog produk online',
      'Aplikasi mobile Android & iOS',
      'Integrasi payment gateway, WhatsApp, dan API pihak ketiga',
      'Optimasi kecepatan (Core Web Vitals) & SEO teknis',
      'Panel admin agar tim Anda bisa mengubah konten sendiri',
      'Dokumentasi teknis & pelatihan pengelolaan',
    ],
    audience: ['Korporasi', 'Yayasan & Sekolah', 'Instansi Pemerintah'],
    image: images.serviceWebApp,
  },
  {
    id: 'siakad',
    title: 'SIAKAD & E-Government',
    description:
      'Sistem Akademik Sekolah/Yayasan terpadu, portal PPDB online, dan aplikasi layanan publik instansi pemerintah.',
    longDescription:
      'Kami menyatukan data akademik dan layanan publik yang biasanya tersebar di banyak berkas dan aplikasi terpisah. Dirancang untuk dipakai staf non-teknis sehari-hari, dengan alur persetujuan dan laporan yang mengikuti prosedur lembaga Anda.',
    deliverables: [
      'SIAKAD terpadu: akademik, keuangan, dan rapor',
      'PPDB / SPMB online dengan verifikasi berkas',
      'Portal orang tua & siswa: nilai, absensi, tagihan',
      'Aplikasi absensi guru & siswa',
      'Dashboard pimpinan: rekap dan laporan berkala',
      'Portal layanan publik & formulir pengajuan online',
      'Integrasi data antar-unit atau antar-instansi',
      'Migrasi data lama & pelatihan staf',
    ],
    audience: ['Yayasan & Sekolah', 'Instansi Pemerintah'],
    featured: true,
    image: images.serviceSiakad,
  },
  {
    id: 'design',
    title: 'Graphic Design & Branding',
    description:
      'Desain identitas brand, panduan logo, laporan tahunan (Annual Report), dan materi promosi cetak/digital.',
    longDescription:
      'Kami menyusun identitas visual yang konsisten di semua titik sentuh — dari logo sampai laporan tahunan. Sasaran kami bukan sekadar tampilan yang menarik, tapi memastikan lembaga Anda dikenali dan dipercaya.',
    deliverables: [
      'Logo & identitas visual',
      'Brand guideline: aturan warna, tipografi, penggunaan logo',
      'Template sosial media & materi kampanye',
      'Laporan tahunan (annual report) & company profile cetak',
      'Desain presentasi & materi pitching',
      'Kemasan, signage, dan materi cetak lain',
      'Aset digital siap pakai (vektor & raster)',
    ],
    audience: ['Korporasi', 'Yayasan & Sekolah', 'Instansi Pemerintah'],
    image: images.serviceDesign,
  },
  {
    id: 'iot',
    title: 'IoT & Smart Home',
    description:
      'Sistem IoT dan otomatisasi bangunan: kontrol perangkat, monitoring sensor, dan dashboard terpusat untuk hunian, kantor, sekolah, dan gedung.',
    longDescription:
      'Kami merangkai sensor, kontroler, dan perangkat pintar menjadi satu sistem yang dipantau dan dikendalikan dari satu dashboard — untuk hunian, kantor, sekolah, maupun gedung instansi. Fokus kami bukan sekadar memasang perangkat, tapi memastikan datanya terpakai: hemat energi, aman, dan bisa ditindaklanjuti.',
    deliverables: [
      'Instalasi & konfigurasi perangkat IoT (sensor, relay, kontroler)',
      'Otomatisasi pencahayaan, pendingin, dan peralatan listrik',
      'Dashboard monitoring terpusat (web & mobile)',
      'Monitoring sensor: suhu, kelembapan, kualitas udara, dan gerak',
      'Kontrol akses pintu & integrasi CCTV',
      'Notifikasi real-time via WhatsApp & email saat ada anomali',
      'Integrasi dengan sistem yang sudah berjalan (absensi, ERP, BMS)',
      'Dokumentasi topologi jaringan & pelatihan pengelolaan',
    ],
    audience: ['Hunian & Perkantoran', 'Korporasi', 'Yayasan & Sekolah', 'Instansi Pemerintah'],
    image: images.serviceIot,
  },
];

/**
 * Headline stats shown in the hero's left column.
 *
 * These are the company's real figures. The original mockup carried inflated
 * placeholder numbers (150+ / 250+ / "8 years") which were replaced — publishing
 * unverifiable business claims is misleading advertising under UU 8/1999.
 */
export const stats = [
  { value: '10', suffix: '+', label: 'Happy Client' },
  { value: '10', suffix: '+', label: 'Project Done' },
  { value: '100', suffix: '%', label: 'SLA Guaranteed' },
] as const;

/**
 * What the studio covers, shown in the About column.
 *
 * This replaced three fabricated percentage bars ("Innovative Design 89%"),
 * which had no basis and could not be substantiated.
 */
export const coverage = [
  {
    label: 'Website & aplikasi custom',
    note: 'Company profile, e-commerce, aplikasi internal',
  },
  {
    label: 'Sistem akademik & portal instansi',
    note: 'SIAKAD, PPDB online, layanan publik',
  },
  {
    label: 'IoT & otomatisasi bangunan',
    note: 'Sensor, kontrol perangkat, dashboard monitoring',
  },
  {
    label: 'Desain grafis & identitas brand',
    note: 'Logo, brand guideline, laporan tahunan',
  },
] as const;

/** Scrolling banner items between the hero and the services section. */
export const marqueeItems = [
  'Web & App Development',
  'Graphic Design & Branding',
  'SIAKAD Sekolah & Yayasan',
  'Portal E-Government',
  'IoT & Smart Home',
] as const;
