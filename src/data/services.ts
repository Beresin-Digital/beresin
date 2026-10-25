/**
 * Static marketing copy for the service catalogue.
 * This is editorial content, not CMS content — edit here and redeploy.
 *
 * Four services, presented at the same level. `services[locale]` is the single
 * display order used by the homepage card grid and by /services. The English
 * entries are the published copy; the Indonesian entries are faithful
 * translations of the same facts (same services, same deliverables, no new
 * promises).
 *
 * `deliverables` and `audience` are only rendered on /services (the detailed
 * page). The homepage section keeps the compact `description`-only presentation.
 *
 * Service images are shared between locales; only the `alt` text differs, so
 * the Indonesian entries spread the manifest entry and override `alt`.
 */
import type { SiteImage } from '../assets/images/manifest';
import { images } from '../assets/images/manifest';
import type { Locale } from '../i18n';

export interface Service {
  /** Stable id, also used as the anchor for deep links. */
  id: string;
  title: string;
  /** One-line summary — used by the compact homepage section. */
  description: string;
  /** 2–3 sentence expansion — used by the detailed /services sections. */
  longDescription: string;
  /** Concrete things the client receives. */
  deliverables: string[];
  /** Who this service is for. */
  audience: string[];
  image: SiteImage;
}

export const services: Record<Locale, Service[]> = {
  en: [
    {
      id: 'website-mobile-apps',
      title: 'Website & Mobile Apps Development',
      description:
        'Company websites, landing pages, custom web applications, and Android & iOS apps built around how your business works.',
      longDescription:
        'We design and build the digital products your business runs on and sells with — from a fast corporate website or landing page to a custom web application and a mobile app that share one backend. Every build starts from the goal rather than a template, so the result follows your process instead of forcing your process to fit the software.',
      deliverables: [
        'Corporate websites & company profiles',
        'Campaign & product landing pages',
        'Custom web applications & admin panels',
        'Android & iOS apps',
        'Custom design matched to your brand',
        'Admin panel so your team edits content itself',
        'Core Web Vitals, SEO & analytics',
        'Training & handover documentation',
      ],
      audience: ['Corporates', 'Startups & SMEs', 'Marketing teams'],
      image: images.serviceWebApp,
    },
    {
      id: 'iot-solutions',
      title: 'IoT Solutions',
      description:
        'Connected devices, sensors, and monitoring dashboards for buildings, facilities, and operations.',
      longDescription:
        'We connect sensors, controllers, and devices into one system you monitor from a single dashboard, so the data is actually used: lower energy use, faster alerts, and a clear record of what is happening on site.',
      deliverables: [
        'Device & sensor installation',
        'Central monitoring dashboard',
        'Real-time alerts via email & WhatsApp',
        'Automation rules for equipment',
        'Integration with existing systems',
        'Network documentation & training',
      ],
      audience: ['Facilities & offices', 'Manufacturing', 'Property'],
      image: images.serviceIot,
    },
    {
      id: 'system-integration',
      title: 'System Integration',
      description:
        'Connect the tools you already use so data stops being re-typed between systems.',
      longDescription:
        'Most businesses run on several tools that do not talk to each other. We connect them — payments, messaging, CRM, accounting, and internal systems — through well-documented APIs and integrations, so information moves automatically and reliably.',
      deliverables: [
        'REST & webhook integrations',
        'Payment, messaging & CRM connections',
        'API design & documentation',
        'Data migration & scheduled sync',
        'Single sign-on & access control',
      ],
      audience: ['Operations teams', 'Growing businesses', 'Agencies'],
      image: images.serviceCustomSystem,
    },
    {
      id: 'graphic-design',
      title: 'Graphic Design',
      description:
        'UI/UX design, branding, and the visual assets that keep your product and your brand consistent.',
      longDescription:
        'Good design is what makes a system usable and a brand recognisable. We cover UI/UX for websites and applications, brand identity, and the day-to-day visual assets — logos, guidelines, and collateral — so everything you put out looks like it came from the same place.',
      deliverables: [
        'UI/UX design for websites & apps',
        'Brand identity & logo design',
        'Brand guidelines & visual systems',
        'Social media & campaign assets',
        'Print & digital collateral',
        'Design handoff & component libraries',
      ],
      audience: ['Startups & SMEs', 'Marketing teams', 'Agencies'],
      image: images.serviceDesign,
    },
  ],
  id: [
    {
      id: 'website-mobile-apps',
      title: 'Pengembangan Website & Aplikasi Mobile',
      description:
        'Website perusahaan, landing page, aplikasi web kustom, dan aplikasi Android & iOS yang dibangun mengikuti cara bisnis Anda bekerja.',
      longDescription:
        'Kami merancang dan membangun produk digital yang dipakai bisnis Anda untuk beroperasi dan berjualan, dari website perusahaan atau landing page yang cepat sampai aplikasi web kustom dan aplikasi mobile yang berbagi satu backend. Setiap pembangunan dimulai dari tujuan, bukan dari template, sehingga hasilnya mengikuti proses Anda, bukan memaksa proses Anda menyesuaikan dengan perangkat lunak.',
      deliverables: [
        'Website perusahaan & company profile',
        'Landing page kampanye & produk',
        'Aplikasi web kustom & panel admin',
        'Aplikasi Android & iOS',
        'Desain kustom sesuai brand Anda',
        'Panel admin agar tim Anda mengedit konten sendiri',
        'Core Web Vitals, SEO & analitik',
        'Pelatihan & dokumentasi serah terima',
      ],
      audience: ['Korporat', 'Startup & UKM', 'Tim marketing'],
      image: {
        ...images.serviceWebApp,
        alt: 'Kode di layar untuk pengembangan website dan aplikasi',
      },
    },
    {
      id: 'iot-solutions',
      title: 'Solusi IoT',
      description:
        'Perangkat terhubung, sensor, dan dasbor pemantauan untuk gedung, fasilitas, dan operasional.',
      longDescription:
        'Kami menghubungkan sensor, kontroler, dan perangkat menjadi satu sistem yang Anda pantau dari satu dasbor, sehingga datanya benar-benar dipakai: pemakaian energi lebih rendah, peringatan lebih cepat, dan catatan yang jelas tentang apa yang terjadi di lokasi.',
      deliverables: [
        'Instalasi perangkat & sensor',
        'Dasbor pemantauan terpusat',
        'Peringatan real-time lewat email & WhatsApp',
        'Aturan otomasi untuk peralatan',
        'Integrasi dengan sistem yang sudah ada',
        'Dokumentasi jaringan & pelatihan',
      ],
      audience: ['Fasilitas & perkantoran', 'Manufaktur', 'Properti'],
      image: {
        ...images.serviceIot,
        alt: 'Termostat pintar di dinding untuk kontrol suhu ruangan otomatis',
      },
    },
    {
      id: 'system-integration',
      title: 'Integrasi Sistem',
      description:
        'Menghubungkan tools yang sudah Anda pakai agar data berhenti diketik ulang antar sistem.',
      longDescription:
        'Kebanyakan bisnis berjalan di atas beberapa tools yang tidak saling terhubung. Kami menghubungkannya, pembayaran, messaging, CRM, akuntansi, dan sistem internal, lewat API dan integrasi yang terdokumentasi dengan baik, sehingga informasi berpindah secara otomatis dan andal.',
      deliverables: [
        'Integrasi REST & webhook',
        'Koneksi pembayaran, messaging & CRM',
        'Desain & dokumentasi API',
        'Migrasi data & sinkronisasi terjadwal',
        'Single sign-on & kontrol akses',
      ],
      audience: ['Tim operasional', 'Bisnis yang sedang bertumbuh', 'Agensi'],
      image: {
        ...images.serviceCustomSystem,
        alt: 'Antarmuka dasbor untuk sistem digital kustom',
      },
    },
    {
      id: 'graphic-design',
      title: 'Desain Grafis',
      description:
        'Desain UI/UX, branding, dan aset visual yang menjaga produk dan brand Anda tetap konsisten.',
      longDescription:
        'Desain yang bagus membuat sistem mudah dipakai dan brand mudah dikenali. Kami menangani UI/UX untuk website dan aplikasi, identitas brand, dan aset visual sehari-hari, logo, panduan, dan materi pendukung, sehingga semua yang Anda terbitkan terlihat berasal dari tempat yang sama.',
      deliverables: [
        'Desain UI/UX untuk website & aplikasi',
        'Identitas brand & desain logo',
        'Panduan brand & sistem visual',
        'Aset media sosial & kampanye',
        'Materi cetak & digital',
        'Serah terima desain & pustaka komponen',
      ],
      audience: ['Startup & UKM', 'Tim marketing', 'Agensi'],
      image: {
        ...images.serviceDesign,
        alt: 'Peralatan desain grafis dan sketsa identitas brand',
      },
    },
  ],
};

/**
 * What the studio covers, shown in the About column.
 *
 * This replaced three fabricated percentage bars ("Innovative Design 89%"),
 * which had no basis and could not be substantiated.
 */
export const coverage: Record<Locale, { label: string; note: string }[]> = {
  en: [
    {
      label: 'Website & mobile apps',
      note: 'Company profiles, web apps, Android & iOS',
    },
    {
      label: 'IoT solutions',
      note: 'Sensors, monitoring, central dashboards',
    },
    {
      label: 'System integration',
      note: 'APIs, payments, messaging, CRM connections',
    },
    {
      label: 'Graphic design',
      note: 'UI/UX, branding, and visual identity',
    },
  ],
  id: [
    {
      label: 'Website & aplikasi mobile',
      note: 'Company profile, aplikasi web, Android & iOS',
    },
    {
      label: 'Solusi IoT',
      note: 'Sensor, pemantauan, dasbor terpusat',
    },
    {
      label: 'Integrasi sistem',
      note: 'API, pembayaran, messaging, koneksi CRM',
    },
    {
      label: 'Desain grafis',
      note: 'UI/UX, branding, dan identitas visual',
    },
  ],
};

/** Scrolling banner items between the hero and the services section. */
export const marqueeItems: Record<Locale, string[]> = {
  en: [
    'Website Development',
    'Mobile Apps',
    'IoT Solutions',
    'System Integration',
    'UI/UX Design',
    'Branding',
  ],
  id: [
    'Pengembangan Website',
    'Aplikasi Mobile',
    'Solusi IoT',
    'Integrasi Sistem',
    'Desain UI/UX',
    'Branding',
  ],
};
