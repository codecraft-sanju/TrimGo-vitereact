import React, { useState, useEffect } from "react";
import { 
  Menu, X, ArrowRight, Sparkles, ChevronDown, 
  BarChart3, Users, Clock, Zap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- React Toastify Imports ---
import { ToastContainer, toast, Bounce } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// --- Sub-Component: Logo ---
const Logo = ({ dark = false }) => (
  <motion.div 
    className="flex items-center gap-2 group cursor-pointer select-none"
    whileHover="hover"
    initial="initial"
    animate="animate"
  >
    <motion.div 
      variants={{
        initial: { rotate: 0, scale: 1 },
        hover: { rotate: 12, scale: 1.05 }
      }}
      transition={{ type: "spring", stiffness: 400, damping: 15 }}
      className={`w-9 h-9 ${dark ? "bg-white text-zinc-950" : "bg-zinc-900 text-white"} rounded-xl flex items-center justify-center font-bold text-sm shadow-lg shadow-zinc-900/10`}
    >
      TG
    </motion.div>
    <span className={`font-bold text-lg tracking-tight ${dark ? "text-white" : "text-zinc-900"}`}>
      TrimGo
    </span>
  </motion.div>
);

// --- Sub-Component: Mega Menu Content (Desktop) ---
const FeaturesMegaMenu = () => (
  <div className="w-[500px] p-4 grid grid-cols-2 gap-2 text-left cursor-default">
    <div className="space-y-1">
      <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 px-2">Core Products</h4>
      {[
        { title: "Queue System", icon: Users, desc: "Real-time management" },
        { title: "Smart Booking", icon: Clock, desc: "AI-powered scheduling" },
      ].map((item) => (
        <a key={item.title} href="#" className="flex items-start gap-3 p-2 rounded-xl hover:bg-zinc-50 transition-colors group">
          <div className="p-2 bg-zinc-100 rounded-lg group-hover:bg-white group-hover:shadow-md transition-all">
            <item.icon size={16} className="text-zinc-600 group-hover:text-black" />
          </div>
          <div>
            <div className="font-semibold text-sm text-zinc-800 flex items-center gap-1">
              {item.title} 
              <ArrowRight size={12} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
            </div>
            <p className="text-xs text-zinc-500">{item.desc}</p>
          </div>
        </a>
      ))}
    </div>
    <div className="space-y-1 bg-zinc-50 rounded-xl p-3">
      <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Analytics</h4>
      <div className="group cursor-pointer">
        <div className="flex items-center gap-2 mb-1">
          <BarChart3 size={16} className="text-indigo-600" />
          <span className="font-semibold text-sm">Growth Insights</span>
        </div>
        <p className="text-xs text-zinc-500 leading-relaxed">
          Track customer retention and peak hours with our new dashboard.
        </p>
      </div>
      <div className="mt-4 pt-3 border-t border-zinc-200">
        <a href="#" className="text-xs font-bold text-indigo-600 flex items-center gap-1 hover:gap-2 transition-all">
          View Demo <ArrowRight size={12} />
        </a>
      </div>
    </div>
  </div>
);

// --- 3D ANIMATION VARIANTS (OPTIMIZED FOR 60FPS) ---

// 1. The Sheet (The "iOS" feel - tuned physics)
const sheetVars = {
  initial: { y: "100%" },
  animate: { 
    y: 0, 
    transition: { 
      type: "spring", 
      stiffness: 300, 
      damping: 30, // Increased damping removes "wobble"
      mass: 0.8    // Lower mass makes it feel lighter/faster
    }
  },
  exit: { 
    y: "100%", 
    transition: { 
      type: "spring", 
      stiffness: 300, 
      damping: 30,
      mass: 0.8
    }
  }
};

// 2. The Content Stagger
const staggerContainerVars = {
  animate: {
    transition: { staggerChildren: 0.08, delayChildren: 0.15 }
  },
  exit: {
    transition: { staggerChildren: 0.05, staggerDirection: -1 }
  }
};

// 3. The 3D Flip Item
const flipItemVars = {
  initial: { rotateX: 90, y: 20, opacity: 0 },
  animate: { 
    rotateX: 0, 
    y: 0, 
    opacity: 1,
    transition: { type: "spring", stiffness: 200, damping: 20 } 
  },
  exit: { 
    opacity: 0, 
    transition: { duration: 0.15 }
  }
};

// --- Main Navbar Component ---
const Navbar = ({ onNavigateLogin }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [activeTab, setActiveTab] = useState(null);

  // Prevent scrolling when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
      // Optional: Prevent iOS overscroll bounce
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = 'unset';
      document.body.style.position = '';
      document.body.style.width = '';
    }
  }, [isMenuOpen]);

  const navLinks = [
    { name: "Features", href: "#features", sub: "Explore tools", hasDropdown: true },
    { name: "Dashboard", href: "#advanced", sub: "Analytics view" },
    { name: "Stories", href: "#testimonials", sub: "Success stories" },
  ];

  const handleGetApp = () => {
    toast.info('TrimGo App Coming Soon!', {
      position: "top-center",
      autoClose: 3000,
      theme: "dark",
      transition: Bounce,
      icon: "🚀"
    });
  };

  return (
    <>
      <ToastContainer
        position="top-center"
        autoClose={3000}
        theme="dark"
        className="mt-14 sm:mt-0 z-[60]" 
      />

      {/* --- DESKTOP NAV --- */}
      <motion.nav 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className={`fixed top-4 sm:top-6 left-1/2 -translate-x-1/2 w-[92%] sm:w-[95%] max-w-6xl z-50 transition-all duration-300
          ${isMenuOpen ? "bg-transparent pointer-events-none" : "bg-white/70 backdrop-blur-xl backdrop-saturate-150 border border-white/50 shadow-lg shadow-zinc-200/20 pointer-events-auto"}
          rounded-full px-4 sm:px-6 py-2 sm:py-3 flex justify-between items-center transform-gpu`}
      >
        <div className={`relative z-50 transition-opacity duration-300 ${isMenuOpen ? "opacity-0" : "opacity-100"}`}>
           <Logo />
        </div>
        
        {/* Desktop Links */}
        <div className="hidden md:flex gap-1 items-center bg-zinc-100/50 p-1 rounded-full border border-white/50" onMouseLeave={() => setActiveTab(null)}>
          {navLinks.map((link, index) => (
            <div 
              key={link.name}
              className="relative"
              onMouseEnter={() => {
                setHoveredIndex(index);
                if (link.hasDropdown) setActiveTab("features");
                else setActiveTab(null);
              }}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <a 
                href={link.href}
                className="relative px-5 py-2 text-sm font-semibold text-zinc-600 hover:text-zinc-900 transition-colors z-10 flex items-center gap-1 cursor-pointer"
              >
                {hoveredIndex === index && (
                  <motion.span 
                    layoutId="nav-pill"
                    className="absolute inset-0 bg-white rounded-full shadow-sm border border-zinc-100/50 -z-10"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                {link.name}
                {link.hasDropdown && (
                  <ChevronDown 
                    size={14} 
                    className={`transition-transform duration-300 ${activeTab === 'features' && hoveredIndex === index ? 'rotate-180' : ''}`}
                  />
                )}
              </a>

              <AnimatePresence>
                {link.hasDropdown && activeTab === "features" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 15, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-1/2 -translate-x-1/2 pt-2"
                  >
                    <div className="bg-white rounded-2xl shadow-xl border border-zinc-100 overflow-hidden relative">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-1.5 w-3 h-3 bg-white border-t border-l border-zinc-100 rotate-45" />
                        <FeaturesMegaMenu />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-3">
            <motion.button 
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onNavigateLogin} 
              className="px-5 py-2.5 rounded-full text-zinc-900 text-sm font-bold hover:bg-zinc-100 transition-colors"
            >
              Log In
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleGetApp}
              className="px-6 py-2.5 rounded-full bg-zinc-900 text-white text-sm font-bold shadow-xl shadow-zinc-900/10 hover:shadow-zinc-900/20 transition-all"
            >
              Get App
            </motion.button>
          </div>

          {/* Toggle Button - Modified: Hides when open, only shows Menu icon when closed */}
          <motion.button 
            initial={{ opacity: 1, scale: 1 }}
            animate={{ 
              opacity: isMenuOpen ? 0 : 1,
              scale: isMenuOpen ? 0.8 : 1,
              pointerEvents: isMenuOpen ? "none" : "auto"
            }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsMenuOpen(true)}
            className="md:hidden p-3 rounded-full bg-white text-zinc-900 shadow-zinc-200/50 shadow-lg relative z-[60] transition-all"
          >
             <Menu size={20} />
          </motion.button>
        </div>
      </motion.nav>

     
      <AnimatePresence>
        {isMenuOpen && (
          <>
          
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: "linear" }}
                onClick={() => setIsMenuOpen(false)}
                className="fixed inset-0 bg-zinc-950/60 backdrop-blur-sm z-40 cursor-pointer"
            />

            {/* 2. The Main Sheet */}
            <motion.div 
              variants={sheetVars}
              initial="initial"
              animate="animate"
              exit="exit"
              style={{ willChange: "transform" }} // PERFORMANCE BOOST
              drag="y" 
              dragConstraints={{ top: 0 }} 
              dragElastic={{ top: 0.05, bottom: 0.5 }} // Stiffer top to prevent over-pulling
              onDragEnd={(_, { offset, velocity }) => {
                // Smart close logic: Close if dragged down far enough OR flicked fast
                if (offset.y > 100 || velocity.y > 150) {
                  setIsMenuOpen(false);
                }
              }}
              className="fixed bottom-0 left-0 right-0 h-[92vh] bg-[#0A0A0A] z-50 rounded-t-[2.5rem] overflow-hidden shadow-2xl shadow-black/50 border-t border-white/10 flex flex-col touch-none"
            >
                {/* Decorative Elements */}
                {/* Handle Bar */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-10 flex items-center justify-center cursor-grab active:cursor-grabbing z-20">
                      <div className="w-16 h-1.5 bg-zinc-800 rounded-full" />
                </div>
                
                <div className="absolute top-[-20%] left-[-20%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-rose-600/5 rounded-full blur-[100px] pointer-events-none" />

                <div className="p-8 pt-16 h-full flex flex-col pointer-events-auto">
                    
                    {/* Header inside Menu (With New Close Button) */}
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex items-center justify-between mb-8 select-none"
                    >
                          <div className="flex items-center gap-3">
                             <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-zinc-950 font-bold">TG</div>
                             <span className="text-white text-xl font-bold">TrimGo</span>
                          </div>
                          
                          {/* --- NEW CLOSE BUTTON INSIDE DARK THEME --- */}
                          <motion.button 
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setIsMenuOpen(false)}
                            className="p-3 bg-zinc-900 border border-zinc-800 rounded-full text-white hover:bg-zinc-800 transition-colors shadow-lg shadow-black/20"
                          >
                            <X size={20} />
                          </motion.button>

                    </motion.div>

                    {/* Navigation Links with 3D Cascade */}
                    <motion.div 
                        variants={staggerContainerVars}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="flex flex-col gap-3 flex-1 overflow-y-auto no-scrollbar"
                        onPointerDownCapture={(e) => e.stopPropagation()} 
                    >
                        {/* Featured Card */}
                        <motion.div 
                            variants={flipItemVars}
                            className="relative h-40 rounded-3xl overflow-hidden mb-4 group border border-white/10 cursor-pointer shrink-0"
                        >
                            <img src="/salonshopnavbar.jpg" alt="Featured" className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-500 scale-105" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent flex flex-col justify-end p-5">
                                <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
                                    <Zap size={12} fill="currentColor" /> New Feature
                                </div>
                                <h3 className="text-white font-bold text-lg">Partner Dashboard</h3>
                            </div>
                        </motion.div>

                        {/* List Items */}
                        {navLinks.map((item, i) => (
                            <motion.a 
                                key={item.name}
                                href={item.href}
                                variants={flipItemVars}
                                onClick={() => setIsMenuOpen(false)}
                                className="group flex items-center justify-between p-5 rounded-3xl bg-zinc-900/50 hover:bg-zinc-800 border border-white/5 hover:border-white/10 transition-all active:scale-[0.98] shrink-0"
                            >
                                <div>
                                    <span className="text-2xl font-semibold text-zinc-200 group-hover:text-white transition-colors">{item.name}</span>
                                    <p className="text-sm text-zinc-500 group-hover:text-zinc-400 mt-0.5">{item.sub}</p>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-zinc-400 group-hover:bg-white group-hover:text-black transition-all">
                                    <ArrowRight size={18} className="-rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                                </div>
                            </motion.a>
                        ))}
                        
                        {/* Spacing for bottom actions visibility when scrolling */}
                        <div className="h-24"></div>
                    </motion.div>

                    {/* Bottom Action - Absolute positioned to stay at bottom */}
                    <motion.div 
                        variants={flipItemVars}
                        className="absolute bottom-8 left-8 right-8 pt-6 border-t border-white/5 grid grid-cols-2 gap-4 bg-[#0A0A0A]/90 backdrop-blur-md"
                    >
                        <button 
                            onClick={onNavigateLogin}
                            className="py-4 rounded-2xl text-zinc-300 hover:text-white font-semibold hover:bg-zinc-900 transition-colors"
                        >
                            Log In
                        </button>
                        <button 
                            onClick={handleGetApp}
                            className="py-4 rounded-2xl bg-white text-zinc-950 font-bold shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-shadow"
                        >
                            Get 
                        </button>
                    </motion.div>

                </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;