/**
 * Content for /kontak.
 *
 * Nothing here is a new commercial promise. The three response steps restate
 * the "1×24 jam kerja" figure already printed in the page lead, and every
 * procurement line is lifted from `faq.ts` or derived from `site.ts` — the
 * point is to surface those facts where an instansi officer actually lands,
 * not to invent fresh commitments on a contact page.
 *
 * If a fact changes, change it at its source (`faq.ts`, `site.ts`) and update
 * the wording here to match. Do not let this file become a second source of
 * truth for anything the Terms & Conditions cover.
 */

export interface ResponseStep {
  title: string;
  description: string;
}

/** What happens after the form is submitted, in order. Rendered as an <ol>. */
export const responseSteps: ResponseStep[] = [
  {
    title: 'Kami baca dan pelajari',
    description:
      'Brief Anda masuk ke satu inbox yang dipantau tim — bukan formulir yang tidak dibaca siapa pun.',
  },
  {
    title: 'Kami balas dalam 1×24 jam kerja',
    description:
      'Balasan berisi tanggapan awal, pertanyaan yang masih menggantung, serta estimasi ruang lingkup dan opsi teknologi.',
  },
  {
    title: 'Diskusi singkat, tanpa biaya',
    description:
      'Kalau kebutuhan Anda cocok dengan cara kami bekerja, kami lanjutkan ke sesi pemetaan. Kalau tidak, kami bilang terus terang.',
  },
];

export interface Assurance {
  label: string;
  value: string;
}

/**
 * Procurement facts, for the closing block. Each line already exists in
 * `faq.ts` (tender, invoice, NDA, data residency) or `site.ts` (legal name).
 * NPWP is mentioned as a capability, never as a number — the owner chose not
 * to publish the identifier itself.
 */
export const procurementAssurances: Assurance[] = [
  {
    label: 'Badan hukum',
    value:
      'PT Beresin Urusan Digital, badan hukum resmi yang dapat mengikuti pengadaan langsung maupun tender.',
  },
  {
    label: 'Dokumen',
    value:
      'Kami melengkapi dokumen administrasi dan menerbitkan invoice resmi sesuai ketentuan instansi Anda.',
  },
  {
    label: 'Kerahasiaan',
    value:
      'Bersedia menandatangani NDA sebelum diskusi teknis — kirimkan draf Anda, atau kami sediakan draf standar.',
  },
  {
    label: 'Lokasi data',
    value:
      'Sistem dan data disimpan di server dalam negeri, sehingga tidak keluar dari yurisdiksi Indonesia.',
  },
];
