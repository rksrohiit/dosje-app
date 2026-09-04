import React, { useState } from 'react';
import { MessageSquare, PhoneCall, Send, ShieldAlert, CheckCircle2, AlertOctagon, Lock, RefreshCw, Layers, Cpu, Copy, Terminal, Cloud, Sparkles, Code } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../utils/api';
import OTPModal from '../components/OTPModal';

const CommunicationHub = () => {
  const [activeTab, setActiveTab] = useState('bot_logs');
  const [recipient, setRecipient] = useState('NGO Directors (+91 98765 43210)');
  const [message, setMessage] = useState('DoSJE Alert: Surprise inspection scheduled today at 11:00 AM. Please keep CCTV active.');
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [selectedGrantAction, setSelectedGrantAction] = useState(null);

  const [botLogs, setBotLogs] = useState([
    { id: 1, channel: 'WhatsApp', phone: '+91 98765 43210', name: 'Delhi NGO Director', msg: 'DoSJE Bot: High attendance discrepancy detected (80 reported vs 50 verified).', status: 'DELIVERED', time: '10 mins ago' },
    { id: 2, channel: 'SMS', phone: '+91 98765 43211', name: 'Priya Sharma (PMU)', msg: 'DoSJE Alert: AI assigned high priority inspection for Bhopal Outreach.', status: 'DELIVERED', time: '1 hour ago' },
    { id: 3, channel: 'WhatsApp', phone: '+91 98765 43212', name: 'Mumbai Support Director', msg: 'Grant Installment ₹25,00,000 released successfully.', status: 'DELIVERED', time: '3 hours ago' },
  ]);

  const [grants, setGrants] = useState([
    { ngo_id: 'ngo1', ngo_name: 'Delhi NGO', scheme: 'SMILE', score: 78, status: 'APPROVED', amount: '₹25,00,000', reason: 'High compliance rating & verified audit report.' },
    { ngo_id: 'ngo2', ngo_name: 'Mumbai Support', scheme: 'DAP', score: 55, status: 'FROZEN', amount: '₹25,00,000', reason: 'Automated Hold: Compliance score < 60% or high attendance anomaly flagged.' },
    { ngo_id: 'ngo3', ngo_name: 'Chennai Aid', scheme: 'SHG', score: 98, status: 'APPROVED', amount: '₹25,00,000', reason: 'Top compliance score certified.' },
    { ngo_id: 'ngo4', ngo_name: 'Kolkata Care', scheme: 'SMILE', score: 72, status: 'UNDER_REVIEW', amount: '₹25,00,000', reason: 'Manual Review Required: Pending audit clarification.' },
  ]);

  const handleSendBroadcast = (e) => {
    e.preventDefault();
    const newLog = {
      id: Date.now(),
      channel: 'WhatsApp & SMS',
      phone: '+91 98765 43210',
      name: 'Broadcast Group',
      msg: message,
      status: 'DELIVERED',
      time: 'Just now'
    };
    setBotLogs([newLog, ...botLogs]);
    toast.success('WhatsApp & SMS Broadcast Dispatched via Twilio Bot API!');
    setMessage('');
  };

  const handleTriggerGrantRelease = (grant) => {
    setSelectedGrantAction(grant);
    setShowOtpModal(true);
  };

  const handleOtpVerified = () => {
    if (selectedGrantAction) {
      setGrants(grants.map(g => g.ngo_id === selectedGrantAction.ngo_id ? { ...g, status: 'APPROVED', reason: 'Manually Released via 2FA Officer Approval.' } : g));
      toast.success(`Grant Installment ${selectedGrantAction.amount} Released for ${selectedGrantAction.ngo_name}!`);
      setSelectedGrantAction(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* 2FA Modal */}
      <OTPModal
        isOpen={showOtpModal}
        onClose={() => setShowOtpModal(false)}
        onVerified={handleOtpVerified}
        actionTitle="Grant Release 2FA Approval"
      />

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-950 rounded-2xl p-5 md:p-6 text-white shadow-lg border border-blue-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-0.5 rounded text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-widest">
            Bot Communication & Financial Workflow Engine
          </span>
          <h2 className="text-xl md:text-2xl font-black text-white mt-1">
            WhatsApp/SMS Bot & Grant Hold/Release Engine
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Automated WhatsApp/SMS alerts for anomalies and automated grant installment freezing based on compliance scores.
          </p>
        </div>
      </div>

      {/* Tab Controls */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-2xl px-4 pt-2">
        <button
          onClick={() => setActiveTab('bot_logs')}
          className={`px-5 py-3 font-bold text-xs md:text-sm transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'bot_logs'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <MessageSquare className="w-4 h-4 text-blue-600" />
          WhatsApp & SMS Bot Logs ({botLogs.length})
        </button>

        <button
          onClick={() => setActiveTab('grant_workflow')}
          className={`px-5 py-3 font-bold text-xs md:text-sm transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'grant_workflow'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <AlertOctagon className="w-4 h-4 text-emerald-600" />
          Automated Grant Installment Hold/Release Trigger
        </button>

        <button
          onClick={() => setActiveTab('mcp_protocol')}
          className={`px-5 py-3 font-bold text-xs md:text-sm transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'mcp_protocol'
              ? 'border-purple-600 text-purple-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Cpu className="w-4 h-4 text-purple-600" />
          Model Context Protocol (MCP) Integration
        </button>
      </div>

      {activeTab === 'bot_logs' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Broadcast Form (1 Col) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Send className="w-4 h-4 text-blue-600" />
              Dispatch Instant Bot Broadcast
            </h3>

            <form onSubmit={handleSendBroadcast} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Recipient Group</label>
                <select
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="w-full p-2.5 text-xs md:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 font-semibold"
                >
                  <option value="NGO Directors">💬 All NGO Directors (+91 98765 43210)</option>
                  <option value="PMU Inspectors">📱 All PMU Field Inspectors</option>
                  <option value="State Authorities">🏛️ State Authorities & Secretaries</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">WhatsApp & SMS Message</label>
                <textarea
                  rows="4"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full p-3 text-xs md:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Enter alert message..."
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs md:text-sm py-3 rounded-xl transition-all shadow-md shadow-blue-900/20 active:scale-95 flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" /> Dispatch WhatsApp & SMS
              </button>
            </form>
          </div>

          {/* Bot Log Audit Stream (2 Cols) */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 md:p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <MessageSquare className="w-4 h-4 text-blue-600" />
              Live WhatsApp & SMS Bot Notification Stream
            </h3>

            <div className="space-y-3">
              {botLogs.map((log) => (
                <div key={log.id} className="p-3.5 border border-slate-100 bg-slate-50/70 rounded-xl flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                    log.channel.includes('WhatsApp') ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {log.channel.includes('WhatsApp') ? '💬' : '📱'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-xs text-slate-900">{log.name} ({log.phone})</span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">
                        {log.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 mt-1 font-medium leading-relaxed">{log.msg}</p>
                    <span className="text-[10px] text-slate-400 font-mono mt-1 block">{log.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : activeTab === 'grant_workflow' ? (
        /* Grant Installment Hold/Release Trigger Table */
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-5 md:p-6 space-y-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <AlertOctagon className="w-5 h-5 text-emerald-600" />
              Automated Financial Grant Hold & Release Workflow
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Automated rules: Score &ge; 80% &rarr; <strong>RELEASE APPROVED</strong> | Score &lt; 60% or High Anomaly &rarr; <strong>AUTOMATED HOLD (FROZEN)</strong>
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[650px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[11px] font-bold tracking-wider">
                  <th className="p-3.5">NGO / Institute</th>
                  <th className="p-3.5">Scheme</th>
                  <th className="p-3.5">Compliance Score</th>
                  <th className="p-3.5">Installment Amount</th>
                  <th className="p-3.5">Status Decision</th>
                  <th className="p-3.5">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs md:text-sm">
                {grants.map((grant) => (
                  <tr key={grant.ngo_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 font-bold text-slate-900">{grant.ngo_name}</td>
                    <td className="p-3.5 font-semibold text-slate-600">{grant.scheme}</td>
                    <td className="p-3.5 font-bold text-slate-800">{grant.score}%</td>
                    <td className="p-3.5 font-mono font-bold text-slate-900">{grant.amount}</td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        grant.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : (
                          grant.status === 'FROZEN' ? 'bg-rose-100 text-rose-800 border border-rose-300' : 'bg-amber-100 text-amber-800 border border-amber-300'
                        )
                      }`}>
                        {grant.status === 'APPROVED' ? '✅ RELEASE APPROVED' : (grant.status === 'FROZEN' ? '❄️ GRANT FROZEN' : '⏳ UNDER REVIEW')}
                      </span>
                    </td>
                    <td className="p-3.5">
                      {grant.status === 'FROZEN' || grant.status === 'UNDER_REVIEW' ? (
                        <button
                          onClick={() => handleTriggerGrantRelease(grant)}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 shadow-2xs"
                        >
                          <Lock className="w-3.5 h-3.5" /> 2FA Override Release
                        </button>
                      ) : (
                        <span className="text-emerald-600 font-bold text-xs flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> Disbursed
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* MCP Protocol Tab */
        <div className="space-y-6">
          {/* Status Header */}
          <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 rounded-2xl p-6 text-white border border-purple-800/40 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase tracking-widest">
                    Model Context Protocol (MCP) Server
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    🟢 Live & Connected
                  </span>
                </div>
                <h2 className="text-xl font-black text-white">AI Agent Tool & Context Bridge</h2>
                <p className="text-xs text-slate-300 max-w-2xl">
                  Connect any AI assistant (Claude Desktop, Cursor, Antigravity, or custom LLM agents) to live DoSJE databases, 6-signal Trust Engine, and real-time field audit records via JSON-RPC.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const config = JSON.stringify({
                      mcpServers: {
                        "dosje-monitoring": {
                          command: "node",
                          args: ["server/mcp/index.js"],
                          env: { NODE_ENV: "development" }
                        }
                      }
                    }, null, 2);
                    navigator.clipboard.writeText(config);
                    toast.success('MCP Config JSON copied to clipboard!');
                  }}
                  className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition shadow flex items-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" /> Copy MCP Config
                </button>
              </div>
            </div>
          </div>

          {/* Transport Endpoints */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <Terminal className="w-4 h-4 text-purple-600" />
                <span>1. Local Stdio Transport</span>
                <span className="ml-auto text-[10px] font-mono bg-purple-50 text-purple-700 px-2 py-0.5 rounded">CLI / Local IDEs</span>
              </div>
              <p className="text-xs text-slate-600">
                Direct standard input/output execution for local agent workflows (Cursor, Claude Desktop, Antigravity).
              </p>
              <div className="p-3 bg-slate-900 rounded-xl text-slate-200 font-mono text-xs overflow-x-auto">
                <code>node server/mcp/index.js</code>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <Cloud className="w-4 h-4 text-blue-600" />
                <span>2. Remote SSE Cloud Transport (AWS / Render)</span>
                <span className="ml-auto text-[10px] font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded">HTTPS Server-Sent Events</span>
              </div>
              <p className="text-xs text-slate-600">
                Enables remote AI models anywhere on the web to connect to your hosted Amazon Cloud or Render deployment.
              </p>
              <div className="p-3 bg-slate-900 rounded-xl text-amber-300 font-mono text-xs overflow-x-auto">
                <code>{typeof window !== 'undefined' ? `${window.location.origin}/sse` : 'https://dosje-app.onrender.com/sse'}</code>
              </div>
            </div>
          </div>

          {/* Active MCP Tools Catalog */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Code className="w-5 h-5 text-purple-600" />
                <h3 className="text-base font-bold text-slate-900">Registered MCP Tools (8 Available)</h3>
              </div>
              <span className="text-xs text-purple-700 font-bold bg-purple-50 px-2.5 py-1 rounded-full">
                Protocol: 2024-11-05
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { name: 'dosje_list_projects', desc: 'Queries active welfare schemes (SMILE, DAP, SHG), budgets, and progress.' },
                { name: 'dosje_create_project', desc: 'Registers a new social welfare project with unique ID and coordinates.' },
                { name: 'dosje_list_beneficiaries', desc: 'Searches beneficiaries with masked Aadhaar DPDP privacy.' },
                { name: 'dosje_get_beneficiary_status', desc: 'Retrieves PM-AJAY 5-stage progress and verified entitlements ledger.' },
                { name: 'dosje_query_field_evidence', desc: 'Inspects tamper-proof field photos, GPS proximity, and SHA-256 hashes.' },
                { name: 'dosje_calculate_trust_score', desc: 'Runs the 6-signal Trust Engine (GPS, time, device, hash, code, OTP).' },
                { name: 'dosje_get_compliance_stats', desc: 'Fetches national compliance leaderboard and attendance anomalies.' },
                { name: 'dosje_trigger_ai_inspection', desc: 'Dispatches automated unannounced inspections based on risk score.' },
              ].map((t, i) => (
                <div key={i} className="p-3.5 rounded-xl border border-slate-200 hover:border-purple-300 transition space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <strong className="font-mono text-xs text-purple-700 font-bold">{t.name}</strong>
                  </div>
                  <p className="text-xs text-slate-500 pl-4">{t.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunicationHub;
