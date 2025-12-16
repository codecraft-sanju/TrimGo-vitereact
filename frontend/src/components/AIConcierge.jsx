// AIConcierge.jsx
import React, { useState, useRef, useEffect } from "react";
import { ArrowRight, X, Sparkles, Zap, DollarSign, Star, Clock } from "lucide-react";

const SUGGESTIONS = [
  { id: 1, label: "Shortest Queue", icon: <Zap size={12} />, text: "Find the shortest queue nearby", type: "urgent" },
  { id: 2, label: "Best Price", icon: <DollarSign size={12} />, text: "Find cheap haircuts under ₹200", type: "cheap" },
  { id: 3, label: "Top Rated", icon: <Star size={12} />, text: "Show me the best rated salons", type: "rating" },
  { id: 4, label: "Quick Trim", icon: <Clock size={12} />, text: "I need a quick beard trim", type: "fast" },
];

const AIConcierge = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: "Hi! I'm your TrimGo assistant. Tap an option below or ask me anything!",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = (textOverride = null) => {
    // Agar textOverride (button click) hai toh wo use karo, nahi toh input state
    const userMsg = textOverride || input;
    
    if (!userMsg.trim()) return;

    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setInput("");
    setIsTyping(true);

    // AI Logic Simulation
    setTimeout(() => {
      let response = "I can help with that request.";
      const lowerMsg = userMsg.toLowerCase();

      if (lowerMsg.includes("urgent") || lowerMsg.includes("fast") || lowerMsg.includes("shortest")) {
        response = "I found 'Fade & Blade' nearby with only 5 min waiting time. It's 1.2km away.";
      } else if (lowerMsg.includes("cheap") || lowerMsg.includes("price") || lowerMsg.includes("200")) {
        response = "Urban Cut Pro offers the best rates starting at ₹150 for a classic haircut.";
      } else if (lowerMsg.includes("rated") || lowerMsg.includes("best")) {
        response = "Luxury Looks is the top-rated salon (4.9 stars) in your area.";
      } else if (lowerMsg.includes("beard") || lowerMsg.includes("trim")) {
        response = "For beard trims, 'The Gentlemen's Den' is highly recommended.";
      }

      setMessages((prev) => [...prev, { role: "ai", text: response }]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans">
      {isOpen && (
        <div className="mb-4 w-80 h-[500px] bg-white rounded-3xl shadow-2xl border border-zinc-200 overflow-hidden flex flex-col animate-in slide-in-from-bottom-5 duration-300">
          
          {/* Header */}
          <div className="bg-zinc-900 p-4 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                <div className="absolute inset-0 w-2 h-2 rounded-full bg-emerald-400 animate-ping opacity-75"></div>
              </div>
              <h3 className="text-white font-bold text-sm">TrimGo AI</h3>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-zinc-800 rounded-full transition-colors"
            >
              <X className="text-zinc-400 hover:text-white" size={16} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-zinc-50">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${
                  m.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-2xl text-xs font-medium leading-relaxed shadow-sm ${
                    m.role === "user"
                      ? "bg-zinc-900 text-white rounded-tr-none"
                      : "bg-white border border-zinc-200 text-zinc-600 rounded-tl-none"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                 <div className="bg-white border border-zinc-200 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm flex gap-1">
                    <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce"></div>
                 </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions (Suggestion Chips) */}
          <div className="bg-zinc-50 px-4 pb-2">
            <p className="text-[10px] font-bold text-zinc-400 mb-2 uppercase tracking-wider">Suggested actions</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion.id}
                  onClick={() => handleSend(suggestion.text)}
                  className="flex items-center gap-1.5 bg-white border border-zinc-200 hover:border-zinc-900 hover:bg-zinc-50 px-3 py-1.5 rounded-full transition-all group shadow-sm"
                >
                  <span className="text-zinc-500 group-hover:text-zinc-900 transition-colors">
                    {suggestion.icon}
                  </span>
                  <span className="text-[11px] font-semibold text-zinc-700 group-hover:text-zinc-900">
                    {suggestion.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-zinc-100 flex gap-2 shrink-0">
            <input
              className="flex-1 bg-zinc-100 rounded-xl px-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-zinc-900 placeholder:text-zinc-400"
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim()}
              className={`p-2 rounded-xl transition-all ${
                 input.trim() 
                 ? "bg-zinc-900 text-white hover:bg-zinc-800 shadow-md shadow-zinc-900/20" 
                 : "bg-zinc-100 text-zinc-300"
              }`}
            >
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-zinc-900 text-white shadow-xl shadow-zinc-900/30 flex items-center justify-center hover:scale-110 transition-transform group active:scale-95"
      >
        {isOpen ? (
          <X size={24} />
        ) : (
          <Sparkles
            size={24}
            className="group-hover:rotate-12 transition-transform"
          />
        )}
      </button>
    </div>
  );
};

export default AIConcierge;