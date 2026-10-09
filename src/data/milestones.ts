/**
 * "Tonggak & pencapaian" for /tentang.
 *
 * Two different things live here, and they are not equally ready:
 *
 * `achievements` — the company's real, owner-confirmed figures. Safe to publish.
 * These mirror `stats` in services.ts (the homepage hero), restated with a line
 * of context so the number means something on an About page.
 *
 * `milestones` — the dated history (founding year, major deliveries, headcount,
 * certifications). INTENTIONALLY EMPTY: none of it has been supplied, and an
 * invented founding year or client win is exactly the kind of unverifiable
 * claim UU 8/1999 treats as misleading advertising. `Milestones.astro` renders
 * the timeline only when this array is non-empty, so the page degrades cleanly
 * until real entries exist.
 */
export interface Achievement {
  value: string;
  suffix: string;
  label: string;
  /** One line explaining what the number counts. */
  note: string;
}

export interface Milestone {
  /** Year, or `YYYY-MM` if the month matters. Plain string, not a Date. */
  when: string;
  title: string;
  description: string;
}

export const achievements: Achievement[] = [
  {
    value: '10',
    suffix: '+',
    label: 'Happy Client',
    note: 'Korporasi, yayasan pendidikan, dan instansi pemerintah yang sudah bekerja sama.',
  },
  {
    value: '10',
    suffix: '+',
    label: 'Project Done',
    note: 'Dari company profile dan SIAKAD sekolah sampai sistem internal dan portal layanan publik.',
  },
  {
    value: '100',
    suffix: '%',
    label: 'SLA Guaranteed',
    note: 'Tingkat layanan dan waktu respons dituangkan tertulis di setiap kesepakatan proyek.',
  },
  {
    value: '2',
    suffix: ' tahun',
    label: 'Pengalaman',
    note: 'Mengerjakan proyek digital untuk lembaga, perusahaan, dan instansi.',
  },
];

/**
 * TODO(user): isi tonggak waktu yang benar-benar terjadi, lalu `Milestones.astro`
 * akan otomatis menampilkannya sebagai timeline. Yang dibutuhkan:
 *   - tahun berdiri / tahun mulai beroperasi
 *   - tonggak besar (proyek pertama, lini layanan baru, jumlah klien menembus N)
 *   - sertifikasi, keanggotaan asosiasi, atau kemitraan resmi bila ada
 * Format tiap entri: { when: '2024', title: '...', description: '...' }
 */
export const milestones: Milestone[] = [];
