import React from 'react';
import { Download, ShieldAlert } from 'lucide-react';
import { Application, Job } from '../../types/recruitment';
import { exportApplicationsToCsv } from '../../services/exportService';
import { logAudit } from '../../services/auditService';

interface HrdReportsTabProps {
  applications: Application[];
  jobs: Job[];
  currentUserEmail?: string;
}

export const HrdReportsTab: React.FC<HrdReportsTabProps> = ({
  applications,
  jobs,
  currentUserEmail,
}) => {
  const total = applications.length;
  const hired = applications.filter(a => a.stage === 'Hired').length;
  const inInterview = applications.filter(a => ['Interview', 'User Interview'].includes(a.stage)).length;
  const conversionRate = total > 0 ? ((hired / total) * 100).toFixed(1) : '0';

  const handleExportCsv = async () => {
    try {
      exportApplicationsToCsv(applications);
      await logAudit(
        'EXPORT_CSV',
        `Mengekspor ${applications.length} data pelamar ke file CSV aman dengan proteksi formula injection`,
        '',
        currentUserEmail
      );
    } catch (err) {
      console.error('Gagal mengekspor data:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Laporan & Ekspor Data Rekrutmen</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Analisis metrik konversi dan unduh rekap data pelamar dalam format CSV terproteksi.
          </p>
        </div>
        <button
          onClick={handleExportCsv}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Ekspor Data ke CSV (Aman Formula)</span>
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Rasio Pelamar Diterima
          </span>
          <p className="text-3xl font-extrabold text-emerald-600">{conversionRate}%</p>
          <span className="text-[11px] text-slate-400">
            {hired} diterima dari {total} total pelamar masuk
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Rasio Menuju Wawancara
          </span>
          <p className="text-3xl font-extrabold text-blue-600">
            {total > 0 ? (((inInterview + hired) / total) * 100).toFixed(1) : 0}%
          </p>
          <span className="text-[11px] text-slate-400">
            Kandidat berhasil lolos tahap screening awal
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Posisi Terbuka Aktif
          </span>
          <p className="text-3xl font-extrabold text-indigo-600">
            {jobs.filter(j => j.status === 'published').length}
          </p>
          <span className="text-[11px] text-slate-400">Dari {jobs.length} total posisi terdaftar</span>
        </div>
      </div>

      {/* Security Note on CSV Injection */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-start gap-3 text-xs text-slate-600">
        <ShieldAlert className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-slate-900">Perlindungan dari CSV Formula Injection (CWE-1236)</p>
          <p className="text-[11px] leading-relaxed">
            Berkas ekspor CSV yang dihasilkan telah melalui pembersihan otomatis: seluruh nilai yang berawalan dengan simbol formula (seperti <code>=</code>, <code>+</code>, <code>-</code>, <code>@</code>) secara otomatis diberi prefiks kutip tunggal <code>'</code> untuk mencegah eksekusi kode berbahaya pada software spreadsheet Anda. CV teks rahasia dan kredensial sistem tidak diikutsertakan.
          </p>
        </div>
      </div>
    </div>
  );
};
