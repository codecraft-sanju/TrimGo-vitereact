// AIConcierge.jsx
import React, { useState, useRef, useEffect } from "react";
import { X, Sparkles, Zap, DollarSign, Star, Clock, ChevronRight, User, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const SUGGESTIONS = [
  { id: 1, label: "Shortest Queue", icon: <Zap size={14} />, text: "Which salon has the shortest wait time?", color: "text-amber-500" },
  { id: 2, label: "Best Price", icon: <DollarSign size={14} />, text: "Find the cheapest haircut near me", color: "text-emerald-500" },
  { id: 3, label: "Top Rated", icon: <Star size={14} />, text: "Show me the best rated salon", color: "text-yellow-500" },
  { id: 4, label: "Open Now", icon: <Clock size={14} />, text: "Which salons are open right now?", color: "text-blue-500" },
  { id: 5, label: "Creator", icon: <User size={14} />, text: "Who created TrimGo?", color: "text-purple-500" },
];

const AIConcierge = ({ salons = [], onSalonSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: "Hi! I'm your TrimGo assistant. I can scan all nearby salons for you. What do you need?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll logic
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, isOpen]);

  // --- REAL AI LOGIC ---
  const processQuery = (query) => {
    const lowerQ = query.toLowerCase();

    // 0. ADMIN / CREATOR LOGIC
    if (lowerQ.includes("admin") || lowerQ.includes("owner") || lowerQ.includes("creator") || lowerQ.includes("founder") || lowerQ.includes("sanjay")) {
        return {
            text: "TrimGo is built by **Sanjay Choudhary**, a Full Stack Developer passionate about solving real-world problems.",
            adminData: {
                name: "Sanjay Choudhary",
                role: "Founder & Developer",
                instaHandle: "@sanjuuu_x18",
                instaLink: "https://www.instagram.com/sanjuuu_x18"
            }
        };
    }

    const onlineSalons = salons.filter(s => s.isOnline);
    if (onlineSalons.length === 0) return { text: "All salons seem to be offline at the moment." };

    // 1. CHEAPEST logic
    if (lowerQ.includes("cheap") || lowerQ.includes("price") || lowerQ.includes("cost")) {
      const cheapest = [...onlineSalons].sort((a, b) => {
        const minA = Math.min(...(a.services?.map(s => s.price) || [9999]));
        const minB = Math.min(...(b.services?.map(s => s.price) || [9999]));
        return minA - minB;
      })[0];
      if (cheapest) {
        const minPrice = Math.min(...(cheapest.services?.map(s => s.price) || [0]));
        return { text: `Best price at **${cheapest.salonName}**. Starts at ₹${minPrice}.`, salon: cheapest };
      }
    }

    // 2. FASTEST / URGENT logic
    if (lowerQ.includes("fast") || lowerQ.includes("urgent") || lowerQ.includes("time")) {
      const fastest = [...onlineSalons].sort((a, b) => (a.estTime || 0) - (b.estTime || 0))[0];
      if (fastest) return { text: `**${fastest.salonName}** is quickest. Est: ${fastest.estTime || 0} mins.`, salon: fastest };
    }

    // 3. RATING logic
    if (lowerQ.includes("best") || lowerQ.includes("rate") || lowerQ.includes("star")) {
      const best = [...onlineSalons].sort((a, b) => (b.rating || 0) - (a.rating || 0))[0];
      if (best) return { text: `**${best.salonName}** is top rated (${best.rating || "New"} stars).`, salon: best };
    }

    // 4. OPEN NOW logic
    if (lowerQ.includes("open")) return { text: `There are ${onlineSalons.length} salons open right now.` };

    return { text: "I can help find nearest, cheapest, or top-rated salons. Tap a suggestion below!" };
  };

  const handleSend = (textOverride = null) => {
    const userMsg = textOverride || input;
    if (!userMsg.trim()) return;

    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const result = processQuery(userMsg);
      setMessages((prev) => [...prev, { 
          role: "ai", 
          text: result.text, 
          salonData: result.salon,
          adminData: result.adminData 
      }]);
      setIsTyping(false);
    }, 800);
  };

  return (
    <>
      {/* Scrollbar hiding styles */}
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* Main Container */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-4 font-sans pointer-events-none">
        
        {/* Chat Window */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20, transformOrigin: "bottom right" }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
              // Dimensions: Optimized for Desktop & Mobile
              className="pointer-events-auto w-[90vw] sm:w-[380px] h-[55vh] sm:h-[500px] max-h-[80vh] bg-white/90 backdrop-blur-xl border border-white/60 shadow-2xl rounded-[2rem] flex flex-col overflow-hidden"
            >
              
              {/* Header */}
              <div className="px-5 py-3 bg-white/60 border-b border-white/30 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center shadow-lg">
                    <Sparkles className="text-white" size={14} />
                  </div>
                  <div>
                    <h3 className="font-bold text-zinc-900 text-sm">TrimGo AI</h3>
                    <p className="text-[10px] text-zinc-500 font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Concierge
                    </p>
                  </div>
                </div>
                <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-zinc-100 rounded-full transition-colors">
                  <X size={18} className="text-zinc-400 hover:text-zinc-900" />
                </button>
              </div>

              {/* Chat Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 hide-scrollbar bg-gradient-to-b from-white/40 to-white/70">
                {messages.map((m, i) => (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={i}
                    className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`max-w-[85%] px-3 py-2.5 rounded-2xl text-xs sm:text-sm font-medium shadow-sm leading-relaxed ${
                        m.role === "user"
                          ? "bg-zinc-900 text-white rounded-br-sm"
                          : "bg-white text-zinc-700 border border-white/60 rounded-bl-sm"
                      }`}
                    >
                      {m.text.split("**").map((part, idx) => 
                        idx % 2 === 1 ? <span key={idx} className={`font-bold ${m.role === 'user' ? 'text-white' : 'text-zinc-900'}`}>{part}</span> : part
                      )}
                    </div>

                    {/* Salon Card */}
                    {m.salonData && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="mt-2 w-[85%] bg-white p-3 rounded-xl border border-zinc-100 shadow-lg ring-1 ring-black/5 cursor-pointer hover:scale-[1.02] transition-transform"
                            onClick={() => onSalonSelect && onSalonSelect(m.salonData)}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h4 className="font-bold text-zinc-900 text-xs sm:text-sm">{m.salonData.salonName}</h4>
                                    <div className="flex items-center gap-2 text-[10px] text-zinc-500 mt-0.5">
                                        <span className="flex items-center gap-0.5"><Star size={10} className="fill-yellow-400 text-yellow-400"/> {m.salonData.rating || "New"}</span>
                                        <span>•</span>
                                        <span className="text-emerald-600 font-bold">{m.salonData.estTime} min</span>
                                    </div>
                                </div>
                                <div className="p-1.5 bg-zinc-50 rounded-lg"><ChevronRight size={14} className="text-zinc-400"/></div>
                            </div>
                            <div className="w-full h-1 bg-zinc-100 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 w-2/3"></div>
                            </div>
                        </motion.div>
                    )}

                    {/* Admin Card */}
                    {m.adminData && (
                        <div className="mt-2 w-[85%] bg-zinc-900 p-3 rounded-xl shadow-xl border border-zinc-700">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-500 to-yellow-500 p-[1.5px]">
                                    <div className="w-full h-full bg-black rounded-full flex items-center justify-center">
                                        <User size={14} className="text-white"/>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-white font-bold text-xs">{m.adminData.name}</h4>
                                    <p className="text-zinc-400 text-[9px]">{m.adminData.role}</p>
                                </div>
                            </div>
                            <a href={m.adminData.instaLink} target="_blank" rel="noreferrer" className="block w-full py-1.5 bg-white/10 rounded-lg text-center text-[10px] font-bold text-white hover:bg-white/20 transition-colors">
                                Visit Instagram
                            </a>
                        </div>
                    )}
                  </motion.div>
                ))}
                {isTyping && (
                  <div className="flex gap-1 pl-2">
                    <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:0.1s]"></span>
                    <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* 🔥 WRAPPED SUGGESTIONS (Updated Section) */}
              <div className="px-4 py-3 bg-white/50 backdrop-blur-sm border-t border-white/40">
                <div className="flex flex-wrap gap-2">
                    {SUGGESTIONS.map((s) => (
                        <button
                            key={s.id}
                            onClick={() => handleSend(s.text)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/80 border border-white shadow-sm rounded-full hover:shadow-md hover:scale-105 transition-all active:scale-95"
                        >
                            <span className={s.color}>{s.icon}</span>
                            <span className="text-[10px] font-bold text-zinc-600">{s.label}</span>
                        </button>
                    ))}
                </div>
              </div>

              {/* Input Area */}
              <div className="p-3 bg-white/80 border-t border-zinc-100 flex gap-2 backdrop-blur-xl">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Ask anything..."
                  className="flex-1 bg-zinc-100/50 border border-transparent focus:bg-white focus:border-zinc-200 focus:ring-2 focus:ring-zinc-900/5 rounded-xl px-3 text-xs sm:text-sm outline-none transition-all placeholder:text-zinc-400"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim()}
                  className={`p-2.5 rounded-xl transition-all shadow-sm ${
                    input.trim() ? "bg-zinc-900 text-white hover:bg-zinc-800 hover:shadow-lg active:scale-95" : "bg-zinc-100 text-zinc-400"
                  }`}
                >
                  <Send size={16} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Trigger Button */}
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.9 }}
          className="pointer-events-auto w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-zinc-900 text-white shadow-2xl shadow-zinc-900/30 flex items-center justify-center border-[3px] border-white/50 backdrop-blur-md relative overflow-hidden group"
        >
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <AnimatePresence mode="wait">
                {isOpen ? (
                    <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                        <X size={24} />
                    </motion.div>
                ) : (
                    <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
                        <Sparkles size={24} className="fill-white/20" />
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.button>

      </div>
    </>
  );
};

export default AIConcierge;