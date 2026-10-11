export const educationLevels = ['Adi Widyalaya', 'KB', 'Kursus', 'MA', 'MAK', 'MI', 'MTs', 'PAUDQ', 'PDF Ulya', 'PDF Wustha', 'PKBM', 'Pondok Pesantren', 'Pratama Widyalaya', 'RA', 'SD', 'SDTK', 'SLB', 'SMA', 'SMAg.K', 'SMK', 'SMP', 'SMPTK', 'SMTK', 'SPK SD', 'SPK SMA', 'SPK SMP', 'SPK TK', 'SPM Ulya', 'SPM Wustha', 'SPS', 'TK', 'TPA', 'Taman Seminari'];

export function validDate(value: unknown): boolean {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
}

export function clean(value: unknown): string | undefined {
  if (value == null) return undefined;
  const text = String(value).replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim();
  return !text || /^(?:-|null|undefined|n\/a|tidak tersedia)$/i.test(text) ? undefined : text;
}

export function safeWebsite(value: unknown): string | undefined {
  const text = clean(value);
  if (!text || /\s/.test(text) || text.startsWith('/') || text.includes('\\')) return undefined;
  try {
    const url = new URL(/^[a-z][a-z\d+.-]*:/i.test(text) ? text : `https://${text}`);
    if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password || !/^(?:[a-z\d](?:[a-z\d-]*[a-z\d])?\.)+[a-z]{2,}$/i.test(url.hostname)) return undefined;
    return url.href;
  } catch {
    return undefined;
  }
}

export function safeEmail(value: unknown): string | undefined {
  const text = clean(value);
  return text && /^[a-z\d.!#$%&'*+/=?^_`{|}~-]+@[a-z\d](?:[a-z\d.-]*[a-z\d])?\.[a-z]{2,}$/i.test(text) && !text.includes('..') ? text : undefined;
}

export function safePhone(value: unknown): string | undefined {
  const text = clean(value);
  if (!text || !/^\+?[\d ().-]+$/.test(text)) return undefined;
  const digits = text.replace(/\D/g, '');
  if (digits.length < 8 || digits.length > 15) return undefined;
  if (digits.startsWith('0')) return `+62${digits.slice(1)}`;
  return digits.startsWith('62') ? `+${digits}` : undefined;
}

export function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let row: string[] = [], field = '', quoted = false, endedQuote = false;
  const input = text.replace(/^\uFEFF/, '');
  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (quoted) {
      if (ch === '"' && input[i + 1] === '"') { field += '"'; i++; }
      else if (ch === '"') { quoted = false; endedQuote = true; }
      else field += ch;
    } else if (ch === '"') {
      if (field || endedQuote) throw new Error('CSV: kutipan tidak valid');
      quoted = true;
    } else if (ch === ',' || ch === '\n' || ch === '\r') {
      row.push(field); field = ''; endedQuote = false;
      if (ch !== ',') {
        if (ch === '\r' && input[i + 1] === '\n') i++;
        if (row.some(value => value !== '')) rows.push(row);
        row = [];
      }
    } else {
      if (endedQuote) throw new Error('CSV: karakter setelah penutup kutipan');
      field += ch;
    }
  }
  if (quoted) throw new Error('CSV: kutipan belum ditutup');
  if (field || row.length || endedQuote) { row.push(field); rows.push(row); }
  const header = rows.shift();
  if (!header || new Set(header).size !== header.length || header.some(key => !key.trim())) throw new Error('CSV: header kosong atau duplikat');
  for (const key of ['npsn', 'nama', 'bentuk_pendidikan', 'kabupaten']) {
    if (!header.includes(key)) throw new Error(`CSV: kolom wajib tidak ditemukan: ${key}`);
  }
  return rows.map((values, i) => {
    if (values.length !== header.length) throw new Error(`CSV: jumlah kolom berbeda pada baris ${i + 2}`);
    return Object.fromEntries(header.map((key, j) => [key, values[j]]));
  });
}
