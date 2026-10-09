/**
 * The five-step engagement flow shown on /layanan.
 *
 * Kept as data rather than markup so the numbering and the connector layout in
 * `Process.astro` can stay generic — reorder or add a step here and the section
 * follows, including the "01/02/03" numerals.
 *
 * Each step carries an `output` line: the concrete artefact the client has in
 * hand when that step closes. It is what turns a generic agency flowchart into
 * something a procurement officer can point at.
 */
export interface ProcessStep {
  title: string;
  description: string;
  /** What the client receives at the end of this step. */
  output: string;
}

export const processSteps: ProcessStep[] = [
  {
    title: 'Diskusi & Pemetaan',
    description:
      'Kami dengar dulu: siapa penggunanya, proses bisnisnya bagaimana, dan bagian mana yang paling mengganggu hari ini. Tidak ada template yang dipaksakan.',
    output: 'Catatan kebutuhan & daftar prioritas',
  },
  {
    title: 'Proposal & Ruang Lingkup',
    description:
      'Ruang lingkup, urutan pengerjaan, dan rincian biaya dituangkan tertulis — supaya tidak ada kejutan di tengah jalan maupun saat serah terima.',
    output: 'Proposal & penawaran resmi',
  },
  {
    title: 'Desain & Prototipe',
    description:
      'Alur dan tampilan dirancang dan disetujui lebih dulu, sebelum satu baris kode ditulis. Anda bisa mencoba prototipenya dan memberi masukan di tahap ini.',
    output: 'Prototipe yang bisa diklik',
  },
  {
    title: 'Pengembangan & Pengujian',
    description:
      'Sistem dibangun bertahap di lingkungan staging yang bisa Anda akses, diuji di berbagai ukuran layar, lalu diperiksa bersama sebelum naik ke produksi.',
    output: 'Sistem siap uji & akses staging',
  },
  {
    title: 'Peluncuran & Pemeliharaan',
    description:
      'Sistem dipasang di server produksi, tim Anda dilatih memakainya, dan dokumentasi diserahkan. Dukungan lanjutan tersedia bila dibutuhkan.',
    output: 'Sistem live, dokumentasi & pelatihan',
  },
];
