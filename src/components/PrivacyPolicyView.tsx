import React from 'react';
import { ShieldCheck, Lock, FileText, Database, UserCheck, Mail, ArrowLeft } from 'lucide-react';
import { Logo } from './Logo';

interface PrivacyPolicyViewProps {
  onBack: () => void;
}

export const PrivacyPolicyView: React.FC<PrivacyPolicyViewProps> = ({ onBack }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6 sm:space-y-8">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Kembali ke Beranda Karir</span>
      </button>

      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-xs space-y-6 sm:space-y-8">
        <div>
          <span className="inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 mb-2">
            Kebijakan Perlindungan Data
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Kebijakan Privasi & Pemrosesan Data Pelamar
          </h1>
          <p className="text-xs text-slate-500 mt-1.5">
            PT Semoga Kerja Recruitment Management System • Jakarta, Indonesia
          </p>
        </div>

        <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl text-xs text-blue-900 leading-relaxed">
          <strong>Prinsip Kepatuhan:</strong> Kebijakan ini merupakan pedoman transparansi pemrosesan data pelamar kerja PT Semoga Kerja sesuai prinsip perlindungan data pribadi di Indonesia. Seluruh data lamaran Anda disimpan secara aman dan terenkripsi.
        </div>

        <section className="space-y-2.5">
          <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
            <Database className="w-4 h-4 text-blue-600" />
            <span>1. Data Pribadi yang Kami Kumpulkan</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Dalam rangka mengevaluasi kualifikasi kerja Anda, kami mengumpulkan data yang Anda berikan melalui formulir pendaftaran:
          </p>
          <ul className="list-disc pl-5 text-xs sm:text-sm text-slate-600 space-y-1 leading-relaxed">
            <li>Identitas diri: Nama lengkap, alamat email aktif, nomor WhatsApp, domisili kota tempat tinggal.</li>
            <li>Riwayat pendidikan: Tingkat pendidikan terakhir, nama program studi/jurusan.</li>
            <li>Riwayat pekerjaan: Pengalaman kerja, magang, portofolio kerja, keterampilan teknis.</li>
            <li>Dokumen lampiran: Berkas Resume / Curriculum Vitae (CV) dalam format PDF atau DOCX.</li>
          </ul>
        </section>

        <section className="space-y-2.5">
          <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-blue-600" />
            <span>2. Tujuan Pemrosesan Data</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Data pribadi Anda hanya digunakan untuk tujuan administratif dan operasional rekrutmen:
          </p>
          <ul className="list-disc pl-5 text-xs sm:text-sm text-slate-600 space-y-1 leading-relaxed">
            <li>Menilai kesesuaian kualifikasi dan kompetensi Anda terhadap posisi yang dilamar.</li>
            <li>Mengirimkan konfirmasi penerimaan berkas lamaran dan pembaruan tahapan seleksi via email resmi dan WhatsApp.</li>
            <li>Mengatur jadwal wawancara, tes kompetensi, dan penawaran kerja (offering).</li>
            <li>Pencatatan rekapitulasi audit dan administrasi HRD internal.</li>
          </ul>
        </section>

        <section className="space-y-2.5">
          <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
            <Lock className="w-4 h-4 text-blue-600" />
            <span>3. Kerahasiaan & Hak Akses</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Akses terhadap data lamaran dan berkas CV Anda dibatasi secara ketat hanya kepada tim rekrutmen dan pejabat HRD berwenang. Kami tidak pernah membagikan atau menjual data Anda kepada pihak ketiga untuk kepentingan komersial atau periklanan.
          </p>
        </section>

        <section className="space-y-2.5">
          <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            <span>4. Periode Penyimpanan & Retensi Data</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Data lamaran disimpan secara persisten di basis data terenkripsi selama periode retensi aktif (default 12 bulan) untuk kebutuhan talent pool bila terdapat peluang kerja serupa di masa mendatang.
          </p>
        </section>

        <section className="space-y-2.5">
          <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>5. Hak Pemilik Data</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Sebagai pelamar, Anda memiliki hak untuk memeriksa status proses lamaran menggunakan Nomor Referensi resmi, memohon perbaikan data kontak, atau mengajukan penarikan diri dari proses seleksi.
          </p>
        </section>

        <section className="space-y-2.5 border-t border-slate-200 pt-6">
          <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
            <Mail className="w-4 h-4 text-blue-600" />
            <span>6. Kontak Tim Rekrutmen</span>
          </h2>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 space-y-1">
            <p><strong className="text-slate-900">PT Semoga Kerja - Human Resources Department</strong></p>
            <p>Email Resmi: recruitment@semogakerja.co.id</p>
            <p>Alamat: Gedung Graha Semoga Kerja Lt. 8, Jl. Jend. Sudirman Kav. 25, Jakarta Selatan</p>
          </div>
        </section>
      </div>
    </div>
  );
};
