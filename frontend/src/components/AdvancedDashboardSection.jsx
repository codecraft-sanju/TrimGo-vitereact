import React, { useState, useEffect, useRef } from "react";
import {
  Clock,
  TrendingUp,
  Users,
  Sparkles,
} from "lucide-react";

/* ---------------------------------
   LOCAL HOOKS & UTILS
---------------------------------- */

const useOnScreen = (options) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.disconnect();
      }
    }, options);

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [options]);

  return [ref, isVisible];
};

const useSpotlight = (divRef) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setOpacity(1);
  };

  const handleMouseLeave = () => {
    setOpacity(0);
  };

  return { position, opacity, handleMouseMove, handleMouseLeave };
};

/* ---------------------------------
   LOCAL UI SUB-COMPONENTS
---------------------------------- */

const GlowBlob = ({ className }) => (
  <div
    className={`absolute rounded-full blur-[110px] opacity-40 pointer-events-none animate-pulse-slow ${className}`}
  />
);

const TiltCard = ({ children, className }) => {
  const ref = useRef(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    setRotate({ x: yPct * -16, y: xPct * 16 });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1200px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
      }}
      className={`transition-transform duration-200 ease-out will-change-transform ${className}`}
    >
      {children}
    </div>
  );
};

const SpotlightCard = ({ children, className = "" }) => {
  const divRef = useRef(null);
  const { position, opacity, handleMouseMove, handleMouseLeave } =
    useSpotlight(divRef);

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative overflow-hidden rounded-2xl border border-white/40 bg-zinc-900/80 backdrop-blur-xl ${className}`}
    >
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-300"
        style={{
          opacity,
          background: `radial-gradient(500px circle at ${position.x}px ${position.y}px, rgba(255,255,255,0.18), transparent 45%)`,
        }}
      />
      <div className="relative h-full">{children}</div>
    </div>
  );
};

/* ---------------------------------
   MAIN COMPONENT
---------------------------------- */

const AdvancedDashboardSection = () => {
  const [ref, isVisible] = useOnScreen({ threshold: 0.15 });

  return (
    <section className="relative pt-24 pb-0 px-6 max-w-7xl mx-auto ">
      <div className="absolute inset-0 -z-10">
        <GlowBlob className="top-[-10%] left-[10%] w-[320px] h-[320px] bg-blue-300/40" />
        <GlowBlob className="bottom-[-10%] right-[5%] w-[380px] h-[380px] bg-purple-300/40" />
      </div>

      <div
        ref={ref}
        className={`
          grid grid-cols-1 lg:grid-cols-2 gap-12 items-center 
          transition-all duration-[900ms] 
          ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}
        `}
      >
        {/* LEFT TEXT CONTENT */}
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 text-white text-xs font-semibold mb-4">
            <span className="flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Live salon command center
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-zinc-900 mb-4 tracking-tight">
            See your queue, revenue and demand in one live dashboard.
          </h2>
          <p className="text-zinc-500 text-base md:text-lg max-w-xl mb-6">
            We brought the 3D analytics feel from premium SaaS tools right
            inside TrimGo. Owners get a real-time cockpit, while users enjoy
            smoother, smarter wait times.
          </p>

          <div className="grid sm:grid-cols-3 gap-4">
            <SpotlightCard className="p-4 bg-zinc-900 text-white border-zinc-800">
              <div className="text-xs text-zinc-400 mb-1 flex items-center gap-2">
                <Clock size={14} /> Avg wait today
              </div>
              <div className="text-2xl font-bold">
                11
                <span className="text-sm text-zinc-400 ml-1">min</span>
              </div>
            </SpotlightCard>

            <SpotlightCard className="p-4 bg-zinc-900 text-white border-zinc-800">
              <div className="text-xs text-zinc-400 mb-1 flex items-center gap-2">
                <TrendingUp size={14} /> Revenue uplift
              </div>
              <div className="text-2xl font-bold">+28%</div>
            </SpotlightCard>

            <SpotlightCard className="p-4 bg-zinc-900 text-white border-zinc-800">
              <div className="text-xs text-zinc-400 mb-1 flex items-center gap-2">
                <Users size={14} /> Returning users
              </div>
              <div className="text-2xl font-bold">73%</div>
            </SpotlightCard>
          </div>
        </div>

        {/* RIGHT DASHBOARD PREVIEW */}
        <div className="perspective-[1600px]">
          <TiltCard className="w-full">
            <div className="relative rounded-3xl border border-zinc-200 bg-white shadow-2xl overflow-hidden">
              {/* Header Bar */}
              <div className="h-12 border-b border-zinc-200 flex items-center px-4 gap-2 bg-zinc-50/80 backdrop-blur">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400/70 border border-red-500/70"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400/70 border border-yellow-500/70"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400/70 border border-green-500/70"></div>
                </div>
                <div className="mx-auto w-64 h-6 rounded-md bg-white border border-zinc-200 flex items-center justify-center text-[10px] text-zinc-500 font-mono">
                  dashboard.trimgo.app
                </div>
              </div>

              {/* Dashboard Content Grid */}
              <div className="p-4 md:p-7 grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5 lg:gap-6">
                
                {/* Stat 1: Current Wait */}
                <div className="p-4 rounded-xl border border-zinc-200 bg-zinc-50 col-span-1">
                  <div className="text-zinc-500 text-[10px] md:text-[11px] uppercase font-bold tracking-wider mb-1.5">
                    Current wait
                  </div>
                  <div className="text-2xl md:text-3xl font-bold text-zinc-900">
                    12{" "}
                    <span className="text-sm md:text-base font-normal text-zinc-500">
                      mins
                    </span>
                  </div>
                </div>

                {/* Stat 2: Queue Depth */}
                <div className="p-4 rounded-xl border border-zinc-200 bg-zinc-50 col-span-1">
                  <div className="text-zinc-500 text-[10px] md:text-[11px] uppercase font-bold tracking-wider mb-1.5">
                    Queue depth
                  </div>
                  <div className="text-2xl md:text-3xl font-bold text-zinc-900">
                    4{" "}
                    <span className="text-sm md:text-base font-normal text-zinc-500">
                      ppl
                    </span>
                  </div>
                </div>

                {/* Stat 3: AI Insight */}
                <div className="p-4 rounded-xl border border-zinc-200 bg-gradient-to-br from-emerald-50 via-white to-sky-50 col-span-2 md:col-span-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold">
                      AI
                    </div>
                    <span className="text-emerald-600 text-xs font-bold uppercase tracking-wide">
                      Insight
                    </span>
                  </div>
                  <p className="text-zinc-600 text-xs leading-relaxed">
                    Peak traffic expected at{" "}
                    <span className="font-semibold">5:00 PM</span> based on
                    the last 30 days.
                  </p>
                </div>

                {/* Queue List - CHANGE HERE: md:col-span-3 (fills full width on desktop) */}
                <div className="col-span-2 md:col-span-3 rounded-xl border border-zinc-200 bg-zinc-900 text-white overflow-hidden flex flex-col">
                  <div className="p-3 md:p-4 border-b border-white/10 flex justify-between items-center bg-zinc-950/60">
                    <span className="font-semibold text-sm">Live Queue</span>
                    <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      SYNCED
                    </span>
                  </div>
                  
                  {/* List Items */}
                  <div className="p-2 space-y-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 md:gap-4 p-2 md:p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group"
                      >
                        <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center text-zinc-300 text-[10px] md:text-xs font-bold">
                          #{i}
                        </div>
                        <div className="flex-1">
                          <div className="h-2 w-16 md:w-24 bg-zinc-800 rounded mb-1 group-hover:bg-zinc-700 transition"></div>
                          <div className="h-1.5 md:h-2 w-10 md:w-16 bg-zinc-900 rounded group-hover:bg-zinc-800 transition"></div>
                        </div>
                        <div className="text-[10px] md:text-[11px] font-mono text-zinc-500 group-hover:text-white transition">
                          1{i}:0{i % 2 === 0 ? "5" : "0"} PM
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Footer */}
                  <div className="mt-auto px-4 py-2 md:py-3 border-t border-white/10 text-[10px] md:text-[11px] text-zinc-400 flex items-center justify-between bg-zinc-950/80">
                    <span>Auto-assign ON</span>
                    <span className="flex items-center gap-1">
                      <Sparkles size={10} /> <span>AI Load</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-0 left-0 w-full h-10 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
            </div>
          </TiltCard>
        </div>
      </div>
    </section>
  );
};

export default AdvancedDashboardSection;