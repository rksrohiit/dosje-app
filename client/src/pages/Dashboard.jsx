import React, { useState, useEffect } from 'react';
import { Building2, Activity, ClipboardCheck, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import StatsCard from '../components/StatsCard';
import NGOMap from '../components/NGOMap';
import LiveAlertFeed from '../components/LiveAlertFeed';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalNGOs: 1240,
    activeProjects: 85,
    inspectionsToday: 12,
    unreadAlerts: 5
  });

  const recentActivity = [
    { id: 1, text: 'New inspection completed for Hope Foundation', time: '10 mins ago', type: 'inspection' },
    { id: 2, text: 'Anomaly detected in attendance at Care India', time: '1 hour ago', type: 'alert' },
    { id: 3, text: 'Quarterly report submitted by HelpAge', time: '3 hours ago', type: 'document' },
  ];

  const complianceData = [
    { name: 'Hope Found.', score: 95 },
    { name: 'Care India', score: 88 },
    { name: 'HelpAge', score: 75 },
    { name: 'Smile Org.', score: 60 },
    { name: 'EduTrust', score: 45 },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title="Total NGOs Monitored" value={stats.totalNGOs} icon={Building2} color="blue" trend="up" trendValue="12%" />
        <StatsCard title="Active Projects" value={stats.activeProjects} icon={Activity} color="green" trend="up" trendValue="5%" />
        <StatsCard title="Today's Inspections" value={stats.inspectionsToday} icon={ClipboardCheck} color="orange" />
        <StatsCard title="Unread Alerts" value={stats.unreadAlerts} icon={AlertCircle} color="red" trend="down" trendValue="2%" />
      </div>

      {/* Map and Alerts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-1 mb-2">
            <h3 className="font-semibold text-gray-800 p-3">Geographic Distribution & Live Status</h3>
          </div>
          <NGOMap />
        </div>
        <div className="lg:col-span-1">
          <LiveAlertFeed />
        </div>
      </div>

      {/* Activity and Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="w-2 h-2 mt-2 rounded-full bg-blue-500"></div>
                <div>
                  <p className="text-gray-800 text-sm">{activity.text}</p>
                  <span className="text-xs text-gray-500">{activity.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Bottom 5 NGOs (Compliance)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={complianceData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="score" fill="#ef4444" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
