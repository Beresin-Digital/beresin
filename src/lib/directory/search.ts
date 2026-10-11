export interface SearchRecord {
  npsn: string;
  name: string;
  educationLevel: string;
  province: string;
  regency: string;
  district?: string;
  path: string;
}

export const searchText = (value: string) => value.normalize('NFKD').replace(/\p{M}/gu, '').toLocaleLowerCase('id').replace(/[’'`]/g, '').replace(/\s+/g, ' ').trim();

export function filterSchools(records: SearchRecord[], query: string, level = '', district = ''): SearchRecord[] {
  const words = searchText(query).split(' ').filter(Boolean);
  return records.filter(school => (!level || school.educationLevel === level) && (!district || school.district === district) && words.every(word => searchText(`${school.name} ${school.npsn}`).includes(word)));
}
