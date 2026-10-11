# Beresin Digital: panduan desain

Dokumen ini merangkum desain yang sudah diterapkan di project, berdasarkan source setelah pull commit `11e57af`. Gunakan sebagai acuan ketika menambah halaman atau mengubah komponen. Nilai token dan perilaku komponen berasal dari kode; uraian karakter dan alasan visual merupakan pembacaan atas implementasi tersebut.

## Identitas dan arah visual

Beresin Digital adalah partner pengembangan solusi digital untuk bisnis, sekolah, dan agensi. Katalog layanan mencakup website dan aplikasi mobile, IoT, integrasi sistem, serta desain grafis.

Bahasa visualnya menyerupai neo-brutalism: headline besar dan tebal, border hitam, bayangan solid tanpa blur, aksen lime, serta kartu dengan sudut membulat. Foto dan bidang netral menyeimbangkan elemen grafis yang kuat. Halaman harus membantu pengunjung memahami layanan, melihat pekerjaan, lalu menghubungi tim.

Pembacaan desain: website jasa digital untuk calon klien bisnis, dengan tipografi editorial tebal dan aksen grafis. Dial yang disimpulkan dari kode: ENERGY 3 / RHYTHM 2 / MOTION 2. Ini acuan interpretasi, bukan konfigurasi yang tersedia di aplikasi.

| Keputusan visual | Peran dalam halaman |
| --- | --- |
| Lime sebagai aksen utama | Menonjolkan CTA, label, dan bagian headline yang menjadi fokus. |
| Putih, abu-abu muda, dan bidang gelap | Memisahkan kelompok konten dan memberi jeda antar-section. |
| Headline uppercase dengan tracking rapat | Membuat judul menjadi titik perhatian utama. |
| Label kecil dengan font mono | Membedakan kategori dan metadata dari isi utama. |
| Border hitam dan bayangan solid | Memberi kontur tegas pada tombol, gambar, dan kartu unggulan. |
| Grid tipis pada hero dan header halaman | Mengulang motif teknis di area pembuka. |
| Kartu, daftar, masonry, dan komposisi dua kolom | Menyesuaikan susunan dengan jenis konten. |

## Warna

Sumber token: [`src/styles/global.css`](src/styles/global.css), melalui `@theme` Tailwind CSS.

| Token | Nilai | Pemakaian |
| --- | --- | --- |
| `brand-lime` | `#D2EB1E` | Background CTA dan chip, highlight, aksen pada bidang gelap. |
| `brand-lime-hover` | `#C0D816` | Hover untuk tombol lime. |
| `brand-dark` | `#0D0F12` | Teks utama, section gelap, footer, bayangan solid. |
| `brand-surface` | `#F4F5F7` | Section sekunder, input, dan background admin. |
| `brand-border` | `#E4E4E7` | Token border netral; markup juga memakai utility gray. |
| `brand-muted` | `#52525B` | Token teks sekunder; markup juga memakai utility gray. |

Putih adalah background dasar. Hitam murni juga dipakai untuk border dan teks. Warna status mengikuti konteks; aksen brand tetap lime.

- Gunakan teks hitam pada background lime.
- Gunakan lime sebagai teks pada bidang gelap. Pada putih, lime boleh menjadi ornamen, bukan teks yang harus terbaca.
- Komentar CSS mencatat kontras lime terhadap putih sekitar 1,34:1 dan lime-hover sekitar 1,61:1. Keduanya tidak memenuhi kontras teks WCAG AA.
- Untuk teks sekunder pada bidang terang, gunakan minimal `text-gray-500`; `text-gray-400` dipakai pada bidang gelap.
- Section gelap adalah bagian komposisi halaman. Project belum menyediakan theme toggle.

## Tipografi

Font di-host sendiri melalui [`src/styles/fonts.css`](src/styles/fonts.css), memakai WOFF2, subset Latin/Latin-ext, rentang weight 400–800, dan `font-display: swap`.

| Peran | Font dan utility umum | Ukuran yang dipakai |
| --- | --- | --- |
| Body | Plus Jakarta Sans, `font-sans` | Isi ringkas 12–14 px; lead 14–16 px. |
| Display | Plus Jakarta Sans, `font-display`, `font-black`, uppercase | Hero 36 / 60 / 72 px pada base / sm / lg. |
| H1 halaman dalam | `font-display`, `tracking-tighter`, `leading-none` | 36 px, menjadi 60 px pada sm. |
| H2 section | `font-display`, `tracking-tight`, `leading-none` | Umumnya 30 px, menjadi 48 px pada sm. |
| Label dan metadata | JetBrains Mono, `font-mono`, uppercase, tracking lebar | Umumnya 10–12 px. |
| Isi artikel | Plus Jakarta Sans | Paragraf 15 px, line-height 1,75. |
| Isi legal | Plus Jakarta Sans | Paragraf 14 px, line-height 1,75. |

`font-sans` dan `font-display` memakai keluarga yang sama; hirarki berasal dari ukuran, weight, tracking, dan kapitalisasi. Utility `font-black` meminta weight 900, sementara font yang disediakan berhenti di 800. Jangan menganggap file font memiliki weight 900 asli.

Gunakan satu H1 per halaman, H2 untuk section, dan H3 untuk item di dalamnya. Paragraf panjang mengikuti gaya artikel atau legal, bukan ukuran kecil kartu marketing.

## Layout dan spacing

Container utama menggunakan `mx-auto max-w-7xl px-4 sm:px-6 lg:px-8`: lebar maksimum 80 rem, dengan padding horizontal 16 / 24 / 32 px. Artikel dan legal memakai `max-w-3xl` untuk isi; cover artikel dapat melebar ke `max-w-4xl`.

Section umum memakai `py-16` atau `py-20` (64 atau 80 px). Hero memakai 48 px, menjadi 64 px pada lg. Header halaman memakai 56 px, menjadi 80 px pada lg. Jarak antar-item umumnya 24–48 px; padding kartu 20–32 px.

| Breakpoint yang dipakai | Nilai default Tailwind | Perubahan utama |
| --- | --- | --- |
| Base | Di bawah 640 px | Konten ditumpuk satu kolom. |
| `sm` | 640 px | Banyak grid menjadi dua kolom; judul membesar. |
| `md` | 768 px | Teks dan foto pendukung hero menjadi dua bagian. |
| `lg` | 1024 px | Navigasi desktop, komposisi 12 kolom, dan sidebar admin. |
| `xl` | 1280 px | Katalog layanan homepage menjadi empat kolom. |

Navigasi desktop baru muncul pada lg agar enam link, wordmark, dan CTA muat. Kartu layanan tetap dua kolom sampai xl. Portfolio homepage memakai grid 1 / 2 / 3 kolom; halaman portfolio dan daftar artikel memakai CSS multi-column 1 / 2 / 3 kolom, sehingga urutan bacanya berjalan ke bawah kolom terlebih dahulu.

Header sticky setinggi 80 px. Section ber-ID memiliki `scroll-margin-top: 6rem` agar target anchor tidak tertutup header. Tabel admin menggunakan scroll horizontal di wrapper lokal, bukan pada seluruh halaman.

## Bentuk, border, dan bayangan

- Kartu utama dan bingkai foto: `rounded-3xl` (24 px).
- Kartu sekunder dan sebagian panel: `rounded-2xl` (16 px).
- Input dan tombol form: `rounded-xl` (12 px).
- Kontrol admin: sering memakai `rounded-lg` (8 px).
- CTA marketing: sering memakai `rounded-full`; chip kategori kecil biasanya hanya `rounded`.

Border 2 px hitam dipakai pada elemen unggulan. Border 1 px netral memisahkan konten pendukung; pada section gelap digunakan border putih transparan.

Bayangan solid yang berulang: 2 px untuk chip, 3 px untuk tombol, 4–6 px untuk panel atau kartu, dan 8 px untuk foto atau artikel unggulan. Contoh tombol: `shadow-[3px_3px_0px_#0D0F12]`. Tombol gelap di hero memakai bayangan lime; beberapa CTA pada bidang gelap memakai bayangan putih. Bayangan lembut tetap dipakai pada dialog dan kartu sekunder.

## Komponen yang digunakan ulang

| Komponen | Tampilan dan perilaku |
| --- | --- |
| [`Header`](src/components/Header.astro) | Sticky, putih transparan dengan blur, logo bitmap dan wordmark, navigasi uppercase, CTA ke `/contact`. Menu mobile memakai `<details>` dan dapat ditutup dengan Escape atau klik di luar. |
| [`PageHeader`](src/components/PageHeader.astro) | Background grid tipis, eyebrow lime, H1 besar, lead opsional, serta slot untuk tambahan halaman. |
| [`Footer`](src/components/Footer.astro) | Bidang gelap, wordmark, navigasi, kontak, dan link legal; komposisi desktop 6 / 3 / 3 kolom. |
| [`ProjectCard`](src/components/ProjectCard.astro) | Border hitam, bayangan solid, cover, judul, dan metadata. Tombol overlay membuka detail berdasarkan ID proyek. Varian grid memakai cover 16:10; masonry mempertahankan rasio gambar. |
| [`PortfolioModal`](src/components/PortfolioModal.astro) | Native `<dialog>`, maksimum `max-w-3xl`, tinggi maksimum 90vh, scroll internal, detail proyek dan CTA diskusi. |
| [`ConsultModal`](src/components/ConsultModal.astro) | Native `<dialog>`, maksimum `max-w-md`, judul mengikuti trigger `data-open-modal`, berisi form kontak ringkas. |
| [`ContactForm`](src/components/ContactForm.astro) | Nama, nomor WhatsApp/telepon, email, dan kebutuhan proyek. Label terlihat, input abu-abu muda, tombol lime selebar form. POST biasa ke `/api/contact`, tersedia juga di halaman kontak. |
| [`FormStatus`](src/components/FormStatus.astro) | Banner hasil redirect: sukses lime; kesalahan putih dengan border tegas. Menggunakan `role="status"` dan `aria-live="polite"`. |
| [`ClientChip`](src/components/ClientChip.astro) / [`ClientBadge`](src/components/ClientBadge.astro) | Presentasi identitas klien pada daftar partner dan detail proyek. Gunakan data klien dari CMS. |
| [`Faq`](src/components/sections/Faq.astro) | Accordion native `<details>` dengan garis pemisah; ikon plus berputar ketika terbuka. |
| [`Process`](src/components/sections/Process.astro) | Lima langkah bernomor, vertikal pada mobile dan horizontal pada lg. Dipakai di halaman layanan. |

Dialog memakai backdrop hitam transparan dan blur. Native `showModal()` menyediakan focus trapping dan Escape; script menambahkan trigger, tombol tutup, serta penutupan melalui backdrop. Form kontak tetap dapat dipakai di `/contact` tanpa JavaScript; pembukaan dialog membutuhkan JavaScript.

## Komposisi halaman

Urutan homepage berasal dari [`src/pages/index.astro`](src/pages/index.astro):

1. Hero putih dengan grid tipis: headline, dua CTA, dan foto pendukung.
2. Marquee lime yang sedikit miring: daftar bidang layanan.
3. Banner hasil form, hanya ketika ada status.
4. Services gelap: empat kelompok layanan.
5. Clients putih: partner aktif dari CMS.
6. About abu-abu muda: pengenalan dan daftar cakupan layanan.
7. Portfolio putih: pekerjaan terpilih dalam grid.
8. Why Choose Us abu-abu muda: alasan memilih tim dalam kartu bernomor.
9. Partnership gelap: penawaran kerja sama dan kategori partner.
10. Articles putih: satu artikel utama dan daftar artikel pendukung.
11. Footer gelap dari `BaseLayout`.

Navigasi publik saat ini: `/`, `/services`, `/portfolio`, `/about`, `/articles`, dan `/contact`. Halaman legal berada di `/privacy-policy` dan `/terms-and-conditions`; artikel detail di `/articles/[slug]`.

Halaman dalam umumnya memakai `PageHeader`, konten utama, dan CTA penutup gelap. Artikel detail menggunakan header editorial sendiri, cover opsional, lalu isi dengan kolom baca sempit. Legal memakai `LegalLayout` dan gaya prose khusus.

Clients, portfolio, dan articles di homepage tidak tampil ketika datanya kosong. Halaman daftar portfolio dan artikel tetap menampilkan pesan kosong. Daftar klien di bawah delapan item berupa susunan statis yang membungkus; mulai delapan item memakai marquee.

## Admin

[`AdminLayout`](src/layouts/AdminLayout.astro) memakai token dan stylesheet yang sama, dengan tampilan lebih padat. Background abu-abu muda, sidebar gelap selebar 15 rem pada lg, header putih dengan border bawah hitam, dan item navigasi aktif berwarna lime.

Navigasinya mencakup Dasbor, Leads, Artikel, Klien, dan Portofolio. Login memakai varian `bare` dengan form terpusat dan lebar maksimum `max-w-sm`. Bahasa shell publik adalah Inggris (`lang="en"`); shell admin memakai Indonesia (`lang="id"`).

Tabel dan form memakai panel putih, border hitam, serta radius yang lebih kecil daripada kartu marketing. Pertahankan pesan kosong, feedback validasi, status publikasi, dan pagination yang sudah tersedia. Alur mutasi utama memakai form POST melalui Astro Actions; jangan menambah kebutuhan state client hanya untuk mengirim form.

## Gambar dan ikon

Logo header memakai `/logo-mark.png`. Gunakan aset yang tersedia, termasuk wordmark dengan titik lime, ketika menambah penempatan brand.

Gambar statis di [`src/assets/images/manifest.ts`](src/assets/images/manifest.ts) dirender melalui `Picture` dari `astro:assets`, dengan varian AVIF/WebP. Hero memakai eager loading dan fetch priority tinggi; gambar pendukung umumnya lazy. Gambar hasil upload CMS memakai [`ContentImage`](src/components/ContentImage.astro), yang menyediakan `srcset`, `sizes`, dan dimensi dari varian upload.

Foto lokal tercatat sebagai stock placeholder di [`CREDITS.md`](src/assets/images/CREDITS.md). Perlakukan foto sebagai ilustrasi sampai pemilik menyediakan dokumentasi asli tim atau pekerjaan. Pertahankan alt text, dimensi gambar, dan label `Concept Project` untuk proyek berstatus konsep.

Ikon berasal dari `@lucide/astro`, umumnya berukuran 14–24 px dengan stroke sekitar 2–2,5. Ikon panah menandai tindakan atau navigasi; check dipakai pada cakupan dan deliverable. Ikon dekoratif disembunyikan dari pembaca layar.

## Gerak dan interaksi

Gerak yang tersedia berupa hover warna/border, pergeseran tombol kecil, kartu naik 4 px, gambar membesar ke 105%, rotasi ikon accordion, pulse indikator hero, dan marquee linear 22 detik. Tidak ada parallax atau rangkaian scroll reveal di implementasi yang dibaca.

Gunakan transisi untuk memperjelas interaksi dan pertahankan aturan `prefers-reduced-motion` di stylesheet global. Aturan tersebut menonaktifkan smooth scrolling serta mempersingkat animasi dan transisi. Jangan memindahkan informasi penting ke dalam animasi saja.

## Aturan saat melanjutkan desain

- Pakai layout dan komponen bersama sebelum membuat variasi baru.
- Ambil identitas perusahaan dan kontak dari `src/data/site.ts`, layanan dari `src/data/services.ts`, serta artikel, klien, dan proyek dari alur CMS yang sudah ada.
- Pertahankan fokus yang terlihat, label form, nama aksesibel tombol ikon, skip link, dan urutan heading. Hover perlu memiliki padanan yang bisa digunakan dengan keyboard.
- CTA harus menuju halaman, membuka dialog, atau mengirim form yang sesuai dengan labelnya.
- Tampilkan pesan yang membantu pada kondisi kosong atau gagal. Form sekarang mengikuti siklus POST dan redirect; belum ada indikator loading client khusus.
- Pisahkan proyek konsep dari pekerjaan selesai melalui label yang tersedia. Statistik, testimoni, dan klaim klien memerlukan sumber dari pemilik konten.
- Periksa mobile sebelum memperbanyak kolom atau link navigasi. Teks panjang, email, dan tabel harus tetap berada dalam container.
- Untuk artikel dan legal, utamakan keterbacaan paragraf dengan gaya prose yang sudah tersedia.

## Batas pemeriksaan

Dokumen ini disusun dari source code. Token, rute, urutan section, dan perilaku yang dijelaskan dicocokkan dengan implementasi pada commit di atas. Tampilan browser, kontras seluruh kombinasi warna, dan interaksi runtime belum diuji dalam pekerjaan dokumentasi ini; dokumen ini tidak menyatakan bahwa UI sudah lulus audit aksesibilitas.
