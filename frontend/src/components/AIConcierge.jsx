import React, { useState, useRef, useEffect } from "react";
import { X, Sparkles, Zap, DollarSign, Star, Clock, ChevronRight, User, Send, Instagram, ArrowUpRight, Mic, Volume2, StopCircle } from "lucide-react";
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
  
  // --- VOICE STATE ---
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Auto-scroll
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping, isOpen]);

  // --- 1. VOICE SETUP (SPEECH TO TEXT) ---
  useEffect(() => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false; // Stop after one sentence
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = "en-US"; // Default language

      recognitionRef.current.onstart = () => setIsListening(true);
      recognitionRef.current.onend = () => setIsListening(false);
      
      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        handleSend(transcript); // Auto-send after speaking
      };
    }
    
    // Cleanup speech synthesis on unmount
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      // Stop speaking if listening starts
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      recognitionRef.current?.start();
    }
  };

  // --- 2. TEXT TO SPEECH LOGIC ---
  const speakResponse = (text) => {
    if (!("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel(); // Stop previous speech
    
    // Clean text (remove Markdown like **bold**) for smoother speech
    const cleanText = text.replace(/\*\*/g, "").replace(/#/g, "");
    
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1; // Normal speed
    utterance.pitch = 1; 

    // Try to find a "natural" or "Google" voice for better quality
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.name.includes("Google US English") || v.name.includes("Samantha") || v.name.includes("Natural"));
    if (preferredVoice) utterance.voice = preferredVoice;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  // --- PROCESS LOGIC ---
  const processQuery = (query) => {
    const lowerQ = query.trim().toLowerCase();

    // 0. GREETINGS
    const greetings = ["hi", "hello", "hey", "hola", "namaste", "yo"];
    if (greetings.some(g => lowerQ === g || lowerQ.startsWith(g + " "))) {
        return { 
          text: "Hello! 👋 Great to see you. I can help you find deals, short queues, or specific salons. Just ask!" 
        };
    }

    // 1. ADMIN / CREATOR
    if (lowerQ.includes("admin") || lowerQ.includes("owner") || lowerQ.includes("creat") || lowerQ.includes("founder") || lowerQ.includes("sanjay")) {
        return {
            text: "TrimGo is the brainchild of **Sanjay Choudhary**, a visionary Full Stack Developer. Expect many more innovative products soon!",
            creatorData: {
                name: "Sanjay Choudhary",
                role: "Founder & Lead Developer",
                tagline: "Building the future, one app at a time.",
                links: [
                    { label: "Founder", handle: "@sanjuuu_x18", url: "https://www.instagram.com/sanjuuu_x18", primary: true },
                    { label: "Official Page", handle: "@trimgo_official", url: "https://www.instagram.com/trimgo_official", primary: false }
                ]
            }
        };
    }

    const onlineSalons = salons.filter(s => s.isOnline);
    if (onlineSalons.length === 0) return { text: "All salons seem to be offline at the moment." };

    // 2. CHEAPEST
    if (lowerQ.includes("cheap") || lowerQ.includes("price") || lowerQ.includes("cost")) {
      const cheapest = [...onlineSalons].sort((a, b) => {
        const minA = Math.min(...(a.services?.map(s => s.price) || [9999]));
        const minB = Math.min(...(b.services?.map(s => s.price) || [9999]));
        return minA - minB;
      })[0];
      if (cheapest) {
        const minPrice = Math.min(...(cheapest.services?.map(s => s.price) || [0]));
        return { text: `Best price is at **${cheapest.salonName}**. Services start at just ₹${minPrice}.`, salonData: cheapest };
      }
    }

    // 3. FASTEST / URGENT
    if (lowerQ.includes("fast") || lowerQ.includes("urgent") || lowerQ.includes("time") || lowerQ.includes("queue")) {
      const fastest = [...onlineSalons].sort((a, b) => (a.estTime || 0) - (b.estTime || 0))[0];
      if (fastest) return { text: `**${fastest.salonName}** has the shortest queue right now. Estimated wait is ${fastest.estTime || 0} mins.`, salonData: fastest };
    }

    // 4. RATING
    if (lowerQ.includes("best") || lowerQ.includes("rate") || lowerQ.includes("star")) {
      const best = [...onlineSalons].sort((a, b) => (b.rating || 0) - (a.rating || 0))[0];
      if (best) return { text: `**${best.salonName}** is the top-rated salon with ${best.rating || "New"} stars.`, salonData: best };
    }

    // 5. OPEN NOW
    if (lowerQ.includes("open")) return { text: `There are currently ${onlineSalons.length} salons open and ready for booking.` };

    return { text: "I can help find the nearest, cheapest, or top-rated salons. Try tapping a suggestion below or tell me what you need!" };
  };

  const handleSend = (textOverride = null) => {
    const userMsg = textOverride || input;
    if (!userMsg.trim()) return;

    // Stop speaking if user interrupts
    window.speechSynthesis.cancel();
    setIsSpeaking(false);

    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const result = processQuery(userMsg);
      
      // Add response
      setMessages((prev) => [...prev, { 
          role: "ai", 
          text: result.text, 
          salonData: result.salonData,
          creatorData: result.creatorData 
      }]);
      
      setIsTyping(false);
      
      // 🔥 SPEAK THE RESPONSE 🔥
      speakResponse(result.text);

    }, 800);
  };

  return (
    <>
      {/* Custom Scrollbar Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0, 0, 0, 0.1); border-radius: 10px; }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: rgba(0, 0, 0, 0.2); }
        
        .listening-pulse {
            animation: pulse-ring 1.5s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
        }
        @keyframes pulse-ring {
            0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
            70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
            100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
      `}</style>

      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-4 font-sans pointer-events-none">
        
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20, transformOrigin: "bottom right" }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
              className="pointer-events-auto w-[90vw] sm:w-[380px] h-[55vh] sm:h-[550px] max-h-[80vh] bg-white/90 backdrop-blur-xl border border-white/60 shadow-2xl rounded-[2rem] flex flex-col overflow-hidden"
            >
              
              {/* Header */}
              <div className="px-5 py-3 bg-white/60 border-b border-white/30 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center shadow-lg relative">
                    <Sparkles className="text-white" size={14} />
                    {/* Speaking Indicator */}
                    {isSpeaking && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full animate-ping"></span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-zinc-900 text-sm">TrimGo AI</h3>
                    <p className="text-[10px] text-zinc-500 font-medium flex items-center gap-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${isSpeaking ? "bg-emerald-500 animate-pulse" : "bg-zinc-400"}`}></span> 
                      {isSpeaking ? "Speaking..." : "Voice Enabled"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                    {/* Mute/Stop Button */}
                    {isSpeaking && (
                        <button onClick={stopSpeaking} className="p-1.5 bg-red-50 text-red-500 rounded-full hover:bg-red-100 transition-colors" title="Stop Speaking">
                            <StopCircle size={16} />
                        </button>
                    )}
                    <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-zinc-100 rounded-full transition-colors">
                        <X size={18} className="text-zinc-400 hover:text-zinc-900" />
                    </button>
                </div>
              </div>

              {/* Chat Area */}
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

                    {/* Salon Card Render (Same as before) */}
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
                     
                    {/* Creator Card Render (Same as before) */}
                    {m.creatorData && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-3 w-[90%] bg-zinc-900 text-white p-4 rounded-2xl shadow-xl shadow-zinc-500/20 relative overflow-hidden group"
                        >
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
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    {m.creatorData.links.map((link, idx) => (
                                        <a key={idx} href={link.url} target="_blank" rel="noreferrer" className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold bg-white/10 text-white hover:bg-white/20 border border-white/10 transition-all">
                                            <div className="flex items-center gap-2"><Instagram size={14} /><span>{link.label}</span></div>
                                            <ArrowUpRight size={10} />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                  </motion.div>
                ))}
                
                {/* Listening Indicator */}
                {isListening && (
                   <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-zinc-500 text-xs pl-2">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                      </span>
                      Listening...
                   </motion.div>
                )}

                {isTyping && !isListening && (
                  <div className="flex gap-1 pl-2">
                    <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:0.1s]"></span>
                    <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Suggestions */}
              <div className="px-4 py-3 bg-white/50 backdrop-blur-sm border-t border-white/40 shrink-0">
                <div className="flex flex-wrap gap-2">
                    {SUGGESTIONS.map((s) => (
                        <button key={s.id} onClick={() => handleSend(s.text)} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/80 border border-white shadow-sm rounded-full hover:shadow-md hover:scale-105 transition-all active:scale-95">
                            <span className={s.color}>{s.icon}</span>
                            <span className="text-[10px] font-bold text-zinc-600">{s.label}</span>
                        </button>
                    ))}
                </div>
              </div>

              {/* Input Area */}
              <div className="p-3 bg-white/80 border-t border-zinc-100 flex gap-2 backdrop-blur-xl shrink-0 items-center">
                
                {/* 🎙️ MIC BUTTON 🎙️ */}
                <button
                    onClick={toggleListening}
                    className={`p-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center relative ${
                        isListening 
                        ? "bg-red-500 text-white listening-pulse" 
                        : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
                    }`}
                >
                    {isListening ? <X size={18} /> : <Mic size={18} />}
                </button>

                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder={isListening ? "Listening..." : "Ask anything..."}
                  className="flex-1 bg-zinc-100/50 border border-transparent focus:bg-white focus:border-zinc-200 focus:ring-2 focus:ring-zinc-900/5 rounded-xl px-3 py-2.5 text-xs sm:text-sm outline-none transition-all placeholder:text-zinc-400"
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