import React, { useState, useEffect, useRef } from "react";
import { BrowserRouter, Routes, Route, useNavigate, useLocation, Navigate } from "react-router-dom";
import {
  MapPin, Scissors, Bell, Ticket, X, CheckCircle, Sparkles,
  BarChart3, Zap, ShieldCheck, ArrowRight, Loader2
} from "lucide-react";

// --- API & COMPONENTS IMPORTS ---
import api from "./utils/api";
import { SalonRegistration, SalonLogin } from "./components/SalonRegistration";
import UserRegistration from "./components/UserRegistration";
import UserLogin from "./components/UserLogin"; 
import { UserProfile } from "./components/UserProfile";
import { AdminLogin, AdminDashboard } from "./components/AdminDashboard";
import Testimonials from "./components/Testimonials";
import HeroSection from "./components/HeroSection";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import SalonDashboard from "./components/SalonDashboard";
import UserDashboard from "./components/UserDashboard";
import { BackgroundAurora, NoiseOverlay } from "./components/SharedUI";
import AdvancedDashboardSection from "./components/AdvancedDashboardSection"; 
import RewardsSection from "./components/RewardsSection";

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
   UI HELPER COMPONENTS 
---------------------------------- */

// 0. Premium Advanced Preloader
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

// NEW: Custom Magnetic Cursor 🖱️✨
const CustomCursor = () => {
  const cursorRef = useRef(null);
  const followerRef = useRef(null);

  useEffect(() => {
    // Hide default cursor only if not touch device
    if (matchMedia('(pointer: coarse)').matches) return;

    const cursor = cursorRef.current;
    const follower = followerRef.current;

    let posX = 0, posY = 0;
    let mouseX = 0, mouseY = 0;

    const moveCursor = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      // Instant movement for the dot
      if (cursor) {
        cursor.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
      }

      const target = e.target;
      
      // 1. Check if hovering over clickable elements
      const isClickable = target.closest('a, button, input, textarea, .cursor-pointer');
      
      // 2. Check if hovering over a dark background section
      const isDarkSection = target.closest('.dark-theme-area');

      if (follower && cursor) {
        // Handle Hover State (Size)
        if (isClickable) {
          follower.classList.add('is-hovering');
        } else {
          follower.classList.remove('is-hovering');
        }

        // Handle Dark Theme State (Color)
        if (isDarkSection) {
          cursor.classList.add('is-dark-mode');
          follower.classList.add('is-dark-mode');
        } else {
          cursor.classList.remove('is-dark-mode');
          follower.classList.remove('is-dark-mode');
        }
      }
    };

    window.addEventListener('mousemove', moveCursor);

    // Smooth physics loop for the follower ring
    const loop = () => {
      if (follower) {
        // Lerp (Linear Interpolation) for smooth delay
        posX += (mouseX - posX) * 0.1;
        posY += (mouseY - posY) * 0.1;
        follower.style.transform = `translate3d(${posX - 12}px, ${posY - 12}px, 0)`; // -12 to center the 24px ring
      }
      requestAnimationFrame(loop);
    };
    loop();

    return () => {
      window.removeEventListener('mousemove', moveCursor);
    };
  }, []);

  // Don't render on touch devices
  if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(pointer: coarse)').matches) {
    return null;
  }

  return (
    <>
      <style>{`
        .cursor-dot, .cursor-follower {
          position: fixed;
          top: 0;
          left: 0;
          pointer-events: none;
          z-index: 9999;
          border-radius: 50%;
          transition: width 0.3s, height 0.3s, background-color 0.3s, border-color 0.3s; /* Added color transition */
        }
        
        /* DEFAULT (LIGHT THEME) STATE */
        .cursor-dot {
          width: 8px;
          height: 8px;
          background-color: #18181b; /* Zinc-900 */
          margin-top: -4px;
          margin-left: -4px;
        }
        .cursor-follower {
          width: 32px;
          height: 32px;
          background-color: rgba(24, 24, 27, 0.1);
          border: 1px solid rgba(24, 24, 27, 0.2);
        }

        /* HOVER STATE */
        .cursor-follower.is-hovering {
          width: 64px;
          height: 64px;
          background-color: rgba(59, 130, 246, 0.1); /* Blue tint */
          border-color: rgba(59, 130, 246, 0.3);
          transform: translate3d(calc(var(--x) - 32px), calc(var(--y) - 32px), 0) !important;
          margin-left: -16px; 
          margin-top: -16px;
        }

        /* --- NEW: DARK MODE STATE (WHITE CURSOR) --- */
        .cursor-dot.is-dark-mode {
            background-color: #ffffff !important;
        }
        
        .cursor-follower.is-dark-mode {
            background-color: rgba(255, 255, 255, 0.1) !important;
            border-color: rgba(255, 255, 255, 0.5) !important;
        }

        /* DARK MODE + HOVER COMBINATION */
        .cursor-follower.is-dark-mode.is-hovering {
            background-color: rgba(255, 255, 255, 0.2) !important;
            border-color: #ffffff !important;
        }

      `}</style>
      <div ref={cursorRef} className="cursor-dot hidden md:block"></div>
      <div ref={followerRef} className="cursor-follower hidden md:block"></div>
    </>
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

// 3. Infinite Marquee 
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

// 4. Feature Card 
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

// 5. Landing Page (UPDATED WITH CURSOR)
const LandingPage = ({ onNavigateUser, onNavigateSalon, onNavigateAdmin, onNavigateLogin }) => {
  return (
    // 'cursor-none' class hides the default cursor
    <div className="min-h-screen w-full font-sans selection:bg-zinc-900 selection:text-white overflow-x-hidden bg-zinc-50 cursor-none">
      <CustomCursor /> {/* Added Custom Cursor Here */}
      <BackgroundAurora />
      <NoiseOverlay />
      <Navbar onNavigateUser={onNavigateUser} onNavigateLogin={onNavigateLogin} />
      <HeroSection onNavigateUser={onNavigateUser} onNavigateSalon={onNavigateSalon} />
      <InfiniteMarquee />
      
      {/* Dashboard Section */}
      <div id="advanced"><AdvancedDashboardSection /></div>
      <RewardsSection />
      
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
  const [users, setUsers] = useState([]);
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