import { Application } from '../types/recruitment';

/**
 * Escapes and sanitizes a cell value to prevent CSV Formula Injection (CWE-1236)
 */
function sanitizeCsvCell(value: any): string {
  if (value === null || value === undefined) return '""';
  let str = String(value).trim();
  // Guard against CSV formula injection prefixes: =, +, -, @, \t, \r
  if (/^[=+\-@\t\r]/.test(str)) {
    str = "'" + str;
  }
  // Double quotes inside string
  const escaped = str.replace(/"/g, '""');
  return `"${escaped}"`;
}

/**
 * Exports candidate applications to CSV safely
 */
export function exportApplicationsToCsv(applications: Application[], filename = 'rekap_pelamar_pt_semoga_kerja.csv'): void {
  const headers = [
    'No. Referensi',
    'Posisi Lowongan',
    'Nama Lengkap',
    'Email',
    'Nomor WhatsApp',
    'Domisili',
    'Pendidikan Terakhir',
    'Jurusan',
    'Keahlian',
    'Tahap Seleksi',
    'Skor Screening CV',
    'Kesesuaian Wajib',
    'Tanggal Melamar',
    'Tipe Data',
  ];

  const rows = applications.map(app => [
    sanitizeCsvCell(app.referenceNumber),
    sanitizeCsvCell(app.jobTitle),
    sanitizeCsvCell(app.fullName),
    sanitizeCsvCell(app.email),
    sanitizeCsvCell(app.phone),
    sanitizeCsvCell(app.domicile),
    sanitizeCsvCell(app.educationLevel),
    sanitizeCsvCell(app.major),
    sanitizeCsvCell(app.skills?.join(', ') || ''),
    sanitizeCsvCell(app.stage),
    sanitizeCsvCell(app.screeningResult ? `${app.screeningResult.score}%` : 'Belum Diproses'),
    sanitizeCsvCell(app.screeningResult ? (app.screeningResult.passedMandatory ? 'Memenuhi' : 'Belum Memenuhi') : '-'),
    sanitizeCsvCell(new Date(app.createdAt).toLocaleDateString('id-ID')),
    sanitizeCsvCell(app.isDemo ? 'DEMO' : 'AKTUAL'),
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
