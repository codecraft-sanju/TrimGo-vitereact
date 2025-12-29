import React, { useState, useEffect, useMemo } from "react";
import {
  User, MapPin, Calendar, CreditCard, Settings, LogOut, Camera,
  Edit3, Star, Clock, ChevronRight, Shield, Bell, Smartphone,
  History, Wallet, Zap, Crown, Grid, CheckCircle, X, Mail, Phone,
  AlertTriangle, Info, ArrowLeft
} from "lucide-react";
import api from "../utils/api";

// --- ⚡ MOCK DATA FOR WALLET ---
const SAVED_CARDS = [
  { id: 1, type: "Visa", last4: "4242", expiry: "12/28", holder: "Sanjay Choudhary", color: "from-zinc-900 to-zinc-800" },
  { id: 2, type: "Mastercard", last4: "8899", expiry: "09/26", holder: "Sanjay Choudhary", color: "from-indigo-600 to-purple-600" },
];

// --- 🎨 VISUAL ASSETS (AGGRESSIVELY OPTIMIZED) ---
const BackgroundAurora = () => (
  <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-zinc-50 transform-gpu translate-z-0">
    {/* MOBILE: Static Gradient Only (Zero CPU Usage) */}
    <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/40 via-white to-purple-50/40 md:hidden" />

    {/* DESKTOP: Animated Blobs (Hidden on Mobile) */}
    <div className="hidden md:block absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
    <div className="hidden md:block absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-purple-300/30 rounded-full blur-[120px] animate-blob" />
    <div className="hidden md:block absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-emerald-300/30 rounded-full blur-[120px] animate-blob animation-delay-2000" />
  </div>
);

// --- 🧩 SUB-COMPONENTS ---

// 1. Premium Floating Header
const Header = ({ onBack, onLogout }) => (
  <header className="fixed top-0 left-0 right-0 z-50 px-4 md:px-6 py-3 md:py-4 pointer-events-none">
    <div className="max-w-5xl mx-auto pointer-events-auto">
      {/* MOBILE: Solid White (No Blur). DESKTOP: Blur. */}
      <div className="flex items-center justify-between bg-white/95 backdrop-blur-none md:bg-white/70 md:backdrop-blur-xl rounded-full p-2 border border-white/50 shadow-sm transition-all duration-300 transform-gpu translate-z-0">
        
        {/* Left: Back Button */}
        <button 
          onClick={onBack} 
          className="p-2.5 md:p-3 rounded-full bg-white shadow-sm border border-zinc-100 active:bg-zinc-100 transition-colors group"
        >
          <ArrowLeft size={18} className="text-zinc-600 group-hover:-translate-x-0.5 transition-transform" />
        </button>

        {/* Center/Right: Actions & Title */}
        <div className="flex items-center gap-4 pr-1">
           {/* Title Hidden on very small screens */}
           <div className="hidden sm:flex flex-col items-end leading-tight mr-2">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">TrimGo ID</span>
            <span className="text-sm font-bold text-zinc-800">My Profile</span>
          </div>

          <div className="hidden sm:block h-8 w-[1px] bg-zinc-200"></div>

          <button 
            onClick={onLogout} 
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-red-50 text-red-500 hover:bg-red-100 border border-red-100 transition-all active:scale-95"
          >
            <span className="text-xs font-bold">Logout</span>
            <LogOut size={14} strokeWidth={2.5} />
          </button>
        </div>

      </div>
    </div>
  </header>
);

const StatCard = ({ icon: Icon, label, value, color, bg }) => (
  // Use simple border instead of heavy shadow on mobile
  <div className="bg-white border border-zinc-200 md:border-zinc-100 shadow-none md:shadow-sm p-4 rounded-2xl flex items-center gap-4 hover:shadow-md transition group transform-gpu translate-z-0">
    <div className={`w-12 h-12 rounded-xl ${bg} ${color} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
      <Icon size={20} />
    </div>
    <div>
      <p className="text-zinc-400 text-xs uppercase font-bold tracking-wider">{label}</p>
      <p className="text-xl font-bold text-zinc-900">{value}</p>
    </div>
  </div>
);

const SectionTitle = ({ title, sub }) => (
  <div className="mb-6">
    <h3 className="text-xl font-bold text-zinc-900">{title}</h3>
    <p className="text-zinc-500 text-sm">{sub}</p>
  </div>
);

// --- 🚀 MAIN COMPONENT ---
export const UserProfile = ({ user, onBack, onLogout }) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // 2. FETCH HISTORY
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        if (bookings.length > 0) { 
            setLoading(false);
            return;
        }
        const { data } = await api.get("/queue/history");
        if (data.success) {
          setBookings(data.history || []);
        }
      } catch (error) {
        console.error("Failed to fetch history:", error);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchHistory();
  }, [user]);

  // 3. STATS
  const stats = useMemo(() => {
    const totalSpent = bookings.reduce((acc, curr) => curr.status !== 'cancelled' ? acc + (curr.totalPrice || 0) : acc, 0);
    const timeSaved = bookings.filter(b => b.status === 'completed').length * 15; 
    return { count: bookings.length, spent: totalSpent, timeSaved: timeSaved };
  }, [bookings]);

  const settingsList = [
    { icon: User, label: "Full Name", sub: user?.name || "Guest User" },
    { icon: Mail, label: "Email Address", sub: user?.email || "No email linked" },
    { icon: Phone, label: "Phone Number", sub: user?.phone || "No phone linked" },
    { icon: Shield, label: "Login & Security", sub: "Password, 2FA" },
    { icon: Bell, label: "Notifications", sub: "Email, Push, SMS" },
  ];

  return (
    // ROOT: touch-action-pan-y allows browser to handle vertical scroll efficiently
    <div className="min-h-screen bg-zinc-50 font-sans pb-20 relative overflow-x-hidden touch-pan-y">
      
      {/* 1. Static Background */}
      <BackgroundAurora />

      {/* 2. Header */}
      <Header onBack={onBack} onLogout={onLogout} />

      {/* 3. Main Content Wrapper */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 md:px-6 pt-24 md:pt-32">
        
        {/* --- HERO PROFILE CARD --- */}
        {/* MOBILE: Solid White, No Blur, Simple Border. DESKTOP: Fancy Glass. */}
        <div className="relative rounded-[2rem] bg-white border border-zinc-200 md:border-white/60 shadow-sm md:shadow-xl md:bg-white/80 md:backdrop-blur-xl overflow-hidden transform-gpu translate-z-0">
          <div className="h-40 md:h-48 w-full relative group bg-zinc-100">
             {/* Lazy Load Image + Async Decoding */}
             <img 
               src="https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=2070&auto=format&fit=crop" 
               alt="Cover" 
               loading="lazy" 
               decoding="async"
               className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 will-change-transform"
             />
             <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/60 via-zinc-900/10 to-transparent"></div>
          </div>

          <div className="px-6 md:px-8 pb-8">
            <div className="flex flex-col md:flex-row items-start md:items-end -mt-16 gap-6">
              {/* Avatar */}
              <div className="relative group mx-auto md:mx-0">
                <div className="w-28 h-28 md:w-32 md:h-32 rounded-[2rem] p-1.5 bg-white shadow-lg">
                   <div className="w-full h-full rounded-[1.7rem] bg-zinc-100 flex items-center justify-center text-4xl font-bold text-zinc-900 overflow-hidden border border-zinc-200">
                      <img 
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || "Guest"}`} 
                        alt="User" 
                        loading="lazy"
                        className="w-full h-full object-cover" 
                      />
                   </div>
                </div>
                <button className="absolute bottom-0 right-0 w-8 h-8 bg-zinc-900 rounded-full flex items-center justify-center text-white border-4 border-white shadow-md">
                  <Edit3 size={14} />
                </button>
              </div>

              {/* User Info */}
              <div className="flex-1 mb-2 text-center md:text-left w-full">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-2 md:gap-3 justify-center md:justify-start">
                  <h1 className="text-2xl md:text-3xl font-black text-zinc-900 tracking-tight">{user?.name || "Guest"}</h1>
                  <span className="px-3 py-1 rounded-full bg-orange-50 border border-orange-100 text-orange-700 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 mt-1 md:mt-0">
                    <Crown size={12} className="fill-orange-700"/> Pro
                  </span>
                </div>
                
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-2 text-sm text-zinc-500 font-medium">
                  <span className="flex items-center gap-1.5">
                    <Mail size={14} className="text-zinc-400"/> {user?.email || "No Email"}
                  </span>
                  <span className="flex items-center gap-1 text-emerald-600">
                    <CheckCircle size={14}/> Verified
                  </span>
                </div>
              </div>

              <div className="flex gap-3 w-full md:w-auto mt-4 md:mt-0">
                <button className="flex-1 md:flex-none px-6 py-3 rounded-xl bg-zinc-900 text-white font-bold text-sm active:scale-95 transition-transform transform-gpu">
                  Edit Profile
                </button>
                <button className="px-4 py-3 rounded-xl bg-white text-zinc-600 border border-zinc-200 active:scale-95 transition-transform transform-gpu">
                  <Settings size={20} />
                </button>
              </div>
            </div>

            {/* --- STATS --- */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-zinc-100">
               <div className="text-center md:text-left">
                 <p className="text-2xl font-black text-zinc-900">{stats.count}</p>
                 <p className="text-xs text-zinc-400 uppercase font-bold tracking-wider">Bookings</p>
               </div>
               <div className="text-center md:text-left">
                 <p className="text-2xl font-black text-zinc-900">4.8</p>
                 <p className="text-xs text-zinc-400 uppercase font-bold tracking-wider">Rating</p>
               </div>
               <div className="text-center md:text-left">
                 <p className="text-2xl font-black text-emerald-500">{stats.timeSaved}m</p>
                 <p className="text-xs text-zinc-400 uppercase font-bold tracking-wider">Saved</p>
               </div>
               <div className="text-center md:text-left">
                 <p className="text-2xl font-black text-zinc-900">₹{stats.spent}</p>
                 <p className="text-xs text-zinc-400 uppercase font-bold tracking-wider">Spent</p>
               </div>
            </div>
          </div>
        </div>

        {/* --- CONTENT GRID --- */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-8">
          
          {/* LEFT: TABS */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 space-y-2">
              {[
                { id: "overview", icon: Grid, label: "Overview" },
                { id: "bookings", icon: History, label: "History" },
                { id: "wallet", icon: Wallet, label: "Wallet" },
                { id: "settings", icon: Settings, label: "Settings" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl text-sm font-bold transition-colors ${
                    activeTab === tab.id
                      ? "bg-zinc-900 text-white shadow-lg shadow-zinc-900/20"
                      : "bg-white border border-zinc-100 text-zinc-500"
                  }`}
                >
                  <tab.icon size={18} className={activeTab === tab.id ? "text-zinc-300" : "text-zinc-400"} />
                  {tab.label}
                </button>
              ))}
              
              <div className="mt-8 p-6 rounded-3xl bg-indigo-600 text-white relative overflow-hidden">
                  <h4 className="font-bold text-lg mb-1 relative z-10">Go Pro</h4>
                  <p className="text-xs text-indigo-100 mb-4 opacity-90 relative z-10">Get priority access.</p>
                  <button className="px-4 py-2 rounded-xl bg-white text-indigo-600 text-xs font-bold w-full relative z-10">Upgrade</button>
                  {/* Static decoration instead of heavy blur */}
                  <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-indigo-500 rounded-full opacity-50"></div>
              </div>
            </div>
          </div>

          {/* RIGHT: CONTENT (content-visibility optimizes rendering) */}
          <div className="lg:col-span-3 min-h-[500px]" style={{ contentVisibility: 'auto' }}>
            
            {/* TAB: OVERVIEW */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <StatCard icon={Zap} label="Status" value="Active" bg="bg-emerald-100" color="text-emerald-600" />
                  <StatCard icon={Wallet} label="Balance" value="₹450" bg="bg-blue-100" color="text-blue-600" />
                </div>

                <div className="bg-white border border-zinc-200 rounded-3xl p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-zinc-900">Recent Activity</h3>
                    <button onClick={() => setActiveTab('bookings')} className="text-xs text-zinc-500 font-bold">View All</button>
                  </div>
                  <div className="space-y-4">
                    {loading ? (
                        <div className="text-center py-8 text-zinc-400">Loading...</div>
                    ) : bookings.length === 0 ? (
                        <div className="text-center py-8 text-zinc-400">No recent activity.</div>
                    ) : (
                        bookings.slice(0, 2).map((booking) => (
                        <div key={booking._id} className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-50 border border-zinc-100">
                            <div className="w-10 h-10 rounded-xl bg-white border border-zinc-200 flex items-center justify-center font-bold text-zinc-600 shrink-0">
                            {booking.salonId?.salonName ? booking.salonId.salonName.charAt(0) : "S"}
                            </div>
                            <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-zinc-900 truncate text-sm">{booking.salonId?.salonName || "Unknown"}</h4>
                            <p className="text-xs text-zinc-500 truncate">
                                {new Date(booking.createdAt).toLocaleDateString()}
                            </p>
                            </div>
                            <div className="text-right shrink-0">
                            <p className="font-bold text-zinc-900 text-sm">₹{booking.totalPrice}</p>
                            </div>
                        </div>
                        ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: BOOKINGS */}
            {activeTab === "bookings" && (
              <div className="space-y-6">
                <SectionTitle title="Booking History" sub="Past appointments." />
                {loading ? (
                    <div className="text-center py-10">Loading...</div>
                ) : bookings.length === 0 ? (
                    <div className="text-center py-20 border-2 border-dashed border-zinc-200 rounded-3xl">
                        <History size={32} className="mx-auto mb-2 text-zinc-300" />
                        <p className="text-zinc-500 font-bold">No history yet</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                    {bookings.map((booking) => (
                        <div key={booking._id} className="flex flex-col md:flex-row gap-4 p-5 rounded-3xl bg-white border border-zinc-200 shadow-sm">
                            <div className="flex items-center gap-4 flex-1">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${booking.status === 'cancelled' ? 'bg-red-50 text-red-500' : 'bg-zinc-100 text-zinc-900'}`}>
                                {booking.status === 'cancelled' ? <X size={20}/> : <CheckCircle size={20}/>}
                                </div>
                                <div>
                                <h4 className="font-bold text-zinc-900">{booking.salonId?.salonName}</h4>
                                <p className="text-xs text-zinc-500 mt-1">
                                    {new Date(booking.createdAt).toDateString()}
                                </p>
                                </div>
                            </div>
                            <div className="flex justify-between items-center border-t md:border-t-0 border-zinc-100 pt-3 md:pt-0">
                                <p className="text-lg font-bold text-zinc-900">₹{booking.totalPrice}</p>
                            </div>
                        </div>
                    ))}
                    </div>
                )}
              </div>
            )}

            {/* TAB: WALLET */}
            {activeTab === "wallet" && (
              <div className="space-y-6">
                 <SectionTitle title="Wallet" sub="Manage cards." />
                 
                 <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide snap-x">
                    <button className="min-w-[260px] h-[160px] rounded-3xl border-2 border-dashed border-zinc-300 flex flex-col items-center justify-center text-zinc-400 bg-white snap-center">
                        <CreditCard size={24} className="mb-2" />
                        <span className="text-xs font-bold">Add Card</span>
                    </button>

                    {SAVED_CARDS.map((card) => (
                      <div key={card.id} className={`min-w-[280px] h-[160px] rounded-3xl bg-gradient-to-br ${card.color} p-6 relative overflow-hidden text-white snap-center transform-gpu translate-z-0 shadow-md`}>
                          <div className="flex justify-between items-start">
                             <span className="font-mono text-white/70 text-xs">VISA</span>
                          </div>
                          <div className="mt-8">
                             <p className="text-xl font-mono tracking-widest">•••• {card.last4}</p>
                             <p className="text-xs mt-2 opacity-80">{card.holder}</p>
                          </div>
                      </div>
                    ))}
                 </div>
              </div>
            )}

            {/* TAB: SETTINGS */}
            {activeTab === "settings" && (
              <div className="space-y-6">
                 <SectionTitle title="Settings" sub="Preferences." />
                 <div className="bg-white border border-zinc-200 rounded-3xl overflow-hidden divide-y divide-zinc-100">
                    {settingsList.map((item, i) => (
                      <div key={i} className="p-4 flex items-center gap-4 active:bg-zinc-50 transition-colors">
                          <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500">
                            <item.icon size={16} />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-zinc-900 font-bold text-sm">{item.label}</h4>
                            <p className="text-zinc-500 text-[10px]">{item.sub}</p>
                          </div>
                          <ChevronRight size={16} className="text-zinc-300" />
                      </div>
                    ))}
                 </div>
                 <div className="p-4 rounded-xl bg-red-50 text-red-600 text-center font-bold text-sm border border-red-100 mt-4">
                    Delete Account
                 </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};