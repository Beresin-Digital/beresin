/**
 * "Prinsip & cara kerja" for /tentang.
 *
 * Every line here restates something the site already commits to elsewhere —
 * `services.ts` (scope starts from process mapping, not a template), `process.ts`
 * (written scope and cost, accessible staging, training and handover), and
 * `faq.ts` (client owns the code, data stays in Indonesia, no raw IPs stored).
 * That is deliberate: a principles block that invents new promises is just
 * unenforceable marketing. If a principle is added here, it must already be
 * true somewhere else in the codebase.
 */
export interface Principle {
  title: string;
  /** One or two sentences. Concrete, no superlatives. */
  description: string;
}

export const principles: Principle[] = [
  {
    title: 'Mulai dari proses Anda, bukan template',
    description:
      'Setiap proyek dibuka dengan memetakan cara kerja Anda — siapa penggunanya, alurnya bagaimana, bagian mana yang paling mengganggu. Sistem yang jadi mengikuti lembaga Anda, bukan sebaliknya.',
  },
  {
    title: 'Ruang lingkup & biaya tertulis di depan',
    description:
      'Cakupan pekerjaan, urutan tahap, dan rincian biaya dituangkan tertulis sebelum proyek dimulai, supaya tidak ada kejutan di tengah jalan maupun saat serah terima.',
  },
  {
    title: 'Progres bisa Anda lihat kapan saja',
    description:
      'Pekerjaan berjalan bertahap di lingkungan staging yang bisa Anda akses dan nilai sendiri, bukan baru diperlihatkan sekali di akhir.',
  },
  {
    title: 'Anda bisa mengelola sistemnya sendiri',
    description:
      'Panel admin dirancang untuk staf non-teknis, dan setiap proyek ditutup dengan pelatihan serta dokumentasi tertulis — supaya Anda tidak bergantung pada kami untuk hal-hal rutin.',
  },
  {
    title: 'Kode dan aset menjadi milik Anda',
    description:
      'Setelah pelunasan, seluruh source code aplikasi dan aset desain menjadi milik Anda sepenuhnya. Kami tidak menahan sistem Anda sebagai sandera atau memasang kunci lisensi tersembunyi.',
  },
  {
    title: 'Data Anda tinggal di Indonesia',
    description:
      'Sistem dan data disimpan di server dalam negeri. Kami juga tidak menyimpan alamat IP mentah pengunjung — hanya bentuk terenkripsinya untuk keperluan keamanan, sesuai prinsip minimalisasi data UU PDP.',
  },
];
