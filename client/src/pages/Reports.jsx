import React, { useState } from 'react';
import { Search, Filter, Download, FileText, ChevronRight } from 'lucide-react';

const Reports = () => {
  const [reports] = useState([
    { id: 'RPT-2024-001', ngo: 'Hope Foundation', date: '2024-05-15', inspector: 'John Doe', score: 92, status: 'Approved' },
    { id: 'RPT-2024-002', ngo: 'Care India', date: '2024-05-14', inspector: 'Jane Smith', score: 65, status: 'Review Needed' },
    { id: 'RPT-2024-003', ngo: 'HelpAge', date: '2024-05-12', inspector: 'John Doe', score: 85, status: 'Approved' },
  ]);

  const getStatusColor = (status) => {
    return status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <FileText className="text-blue-600" /> Inspection Reports
        </h2>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search NGOs..." className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
          </div>
          <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Filter className="w-5 h-5 text-gray-600" />
          </button>
          <button onClick={() => window.print()} className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 text-sm font-medium">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="p-4 text-sm font-semibold text-gray-600">Report ID</th>
              <th className="p-4 text-sm font-semibold text-gray-600">NGO Name</th>
              <th className="p-4 text-sm font-semibold text-gray-600">Date</th>
              <th className="p-4 text-sm font-semibold text-gray-600">Inspector</th>
              <th className="p-4 text-sm font-semibold text-gray-600">Score</th>
              <th className="p-4 text-sm font-semibold text-gray-600">Status</th>
              <th className="p-4 text-sm font-semibold text-gray-600">Action</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr key={report.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="p-4 text-sm font-medium text-gray-900">{report.id}</td>
                <td className="p-4 text-sm text-gray-700">{report.ngo}</td>
                <td className="p-4 text-sm text-gray-500">{report.date}</td>
                <td className="p-4 text-sm text-gray-700">{report.inspector}</td>
                <td className="p-4 text-sm font-semibold text-gray-900">{report.score}%</td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                    {report.status}
                  </span>
                </td>
                <td className="p-4">
                  <button className="text-blue-600 hover:text-blue-800 flex items-center text-sm font-medium">
                    View <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="p-4 border-t border-gray-200 flex justify-between items-center text-sm text-gray-500">
        <span>Showing 1 to {reports.length} of {reports.length} entries</span>
        <div className="flex gap-1">
          <button className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50" disabled>Prev</button>
          <button className="px-3 py-1 border rounded bg-blue-50 text-blue-600 border-blue-200">1</button>
          <button className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50" disabled>Next</button>
        </div>
      </div>
    </div>
  );
};

export default Reports;
