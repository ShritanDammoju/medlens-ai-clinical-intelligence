import React, { useState } from 'react';
import { useAuth } from '../../firebase/AuthContext';
import { usePatient } from '../../context/PatientContext';
import { 
  Stethoscope, 
  Copy, 
  Check, 
  Users, 
  Clock, 
  ShieldCheck, 
  UserCheck, 
  UserX, 
  ArrowUpRight, 
  FlaskConical, 
  FileText, 
  AlertCircle,
  Search,
  ExternalLink
} from 'lucide-react';
import { NavTab } from '../layout/Sidebar';

interface Props {
  onNavigateTab: (tab: NavTab) => void;
}

export const DoctorDashboard: React.FC<Props> = ({ onNavigateTab }) => {
  const { userProfile } = useAuth();
  const { 
    connections, 
    pendingDoctorRequests, 
    respondToConnection, 
    revokeConnection, 
    inspectPatientRecord,
    state
  } = usePatient();

  const [copied, setCopied] = useState(false);
  const [searchPatient, setSearchPatient] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const doctorCode = userProfile?.doctorCode || 'MED-HEALTH';

  const handleCopyCode = () => {
    navigator.clipboard.writeText(doctorCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleInspect = async (patientId: string, patientName: string) => {
    setActionLoadingId(patientId);
    try {
      await inspectPatientRecord(patientId, patientName);
      onNavigateTab('overview');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleAccept = async (connId: string) => {
    setActionLoadingId(connId);
    try {
      await respondToConnection(connId, 'accepted');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (connId: string) => {
    setActionLoadingId(connId);
    try {
      await respondToConnection(connId, 'rejected');
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredConnections = connections.filter(c => 
    c.patientName.toLowerCase().includes(searchPatient.toLowerCase()) ||
    (c.patientEmail && c.patientEmail.toLowerCase().includes(searchPatient.toLowerCase()))
  );

  const pendingLabsCount = state.labs.filter(l => l.verificationStatus === 'needs_review').length;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Clinician Identity Header */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-400 shrink-0 shadow-lg">
              <Stethoscope className="w-8 h-8" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  {userProfile?.displayName || 'Dr. Verified Clinician, MD'}
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified Reviewer
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                {userProfile?.specialization || 'Internal Medicine & Clinical Diagnostics'} • {userProfile?.hospitalOrClinic || 'MedLens Health Network'}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Account ID: <code className="text-slate-300 font-mono text-[11px]">{userProfile?.uid}</code>
              </p>
            </div>
          </div>

          {/* Doctor Code Box */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/15 max-w-sm w-full">
            <div className="text-[11px] font-bold text-sky-300 uppercase tracking-wider mb-1">
              Your Unique Doctor Connection Code
            </div>
            <div className="flex items-center justify-between gap-2 mt-2 bg-slate-950/60 rounded-xl px-4 py-2.5 border border-slate-800">
              <span className="font-mono text-xl sm:text-2xl font-black text-sky-400 tracking-wider select-all">
                {doctorCode}
              </span>
              <button
                onClick={handleCopyCode}
                className="px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 shadow-sm"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-slate-950" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-[11px] text-slate-300 mt-2 leading-relaxed">
              Share this code with your patients. When they enter it in their MedLens dashboard, you can review and verify their medical records.
            </p>
          </div>
        </div>
      </div>

      {/* 3 Metric Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{connections.length}</div>
            <div className="text-xs text-slate-500 font-medium">Connected Patients</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{pendingDoctorRequests.length}</div>
            <div className="text-xs text-slate-500 font-medium">Pending Connection Requests</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <FlaskConical className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{pendingLabsCount}</div>
            <div className="text-xs text-slate-500 font-medium">Labs Awaiting Review</div>
          </div>
        </div>
      </div>

      {/* Pending Patient Access Requests */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              {pendingDoctorRequests.length}
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">Pending Connection Requests</h2>
              <p className="text-xs text-slate-500">Patients requesting your clinical review authorization</p>
            </div>
          </div>
        </div>

        {pendingDoctorRequests.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <UserCheck className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">No pending requests</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              When a patient submits your Doctor Code (<strong className="text-slate-700">{doctorCode}</strong>), their request will appear here for your approval.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 border border-slate-200/80 rounded-2xl overflow-hidden">
            {pendingDoctorRequests.map((req) => (
              <div key={req.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white hover:bg-slate-50/60 transition-colors">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{req.patientName}</span>
                    {req.patientAge && (
                      <span className="text-xs text-slate-500">({req.patientAge}y, {req.patientSex})</span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {req.patientEmail && <span>{req.patientEmail} • </span>}
                    Requested {new Date(req.requestedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAccept(req.id)}
                    disabled={actionLoadingId === req.id}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Accept Connection</span>
                  </button>

                  <button
                    onClick={() => handleReject(req.id)}
                    disabled={actionLoadingId === req.id}
                    className="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 hover:text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    <UserX className="w-3.5 h-3.5" />
                    <span>Decline</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Connected Patients Roster */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">My Connected Patients</h2>
            <p className="text-xs text-slate-500">Active patients who have granted you clinical record access</p>
          </div>

          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search connected patient..."
              value={searchPatient}
              onChange={(e) => setSearchPatient(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>

        {filteredConnections.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
            <Users className="w-10 h-10 text-slate-300 mx-auto" />
            <div className="text-sm font-bold text-slate-700">No connected patients found</div>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Patients will appear here once they add your Doctor Code (<strong className="text-slate-800 font-mono">{doctorCode}</strong>) and you approve their request.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredConnections.map((conn) => (
              <div key={conn.id} className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-sky-300 hover:shadow-sm transition-all space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-base text-slate-900">{conn.patientName}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-100 text-sky-800 border border-sky-200">
                        Active
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {conn.patientEmail || 'No email provided'}
                    </div>
                  </div>

                  <button
                    onClick={() => revokeConnection(conn.id)}
                    title="Revoke clinician access"
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer text-xs"
                  >
                    Disconnect
                  </button>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="text-[11px] text-slate-400">
                    Connected {new Date(conn.requestedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>

                  <button
                    onClick={() => handleInspect(conn.patientId, conn.patientName)}
                    disabled={actionLoadingId === conn.patientId}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <span>Inspect Record</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Clinical Verification Protocol Reference */}
      <div className="p-6 rounded-3xl bg-slate-900 text-slate-300 border border-slate-800 space-y-3">
        <div className="flex items-center gap-2 text-sky-400 font-bold text-sm">
          <ShieldCheck className="w-4 h-4" />
          <span>Clinician Verification & Review Protocol</span>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          As a verified clinician, your adjustments in the <strong>Verification Center</strong> update the patient's normalized record and generate an immutable audit log entry (recording your identity and timestamp). MedLens ensures complete provenance so clinicians and patients understand every number's origin.
        </p>
      </div>
    </div>
  );
};
