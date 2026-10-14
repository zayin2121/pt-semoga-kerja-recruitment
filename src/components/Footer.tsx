import React from 'react';
import { ShieldCheck, Mail, MapPin, AlertCircle, ExternalLink } from 'lucide-react';
import { Logo } from './Logo';

interface FooterProps {
  onOpenPrivacy: () => void;
  onOpenJobs: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenPrivacy, onOpenJobs }) => {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 mb-10">
          {/* Brand & Identity */}
          <div className="md:col-span-5 space-y-4">
            <Logo
              variant="dark"
              size="md"
              subtitle="Recruitment Management System"
            />
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              PT Semoga Kerja adalah perusahaan yang berkomitmen terhadap tata kelola rekrutmen berbasis kompetensi, perlindungan data privasi kandidat, dan transparansi proses seleksi kerja.
            </p>
            <div className="space-y-2 pt-1 text-xs">
              <div className="flex items-start gap-2 text-slate-300">
                <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span className="leading-normal">Gedung Graha Semoga Kerja Lt. 8, Jl. Jend. Sudirman Kav. 25, Jakarta Selatan</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                <span>recruitment@semogakerja.co.id</span>
              </div>
            </div>
          </div>

          {/* Navigasi Karir */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Navigasi Karir
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button
                  onClick={onOpenJobs}
                  className="hover:text-blue-400 transition-colors text-left flex items-center gap-1.5"
                >
                  <span>Daftar Lowongan Aktif</span>
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenPrivacy}
                  className="hover:text-blue-400 transition-colors text-left flex items-center gap-1.5"
                >
                  <span>Kebijakan Privasi Kandidat</span>
                </button>
              </li>
              <li>
                <a
                  href="#tahapan-seleksi"
                  className="hover:text-blue-400 transition-colors block"
                >
                  Tahapan Seleksi Rekrutmen
                </a>
              </li>
            </ul>
          </div>

          {/* Anti Fraud Warning */}
          <div className="md:col-span-4 space-y-3">
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Pemberitahuan Resmi Anti-Penipuan</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                PT Semoga Kerja <strong className="text-white">tidak pernah memungut biaya apapun</strong> (biaya tiket perjalanan, akomodasi, transfer, atau tes) dalam seluruh tahapan seleksi kerja. Seluruh korespondensi resmi hanya dikirim melalui alamat email resmi perusahaan.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom copyright strip */}
        <div className="border-t border-slate-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p className="text-center sm:text-left">
            © {new Date().getFullYear()} PT Semoga Kerja. Hak cipta dilindungi undang-undang.
          </p>
          <div className="flex items-center gap-4">
            <button
              onClick={onOpenPrivacy}
              className="hover:text-slate-400 underline transition-colors"
            >
              Kebijakan Privasi
            </button>
            <span aria-hidden="true">•</span>
            <span className="text-slate-400">Portal Karir Resmi</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
