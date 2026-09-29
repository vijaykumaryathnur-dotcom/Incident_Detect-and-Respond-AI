import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, 
  Sparkles, 
  Send, 
  X, 
  Minimize2, 
  Maximize2, 
  Database, 
  AlertTriangle, 
  RotateCcw, 
  CheckCircle2, 
  Activity, 
  ChevronDown, 
  ExternalLink,
  ShieldAlert,
  Terminal,
  MessageSquare
} from 'lucide-react';
import { INITIAL_INCIDENTS } from '../../data/mockData';
import { Incident } from '../../types';
import { apiService } from '../../services/api';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  sources?: Array<{ type: string; detail: string }>;
  hindsightMatches?: number;
  modelUsed?: string;
}

interface IncidentAssistantChatProps {
  currentIncidentId?: string;
  onNavigateToIncident?: (incidentId: string) => void;
}

const SUGGESTED_CHIPS = [
  'What happened?',
  'Why is this critical?',
  'Have we seen this before?',
  'What should I do?',
  'Explain the root cause',
  'What fixed the previous incident?',
  'Which service is affected?',
  'What should I check first?',
  'Explain this error in simple terms',
];

export const IncidentAssistantChat: React.FC<IncidentAssistantChatProps> = ({
  currentIncidentId = 'inc-304',
  onNavigateToIncident,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeIncidentId, setActiveIncidentId] = useState(currentIncidentId);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync active incident when prop changes
  useEffect(() => {
    if (currentIncidentId) {
      setActiveIncidentId(currentIncidentId);
    }
  }, [currentIncidentId]);

  const activeIncident: Incident = 
    INITIAL_INCIDENTS.find((i) => i.id === activeIncidentId) || INITIAL_INCIDENTS[0];

  // Initialize initial greeting when opened or incident changes
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          text: `[Current incident] Context active for **#${activeIncident.incidentNumber} — ${activeIncident.title}** (${activeIncident.service} · **${activeIncident.severity}**).\n\n` +
            `[Hindsight memory] Connected to memory bank **"Incident"**. I can explain active telemetry, root causes, past occurrences, and verified remediation runbooks.\n\n` +
            `How can I assist with this incident?`,
          timestamp: 'Just now',
          sources: [
            { type: 'Current incident', detail: `#${activeIncident.incidentNumber} ${activeIncident.service}` },
            { type: 'Hindsight memory', detail: 'Bank "Incident"' }
          ]
        }
      ]);
    }
  }, [activeIncidentId]);

  // Scroll to bottom on new message
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized, isLoading]);

  // Focus input on open
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, isMinimized]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Build incident context payload
      const incidentContext = {
        id: activeIncident.id,
        incidentNumber: activeIncident.incidentNumber,
        title: activeIncident.title,
        severity: activeIncident.severity,
        status: activeIncident.status,
        service: activeIncident.service,
        createdAt: activeIncident.createdAt,
        summary: activeIncident.summary,
        likelyRootCause: activeIncident.likelyRootCause,
        recommendedRunbook: activeIncident.recommendedRunbookId,
        signals: activeIncident.signals,
        errorMessages: [
          '504 Gateway Timeout: 4.8% error rate',
          'PgBouncer connection pool saturation: 98/100 connections in use (342 queued)'
        ],
      };

      const historyPayload = messages.slice(-5).map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const response = await apiService.askAssistant({
        message: query,
        history: historyPayload,
        incidentContext,
      });

      const assistantMsg: ChatMessage = {
        id: `assist-${Date.now()}`,
        role: 'assistant',
        text: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sources: response.sources,
        hindsightMatches: response.hindsightMatches,
        modelUsed: response.modelUsed,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        text: `[System telemetry] Unable to complete request: ${err?.message || 'Network unavailable'}. Please verify connection to the DRSTI server.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `reset-${Date.now()}`,
        role: 'assistant',
        text: `[Current incident] Chat reset. Context reloaded for **#${activeIncident.incidentNumber} — ${activeIncident.title}**.\n\n` +
          `[Hindsight memory] Ask me about root causes, historical incidents, or recommended runbook steps.`,
        timestamp: 'Just now',
        sources: [
          { type: 'Current incident', detail: `#${activeIncident.incidentNumber} ${activeIncident.service}` }
        ]
      }
    ]);
  };

  // Helper to format source tags into styled micro badges
  const renderFormattedText = (rawText: string) => {
    // Split text into lines to process source badges and markdown bullets cleanly
    const lines = rawText.split('\n');

    return (
      <div className="space-y-1.5 text-xs sm:text-[13px] leading-relaxed">
        {lines.map((line, idx) => {
          if (!line.trim()) {
            return <div key={idx} className="h-1" />;
          }

          // Replace source indicators with visual badges
          let renderedLine = line;
          const hasCurrentIncident = renderedLine.includes('[Current incident]');
          const hasHindsight = renderedLine.includes('[Hindsight memory]');
          const hasTelemetry = renderedLine.includes('[System telemetry]');
          const hasReasoning = renderedLine.includes('[AI reasoning]');

          renderedLine = renderedLine
            .replace(/\[Current incident\]/g, '')
            .replace(/\[Hindsight memory\]/g, '')
            .replace(/\[System telemetry\]/g, '')
            .replace(/\[AI reasoning\]/g, '');

          // Parse basic bold markdown (**text**)
          const parts = renderedLine.split(/(\*\*.*?\*\*|`.*?`)/g);

          return (
            <div key={idx} className="flex flex-col gap-1">
              {(hasCurrentIncident || hasHindsight || hasTelemetry || hasReasoning) && (
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5 pb-0.5">
                  {hasCurrentIncident && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                      <Activity className="w-2.5 h-2.5 text-cyan-400" />
                      Current incident
                    </span>
                  )}
                  {hasHindsight && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                      <Database className="w-2.5 h-2.5 text-purple-400" />
                      Hindsight memory
                    </span>
                  )}
                  {hasTelemetry && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                      <Terminal className="w-2.5 h-2.5 text-amber-400" />
                      System telemetry
                    </span>
                  )}
                  {hasReasoning && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                      <Sparkles className="w-2.5 h-2.5 text-indigo-400" />
                      AI reasoning
                    </span>
                  )}
                </div>
              )}

              <p className="text-slate-200">
                {parts.map((p, pIdx) => {
                  if (p.startsWith('**') && p.endsWith('**')) {
                    return <strong key={pIdx} className="font-semibold text-white">{p.slice(2, -2)}</strong>;
                  }
                  if (p.startsWith('`') && p.endsWith('`')) {
                    return (
                      <code key={pIdx} className="px-1 py-0.5 rounded bg-black/40 text-rose-300 font-mono text-[11px] border border-white/10">
                        {p.slice(1, -1)}
                      </code>
                    );
                  }
                  return <span key={pIdx}>{p}</span>;
                })}
              </p>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <>
      {/* ======================================================== */}
      {/* 1. FLOATING CHAT BUTTON (Bottom-Right Corner)            */}
      {/* ======================================================== */}
      <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-[9990] pointer-events-auto">
        {!isOpen && (
          <motion.button
            initial={{ scale: 0.8, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 15 }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => {
              setIsOpen(true);
              setIsMinimized(false);
            }}
            className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-[#0D111C]/95 text-white border border-purple-500/40 shadow-2xl shadow-purple-950/50 backdrop-blur-xl hover:border-purple-400 hover:shadow-purple-500/25 transition-all duration-200 cursor-pointer"
            aria-label="Open DRSTI Assistant"
          >
            {/* Ambient animated glow */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full blur opacity-30 group-hover:opacity-75 transition duration-300 -z-10" />

            {/* Glowing icon badge */}
            <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-inner">
              <Bot className="w-4.5 h-4.5" />
              {/* Online pulse dot */}
              <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
            </div>

            <div className="flex flex-col text-left">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-xs text-white tracking-wide">DRSTI Assistant</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  AI
                </span>
              </div>
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-500" />
                #{activeIncident.incidentNumber} · {activeIncident.service}
              </span>
            </div>
          </motion.button>
        )}
      </div>

      {/* ======================================================== */}
      {/* 2. CHAT PANEL (Matches DRSTI dark design system)         */}
      {/* ======================================================== */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 25 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0,
              height: isMinimized ? 'auto' : '580px',
            }}
            exit={{ opacity: 0, scale: 0.94, y: 25 }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            className={`fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-[9995] w-[calc(100vw-2.5rem)] sm:w-[440px] rounded-2xl bg-[#0B0E17]/98 border border-purple-500/40 shadow-2xl shadow-black/95 backdrop-blur-2xl flex flex-col overflow-hidden text-slate-100 ${
              isMinimized ? 'h-auto' : 'h-[580px] max-h-[85vh]'
            }`}
          >
            {/* Top Specular Sheen line */}
            <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-purple-500 to-transparent" />

            {/* Header */}
            <div className="p-3.5 sm:p-4 border-b border-white/[0.08] bg-slate-900/60 flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-600 via-indigo-600 to-cyan-600 flex items-center justify-center text-white shadow-md shadow-purple-900/30">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white tracking-tight leading-none">
                      DRSTI Assistant
                    </h3>
                    <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Online
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5 font-normal">
                    Ask me about this incident
                  </p>
                </div>
              </div>

              {/* Header Action Controls */}
              <div className="flex items-center gap-1 text-slate-400">
                <button
                  onClick={handleResetChat}
                  title="Clear conversation"
                  className="p-1.5 hover:text-white hover:bg-white/[0.08] rounded-lg transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  title={isMinimized ? "Expand chat" : "Minimize chat"}
                  className="p-1.5 hover:text-white hover:bg-white/[0.08] rounded-lg transition-colors cursor-pointer"
                >
                  {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  title="Close assistant"
                  className="p-1.5 hover:text-white hover:bg-rose-500/20 hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Incident Context Selector Bar (always visible) */}
            <div className="px-3.5 py-2 bg-purple-950/20 border-b border-purple-500/20 flex items-center justify-between gap-2 text-xs shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold font-mono bg-rose-500/20 text-rose-300 border border-rose-500/40 shrink-0">
                  {activeIncident.severity}
                </span>
                <div className="flex items-center gap-1 truncate text-[11px] text-slate-300">
                  <span className="font-semibold text-white">#{activeIncident.incidentNumber}</span>
                  <span>·</span>
                  <span className="truncate">{activeIncident.service}</span>
                </div>
              </div>

              <div className="relative">
                <button
                  onClick={() => setIsSelectorOpen(!isSelectorOpen)}
                  className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono text-purple-300 hover:text-white bg-purple-500/10 hover:bg-purple-500/20 rounded border border-purple-500/30 transition-colors cursor-pointer"
                >
                  <span>Switch</span>
                  <ChevronDown className="w-3 h-3" />
                </button>

                {/* Dropdown Menu for Incident Switching */}
                {isSelectorOpen && (
                  <div className="absolute right-0 top-6 z-50 w-56 p-1 rounded-xl bg-[#0D111C] border border-purple-500/40 shadow-xl shadow-black/80 space-y-0.5">
                    {INITIAL_INCIDENTS.map((inc) => (
                      <button
                        key={inc.id}
                        onClick={() => {
                          setActiveIncidentId(inc.id);
                          setIsSelectorOpen(false);
                          if (onNavigateToIncident) onNavigateToIncident(inc.id);
                        }}
                        className={`w-full text-left p-1.5 rounded-lg text-[11px] flex items-center justify-between transition-colors ${
                          inc.id === activeIncidentId 
                            ? 'bg-purple-600/30 text-white font-medium' 
                            : 'text-slate-300 hover:bg-white/[0.06] hover:text-white'
                        }`}
                      >
                        <span className="truncate">#{inc.incidentNumber} {inc.service}</span>
                        <span className="font-mono text-[9px] px-1 py-0.2 rounded bg-white/10 text-slate-400">
                          {inc.severity}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Chat Body & Input (Hidden when minimized) */}
            {!isMinimized && (
              <>
                {/* Messages stream */}
                <div className="flex-1 p-3.5 sm:p-4 overflow-y-auto space-y-3.5 scrollbar-thin scrollbar-thumb-white/10">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {msg.role === 'assistant' && (
                        <div className="w-6 h-6 rounded-lg bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300 shrink-0 mt-0.5">
                          <Bot className="w-3.5 h-3.5" />
                        </div>
                      )}

                      <div
                        className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed space-y-2 ${
                          msg.role === 'user'
                            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-tr-none shadow-md shadow-purple-950/40'
                            : 'bg-white/[0.04] border border-white/[0.08] text-slate-200 rounded-tl-none backdrop-blur-sm'
                        }`}
                      >
                        {msg.role === 'user' ? (
                          <p className="font-medium">{msg.text}</p>
                        ) : (
                          renderFormattedText(msg.text)
                        )}

                        <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/[0.06] text-[10px] text-slate-400 font-mono">
                          <span>{msg.timestamp}</span>
                          {msg.role === 'assistant' && msg.sources && msg.sources.length > 0 && (
                            <span className="text-purple-300/80 flex items-center gap-1">
                              <Database className="w-2.5 h-2.5" />
                              {msg.sources.length} sources
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Typing Indicator */}
                  {isLoading && (
                    <div className="flex gap-2.5 justify-start">
                      <div className="w-6 h-6 rounded-lg bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300 shrink-0">
                        <Bot className="w-3.5 h-3.5 animate-pulse" />
                      </div>
                      <div className="rounded-2xl rounded-tl-none p-3 bg-white/[0.04] border border-white/[0.08] flex items-center gap-2 text-xs text-purple-300 font-mono">
                        <Sparkles className="w-3.5 h-3.5 animate-spin" />
                        <span>Searching Hindsight & analyzing incident signals...</span>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Suggested Questions Horizontal Carousel */}
                <div className="px-3.5 py-2 border-t border-white/[0.06] bg-slate-950/40 overflow-x-auto scrollbar-none flex items-center gap-1.5 shrink-0">
                  <span className="text-[10px] text-slate-500 uppercase font-mono tracking-wider shrink-0 mr-1">
                    Ask:
                  </span>
                  {SUGGESTED_CHIPS.map((chip, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(chip)}
                      disabled={isLoading}
                      className="px-2.5 py-1 text-[11px] rounded-lg bg-white/[0.05] hover:bg-purple-600/25 text-slate-300 hover:text-purple-200 border border-white/[0.08] hover:border-purple-500/40 whitespace-nowrap transition-all duration-150 cursor-pointer disabled:opacity-50 active:scale-95 shrink-0"
                    >
                      {chip}
                    </button>
                  ))}
                </div>

                {/* Input Bar */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="p-3 border-t border-white/[0.08] bg-[#0A0D14] flex items-center gap-2 shrink-0"
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about root cause, history, or runbooks..."
                    disabled={isLoading}
                    className="flex-1 bg-white/[0.06] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500/60 transition-all font-sans disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="p-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:bg-white/[0.08] text-white disabled:text-slate-500 transition-colors shadow-md shadow-purple-950/40 cursor-pointer disabled:cursor-not-allowed"
                    title="Send message"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
