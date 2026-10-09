/**
 * PLACEHOLDER article list for the homepage "Insight" section.
 *
 * ⚠️ Phase 4 replaces this file with a query against the `articles` table,
 * populated through /admin/artikel. The `Article` shape below is deliberately a
 * subset of that table's columns, so the section component does not change when
 * the data source does — only this module does.
 *
 * `href` currently points at the /artikel index for every item, because the
 * DB-backed detail route (`/artikel/[slug]`) does not exist yet. Once it does,
 * each href becomes `/artikel/${slug}` and the slugs below are already the ones
 * to use.
 */
import type { SiteImage } from '../assets/images/manifest';
import { images } from '../assets/images/manifest';

export interface Article {
  /** URL segment for the future detail page. */
  slug: string;
  /** TODO(phase-4): becomes `/artikel/${slug}`. */
  href: string;
  title: string;
  excerpt: string;
  category: string;
  /** ISO date (YYYY-MM-DD). Fixed strings, so the build output is deterministic. */
  publishedAt: string;
  readingMinutes: number;
  /** Only the featured article carries a cover; index rows are typographic. */
  image?: SiteImage;
}

export const placeholderArticles: Article[] = [
  {
    slug: 'website-instansi-lambat',
    href: '/artikel',
    title: 'Kenapa Website Instansi Sering Lambat — dan Cara Memperbaikinya',
    excerpt:
      'Penyebab paling umum bukan kurangnya server mahal, melainkan cara aset dimuat. Kami bahas empat penyebab yang paling sering kami temukan saat audit, lengkap dengan urutan perbaikannya.',
    category: 'E-Government',
    publishedAt: '2026-09-18',
    readingMinutes: 7,
    image: images.articleCover,
  },
  {
    slug: 'checklist-pengadaan-website-sekolah',
    href: '/artikel',
    title: 'Checklist Pengadaan Website Sekolah untuk Yayasan',
    excerpt:
      'Dokumen dan keputusan yang sebaiknya disiapkan sebelum membuka penawaran.',
    category: 'Pengadaan',
    publishedAt: '2026-09-02',
    readingMinutes: 6,
  },
  {
    slug: 'siakad-vs-spreadsheet',
    href: '/artikel',
    title: 'SIAKAD atau Spreadsheet: Kapan Sekolah Perlu Pindah Sistem',
    excerpt: 'Tanda-tanda bahwa pencatatan manual sudah mulai membebani staf akademik.',
    category: 'SIAKAD',
    publishedAt: '2026-08-21',
    readingMinutes: 5,
  },
  {
    slug: 'biaya-website-company-profile',
    href: '/artikel',
    title: 'Apa Saja yang Menentukan Biaya Website Company Profile',
    excerpt: 'Memahami komponen biaya agar penawaran bisa dibandingkan secara adil.',
    category: 'Web Development',
    publishedAt: '2026-08-05',
    readingMinutes: 8,
  },
];

/** Indonesian month abbreviations. */
const MONTHS_ID = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'Mei',
  'Jun',
  'Jul',
  'Agu',
  'Sep',
  'Okt',
  'Nov',
  'Des',
] as const;

/**
 * Format an ISO date (YYYY-MM-DD) as e.g. "18 Sep 2026".
 *
 * Deliberately hand-rolled rather than Intl.DateTimeFormat: this keeps the
 * build output identical regardless of the machine's ICU data or timezone,
 * which matters because these pages are prerendered and diffed.
 */
export function formatDateId(iso: string): string {
  const [year, month, day] = iso.split('-').map(Number);
  return `${day} ${MONTHS_ID[month - 1]} ${year}`;
}
