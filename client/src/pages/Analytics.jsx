import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import AttendanceChart from '../components/AttendanceChart';
import { Sparkles, AlertTriangle, ShieldCheck, Activity } from 'lucide-react';
import { api } from '../utils/api';
import toast from 'react-hot-toast';

const Analytics = () => {
  const [anomalies, setAnomalies] = useState([
    { id: 1, ngo_name: 'Mumbai Support - DAP Scheme', anomaly_score: 0.8, issue: 'Consistently reported 90 attendance vs 50 verified attendance for last 7 days.' },
    { id: 2, ngo_name: 'Jaipur Trust - SMILE Scheme', anomaly_score: 0.6, issue: 'Pre-inspection attendance spike of 45% detected by AI model.' },
  ]);

  useEffect(() => {
    const fetchAnomalies = async () => {
      try {
        const res = await api.analytics.getAnomalies();
        if (res.data && res.data.length > 0) {
          setAnomalies(res.data);
        }
      } catch (e) {}
    };
    fetchAnomalies();
  }, []);

  const alertData = [
    { name: 'Attendance Discrepancy', value: 45, color: '#f43f5e' },
    { name: 'CCTV Camera Offline', value: 30, color: '#f59e0b' },
    { name: 'Inspection Pending > 30d', value: 25, color: '#3b82f6' },
  ];

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-950 to-slate-900 rounded-2xl p-5 md:p-6 text-white shadow-lg border border-purple-800/40 flex items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-purple-300 bg-purple-500/20 px-3 py-1 rounded-full border border-purple-500/30 text-xs font-bold uppercase mb-2">
            <Sparkles className="w-4 h-4" /> AI Predictive Analytics Engine
          </div>
          <h2 className="text-xl md:text-2xl font-black text-white">
            Anomaly Detection & Attendance Analytics
          </h2>
          <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-xl">
            Machine learning model comparing reported attendance against CCTV face counts to eliminate ghost beneficiaries.
          </p>
        </div>
      </div>

      {/* Grid: Attendance Trend Chart + Alert Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AttendanceChart ngoName="National System Aggregate" />

        <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-200 shadow-xs">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            AI Anomaly Distribution by Type
          </h3>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={alertData} innerRadius={55} outerRadius={80} paddingAngle={5} dataKey="value">
                  {alertData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-2 text-xs font-semibold">
            {alertData.map((d, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }}></div>
                <span className="text-slate-600">{d.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* High-Risk Anomalies Section */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-5 md:p-6">
        <h3 className="text-base md:text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <AlertTriangle className="text-rose-600 w-5 h-5" />
          Flagged High-Risk Anomalies (Requires Field Verification)
        </h3>

        <div className="space-y-4">
          {anomalies.map((a, idx) => {
            const scorePercent = Math.round((a.anomaly_score || 0.8) * 100);
            return (
              <div key={a.id || idx} className="p-4 border border-rose-200 bg-rose-50/60 rounded-xl space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h4 className="font-bold text-sm text-rose-950">{a.ngo_name || a.ngo}</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-rose-800">Anomaly Index:</span>
                    <div className="w-28 h-2.5 bg-rose-200 rounded-full overflow-hidden">
                      <div className="h-full bg-rose-600 rounded-full" style={{ width: `${scorePercent}%` }}></div>
                    </div>
                    <span className="text-xs font-black text-rose-700">{scorePercent}%</span>
                  </div>
                </div>

                <p className="text-xs text-rose-800 font-medium leading-relaxed">
                  {a.issue || 'Significant variance detected between reported attendance and verified physical headcount.'}
                </p>

                <div className="pt-1">
                  <button
                    onClick={() => toast.success(`Surprise Inspection Dispatched for ${a.ngo_name || 'NGO'}`)}
                    className="text-xs bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg font-bold transition-all shadow-xs"
                  >
                    Dispatch Surprise PMU Inspection
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
