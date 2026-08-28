import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AttendanceChart = ({ data, ngoName }) => {
  // Use mock data if none provided
  const chartData = data || [
    { date: '01/05', reported_count: 45, verified_count: 45 },
    { date: '02/05', reported_count: 46, verified_count: 46 },
    { date: '03/05', reported_count: 48, verified_count: 42 },
    { date: '04/05', reported_count: 50, verified_count: 40 },
    { date: '05/05', reported_count: 49, verified_count: 49 },
    { date: '06/05', reported_count: 47, verified_count: 46 },
    { date: '07/05', reported_count: 45, verified_count: 45 },
  ];

  return (
    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm w-full h-[350px]">
      <div className="mb-4">
        <h3 className="font-semibold text-gray-800">Attendance Verification Trend</h3>
        {ngoName && <p className="text-sm text-gray-500">{ngoName}</p>}
      </div>
      <div className="h-[260px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
            <Line 
              name="Reported by NGO"
              type="monotone" 
              dataKey="reported_count" 
              stroke="#3b82f6" 
              strokeWidth={3}
              dot={{ r: 4, strokeWidth: 2 }}
              activeDot={{ r: 6 }}
            />
            <Line 
              name="AI Verified (CCTV)"
              type="monotone" 
              dataKey="verified_count" 
              stroke="#10b981" 
              strokeWidth={3}
              dot={{ r: 4, strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AttendanceChart;
