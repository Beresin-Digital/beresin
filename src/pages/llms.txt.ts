import type { APIRoute } from 'astro';
import { site } from '../data/site';
import { directory, listingPath, provinces, regencies, schools, sourceLabel } from '../lib/directory/data';

export const prerender = true;

export const GET: APIRoute = () => new Response([
  `# ${site.displayName}`,
  '',
  `> ${site.displayName} (${site.legalName}) menyediakan pengembangan website dan aplikasi mobile, solusi IoT, integrasi sistem, serta desain grafis. Situs ini juga memuat direktori sekolah independen.`,
  '',
  `Direktori saat ini memuat ${schools.length} sekolah dan lembaga pendidikan di ${regencies.length} kabupaten/kota dari ${provinces.map(province => province.name).join(' dan ')}. Ini cakupan dataset, bukan daftar seluruh sekolah di Indonesia.`,
  'Data berasal dari CSV Sulawesi Selatan dan DI Yogyakarta yang diberikan pemilik produk. Tanggal pengambilan (scrape) dan sumber dikonfirmasi oleh pemilik dataset. Record belum seluruhnya diverifikasi ulang terhadap sumber. Beresin Digital tidak mewakili pemerintah atau sekolah; pencantuman sekolah tidak berarti sekolah tersebut klien atau mendukung Beresin Digital.',
  `${directory.datasets.map(dataset => `${dataset.province}: ${sourceLabel(dataset)}${dataset.sourceUrl ? ` (${dataset.sourceUrl})` : ''}`).join('; ')}. Data per menunjukkan tanggal pengambilan dataset, bukan tanggal perubahan setiap record di sumber atau tanggal build.`,
  'Kontak yang tersedia perlu dikonfirmasi kepada sekolah. Nomor telepon sekolah tidak otomatis merupakan nomor WhatsApp. Pengelola dapat mengajukan koreksi melalui tautan pada profil; tim memeriksa bukti sebelum menerbitkan perubahan.',
  'Tautan berikut menuju halaman HTML publik atau sitemap XML. Identitas sekolah menggunakan NPSN; URL profil tersedia melalui daftar wilayah dan sitemap direktori.',
  '',
  '## Beresin Digital',
  '',
  `- [Beranda](${site.url}/): Pengenalan Beresin Digital.`,
  `- [Layanan](${site.url}/services): Layanan pengembangan dan desain.`,
  `- [Tentang perusahaan](${site.url}/about): Profil Beresin Digital.`,
  `- [Portfolio](${site.url}/portfolio): Proyek yang diterbitkan; proyek konsep diberi label pada situs.`,
  `- [Artikel](${site.url}/articles): Artikel yang telah diterbitkan.`,
  `- [Kontak](${site.url}/contact): Hubungi Beresin Digital untuk kebutuhan layanan.`,
  '',
  '## Direktori Sekolah',
  '',
  `- [Direktori Sekolah](${site.url}/sekolah): Jelajahi wilayah yang tersedia.`,
  `- [Sumber dan metodologi](${site.url}/sekolah/tentang-data): Asal data, cakupan, keterbatasan, dan koreksi.`,
  ...regencies.map(region => `- [${region.name}, ${region.province}](${site.url}${listingPath(region.provinceSlug, region.slug)}): Daftar sekolah dan tautan profil di wilayah ini.`),
  `- [Sitemap direktori](${site.url}/sekolah/sitemap.xml): URL profil sekolah dan halaman wilayah.`,
  '',
  '## Optional',
  '',
  `- [Kebijakan privasi](${site.url}/privacy-policy): Penggunaan data dan preferensi analytics.`,
  `- [Syarat dan ketentuan](${site.url}/terms-and-conditions): Ketentuan penggunaan situs.`,
  `- [Sitemap situs](${site.url}/sitemap.xml): Indeks sitemap situs utama dan direktori.`,
  '',
].join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
