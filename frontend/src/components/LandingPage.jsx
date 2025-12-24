import React, { useState, useEffect, useRef } from "react";
import { 
  MapPin, Scissors, BarChart3, Zap, ShieldCheck, ArrowRight 
} from "lucide-react";
import Lenis from 'lenis';

// --- COMPONENTS IMPORTS ---
import HeroSection from "./HeroSection";
import Navbar from "./Navbar";
import AdvancedDashboardSection from "./AdvancedDashboardSection"; 
// import RewardsSection from "./RewardsSection";
import Testimonials from "./Testimonials";
import Footer from "./Footer";
import { BackgroundAurora, NoiseOverlay } from "./SharedUI";

/* ---------------------------------
   HELPER HOOKS
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

/* ---------------------------------
   LOCAL UI COMPONENTS 
---------------------------------- */

const SmoothScroll = ({ children }) => {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.5, 
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return <div className="w-full">{children}</div>;
};

const CustomCursor = () => {
  const cursorRef = useRef(null);
  const followerRef = useRef(null);

  useEffect(() => {
    if (matchMedia('(pointer: coarse)').matches) return;

    const cursor = cursorRef.current;
    const follower = followerRef.current;

    let mouseX = 0, mouseY = 0;
    let posX = 0, posY = 0;
    let mouseTarget = null;

    const moveCursor = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      mouseTarget = e.target;
      if (cursor) {
        cursor.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
      }
    };

    window.addEventListener('mousemove', moveCursor);

    const loop = () => {
      if (follower && cursor) {
        posX += (mouseX - posX) * 0.2;
        posY += (mouseY - posY) * 0.2;
        follower.style.transform = `translate3d(${posX - 12}px, ${posY - 12}px, 0)`;

        if (mouseTarget) {
            const isClickable = mouseTarget.closest('a, button, input, textarea, .cursor-pointer');
            const isDarkSection = mouseTarget.closest('.dark-theme-area');

            if (isClickable) follower.classList.add('is-hovering');
            else follower.classList.remove('is-hovering');

            if (isDarkSection) {
                cursor.classList.add('is-dark-mode');
                follower.classList.add('is-dark-mode');
            } else {
                cursor.classList.remove('is-dark-mode');
                follower.classList.remove('is-dark-mode');
            }
        }
      }
      requestAnimationFrame(loop);
    };
    loop();

    return () => {
      window.removeEventListener('mousemove', moveCursor);
    };
  }, []);

  if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(pointer: coarse)').matches) {
    return null;
  }

  return (
    <>
      <style>{`
        .cursor-dot, .cursor-follower {
          position: fixed; top: 0; left: 0; pointer-events: none; z-index: 9999; border-radius: 50%;
        }
        .cursor-dot {
          width: 8px; height: 8px; background-color: #18181b; margin-top: -4px; margin-left: -4px;
          transition: background-color 0.3s; 
        }
        .cursor-follower {
          width: 32px; height: 32px; background-color: rgba(24, 24, 27, 0.1);
          border: 1px solid rgba(24, 24, 27, 0.2);
          transition: width 0.3s, height 0.3s, background-color 0.3s, border-color 0.3s;
        }
        .cursor-follower.is-hovering {
          width: 64px; height: 64px; background-color: rgba(59, 130, 246, 0.1);
          border-color: rgba(59, 130, 246, 0.3); margin-left: -16px; margin-top: -16px;
        }
        .cursor-dot.is-dark-mode { background-color: #ffffff !important; }
        .cursor-follower.is-dark-mode { background-color: rgba(255, 255, 255, 0.1) !important; border-color: rgba(255, 255, 255, 0.5) !important; }
        .cursor-follower.is-dark-mode.is-hovering { background-color: rgba(255, 255, 255, 0.2) !important; border-color: #ffffff !important; }
      `}</style>
      <div ref={cursorRef} className="cursor-dot hidden md:block"></div>
      <div ref={followerRef} className="cursor-follower hidden md:block"></div>
    </>
  );
};

const InfiniteMarquee = () => {
  const logos = ["Glamour Zone", "The Barber", "Hair Masters", "Trimmed", "Urban Cut"];
  
  return (
    <div className="w-full overflow-hidden bg-white/50 backdrop-blur-sm py-10 border-y border-zinc-200/50 relative">
      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          animation: scroll 20s linear infinite;
        }
      `}</style>

      <div className="absolute left-0 top-0 h-full w-24 bg-gradient-to-r from-zinc-50 to-transparent z-10"></div>
      <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-zinc-50 to-transparent z-10"></div>
      
      <div className="flex w-[200%] animate-scroll">
        {[...logos, ...logos, ...logos, ...logos].map((logo, i) => (
          <div key={i} className="flex-shrink-0 mx-8 flex items-center gap-2 text-zinc-400 font-bold text-xl uppercase tracking-tighter hover:text-zinc-900 transition-colors cursor-default">
            <Scissors size={18} className="opacity-50" /> {logo}
          </div>
        ))}
      </div>
    </div>
  );
};

const FeatureCard = ({ icon: Icon, title, desc, delay, colSpan = "col-span-1" }) => {
  const [ref, isVisible] = useOnScreen({ threshold: 0.1 });
  return (
    <div 
      ref={ref}
      className={`${colSpan} group relative overflow-hidden p-8 rounded-[2rem] bg-white border border-zinc-100 shadow-xl shadow-zinc-200/50 transition-all duration-700 transform hover:shadow-2xl hover:shadow-zinc-200/80 hover:-translate-y-1 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-zinc-100 to-transparent rounded-bl-[100px] -mr-8 -mt-8 transition-transform group-hover:scale-150 duration-700"></div>
      <div className="relative z-10 flex flex-col h-full justify-between">
        <div className="w-14 h-14 rounded-2xl bg-zinc-900 text-white flex items-center justify-center mb-6 shadow-lg shadow-zinc-900/20 group-hover:rotate-6 transition-transform duration-300">
          <Icon size={28} strokeWidth={1.5} />
        </div>
        <div>
          <h3 className="text-xl font-bold text-zinc-900 mb-2">{title}</h3>
          <p className="text-zinc-500 leading-relaxed text-sm">{desc}</p>
        </div>
        <div className="mt-8 flex items-center text-sm font-bold text-zinc-900 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
          Learn more <ArrowRight size={16} className="ml-2" />
        </div>
      </div>
    </div>
  );
};

/* ---------------------------------
   MAIN LANDING PAGE COMPONENT
---------------------------------- */
const LandingPage = ({ onNavigateUser, onNavigateSalon, onNavigateAdmin, onNavigateLogin }) => {
  return (
    <SmoothScroll>
      <div className="min-h-screen w-full font-sans selection:bg-zinc-900 selection:text-white overflow-x-hidden bg-zinc-50 cursor-none">
        <CustomCursor />
        <BackgroundAurora />
        <NoiseOverlay />
        <Navbar onNavigateUser={onNavigateUser} onNavigateLogin={onNavigateLogin} />
        
        <HeroSection onNavigateUser={onNavigateUser} onNavigateSalon={onNavigateSalon} />
        <InfiniteMarquee />
        
        <div id="advanced"><AdvancedDashboardSection /></div>
        {/* <RewardsSection /> */}
        
        <section id="features" className="pt-32 pb-32 px-6 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard icon={Zap} title="Real-time Tracking" desc="Watch the queue move in real-time. We calculate wait times using AI based on service type and barber speed." delay={0} colSpan="md:col-span-2" />
            <FeatureCard icon={MapPin} title="Geo-Discovery" desc="Find the best rated salons near you with filters for price, amenities, and wait times." delay={100} />
            <FeatureCard icon={BarChart3} title="Smart Analytics" desc="For business owners: Track peak hours, staff performance, and daily revenue at a glance." delay={200} />
            <FeatureCard icon={ShieldCheck} title="Verified Reviews" desc="No fake reviews. Only customers who have completed a service can leave feedback." delay={300} colSpan="md:col-span-2" />
          </div>
        </section>
        
        <div className="border-t border-zinc-200"><Testimonials /></div>
        <Footer onNavigateAdmin={onNavigateAdmin} />
      </div>
    </SmoothScroll>
  );
};

export default LandingPage;