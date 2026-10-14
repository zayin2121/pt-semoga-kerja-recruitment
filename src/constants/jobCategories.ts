/**
 * Standar Kategori / Departemen Lowongan PT Semoga Kerja
 * Digunakan untuk:
 * 1. Filter pencarian di portal karir kandidat (JobList & CareerHome)
 * 2. Pilihan kategori saat HRD membuat / mengedit loker baru (HrdJobsTab)
 */

export const JOB_CATEGORIES = [
  'Human Resource',
  'Admin',
  'IT',
  'Marketing',
  'Data Analyst',
  'Finance & Accounting',
  'Sales & Bisnis',
  'Desain & Kreatif',
  'Customer Service',
  'Operasional',
  'Legal & Compliance',
  'Logistik & Supply Chain',
] as const;

export type JobCategory = typeof JOB_CATEGORIES[number];

export const JOB_LOCATIONS = [
  'Jakarta Selatan (Hybrid)',
  'Jakarta Pusat (On-site)',
  'Jakarta Barat (On-site)',
  'Jakarta Timur (On-site)',
  'Jakarta Utara (On-site)',
  'Tangerang (Hybrid)',
  'Bekasi (On-site)',
  'Bandung (Hybrid)',
  'Surabaya (Hybrid)',
  'Yogyakarta (Hybrid)',
  'Remote / WFH (Seluruh Indonesia)',
] as const;

/**
 * Smart matching untuk kategori lowongan
 * Menghubungkan variasi penulisan seperti "Human Resource" dengan "HRD" atau "Human Resources",
 * dan "IT" dengan "IT & Software" atau "Information Technology"
 */
export function isDepartmentMatch(jobDept: string | undefined | null, filterDept: string): boolean {
  if (!filterDept || filterDept === 'all' || filterDept === 'Semua') {
    return true;
  }
  if (!jobDept) {
    return false;
  }

  const jd = jobDept.trim().toLowerCase();
  const fd = filterDept.trim().toLowerCase();

  // Exact match
  if (jd === fd) return true;

  // Substring match
  if (jd.includes(fd) || fd.includes(jd)) return true;

  // Aliases mapping
  const aliases: Record<string, string[]> = {
    'human resource': ['hr', 'hrd', 'human resources', 'talent acquisition', 'people', 'hc', 'human capital'],
    'admin': ['administrasi', 'administration', 'administrative', 'perkantoran', 'sekretaris', 'office'],
    'it': ['information technology', 'software', 'developer', 'programmer', 'tech', 'engineer', 'devops', 'web'],
    'marketing': ['pemasaran', 'digital marketing', 'growth', 'brand', 'content', 'seo'],
    'data analyst': ['data', 'analytics', 'data science', 'bi', 'business intelligence', 'analis data'],
    'finance & accounting': ['finance', 'accounting', 'akuntansi', 'keuangan', 'tax', 'perpajakan'],
    'sales & bisnis': ['sales', 'penjualan', 'business development', 'bizdev', 'account executive'],
    'desain & kreatif': ['design', 'desain', 'creative', 'ui/ux', 'graphic', 'multimedia'],
    'customer service': ['cs', 'layanan pelanggan', 'customer support', 'helpdesk', 'client care'],
    'operasional': ['operations', 'ops', 'operation', 'operasional'],
    'legal & compliance': ['legal', 'hukum', 'compliance', 'kepatuhan'],
    'logistik & supply chain': ['logistics', 'logistik', 'supply chain', 'warehouse', 'gudang', 'pengiriman'],
  };

  const aliasList = aliases[fd];
  if (aliasList && aliasList.some(alias => jd.includes(alias))) {
    return true;
  }

  return false;
}
