import React, { useState, useRef, useEffect } from "react";
import { X, Sparkles, Zap, DollarSign, Star, Clock, ChevronRight, User, Send, Instagram, ArrowUpRight, Mic, StopCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// 🔥 PASTE YOUR API KEY HERE 🔥
const GEMINI_API_KEY = "AIzaSyDrmoFCgwrRtZvjXEMPFTlvmv1dRl_sG1Q"; 

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
      text: "Hi! I'm your TrimGo assistant. I can find nearby salons or chat about anything. What's on your mind?",
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
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onstart = () => setIsListening(true);
      recognitionRef.current.onend = () => setIsListening(false);
      
      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        handleSend(transcript);
      };
    }
    return () => window.speechSynthesis.cancel();
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      recognitionRef.current?.start();
    }
  };

  // --- 2. TEXT TO SPEECH ---
  const speakResponse = (text) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    
    // Clean text for speech (remove markdown like **bold**)
    const cleanText = text.replace(/[*#]/g, "").replace(/https?:\/\/[^\s]+/g, "link");
    
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1; 

    const voices = window.speechSynthesis.getVoices();
    // Try to find a good voice (Google or Natural)
    const preferredVoice = voices.find(v => v.name.includes("Google US English") || v.name.includes("Samantha"));
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

  // --- 3. GEMINI API CALL (THE BRAIN) ---
  const fetchGeminiResponse = async (userQuery) => {
    if (!GEMINI_API_KEY || GEMINI_API_KEY.includes("YOUR_")) {
        return "I'm having trouble connecting to my brain (API Key missing). I can still help you find salons though!";
    }

    try {
        // 🔥 FIXED: Switched to 'gemini-pro' to solve 404 error
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `You are 'TrimGo AI', a helpful, witty, and professional assistant for a Salon Booking App called TrimGo. 
                        
                        CONTEXT:
                        - You help users find salons, check prices, and book queues.
                        - Current Salons Data: ${JSON.stringify(salons.map(s => ({ name: s.salonName, price: s.services?.[0]?.price || 'Varies', time: s.estTime || 15 })))}
                        - Creator: Sanjay Choudhary (Full Stack Dev).
                        
                        USER SAYS: "${userQuery}"

                        INSTRUCTIONS:
                        - Keep answers short (max 2-3 sentences).
                        - Be conversational and friendly.
                        - Use emojis.
                        - If asked about something unrelated (like "Who is Modi?" or "Tell a joke"), answer it naturally like a smart AI.
                        ` 
                    }]
                }]
            })
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        return data?.candidates?.[0]?.content?.parts?.[0]?.text || "I'm not sure how to answer that, but I can help you find a salon!";
    } catch (error) {
        console.error("Gemini API Error:", error);
        return "My brain is a bit fuzzy right now. Try asking about nearby salons!";
    }
  };

  // --- 4. HYBRID LOGIC (LOCAL + CLOUD) ---
  const processQuery = async (query) => {
    const lowerQ = query.trim().toLowerCase();

    // A. PRIORITY: LOCAL APP LOGIC (Fast & Accurate for App Features)
    
    // 1. Creator Logic
    if (lowerQ.includes("admin") || lowerQ.includes("owner") || lowerQ.includes("creat") || lowerQ.includes("sanjay")) {
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

    // 2. Cheapest Logic
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

    // 3. Fastest Logic
    if (lowerQ.includes("fast") || lowerQ.includes("urgent") || lowerQ.includes("time") || lowerQ.includes("queue")) {
      const fastest = [...onlineSalons].sort((a, b) => (a.estTime || 0) - (b.estTime || 0))[0];
      if (fastest) return { text: `**${fastest.salonName}** has the shortest queue right now. Estimated wait is ${fastest.estTime || 0} mins.`, salonData: fastest };
    }

    // 4. Rating Logic
    if (lowerQ.includes("best") || lowerQ.includes("rate") || lowerQ.includes("star")) {
      const best = [...onlineSalons].sort((a, b) => (b.rating || 0) - (a.rating || 0))[0];
      if (best) return { text: `**${best.salonName}** is the top-rated salon with ${best.rating || "New"} stars.`, salonData: best };
    }

    // B. FALLBACK: CLOUD BRAIN (Gemini API)
    // If no local app logic matches, we ask the AI to generate a response.
    const aiResponse = await fetchGeminiResponse(query);
    return { text: aiResponse };
  };

  const handleSend = async (textOverride = null) => {
    const userMsg = textOverride || input;
    if (!userMsg.trim()) return;

    window.speechSynthesis.cancel();
    setIsSpeaking(false);

    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setInput("");
    setIsTyping(true); // Show "Thinking..."

    try {
        // Wait for Logic/API
        const result = await processQuery(userMsg);
        
        setMessages((prev) => [...prev, { 
            role: "ai", 
            text: result.text, 
            salonData: result.salonData,
            creatorData: result.creatorData 
        }]);
        
        // Speak Result
        speakResponse(result.text);

    } catch (err) {
        setMessages((prev) => [...prev, { role: "ai", text: "Oops, something went wrong. Please try again." }]);
    } finally {
        setIsTyping(false);
    }
  };

  return (
    <>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0, 0, 0, 0.1); border-radius: 10px; }
        .listening-pulse { animation: pulse-ring 1.5s cubic-bezier(0.215, 0.61, 0.355, 1) infinite; }
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
                    {isSpeaking && <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full animate-ping"></span>}
                  </div>
                  <div>
                    <h3 className="font-bold text-zinc-900 text-sm">TrimGo AI</h3>
                    <p className="text-[10px] text-zinc-500 font-medium flex items-center gap-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${isSpeaking ? "bg-emerald-500 animate-pulse" : "bg-zinc-400"}`}></span> 
                      {isSpeaking ? "Speaking..." : "Online"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                    {isSpeaking && (
                        <button onClick={stopSpeaking} className="p-1.5 bg-red-50 text-red-500 rounded-full hover:bg-red-100 transition-colors">
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
                    <div className={`max-w-[85%] px-3 py-2.5 rounded-2xl text-xs sm:text-sm font-medium shadow-sm leading-relaxed ${m.role === "user" ? "bg-zinc-900 text-white rounded-br-sm" : "bg-white text-zinc-700 border border-white/60 rounded-bl-sm"}`}>
                      {m.text.split("**").map((part, idx) => idx % 2 === 1 ? <span key={idx} className={`font-bold ${m.role === 'user' ? 'text-white' : 'text-zinc-900'}`}>{part}</span> : part)}
                    </div>

                    {/* Dynamic Cards (Salon/Creator) */}
                    {m.salonData && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="mt-2 w-[85%] bg-white p-3 rounded-xl border border-zinc-100 shadow-lg cursor-pointer hover:scale-[1.02] transition-transform"
                            onClick={() => onSalonSelect && onSalonSelect(m.salonData)}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h4 className="font-bold text-zinc-900 text-xs sm:text-sm">{m.salonData.salonName}</h4>
                                    <div className="flex items-center gap-2 text-[10px] text-zinc-500 mt-0.5">
                                        <span className="flex items-center gap-0.5"><Star size={10} className="fill-yellow-400 text-yellow-400"/> {m.salonData.rating || "New"}</span>
                                        <span className="text-emerald-600 font-bold">{m.salonData.estTime} min</span>
                                    </div>
                                </div>
                                <div className="p-1.5 bg-zinc-50 rounded-lg"><ChevronRight size={14} className="text-zinc-400"/></div>
                            </div>
                        </motion.div>
                    )}

                    {m.creatorData && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-3 w-[90%] bg-zinc-900 text-white p-4 rounded-2xl shadow-xl relative overflow-hidden">
                             <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 rounded-full blur-[40px]" />
                             <div className="relative z-10">
                                <h4 className="text-white font-bold text-sm">{m.creatorData.name}</h4>
                                <p className="text-zinc-400 text-[10px] uppercase tracking-wider mb-2">{m.creatorData.role}</p>
                                <div className="space-y-2">
                                    {m.creatorData.links.map((link, idx) => (
                                        <a key={idx} href={link.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold bg-white/10 text-white hover:bg-white/20 transition-all">
                                            <Instagram size={14} /><span>{link.label}</span> <ArrowUpRight size={10} className="ml-auto"/>
                                        </a>
                                    ))}
                                </div>
                             </div>
                        </motion.div>
                    )}
                  </motion.div>
                ))}
                
                {/* Status Indicators */}
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
                  <div className="flex gap-1 pl-2 items-center text-xs text-zinc-400 font-medium">
                    <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:0.1s]"></span>
                    <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="ml-2">Thinking...</span>
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
                <button onClick={toggleListening} className={`p-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center relative ${isListening ? "bg-red-500 text-white listening-pulse" : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"}`}>
                    {isListening ? <X size={18} /> : <Mic size={18} />}
                </button>
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder={isListening ? "Listening..." : "Ask me anything..."}
                  className="flex-1 bg-zinc-100/50 border border-transparent focus:bg-white focus:border-zinc-200 focus:ring-2 focus:ring-zinc-900/5 rounded-xl px-3 py-2.5 text-xs sm:text-sm outline-none transition-all placeholder:text-zinc-400"
                />
                <button onClick={() => handleSend()} disabled={!input.trim()} className={`p-2.5 rounded-xl transition-all shadow-sm ${input.trim() ? "bg-zinc-900 text-white hover:bg-zinc-800 active:scale-95" : "bg-zinc-100 text-zinc-400"}`}>
                  <Send size={16} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Trigger Button */}
        <motion.button onClick={() => setIsOpen(!isOpen)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }} className="pointer-events-auto w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-zinc-900 text-white shadow-2xl shadow-zinc-900/30 flex items-center justify-center border-[3px] border-white/50 backdrop-blur-md group relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <AnimatePresence mode="wait">
                {isOpen ? (
                    <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}><X size={24} /></motion.div>
                ) : (
                    <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}><Sparkles size={24} className="fill-white/20" /></motion.div>
                )}
            </AnimatePresence>
        </motion.button>
      </div>
    </>
  );
};

export default AIConcierge;