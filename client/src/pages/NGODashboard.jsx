import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import {
  FolderKanban,
  Users,
  Camera,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Plus,
  ArrowRight,
  MapPin,
  Clock,
  Sparkles,
  Award,
  Layers
} from 'lucide-react';
import toast from 'react-hot-toast';

import persistentStorage from '../utils/persistentStorage';

const NGODashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    total_evidence: 12,
    auto_approved: 8,
    needs_review: 3,
    suspicious: 1,
    avg_trust_score: 92.4,
    confirmed_count: 7
  });

  const [projects, setProjects] = useState(() => persistentStorage.getProjects());
  const [recentEvidence, setRecentEvidence] = useState(() => persistentStorage.getEvidence().slice(0, 5));
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [statsRes, projRes, evRes] = await Promise.allSettled([
        api.evidence.getStats(),
        api.projects.getAll(),
        api.evidence.getAll()
      ]);

      if (statsRes.status === 'fulfilled' && statsRes.value.data) {
        setStats(statsRes.value.data);
      }

      const serverProjects = (projRes.status === 'fulfilled' && projRes.value.data) ? projRes.value.data : [];
      const mergedProjects = persistentStorage.getProjects(serverProjects);
      setProjects(mergedProjects);

      const serverEvidence = (evRes.status === 'fulfilled' && evRes.value.data) ? evRes.value.data : [];
      const mergedEvidence = persistentStorage.getEvidence(serverEvidence);
      setRecentEvidence(mergedEvidence.slice(0, 5));
    } catch (err) {
      console.warn('Using fallback NGO dashboard data:', err);
      setProjects(persistentStorage.getProjects());
      setRecentEvidence(persistentStorage.getEvidence().slice(0, 5));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const handleStorageChange = (e) => {
      if (!e.detail || e.detail.key === 'dosje_custom_projects') {
        setProjects(persistentStorage.getProjects());
      }
      if (!e.detail || e.detail.key === 'dosje_custom_evidence') {
        setRecentEvidence(persistentStorage.getEvidence().slice(0, 5));
      }
    };
    window.addEventListener('dosje_storage_changed', handleStorageChange);
    return () => window.removeEventListener('dosje_storage_changed', handleStorageChange);
  }, []);

  return (
    <div className="space-y-6">
      {/* NGO Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-900 rounded-2xl p-5 md:p-7 text-white shadow-lg border border-blue-800/40">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-widest">
                NGO Implementing Agency Portal
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-blue-950 text-blue-300 border border-blue-800/40">
                REG-DL-2024-8842
              </span>
            </div>
            <h1 className="text-xl md:text-3xl font-black text-white tracking-tight">
              {user?.name ? `${user.name} - Institute Command Center` : 'Delhi NGO Foundation'}
            </h1>
            <p className="text-xs md:text-sm text-slate-300 max-w-2xl">
              Digital Trust Infrastructure for Last-Mile Social Verification. Connecting live field audits, GPS geotags, and biometric confirmation to MoSJE central registry.
            </p>
          </div>

          {/* Compliance & Quick Badges */}
          <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/15 text-center">
              <p className="text-[10px] uppercase font-bold text-slate-300 tracking-wider">Compliance Score</p>
              <p className="text-2xl md:text-3xl font-black text-emerald-400">92%</p>
              <span className="text-[10px] text-emerald-300 font-semibold flex items-center justify-center gap-0.5">
                <TrendingUp className="w-3 h-3" /> Tier-1 Grantee
              </span>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/15 text-center">
              <p className="text-[10px] uppercase font-bold text-slate-300 tracking-wider">Avg Trust Score</p>
              <p className="text-2xl md:text-3xl font-black text-amber-400">
                {stats.avg_trust_score || 91.5}%
              </p>
              <span className="text-[10px] text-amber-300 font-semibold">AI Verified</span>
            </div>
          </div>
        </div>

        {/* Quick Action Bar */}
        <div className="mt-6 pt-5 border-t border-white/10 flex flex-wrap items-center gap-3">
          <button
            onClick={() => navigate('/field-verification')}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md shadow-emerald-950/40 flex items-center gap-2 active:scale-95"
          >
            <Camera className="w-4 h-4" /> Start Field Verification
          </button>
          <button
            onClick={() => navigate('/projects')}
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-2 active:scale-95"
          >
            <Plus className="w-4 h-4" /> Create New Project
          </button>
          <button
            onClick={() => navigate('/beneficiaries')}
            className="bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 active:scale-95"
          >
            <Users className="w-4 h-4" /> Register Beneficiary
          </button>
          <button
            onClick={() => navigate('/evidence')}
            className="bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 active:scale-95"
          >
            <Layers className="w-4 h-4" /> View Evidence Vault
          </button>
        </div>
      </div>

      {/* Trust Engine Metrics (Command Center Style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Field Evidence</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{stats.total_evidence || 12}</p>
            <p className="text-[11px] text-blue-600 font-semibold mt-1">Live In-App Captures</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Camera className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Auto-Approved</p>
            <p className="text-2xl font-black text-emerald-600 mt-1">{stats.auto_approved || 8}</p>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1">Trust Score ≥ 90%</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Under Admin Review</p>
            <p className="text-2xl font-black text-amber-600 mt-1">{stats.needs_review || 3}</p>
            <p className="text-[11px] text-amber-600 font-semibold mt-1">Score 70% - 89%</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Suspicious Anomaly</p>
            <p className="text-2xl font-black text-rose-600 mt-1">{stats.suspicious || 1}</p>
            <p className="text-[11px] text-rose-600 font-semibold mt-1">Flagged for GPS/EXIF</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Middle Section: Active Projects + Verification Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Active Projects */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <FolderKanban className="w-5 h-5 text-blue-600" />
              <h2 className="text-base font-bold text-slate-900">Active DoSJE Welfare Projects</h2>
            </div>
            <button
              onClick={() => navigate('/projects')}
              className="text-xs text-blue-600 font-bold hover:text-blue-800 flex items-center gap-1"
            >
              Manage Projects <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {projects.length === 0 ? (
              // Seeded fallback preview if backend empty
              <>
                <div className="p-4 border border-slate-200 rounded-xl hover:border-blue-300 transition space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded">
                        DOSJE-PROJECT-2026-001
                      </span>
                      <h3 className="font-bold text-slate-800 text-sm mt-1">Rural Education Support 2026</h3>
                    </div>
                    <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-emerald-100 text-emerald-700">
                      Active
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-400" /> Dwarka, New Delhi</span>
                    <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5 text-slate-400" /> 150 Beneficiaries Target</span>
                    <span className="font-semibold text-slate-700">₹5,00,000 Budget</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-full rounded-full" style={{ width: '65%' }}></div>
                  </div>
                </div>

                <div className="p-4 border border-slate-200 rounded-xl hover:border-blue-300 transition space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider bg-purple-50 px-2 py-0.5 rounded">
                        DOSJE-PROJECT-2026-002
                      </span>
                      <h3 className="font-bold text-slate-800 text-sm mt-1">Skill Development Program</h3>
                    </div>
                    <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-emerald-100 text-emerald-700">
                      Active
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-400" /> Rohini, New Delhi</span>
                    <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5 text-slate-400" /> 75 Beneficiaries Target</span>
                    <span className="font-semibold text-slate-700">₹3,00,000 Budget</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-purple-600 h-full rounded-full" style={{ width: '40%' }}></div>
                  </div>
                </div>
              </>
            ) : (
              projects.map((proj) => (
                <div key={proj.id} className="p-4 border border-slate-200 rounded-xl hover:border-blue-300 transition space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded">
                        {proj.id}
                      </span>
                      <h3 className="font-bold text-slate-800 text-sm mt-1">{proj.name}</h3>
                    </div>
                    <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-emerald-100 text-emerald-700 uppercase">
                      {proj.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {proj.location}</span>
                    <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5 text-slate-400" /> {proj.beneficiary_count || proj.beneficiary_target} Beneficiaries</span>
                    <span className="font-semibold text-slate-700">₹{proj.budget?.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right 1 Col: Trust Architecture Blueprint */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-2xl border border-slate-800 p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h2 className="text-sm font-bold text-white">Trust Engine Architecture</h2>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Every field capture is vetted through 6 independent cryptographic and algorithmic checkpoints:
          </p>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
              <span className="text-slate-300">1. GPS Proximity (&lt;100m)</span>
              <span className="font-bold text-emerald-400">20 Pts</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
              <span className="text-slate-300">2. Timestamp Validity</span>
              <span className="font-bold text-blue-400">15 Pts</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
              <span className="text-slate-300">3. Hardware Device ID</span>
              <span className="font-bold text-indigo-400">15 Pts</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
              <span className="text-slate-300">4. Perceptual Duplicate Hash</span>
              <span className="font-bold text-purple-400">20 Pts</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
              <span className="text-slate-300">5. Dynamic Challenge Code</span>
              <span className="font-bold text-amber-400">15 Pts</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
              <span className="text-slate-300">6. Beneficiary OTP Confirm</span>
              <span className="font-bold text-emerald-400">15 Pts</span>
            </div>
          </div>

          <div className="pt-2 text-[11px] text-slate-400 italic">
            Score ≥ 90 = Auto-Approved Grant Disbursement.
          </div>
        </div>
      </div>

      {/* Recent Field Verification Evidence Stream */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">Recent Field Verification Audits</h2>
          </div>
          <button
            onClick={() => navigate('/evidence')}
            className="text-xs text-blue-600 font-bold hover:text-blue-800 flex items-center gap-1"
          >
            Open Evidence Vault <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                <th className="p-3">Evidence ID</th>
                <th className="p-3">Beneficiary</th>
                <th className="p-3">Challenge Code</th>
                <th className="p-3">GPS Proximity</th>
                <th className="p-3">Trust Score</th>
                <th className="p-3">Status</th>
                <th className="p-3">OTP Confirm</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentEvidence.length === 0 ? (
                <>
                  <tr className="hover:bg-slate-50/80">
                    <td className="p-3 font-mono font-bold text-slate-700">EV-001</td>
                    <td className="p-3 font-bold text-slate-900">Anita Devi</td>
                    <td className="p-3 font-mono font-bold text-blue-600 bg-blue-50 px-2 rounded w-fit">X7P92</td>
                    <td className="p-3 text-emerald-600 font-bold">45m (Trusted)</td>
                    <td className="p-3 font-black text-emerald-600">95 / 100</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                        🟢 Auto-Approved
                      </span>
                    </td>
                    <td className="p-3 text-emerald-600 font-bold">Confirmed</td>
                  </tr>
                  <tr className="hover:bg-slate-50/80">
                    <td className="p-3 font-mono font-bold text-slate-700">EV-002</td>
                    <td className="p-3 font-bold text-slate-900">Ravi Kumar</td>
                    <td className="p-3 font-mono font-bold text-blue-600 bg-blue-50 px-2 rounded w-fit">A8K47</td>
                    <td className="p-3 text-amber-600 font-bold">120m (Review)</td>
                    <td className="p-3 font-black text-amber-600">88 / 100</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">
                        🟡 Under Review
                      </span>
                    </td>
                    <td className="p-3 text-emerald-600 font-bold">Confirmed</td>
                  </tr>
                  <tr className="hover:bg-slate-50/80">
                    <td className="p-3 font-mono font-bold text-slate-700">EV-006</td>
                    <td className="p-3 font-bold text-slate-900">Kamla Devi</td>
                    <td className="p-3 font-mono text-slate-400">None</td>
                    <td className="p-3 text-rose-600 font-bold">850m (Out of Range)</td>
                    <td className="p-3 font-black text-rose-600">45 / 100</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">
                        🔴 Suspicious
                      </span>
                    </td>
                    <td className="p-3 text-slate-400">Pending</td>
                  </tr>
                </>
              ) : (
                recentEvidence.map((ev) => (
                  <tr key={ev.id} className="hover:bg-slate-50/80">
                    <td className="p-3 font-mono font-bold text-slate-700">{ev.id}</td>
                    <td className="p-3 font-bold text-slate-900">{ev.beneficiary_name || ev.beneficiary_id}</td>
                    <td className="p-3 font-mono font-bold text-blue-600 bg-blue-50 px-2 rounded w-fit">
                      {ev.verification_code || 'N/A'}
                    </td>
                    <td className="p-3">
                      <span className={`font-bold ${ev.distance_from_target < 100 ? 'text-emerald-600' : ev.distance_from_target < 500 ? 'text-amber-600' : 'text-rose-600'}`}>
                        {ev.distance_from_target ? `${Math.round(ev.distance_from_target)}m` : 'N/A'}
                      </span>
                    </td>
                    <td className="p-3 font-black">
                      <span className={ev.trust_score >= 90 ? 'text-emerald-600' : ev.trust_score >= 70 ? 'text-amber-600' : 'text-rose-600'}>
                        {ev.trust_score} / 100
                      </span>
                    </td>
                    <td className="p-3">
                      {ev.trust_status === 'verified' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                          🟢 Approved
                        </span>
                      )}
                      {ev.trust_status === 'review' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">
                          🟡 Review
                        </span>
                      )}
                      {ev.trust_status === 'suspicious' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">
                          🔴 Suspicious
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      {ev.beneficiary_confirmed === 1 ? (
                        <span className="text-emerald-600 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Yes
                        </span>
                      ) : (
                        <span className="text-slate-400 font-medium">Pending</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default NGODashboard;
