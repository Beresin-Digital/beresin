/**
 * English strings for shared chrome and sections.
 *
 * These are the current published strings, moved verbatim into the
 * dictionary so the Indonesian pages can diverge without touching them.
 * Page-specific copy lives in the page files, not here.
 */
import type { Dict } from "./types";

export const en: Dict = {
  site: {
    region: "West Java",
    country: "Indonesia",
  },
  nav: {
    home: "Home",
    services: "Services",
    portfolio: "Portfolio",
    about: "About",
    articles: "Articles",
    contact: "Contact",
    menuAria: "Navigation menu",
    homeSr: "— home",
    getInTouch: "Get in Touch",
    chatWhatsapp: "Chat on WhatsApp",
  },
  footer: {
    description:
      "Digital solutions & development partner for websites, mobile apps, custom web applications, IoT solutions, system integration, and graphic design.",
    navigation: "Navigation",
    contact: "Contact",
    rights: "All rights reserved.",
    cookiePreferences: "Cookie Preferences",
    privacy: "Privacy Policy",
    terms: "Terms & Conditions",
    menu: {
      home: "Home",
      services: "Services",
      portfolio: "Portfolio",
      clients: "Clients",
      articles: "Articles",
      schoolDirectory: "School Directory",
      about: "About",
    },
  },
  contactForm: {
    honeypot: "Do not fill",
    nameLabel: "Full Name",
    namePlaceholder: "Your name",
    phoneLabel: "WhatsApp / Phone Number",
    phonePlaceholder: "0812xxxxxxx",
    emailLabel: "Email",
    emailOptional: "(optional)",
    emailPlaceholder: "name@company.com",
    messageLabel: "Project Needs",
    messagePlaceholder: "Website / Custom Web App / Mobile App / Integration / IoT...",
    submit: "Send Message →",
    privacyBefore: "By submitting this form you agree to your data being processed in line with our ",
    privacyLink: "Privacy Policy",
    privacyAfter: ".",
  },
  consultModal: {
    badge: "Propose Project",
    title: "Project Consultation",
    lead: "The Beresin Digital team will get back to you with an initial estimate.",
    closeLabel: "Close dialog",
  },
  formStatus: {
    success:
      "Thanks! We have received your message. The Beresin Digital team will get back to you.",
    rateLimited:
      "Too many attempts from this network. Please try again in a few minutes, or contact us directly on WhatsApp.",
    system:
      "Sorry, we could not save your message due to a technical issue. Please try again shortly, or contact us directly on WhatsApp.",
    checkBefore: "Please check the ",
    checkAfter: " field before sending.",
    fields: {
      nama: "full name",
      telepon: "WhatsApp / phone number",
      email: "email address",
      pesan: "project needs",
      required: "required",
    },
  },
  hero: {
    badge: "DIGITAL SOLUTIONS",
    headlineRest: "BUILT FOR YOUR BUSINESS.",
    leadStart: "We design and develop ",
    leadEmphasis: "websites, applications, and custom digital solutions",
    leadEnd: " that help businesses work smarter and grow.",
    ctaDiscuss: "Discuss Your Project",
    ctaExplore: "Explore Our Work",
    strip: "WEBSITES · APPS · CUSTOM SYSTEMS",
  },
  servicesSection: {
    eyebrow: "What we do",
    heading: "Websites, apps, integrations, and design built around your business.",
    allServices: "All services →",
  },
  clientsSection: {
    eyebrow: "Trusted Partners",
    heading: "Trusted by businesses & teams",
    lead: "A development and design partner for companies, education foundations, and agencies.",
  },
  aboutSection: {
    eyebrow: "Who we are",
    heading: "Digital solutions, built around your business.",
    lead: "Beresin Digital helps businesses build and grow their digital solutions — from professional websites to applications and custom systems. We pair clear design with dependable engineering, and deliver on a structured timeline.",
    badges: [
      "Structured delivery & clear scope",
      "Trusted by businesses, schools & agencies",
    ],
    coverTitle: "What we cover",
    coverLink: "See service details →",
  },
  portfolioSection: {
    eyebrow: "Selected Work",
    heading: "Work we can show.",
    lead: "A sample of the solutions we build. Concept work is labelled as such — we only present delivered projects as delivered.",
    viewAll: "View all work",
  },
  whySection: {
    eyebrow: "Why Choose Us",
    heading: "Why work with us.",
    lead: "Four things that hold whether you are commissioning a website or a system the business runs on.",
  },
  partnershipSection: {
    eyebrow: "Partnership",
    heading: "Let’s build together.",
    lead: "Beyond direct clients, we work as a development partner for teams and agencies who need the build handled — under your brand or ours.",
    cta: "Discuss a Partnership",
  },
  articlesSection: {
    eyebrow: "Insight",
    heading: "Notes & guides from our team.",
    allArticles: "All articles →",
    readMore: "Read more",
    moreArticles: "More articles",
    minRead: "min read",
  },
  processSection: {
    eyebrow: "Our Process",
    heading: "Five steps, no surprises.",
    lead: "The same process runs a single-page site or a full custom system. You always know what is being worked on and what you will receive at each stage.",
  },
  principlesSection: {
    eyebrow: "Principles & How We Work",
    heading: "How we work.",
    lead: "Six things that hold on every project, whatever its size. These are not wall-poster values — you can hold us to all of them.",
  },
  faqSection: {
    heading: "Frequently asked questions.",
    lead: "The things clients and partners most often ask before starting a project.",
  },
  serviceDetail: {
    serviceLabel: "Service",
    whatYouGet: "What you get",
    bestFor: "Best for",
    discussService: "Discuss this service",
    discussVerb: "Discuss",
  },
  projectCard: {
    viewDetails: "View details",
    viewDetailsAria: "View details: ",
  },
  portfolioModal: {
    closeLabel: "Close project details",
    detailsLabel: "Project details",
    whatWeDid: "What we did",
    startProject: "Start a project like this",
  },
  notFound: {
    badge: "Error 404",
    heading: "Page not found",
    lead: "The link you followed may have been moved or may never have existed. Head back to the homepage, or contact us directly if you are looking for something specific.",
    backHome: "Back to Home",
    contactUs: "Contact Us",
    quickLinksLabel: "Quick links",
  },
  legal: {
    updatedLabel: "Last updated:",
  },
  images: {
    heroTeam: "The Beresin Digital team collaborating on a digital project",
  },
  switcher: {
    ariaLabel: "Switch language",
  },
  waMessages: {
    discussProject: "Hi Beresin Digital, I would like to discuss a digital project.",
    arrangeVisit: "Hi Beresin Digital, I would like to arrange a visit to your office.",
  },
  modalSubjects: {
    discussProject: "Discuss Your Project",
    serviceConsultation: "Service consultation",
    askArticles: "Ask About Articles",
    partnership: "Discuss a Partnership",
  },
};
