import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useNavigate, useLocation, Navigate } from "react-router-dom";
import { Bell, Ticket, X, CheckCircle, Sparkles, Scissors } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion"; // --- NEW IMPORT ---

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
// 0. AESTHETIC & RESPONSIVE PRELOADER (GSAP Style)
// ----------------------------------------------------------------------
const PremiumPreloader = ({ onLoadingComplete }) => {
  const [count, setCount] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Handle window resize for perfect icon sizing
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const duration = 2200; // Duration of the loading experience
    const steps = 100;
    const intervalTime = duration / steps;

    const timer = setInterval(() => {
      setCount((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          // Wait a split second at 100% before triggering the exit
          setTimeout(onLoadingComplete, 600); 
          return 100;
        }
        // Randomize increment for "organic" feel
        return Math.min(prev + Math.floor(Math.random() * 5) + 1, 100);
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [onLoadingComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ y: "-100%", transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] } }}
      className="fixed inset-0 z-[9999] bg-zinc-950 text-white flex flex-col items-center justify-center overflow-hidden px-4"
    >
      {/* Background Ambience */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <NoiseOverlay /> 
      </div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-emerald-500/20 blur-[80px] md:blur-[120px] rounded-full animate-pulse" />

      {/* Main Content Container */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-4xl">
        
        {/* Animated Logo Section - Fully Responsive */}
        <div className="relative flex flex-row items-center justify-center gap-2 md:gap-6 mb-8 md:mb-12">
          
          {/* TRIM */}
          <motion.div
            initial={{ x: -40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <h1 className="text-5xl sm:text-7xl md:text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-500">
              TRIM
            </h1>
          </motion.div>

          {/* Scissor Icon */}
          <motion.div 
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 1.2, type: "spring", bounce: 0.5 }}
            className="text-emerald-400 flex items-center justify-center"
          >
            <Scissors 
              size={isMobile ? 32 : 80} 
              strokeWidth={1.5} 
              className="w-8 h-8 sm:w-16 sm:h-16 md:w-24 md:h-24" 
            />
          </motion.div>

          {/* GO */}
          <motion.div
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <h1 className="text-5xl sm:text-7xl md:text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-500">
              GO
            </h1>
          </motion.div>
        </div>

        {/* Loading Bar - Responsive Width */}
        <div className="w-[85%] max-w-[400px] relative">
          <div className="flex justify-between text-[10px] md:text-xs font-medium text-zinc-500 uppercase tracking-[0.2em] mb-2">
            <span>Loading Assets</span>
            <span>{count}%</span>
          </div>
          <div className="h-[2px] w-full bg-zinc-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-emerald-500 to-blue-500"
              initial={{ width: 0 }}
              animate={{ width: `${count}%` }}
              transition={{ ease: "linear" }}
            />
          </div>
        </div>

        {/* Tagline */}
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: count > 60 ? 1 : 0, y: count > 60 ? 0 : 20 }}
          className="absolute bottom-[-60px] md:bottom-[-80px] text-zinc-600 text-[10px] md:text-xs tracking-[0.3em] uppercase text-center w-full"
        >
          Look Good • Feel Good
        </motion.p>
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
        // We set authLoading to false, but the Preloader stays up until its animation finishes
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
        Using AnimatePresence so it can play the 'exit' animation (curtain slide up) 
        before removing itself from the DOM.
      */}
      <AnimatePresence>
        {showPreloader && (
          <PremiumPreloader onLoadingComplete={() => setShowPreloader(false)} />
        )}
      </AnimatePresence>

      {/* APP CONTENT 
        We render this immediately so it's ready "behind the curtain".
        We only hide it if authLoading is true to prevent premature redirects
        inside the Protected/Public routes.
      */}
      
      {!showPreloader && toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      
      {activeTicket && !isDashboard && !showPreloader && (
        <LiveTicket 
            ticket={activeTicket} 
            onCancel={() => {
                setActiveTicket(null);
            }} 
        />
      )}

      {/* The Routes are always rendered, but Protected/Public Routes check authLoading inside them */}
      <div className={showPreloader ? "hidden" : "block"}>
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