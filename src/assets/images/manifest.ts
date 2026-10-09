/**
 * Swappable image manifest.
 *
 * Components import from here, never from a raw path. To replace a placeholder
 * photo with a real one: drop the file in this folder and update the import
 * below. Nothing else changes.
 *
 * TODO(user): replace the Unsplash placeholders with real team/office photos.
 * See CREDITS.md for the current placeholder attribution.
 */
import type { ImageMetadata } from 'astro';

import heroTeam from './hero-team.webp';
import aboutPortrait from './about-portrait.webp';
import serviceWebApp from './service-web-app.webp';
import serviceSiakad from './service-siakad.webp';
import serviceDesign from './service-design.webp';
import serviceIot from './service-iot.webp';
import articleCover from './article-cover.webp';
import avatar1 from './avatar-1.webp';
import avatar2 from './avatar-2.webp';
import avatar3 from './avatar-3.webp';

export interface SiteImage {
  src: ImageMetadata;
  alt: string;
}

export const images = {
  heroTeam: {
    src: heroTeam,
    alt: 'Tim Beresin Digital sedang berkolaborasi mengerjakan proyek digital',
  },
  aboutPortrait: {
    src: aboutPortrait,
    alt: 'Anggota tim Beresin Digital di ruang kerja',
  },
  serviceWebApp: {
    src: serviceWebApp,
    alt: 'Kode program di layar untuk pengembangan website dan aplikasi',
  },
  serviceSiakad: {
    src: serviceSiakad,
    alt: 'Tampilan dashboard sistem informasi akademik',
  },
  serviceDesign: {
    src: serviceDesign,
    alt: 'Peralatan desain grafis dan sketsa identitas brand',
  },
  serviceIot: {
    src: serviceIot,
    alt: 'Termostat pintar di dinding untuk pengaturan suhu ruangan otomatis',
  },
  articleCover: {
    src: articleCover,
    alt: 'Meja kerja dengan laptop dan buku catatan',
  },
} satisfies Record<string, SiteImage>;

export const teamAvatars: SiteImage[] = [
  { src: avatar1, alt: '' },
  { src: avatar2, alt: '' },
  { src: avatar3, alt: '' },
];
