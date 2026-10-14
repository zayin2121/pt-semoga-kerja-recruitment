import React, { useState } from 'react';
import {
  Menu,
  X,
  Search,
  User,
  LogOut,
  FileText,
  Briefcase,
  ShieldCheck,
  Home,
  ChevronRight,
} from 'lucide-react';
import { CandidateUser } from '../types/recruitment';
import { Logo } from './Logo';

interface NavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onOpenCheckStatus: () => void;
  candidateUser: CandidateUser | null;
  onLogoutCandidate: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPath,
  onNavigate,
  onOpenCheckStatus,
  candidateUser,
  onLogoutCandidate,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleMobileNav = (path: string) => {
    setIsMobileMenuOpen(false);
    onNavigate(path);
  };

  const handleMobileCheckStatus = () => {
    setIsMobileMenuOpen(false);
    onOpenCheckStatus();
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 sm:h-18 flex items-center justify-between gap-3">
          {/* Sisi Kiri: Logo Resmi & Nama Perusahaan */}
          <div
            onClick={() => onNavigate('/lokerptsk')}
            className="flex items-center gap-2 sm:gap-3 cursor-pointer group shrink-0 select-none py-1"
          >
            <Logo
              variant="dark"
              size="sm"
              subtitle="Portal Karir Resmi"
              className="group-hover:opacity-95 transition-opacity"
            />
          </div>

          {/* Sisi Tengah: Navigasi Desktop (Hidden on Mobile) */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            <button
              onClick={() => onNavigate('/lokerptsk')}
              className={`px-3 py-2 text-xs font-semibold rounded-xl transition-colors ${
                currentPath === '/lokerptsk'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              Beranda
            </button>
            <button
              onClick={() => onNavigate('/lokerptsk/lowongan')}
              className={`px-3 py-2 text-xs font-semibold rounded-xl transition-colors ${
                currentPath.startsWith('/lokerptsk/lowongan')
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              Lowongan Pekerjaan
            </button>
            <button
              onClick={onOpenCheckStatus}
              className="px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <Search className="w-3.5 h-3.5 text-blue-400" />
              <span>Cek Status Cepat</span>
            </button>
            <button
              onClick={() => onNavigate('/lokerptsk/kebijakan-privasi')}
              className={`px-3 py-2 text-xs font-semibold rounded-xl transition-colors ${
                currentPath === '/lokerptsk/kebijakan-privasi'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              Kebijakan Privasi
            </button>
          </nav>

          {/* Sisi Kanan: Akun Kandidat (Desktop) & Hamburger Toggle (Mobile) */}
          <div className="flex items-center gap-2">
            {/* Desktop Candidate Action Buttons */}
            <div className="hidden lg:flex items-center gap-2">
              {candidateUser ? (
                <>
                  <button
                    onClick={() => onNavigate('/lokerptsk/lamaran')}
                    className={`px-3 py-2 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 ${
                      currentPath === '/lokerptsk/lamaran'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5 text-blue-400" />
                    <span>Lamaran Saya</span>
                  </button>
                  <button
                    onClick={() => onNavigate('/lokerptsk/profil')}
                    className={`px-3 py-2 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 max-w-[160px] truncate ${
                      currentPath === '/lokerptsk/profil'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                    }`}
                  >
                    <User className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="truncate">{candidateUser.displayName}</span>
                  </button>
                  <button
                    onClick={onLogoutCandidate}
                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-xl transition-colors"
                    title="Keluar dari akun kandidat"
                    aria-label="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => onNavigate('/lokerptsk/login')}
                    className="px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
                  >
                    Masuk
                  </button>
                  <button
                    onClick={() => onNavigate('/lokerptsk/signup')}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                  >
                    Daftar Akun
                  </button>
                </>
              )}
            </div>

            {/* Quick Status Pill for mobile (compact search icon) */}
            <button
              onClick={onOpenCheckStatus}
              className="lg:hidden p-2 text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-xl transition-colors"
              title="Cek Status Lamaran Cepat"
              aria-label="Cek Status"
            >
              <Search className="w-4 h-4 text-blue-400" />
            </button>

            {/* Hamburger Button on Mobile / Tablet */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors focus:outline-none"
              aria-label={isMobileMenuOpen ? 'Tutup navigasi' : 'Buka navigasi'}
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 text-slate-200" />
              ) : (
                <Menu className="w-5 h-5 text-slate-200" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer / Dropdown Navigation */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-800/80 bg-slate-900/98 backdrop-blur-md px-4 py-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Candidate Status Card in Mobile Menu */}
          {candidateUser ? (
            <div className="p-3 bg-slate-800/80 border border-slate-700/60 rounded-2xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  {candidateUser.displayName?.charAt(0)?.toUpperCase() || 'K'}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-xs text-white truncate">{candidateUser.displayName}</p>
                  <p className="text-[11px] text-slate-400 truncate">{candidateUser.email}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onLogoutCandidate();
                }}
                className="px-2.5 py-1.5 bg-red-950/60 hover:bg-red-900 text-red-300 rounded-lg text-[11px] font-semibold border border-red-800/50 shrink-0"
              >
                Keluar
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 pb-1">
              <button
                onClick={() => handleMobileNav('/lokerptsk/login')}
                className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl text-center border border-slate-700 transition-colors"
              >
                Masuk Akun
              </button>
              <button
                onClick={() => handleMobileNav('/lokerptsk/signup')}
                className="py-2.5 px-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl text-center shadow-xs transition-colors"
              >
                Daftar Akun Baru
              </button>
            </div>
          )}

          {/* Navigation Links List */}
          <div className="space-y-1 pt-1">
            <button
              onClick={() => handleMobileNav('/lokerptsk')}
              className={`w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl flex items-center justify-between transition-colors ${
                currentPath === '/lokerptsk'
                  ? 'bg-blue-600 text-white font-bold'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Home className="w-4 h-4 text-blue-400" />
                <span>Beranda Karir</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>

            <button
              onClick={() => handleMobileNav('/lokerptsk/lowongan')}
              className={`w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl flex items-center justify-between transition-colors ${
                currentPath.startsWith('/lokerptsk/lowongan')
                  ? 'bg-blue-600 text-white font-bold'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Briefcase className="w-4 h-4 text-blue-400" />
                <span>Lowongan Pekerjaan</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>

            {candidateUser && (
              <>
                <button
                  onClick={() => handleMobileNav('/lokerptsk/lamaran')}
                  className={`w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl flex items-center justify-between transition-colors ${
                    currentPath === '/lokerptsk/lamaran'
                      ? 'bg-blue-600 text-white font-bold'
                      : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-4 h-4 text-blue-400" />
                    <span>Riwayat Lamaran Saya</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </button>

                <button
                  onClick={() => handleMobileNav('/lokerptsk/profil')}
                  className={`w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl flex items-center justify-between transition-colors ${
                    currentPath === '/lokerptsk/profil'
                      ? 'bg-blue-600 text-white font-bold'
                      : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <User className="w-4 h-4 text-emerald-400" />
                    <span>Profil Kandidat</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </button>
              </>
            )}

            <button
              onClick={handleMobileCheckStatus}
              className="w-full px-3.5 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-800/60 hover:text-white rounded-xl flex items-center justify-between transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Search className="w-4 h-4 text-blue-400" />
                <span>Cek Status Cepat</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>

            <button
              onClick={() => handleMobileNav('/lokerptsk/kebijakan-privasi')}
              className={`w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl flex items-center justify-between transition-colors ${
                currentPath === '/lokerptsk/kebijakan-privasi'
                  ? 'bg-blue-600 text-white font-bold'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-blue-400" />
                <span>Kebijakan Privasi</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
