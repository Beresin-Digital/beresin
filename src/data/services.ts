/**
 * Static marketing copy for the service catalogue.
 * This is editorial content, not CMS content — edit here and redeploy.
 *
 * Four services, presented at the same level. `services` is the single display
 * order used by the homepage card grid and by /services.
 *
 * `deliverables` and `audience` are only rendered on /services (the detailed
 * page). The homepage section keeps the compact `description`-only presentation.
 */
import type { SiteImage } from '../assets/images/manifest';
import { images } from '../assets/images/manifest';

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

export const services: Service[] = [
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
];

/**
 * What the studio covers, shown in the About column.
 *
 * This replaced three fabricated percentage bars ("Innovative Design 89%"),
 * which had no basis and could not be substantiated.
 */
export const coverage = [
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
] as const;

/** Scrolling banner items between the hero and the services section. */
export const marqueeItems = [
  'Website Development',
  'Mobile Apps',
  'IoT Solutions',
  'System Integration',
  'UI/UX Design',
  'Branding',
] as const;
