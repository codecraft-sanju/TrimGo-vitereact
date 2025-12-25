import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useNavigate, useLocation, Navigate } from "react-router-dom";
import { Bell, Ticket, X, CheckCircle, Sparkles, Scissors } from "lucide-react";

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
import ReferralPage from "./components/ReferralPage"; // --- NEW IMPORT ---

// 0. Premium Advanced Preloader (Global)
const PremiumPreloader = () => {
  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);
  
  const messages = [
    "Initializing TrimGo...",
    "Finding nearby salons...",
    "Sharpening blades...",
    "Calculating wait times...",
    "Polishing mirrors...",
    "Getting things ready..."
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress === 100) {
          clearInterval(timer);
          return 100;
        }
        const diff = Math.random() * 10;
        return Math.min(oldProgress + diff, 100);
      });
    }, 200);

    const msgTimer = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 800);

    return () => {
      clearInterval(timer);
      clearInterval(msgTimer);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-zinc-50 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[30%] -left-[10%] w-[70%] h-[70%] rounded-full bg-blue-400/10 blur-[120px] animate-pulse"></div>
        <div className="absolute -bottom-[30%] -right-[10%] w-[70%] h-[70%] rounded-full bg-emerald-400/10 blur-[120px] animate-pulse"></div>
        <NoiseOverlay />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        <div className="relative mb-8 group">
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-500 to-emerald-500 rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500 animate-pulse"></div>
          <div className="relative w-24 h-24 bg-white rounded-3xl shadow-2xl border border-zinc-100 flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-50 to-zinc-100 opacity-50"></div>
            <Scissors 
              size={40} 
              className="text-zinc-900 relative z-10 animate-[spin_4s_linear_infinite_reverse]" 
              strokeWidth={1.5}
            />
          </div>
        </div>

        <h1 className="text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-zinc-900 via-zinc-600 to-zinc-900 bg-[length:200%_auto] animate-[shimmer_3s_linear_infinite] mb-2">
          TrimGo
        </h1>

        <div className="h-6 overflow-hidden mb-8">
          <p className="text-zinc-400 text-sm font-medium tracking-wide animate-[slideUpFade_0.5s_ease-out] key={messageIndex}">
            {messages[messageIndex]}
          </p>
        </div>

        <div className="w-64 h-1.5 bg-zinc-200 rounded-full overflow-hidden relative">
          <div 
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-300 ease-out rounded-full"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute top-0 right-0 h-full w-20 bg-gradient-to-r from-transparent to-white/50 blur-[2px]"></div>
          </div>
        </div>
        
        <p className="mt-2 text-[10px] text-zinc-300 font-bold uppercase tracking-widest">
          {Math.round(progress)}% Loaded
        </p>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        @keyframes slideUpFade {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

// 1. Toast Notification
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

// 2. Live Ticket Widget
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
        setTimeout(() => {
            setAuthLoading(false);
        }, 2000);
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

  if (authLoading) return <PremiumPreloader />;

  return (
    <>
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      
      {activeTicket && !isDashboard && (
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
               onReferralClick={() => navigate("/dashboard/user/referrals")} // --- Updated ---
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

        {/* --- NEW REFERRAL PAGE ROUTE --- */}
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