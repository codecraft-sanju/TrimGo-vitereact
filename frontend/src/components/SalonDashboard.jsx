import React, { useState, useEffect, useRef } from "react";
import {
  Grid, Activity, Users, Ticket, Settings, LogOut, ChevronRight,
  Bell, DollarSign, TrendingUp, Clock, CheckCircle, Scissors,
  Play, CheckSquare, X, Camera, Mail, Phone, MapPin, User,
  Armchair, UserCheck, Plus, Trash2, Menu
} from "lucide-react";

// --- CONSTANTS & MOCK DATA ---

const INITIAL_SALON_REQUESTS = [
  { id: 101, name: "Rahul Sharma", service: "Haircut & Beard", time: "10 min ago", status: "pending", price: 350, gender: 'male' },
  { id: 102, name: "Amit Verma", service: "Hair Spa", time: "2 min ago", status: "pending", price: 800, gender: 'male' },
  { id: 103, name: "Vikram Singh", service: "Shaving", time: "Just now", status: "pending", price: 150, gender: 'male' },
];

const INITIAL_ACTIVE_QUEUE = [
  { id: 201, name: "Suresh Raina", service: "Haircut", status: "waiting", waitTime: 15, price: 250 },
  { id: 202, name: "Mahendra S.", service: "Beard Trim", status: "waiting", waitTime: 30, price: 100 },
  { id: 203, name: "Virat K.", service: "Head Massage", status: "waiting", waitTime: 45, price: 500 },
];

const AVAILABLE_STAFF = [
  { id: 's1', name: "Rajesh (Sr.)", status: 'available' },
  { id: 's2', name: "Sonu", status: 'available' },
  { id: 's3', name: "Sameer", status: 'available' },
  { id: 's4', name: "Priya", status: 'available' },
];

// Initialize 4 Chairs (Scalable up to 6)
const INITIAL_CHAIRS = Array.from({ length: 4 }, (_, i) => ({
  id: i + 1,
  name: `Chair ${i + 1}`,
  status: 'empty', // empty, occupied
  currentCustomer: null,
  assignedStaff: null,
  startTime: null
}));

// --- SUB-COMPONENTS ---

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

// Modal to assign Staff and Chair
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
        <p className="text-zinc-400 text-sm mb-6">For <span className="text-white font-medium">{customer.name}</span></p>

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
                <option key={s.id} value={s.name}>{s.name}</option>
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
  const [requests, setRequests] = useState(INITIAL_SALON_REQUESTS);
  const [activeQueue, setActiveQueue] = useState(INITIAL_ACTIVE_QUEUE);
  
  // New State for Multi-Chair System
  const [chairs, setChairs] = useState(INITIAL_CHAIRS);
  const [staff, setStaff] = useState(AVAILABLE_STAFF);

  const [isOnline, setIsOnline] = useState(true);
  const [stats, setStats] = useState({ revenue: 12500, customers: 24, waitTime: 15 });
  const [currentTime, setCurrentTime] = useState(new Date());

  // Responsive Menu State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Modals
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  
  // Assignment Modal State
  const [assignmentModal, setAssignmentModal] = useState({ isOpen: false, customer: null });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const getOwnerInitials = (name) => {
    if (!name) return "TG";
    const parts = name.split(" ");
    return parts.length >= 2 ? (parts[0][0] + parts[1][0]).toUpperCase() : name.slice(0, 2).toUpperCase();
  };

  const handleAcceptRequest = (req) => {
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

  const handleRejectRequest = (id) => {
    setRequests(requests.filter(r => r.id !== id));
  };

  // Trigger Assignment Modal
  const openAssignmentModal = (customer) => {
    const availableChairs = chairs.filter(c => c.status === 'empty');
    if (availableChairs.length === 0) {
      alert("All chairs are currently occupied! Please wait for a service to complete.");
      return;
    }
    setAssignmentModal({ isOpen: true, customer, availableChairs });
  };

  // Execute Service Start
  const handleStartService = (customer, chairId, staffName) => {
    setChairs(prevChairs => prevChairs.map(chair => {
      if (chair.id === chairId) {
        return {
          ...chair,
          status: 'occupied',
          currentCustomer: { ...customer, startTime: Date.now() },
          assignedStaff: staffName
        };
      }
      return chair;
    }));
    setActiveQueue(activeQueue.filter(c => c.id !== customer.id));
  };

  // Complete Service & Free Chair
  const handleCompleteService = (chairId) => {
    const chair = chairs.find(c => c.id === chairId);
    if (chair && chair.currentCustomer) {
      setStats(prev => ({
        ...prev,
        revenue: prev.revenue + chair.currentCustomer.price, 
        customers: prev.customers + 1
      }));
      
      setChairs(prevChairs => prevChairs.map(c => {
        if (c.id === chairId) {
          return { ...c, status: 'empty', currentCustomer: null, assignedStaff: null, startTime: null };
        }
        return c;
      }));
    }
  };

  // REMOVE CHAIR LOGIC
  const handleRemoveChair = (chairId) => {
    const chairToRemove = chairs.find(c => c.id === chairId);
    if (chairToRemove.status === 'occupied') {
      alert("Cannot remove this chair because it is currently occupied!");
      return;
    }
    if (window.confirm(`Are you sure you want to remove ${chairToRemove.name}?`)) {
      setChairs(chairs.filter(c => c.id !== chairId));
    }
  };

  const getAvatarGradient = (name) => {
    const gradients = ["from-pink-500 to-rose-500", "from-indigo-500 to-blue-500", "from-emerald-500 to-teal-500", "from-orange-500 to-amber-500"];
    return gradients[name.length % gradients.length];
  };

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

      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-zinc-950 to-black"></div>
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] animate-pulse-slow"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-[120px] animate-pulse-slow animation-delay-2000"></div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Responsive */}
      <aside 
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 border-r border-white/5 bg-zinc-900/95 lg:bg-zinc-900/40 backdrop-blur-xl transform transition-transform duration-300 ease-in-out flex flex-col ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="h-20 flex items-center px-6 border-b border-white/5 gap-3">
           <div className="w-10 h-10 bg-white text-black rounded-xl flex items-center justify-center font-bold text-sm shadow-[0_0_20px_rgba(255,255,255,0.3)]">TG</div>
           <span className="font-bold text-lg">TrimGo</span>
           {/* Close Button for Mobile */}
           <button onClick={() => setIsMobileMenuOpen(false)} className="ml-auto lg:hidden text-zinc-400 hover:text-white">
             <X size={20} />
           </button>
        </div>
        <nav className="flex-1 py-8 flex flex-col gap-2 px-3 overflow-y-auto">
           {[
             { icon: Grid, label: "Dashboard", active: true },
             { icon: Activity, label: "Analytics", active: false },
             { icon: Users, label: "Customers", active: false },
             { icon: Ticket, label: "Bookings", active: false },
             { icon: UserCheck, label: "Staff", active: false },
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

      {/* Main Content */}
      <main className="flex-1 relative z-10 flex flex-col h-screen overflow-hidden">
        
        {/* Header */}
        <header className="h-20 border-b border-white/5 bg-zinc-900/30 backdrop-blur-md flex items-center justify-between px-4 lg:px-8 shrink-0">
           <div className="flex items-center gap-4">
             {/* Mobile Menu Toggle */}
             <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-white/5">
                <Menu size={24} />
             </button>
             <div className="flex flex-col">
               <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                  {salon?.salonName || "My Salon"}
                  <ChevronRight size={16} className="text-zinc-600 hidden sm:block"/>
                  <span className="text-zinc-400 font-normal text-sm hidden sm:block">Dashboard</span>
               </h1>
               <p className="text-xs text-zinc-500 font-mono mt-0.5">{currentTime.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
             </div>
           </div>

           <div className="flex items-center gap-3 sm:gap-4">
             <div onClick={() => setIsOnline(!isOnline)} className={`cursor-pointer px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border flex items-center gap-2 transition-all ${isOnline ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
                 <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`}></span>
                 <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider hidden sm:block">{isOnline ? 'Accepting' : 'Offline'}</span>
             </div>
             <div className="w-px h-8 bg-white/10 mx-1 hidden sm:block"></div>
             <div onClick={() => setIsProfileOpen(true)} className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-tr from-zinc-700 to-zinc-600 p-0.5 cursor-pointer hover:scale-105 transition overflow-hidden">
                {profileImage ? <img src={profileImage} alt="Profile" className="w-full h-full rounded-full object-cover" /> : <div className="w-full h-full rounded-full bg-zinc-900 flex items-center justify-center text-xs font-bold text-white">{getOwnerInitials(salon?.ownerName)}</div>}
             </div>
           </div>
        </header>

        {/* Dashboard Workspace - Responsive Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6 scrollbar-hide">
           
           {/* Stats Row */}
           <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
             <div className="col-span-2 lg:col-span-1 group relative bg-zinc-900/50 hover:bg-zinc-900/80 border border-white/5 rounded-3xl p-4 sm:p-6 transition-all">
                 <div className="flex items-end gap-2">
                   <h3 className="text-2xl sm:text-3xl font-black text-white">₹{stats.revenue}</h3>
                   <span className="text-xs text-emerald-400 font-bold mb-1.5 flex items-center gap-1"><TrendingUp size={10}/> +12%</span>
                 </div>
                 <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">Today's Revenue</p>
             </div>
             
             <div className="group relative bg-zinc-900/50 hover:bg-zinc-900/80 border border-white/5 rounded-3xl p-4 sm:p-6 transition-all">
                 <div className="flex items-end gap-2">
                   <h3 className="text-2xl sm:text-3xl font-black text-white">{chairs.filter(c => c.status === 'occupied').length} / {chairs.length}</h3>
                 </div>
                 <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">Chairs Busy</p>
             </div>

             <div className="group relative bg-zinc-900/50 hover:bg-zinc-900/80 border border-white/5 rounded-3xl p-4 sm:p-6 transition-all">
                 <div className="flex items-end gap-2">
                   <h3 className="text-2xl sm:text-3xl font-black text-white">{activeQueue.length}</h3>
                   <span className="text-xs text-zinc-400 font-medium mb-1.5">waiting</span>
                 </div>
                 <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">In Queue</p>
             </div>

             <div className="group relative bg-zinc-900/50 hover:bg-zinc-900/80 border border-white/5 rounded-3xl p-4 sm:p-6 transition-all">
                 <div className="flex items-end gap-2">
                   <h3 className="text-2xl sm:text-3xl font-black text-white">{stats.customers}</h3>
                 </div>
                 <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">Completed</p>
             </div>
           </div>

           {/* MAIN KANBAN BOARD - RESPONSIVE LAYOUT */}
           {/* Desktop: Fixed height with internal scroll. Mobile: Auto height (stacking) */}
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:h-[calc(100vh-320px)] lg:min-h-[500px]">
             
             {/* COL 1: NEW REQUESTS */}
             <div className="flex flex-col bg-zinc-900/30 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-sm min-h-[300px] lg:h-full">
                 <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5">
                   <h3 className="font-bold text-sm text-zinc-100 flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full bg-yellow-500"></div> New Requests
                   </h3>
                   <span className="text-xs font-bold bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-md">{requests.length}</span>
                 </div>
                 <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar max-h-[400px] lg:max-h-none">
                   {requests.length === 0 ? (
                     <div className="h-40 lg:h-full flex flex-col items-center justify-center text-zinc-600 gap-2"><Bell size={32} className="opacity-20"/><p className="text-sm">No new requests</p></div>
                   ) : (
                     requests.map(req => (
                       <div key={req.id} className="bg-zinc-900 border border-white/10 p-4 rounded-2xl">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-3">
                               <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarGradient(req.name)} flex items-center justify-center text-sm font-bold shadow-lg`}>{req.name.charAt(0)}</div>
                               <div>
                                 <h4 className="font-bold text-sm text-white">{req.name}</h4>
                                 <p className="text-xs text-zinc-400">{req.service}</p>
                               </div>
                            </div>
                            <span className="text-[10px] font-mono text-zinc-500 bg-zinc-950 px-2 py-1 rounded">{req.time}</span>
                          </div>
                          <div className="flex items-center justify-between mt-3 gap-2">
                            <div className="text-xs font-bold text-zinc-300">₹{req.price}</div>
                            <div className="flex gap-2">
                               <button onClick={() => handleRejectRequest(req.id)} className="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-red-400 transition"><X size={16}/></button>
                               <button onClick={() => handleAcceptRequest(req)} className="px-4 py-2 rounded-lg bg-white text-black text-xs font-bold hover:bg-emerald-400 hover:shadow-[0_0_15px_#34d399] transition-all">Accept</button>
                            </div>
                          </div>
                       </div>
                     ))
                   )}
                 </div>
             </div>

             {/* COL 2: WAITING QUEUE */}
             <div className="flex flex-col bg-zinc-900/30 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-sm min-h-[300px] lg:h-full">
                 <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5">
                   <h3 className="font-bold text-sm text-zinc-100 flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full bg-blue-500"></div> Waiting Queue
                   </h3>
                   <span className="text-xs font-bold bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-md">{activeQueue.length}</span>
                 </div>
                 <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar max-h-[400px] lg:max-h-none">
                   {activeQueue.length === 0 ? (
                     <div className="h-40 lg:h-full flex flex-col items-center justify-center text-zinc-600 gap-2"><Users size={32} className="opacity-20"/><p className="text-sm">Queue is empty</p></div>
                   ) : (
                     activeQueue.map((cust, idx) => (
                       <div key={cust.id} className="relative group bg-zinc-900 border border-white/10 hover:border-blue-500/50 p-4 rounded-2xl transition-all">
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500/50 rounded-l-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                               <span className="text-lg font-black text-zinc-700 w-6">#{idx+1}</span>
                               <div>
                                 <h4 className="font-bold text-sm text-white">{cust.name}</h4>
                                 <p className="text-xs text-zinc-400">{cust.service}</p>
                               </div>
                            </div>
                            <button onClick={() => openAssignmentModal(cust)} className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition border border-white/5" title="Assign to Chair">
                               <Play size={14} fill="currentColor" />
                            </button>
                          </div>
                       </div>
                     ))
                   )}
                 </div>
             </div>

             {/* COL 3: SERVICE FLOOR (MULTI-CHAIR) */}
             <div className="flex flex-col bg-zinc-900/30 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-sm relative min-h-[400px] lg:h-full">
                 <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5">
                   <h3 className="font-bold text-sm text-zinc-100 flex items-center gap-2">
                     <Scissors size={14} className="text-emerald-400"/> Service Floor
                   </h3>
                   <div className="flex items-center gap-2">
                     <span className="text-[10px] text-zinc-500 font-bold uppercase">{chairs.length} Chairs</span>
                     <button onClick={() => setChairs([...chairs, { id: chairs.length + 1, name: `Chair ${chairs.length + 1}`, status: 'empty' }])} disabled={chairs.length >= 6} className="w-6 h-6 rounded bg-zinc-800 flex items-center justify-center hover:text-white disabled:opacity-30"><Plus size={14}/></button>
                   </div>
                 </div>
                 
                 <div className="flex-1 overflow-y-auto p-4 custom-scrollbar max-h-[600px] lg:max-h-none">
                   <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                      {chairs.map((chair) => (
                        <div key={chair.id} className={`relative rounded-2xl p-4 border transition-all ${chair.status === 'occupied' ? 'bg-gradient-to-b from-zinc-900 to-zinc-900/50 border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.05)]' : 'bg-zinc-900 border-white/5 border-dashed'}`}>
                          
                          {/* DELETE CHAIR BUTTON (Only if empty) */}
                          {chair.status !== 'occupied' && (
                             <button 
                               onClick={() => handleRemoveChair(chair.id)}
                               className="absolute top-2 right-2 p-1.5 rounded-lg text-zinc-700 hover:text-red-500 hover:bg-red-500/10 transition-colors z-20"
                               title="Remove Chair"
                             >
                               <Trash2 size={14} />
                             </button>
                          )}

                          <div className="flex justify-between items-start mb-4">
                             <div className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${chair.status === 'occupied' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-600'}`}>
                                   <Armchair size={16} />
                                </div>
                                <div>
                                  <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{chair.name}</h4>
                                  <p className={`text-[10px] font-bold ${chair.status === 'occupied' ? 'text-emerald-400' : 'text-zinc-600'}`}>{chair.status === 'occupied' ? 'ACTIVE' : 'EMPTY'}</p>
                                </div>
                             </div>
                             {chair.assignedStaff && (
                               <div className="flex items-center gap-1 bg-zinc-950 px-2 py-1 rounded border border-white/5">
                                 <UserCheck size={10} className="text-zinc-400"/>
                                 <span className="text-[10px] font-medium text-zinc-300">{chair.assignedStaff}</span>
                               </div>
                             )}
                          </div>

                          {chair.status === 'occupied' && chair.currentCustomer ? (
                            <>
                              <div className="flex items-center gap-3 mb-4">
                                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarGradient(chair.currentCustomer.name)} flex items-center justify-center text-sm font-bold`}>
                                  {chair.currentCustomer.name.charAt(0)}
                                </div>
                                <div>
                                  <h5 className="font-bold text-white text-sm">{chair.currentCustomer.name}</h5>
                                  <p className="text-xs text-emerald-400">{chair.currentCustomer.service}</p>
                                </div>
                              </div>
                              <button 
                                onClick={() => handleCompleteService(chair.id)}
                                className="w-full py-2 bg-white text-black text-xs font-bold rounded-lg hover:bg-emerald-400 transition-colors flex items-center justify-center gap-2"
                              >
                                <CheckSquare size={14}/> Complete
                              </button>
                            </>
                          ) : (
                            <div className="h-20 flex flex-col items-center justify-center text-zinc-700 gap-1">
                               <p className="text-xs font-medium">Ready for customer</p>
                               {activeQueue.length > 0 && (
                                 <button 
                                   onClick={() => openAssignmentModal(activeQueue[0])}
                                   className="text-[10px] font-bold text-blue-400 hover:underline"
                                 >
                                   Assign Next
                                 </button>
                               )}
                            </div>
                          )}
                        </div>
                      ))}
                   </div>
                 </div>
             </div>

           </div>
        </div>
      </main>
    </div>
  );
};

export default SalonDashboard;