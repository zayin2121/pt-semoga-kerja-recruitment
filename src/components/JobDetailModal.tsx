import React from 'react';
import {
  X,
  MapPin,
  Clock,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  FileText,
} from 'lucide-react';
import { Job, Application, CandidateUser, getPublicStageLabel } from '../types/recruitment';
import { canApplyJob } from '../services/jobService';

interface JobDetailModalProps {
  job: Job | null;
  existingApplication?: Application | null;
  candidateUser?: CandidateUser | null;
  onClose: () => void;
  onApply: (job: Job) => void;
  onViewMyApplicationStatus?: () => void;
  onRequireLogin?: () => void;
}

export const JobDetailModal: React.FC<JobDetailModalProps> = ({
  job,
  existingApplication,
  candidateUser,
  onClose,
  onApply,
  onViewMyApplicationStatus,
  onRequireLogin,
}) => {
  if (!job) return null;
  const applyCheck = canApplyJob(job);
  const hasAlreadyApplied = Boolean(existingApplication && !existingApplication.allowReapply);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-6 bg-slate-900 text-white flex items-start justify-between gap-3 border-b border-slate-800">
          <div className="space-y-1.5 min-w-0">
            <span className="inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-600/30 text-blue-300 border border-blue-500/30">
              {job.department}
            </span>
            <h2 className="text-lg sm:text-xl font-black text-white leading-snug">
              {job.title}
            </h2>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-slate-300 pt-0.5">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>{job.location}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>{job.type}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>Batas: {new Date(job.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 sm:space-y-6 text-xs sm:text-sm text-slate-700">
          {/* Banner jika kandidat sudah pernah melamar lowongan ini */}
          {hasAlreadyApplied && existingApplication && (
            <div className="p-4 sm:p-5 bg-blue-50/90 border-2 border-blue-200 rounded-2xl space-y-2.5">
              <div className="flex items-center gap-2 text-blue-950 font-bold text-xs sm:text-sm">
                <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
                <span>Anda Sudah Melamar Posisi Ini</span>
              </div>
              <p className="text-xs text-blue-900 leading-relaxed">
                Terima kasih atas minat Anda untuk bergabung dengan PT Semoga Kerja. Anda sudah mengirimkan lamaran untuk posisi <strong>{job.title}</strong>. Tim rekrutmen kami sedang meninjau berkas Anda.
              </p>
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-blue-200/80 text-xs text-blue-800">
                <span>
                  No. Referensi: <strong className="font-mono text-blue-950">{existingApplication.referenceNumber}</strong>
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-white text-blue-800 border border-blue-300 font-bold text-[11px]">
                  Tahapan: {getPublicStageLabel(existingApplication.stage)}
                </span>
              </div>
            </div>
          )}

          {/* Status Alert if closed */}
          {!applyCheck.allowed && !hasAlreadyApplied && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-amber-800 text-xs">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>{applyCheck.reason}</span>
            </div>
          )}

          {/* Description */}
          <div className="space-y-1.5">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Deskripsi Pekerjaan
            </h4>
            <p className="text-slate-700 leading-relaxed text-xs sm:text-sm whitespace-pre-line">
              {job.description}
            </p>
          </div>

          {/* Responsibilities */}
          {job.responsibilities && job.responsibilities.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Tanggung Jawab Utama
              </h4>
              <ul className="space-y-1.5">
                {job.responsibilities.map((resp, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0 mt-2"></span>
                    <span className="leading-relaxed">{resp}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Mandatory Qualifications */}
          {job.requirementsMandatory && job.requirementsMandatory.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-blue-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                <span>Kualifikasi Wajib</span>
              </h4>
              <ul className="space-y-1.5 bg-blue-50/60 p-3.5 sm:p-4 rounded-xl border border-blue-100">
                {job.requirementsMandatory.map((req, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-slate-800">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Optional Qualifications */}
          {job.requirementsOptional && job.requirementsOptional.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Kualifikasi Tambahan (Nilai Tambah)
              </h4>
              <ul className="space-y-1.5 bg-slate-50 p-3.5 sm:p-4 rounded-xl border border-slate-200">
                {job.requirementsOptional.map((opt, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-slate-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0 mt-2"></span>
                    <span className="leading-relaxed">{opt}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Selection Notice */}
          <div className="bg-slate-100 p-3.5 sm:p-4 rounded-xl text-xs text-slate-600 space-y-1">
            <span className="font-bold text-slate-800 block">Proses Seleksi PT Semoga Kerja:</span>
            <p className="leading-relaxed">
              Hanya kandidat yang memenuhi kualifikasi yang akan dihubungi untuk tahapan wawancara. Seluruh korespondensi resmi disampaikan via email resmi dan WhatsApp. Tidak ada pungutan biaya apapun.
            </p>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-3.5 sm:p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
          >
            Tutup
          </button>

          {hasAlreadyApplied ? (
            <div className="flex items-center gap-2">
              <button
                disabled
                className="px-3.5 py-2 bg-slate-200 text-slate-500 text-xs font-semibold rounded-xl cursor-not-allowed"
              >
                Sudah Melamar
              </button>
              {onViewMyApplicationStatus && (
                <button
                  onClick={() => {
                    onClose();
                    onViewMyApplicationStatus();
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <FileText className="w-4 h-4" />
                  <span>Lihat Status</span>
                </button>
              )}
            </div>
          ) : !candidateUser ? (
            <button
              onClick={() => {
                onClose();
                if (onRequireLogin) onRequireLogin();
              }}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <span>Masuk untuk Melamar</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              disabled={!applyCheck.allowed}
              onClick={() => onApply(job)}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <span>Lamar Sekarang</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
