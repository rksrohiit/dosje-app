import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, FileText, ChevronRight, Star, X, Printer, ShieldCheck } from 'lucide-react';
import { api } from '../utils/api';
import toast from 'react-hot-toast';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        const res = await api.reports.getAll();
        if (res.data && res.data.length > 0) {
          setReports(res.data);
        } else {
          setReports([
            { id: 'rep1', ngo_name: 'Delhi NGO - SMILE Scheme', inspector_name: 'Priya Sharma', title: 'Quarterly Safety Audit', rating: 4, findings: 'Clean dormitories, functional CCTV, verified attendance.', recommendation: 'Release Next Grant Installment', created_at: new Date().toISOString() },
            { id: 'rep2', ngo_name: 'Mumbai Support - DAP Scheme', inspector_name: 'Priya Sharma', title: 'Surprise On-Site Verification', rating: 5, findings: 'Headcount matches digital attendance. Excellent infrastructure.', recommendation: 'Full Compliance Certified', created_at: new Date(Date.now() - 86400000).toISOString() },
            { id: 'rep3', ngo_name: 'Chennai Aid - SHG Scheme', inspector_name: 'Priya Sharma', title: 'Attendance Audit', rating: 3, findings: 'Minor register discrepancy resolved during audit.', recommendation: 'Follow-up Inspection in 30 Days', created_at: new Date(Date.now() - 172800000).toISOString() },
          ]);
        }
      } catch (e) {
        setReports([
          { id: 'rep1', ngo_name: 'Delhi NGO - SMILE Scheme', inspector_name: 'Priya Sharma', title: 'Quarterly Safety Audit', rating: 4, findings: 'Clean dormitories, functional CCTV, verified attendance.', recommendation: 'Release Next Grant Installment', created_at: new Date().toISOString() },
          { id: 'rep2', ngo_name: 'Mumbai Support - DAP Scheme', inspector_name: 'Priya Sharma', title: 'Surprise On-Site Verification', rating: 5, findings: 'Headcount matches digital attendance. Excellent infrastructure.', recommendation: 'Full Compliance Certified', created_at: new Date(Date.now() - 86400000).toISOString() },
          { id: 'rep3', ngo_name: 'Chennai Aid - SHG Scheme', inspector_name: 'Priya Sharma', title: 'Attendance Audit', rating: 3, findings: 'Minor register discrepancy resolved during audit.', recommendation: 'Follow-up Inspection in 30 Days', created_at: new Date(Date.now() - 172800000).toISOString() },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const filteredReports = reports.filter((r) =>
    (r.ngo_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.title || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Container */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-5 md:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Official Inspection Audit Reports
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable geo-tagged field verification reports submitted by PMU inspection teams
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search NGO or Report..."
              className="w-full pl-9 pr-4 py-2 text-xs md:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50"
            />
          </div>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-xs md:text-sm font-bold shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print / Export PDF
          </button>
        </div>
      </div>

      {/* Reports Table / Mobile Scroll Container */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[650px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[11px] font-bold tracking-wider">
                <th className="p-4">Report ID</th>
                <th className="p-4">NGO / Institute</th>
                <th className="p-4">Auditor</th>
                <th className="p-4">Date</th>
                <th className="p-4">Compliance Rating</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredReports.map((report) => (
                <tr key={report.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4 text-xs font-mono font-bold text-slate-900">{report.id}</td>
                  <td className="p-4 text-xs md:text-sm font-semibold text-slate-800">{report.ngo_name || 'Delhi NGO'}</td>
                  <td className="p-4 text-xs text-slate-600">{report.inspector_name || 'PMU Team'}</td>
                  <td className="p-4 text-xs text-slate-500 font-mono">
                    {new Date(report.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1 text-amber-500">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < (report.rating || 4) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                      ))}
                      <span className="text-xs font-bold text-slate-700 ml-1">({report.rating || 4}/5)</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => setSelectedReport(report)}
                      className="inline-flex items-center text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors"
                    >
                      View Report <ChevronRight className="w-3.5 h-3.5 ml-1" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-2xl overflow-hidden shadow-2xl space-y-4 p-6">
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-blue-100 text-blue-800 uppercase tracking-widest">
                  DoSJE Official Inspection Audit
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1">{selectedReport.title || 'Field Audit Report'}</h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">Report ID: #{selectedReport.id}</p>
              </div>
              <button onClick={() => setSelectedReport(null)} className="p-1 text-slate-400 hover:text-slate-900">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-3 text-xs md:text-sm text-slate-700">
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <p className="text-slate-400 text-[10px] font-bold uppercase">Target Institute</p>
                  <p className="font-bold text-slate-800">{selectedReport.ngo_name}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-[10px] font-bold uppercase">Inspector Officer</p>
                  <p className="font-bold text-slate-800">{selectedReport.inspector_name}</p>
                </div>
              </div>

              <div>
                <p className="font-bold text-slate-900 mb-1">Audit Findings & Observations:</p>
                <p className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 leading-relaxed">
                  {selectedReport.findings}
                </p>
              </div>

              <div>
                <p className="font-bold text-slate-900 mb-1">Official Recommendation:</p>
                <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-800 font-bold text-xs rounded-lg border border-emerald-200">
                  ✅ {selectedReport.recommendation}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
              <button
                onClick={() => window.print()}
                className="bg-slate-900 text-white px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-2"
              >
                <Printer className="w-4 h-4" /> Print Copy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
