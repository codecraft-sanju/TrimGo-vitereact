import React, { useState, useEffect } from "react";
import { Building2, Clock, TrendingUp, Star, Scissors } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/* ---------------------------------
   1. ADVANCED KINETIC TRANSITION (OPTIMIZED FOR MOBILE)
---------------------------------- */
const KineticTransition = ({ type, onComplete }) => {
  const [isMobile, setIsMobile] = useState(false);

  // Mobile detection to reduce load
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Mobile: 3 columns (Faster), Desktop: 5 columns (Premium feel)
  const columns = isMobile ? 3 : 5;

  // Define content based on type
  const content = type === 'queue'
    ? { title: "QUEUE SYSTEM", sub: "INITIALIZING...", color: "text-emerald-400" }
    : { title: "PARTNER HUB", sub: "CONNECTING...", color: "text-purple-400" };

  return (
    <motion.div
      className="fixed inset-0 z-[99999] flex items-center justify-center pointer-events-none h-[100dvh] w-screen overflow-hidden"
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* BACKGROUND NOISE - HIDDEN ON MOBILE FOR PERFORMANCE */}
      <div className="hidden md:block absolute inset-0 z-50 opacity-[0.07] pointer-events-none mix-blend-overlay">
        <div className="w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
      </div>

      {/* --- CENTER CONTENT LAYER --- */}
      <motion.div
        className="absolute z-[60] flex flex-col items-center justify-center text-center gap-6"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, duration: 0.3 }} // Faster on mobile
      >
        {/* 1. Animated Logo Icon */}
        <div className="relative">
          {/* Simplify rotation for mobile */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, ease: "linear", repeat: Infinity }}
            className="absolute inset-0 rounded-full border-2 border-dashed border-white/20"
          />
          <div className="w-20 h-20 md:w-24 md:h-24 bg-zinc-900 rounded-2xl border border-zinc-800 flex items-center justify-center shadow-2xl relative overflow-hidden group">
            {/* Remove hover effect on mobile */}
            <div className="hidden md:block absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <Scissors size={isMobile ? 32 : 40} className="text-white relative z-10" />
          </div>
        </div>

        {/* 2. Brand & Module Text */}
        <div className="flex flex-col gap-1">
          <h2 className="text-4xl md:text-7xl font-black text-white tracking-tighter uppercase md:mix-blend-difference">
            TRIMGO
          </h2>
          <div className="flex items-center justify-center gap-3">
            <span className={`text-[10px] md:text-xs font-bold tracking-[0.2em] md:tracking-[0.3em] ${content.color}`}>
              {content.title}
            </span>
            <span className="w-1 h-1 rounded-full bg-white/50" />
            <span className="text-[10px] text-zinc-500 font-mono uppercase">
              v2.0
            </span>
          </div>
        </div>

        {/* 3. Loading Bar & Status */}
        <div className="w-48 md:w-64 flex flex-col gap-2">
          <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              // Snappier transition for mobile
              transition={{ duration: isMobile ? 0.5 : 0.8, ease: "easeInOut", delay: 0.1 }}
              className={`h-full ${type === 'queue' ? 'bg-emerald-500' : 'bg-purple-500'}`}
            />
          </div>
          <p className="text-[10px] text-zinc-400 font-mono text-right animate-pulse">
            {content.sub}
          </p>
        </div>
      </motion.div>

      {/* --- THE SHUTTERS (Background Wipe) --- */}
      {/* Added will-change-transform for hardware acceleration */}
      {[...Array(columns)].map((_, i) => (
        <motion.div
          key={i}
          className="relative h-full bg-zinc-950 border-r border-zinc-900/50 will-change-transform flex-shrink-0"
          style={{
            width: `calc(100vw / ${columns} + 2px)`,
            marginLeft: i > 0 ? '-1px' : '0px'
          }}
          variants={{
            initial: { y: "100%" },
            animate: {
              y: "0%",
              transition: {
                duration: isMobile ? 0.5 : 0.8, // Faster duration on mobile
                ease: [0.76, 0, 0.24, 1],
                delay: i * (isMobile ? 0.02 : 0.04) // Less staggered delay on mobile
              }
            },
            exit: {
              y: "-100%",
              transition: {
                duration: 0.4,
                ease: [0.76, 0, 0.24, 1],
                delay: i * (isMobile ? 0.02 : 0.04)
              }
            }
          }}
          onAnimationComplete={() => {
            if (i === columns - 1) {
              // Reduced timeout for mobile users who want speed
              setTimeout(onComplete, isMobile ? 400 : 800);
            }
          }}
        />
      ))}
    </motion.div>
  );
};

/* ---------------------------------
   HELPER COMPONENTS (Untouched)
---------------------------------- */

const ShimmerButton = ({
  children,
  onClick,
  variant = "primary",
  className = "",
  disabled = false
}) => {
  const baseClass =
    "group relative overflow-hidden rounded-xl font-bold transition-all duration-300 hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary:
      "bg-zinc-900 text-white shadow-xl shadow-zinc-900/20 hover:shadow-2xl hover:shadow-zinc-900/30",
    secondary:
      "bg-white text-zinc-900 border border-zinc-200 hover:bg-zinc-50 shadow-sm",
    ghost: "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/50",
    danger: "bg-red-500 text-white shadow-lg hover:bg-red-600",
    success: "bg-emerald-500 text-white shadow-lg hover:bg-emerald-600"
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClass} ${variants[variant]} ${className}`}
    >
      <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent z-10" />
      <span className="relative z-20 flex items-center justify-center gap-2 px-6 py-3.5">
        {children}
      </span>
    </button>
  );
};

const InteractivePhone = () => {
  return (
    <div className="relative mx-auto w-[320px] h-[640px] bg-zinc-900 rounded-[3rem] p-4 shadow-[0_0_50px_-12px_rgba(0,0,0,0.3)] border-[8px] border-zinc-950 ring-1 ring-white/20 select-none transform transition hover:scale-[1.02] duration-500">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-7 w-32 bg-black rounded-b-2xl z-50 flex items-center justify-center gap-2">
        <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse"></div>
        <div className="w-10 h-1 rounded-full bg-zinc-800"></div>
      </div>
      <div className="w-full h-full bg-zinc-950 rounded-[2.5rem] overflow-hidden relative flex flex-col">
        <video
          src="/TrimGo.mp4"
          className="w-full h-full object-cover"
          autoPlay
          loop
          muted
          playsInline
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
      </div>
    </div>
  );
};

/* ---------------------------------
   MAIN HERO SECTION COMPONENT
---------------------------------- */

const HeroSection = ({ onNavigateUser, onNavigateSalon }) => {
  // --- STATE FOR ANIMATION ---
  const [activeTransition, setActiveTransition] = useState(null); // 'queue' | 'partner' | null

  const handleQueueClick = () => setActiveTransition('queue');
  const handlePartnerClick = () => setActiveTransition('partner');

  const finalizeNavigation = () => {
    if (activeTransition === 'queue') onNavigateUser();
    if (activeTransition === 'partner') onNavigateSalon();
  };

  return (
    <>
      {/* --- ADVANCED OVERLAY --- */}
      <AnimatePresence>
        {activeTransition && (
          <KineticTransition
            type={activeTransition}
            onComplete={finalizeNavigation}
          />
        )}
      </AnimatePresence>

      <section className="relative pt-24 md:pt-28 pb-16 px-6 max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center min-h-[90vh]">
        <div className="flex flex-col items-start z-10 relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 border border-zinc-200 backdrop-blur-sm text-zinc-600 text-xs font-bold mb-4 shadow-sm">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            TrimGo • Live queue
          </div>

          <h1 className="text-6xl md:text-8xl font-black text-zinc-900 tracking-tighter leading-[0.95] mb-8">
            Wait{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-400 to-zinc-600 font-serif italic pr-2">
              Less.
            </span>
            <br />
            Live{" "}
            <span className="relative inline-block">
              More.
              <svg
                className="absolute w-full h-3 -bottom-1 left-0 text-green-400 opacity-50"
                viewBox="0 0 100 10"
                preserveAspectRatio="none"
              >
                <path
                  d="M0 5 Q 50 10 100 5"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                />
              </svg>
            </span>
          </h1>

          <p className="text-xl text-zinc-500 max-w-lg leading-relaxed mb-10 font-medium">
            Stop wasting hours in salon waiting rooms. Book your spot
            digitally, track live wait times, and walk in like a VIP.
          </p>

          <div className="flex flex-wrap gap-4 w-full sm:w-auto">
            {/* BUTTON 1: USER */}
            <ShimmerButton onClick={handleQueueClick} className="w-full sm:w-auto">
              Join the Queue
            </ShimmerButton>

            {/* BUTTON 2: PARTNER */}
            <ShimmerButton
              variant="secondary"
              onClick={handlePartnerClick}
              className="w-full sm:w-auto"
            >
              Partner with Us <Building2 size={18} />
            </ShimmerButton>
          </div>

          <div className=" mt-12 flex items-center gap-4 pt-8 border-t border-zinc-200/60 w-full max-w-md">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full border-2 border-white bg-zinc-200 shadow-sm"
                  style={{
                    backgroundImage: `url(https://i.pravatar.cc/150?img=${i + 10
                      })`,
                    backgroundSize: "cover",
                  }}
                />
              ))}
            </div>
            <div>
              <div className="flex text-yellow-500 mb-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} size={14} fill="currentColor" />
                ))}
              </div>
              <p className="text-xs font-bold text-zinc-600">
                Trusted by 12,000+ users
              </p>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex justify-center perspective-1000">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-purple-200 to-emerald-200 rounded-full blur-[100px] opacity-40 animate-pulse"></div>

          <InteractivePhone />

          <div className="absolute top-[20%] -left-4 bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/50 animate-bounce delay-700 hidden md:block">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-lg text-green-600">
                <Clock size={20} />
              </div>
              <div>
                <p className="text-xs text-zinc-500 font-bold uppercase">
                  Time Saved
                </p>
                <p className="text-lg font-bold text-zinc-900">45 mins</p>
              </div>
            </div>
          </div>

          <div className="absolute bottom-[20%] -right-4 bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/50 animate-bounce delay-1000 hidden md:block">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-2 rounded-lg text-purple-600">
                <TrendingUp size={20} />
              </div>
              <div>
                <p className="text-xs text-zinc-500 font-bold uppercase">
                  Salon Revenue
                </p>
                <p className="text-lg font-bold text-zinc-900">+30%</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default HeroSection;