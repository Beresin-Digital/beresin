/**
 * JSON-LD builders. Emitted as a single `@graph` so the entities can reference
 * each other by @id instead of being repeated.
 */
import { site, socialLinks } from '../data/site';
import { dicts, type Locale } from '../i18n';

type Json = Record<string, unknown>;

const ORG_ID = `${site.url}/#organization`;
const SITE_ID = `${site.url}/#website`;

/** Drops keys whose value is empty, so we never emit "" into structured data. */
function compact<T extends Json>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== '' && v !== null && v !== undefined)
  ) as T;
}

function postalAddress(lang: Locale = 'en'): Json {
  const { street, city, postalCode, country } = site.address;
  return compact({
    '@type': 'PostalAddress',
    streetAddress: street,
    addressLocality: city,
    // Region display name is locale-specific: Jawa Barat / West Java.
    addressRegion: dicts[lang].site.region,
    postalCode,
    addressCountry: country,
  });
}

function geo(): Json | undefined {
  const { latitude, longitude } = site.geo;
  if (!latitude || !longitude) return undefined;
  return { '@type': 'GeoCoordinates', latitude, longitude };
}

export function organization(lang: Locale = 'en'): Json {
  return compact({
    '@type': ['Organization', 'ProfessionalService'],
    '@id': ORG_ID,
    name: site.legalName,
    alternateName: site.displayName,
    url: site.url,
    logo: `${site.url}/android-chrome-512x512.png`,
    image: `${site.url}${site.defaultOgImage}`,
    email: site.emailGeneral,
    telephone: site.whatsappDisplay,
    address: postalAddress(lang),
    geo: geo(),
    areaServed: { '@type': 'Country', name: dicts[lang].site.country },
    openingHours: site.openingHours,
    sameAs: socialLinks(),
    vatID: site.npwp || undefined,
  });
}

export function website(lang: 'en' | 'id' = 'en'): Json {
  return {
    '@type': 'WebSite',
    '@id': SITE_ID,
    url: site.url,
    name: site.displayName,
    inLanguage: lang,
    publisher: { '@id': ORG_ID },
  };
}

export function webPage(opts: { url: string; name: string; description: string; lang?: 'en' | 'id' }): Json {
  return {
    '@type': 'WebPage',
    '@id': `${opts.url}#webpage`,
    url: opts.url,
    name: opts.name,
    description: opts.description,
    isPartOf: { '@id': SITE_ID },
    inLanguage: opts.lang ?? 'en',
  };
}

/**
 * ContactPage node for /contact. `ContactPage` is a `WebPage` subtype, so this
 * enriches the existing page node rather than duplicating it: search engines
 * use it to know which URL is the canonical place to reach the business.
 * The `about` reference points back at the Organization node, which already
 * carries the address, email, phone and opening hours.
 */
export function contactPage(opts: { url: string; lang?: Locale }): Json {
  return {
    '@type': 'ContactPage',
    '@id': `${opts.url}#contact`,
    url: opts.url,
    isPartOf: { '@id': SITE_ID },
    about: { '@id': ORG_ID },
    inLanguage: opts.lang ?? 'en',
  };
}

export function breadcrumbs(items: { name: string; url: string }[]): Json {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function article(opts: {
  url: string;
  headline: string;
  description: string;
  imageUrl?: string;
  datePublished: string;
  dateModified: string;
  authorName: string;
  category?: string;
  lang?: Locale;
}): Json {
  return compact({
    '@type': 'BlogPosting',
    '@id': `${opts.url}#article`,
    mainEntityOfPage: { '@id': `${opts.url}#webpage` },
    headline: opts.headline,
    description: opts.description,
    image: opts.imageUrl,
    datePublished: opts.datePublished,
    dateModified: opts.dateModified,
    articleSection: opts.category,
    inLanguage: opts.lang ?? 'en',
    author: { '@type': 'Person', name: opts.authorName },
    publisher: { '@id': ORG_ID },
  });
}

/**
 * A simple ordered `ItemList` of pages — used for the articles index so search
 * engines can see the collection as a list rather than as loose links.
 */
export function itemList(opts: {
  url: string;
  name: string;
  items: { url: string; name: string }[];
}): Json {
  return {
    '@type': 'ItemList',
    '@id': `${opts.url}#list`,
    name: opts.name,
    itemListElement: opts.items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: item.url,
      name: item.name,
    })),
  };
}

/**
 * FAQPage node. Emitting this lets the Q&A be eligible for a rich result in
 * search, and it must mirror what is actually visible on the page — Google
 * penalises FAQ markup whose answers are not shown to the user.
 */
export function faqPage(items: { question: string; answer: string }[]): Json {
  return {
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };
}

/**
 * Service catalogue: one `Service` node per pillar plus an `ItemList` that
 * orders them. The list references the nodes by `@id` instead of repeating
 * them, which is the same pattern the graph already uses for the organization.
 */
export function serviceCatalog(opts: {
  url: string;
  services: { id: string; title: string; description: string }[];
}): Json[] {
  const nodes: Json[] = opts.services.map((service) =>
    compact({
      '@type': 'Service',
      '@id': `${opts.url}#service-${service.id}`,
      name: service.title,
      description: service.description,
      serviceType: service.title,
      url: `${opts.url}#${service.id}`,
      provider: { '@id': ORG_ID },
      areaServed: { '@type': 'Country', name: 'Indonesia' },
    })
  );

  const list: Json = {
    '@type': 'ItemList',
    '@id': `${opts.url}#services`,
    name: 'Beresin Digital Services',
    itemListElement: nodes.map((node, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: { '@id': node['@id'] },
    })),
  };

  return [list, ...nodes];
}

/** Serialises a set of nodes into a single <script type="application/ld+json"> body. */
export function graph(...nodes: (Json | undefined)[]): string {
  return JSON.stringify(
    { '@context': 'https://schema.org', '@graph': nodes.filter(Boolean) },
    null,
    0
  ).replace(/</g, '\\u003c');
}
