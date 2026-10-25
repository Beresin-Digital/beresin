/**
 * The five-step engagement flow shown on /services.
 *
 * Kept as data rather than markup so the numbering and the connector layout in
 * `Process.astro` can stay generic — reorder or add a step here and the section
 * follows, including the "01/02/03" numerals.
 *
 * Each step carries an `output` line: the concrete artefact the client has in
 * hand when that step closes. It is what turns a generic agency flowchart into
 * something a client can point at.
 */
import type { Locale } from '../i18n';

export interface ProcessStep {
  title: string;
  description: string;
  /** What the client receives at the end of this step. */
  output: string;
}

export const processSteps: Record<Locale, ProcessStep[]> = {
  en: [
    {
      title: 'Discussion & Mapping',
      description:
        'We listen first: who the users are, how the business process runs, and which part hurts the most today. No template is forced on you.',
      output: 'Needs summary & priority list',
    },
    {
      title: 'Proposal & Scope',
      description:
        'The scope, the sequence of work, and the cost breakdown are put in writing — so there are no surprises midway or at handover.',
      output: 'Proposal & formal quote',
    },
    {
      title: 'Design & Prototype',
      description:
        'Flows and screens are designed and approved first, before a line of code is written. You can try the prototype and give feedback at this stage.',
      output: 'Clickable prototype',
    },
    {
      title: 'Development & Testing',
      description:
        'The system is built in stages on a staging environment you can access, tested across screen sizes, and reviewed together before going live.',
      output: 'Testable build & staging access',
    },
    {
      title: 'Launch & Maintenance',
      description:
        'The system is deployed to production, your team is trained to use it, and the documentation is handed over. Ongoing support is available if you need it.',
      output: 'Live system, docs & training',
    },
  ],
  id: [
    {
      title: 'Diskusi & Pemetaan',
      description:
        'Kami mendengarkan dulu: siapa penggunanya, bagaimana proses bisnis berjalan, dan bagian mana yang paling bermasalah hari ini. Tidak ada template yang dipaksakan kepada Anda.',
      output: 'Ringkasan kebutuhan & daftar prioritas',
    },
    {
      title: 'Proposal & Ruang Lingkup',
      description:
        'Ruang lingkup, urutan pekerjaan, dan rincian biaya dituangkan secara tertulis, sehingga tidak ada kejutan di tengah jalan maupun saat serah terima.',
      output: 'Proposal & penawaran resmi',
    },
    {
      title: 'Desain & Prototipe',
      description:
        'Alur dan layar dirancang dan disetujui dulu, sebelum satu baris kode pun ditulis. Anda bisa mencoba prototipenya dan memberi masukan pada tahap ini.',
      output: 'Prototipe yang bisa diklik',
    },
    {
      title: 'Pengembangan & Pengujian',
      description:
        'Sistem dibangun bertahap di lingkungan staging yang bisa Anda akses, diuji di berbagai ukuran layar, dan ditinjau bersama sebelum tayang.',
      output: 'Build yang bisa diuji & akses staging',
    },
    {
      title: 'Peluncuran & Pemeliharaan',
      description:
        'Sistem dideploy ke production, tim Anda dilatih untuk menggunakannya, dan dokumentasi diserahkan. Dukungan lanjutan tersedia jika Anda membutuhkannya.',
      output: 'Sistem live, dokumen & pelatihan',
    },
  ],
};
