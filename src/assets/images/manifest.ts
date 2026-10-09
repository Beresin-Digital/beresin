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
import serviceCustomSystem from './service-custom-system.webp';
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
    alt: 'The Beresin Digital team collaborating on a digital project',
  },
  aboutPortrait: {
    src: aboutPortrait,
    alt: 'A Beresin Digital team member at the workspace',
  },
  serviceWebApp: {
    src: serviceWebApp,
    alt: 'Code on screen for website and application development',
  },
  serviceCustomSystem: {
    src: serviceCustomSystem,
    alt: 'A dashboard interface for a custom digital system',
  },
  serviceDesign: {
    src: serviceDesign,
    alt: 'Graphic design tools and brand identity sketches',
  },
  serviceIot: {
    src: serviceIot,
    alt: 'A smart thermostat on a wall for automatic room temperature control',
  },
  articleCover: {
    src: articleCover,
    alt: 'A desk with a laptop and a notebook',
  },
} satisfies Record<string, SiteImage>;

export const teamAvatars: SiteImage[] = [
  { src: avatar1, alt: '' },
  { src: avatar2, alt: '' },
  { src: avatar3, alt: '' },
];
