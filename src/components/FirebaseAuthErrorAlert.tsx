import React, { useState } from 'react';
import {
  AlertCircle,
  Copy,
  Check,
  ExternalLink,
  ShieldAlert,
  Settings,
  HelpCircle,
  ArrowRight,
} from 'lucide-react';
import {
  FIREBASE_PROJECT_ID,
  FIREBASE_AUTH_SETTINGS_URL,
  FIREBASE_AUTH_PROVIDERS_URL,
  isUnauthorizedDomainError,
  isOperationNotAllowedError,
} from '../services/authService';

interface FirebaseAuthErrorAlertProps {
  error: any;
  variant?: 'light' | 'dark';
  onUseEmailFallback?: () => void;
  onRetryGoogle?: () => void;
}

export const FirebaseAuthErrorAlert: React.FC<FirebaseAuthErrorAlertProps> = ({
  error,
  variant = 'light',
  onUseEmailFallback,
  onRetryGoogle,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!error) return null;

  const currentHostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const isUnauthorizedDomain = isUnauthorizedDomainError(error);
  const isOperationNotAllowed = isOperationNotAllowedError(error);

  const copyToClipboard = async (text: string, key: string) => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2500);
    } catch (e) {
      console.warn('Gagal menyalin:', e);
    }
  };

  const isDark = variant === 'dark';

  // 1. UNAUTHORIZED DOMAIN CASE
  if (isUnauthorizedDomain) {
    return (
      <div
        className={`rounded-2xl border p-4 sm:p-5 text-xs transition-all space-y-3.5 shadow-sm text-left ${
          isDark
            ? 'bg-amber-950/40 border-amber-500/40 text-amber-200'
            : 'bg-amber-50/90 border-amber-300 text-amber-950'
        }`}
      >
        {/* Header */}
        <div className="flex items-start gap-2.5">
          <div
            className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
              isDark ? 'bg-amber-500/20 text-amber-300' : 'bg-amber-200/80 text-amber-800'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-sm tracking-tight text-amber-900 dark:text-amber-100">
                Otorisasi Domain Diperlukan
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-200/60 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 font-semibold">
                auth/unauthorized-domain
              </span>
            </div>
            <p className="text-[11px] leading-relaxed text-amber-900/90 dark:text-amber-200/90">
              Firebase Authentication menolak Google OAuth karena domain tempat aplikasi ini berjalan
              belum didaftarkan pada daftar <strong>Authorized Domains</strong> proyek{' '}
              <code className="px-1 py-0.5 bg-amber-200/50 dark:bg-amber-900/50 rounded font-mono font-bold">
                {FIREBASE_PROJECT_ID}
              </code>
              .
            </p>
          </div>
        </div>

        {/* Actionable Domains Box */}
        <div
          className={`p-3 rounded-xl border space-y-2.5 ${
            isDark
              ? 'bg-slate-900/80 border-slate-800 text-slate-200'
              : 'bg-white border-amber-200 text-slate-800 shadow-2xs'
          }`}
        >
          <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
            Pilih domain untuk ditambahkan ke Firebase Console:
          </div>

          {/* Option 1: run.app (Recommended Wildcard) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-lg bg-amber-50/60 dark:bg-slate-800/60 border border-amber-200/60 dark:border-slate-700">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-mono font-bold text-xs text-blue-600 dark:text-blue-400">
                  run.app
                </span>
                <span className="text-[9px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300">
                  Direkomendasikan
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                Mengizinkan semua URL preview dan revisi Cloud Run secara otomatis.
              </p>
            </div>
            <button
              type="button"
              onClick={() => copyToClipboard('run.app', 'wildcard')}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-xs transition-colors shrink-0 cursor-pointer shadow-2xs"
            >
              {copiedKey === 'wildcard' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin run.app</span>
                </>
              )}
            </button>
          </div>

          {/* Option 2: Exact Hostname */}
          {currentHostname && currentHostname !== 'run.app' && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
              <div className="min-w-0">
                <span className="font-mono text-xs text-slate-700 dark:text-slate-300 block truncate font-medium">
                  {currentHostname}
                </span>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Domain spesifik sesi aplikasi saat ini.
                </p>
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard(currentHostname, 'exact')}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-lg font-medium text-xs transition-colors shrink-0 cursor-pointer"
              >
                {copiedKey === 'exact' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin Domain Spesifik</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="space-y-2 text-[11px] leading-relaxed">
          <p className="font-bold flex items-center gap-1.5 text-amber-950 dark:text-amber-100">
            <Settings className="w-3.5 h-3.5" />
            <span>Langkah Perbaikan di Firebase Console:</span>
          </p>
          <ol className="list-decimal pl-4 space-y-1 text-amber-900/90 dark:text-amber-200/90">
            <li>
              Buka menu{' '}
              <strong>Firebase Console &gt; Authentication &gt; Settings &gt; Authorized domains</strong>.
            </li>
            <li>
              Klik tombol <strong>Add domain</strong> (Tambah domain).
            </li>
            <li>
              Tempel <code className="font-mono font-bold bg-amber-200/60 dark:bg-amber-900/60 px-1 rounded">run.app</code> lalu klik <strong>Add</strong>.
            </li>
          </ol>
        </div>

        {/* Buttons / Links */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
          <a
            href={FIREBASE_AUTH_SETTINGS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-2 px-3.5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl transition-all shadow-xs text-xs"
          >
            <span>Buka Pengaturan Firebase Console</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          {onRetryGoogle && (
            <button
              type="button"
              onClick={onRetryGoogle}
              className="px-3.5 py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold border border-slate-300 dark:border-slate-600 rounded-xl transition-all text-xs cursor-pointer"
            >
              Coba Ulang Masuk Google
            </button>
          )}
        </div>

        {/* Alternative Email/Password info */}
        {onUseEmailFallback && (
          <div className="pt-2 border-t border-amber-200/60 dark:border-amber-800/40 flex items-center justify-between gap-2">
            <span className="text-[10px] text-amber-800/80 dark:text-amber-300/80">
              Ingin langsung daftar/masuk tanpa Google?
            </span>
            <button
              type="button"
              onClick={onUseEmailFallback}
              className="text-xs font-bold text-blue-700 dark:text-blue-300 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Gunakan Formulir Email &amp; Password</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    );
  }

  // 2. OPERATION NOT ALLOWED CASE (Email/Password disabled)
  if (isOperationNotAllowed) {
    return (
      <div
        className={`rounded-2xl border p-4 sm:p-5 text-xs transition-all space-y-3.5 shadow-sm text-left ${
          isDark
            ? 'bg-amber-950/40 border-amber-500/40 text-amber-200'
            : 'bg-amber-50/90 border-amber-300 text-amber-950'
        }`}
      >
        <div className="flex items-start gap-2.5">
          <div
            className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
              isDark ? 'bg-amber-500/20 text-amber-300' : 'bg-amber-200/80 text-amber-800'
            }`}
          >
            <AlertCircle className="w-4 h-4" />
          </div>
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-sm tracking-tight text-amber-900 dark:text-amber-100">
                Penyedia Email &amp; Password Belum Aktif
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-200/60 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 font-semibold">
                auth/operation-not-allowed
              </span>
            </div>
            <p className="text-[11px] leading-relaxed text-amber-900/90 dark:text-amber-200/90">
              Penyedia autentikasi <strong>Email/Password</strong> belum diaktifkan pada Firebase
              Authentication project{' '}
              <code className="px-1 py-0.5 bg-amber-200/50 dark:bg-amber-900/50 rounded font-mono font-bold">
                {FIREBASE_PROJECT_ID}
              </code>
              .
            </p>
          </div>
        </div>

        {/* Instructions */}
        <div className="space-y-2 text-[11px] leading-relaxed">
          <p className="font-bold flex items-center gap-1.5 text-amber-950 dark:text-amber-100">
            <Settings className="w-3.5 h-3.5" />
            <span>Cara Mengaktifkan di Firebase Console:</span>
          </p>
          <ol className="list-decimal pl-4 space-y-1 text-amber-900/90 dark:text-amber-200/90">
            <li>
              Buka menu{' '}
              <strong>Firebase Console &gt; Authentication &gt; Sign-in method</strong>.
            </li>
            <li>
              Klik penyedia <strong>Email/Password</strong>.
            </li>
            <li>
              Aktifkan toggle <strong>Enable</strong> lalu klik <strong>Save</strong>.
            </li>
          </ol>
        </div>

        {/* Action Link */}
        <div className="pt-1">
          <a
            href={FIREBASE_AUTH_PROVIDERS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl transition-all shadow-xs text-xs w-full sm:w-auto"
          >
            <span>Buka Sign-in Method di Firebase Console</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    );
  }

  // 3. GENERIC ERROR CASE
  const messageText = typeof error === 'string' ? error : (error?.message || String(error));

  return (
    <div
      className={`rounded-2xl border p-3.5 sm:p-4 text-xs transition-all space-y-2 text-left ${
        isDark
          ? 'bg-red-950/60 border-red-800 text-red-200'
          : 'bg-red-50 border-red-200 text-red-800'
      }`}
    >
      <div className="flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
        <div className="space-y-1 flex-1">
          <p className="font-bold text-red-950 dark:text-red-100">Informasi Masuk / Pendaftaran:</p>
          <p className="leading-relaxed text-red-900 dark:text-red-200">{messageText}</p>
        </div>
      </div>
    </div>
  );
};
