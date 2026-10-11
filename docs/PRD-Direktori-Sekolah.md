# PRD Direktori Sekolah Beresin Digital

**Status:** Rancangan awal; implementasi dataset lengkap 18.320 profil sudah diverifikasi lokal

**Produk:** Direktori Sekolah

**Pemilik produk:** Beresin Digital

**Platform:** Situs utama berbasis Astro

**Lokasi produk:** `beresindigital.id/sekolah/`

**Target pembaca:** Agent AI/coding agent yang akan membangun fitur

Dokumen ini menyimpan rancangan awal dan tahapan pilot. Keputusan implementasi terkini, mapping data, command, dan batas data aktif dicatat di [directory.md](directory.md). URL kanonis mengikuti situs utama tanpa slash penutup. Nama produk yang digunakan adalah Direktori Sekolah oleh Beresin Digital; SekolahDekat tetap merupakan nama kerja prototipe.

---

## 1. Ringkasan produk

Direktori Sekolah adalah direktori publik di dalam situs Beresin Digital. Produk mengubah dataset sekolah yang sudah dimiliki menjadi halaman informatif yang dapat ditemukan melalui mesin pencari dan mesin jawaban AI.

Pengunjung dapat mencari dan menelusuri sekolah berdasarkan wilayah dan jenjang, lalu membuka profil sekolah. Setiap profil menampilkan data faktual yang tersedia dan CTA menuju WhatsApp Beresin Digital untuk klaim/koreksi profil atau konsultasi website sekolah.

Produk ini **bukan** media sosial, marketplace, atau sistem administrasi sekolah. Fungsi utamanya adalah:

1. memberi informasi sekolah yang berguna;
2. meningkatkan awareness Beresin Digital;
3. menghasilkan lead sekolah secara pasif;
4. membangun aset konten terstruktur untuk SEO dan GEO.

### Cara kerjanya secara sederhana

`Dataset sekolah -> build Astro -> halaman statis -> ditemukan pengunjung -> pengunjung melihat brand/CTA -> lead masuk ke WhatsApp`

---

## 2. Latar belakang

Beresin Digital memiliki dataset sekitar 18.300 sekolah: sekitar 11.500 di Sulawesi Selatan dan 6.800 di DI Yogyakarta. Data ini dapat diubah menjadi ribuan halaman statis tanpa menulis profil satu per satu.

Pilot yang sudah pernah dibuat memakai data asli 337 sekolah di Kabupaten Bantaeng. Produk final akan menjadi modul di situs Astro Beresin Digital, bukan domain atau aplikasi terpisah.

### Masalah yang diselesaikan

- Informasi sekolah tersebar dan tidak selalu mudah ditelusuri berdasarkan wilayah atau jenjang.
- Situs Beresin Digital membutuhkan aset awareness yang terus bekerja tanpa produksi konten harian.
- Sekolah yang belum memiliki website atau memiliki kehadiran digital lemah membutuhkan jalan sederhana untuk menghubungi penyedia jasa.
- Mesin pencari dan mesin jawaban AI membutuhkan sumber publik yang terstruktur, faktual, dan mudah dirayapi.

---

## 3. Tujuan dan ukuran keberhasilan

### Tujuan produk

- Menghadirkan direktori sekolah yang cepat, berguna, dan berbasis data nyata.
- Membuat brand Beresin Digital terlihat pada seluruh perjalanan pengguna tanpa mengganggu fungsi direktori.
- Mengarahkan sekolah ke percakapan WhatsApp yang sudah membawa konteks nama sekolah.
- Menghasilkan halaman statis yang mudah dirayapi, diindeks, dan dikutip.
- Menjaga biaya operasi rendah dan tidak membutuhkan backend pada MVP.

### Indikator keberhasilan awal

Angka target tidak ditetapkan dalam dokumen ini agar tidak mengarang baseline. Implementasi harus merekam metrik berikut sehingga target dapat dibuat setelah data 30 hari pertama tersedia:

- halaman direktori terindeks;
- kunjungan organik ke `/sekolah/`;
- jumlah pencarian internal, panjang query, dan jumlah hasil; query mentah tidak dikirim ke analytics;
- jumlah tampilan profil sekolah;
- klik CTA WhatsApp dari profil;
- klik klaim/koreksi data;
- halaman dengan data kosong atau build gagal;
- rasio halaman ditemukan tetapi tanpa hasil.

### North-star metric

**Jumlah percakapan WhatsApp berkonteks sekolah yang diterima dari direktori.** Klik CTA direkam sebagai metrik terpisah; percakapan dicatat manual oleh tim, karena situs tidak dapat memastikan percakapan dimulai hanya dari klik.

---

## 4. Pengguna utama

### Orang tua atau calon siswa

Membutuhkan daftar sekolah di wilayah tertentu, informasi dasar, dan cara menghubungi sekolah.

### Pengelola sekolah

Ingin menemukan profil sekolahnya, mengoreksi data, mengklaim profil, atau meminta bantuan meningkatkan kehadiran digital.

### Tim Beresin Digital

Membutuhkan aset brand awareness dan lead generation yang berjalan otomatis dengan operasional minimal.

### Mesin pencari dan mesin jawaban AI

Membutuhkan halaman publik dengan struktur konsisten, metadata jelas, hubungan wilayah yang eksplisit, dan data faktual yang dapat dibaca tanpa menjalankan JavaScript berat.

---

## 5. User stories dan acceptance criteria

### US-01 — Menelusuri sekolah berdasarkan wilayah

Sebagai orang tua, saya ingin menelusuri provinsi lalu kabupaten/kota agar saya menemukan sekolah di area yang relevan.

**Diterima jika:**

- halaman direktori menampilkan wilayah yang tersedia dari dataset;
- setiap wilayah menampilkan jumlah sekolah berdasarkan data build terakhir;
- breadcrumb tersedia di semua halaman turunan;
- wilayah tanpa data tidak dibuat sebagai halaman kosong;
- navigasi tetap dapat digunakan tanpa JavaScript.

### US-02 — Memfilter daftar sekolah

Sebagai pengunjung, saya ingin memfilter daftar berdasarkan jenjang dan kecamatan agar hasil lebih relevan.

**Diterima jika:**

- filter hanya menampilkan nilai yang benar-benar ada pada daftar saat ini;
- filter jenjang dan kecamatan dapat dikombinasikan;
- jumlah hasil diperbarui setelah filter;
- kondisi tanpa hasil memberi pesan jelas dan tombol reset;
- filter tidak mengubah data sumber.

### US-03 — Mencari berdasarkan nama sekolah

Sebagai pengunjung, saya ingin mencari nama sekolah agar dapat menuju profilnya secara cepat.

**Diterima jika:**

- pencarian menerima nama lengkap maupun sebagian nama;
- hasil menampilkan nama, jenjang, kabupaten/kota, dan kecamatan bila tersedia;
- pencarian tidak membutuhkan backend;
- hasil mengarah ke URL kanonis profil;
- kueri kosong atau terlalu pendek tidak menyebabkan error.

### US-04 — Membaca profil sekolah

Sebagai calon siswa/orang tua, saya ingin melihat informasi faktual satu sekolah agar dapat menilai relevansinya dan menghubungi sekolah.

**Diterima jika:**

- hanya field yang memiliki nilai valid yang ditampilkan;
- profil minimal menampilkan nama sekolah, NPSN, jenjang, status, dan lokasi jika tersedia;
- telepon, email, dan website dibuat interaktif hanya setelah lolos validasi format;
- website eksternal dibuka aman dengan atribut `rel="noopener noreferrer"`;
- sumber dan tanggal pembaruan dataset ditampilkan jika tersedia;
- tidak ada informasi yang ditebak untuk mengisi data kosong.

### US-05 — Menghubungi Beresin Digital dengan konteks

Sebagai pengelola sekolah, saya ingin menghubungi Beresin Digital dari profil sekolah agar tidak perlu menjelaskan identitas sekolah dari awal.

**Diterima jika:**

- CTA utama tersedia pada profil sekolah;
- pesan WhatsApp memuat nama sekolah dan NPSN;
- nomor tujuan berasal dari konfigurasi, bukan tersebar di komponen;
- klik CTA memicu event analytics sebelum berpindah;
- copy CTA tidak mengklaim sekolah belum memiliki website.

**Template pesan:**

> Halo Beresin Digital, saya ingin konsultasi terkait profil/website untuk {nama_sekolah} (NPSN {npsn}).

### US-06 — Mengajukan koreksi atau klaim profil

Sebagai pengelola sekolah, saya ingin melaporkan data yang keliru agar profil dapat diperbaiki.

**Diterima jika:**

- tombol koreksi/klaim memakai WhatsApp pada MVP;
- pesan membedakan kebutuhan koreksi data dan konsultasi website;
- pesan menyertakan URL profil, nama sekolah, dan NPSN;
- UI menjelaskan bahwa perubahan tidak otomatis diterbitkan;
- tidak ada klaim kepemilikan yang langsung disetujui tanpa verifikasi manusia.

### US-07 — Menemukan Beresin Digital

Sebagai pengunjung, saya ingin mengetahui siapa pengelola direktori agar dapat menilai kredibilitas sumber.

**Diterima jika:**

- header/footer menyebut direktori dikelola Beresin Digital;
- terdapat tautan ke layanan utama Beresin Digital;
- branding hadir konsisten tetapi tidak menyamarkan direktori sebagai situs resmi pemerintah;
- halaman menyertakan disclaimer sumber data dan independensi.

### US-08 — Membaca halaman melalui crawler atau AI

Sebagai crawler, saya ingin menerima HTML lengkap dan metadata terstruktur agar isi halaman dapat dipahami tanpa rendering klien.

**Diterima jika:**

- informasi inti tersedia pada HTML hasil build;
- setiap profil memiliki title, description, canonical, Open Graph, dan breadcrumb;
- schema JSON-LD valid dan hanya memuat data yang tersedia;
- sitemap memuat URL kanonis yang boleh diindeks;
- `robots.txt` tidak memblokir direktori;
- `llms.txt` boleh disediakan sebagai ringkasan navigasi, tetapi bukan pengganti struktur HTML, sitemap, atau konten berkualitas.

---

## 6. Ruang lingkup MVP

### Termasuk

- landing page direktori;
- browse provinsi dan kabupaten/kota;
- daftar sekolah per wilayah;
- filter jenjang dan kecamatan;
- pencarian nama sekolah dengan Pagefind atau mesin pencarian statis setara;
- halaman profil sekolah;
- breadcrumb dan navigasi terkait;
- CTA WhatsApp untuk konsultasi website;
- CTA WhatsApp untuk koreksi/klaim profil;
- metadata SEO, canonical, sitemap, robots, dan JSON-LD;
- halaman metodologi/sumber data dan disclaimer;
- analytics event untuk interaksi penting;
- proses normalisasi, validasi, dan build dataset;
- desain responsif dan aksesibel.

### Tidak termasuk

- akun pengguna atau login sekolah;
- dashboard admin;
- form klaim dengan workflow otomatis;
- pembayaran atau transaksi;
- review/rating sekolah;
- chat antarpengguna;
- media sosial atau feed;
- peta interaktif;
- perbandingan sekolah;
- PPDB online;
- database/runtime backend;
- perubahan data langsung oleh publik.

### Kandidat fase berikutnya

- perbandingan dua sampai tiga sekolah;
- statistik agregat per wilayah;
- halaman informasi PPDB;
- form klaim dengan verifikasi;
- integrasi koordinat dan peta setelah data tersedia;
- halaman profil yang dikelola sekolah.

---

## 7. Arsitektur informasi dan URL

Semua slug harus lowercase, memakai tanda hubung, stabil, dan berasal dari hasil normalisasi terkontrol.

```text
/sekolah/
/sekolah/{provinsi}/
/sekolah/{provinsi}/{kabupaten-kota}/
/sekolah/{provinsi}/{kabupaten-kota}/{npsn}/
/sekolah/cari/
/sekolah/tentang-data/
```

Contoh struktur:

```text
/sekolah/sulawesi-selatan/
/sekolah/sulawesi-selatan/bantaeng/
/sekolah/sulawesi-selatan/bantaeng/69992289/
```

NPSN menjadi identifier URL profil karena lebih stabil daripada nama sekolah. Perubahan nama tidak mengubah URL; perubahan wilayah tetap mengubah URL karena slug wilayah ada pada path, sehingga URL lama harus dipetakan ke URL baru melalui redirect.

### Navigasi minimum

- **Landing:** pencarian, daftar provinsi, penjelasan singkat, CTA layanan.
- **Provinsi:** daftar kabupaten/kota dan jumlah sekolah.
- **Kabupaten/kota:** daftar sekolah, filter, pagination atau segmentasi yang ramah crawl.
- **Profil:** identitas, lokasi, kontak, sumber data, sekolah terkait, CTA.
- **Tentang data:** cakupan, sumber, tanggal pembaruan, keterbatasan, cara koreksi.

### Aturan pagination

Jika daftar besar, gunakan pagination statis dengan URL kanonis per halaman. Jangan memakai infinite scroll sebagai satu-satunya cara mengakses hasil. Setiap sekolah harus dapat ditemukan melalui tautan HTML biasa.

---

## 8. Spesifikasi halaman

### Landing `/sekolah/`

Wajib memuat:

- judul yang menjelaskan fungsi direktori;
- input pencarian sekolah;
- daftar wilayah yang tersedia;
- ringkasan jumlah sekolah berdasarkan dataset build;
- penjelasan bahwa direktori dikelola Beresin Digital;
- tautan ke metodologi/sumber data;
- CTA menuju layanan website sekolah.

### Halaman provinsi

Wajib memuat:

- nama provinsi dan ringkasan cakupan;
- daftar kabupaten/kota;
- jumlah sekolah per kabupaten/kota;
- breadcrumb;
- metadata unik;
- tautan internal ke semua kabupaten/kota yang tersedia.

### Halaman kabupaten/kota

Wajib memuat:

- nama wilayah dan jumlah hasil;
- filter jenjang dan kecamatan;
- kartu sekolah;
- pagination statis bila diperlukan;
- empty state untuk kombinasi filter tanpa hasil;
- copy pengantar singkat yang dibentuk dari fakta dataset, bukan paragraf generik berulang.

### Halaman profil sekolah

Urutan konten:

1. breadcrumb;
2. nama sekolah, jenjang, status, dan akreditasi bila tersedia;
3. alamat dan struktur wilayah;
4. informasi kontak yang valid;
5. website sekolah bila valid;
6. identitas tambahan dari dataset;
7. sumber data dan tanggal pembaruan;
8. CTA koreksi/klaim;
9. CTA konsultasi website;
10. sekolah terkait dalam wilayah/jenjang yang sama.

---

## 9. Model data

Agent harus memeriksa header dataset aktual sebelum membuat mapper. Jangan mengasumsikan nama kolom CSV sama dengan nama field internal.

### Schema internal minimum

```ts
export interface SchoolRecord {
  npsn: string;
  name: string;
  slugProvince: string;
  slugRegency: string;
  province: string;
  regency: string;
  district?: string;
  village?: string;
  address?: string;
  postalCode?: string;
  educationLevel: string;
  schoolStatus?: "NEGERI" | "SWASTA" | "LAINNYA";
  accreditation?: string;
  foundationName?: string;
  phone?: string;
  email?: string;
  website?: string;
  sourceName?: string;
  sourceUrl?: string;
  sourceUpdatedAt?: string;
}
```

### Aturan normalisasi

- trim whitespace dan karakter kontrol;
- simpan NPSN sebagai string agar nol di depan tidak hilang;
- normalisasi kapitalisasi untuk tampilan tanpa mengubah nilai identifier;
- normalisasi jenjang ke vocabulary terkontrol;
- normalisasi status ke nilai internal yang ditentukan;
- ubah string kosong, `-`, `null`, dan nilai sentinel lain menjadi `undefined`;
- validasi email, telepon, dan URL sebelum membuat tautan;
- tambahkan `https://` hanya bila host website valid dan skema tidak tersedia;
- tolak skema selain `http` atau `https` untuk website;
- deduplikasi berdasarkan NPSN: record identik digabung dan dicatat, record dengan isi berbeda menggagalkan build;
- fail build bila satu NPSN memetakan ke dua sekolah berbeda;
- hasilkan laporan build untuk record diterima, ditolak, duplikat, dan field invalid;
- jangan menampilkan email/telepon invalid sebagai teks yang seolah dapat dipakai.

### Field opsional

Field yang tidak ada harus disembunyikan. Jangan menampilkan “tidak tersedia” berulang pada setiap baris. Empty state cukup dipakai untuk satu kelompok informasi, misalnya “Informasi kontak belum tersedia pada dataset.”

### Provenance

Setiap record harus mewarisi metadata dataset: nama sumber, URL sumber jika memang tersedia dan tervalidasi, serta tanggal pembaruan bila diketahui. Jika tanggal pembaruan tidak ada, gunakan teks “Tanggal pembaruan sumber tidak tersedia”; jangan memakai tanggal build sebagai tanggal data.

---

## 10. Persyaratan teknis

### Stack

- Astro mengikuti versi dan konvensi repo yang ada;
- TypeScript;
- static site generation;
- Pagefind atau alternatif statis yang kompatibel dengan proses deploy;
- CSS/design system yang sudah digunakan Beresin Digital;
- tanpa database dan server runtime pada modul direktori MVP; CMS/database situs utama tetap digunakan.

### Struktur modul yang disarankan

```text
src/
  components/directory/
  content/directory/
  layouts/
  pages/sekolah/
  lib/directory/
  styles/
data/
  directory/
scripts/
  directory/
```

Agent harus menyesuaikan struktur ini dengan repo aktual, bukan memaksakan duplikasi pola yang sudah ada.

### Pipeline build

1. Baca sumber CSV/JSON dari direktori data yang disepakati.
2. Map header sumber ke schema internal.
3. Normalisasi dan validasi seluruh record.
4. Gagalkan build untuk error integritas kritis.
5. Simpan laporan kualitas data sebagai artifact build internal.
6. Generate halaman dengan `getStaticPaths`.
7. Build Astro.
8. Bangun indeks pencarian dari output HTML.
9. Validasi link internal, metadata, sitemap, dan jumlah profil.

### Error integritas kritis

Build harus gagal bila:

- NPSN hilang atau memiliki record dengan isi yang berkonflik;
- nama sekolah hilang;
- provinsi atau kabupaten/kota hilang;
- URL profil bertabrakan;
- jumlah halaman profil berbeda dari jumlah record valid;
- input dataset tidak ditemukan;
- schema sumber berubah dan mapper tidak mengenali kolom wajib.

Field kontak invalid tidak perlu menggagalkan seluruh build; record tetap dibuat tanpa tautan kontak tersebut dan dicatat dalam laporan.

---

## 11. SEO dan GEO

### Metadata per halaman

- title unik dan deskriptif;
- meta description berdasarkan fakta halaman;
- canonical absolut;
- Open Graph title, description, URL, dan image default brand;
- breadcrumb terstruktur;
- heading hierarchy satu `h1` per halaman;
- atribut bahasa `id`.

### Structured data

Gunakan schema yang paling tepat berdasarkan isi nyata halaman. Jangan membuat rating, review, harga, jam operasional, atau atribut lain yang tidak ada.

Minimum:

- `BreadcrumbList` pada halaman turunan;
- `ItemList` pada daftar wilayah/sekolah;
- entitas sekolah hanya dengan properti yang benar-benar tersedia dan sesuai vocabulary schema yang dipilih;
- `Organization` untuk Beresin Digital pada halaman tentang/pengelola.

### Internal linking

- landing menautkan semua provinsi;
- provinsi menautkan semua kabupaten/kota;
- kabupaten/kota menautkan semua profil melalui pagination statis;
- profil menautkan wilayah induk dan beberapa sekolah terkait;
- anchor text menyebut nama sekolah atau wilayah, bukan “klik di sini”.

### Konten untuk mesin jawaban AI

- tulis fakta dalam HTML yang jelas, bukan hanya script JSON;
- tampilkan nama wilayah lengkap, bukan bergantung pada breadcrumb visual;
- sediakan halaman metodologi dan cakupan data;
- sediakan timestamp pembaruan bila bersumber dari dataset;
- `llms.txt` dapat berisi deskripsi produk dan link penting, namun tidak boleh diposisikan sebagai jaminan brand akan disebut AI;
- jangan membuat halaman doorway atau paragraf hasil substitusi massal yang tidak menambah informasi.

### Indexing

Halaman boleh `index,follow` bila mempunyai identitas sekolah dan lokasi minimum. Halaman hasil pencarian internal, kombinasi filter kosong, dan parameter URL harus `noindex` atau diarahkan ke canonical induk agar tidak membuat duplikasi indeks.

---

## 12. Desain dan pengalaman pengguna

### Prinsip

- cepat dipahami dalam satu layar;
- informasi lebih penting daripada dekorasi;
- mobile-first;
- identitas Beresin Digital konsisten dengan situs utama;
- CTA jelas tetapi tidak agresif;
- tidak menyerupai situs resmi pemerintah.

### Komponen utama

- `DirectorySearch`;
- `RegionCard`;
- `SchoolCard`;
- `DirectoryFilters`;
- `DirectoryBreadcrumbs`;
- `SchoolFacts`;
- `ContactActions`;
- `ClaimProfileCTA`;
- `WebsiteConsultationCTA`;
- `DataSourceNote`;
- `Pagination`;
- `EmptyState`.

### Aksesibilitas

- navigasi dapat digunakan dengan keyboard;
- fokus terlihat jelas;
- semua input memiliki label;
- hasil pencarian dan perubahan jumlah hasil diumumkan secara aksesibel;
- warna memenuhi kontras WCAG AA;
- target sentuh minimum 44 x 44 px;
- tidak ada informasi yang hanya dibedakan melalui warna;
- dukung `prefers-reduced-motion`;
- gunakan elemen semantik dan urutan heading yang benar.

---

## 13. Analytics dan event

Gunakan analytics yang sudah ada di repo. Jangan menambahkan vendor baru tanpa keputusan pemilik produk.

Event minimum:

```text
directory_view
region_view
school_profile_view
directory_search
filter_apply
whatsapp_consult_click
profile_claim_click
school_website_click
contact_school_click
```

Properti event yang diperbolehkan:

- NPSN;
- jenjang;
- provinsi;
- kabupaten/kota;
- posisi hasil;
- jenis CTA.

Jangan mengirim isi pesan WhatsApp, nomor telepon pengunjung, email pengunjung, atau query yang mengandung data pribadi ke analytics.

---

## 14. Keamanan, privasi, dan data

- data yang ditampilkan harus berasal dari dataset yang memang diizinkan untuk dipublikasikan;
- jangan memasukkan credential, API key, atau secret ke bundle Astro;
- sanitasi semua nilai dataset sebelum dirender;
- validasi URL untuk mencegah skema berbahaya;
- encode parameter pesan WhatsApp dengan benar;
- hindari menampilkan data pribadi individu; direktori hanya untuk data institusi;
- sediakan mekanisme koreksi data;
- tampilkan disclaimer bahwa data dapat berubah dan pengguna perlu mengonfirmasi ke sekolah;
- jangan mengklaim afiliasi dengan pemerintah atau sekolah;
- jangan menyetujui klaim profil otomatis pada MVP.

---

## 15. Performa dan operasional

### Target teknis

- halaman inti dirender statis;
- tidak ada request data wajib saat runtime;
- JavaScript klien hanya untuk pencarian, filter, dan analytics;
- gambar brand dioptimalkan dengan pipeline Astro;
- font mengikuti strategi situs utama;
- halaman tetap informatif saat JavaScript gagal;
- build dapat menangani sekitar 18.300 record tanpa out-of-memory pada lingkungan CI yang digunakan.

### Budget yang harus diuji

Jangan mengklaim skor sebelum audit. Agent harus mengukur dan melaporkan:

- durasi normalisasi data;
- durasi build Astro;
- durasi indexing pencarian;
- ukuran output total;
- ukuran JavaScript per tipe halaman;
- jumlah halaman yang dihasilkan;
- hasil Lighthouse untuk landing, halaman wilayah, dan profil contoh.

### Pembaruan data

Pembaruan direktori dilakukan dengan mengganti/menambah file dataset lalu menjalankan pipeline build. Proses harus deterministik: input dan versi kode yang sama menghasilkan URL dan konten yang sama.

---

## 16. Pengujian

### Unit test

- mapper header sumber;
- normalisasi jenjang, status, dan wilayah;
- slug generation;
- deduplikasi NPSN;
- validasi email, telepon, dan URL;
- pembentukan pesan WhatsApp;
- metadata dan canonical.

### Integration test

- semua record valid menghasilkan tepat satu profil;
- halaman provinsi dan kabupaten/kota memiliki tautan anak;
- pencarian menemukan nama sekolah yang diketahui;
- filter gabungan menghasilkan subset yang benar;
- sitemap hanya berisi URL kanonis;
- indeks pencarian statis memuat seluruh profil valid dan tidak memuat field kontak; bila Pagefind dipilih, indexing dilakukan setelah output Astro tersedia;
- CTA menggunakan konfigurasi nomor WhatsApp.

### End-to-end test

Uji minimal pada mobile dan desktop:

1. buka landing direktori;
2. cari sekolah berdasarkan sebagian nama;
3. buka profil dari hasil;
4. kembali ke halaman wilayah melalui breadcrumb;
5. terapkan filter jenjang dan kecamatan;
6. buka CTA konsultasi dan verifikasi konteks pesan;
7. buka CTA koreksi dan verifikasi URL profil tercantum;
8. gunakan seluruh alur dengan keyboard.

Gunakan data fixture generik untuk test otomatis. Jangan mengirim pesan WhatsApp sungguhan dan jangan menggunakan lead nyata untuk pengujian.

### Pemeriksaan konten

- tidak ada field kosong yang menghasilkan label rusak;
- tidak ada NPSN hilang atau duplikat;
- tidak ada klaim “belum memiliki website”;
- tidak ada nama wilayah atau sekolah rekaan;
- tidak ada URL eksternal invalid;
- disclaimer dan sumber data terlihat;
- branding tidak menyiratkan situs pemerintah.

---

## 17. Tahapan implementasi

### Tahap 1 — Audit repo dan data

- baca struktur Astro, versi package, design system, analytics, dan pipeline deploy;
- inventaris file dataset dan header aktual;
- identifikasi sumber/tanggal pembaruan yang tersedia;
- catat keputusan mapper tanpa mengubah data mentah.

**Output:** rencana perubahan file dan laporan schema input.

### Tahap 2 — Data layer

- buat schema internal;
- implementasikan mapper, validator, normalizer, deduplikasi, dan laporan build;
- jalankan pada pilot Bantaeng sebelum seluruh dataset.

**Gate:** jumlah record valid pilot sama dengan jumlah profil yang akan dibuat.

### Tahap 3 — Halaman pilot

- bangun landing, wilayah, daftar, profil, filter, CTA, dan metadata;
- gunakan data Bantaeng;
- tambahkan test unit dan integration.

**Gate:** user journey utama berfungsi dan tidak ada data rekaan.

### Tahap 4 — Pencarian dan crawlability

- integrasikan pencarian statis;
- tambahkan sitemap, canonical, robots, JSON-LD, internal links, dan halaman tentang data;
- audit aksesibilitas dan link.

**Gate:** sekolah pilot dapat ditemukan dari landing melalui tautan biasa dan pencarian.

### Tahap 5 — Skala penuh

- aktifkan seluruh Sulawesi Selatan dan DI Yogyakarta;
- ukur waktu build dan ukuran output;
- optimalkan memori, pagination, serta search index;
- verifikasi jumlah profil terhadap record valid.

**Gate:** build penuh berhasil secara konsisten pada CI/deploy target.

### Tahap 6 — Rilis

- deploy ke preview;
- jalankan smoke test;
- periksa analytics event tanpa mengirim data sensitif;
- minta persetujuan pemilik produk;
- deploy produksi dan pantau error/indexing.

---

## 18. Instruksi eksekusi untuk agent AI

1. **Mulai dengan membaca repo.** Jangan membuat project Astro baru bila modul harus hidup di situs yang ada.
2. **Ikuti pola existing.** Gunakan komponen, token desain, linting, formatter, test runner, dan analytics yang sudah dipakai.
3. **Jangan mengarang data.** Bila field atau sumber tidak ada, sembunyikan atau laporkan sebagai keterbatasan.
4. **Kerjakan pilot lebih dulu.** Validasi Bantaeng sebelum menjalankan build 18.300 halaman.
5. **Jangan menyentuh produksi.** Buat branch dan preview; produksi menunggu persetujuan manusia.
6. **Jangan mengirim komunikasi nyata saat test.** Uji URL WhatsApp tanpa mengirim pesan.
7. **Pisahkan data mentah dan hasil normalisasi.** Data mentah tidak boleh dimutasi.
8. **Buat perubahan kecil dan dapat direview.** Pisahkan data layer, UI, search, metadata, dan rollout dalam commit yang logis.
9. **Laporkan keputusan.** Dokumentasikan mapping kolom, record ditolak, collision slug, build metrics, dan test results.
10. **Berhenti pada konflik data.** Bila NPSN duplikat atau schema berubah, jangan memilih salah satu record secara diam-diam.

### Konfigurasi yang harus dipusatkan

```ts
export interface DirectoryConfig {
  basePath: "/sekolah";
  brandName: "Beresin Digital";
  whatsappNumber: string;
  sourceLabel?: string;
  sourceUrl?: string;
  datasetUpdatedAt?: string;
  resultsPerPage: number;
}
```

Nomor WhatsApp harus diambil dari konfigurasi bisnis yang sudah dipakai situs atau environment publik yang memang aman diekspos. Jangan menduplikasi nomor di setiap komponen.

### Format laporan implementasi

Agent harus mengembalikan:

- ringkasan perubahan;
- daftar file yang dibuat/diubah;
- cara menjalankan lokal;
- cara memperbarui dataset;
- jumlah record valid/ditolak/duplikat;
- jumlah halaman yang dihasilkan;
- hasil test dan audit;
- keterbatasan yang masih ada;
- URL preview bila proses deploy memang tersedia dan diotorisasi.

---

## 19. Definition of done

MVP dianggap selesai hanya jika seluruh kondisi berikut terpenuhi:

- direktori berada di `/sekolah/` dalam project Astro Beresin Digital;
- pipeline menerima dataset aktual tanpa mengubah file sumber;
- pilot Bantaeng lolos sebelum dataset penuh diaktifkan;
- setiap record valid menghasilkan satu URL profil kanonis;
- browse wilayah, filter, pencarian, dan profil berfungsi;
- CTA WhatsApp membawa konteks nama sekolah dan NPSN;
- tidak ada pesan nyata yang dikirim selama pengujian;
- halaman inti dapat digunakan tanpa JavaScript;
- metadata, sitemap, robots, breadcrumb, dan JSON-LD tervalidasi;
- halaman hasil pencarian/parameter tidak membuat duplikasi indeks;
- test unit, integration, dan alur end-to-end lulus;
- audit aksesibilitas dan performa dilakukan pada tiga tipe halaman;
- laporan kualitas data dan jumlah halaman tersedia;
- disclaimer, sumber data, dan jalur koreksi terlihat;
- preview telah direview dan disetujui manusia sebelum produksi.

---

## 20. Keputusan produk yang sudah tetap

- Produk menjadi menu/modul di situs Beresin Digital, bukan domain terpisah.
- Path utama adalah `/sekolah/`.
- Framework adalah Astro dan output utama statis.
- MVP tidak memakai backend/database.
- Pencarian menggunakan indeks statis.
- CTA lead menuju WhatsApp dan membawa konteks sekolah.
- Direktori tidak boleh mengklaim sekolah belum memiliki website.
- Review, rating, akun, peta, dan PPDB berada di luar MVP.
- Data kosong tidak boleh diisi dengan asumsi.

## 21. Asumsi yang perlu diverifikasi saat integrasi

- repo yang diterima agent adalah repo Astro produksi Beresin Digital;
- dataset Sulawesi Selatan dan DI Yogyakarta tersedia bagi agent;
- izin publikasi field kontak institusi sudah dikonfirmasi pemilik produk;
- konfigurasi nomor WhatsApp bisnis dapat dibaca dari repo atau environment;
- analytics dan deployment mengikuti mekanisme situs yang sudah ada;
- struktur kolom dataset akan dipetakan setelah inspeksi, bukan diasumsikan dari PRD ini.
