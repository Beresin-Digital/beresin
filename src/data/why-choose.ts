/**
 * "Why choose us" differentiators, shown on the homepage.
 *
 * Four statements, each of which is backed by something the site already
 * commits to elsewhere (`process.ts`, `principles.ts`, `services.ts`). No
 * metrics, no guarantees — the brief rules out quantitative claims that cannot
 * be substantiated.
 */
export interface Reason {
  title: string;
  description: string;
}

export const reasons: Reason[] = [
  {
    title: 'Business-Oriented Solutions',
    description:
      'We start from what the business needs the system to achieve, then choose the technology — not the other way around. Every decision is tied to a goal you can name.',
  },
  {
    title: 'Flexible Development Capabilities',
    description:
      'From a single website to a custom application, an integration, or a mobile app, we take on the adjacent work rather than handing you off when a project grows past one discipline.',
  },
  {
    title: 'Structured Project Delivery',
    description:
      'Written scope, staged progress on an environment you can access, and a clear handover. You always know what is being worked on and what you will receive next.',
  },
  {
    title: 'Long-Term Technology Partnership',
    description:
      'We build systems meant to be maintained and extended. Many engagements continue past launch, as a development partner for the roadmap rather than a one-off vendor.',
  },
];
