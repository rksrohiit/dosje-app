import React, { useState, useEffect } from 'react';
import { Building2, Activity, ClipboardCheck, AlertCircle, Camera, ShieldCheck, MapPin, Download, Layers } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import StatsCard from '../components/StatsCard';
import NGOMap from '../components/NGOMap';
import LiveAlertFeed from '../components/LiveAlertFeed';
import { api } from '../utils/api';
import { useSocket } from '../context/SocketContext';
import { generateTechStackPDF } from '../utils/techStackPdfGenerator';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [stats, setStats] = useState({
    total_ngos: 10,
    active_projects: 10,
    inspections_today: 8,
    alerts_count: 10,
    compliance_avg: 84.9,
    live_cameras: 20
  });

  const [recentActivity, setRecentActivity] = useState([
    { id: '1', desc: 'Inspection completed for Delhi NGO', created_at: new Date().toISOString(), event_type: 'inspection' },
    { id: '2', desc: 'High attendance anomaly detected in Mumbai Support', created_at: new Date(Date.now() - 3600000).toISOString(), event_type: 'alert' },
    { id: '3', desc: 'Daily attendance count submitted by Kolkata Care', created_at: new Date(Date.now() - 7200000).toISOString(), event_type: 'attendance' },
  ]);

  const [complianceData, setComplianceData] = useState([
    { name: 'Chennai Aid', compliance_score: 98 },
    { name: 'Lucknow Vision', compliance_score: 96 },
    { name: 'Jaipur Trust', compliance_score: 93 },
    { name: 'Delhi NGO', compliance_score: 78 },
    { name: 'Mumbai Support', compliance_score: 74 },
  ]);

  const { socket } = useSocket();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const statsRes = await api.dashboard.getStats();
        if (statsRes.data) setStats(statsRes.data);
      } catch (e) {}

      try {
        const actRes = await api.dashboard.getRecentActivity();
        if (actRes.data && actRes.data.length > 0) setRecentActivity(actRes.data);
      } catch (e) {}

      try {
        const compRes = await api.analytics.getCompliance();
        if (compRes.data && compRes.data.length > 0) setComplianceData(compRes.data.slice(0, 5));
      } catch (e) {}
    };

    fetchDashboardData();

    if (socket) {
      socket.emit('dashboard_subscribe');
      socket.on('new_alert', () => fetchDashboardData());
      socket.on('inspection_update', () => fetchDashboardData());
    }

    return () => {
      if (socket) {
        socket.off('new_alert');
        socket.off('inspection_update');
      }
    };
  }, [socket]);

  const handleDownloadTechStack = () => {
    toast.success('Generating Complete Technology Stack PDF Document...');
    generateTechStackPDF();
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-900 rounded-2xl p-5 md:p-6 text-white shadow-lg border border-blue-800/40">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-widest">
                Central Monitoring Portal
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">
              Department of Social Justice and Empowerment
            </h2>
            <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-2xl">
              Live CCTV stream integration, AI-driven inspection assignment, and real-time beneficiary compliance monitoring across India.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleDownloadTechStack}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-2 active:scale-95"
            >
              <Layers className="w-4 h-4" /> Download Tech Stack PDF
            </button>

            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/15">
              <ShieldCheck className="w-5 h-5 text-amber-400 flex-shrink-0" />
              <div>
                <p className="text-[9px] uppercase font-bold text-slate-300">National Compliance</p>
                <p className="text-sm font-extrabold text-white">{stats.compliance_avg}%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards Grid (Responsive 1 -> 2 -> 4 cols) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatsCard title="Total Monitored NGOs" value={stats.total_ngos} icon={Building2} color="blue" trend="up" trendValue="100% Active" />
        <StatsCard title="Active CCTV Feeds" value={stats.live_cameras} icon={Camera} color="green" trend="up" trendValue="Live 24/7" />
        <StatsCard title="Today's Inspections" value={stats.inspections_today} icon={ClipboardCheck} color="orange" subtitle="Tasks assigned" />
        <StatsCard title="Unread AI Alerts" value={stats.alerts_count} icon={AlertCircle} color="red" trend="down" trendValue="Requires Action" />
      </div>

      {/* Map & Live Alert Feed (2 cols desktop, stacked mobile) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-slate-800 text-sm md:text-base">Geographic Project Distribution & Status</h3>
            </div>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded">10 States Monitored</span>
          </div>
          <div className="rounded-xl overflow-hidden shadow-xs border border-slate-200">
            <NGOMap />
          </div>
        </div>

        <div className="lg:col-span-1">
          <LiveAlertFeed />
        </div>
      </div>

      {/* Activity & Compliance Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity Feed */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 md:p-6">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            Recent Activity Audit Trail
          </h3>
          <div className="space-y-3">
            {recentActivity.map((activity, idx) => (
              <div key={activity.id || idx} className="flex items-start gap-3 p-3 hover:bg-slate-50 rounded-lg border border-slate-100 transition-colors">
                <div className={`w-2.5 h-2.5 mt-1.5 rounded-full flex-shrink-0 ${
                  activity.event_type === 'alert' ? 'bg-rose-500' : (activity.event_type === 'inspection' ? 'bg-blue-600' : 'bg-emerald-600')
                }`}></div>
                <div className="flex-1 min-w-0">
                  <p className="text-slate-800 text-xs md:text-sm font-medium leading-snug">{activity.desc}</p>
                  <span className="text-[11px] text-slate-400 font-mono mt-0.5 block">
                    {new Date(activity.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Compliance Leaderboard */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 md:p-6">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center justify-between">
            <span>NGO Compliance Score Ranking</span>
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-100">Top Institutes</span>
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={complianceData} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 11, fill: '#334155', fontWeight: 600 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="compliance_score" radius={[0, 6, 6, 0]} barSize={20}>
                  {complianceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.compliance_score > 85 ? '#10b981' : (entry.compliance_score > 70 ? '#3b82f6' : '#f59e0b')} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
