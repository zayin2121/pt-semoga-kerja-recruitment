import React, { useState } from 'react';
import {
  Mail,
  Lock,
  User as UserIcon,
  AlertCircle,
  Loader2,
  ArrowRight,
  KeyRound,
  ArrowLeft,
} from 'lucide-react';
import {
  candidateSignInWithGoogle,
  candidateSignUpWithEmail,
  candidateSignInWithEmail,
  candidateResetPassword,
  getFriendlyAuthErrorMessage,
} from '../../services/authService';
import { Logo } from '../Logo';
import { FirebaseAuthErrorAlert } from '../FirebaseAuthErrorAlert';

interface CandidateAuthViewProps {
  mode: 'login' | 'signup';
  onSwitchMode: (mode: 'login' | 'signup') => void;
  onSuccess: (user: any) => void;
  onReturnToJobs: () => void;
}

export const CandidateAuthView: React.FC<CandidateAuthViewProps> = ({
  mode,
  onSwitchMode,
  onSuccess,
  onReturnToJobs,
}) => {
  // Form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // States
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [errorObj, setErrorObj] = useState<any>(null);

  // Forgot password
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [resetStatus, setResetStatus] = useState<string | null>(null);

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    setErrorMessage('');
    setErrorObj(null);
    try {
      const user = await candidateSignInWithGoogle();
      onSuccess(user);
    } catch (err: any) {
      console.error('Google auth error:', err);
      setErrorObj(err);
      setErrorMessage(getFriendlyAuthErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setErrorObj(null);

    if (!email.trim() || !password) {
      setErrorMessage('Harap isi alamat email dan password.');
      return;
    }

    if (mode === 'signup') {
      if (!fullName.trim()) {
        setErrorMessage('Nama lengkap wajib diisi.');
        return;
      }
      if (password.length < 6) {
        setErrorMessage('Password minimal harus 6 karakter.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('Konfirmasi password tidak cocok dengan password yang dimasukkan.');
        return;
      }
      setIsLoading(true);
      try {
        const user = await candidateSignUpWithEmail(fullName, email, password);
        onSuccess(user);
      } catch (err: any) {
        console.error('Sign up error:', err);
        setErrorObj(err);
        setErrorMessage(getFriendlyAuthErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    } else {
      // Login
      setIsLoading(true);
      try {
        const user = await candidateSignInWithEmail(email, password);
        onSuccess(user);
      } catch (err: any) {
        console.error('Sign in error:', err);
        setErrorObj(err);
        setErrorMessage(getFriendlyAuthErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSendResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    setIsSendingReset(true);
    setResetStatus(null);
    try {
      await candidateResetPassword(forgotEmail);
      setResetStatus('Tautan reset password telah dikirim ke email Anda. Silakan periksa inbox atau spam.');
    } catch (err: any) {
      setResetStatus(getFriendlyAuthErrorMessage(err));
    } finally {
      setIsSendingReset(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-8 sm:py-16">
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        {/* Header with Official Logo */}
        <div className="text-center space-y-2.5">
          <div className="flex justify-center pb-1">
            <Logo variant="light" size="lg" symbolOnly className="mx-auto" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {mode === 'signup' ? 'Daftar Akun Kandidat' : 'Masuk Akun Kandidat'}
          </h2>
          <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
            {mode === 'signup'
              ? 'Buat akun untuk melamar lowongan kerja dan memantau status lamaran Anda secara real-time.'
              : 'Masuk ke portal karir PT Semoga Kerja untuk melihat riwayat lamaran dan profil Anda.'}
          </p>
        </div>

        {/* Auth Error Banner & Diagnostic Helper */}
        {(errorMessage || errorObj) && (
          <FirebaseAuthErrorAlert
            error={errorObj || errorMessage}
            variant="light"
            onRetryGoogle={handleGoogleAuth}
          />
        )}

        {/* Google Sign-In Button */}
        <div>
          <button
            type="button"
            disabled={isLoading}
            onClick={handleGoogleAuth}
            className="w-full py-2.5 sm:py-3 px-4 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl text-slate-700 font-bold text-xs shadow-2xs hover:shadow-xs transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
            </svg>
            <span className="truncate">
              {mode === 'signup' ? 'Daftar Cepat dengan Google' : 'Masuk dengan Akun Google'}
            </span>
          </button>
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-200 w-full"></div>
          <span className="bg-white px-3 text-[10px] uppercase tracking-wider text-slate-400 font-bold absolute">
            atau dengan email
          </span>
        </div>

        {/* Email Form */}
        <form onSubmit={handleEmailAuth} className="space-y-3.5 text-xs">
          {mode === 'signup' && (
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Nama Lengkap Sesuai KTP <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="Contoh: Muhammad Dzuhri"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Alamat Email Aktif <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                placeholder="nama@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-slate-700">
                Password <span className="text-red-500">*</span>
              </label>
              {mode === 'login' && (
                <button
                  type="button"
                  onClick={() => setIsForgotModalOpen(true)}
                  className="text-[11px] text-blue-600 hover:underline cursor-pointer"
                >
                  Lupa password?
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                placeholder="Minimal 6 karakter"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {mode === 'signup' && (
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Konfirmasi Ulang Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="Ulangi password di atas"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Memproses...</span>
              </>
            ) : (
              <>
                <span>{mode === 'signup' ? 'Daftar Akun Sekarang' : 'Masuk ke Portal Karir'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Mode Switcher */}
        <div className="text-center pt-2 border-t border-slate-100 text-xs text-slate-600">
          {mode === 'signup' ? (
            <p>
              Sudah memiliki akun kandidat?{' '}
              <button
                type="button"
                onClick={() => onSwitchMode('login')}
                className="text-blue-600 font-bold hover:underline cursor-pointer"
              >
                Masuk di Sini
              </button>
            </p>
          ) : (
            <p>
              Belum memiliki akun?{' '}
              <button
                type="button"
                onClick={() => onSwitchMode('signup')}
                className="text-blue-600 font-bold hover:underline cursor-pointer"
              >
                Daftar Akun Baru
              </button>
            </p>
          )}
        </div>

        <div className="text-center">
          <button
            type="button"
            onClick={onReturnToJobs}
            className="text-[11px] text-slate-400 hover:text-slate-700 transition-colors inline-flex items-center gap-1 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Daftar Lowongan</span>
          </button>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 text-xs animate-in fade-in zoom-in-95">
            <h3 className="font-bold text-sm sm:text-base text-slate-900">Atur Ulang Kata Sandi</h3>
            <p className="text-slate-600 leading-relaxed text-[11px] sm:text-xs">
              Masukkan alamat email yang Anda gunakan saat mendaftar. Kami akan mengirimkan tautan untuk mengatur ulang kata sandi Anda.
            </p>

            {resetStatus && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-[11px] leading-relaxed">
                {resetStatus}
              </div>
            )}

            <form onSubmit={handleSendResetPassword} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Akun</label>
                <input
                  type="email"
                  required
                  placeholder="nama@email.com"
                  value={forgotEmail}
                  onChange={e => setForgotEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsForgotModalOpen(false)}
                  className="px-3 py-2 text-slate-600 hover:text-slate-900 font-medium cursor-pointer"
                >
                  Tutup
                </button>
                <button
                  type="submit"
                  disabled={isSendingReset}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl cursor-pointer"
                >
                  {isSendingReset ? 'Mengirim...' : 'Kirim Tautan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
