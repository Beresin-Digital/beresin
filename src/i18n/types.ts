/**
 * Shared dictionary shape for the two locales.
 *
 * Both `id.ts` and `en.ts` are typed as `Dict`, so a missing key in either
 * language is a type error rather than a silent `undefined` at render.
 * Page-specific copy (headings, leads, body paragraphs that belong to one
 * page) is NOT here: it lives in the page file itself, translated in place.
 * This file holds only strings shared by chrome or sections.
 */
export interface Dict {
  site: {
    region: string;
    country: string;
  };
  nav: {
    home: string;
    services: string;
    portfolio: string;
    about: string;
    articles: string;
    contact: string;
    menuAria: string;
    homeSr: string;
    getInTouch: string;
    chatWhatsapp: string;
  };
  footer: {
    description: string;
    navigation: string;
    contact: string;
    rights: string;
    cookiePreferences: string;
    privacy: string;
    terms: string;
    menu: {
      home: string;
      services: string;
      portfolio: string;
      clients: string;
      articles: string;
      schoolDirectory: string;
      about: string;
    };
  };
  contactForm: {
    honeypot: string;
    nameLabel: string;
    namePlaceholder: string;
    phoneLabel: string;
    phonePlaceholder: string;
    emailLabel: string;
    emailOptional: string;
    emailPlaceholder: string;
    messageLabel: string;
    messagePlaceholder: string;
    submit: string;
    privacyBefore: string;
    privacyLink: string;
    privacyAfter: string;
  };
  consultModal: {
    badge: string;
    title: string;
    lead: string;
    closeLabel: string;
  };
  formStatus: {
    success: string;
    rateLimited: string;
    system: string;
    checkBefore: string;
    checkAfter: string;
    fields: {
      nama: string;
      telepon: string;
      email: string;
      pesan: string;
      required: string;
    };
  };
  hero: {
    badge: string;
    headlineRest: string;
    leadStart: string;
    leadEmphasis: string;
    leadEnd: string;
    ctaDiscuss: string;
    ctaExplore: string;
    strip: string;
  };
  servicesSection: {
    eyebrow: string;
    heading: string;
    allServices: string;
  };
  clientsSection: {
    eyebrow: string;
    heading: string;
    lead: string;
  };
  aboutSection: {
    eyebrow: string;
    heading: string;
    lead: string;
    badges: [string, string];
    coverTitle: string;
    coverLink: string;
  };
  portfolioSection: {
    eyebrow: string;
    heading: string;
    lead: string;
    viewAll: string;
  };
  whySection: {
    eyebrow: string;
    heading: string;
    lead: string;
  };
  partnershipSection: {
    eyebrow: string;
    heading: string;
    lead: string;
    cta: string;
  };
  articlesSection: {
    eyebrow: string;
    heading: string;
    allArticles: string;
    readMore: string;
    moreArticles: string;
    minRead: string;
  };
  processSection: {
    eyebrow: string;
    heading: string;
    lead: string;
  };
  principlesSection: {
    eyebrow: string;
    heading: string;
    lead: string;
  };
  faqSection: {
    heading: string;
    lead: string;
  };
  serviceDetail: {
    serviceLabel: string;
    whatYouGet: string;
    bestFor: string;
    discussService: string;
    discussVerb: string;
  };
  projectCard: {
    viewDetails: string;
    viewDetailsAria: string;
  };
  portfolioModal: {
    closeLabel: string;
    detailsLabel: string;
    whatWeDid: string;
    startProject: string;
  };
  notFound: {
    badge: string;
    heading: string;
    lead: string;
    backHome: string;
    contactUs: string;
    quickLinksLabel: string;
  };
  legal: {
    updatedLabel: string;
  };
  images: {
    heroTeam: string;
  };
  switcher: {
    ariaLabel: string;
  };
  waMessages: {
    discussProject: string;
    arrangeVisit: string;
  };
  modalSubjects: {
    discussProject: string;
    serviceConsultation: string;
    askArticles: string;
    partnership: string;
  };
}
