import React, { useState, useRef, useEffect } from "react";
import { X, Sparkles, Zap, DollarSign, Star, Clock, ChevronRight, User, Send, Instagram, ArrowUpRight } from "lucide-react";
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

  // Auto-scroll logic (Optimized: Scrolls only on new message)
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping, isOpen]);

  // --- REAL AI LOGIC ---
  const processQuery = (query) => {
    const lowerQ = query.trim().toLowerCase();

    // 0. GREETINGS LOGIC
    const greetings = ["hi", "hello", "hey", "hola", "namaste", "yo"];
    if (greetings.some(g => lowerQ === g || lowerQ.startsWith(g + " "))) {
        return { 
            text: "Hello! 👋 Great to see you. I'm ready to help you find the best salon deals or shortest queues. What are you looking for today?" 
        };
    }

    // 1. ADMIN / CREATOR / FOUNDER LOGIC
    if (
        lowerQ.includes("admin") || 
        lowerQ.includes("owner") || 
        lowerQ.includes("creat") || 
        lowerQ.includes("founder") || 
        lowerQ.includes("sanjay") ||
        lowerQ.includes("made") ||
        lowerQ.includes("built") ||
        lowerQ.includes("dev")
    ) {
        return {
            text: "TrimGo is the brainchild of **Sanjay Choudhary**, a visionary Full Stack Developer. This startup is just the beginning of his journey—expect many more innovative products to launch soon!",
            creatorData: {
                name: "Sanjay Choudhary",
                role: "Founder & Lead Developer",
                tagline: "Building the future, one app at a time.",
                links: [
                    { 
                        label: "Founder", 
                        handle: "@sanjuuu_x18", 
                        url: "https://www.instagram.com/sanjuuu_x18",
                        primary: true 
                    },
                    { 
                        label: "Official Page", 
                        handle: "@trimgo_official", 
                        url: "https://www.instagram.com/trimgo_official",
                        primary: false 
                    }
                ]
            }
        };
    }

    const onlineSalons = salons.filter(s => s.isOnline);
    if (onlineSalons.length === 0) return { text: "All salons seem to be offline at the moment." };

    // 2. CHEAPEST logic
    if (lowerQ.includes("cheap") || lowerQ.includes("price") || lowerQ.includes("cost")) {
      const cheapest = [...onlineSalons].sort((a, b) => {
        const minA = Math.min(...(a.services?.map(s => s.price) || [9999]));
        const minB = Math.min(...(b.services?.map(s => s.price) || [9999]));
        return minA - minB;
      })[0];
      if (cheapest) {
        const minPrice = Math.min(...(cheapest.services?.map(s => s.price) || [0]));
        return { text: `Best price at **${cheapest.salonName}**. Starts at ₹${minPrice}.`, salonData: cheapest };
      }
    }

    // 3. FASTEST / URGENT logic
    if (lowerQ.includes("fast") || lowerQ.includes("urgent") || lowerQ.includes("time")) {
      const fastest = [...onlineSalons].sort((a, b) => (a.estTime || 0) - (b.estTime || 0))[0];
      if (fastest) return { text: `**${fastest.salonName}** is quickest. Est: ${fastest.estTime || 0} mins.`, salonData: fastest };
    }

    // 4. RATING logic
    if (lowerQ.includes("best") || lowerQ.includes("rate") || lowerQ.includes("star")) {
      const best = [...onlineSalons].sort((a, b) => (b.rating || 0) - (a.rating || 0))[0];
      if (best) return { text: `**${best.salonName}** is top rated (${best.rating || "New"} stars).`, salonData: best };
    }

    // 5. OPEN NOW logic
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
          salonData: result.salonData,
          creatorData: result.creatorData 
      }]);
      setIsTyping(false);
    }, 800);
  };

  return (
    <>
      {/* Custom Scrollbar Styles for Premium Feel */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.2);
        }
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
              // FIXED: Added flex flex-col to parent and proper heights
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

              {/* Chat Area - FIXED: flex-1 and min-h-0 ensures scrolling works properly */}
              <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-gradient-to-b from-white/40 to-white/70">
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

                    {/* 🔥 CREATOR / FOUNDER CARD 🔥 */}
                    {m.creatorData && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-3 w-[90%] bg-zinc-900 text-white p-4 rounded-2xl shadow-xl shadow-zinc-500/20 relative overflow-hidden group"
                        >
                            {/* Abstract Glow Background */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2" />
                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-pink-500/20 rounded-full blur-[30px] translate-y-1/2 -translate-x-1/2" />

                            <div className="relative z-10">
                                <div className="flex items-start gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500 p-[2px]">
                                        <div className="w-full h-full bg-black rounded-full flex items-center justify-center">
                                            <User size={18} className="text-white"/>
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-white font-bold text-sm tracking-wide">{m.creatorData.name}</h4>
                                        <p className="text-zinc-400 text-[10px] font-medium uppercase tracking-wider">{m.creatorData.role}</p>
                                        <p className="text-zinc-500 text-[10px] mt-0.5 italic">{m.creatorData.tagline}</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    {m.creatorData.links.map((link, idx) => (
                                        <a 
                                            key={idx} 
                                            href={link.url} 
                                            target="_blank" 
                                            rel="noreferrer" 
                                            className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                                                link.primary 
                                                ? "bg-white text-black hover:bg-zinc-200" 
                                                : "bg-white/10 text-white hover:bg-white/20 border border-white/10"
                                            }`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <Instagram size={14} className={link.primary ? "text-pink-600" : "text-white"} />
                                                <span>{link.label}</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-[10px] opacity-70">
                                                <span>{link.handle}</span>
                                                <ArrowUpRight size={10} />
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
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
                {/* Scroll Anchor */}
                <div ref={messagesEndRef} />
              </div>

              {/* Suggestions */}
              <div className="px-4 py-3 bg-white/50 backdrop-blur-sm border-t border-white/40 shrink-0">
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
              <div className="p-3 bg-white/80 border-t border-zinc-100 flex gap-2 backdrop-blur-xl shrink-0">
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