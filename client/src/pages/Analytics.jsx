import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import AttendanceChart from '../components/AttendanceChart';
import CCTVHeadcountAnalyzer from '../components/CCTVHeadcountAnalyzer';
import { Sparkles, AlertTriangle, ShieldCheck, Activity, ShieldAlert, BarChart3 } from 'lucide-react';
import { api } from '../utils/api';
import toast from 'react-hot-toast';

const Analytics = () => {
  const [anomalies, setAnomalies] = useState([
    { id: 1, ngo_name: 'Mumbai Support - DAP Scheme', anomaly_score: 0.8, issue: 'Consistently reported 90 attendance vs 50 verified attendance for last 7 days.' },
    { id: 2, ngo_name: 'Jaipur Trust - SMILE Scheme', anomaly_score: 0.6, issue: 'Pre-inspection attendance spike of 45% detected by AI model.' },
  ]);

  const [fraudRisks, setFraudRisks] = useState([
    { id: '1', name: 'Mumbai Support - DAP Scheme', state: 'Maharashtra', score: 88, tier: 'CRITICAL', action: 'Freeze Grant & Dispatch Emergency Inspection', variance: '38.2%' },
    { id: '2', name: 'Bhopal Outreach - DAP Scheme', state: 'Madhya Pradesh', score: 76, tier: 'CRITICAL', action: 'Freeze Grant Disbursement', variance: '29.5%' },
    { id: '3', name: 'Jaipur Trust - SMILE Scheme', state: 'Rajasthan', score: 62, tier: 'HIGH', action: 'Require Live CCTV Stream Audit', variance: '21.0%' },
    { id: '4', name: 'Delhi NGO - SMILE Scheme', state: 'Delhi', score: 28, tier: 'LOW', action: 'Routine Monitoring', variance: '4.1%' },
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
            AI Vision & NGO Fraud Risk Indexing Engine
          </h2>
          <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-2xl">
            Multi-variable machine learning scoring attendance variance, budget claims, EXIF metadata, and audit failure rates.
          </p>
        </div>
      </div>

      {/* CCTV Headcount Analyzer Overlay */}
      <CCTVHeadcountAnalyzer cameraName="Delhi NGO Main Dining Hall Feed" reportedCount={50} />

      {/* NGO Fraud Risk Indexing Engine Table */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-5 md:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <span className="px-2.5 py-0.5 rounded text-[10px] font-black bg-rose-100 text-rose-800 uppercase tracking-widest">
              AI Risk Matrix
            </span>
            <h3 className="text-base md:text-lg font-black text-slate-900 flex items-center gap-2 mt-1">
              <ShieldAlert className="w-5 h-5 text-rose-600" />
              NGO Fraud Risk Indexing Leaderboard
            </h3>
          </div>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-lg self-start sm:self-auto">
            Algorithm Version 3.4
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[650px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[11px] font-bold tracking-wider">
                <th className="p-3.5">NGO / Institute Name</th>
                <th className="p-3.5">State</th>
                <th className="p-3.5">Fraud Risk Index</th>
                <th className="p-3.5">Risk Tier</th>
                <th className="p-3.5">Recommended AI Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs md:text-sm">
              {fraudRisks.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3.5 font-bold text-slate-900">{item.name}</td>
                  <td className="p-3.5 font-semibold text-slate-600">{item.state}</td>
                  <td className="p-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${item.score >= 75 ? 'bg-rose-600' : (item.score >= 50 ? 'bg-amber-500' : 'bg-emerald-500')}`}
                          style={{ width: `${item.score}%` }}
                        ></div>
                      </div>
                      <span className="font-mono font-black text-slate-900">{item.score}/100</span>
                    </div>
                  </td>
                  <td className="p-3.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      item.tier === 'CRITICAL' ? 'bg-rose-100 text-rose-800 border border-rose-300' : (
                        item.tier === 'HIGH' ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      )
                    }`}>
                      {item.tier}
                    </span>
                  </td>
                  <td className="p-3.5 text-xs font-semibold text-slate-700">{item.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
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
    </div>
  );
};

export default Analytics;
