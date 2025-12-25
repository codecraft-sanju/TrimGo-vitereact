import React, { useState, useEffect } from "react";
import { 
  Menu, X, ArrowRight, Sparkles, ChevronDown, 
  BarChart3, Users, Clock 
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

// --- PREMIUM ANIMATION VARIANTS ---

// 1. The Container: Uses clip-path for a circular "Ripple" expansion from top-right
const menuContainerVars = {
  initial: { 
    clipPath: "circle(0% at calc(100% - 2.5rem) 2.5rem)", 
    opacity: 0,
  },
  animate: { 
    clipPath: "circle(150% at calc(100% - 2.5rem) 2.5rem)", 
    opacity: 1,
    transition: { 
      type: "spring",
      stiffness: 30,    
      damping: 15,      
      mass: 1,
      restDelta: 0.001
    }
  },
  exit: { 
    clipPath: "circle(0% at calc(100% - 2.5rem) 2.5rem)",
    opacity: 0,
    transition: { 
      type: "spring",
      stiffness: 300,   
      damping: 35,
    }
  }
};

// 2. The Content: Staggers in
const contentContainerVars = {
  initial: { opacity: 0 },
  animate: { 
    opacity: 1,
    transition: { 
      staggerChildren: 0.1, 
      delayChildren: 0.2    
    }
  },
  exit: { 
    opacity: 0,
    transition: { 
      staggerChildren: 0.05, 
      staggerDirection: -1,
      when: "afterChildren"
    }
  }
};

// 3. The Items: Slide up with a subtle Motion Blur effect
const itemVars = {
  initial: { 
    y: 40, 
    opacity: 0,
    filter: "blur(10px)", 
  },
  animate: { 
    y: 0, 
    opacity: 1, 
    filter: "blur(0px)",  
    transition: { 
      type: "spring",
      stiffness: 50,
      damping: 10
    }
  },
  exit: { 
    y: -20, 
    opacity: 0,
    filter: "blur(5px)",
    transition: { duration: 0.2 }
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
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMenuOpen]);

  const navLinks = [
    { name: "Features", href: "#features", sub: "Explore our tools", hasDropdown: true },
    { name: "Dashboard", href: "#advanced", sub: "Manage your queue" },
    { name: "Stories", href: "#testimonials", sub: "Success stories" },
  ];

  // --- Premium Toast Handler ---
  const handleGetApp = () => {
    toast.info('TrimGo App Coming Soon!', {
      position: "top-center",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
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
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        className="mt-14 sm:mt-0 z-[60]" 
      />

      {/* --- DESKTOP / MAIN BAR (LIGHT MODE - UNCHANGED) --- */}
      <motion.nav 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className={`fixed top-4 sm:top-6 left-1/2 -translate-x-1/2 w-[92%] sm:w-[95%] max-w-6xl z-50 transition-all duration-300
          ${isMenuOpen ? "bg-transparent border-transparent shadow-none" : "bg-white/70 backdrop-blur-xl backdrop-saturate-150 border border-white/50 shadow-lg shadow-zinc-200/20"}
          rounded-full px-4 sm:px-6 py-2 sm:py-3 flex justify-between items-center`}
      >
        {/* Logo changes color based on Menu State */}
        <div className="relative z-50">
           <Logo dark={isMenuOpen} />
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

          {/* Mobile Menu Toggle - Adapts Color */}
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`md:hidden p-2.5 rounded-full transition-colors relative z-50 ${isMenuOpen ? "bg-zinc-800 text-white" : "bg-zinc-100 text-zinc-900 hover:bg-zinc-200"}`}
          >
            <AnimatePresence mode="wait" initial={false}>
              {isMenuOpen ? (
                <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                  <X size={20} />
                </motion.div>
              ) : (
                <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
                  <Menu size={20} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </motion.nav>

      {/* --- PREMIUM DARK MOBILE MENU --- */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            variants={menuContainerVars}
            initial="initial"
            animate="animate"
            exit="exit"
            className="fixed inset-0 z-40 bg-black flex flex-col pt-28 px-6 overflow-hidden"
          >
             {/* Subtle Ambient Background - Pulsing */}
             <motion.div 
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }} 
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-[-10%] left-[-20%] w-[60%] h-[50%] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" 
             />
             <motion.div 
                animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.7, 0.5] }} 
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-[-10%] right-[-20%] w-[60%] h-[50%] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" 
             />

             <motion.div 
               className="flex flex-col gap-6 h-full relative z-10"
               variants={contentContainerVars}
               initial="initial"
               animate="animate"
               exit="exit"
             >
                {/* --- Image Section with Dark Aesthetic (UPDATED FOR CLARITY) --- */}
                <motion.div 
                    variants={itemVars}
                    className="w-full h-44 rounded-3xl overflow-hidden shadow-2xl relative group shrink-0 border border-zinc-800/50"
                >
                    <motion.img 
                        initial={{ scale: 1.1 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 5, ease: "easeOut" }} 
                        src="/salonshopnavbar.jpg" 
                        alt="Salon Interior" 
                        // Changed opacity from 60 to 90 for clearer view
                        className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-700"
                    />
                    {/* Adjusted gradient to be very subtle, only at the bottom for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-6">
                          <div>
                             <span className="text-white font-bold text-lg tracking-wide block">TrimGo Partner</span>
                             <span className="text-zinc-400 text-xs uppercase tracking-widest font-medium">Manage your salon</span>
                          </div>
                    </div>
                </motion.div>

                {/* --- Dark Mode Links --- */}
                <div className="flex flex-col gap-2">
                  {navLinks.map((item) => (
                      <motion.a 
                          key={item.name}
                          href={item.href}
                          variants={itemVars}
                          className="group flex justify-between items-center p-4 rounded-2xl hover:bg-zinc-900 transition-colors border border-transparent hover:border-zinc-800"
                          onClick={() => setIsMenuOpen(false)}
                      >
                          <div>
                              <span className="text-3xl font-bold text-white block tracking-tight group-hover:text-indigo-400 transition-colors">
                                  {item.name}
                              </span>
                              <span className="text-sm text-zinc-500 font-medium group-hover:text-zinc-400 transition-colors">{item.sub}</span>
                          </div>
                          <div className="w-12 h-12 rounded-full border border-zinc-800 bg-zinc-900 flex items-center justify-center text-white group-hover:bg-white group-hover:text-black group-hover:border-white transition-all">
                              <ArrowRight size={20} className="-rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                          </div>
                      </motion.a>
                  ))}
                </div>
                
                {/* --- Bottom Actions (Dark Mode Contrast) --- */}
                <motion.div 
                  variants={itemVars}
                  className="mt-auto pb-10 w-full grid grid-cols-2 gap-3"
                >
                   <button 
                       onClick={() => {
                           setIsMenuOpen(false);
                           onNavigateLogin();
                       }}
                       className="w-full py-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-white font-bold text-lg hover:bg-zinc-800 active:scale-95 transition-all"
                   >
                       Log In
                   </button>

                   <button 
                       onClick={() => {
                           setIsMenuOpen(false);
                           handleGetApp();
                       }}
                       className="w-full py-4 rounded-2xl bg-white text-zinc-950 font-bold text-lg shadow-xl shadow-white/5 flex items-center justify-center gap-2 active:scale-95 transition-transform hover:bg-zinc-200"
                   >
                       Get App <Sparkles size={18} className="text-zinc-950" />
                   </button>
                </motion.div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;