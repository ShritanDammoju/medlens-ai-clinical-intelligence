import React, { useState, useRef, useEffect } from 'react';
import { usePatient } from '../../context/PatientContext';
import { useAuth } from '../../firebase/AuthContext';
import { 
  MessageSquare, 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  AlertCircle, 
  ShieldAlert, 
  X, 
  FileText, 
  ChevronRight,
  RotateCcw,
  RefreshCw,
  Loader2,
  Trash2
} from 'lucide-react';
import { ChatMessage } from '../../types/medical';
import { sendChatMessageToAI, buildStructuredPatientContext } from '../../services/aiService';

export const MedLensChatbot: React.FC = () => {
  const { currentPatient, state, openSourceInspector } = usePatient();
  const { isDemoMode, role } = useAuth();
  
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [lastErrorQuery, setLastErrorQuery] = useState<string | null>(null);

  const initialWelcomeMessage: ChatMessage = {
    id: 'msg-welcome',
    sender: 'assistant',
    text: `Hello! I'm your MedLens Clinical Intelligence Assistant powered by Gemini 3.8 Flash.\n\nI can analyze your uploaded laboratory reports, explain clinical terminology, identify cross-record conflicts, and reference source documents for ${currentPatient?.name || 'your records'}.\n\n⚠️ MedLens provides clinical information organization and explanation only, not medical diagnoses or treatment prescriptions.`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  const [messages, setMessages] = useState<ChatMessage[]>([initialWelcomeMessage]);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    if (isOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen]);

  const quickQuestions = [
    "What reports do I have?",
    "What was my latest hemoglobin result?",
    "What information in my record is not verified?",
    "What changed between my reports?",
    "What information is missing?",
    "Explain my latest report in simple language."
  ];

  const handleClearChat = () => {
    setMessages([initialWelcomeMessage]);
    setLastErrorQuery(null);
  };

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isTyping) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    setLastErrorQuery(null);

    // Build structured patient context strictly from current authorized data
    const patientContext = buildStructuredPatientContext(
      currentPatient,
      state.labs,
      state.meds,
      state.reports,
      state.conditions,
      state.allergies,
      state.conflicts
    );

    // Prepare recent conversation history (last 6 messages)
    const history = messages
      .filter(m => m.id !== 'msg-welcome')
      .slice(-6)
      .map(m => ({
        sender: m.sender,
        text: m.text
      }));

    try {
      const botResponse = await sendChatMessageToAI(
        query,
        history,
        patientContext,
        Boolean(isDemoMode),
        role
      );

      setMessages(prev => [...prev, botResponse]);

      // Check if response was an error message to offer retry
      if (botResponse.text.includes('temporarily unavailable') || botResponse.text.includes('timed out')) {
        setLastErrorQuery(query);
      }
    } catch (err: any) {
      console.error('Chat error:', err);
      setLastErrorQuery(query);
      setMessages(prev => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          sender: 'assistant',
          text: 'MedLens AI encountered an unexpected issue formulating a response. Please check your connection and click Retry.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsTyping(false);
    }
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
          <div className="flex flex-col text-left">
            <span className="font-extrabold text-sm tracking-wide hidden sm:inline">Ask MedLens AI</span>
            <span className="text-[10px] text-sky-200 hidden sm:inline leading-none font-medium">Gemini 3.8 Flash</span>
          </div>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white animate-ping" />
        </button>
      )}

      {/* Floating Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[95vw] sm:w-[450px] h-[640px] max-h-[88vh] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200 no-print">
          {/* Header */}
          <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-600 flex items-center justify-center text-white shadow-md">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-extrabold text-sm text-white">MedLens Assistant</h3>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 font-bold border border-sky-400/30 uppercase tracking-wider">
                    Gemini 3.8 Flash
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">
                  {currentPatient ? `Active: ${currentPatient.name}` : 'Clinical Intelligence'}
                  {isDemoMode && ' (Demo Mode)'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleClearChat}
                title="Reset conversation"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Safety & Demo Notification Ribbon */}
          <div className={`px-3.5 py-2 text-[11px] flex items-center justify-between gap-2 border-b ${
            isDemoMode 
              ? 'bg-amber-50 text-amber-900 border-amber-200' 
              : 'bg-sky-50 text-sky-900 border-sky-100'
          }`}>
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-sky-600 shrink-0" />
              <span>
                {isDemoMode 
                  ? 'Demo Mode Active: Answering using Alex Carter sample dataset.' 
                  : 'Grounded strictly in your authorized medical records. Non-diagnostic.'}
              </span>
            </div>
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
                        Source Reference Lineage:
                      </span>
                      {msg.sources.map((src, sIdx) => (
                        <div
                          key={sIdx}
                          onClick={() => {
                            if (src.sourceName) {
                              openSourceInspector({
                                sourceName: src.sourceName,
                                sourceType: 'report',
                                provenance: 'Extracted from Report',
                                snippet: src.testName ? `${src.testName}: ${src.value} (Ref: ${src.refRange})` : undefined
                              });
                            }
                          }}
                          className="flex items-center justify-between gap-1.5 text-[11px] font-medium text-sky-700 bg-sky-50 hover:bg-sky-100 px-2 py-1 rounded-lg border border-sky-100 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            <FileText className="w-3 h-3 text-sky-600 shrink-0" />
                            <span className="font-semibold">{src.sourceName}</span>
                            {src.testName && <span className="text-slate-600 font-mono text-[10px] truncate">— {src.testName}: {src.value}</span>}
                          </div>
                          {src.status && (
                            <span className={`text-[9px] font-bold px-1 rounded uppercase shrink-0 ${
                              src.status === 'HIGH' || src.status === 'LOW' 
                                ? 'bg-rose-100 text-rose-800' 
                                : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {src.status}
                            </span>
                          )}
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

            {/* AI is generating state */}
            {isTyping && (
              <div className="flex gap-2.5 items-center bg-white p-3 rounded-2xl border border-sky-200 text-sky-900 text-xs shadow-xs animate-pulse">
                <Loader2 className="w-4 h-4 animate-spin text-sky-600 shrink-0" />
                <div className="flex flex-col">
                  <span className="font-bold">MedLens Assistant is analyzing...</span>
                  <span className="text-[11px] text-slate-500">Formulating real-time response with Gemini 3.8 Flash</span>
                </div>
              </div>
            )}

            {/* Retry Button if last query resulted in error */}
            {lastErrorQuery && !isTyping && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                <span>The last request could not be fulfilled.</span>
                <button
                  onClick={() => handleSend(lastErrorQuery)}
                  className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Retry</span>
                </button>
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
                disabled={isTyping}
                className="shrink-0 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-sky-50 hover:text-sky-700 text-slate-600 font-medium transition-colors cursor-pointer border border-slate-200/80 disabled:opacity-50"
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
              disabled={isTyping}
              placeholder="Ask a question about your clinical records..."
              className="flex-1 px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 disabled:bg-slate-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
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
