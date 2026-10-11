# Panduan kerja Beresin Digital

## Konteks dan struktur

Website Beresin Digital dengan CMS admin untuk artikel, klien, portfolio, dan lead.
Stack: Astro, TypeScript, Tailwind CSS, PostgreSQL, dan Drizzle ORM. Gunakan Node.js 24 dan pnpm 10 seperti Dockerfile; pertahankan `pnpm-lock.yaml`.

- `src/pages/`: halaman, endpoint, dan route admin.
- `src/components/` dan `src/layouts/`: komponen dan layout yang dipakai ulang.
- `src/data/`: konten layanan, kontak, dan profil situs.
- `src/lib/`: logika bisnis, autentikasi, validasi, upload, dan helper.
- `src/actions/index.ts`: mutasi admin melalui Astro Actions.
- `src/db/schema/`: schema database; `drizzle/`: migration dan metadata.
- `src/styles/`: token visual dan font; `src/assets/images/`: aset gambar.
- `scripts/`: seed dan verifikasi; `deploy/`: konfigurasi production.
- `data/directory/`: sumber, metadata, dan koreksi direktori sekolah; baca [docs/directory.md](docs/directory.md) sebelum mengubah modul `/sekolah`.

## Cara mengubah kode

- Baca kode terkait dan semua pemanggil sebelum mengubah fungsi bersama. Selesaikan perubahan pada caller, schema, export, dan verifikasi yang terdampak.
- Pilih perubahan terkecil yang menyelesaikan kebutuhan. Pakai komponen, helper, dan dependency yang sudah tersedia; jangan menambah abstraksi atau fitur untuk kebutuhan hipotetis.
- Untuk UI, baca [design.md](design.md) dan ikuti token serta komponen yang ada. Pertahankan akses keyboard, label form, kontras, dan layout mobile.
- Gunakan bahasa Indonesia untuk teks pengguna, mengikuti gaya halaman terkait. Jangan membuat klaim, angka, atau testimonial tanpa sumber.
- Pertahankan perubahan lokal pengguna. Jangan memasukkan rahasia, kredensial, atau data pribadi ke kode, log, maupun dokumentasi.

## Batas teknis yang harus dijaga

- Astro memakai `output: 'static'`; route yang membutuhkan server menetapkan `export const prerender = false` di file route masing-masing. Homepage, konten CMS, dan sitemap juga memiliki route dinamis; periksa file terkait sebelum mengubah rendering.
- Middleware harus melewati route non-admin sebelum mengakses session/database. Jangan membuat halaman statis membutuhkan koneksi database saat build.
- Pertahankan guard `/admin`, pemeriksaan autentikasi di Actions, validasi input, CSRF/origin check, rate limit, sanitasi Markdown, serta validasi upload dan path file.
- Gunakan `src/lib/db-env.mjs` untuk konfigurasi database yang dibagi dengan script Node. Rahasia session dibaca saat runtime, bukan dimasukkan ke manifest build.
- Untuk perubahan schema, gunakan `pnpm db:generate`, periksa SQL yang dihasilkan, lalu uji dengan `pnpm db:migrate` pada database lokal. Jangan mengubah migration yang sudah diterapkan atau mereset data untuk mengatasi kegagalan migration.

## Command dan verifikasi

- Instalasi: `pnpm install --frozen-lockfile`.
- Database lokal: siapkan konfigurasi `.env`, lalu `pnpm db:up` dan `pnpm db:migrate`. `pnpm db:down` menghentikan database tanpa menghapus volume.
- Development: `pnpm dev`.
- Build dan pemeriksaan HTML: `pnpm build`, lalu `node scripts/verify-structure.mjs`.
- Server hasil build: `pnpm start` di terminal terpisah, dengan database lokal aktif dan konfigurasi runtime tersedia.
- Smoke test HTTP: `node scripts/verify-deploy.mjs`.
- Perubahan login, session, atau lead: `pnpm verify:admin`.
- Perubahan CMS atau upload: `node scripts/verify-content.mjs`.
- Perubahan direktori sekolah: `pnpm verify:directory` setelah build; pemeriksaan data dan hasil direktori juga berjalan otomatis lewat `pnpm build`.

Jalankan pemeriksaan yang relevan dengan perubahan. Perubahan dokumentasi saja tidak perlu build aplikasi. Untuk logika baru yang tidak tercakup, tambahkan pemeriksaan kecil pada pola script yang ada.

Script admin/CMS memakai `ADMIN_EMAIL` dan `ADMIN_PASSWORD` dari environment; tanpa keduanya, pemeriksaan terautentikasi dilaporkan sebagai `SKIP`. Jangan menyebut bagian yang dilewati sebagai lulus. Jalankan script yang mengubah data pada database lokal khusus pengujian; baca script sebelum menjalankannya karena sebagian menghapus rate limit atau membuat data uji.

## Deployment

Baca [deploy/README.md](deploy/README.md) sebelum mengubah pipeline atau konfigurasi production. Push ke `master` memicu deploy; PR menjalankan build dan smoke test. Ikuti otorisasi pengguna untuk push/deploy, dan jangan menganggap permintaan perubahan lokal sebagai izin deploy.

Rollback aplikasi tidak me-rollback migration database. Periksa dampak SQL destruktif dan kebutuhan backup sebelum deploy. Jangan menjalankan `docker compose down -v` pada production atau menghapus volume database/upload untuk memperbaiki masalah.

Laporkan perubahan, pemeriksaan yang dijalankan, bagian yang dilewati, dan risiko yang masih ada secara singkat.
