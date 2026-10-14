import React, { useState } from 'react';
import { X, Search, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { Application } from '../types/recruitment';
import { getApplicationByRefAndEmail } from '../services/applicationService';

interface CheckStatusModalProps {
  onClose: () => void;
}

export const CheckStatusModal: React.FC<CheckStatusModalProps> = ({ onClose }) => {
  const [refNumber, setRefNumber] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<Application | null>(null);
  const [notFound, setNotFound] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refNumber.trim() || !email.trim()) return;
    setIsLoading(true);
    setNotFound(false);
    setResult(null);
    const app = await getApplicationByRefAndEmail(refNumber, email);
    setIsLoading(false);
    if (app) {
      setResult(app);
    } else {
      setNotFound(true);
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

  const getPublicStageDescription = (stage: string) => {
    switch (stage) {
      case 'Applied':
        return 'Berkas lamaran telah masuk ke sistem dan sedang menunggu antrean peninjauan oleh tim rekrutmen.';
      case 'Screening':
      case 'HR Review':
        return 'Kualifikasi berkas dan resume Anda sedang ditinjau mendalam oleh tim HRD.';
      case 'Interview':
      case 'User Interview':
        return 'Anda dijadwalkan untuk tahapan wawancara. Silakan periksa email dan WhatsApp Anda untuk detail tautan/lokasi.';
      case 'Assessment':
        return 'Tahapan asesmen kemampuan kerja / tes kompetensi.';
      case 'Offer':
        return 'Selamat! Anda memasuki tahap penawaran kerja (Offering Letter). Tim HR akan segera menghubungi Anda.';
      case 'Hired':
        return 'Selamat bergabung dengan keluarga besar PT Semoga Kerja!';
      case 'Rejected':
        return 'Terima kasih atas partisipasi Anda. Saat ini kualifikasi Anda belum sesuai dengan kebutuhan spesifik posisi ini.';
      default:
        return 'Proses seleksi sedang berlangsung.';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-sm sm:text-base">Cek Status Lamaran Cepat</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-4 text-xs sm:text-sm">
          <form onSubmit={handleSearch} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nomor Referensi Lamaran
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: SK-202610-8492"
                value={refNumber}
                onChange={e => setRefNumber(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Alamat Email Pelamar
              </label>
              <input
                type="email"
                required
                placeholder="email.anda@domain.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <span>Mencari data...</span>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Periksa Status</span>
                </>
              )}
            </button>
          </form>

          {notFound && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Lamaran Tidak Ditemukan</p>
                <p className="mt-0.5 text-amber-700 text-[11px] leading-relaxed">
                  Pastikan Nomor Referensi dan alamat email yang Anda masukkan persis sama saat Anda mengirimkan lamaran.
                </p>
              </div>
            </div>
          )}

          {result && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 gap-2">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-semibold">Posisi Lowongan</p>
                  <p className="font-bold text-slate-900 text-xs sm:text-sm">{result.jobTitle}</p>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border shrink-0 ${getStageBadgeColor(result.stage)}`}>
                  {result.stage}
                </span>
              </div>

              <div className="space-y-1 text-slate-600">
                <p><strong className="text-slate-800">Nama:</strong> {result.fullName}</p>
                <p><strong className="text-slate-800">Tanggal Masuk:</strong> {new Date(result.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                <p className="pt-1"><strong className="text-slate-800">Keterangan:</strong></p>
                <p className="p-2.5 bg-white rounded-xl border border-slate-200 text-slate-700 leading-relaxed text-[11px]">
                  {getPublicStageDescription(result.stage)}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
