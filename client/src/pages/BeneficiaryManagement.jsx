import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import {
  Users,
  Plus,
  Search,
  ShieldCheck,
  MapPin,
  CheckCircle2,
  Clock,
  XCircle,
  Phone,
  Camera,
  FolderKanban,
  Lock,
  Eye,
  ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';

import persistentStorage from '../utils/persistentStorage';

const BeneficiaryManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [beneficiaries, setBeneficiaries] = useState(() => persistentStorage.getBeneficiaries());
  const [projects, setProjects] = useState(() => persistentStorage.getProjects());
  const [loading, setLoading] = useState(true);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [projectFilter, setProjectFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [formData, setFormData] = useState({
    name: '',
    guardian_name: '',
    village: '',
    district: 'South West Delhi',
    state: 'Delhi',
    phone: '',
    aadhaar_last4: '',
    project_id: 'DOSJE-PROJECT-2026-001',
    lat: 28.5935,
    lng: 77.0480
  });

  const fetchData = async () => {
    try {
      const [benRes, projRes] = await Promise.allSettled([
        api.beneficiaries.getAll(),
        api.projects.getAll()
      ]);

      const serverBen = (benRes.status === 'fulfilled' && benRes.value.data) ? benRes.value.data : [];
      setBeneficiaries(persistentStorage.getBeneficiaries(serverBen));

      const serverProj = (projRes.status === 'fulfilled' && projRes.value.data) ? projRes.value.data : [];
      setProjects(persistentStorage.getProjects(serverProj));
    } catch (err) {
      console.warn('Error fetching beneficiary data, using persistent storage:', err);
      setBeneficiaries(persistentStorage.getBeneficiaries());
      setProjects(persistentStorage.getProjects());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const handleStorageChange = (e) => {
      if (!e.detail || e.detail.key === 'dosje_custom_beneficiaries') {
        setBeneficiaries(persistentStorage.getBeneficiaries());
      }
      if (!e.detail || e.detail.key === 'dosje_custom_projects') {
        setProjects(persistentStorage.getProjects());
      }
    };
    window.addEventListener('dosje_storage_changed', handleStorageChange);
    return () => window.removeEventListener('dosje_storage_changed', handleStorageChange);
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (formData.aadhaar_last4.length !== 4 || isNaN(formData.aadhaar_last4)) {
      toast.error('Please provide exactly the last 4 digits of Aadhaar');
      return;
    }

    const newId = `BEN-${String(beneficiaries.length + 1001).padStart(4, '0')}`;
    const selectedProj = projects.find(p => p.id === formData.project_id);
    const newBen = {
      id: newId,
      ...formData,
      project_name: selectedProj ? selectedProj.name : 'DoSJE Project',
      status: 'pending',
      services_received: '[]',
      verification_count: 0,
      last_verified_at: null
    };

    // Save immediately to persistent storage
    persistentStorage.saveBeneficiary(newBen);
    setBeneficiaries(prev => [newBen, ...prev.filter(b => b.id !== newId)]);
    setShowRegisterModal(false);
    toast.success(`Beneficiary enrolled: ${newId}!`);

    // Sync to backend API
    try {
      await api.beneficiaries.register({ ...formData, id: newId });
    } catch (err) {
      console.warn('Backend sync failed, safely saved locally:', err);
    }
  };

  const filteredBeneficiaries = beneficiaries.filter(b => {
    const matchSearch = (b.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (b.id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (b.village || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchProject = projectFilter === 'all' || b.project_id === projectFilter;
    const matchStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchSearch && matchProject && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-900 rounded-2xl p-6 text-white shadow-lg border border-blue-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-widest">
              Last-Mile Beneficiary Registry
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/10 text-slate-300 border border-white/15 flex items-center gap-1">
              <Lock className="w-3 h-3 text-amber-300" /> Aadhaar Privacy Vault
            </span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">Beneficiary Enrollment & Verification Registry</h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Register marginalized individuals, georeference home residences, and schedule field visits for biometric physical audit.
          </p>
        </div>

        <button
          onClick={() => setShowRegisterModal(true)}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-5 py-3 rounded-xl transition-all shadow-md shadow-emerald-950/40 flex items-center gap-2 active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Enroll New Beneficiary
        </button>
      </div>

      {/* Privacy Notice Alert */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-blue-900">
        <ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <strong className="font-bold">UIDAI & Digital Personal Data Protection (DPDP) Act Compliance:</strong> Full 12-digit Aadhaar numbers are never stored in plain text. Only masked virtual reference tokens and last 4 digits are utilized for field authentication and duplicate detection.
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Beneficiary Name, ID or Village..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="text-xs border border-slate-300 rounded-xl px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Projects</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          {['all', 'verified', 'pending'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                statusFilter === st
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Beneficiaries Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                <th className="p-3.5">Beneficiary ID</th>
                <th className="p-3.5">Name & Guardian</th>
                <th className="p-3.5">Village / District</th>
                <th className="p-3.5">Associated Project</th>
                <th className="p-3.5">Aadhaar (Masked)</th>
                <th className="p-3.5">Services Delivered</th>
                <th className="p-3.5">Verification Status</th>
                <th className="p-3.5 text-right">Field Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBeneficiaries.map((b) => {
                let services = [];
                try {
                  services = typeof b.services_received === 'string' ? JSON.parse(b.services_received) : (b.services_received || []);
                } catch (e) {
                  services = [];
                }

                return (
                  <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-blue-700">
                      {b.id}
                    </td>
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900">{b.name}</div>
                      <div className="text-[11px] text-slate-400">c/o {b.guardian_name || 'Guardian'}</div>
                    </td>
                    <td className="p-3.5">
                      <div className="font-semibold text-slate-800">{b.village}</div>
                      <div className="text-[11px] text-slate-400">{b.district}, {b.state}</div>
                    </td>
                    <td className="p-3.5 font-medium text-slate-700">
                      {b.project_name || b.project_id}
                    </td>
                    <td className="p-3.5 font-mono text-slate-500">
                      •••• •••• {b.aadhaar_last4 || '4523'}
                    </td>
                    <td className="p-3.5">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {services.length === 0 ? (
                          <span className="text-slate-400 italic text-[11px]">No services recorded yet</span>
                        ) : (
                          services.map((svc, idx) => (
                            <span key={idx} className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold border border-blue-200">
                              {svc}
                            </span>
                          ))
                        )}
                      </div>
                    </td>
                    <td className="p-3.5">
                      {b.status === 'verified' && (
                        <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1 w-fit">
                          <CheckCircle2 className="w-3 h-3" /> Verified ({b.verification_count || 1})
                        </span>
                      )}
                      {b.status === 'pending' && (
                        <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-amber-100 text-amber-800 flex items-center gap-1 w-fit">
                          <Clock className="w-3 h-3" /> Audit Pending
                        </span>
                      )}
                      {b.status === 'rejected' && (
                        <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-rose-100 text-rose-800 flex items-center gap-1 w-fit">
                          <XCircle className="w-3 h-3" /> Ineligible
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => navigate('/field-verification')}
                        className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold px-3 py-1.5 rounded-lg transition text-[11px] border border-blue-200 inline-flex items-center gap-1"
                      >
                        <Camera className="w-3.5 h-3.5 text-blue-600" /> Verify
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Enroll Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-base">Enroll New Beneficiary</h3>
              </div>
              <button
                onClick={() => setShowRegisterModal(false)}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRegister} className="p-6 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase text-slate-700">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Anita Devi"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase text-slate-700">Guardian / Father's Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ram Prasad"
                    value={formData.guardian_name}
                    onChange={(e) => setFormData({ ...formData, guardian_name: e.target.value })}
                    className="w-full p-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase text-slate-700">Associated Project</label>
                <select
                  value={formData.project_id}
                  onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.id} - {p.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase text-slate-700">Phone Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="10-digit mobile number"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase text-slate-700">Aadhaar Last 4 Digits</label>
                  <input
                    type="text"
                    required
                    maxLength="4"
                    placeholder="e.g. 4523"
                    value={formData.aadhaar_last4}
                    onChange={(e) => setFormData({ ...formData, aadhaar_last4: e.target.value })}
                    className="w-full p-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-mono tracking-wider"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase text-slate-700">Village / Locality</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dwarka Sec 12"
                    value={formData.village}
                    onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                    className="w-full p-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase text-slate-700">District</label>
                  <input
                    type="text"
                    required
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    className="w-full p-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase text-slate-700">State</label>
                  <input
                    type="text"
                    required
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full p-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500">Registered Lat</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.lat}
                    onChange={(e) => setFormData({ ...formData, lat: parseFloat(e.target.value) })}
                    className="w-full p-1.5 text-xs border border-slate-300 rounded bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500">Registered Lng</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.lng}
                    onChange={(e) => setFormData({ ...formData, lng: parseFloat(e.target.value) })}
                    className="w-full p-1.5 text-xs border border-slate-300 rounded bg-white"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-md"
                >
                  Confirm & Enroll Beneficiary
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BeneficiaryManagement;
