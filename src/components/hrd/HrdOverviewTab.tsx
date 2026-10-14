import React from 'react';
import {
  Users,
  Briefcase,
  FileSearch,
  Calendar,
  CheckCircle,
  MailCheck,
  Clock,
  BarChart3,
  Layers,
} from 'lucide-react';
import { Job, Application, InterviewSchedule, EmailDeliveryLog } from '../../types/recruitment';

interface HrdOverviewTabProps {
  jobs: Job[];
  applications: Application[];
  interviews: InterviewSchedule[];
  emailLogs: EmailDeliveryLog[];
  onNavigateTab: (tab: string) => void;
}

export const HrdOverviewTab: React.FC<HrdOverviewTabProps> = ({
  jobs,
  applications,
  interviews,
  emailLogs,
  onNavigateTab,
}) => {
  const publishedJobs = jobs.filter(j => j.status === 'published');
  const totalApps = applications.length;
  const newApps = applications.filter(a => a.stage === 'Applied').length;
  const inReview = applications.filter(a => ['HR Review', 'Assessment', 'User Interview'].includes(a.stage)).length;
  const inInterview = applications.filter(a => a.stage === 'Interview').length;
  const inOffer = applications.filter(a => a.stage === 'Offer').length;
  const hiredCount = applications.filter(a => a.stage === 'Hired').length;
  const emailsSent = emailLogs.filter(e => e.status === 'sent').length;
  const emailsPending = emailLogs.filter(e => e.status === 'pending').length;
  const emailsFailed = emailLogs.filter(e => e.status === 'failed').length;

  const funnelStages = [
    { label: '1. Masuk (Applied)', count: totalApps, color: 'bg-blue-600' },
    { label: '2. Screening CV', count: applications.filter(a => a.stage !== 'Applied').length, color: 'bg-indigo-600' },
    { label: '3. Interview & Review', count: applications.filter(a => ['HR Review', 'Interview', 'Assessment', 'User Interview', 'Offer', 'Hired'].includes(a.stage)).length, color: 'bg-purple-600' },
    { label: '4. Offer & Diterima', count: inOffer + hiredCount, color: 'bg-emerald-600' },
    { label: '5. Diterima (Hired)', count: hiredCount, color: 'bg-teal-600' },
  ];

  const candidatesPerJob: { [jobTitle: string]: number } = {};
  applications.forEach(a => {
    candidatesPerJob[a.jobTitle] = (candidatesPerJob[a.jobTitle] || 0) + 1;
  });

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Top Welcome & Summary Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
            Ringkasan Operasional Rekrutmen
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Data aktual real-time dari sistem database terenkripsi PT Semoga Kerja.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onNavigateTab('jobs')}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Kelola Lowongan</span>
          </button>
          <button
            onClick={() => onNavigateTab('pipeline')}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Buka Pipeline ATS</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid - Responsive columns */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Lamaran</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{totalApps}</p>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Semua berkas</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Lamaran Baru</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-600">{newApps}</p>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Tahap Applied</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Dalam Seleksi</span>
            <FileSearch className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-black text-purple-600">{inReview + inInterview}</p>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Review & Wawancara</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Jadwal Sesi</span>
            <Calendar className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-black text-indigo-600">{interviews.length}</p>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Teragendakan</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Diterima</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-600">{hiredCount}</p>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Tahap Hired</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Lowongan Buka</span>
            <Briefcase className="w-4 h-4 text-blue-700" />
          </div>
          <p className="text-2xl font-black text-blue-700">{publishedJobs.length}</p>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Dari {jobs.length} total</span>
        </div>
      </div>

      {/* Email Delivery Statistics Strip */}
      <div className="bg-slate-900 text-white p-4 sm:p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0">
            <MailCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white">Status Pengiriman Email Konfirmasi (Gmail API)</h3>
            <p className="text-xs text-slate-400">Otomasi notifikasi tanda terima resmi lamaran</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <span>Terkirim: <strong>{emailsSent}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
            <span>Tertunda: <strong>{emailsPending}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span>
            <span>Gagal: <strong>{emailsFailed}</strong></span>
          </div>
          <button
            onClick={() => onNavigateTab('gmail')}
            className="text-blue-400 hover:text-blue-300 font-bold underline ml-1 cursor-pointer"
          >
            Lihat Log
          </button>
        </div>
      </div>

      {/* Funnel & Candidate Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Recruitment Funnel */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              <h3 className="font-bold text-sm text-slate-900">Funnel Rekrutmen Aktual</h3>
            </div>
            <span className="text-[11px] text-slate-400">Konversi Pelamar</span>
          </div>
          <div className="space-y-3 pt-1">
            {funnelStages.map(stage => {
              const percentage = totalApps > 0 ? Math.round((stage.count / totalApps) * 100) : 0;
              return (
                <div key={stage.label} className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span>{stage.label}</span>
                    <span className="font-bold text-slate-900">
                      {stage.count} ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${stage.color}`}
                      style={{ width: `${Math.max(percentage, totalApps > 0 && stage.count > 0 ? 5 : 0)}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Distribution by Position */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-600" />
              <h3 className="font-bold text-sm text-slate-900">Distribusi Pelamar per Posisi</h3>
            </div>
            <span className="text-[11px] text-slate-400">{Object.keys(candidatesPerJob).length} Posisi</span>
          </div>
          <div className="space-y-3 pt-1">
            {Object.entries(candidatesPerJob).length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">Belum ada data pelamar.</p>
            ) : (
              Object.entries(candidatesPerJob).map(([title, count]) => {
                const pct = totalApps > 0 ? Math.round((count / totalApps) * 100) : 0;
                return (
                  <div key={title} className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-slate-700">
                      <span className="font-medium truncate max-w-[200px]">{title}</span>
                      <span className="font-bold text-slate-900 shrink-0">
                        {count} pelamar ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
