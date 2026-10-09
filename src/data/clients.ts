/**
 * PLACEHOLDER client list for the marquee.
 *
 * ⚠️ These are deliberately generic descriptors, NOT real company names.
 * The original mockup listed real, identifiable entities (bank and energy
 * SOEs, a provincial government, named foundations). Claiming those as clients
 * without contracts or written permission is misleading advertising under
 * UU 8/1999 and a real procurement/legal risk for a PT.
 *
 * Real clients get added through the admin panel in Phase 4, where each row
 * carries `is_active` and `is_real_engagement` flags so anything unverified can
 * be switched off instantly without a deploy. Until then this static list is the
 * fallback the homepage renders.
 */
import type { ImageMetadata } from 'astro';

export interface ClientBadge {
  name: string;
  category: string;
  /** lucide icon name, used when no uploaded logo exists yet. */
  icon: string;
  /** Set once a real logo has been uploaded through the admin panel. */
  logo?: ImageMetadata;
}

export const placeholderClients: ClientBadge[] = [
  { name: 'Perusahaan Manufaktur Nasional', category: 'Enterprise', icon: 'building-2' },
  { name: 'Yayasan Pendidikan Terpadu', category: 'SIAKAD Sekolah', icon: 'graduation-cap' },
  { name: 'Dinas Komunikasi & Informatika', category: 'E-Government', icon: 'landmark' },
  { name: 'Perusahaan Logistik Nasional', category: 'Logistics System', icon: 'briefcase' },
  { name: 'Sekolah Swasta Terpadu', category: 'Parent Mobile App', icon: 'school' },
  { name: 'BUMN Sektor Energi', category: 'Internal Portal', icon: 'shield-check' },
  { name: 'Pemerintah Provinsi', category: 'Public Portal', icon: 'globe' },
  { name: 'Bank Pembangunan Daerah', category: 'Microsite UI', icon: 'credit-card' },
];
