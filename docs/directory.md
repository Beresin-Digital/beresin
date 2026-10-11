# Direktori Sekolah: Sulawesi Selatan dan DI Yogyakarta

Modul brand awareness Beresin Digital berada di `/sekolah`. Dataset aktif berasal dari `data-sekolah-lengkap.zip`: 11.502 record Sulawesi Selatan dan 6.818 record DI Yogyakarta, total 18.320 NPSN unik pada 29 kabupaten/kota dan 33 bentuk pendidikan. Kedua CSV diekstrak tanpa mengubah isinya ke `data/directory/`. Arsip ZIP disimpan lokal di `.data/source-archives/` dan tidak masuk Git maupun konteks build Docker. JSON pilot Bantaeng tetap disimpan sebagai fixture pemeriksaan URL lama.

Seluruh 337 NPSN pilot ada di CSV Sulawesi Selatan dengan wilayah yang sama. Manifest mengaktifkan dua CSV dan menonaktifkan JSON pilot, sehingga setiap sekolah memakai satu sumber aktif dengan kolom lengkap, tanpa memilih konflik duplikat secara otomatis atau mengubah URL Bantaeng. Koreksi manual tetap diterapkan setelah normalisasi.

## Keputusan implementasi

- Nama produk: Direktori Sekolah oleh Beresin Digital. Nama kerja SekolahDekat tidak digunakan.
- Halaman direktori, profil, pagination, indeks pencarian, dan sitemap direktori statis. CMS dan database situs utama tetap bekerja seperti sebelumnya.
- URL kanonis mengikuti situs utama tanpa slash penutup. Identifier pada URL lowercase; NPSN yang ditampilkan tetap uppercase dan disimpan sebagai string.
- Judul metadata profil memuat nama, NPSN, dan kabupaten/kota agar sekolah bernama sama tetap dapat dibedakan. Pemeriksaan build menolak judul direktori yang kosong atau kembar.
- Pencarian memakai JSON statis berisi identitas dan wilayah, dimuat ketika pengunjung mencari/filter. Tidak ada dependency pencarian baru. Indeks wilayah mencakup seluruh record wilayah, termasuk sekolah di halaman pagination lain.
- Daftar HTML dipaginasi 40 sekolah per halaman. Search/filter memakai progressive enhancement; browse, profil, dan tautan CTA tetap tersedia tanpa JavaScript.
- Pencarian dan filter memakai parameter URL `q`, `level`, dan `district`. Refresh serta Back/Forward memulihkan pilihan; reset menghapus ketiganya. Pencarian global juga menyediakan filter bentuk pendidikan. Pilihan filter yang tidak dikenal diabaikan.
- Landing menyebut wilayah dalam dataset dan menautkan langsung ke daftar kabupaten/kota. Profil dengan kontak menyediakan tautan dekat judul menuju bagian kontak, dengan jarak untuk header sticky.
- Profil menyediakan salin tautan kanonis serta menu berbagi bawaan ketika browser mendukungnya. Parameter pelacakan dan hash tidak ikut dibagikan. Jika clipboard ditolak atau tidak tersedia, tautan dipilih agar bisa disalin manual; tautan manual juga tersedia tanpa JavaScript. Pembatalan menu berbagi tidak dianggap kegagalan.
- Metadata provinsi ditetapkan pada manifest dataset. Untuk CSV lintas kabupaten, nama wilayah berasal dari kolom `kabupaten`: `Kab.` menjadi `Kabupaten`, sedangkan `Kota` dipertahankan. Slug menghapus awalan administratif, memakai huruf kecil dan tanda hubung. Konflik nama pada slug yang sama menggagalkan build. Dataset per kabupaten dan format JSON pilot tetap didukung dengan metadata wilayah eksplisit.
- Status negeri/swasta tidak diasumsikan dari nama file. Walaupun nama CSV memakai `sekolah-swasta`, sumber tidak memiliki kolom status; `schoolStatus` belum diisi sampai cakupannya dikonfirmasi.
- Pemilik dataset mengonfirmasi tanggal scrape Sulawesi Selatan 6 Oktober 2026 dan DIY 8 Oktober 2026 dari Dapodik Kemendikdasmen (`https://sekolah.data.kemendikdasmen.go.id/`). Manifest menyimpan `sourceUpdatedAt: "2026-10-06"` dan `"2026-10-08"`. Tanggal tersebut adalah tanggal pengambilan dataset, bukan tanggal perubahan setiap record di Dapodik. Profil menampilkan tanggal sesuai provinsinya; halaman tentang data dan `/llms.txt` menyebut provinsi di samping sumber/tanggal.
- Pengguna meminta impor kedua CSV dari `data-sekolah-lengkap.zip` pada sesi ini, melanjutkan direktori institusi dengan kontak yang sudah diotorisasi. Kedua sumber dicatat aktif dalam manifest. Otorisasi push/deploy tetap terpisah; tidak ada publikasi eksternal pada proses impor lokal ini.
- Telepon sekolah menggunakan `tel:`; tidak dianggap sebagai WhatsApp. CTA Beresin memakai `whatsappLink()` dari `src/data/site.ts`.
- `/sitemap.xml` menjadi indeks untuk `/sitemap-site.xml` (situs/CMS) dan `/sekolah/sitemap.xml` (direktori). Sitemap direktori tidak memerlukan database. Pencarian tidak diindeks.
- `lastmod` sitemap artikel mengikuti `updatedAt` CMS. Halaman utama dan direktori tidak memakai `lastmod` sampai tanggal perubahan kontennya tercatat; tanggal server menyala dan tanggal scrape tidak digunakan sebagai pengganti.
- `/llms.txt` dibuat statis dari identitas situs dan metadata direktori, berisi ringkasan layanan, cakupan, keterbatasan data, dan tautan publik. Jumlah record dan tautan wilayah mengikuti dataset pada build. Halaman publik yang diindeks menautkannya melalui `rel="describedby"`. Format mengikuti [proposal llms.txt](https://llmstxt.org/); file ini tidak menjamin visibilitas GEO.

## Menjalankan dan memeriksa

Desain mengikuti `design.md`: lime untuk tindakan utama, headline tebal, dan border hitam pada pencarian. ENERGY 3 / RHYTHM 2 / MOTION 1; gerak dibatasi agar penelusuran data tetap tenang. Landing mengutamakan pencarian; jumlah record menjadi konteks cakupan dengan border netral, agar tidak bersaing dengan tugas utama. Ringkasan cakupan menyebut dua provinsi dan jumlah kabupaten/kota, sedangkan seluruh tautan kabupaten tetap tersedia pada daftar wilayah. Wilayah diurutkan menurut provinsi lalu nama kabupaten/kota. Panel pencarian abu-abu mengelompokkan kontrol, sementara daftar wilayah memakai garis pemisah.

Kartu statis, hasil pencarian, dan rekomendasi memakai urutan bentuk pendidikan, nama, wilayah, lalu NPSN agar mudah dipindai. Alamat lengkap tersedia pada profil. Pada mobile, pencarian landing mendahului ringkasan cakupan. Filter wilayah memakai dua kolom untuk mengurangi panjang form; pilihan awal cukup bertuliskan “Semua” karena label field menjelaskan kategorinya. Input tetap 16 px dengan tinggi minimal 48 px.

Profil menampilkan tanggal data dekat nama dan kontak sebelum tabel identitas. Lime menandai pencarian serta tombol menuju kontak sekolah; konsultasi dan koreksi Beresin memakai tombol putih serta pemisah netral agar tetap sekunder. Tombol berbagi ditempatkan dekat identitas dan membungkus pada layar sempit. Tautan manual memakai `details` agar alamat panjang tidak memenuhi area judul, sementara tetap bisa diakses tanpa JavaScript. Radius 12 px untuk kontrol dan 16 px untuk kelompok informasi mengikuti komponen yang ada. Tidak ada aset, dependency, atau animasi baru.

Gunakan Node.js 24 dan pnpm 10:

```bash
pnpm install --frozen-lockfile
pnpm dev
pnpm build
node scripts/verify-structure.mjs
pnpm verify:directory
```

`pnpm build` menjalankan pemeriksaan data, normalisasi, Astro, dan pemeriksaan hasil direktori. Laporan internal tersimpan di `.data/directory-report.json`; direktori ini diabaikan Git. Untuk server hasil build, gunakan `pnpm start` dengan `.env` lokal. Untuk menguji direktori statis saja tanpa `.env`, gunakan `HOST=127.0.0.1 PORT=4321 node dist/server/entry.mjs`; halaman CMS tetap membutuhkan konfigurasi/database.

Tes regresi UX memakai Python, Playwright, dan Google Chrome pada preview lokal yang sudah aktif. Environment Python dapat disiapkan di direktori yang diabaikan Git:

```bash
python3 -m venv .data/ux-venv
.data/ux-venv/bin/python -m pip install playwright
.data/ux-venv/bin/python scripts/verify-directory-ux.py
```

`BASE_URL` dapat diarahkan ke preview lokal lain. Tes memakai fixture pilot Bantaeng untuk memeriksa URL pencarian/filter, refresh, Back/Forward, menu keyboard mobile, tautan kontak, dan browse tanpa JavaScript. Clipboard dan menu berbagi diuji dengan stub API browser untuk memastikan tautan kanonis, pembatalan, serta izin ditolak; pengiriman ke aplikasi berbagi nyata tidak dilakukan. Pengujian tidak mengirim WhatsApp atau mengubah database.

Build gagal bila identitas wajib tidak valid, sumber hilang, header CSV tidak dikenali, wilayah berkonflik, atau satu NPSN memiliki isi berbeda. Record identik digabung dan dicatat. Format kontak invalid dicatat dan tidak diterbitkan; ini tidak membuktikan kontak valid masih aktif.

## Memperbarui dataset

1. Simpan sumber di `data/directory/` tanpa mengubah sumber lama secara diam-diam.
2. Daftarkan file di `datasets.json` dengan format, provinsi, kabupaten/kota, slug, sumber, URL sumber jika tersedia, tanggal jika diketahui, serta persetujuan publikasi dan kontak.
3. Format `prototype-json` menerima field prototipe dan membutuhkan `regency`/`regencySlug` eksplisit. Format `csv` menerima header `sample-sekolah.csv`; satu CSV boleh mencakup beberapa kabupaten dalam satu provinsi dengan menghilangkan kedua field metadata wilayah tersebut. Bila keduanya diisi, setiap record wajib cocok dengan wilayah metadata. Provinsi selalu eksplisit di manifest dan tidak ditebak dari nama file.
4. Set `schoolStatus` hanya jika ada bukti cakupan status. Tanggal sumber memakai `YYYY-MM-DD`; kosong berarti tidak diketahui.
5. Jalankan build dan periksa laporan. Jangan mempublikasikan record berkonflik dengan memilih salah satu secara otomatis.

`sample-sekolah.csv` berisi 20 record untuk memeriksa mapper, bukan sumber tambahan yang digabung ke direktori. CSV lengkap membawa kolom kode pos dan dusun yang tidak tersedia pada sebagian JSON pilot. Nilai kosong tetap tidak ditampilkan. Daftar bentuk pendidikan menerima 33 nilai yang ditemukan pada dua CSV; bentuk lain yang belum dikenali tetap menggagalkan validasi.

## Koreksi manual

Tim yang memegang WhatsApp bisnis menerima permintaan dari tombol koreksi pada profil. Verifikasi pengaju dan bukti perubahan secara manual, lalu catat koreksi di `data/directory/corrections.json`:

```json
[
  {
    "npsn": "00000001",
    "reason": "Contoh format; gunakan alasan dan bukti koreksi sebenarnya",
    "verifiedAt": "2026-10-11",
    "fields": { "address": "Alamat institusi yang telah diverifikasi" }
  }
]
```

Contoh memakai identifier generik; jangan memasukkannya sebagai data nyata. Koreksi membutuhkan NPSN yang ada dan hanya menerima field tampilan/kontak yang diizinkan loader. Nilai `null` menghapus field opsional. Perubahan NPSN/wilayah memerlukan perubahan sumber dan pemetaan redirect URL lama; belum ada perpindahan wilayah pada pilot ini. Koreksi diterapkan sesudah normalisasi sumber, sehingga pembaruan dataset mempertahankannya. Jangan mencatat kredensial, identitas pribadi pengaju, atau isi percakapan dalam repo.

## Analytics

Komponen memakai konfigurasi existing `PUBLIC_GA4_ID`. GA4 hanya diaktifkan ketika ID valid dan `PUBLIC_GA4_MANUAL_EVENTS=true`; flag ini menyatakan Enhanced Measurement sudah dinonaktifkan pada data stream. Tanpa kedua nilai tersebut, tidak ada tag Google atau banner analytics. Jika dikonfigurasi, GA4 dimuat setelah pengunjung menyetujui; penolakan tidak memuat tag. Pilihan dapat dibuka kembali lewat Cookie Preferences di footer. Kedua nilai diteruskan ke build Docker melalui GitHub repository variables.

Event mencakup view direktori/wilayah/profil, search, filter, CTA konsultasi, koreksi, kontak sekolah, website sekolah, dan layanan Beresin. Query mentah, isi pesan WhatsApp, serta email/telepon tidak dikirim oleh event direktori. Search mengirim panjang query dan jumlah hasil; page URL/referrer dibersihkan dari query/hash.

Sebelum mengaktifkan GA4 di production, nonaktifkan Enhanced Measurement pada data stream untuk menghindari pengumpulan otomatis query pencarian, isi URL WhatsApp, atau interaksi form di luar event yang dikontrol aplikasi. Pengaturan ini berada pada data stream, sebagaimana dijelaskan dalam [dokumentasi Google](https://developers.google.com/analytics/devguides/config/admin/v1/rest/v1alpha/EnhancedMeasurementSettings). Verifikasi event di DebugView dengan persetujuan analytics. Klik WhatsApp adalah metrik klik, bukan bukti percakapan; tim mencatat percakapan berkonteks sekolah secara manual.

## Batas data dan rilis

Kedua CSV sudah tersedia dan tanggal scrape dikonfirmasi pemilik dataset. Verifikasi ulang seluruh record ke sumber, status negeri/swasta, koordinat, dan tanggal perubahan setiap record di sumber belum tersedia. Belum ada akun sekolah, dashboard klaim, rating, peta, atau PPDB. Build dan pemeriksaan kapasitas harus memakai dataset aktif; hasil pilot di bawah adalah catatan historis.

PR memakai pipeline existing. Push ke `master` memicu deploy production, sehingga menunggu otorisasi rilis dari pemilik produk. Tidak ada pesan WhatsApp nyata yang dikirim saat pengujian.

## Hasil impor dataset lengkap

| Sumber aktif | Record | Kabupaten/kota | Tanggal scrape |
| --- | ---: | ---: | --- |
| `sekolah-swasta-sulsel.csv` | 11.502 | 24 | 6 Oktober 2026 |
| `sekolah-swasta-diy.csv` | 6.818 | 5 | 8 Oktober 2026 |

- 18.320 NPSN unik diterima, tanpa record ditolak atau duplikat. Tambahan bersih terhadap pilot: 17.983 profil. Semua 337 URL Bantaeng dipertahankan.
- Dua file sumber sama persis byte demi byte dengan isi ZIP. JSON pilot dan arsip tidak ditimpa. Manifest memakai dua sumber aktif, dengan tanggal sesuai konfirmasi pemilik.
- 716 field telepon/email/website berformat tidak valid disembunyikan; sekolahnya tetap diterima. Ada 13.014 profil dengan setidaknya satu kontak yang formatnya diterima dan 5.306 profil tanpa kontak. Kelolosan format tidak membuktikan keaktifan atau kepemilikan kontak.
- Build lengkap lulus. Hasil berisi 18.796 halaman direktori; pemeriksaan struktur mencakup 18.801 halaman statis aplikasi. Semua profil, 29 indeks pencarian wilayah, pagination, sitemap, JSON-LD, kanonis, tanggal data, urutan kontak/identitas, CTA, dan `/llms.txt` diverifikasi.
- Output direktori sekitar 590,5 MB sebelum kompresi. Indeks global 3.763.022 byte mentah, 402.252 byte bila dikompresi gzip, atau 250.516 byte dengan Brotli pada uji lokal. Indeks baru dimuat saat pencarian/filter digunakan; ukuran terkompresi ini bukan pengukuran transfer production.
- Tes UX permanen, TypeScript, dan smoke test HTTP lokal lulus. Tes dataset baru memeriksa NPSN DIY, navigasi Sleman dan halaman terakhirnya, tanggal 8 Oktober, serta filter/refresh bentuk pendidikan baru yang mengandung spasi atau titik.
- Chrome lokal: 72 kombinasi halaman/lebar 320/360/390/768/1024/1280 px tanpa overflow; 12 pemindaian axe WCAG A/AA tanpa pelanggaran atau hasil incomplete; tidak ada pageerror. Screenshot landing, tanggal sumber DIY, metodologi, dan profil panjang diperiksa. Laporan lokal di `.data/directory-import/` diabaikan Git.
- Tidak ada perubahan database, pengiriman WhatsApp, push, atau deploy. Audit ulang ke situs sumber, kontak nyata, browser lain, perangkat fisik, dan performa production belum dilakukan. Data belum memiliki koordinat untuk fitur radius.

## Hasil verifikasi pilot (historis)

- 337 record diterima, tanpa duplikat atau record ditolak; lima field kontak invalid disembunyikan.
- 350 halaman direktori, termasuk profil, wilayah, pagination, pencarian, dan metodologi. Indeks pencarian sekitar 70,6 KB sebelum kompresi.
- Normalisasi build setelah perbaikan UX 52 ms; Astro melaporkan build 1,75 detik. Indeks JSON dibuat dalam tahap prerender Astro, tanpa tahap indexing terpisah. Output direktori sekitar 9,9 MB sebelum kompresi; entry point JavaScript pencarian 3.364 byte dan event direktori 525 byte, di luar shared module.
- Pemeriksaan CSV, identifier berhuruf/nol awal, duplikat berkonflik, validasi kontak, koreksi manual, pencarian, filter gabungan, metadata, CTA, sitemap, dan tautan HTML lulus.
- Chrome lokal: pencarian dari landing, filter pada halaman pagination 9, reset, hasil kosong, profil tanpa JavaScript, konteks CTA, serta lebar 360/390/768/1024/1280 px lulus tanpa overflow. Tampilan landing desktop/mobile dan profil mobile diperiksa secara visual.
- Consent analytics diuji memakai ID uji dan request Google yang diganti stub: tidak ada tag sebelum izin/ketika ditolak, URL tanpa query, event view sesudah izin, serta penarikan consent lulus.
- Lighthouse lokal mobile: landing 99/100/100/100, wilayah 97/100/100/100, profil 99/100/100/100 untuk performance/accessibility/best practices/SEO. Ini hasil lokal, bukan jaminan skor production. LCP sekitar 2 detik dan TBT 0 ms pada ketiganya.
- Audit lokal memakai `lighthouse` sementara; tidak ada dependency baru pada proyek. Pengiriman event ke GA4 nyata dan build dataset penuh belum diuji.
- Setelah perbaikan UX: tes regresi URL/filter, reload, Back/Forward, membuka profil lalu Back, menu Tab/Shift+Tab/Escape, shortcut kontak, dan browse tanpa JavaScript lulus. Pemeriksaan 42 kombinasi halaman/lebar 320 sampai 1280 px tidak menemukan overflow; delapan pemeriksaan axe desktop/mobile tidak mendeteksi pelanggaran. Build, TypeScript, struktur 355 halaman, dan smoke test HTTP lokal lulus.
- Penambahan berbagi: clipboard Chrome nyata menyalin URL kanonis tanpa query/hash. Tujuh kasus API stub memeriksa salin, proses pending, clipboard ditolak/tidak tersedia, berbagi, pembatalan, dan berbagi ditolak. Tautan manual tetap tersedia tanpa JavaScript. Dua belas kombinasi tampilan profil pada lebar 320 sampai 1280 px tidak menemukan overflow; empat pemeriksaan axe pada tampilan normal/manual desktop/mobile tidak mendeteksi pelanggaran. `/llms.txt` dan seluruh tautannya mengembalikan HTTP 200 pada preview lokal.
