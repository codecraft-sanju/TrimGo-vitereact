import React, { useState, useEffect } from 'react';
import { RefreshCw, Sparkles, X, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const UpdateNotification = () => {
  const [showUpdate, setShowUpdate] = useState(false);

  useEffect(() => {
    // 1. Version Check Function
    const checkVersion = async () => {
      try {
        // Cache-busting (?t=...) bahut zaruri hai taaki browser purana file na uthaye
        const response = await fetch(`/meta.json?t=${new Date().getTime()}`);
        
        if (!response.ok) return;

        const meta = await response.json();
        const latestVersion = meta.buildDate;
        const currentVersion = localStorage.getItem('appVersion');

        // Agar user pehli baar aaya hai, toh current version save kar lo (popup mat dikhao)
        if (!currentVersion) {
          localStorage.setItem('appVersion', latestVersion);
          return;
        }

        // Agar version match nahi hua -> Update available hai
        if (latestVersion && latestVersion !== Number(currentVersion)) {
           setShowUpdate(true);
        }
      } catch (error) {
        console.error('Auto-Update check failed (silent)', error);
      }
    };

    // 2. Checks: Load par, Window focus par, aur har 2 minute mein
    checkVersion();
    
    const interval = setInterval(checkVersion, 2 * 60 * 1000); // 2 mins
    window.addEventListener('focus', checkVersion);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', checkVersion);
    };
  }, []);

  const handleRefresh = async () => {
    // Reload karne se pehle naya version save karte hain
    try {
      const response = await fetch(`/meta.json?t=${new Date().getTime()}`);
      const meta = await response.json();
      localStorage.setItem('appVersion', meta.buildDate);
      window.location.reload();
    } catch (e) {
      window.location.reload(); // Fallback
    }
  };

  const handleClose = () => {
     setShowUpdate(false);
  };

  return (
    <AnimatePresence>
      {showUpdate && (
        <motion.div
          initial={{ y: 100, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 100, opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.5, type: "spring", bounce: 0.25 }}
          className="fixed bottom-6 right-6 z-[9999] w-full max-w-[380px] p-4"
        >
          {/* Glass Container */}
          <div className="relative overflow-hidden bg-neutral-900/80 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl p-1">
            
            {/* Shimmer Effect (Golden/Premium Glow) */}
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-yellow-400/50 to-transparent animate-[shimmer_3s_infinite]" />
            
            <div className="flex items-center gap-4 p-3">
              {/* Icon Box */}
              <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-neutral-800 to-neutral-950 border border-white/5 shadow-inner">
                 <Sparkles size={18} className="text-yellow-400 animate-pulse" />
                 <div className="absolute inset-0 bg-yellow-400/10 blur-lg rounded-full"></div>
              </div>

              {/* Text Content */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <h4 className="text-white font-semibold text-sm tracking-wide">Update Available</h4>
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                </div>
                <p className="text-neutral-400 text-xs font-medium leading-tight">
                  A new version of TrimGo is ready.
                </p>
              </div>
            </div>

            {/* Buttons Row */}
            <div className="flex items-center gap-2 mt-1 px-1 pb-1">
              <button 
                onClick={handleRefresh}
                className="flex-1 flex items-center justify-center gap-2 bg-white text-black text-xs font-bold py-2.5 rounded-lg hover:bg-neutral-200 transition-all active:scale-95 group"
              >
                <RefreshCw size={14} className="group-hover:rotate-180 transition-transform duration-500" />
                Refresh Now
              </button>
              
              <button 
                onClick={handleClose}
                className="px-4 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-neutral-400 hover:text-white transition-colors active:scale-95"
              >
                <X size={14} />
              </button>
            </div>

            {/* Background Noise Texture (Subtle) */}
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UpdateNotification;