import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useNavigate, useLocation, Navigate } from "react-router-dom";
import { Bell, Ticket, X, CheckCircle, Sparkles, Scissors } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion"; // Required: npm install framer-motion

// --- API & COMPONENTS IMPORTS ---
import api from "./utils/api";
import { SalonRegistration, SalonLogin } from "./components/SalonRegistration";
import UserRegistration from "./components/UserRegistration";
import UserLogin from "./components/UserLogin"; 
import { UserProfile } from "./components/UserProfile";
import { AdminLogin, AdminDashboard } from "./components/AdminDashboard";
import SalonDashboard from "./components/SalonDashboard";
import UserDashboard from "./components/UserDashboard";
import { NoiseOverlay } from "./components/SharedUI";

// Import Pages
import LandingPage from "./components/LandingPage";
import ReferralPage from "./components/ReferralPage";

// ----------------------------------------------------------------------
// 0. ULTRA-PREMIUM AESTHETIC LOADER (The "Editorial" Look)
// ----------------------------------------------------------------------
const PremiumPreloader = ({ onLoadingComplete }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    // Determine loading speed
    const duration = 2500; 
    const steps = 100;
    const intervalTime = duration / steps;

    const timer = setInterval(() => {
      setCount((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onLoadingComplete, 1000); // Wait for exit animation
          return 100;
        }
        // Organic loading rhythm (sometimes fast, sometimes slow)
        const jump = Math.random() > 0.8 ? Math.floor(Math.random() * 10) + 5 : 1;
        return Math.min(prev + jump, 100);
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [onLoadingComplete]);

  // Letter animation variants
  const letterVariants = {
    hidden: { y: 100, opacity: 0 },
    visible: (i) => ({
      y: 0,
      opacity: 1,
      transition: {
        delay: i * 0.05,
        duration: 0.8,
        ease: [0.215, 0.61, 0.355, 1], // Cubic-bezier for "pop"
      },
    }),
  };

  return (
    <motion.div
      initial={{ y: 0 }}
      exit={{ y: "-100%", transition: { duration: 1.2, ease: [0.76, 0, 0.24, 1] } }} // The "Curtain" Slide
      className="fixed inset-0 z-[9999] bg-neutral-950 text-white flex flex-col justify-between p-6 md:p-12 overflow-hidden"
    >
      {/* Background Noise Texture */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay">
         <div className="w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
      </div>

      {/* Top Header */}
      <div className="w-full flex justify-between items-start z-10 opacity-60">
        <span className="text-xs md:text-sm font-light tracking-[0.2em] uppercase">Est. 2024</span>
        <Scissors size={20} className="animate-spin-slow opacity-80" strokeWidth={1} />
      </div>

      {/* Center Content: Massive Typography */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full">
        <div className="overflow-hidden flex items-center justify-center">
            {/* Staggered Text Reveal */}
            {["T", "R", "I", "M", "G", "O"].map((char, index) => (
              <motion.span
                key={index}
                custom={index}
                variants={letterVariants}
                initial="hidden"
                animate="visible"
                className="text-7xl sm:text-8xl md:text-[10rem] font-black tracking-tighter leading-none bg-clip-text text-transparent bg-gradient-to-b from-white via-neutral-200 to-neutral-600"
              >
                {char}
              </motion.span>
            ))}
        </div>
        
        {/* Subtitle */}
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="mt-4 md:mt-8 overflow-hidden"
        >
             <p className="text-xs md:text-sm font-medium tracking-[0.4em] text-neutral-500 uppercase">
                Queue Management System
             </p>
        </motion.div>
      </div>

      {/* Bottom Footer: The Counter & Bar */}
      <div className="w-full z-10">
        <div className="flex justify-between items-end mb-4">
            <div className="flex flex-col">
                <span className="text-xs text-neutral-500 uppercase tracking-widest mb-1">Status</span>
                <span className="text-sm font-medium text-emerald-400">
                    {count < 100 ? "Loading Assets..." : "Ready"}
                </span>
            </div>
            
            {/* Huge Number Counter */}
            <div className="text-6xl md:text-8xl font-thin tracking-tighter leading-none tabular-nums text-white">
                {count}
                <span className="text-2xl md:text-4xl text-neutral-600 font-normal">%</span>
            </div>
        </div>

        {/* Ultra Thin Progress Line */}
        <div className="w-full h-[1px] bg-neutral-800 relative overflow-hidden">
            <motion.div 
                className="absolute top-0 left-0 h-full bg-white"
                initial={{ width: "0%" }}
                animate={{ width: `${count}%` }}
                transition={{ ease: "linear", duration: 0.2 }}
            />
        </div>
      </div>
    </motion.div>
  );
};

// ----------------------------------------------------------------------
// 1. Toast Notification
// ----------------------------------------------------------------------
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);
  return (
    <div className="fixed top-24 right-6 z-[100] animate-[slideIn_0.3s_ease-out]">
      <div className="bg-white/90 backdrop-blur-xl border border-zinc-200 shadow-2xl rounded-2xl p-4 flex items-center gap-3 pr-8 min-w-[300px]">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${type === 'success' ? 'bg-green-100 text-green-600' : type === 'error' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
          {type === 'success' ? <CheckCircle size={20} /> : type === 'error' ? <X size={20} /> : <Bell size={20} />}
        </div>
        <div>
          <h4 className="font-bold text-sm text-zinc-900">{type === 'success' ? 'Success' : type === 'error' ? 'Error' : 'Notification'}</h4>
          <p className="text-xs text-zinc-500">{message}</p>
        </div>
        <button onClick={onClose} className="absolute top-2 right-2 text-zinc-400 hover:text-zinc-900"><X size={14} /></button>
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------
// 2. Live Ticket Widget
// ----------------------------------------------------------------------
const LiveTicket = ({ ticket, onCancel }) => {
  const [timeLeft, setTimeLeft] = useState(ticket ? ticket.eta : 0);
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 60000);
    return () => clearInterval(timer);
  }, []);
  
  if (!ticket) return null;
  
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[95%] max-w-md z-50">
      <div className="bg-zinc-900 text-white rounded-3xl p-5 shadow-2xl border border-white/10 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 via-emerald-500 to-blue-500 animate-[shimmer_2s_infinite]"></div>
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center animate-pulse">
              <Ticket className="text-white" size={24} />
            </div>
            <div>
              <p className="text-zinc-400 text-xs font-bold uppercase tracking-wider">Current Ticket</p>
              <h3 className="font-bold text-lg">{ticket.salonName}</h3>
            </div>
          </div>
          <button onClick={onCancel} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition"><X size={16} /></button>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white/5 rounded-2xl p-3 text-center border border-white/5">
            <div className="text-2xl font-black">{timeLeft}</div>
            <div className="text-[10px] text-zinc-400 uppercase">Mins Left</div>
          </div>
          <div className="bg-white/5 rounded-2xl p-3 text-center border border-white/5">
            <div className="text-2xl font-black text-emerald-400">#{ticket.number || "-"}</div>
            <div className="text-[10px] text-zinc-400 uppercase">Your Position</div>
          </div>
        </div>
        <div className="flex items-center justify-between text-xs text-zinc-500 bg-black/20 p-2 rounded-lg">
          <span className="flex items-center gap-1"><Sparkles size={12} className="text-yellow-400"/> AI calculating speed</span>
          <span>Updated live</span>
        </div>
      </div>
    </div>
  );
};

/* ---------------------------------
   ROUTE GUARDS (SECURITY) 🔒
---------------------------------- */

const ProtectedRoute = ({ user, authLoading, children }) => {
  if (authLoading) return null; 
  if (!user) {
    return <Navigate to="/user/login" replace />;
  }
  return children;
};

const PublicRoute = ({ user, salon, authLoading, children }) => {
  if (authLoading) return null; 
  if (user) return <Navigate to="/dashboard/user" replace />;
  if (salon) return <Navigate to="/dashboard/salon" replace />;
  return children;
};

const ProtectedAdminRoute = ({ children }) => {
  const isAdminLoggedIn = localStorage.getItem("adminAuth") === "true";
  if (!isAdminLoggedIn) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
};

const AdminPublicRoute = ({ children }) => {
  const isAdminLoggedIn = localStorage.getItem("adminAuth") === "true";
  if (isAdminLoggedIn) {
    return <Navigate to="/admin/dashboard" replace />;
  }
  return children;
};

/* ---------------------------------
   MAIN APP CONTENT
---------------------------------- */

const AppContent = () => {
  const navigate = useNavigate();
  const location = useLocation();
      
  const [salons, setSalons] = useState([]);
  const [toast, setToast] = useState(null);
  const [activeTicket, setActiveTicket] = useState(null);

  // AUTH STATES
  const [currentUser, setCurrentUser] = useState(null);
  const [currentSalon, setCurrentSalon] = useState(null);
  const [authLoading, setAuthLoading] = useState(true); 
  
  // PRELOADER STATE
  const [showPreloader, setShowPreloader] = useState(true);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const [userRes, salonRes] = await Promise.allSettled([
          api.get("/auth/me"),
          api.get("/salon/me")
        ]);

        if (userRes.status === "fulfilled" && userRes.value.data.success) {
          setCurrentUser(userRes.value.data.user);
          await fetchActiveTicket();
        }

        if (salonRes.status === "fulfilled" && salonRes.value.data.success) {
          setCurrentSalon(salonRes.value.data.salon);
        }
        
        const salonListRes = await api.get("/salon/all");
        if(salonListRes.data.success) {
          setSalons(salonListRes.data.salons);
        }

      } catch (err) {
        console.log("Auth session check completed with no active session.");
      } finally {
        // Stop the auth loading spinner logic, but the preloader handles the visuals
        setAuthLoading(false);
      }
    };
    checkAuth();
  }, []);

  const fetchActiveTicket = async () => {
      try {
          const { data } = await api.get("/queue/my-ticket");
          if(data.success && data.ticket) {
              setActiveTicket({
                  salonName: data.ticket.salonId.salonName,
                  number: data.ticket.queueNumber,
                  eta: data.ticket.totalTime,
                  status: data.ticket.status
              });
          }
      } catch (error) {
          console.log("No active ticket found.");
      }
  };

  const handleUserLoginSuccess = (userData) => {
    setCurrentUser(userData);
    fetchActiveTicket();
    showToast(`Welcome, ${userData.name}!`);
    navigate("/dashboard/user");
  };

  const handleRegisterSalon = async (formData) => {
    try {
        const { data } = await api.post("/salon/register", formData);
        if(data.success) {
            setCurrentSalon(data.salon);
            showToast("Registration successful! Welcome Partner.");
            navigate("/dashboard/salon");
        }
    } catch (error) {
        showToast(error.response?.data?.message || "Registration Failed", "error");
    }
  };

  const handleSalonLogin = async (credentials) => {
    try {
        const { data } = await api.post("/salon/login", credentials);
        if(data.success) {
            setCurrentSalon(data.salon);
            showToast("Salon Login Successful!");
            navigate("/dashboard/salon");
        }
    } catch (error) {
        showToast(error.response?.data?.message || "Login Failed", "error");
    }
  };

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
      await api.post("/salon/logout");
      
      setCurrentUser(null);
      setCurrentSalon(null);
      setActiveTicket(null);
      showToast("Logged out successfully");
      navigate("/");
    } catch (error) {
      showToast("Error logging out", "error");
    }
  };

  const handleAdminLogin = () => {
    localStorage.setItem("adminAuth", "true");
    showToast("Welcome Founder!");
    navigate("/admin/dashboard", { replace: true });
  };

  const handleAdminLogout = () => {
    localStorage.removeItem("adminAuth");
    showToast("Admin Logged Out");
    navigate("/admin/login", { replace: true });
  };

  const handleJoinQueue = (ticketData) => {
    if(activeTicket) {
      showToast("You are already in a queue!", "error");
      return;
    }
    showToast(`Request sent to ${ticketData.salonName}`);
    setActiveTicket({
      salonName: ticketData.salonName,
      number: ticketData.number,
      eta: ticketData.eta,
      status: ticketData.status
    });
  };

  const isDashboard = location.pathname.includes('dashboard') || location.pathname.includes('admin');

  return (
    <>
      {/* AESTHETIC PRELOADER OVERLAY 
        The AnimatePresence allows the "Exit" animation (sliding up) to finish 
        before the component is removed from DOM.
      */}
      <AnimatePresence mode="wait">
        {showPreloader && (
          <PremiumPreloader onLoadingComplete={() => setShowPreloader(false)} />
        )}
      </AnimatePresence>

      {/* APP CONTENT 
         We hide the content scroll while preloader is active, 
         but we render it so it's ready underneath the overlay.
      */}
      <div className={showPreloader ? "h-screen overflow-hidden" : ""}>
        
        {!showPreloader && toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
        
        {activeTicket && !isDashboard && !showPreloader && (
            <LiveTicket 
                ticket={activeTicket} 
                onCancel={() => {
                    setActiveTicket(null);
                }} 
            />
        )}

        <Routes>
            <Route path="/" element={
              <PublicRoute user={currentUser} salon={currentSalon} authLoading={authLoading}>
                <LandingPage
                  onNavigateUser={() => navigate("/register/user")}
                  onNavigateSalon={() => navigate("/register/salon")}
                  onNavigateAdmin={() => navigate("/admin/login")}
                  onNavigateLogin={() => navigate("/user/login")} 
                />
              </PublicRoute>
            } />

            <Route path="/user/login" element={
              <PublicRoute user={currentUser} salon={currentSalon} authLoading={authLoading}>
                <UserLogin 
                   onBack={() => navigate("/")}
                   onLogin={handleUserLoginSuccess} 
                   onNavigateSalonLogin={() => navigate("/salon/login")}
                />
              </PublicRoute>
            } />

            <Route path="/register/user" element={
              <PublicRoute user={currentUser} salon={currentSalon} authLoading={authLoading}>
                <UserRegistration
                  onBack={() => navigate("/")}
                  onRegisterUser={handleUserLoginSuccess} 
                  onNavigateLogin={() => navigate("/user/login")}
                />
              </PublicRoute>
            } />

            <Route path="/register/salon" element={
              <PublicRoute user={currentUser} salon={currentSalon} authLoading={authLoading}>
                <SalonRegistration
                  onBack={() => navigate("/")}
                  onRegister={handleRegisterSalon}
                  onNavigateLogin={() => navigate("/salon/login")} 
                />
              </PublicRoute>
            } />

            <Route path="/salon/login" element={
               <PublicRoute user={currentUser} salon={currentSalon} authLoading={authLoading}>
                <SalonLogin
                  onBack={() => navigate("/")}
                  onLogin={handleSalonLogin}
                  onNavigateRegister={() => navigate("/register/salon")}
                />
               </PublicRoute>
            } />

            <Route path="/dashboard/user" element={
              <ProtectedRoute user={currentUser} authLoading={authLoading}>
                  <UserDashboard
                    user={currentUser}
                    onLogout={handleLogout}
                    salons={salons} 
                    onJoinQueue={handleJoinQueue}
                    onProfileClick={() => navigate("/dashboard/user/profile")}
                    onReferralClick={() => navigate("/dashboard/user/referrals")} 
                  />
              </ProtectedRoute>
            } />

            <Route path="/dashboard/user/profile" element={
              <ProtectedRoute user={currentUser} authLoading={authLoading}>
                <UserProfile 
                  user={currentUser} 
                  onBack={() => navigate("/dashboard/user")} 
                  onLogout={handleLogout}
                />
              </ProtectedRoute>
            } />

            <Route path="/dashboard/user/referrals" element={
              <ProtectedRoute user={currentUser} authLoading={authLoading}>
                <ReferralPage 
                  user={currentUser} 
                  onBack={() => navigate("/dashboard/user")} 
                />
              </ProtectedRoute>
            } />

            <Route path="/dashboard/salon" element={
              authLoading ? null : (currentSalon ? (
                <SalonDashboard
                  salon={currentSalon} 
                  onLogout={handleLogout}
                />
              ) : (
                <Navigate to="/salon/login" replace />
              ))
            } />

            <Route path="/admin/login" element={
              <AdminPublicRoute>
                <AdminLogin 
                  onBack={() => navigate("/")}
                  onLogin={handleAdminLogin}
                />
              </AdminPublicRoute>
            } />

            <Route path="/admin/dashboard" element={
              <ProtectedAdminRoute>
                <AdminDashboard 
                  onLogout={handleAdminLogout}
                />
              </ProtectedAdminRoute>
            } />
        </Routes>
      </div>
    </>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}