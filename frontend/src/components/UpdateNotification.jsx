import React, { useState, useEffect } from 'react';
import { RefreshCw, X, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const UpdateNotification = () => {
  const [showUpdate, setShowUpdate] = useState(false);
  const [versionLabel, setVersionLabel] = useState('');

  useEffect(() => {
    const checkVersion = async () => {
      try {
        const response = await fetch(`/meta.json?t=${new Date().getTime()}`);
        if (!response.ok) return;

        const meta = await response.json();
        const latestDate = meta.buildDate;
        const latestVersion = meta.version; 
        const currentVersionDate = localStorage.getItem('appVersionDate');

        if (!currentVersionDate) {
          localStorage.setItem('appVersionDate', latestDate);
          localStorage.setItem('appVersionLabel', latestVersion);
          return;
        }

        if (latestDate && latestDate !== Number(currentVersionDate)) {
           setVersionLabel(latestVersion);
           setShowUpdate(true);
        }
      } catch (error) {
        console.error('Silent update check failed', error);
      }
    };

    checkVersion();
    const interval = setInterval(checkVersion, 2 * 60 * 1000);
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
                transition={{ 
                    type: "spring", 
                    stiffness: 300, 
                    damping: 25,
                    duration: 0.4 
                }}
                className="fixed top-1/2 left-1/2 z-[9999] w-[92%] max-w-[360px]"
            >
                {/* 3. The Aesthetic Card */}
                <div className="relative group overflow-hidden bg-[#050505] rounded-[28px] border border-white/10 shadow-[0_0_50px_-12px_rgba(255,255,255,0.1)]">
                    
                    {/* Background Gradient Spotlights */}
                    <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500/20 blur-[60px] rounded-full pointer-events-none" />
                    <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-500/20 blur-[60px] rounded-full pointer-events-none" />

                    {/* Content Wrapper */}
                    <div className="relative p-6 flex flex-col items-center text-center">
                        
                        {/* --- NEW CUSTOM TG LOGO --- */}
                        <div className="relative mb-5">
                            {/* Outer Glow Ring */}
                            <div className="absolute inset-0 bg-white/20 blur-xl rounded-full scale-150 opacity-0 group-hover:opacity-40 transition-opacity duration-700"></div>
                            
                            {/* Logo Box */}
                            <div className="relative h-16 w-16 bg-black rounded-2xl border border-white/15 shadow-2xl flex items-center justify-center overflow-hidden">
                                {/* Diagonal Shine on Logo */}
                                <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-white/10 to-transparent pointer-events-none"></div>
                                
                                {/* TG Text Branding */}
                                <span className="font-sans text-2xl font-black text-white tracking-tighter" style={{ fontFamily: 'Inter, sans-serif' }}>
                                    TG
                                </span>
                            </div>

                            {/* Version Badge Floating */}
                            {versionLabel && (
                                <motion.div 
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute -bottom-2 -right-2 bg-white text-black text-[10px] font-bold px-2 py-0.5 rounded-full border border-black shadow-lg"
                                >
                                    {versionLabel}
                                </motion.div>
                            )}
                        </div>

                        {/* Text Content */}
                        <h3 className="text-xl font-bold text-white mb-2 tracking-tight">
                            Update Available
                        </h3>
                        <p className="text-neutral-400 text-sm leading-relaxed mb-6 font-medium">
                            A fresh version of TrimGo is ready. <br/> Better performance & new features.
                        </p>

                        {/* Action Buttons */}
                        <div className="w-full space-y-3">
                            {/* Primary Button (White) */}
                            <button 
                                onClick={handleRefresh}
                                className="relative w-full overflow-hidden bg-white text-black font-bold text-sm py-3.5 rounded-xl transition-transform active:scale-95 flex items-center justify-center gap-2 group/btn hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    <RefreshCw size={16} className="group-hover/btn:rotate-180 transition-transform duration-700" />
                                    Update Now
                                </span>
                                {/* Subtle sheen on button */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-neutral-100/50 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700" />
                            </button>

                            {/* Secondary Button (Ghost) */}
                            <button 
                                onClick={handleClose}
                                className="w-full py-3 text-neutral-500 text-xs font-semibold tracking-wide hover:text-neutral-300 transition-colors flex items-center justify-center gap-1 group/close"
                            >
                                <X size={14} />
                                <span>Dismiss</span>
                            </button>
                        </div>
                    </div>

                    {/* Cinematic Grain Overlay (Texture) */}
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