import React, { useState, useRef, useEffect } from "react";
import { useStudioStore } from "../lib/store/studio-store";
import { generateAssistantResponse, type AssistantMessage } from "../lib/ai/water-assistant-service";
import { cgwbApiAdapter } from "../lib/data/cgwb-api-adapter";
import { Bot, Send, User, Sparkles, MapPin, Sliders, ArrowRight } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export const AssistantPage: React.FC = () => {
  const { getCurrentDistrict, getPrediction, getPolicyEvaluation, params } = useStudioStore();
  const district = getCurrentDistrict();
  const prediction = getPrediction();
  const policies = getPolicyEvaluation();

  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      id: "init-1",
      sender: "assistant",
      text: `Hello! I am your **Groundwater Intelligence Advisor**, synced directly with official **CGWB Delhi NCR datasets** and your active **${district.name}** simulation parameters.

Currently, **${district.name}** is projected at **${prediction.predictedWaterLevelM} mbgl** with an extraction stage of **${prediction.predictedExtractionPct}%** (${prediction.riskLevel}).

How can I assist you with hydrological modeling, drought risk mitigation, or policy compliance today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      suggestedActions: [
        `What policies are recommended for ${district.name}?`,
        `How does rainfall deficit affect this aquifer?`,
        `Explain the difference between LSTM and XGBoost predictions`,
      ],
    },
  ]);

  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || isTyping) return;

    const userMsg: AssistantMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setIsTyping(true);

    try {
      // Query live Python AI backend
      const remoteRes = await cgwbApiAdapter.fetchAssistantChat(text, district, params, prediction);
      
      if (remoteRes) {
        setMessages((prev) => [
          ...prev,
          {
            id: `assistant-${Date.now()}`,
            sender: "assistant",
            text: remoteRes.text,
            timestamp: remoteRes.timestamp,
            suggestedActions: remoteRes.suggested_actions,
          },
        ]);
      } else {
        // Fallback to local response generator
        const localResponse = generateAssistantResponse(text, district, params, prediction, policies);
        setMessages((prev) => [...prev, localResponse]);
      }
    } catch (e) {
      const localResponse = generateAssistantResponse(text, district, params, prediction, policies);
      setMessages((prev) => [...prev, localResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 rounded-md bg-purple-500/20 px-2 py-0.5 text-xs font-semibold text-purple-300 border border-purple-500/30">
              <Bot className="h-3 w-3" /> AI Hydrogeology Advisor
            </span>
            <span className="text-xs text-slate-400">Context: {district.name} ({prediction.riskLevel})</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white mt-1">
            Conversational Groundwater Intelligence
          </h1>
          <p className="text-xs text-slate-400 max-w-2xl mt-0.5">
            Query statutory CGWB assessment standards, evaluate simulated scenarios, and understand aquifer replenishment dynamics in natural language.
          </p>
        </div>

        {/* Live Context Pill */}
        <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs text-slate-300">
          <div className="font-semibold text-cyan-400 flex items-center gap-1">
            <MapPin className="h-3 w-3" /> Active Simulation Context:
          </div>
          <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-slate-400">
            <span>Rainfall: {params.rainfallAnomalyPct}%</span>
            <span>•</span>
            <span>Extraction Δ: {params.extractionDeltaPct}%</span>
            <span>•</span>
            <span>RWH: {params.rwhAdoptionPct}%</span>
          </div>
        </div>
      </div>

      {/* Chat Container - Expansive Full Screen Cockpit */}
      <div className="rounded-3xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-xl shadow-2xl flex flex-col h-[calc(100vh-240px)] min-h-[720px] overflow-hidden">
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6">
          {messages.map((msg) => {
            const isUser = msg.sender === "user";
            return (
              <div
                key={msg.id}
                className={`flex gap-3 sm:gap-4 ${isUser ? "justify-end" : "justify-start"}`}
              >
                {!isUser && (
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-500 text-white shadow-lg shadow-cyan-500/20">
                    <Bot className="h-5 w-5" />
                  </div>
                )}

                <div className={`max-w-[94%] sm:max-w-[88%] lg:max-w-[84%] rounded-3xl px-5 py-4 text-xs sm:text-sm leading-relaxed ${
                  isUser
                    ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-br-none shadow-xl shadow-cyan-600/10"
                    : "bg-slate-900/90 border border-slate-800/90 text-slate-200 rounded-bl-none shadow-2xl"
                }`}>
                  <div className="prose prose-invert prose-sm max-w-none text-slate-200">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h3: ({ node, ...props }) => <h3 className="text-sm sm:text-base font-bold text-cyan-300 mt-2 mb-1.5" {...props} />,
                        p: ({ node, ...props }) => <p className="mb-2 leading-relaxed" {...props} />,
                        ul: ({ node, ...props }) => <ul className="list-disc pl-4 mb-2 space-y-1 text-slate-300" {...props} />,
                        ol: ({ node, ...props }) => <ol className="list-decimal pl-4 mb-2 space-y-1 text-slate-300" {...props} />,
                        li: ({ node, ...props }) => <li className="leading-relaxed" {...props} />,
                        strong: ({ node, ...props }) => <strong className="font-bold text-white" {...props} />,
                        table: ({ node, ...props }) => (
                          <div className="my-2.5 overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60">
                            <table className="w-full text-[11px] text-left border-collapse" {...props} />
                          </div>
                        ),
                        th: ({ node, ...props }) => <th className="p-2 border-b border-slate-800 bg-slate-900/80 font-bold text-cyan-300" {...props} />,
                        td: ({ node, ...props }) => <td className="p-2 border-b border-slate-800/60 text-slate-300" {...props} />,
                        code: ({ node, ...props }) => <code className="rounded bg-slate-800 px-1 py-0.5 font-mono text-[11px] text-cyan-300" {...props} />,
                      }}
                    >
                      {msg.text}
                    </ReactMarkdown>
                  </div>

                  <div className={`mt-2 text-[10px] ${isUser ? "text-cyan-200 text-right" : "text-slate-500 text-left"}`}>
                    {msg.timestamp}
                  </div>

                  {/* Suggested Followups */}
                  {!isUser && msg.suggestedActions && msg.suggestedActions.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-800 flex flex-wrap gap-1.5">
                      {msg.suggestedActions.map((action, i) => (
                        <button
                          key={i}
                          onClick={() => handleSend(action)}
                          className="rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1 text-[11px] text-cyan-300 hover:bg-slate-700 hover:text-white transition flex items-center gap-1"
                        >
                          <Sparkles className="h-2.5 w-2.5 text-cyan-400" />
                          {action}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-800 border border-slate-700 text-slate-300 shadow-md">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex gap-3 justify-start items-center">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 text-white shadow-md">
                <Bot className="h-4 w-4" />
              </div>
              <div className="rounded-2xl bg-slate-900 border border-slate-800 px-4 py-3 text-xs text-slate-400 rounded-bl-none shadow-lg flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="h-2 w-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="h-2 w-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                <span className="text-[11px] text-slate-400 font-mono ml-1">Analyzing CGWB hydrogeology models...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="border-t border-slate-800 bg-slate-950/80 p-3 sm:p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Ask about ${district.name}'s groundwater stress, policies, or hydrogeology...`}
              className="flex-1 rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 text-white transition disabled:opacity-40 hover:opacity-90 shadow-md shadow-cyan-500/20"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
