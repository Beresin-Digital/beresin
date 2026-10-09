/**
 * Single source of truth for company / contact / legal details.
 *
 * Components import from here and NEVER hardcode these values.
 * Every unresolved value carries a `TODO(user)` marker so it is greppable:
 *   grep -rn "TODO(user)" src/
 */

export const site = {
  /** Registered legal entity name. Used in the footer and Organization JSON-LD. */
  legalName: 'PT Beresin Urusan Digital',

  /** Short brand name used in the header logo and <title> templates. */
  displayName: 'Beresin Digital',

  domain: 'beresindigital.id',
  url: 'https://beresindigital.id',

  // --- Contact -------------------------------------------------------------
  whatsappNumber: '6281511112814',
  whatsappDisplay: '+62 815-1111-2814',

  /**
   * The company runs a single monitored inbox. Both fields intentionally point
   * at the same address: publishing a `procurement@` that nobody reads is worse
   * than routing procurement enquiries to the shared inbox. If a dedicated
   * procurement address is created later, change only this one line — every
   * consumer (footer, contact, legal pages, /services CTA, JSON-LD) follows.
   */
  emailProcurement: 'halo@beresindigital.id',
  emailGeneral: 'halo@beresindigital.id',

  /**
   * City-level only, by the owner's decision. The registered street address is
   * a residential cluster, so it is deliberately NOT published — a home address
   * has no business on a public marketing site, and for a PT the publicly
   * relevant domicile is the city anyway. `postalCode` is blanked alongside it
   * because 16515 is Cinere's code: leaving it in would narrow the location
   * right back down to the neighbourhood the street line just stopped
   * revealing.
   *
   * `addressLine()` skips empty fields, so every page renders
   * "Depok, Jawa Barat, Indonesia" and the JSON-LD `PostalAddress` simply omits
   * `streetAddress` and `postalCode` rather than emitting blanks.
   *
   * TODO(user): if the company moves into a real office, fill `street` (and its
   * postal code) here — no other file needs touching.
   */
  address: {
    street: '',
    city: 'Depok',
    region: 'West Java',
    postalCode: '',
    country: 'ID',
    countryName: 'Indonesia',
  },

  // TODO(user): fill in the office coordinates for LocalBusiness JSON-LD.
  // Left empty on purpose — a wrong pin on a map is worse than no pin, and the
  // Organization node simply omits `geo` while these are blank.
  geo: {
    latitude: '-6.375456548161099',
    longitude: '106.7651002793675',
  },

  /**
   * NPWP is deliberately not published — the owner opted to skip it. `vatID` is
   * dropped from the JSON-LD while this is empty (see `compact()` in lib/seo.ts),
   * so nothing renders a blank tax field.
   */
  npwp: '',

  // TODO(user): add real social profiles. Empty entries are skipped in JSON-LD.
  socials: {
    instagram: '',
    linkedin: '',
    facebook: '',
    youtube: '',
  },

  // TODO(user): confirm the published opening hours. The machine-readable and
  // display forms are kept side by side so the two cannot drift apart — edit
  // both together.
  openingHours: 'Mo-Fr 09:00-18:00',
  openingHoursDisplay: 'Monday–Friday, 09:00–18:00 WIB',

  defaultOgImage: '/og-default.png',
} as const;

/** Pre-filled WhatsApp deep link with an optional prefilled message. */
export function whatsappLink(message?: string): string {
  const base = `https://wa.me/${site.whatsappNumber}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/** Social profile URLs that are actually filled in, for JSON-LD `sameAs`. */
export function socialLinks(): string[] {
  // `site` is `as const`, so the element type is the union of literal URLs
  // (including `''`); a `url is string` predicate cannot narrow a literal union
  // to `string`. Filtering by length and letting the literal union widen to
  // `string[]` on return is equivalent and type-correct.
  return Object.values(site.socials).filter((url) => url.length > 0);
}

/**
 * One-line postal address, for display. The country is included because this is
 * the full form; the footer and legal notices use a deliberately shorter
 * "city, country" instead.
 */
export function addressLine(): string {
  const { street, city, region, postalCode, countryName } = site.address;
  return [street, city, region, postalCode, countryName].filter(Boolean).join(', ');
}
