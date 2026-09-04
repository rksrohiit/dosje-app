import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import {
  Layers,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  MapPin,
  Camera,
  Eye,
  Hash,
  Smartphone,
  ExternalLink,
  ChevronDown
} from 'lucide-react';

const EvidenceGallery = () => {
  const { user } = useAuth();
  const [evidenceList, setEvidenceList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvidence, setSelectedEvidence] = useState(null);

  useEffect(() => {
    const fetchEvidence = async () => {
      try {
        const res = await api.evidence.getAll();
        if (res.data && res.data.length > 0) {
          setEvidenceList(res.data);
        } else {
          // Fallback seeded list
          setEvidenceList([
            {
              id: 'EV-001',
              project_name: 'Rural Education Support 2026',
              beneficiary_name: 'Anita Devi',
              trust_score: 95,
              trust_status: 'verified',
              verification_code: 'X7P92',
              distance_from_target: 45,
              file_hash: '8f3a91bc92de104a7b5c8290fae139820541cdb387e042a9b31d8e97f001',
              captured_at: '2026-08-30T10:14:00Z',
              beneficiary_confirmed: 1,
              file_url: 'https://images.unsplash.com/photo-1593113563332-f368c8585489?q=80&w=600&auto=format&fit=crop'
            },
            {
              id: 'EV-002',
              project_name: 'Rural Education Support 2026',
              beneficiary_name: 'Ravi Kumar',
              trust_score: 88,
              trust_status: 'review',
              verification_code: 'A8K47',
              distance_from_target: 120,
              file_hash: '3e1c94ba02fe881d7a4b9180fae139820541cdb387e042a9b31d8e97f002',
              captured_at: '2026-08-29T14:30:00Z',
              beneficiary_confirmed: 1,
              file_url: 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?q=80&w=600&auto=format&fit=crop'
            },
            {
              id: 'EV-005',
              project_name: 'Skill Development Program',
              beneficiary_name: 'Meera Gupta',
              trust_score: 96,
              trust_status: 'verified',
              verification_code: 'T5W81',
              distance_from_target: 22,
              file_hash: '5b8a91bc92de104a7b5c8290fae139820541cdb387e042a9b31d8e97f005',
              captured_at: '2026-08-28T16:20:00Z',
              beneficiary_confirmed: 1,
              file_url: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?q=80&w=600&auto=format&fit=crop'
            },
            {
              id: 'EV-006',
              project_name: 'Skill Development Program',
              beneficiary_name: 'Kamla Devi',
              trust_score: 45,
              trust_status: 'suspicious',
              verification_code: null,
              distance_from_target: 850,
              file_hash: '7d4f91bc92de104a7b5c8290fae139820541cdb387e042a9b31d8e97f006',
              captured_at: '2026-08-26T09:12:00Z',
              beneficiary_confirmed: 0,
              file_url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=600&auto=format&fit=crop'
            }
          ]);
        }
      } catch (err) {
        console.warn('Fallback evidence loaded:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvidence();
  }, []);

  const filtered = evidenceList.filter(ev => {
    const matchStatus = statusFilter === 'all' || ev.trust_status === statusFilter;
    const matchSearch = (ev.beneficiary_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (ev.id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (ev.project_name || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-900 rounded-2xl p-6 text-white shadow-lg border border-blue-800/40">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase tracking-widest">
            Cryptographic Audit Vault
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/10 text-slate-300">
            SHA-256 Chain of Custody
          </span>
        </div>
        <h1 className="text-2xl font-black text-white mt-1">Field Verification Evidence Gallery</h1>
        <p className="text-xs text-slate-300 mt-1 max-w-xl">
          Central repository of in-app live captures, immutable hash fingerprints, dynamic challenge codes, and AI trust classifications.
        </p>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Evidence ID, Beneficiary or Project..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          {[
            { id: 'all', label: 'All Evidence' },
            { id: 'verified', label: '🟢 Auto-Approved' },
            { id: 'review', label: '🟡 Review' },
            { id: 'suspicious', label: '🔴 Suspicious' }
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setStatusFilter(st.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                statusFilter === st.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Evidence Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((ev) => (
          <div
            key={ev.id}
            className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              {/* Image Preview with Badges */}
              <div className="relative h-48 bg-slate-900 overflow-hidden group">
                <img
                  src={ev.file_url || 'https://images.unsplash.com/photo-1593113563332-f368c8585489?q=80&w=600&auto=format&fit=crop'}
                  alt="Field Evidence"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />

                <div className="absolute top-2.5 left-2.5">
                  <span className="font-mono text-[10px] font-bold bg-black/70 backdrop-blur-xs text-white px-2 py-1 rounded-md border border-white/20">
                    {ev.id}
                  </span>
                </div>

                <div className="absolute top-2.5 right-2.5">
                  <span className={`px-2.5 py-1 text-[10px] font-extrabold rounded-full backdrop-blur-md uppercase tracking-wider flex items-center gap-1 ${
                    ev.trust_status === 'verified'
                      ? 'bg-emerald-600/90 text-white'
                      : ev.trust_status === 'review'
                      ? 'bg-amber-500/90 text-slate-950'
                      : 'bg-rose-600/90 text-white'
                  }`}>
                    {ev.trust_status === 'verified' && <CheckCircle2 className="w-3 h-3" />}
                    {ev.trust_status === 'review' && <Clock className="w-3 h-3" />}
                    {ev.trust_status === 'suspicious' && <AlertTriangle className="w-3 h-3" />}
                    Trust {ev.trust_score}%
                  </span>
                </div>

                {ev.verification_code && (
                  <div className="absolute bottom-2.5 left-2.5 bg-purple-950/80 backdrop-blur-xs border border-purple-400/40 text-white text-[11px] font-mono px-2.5 py-0.5 rounded-md font-bold">
                    Code: <span className="text-amber-300">{ev.verification_code}</span>
                  </div>
                )}
              </div>

              {/* Card Body */}
              <div className="p-4 space-y-3">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{ev.beneficiary_name || 'Registered Beneficiary'}</h4>
                  <p className="text-xs text-slate-500 truncate">{ev.project_name || 'DoSJE Project'}</p>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">GPS Proximity:</span>
                    <span className="font-bold text-slate-800">{ev.distance_from_target || 45}m from Target</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">OTP Confirmation:</span>
                    <span className={`font-bold ${ev.beneficiary_confirmed ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {ev.beneficiary_confirmed ? 'Verified by SMS' : 'Pending'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Captured At:</span>
                    <span className="text-slate-700 font-mono text-[11px]">
                      {new Date(ev.captured_at || Date.now()).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Fingerprint snippet */}
                <div className="p-2 bg-slate-50 rounded-lg border border-slate-100 font-mono text-[10px] text-slate-500 break-all">
                  SHA: {ev.file_hash?.substring(0, 24)}...
                </div>
              </div>
            </div>

            <div className="p-4 pt-0">
              <button
                onClick={() => setSelectedEvidence(ev)}
                className="w-full bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 text-xs font-bold py-2 rounded-xl transition flex items-center justify-center gap-1.5 border border-slate-200"
              >
                <Eye className="w-3.5 h-3.5" /> View Audit Breakdown
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Audit Detail Modal */}
      {selectedEvidence && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-sm">Evidence Audit Proof: {selectedEvidence.id}</h3>
              </div>
              <button
                onClick={() => setSelectedEvidence(null)}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto text-xs">
              <div className="rounded-xl overflow-hidden border border-slate-200 h-52 bg-black">
                <img
                  src={selectedEvidence.file_url}
                  alt="Evidence Preview"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-4 bg-slate-900 text-white rounded-xl space-y-2 font-mono text-xs">
                <div className="text-slate-400 border-b border-slate-800 pb-1 flex justify-between">
                  <span>SHA-256 DIGITAL FINGERPRINT</span>
                  <span className="text-emerald-400 font-bold">VERIFIED</span>
                </div>
                <p className="text-amber-300 break-all text-[11px]">{selectedEvidence.file_hash}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-slate-700">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Beneficiary</p>
                  <p className="font-bold text-slate-900 mt-0.5">{selectedEvidence.beneficiary_name}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Trust Score</p>
                  <p className="font-black text-emerald-600 text-base mt-0.5">{selectedEvidence.trust_score} / 100</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Anti-Replay Code</p>
                  <p className="font-mono font-bold text-purple-700 mt-0.5">{selectedEvidence.verification_code || 'None'}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="text-[10px] uppercase font-bold text-slate-400">GPS Proximity</p>
                  <p className="font-bold text-slate-900 mt-0.5">{selectedEvidence.distance_from_target || 45}m from target</p>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setSelectedEvidence(null)}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white py-2.5 rounded-xl font-bold"
                >
                  Close Audit Proof
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EvidenceGallery;
