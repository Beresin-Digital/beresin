/**
 * Partnership section content for the homepage.
 *
 * The four audiences we explicitly invite to collaborate. `icon` is a lucide
 * icon name resolved in `Partnership.astro`, matching the pattern used by the
 * clients marquee.
 */
export interface PartnerType {
  title: string;
  description: string;
  /** lucide icon name. */
  icon: string;
}

export const partnerTypes: PartnerType[] = [
  {
    title: 'Companies that need digital solutions',
    description:
      'Ongoing product, website, or internal-system work you would rather hand to a dedicated team than hire for.',
    icon: 'building-2',
  },
  {
    title: 'Creative & branding agencies',
    description:
      'You own the strategy and the identity; we handle the build so your client gets one seamless delivery.',
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
];
