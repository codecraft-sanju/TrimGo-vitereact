"use client";
import React, { useState, useEffect, useRef } from "react";
import { BrowserRouter, Routes, Route, useNavigate, useLocation, Navigate } from "react-router-dom";
import {
  MapPin, Scissors, Bell, Ticket, X, CheckCircle, Sparkles,
  BarChart3, Zap, ShieldCheck, ArrowRight
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

/* ---------------------------------
   INITIAL DATA 
---------------------------------- */
const INITIAL_SALON_DATA = [
  { id: 1, name: "Urban Cut Pro", area: "Shastri Nagar", city: "Jodhpur", distance: "1.2 km", waiting: 3, eta: 15, rating: 4.8, reviews: 321, tag: "Fastest nearby", price: "₹₹", type: "Unisex", verified: true, revenue: 15400 },
  { id: 2, name: "The Royal Cut Studio", area: "Ratanada", city: "Jodhpur", distance: "2.0 km", waiting: 9, eta: 45, rating: 4.5, reviews: 189, tag: "Most booked", price: "₹₹₹", type: "Men Only", verified: true, revenue: 8900 },
  { id: 3, name: "Fade & Blade Men’s Salon", area: "Sardarpura", city: "Jodhpur", distance: "0.9 km", waiting: 1, eta: 5, rating: 4.9, reviews: 412, tag: "Low waiting now", price: "₹₹", type: "Men Only", verified: true, revenue: 21000 },
  { id: 4, name: "Glow & Glam Unisex Salon", area: "Civil Lines", city: "Jodhpur", distance: "3.4 km", waiting: 6, eta: 30, rating: 4.3, reviews: 102, tag: "Family friendly", price: "₹₹", type: "Women Only", verified: false, revenue: 3200 },
];

const INITIAL_USERS = [
  { id: 101, name: "Suresh Raina", email: "suresh@example.com", joined: "2025-10-12", status: "Active" },
  { id: 102, name: "Rohit Sharma", email: "rohit@example.com", joined: "2025-11-05", status: "Active" },
  { id: 103, name: "Virat Kohli", email: "virat@example.com", joined: "2025-11-28", status: "Active" },
];

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
   UI HELPER COMPONENTS (Missing Fixed Here)
---------------------------------- */

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
    }, 2000);
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
            <div className="text-2xl font-black text-emerald-400">#{ticket.number}</div>
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

// 3. Infinite Marquee (THIS WAS MISSING)
const InfiniteMarquee = () => {
  const logos = ["Glamour Zone", "The Barber", "Hair Masters", "Trimmed", "Urban Cut"];
  return (
    <div className="w-full overflow-hidden bg-white/50 backdrop-blur-sm py-10 border-y border-zinc-200/50 relative">
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

// 4. Feature Card (THIS WAS MISSING)
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

// 5. Landing Page
const LandingPage = ({ onNavigateUser, onNavigateSalon, onNavigateAdmin, onNavigateLogin }) => {
  return (
    <div className="min-h-screen w-full font-sans selection:bg-zinc-900 selection:text-white overflow-x-hidden bg-zinc-50">
      <BackgroundAurora />
      <NoiseOverlay />
      <Navbar onNavigateUser={onNavigateUser} onNavigateLogin={onNavigateLogin} />
      <HeroSection onNavigateUser={onNavigateUser} onNavigateSalon={onNavigateSalon} />
      <InfiniteMarquee />
      <div id="advanced"><AdvancedDashboardSection /></div>
      <section id="features" className="pt-8 pb-32 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-black text-zinc-900 mb-6">Built for the Modern Era.</h2>
          <p className="text-zinc-500 text-xl max-w-2xl mx-auto">We didn't just digitize the queue. We reinvented the entire salon experience for both customers and businesses.</p>
        </div>
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

// 1. ProtectedRoute: For Logged In Users Only
const ProtectedRoute = ({ user, children }) => {
  if (!user) {
    return <Navigate to="/user/login" replace />;
  }
  return children;
};

// 2. PublicRoute: For Guests
const PublicRoute = ({ user, salon, children }) => {
  if (user) return <Navigate to="/dashboard/user" replace />;
  if (salon) return <Navigate to="/dashboard/salon" replace />;
  return children;
};

// 3. ProtectedAdminRoute: Admin Only
const ProtectedAdminRoute = ({ children }) => {
  const isAdminLoggedIn = localStorage.getItem("adminAuth") === "true";
  if (!isAdminLoggedIn) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
};

// 4. AdminPublicRoute: If Admin logged in, goto Dashboard
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
      
  const [salons, setSalons] = useState(INITIAL_SALON_DATA);
  const [users, setUsers] = useState(INITIAL_USERS);
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

  // CHECK AUTH ON APP LOAD
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userRes = await api.get("/auth/me");
        if (userRes.data.success) {
          setCurrentUser(userRes.data.user);
          setAuthLoading(false);
          return;
        }
      } catch (err) {}

      try {
        const salonRes = await api.get("/salon/me");
        if (salonRes.data.success) {
          setCurrentSalon(salonRes.data.salon);
        }
      } catch (err) {} 
      finally {
        setAuthLoading(false);
      }
    };
    checkAuth();
  }, []);

  // --- HANDLERS ---

  const handleUserLoginSuccess = (userData) => {
    setCurrentUser(userData);
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
      showToast("Logged out successfully");
      navigate("/");
    } catch (error) {
      showToast("Error logging out", "error");
    }
  };

  // --- ADMIN HANDLERS ---

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

  const handleJoinQueue = (salon) => {
    if(activeTicket) {
      showToast("You are already in a queue!", "error");
      return;
    }
    showToast(`Joined queue for ${salon.name}`);
    setActiveTicket({
      salonName: salon.name,
      number: salon.waiting + 1,
      eta: salon.eta
    });
  };

  const isDashboard = location.pathname.includes('dashboard') || location.pathname.includes('admin');

  if (authLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 font-sans">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-zinc-900"></div>
    </div>
  );

  return (
    <>
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      
      {activeTicket && !isDashboard && (
        <LiveTicket ticket={activeTicket} onCancel={() => setActiveTicket(null)} />
      )}

      <Routes>
        {/* --- PUBLIC ROUTES --- */}
        <Route path="/" element={
          <PublicRoute user={currentUser} salon={currentSalon}>
            <LandingPage
              onNavigateUser={() => navigate("/register/user")}
              onNavigateSalon={() => navigate("/register/salon")}
              onNavigateAdmin={() => navigate("/admin/login")}
              onNavigateLogin={() => navigate("/user/login")} 
            />
          </PublicRoute>
        } />

        <Route path="/user/login" element={
          <PublicRoute user={currentUser} salon={currentSalon}>
            <UserLogin 
               onBack={() => navigate("/")}
               onLogin={handleUserLoginSuccess} 
               onNavigateSalonLogin={() => navigate("/salon/login")}
            />
          </PublicRoute>
        } />

        <Route path="/register/user" element={
          <PublicRoute user={currentUser} salon={currentSalon}>
            <UserRegistration
              onBack={() => navigate("/")}
              onRegisterUser={handleUserLoginSuccess} 
            />
          </PublicRoute>
        } />

        <Route path="/register/salon" element={
          <PublicRoute user={currentUser} salon={currentSalon}>
            <SalonRegistration
              onBack={() => navigate("/")}
              onRegister={handleRegisterSalon}
              onNavigateLogin={() => navigate("/salon/login")} 
            />
          </PublicRoute>
        } />

        <Route path="/salon/login" element={
           <PublicRoute user={currentUser} salon={currentSalon}>
            <SalonLogin
              onBack={() => navigate("/")}
              onLogin={handleSalonLogin}
              onNavigateRegister={() => navigate("/register/salon")}
            />
           </PublicRoute>
        } />

        {/* --- DASHBOARD ROUTES --- */}
        <Route path="/dashboard/user" element={
          <ProtectedRoute user={currentUser}>
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
          <ProtectedRoute user={currentUser}>
            <UserProfile 
              user={currentUser} 
              onBack={() => navigate("/dashboard/user")} 
              onLogout={handleLogout}
            />
          </ProtectedRoute>
        } />

        <Route path="/dashboard/salon" element={
          currentSalon ? (
            <SalonDashboard
              salon={currentSalon} 
              onLogout={handleLogout}
            />
          ) : (
            <Navigate to="/salon/login" replace />
          )
        } />

        {/* --- ADMIN ROUTES --- */}
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
              salons={salons}
              setSalons={setSalons} 
              users={users}
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