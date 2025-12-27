import React, { useState, useEffect } from 'react';
import { RefreshCw, Sparkles, X, Tag } from 'lucide-react'; // Tag icon add kiya hai decoration ke liye
import { motion, AnimatePresence } from 'framer-motion';

const UpdateNotification = () => {
  const [showUpdate, setShowUpdate] = useState(false);
  const [versionLabel, setVersionLabel] = useState(''); // Yahan naya version store karenge

  useEffect(() => {
    // 1. Version Check Function
    const checkVersion = async () => {
      try {
        // Cache-busting (?t=...) bahut zaruri hai taaki browser purana file na uthaye
        const response = await fetch(`/meta.json?t=${new Date().getTime()}`);
        
        if (!response.ok) return;

        const meta = await response.json();
        
        // meta.json se data nikala
        const latestDate = meta.buildDate;
        const latestVersion = meta.version; // Yeh tumhare script se aa raha hai (e.g., "1.0.2")

        const currentVersionDate = localStorage.getItem('appVersionDate');

        // Agar user pehli baar aaya hai, toh current data save kar lo (popup mat dikhao)
        if (!currentVersionDate) {
          localStorage.setItem('appVersionDate', latestDate);
          localStorage.setItem('appVersionLabel', latestVersion);
          return;
        }

        // Agar date match nahi hua -> Update available hai
        if (latestDate && latestDate !== Number(currentVersionDate)) {
           setVersionLabel(latestVersion); // State update kiya taaki UI mein dikhe
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
      
      localStorage.setItem('appVersionDate', meta.buildDate);
      localStorage.setItem('appVersionLabel', meta.version);
      
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
        <>
            {/* UPDATED: Overlay Background */}
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 z-[9998] backdrop-blur-[2px]"
                onClick={handleClose}
            />

            {/* UPDATED: Centered Modal Container */}
            <motion.div
            initial={{ opacity: 0, scale: 0.9, x: "-50%", y: "-50%" }}
            animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
            exit={{ opacity: 0, scale: 0.9, x: "-50%", y: "-50%" }}
            transition={{ duration: 0.4, type: "spring", bounce: 0.3 }}
            className="fixed top-1/2 left-1/2 z-[9999] w-[90%] max-w-[380px]"
            >
            {/* Glass Container */}
            <div className="relative overflow-hidden bg-neutral-900 border border-white/10 shadow-2xl rounded-2xl p-1">
                
                {/* Shimmer Effect (Golden/Premium Glow) */}
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-yellow-400/50 to-transparent animate-[shimmer_3s_infinite]" />
                
                <div className="flex items-center gap-4 p-4">
                {/* Icon Box */}
                <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-neutral-800 to-neutral-950 border border-white/5 shadow-inner shrink-0">
                    <Sparkles size={20} className="text-yellow-400 animate-pulse" />
                    <div className="absolute inset-0 bg-yellow-400/10 blur-lg rounded-full"></div>
                </div>

                
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                        <h4 className="text-white font-semibold text-base tracking-wide">Update Available</h4>
                        
                        {/* NEW: Version Badge */}
                        {versionLabel && (
                            <div className="flex items-center gap-1 px-2 py-0.5 bg-yellow-400/10 border border-yellow-400/20 rounded text-[10px] text-yellow-400 font-bold uppercase tracking-wider">
                                <Tag size={10} />
                                v {versionLabel}
                            </div>
                        )}
                    </div>
                    
                    <p className="text-neutral-400 text-sm font-medium leading-snug">
                    A new version of TrimGo is ready.
                    </p>
                </div>
                </div>

                {/* Buttons Row */}
                <div className="flex items-center gap-2 mt-1 px-2 pb-2">
                <button 
                    onClick={handleRefresh}
                    className="flex-1 flex items-center justify-center gap-2 bg-white text-black text-sm font-bold py-3 rounded-xl hover:bg-neutral-200 transition-all active:scale-95 group"
                >
                    <RefreshCw size={16} className="group-hover:rotate-180 transition-transform duration-500" />
                    Update Now
                </button>
                
                <button 
                    onClick={handleClose}
                    className="px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-neutral-400 hover:text-white transition-colors active:scale-95"
                >
                    <X size={18} />
                </button>
                </div>

                
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
            </div>
            </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default UpdateNotification;