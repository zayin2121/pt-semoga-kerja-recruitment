import React, { useState, useEffect } from 'react';
import {
  Search,
  CheckCircle2,
  Clock,
  ChevronRight,
  MessageCircle,
  Mail,
  Calendar,
  FileText,
  ChevronLeft,
  X,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { Application, ApplicationStage, Job, StageHistoryEntry } from '../../types/recruitment';
import {
  updateApplicationStage,
  updateApplicationNotes,
  deleteApplication,
  allowCandidateReapply,
} from '../../services/applicationService';
import { logAudit } from '../../services/auditService';

interface HrdPipelineTabProps {
  applications: Application[];
  jobs: Job[];
  onRefreshApplications: () => Promise<void>;
  onScheduleInterview: (app: Application) => void;
  currentUserEmail?: string;
}

const ALL_STAGES: ApplicationStage[] = [
  'Applied',
  'Screening',
  'HR Review',
  'Interview',
  'Assessment',
  'User Interview',
  'Offer',
  'Hired',
  'Rejected',
  'Withdrawn',
  'Talent Pool',
];

export const HrdPipelineTab: React.FC<HrdPipelineTabProps> = ({
  applications,
  jobs,
  onRefreshApplications,
  onScheduleInterview,
  currentUserEmail,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJobId, setSelectedJobId] = useState('all');
  const [selectedStage, setSelectedStage] = useState('all');
  const [scoreFilter, setScoreFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Selected candidate detail drawer
  const [activeCandidate, setActiveCandidate] = useState<Application | null>(null);
  const [newStage, setNewStage] = useState<ApplicationStage>('HR Review');
  const [stageNote, setStageNote] = useState('');
  const [isUpdatingStage, setIsUpdatingStage] = useState(false);
  const [internalNotes, setInternalNotes] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  // Filter logic
  const filteredApps = applications.filter(app => {
    const matchesSearch =
      app.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.skills || []).some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesJob = selectedJobId === 'all' || app.jobId === selectedJobId;
    const matchesStage = selectedStage === 'all' || app.stage === selectedStage;
    let matchesScore = true;
    if (scoreFilter === 'high') {
      matchesScore = (app.screeningResult?.score || 0) >= 80;
    } else if (scoreFilter === 'med') {
      const s = app.screeningResult?.score || 0;
      matchesScore = s >= 60 && s < 80;
    } else if (scoreFilter === 'low') {
      matchesScore = (app.screeningResult?.score || 0) < 60;
    }
    return matchesSearch && matchesJob && matchesStage && matchesScore;
  });

  const totalPages = Math.ceil(filteredApps.length / pageSize) || 1;
  const paginatedApps = filteredApps.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const openCandidateDetail = (app: Application) => {
    setActiveCandidate(app);
    setNewStage(app.stage);
    setStageNote('');
    setInternalNotes(app.internalNotes || '');
  };

  const [actionFeedback, setActionFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (actionFeedback) {
      const timer = setTimeout(() => setActionFeedback(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [actionFeedback]);

  const handleStageChangeSubmit = async () => {
    if (!activeCandidate) return;
    setIsUpdatingStage(true);
    setActionFeedback(null);
    try {
      await updateApplicationStage(
        activeCandidate.id,
        newStage,
        currentUserEmail || 'HR Staff',
        stageNote
      );
      await logAudit(
        'CHANGE_STAGE',
        `Memindahkan tahap ${activeCandidate.fullName} dari ${activeCandidate.stage} ke ${newStage}. Catatan: ${stageNote || '-'}`,
        activeCandidate.id,
        currentUserEmail
      );
      await onRefreshApplications();
      const updatedEntry: StageHistoryEntry = {
        fromStage: activeCandidate.stage,
        toStage: newStage,
        timestamp: new Date().toISOString(),
        changedBy: currentUserEmail || 'HR Staff',
        note: stageNote || undefined,
      };
      setActiveCandidate({
        ...activeCandidate,
        stage: newStage,
        stageHistory: [...(activeCandidate.stageHistory || []), updatedEntry],
      });
      setStageNote('');
      setActionFeedback({ message: `Tahapan kandidat berhasil diubah ke "${newStage}".`, type: 'success' });
    } catch (err) {
      setActionFeedback({ message: 'Gagal memperbarui tahapan kandidat.', type: 'error' });
    } finally {
      setIsUpdatingStage(false);
    }
  };

  const handleSaveInternalNotes = async () => {
    if (!activeCandidate) return;
    setIsSavingNotes(true);
    setActionFeedback(null);
    try {
      await updateApplicationNotes(activeCandidate.id, internalNotes);
      await logAudit('UPDATE_NOTES', `Memperbarui catatan internal kandidat ${activeCandidate.fullName}`, activeCandidate.id, currentUserEmail);
      await onRefreshApplications();
      setActiveCandidate({
        ...activeCandidate,
        internalNotes,
      });
      setActionFeedback({ message: 'Catatan internal berhasil disimpan.', type: 'success' });
    } catch (err) {
      setActionFeedback({ message: 'Gagal menyimpan catatan internal.', type: 'error' });
    } finally {
      setIsSavingNotes(false);
    }
  };

  const handleDeleteCandidate = async () => {
    if (!activeCandidate) return;
    setActionFeedback(null);
    try {
      await deleteApplication(activeCandidate.id);
      await logAudit('DELETE_APPLICATION', `Menghapus berkas lamaran ${activeCandidate.fullName}`, activeCandidate.id, currentUserEmail);
      await onRefreshApplications();
      setActiveCandidate(null);
    } catch (err) {
      setActionFeedback({ message: 'Gagal menghapus data.', type: 'error' });
    }
  };

  const handleToggleAllowReapply = async () => {
    if (!activeCandidate) return;
    const nextState = !activeCandidate.allowReapply;
    setActionFeedback(null);
    try {
      await allowCandidateReapply(activeCandidate.id, nextState);
      await logAudit(
        'ALLOW_REAPPLY_OVERRIDE',
        `${nextState ? 'Memberikan' : 'Mencabut'} izin lamaran ulang untuk ${activeCandidate.fullName} (${activeCandidate.jobTitle})`,
        activeCandidate.id,
        currentUserEmail
      );
      await onRefreshApplications();
      setActiveCandidate({
        ...activeCandidate,
        allowReapply: nextState,
      });
      setActionFeedback({
        message: `Izin lamaran ulang berhasil ${nextState ? 'diberikan' : 'dicabut'}.`,
        type: 'success',
      });
    } catch (err) {
      setActionFeedback({ message: 'Gagal mengubah izin lamaran ulang.', type: 'error' });
    }
  };

  const getStageBadgeColor = (stage: string) => {
    switch (stage) {
      case 'Applied':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Screening':
      case 'HR Review':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Interview':
      case 'Assessment':
      case 'User Interview':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Offer':
      case 'Hired':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Rejected':
        return 'bg-slate-100 text-slate-600 border-slate-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Pipeline Rekrutmen & Manajemen Pelamar</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Lacak pergerakan kandidat pada 10 tahapan seleksi rekrutmen PT Semoga Kerja secara terpusat.
          </p>
        </div>
        <div className="text-xs text-slate-600 font-medium">
          Total Pelamar: <strong className="text-slate-900">{filteredApps.length}</strong> orang
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama, email, no referensi..."
              value={searchTerm}
              onChange={e => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <select
              value={selectedJobId}
              onChange={e => {
                setSelectedJobId(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-2 px-3 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-700"
            >
              <option value="all">Semua Posisi Pekerjaan</option>
              {jobs.map(j => (
                <option key={j.id} value={j.id}>
                  {j.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedStage}
              onChange={e => {
                setSelectedStage(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-2 px-3 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-700"
            >
              <option value="all">Semua Tahap Seleksi</option>
              {ALL_STAGES.map(s => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={scoreFilter}
              onChange={e => {
                setScoreFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-2 px-3 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-700"
            >
              <option value="all">Semua Skor Screening</option>
              <option value="high">Sangat Cocok (≥ 80%)</option>
              <option value="med">Cukup Cocok (60% - 79%)</option>
              <option value="low">Perlu Evaluasi (&lt; 60%)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">Kandidat & Kontak</th>
                <th className="px-4 py-3.5">Posisi Dilamar</th>
                <th className="px-4 py-3.5">Pendidikan</th>
                <th className="px-4 py-3.5">Skor Screening</th>
                <th className="px-4 py-3.5">Tahapan Seleksi</th>
                <th className="px-4 py-3.5">Tanggal Masuk</th>
                <th className="px-5 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedApps.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-slate-400">
                    Tidak ada kandidat pada kriteria pencarian ini.
                  </td>
                </tr>
              ) : (
                paginatedApps.map(app => (
                  <tr
                    key={app.id}
                    onClick={() => openCandidateDetail(app)}
                    className="hover:bg-blue-50/40 cursor-pointer transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-xs">{app.fullName}</span>
                        {app.isDemo && (
                          <span className="text-[10px] px-1 py-0.2 rounded bg-slate-100 text-slate-500 border border-slate-200 font-semibold">
                            DEMO
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-blue-600 font-mono block mt-0.5">
                        {app.referenceNumber}
                      </span>
                      <span className="text-[11px] text-slate-500 block">{app.email}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="font-medium text-slate-800">{app.jobTitle}</span>
                      <span className="text-[11px] text-slate-400 block">{app.domicile}</span>
                    </td>
                    <td className="px-4 py-4 text-slate-600">
                      <span>{app.educationLevel}</span>
                      <span className="text-[11px] text-slate-400 block">{app.major}</span>
                    </td>
                    <td className="px-4 py-4">
                      {app.screeningResult ? (
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-2 py-0.5 rounded-md font-bold text-xs ${
                              app.screeningResult.score >= 80
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : app.screeningResult.score >= 60
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {app.screeningResult.score}%
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {app.screeningResult.passedMandatory ? 'Wajib Lolos' : 'Wajib Kurang'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px]">-</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold border ${getStageBadgeColor(
                          app.stage
                        )}`}
                      >
                        {app.stage}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-slate-500">
                      {new Date(app.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          openCandidateDetail(app);
                        }}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-700 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 ml-auto cursor-pointer"
                      >
                        <span>Review</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>
            Halaman {currentPage} dari {totalPages} ({filteredApps.length} total pelamar)
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="p-1.5 rounded-lg border border-slate-300 disabled:opacity-40 hover:bg-white transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded-lg border border-slate-300 disabled:opacity-40 hover:bg-white transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Candidate Detail Modal / Drawer */}
      {activeCandidate && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="p-4 sm:p-6 bg-slate-900 text-white flex items-start justify-between border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2.5 py-0.5 rounded bg-blue-600/30 text-blue-300 border border-blue-500/30">
                    {activeCandidate.referenceNumber}
                  </span>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${getStageBadgeColor(activeCandidate.stage)}`}>
                    {activeCandidate.stage}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white mt-1.5">{activeCandidate.fullName}</h2>
                <p className="text-xs text-slate-300 mt-0.5">
                  Melamar: <strong className="text-white">{activeCandidate.jobTitle}</strong> • {activeCandidate.domicile}
                </p>
              </div>
              <button
                onClick={() => setActiveCandidate(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-6 text-xs text-slate-700">
              {actionFeedback && (
                <div
                  className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2 ${
                    actionFeedback.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{actionFeedback.message}</span>
                </div>
              )}

              {/* Quick Action Strip */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="flex flex-wrap items-center gap-3">
                  <a
                    href={`https://wa.me/${activeCandidate.phone.replace(/[^\d]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp ({activeCandidate.phone})</span>
                  </a>
                  <a
                    href={`mailto:${activeCandidate.email}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-semibold transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Email</span>
                  </a>
                </div>
                <button
                  onClick={() => {
                    const c = activeCandidate;
                    setActiveCandidate(null);
                    onScheduleInterview(c);
                  }}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer ml-auto sm:ml-0"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Jadwalkan Wawancara</span>
                </button>
              </div>

              {/* Grid 2 Columns: Data & Screening */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Column 1: Candidate Details */}
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
                    <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] text-slate-500 border-b border-slate-100 pb-2">
                      Profil & Latar Belakang
                    </h3>
                    <div className="space-y-2 text-slate-700">
                      <p><strong>Pendidikan:</strong> {activeCandidate.educationLevel} • {activeCandidate.major}</p>
                      <p><strong>Domisili:</strong> {activeCandidate.domicile}</p>
                      <p><strong>Ringkasan Pengalaman:</strong></p>
                      <p className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-relaxed text-slate-800">
                        {activeCandidate.experienceSummary}
                      </p>
                      <p><strong>Keahlian / Skills:</strong></p>
                      <div className="flex flex-wrap gap-1">
                        {activeCandidate.skills?.map(s => (
                          <span key={s} className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100 text-[11px]">
                            {s}
                          </span>
                        ))}
                      </div>
                      {activeCandidate.portfolioUrl && (
                        <p>
                          <strong>Portofolio:</strong>{' '}
                          <a
                            href={activeCandidate.portfolioUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 underline"
                          >
                            {activeCandidate.portfolioUrl}
                          </a>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* CV File Preview & Content */}
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
                    <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] text-slate-500 border-b border-slate-100 pb-2">
                      Berkas CV yang Diunggah
                    </h3>
                    <div className="flex items-center gap-2 text-slate-800">
                      <FileText className="w-5 h-5 text-blue-600 shrink-0" />
                      <div className="truncate">
                        <p className="font-semibold truncate">{activeCandidate.resumeFileName}</p>
                        <p className="text-[11px] text-slate-400">
                          {(activeCandidate.resumeFileSize / 1024).toFixed(1)} KB • {activeCandidate.resumeFileType}
                        </p>
                      </div>
                    </div>
                    {activeCandidate.resumeText && (
                      <div className="mt-2">
                        <span className="text-[10px] text-slate-400 block mb-1">
                          Teks Terekstrak dari Berkas:
                        </span>
                        <div className="max-h-32 overflow-y-auto bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-[11px] text-slate-600 font-mono leading-relaxed whitespace-pre-wrap">
                          {activeCandidate.resumeText}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Column 2: CV Screening Results & Evidence */}
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] text-slate-500">
                        Hasil Screening CV Otomatis
                      </h3>
                      {activeCandidate.screeningResult && (
                        <span className="font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg text-sm border border-blue-200">
                          {activeCandidate.screeningResult.score}% Match
                        </span>
                      )}
                    </div>
                    {activeCandidate.screeningResult ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2 text-center">
                          <div className="p-2.5 bg-blue-50/60 rounded-xl border border-blue-100">
                            <span className="text-[10px] text-slate-500 block">Kriteria Wajib (70%)</span>
                            <span className="font-bold text-slate-900 text-sm">
                              {activeCandidate.screeningResult.mandatoryScore}%
                            </span>
                          </div>
                          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                            <span className="text-[10px] text-slate-500 block">Kriteria Tambahan (30%)</span>
                            <span className="font-bold text-slate-900 text-sm">
                              {activeCandidate.screeningResult.optionalScore}%
                            </span>
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-600 italic bg-slate-50 p-2 rounded-lg border border-slate-100">
                          {activeCandidate.screeningResult.summaryNote}
                        </p>
                        <div className="space-y-2">
                          <span className="font-semibold text-slate-800 text-[11px] block">
                            Bukti Pencocokan Dokumen:
                          </span>
                          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                            {activeCandidate.screeningResult.evidence.map((ev, i) => (
                              <div
                                key={i}
                                className={`p-2.5 rounded-xl border text-[11px] space-y-1 ${
                                  ev.isFound
                                    ? 'bg-emerald-50/40 border-emerald-200 text-slate-800'
                                    : 'bg-slate-50 border-slate-200 text-slate-600'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-semibold flex items-center gap-1">
                                    {ev.isFound ? (
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                    ) : (
                                      <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                                    )}
                                    {ev.criterionLabel}
                                  </span>
                                  <span className="text-[10px] px-1.5 py-0.2 rounded font-medium bg-white border border-slate-200">
                                    {ev.isMandatory ? 'Wajib' : 'Tambahan'}
                                  </span>
                                </div>
                                <p className="text-[10px] text-slate-500 pl-4 italic">
                                  {ev.snippet}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-slate-400 text-center py-4">Belum ada hasil screening.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Stage Transition Control & Internal Notes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <h4 className="font-bold text-slate-900">Pindahkan Tahap Seleksi</h4>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Pilih Tahap Baru</label>
                    <select
                      value={newStage}
                      onChange={e => setNewStage(e.target.value as ApplicationStage)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
                    >
                      {ALL_STAGES.map(s => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Catatan Perpindahan Tahap</label>
                    <input
                      type="text"
                      placeholder="Alasan / catatan perpindahan..."
                      value={stageNote}
                      onChange={e => setStageNote(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
                    />
                  </div>
                  <button
                    disabled={isUpdatingStage || newStage === activeCandidate.stage}
                    onClick={handleStageChangeSubmit}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    {isUpdatingStage ? 'Menyimpan...' : `Pindahkan ke "${newStage}"`}
                  </button>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <h4 className="font-bold text-slate-900">Catatan Internal HRD</h4>
                  <textarea
                    rows={4}
                    placeholder="Catatan hasil diskusi HR, ekspektasi gaji, rekomendasi..."
                    value={internalNotes}
                    onChange={e => setInternalNotes(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl bg-white leading-relaxed"
                  />
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pt-2 border-t border-slate-200">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleDeleteCandidate}
                        className="text-red-600 hover:text-red-700 text-[11px] font-bold cursor-pointer"
                      >
                        Hapus Pelamar
                      </button>
                      <span className="text-slate-300">•</span>
                      <button
                        onClick={handleToggleAllowReapply}
                        className={`text-[11px] font-bold underline cursor-pointer ${
                          activeCandidate.allowReapply
                            ? 'text-amber-700 hover:text-amber-800'
                            : 'text-blue-600 hover:text-blue-800'
                        }`}
                      >
                        {activeCandidate.allowReapply ? 'Cabut Izin Lamar Ulang' : 'Izinkan Lamar Ulang'}
                      </button>
                    </div>
                    <button
                      disabled={isSavingNotes}
                      onClick={handleSaveInternalNotes}
                      className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-colors cursor-pointer ml-auto"
                    >
                      {isSavingNotes ? 'Menyimpan...' : 'Simpan Catatan'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setActiveCandidate(null)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Tutup Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
