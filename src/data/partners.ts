/**
 * Partnership section content for the homepage.
 *
 * The four audiences we explicitly invite to collaborate. `icon` is a lucide
 * icon name resolved in `Partnership.astro`, matching the pattern used by the
 * clients marquee.
 */
import type { Locale } from '../i18n';

export interface PartnerType {
  title: string;
  description: string;
  /** lucide icon name. */
  icon: string;
}

export const partnerTypes: Record<Locale, PartnerType[]> = {
  en: [
    {
      title: 'Companies that need digital solutions',
      description:
        'Ongoing product, website, or internal-system work you would rather hand to a dedicated team than hire for.',
      icon: 'building-2',
    },
    {
      title: 'Creative & branding agencies',
      description:
        'You own the strategy and the identity; we handle the build so your client gets one delivery with no handoff gaps.',
      icon: 'palette',
    },
    {
      title: 'Digital marketing agencies',
      description:
        'Landing pages, campaign sites, and integrations built to your specs and handed over under your brand.',
      icon: 'megaphone',
    },
    {
      title: 'Agencies needing a development partner',
      description:
        'White-label development capacity for the projects your team cannot take on in-house.',
      icon: 'code',
    },
  ],
  id: [
    {
      title: 'Perusahaan yang butuh solusi digital',
      description:
        'Pekerjaan produk, website, atau sistem internal yang berkelanjutan, yang lebih baik diserahkan ke tim khusus daripada merekrut untuk itu.',
      icon: 'building-2',
    },
    {
      title: 'Agensi kreatif & branding',
      description:
        'Anda memegang strategi dan identitasnya; kami menangani pembangunannya sehingga klien Anda mendapat satu serah terima tanpa celah.',
      icon: 'palette',
    },
    {
      title: 'Agensi digital marketing',
      description:
        'Landing page, situs kampanye, dan integrasi yang dibangun sesuai spesifikasi Anda dan diserahkan atas nama brand Anda.',
      icon: 'megaphone',
    },
    {
      title: 'Agensi yang butuh mitra pengembangan',
      description:
        'Kapasitas pengembangan atas nama brand Anda untuk proyek yang tidak bisa ditangani tim internal.',
      icon: 'code',
    },
  ],
};
