import React from 'react';
import { AuditLog } from '../../types/recruitment';

interface HrdAuditTabProps {
  auditLogs: AuditLog[];
  onRefreshLogs: () => Promise<void>;
}

export const HrdAuditTab: React.FC<HrdAuditTabProps> = ({ auditLogs, onRefreshLogs }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Jejak Audit Aktivitas HRD (Audit Trail)</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Log permanen untuk setiap tindakan sensitif (login, perubahan lowongan, perubahan status pelamar, ekspor data).
          </p>
        </div>
        <button
          onClick={() => onRefreshLogs()}
          className="text-xs text-blue-600 hover:text-blue-800 font-bold cursor-pointer"
        >
          Perbarui Log
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">Waktu (Timestamp)</th>
                <th className="px-4 py-3">Jenis Tindakan</th>
                <th className="px-4 py-3">Pelaku (Pengguna)</th>
                <th className="px-4 py-3">Rincian Operasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {auditLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-slate-400">
                    Belum ada catatan aktivitas audit.
                  </td>
                </tr>
              ) : (
                auditLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString('id-ID')}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-mono font-bold text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-800">
                      <p className="font-bold">{log.performedBy}</p>
                      <span className="text-[10px] text-slate-400">{log.performedByEmail}</span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-700 leading-relaxed">
                      {log.details}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
