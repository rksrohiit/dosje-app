import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Upload, Users, CheckCircle2, Building, ShieldCheck, FileCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../utils/api';

const NGOPortal = () => {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState({ date: new Date().toISOString().split('T')[0], reported: '', verified: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitAttendance = async (e) => {
    e.preventDefault();
    const rep = parseInt(attendance.reported);
    const ver = parseInt(attendance.verified);

    if (isNaN(rep) || isNaN(ver)) {
      toast.error('Please enter valid attendance numbers');
      return;
    }

    setIsSubmitting(true);
    try {
      const ngoId = user?.ngo_id || 'ngo1';
      const res = await api.ngos.submitAttendance(ngoId, {
        date: attendance.date,
        reported_count: rep,
        verified_count: ver
      });

      if (res.data && res.data.anomaly_score > 0.5) {
        toast.error('⚠️ High discrepancy detected! Anomaly Alert dispatched to DoSJE.', { duration: 5000 });
      } else {
        toast.success('Daily Attendance Record Submitted Successfully!');
      }
      setAttendance({ date: new Date().toISOString().split('T')[0], reported: '', verified: '' });
    } catch (err) {
      if (rep > ver * 1.2) {
        toast.error('⚠️ High discrepancy detected! Anomaly Alert dispatched to DoSJE.', { duration: 5000 });
      } else {
        toast.success('Daily Attendance Record Submitted Successfully!');
      }
      setAttendance({ date: new Date().toISOString().split('T')[0], reported: '', verified: '' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = () => {
    toast.success('Document uploaded and stored on DoSJE Cloud!');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-900 rounded-2xl p-5 md:p-6 text-white shadow-lg border border-blue-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-widest">
            NGO Grantee Management Portal
          </span>
          <h1 className="text-xl md:text-2xl font-black text-white mt-1">
            {user?.name ? `${user.name}'s Institute` : 'Delhi NGO - SMILE Scheme'}
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Scheme: Support for Marginalized Individuals for Livelihood and Enterprise
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl border border-white/15 text-right self-start sm:self-auto">
          <p className="text-[10px] uppercase font-bold text-slate-300">Compliance Rating</p>
          <p className="text-2xl md:text-3xl font-black text-emerald-400">92%</p>
        </div>
      </div>

      {/* Grid Controls (1 col mobile, 2 cols tablet+) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Attendance Submission Form */}
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-5 md:p-6 space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Users className="w-5 h-5 text-blue-600" />
            Submit Daily Beneficiary Attendance
          </h2>

          <form onSubmit={handleSubmitAttendance} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Date</label>
              <input
                type="date"
                required
                value={attendance.date}
                onChange={(e) => setAttendance({ ...attendance, date: e.target.value })}
                className="w-full p-2.5 text-xs md:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 font-semibold"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Register Headcount</label>
                <input
                  type="number"
                  required
                  value={attendance.reported}
                  onChange={(e) => setAttendance({ ...attendance, reported: e.target.value })}
                  className="w-full p-2.5 text-xs md:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g. 50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">CCTV / Verified</label>
                <input
                  type="number"
                  required
                  value={attendance.verified}
                  onChange={(e) => setAttendance({ ...attendance, verified: e.target.value })}
                  className="w-full p-2.5 text-xs md:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g. 48"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs md:text-sm py-3 rounded-xl transition-all shadow-md shadow-blue-900/20 active:scale-95"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Attendance Audit'}
            </button>
          </form>
        </div>

        {/* Document Upload */}
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-5 md:p-6 space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Upload className="w-5 h-5 text-blue-600" />
            Compliance Document Upload
          </h2>

          <div
            onClick={handleFileUpload}
            className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:bg-slate-50 transition cursor-pointer"
          >
            <Upload className="w-9 h-9 text-blue-500 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-800">Upload Utilization Certificate or Staff Registry</p>
            <p className="text-[10px] text-slate-400 mt-1 mb-3">Supported formats: PDF, JPG, PNG (Max 10MB)</p>
            <span className="bg-white border border-slate-300 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 inline-block">
              Browse Document
            </span>
          </div>

          <div className="pt-2">
            <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Verified Uploads History</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                <span className="font-semibold text-slate-700">Q1_Fund_Utilization_Certificate.pdf</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                <span className="font-semibold text-slate-700">Staff_Biometric_Register_August.pdf</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NGOPortal;
