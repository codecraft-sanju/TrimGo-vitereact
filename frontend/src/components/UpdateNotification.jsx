import React, { useState, useEffect } from 'react';
import { RefreshCw, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const UpdateNotification = () => {
  const [showUpdate, setShowUpdate] = useState(false);
  const [versionLabel, setVersionLabel] = useState('');
  const [updateNotes, setUpdateNotes] = useState([]); // Notes store karne ke liye naya state

  useEffect(() => {
    const checkVersion = async () => {
      try {
        // Cache bust karne ke liye timestamp add kiya
        const response = await fetch(`/meta.json?t=${new Date().getTime()}`);
        if (!response.ok) return;

        const meta = await response.json();
        const latestDate = meta.buildDate;
        const currentVersionDate = localStorage.getItem('appVersionDate');

        // First time user ke liye (Save karo par popup mat dikhao)
        if (!currentVersionDate) {
          localStorage.setItem('appVersionDate', latestDate);
          localStorage.setItem('appVersionLabel', meta.version);
          return;
        }

        // Agar naya update mila
        if (latestDate && latestDate !== Number(currentVersionDate)) {
           setVersionLabel(meta.version);
           setUpdateNotes(meta.notes || []); // Agar notes hain toh state set karo
           setShowUpdate(true);
        }
      } catch (error) {
        console.error('Silent update check failed', error);
      }
    };

    checkVersion();
    const interval = setInterval(checkVersion, 2 * 60 * 1000); // Har 2 min check
    window.addEventListener('focus', checkVersion);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', checkVersion);
    };
  }, []);

  const handleRefresh = async () => {
    try {
      const response = await fetch(`/meta.json?t=${new Date().getTime()}`);
      const meta = await response.json();
      localStorage.setItem('appVersionDate', meta.buildDate);
      localStorage.setItem('appVersionLabel', meta.version);
      window.location.reload();
    } catch (e) {
      window.location.reload();
    }
  };

  const handleClose = () => {
      setShowUpdate(false);
  };

  return (
    <AnimatePresence>
      {showUpdate && (
        <>
            {/* 1. Backdrop Blur & Darken */}
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 bg-black/80 z-[9998] backdrop-blur-sm"
                onClick={handleClose}
            />

            {/* 2. Main Card Container */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: "50%", x: "-50%" }}
                animate={{ opacity: 1, scale: 1, y: "-50%", x: "-50%" }}
                exit={{ opacity: 0, scale: 0.95, y: "-40%", x: "-50%" }}
                transition={{ type: "spring", stiffness: 300, damping: 25, duration: 0.4 }}
                className="fixed top-1/2 left-1/2 z-[9999] w-[92%] max-w-[380px]"
            >
                {/* 3. The Aesthetic Card */}
                <div className="relative group overflow-hidden bg-[#0a0a0a] rounded-[28px] border border-white/10 shadow-[0_0_50px_-12px_rgba(255,255,255,0.1)]">
                    
                    {/* Background Gradient Spotlights */}
                    <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500/20 blur-[60px] rounded-full pointer-events-none" />
                    <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-500/20 blur-[60px] rounded-full pointer-events-none" />

                    {/* Content Wrapper */}
                    <div className="relative p-6">
                        
                        {/* Header Section */}
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h3 className="text-xl font-bold text-white flex items-center gap-2 tracking-tight">
                                    Update Available
                                    {/* Version Badge */}
                                    {versionLabel && (
                                        <span className="text-[10px] bg-white text-black px-2 py-0.5 rounded-full font-bold border border-white shadow-lg">
                                            v{versionLabel}
                                        </span>
                                    )}
                                </h3>
                                <p className="text-neutral-400 text-xs mt-1 font-medium">
                                    A fresh version of TrimGo is ready.
                                </p>
                            </div>
                            
                            {/* Animated Sparkle Icon */}
                            <div className="bg-white/5 p-2 rounded-xl border border-white/10 shadow-inner">
                                <Sparkles size={20} className="text-yellow-400 fill-yellow-400/20" />
                            </div>
                        </div>

                        {/* --- NEW: WHAT'S NEW LIST SECTION --- */}
                        {updateNotes.length > 0 && (
                            <div className="bg-white/5 rounded-xl p-4 mb-6 border border-white/5 shadow-inner">
                                <p className="text-[10px] uppercase tracking-wider text-neutral-500 font-bold mb-3 flex items-center gap-1">
                                    What's New
                                </p>
                                <ul className="space-y-2.5">
                                    {updateNotes.map((note, index) => (
                                        <li key={index} className="flex items-start gap-2.5 text-sm text-neutral-300">
                                            {/* Bullet Point */}
                                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0 shadow-[0_0_8px_rgba(96,165,250,0.6)]" />
                                            {/* Note Text */}
                                            <span className="leading-tight text-xs font-medium opacity-90">{note}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="w-full space-y-3">
                            {/* Update Button */}
                            <button 
                                onClick={handleRefresh}
                                className="relative w-full overflow-hidden bg-white text-black font-bold text-sm py-3.5 rounded-xl transition-transform active:scale-95 flex items-center justify-center gap-2 group/btn hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    <RefreshCw size={16} className="group-hover/btn:rotate-180 transition-transform duration-700" />
                                    Update Now
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-neutral-100/50 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700" />
                            </button>

                            {/* Dismiss Button */}
                            <button 
                                onClick={handleClose}
                                className="w-full py-2 text-neutral-500 text-xs font-semibold tracking-wide hover:text-white transition-colors flex items-center justify-center gap-1"
                            >
                                <X size={14} />
                                <span>Dismiss</span>
                            </button>
                        </div>
                    </div>

                    {/* Cinematic Grain Overlay */}
                    <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>
                    
                    {/* Border Shimmer Animation */}
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent animate-[shimmer_2s_infinite]" />
                </div>
            </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default UpdateNotification;