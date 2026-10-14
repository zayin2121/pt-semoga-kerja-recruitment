import React, { useState } from 'react';
import {
  FileSearch,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  Scale,
  ShieldAlert,
  Search,
} from 'lucide-react';
import { Application, Job } from '../../types/recruitment';

interface HrdScreeningTabProps {
  applications: Application[];
  jobs: Job[];
  onOpenCandidateDetail: (app: Application) => void;
}

export const HrdScreeningTab: React.FC<HrdScreeningTabProps> = ({
  applications,
  jobs,
  onOpenCandidateDetail,
}) => {
  const [selectedJobId, setSelectedJobId] = useState('all');
  const [search, setSearch] = useState('');

  const filteredApps = applications.filter(app => {
    const matchesJob = selectedJobId === 'all' || app.jobId === selectedJobId;
    const matchesSearch =
      app.fullName.toLowerCase().includes(search.toLowerCase()) ||
      app.referenceNumber.toLowerCase().includes(search.toLowerCase());
    return matchesJob && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
        <div className="flex items-center gap-2">
          <FileSearch className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-bold text-slate-900">Modul Screening CV & Ekstraksi Dokumen</h2>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed max-w-3xl">
          Modul ini memproses berkas CV pelamar (PDF/DOCX) menggunakan ekstraksi teks lokal dan mencocokkannya secara berbobot dengan kualifikasi lowongan kerja tanpa ketergantungan API berbayar.
        </p>
      </div>

      {/* Explanatory Policy Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-xs text-blue-900 space-y-1">
          <div className="flex items-center gap-2 font-bold text-blue-950">
            <Scale className="w-4 h-4 text-blue-700" />
            <span>Bobot Transparan</span>
          </div>
          <p className="text-[11px] leading-relaxed text-blue-800">
            Kualifikasi Wajib memiliki kontribusi bobot <strong>70%</strong>, sedangkan Kualifikasi Tambahan berkontribusi <strong>30%</strong> terhadap total skor kecocokan.
          </p>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 text-xs text-purple-900 space-y-1">
          <div className="flex items-center gap-2 font-bold text-purple-950">
            <Sparkles className="w-4 h-4 text-purple-700" />
            <span>Verifikasi Berbasis Bukti</span>
          </div>
          <p className="text-[11px] leading-relaxed text-purple-800">
            Setiap kualifikasi yang terdeteksi menyertakan potongan cuplikan kalimat asli dari CV. Jika kriteria tidak ada, sistem menandai <em>"Tidak ditemukan dalam dokumen"</em>.
          </p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 space-y-1">
          <div className="flex items-center gap-2 font-bold text-amber-950">
            <ShieldAlert className="w-4 h-4 text-amber-700" />
            <span>Tanpa Penolakan Otomatis</span>
          </div>
          <p className="text-[11px] leading-relaxed text-amber-800">
            Hasil screening semata-mata adalah alat bantu komparasi data. Keputusan penerimaan atau penolakan selalu berada di tangan tim HRD secara manusiawi.
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full sm:max-w-xs">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari kandidat / no referensi..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="w-full sm:w-auto">
          <select
            value={selectedJobId}
            onChange={e => setSelectedJobId(e.target.value)}
            className="w-full sm:w-auto py-2 px-3 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-700"
          >
            <option value="all">Semua Posisi Lowongan</option>
            {jobs.map(j => (
              <option key={j.id} value={j.id}>
                {j.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Candidate Screening Cards */}
      <div className="space-y-4">
        {filteredApps.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400 text-xs">
            Tidak ada data kandidat pada kriteria ini.
          </div>
        ) : (
          filteredApps.map(app => {
            const res = app.screeningResult;
            return (
              <div
                key={app.id}
                className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 hover:border-blue-300 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-sm text-slate-900">{app.fullName}</h3>
                      <span className="text-[11px] font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 font-bold">
                        {app.referenceNumber}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500 block mt-0.5">
                      Posisi: <strong>{app.jobTitle}</strong> • Dokumen: {app.resumeFileName} ({(app.resumeFileSize / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                  <div className="flex items-center gap-3 self-start sm:self-auto">
                    {res ? (
                      <div className="text-right">
                        <span className="text-base sm:text-lg font-black text-blue-700 bg-blue-50 px-3 py-1 rounded-xl border border-blue-200">
                          {res.score}% Match
                        </span>
                        <span className="text-[10px] text-slate-500 block mt-1">
                          Wajib: {res.mandatoryScore}% • Tambahan: {res.optionalScore}%
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">Belum dihitung</span>
                    )}
                  </div>
                </div>

                {/* Evidence List */}
                {res && res.evidence && res.evidence.length > 0 ? (
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                      Rincian Kriteria & Bukti Temuan Teks:
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      {res.evidence.map((ev, i) => (
                        <div
                          key={i}
                          className={`p-3 rounded-xl border text-xs space-y-1 ${
                            ev.isFound
                              ? 'bg-emerald-50/40 border-emerald-200'
                              : 'bg-slate-50 border-slate-200'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                              {ev.isFound ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              ) : (
                                <HelpCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              )}
                              <span>{ev.criterionLabel}</span>
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-white text-slate-600 border border-slate-200 font-medium">
                              {ev.isMandatory ? 'Wajib' : 'Tambahan'}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 italic pl-5">
                            {ev.snippet}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">Tidak ada bukti ekstraksi tersimpan.</p>
                )}

                <div className="flex flex-wrap items-center justify-between pt-2 text-xs text-slate-500 gap-2">
                  <span>
                    Status Ekstraksi:{' '}
                    <strong className="text-slate-700">
                      {res?.extractionStatus === 'clean'
                        ? 'Teks Digital Bersih'
                        : res?.extractionStatus === 'partial'
                        ? 'Teks Parsial'
                        : 'Pemeriksaan Manual'}
                    </strong>
                  </span>
                  <button
                    onClick={() => onOpenCandidateDetail(app)}
                    className="text-blue-600 hover:text-blue-800 font-bold underline cursor-pointer"
                  >
                    Buka Detail Lengkap Pelamar & Ubah Tahap
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
