// AIConcierge.jsx
import React, { useState, useRef, useEffect } from "react";
import { ArrowRight, X, Sparkles, Zap, DollarSign, Star, Clock, ChevronRight, User, Instagram } from "lucide-react";

const SUGGESTIONS = [
  { id: 1, label: "Shortest Queue", icon: <Zap size={12} />, text: "Which salon has the shortest wait time?", type: "fast" },
  { id: 2, label: "Cheapest Cut", icon: <DollarSign size={12} />, text: "Find the cheapest haircut near me", type: "cheap" },
  { id: 3, label: "Top Rated", icon: <Star size={12} />, text: "Show me the best rated salon", type: "rating" },
  { id: 4, label: "Open Now", icon: <Clock size={12} />, text: "Which salons are open right now?", type: "open" },
  { id: 5, label: "About Creator", icon: <User size={12} />, text: "Who created TrimGo?", type: "admin" },
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

    // --- 0. ADMIN / CREATOR LOGIC ---
    // Expanded keywords to catch more variations like "created", "founder", etc.
    if (lowerQ.includes("admin") || 
        lowerQ.includes("owner") || 
        lowerQ.includes("creator") || 
        lowerQ.includes("founder") || 
        lowerQ.includes("created") || 
        lowerQ.includes("developer") || 
        lowerQ.includes("made this") || 
        lowerQ.includes("sanjay")) {
        
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

    if (onlineSalons.length === 0) {
      return { text: "All salons seem to be offline at the moment." };
    }

    // 1. CHEAPEST logic
    if (lowerQ.includes("cheap") || lowerQ.includes("price") || lowerQ.includes("cost") || lowerQ.includes("budget")) {
      const cheapest = [...onlineSalons].sort((a, b) => {
        const minA = Math.min(...(a.services?.map(s => s.price) || [9999]));
        const minB = Math.min(...(b.services?.map(s => s.price) || [9999]));
        return minA - minB;
      })[0];

      if (cheapest) {
        const minPrice = Math.min(...(cheapest.services?.map(s => s.price) || [0]));
        return {
          text: `I found the best price at **${cheapest.salonName}**. Services start at ₹${minPrice}.`,
          salon: cheapest
        };
      }
    }

    // 2. FASTEST / URGENT logic
    if (lowerQ.includes("fast") || lowerQ.includes("urgent") || lowerQ.includes("wait") || lowerQ.includes("queue") || lowerQ.includes("time")) {
      const fastest = [...onlineSalons].sort((a, b) => (a.estTime || 0) - (b.estTime || 0))[0];
      if (fastest) {
        return {
          text: `**${fastest.salonName}** has the shortest wait. Est. time: ${fastest.estTime || 0} mins (${fastest.waiting || 0} people waiting).`,
          salon: fastest
        };
      }
    }

    // 3. RATING logic
    if (lowerQ.includes("best") || lowerQ.includes("top") || lowerQ.includes("rate") || lowerQ.includes("star")) {
      const best = [...onlineSalons].sort((a, b) => (b.rating || 0) - (a.rating || 0))[0];
      if (best) {
        return {
          text: `**${best.salonName}** is the highest rated (${best.rating || "New"} stars).`,
          salon: best
        };
      }
    }

    // 4. OPEN NOW logic
    if (lowerQ.includes("open")) {
       return {
         text: `There are currently ${onlineSalons.length} salons open and accepting customers near you.`
       };
    }

    return { text: "I can help you find the nearest, cheapest, or highest-rated salons. Try tapping a suggestion below!" };
  };

  const handleSend = (textOverride = null) => {
    const userMsg = textOverride || input;
    if (!userMsg.trim()) return;

    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const result = processQuery(userMsg);
      // We pass salonData OR adminData depending on the result
      setMessages((prev) => [...prev, { 
          role: "ai", 
          text: result.text, 
          salonData: result.salon,
          adminData: result.adminData 
      }]);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <>
      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans">
        {isOpen && (
          <div className="mb-4 w-80 sm:w-96 h-[550px] bg-white rounded-3xl shadow-2xl border border-zinc-200 overflow-hidden flex flex-col animate-in slide-in-from-bottom-5 duration-300">
            
            {/* Header */}
            <div className="bg-zinc-900 p-4 flex justify-between items-center shrink-0 shadow-sm z-10">
              <div className="flex items-center gap-3">
                <div className="relative flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
                  <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping opacity-75"></div>
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm tracking-wide">TrimGo AI</h3>
                  <p className="text-[10px] text-zinc-400 font-medium">Live Concierge</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-800 transition-colors"
              >
                <X className="text-zinc-400 hover:text-white" size={18} />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50 scrollbar-hide">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}
                >
                  {/* Message Bubble */}
                  <div
                    className={`max-w-[85%] p-3.5 rounded-2xl text-xs sm:text-sm font-medium leading-relaxed shadow-sm transition-all ${
                      m.role === "user"
                        ? "bg-zinc-900 text-white rounded-tr-sm"
                        : "bg-white border border-zinc-200 text-zinc-600 rounded-tl-sm"
                    }`}
                  >
                    {m.text.split("**").map((part, idx) => 
                      idx % 2 === 1 ? <strong key={idx} className={m.role === "user" ? "text-white" : "text-zinc-900"}>{part}</strong> : part
                    )}
                  </div>

                  {/* CASE 1: Salon Result Card */}
                  {m.salonData && (
                     <div className="mt-2 w-[85%] bg-white rounded-xl border border-zinc-200 shadow-lg shadow-zinc-200/50 overflow-hidden animate-in zoom-in-95 duration-300 ring-1 ring-black/5">
                        <div className="p-3 border-b border-zinc-100 flex justify-between items-start bg-zinc-50/50">
                           <div>
                              <h4 className="font-bold text-zinc-900 text-sm">{m.salonData.salonName}</h4>
                              <div className="flex items-center gap-2 text-[10px] text-zinc-500 mt-1 font-medium">
                                 <span className="flex items-center gap-0.5 text-zinc-700"><Star size={10} className="fill-yellow-400 text-yellow-400"/> {m.salonData.rating || "New"}</span>
                                 <span className="text-zinc-300">•</span>
                                 <span className="text-emerald-600">{m.salonData.estTime} min wait</span>
                              </div>
                           </div>
                           <div className="w-8 h-8 rounded-full bg-white border border-zinc-100 flex items-center justify-center font-bold text-xs text-zinc-900 shadow-sm">
                              {m.salonData.rating || "4.5"}
                           </div>
                        </div>
                        <button 
                          onClick={() => onSalonSelect && onSalonSelect(m.salonData)}
                          className="w-full py-2.5 bg-white hover:bg-zinc-50 text-xs font-bold text-zinc-900 transition-colors flex items-center justify-center gap-1 group"
                        >
                           View Salon <ChevronRight size={14} className="text-zinc-400 group-hover:text-zinc-900 group-hover:translate-x-0.5 transition-all"/>
                        </button>
                     </div>
                  )}

                  {/* CASE 2: Admin / Creator Card */}
                  {m.adminData && (
                      <div className="mt-2 w-[85%] bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-xl border border-zinc-700 shadow-xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-4 flex flex-col items-center text-center">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500 p-[2px] mb-2 shadow-lg">
                                <div className="w-full h-full rounded-full bg-zinc-900 flex items-center justify-center">
                                    <User size={20} className="text-white"/>
                                </div>
                            </div>
                            <h4 className="font-bold text-white text-sm">{m.adminData.name}</h4>
                            <p className="text-[10px] text-zinc-400 mb-3">{m.adminData.role}</p>
                            
                            <a 
                                href={m.adminData.instaLink} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/5 transition-all text-xs font-bold text-white group"
                            >
                                <Instagram size={14} />
                                <span>Instagram</span>
                                <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 -ml-2 group-hover:ml-0 transition-all"/>
                            </a>
                        </div>
                      </div>
                  )}

                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start animate-in fade-in duration-300">
                   <div className="bg-white border border-zinc-200 px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm flex gap-1 items-center h-10">
                      <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce"></div>
                   </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions (Suggestions) - WRAPPED LAYOUT */}
            <div className="bg-zinc-50/80 backdrop-blur-sm border-t border-zinc-100 pt-3 pb-2 px-3">
               {/* Flex-wrap keeps everything visible on multiple lines */}
              <div className="flex flex-wrap gap-2 pb-2">
                {SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion.id}
                    onClick={() => handleSend(suggestion.text)}
                    className="flex-shrink-0 flex items-center gap-1.5 bg-white border border-zinc-200 hover:border-zinc-900 hover:bg-zinc-50 hover:shadow-md px-3 py-1.5 rounded-full transition-all group shadow-sm active:scale-95"
                  >
                    <span className="text-zinc-400 group-hover:text-zinc-900 transition-colors">
                      {suggestion.icon}
                    </span>
                    <span className="text-[11px] font-semibold text-zinc-600 group-hover:text-zinc-900">
                      {suggestion.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Input Area */}
            <div className="p-3 bg-white border-t border-zinc-100 flex gap-2 shrink-0 z-10 relative">
              <input
                className="flex-1 bg-zinc-100 rounded-xl px-4 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:bg-white transition-all placeholder:text-zinc-400"
                placeholder="Ask about price, time, etc..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim()}
                className={`p-2.5 rounded-xl transition-all duration-200 ${
                   input.trim() 
                   ? "bg-zinc-900 text-white hover:bg-zinc-800 shadow-lg shadow-zinc-900/20 hover:scale-105 active:scale-95" 
                   : "bg-zinc-100 text-zinc-300"
                }`}
              >
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Toggle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 rounded-full bg-zinc-900 text-white shadow-2xl shadow-zinc-900/40 flex items-center justify-center hover:scale-110 transition-transform duration-300 group active:scale-90 border-4 border-zinc-50"
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
    </>
  );
};

export default AIConcierge;