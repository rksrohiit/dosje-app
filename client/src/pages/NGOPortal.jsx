import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Upload, Users, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

const NGOPortal = () => {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState({ reported: '', verified: '' });

  const handleSubmitAttendance = (e) => {
    e.preventDefault();
    if(attendance.reported > parseInt(attendance.verified) + 10) {
      toast.error('High discrepancy between reported and verified attendance. This will be flagged.');
    } else {
      toast.success('Daily attendance submitted successfully!');
    }
    setAttendance({ reported: '', verified: '' });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex justify-between items-center bg-gradient-to-r from-blue-50 to-white">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome, Hope Foundation</h1>
          <p className="text-gray-600 mt-1">Scheme: Grant-in-Aid for Senior Citizens</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Current Compliance Score</p>
          <p className="text-3xl font-bold text-green-600">92%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="text-blue-600" /> Submit Daily Attendance
          </h2>
          <form onSubmit={handleSubmitAttendance} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input type="date" required className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" defaultValue={new Date().toISOString().split('T')[0]} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Manual Register Count</label>
                <input type="number" required value={attendance.reported} onChange={e=>setAttendance({...attendance, reported: e.target.value})} className="w-full p-2 border border-gray-300 rounded-lg" placeholder="E.g. 45" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Biometric/Verified Count</label>
                <input type="number" required value={attendance.verified} onChange={e=>setAttendance({...attendance, verified: e.target.value})} className="w-full p-2 border border-gray-300 rounded-lg" placeholder="E.g. 45" />
              </div>
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white font-medium py-2 rounded-lg hover:bg-blue-700 transition">Submit Record</button>
          </form>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Upload className="text-blue-600" /> Document Upload
          </h2>
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-gray-50 transition cursor-pointer">
            <Upload className="w-10 h-10 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 font-medium">Drag & Drop files here</p>
            <p className="text-sm text-gray-500 mb-4">Supported: PDF, JPG, PNG (Max 5MB)</p>
            <span className="bg-white border border-gray-300 px-4 py-2 rounded-lg text-sm font-medium">Browse Files</span>
          </div>
          
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Recent Uploads</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-100">
                <span className="text-sm text-gray-700">Q1_Fund_Utilization.pdf</span>
                <CheckCircle2 className="w-4 h-4 text-green-500" />
              </div>
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-100">
                <span className="text-sm text-gray-700">Staff_Registry_May.pdf</span>
                <CheckCircle2 className="w-4 h-4 text-green-500" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NGOPortal;
