/**
 * FAQ for /services.
 *
 * Two kinds of answer live in this file, and they are not equal:
 *
 * 1. FACTUAL — how we work, who owns the code, where data lives, willingness to
 *    sign an NDA. These match the Terms & Conditions and Privacy Policy already
 *    published, and are safe to ship.
 *
 * 2. COMMITMENTS — anything that promises a duration, a number of revisions, or
 *    a payment schedule. Those are commercial promises the client can hold us
 *    to, so each one carries a TODO(user) marker until the owner confirms it.
 *    Do not remove a TODO without a real answer behind it.
 *
 * Answers are plain text, never HTML: the same string feeds the accordion and
 * the FAQPage JSON-LD, so nothing here can smuggle markup into structured data.
 */
export interface FaqItem {
  question: string;
  answer: string;
}

export const faqItems: FaqItem[] = [
  {
    question: 'Do we own the source code and design assets?',
    answer:
      'Yes. After final payment, all application source code, design assets, and technical documentation belong to you outright. We do not hold your system hostage and do not install hidden license locks.',
  },
  {
    question: 'Where are our data and systems stored?',
    answer:
      'On servers we lease in Indonesia, so your data does not leave Indonesian jurisdiction. We do not store visitors’ raw IP addresses — only an encrypted form (HMAC) for security purposes, in line with the data-minimisation principle of the PDP Law.',
  },
  {
    question: 'Will our team be trained to manage the system?',
    answer:
      'Yes. Every project closes with usage training and written documentation. Admin panels are designed for non-technical staff, so your team can update content and day-to-day data without needing to contact us.',
  },
  {
    question: 'Can you work with the systems and tools we already use?',
    answer:
      'Usually, yes. We regularly integrate with existing tools — payment gateways, messaging, CRM, accounting, and internal systems — through APIs and documented integrations. If something cannot be connected cleanly, we will tell you before the project starts, not after.',
  },
  {
    question: 'Are you willing to sign an NDA before technical discussions?',
    answer:
      'Yes. We understand that some teams need a confidentiality agreement signed before opening up data or internal procedures. Send us your draft, or we can provide a standard draft for you to review.',
  },
  {
    question: 'What payment structure do you use?',
    // TODO(user): confirm the actual milestone split (e.g. 30/40/30) and whether
    // a deposit is required before kickoff, then state it here. Until then the
    // answer deliberately points at the proposal rather than inventing
    // percentages — this string is rendered on the page AND published in
    // FAQPage JSON-LD.
    answer:
      'Payment is made in stages following the progress of the work, not all up front. The terms and percentages are put in writing in the proposal so you can verify them before the project begins.',
  },
  {
    question: 'How long does a project take?',
    // TODO(user): replace the hedge with real duration ranges per project type
    // once the owner confirms them.
    answer:
      'It depends on the scope: a company profile website is far quicker than a full custom web application. A binding timeline is stated in the proposal after the mapping session, not a generic figure we cannot stand behind.',
  },
  {
    question: 'Is there a warranty after the system launches?',
    // TODO(user): confirm the warranty window (e.g. 30/60/90 days) and what it
    // covers (bug fixes only, or also small content changes).
    answer:
      'Yes. We provide a warranty period for fixing bugs or defects that come from our work, excluding new scope changes. The duration and coverage are stated clearly in the proposal.',
  },
];
