import React, { useState } from "react";
import { 
  Menu, X, ArrowRight, Sparkles, ChevronDown, 
  BarChart3, Users, Clock 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Toaster, toast } from "react-hot-toast"; // 1. Import Toast

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
      className={`w-9 h-9 ${dark ? "bg-white text-zinc-900" : "bg-zinc-900 text-white"} rounded-xl flex items-center justify-center font-bold text-sm shadow-lg shadow-zinc-900/10`}
    >
      TG
    </motion.div>
    <span className={`font-bold text-lg tracking-tight ${dark ? "text-white" : "text-zinc-900"}`}>
      TrimGo
    </span>
  </motion.div>
);

// --- Sub-Component: Mega Menu Content ---
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

// --- Main Navbar Component ---
const Navbar = ({ onNavigateUser, onNavigateLogin }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [activeTab, setActiveTab] = useState(null);

  const navLinks = [
    { name: "Features", href: "#features", sub: "Explore our tools", hasDropdown: true },
    { name: "Dashboard", href: "#advanced", sub: "Manage your queue" },
    { name: "Stories", href: "#testimonials", sub: "Success stories" },
  ];

  // 2. Custom Toast Handler
  const handleGetApp = () => {
    toast("TrimGo App Coming Soon!", {
      icon: '🚀',
      style: {
        borderRadius: '100px', // Pill shape matching your buttons
        background: '#18181b', // Zinc-900 (Dark background)
        color: '#fff',
        padding: '12px 24px',
        fontWeight: 'bold',
        boxShadow: '0 20px 40px -10px rgba(0,0,0,0.3)',
        fontSize: '14px',
      },
      duration: 3000,
    });
    // Optional: Call original handler if needed
    if (onNavigateUser) onNavigateUser();
  };

  return (
    <>
      {/* 3. Toaster Component Added Here */}
      <Toaster position="bottom-center" reverseOrder={false} />

      {/* --- DESKTOP --- */}
      <motion.nav 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="fixed top-4 sm:top-6 left-1/2 -translate-x-1/2 w-[92%] sm:w-[95%] max-w-6xl z-50 bg-white/70 backdrop-blur-xl backdrop-saturate-150 border border-white/50 shadow-lg shadow-zinc-200/20 rounded-full px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center"
      >
        <Logo />
        
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
              onClick={handleGetApp} // 4. Updated Handler
              className="px-6 py-2.5 rounded-full bg-zinc-900 text-white text-sm font-bold shadow-xl shadow-zinc-900/10 hover:shadow-zinc-900/20 transition-all"
            >
              Get App
            </motion.button>
          </div>

          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2.5 rounded-full bg-zinc-100 text-zinc-900 hover:bg-zinc-200 transition-colors relative z-50"
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

      {/* --- MOBILE --- */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-white/90 backdrop-blur-xl md:hidden flex flex-col pt-32 px-6"
          >
             <motion.div 
                className="flex flex-col gap-6"
                variants={{
                    hidden: { opacity: 0 },
                    show: { opacity: 1, transition: { staggerChildren: 0.1 }}
                }}
                initial="hidden"
                animate="show"
             >
                {navLinks.map((item) => (
                    <motion.a 
                        key={item.name}
                        href={item.href}
                        variants={{ hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1 }}}
                        className="group flex justify-between items-center border-b border-zinc-100 pb-4"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        <div>
                            <span className="text-3xl font-bold text-zinc-900 block tracking-tight group-hover:text-indigo-600 transition-colors">
                                {item.name}
                            </span>
                            <span className="text-sm text-zinc-400 font-medium">{item.sub}</span>
                        </div>
                        <div className="w-10 h-10 rounded-full border border-zinc-200 flex items-center justify-center group-hover:bg-zinc-900 group-hover:text-white group-hover:border-zinc-900 transition-all">
                            <ArrowRight size={18} className="-rotate-45 group-hover:rotate-0 transition-transform" />
                        </div>
                    </motion.a>
                ))}
             </motion.div>
             
             <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-auto mb-10 w-full"
             >
                <button 
                    onClick={() => {
                        setIsMenuOpen(false);
                        handleGetApp(); // 5. Updated Handler for Mobile too
                    }}
                    className="w-full py-4 rounded-2xl bg-zinc-900 text-white font-bold text-lg shadow-xl shadow-zinc-900/20 flex items-center justify-center gap-2"
                >
                    Get the App <Sparkles size={18} />
                </button>
                <div className="text-center mt-4">
                    <button 
                        onClick={() => {
                            setIsMenuOpen(false);
                            onNavigateLogin();
                        }}
                        className="text-zinc-500 font-medium hover:text-zinc-900"
                    >
                        Already have an account? Log In
                    </button>
                </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;