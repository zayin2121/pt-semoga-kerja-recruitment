import React, { useState } from 'react';
import { Play, CheckCircle2, XCircle, RefreshCw, Terminal } from 'lucide-react';
import { TestResultItem, Job } from '../../types/recruitment';
import { runAutomatedTests } from '../../services/testSuiteService';

interface HrdTestingTabProps {
  jobs: Job[];
}

export const HrdTestingTab: React.FC<HrdTestingTabProps> = ({ jobs }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestResultItem[]>([]);
  const [hasRun, setHasRun] = useState(false);

  const handleRunTests = async () => {
    setIsRunning(true);
    setResults([]);
    try {
      const testOutputs = await runAutomatedTests(jobs);
      setResults(testOutputs);
      setHasRun(true);
    } catch (err) {
      console.error('Error running test runner:', err);
    } finally {
      setIsRunning(false);
    }
  };

  const passedCount = results.filter(r => r.status === 'passed').length;
  const failedCount = results.filter(r => r.status === 'failed').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-slate-900">Suite Pengujian & Verifikasi Otomatis (QA Runner)</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Menjalankan checklist pengujian wajib (Form, Autentikasi, Screening, Gmail API, Pipeline, dan Anti-Duplikasi).
          </p>
        </div>
        <button
          disabled={isRunning}
          onClick={handleRunTests}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          {isRunning ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Menjalankan Pengujian...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-white" />
              <span>Jalankan Seluruh Pengujian</span>
            </>
          )}
        </button>
      </div>

      {/* Summary Scorecard if run */}
      {hasRun && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Total Skenario Diuji</span>
              <p className="text-xl font-bold text-slate-900">{results.length} Kasus Uji</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Lolos (Passed)</span>
              <p className="text-xl font-bold text-emerald-600">{passedCount} Skenario</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              failedCount === 0 ? 'bg-slate-50 text-slate-400' : 'bg-red-50 text-red-600'
            }`}>
              <XCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Gagal (Failed)</span>
              <p className={`text-xl font-bold ${failedCount === 0 ? 'text-slate-400' : 'text-red-600'}`}>
                {failedCount} Skenario
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Test List Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <span className="font-bold text-xs uppercase tracking-wider text-slate-600">
            Daftar Modul & Hasil Uji Verifikasi
          </span>
          {hasRun && (
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              {passedCount}/{results.length} Verifikasi Berhasil (100%)
            </span>
          )}
        </div>
        <div className="divide-y divide-slate-100 text-xs">
          {!hasRun && !isRunning ? (
            <div className="p-12 text-center text-slate-400">
              <p className="font-bold text-slate-600">Suite Pengujian Belum Dijalankan</p>
              <p className="text-[11px] mt-1">
                Klik tombol "Jalankan Seluruh Pengujian" di atas untuk memvalidasi form, database, otorisasi, screening, dan integrasi Gmail secara live.
              </p>
            </div>
          ) : (
            results.map(test => (
              <div key={test.id} className="p-4 flex items-start justify-between gap-4 hover:bg-slate-50/60 transition-colors">
                <div className="flex items-start gap-3">
                  {test.status === 'passed' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                        {test.id}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-400">{test.category}</span>
                      <span className="font-bold text-slate-900 text-xs">{test.title}</span>
                    </div>
                    <p className={`text-[11px] mt-1 ${test.status === 'passed' ? 'text-slate-600' : 'text-red-600 font-semibold'}`}>
                      {test.message}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                      test.status === 'passed'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-red-50 text-red-700 border-red-200'
                    }`}
                  >
                    {test.status}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-1">
                    {test.durationMs} ms
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
