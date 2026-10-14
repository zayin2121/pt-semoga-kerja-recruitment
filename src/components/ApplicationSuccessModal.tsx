import React, { useState } from 'react';
import { CheckCircle2, Copy, Check, Mail, ArrowRight } from 'lucide-react';
import { Application } from '../types/recruitment';

interface ApplicationSuccessModalProps {
  application: Application;
  onClose: () => void;
  onOpenCheckStatus: () => void;
}

export const ApplicationSuccessModal: React.FC<ApplicationSuccessModalProps> = ({
  application,
  onClose,
  onOpenCheckStatus,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(application.referenceNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden text-center p-5 sm:p-8 space-y-5 sm:space-y-6 animate-in fade-in zoom-in-95 duration-150">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10" />
        </div>

        <div className="space-y-1.5">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Lamaran Berhasil Diterima!
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
            Terima kasih telah melamar di PT Semoga Kerja. Berkas lamaran Anda telah tercatat secara persisten dalam sistem rekrutmen kami.
          </p>
        </div>

        {/* Reference Box */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left space-y-2">
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
            Nomor Referensi Lamaran Anda
          </span>
          <div className="flex items-center justify-between bg-white px-3.5 py-2.5 rounded-xl border border-slate-300">
            <span className="font-mono text-sm sm:text-base font-black text-blue-700 tracking-wide">
              {application.referenceNumber}
            </span>
            <button
              onClick={handleCopy}
              className="text-xs text-slate-600 hover:text-blue-600 font-bold flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Tersalin</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin</span>
                </>
              )}
            </button>
          </div>
          <div className="text-[11px] text-slate-600 space-y-0.5 pt-1">
            <p><strong className="text-slate-800">Posisi:</strong> {application.jobTitle}</p>
            <p><strong className="text-slate-800">Kandidat:</strong> {application.fullName}</p>
            <p><strong className="text-slate-800">Email:</strong> {application.email}</p>
          </div>
        </div>

        {/* Info card */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3.5 text-left flex items-start gap-2.5 text-xs text-blue-900">
          <Mail className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-bold text-blue-950">Konfirmasi Resmi Email</p>
            <p className="text-[11px] leading-relaxed text-blue-800">
              Surat tanda terima resmi otomatis dikirimkan ke email Anda. Tim rekrutmen akan menghubungi melalui email dan WhatsApp apabila Anda memenuhi kualifikasi untuk tahapan berikutnya.
            </p>
          </div>
        </div>

        {/* Footer actions */}
        <div className="pt-1 flex flex-col sm:flex-row gap-2.5">
          <button
            onClick={() => {
              onClose();
              onOpenCheckStatus();
            }}
            className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Cek Status Lamaran
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
