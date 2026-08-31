import React, { useState, useRef, useEffect } from "react";
import { useStudioStore } from "../lib/store/studio-store";
import { generateAssistantResponse, type AssistantMessage } from "../lib/ai/water-assistant-service";
import { Bot, Send, User, Sparkles, MapPin, Sliders, ArrowRight } from "lucide-react";

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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    const userMsg: AssistantMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");

    // Simulate AI response calculation
    setTimeout(() => {
      const response = generateAssistantResponse(text, district, params, prediction, policies);
      setMessages((prev) => [...prev, response]);
    }, 400);
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

      {/* Chat Container */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-md shadow-2xl flex flex-col h-[600px] overflow-hidden">
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg) => {
            const isUser = msg.sender === "user";
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
              >
                {!isUser && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 text-white shadow-md">
                    <Bot className="h-4 w-4" />
                  </div>
                )}

                <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed ${
                  isUser
                    ? "bg-cyan-600 text-white rounded-br-none shadow-md"
                    : "bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none shadow-lg"
                }`}>
                  <div className="whitespace-pre-line space-y-2">
                    {msg.text.split("\n\n").map((paragraph, i) => (
                      <p key={i}>{paragraph}</p>
                    ))}
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
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-slate-300 border border-slate-700">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            );
          })}
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
