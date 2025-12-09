"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  Grid, Activity, Users, Ticket, Settings, LogOut, ChevronRight,
  Bell, DollarSign, TrendingUp, Clock, CheckCircle, Scissors,
  Play, CheckSquare, X, Camera, Mail, Phone, MapPin, User
} from "lucide-react";

/* ---------------------------------
   INITIAL DATA 
---------------------------------- */

const INITIAL_SALON_REQUESTS = [
  { id: 101, name: "Rahul Sharma", service: "Haircut & Beard", time: "10 min ago", status: "pending", price: 350 },
  { id: 102, name: "Amit Verma", service: "Hair Spa", time: "2 min ago", status: "pending", price: 800 },
  { id: 103, name: "Vikram Singh", service: "Shaving", time: "Just now", status: "pending", price: 150 },
];

const INITIAL_ACTIVE_QUEUE = [
  { id: 201, name: "Suresh Raina", service: "Haircut", status: "waiting", waitTime: 15, price: 250 },
  { id: 202, name: "Mahendra S.", service: "Beard Trim", status: "waiting", waitTime: 30, price: 100 },
];

/* ---------------------------------
   SUB-COMPONENTS
---------------------------------- */

const AnalyticsChart = () => {
  return (
    <div className="w-full h-32 mt-4 relative overflow-hidden rounded-xl bg-gradient-to-b from-emerald-500/10 to-transparent border border-emerald-500/20">
      <svg viewBox="0 0 100 40" className="w-full h-full absolute bottom-0 left-0" preserveAspectRatio="none">
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d="M0 35 Q 10 30, 20 25 T 40 20 T 60 15 T 80 25 T 100 10 V 40 H 0 Z" fill="url(#chartGradient)" />
        <path d="M0 35 Q 10 30, 20 25 T 40 20 T 60 15 T 80 25 T 100 10" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <div className="absolute top-2 left-4 text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
        <Activity size={10} /> Real-time Demand
      </div>
    </div>
  );
};

/* ---------------------------------
   PROFILE MODAL COMPONENT (New)
---------------------------------- */
const ProfileModal = ({ isOpen, onClose, salon, profileImage, onImageUpload }) => {
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      onImageUpload(imageUrl);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-zinc-900 border border-white/10 rounded-3xl p-6 shadow-2xl animate-[scaleIn_0.2s_ease-out]">
        <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white transition">
          <X size={20} />
        </button>

        <div className="flex flex-col items-center">
          <h2 className="text-xl font-bold text-white mb-6">Salon Profile</h2>

          {/* Image Upload Section */}
          <div className="relative group cursor-pointer mb-6" onClick={() => fileInputRef.current.click()}>
            <div className="w-28 h-28 rounded-full border-4 border-zinc-800 overflow-hidden shadow-xl group-hover:border-emerald-500 transition-colors">
              {profileImage ? (
                <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-zinc-500">
                  <User size={40} />
                </div>
              )}
            </div>
            <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera size={24} className="text-white" />
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileChange}
            />
          </div>

          <h3 className="text-2xl font-black text-white mb-1">{salon?.salonName || "Salon Name"}</h3>
          <p className="text-emerald-400 text-sm font-medium mb-8">@{salon?.ownerName?.replace(/\s/g, '').toLowerCase() || "username"}</p>

          {/* Details Grid */}
          <div className="w-full space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-950/50 border border-white/5">
              <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-400">
                <User size={18} />
              </div>
              <div>
                <p className="text-xs text-zinc-500 uppercase font-bold">Owner Name</p>
                <p className="text-zinc-200 font-medium">{salon?.ownerName || "Not set"}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-950/50 border border-white/5">
              <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-400">
                <Phone size={18} />
              </div>
              <div>
                <p className="text-xs text-zinc-500 uppercase font-bold">Phone</p>
                <p className="text-zinc-200 font-medium">{salon?.phone || "+91 00000 00000"}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-950/50 border border-white/5">
              <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-400">
                <Mail size={18} />
              </div>
              <div>
                <p className="text-xs text-zinc-500 uppercase font-bold">Email</p>
                <p className="text-zinc-200 font-medium">{salon?.email || "email@example.com"}</p>
              </div>
            </div>
            
             <div className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-950/50 border border-white/5">
              <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-400">
                <MapPin size={18} />
              </div>
              <div>
                <p className="text-xs text-zinc-500 uppercase font-bold">Location</p>
                <p className="text-zinc-200 font-medium">{salon?.address || "Address not set"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ---------------------------------
   MAIN COMPONENT
---------------------------------- */

const SalonDashboard = ({ salon, onLogout }) => {
  const [requests, setRequests] = useState(INITIAL_SALON_REQUESTS);
  const [activeQueue, setActiveQueue] = useState(INITIAL_ACTIVE_QUEUE);
  const [inChair, setInChair] = useState(null);
  const [isOnline, setIsOnline] = useState(true);
  const [stats, setStats] = useState({ revenue: 4500, customers: 12, waitTime: 25 });
  const [currentTime, setCurrentTime] = useState(new Date());

  // Profile Modal State
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileImage, setProfileImage] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Helper to get initials from Owner Name
  const getOwnerInitials = (name) => {
    if (!name) return "TG";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const handleAccept = (req) => {
    const newCustomer = { 
      id: Date.now(), 
      name: req.name,
      service: req.service,
      price: req.price,
      status: 'waiting', 
      waitTime: activeQueue.length * 15 + 15 
    };
    setActiveQueue([...activeQueue, newCustomer]);
    setRequests(requests.filter(r => r.id !== req.id));
  };

  const handleReject = (id) => {
    setRequests(requests.filter(r => r.id !== id));
  };

  const handleStartService = (customer) => {
    if(inChair) {
      alert("Chair is occupied! Please complete the current service first."); 
      return;
    }
    setInChair({ ...customer, startTime: Date.now() });
    setActiveQueue(activeQueue.filter(c => c.id !== customer.id));
  };

  const handleCompleteService = () => {
    if(inChair) {
      setStats(prev => ({
        ...prev,
        revenue: prev.revenue + inChair.price, 
        customers: prev.customers + 1
      }));
      setInChair(null);
    }
  };

  const getAvatarGradient = (name) => {
    const gradients = [
      "from-pink-500 to-rose-500",
      "from-indigo-500 to-blue-500",
      "from-emerald-500 to-teal-500",
      "from-orange-500 to-amber-500"
    ];
    return gradients[name.length % gradients.length];
  };

  return (
    <div className="min-h-screen w-full bg-zinc-950 font-sans text-white overflow-hidden flex selection:bg-emerald-500 selection:text-white">
      
      {/* Profile Modal */}
      <ProfileModal 
        isOpen={isProfileOpen} 
        onClose={() => setIsProfileOpen(false)}
        salon={salon}
        profileImage={profileImage}
        onImageUpload={setProfileImage}
      />

      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-zinc-950 to-black"></div>
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] animate-pulse-slow"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-[120px] animate-pulse-slow animation-delay-2000"></div>
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay"></div>
      </div>

      {/* Sidebar Navigation */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-white/5 bg-zinc-900/40 backdrop-blur-xl z-50">
        <div className="h-20 flex items-center px-6 border-b border-white/5 gap-3">
           <div className="w-10 h-10 bg-white text-black rounded-xl flex items-center justify-center font-bold text-sm shadow-[0_0_20px_rgba(255,255,255,0.3)]">TG</div>
           <span className="font-bold text-lg">TrimGo</span>
        </div>

        <nav className="flex-1 py-8 flex flex-col gap-2 px-3">
           {[
             { icon: Grid, label: "Dashboard", active: true },
             { icon: Activity, label: "Analytics", active: false },
             { icon: Users, label: "Customers", active: false },
             { icon: Ticket, label: "Bookings", active: false },
             { icon: Settings, label: "Settings", active: false },
           ].map((item, idx) => (
             <div key={idx} className={`flex items-center p-3 rounded-xl cursor-pointer transition-all ${item.active ? 'bg-white/10 text-white shadow-lg shadow-white/5 border border-white/5' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}>
               <item.icon size={20} strokeWidth={2} />
               <span className="ml-3 font-medium">{item.label}</span>
               {item.active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]"></div>}
             </div>
           ))}
        </nav>

        <div className="p-4 border-t border-white/5">
          <button onClick={onLogout} className="flex items-center w-full p-3 rounded-xl text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors">
            <LogOut size={20} />
            <span className="ml-3 font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 relative z-10 flex flex-col h-screen overflow-hidden">
        
        {/* Top Header */}
        <header className="h-20 border-b border-white/5 bg-zinc-900/30 backdrop-blur-md flex items-center justify-between px-6 lg:px-8">
           <div className="flex flex-col">
             <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                {salon?.salonName || "My Salon"}
                <ChevronRight size={16} className="text-zinc-600"/>
                <span className="text-zinc-400 font-normal text-sm">Dashboard</span>
             </h1>
             <p className="text-xs text-zinc-500 font-mono mt-0.5">{currentTime.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
           </div>

           <div className="flex items-center gap-4">
             {/* Online Toggle */}
             <div 
               onClick={() => setIsOnline(!isOnline)}
               className={`cursor-pointer px-4 py-2 rounded-full border flex items-center gap-2 transition-all ${isOnline ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20' : 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20'}`}
             >
                 <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`}></span>
                 <span className="text-xs font-bold uppercase tracking-wider">{isOnline ? 'Accepting' : 'Offline'}</span>
             </div>

             <div className="w-px h-8 bg-white/10 mx-2"></div>
             
             <div className="relative cursor-pointer">
                 <Bell size={20} className="text-zinc-400 hover:text-white transition" />
                 <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-zinc-900"></span>
             </div>

             {/* PROFILE TRIGGER (Updated) */}
             <div 
               onClick={() => setIsProfileOpen(true)}
               className="w-9 h-9 rounded-full bg-gradient-to-tr from-zinc-700 to-zinc-600 p-0.5 cursor-pointer hover:scale-105 transition overflow-hidden"
             >
               {profileImage ? (
                  <img src={profileImage} alt="Profile" className="w-full h-full rounded-full object-cover" />
               ) : (
                  <div className="w-full h-full rounded-full bg-zinc-900 flex items-center justify-center text-xs font-bold text-white">
                    {getOwnerInitials(salon?.ownerName)}
                  </div>
               )}
             </div>
           </div>
        </header>

        {/* Dashboard Workspace */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8 scrollbar-hide">
           
           {/* Stats Grid */}
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
             
             {/* Analytics Chart */}
             <div className="col-span-1 md:col-span-2 lg:col-span-4 bg-zinc-900/50 border border-white/5 rounded-3xl p-6">
               <div className="flex justify-between items-center mb-2">
                 <h3 className="font-bold text-zinc-300">Live Traffic Analytics</h3>
                 <select className="bg-zinc-950 text-xs text-zinc-400 border border-white/10 rounded-lg p-1">
                   <option>Last Hour</option>
                   <option>Today</option>
                 </select>
               </div>
               <AnalyticsChart />
             </div>

             {/* Revenue Card */}
             <div className="group relative bg-zinc-900/50 hover:bg-zinc-900/80 border border-white/5 hover:border-white/10 rounded-3xl p-6 transition-all duration-300">
                 <div className="absolute top-0 right-0 p-5 opacity-20 group-hover:opacity-40 transition-opacity group-hover:scale-110 duration-500"><DollarSign size={40} className="text-emerald-500"/></div>
                 <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-2">Total Revenue</p>
                 <div className="flex items-end gap-2">
                   <h3 className="text-3xl font-black text-white">₹{stats.revenue}</h3>
                   <span className="text-xs text-emerald-400 font-bold mb-1.5 bg-emerald-500/10 px-1.5 py-0.5 rounded flex items-center gap-1"><TrendingUp size={10}/> +12%</span>
                 </div>
             </div>

             {/* Waiting Card */}
             <div className="group relative bg-zinc-900/50 hover:bg-zinc-900/80 border border-white/5 hover:border-white/10 rounded-3xl p-6 transition-all duration-300">
                 <div className="absolute top-0 right-0 p-5 opacity-20 group-hover:opacity-40 transition-opacity group-hover:scale-110 duration-500"><Users size={40} className="text-blue-500"/></div>
                 <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-2">In Queue</p>
                 <div className="flex items-end gap-2">
                   <h3 className="text-3xl font-black text-white">{activeQueue.length}</h3>
                   <span className="text-xs text-zinc-400 font-medium mb-1.5">customers</span>
                 </div>
             </div>

             {/* Wait Time Card */}
             <div className="group relative bg-zinc-900/50 hover:bg-zinc-900/80 border border-white/5 hover:border-white/10 rounded-3xl p-6 transition-all duration-300">
                 <div className="absolute top-0 right-0 p-5 opacity-20 group-hover:opacity-40 transition-opacity group-hover:scale-110 duration-500"><Clock size={40} className="text-amber-500"/></div>
                 <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-2">Avg Wait</p>
                 <div className="flex items-end gap-2">
                   <h3 className="text-3xl font-black text-white">{stats.waitTime}<span className="text-lg font-medium text-zinc-500 ml-1">m</span></h3>
                   <span className="text-xs text-amber-400 font-bold mb-1.5 bg-amber-500/10 px-1.5 py-0.5 rounded">High Traffic</span>
                 </div>
             </div>

             {/* Completed Card */}
             <div className="group relative bg-zinc-900/50 hover:bg-zinc-900/80 border border-white/5 hover:border-white/10 rounded-3xl p-6 transition-all duration-300">
                 <div className="absolute top-0 right-0 p-5 opacity-20 group-hover:opacity-40 transition-opacity group-hover:scale-110 duration-500"><CheckCircle size={40} className="text-violet-500"/></div>
                 <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-2">Completed</p>
                 <div className="flex items-end gap-2">
                   <h3 className="text-3xl font-black text-white">{stats.customers}</h3>
                   <span className="text-xs text-zinc-400 font-medium mb-1.5">services done</span>
                 </div>
             </div>
           </div>

           {/* MAIN KANBAN BOARD */}
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-340px)] min-h-[500px]">
             
             {/* COLUMN 1: NEW REQUESTS */}
             <div className="flex flex-col bg-zinc-900/30 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-sm">
                 <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5">
                   <h3 className="font-bold text-sm text-zinc-100 flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full bg-yellow-500"></div> New Requests
                   </h3>
                   <span className="text-xs font-bold bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-md">{requests.length}</span>
                 </div>
                 <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                   {requests.length === 0 ? (
                     <div className="h-full flex flex-col items-center justify-center text-zinc-600 gap-2">
                        <Bell size={32} className="opacity-20"/>
                        <p className="text-sm">No new requests</p>
                     </div>
                   ) : (
                     requests.map(req => (
                        <div key={req.id} className="group bg-zinc-900 border border-white/10 hover:border-yellow-500/50 p-4 rounded-2xl transition-all hover:shadow-[0_0_20px_rgba(234,179,8,0.1)] animate-[slideIn_0.3s_ease-out]">
                           <div className="flex justify-between items-start mb-3">
                             <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarGradient(req.name)} flex items-center justify-center text-sm font-bold shadow-lg`}>
                                   {req.name.charAt(0)}
                                </div>
                                <div>
                                  <h4 className="font-bold text-sm text-white">{req.name}</h4>
                                  <p className="text-xs text-zinc-400">{req.service}</p>
                                </div>
                             </div>
                             <span className="text-[10px] font-mono text-zinc-500 bg-zinc-950 px-2 py-1 rounded">{req.time}</span>
                           </div>
                           <div className="flex items-center justify-between mt-3 gap-2">
                             <div className="text-xs font-bold text-zinc-300 bg-zinc-800/50 px-2 py-1 rounded">₹{req.price}</div>
                             <div className="flex gap-2">
                                <button onClick={() => handleReject(req.id)} className="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition"><X size={16}/></button>
                                <button onClick={() => handleAccept(req)} className="px-4 py-2 rounded-lg bg-white text-black text-xs font-bold hover:bg-emerald-400 hover:shadow-[0_0_15px_#34d399] transition-all">Accept</button>
                             </div>
                           </div>
                        </div>
                     ))
                   )}
                 </div>
             </div>

             {/* COLUMN 2: WAITING QUEUE */}
             <div className="flex flex-col bg-zinc-900/30 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-sm">
                 <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5">
                   <h3 className="font-bold text-sm text-zinc-100 flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full bg-blue-500"></div> Waiting Queue
                   </h3>
                   <span className="text-xs font-bold bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-md">{activeQueue.length}</span>
                 </div>
                 <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                   {activeQueue.length === 0 ? (
                     <div className="h-full flex flex-col items-center justify-center text-zinc-600 gap-2">
                        <Users size={32} className="opacity-20"/>
                        <p className="text-sm">Queue is empty</p>
                     </div>
                   ) : (
                     activeQueue.map((cust, idx) => (
                        <div key={cust.id} className="relative group bg-zinc-900 border border-white/10 hover:border-blue-500/50 p-4 rounded-2xl transition-all hover:shadow-[0_0_20px_rgba(59,130,246,0.1)]">
                           <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500/50 rounded-l-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                           <div className="flex items-center justify-between">
                             <div className="flex items-center gap-3">
                                <span className="text-lg font-black text-zinc-700 w-6">#{idx+1}</span>
                                <div>
                                  <h4 className="font-bold text-sm text-white">{cust.name}</h4>
                                  <p className="text-xs text-zinc-400">{cust.service}</p>
                                </div>
                             </div>
                             <button onClick={() => handleStartService(cust)} className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition border border-white/5">
                                <Play size={14} fill="currentColor" />
                             </button>
                           </div>
                        </div>
                     ))
                   )}
                 </div>
             </div>

             {/* COLUMN 3: ACTIVE CHAIR (Featured) */}
             <div className="flex flex-col bg-gradient-to-b from-zinc-900/50 to-zinc-900/20 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-sm relative">
                 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-cyan-500 shadow-[0_0_15px_#10b981]"></div>
                 <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5">
                   <h3 className="font-bold text-sm text-zinc-100 flex items-center gap-2">
                     <Scissors size={14} className="text-emerald-400"/> In The Chair
                   </h3>
                   <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded animate-pulse">
                     LIVE
                   </div>
                 </div>
                 
                 <div className="flex-1 flex flex-col items-center justify-center p-6 text-center relative">
                   {inChair ? (
                     <>
                       {/* Glow effect behind avatar */}
                       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-emerald-500/20 rounded-full blur-[60px] animate-pulse-slow pointer-events-none"></div>
                       
                       <div className="relative mb-6">
                          <div className="w-28 h-28 rounded-full p-1 bg-gradient-to-tr from-emerald-400 to-cyan-400 shadow-2xl shadow-emerald-500/20">
                             <div className="w-full h-full rounded-full bg-zinc-900 flex items-center justify-center text-4xl font-bold text-white relative overflow-hidden">
                                {inChair.name.charAt(0)}
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50"></div>
                             </div>
                          </div>
                          <div className="absolute bottom-0 right-0 bg-zinc-900 rounded-full p-1 border border-zinc-700">
                             <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                                <Activity size={12} className="text-black animate-spin-slow"/>
                             </div>
                          </div>
                       </div>

                       <h2 className="text-2xl font-black text-white mb-1 tracking-tight">{inChair.name}</h2>
                       <p className="text-emerald-400 font-medium text-sm mb-6">{inChair.service}</p>

                       {/* Timer / Progress Bar Simulation */}
                       <div className="w-full bg-zinc-800/50 rounded-full h-1.5 mb-2 overflow-hidden">
                          <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-full w-[45%] rounded-full shadow-[0_0_10px_#10b981]"></div>
                       </div>
                       <div className="w-full flex justify-between text-[10px] text-zinc-500 font-mono mb-8">
                          <span>12:30 min</span>
                          <span>Est. 25:00</span>
                       </div>

                       <button 
                          onClick={handleCompleteService}
                          className="w-full py-4 rounded-xl bg-white text-black font-bold text-sm shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 group"
                       >
                          <CheckSquare size={18} className="text-emerald-600 group-hover:scale-110 transition-transform"/> 
                          Complete Service
                       </button>
                     </>
                   ) : (
                     <div className="text-zinc-600 flex flex-col items-center">
                        <div className="w-20 h-20 rounded-full border-2 border-dashed border-zinc-800 flex items-center justify-center mb-4">
                           <Scissors size={24} />
                        </div>
                        <p className="font-medium text-sm">Chair Empty</p>
                        <p className="text-xs mt-1 max-w-[150px]">Select a customer from the queue to start.</p>
                     </div>
                   )}
                 </div>
             </div>

           </div>
        </div>
      </main>
    </div>
  );
};

export default SalonDashboard;