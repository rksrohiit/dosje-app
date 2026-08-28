import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import AttendanceChart from '../components/AttendanceChart';
import { Sparkles, AlertTriangle } from 'lucide-react';

const Analytics = () => {
  const alertData = [
    { name: 'Attendance Drop', value: 45, color: '#ef4444' },
    { name: 'Compliance Issue', value: 30, color: '#f59e0b' },
    { name: 'Documentation Missing', value: 25, color: '#3b82f6' },
  ];

  const anomalies = [
    { id: 1, ngo: 'Care India', score: 85, issue: 'Consistent 30% gap between reported and CCTV verified attendance for last 5 days.' },
    { id: 2, ngo: 'EduTrust', score: 72, issue: 'Night-time motion detected in restricted zones on multiple occasions.' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6 text-purple-700 bg-purple-50 px-4 py-2 rounded-lg border border-purple-100 inline-flex">
        <Sparkles className="w-5 h-5" />
        <span className="font-semibold">AI-Powered Insights & Anomaly Detection</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AttendanceChart ngoName="System-wide Aggregate" />
        
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4">Alert Distribution</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={alertData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {alertData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-4 text-sm">
            {alertData.map((d, i) => (
              <div key={i} className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }}></div>
                <span className="text-gray-600">{d.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <AlertTriangle className="text-red-500" /> High-Risk Anomalies Detected
        </h3>
        <div className="space-y-4">
          {anomalies.map(a => (
            <div key={a.id} className="p-4 border border-red-100 bg-red-50 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-red-900">{a.ngo}</h4>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-red-800">Anomaly Score:</span>
                  <div className="w-32 h-2 bg-red-200 rounded-full overflow-hidden">
                    <div className="h-full bg-red-600" style={{ width: `${a.score}%` }}></div>
                  </div>
                  <span className="text-sm font-bold text-red-700">{a.score}/100</span>
                </div>
              </div>
              <p className="text-sm text-red-700">{a.issue}</p>
              <div className="mt-3">
                <button className="text-xs bg-red-600 text-white px-3 py-1.5 rounded font-medium hover:bg-red-700 transition">Schedule Immediate Inspection</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
