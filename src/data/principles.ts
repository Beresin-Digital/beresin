/**
 * "Principles & how we work" for /about.
 *
 * Every line here restates something the site already commits to elsewhere —
 * `services.ts` (scope starts from process mapping, not a template), `process.ts`
 * (written scope and cost, accessible staging, training and handover), and
 * `faq.ts` (client owns the code, data stays in Indonesia, no raw IPs stored).
 * That is deliberate: a principles block that invents new promises is just
 * unenforceable marketing. If a principle is added here, it must already be
 * true somewhere else in the codebase.
 */
export interface Principle {
  title: string;
  /** One or two sentences. Concrete, no superlatives. */
  description: string;
}

export const principles: Principle[] = [
  {
    title: 'We start from your process, not a template',
    description:
      'Every project opens by mapping how you actually work — who uses the system, how the flow runs, and which part hurts the most. What we build follows your business, not the other way around.',
  },
  {
    title: 'Scope and cost in writing up front',
    description:
      'The scope of work, the sequence of stages, and the cost breakdown are put in writing before the project starts, so there are no surprises midway or at handover.',
  },
  {
    title: 'Progress you can see at any time',
    description:
      'Work happens in stages on a staging environment you can access and judge for yourself, rather than being revealed once at the end.',
  },
  {
    title: 'You can run the system yourself',
    description:
      'Admin panels are designed for non-technical staff, and every project closes with training and written documentation — so you are not dependent on us for day-to-day tasks.',
  },
  {
    title: 'The code and assets are yours',
    description:
      'After final payment, all application source code and design assets belong to you outright. We do not hold your system hostage or install hidden license locks.',
  },
  {
    title: 'Your data stays in Indonesia',
    description:
      'Systems and data are stored on servers in the country. We also do not store visitors’ raw IP addresses — only an encrypted form, for security purposes, in line with the data-minimisation principle of the PDP Law.',
  },
];
