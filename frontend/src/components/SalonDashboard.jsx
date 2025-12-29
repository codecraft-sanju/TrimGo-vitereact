import React, { useState, useEffect, useRef } from "react";
import {
  Grid, Activity, Users, Ticket, Settings, LogOut, ChevronRight,
  Bell, DollarSign, TrendingUp, Clock, CheckCircle, Scissors,
  Play, CheckSquare, X, Camera, Mail, Phone, MapPin, User,
  Armchair, UserCheck, Plus, Trash2, Menu, Save, Edit3, Power,
  AlertTriangle, Sparkles, Zap, ArrowRight, UserPlus, Home, 
  LayoutDashboard, XCircle, Loader2
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

// 1. WALK-IN MODAL (Responsive)
const WalkInModal = ({ isOpen, onClose, services, onConfirm, isLoading }) => {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [selectedServices, setSelectedServices] = useState([]);

  if (!isOpen) return null;

  const toggleService = (service) => {
    const exists = selectedServices.find(s => s.name === service.name);
    if (exists) {
      setSelectedServices(prev => prev.filter(s => s.name !== service.name));
    } else {
      setSelectedServices(prev => [...prev, service]);
    }
  };

  const handleSubmit = () => {
    if (!name.trim()) return alert("Customer Name is required");
    if (selectedServices.length === 0) return alert("Select at least one service");
    
    onConfirm({ name, mobile, services: selectedServices });
    // Note: We don't reset immediately here, we wait for parent to close or finish loading
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={!isLoading ? onClose : undefined}></div>
      <div className="relative w-full max-w-md bg-zinc-900 border-t sm:border border-white/10 rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl animate-in slide-in-from-bottom-10 fade-in duration-300">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <UserPlus className="text-emerald-400" /> Add Walk-in Client
          </h3>
          <button onClick={onClose} disabled={isLoading} className="text-zinc-500 hover:text-white disabled:opacity-50"><X size={20}/></button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-zinc-500 uppercase block mb-1">Customer Name</label>
            <input 
              type="text" 
              placeholder="e.g. Rahul Sharma"
              className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-white focus:border-emerald-500 outline-none placeholder:text-zinc-700"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
            />
          </div>
          
          <div>
            <label className="text-xs font-bold text-zinc-500 uppercase block mb-1">Mobile (Optional)</label>
            <input 
              type="number" 
              placeholder="e.g. 9876543210"
              className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-white focus:border-emerald-500 outline-none placeholder:text-zinc-700"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-500 uppercase block mb-2">Select Services</label>
            <div className="max-h-40 overflow-y-auto custom-scrollbar border border-white/5 rounded-xl bg-zinc-950 p-2 space-y-2">
              {services.length > 0 ? services.map((s, i) => {
                const isSelected = selectedServices.some(sel => sel.name === s.name);
                return (
                  <div 
                    key={i} 
                    onClick={() => !isLoading && toggleService(s)}
                    className={`p-3 rounded-lg border cursor-pointer flex justify-between items-center transition-all ${isSelected ? 'bg-emerald-500/20 border-emerald-500 text-white' : 'border-white/5 text-zinc-400 hover:bg-white/5'} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <span className="text-sm font-medium">{s.name}</span>
                    <span className="text-xs opacity-70">₹{s.price}</span>
                  </div>
                );
              }) : <p className="text-zinc-600 text-xs p-2 text-center">No services available. Add in settings.</p>}
            </div>
          </div>

          <button 
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full py-3.5 bg-white text-black font-bold rounded-xl hover:bg-emerald-400 transition-colors mt-2 active:scale-95 transform disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : "Add to Queue"}
          </button>
        </div>
      </div>
    </div>
  );
};

// 2. PROFILE MODAL
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
          <h3 className="text-2xl font-black text-white mb-1 text-center">{salon?.salonName || "TrimGo Salon"}</h3>
          <p className="text-emerald-400 text-sm font-medium mb-8">@{salon?.ownerName?.replace(/\s/g, '').toLowerCase() || "sanjaychoudhary"}</p>
        </div>
      </div>
    </div>
  );
};

// 3. ASSIGNMENT MODAL
const AssignmentModal = ({ isOpen, onClose, customer, availableChairs, staffList, onConfirm, isLoading }) => {
  const [selectedChair, setSelectedChair] = useState("");
  const [selectedStaff, setSelectedStaff] = useState("");

  if (!isOpen || !customer) return null;

  const handleSubmit = () => {
    if (selectedChair && selectedStaff) {
      onConfirm(customer, Number(selectedChair), selectedStaff);
    } else {
      alert("Please select both a Chair and a Staff member.");
    }
  };

  // Safe Name Access
  const customerName = customer.userId?.name || customer.guestName || "Walk-in Customer";

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={!isLoading ? onClose : undefined}></div>
      <div className="relative w-full max-w-sm bg-zinc-900 border-t sm:border border-white/10 rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl animate-in slide-in-from-bottom-10 fade-in">
        <div className="flex justify-between items-start mb-6">
            <div>
                <h3 className="text-lg font-bold text-white mb-1">Start Service</h3>
                <p className="text-zinc-400 text-sm">For <span className="text-white font-medium">{customerName}</span></p>
            </div>
            <button onClick={onClose} disabled={isLoading} className="disabled:opacity-50"><X size={20} className="text-zinc-500"/></button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-zinc-500 uppercase block mb-2">Select Chair</label>
            <div className="grid grid-cols-2 gap-2">
              {availableChairs.length > 0 ? availableChairs.map(chair => (
                <div 
                  key={chair.id}
                  onClick={() => !isLoading && setSelectedChair(chair.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-2 ${selectedChair === chair.id ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-zinc-950 border-white/10 text-zinc-400 hover:border-white/20'} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
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
              className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500 appearance-none disabled:opacity-50"
              onChange={(e) => setSelectedStaff(e.target.value)}
              value={selectedStaff}
              disabled={isLoading}
            >
              <option value="">Select Staff Member</option>
              {staffList.map((s, i) => (
                <option key={i} value={s.name}>{s.name}</option>
              ))}
            </select>
          </div>
          
          <button 
            onClick={handleSubmit}
            disabled={!selectedChair || !selectedStaff || isLoading}
            className="w-full py-3.5 mt-4 bg-white text-black font-bold rounded-xl hover:bg-emerald-400 disabled:opacity-50 disabled:hover:bg-white transition-colors active:scale-95 flex items-center justify-center gap-2"
          >
            {isLoading ? <Loader2 className="animate-spin" size={20}/> : "Start Service"}
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
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [assignmentModal, setAssignmentModal] = useState({ isOpen: false, customer: null });
  const [isWalkInOpen, setIsWalkInOpen] = useState(false);

  // --- LOADER STATES ---
  // actionLoading stores the ID of the item being processed (e.g., 'accept-123', 'chair-1', 'online-toggle')
  const [actionLoading, setActionLoading] = useState(null); 
  const [isSubmitting, setIsSubmitting] = useState(false); // For modals/forms

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

            // Sync Chairs with Serving Tickets
            const servingTickets = data.serving || [];
            const mappedChairs = Array.from({ length: 4 }, (_, i) => {
                const chairId = i + 1;
                const activeTicket = servingTickets.find(t => t.chairId === chairId);

                if (activeTicket) {
                    return {
                        id: chairId,
                        name: `Chair ${chairId}`,
                        status: 'occupied',
                        currentCustomer: activeTicket,
                        assignedStaff: activeTicket.assignedStaff
                    };
                } else {
                    return {
                        id: chairId,
                        name: `Chair ${chairId}`,
                        status: 'empty',
                        currentCustomer: null,
                        assignedStaff: null
                    };
                }
            });
            setChairs(mappedChairs);
        }
    } catch (error) { 
        console.error("Dashboard Sync Error", error); 
    }
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
    setActionLoading(`accept-${req._id}`);
    try {
        await api.post("/queue/accept", { ticketId: req._id });
        setRequests(requests.filter(r => r._id !== req._id));
        setActiveQueue([...activeQueue, req]); 
    } catch (error) { alert("Failed to accept"); }
    finally { setActionLoading(null); }
  };

  // 🔥 NEW: REJECT HANDLER
  const handleRejectRequest = async (req) => {
    if(!window.confirm("Reject this customer request?")) return;
    setActionLoading(`reject-${req._id}`);
    try {
        await api.post("/queue/reject", { ticketId: req._id });
        setRequests(requests.filter(r => r._id !== req._id));
    } catch (error) { 
        console.error(error);
        alert("Failed to reject request"); 
    }
    finally { setActionLoading(null); }
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
    setIsSubmitting(true);
    try {
        await api.post("/queue/start", { ticketId: customer._id, chairId, staffName });
        setChairs(prev => prev.map(c => 
            c.id === chairId ? { ...c, status: 'occupied', currentCustomer: customer, assignedStaff: staffName } : c
        ));
        setActiveQueue(activeQueue.filter(q => q._id !== customer._id));
        setAssignmentModal({ isOpen: false, customer: null }); // Close modal only on success
    } catch (error) { alert("Failed to start service"); }
    finally { setIsSubmitting(false); }
  };

  const handleCompleteService = async (chairId) => {
    const chair = chairs.find(c => c.id === chairId);
    if (!chair?.currentCustomer) return;
    
    setActionLoading(`complete-${chairId}`);
    try {
        await api.post("/queue/complete", { ticketId: chair.currentCustomer._id });
        setChairs(prev => prev.map(c => 
            c.id === chairId ? { ...c, status: 'empty', currentCustomer: null, assignedStaff: null } : c
        ));
    } catch (error) { alert("Error completing service"); }
    finally { setActionLoading(null); }
  };

  // Handle Walk-in Submission
  const handleAddWalkIn = async (customerData) => {
    setIsSubmitting(true);
    try {
        const totalPrice = customerData.services.reduce((sum, s) => sum + Number(s.price), 0);
        const totalTime = customerData.services.reduce((sum, s) => sum + Number(s.time), 0);

        const payload = {
            name: customerData.name,
            mobile: customerData.mobile,
            services: customerData.services,
            totalPrice,
            totalTime
        };

        const { data } = await api.post("/queue/add-walkin", payload);
        if(data.success) {
            setActiveQueue(prev => [...prev, data.ticket]);
            setIsWalkInOpen(false); // Close on success
        }
    } catch (error) {
        console.error(error);
        alert("Failed to add walk-in client");
    }
    finally { setIsSubmitting(false); }
  };

  // --- SETTINGS HANDLERS ---
  const fillServiceSuggestion = (s) => {
      setNewService({ name: s.name, price: s.price, time: s.time, category: s.category });
  };

  const handleAddService = async () => {
      if(!newService.name || !newService.price || !newService.time) return;
      setIsSubmitting(true);
      const updatedServices = [...services, { ...newService, price: Number(newService.price), time: Number(newService.time) }];
      try {
          await api.put("/salon/update", { services: updatedServices });
          setServices(updatedServices);
          setNewService({ name: "", price: "", time: "", category: "Hair" }); 
      } catch (error) { alert("Failed to save service"); }
      finally { setIsSubmitting(false); }
  };

  const handleDeleteService = async (index) => {
      // Small optimization: we can use index as loading ID too if needed, but for now simple alert is ok or we can add specific loader
      const updatedServices = services.filter((_, i) => i !== index);
      try {
          await api.put("/salon/update", { services: updatedServices });
          setServices(updatedServices);
      } catch (error) { alert("Failed to delete service"); }
  };

  const handleAddStaff = async () => {
      if(!newStaffName.trim()) return;
      setIsSubmitting(true);
      const updatedStaff = [...staff, { name: newStaffName, status: 'available' }];
      try {
          await api.put("/salon/update", { staff: updatedStaff });
          setStaff(updatedStaff);
          setNewStaffName("");
      } catch (error) { alert("Failed to add staff"); }
      finally { setIsSubmitting(false); }
  };

  const toggleOnlineStatus = async () => {
      setActionLoading('online-toggle');
      try {
          const newStatus = !isOnline;
          await api.put("/salon/update", { isOnline: newStatus });
          setIsOnline(newStatus);
      } catch (error) { alert("Update failed"); }
      finally { setActionLoading(null); }
  }

  // --- HELPERS ---
  const getAvatarGradient = (name) => {
    const n = name || "U";
    const gradients = ["from-pink-500 to-rose-500", "from-indigo-500 to-blue-500", "from-emerald-500 to-teal-500", "from-orange-500 to-amber-500"];
    return gradients[n.length % gradients.length];
  };

  const isServicesEmpty = services.length === 0;

  // --- RENDER ---
  return (
    <div className="flex h-screen w-full bg-zinc-950 font-sans text-white overflow-hidden selection:bg-emerald-500 selection:text-white">
      
      {/* --- MODALS --- */}
      <WalkInModal 
        isOpen={isWalkInOpen}
        onClose={() => setIsWalkInOpen(false)}
        services={services}
        onConfirm={handleAddWalkIn}
        isLoading={isSubmitting}
      />

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
        isLoading={isSubmitting}
      />

      {/* --- BACKGROUND EFFECTS --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-zinc-950 to-black"></div>
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] animate-pulse-slow"></div>
      </div>

      {/* --- DESKTOP SIDEBAR (Hidden on Mobile) --- */}
      <aside className="hidden lg:flex w-64 border-r border-white/5 bg-zinc-900/40 backdrop-blur-xl flex-col z-20">
        <div className="h-20 flex items-center px-6 border-b border-white/5 gap-3">
           <div className="w-10 h-10 bg-white text-black rounded-xl flex items-center justify-center font-bold text-sm shadow-[0_0_20px_rgba(255,255,255,0.3)]">TG</div>
           <span className="font-bold text-lg">TrimGo</span>
        </div>
        <nav className="flex-1 py-6 flex flex-col gap-2 px-3">
           {[ { id: 'dashboard', icon: LayoutDashboard, label: "Dashboard" }, { id: 'settings', icon: Settings, label: "Settings" } ].map((item) => (
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

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 flex flex-col relative z-10 h-full overflow-hidden">
        
        {/* --- HEADER (Responsive) --- */}
        <header className="h-16 lg:h-20 border-b border-white/5 bg-zinc-900/60 backdrop-blur-md flex items-center justify-between px-4 lg:px-8 shrink-0 z-30">
           <div className="flex items-center gap-3">
             {/* Logo for Mobile */}
             <div className="lg:hidden w-8 h-8 bg-white text-black rounded-lg flex items-center justify-center font-bold text-xs">TG</div>
             <div className="flex flex-col">
               <h1 className="text-lg lg:text-xl font-bold text-white tracking-tight truncate max-w-[150px] sm:max-w-none">
                 {salon?.salonName || "My Salon"}
               </h1>
               <div className="flex items-center gap-2">
                 <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                 <p className="text-[10px] lg:text-xs text-zinc-400 font-mono">{currentTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
               </div>
             </div>
           </div>

           <div className="flex items-center gap-3">
             <button 
                onClick={!actionLoading ? toggleOnlineStatus : undefined} 
                disabled={actionLoading === 'online-toggle'}
                className={`px-3 py-1.5 rounded-full border flex items-center gap-2 transition-all active:scale-95 ${isOnline ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-zinc-800 border-zinc-700 text-zinc-400'} ${actionLoading === 'online-toggle' ? 'opacity-70' : ''}`}
             >
                 {actionLoading === 'online-toggle' ? <Loader2 size={14} className="animate-spin" /> : <Power size={14} />}
                 <span className="text-[10px] font-bold uppercase hidden sm:block">{isOnline ? 'Online' : 'Offline'}</span>
             </button>
             <div onClick={() => setIsProfileOpen(true)} className="w-9 h-9 rounded-full bg-gradient-to-tr from-zinc-700 to-zinc-600 p-0.5 cursor-pointer hover:scale-105 transition overflow-hidden">
                {profileImage ? <img src={profileImage} alt="Profile" className="w-full h-full rounded-full object-cover" /> : <div className="w-full h-full rounded-full bg-zinc-900 flex items-center justify-center text-xs font-bold text-white">TG</div>}
             </div>
           </div>
        </header>

        {/* --- SCROLLABLE CONTENT --- */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 lg:p-6 pb-24 lg:pb-6 custom-scrollbar">
           
           {/* === VIEW: DASHBOARD === */}
           {activeTab === 'dashboard' && (
             <div className="max-w-7xl mx-auto space-y-6">
               
               {/* 1. SETUP WARNING (If Empty) */}
               {isServicesEmpty && (
                   <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 p-4 lg:p-6 rounded-2xl lg:rounded-3xl flex flex-col md:flex-row items-center justify-between gap-4 animate-pulse">
                       <div className="text-center md:text-left">
                           <h3 className="text-lg font-bold text-orange-400 flex items-center justify-center md:justify-start gap-2">
                               <AlertTriangle size={18} /> Setup Incomplete
                           </h3>
                           <p className="text-zinc-400 text-xs mt-1">Add services to make your salon visible.</p>
                       </div>
                       <button onClick={() => setActiveTab('settings')} className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-orange-500/20 w-full md:w-auto">
                           Fix Now
                       </button>
                   </div>
               )}

               {/* 2. STATS GRID (Responsive) */}
               <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                 <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 flex flex-col justify-between h-24 lg:h-32">
                     <div className="flex justify-between items-start">
                        <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400"><DollarSign size={18}/></div>
                        <span className="text-[10px] text-zinc-500 font-bold uppercase">Today</span>
                     </div>
                     <h3 className="text-2xl font-black text-white">₹{stats.revenue}</h3>
                 </div>
                 <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 flex flex-col justify-between h-24 lg:h-32">
                     <div className="flex justify-between items-start">
                        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400"><Armchair size={18}/></div>
                        <span className="text-[10px] text-zinc-500 font-bold uppercase">Active</span>
                     </div>
                     <h3 className="text-2xl font-black text-white">{chairs.filter(c => c.status === 'occupied').length} / {chairs.length}</h3>
                 </div>
                 <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 flex flex-col justify-between h-24 lg:h-32">
                     <div className="flex justify-between items-start">
                        <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-400"><Users size={18}/></div>
                        <span className="text-[10px] text-zinc-500 font-bold uppercase">Waiting</span>
                     </div>
                     <h3 className="text-2xl font-black text-white">{activeQueue.length}</h3>
                 </div>
                 <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 flex flex-col justify-between h-24 lg:h-32">
                     <div className="flex justify-between items-start">
                        <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400"><CheckCircle size={18}/></div>
                        <span className="text-[10px] text-zinc-500 font-bold uppercase">Done</span>
                     </div>
                     <h3 className="text-2xl font-black text-white">{stats.customers}</h3>
                 </div>
               </div>

               {/* 3. NEW REQUESTS (With Cancel Option) */}
               {requests.length > 0 && (
                 <div className="animate-in fade-in slide-in-from-top-4">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-sm text-zinc-300 flex items-center gap-2"><Bell className="text-yellow-500 animate-bounce" size={16}/> New Requests ({requests.length})</h3>
                    </div>
                    <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide">
                        {requests.map(req => (
                            <div key={req._id} className="snap-center min-w-[280px] sm:min-w-[320px] bg-zinc-900 border border-yellow-500/30 p-4 rounded-2xl shadow-lg relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-yellow-500"></div>
                                <div className="flex items-center gap-3 mb-3">
                                   <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarGradient(req.userId?.name)} flex items-center justify-center text-sm font-bold`}>{req.userId?.name?.charAt(0) || "U"}</div>
                                   <div>
                                     <h4 className="font-bold text-sm text-white">{req.userId?.name}</h4>
                                     <p className="text-xs text-zinc-400">{req.services[0]?.name} {req.services.length > 1 && `+${req.services.length - 1}`}</p>
                                   </div>
                                </div>
                                <div className="flex items-center justify-between mt-2 mb-3">
                                    <span className="text-sm font-bold text-zinc-300">Total</span>
                                    <span className="text-lg font-black text-white">₹{req.totalPrice}</span>
                                </div>
                                
                                {/* 🔥 NEW: ACCEPT / CANCEL BUTTONS WITH LOADERS */}
                                <div className="grid grid-cols-2 gap-2">
                                    <button 
                                        onClick={() => handleRejectRequest(req)} 
                                        disabled={actionLoading === `reject-${req._id}` || actionLoading === `accept-${req._id}`}
                                        className="py-2.5 bg-zinc-800 text-red-400 border border-white/5 hover:bg-red-500/10 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1 disabled:opacity-50"
                                    >
                                        {actionLoading === `reject-${req._id}` ? <Loader2 size={14} className="animate-spin"/> : <><X size={14} /> Cancel</>}
                                    </button>
                                    <button 
                                        onClick={() => handleAcceptRequest(req)} 
                                        disabled={actionLoading === `accept-${req._id}` || actionLoading === `reject-${req._id}`}
                                        className="py-2.5 bg-white text-black text-xs font-bold rounded-xl hover:bg-emerald-400 transition-colors flex items-center justify-center gap-1 shadow-lg shadow-white/5 disabled:opacity-50"
                                    >
                                        {actionLoading === `accept-${req._id}` ? <Loader2 size={14} className="animate-spin"/> : <><CheckCircle size={14} /> Accept</>}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                 </div>
               )}

               {/* 4. MAIN OPERATIONAL AREA */}
               <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-auto lg:h-[600px]">
                 
                 {/* LEFT: QUEUE LIST */}
                 <div className="lg:col-span-4 bg-zinc-900/30 border border-white/5 rounded-3xl overflow-hidden flex flex-col h-[400px] lg:h-full">
                    <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between sticky top-0 backdrop-blur-sm z-10">
                        <h3 className="font-bold text-sm text-zinc-100">Waiting Queue</h3>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-md">{activeQueue.length}</span>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                        {activeQueue.length === 0 ? (
                           <div className="h-full flex flex-col items-center justify-center text-zinc-600 gap-2">
                               <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center"><Users size={24} className="opacity-30"/></div>
                               <p className="text-sm">Queue is empty</p>
                               <button onClick={() => setIsWalkInOpen(true)} className="text-xs font-bold text-emerald-500 hover:underline">Add First Customer</button>
                           </div>
                        ) : activeQueue.map((cust) => (
                           <div key={cust._id} className="relative group bg-zinc-900 border border-white/10 p-4 rounded-2xl active:scale-98 transition-all">
                              {cust.isGuest && <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-zinc-800 text-[9px] text-zinc-400 rounded uppercase font-bold tracking-wider">WALK-IN</div>}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                   <span className="text-xl font-black text-zinc-700 w-8">#{cust.queueNumber}</span>
                                   <div>
                                     <h4 className="font-bold text-sm text-white">{cust.userId?.name || cust.guestName}</h4>
                                     <p className="text-xs text-zinc-400">{cust.services[0]?.name}</p>
                                   </div>
                                </div>
                                <button onClick={() => openAssignmentModal(cust)} className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-emerald-400 hover:bg-emerald-500/10 border border-white/5 transition-all">
                                   <Play size={16} fill="currentColor" />
                                </button>
                              </div>
                           </div>
                        ))}
                    </div>
                 </div>

                 {/* RIGHT: CHAIRS GRID */}
                 <div className="lg:col-span-8 bg-zinc-900/30 border border-white/5 rounded-3xl overflow-hidden flex flex-col h-auto lg:h-full">
                    <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between sticky top-0 backdrop-blur-sm z-10">
                        <h3 className="font-bold text-sm text-zinc-100 flex items-center gap-2"><Scissors size={14} className="text-emerald-400"/> Service Floor</h3>
                        <span className="text-[10px] text-zinc-500 font-bold uppercase">{chairs.length} Chairs</span>
                    </div>
                    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-y-auto custom-scrollbar flex-1">
                        {chairs.map((chair) => (
                          <div key={chair.id} className={`relative rounded-2xl p-4 border transition-all flex flex-col justify-between min-h-[160px] ${chair.status === 'occupied' ? 'bg-zinc-900 border-emerald-500/30 shadow-lg shadow-emerald-900/10' : 'bg-zinc-900/50 border-white/5 border-dashed'}`}>
                             {/* Chair Header */}
                             <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                   <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${chair.status === 'occupied' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-600'}`}><Armchair size={16} /></div>
                                   <div>
                                      <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{chair.name}</h4>
                                      <p className={`text-[10px] font-bold ${chair.status === 'occupied' ? 'text-emerald-400' : 'text-zinc-600'}`}>{chair.status === 'occupied' ? 'ACTIVE' : 'EMPTY'}</p>
                                   </div>
                                </div>
                                {chair.assignedStaff && <div className="flex items-center gap-1 bg-zinc-950 px-2 py-1 rounded border border-white/5"><UserCheck size={10} className="text-zinc-400"/><span className="text-[10px] font-medium text-zinc-300">{chair.assignedStaff}</span></div>}
                             </div>

                             {/* Chair Body */}
                             {chair.status === 'occupied' && chair.currentCustomer ? (
                               <div className="mt-2">
                                 <div className="flex items-center gap-3 mb-4 p-2 bg-zinc-950/50 rounded-xl">
                                   <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${getAvatarGradient(chair.currentCustomer.userId?.name || chair.currentCustomer.guestName)} flex items-center justify-center text-sm font-bold`}>
                                     {(chair.currentCustomer.userId?.name || chair.currentCustomer.guestName || "G").charAt(0)}
                                   </div>
                                   <div>
                                     <h5 className="font-bold text-white text-sm">{chair.currentCustomer.userId?.name || chair.currentCustomer.guestName}</h5>
                                     <p className="text-xs text-emerald-400">{chair.currentCustomer.services[0]?.name}</p>
                                   </div>
                                 </div>
                                 <button 
                                    onClick={() => handleCompleteService(chair.id)} 
                                    disabled={actionLoading === `complete-${chair.id}`}
                                    className="w-full py-2.5 bg-white text-black text-xs font-bold rounded-lg hover:bg-emerald-400 transition-colors flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                                >
                                    {actionLoading === `complete-${chair.id}` ? <Loader2 size={14} className="animate-spin" /> : <><CheckSquare size={14}/> Complete</>}
                                </button>
                               </div>
                             ) : (
                               <div className="flex-1 flex flex-col items-center justify-center text-zinc-700 gap-2">
                                  <p className="text-xs font-medium">Ready for customer</p>
                                  {activeQueue.length > 0 && <button onClick={() => openAssignmentModal(activeQueue[0])} className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-1 rounded hover:bg-blue-500/20">Assign Next</button>}
                               </div>
                             )}
                          </div>
                        ))}
                    </div>
                 </div>

               </div>
             </div>
           )}

           {/* === VIEW: SETTINGS === */}
           {activeTab === 'settings' && (
             <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 pb-20">
               
               {/* 1. Services Manager */}
               <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-5 lg:p-6">
                  <h3 className="font-bold text-lg text-white mb-4 flex items-center gap-2"><Scissors className="text-emerald-400" size={20}/> Manage Services</h3>
                  
                  {/* QUICK ADD */}
                  <div className="mb-6">
                      <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 flex items-center gap-1"><Zap size={10} className="text-yellow-400"/> Quick Add</p>
                      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                          {SUGGESTED_SERVICES.map((s, i) => (
                              <button key={i} onClick={() => fillServiceSuggestion(s)} className="shrink-0 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-white/5 rounded-lg text-xs text-zinc-300 transition-colors flex items-center gap-1 whitespace-nowrap">
                                {s.name} <span className="opacity-50">• ₹{s.price}</span>
                              </button>
                          ))}
                      </div>
                  </div>

                  {/* INPUTS */}
                  <div className="space-y-3 mb-6 bg-zinc-900/80 p-4 rounded-2xl border border-white/5">
                      <div className="grid grid-cols-3 gap-2">
                         <input type="text" placeholder="Service Name" className="col-span-3 bg-zinc-950 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-emerald-500 outline-none" value={newService.name} onChange={(e) => setNewService({...newService, name: e.target.value})} />
                         <input type="number" placeholder="₹ Price" className="bg-zinc-950 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-emerald-500 outline-none" value={newService.price} onChange={(e) => setNewService({...newService, price: e.target.value})} />
                         <input type="number" placeholder="Mins" className="bg-zinc-950 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-emerald-500 outline-none" value={newService.time} onChange={(e) => setNewService({...newService, time: e.target.value})} />
                         <button onClick={handleAddService} disabled={isSubmitting} className="col-span-3 bg-emerald-500 text-white rounded-xl py-3 font-bold hover:bg-emerald-400 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                            {isSubmitting ? <Loader2 size={16} className="animate-spin"/> : <><Plus size={16}/> Add Service</>}
                         </button>
                      </div>
                  </div>

                  {/* LIST */}
                  <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                      {services.length === 0 ? <p className="text-zinc-500 text-sm text-center py-4">No services added.</p> : services.map((s, i) => (
                         <div key={i} className="flex items-center justify-between p-3 bg-zinc-900 rounded-xl border border-white/5">
                            <div><h4 className="font-bold text-sm text-white">{s.name}</h4><p className="text-xs text-zinc-400">₹{s.price} • {s.time} mins</p></div>
                            <button onClick={() => handleDeleteService(i)} className="p-2 text-zinc-600 hover:text-red-400 transition-colors"><Trash2 size={16}/></button>
                         </div>
                      ))}
                  </div>
               </div>

               {/* 2. Staff & Status */}
               <div className="space-y-6">
                  <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-5 lg:p-6">
                      <h3 className="font-bold text-lg text-white mb-4 flex items-center gap-2"><UserCheck className="text-blue-400" size={20}/> Staff</h3>
                      <div className="flex gap-2 mb-4">
                         <input type="text" placeholder="Staff Name" className="flex-1 bg-zinc-900 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-blue-500 outline-none" value={newStaffName} onChange={(e) => setNewStaffName(e.target.value)} />
                         <button onClick={handleAddStaff} disabled={isSubmitting} className="px-4 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-400 active:scale-95 transition-all disabled:opacity-50 min-w-[80px] flex items-center justify-center">
                            {isSubmitting ? <Loader2 size={16} className="animate-spin"/> : "Add"}
                         </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                         {staff.map((s, i) => (
                           <div key={i} className="px-3 py-1.5 bg-zinc-800 rounded-lg text-xs text-white border border-white/5 flex items-center gap-2">
                              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div> {s.name}
                           </div>
                         ))}
                      </div>
                  </div>
                  
                  {/* Logout Area for Mobile */}
                  <button onClick={onLogout} className="lg:hidden w-full py-4 bg-red-500/10 text-red-400 font-bold rounded-2xl border border-red-500/20 flex items-center justify-center gap-2">
                      <LogOut size={18}/> Sign Out
                  </button>
               </div>
             </div>
           )}
        </div>

        {/* --- MOBILE: BOTTOM NAVIGATION BAR (App-Like) --- */}
        <div className="lg:hidden fixed bottom-0 left-0 w-full bg-zinc-900/80 backdrop-blur-xl border-t border-white/10 z-50 pb-safe">
            <div className="flex items-center justify-around h-16 px-2">
                <button 
                  onClick={() => setActiveTab('dashboard')} 
                  className={`flex flex-col items-center justify-center w-16 h-full space-y-1 ${activeTab === 'dashboard' ? 'text-white' : 'text-zinc-500'}`}
                >
                    <Home size={22} strokeWidth={activeTab === 'dashboard' ? 3 : 2} />
                    <span className="text-[10px] font-medium">Home</span>
                </button>

                {/* CENTRAL ACTION BUTTON: ADD WALK-IN */}
                <button 
                   onClick={() => setIsWalkInOpen(true)}
                   className="flex items-center justify-center w-14 h-14 bg-white text-black rounded-full shadow-lg shadow-white/10 -mt-6 border-4 border-zinc-900 active:scale-90 transition-transform"
                >
                   <UserPlus size={24} />
                </button>

                <button 
                  onClick={() => setActiveTab('settings')} 
                  className={`flex flex-col items-center justify-center w-16 h-full space-y-1 ${activeTab === 'settings' ? 'text-white' : 'text-zinc-500'}`}
                >
                    <Settings size={22} strokeWidth={activeTab === 'settings' ? 3 : 2} />
                    <span className="text-[10px] font-medium">Setup</span>
                </button>
            </div>
        </div>

      </main>
    </div>
  );
};

export default SalonDashboard;