/**
 * Content for /contact.
 *
 * Nothing here is a new commercial promise. The three response steps restate
 * the "1×24 working hours" figure already printed in the page lead, and every
 * partner line is lifted from `faq.ts` or derived from `site.ts` — the point is
 * to surface those facts where a prospective client or partner actually lands,
 * not to invent fresh commitments on a contact page.
 *
 * If a fact changes, change it at its source (`faq.ts`, `site.ts`) and update
 * the wording here to match. Do not let this file become a second source of
 * truth for anything the Terms & Conditions cover.
 */
import { site } from './site';
import type { Locale } from '../i18n';

export interface ResponseStep {
  title: string;
  description: string;
}

/** What happens after the form is submitted, in order. Rendered as an <ol>. */
export const responseSteps: Record<Locale, ResponseStep[]> = {
  en: [
    {
      title: 'We read and review it',
      description:
        'Your brief lands in a single inbox watched by the team — not a form nobody reads.',
    },
    {
      title: 'We reply within 1×24 working hours',
      description:
        'Our reply covers an initial response, any open questions, and an estimate of scope and technology options.',
    },
    {
      title: 'A short call, at no cost',
      description:
        'If your needs fit how we work, we move on to a mapping session. If not, we say so plainly.',
    },
  ],
  id: [
    {
      title: 'Kami membaca dan meninjaunya',
      description:
        'Brief Anda masuk ke satu inbox yang dipantau tim, bukan formulir yang tidak dibaca siapa pun.',
    },
    {
      title: 'Kami membalas dalam 1×24 jam kerja',
      description:
        'Balasan kami mencakup tanggapan awal, pertanyaan yang masih terbuka, dan perkiraan ruang lingkup serta opsi teknologi.',
    },
    {
      title: 'Panggilan singkat, tanpa biaya',
      description:
        'Jika kebutuhan Anda sesuai dengan cara kami bekerja, kita lanjut ke sesi pemetaan. Jika tidak, kami sampaikan dengan jelas.',
    },
  ],
};

export interface Assurance {
  label: string;
  value: string;
}

/**
 * Practical location facts, for the Location block on /contact. Nothing here is
 * a new promise: the hours come from `site.ts`, and the time zone and the
 * by-appointment rule are statements about how the office runs. The street
 * address stays unpublished on purpose (see the note on `site.address`) — do not
 * add coordinates or a street line, because the city-level address is a
 * deliberate privacy decision and a pin would narrow it back down.
 */
export const locationFacts: Record<Locale, Assurance[]> = {
  en: [
    {
      label: 'Working hours',
      value: site.openingHoursDisplay,
    },
    {
      label: 'Time zone',
      value: 'Western Indonesia Time (UTC+7).',
    },
    {
      label: 'Visits',
      value: 'By appointment. Message us and we will confirm a time and the exact address.',
    },
  ],
  id: [
    {
      label: 'Jam kerja',
      value: 'Senin-Jumat, 09:00–18:00 WIB',
    },
    {
      label: 'Zona waktu',
      value: 'Waktu Indonesia Barat (UTC+7).',
    },
    {
      label: 'Kunjungan',
      value: 'Dengan perjanjian. Kirimkan pesan kepada kami dan kami akan mengonfirmasi waktu serta alamat pastinya.',
    },
  ],
};

/**
 * Partner and engagement facts, for the closing block. Each line already exists
 * in `faq.ts` (invoice, NDA, data residency) or `site.ts` (legal name).
 */
export const partnerAssurances: Record<Locale, Assurance[]> = {
  en: [
    {
      label: 'Legal entity',
      value:
        'PT Beresin Urusan Digital, a registered company able to sign contracts and issue formal invoices.',
    },
    {
      label: 'Documents',
      value:
        'We provide the administrative documents and formal invoicing your team needs to get started.',
    },
    {
      label: 'Confidentiality',
      value:
        'Willing to sign an NDA before technical discussions — send your draft, or we provide a standard one.',
    },
    {
      label: 'Data location',
      value:
        'Systems and data are stored on servers in Indonesia, so they do not leave Indonesian jurisdiction.',
    },
  ],
  id: [
    {
      label: 'Badan hukum',
      value:
        'PT Beresin Urusan Digital, perusahaan terdaftar yang bisa menandatangani kontrak dan menerbitkan faktur resmi.',
    },
    {
      label: 'Dokumen',
      value:
        'Kami menyediakan dokumen administratif dan faktur resmi yang dibutuhkan tim Anda untuk memulai.',
    },
    {
      label: 'Kerahasiaan',
      value:
        'Bersedia menandatangani NDA sebelum diskusi teknis, kirimkan draf Anda, atau kami sediakan draf standar.',
    },
    {
      label: 'Lokasi data',
      value:
        'Sistem dan data disimpan di server di Indonesia, sehingga tidak keluar dari yurisdiksi Indonesia.',
    },
  ],
};
