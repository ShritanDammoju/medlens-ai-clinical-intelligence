import React, { useState, useRef, useEffect } from 'react';
import { usePatient } from '../../context/PatientContext';
import { MessageSquare, Send, Bot, User, Sparkles, AlertCircle, ShieldAlert, X, Minimize2, Maximize2, FileText, ChevronRight } from 'lucide-react';
import { ChatMessage } from '../../types/medical';

export const MedLensChatbot: React.FC = () => {
  const { currentPatient, state, openSourceInspector } = usePatient();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'assistant',
      text: `Hello, I'm your MedLens Clinical Intelligence Assistant. I can help summarize lab values, track trends over time, explain medical terminology, and locate source documents for ${currentPatient?.name || 'your records'}.\n\n⚠️ Disclaimer: I provide clinical information intelligence only, not medical diagnoses or treatment prescriptions.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const quickQuestions = [
    "What abnormal lab values were found?",
    "Why was an allergy conflict flagged?",
    "Show my Hemoglobin trend",
    "Do I have diabetes?"
  ];

  const handleSend = (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const response = generateAssistantResponse(query);
      setMessages(prev => [...prev, response]);
      setIsTyping(false);
    }, 600);
  };

  const generateAssistantResponse = (query: string): ChatMessage => {
    const q = query.toLowerCase();
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Safety guardrail for diagnostic questions
    if (q.includes('do i have') || q.includes('am i sick') || q.includes('diagnose') || q.includes('cure') || q.includes('prescribe')) {
      return {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: `MedLens is designed to organize and clarify documented clinical information, but cannot diagnose medical conditions or recommend treatments.\n\nRegarding your query: your records document a fasting glucose of 118 mg/dL (ref: 70–99 mg/dL) and 124 mg/dL on prior baseline. In clinical guidelines, these numbers sit in the impaired fasting glucose / pre-diabetes evaluation range, but only your physician can interpret these in the context of an HbA1c test and clinical evaluation.`,
        sources: [
          { sourceName: 'CMP_Panel_Sep2026.pdf', testName: 'Fasting Glucose', value: '118 mg/dL', refRange: '70 - 99 mg/dL', status: 'HIGH' },
          { sourceName: 'General_Health_Aug2026.pdf', testName: 'Fasting Glucose', value: '124 mg/dL', refRange: '70 - 99 mg/dL', status: 'HIGH' }
        ],
        timestamp
      };
    }

    // Abnormal values query
    if (q.includes('abnormal') || q.includes('high') || q.includes('low') || q.includes('out of range')) {
      const abnormalLabs = state.labs.filter(l => l.status === 'LOW' || l.status === 'HIGH');
      const textList = abnormalLabs.map(l => `• ${l.testName}: ${l.resultValue} ${l.unit} [Status: ${l.status}, Source Ref Range: ${l.referenceRange || 'None'}]`).join('\n');
      return {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: `The following ${abnormalLabs.length} parameters were identified outside their source laboratory reference intervals:\n\n${textList}\n\nAll reference intervals reflect verbatim values extracted from authorized reports.`,
        sources: [
          { sourceName: 'CMP_Panel_Sep2026.pdf', testName: 'Fasting Glucose', value: '118 mg/dL', status: 'HIGH' },
          { sourceName: 'Lipid_Panel_Sep2026.pdf', testName: 'LDL Cholesterol', value: '142 mg/dL', status: 'HIGH' },
          { sourceName: 'CBC_Report_Sep2026.pdf', testName: 'Ferritin', value: '14 ng/mL', status: 'LOW' }
        ],
        timestamp
      };
    }

    // Conflict / Allergy query
    if (q.includes('allergy') || q.includes('conflict') || q.includes('amoxicillin') || q.includes('penicillin')) {
      return {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: `⚠️ Critical Record Discrepancy Identified:\n\n1. Stated Allergy: Penicillin & Beta-Lactams (Severe reaction: hives and wheezing documented on Patient Intake Form).\n2. Uploaded Medication: Amoxicillin-Clavulanate 875/125 mg (Urgent Care Discharge Summary dated Sep 2026).\n\nBecause amoxicillin belongs to the penicillin antibiotic family, this cross-record conflict was automatically flagged. Human clinical verification is strongly advised before any medication is taken.`,
        sources: [
          { sourceName: 'Patient Intake Form', testName: 'Reported Allergy: Penicillin & Beta-Lactams' },
          { sourceName: 'Urgent_Care_Discharge_Sep2026.pdf', testName: 'Rx: Amoxicillin-Clavulanate 875/125mg' }
        ],
        timestamp
      };
    }

    // Hemoglobin or CBC query
    if (q.includes('hemoglobin') || q.includes('hb') || q.includes('trend') || q.includes('cbc')) {
      return {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: `Hemoglobin Trend Analysis for ${currentPatient?.name || 'Patient'}:\n\n• 10 Aug 2026: 12.8 g/dL (General_Health_Aug2026.pdf)\n• 04 Sep 2026: 13.2 g/dL (CBC_Report_Sep2026.pdf)\n\nBoth results fall comfortably within the source reference range of 12.0 – 16.0 g/dL, demonstrating a stable upward progression of +0.4 g/dL over 25 days.`,
        sources: [
          { sourceName: 'CBC_Report_Sep2026.pdf', testName: 'Hemoglobin', value: '13.2 g/dL', refRange: '12.0 - 16.0' },
          { sourceName: 'General_Health_Aug2026.pdf', testName: 'Hemoglobin', value: '12.8 g/dL', refRange: '12.0 - 16.0' }
        ],
        timestamp
      };
    }

    // Default intelligent answer
    return {
      id: `bot-${Date.now()}`,
      sender: 'assistant',
      text: `Based on ${currentPatient?.name || 'the patient'}'s records across 4 clinical documents, we have documented complete metabolic, hematologic, and lipid profiles. You have 8 laboratory biomarkers on file, 1 documented drug allergy, and 4 current medication records.\n\nFeel free to ask for specific test values, longitudinal comparisons, or source document citations.`,
      sources: [
        { sourceName: 'Metropolitan Clinical Laboratories', testName: 'Diagnostic Clinical Record' }
      ],
      timestamp
    };
  };

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 p-4 rounded-2xl bg-gradient-to-tr from-sky-600 to-blue-700 text-white shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2.5 cursor-pointer no-print group"
          aria-label="Open MedLens Assistant"
        >
          <Bot className="w-6 h-6 animate-pulse" />
          <span className="font-bold text-sm tracking-wide hidden sm:inline">Ask MedLens</span>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white animate-ping" />
        </button>
      )}

      {/* Floating Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[95vw] sm:w-[430px] h-[600px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200 no-print">
          {/* Header */}
          <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-sky-600 flex items-center justify-center text-white shadow-md">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm flex items-center gap-1.5">
                  MedLens Assistant
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 font-semibold border border-sky-400/30">AI SAFE</span>
                </h3>
                <p className="text-[11px] text-slate-400">Clinical Provenance & Search</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Safety Notice */}
          <div className="px-3.5 py-2 bg-sky-50/80 border-b border-sky-100 flex items-center gap-2 text-[11px] text-sky-900">
            <Sparkles className="w-3.5 h-3.5 text-sky-600 shrink-0" />
            <span>Grounded strictly in verified patient reports. Non-diagnostic.</span>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/60 text-xs sm:text-sm">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'assistant' && (
                  <div className="w-7 h-7 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] p-3.5 rounded-2xl ${
                    msg.sender === 'user'
                      ? 'bg-sky-600 text-white rounded-br-xs shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-bl-xs shadow-xs'
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>

                  {/* Sources Grounding */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-slate-100 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Source Grounding:
                      </span>
                      {msg.sources.map((src, sIdx) => (
                        <div
                          key={sIdx}
                          className="flex items-center gap-1.5 text-[11px] font-medium text-sky-700 bg-sky-50 px-2 py-1 rounded-lg border border-sky-100"
                        >
                          <FileText className="w-3 h-3 text-sky-600 shrink-0" />
                          <span className="font-semibold">{src.sourceName}</span>
                          {src.testName && <span className="text-slate-500 font-mono text-[10px] truncate">— {src.testName} {src.value || ''}</span>}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-1 text-[10px] text-right opacity-60">
                    {msg.timestamp}
                  </div>
                </div>

                {msg.sender === 'user' && (
                  <div className="w-7 h-7 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-2 items-center text-slate-400 text-xs italic pl-9">
                <Bot className="w-3.5 h-3.5 animate-spin text-sky-600" />
                <span>MedLens is searching source records...</span>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Quick Suggestion Chips */}
          <div className="p-2.5 bg-white border-t border-slate-100 flex gap-1.5 overflow-x-auto text-[11px] no-scrollbar">
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                className="shrink-0 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-sky-50 hover:text-sky-700 text-slate-600 font-medium transition-colors cursor-pointer border border-slate-200/80"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question about your medical reports..."
              className="flex-1 px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="p-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white shadow-xs transition-colors disabled:opacity-40 cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
