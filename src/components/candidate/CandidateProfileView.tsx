import React, { useState } from 'react';
import {
  User,
  Mail,
  ShieldCheck,
  Briefcase,
  Clock,
  LogOut,
  FileText,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { CandidateUser, Application, getPublicStageLabel } from '../../types/recruitment';

interface CandidateProfileViewProps {
  candidate: CandidateUser;
  applications: Application[];
  initialSubTab?: 'profile' | 'applications';
  onNavigate: (path: string) => void;
  onLogout: () => void;
}

export const CandidateProfileView: React.FC<CandidateProfileViewProps> = ({
  candidate,
  applications,
  initialSubTab = 'profile',
  onNavigate,
  onLogout,
}) => {
  const [subTab, setSubTab] = useState<'profile' | 'applications'>(initialSubTab);

  const myApplications = applications.filter(
    app => app.candidateUid === candidate.uid || app.email.toLowerCase() === candidate.email.toLowerCase()
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6 sm:space-y-8">
      {/* Top Profile Card - Responsive Layout */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-5 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-5 sm:gap-6">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div className="w-13 h-13 sm:w-16 sm:h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-xl sm:text-2xl shadow-md shrink-0">
            {candidate.displayName?.charAt(0)?.toUpperCase() || 'K'}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-base sm:text-xl font-black text-slate-900 truncate">
                {candidate.displayName}
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                Akun Kandidat
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5 truncate">
              <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{candidate.email}</span>
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Metode Masuk: {candidate.provider === 'google' ? 'Google OAuth 2.0 Resmi' : 'Email & Password Terenkripsi'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
          <button
            onClick={() => onNavigate('/lokerptsk/lowongan')}
            className="flex-1 sm:flex-none px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Cari Lowongan</span>
          </button>
          <button
            onClick={onLogout}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 text-slate-500" />
            <span>Keluar</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs">
        <button
          onClick={() => setSubTab('profile')}
          className={`px-3.5 sm:px-4 py-2 rounded-xl font-bold transition-colors cursor-pointer ${
            subTab === 'profile'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Informasi Akun
        </button>
        <button
          onClick={() => setSubTab('applications')}
          className={`px-3.5 sm:px-4 py-2 rounded-xl font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
            subTab === 'applications'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>Riwayat Lamaran Saya</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-800 font-bold">
            {myApplications.length}
          </span>
        </button>
      </div>

      {/* Tab: Profile Info */}
      {subTab === 'profile' && (
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-5 sm:p-8 shadow-xs space-y-5 text-xs sm:text-sm text-slate-700">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Detail Akun Terdaftar
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-[11px] text-slate-500 font-semibold block">Nama Lengkap</span>
              <p className="text-sm font-bold text-slate-900 mt-1">{candidate.displayName}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-[11px] text-slate-500 font-semibold block">Alamat Email</span>
              <p className="text-sm font-bold text-slate-900 mt-1 truncate">{candidate.email}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-[11px] text-slate-500 font-semibold block">ID Akun Stabil (UID)</span>
              <p className="text-xs font-mono text-slate-700 mt-1 truncate">{candidate.uid}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-[11px] text-slate-500 font-semibold block">Metode Autentikasi</span>
              <p className="text-xs font-bold text-emerald-700 mt-1 flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>{candidate.provider === 'google' ? 'Google OAuth 2.0 Terhubung' : 'Kata Sandi Aman'}</span>
              </p>
            </div>
          </div>
          <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl text-[11px] sm:text-xs text-blue-900 leading-relaxed space-y-1">
            <p className="font-bold">Keamanan Data Akun:</p>
            <p>
              Akun Anda diproteksi dengan otorisasi berbasis peran. Seluruh lamaran yang Anda kirimkan terhubung secara unik ke akun ini untuk memastikan riwayat seleksi Anda tersimpan aman dan tidak dapat diakses oleh pihak luar.
            </p>
          </div>
        </div>
      )}

      {/* Tab: Applications History */}
      {subTab === 'applications' && (
        <div className="space-y-4">
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">Riwayat Berkas Lamaran</h2>
              <p className="text-xs text-slate-500">
                Lacak status perkembangan lamaran pekerjaan yang telah Anda kirimkan.
              </p>
            </div>
            <span className="text-xs font-bold text-slate-600">
              {myApplications.length} Posisi Dilamar
            </span>
          </div>

          {myApplications.length === 0 ? (
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-8 sm:p-12 text-center text-slate-400 space-y-3">
              <FileText className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-slate-300" />
              <h3 className="font-bold text-slate-800 text-sm">Belum Ada Lamaran yang Dikirimkan</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Anda belum mengirimkan berkas lamaran untuk posisi apapun di PT Semoga Kerja.
              </p>
              <button
                onClick={() => onNavigate('/lokerptsk/lowongan')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Jelajahi Lowongan Kerja Sekarang
              </button>
            </div>
          ) : (
            <div className="space-y-3.5 sm:space-y-4">
              {myApplications.map(app => {
                const publicStage = getPublicStageLabel(app.stage);
                return (
                  <div
                    key={app.id}
                    className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-3.5 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-100 pb-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-bold text-sm sm:text-base text-slate-900">{app.jobTitle}</h3>
                          <span className="text-[10px] sm:text-[11px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-bold">
                            {app.referenceNumber}
                          </span>
                        </div>
                        <span className="text-[11px] sm:text-xs text-slate-500 block mt-0.5">
                          Tanggal Pengiriman: {new Date(app.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                      </div>
                      <div className="self-start sm:self-auto">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
                          <Clock className="w-3.5 h-3.5 text-blue-600" />
                          <span>Status: {publicStage}</span>
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs text-slate-600">
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase font-semibold">Nama Pelamar</span>
                        <strong className="text-slate-800">{app.fullName}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase font-semibold">Dokumen CV</span>
                        <strong className="text-slate-800 truncate block">{app.resumeFileName}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase font-semibold">Domisili</span>
                        <strong className="text-slate-800">{app.domicile}</strong>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-0.5">
                      <p className="font-bold text-slate-800">Keterangan Tahapan:</p>
                      <p>
                        Lamaran Anda tercatat dengan aman pada sistem rekrutmen PT Semoga Kerja. Tim HRD akan menghubungi Anda melalui email dan WhatsApp terdaftar apabila terdapat tindak lanjut proses seleksi.
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
