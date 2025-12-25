import React, { useState, useEffect } from "react";
import { Scissors } from "lucide-react";
import { NoiseOverlay } from "./SharedUI"; // Ensure SharedUI is in the same folder

const PremiumPreloader = () => {
  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);
  
  const messages = [
    "Initializing TrimGo...",
    "Finding nearby salons...",
    "Sharpening blades...",
    "Calculating wait times...",
    "Polishing mirrors...",
    "Getting things ready..."
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress === 100) {
          clearInterval(timer);
          return 100;
        }
        const diff = Math.random() * 10;
        return Math.min(oldProgress + diff, 100);
      });
    }, 200);

    const msgTimer = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 800);

    return () => {
      clearInterval(timer);
      clearInterval(msgTimer);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-zinc-50 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[30%] -left-[10%] w-[70%] h-[70%] rounded-full bg-blue-400/10 blur-[120px] animate-pulse"></div>
        <div className="absolute -bottom-[30%] -right-[10%] w-[70%] h-[70%] rounded-full bg-emerald-400/10 blur-[120px] animate-pulse"></div>
        <NoiseOverlay />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        <div className="relative mb-8 group">
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-500 to-emerald-500 rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500 animate-pulse"></div>
          <div className="relative w-24 h-24 bg-white rounded-3xl shadow-2xl border border-zinc-100 flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-50 to-zinc-100 opacity-50"></div>
            <Scissors 
              size={40} 
              className="text-zinc-900 relative z-10 animate-[spin_4s_linear_infinite_reverse]" 
              strokeWidth={1.5}
            />
          </div>
        </div>

        <h1 className="text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-zinc-900 via-zinc-600 to-zinc-900 bg-[length:200%_auto] animate-[shimmer_3s_linear_infinite] mb-2">
          TrimGo
        </h1>

        <div className="h-6 overflow-hidden mb-8">
          <p className="text-zinc-400 text-sm font-medium tracking-wide animate-[slideUpFade_0.5s_ease-out] key={messageIndex}">
            {messages[messageIndex]}
          </p>
        </div>

        <div className="w-64 h-1.5 bg-zinc-200 rounded-full overflow-hidden relative">
          <div 
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-300 ease-out rounded-full"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute top-0 right-0 h-full w-20 bg-gradient-to-r from-transparent to-white/50 blur-[2px]"></div>
          </div>
        </div>
        
        <p className="mt-2 text-[10px] text-zinc-300 font-bold uppercase tracking-widest">
          {Math.round(progress)}% Loaded
        </p>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        @keyframes slideUpFade {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default PremiumPreloader;