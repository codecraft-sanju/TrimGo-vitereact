import React, { useState, useEffect, useRef } from "react";
import {
  Grid, Activity, Users, Ticket, Settings, LogOut, ChevronRight,
  Bell, DollarSign, TrendingUp, Clock, CheckCircle, Scissors,
  Play, CheckSquare, X, Camera, Mail, Phone, MapPin, User,
  Armchair, UserCheck, Plus, Trash2, Menu, Save, Edit3, Power,
  AlertTriangle, Sparkles, Zap, ArrowRight // <--- Fixed: Imported ArrowRight
} from "lucide-react";
import api from "../utils/api";
import { io } from "socket.io-client";

// --- CONSTANTS: SUGGESTED SERVICES (Quick Add Menu) ---
const SUGGESTED_SERVICES = [
  { name: "Haircut (Men)", price: 200, time: 30, category: "Hair" },
  { name: "Haircut (Women)", price: 400, time: 45, category: "Hair" },
  { name: "Beard Trim", price: 100, time: 15, category: "Face" },
  { name: "Clean Shave", price: 150, time: 20, category: "Face" },
  { name: "Haircut + Beard", price: 280, time: 40, category: "Combo" },
  { name: "Head Massage", price: 250, time: 20, category: "Massage" },
  { name: "Face Cleanup", price: 500, time: 30, category: "Face" },
  { name: "Facial (Gold)", price: 1200, time: 60, category: "Face" },
  { name: "D-Tan Pack", price: 300, time: 20, category: "Face" },
  { name: "Hair Spa", price: 800, time: 60, category: "Hair" },
  { name: "Hair Color (Global)", price: 1500, time: 90, category: "Hair" },
  { name: "Bleach", price: 250, time: 20, category: "Face" },
];

// --- SUB-COMPONENTS ---

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
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-md bg-zinc-900 border border-white/10 rounded-3xl p-6 shadow-2xl animate-[scaleIn_0.2s_ease-out]">
        <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white transition">
          <X size={20} />
        </button>
        <div className="flex flex-col items-center">
          <h2 className="text-xl font-bold text-white mb-6">Salon Profile</h2>
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
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
          </div>
          <h3 className="text-2xl font-black text-white mb-1">{salon?.salonName || "TrimGo Salon"}</h3>
          <p className="text-emerald-400 text-sm font-medium mb-8">@{salon?.ownerName?.replace(/\s/g, '').toLowerCase() || "sanjaychoudhary"}</p>
        </div>
      </div>
    </div>
  );
};

const AssignmentModal = ({ isOpen, onClose, customer, availableChairs, staffList, onConfirm }) => {
  const [selectedChair, setSelectedChair] = useState("");
  const [selectedStaff, setSelectedStaff] = useState("");

  if (!isOpen || !customer) return null;

  const handleSubmit = () => {
    if (selectedChair && selectedStaff) {
      onConfirm(customer, Number(selectedChair), selectedStaff);
      onClose();
    } else {
      alert("Please select both a Chair and a Staff member.");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-sm bg-zinc-900 border border-white/10 rounded-2xl p-6 shadow-2xl">
        <h3 className="text-lg font-bold text-white mb-1">Start Service</h3>
        <p className="text-zinc-400 text-sm mb-6">For <span className="text-white font-medium">{customer.userId?.name || "Customer"}</span></p>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-zinc-500 uppercase block mb-2">Select Chair</label>
            <div className="grid grid-cols-2 gap-2">
              {availableChairs.length > 0 ? availableChairs.map(chair => (
                <div 
                  key={chair.id}
                  onClick={() => setSelectedChair(chair.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-2 ${selectedChair === chair.id ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-zinc-950 border-white/10 text-zinc-400 hover:border-white/20'}`}
                >
                  <Armchair size={16} />
                  <span className="text-sm font-bold">{chair.name}</span>
                </div>
              )) : <div className="text-red-400 text-xs col-span-2">No chairs available</div>}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-500 uppercase block mb-2">Assign Staff</label>
            <select 
              className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500"
              onChange={(e) => setSelectedStaff(e.target.value)}
              value={selectedStaff}
            >
              <option value="">Select Staff Member</option>
              {staffList.map(s => (
                <option key={s.id || s.name} value={s.name}>{s.name}</option>
              ))}
            </select>
          </div>
          
          <button 
            onClick={handleSubmit}
            disabled={!selectedChair || !selectedStaff}
            className="w-full py-3 mt-4 bg-white text-black font-bold rounded-xl hover:bg-emerald-400 disabled:opacity-50 disabled:hover:bg-white transition-colors"
          >
            Start Service
          </button>
        </div>
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---

const SalonDashboard = ({ salon, onLogout }) => {
  const [activeTab, setActiveTab] = useState("dashboard"); // 'dashboard' | 'settings'
  
  // Dashboard Data
  const [requests, setRequests] = useState([]);
  const [activeQueue, setActiveQueue] = useState([]);
  const [chairs, setChairs] = useState(Array.from({ length: 4 }, (_, i) => ({
    id: i + 1, name: `Chair ${i + 1}`, status: 'empty', currentCustomer: null, assignedStaff: null
  })));
  
  // Settings Data
  const [services, setServices] = useState([]);
  const [staff, setStaff] = useState([]);
  const [newService, setNewService] = useState({ name: "", price: "", time: "", category: "Hair" });
  const [newStaffName, setNewStaffName] = useState("");

  const [isOnline, setIsOnline] = useState(true);
  const [stats, setStats] = useState({ revenue: 0, customers: 0 });
  const [currentTime, setCurrentTime] = useState(new Date());

  // UI States
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [assignmentModal, setAssignmentModal] = useState({ isOpen: false, customer: null });

  // --- 1. INITIAL FETCH & SOCKET ---
  useEffect(() => {
   const socket = io(import.meta.env.VITE_BACKEND_URL);
    if(salon?._id) {
        socket.emit("join_room", `salon_${salon._id}`);
    }

    socket.on("new_request", (ticket) => {
        setRequests(prev => [...prev, ticket]);
    });

    socket.on("queue_updated", () => {
        fetchDashboardData();
    });

    fetchDashboardData();
    fetchSalonProfile();

    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => {
        socket.disconnect();
        clearInterval(timer);
    }
  }, [salon]);

  // --- API CALLS ---
  const fetchDashboardData = async () => {
    try {
        const { data } = await api.get("/queue/salon-dashboard");
        if(data.success) {
            setRequests(data.requests);
            setActiveQueue(data.waiting);
            setStats(data.stats);
        }
    } catch (error) { console.error("Dashboard Sync Error", error); }
  };

  const fetchSalonProfile = async () => {
      try {
          const { data } = await api.get("/salon/me");
          if(data.success) {
              setServices(data.salon.services || []);
              setStaff(data.salon.staff || [{name: data.salon.ownerName, status: 'available'}]);
              setIsOnline(data.salon.isOnline);
          }
      } catch (error) { console.error("Profile Fetch Error", error); }
  }

  // --- HANDLERS ---
  const handleAcceptRequest = async (req) => {
    try {
        await api.post("/queue/accept", { ticketId: req._id });
        setRequests(requests.filter(r => r._id !== req._id));
        setActiveQueue([...activeQueue, req]); 
    } catch (error) { alert("Failed to accept"); }
  };

  const openAssignmentModal = (customer) => {
    const availableChairs = chairs.filter(c => c.status === 'empty');
    if (availableChairs.length === 0) {
      alert("All chairs are occupied!");
      return;
    }
    setAssignmentModal({ isOpen: true, customer, availableChairs });
  };

  const handleStartService = async (customer, chairId, staffName) => {
    try {
        await api.post("/queue/start", { ticketId: customer._id, chairId, staffName });
        setChairs(prev => prev.map(c => 
            c.id === chairId ? { ...c, status: 'occupied', currentCustomer: customer, assignedStaff: staffName } : c
        ));
        setActiveQueue(activeQueue.filter(q => q._id !== customer._id));
    } catch (error) { alert("Failed to start service"); }
  };

  const handleCompleteService = async (chairId) => {
    const chair = chairs.find(c => c.id === chairId);
    if (!chair?.currentCustomer) return;
    try {
        await api.post("/queue/complete", { ticketId: chair.currentCustomer._id });
        setChairs(prev => prev.map(c => 
            c.id === chairId ? { ...c, status: 'empty', currentCustomer: null, assignedStaff: null } : c
        ));
    } catch (error) { alert("Error completing service"); }
  };

  // --- SETTINGS HANDLERS (Advanced) ---
  
  // Helper to fill form from suggestion
  const fillServiceSuggestion = (s) => {
      setNewService({ name: s.name, price: s.price, time: s.time, category: s.category });
  };

  const handleAddService = async () => {
      if(!newService.name || !newService.price || !newService.time) return;
      const updatedServices = [...services, { ...newService, price: Number(newService.price), time: Number(newService.time) }];
      try {
          await api.put("/salon/update", { services: updatedServices });
          setServices(updatedServices);
          setNewService({ name: "", price: "", time: "", category: "Hair" }); 
      } catch (error) { alert("Failed to save service"); }
  };

  const handleDeleteService = async (index) => {
      const updatedServices = services.filter((_, i) => i !== index);
      try {
          await api.put("/salon/update", { services: updatedServices });
          setServices(updatedServices);
      } catch (error) { alert("Failed to delete service"); }
  };

  const handleAddStaff = async () => {
      if(!newStaffName.trim()) return;
      const updatedStaff = [...staff, { name: newStaffName, status: 'available' }];
      try {
          await api.put("/salon/update", { staff: updatedStaff });
          setStaff(updatedStaff);
          setNewStaffName("");
      } catch (error) { alert("Failed to add staff"); }
  };

  const toggleOnlineStatus = async () => {
      try {
          const newStatus = !isOnline;
          await api.put("/salon/update", { isOnline: newStatus });
          setIsOnline(newStatus);
      } catch (error) { alert("Update failed"); }
  }

  // --- HELPERS ---
  const getAvatarGradient = (name) => {
    const n = name || "U";
    const gradients = ["from-pink-500 to-rose-500", "from-indigo-500 to-blue-500", "from-emerald-500 to-teal-500", "from-orange-500 to-amber-500"];
    return gradients[n.length % gradients.length];
  };

  // Check if services are empty (for onboarding banner)
  const isServicesEmpty = services.length === 0;

  return (
    <div className="min-h-screen w-full bg-zinc-950 font-sans text-white overflow-hidden flex selection:bg-emerald-500 selection:text-white">
      
      <ProfileModal 
        isOpen={isProfileOpen} 
        onClose={() => setIsProfileOpen(false)}
        salon={salon}
        profileImage={profileImage}
        onImageUpload={setProfileImage}
      />

      <AssignmentModal 
        isOpen={assignmentModal.isOpen}
        onClose={() => setAssignmentModal({ ...assignmentModal, isOpen: false })}
        customer={assignmentModal.customer}
        availableChairs={assignmentModal.availableChairs}
        staffList={staff}
        onConfirm={handleStartService}
      />

      <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-zinc-950 to-black"></div>
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] animate-pulse-slow"></div>
      </div>

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 border-r border-white/5 bg-zinc-900/95 lg:bg-zinc-900/40 backdrop-blur-xl transform transition-transform duration-300 ease-in-out flex flex-col ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="h-20 flex items-center px-6 border-b border-white/5 gap-3">
           <div className="w-10 h-10 bg-white text-black rounded-xl flex items-center justify-center font-bold text-sm shadow-[0_0_20px_rgba(255,255,255,0.3)]">TG</div>
           <span className="font-bold text-lg">TrimGo</span>
           <button onClick={() => setIsMobileMenuOpen(false)} className="ml-auto lg:hidden text-zinc-400 hover:text-white"><X size={20} /></button>
        </div>
        <nav className="flex-1 py-8 flex flex-col gap-2 px-3 overflow-y-auto">
           {[ { id: 'dashboard', icon: Grid, label: "Dashboard" }, { id: 'settings', icon: Settings, label: "Settings" } ].map((item) => (
             <button key={item.id} onClick={() => setActiveTab(item.id)} className={`flex items-center p-3 rounded-xl cursor-pointer transition-all w-full text-left ${activeTab === item.id ? 'bg-white/10 text-white shadow-lg shadow-white/5 border border-white/5' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}>
               <item.icon size={20} strokeWidth={2} />
               <span className="ml-3 font-medium">{item.label}</span>
               {activeTab === item.id && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]"></div>}
             </button>
           ))}
        </nav>
        <div className="p-4 border-t border-white/5">
          <button onClick={onLogout} className="flex items-center w-full p-3 rounded-xl text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors">
            <LogOut size={20} />
            <span className="ml-3 font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 relative z-10 flex flex-col h-screen overflow-hidden">
        
        {/* Header */}
        <header className="h-20 border-b border-white/5 bg-zinc-900/30 backdrop-blur-md flex items-center justify-between px-4 lg:px-8 shrink-0">
           <div className="flex items-center gap-4">
             <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-white/5">
                <Menu size={24} />
             </button>
             <div className="flex flex-col">
               <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                 {salon?.salonName || "My Salon"}
                 <ChevronRight size={16} className="text-zinc-600 hidden sm:block"/>
                 <span className="text-zinc-400 font-normal text-sm hidden sm:block">
                    {activeTab === 'dashboard' ? 'Live Operations' : 'Setup & Menu'}
                 </span>
               </h1>
               <p className="text-xs text-zinc-500 font-mono mt-0.5">{currentTime.toLocaleDateString()}</p>
             </div>
           </div>

           <div className="flex items-center gap-3 sm:gap-4">
             <div onClick={toggleOnlineStatus} className={`cursor-pointer px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border flex items-center gap-2 transition-all ${isOnline ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
                 <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`}></span>
                 <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider hidden sm:block">{isOnline ? 'Online' : 'Offline'}</span>
             </div>
             <div onClick={() => setIsProfileOpen(true)} className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-tr from-zinc-700 to-zinc-600 p-0.5 cursor-pointer hover:scale-105 transition overflow-hidden">
                {profileImage ? <img src={profileImage} alt="Profile" className="w-full h-full rounded-full object-cover" /> : <div className="w-full h-full rounded-full bg-zinc-900 flex items-center justify-center text-xs font-bold text-white">TG</div>}
             </div>
           </div>
        </header>

        {/* Dashboard Workspace */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6 scrollbar-hide">
           
           {/* VIEW: DASHBOARD */}
           {activeTab === 'dashboard' && (
             <>
                {/* 1. SETUP WARNING BANNER (Onboarding) */}
                {isServicesEmpty && (
                    <div className="mb-6 bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 p-6 rounded-3xl flex flex-col md:flex-row items-center justify-between animate-pulse">
                        <div className="mb-4 md:mb-0">
                            <h3 className="text-xl font-bold text-orange-400 flex items-center gap-2">
                                <AlertTriangle className="text-orange-500" /> Setup Incomplete
                            </h3>
                            <p className="text-zinc-400 text-sm mt-1 max-w-xl">
                                Your service menu is empty. Customers cannot see your salon or book appointments until you add at least one service.
                            </p>
                        </div>
                        <button 
                            onClick={() => setActiveTab('settings')}
                            className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-orange-500/20 flex items-center gap-2"
                        >
                            Go to Setup <ArrowRight size={16} />
                        </button>
                    </div>
                )}

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
                  <div className="col-span-2 lg:col-span-1 group relative bg-zinc-900/50 hover:bg-zinc-900/80 border border-white/5 rounded-3xl p-4 sm:p-6 transition-all">
                      <div className="flex items-end gap-2">
                        <h3 className="text-2xl sm:text-3xl font-black text-white">₹{stats.revenue}</h3>
                        <span className="text-xs text-emerald-400 font-bold mb-1.5 flex items-center gap-1"><TrendingUp size={10}/> Daily</span>
                      </div>
                      <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">Revenue</p>
                  </div>
                  <div className="group relative bg-zinc-900/50 hover:bg-zinc-900/80 border border-white/5 rounded-3xl p-4 sm:p-6 transition-all">
                      <h3 className="text-2xl sm:text-3xl font-black text-white">{chairs.filter(c => c.status === 'occupied').length} / {chairs.length}</h3>
                      <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">Busy Chairs</p>
                  </div>
                  <div className="group relative bg-zinc-900/50 hover:bg-zinc-900/80 border border-white/5 rounded-3xl p-4 sm:p-6 transition-all">
                      <h3 className="text-2xl sm:text-3xl font-black text-white">{activeQueue.length}</h3>
                      <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">Waiting</p>
                  </div>
                  <div className="group relative bg-zinc-900/50 hover:bg-zinc-900/80 border border-white/5 rounded-3xl p-4 sm:p-6 transition-all">
                      <h3 className="text-2xl sm:text-3xl font-black text-white">{stats.customers}</h3>
                      <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">Done</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:h-[calc(100vh-320px)] lg:min-h-[500px]">
                  <div className="flex flex-col bg-zinc-900/30 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-sm min-h-[300px] lg:h-full">
                      <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5">
                        <h3 className="font-bold text-sm text-zinc-100 flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-yellow-500"></div> New Requests
                        </h3>
                        <span className="text-xs font-bold bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-md">{requests.length}</span>
                      </div>
                      <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                        {requests.length === 0 ? <div className="h-40 lg:h-full flex flex-col items-center justify-center text-zinc-600 gap-2"><Bell size={32} className="opacity-20"/><p className="text-sm">No new requests</p></div> : requests.map(req => (
                            <div key={req._id} className="bg-zinc-900 border border-white/10 p-4 rounded-2xl animate-in fade-in slide-in-from-bottom-2">
                               <div className="flex justify-between items-start mb-3">
                                 <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarGradient(req.userId?.name)} flex items-center justify-center text-sm font-bold shadow-lg`}>{req.userId?.name?.charAt(0) || "U"}</div>
                                    <div>
                                      <h4 className="font-bold text-sm text-white">{req.userId?.name || "User"}</h4>
                                      <p className="text-xs text-zinc-400">{req.services[0]?.name} {req.services.length > 1 && `+${req.services.length - 1}`}</p>
                                    </div>
                                 </div>
                                 <span className="text-[10px] font-mono text-zinc-500 bg-zinc-950 px-2 py-1 rounded">{new Date(req.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                               </div>
                               <div className="flex items-center justify-between mt-3 gap-2">
                                 <div className="text-xs font-bold text-zinc-300">₹{req.totalPrice}</div>
                                 <button onClick={() => handleAcceptRequest(req)} className="px-4 py-2 rounded-lg bg-white text-black text-xs font-bold hover:bg-emerald-400 transition-all">Accept</button>
                               </div>
                            </div>
                        ))}
                      </div>
                  </div>

                  <div className="flex flex-col bg-zinc-900/30 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-sm min-h-[300px] lg:h-full">
                      <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5">
                        <h3 className="font-bold text-sm text-zinc-100 flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div> Waiting Queue
                        </h3>
                        <span className="text-xs font-bold bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-md">{activeQueue.length}</span>
                      </div>
                      <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                        {activeQueue.length === 0 ? <div className="h-40 lg:h-full flex flex-col items-center justify-center text-zinc-600 gap-2"><Users size={32} className="opacity-20"/><p className="text-sm">Queue is empty</p></div> : activeQueue.map((cust, idx) => (
                            <div key={cust._id} className="relative group bg-zinc-900 border border-white/10 hover:border-blue-500/50 p-4 rounded-2xl transition-all">
                               <div className="flex items-center justify-between">
                                 <div className="flex items-center gap-3">
                                    <span className="text-lg font-black text-zinc-700 w-6">#{cust.queueNumber}</span>
                                    <div>
                                      <h4 className="font-bold text-sm text-white">{cust.userId?.name}</h4>
                                      <p className="text-xs text-zinc-400">{cust.services[0]?.name}</p>
                                    </div>
                                 </div>
                                 <button onClick={() => openAssignmentModal(cust)} className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-emerald-400 transition border border-white/5">
                                    <Play size={14} fill="currentColor" />
                                 </button>
                               </div>
                            </div>
                        ))}
                      </div>
                  </div>

                  <div className="flex flex-col bg-zinc-900/30 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-sm relative min-h-[400px] lg:h-full">
                      <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5">
                        <h3 className="font-bold text-sm text-zinc-100 flex items-center gap-2"><Scissors size={14} className="text-emerald-400"/> Service Floor</h3>
                        <div className="flex items-center gap-2"><span className="text-[10px] text-zinc-500 font-bold uppercase">{chairs.length} Chairs</span></div>
                      </div>
                      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                           {chairs.map((chair) => (
                             <div key={chair.id} className={`relative rounded-2xl p-4 border transition-all ${chair.status === 'occupied' ? 'bg-gradient-to-b from-zinc-900 to-zinc-900/50 border-emerald-500/30' : 'bg-zinc-900 border-white/5 border-dashed'}`}>
                                <div className="flex justify-between items-start mb-4">
                                   <div className="flex items-center gap-2">
                                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${chair.status === 'occupied' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-600'}`}><Armchair size={16} /></div>
                                      <div>
                                         <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{chair.name}</h4>
                                         <p className={`text-[10px] font-bold ${chair.status === 'occupied' ? 'text-emerald-400' : 'text-zinc-600'}`}>{chair.status === 'occupied' ? 'ACTIVE' : 'EMPTY'}</p>
                                      </div>
                                   </div>
                                   {chair.assignedStaff && <div className="flex items-center gap-1 bg-zinc-950 px-2 py-1 rounded border border-white/5"><UserCheck size={10} className="text-zinc-400"/><span className="text-[10px] font-medium text-zinc-300">{chair.assignedStaff}</span></div>}
                                </div>
                                {chair.status === 'occupied' && chair.currentCustomer ? (
                                  <>
                                    <div className="flex items-center gap-3 mb-4">
                                      <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarGradient(chair.currentCustomer.userId?.name)} flex items-center justify-center text-sm font-bold`}>{chair.currentCustomer.userId?.name?.charAt(0)}</div>
                                      <div><h5 className="font-bold text-white text-sm">{chair.currentCustomer.userId?.name}</h5><p className="text-xs text-emerald-400">{chair.currentCustomer.services[0]?.name}</p></div>
                                    </div>
                                    <button onClick={() => handleCompleteService(chair.id)} className="w-full py-2 bg-white text-black text-xs font-bold rounded-lg hover:bg-emerald-400 transition-colors flex items-center justify-center gap-2"><CheckSquare size={14}/> Complete</button>
                                  </>
                                ) : (
                                  <div className="h-20 flex flex-col items-center justify-center text-zinc-700 gap-1"><p className="text-xs font-medium">Ready for customer</p>{activeQueue.length > 0 && <button onClick={() => openAssignmentModal(activeQueue[0])} className="text-[10px] font-bold text-blue-400 hover:underline">Assign Next</button>}</div>
                                )}
                             </div>
                           ))}
                        </div>
                      </div>
                  </div>
                </div>
             </>
           )}

           {/* VIEW: SETTINGS (SERVICE MANAGER) */}
           {activeTab === 'settings' && (
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-2">
                
                {/* 1. Services Manager */}
                <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-6">
                   <h3 className="font-bold text-lg text-white mb-4 flex items-center gap-2"><Scissors className="text-emerald-400" size={20}/> Manage Services</h3>
                   
                   {/* QUICK ADD SUGGESTIONS (NEW) */}
                   <div className="mb-6">
                      <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 flex items-center gap-1"><Zap size={10} className="text-yellow-400"/> Quick Add (Click to fill)</p>
                      <div className="flex flex-wrap gap-2">
                          {SUGGESTED_SERVICES.map((s, i) => (
                              <button 
                                key={i}
                                onClick={() => fillServiceSuggestion(s)}
                                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-white/5 rounded-lg text-xs text-zinc-300 transition-colors flex items-center gap-1"
                              >
                                {s.name} <span className="opacity-50">• ₹{s.price}</span>
                              </button>
                          ))}
                      </div>
                   </div>

                   {/* MANUAL INPUT */}
                   <div className="space-y-3 mb-6 bg-zinc-900/80 p-4 rounded-2xl border border-white/5">
                      <div className="grid grid-cols-3 gap-2">
                         <input type="text" placeholder="Service Name (e.g. Haircut)" className="col-span-3 bg-zinc-950 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-emerald-500 outline-none transition-all focus:ring-1 focus:ring-emerald-500/50" value={newService.name} onChange={(e) => setNewService({...newService, name: e.target.value})} />
                         <input type="number" placeholder="Price (₹)" className="bg-zinc-950 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-emerald-500 outline-none" value={newService.price} onChange={(e) => setNewService({...newService, price: e.target.value})} />
                         <input type="number" placeholder="Time (min)" className="bg-zinc-950 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-emerald-500 outline-none" value={newService.time} onChange={(e) => setNewService({...newService, time: e.target.value})} />
                         <button onClick={handleAddService} className="bg-emerald-500 text-white rounded-xl flex items-center justify-center hover:bg-emerald-400 font-bold shadow-lg shadow-emerald-500/20 transition-all active:scale-95"><Plus size={20}/></button>
                      </div>
                   </div>

                   {/* LIST OF SERVICES */}
                   <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                      {services.length === 0 ? (
                          <div className="text-zinc-500 text-center text-sm py-8 border-2 border-dashed border-zinc-800 rounded-xl bg-zinc-900/30">
                              No services added yet.<br/>Select from Quick Add above.
                          </div>
                      ) : (
                          services.map((s, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-zinc-900 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                                <div><h4 className="font-bold text-sm text-white">{s.name}</h4><p className="text-xs text-zinc-400">₹{s.price} • {s.time} mins</p></div>
                                <button onClick={() => handleDeleteService(i)} className="p-2 text-zinc-500 hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors"><Trash2 size={16}/></button>
                            </div>
                          ))
                      )}
                   </div>
                </div>

                {/* 2. Staff & Status Manager */}
                <div className="space-y-6">
                   {/* Staff */}
                   <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-6">
                      <h3 className="font-bold text-lg text-white mb-4 flex items-center gap-2"><UserCheck className="text-blue-400" size={20}/> Staff Members</h3>
                      <div className="flex gap-2 mb-4">
                         <input type="text" placeholder="Staff Name" className="flex-1 bg-zinc-900 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-blue-500 outline-none" value={newStaffName} onChange={(e) => setNewStaffName(e.target.value)} />
                         <button onClick={handleAddStaff} className="px-4 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-400 shadow-lg shadow-blue-500/20">Add</button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                         {staff.map((s, i) => (
                            <div key={i} className="px-3 py-1.5 bg-zinc-800 rounded-lg text-xs text-white border border-white/5 flex items-center gap-2">
                               <div className="w-2 h-2 bg-green-500 rounded-full"></div> {s.name}
                            </div>
                         ))}
                      </div>
                   </div>

                   {/* Salon Status */}
                   <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-6">
                      <h3 className="font-bold text-lg text-white mb-4 flex items-center gap-2"><Power className="text-red-400" size={20}/> Salon Visibility</h3>
                      <div className="flex items-center justify-between bg-zinc-900 p-4 rounded-xl border border-white/5">
                         <div>
                            <h4 className="font-bold text-white">Online Status</h4>
                            <p className="text-xs text-zinc-500">Visible to customers on map</p>
                         </div>
                         <button onClick={toggleOnlineStatus} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-lg ${isOnline ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-red-500 text-white shadow-red-500/20'}`}>
                            {isOnline ? "LIVE NOW" : "OFFLINE"}
                         </button>
                      </div>
                   </div>
                </div>
             </div>
           )}

        </div>
      </main>
    </div>
  );
};

export default SalonDashboard;