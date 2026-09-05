import React, { useState } from 'react';
import { usePatient } from '../../context/PatientContext';
import { useAuth } from '../../firebase/AuthContext';
import { 
  Stethoscope, 
  UserPlus, 
  CheckCircle2, 
  AlertCircle, 
  Shield, 
  Trash2, 
  Clock, 
  Loader2,
  Lock
} from 'lucide-react';

export const ConnectedDoctorsCard: React.FC = () => {
  const { connections, connectDoctorByCode, revokeConnection } = usePatient();
  const { isDemoMode } = useAuth();
  
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const activeDoctors = connections.filter(c => c.status === 'accepted');
  const pendingDoctors = connections.filter(c => c.status === 'pending');

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    setFeedback(null);

    const res = await connectDoctorByCode(code);
    if (res.success) {
      setFeedback({ type: 'success', message: res.message });
      setCode('');
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
    setLoading(false);
  };

  const handleRevoke = async (connId: string) => {
    if (window.confirm('Are you sure you want to revoke this doctor\'s access to your medical records?')) {
      await revokeConnection(connId);
      setFeedback({ type: 'success', message: 'Clinician access revoked.' });
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">Connected Clinicians</h2>
            <p className="text-xs text-slate-500">Authorize trusted doctors to review and verify your reports</p>
          </div>
        </div>

        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
          {activeDoctors.length} Connected
        </span>
      </div>

      {/* Connect with Code Form */}
      <form onSubmit={handleConnect} className="space-y-3 bg-slate-50/80 rounded-2xl p-4 border border-slate-200/60">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
          Add Doctor by Code
        </label>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="Enter Doctor Code (e.g. MED-782194)"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="flex-1 px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 uppercase font-mono tracking-wider"
          />
          <button
            type="submit"
            disabled={loading || !code.trim()}
            className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs sm:text-sm font-bold shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
            <span>Connect</span>
          </button>
        </div>

        {feedback && (
          <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
            feedback.type === 'success' 
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}>
            {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{feedback.message}</span>
          </div>
        )}
      </form>

      {/* Pending Requests */}
      {pendingDoctors.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span>Pending Approvals ({pendingDoctors.length})</span>
          </div>
          <div className="space-y-2">
            {pendingDoctors.map((p) => (
              <div key={p.id} className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/50 flex items-center justify-between gap-3 text-xs">
                <div>
                  <div className="font-bold text-slate-800">{p.doctorName}</div>
                  <div className="text-slate-500 text-[11px]">Code: {p.doctorCode} • Awaiting doctor confirmation</div>
                </div>
                <button
                  onClick={() => revokeConnection(p.id)}
                  className="text-slate-400 hover:text-rose-600 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Doctors List */}
      <div className="space-y-3">
        <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Active Clinicians
        </div>

        {activeDoctors.length === 0 ? (
          <div className="p-6 text-center rounded-2xl bg-slate-50/60 border border-slate-100 text-xs text-slate-400">
            No doctors currently connected. Ask your doctor for their MedLens code (e.g. <span className="font-mono text-slate-600">MED-XXXXXX</span>) to grant them review access.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 border border-slate-200/80 rounded-2xl overflow-hidden">
            {activeDoctors.map((doc) => (
              <div key={doc.id} className="p-4 flex items-center justify-between gap-4 bg-white hover:bg-slate-50/60 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs">
                    Dr
                  </div>
                  <div>
                    <div className="font-bold text-xs sm:text-sm text-slate-900">{doc.doctorName}</div>
                    <div className="text-[11px] text-slate-500">
                      Code: {doc.doctorCode} • Connected {new Date(doc.requestedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleRevoke(doc.id)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-rose-600 hover:bg-rose-50 text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer"
                  title="Revoke access"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Revoke Access</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sovereign Patient Privacy Guarantee */}
      <div className="p-3.5 rounded-xl bg-sky-50/60 border border-sky-100 text-[11px] text-sky-900 flex items-start gap-2.5">
        <Lock className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Privacy Sovereign:</strong> Connected doctors can view your labs and verify extracted parameters, but you hold complete ownership and can revoke authorization at any second.
        </p>
      </div>
    </div>
  );
};
