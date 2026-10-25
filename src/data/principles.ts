/**
 * "Principles & how we work" for /about.
 *
 * Every line here restates something the site already commits to elsewhere —
 * `services.ts` (scope starts from process mapping, not a template), `process.ts`
 * (written scope and cost, accessible staging, training and handover), and
 * `faq.ts` (client owns the code, data stays in Indonesia, no raw IPs stored).
 * That is deliberate: a principles block that invents new promises is just
 * unenforceable marketing. If a principle is added here, it must already be
 * true somewhere else in the codebase.
 */
import type { Locale } from '../i18n';

export interface Principle {
  title: string;
  /** One or two sentences. Concrete, no superlatives. */
  description: string;
}

export const principles: Record<Locale, Principle[]> = {
  en: [
    {
      title: 'We start from your process, not a template',
      description:
        'Every project opens by mapping how you actually work: who uses the system, how the flow runs, and which part hurts the most. What we build follows your business, not the other way around.',
    },
    {
      title: 'Scope and cost in writing up front',
      description:
        'The scope of work, the sequence of stages, and the cost breakdown are put in writing before the project starts, so there are no surprises midway or at handover.',
    },
    {
      title: 'Progress you can see at any time',
      description:
        'Work happens in stages on a staging environment you can access and judge for yourself, rather than being revealed once at the end.',
    },
    {
      title: 'You can run the system yourself',
      description:
        'Admin panels are designed for non-technical staff, and every project closes with training and written documentation, so you are not dependent on us for day-to-day tasks.',
    },
    {
      title: 'The code and assets are yours',
      description:
        'After final payment, all application source code and design assets belong to you outright. We do not hold your system hostage or install hidden license locks.',
    },
    {
      title: 'Your data stays in Indonesia',
      description:
        'Systems and data are stored on servers in the country. We also do not store visitors’ raw IP addresses, only an encrypted form, for security purposes, in line with the data-minimisation principle of the PDP Law.',
    },
  ],
  id: [
    {
      title: 'Kami mulai dari proses Anda, bukan dari template',
      description:
        'Setiap proyek dibuka dengan memetakan cara Anda benar-benar bekerja, siapa yang memakai sistem, bagaimana alurnya berjalan, dan bagian mana yang paling bermasalah. Apa yang kami bangun mengikuti bisnis Anda, bukan sebaliknya.',
    },
    {
      title: 'Ruang lingkup dan biaya tertulis di muka',
      description:
        'Ruang lingkup pekerjaan, urutan tahapan, dan rincian biaya dituangkan secara tertulis sebelum proyek dimulai, sehingga tidak ada kejutan di tengah jalan maupun saat serah terima.',
    },
    {
      title: 'Progres yang bisa Anda lihat kapan saja',
      description:
        'Pekerjaan berjalan bertahap di lingkungan staging yang bisa Anda akses dan nilai sendiri, bukan baru diperlihatkan sekali di akhir.',
    },
    {
      title: 'Anda bisa menjalankan sistem sendiri',
      description:
        'Panel admin dirancang untuk staf non-teknis, dan setiap proyek ditutup dengan pelatihan dan dokumentasi tertulis, sehingga Anda tidak bergantung pada kami untuk tugas sehari-hari.',
    },
    {
      title: 'Kode dan aset adalah milik Anda',
      description:
        'Setelah pembayaran final, seluruh source code aplikasi dan aset desain menjadi milik Anda sepenuhnya. Kami tidak menyandera sistem Anda atau memasang kunci lisensi tersembunyi.',
    },
    {
      title: 'Data Anda tetap di Indonesia',
      description:
        'Sistem dan data disimpan di server dalam negeri. Kami juga tidak menyimpan alamat IP mentah pengunjung, hanya bentuk terenkripsinya, untuk keperluan keamanan, sesuai prinsip minimisasi data dalam UU PDP.',
    },
  ],
};
