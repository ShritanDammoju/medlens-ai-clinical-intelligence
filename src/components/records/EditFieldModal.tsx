import React, { useState } from 'react';
import { LabResult } from '../../types/medical';
import { X, Save, AlertCircle } from 'lucide-react';
import { usePatient } from '../../context/PatientContext';

interface Props {
  lab: LabResult | null;
  onClose: () => void;
}

export const EditFieldModal: React.FC<Props> = ({ lab, onClose }) => {
  const { updateLabVerification } = usePatient();
  if (!lab) return null;

  const [val, setVal] = useState(lab.resultValue);
  const [range, setRange] = useState(lab.referenceRange || '');
  const [saveStatus, setSaveStatus] = useState<'verified' | 'needs_review'>('verified');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateLabVerification(lab.id, saveStatus, val, range.trim() === '' ? null as any : range);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden">
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-semibold text-sky-400 uppercase tracking-wider">Clinical Audit & Edit</span>
            <h3 className="font-bold text-base text-white">{lab.testName}</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-5 space-y-4">
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/70 text-xs text-amber-900 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              <strong>Clinical Integrity Rule:</strong> Only update reference ranges if explicitly supported by the source document.
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Extracted Value</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={val}
                onChange={(e) => setVal(e.target.value)}
                required
                className="flex-1 px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:outline-none font-mono"
              />
              <span className="px-3 py-2 text-sm bg-slate-100 rounded-xl text-slate-600 font-medium">
                {lab.unit}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Source Reference Range
              <span className="text-[11px] font-normal text-slate-400 ml-1.5">(Leave empty if missing in source)</span>
            </label>
            <input
              type="text"
              value={range}
              onChange={(e) => setRange(e.target.value)}
              placeholder="e.g. 12.0 - 16.0 or < 100"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:outline-none font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Verification Status</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSaveStatus('verified')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border text-center transition-all cursor-pointer ${
                  saveStatus === 'verified'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Mark Verified
              </button>
              <button
                type="button"
                onClick={() => setSaveStatus('needs_review')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border text-center transition-all cursor-pointer ${
                  saveStatus === 'needs_review'
                    ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Needs Review
              </button>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
