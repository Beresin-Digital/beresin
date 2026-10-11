import { readFileSync } from 'node:fs';
import { resolve, sep } from 'node:path';
import { clean, educationLevels, parseCsv, safeEmail, safePhone, safeWebsite, validDate } from './normalize.ts';

export const DIRECTORY_PAGE_SIZE = 40;

export interface Dataset {
  id: string;
  file: string;
  format: 'prototype-json' | 'csv';
  province: string;
  provinceSlug: string;
  regency?: string;
  regencySlug?: string;
  schoolStatus?: 'NEGERI' | 'SWASTA' | 'LAINNYA';
  sourceName: string;
  sourceUrl?: string;
  sourceUpdatedAt?: string | null;
  publicationApproved: boolean;
  contactsApproved: boolean;
}

export interface School {
  npsn: string;
  name: string;
  educationLevel: string;
  province: string;
  provinceSlug: string;
  regency: string;
  regencySlug: string;
  district?: string;
  address?: string;
  village?: string;
  postalCode?: string;
  schoolStatus?: string;
  contactsApproved: boolean;
  accreditation?: string;
  foundationName?: string;
  phone?: string;
  email?: string;
  website?: string;
  sourceProfileUrl?: string;
  sourceName: string;
  sourceUpdatedAt?: string;
  path: string;
}

export function normalizeSchool(raw: Record<string, unknown>, dataset: Dataset): School {
  const prototype = dataset.format === 'prototype-json';
  const npsn = clean(raw.npsn)?.toUpperCase();
  const name = clean(raw.nama);
  const level = clean(prototype ? raw.bentuk : raw.bentuk_pendidikan);
  const educationLevel = educationLevels.find(value => value.toLowerCase() === level?.toLowerCase());
  if (!npsn || !/^[A-Z\d]{8}$/.test(npsn) || !name || !educationLevel) throw new Error(`Identitas sekolah tidak valid: ${npsn ?? '(tanpa NPSN)'}`);
  const csvRegency = clean(raw.kabupaten)?.replace(/^Kab\.\s*/i, 'Kabupaten ');
  if (!prototype && dataset.regency && csvRegency?.toLowerCase() !== dataset.regency.toLowerCase()) throw new Error(`Wilayah CSV berbeda dari metadata: ${npsn}`);
  const regency = prototype ? dataset.regency : dataset.regency ?? csvRegency;
  if (!regency || !/^(?:Kabupaten|Kota)\s+\S/.test(regency)) throw new Error(`Wilayah sekolah tidak valid: ${npsn}`);
  const regencySlug = dataset.regencySlug ?? regency.replace(/^(?:Kabupaten|Kota)\s+/, '').normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase().replace(/[^a-z\d]+/g, '-').replace(/^-|-$/g, '');
  if (!/^[a-z\d]+(?:-[a-z\d]+)*$/.test(regencySlug)) throw new Error(`Slug wilayah tidak valid: ${npsn}`);
  return {
    npsn, name, educationLevel,
    province: dataset.province, provinceSlug: dataset.provinceSlug,
    regency, regencySlug,
    district: clean(raw.kecamatan)?.replace(/^Kec\.\s*/i, ''),
    address: clean(prototype ? raw.alamat : raw.alamat_jalan),
    village: clean(raw.dusun), postalCode: clean(raw.kode_pos),
    schoolStatus: dataset.schoolStatus,
    contactsApproved: dataset.contactsApproved === true,
    accreditation: clean(raw.akreditasi), foundationName: clean(raw.yayasan),
    phone: dataset.contactsApproved === true ? safePhone(raw.telepon) : undefined,
    email: dataset.contactsApproved === true ? safeEmail(raw.email) : undefined,
    website: safeWebsite(raw.website),
    sourceProfileUrl: safeWebsite(prototype ? raw.dapodik : raw.profile_url),
    sourceName: dataset.sourceName,
    sourceUpdatedAt: clean(dataset.sourceUpdatedAt),
    path: `/sekolah/${dataset.provinceSlug}/${regencySlug}/${npsn.toLowerCase()}`,
  };
}

export function deduplicate(schools: School[]): { schools: School[]; duplicates: number } {
  const records = new Map<string, School>();
  let duplicates = 0;
  for (const school of schools) {
    const existing = records.get(school.npsn);
    if (existing) {
      if (JSON.stringify(existing) !== JSON.stringify(school)) throw new Error(`NPSN berkonflik: ${school.npsn}`);
      duplicates++;
    } else records.set(school.npsn, school);
  }
  return { schools: [...records.values()].sort((a, b) => a.name.localeCompare(b.name, 'id') || a.npsn.localeCompare(b.npsn)), duplicates };
}

export function applyCorrections(schools: School[], corrections: { npsn: string; reason: string; verifiedAt: string; fields: Record<string, unknown> }[]): number {
  const allowedFields = new Set(['name', 'district', 'address', 'village', 'postalCode', 'accreditation', 'foundationName', 'phone', 'email', 'website']);
  const corrected = new Set<string>();
  for (const correction of corrections) {
    const school = schools.find(value => value.npsn === correction.npsn);
    if (!school || corrected.has(correction.npsn) || !clean(correction.reason) || !validDate(correction.verifiedAt)) throw new Error(`Koreksi tidak valid: ${correction.npsn}`);
    for (const [field, value] of Object.entries(correction.fields)) {
      if (!allowedFields.has(field)) throw new Error(`Field koreksi tidak diizinkan: ${field}`);
      const normalized = field === 'phone' ? safePhone(value) : field === 'email' ? safeEmail(value) : field === 'website' ? safeWebsite(value) : clean(value);
      if ((clean(value) && !normalized) || (field === 'name' && !normalized)) throw new Error(`Nilai koreksi tidak valid: ${correction.npsn}/${field}`);
      if (normalized && ['phone', 'email'].includes(field) && !school.contactsApproved) throw new Error(`Publikasi kontak koreksi belum disetujui: ${correction.npsn}`);
      Object.assign(school, { [field]: normalized });
    }
    corrected.add(school.npsn);
  }
  return corrected.size;
}

export function loadDirectory() {
  const root = resolve('data/directory');
  const datasets: Dataset[] = JSON.parse(readFileSync(resolve(root, 'datasets.json'), 'utf8'));
  if (!datasets.length) throw new Error('Dataset direktori kosong');
  const records: School[] = [];
  const invalidFields: { npsn: string; field: string }[] = [];
  const regions = new Map<string, string>();
  for (const dataset of datasets) {
    if (dataset.publicationApproved !== true) throw new Error(`Publikasi dataset belum disetujui: ${dataset.id}`);
    if (!clean(dataset.province) || !clean(dataset.sourceName) || !['prototype-json', 'csv'].includes(dataset.format)) throw new Error(`Metadata dataset tidak valid: ${dataset.id}`);
    if ((dataset.format === 'prototype-json' || dataset.regency || dataset.regencySlug) && (!clean(dataset.regency) || !clean(dataset.regencySlug))) throw new Error(`Metadata wilayah tidak lengkap: ${dataset.id}`);
    if (dataset.schoolStatus && !['NEGERI', 'SWASTA', 'LAINNYA'].includes(dataset.schoolStatus)) throw new Error(`Status sekolah tidak valid: ${dataset.id}`);
    for (const slug of [dataset.provinceSlug, ...(dataset.regencySlug ? [dataset.regencySlug] : [])]) {
      if (!/^[a-z\d]+(?:-[a-z\d]+)*$/.test(slug)) throw new Error(`Slug wilayah tidak valid: ${slug}`);
    }
    if (dataset.sourceUpdatedAt && !validDate(dataset.sourceUpdatedAt)) throw new Error(`Tanggal sumber tidak valid: ${dataset.id}`);
    if (dataset.sourceUrl && !safeWebsite(dataset.sourceUrl)) throw new Error(`URL sumber tidak valid: ${dataset.id}`);
    const file = resolve(root, dataset.file);
    if (!file.startsWith(root + sep)) throw new Error('Path dataset di luar direktori data');
    const text = readFileSync(file, 'utf8');
    const rows: Record<string, unknown>[] = dataset.format === 'csv' ? parseCsv(text) : JSON.parse(text);
    if (!Array.isArray(rows) || !rows.length) throw new Error(`Dataset tidak berisi record: ${dataset.id}`);
    for (const raw of rows) {
      const school = normalizeSchool(raw, dataset);
      for (const [key, name] of [[school.provinceSlug, school.province], [`${school.provinceSlug}/${school.regencySlug}`, school.regency]]) {
        if (regions.has(key) && regions.get(key) !== name) throw new Error(`Slug wilayah berkonflik: ${key}`);
        regions.set(key, name);
      }
      for (const [field, valid] of [['telepon', safePhone(raw.telepon)], ['email', safeEmail(raw.email)], ['website', safeWebsite(raw.website)]] as const) {
        if (clean(raw[field]) && !valid) invalidFields.push({ npsn: school.npsn, field });
      }
      records.push(school);
    }
  }
  const result = deduplicate(records);
  const corrections: { npsn: string; reason: string; verifiedAt: string; fields: Record<string, unknown> }[] = JSON.parse(readFileSync(resolve(root, 'corrections.json'), 'utf8'));
  const corrected = applyCorrections(result.schools, corrections);
  return { schools: result.schools.sort((a, b) => a.name.localeCompare(b.name, 'id') || a.npsn.localeCompare(b.npsn)), datasets, report: { input: records.length, accepted: result.schools.length, rejected: 0, duplicates: result.duplicates, corrections: corrected, invalidFields } };
}

export const directory = loadDirectory();
export const schools = directory.schools;
export const provinces = [...new Map(schools.map(school => [school.provinceSlug, { slug: school.provinceSlug, name: school.province }])).values()].sort((a, b) => a.name.localeCompare(b.name, 'id'));
export const regencies = [...new Map(schools.map(school => [`${school.provinceSlug}/${school.regencySlug}`, { provinceSlug: school.provinceSlug, province: school.province, slug: school.regencySlug, name: school.regency }])).values()].sort((a, b) => a.province.localeCompare(b.province, 'id') || a.name.localeCompare(b.name, 'id'));

export function sourceLabel(source: Pick<Dataset, 'sourceName' | 'sourceUpdatedAt'>): string {
  const date = source.sourceUpdatedAt && new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(source.sourceUpdatedAt));
  return `${date ? `Data per ${date}` : 'Tanggal pembaruan sumber tidak tersedia'} · Sumber: ${source.sourceName}`;
}

const regionSchools = new Map<string, School[]>();
const levelSchools = new Map<string, School[]>();
for (const school of schools) {
  const region = `${school.provinceSlug}/${school.regencySlug}`;
  for (const [map, key] of [[regionSchools, region], [levelSchools, `${region}/${school.educationLevel}`]] as const) {
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(school);
  }
}

export function relatedSchools(school: School): School[] {
  const region = `${school.provinceSlug}/${school.regencySlug}`;
  const candidates = [...(levelSchools.get(`${region}/${school.educationLevel}`) ?? []).slice(0, 5), ...(regionSchools.get(region) ?? []).slice(0, 5)];
  return [...new Map(candidates.filter(value => value.npsn !== school.npsn).map(value => [value.npsn, value])).values()].slice(0, 4);
}

export function regionPath(province: string, regency?: string): string {
  return `/sekolah/${province}${regency ? `/${regency}` : ''}`;
}

export function listingPath(province: string, regency: string, page = 1): string {
  return `${regionPath(province, regency)}${page > 1 ? `/halaman/${page}` : ''}`;
}

export function searchRecords(province?: string, regency?: string) {
  return schools.filter(school => (!province || school.provinceSlug === province) && (!regency || school.regencySlug === regency)).map(({ npsn, name, educationLevel, province, regency, district, path }) => ({ npsn, name, educationLevel, province, regency, district, path }));
}

export const directoryPaths = [
  '/sekolah', '/sekolah/tentang-data',
  ...provinces.map(province => regionPath(province.slug)),
  ...regencies.flatMap(regency => Array.from({ length: Math.ceil(schools.filter(school => school.provinceSlug === regency.provinceSlug && school.regencySlug === regency.slug).length / DIRECTORY_PAGE_SIZE) }, (_, i) => listingPath(regency.provinceSlug, regency.slug, i + 1))),
  ...schools.map(school => school.path),
];
