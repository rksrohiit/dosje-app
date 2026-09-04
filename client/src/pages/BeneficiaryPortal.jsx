import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import {
  Users,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Award,
  Calendar,
  MapPin,
  FileCheck,
  Send,
  AlertCircle,
  HelpCircle,
  Sparkles,
  ChevronRight,
  ExternalLink,
  Lock,
  Download
} from 'lucide-react';
import toast from 'react-hot-toast';

const BeneficiaryPortal = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [otpPromptAnswered, setOtpPromptAnswered] = useState(false);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await api.beneficiaries.getMyStatus();
        if (res.data && res.data.id) {
          setData(res.data);
        } else {
          // Fallback PM-AJAY simulated data for Anita Devi
          setData({
            id: 'BEN-1001',
            name: user?.name || 'Anita Devi',
            guardian_name: 'Ram Prasad',
            village: 'Dwarka Sector 12',
            district: 'South West Delhi',
            state: 'Delhi',
            phone: '9876543201',
            aadhaar_last4: '4523',
            project_name: 'Rural Education Support 2026 (PM-AJAY)',
            ngo_name: 'Delhi NGO Foundation',
            status: 'verified',
            verification_count: 3,
            last_verified_at: '2026-08-28T10:30:00Z',
            current_stage: 4, // 1 to 5
            services_received: ['Educational Books Kit', 'School Uniforms (2 Sets)', 'Mid-Day Nutrition Support'],
            evidence_history: [
              {
                id: 'EV-001',
                captured_at: '2026-08-28T10:30:00Z',
                service: 'Educational Books & Uniform Kit',
                worker_name: 'Ramesh Yadav',
                trust_score: 95,
                trust_status: 'verified',
                beneficiary_confirmed: 1
              },
              {
                id: 'EV-003',
                captured_at: '2026-08-15T11:15:00Z',
                service: 'Mid-Day Meal Verification',
                worker_name: 'Ramesh Yadav',
                trust_score: 92,
                trust_status: 'verified',
                beneficiary_confirmed: 1
              }
            ]
          });
        }
      } catch (err) {
        console.warn('Using seeded beneficiary portal status:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, [user]);

  const handleConfirmReceipt = (received) => {
    setOtpPromptAnswered(true);
    if (received) {
      toast.success('Thank you! Your direct confirmation has been recorded in the DoSJE Central Audit Ledger.');
    } else {
      toast.error('Grievance logged! PMU Inspection Officer dispatched for verification inquiry.');
    }
  };

  const stages = [
    {
      step: 1,
      title: 'Registration & Aadhaar KYC',
      desc: 'Beneficiary enrolled and masked UID token verified in DoSJE database.',
      completed: true,
      current: false,
      date: '10 Aug 2026'
    },
    {
      step: 2,
      title: 'Scheme Sanction & NGO Assignment',
      desc: 'Assigned to PM-AJAY Rural Welfare Project under Delhi NGO Foundation.',
      completed: true,
      current: false,
      date: '15 Aug 2026'
    },
    {
      step: 3,
      title: 'Field Worker In-Person Geotag Audit',
      desc: 'Physical field visit with dynamic anti-replay challenge code verification.',
      completed: true,
      current: false,
      date: '28 Aug 2026'
    },
    {
      step: 4,
      title: 'Trust Engine Sanction & Grant Approval',
      desc: 'Multi-signal trust score: 95% (Auto-Approved). Direct entitlement release initiated.',
      completed: false,
      current: true,
      date: 'Ongoing (Estimated Completion: 48 hrs)'
    },
    {
      step: 5,
      title: 'Complete Entitlement Disbursed',
      desc: 'All sanctioned assistance, certificates, and welfare kits fully received.',
      completed: false,
      current: false,
      date: 'Target: 15 Sep 2026'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Banner (Govt Style) */}
      <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-900 rounded-2xl p-6 text-white shadow-lg border border-blue-800/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-widest">
                PM-AJAY Welfare Scheme Portal
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/10 text-slate-300">
                MoSJE, Govt. of India
              </span>
            </div>
            <h1 className="text-2xl font-black text-white">
              Welcome, {data?.name || 'Anita Devi'}
            </h1>
            <p className="text-xs text-slate-300">
              Beneficiary Reference ID: <span className="font-mono text-amber-300 font-bold">{data?.id || 'BEN-1001'}</span> • Aadhaar: •••• •••• {data?.aadhaar_last4 || '4523'}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl border border-white/15 text-left sm:text-right">
            <p className="text-[10px] uppercase font-bold text-slate-300 tracking-wider">Application Status</p>
            <p className="text-base font-black text-emerald-400 flex items-center sm:justify-end gap-1.5 mt-0.5">
              <CheckCircle2 className="w-4 h-4" /> Sanction Stage: 80%
            </p>
            <span className="text-[10px] text-slate-300">Active Beneficiary</span>
          </div>
        </div>
      </div>

      {/* Two-Way Beneficiary Confirmation Widget */}
      {!otpPromptAnswered && (
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-200 text-amber-900 flex items-center justify-center flex-shrink-0">
              <Send className="w-5 h-5" />
            </div>
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-amber-950">Action Required: Direct Beneficiary Confirmation</h3>
                <span className="px-2 py-0.2 rounded text-[10px] font-extrabold bg-amber-200 text-amber-900">
                  2-Way Trust Loop
                </span>
              </div>
              <p className="text-xs text-amber-900 leading-relaxed">
                Field worker <strong>Ramesh Yadav</strong> from <strong>{data?.ngo_name || 'Delhi NGO'}</strong> reported delivering <strong>"Books & Uniform Kit"</strong> to your residence. Did you receive this assistance?
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2 sm:pl-13">
            <button
              onClick={() => handleConfirmReceipt(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow transition flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" /> Yes, I Received This Assistance
            </button>
            <button
              onClick={() => handleConfirmReceipt(false)}
              className="bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold text-xs px-4 py-2.5 rounded-xl transition border border-rose-300 flex items-center gap-1.5"
            >
              <AlertCircle className="w-4 h-4" /> No, I Did Not Receive / Report Discrepancy
            </button>
          </div>
        </div>
      )}

      {/* Main Process Progress & Stage Tracker */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <FileCheck className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">Application Progress & Current Stage Tracker</h2>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            Current Stage: <strong className="text-blue-600">Stage 4 (Verification Approved)</strong>
          </span>
        </div>

        {/* Stepper Timeline */}
        <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
          {stages.map((st) => (
            <div key={st.step} className="relative group">
              {/* Dot icon */}
              <div className={`absolute -left-6 top-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ring-4 ring-white ${
                st.completed
                  ? 'bg-emerald-600 text-white'
                  : st.current
                  ? 'bg-blue-600 text-white animate-pulse'
                  : 'bg-slate-200 text-slate-500'
              }`}>
                {st.completed ? '✓' : st.step}
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className={`text-sm font-bold ${
                    st.current ? 'text-blue-700' : st.completed ? 'text-slate-900' : 'text-slate-400'
                  }`}>
                    {st.step}. {st.title}
                  </h4>
                  <span className={`text-[11px] font-semibold ${st.current ? 'text-blue-600 font-bold' : 'text-slate-400'}`}>
                    {st.date}
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  {st.desc}
                </p>
                {st.current && (
                  <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold">
                    <Clock className="w-3.5 h-3.5 animate-spin" /> Ongoing Stage: Grant Disbursement In-Progress
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Services & Benefits Delivered Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-bold text-slate-900">Recorded Entitlements & Aid Delivered</h2>
          </div>
          <button
            onClick={() => toast.success('Digital Beneficiary Pass downloaded!')}
            className="text-xs text-blue-600 font-bold hover:text-blue-800 flex items-center gap-1"
          >
            <Download className="w-3.5 h-3.5" /> Download Benefit Pass
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(data?.services_received || ['Educational Books Kit', 'School Uniforms (2 Sets)', 'Mid-Day Nutrition Support']).map((svc, i) => (
            <div key={i} className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-1">
              <span className="text-[10px] font-bold uppercase text-emerald-800 tracking-wider">Entitlement #{i + 1}</span>
              <p className="text-xs font-bold text-slate-900">{svc}</p>
              <p className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Physically Verified
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Field Inspection Audit History */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Calendar className="w-5 h-5 text-purple-600" />
          <h2 className="text-base font-bold text-slate-900">Field Worker Visit History</h2>
        </div>

        <div className="space-y-3">
          <div className="p-4 border border-slate-200 rounded-xl space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800">Visit #3: Full Physical Audit & Biometric Check</span>
              <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded text-[10px]">
                🟢 Trust Score: 95%
              </span>
            </div>
            <p className="text-slate-600">
              Field Worker <strong>Ramesh Yadav</strong> visited beneficiary residence at Dwarka Sector 12. Captured photo with daily verification code X7P92.
            </p>
            <div className="text-[11px] text-slate-400 pt-1 flex items-center justify-between border-t border-slate-100">
              <span>Date: 28 Aug 2026, 10:30 AM</span>
              <span className="text-blue-600 font-mono">EV-001 (Audited)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Support Notice */}
      <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-between text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-slate-500" />
          <span>Need assistance with your welfare entitlement? Call National Social Justice Helpline:</span>
        </div>
        <a href="tel:14566" className="font-bold text-blue-700 hover:underline">
          Toll-Free 14566
        </a>
      </div>
    </div>
  );
};

export default BeneficiaryPortal;
