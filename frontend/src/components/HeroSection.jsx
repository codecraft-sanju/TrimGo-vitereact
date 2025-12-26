import React from "react";
import { Building2, Clock, TrendingUp, Star } from "lucide-react";

/* ---------------------------------
   HELPER COMPONENTS
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
  
  // DARK THEME VARIANTS
  const variants = {
    primary:
      "bg-white text-black shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_-5px_rgba(255,255,255,0.4)]", // White button pops on dark bg
    secondary:
      "bg-zinc-900 text-white border border-zinc-700 hover:bg-zinc-800 shadow-sm",
    ghost: "text-zinc-400 hover:text-white hover:bg-white/5",
    danger: "bg-red-600 text-white shadow-lg hover:bg-red-500",
    success: "bg-emerald-600 text-white shadow-lg hover:bg-emerald-500"
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClass} ${variants[variant]} ${className}`}
    >
      {/* Shimmer Effect adjusted for dark mode */}
      <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent z-10" />
      <span className="relative z-20 flex items-center justify-center gap-2 px-6 py-3.5">
        {children}
      </span>
    </button>
  );
};

const InteractivePhone = () => {
  return (
    // Border changed to dark gray, shadow added for depth against black bg
    <div className="relative mx-auto w-[300px] sm:w-[320px] h-[640px] bg-zinc-800 rounded-[3rem] p-4 shadow-[0_0_60px_-15px_rgba(255,255,255,0.1)] border-[8px] border-zinc-900 ring-1 ring-white/10 select-none transform transition hover:scale-[1.02] duration-500">
      {/* Dynamic Island / Notch */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-7 w-32 bg-black rounded-b-2xl z-50 flex items-center justify-center gap-2 border-b border-white/5">
        <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse"></div>
        <div className="w-10 h-1 rounded-full bg-zinc-800"></div>
      </div>

      {/* Screen Content - NOW PLAYING VIDEO */}
      <div className="w-full h-full bg-black rounded-[2.5rem] overflow-hidden relative flex flex-col border border-white/5">
         {/* The video from public folder placed inside the phone screen */}
         <video 
           src="/TrimGo.mp4" 
           className="w-full h-full object-cover opacity-90" // Slight opacity for cinematic feel
           autoPlay 
           loop 
           muted 
           playsInline
         />
         {/* Overlay gradient at bottom for better integration */}
         <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none"></div>
      </div>
    </div>
  );
};

/* ---------------------------------
   MAIN HERO SECTION COMPONENT (DARK THEME)
---------------------------------- */

const HeroSection = ({ onNavigateUser, onNavigateSalon }) => {
  return (
    <section className="relative pt-24 md:pt-28 pb-16 px-6 w-full bg-zinc-950 overflow-hidden min-h-[90vh] flex items-center">
      
      {/* Background Gradients/Noise */}
      <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-900/30 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-900/20 rounded-full blur-[120px]"></div>
      </div>

      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center w-full relative z-10">
        
        {/* LEFT TEXT CONTENT */}
        <div className="flex flex-col items-start">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900/50 border border-zinc-700 backdrop-blur-md text-zinc-300 text-xs font-bold mb-6 shadow-lg shadow-black/50">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            TrimGo • Live queue
          </div>

          {/* Heading */}
          <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-[0.95] mb-8">
            Wait{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-400 to-zinc-600 font-serif italic pr-2">
              Less.
            </span>
            <br />
            Live{" "}
            <span className="relative inline-block text-white">
              More.
              <svg
                className="absolute w-full h-3 -bottom-1 left-0 text-emerald-500 opacity-80"
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

          {/* Subtext */}
          <p className="text-xl text-zinc-400 max-w-lg leading-relaxed mb-10 font-medium">
            Stop wasting hours in salon waiting rooms. Book your spot
            digitally, track live wait times, and walk in like a VIP.
          </p>

          {/* Buttons */}
          <div className="flex flex-wrap gap-4 w-full sm:w-auto">
            <ShimmerButton onClick={onNavigateUser} className="w-full sm:w-auto">
              Join the Queue
            </ShimmerButton>
            <ShimmerButton
              variant="secondary"
              onClick={onNavigateSalon}
              className="w-full sm:w-auto"
            >
              Partner with Us <Building2 size={18} />
            </ShimmerButton>
          </div>

          {/* Social Proof */}
          <div className="mt-12 flex items-center gap-4 pt-8 border-t border-zinc-800 w-full max-w-md">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full border-2 border-zinc-950 bg-zinc-800 shadow-md"
                  style={{
                    backgroundImage: `url(https://i.pravatar.cc/150?img=${
                      i + 10
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
              <p className="text-xs font-bold text-zinc-400">
                Trusted by 12,000+ users
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT PHONE VISUAL */}
        <div className="relative z-10 flex justify-center perspective-1000 mt-10 lg:mt-0">
          {/* Glow behind phone */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-purple-500/20 to-emerald-500/20 rounded-full blur-[80px] opacity-60 animate-pulse"></div>
          
          <InteractivePhone />

          {/* Floating Stats Card 1 */}
          <div className="absolute top-[20%] -left-4 bg-zinc-900/80 backdrop-blur-xl p-4 rounded-2xl shadow-2xl shadow-black/50 border border-white/10 animate-bounce delay-700 hidden md:block">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-500/20 p-2 rounded-lg text-emerald-400">
                <Clock size={20} />
              </div>
              <div>
                <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">
                  Time Saved
                </p>
                <p className="text-lg font-bold text-white">45 mins</p>
              </div>
            </div>
          </div>

          {/* Floating Stats Card 2 */}
          <div className="absolute bottom-[20%] -right-4 bg-zinc-900/80 backdrop-blur-xl p-4 rounded-2xl shadow-2xl shadow-black/50 border border-white/10 animate-bounce delay-1000 hidden md:block">
            <div className="flex items-center gap-3">
              <div className="bg-purple-500/20 p-2 rounded-lg text-purple-400">
                <TrendingUp size={20} />
              </div>
              <div>
                <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">
                  Salon Revenue
                </p>
                <p className="text-lg font-bold text-white">+30%</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default HeroSection;