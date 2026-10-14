import React, { useState } from 'react';
import { Lock, ShieldCheck, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import { signInHrdWithGoogle, isUserHrd, signOutUser, getFriendlyAuthErrorMessage } from '../../services/authService';
import { logAudit } from '../../services/auditService';
import { Logo } from '../Logo';
import { FirebaseAuthErrorAlert } from '../FirebaseAuthErrorAlert';

interface HrdLoginPageProps {
  onSuccess: (user: any) => void;
  onNavigateHome: () => void;
  currentUser?: any;
}

export const HrdLoginPage: React.FC<HrdLoginPageProps> = ({
  onSuccess,
  onNavigateHome,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [errorObj, setErrorObj] = useState<any>(null);

  const handleSignIn = async () => {
    setIsLoading(true);
    setErrorMessage('');
    setErrorObj(null);
    try {
      const { user } = await signInHrdWithGoogle();
      if (!isUserHrd(user)) {
        await signOutUser();
        setErrorMessage(
          `Akses Ditolak: Akun "${user.email}" terdaftar sebagai akun kandidat / pengguna umum dan tidak memiliki hak akses operasional HRD PT Semoga Kerja.`
        );
        return;
      }
      await logAudit(
        'LOGIN_HRD',
        `Pengguna HRD ${user.email} berhasil terautentikasi melalui jalur privat /loginhrd.`,
        user.uid,
        user.email || '',
        user.displayName || ''
      );
      onSuccess(user);
    } catch (err: any) {
      console.error('HR login error:', err);
      setErrorObj(err);
      setErrorMessage(getFriendlyAuthErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-white relative">
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6">
        <button
          onClick={onNavigateHome}
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 bg-slate-900/90 px-3.5 py-2 rounded-xl border border-slate-800 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Website Karir</span>
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl p-6 sm:p-10 max-w-md w-full shadow-2xl text-center space-y-6">
        {/* Official Logo */}
        <div className="flex justify-center pb-1">
          <Logo variant="dark" size="lg" symbolOnly className="mx-auto" />
        </div>

        <div className="space-y-1.5">
          <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full bg-slate-800 text-blue-300 border border-slate-700">
            Jalur Terproteksi /loginhrd
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-2">
            Portal Administrasi HRD
          </h1>
          <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
            Sistem internal pengelolaan rekrutmen, peninjauan berkas CV, evaluasi seleksi, dan penjadwalan wawancara PT Semoga Kerja.
          </p>
        </div>

        {(errorMessage || errorObj) && (
          <FirebaseAuthErrorAlert
            error={errorObj || errorMessage}
            variant="dark"
            onRetryGoogle={handleSignIn}
          />
        )}

        <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800/80 text-left space-y-2 text-xs text-slate-300">
          <div className="flex items-center gap-2 font-bold text-white">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Otorisasi Berbasis Peran (RBAC)</span>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-400">
            Hanya akun administrator berwenang yang dapat mengakses dashboard ini. Autentikasi Google akan mengaktifkan otorisasi pengiriman notifikasi resmi melalui Gmail API.
          </p>
        </div>

        <div>
          <button
            disabled={isLoading}
            onClick={handleSignIn}
            className="w-full py-3 px-4 bg-white hover:bg-slate-100 disabled:opacity-50 text-slate-900 font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-3 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                <span>Memverifikasi Hak Akses...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                </svg>
                <span>Masuk Akun Google HRD</span>
              </>
            )}
          </button>
        </div>

        <p className="text-[10px] text-slate-500">
          Akun administrator utama: <span className="font-mono text-slate-400">2207016087@student.walisongo.ac.id</span>. Akses kandidat otomatis ditolak.
        </p>
      </div>
    </div>
  );
};
