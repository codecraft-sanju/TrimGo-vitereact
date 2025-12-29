import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  User, MapPin, Calendar, CreditCard, Settings, LogOut, Camera,
  Edit3, Star, Clock, ChevronRight, Shield, Bell, Smartphone,
  History, Wallet, Zap, Crown, Grid, CheckCircle, X, Mail, Phone,
  AlertTriangle, Info, ArrowLeft, MoreHorizontal
} from "lucide-react";
import api from "../utils/api";

// --- ⚡ MOCK DATA ---
const SAVED_CARDS = [
  { id: 1, type: "Visa", last4: "4242", expiry: "12/28", holder: "Sanjay Choudhary", color: "from-zinc-900 to-zinc-800" },
  { id: 2, type: "Mastercard", last4: "8899", expiry: "09/26", holder: "Sanjay Choudhary", color: "from-indigo-600 to-purple-600" },
];

// --- 🎨 CUSTOM STYLES FOR SCROLL & ANIMATION ---
const GlobalStyles = () => (
  <style>{`
    /* Hide Scrollbar but keep functionality */
    .scrollbar-hide::-webkit-scrollbar { display: none; }
    .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
    
    /* Smooth Fade Up Animation */
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-up {
      animation: fadeUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    
    /* Glassmorphism Utilities */
    .glass-panel {
      background: rgba(255, 255, 255, 0.7);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.5);
    }
  `}</style>
);

// --- 🌅 BACKGROUND ---
const BackgroundAurora = () => (
  <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[#fafafa]">
    <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-indigo-200/20 rounded-full blur-[100px]" />
    <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-purple-200/20 rounded-full blur-[100px]" />
    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-soft-light"></div>
  </div>
);

// --- 🧩 COMPONENTS ---

const Header = ({ onBack, onLogout, scrolled }) => (
  <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? 'py-2' : 'py-4'}`}>
    <div className="px-4 max-w-5xl mx-auto">
      <div className={`flex items-center justify-between rounded-full transition-all duration-300 ${
        scrolled 
          ? 'bg-white/90 backdrop-blur-md shadow-sm border border-zinc-200/50 p-2' 
          : 'bg-transparent p-0'
      }`}>
        <button 
          onClick={onBack} 
          className={`p-2.5 rounded-full transition-colors ${scrolled ? 'bg-zinc-100' : 'bg-white shadow-sm border border-white/50'}`}
        >
          <ArrowLeft size={20} className="text-zinc-700" />
        </button>

        <div className={`flex items-center gap-3 transition-opacity duration-300 ${scrolled ? 'opacity-100' : 'opacity-0'}`}>
          <span className="font-bold text-zinc-800 text-sm">My Profile</span>
        </div>

        <button 
          onClick={onLogout} 
          className={`p-2.5 rounded-full transition-colors ${scrolled ? 'bg-red-50 text-red-500' : 'bg-white text-red-500 shadow-sm border border-white/50'}`}
        >
          <LogOut size={18} />
        </button>
      </div>
    </div>
  </header>
);

const StatCard = ({ icon: Icon, label, value, color, bg }) => (
  <div className="bg-white border border-zinc-100 p-4 rounded-2xl flex items-center gap-4 relative overflow-hidden group active:scale-[0.98] transition-transform duration-200">
    <div className={`w-12 h-12 rounded-xl ${bg} ${color} flex items-center justify-center relative z-10`}>
      <Icon size={20} />
    </div>
    <div className="relative z-10">
      <p className="text-zinc-400 text-[10px] uppercase font-bold tracking-wider">{label}</p>
      <p className="text-lg font-bold text-zinc-900 leading-tight">{value}</p>
    </div>
    {/* Subtle decorative blob behind icon */}
    <div className={`absolute -right-4 -bottom-4 w-16 h-16 rounded-full ${bg} opacity-20 group-hover:scale-150 transition-transform duration-500`} />
  </div>
);

// --- 🚀 MAIN COMPONENT ---
export const UserProfile = ({ user, onBack, onLogout }) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  
  // Detect scroll for sticky header effects
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch History
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        if (bookings.length > 0) { setLoading(false); return; }
        // Simulate loading for smoother feel if API is fast
        await new Promise(r => setTimeout(r, 500)); 
        const { data } = await api.get("/queue/history");
        if (data.success) setBookings(data.history || []);
      } catch (error) {
        console.error("Failed to fetch history:", error);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchHistory();
  }, [user]);

  const stats = useMemo(() => {
    const totalSpent = bookings.reduce((acc, curr) => curr.status !== 'cancelled' ? acc + (curr.totalPrice || 0) : acc, 0);
    const timeSaved = bookings.filter(b => b.status === 'completed').length * 15; 
    return { count: bookings.length, spent: totalSpent, timeSaved: timeSaved };
  }, [bookings]);

  const TABS = [
    { id: "overview", icon: Grid, label: "Overview" },
    { id: "bookings", icon: History, label: "History" },
    { id: "wallet", icon: Wallet, label: "Wallet" },
    { id: "settings", icon: Settings, label: "Settings" },
  ];

  return (
    <div className="min-h-screen font-sans text-zinc-900 pb-20 selection:bg-indigo-100 selection:text-indigo-900">
      <GlobalStyles />
      <BackgroundAurora />
      <Header onBack={onBack} onLogout={onLogout} scrolled={scrolled} />

      {/* --- PARALLAX HERO SECTION --- */}
      <div className="relative pt-28 pb-6 px-4 md:px-6 max-w-5xl mx-auto">
        
        {/* Profile Card */}
        <div className="relative bg-white/80 backdrop-blur-xl border border-white rounded-[2.5rem] shadow-xl shadow-zinc-200/50 overflow-hidden animate-fade-up">
          
          {/* Cover Image */}
          <div className="h-40 md:h-52 w-full relative bg-zinc-100 overflow-hidden">
             <img 
               src="https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?q=80&w=2070&auto=format&fit=crop" 
               alt="Cover"
               className="w-full h-full object-cover opacity-90"
             />
             <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent"></div>
          </div>

          <div className="px-6 md:px-10 pb-8 relative">
            <div className="flex flex-col md:flex-row items-start md:items-end -mt-14 gap-5">
              
              {/* Avatar with Ring */}
              <div className="relative p-2 bg-white rounded-[2rem] shadow-sm mx-auto md:mx-0">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-[1.6rem] bg-zinc-100 overflow-hidden border border-zinc-200">
                  <img 
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || "Guest"}`} 
                    alt="User" 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div className="absolute bottom-1 right-1 bg-zinc-900 text-white p-1.5 rounded-full border-4 border-white shadow-sm">
                  <Edit3 size={12} />
                </div>
              </div>

              {/* Text Info */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-2xl md:text-3xl font-black text-zinc-900 tracking-tight">{user?.name || "Sanjay Choudhary"}</h1>
                <div className="flex items-center justify-center md:justify-start gap-2 mt-1 text-zinc-500 text-sm font-medium">
                   <span>{user?.email || "developer@trimgo.com"}</span>
                   <span className="w-1 h-1 bg-zinc-300 rounded-full" />
                   <span className="text-emerald-600 flex items-center gap-1"><CheckCircle size={12} fill="currentColor" className="text-white"/> Verified</span>
                </div>
              </div>

              {/* Action Button */}
              <button className="hidden md:flex items-center gap-2 bg-zinc-900 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-zinc-900/20 active:scale-95 transition-transform">
                <span>Edit Profile</span>
              </button>
            </div>

            {/* Mobile Stats Row */}
            <div className="grid grid-cols-3 gap-2 mt-8 md:hidden">
              <div className="bg-zinc-50 p-3 rounded-2xl text-center border border-zinc-100">
                <p className="font-black text-lg">{stats.count}</p>
                <p className="text-[10px] text-zinc-400 font-bold uppercase">Bookings</p>
              </div>
              <div className="bg-zinc-50 p-3 rounded-2xl text-center border border-zinc-100">
                <p className="font-black text-lg text-emerald-600">{stats.timeSaved}m</p>
                <p className="text-[10px] text-zinc-400 font-bold uppercase">Saved</p>
              </div>
              <div className="bg-zinc-50 p-3 rounded-2xl text-center border border-zinc-100">
                <p className="font-black text-lg">4.9</p>
                <p className="text-[10px] text-zinc-400 font-bold uppercase">Rating</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- STICKY TABS (Mobile & Desktop) --- */}
      <div className="sticky top-[70px] z-40 px-4 md:px-0 mb-6 max-w-5xl mx-auto">
        <div className="bg-white/80 backdrop-blur-xl border border-white/50 shadow-sm shadow-zinc-200/50 p-1.5 rounded-2xl flex items-center overflow-x-auto scrollbar-hide snap-x">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-[100px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all duration-300 snap-center ${
                activeTab === tab.id
                  ? "bg-zinc-900 text-white shadow-md"
                  : "text-zinc-500 hover:bg-zinc-50"
              }`}
            >
              <tab.icon size={16} className={activeTab === tab.id ? "text-zinc-300" : "text-zinc-400"} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="max-w-5xl mx-auto px-4 md:px-6 min-h-[500px]">
        
        {/* OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-6 animate-fade-up">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard icon={Zap} label="Status" value="Active" bg="bg-amber-100" color="text-amber-600" />
              <StatCard icon={Wallet} label="Balance" value="₹850" bg="bg-indigo-100" color="text-indigo-600" />
              <div className="hidden md:flex bg-gradient-to-br from-indigo-600 to-purple-700 p-4 rounded-2xl items-center justify-between text-white col-span-2 relative overflow-hidden shadow-lg shadow-indigo-500/20">
                 <div className="relative z-10">
                   <p className="font-bold text-lg">TrimGo Pro</p>
                   <p className="text-indigo-200 text-xs">Priority Access Unlocked</p>
                 </div>
                 <Crown size={32} className="text-white/20 rotate-12" />
                 <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
              </div>
            </div>

            <div className="bg-white border border-zinc-100 rounded-3xl p-5 md:p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-zinc-900 text-lg">Recent</h3>
                <button onClick={() => setActiveTab('bookings')} className="w-8 h-8 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-400 hover:bg-zinc-100 transition-colors">
                  <ChevronRight size={18} />
                </button>
              </div>
              
              <div className="space-y-3">
                {bookings.slice(0, 3).map((booking, idx) => (
                   <div key={idx} className="flex items-center justify-between p-3 rounded-2xl hover:bg-zinc-50 transition-colors border border-transparent hover:border-zinc-100 group cursor-pointer">
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 rounded-xl bg-zinc-100 flex items-center justify-center text-lg font-bold text-zinc-500 group-hover:scale-110 transition-transform duration-300">
                           {booking.salonId?.salonName?.[0] || "T"}
                         </div>
                         <div>
                            <h4 className="font-bold text-zinc-900">{booking.salonId?.salonName || "TrimGo Salon"}</h4>
                            <p className="text-xs text-zinc-500 font-medium">{new Date(booking.createdAt).toLocaleDateString()}</p>
                         </div>
                      </div>
                      <div className="text-right">
                         <span className="block font-bold text-zinc-900">₹{booking.totalPrice}</span>
                         <span className="text-[10px] text-emerald-500 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">Paid</span>
                      </div>
                   </div>
                ))}
                {bookings.length === 0 && <p className="text-zinc-400 text-center text-sm py-4">No recent activity.</p>}
              </div>
            </div>
          </div>
        )}

        {/* BOOKINGS */}
        {activeTab === "bookings" && (
          <div className="space-y-4 animate-fade-up">
            {bookings.length === 0 ? (
               <div className="py-20 text-center opacity-50">
                  <History size={48} className="mx-auto mb-4 text-zinc-300"/>
                  <p>No history yet.</p>
               </div>
            ) : (
              bookings.map((booking) => (
                <div key={booking._id} className="bg-white p-5 rounded-3xl border border-zinc-100 shadow-sm flex flex-col md:flex-row gap-4 md:items-center">
                   <div className="flex items-center gap-4 flex-1">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${booking.status === 'cancelled' ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-600'}`}>
                         {booking.status === 'cancelled' ? <X size={20}/> : <CheckCircle size={20}/>}
                      </div>
                      <div>
                        <h3 className="font-bold text-zinc-900">{booking.salonId?.salonName}</h3>
                        <p className="text-xs text-zinc-500">{new Date(booking.createdAt).toLocaleString()}</p>
                      </div>
                   </div>
                   <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-0 border-zinc-50 pt-3 md:pt-0">
                      <span className="font-bold text-zinc-900 text-lg">₹{booking.totalPrice}</span>
                      <button className="px-4 py-2 bg-zinc-100 rounded-xl text-xs font-bold text-zinc-600">Receipt</button>
                   </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* WALLET */}
        {activeTab === "wallet" && (
           <div className="space-y-6 animate-fade-up">
              <div className="flex overflow-x-auto gap-4 pb-4 -mx-4 px-4 scrollbar-hide snap-x">
                 <div className="min-w-[300px] h-[180px] rounded-[2rem] bg-zinc-900 text-white p-6 flex flex-col justify-between relative overflow-hidden snap-center shadow-xl shadow-zinc-900/20">
                    <div className="flex justify-between items-start z-10">
                       <Wallet size={24} className="opacity-80"/>
                       <span className="font-mono opacity-50">TRIMGO CARD</span>
                    </div>
                    <div className="z-10">
                       <p className="text-3xl font-bold tracking-tight">₹850.00</p>
                       <p className="text-xs text-zinc-400 mt-1">Available Balance</p>
                    </div>
                    <div className="absolute top-0 right-0 w-40 h-40 bg-zinc-800 rounded-full blur-[50px] -translate-y-1/2 translate-x-1/2"></div>
                 </div>

                 {SAVED_CARDS.map((card) => (
                    <div key={card.id} className={`min-w-[300px] h-[180px] rounded-[2rem] bg-gradient-to-br ${card.color} text-white p-6 flex flex-col justify-between relative overflow-hidden snap-center shadow-lg`}>
                       <div className="flex justify-between items-start z-10">
                          <span className="font-bold italic opacity-80">{card.type}</span>
                          <MoreHorizontal size={20} className="opacity-70"/>
                       </div>
                       <div className="z-10">
                          <p className="font-mono text-xl tracking-widest mb-2">•••• •••• •••• {card.last4}</p>
                          <div className="flex justify-between text-xs opacity-80 uppercase font-medium">
                             <span>{card.holder}</span>
                             <span>{card.expiry}</span>
                          </div>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        )}

        {/* SETTINGS */}
        {activeTab === "settings" && (
          <div className="bg-white rounded-3xl border border-zinc-100 overflow-hidden animate-fade-up">
             {[
               { icon: User, label: "Personal Information", sub: "Name, Email" },
               { icon: Bell, label: "Notifications", sub: "Manage alerts" },
               { icon: Shield, label: "Privacy & Security", sub: "2FA, Password" },
               { icon: Info, label: "Help & Support", sub: "FAQs, Contact" },
             ].map((item, i) => (
               <div key={i} className="p-4 flex items-center gap-4 hover:bg-zinc-50 active:bg-zinc-100 transition-colors cursor-pointer border-b border-zinc-50 last:border-0">
                  <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500">
                    <item.icon size={18} />
                  </div>
                  <div className="flex-1">
                     <h4 className="font-bold text-zinc-900 text-sm">{item.label}</h4>
                     <p className="text-[11px] text-zinc-400">{item.sub}</p>
                  </div>
                  <ChevronRight size={16} className="text-zinc-300" />
               </div>
             ))}
             <div className="p-4 mt-2">
                <button className="w-full py-3 rounded-xl border border-red-100 bg-red-50 text-red-500 font-bold text-sm">Sign Out</button>
             </div>
          </div>
        )}

      </div>
    </div>
  );
};