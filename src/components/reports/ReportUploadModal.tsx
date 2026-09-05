import React, { useState, useRef } from 'react';
import { usePatient } from '../../context/PatientContext';
import { processUploadedFile, PROCESSING_STAGES } from '../../services/parserService';
import { 
  Upload, 
  X, 
  FileText, 
  CheckCircle2, 
  Loader2, 
  ShieldCheck, 
  AlertCircle,
  FileCheck,
  Type,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ReportUploadModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const { currentPatient, addReportAndLabs } = usePatient();
  const [tab, setTab] = useState<'upload' | 'paste'>('upload');
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState<string>('');
  const [reportTitle, setReportTitle] = useState<string>('Pasted Clinical Report');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStageIdx, setCurrentStageIdx] = useState(0);
  const [progressPercent, setProgressPercent] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{ count: number; reportTitle: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (file: File) => {
    setErrorMsg(null);
    const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'text/plain'];
    const isExtensionMatch = /\.(pdf|png|jpe?g|txt)$/i.test(file.name);

    if (!validTypes.includes(file.type) && !isExtensionMatch) {
      setErrorMsg('Unsupported file format. Please upload a PDF, PNG, JPG, or TXT report.');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setErrorMsg('File size exceeds 25 MB. Please upload a smaller medical report.');
      return;
    }

    setSelectedFile(file);
  };

  const handleStartProcessing = async () => {
    if (!currentPatient) return;
    if (tab === 'upload' && !selectedFile) return;
    if (tab === 'paste' && !pastedText.trim()) {
      setErrorMsg('Please paste report text before processing.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const inputPayload = tab === 'upload' && selectedFile
        ? selectedFile
        : {
            name: `${reportTitle.replace(/[^a-zA-Z0-9_-]/g, '_')}.txt`,
            text: pastedText,
            size: `${(pastedText.length / 1024).toFixed(1)} KB`
          };

      const { report, extractedLabs } = await processUploadedFile(
        inputPayload,
        currentPatient.id,
        (stageIdx, _stageName, pct) => {
          setCurrentStageIdx(stageIdx - 1);
          setProgressPercent(pct);
        }
      );

      addReportAndLabs(report, extractedLabs);

      setSuccessData({
        count: extractedLabs.length,
        reportTitle: report.title
      });

      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (err: any) {
      console.error('Processing error:', err);
      setErrorMsg(err?.message || 'Report processing failed. Please try a different document format.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPastedText('');
    setIsProcessing(false);
    setCurrentStageIdx(0);
    setProgressPercent(0);
    setErrorMsg(null);
    setSuccessData(null);
  };

  const handleFinish = () => {
    handleReset();
    onClose();
    if (onSuccess) onSuccess();
  };

  const loadSamplePastedText = () => {
    setPastedText(`METROPOLITAN CLINICAL LABORATORIES
PATIENT: Alex Carter | DATE: 04-SEP-2026
ROUTINE CLINICAL BIOCHEMISTRY PANEL

Hb: 13.8 g/dL (ref: 12.0 - 16.0)
WBC: 6.8 x10^3/uL (ref: 4.0 - 11.0)
FBS: 112 mg/dL (ref: 70 - 99)
Creatinine: 0.92 mg/dL (ref: 0.70 - 1.30)
CRP: Negative (ref: Not Provided)
Vitamin D: 19 ng/mL (ref: 30 - 100)`);
    setReportTitle('Metropolitan Routine Biochemistry');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-400">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider font-semibold text-sky-400">Clinical Document Intake</span>
              <h3 className="font-bold text-lg text-white">Upload or Paste Medical Report</h3>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher (Upload vs Paste) */}
        {!isProcessing && !successData && (
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex gap-2">
            <button
              onClick={() => setTab('upload')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                tab === 'upload'
                  ? 'bg-white text-sky-700 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>Upload Document (PDF / Image)</span>
            </button>
            <button
              onClick={() => setTab('paste')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                tab === 'paste'
                  ? 'bg-white text-sky-700 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Type className="w-4 h-4" />
              <span>Paste Report Text</span>
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6">
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successData ? (
            /* Success Summary State */
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-emerald-50 border border-emerald-200 text-emerald-600 mx-auto flex items-center justify-center shadow-soft">
                <FileCheck className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900">10-Stage Pipeline Complete!</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Structured <span className="font-bold text-slate-800">{successData.count} biomarkers</span> from "{successData.reportTitle}".
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs space-y-1.5 max-w-md mx-auto">
                <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Terminology Normalization Applied (e.g. Hb → Hemoglobin)</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Reference Ranges Preserved Strictly from Source</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Audit Trail Created for Human Clinician Verification</span>
                </div>
              </div>

              <button
                onClick={handleFinish}
                className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
              >
                Go to Verification Center
              </button>
            </div>
          ) : isProcessing ? (
            /* 10-Stage Animated Pipeline */
            <div className="py-6 space-y-5">
              <div className="text-center">
                <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-200 text-sky-600 mx-auto flex items-center justify-center mb-3">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
                <h4 className="text-base font-bold text-slate-900">
                  Executing 10-Stage Clinical Intelligence Pipeline
                </h4>
                <p className="text-xs text-slate-500 mt-0.5 font-mono">
                  {PROCESSING_STAGES[currentStageIdx]}
                </p>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-slate-600">
                  <span>Stage {currentStageIdx + 1} of {PROCESSING_STAGES.length}</span>
                  <span className="font-mono text-sky-600">{progressPercent}%</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-sky-500 to-blue-600 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Pipeline Step Monitor */}
              <div className="space-y-1.5 p-3 rounded-2xl bg-slate-50 border border-slate-200 max-h-56 overflow-y-auto">
                {PROCESSING_STAGES.map((stageName, idx) => {
                  const isDone = idx < currentStageIdx;
                  const isCurrent = idx === currentStageIdx;
                  return (
                    <div
                      key={idx}
                      className={`flex items-center gap-2.5 text-xs py-1 transition-all ${
                        isDone ? 'text-emerald-700 font-medium' : isCurrent ? 'text-sky-700 font-bold bg-sky-50 px-2 rounded-lg' : 'text-slate-400'
                      }`}
                    >
                      <div className="w-4 h-4 flex items-center justify-center shrink-0">
                        {isDone ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        ) : isCurrent ? (
                          <Loader2 className="w-3.5 h-3.5 text-sky-600 animate-spin" />
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                        )}
                      </div>
                      <span className="truncate">{idx + 1}. {stageName}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : tab === 'paste' ? (
            /* Paste Raw Text Tab */
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Report Document Title
                </label>
                <input
                  type="text"
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="e.g. CBC and Lipid Profile - Sep 2026"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">
                    Paste Raw Medical Report Text
                  </label>
                  <button
                    type="button"
                    onClick={loadSamplePastedText}
                    className="text-xs font-semibold text-sky-600 hover:text-sky-700 cursor-pointer flex items-center gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Load Sample Report</span>
                  </button>
                </div>
                <textarea
                  rows={8}
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  placeholder="Paste OCR text, laboratory results, or clinical summary here...&#10;e.g.&#10;Hb: 13.5 g/dL (12.0 - 16.0)&#10;FBS: 105 mg/dL (70 - 99)&#10;CRP: Negative (Not Provided)"
                  className="w-full p-3 font-mono text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50/50"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleStartProcessing}
                  disabled={!pastedText.trim()}
                  className="px-5 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-40"
                >
                  Run 10-Stage Pipeline
                </button>
              </div>
            </div>
          ) : !selectedFile ? (
            /* Upload Drop Area */
            <div>
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`p-8 border-2 border-dashed rounded-3xl text-center cursor-pointer transition-all ${
                  dragActive 
                    ? 'border-sky-500 bg-sky-50/50 scale-[1.01]' 
                    : 'border-slate-300 hover:border-sky-400 hover:bg-slate-50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.txt"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 mx-auto shadow-2xs">
                  <Upload className="w-6 h-6" />
                </div>

                <h4 className="mt-3 font-bold text-slate-900 text-sm sm:text-base">
                  Drop medical reports here
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Or click to <span className="text-sky-600 font-semibold underline">browse files</span> from your device
                </p>

                <div className="mt-3 flex items-center justify-center gap-2 text-[11px] text-slate-400 font-medium">
                  <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">PDF</span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">PNG</span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">JPG</span>
                  <span>up to 25MB</span>
                </div>
              </div>

              {/* Quick Sample Demo Fast-Track */}
              <div className="mt-4 pt-4 border-t border-slate-100">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                  Demo Fast-Track: Select Sample Report
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const sampleFile = new File(["TSH 2.45 uIU/mL (0.4-4.5)\nFree T4 1.18 ng/dL (0.8-1.8)"], "Thyroid_Panel_Followup.pdf", { type: "application/pdf" });
                      handleFileSelected(sampleFile);
                    }}
                    className="p-2 rounded-xl bg-slate-50 hover:bg-sky-50 border border-slate-200 text-left transition-colors cursor-pointer"
                  >
                    <span className="font-bold text-[11px] text-slate-800 block">Thyroid Panel</span>
                    <span className="text-[10px] text-slate-400">PDF • 280 KB</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const sampleFile = new File(["Troponin I 4.2 ng/L (< 14)\nBNP 38 pg/mL (< 100)"], "Cardiac_Enzymes_Screen.pdf", { type: "application/pdf" });
                      handleFileSelected(sampleFile);
                    }}
                    className="p-2 rounded-xl bg-slate-50 hover:bg-sky-50 border border-slate-200 text-left transition-colors cursor-pointer"
                  >
                    <span className="font-bold text-[11px] text-slate-800 block">Cardiac Screen</span>
                    <span className="text-[10px] text-slate-400">PDF • 310 KB</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const sampleFile = new File(["Hb 13.6 g/dL (12.0-16.0)\nFBS 115 mg/dL (70-99)"], "Urinalysis_Routine.pdf", { type: "application/pdf" });
                      handleFileSelected(sampleFile);
                    }}
                    className="p-2 rounded-xl bg-slate-50 hover:bg-sky-50 border border-slate-200 text-left transition-colors cursor-pointer"
                  >
                    <span className="font-bold text-[11px] text-slate-800 block">Metabolic CBC</span>
                    <span className="text-[10px] text-slate-400">PDF • 190 KB</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* File Review Ready State */
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs">
                    PDF
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{selectedFile.name}</p>
                    <p className="text-xs text-slate-500">
                      {(selectedFile.size / 1024).toFixed(0)} KB • Ready to extract
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedFile(null)}
                  className="text-slate-400 hover:text-rose-600 p-1.5 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-200/80 text-xs text-sky-900 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-sky-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-semibold">Client-Side Confidential Processing:</strong>
                  <p className="mt-0.5 text-sky-800">
                    Your report is analyzed locally with client-side OCR extraction. No unencrypted protected health data leaves your device.
                  </p>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Choose Another File
                </button>
                <button
                  type="button"
                  onClick={handleStartProcessing}
                  className="px-5 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Start 10-Stage Pipeline
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
