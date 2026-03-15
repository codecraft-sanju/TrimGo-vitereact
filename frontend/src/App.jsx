import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useNavigate, useLocation, Navigate } from "react-router-dom";
import { Bell, Ticket, X, CheckCircle, Sparkles, Scissors, Clock } from "lucide-react";
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "framer-motion";
import toast, { Toaster } from 'react-hot-toast';

// --- API & COMPONENTS IMPORTS ---
import api from "./utils/api";
import LegalLayout from "./components/LegalPages";
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
import UpdateNotification from "./components/UpdateNotification";

// ----------------------------------------------------------------------
// OPTIMIZED PREMIUM PRELOADER
// ----------------------------------------------------------------------
const PremiumPreloader = ({ onLoadingComplete, dataLoaded }) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    const controls = animate(count, 85, { duration: 10, ease: "circOut" });

    if (dataLoaded) {
      controls.stop(); 
      animate(count, 100, {
        duration: 0.8,
        ease: "easeInOut",
        onComplete: () => {
          setIsFinished(true);
          setTimeout(onLoadingComplete, 600); 
        }
      });
    }

    return () => controls.stop();
  }, [dataLoaded, count, onLoadingComplete]);

  const letterVariants = {
    hidden: { y: 100, opacity: 0 },
    visible: (i) => ({
      y: 0,
      opacity: 1,
      transition: {
        delay: i * 0.05,
        duration: 0.8,
        ease: [0.215, 0.61, 0.355, 1],
      },
    }),
  };

  return (
    <motion.div
      initial={{ y: 0 }}
      exit={{ y: "-100%", transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] } }}
      className="fixed inset-0 z-[9999] bg-neutral-950 text-white flex flex-col justify-between p-6 md:p-12 overflow-hidden"
    >
      <div className="hidden md:block absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay">
        <div className="w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
      </div>

      <div className="w-full flex justify-between items-start z-10 opacity-60">
        <span className="text-xs md:text-sm font-light tracking-[0.2em] uppercase">Est. 2026</span>
        <Scissors size={20} className="animate-spin-slow opacity-80" strokeWidth={1} />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center h-full">
        <div className="overflow-hidden flex items-center justify-center">
          {["T", "R", "I", "M", "G", "O"].map((char, index) => (
            <motion.span
              key={index}
              custom={index}
              variants={letterVariants}
              initial="hidden"
              animate="visible"
              className="text-6xl sm:text-8xl md:text-[10rem] font-black tracking-tighter leading-none bg-clip-text text-transparent bg-gradient-to-b from-white via-neutral-200 to-neutral-600"
            >
              {char}
            </motion.span>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="mt-4 md:mt-8 overflow-hidden"
        >
          <p className="text-[10px] md:text-sm font-medium tracking-[0.4em] text-neutral-500 uppercase text-center">
            Queue Management System
          </p>
        </motion.div>
      </div>

      <div className="w-full z-10">
        <div className="flex justify-between items-end mb-4">
          <div className="flex flex-col">
            <span className="text-[10px] md:text-xs text-neutral-500 uppercase tracking-widest mb-1">Status</span>
            <span className="text-sm font-medium text-emerald-400">
              {!isFinished ? (dataLoaded ? "Finalizing..." : "Loading resources...") : "Ready"}
            </span>
          </div>

          <div className="flex items-baseline text-6xl md:text-8xl font-thin tracking-tighter leading-none text-white">
            <motion.span>{rounded}</motion.span>
            <span className="text-2xl md:text-4xl text-neutral-600 font-normal">%</span>
          </div>
        </div>

        <div className="w-full h-[1px] bg-neutral-800 relative overflow-hidden">
          <motion.div
            className="absolute top-0 left-0 h-full bg-white"
            style={{ width: useTransform(count, (value) => `${value}%`) }}
          />
        </div>
      </div>
    </motion.div>
  );
};

// ----------------------------------------------------------------------
// 2. Live Ticket Widget (WITH REAL-TIME COUNTDOWN)
// ----------------------------------------------------------------------
const LiveTicket = ({ ticket, onCancel }) => {
  const [timeLeftStr, setTimeLeftStr] = useState("");

  useEffect(() => {
    if (!ticket) return;

    const updateTimer = () => {
      // Agar backend se exact time nahi aaya toh fallback old ETA (minutes)
      if (!ticket.expectedStartTime) {
          setTimeLeftStr(`${ticket.eta}m`);
          return;
      }

      const now = new Date().getTime();
      const expectedStart = new Date(ticket.expectedStartTime).getTime();
      
      const diffInSeconds = Math.floor((expectedStart - now) / 1000);

      if (diffInSeconds <= 0) {
        setTimeLeftStr("00:00");
      } else {
        const m = Math.floor(diffInSeconds / 60);
        const s = diffInSeconds % 60;
        setTimeLeftStr(`${m}:${s < 10 ? '0' : ''}${s}`);
      }
    };

    updateTimer(); // Initial call
    const intervalId = setInterval(updateTimer, 1000); // Har second update

    return () => clearInterval(intervalId);
  }, [ticket]);

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
          
          {/* Hide Cancel button if status is serving */}
          {ticket.status !== 'serving' && (
             <button onClick={onCancel} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition"><X size={16} /></button>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white/5 rounded-2xl p-3 text-center border border-white/5">
            {/* --- UX FIX START --- */}
            <div className={`text-2xl font-black ${ticket.status === 'serving' ? 'text-emerald-400' : (timeLeftStr === "00:00" ? 'text-amber-400' : 'text-white')}`}>
                {ticket.status === 'serving' ? 'Now' : (timeLeftStr === "00:00" ? 'Soon' : timeLeftStr)}
            </div>
            <div className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">
                {ticket.status === 'serving' ? 'In Progress' : (timeLeftStr === "00:00" ? 'Next in Line' : 'Est. Wait')}
            </div>
            {/* --- UX FIX END --- */}
          </div>
          <div className="bg-white/5 rounded-2xl p-3 text-center border border-white/5">
            <div className="text-2xl font-black text-emerald-400">
                {ticket.status === 'serving' ? 'Chair' : `#${ticket.number || "-"}`}
            </div>
            <div className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">
                {ticket.status === 'serving' ? 'Serving' : 'Your Position'}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-zinc-500 bg-black/20 p-2 rounded-lg">
          <span className="flex items-center gap-1"><Sparkles size={12} className="text-yellow-400" /> AI calculating speed</span>
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

// --- CHANGED START ---
const ProtectedAdminRoute = ({ children }) => {
  const hasToken = !!localStorage.getItem("adminToken");
  if (!hasToken) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
};

const AdminPublicRoute = ({ children }) => {
  const hasToken = !!localStorage.getItem("adminToken");
  if (hasToken) {
    return <Navigate to="/admin/dashboard" replace />;
  }
  return children;
};
// --- CHANGED END ---

/* ---------------------------------
   MAIN APP CONTENT
---------------------------------- */

const AppContent = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [salons, setSalons] = useState([]);
  const [activeTicket, setActiveTicket] = useState(null);

  // AUTH STATES
  const [currentUser, setCurrentUser] = useState(null);
  const [currentSalon, setCurrentSalon] = useState(null);

  // Important: We start with authLoading TRUE
  const [authLoading, setAuthLoading] = useState(true);

  // PRELOADER STATE
  const [showPreloader, setShowPreloader] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const [userRes, salonRes] = await Promise.allSettled([
          api.get("/auth/me"),
          api.get("/salon/me")
        ]);

        if (userRes.status === "fulfilled" && userRes.value.data.success) {
          setCurrentUser(userRes.value.data.user);
          // Fetch ticket immediately if user exists
          try {
            const { data } = await api.get("/queue/my-ticket");
            if (data.success && data.ticket) {
              setActiveTicket({
                salonName: data.ticket.salonId.salonName,
                number: data.ticket.queueNumber,
                eta: data.ticket.totalTime,
                expectedStartTime: data.ticket.expectedStartTime, // 🔥 Added expected start time
                status: data.ticket.status
              });
            }
          } catch (e) { console.log("No ticket"); }
        }

        if (salonRes.status === "fulfilled" && salonRes.value.data.success) {
          setCurrentSalon(salonRes.value.data.salon);
        }

        // Load Salons quietly
        const salonListRes = await api.get("/salon/all");
        if (salonListRes.data.success) {
          setSalons(salonListRes.data.salons);
        }

      } catch (err) {
        console.log("Auth session check completed with no active session.");
      } finally {
        // DATA LOADED SIGNAL
        setAuthLoading(false);
      }
    };
    checkAuth();
  }, []);

  const handleUserLoginSuccess = (userData) => {
    setCurrentUser(userData);
    navigate("/dashboard/user");
  };

  const handleRegisterSalon = async (formData) => {
    try {
      const { data } = await api.post("/salon/register", formData);
      if (data.success) {
        if (data.phone) {
          toast.success("OTP sent to your WhatsApp number!");
          return { success: true, requiresOtp: true, phone: data.phone };
        } else {
          setCurrentSalon(data.salon);
          toast.success("Registration successful! Welcome Partner.");
          navigate("/dashboard/salon");
          return { success: true, requiresOtp: false };
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration Failed");
      return { success: false };
    }
  };

  const handleVerifySalonOtp = async (phone, otp) => {
    try {
      const { data } = await api.post("/salon/verify-otp", { phone, otp });
      if (data.success) {
        setCurrentSalon(data.salon);
        toast.success("Salon verified successfully! Welcome to TrimGo.");
        navigate("/dashboard/salon");
        return { success: true };
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid OTP");
      return { success: false };
    }
  };

  const handleSalonLogin = async (credentials) => {
    try {
      const { data } = await api.post("/salon/login", credentials);
      if (data.success) {
        setCurrentSalon(data.salon);
        toast.success("Salon Login Successful!");
        navigate("/dashboard/salon");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Login Failed");
    }
  };

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
      await api.post("/salon/logout");

      setCurrentUser(null);
      setCurrentSalon(null);
      setActiveTicket(null);
      toast.success("Logged out successfully");
      navigate("/");
    } catch (error) {
      toast.error("Error logging out");
    }
  };

  // --- CHANGED START ---
  const handleAdminLogin = (token) => {
    localStorage.setItem("adminToken", token);
    toast.success("Welcome Founder!");
    navigate("/admin/dashboard", { replace: true });
  };

  const handleAdminLogout = () => {
    localStorage.removeItem("adminToken");
    toast.success("Admin Logged Out");
    navigate("/admin/login", { replace: true });
  };
  // --- CHANGED END ---

  const handleJoinQueue = (ticketData) => {
    if (activeTicket) {
      toast.error("You are already in a queue!");
      return;
    }
    toast.success(`Request sent to ${ticketData.salonName}`);
    setActiveTicket({
      salonName: ticketData.salonName,
      number: ticketData.number,
      eta: ticketData.eta,
      expectedStartTime: ticketData.expectedStartTime, // 🔥 Setting expected start time on join
      status: ticketData.status
    });
  };

  const isDashboard = location.pathname.includes('dashboard') || location.pathname.includes('admin');

  return (
    <>
      <UpdateNotification />

      <AnimatePresence mode="wait">
        {showPreloader && (
          <PremiumPreloader
            dataLoaded={!authLoading}
            onLoadingComplete={() => setShowPreloader(false)}
          />
        )}
      </AnimatePresence>

      <div className={showPreloader ? "h-screen overflow-hidden" : "min-h-screen bg-neutral-50"}>

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
                onVerifyOtp={handleVerifySalonOtp}
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
          
          <Route path="/legal/privacy" element={<LegalLayout type="privacy" />} />
          <Route path="/legal/terms" element={<LegalLayout type="terms" />} />
          <Route path="/legal/refund" element={<LegalLayout type="refund" />} />

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
      <Toaster position="top-center" reverseOrder={false} />
      <AppContent />
    </BrowserRouter>
  );
}