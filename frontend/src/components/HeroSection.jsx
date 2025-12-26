import React from "react";
import { Building2, Clock, TrendingUp, Star } from "lucide-react";

/* ---------------------------------
   HELPER COMPONENTS
---------------------------------- */

const ShimmerButton = ({ children, onClick, variant = "primary", className = "", disabled = false }) => {
  const baseClass =
    "group relative overflow-hidden rounded-xl font-bold transition-all duration-300 hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    // Primary: Emerald Green for High Contrast Pop
    primary:
      "bg-emerald-500 text-black shadow-[0_0_20px_-5px_rgba(16,185,129,0.4)] hover:shadow-[0_0_30px_-5px_rgba(16,185,129,0.6)]",
    // Secondary: Dark Glass
    secondary:
      "bg-zinc-900 text-zinc-300 border border-zinc-800 hover:bg-zinc-800 hover:text-white shadow-sm",
  };

  return (
    <button onClick={onClick} disabled={disabled} className={`${baseClass} ${variants[variant] || variants.primary} ${className}`}>
      <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent z-10" />
      <span className="relative z-20 flex items-center justify-center gap-2 px-6 py-3.5">
        {children}
      </span>
    </button>
  );
};

const InteractivePhone = () => {
  return (
    <div className="relative mx-auto w-[300px] md:w-[320px] h-[640px] bg-zinc-900 rounded-[3rem] p-4 shadow-[0_0_60px_-15px_rgba(16,185,129,0.1)] border-[8px] border-zinc-950 ring-1 ring-zinc-800 select-none transform transition hover:scale-[1.02] duration-500">
      {/* Dynamic Island */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-7 w-32 bg-black rounded-b-2xl z-50 flex items-center justify-center gap-2 border-b border-zinc-800/50">
        <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></div>
        <div className="w-10 h-1 rounded-full bg-zinc-800"></div>
      </div>

      {/* Screen Content */}
      <div className="w-full h-full bg-zinc-950 rounded-[2.5rem] overflow-hidden relative flex flex-col border border-zinc-800/30">
         <video 
           src="/TrimGo.mp4" 
           className="w-full h-full object-cover opacity-90" 
           autoPlay loop muted playsInline
         />
         <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 to-transparent pointer-events-none"></div>
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, colorClass, label, value }) => (
    <div className="flex items-center gap-3 bg-zinc-900/90 backdrop-blur-md p-4 rounded-2xl border border-zinc-800 shadow-xl">
        <div className={`p-2 rounded-lg ${colorClass} bg-opacity-10`}>
            <Icon size={20} className={colorClass.replace('bg-', 'text-')} />
        </div>
        <div>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">{label}</p>
            <p className="text-lg font-bold text-white">{value}</p>
        </div>
    </div>
);

/* ---------------------------------
   MAIN HERO SECTION
---------------------------------- */

const HeroSection = ({ onNavigateUser, onNavigateSalon }) => {
  return (
    <section className="relative pt-24 md:pt-28 pb-16 px-6 max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center min-h-[90vh] bg-black text-white overflow-hidden">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2" />
      
      <div className="flex flex-col items-start z-10 relative">
        {/* Live Queue Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900/50 border border-zinc-800 text-zinc-300 text-xs font-bold mb-6 shadow-lg shadow-black/50">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          TrimGo • Live queue
        </div>

        <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter leading-[0.95] mb-8">
          Wait{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-400 to-zinc-600 font-serif italic pr-2">
            Less.
          </span>
          <br />
          Live{" "}
          <span className="relative inline-block text-emerald-400">
            More.
            <svg className="absolute w-full h-3 -bottom-1 left-0 text-emerald-500 opacity-60" viewBox="0 0 100 10" preserveAspectRatio="none">
              <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
            </svg>
          </span>
        </h1>

        <p className="text-xl text-zinc-400 max-w-lg leading-relaxed mb-10 font-medium">
          Stop wasting hours in salon waiting rooms. Book your spot digitally, track live wait times, and walk in like a VIP.
        </p>

        <div className="flex flex-wrap gap-4 w-full sm:w-auto">
          <ShimmerButton onClick={onNavigateUser} className="w-full sm:w-auto">
            Join the Queue
          </ShimmerButton>
          <ShimmerButton variant="secondary" onClick={onNavigateSalon} className="w-full sm:w-auto">
            Partner with Us <Building2 size={18} />
          </ShimmerButton>
        </div>

        <div className="mt-12 flex items-center gap-4 pt-8 border-t border-zinc-800 w-full max-w-md">
          <div className="flex -space-x-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-10 h-10 rounded-full border-2 border-black bg-zinc-800"
                style={{ backgroundImage: `url(https://i.pravatar.cc/150?img=${i + 10})`, backgroundSize: "cover" }}
              />
            ))}
          </div>
          <div>
            <div className="flex text-yellow-500 mb-1">
              {[1, 2, 3, 4, 5].map((i) => <Star key={i} size={14} fill="currentColor" />)}
            </div>
            <p className="text-xs font-bold text-zinc-400">Trusted by 12,000+ users</p>
          </div>
        </div>
      </div>

      <div className="relative z-10 flex justify-center perspective-1000 mt-10 lg:mt-0">
        {/* Glow Behind Phone */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-emerald-500/20 to-purple-500/20 rounded-full blur-[80px] animate-pulse"></div>
        
        <InteractivePhone />

        {/* Floating Stats - Left */}
        <div className="absolute top-[20%] -left-4 animate-bounce delay-700 hidden md:block">
            <StatCard icon={Clock} colorClass="text-emerald-400 bg-emerald-400" label="Time Saved" value="45 mins" />
        </div>

        {/* Floating Stats - Right */}
        <div className="absolute bottom-[20%] -right-4 animate-bounce delay-1000 hidden md:block">
            <StatCard icon={TrendingUp} colorClass="text-purple-400 bg-purple-400" label="Salon Revenue" value="+30%" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;