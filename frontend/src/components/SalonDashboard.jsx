import React, { useState, useEffect, useRef } from "react";
import {
  Users, Settings, LogOut, Bell, DollarSign, Clock, CheckCircle, Scissors,
  Play, CheckSquare, X, UserPlus, Home, LayoutDashboard, Image as ImageIcon, Star, 
  Loader2, UploadCloud, Minus, Plus, Trash2, Power, AlertTriangle, Zap, Armchair, UserCheck, Clock8, FileText, MessageSquare
} from "lucide-react";
import api from "../utils/api";
import { io } from "socket.io-client";

// --- EXTERNAL COMPONENTS ---
import SalonHistory from "./SalonHistory";
import SalonReviews from "./SalonReviews"; // <-- NEW IMPORT
import { 
  WalkInModal, 
  ProfileModal, 
  AssignmentModal, 
  ExtendTimeModal, 
  AddExtraServiceModal 
} from "./SalonModals";

const CLOUDINARY_UPLOAD_URL = "https://api.cloudinary.com/v1_1/dvoenforj/image/upload";
const UPLOAD_PRESET = "salon_preset";
const NOTIFICATION_SOUND_URL = "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3"; 

const uploadToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  try {
    const res = await fetch(CLOUDINARY_UPLOAD_URL, { method: "POST", body: formData });
    const data = await res.json();
    if (data.secure_url) {
      return data.secure_url;
    } else {
      throw new Error("Cloudinary upload failed");
    }
  } catch (error) {
    console.error("Upload Error", error);
    throw error;
  }
};

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

const SalonDashboard = ({ salon, onLogout }) => {
  const [activeTab, setActiveTab] = useState("dashboard");

  // Dashboard Data
  const [requests, setRequests] = useState([]);
  const [activeQueue, setActiveQueue] = useState([]);

  // Dynamic Active Chairs State
  const activeChairsRef = useRef(salon?.activeChairsCount || 1);
  const [activeChairsCount, setActiveChairsCount] = useState(salon?.activeChairsCount || 1);
  
  const updateLocalChairsCount = (count) => {
    setActiveChairsCount(count);
    activeChairsRef.current = count;
  };

  const [chairs, setChairs] = useState(Array.from({ length: activeChairsCount }, (_, i) => ({
    id: i + 1, name: `Chair ${i + 1}`, status: 'empty', currentCustomer: null, assignedStaff: null
  })));

  // Settings Data
  const [services, setServices] = useState([]);
  const [staff, setStaff] = useState([]);
  const [newService, setNewService] = useState({ name: "", price: "", time: "", category: "Hair" });
  const [newStaffName, setNewStaffName] = useState("");

  // Gallery Data
  const [gallery, setGallery] = useState([]);
  const [uploading, setUploading] = useState(false);
  const galleryInputRef = useRef(null);

  const [isOnline, setIsOnline] = useState(true);
  const [stats, setStats] = useState({ revenue: 0, customers: 0 });
  const [currentTime, setCurrentTime] = useState(new Date());

  // UI States
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [assignmentModal, setAssignmentModal] = useState({ isOpen: false, customer: null });
  const [isWalkInOpen, setIsWalkInOpen] = useState(false);
  const [extendTimeModal, setExtendTimeModal] = useState({ isOpen: false, customer: null });
  const [extraServiceModal, setExtraServiceModal] = useState({ isOpen: false, customer: null });

  const playNotificationSound = () => {
    try {
      const audio = new Audio(NOTIFICATION_SOUND_URL);
      audio.volume = 1.0;
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.warn("Audio play blocked by browser.", error);
        });
      }
    } catch (err) {
      console.error("Error playing sound:", err);
    }
  };

  useEffect(() => {
    const socket = io(import.meta.env.VITE_BACKEND_URL);
    if (salon?._id) {
      socket.emit("join_room", `salon_${salon._id}`);
    }

    socket.on("new_request", (ticket) => {
      setRequests(prev => [...prev, ticket]);
      playNotificationSound(); 
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

  const fetchDashboardData = async () => {
    try {
      const { data } = await api.get("/queue/salon-dashboard");
      if (data.success) {
        setRequests(data.requests);
        setActiveQueue(data.waiting);
        setStats(data.stats);

        const servingTickets = data.serving || [];
        const mappedChairs = Array.from({ length: activeChairsRef.current }, (_, i) => {
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
      if (data.success) {
        setServices(data.salon.services || []);
        setStaff(data.salon.staff || [{ name: data.salon.ownerName, status: 'available' }]);
        setGallery(data.salon.gallery || []); 
        setIsOnline(data.salon.isOnline);
        if(data.salon.activeChairsCount) {
           updateLocalChairsCount(data.salon.activeChairsCount);
        }
      }
    } catch (error) { console.error("Profile Fetch Error", error); }
  }

  const handleUpdateChairs = async (newCount) => {
    if (newCount < 1) {
      alert("Minimum 1 active chair is required.");
      return;
    }
    try {
      const { data } = await api.put("/salon/update-chairs", { activeChairsCount: newCount });
      if (data.success) {
        updateLocalChairsCount(data.activeChairsCount);
        fetchDashboardData();
      }
    } catch (error) {
      console.error(error);
      alert("Failed to update chairs");
    }
  };

  const handleAcceptRequest = async (req) => {
    try {
      const { data } = await api.post("/queue/accept", { ticketId: req._id });
      setRequests(requests.filter(r => r._id !== req._id));
      if (data.success) {
        setActiveQueue([...activeQueue, data.ticket]);
      }
    } catch (error) { alert("Failed to accept"); }
  };

  const handleRejectRequest = async (req) => {
    if (!window.confirm("Remove this customer from the queue?")) return;
    try {
      await api.post("/queue/reject", { ticketId: req._id });
      setRequests(requests.filter(r => r._id !== req._id));
      setActiveQueue(activeQueue.filter(q => q._id !== req._id));
    } catch (error) {
      console.error(error);
      alert("Failed to remove request");
    }
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

  const handleCancelService = async (chairId) => {
    const chair = chairs.find(c => c.id === chairId);
    if (!chair?.currentCustomer) return;
    
    if (!window.confirm("Are you sure you want to cancel this ongoing service?")) return;

    try {
      await api.post("/queue/cancel-service", { ticketId: chair.currentCustomer._id }); 
      setChairs(prev => prev.map(c =>
        c.id === chairId ? { ...c, status: 'empty', currentCustomer: null, assignedStaff: null } : c
      ));
    } catch (error) { 
      alert("Error canceling service"); 
    }
  };

  const handleExtendTimeSubmit = async (minutes) => {
    const ticketId = extendTimeModal.customer._id;
    try {
      await api.post("/queue/extend-time", { ticketId, extraMinutes: minutes });
      setExtendTimeModal({ isOpen: false, customer: null });
      fetchDashboardData(); 
    } catch (error) {
      console.error("Extend Time Error", error);
      alert("Failed to extend time.");
    }
  };

  const handleAddExtraServiceSubmit = async (newServices) => {
    const ticketId = extraServiceModal.customer._id;
    const additionalPrice = newServices.reduce((sum, s) => sum + Number(s.price), 0);
    const additionalTime = newServices.reduce((sum, s) => sum + Number(s.time), 0);
    
    try {
      await api.post("/queue/add-services", { ticketId, newServices, additionalPrice, additionalTime });
      setExtraServiceModal({ isOpen: false, customer: null });
      fetchDashboardData();
    } catch (error) {
      console.error("Add Service Error", error);
      alert("Failed to add extra services.");
    }
  };

  const handleAddWalkIn = async (customerData) => {
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
      if (data.success) {
        setActiveQueue(prev => [...prev, data.ticket]);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to add walk-in client");
    }
  };

  const fillServiceSuggestion = (s) => {
    setNewService({ name: s.name, price: s.price, time: s.time, category: s.category });
  };

  const handleAddService = async () => {
    if (!newService.name || !newService.price || !newService.time) return;
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
    if (!newStaffName.trim()) return;
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
  };

  const handleGalleryUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (gallery.length >= 4) {
      alert("Maximum 4 photos allowed.");
      return;
    }

    setUploading(true);
    try {
      let imageUrl;
      if (UPLOAD_PRESET !== "YOUR_UNSIGNED_PRESET") {
        imageUrl = await uploadToCloudinary(file);
      } else {
        alert("Please set your Cloudinary Keys in code. Using Local Preview for now.");
        imageUrl = URL.createObjectURL(file);
      }

      const updatedGallery = [...gallery, imageUrl];
      await api.put("/salon/update", { gallery: updatedGallery });
      setGallery(updatedGallery);
    } catch (error) {
      console.error(error);
      alert("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = async (index) => {
    if (!window.confirm("Remove this photo?")) return;
    const updatedGallery = gallery.filter((_, i) => i !== index);
    try {
      await api.put("/salon/update", { gallery: updatedGallery });
      setGallery(updatedGallery);
    } catch (error) { alert("Delete failed"); }
  };

  const handleSetMainPhoto = async (index) => {
    if (index === 0) return; 
    const photo = gallery[index];
    const others = gallery.filter((_, i) => i !== index);
    const updatedGallery = [photo, ...others]; 

    try {
      await api.put("/salon/update", { gallery: updatedGallery });
      setGallery(updatedGallery);
    } catch (error) { alert("Update failed"); }
  };

  const getAvatarGradient = (name) => {
    const n = name || "U";
    const gradients = ["from-pink-500 to-rose-500", "from-indigo-500 to-blue-500", "from-emerald-500 to-teal-500", "from-orange-500 to-amber-500"];
    return gradients[n.length % gradients.length];
  };

  const isServicesEmpty = services.length === 0;

  return (
    <div className="flex h-screen w-full bg-zinc-950 font-sans text-white overflow-hidden selection:bg-emerald-500 selection:text-white">

      {/* --- MODALS --- */}
      <WalkInModal isOpen={isWalkInOpen} onClose={() => setIsWalkInOpen(false)} services={services} onConfirm={handleAddWalkIn} />
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} salon={salon} profileImage={profileImage} onImageUpload={setProfileImage} onLogout={onLogout} />
      <AssignmentModal isOpen={assignmentModal.isOpen} onClose={() => setAssignmentModal({ ...assignmentModal, isOpen: false })} customer={assignmentModal.customer} availableChairs={assignmentModal.availableChairs} staffList={staff} onConfirm={handleStartService} />
      
      <ExtendTimeModal isOpen={extendTimeModal.isOpen} onClose={() => setExtendTimeModal({ isOpen: false, customer: null })} customer={extendTimeModal.customer} onConfirm={handleExtendTimeSubmit} />
      <AddExtraServiceModal isOpen={extraServiceModal.isOpen} onClose={() => setExtraServiceModal({ isOpen: false, customer: null })} services={services} customer={extraServiceModal.customer} onConfirm={handleAddExtraServiceSubmit} />

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex w-64 border-r border-white/5 bg-zinc-900/40 backdrop-blur-xl flex-col z-20">
        <div className="h-20 flex items-center px-6 border-b border-white/5 gap-3">
          <div className="w-10 h-10 bg-white text-black rounded-xl flex items-center justify-center font-bold text-sm shadow-[0_0_20px_rgba(255,255,255,0.3)]">TG</div>
          <span className="font-bold text-lg">TrimGo</span>
        </div>
        <nav className="flex-1 py-6 flex flex-col gap-2 px-3">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: "Dashboard" }, 
            { id: 'history', icon: FileText, label: "History" }, 
            { id: 'reviews', icon: Star, label: "Reviews" }, // <-- ADDED REVIEWS TAB
            { id: 'settings', icon: Settings, label: "Settings" }
          ].map((item) => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} className={`flex items-center p-3 rounded-xl cursor-pointer transition-all w-full text-left ${activeTab === item.id ? 'bg-white/10 text-white shadow-lg shadow-white/5 border border-white/5' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}>
              <item.icon size={20} strokeWidth={2} />
              <span className="ml-3 font-medium">{item.label}</span>
              {activeTab === item.id && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]"></div>}
            </button>
          ))}
        </nav>
      </aside >

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col relative z-10 h-full overflow-hidden">

        {/* HEADER */}
        <header className="h-16 lg:h-20 border-b border-white/5 bg-zinc-900/60 backdrop-blur-md flex items-center justify-between px-4 lg:px-8 shrink-0 z-30">
          <div className="flex items-center gap-3">
            <div className="lg:hidden w-8 h-8 bg-white text-black rounded-lg flex items-center justify-center font-bold text-xs">TG</div>
            <div className="flex flex-col">
              <h1 className="text-lg lg:text-xl font-bold text-white tracking-tight truncate max-w-[150px] sm:max-w-none">
                {salon?.salonName || "My Salon"}
              </h1>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <p className="text-[10px] lg:text-xs text-zinc-400 font-mono">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={toggleOnlineStatus} className={`px-3 py-1.5 rounded-full border flex items-center gap-2 transition-all active:scale-95 ${isOnline ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-zinc-800 border-zinc-700 text-zinc-400'}`}>
              <Power size={14} />
              <span className="text-[10px] font-bold uppercase hidden sm:block">{isOnline ? 'Online' : 'Offline'}</span>
            </button>
            <div onClick={() => setIsProfileOpen(true)} className="w-9 h-9 rounded-full bg-gradient-to-tr from-zinc-700 to-zinc-600 p-0.5 cursor-pointer hover:scale-105 transition overflow-hidden">
              {profileImage ? <img src={profileImage} alt="Profile" className="w-full h-full rounded-full object-cover" /> : <div className="w-full h-full rounded-full bg-zinc-900 flex items-center justify-center text-xs font-bold text-white">TG</div>}
            </div>
          </div>
        </header>

        {/* SCROLLABLE CONTENT */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 lg:p-6 pb-24 lg:pb-6 custom-scrollbar">

          {/* === VIEW: DASHBOARD === */}
          {activeTab === 'dashboard' && (
              <div className="max-w-7xl mx-auto space-y-6">
                {/* SETUP WARNING */}
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

                {/* STATS GRID */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 flex flex-col justify-between h-24 lg:h-32">
                    <div className="flex justify-between items-start">
                      <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400"><DollarSign size={18} /></div>
                      <span className="text-[10px] text-zinc-500 font-bold uppercase">Today</span>
                    </div>
                    <h3 className="text-2xl font-black text-white">₹{stats.revenue}</h3>
                  </div>
                  <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 flex flex-col justify-between h-24 lg:h-32">
                    <div className="flex justify-between items-start">
                      <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400"><Armchair size={18} /></div>
                      <span className="text-[10px] text-zinc-500 font-bold uppercase">Active</span>
                    </div>
                    <h3 className="text-2xl font-black text-white">{chairs.filter(c => c.status === 'occupied').length} / {chairs.length}</h3>
                  </div>
                  <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 flex flex-col justify-between h-24 lg:h-32">
                    <div className="flex justify-between items-start">
                      <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-400"><Users size={18} /></div>
                      <span className="text-[10px] text-zinc-500 font-bold uppercase">Waiting</span>
                    </div>
                    <h3 className="text-2xl font-black text-white">{activeQueue.length}</h3>
                  </div>
                  <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 flex flex-col justify-between h-24 lg:h-32">
                    <div className="flex justify-between items-start">
                      <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400"><CheckCircle size={18} /></div>
                      <span className="text-[10px] text-zinc-500 font-bold uppercase">Done</span>
                    </div>
                    <h3 className="text-2xl font-black text-white">{stats.customers}</h3>
                  </div>
                </div>

                {/* REQUESTS */}
                {requests.length > 0 && (
                  <div className="animate-in fade-in slide-in-from-top-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-sm text-zinc-300 flex items-center gap-2"><Bell className="text-yellow-500 animate-bounce" size={16} /> New Requests ({requests.length})</h3>
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
                            <div className="flex flex-col">
                                <span className="text-[10px] uppercase text-zinc-500 font-bold tracking-wider">Arrival</span>
                                <span className="text-sm font-bold text-emerald-400">In {req.reachingTime || 0} mins</span>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-[10px] uppercase text-zinc-500 font-bold tracking-wider">Total</span>
                                <span className="text-lg font-black text-white">₹{req.totalPrice}</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <button onClick={() => handleRejectRequest(req)} className="py-2.5 bg-zinc-800 text-red-400 border border-white/5 hover:bg-red-500/10 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1">
                              <X size={14} /> Cancel
                            </button>
                            <button onClick={() => handleAcceptRequest(req)} className="py-2.5 bg-white text-black text-xs font-bold rounded-xl hover:bg-emerald-400 transition-colors flex items-center justify-center gap-1 shadow-lg shadow-white/5">
                              <CheckCircle size={14} /> Accept
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* MAIN OPERATIONAL AREA */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-auto lg:h-[600px]">
                  {/* LEFT: QUEUE LIST */}
                  <div className="lg:col-span-4 bg-zinc-900/30 border border-white/5 rounded-3xl overflow-hidden flex flex-col h-[400px] lg:h-full">
                    
                    <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between sticky top-0 backdrop-blur-sm z-10">
                      <h3 className="font-bold text-sm text-zinc-100">Waiting Queue</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-md">{activeQueue.length}</span>
                        <button 
                          onClick={() => setIsWalkInOpen(true)}
                          className="p-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white rounded-lg transition-all border border-emerald-500/20 shadow-lg shadow-emerald-500/5 group"
                          title="Add Walk-in"
                        >
                          <UserPlus size={16} className="group-hover:scale-110 transition-transform" />
                        </button>
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                      {activeQueue.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-zinc-600 gap-2">
                          <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center"><Users size={24} className="opacity-30" /></div>
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
                            
                            <div className="flex items-center gap-2">
                                <button onClick={() => handleRejectRequest(cust)} className="w-10 h-10 rounded-full bg-zinc-800/50 flex items-center justify-center text-zinc-500 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all" title="Remove Customer">
                                    <X size={16} />
                                </button>
                                <button onClick={() => openAssignmentModal(cust)} className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 hover:text-white hover:bg-emerald-500 border border-emerald-500/20 hover:border-emerald-500 transition-all shadow-lg shadow-emerald-500/10" title="Start Service">
                                    <Play size={16} fill="currentColor" />
                                </button>
                            </div>

                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* RIGHT: CHAIRS GRID */}
                  <div className="lg:col-span-8 bg-zinc-900/30 border border-white/5 rounded-3xl overflow-hidden flex flex-col h-auto lg:h-full">
                    
                    <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between sticky top-0 backdrop-blur-sm z-10">
                      <h3 className="font-bold text-sm text-zinc-100 flex items-center gap-2"><Scissors size={14} className="text-emerald-400" /> Service Floor</h3>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center bg-zinc-950 border border-white/10 rounded-lg p-0.5">
                          <button 
                            onClick={() => handleUpdateChairs(activeChairsCount - 1)} 
                            className="w-6 h-6 flex items-center justify-center rounded bg-zinc-800 hover:bg-zinc-700 text-white transition-all active:scale-95"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="text-xs font-bold w-6 text-center">{activeChairsCount}</span>
                          <button 
                            onClick={() => handleUpdateChairs(activeChairsCount + 1)} 
                            className="w-6 h-6 flex items-center justify-center rounded bg-zinc-800 hover:bg-zinc-700 text-white transition-all active:scale-95"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                        <span className="text-[10px] text-zinc-500 font-bold uppercase hidden sm:block">Active Chairs</span>
                      </div>
                    </div>

                    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-y-auto custom-scrollbar flex-1">
                      {chairs.map((chair) => (
                        <div key={chair.id} className={`relative rounded-2xl p-4 border transition-all flex flex-col justify-between min-h-[160px] ${chair.status === 'occupied' ? 'bg-zinc-900 border-emerald-500/30 shadow-lg shadow-emerald-900/10' : 'bg-zinc-900/50 border-white/5 border-dashed'}`}>
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${chair.status === 'occupied' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-600'}`}><Armchair size={16} /></div>
                              <div>
                                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{chair.name}</h4>
                                <p className={`text-[10px] font-bold ${chair.status === 'occupied' ? 'text-emerald-400' : 'text-zinc-600'}`}>{chair.status === 'occupied' ? 'ACTIVE' : 'EMPTY'}</p>
                              </div>
                            </div>
                            {chair.assignedStaff && <div className="flex items-center gap-1 bg-zinc-950 px-2 py-1 rounded border border-white/5"><UserCheck size={10} className="text-zinc-400" /><span className="text-[10px] font-medium text-zinc-300">{chair.assignedStaff}</span></div>}
                          </div>

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
                              
                              <div className="flex gap-2 w-full mb-2">
                                <button 
                                  onClick={() => setExtraServiceModal({ isOpen: true, customer: chair.currentCustomer })} 
                                  className="w-1/2 py-2 bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs font-bold rounded-lg hover:bg-purple-500 hover:text-white transition-colors flex items-center justify-center gap-1 active:scale-95"
                                >
                                  <Plus size={14} /> <span className="hidden sm:inline">Service</span>
                                </button>
                                <button 
                                  onClick={() => setExtendTimeModal({ isOpen: true, customer: chair.currentCustomer })} 
                                  className="w-1/2 py-2 bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold rounded-lg hover:bg-blue-500 hover:text-white transition-colors flex items-center justify-center gap-1 active:scale-95"
                                >
                                  <Clock8 size={14} /> <span className="hidden sm:inline">+ Time</span>
                                </button>
                              </div>

                              <div className="flex gap-2 w-full">
                                <button 
                                  onClick={() => handleCancelService(chair.id)} 
                                  className="w-1/3 py-2.5 bg-red-500/10 text-red-500 border border-red-500/20 text-xs font-bold rounded-lg hover:bg-red-500 hover:text-white transition-colors flex items-center justify-center gap-1 active:scale-95"
                                >
                                  <X size={14} /> <span className="hidden sm:inline">Cancel</span>
                                </button>
                                <button 
                                  onClick={() => handleCompleteService(chair.id)} 
                                  className="w-2/3 py-2.5 bg-white text-black text-xs font-bold rounded-lg hover:bg-emerald-400 transition-colors flex items-center justify-center gap-2 active:scale-95"
                                >
                                  <CheckSquare size={14} /> Complete
                                </button>
                              </div>

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

          {/* === VIEW: HISTORY === */}
          {activeTab === 'history' && (
              <SalonHistory />
          )}

          {/* === VIEW: REVIEWS === */}
          {activeTab === 'reviews' && (
              <SalonReviews 
                 salonId={salon._id} 
                 salonRating={salon.rating} 
                 totalReviews={salon.reviewsCount} 
              />
          )}

          {/* === VIEW: SETTINGS === */}
          {activeTab === 'settings' && (
              <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 pb-20">

                {/* 1. Services Manager */}
                <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-5 lg:p-6">
                  <h3 className="font-bold text-lg text-white mb-4 flex items-center gap-2"><Scissors className="text-emerald-400" size={20} /> Manage Services</h3>

                  {/* QUICK ADD */}
                  <div className="mb-6">
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 flex items-center gap-1"><Zap size={10} className="text-yellow-400" /> Quick Add</p>
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
                      <input type="text" placeholder="Service Name" className="col-span-3 bg-zinc-950 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-emerald-500 outline-none" value={newService.name} onChange={(e) => setNewService({ ...newService, name: e.target.value })} />
                      <input type="number" placeholder="₹ Price" className="bg-zinc-950 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-emerald-500 outline-none" value={newService.price} onChange={(e) => setNewService({ ...newService, price: e.target.value })} />
                      <input type="number" placeholder="Mins" className="bg-zinc-950 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-emerald-500 outline-none" value={newService.time} onChange={(e) => setNewService({ ...newService, time: e.target.value })} />
                      <button onClick={handleAddService} className="col-span-3 bg-emerald-500 text-white rounded-xl py-3 font-bold hover:bg-emerald-400 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"><Plus size={16} /> Add Service</button>
                    </div>
                  </div>

                  {/* LIST */}
                  <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                    {services.length === 0 ? <p className="text-zinc-500 text-sm text-center py-4">No services added.</p> : services.map((s, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-zinc-900 rounded-xl border border-white/5">
                        <div><h4 className="font-bold text-sm text-white">{s.name}</h4><p className="text-xs text-zinc-400">₹{s.price} • {s.time} mins</p></div>
                        <button onClick={() => handleDeleteService(i)} className="p-2 text-zinc-600 hover:text-red-400 transition-colors"><Trash2 size={16} /></button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Right Column (Photos & Staff) */}
                <div className="space-y-6">

                  {/* GALLERY MANAGER */}
                  <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-5 lg:p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-lg text-white flex items-center gap-2"><ImageIcon className="text-purple-400" size={20} /> Salon Photos</h3>
                      <span className="text-xs font-bold text-zinc-500">{gallery.length}/4</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                      {/* Display Photos */}
                      {gallery.map((img, index) => (
                        <div key={index} className="relative aspect-video rounded-xl overflow-hidden group border border-white/10">
                          <img src={img} alt="Salon" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleSetMainPhoto(index)}
                              title="Set as Cover"
                              className={`p-2 rounded-full ${index === 0 ? 'bg-yellow-500 text-black' : 'bg-white/10 text-white hover:bg-yellow-500 hover:text-black'}`}
                            >
                              <Star size={14} fill={index === 0 ? "currentColor" : "none"} />
                            </button>
                            <button
                              onClick={() => handleDeletePhoto(index)}
                              className="p-2 rounded-full bg-white/10 text-white hover:bg-red-500 hover:text-white"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                          {index === 0 && <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-yellow-500 text-black text-[9px] font-bold rounded uppercase">Main</div>}
                        </div>
                      ))}

                      {/* Upload Button */}
                      {gallery.length < 4 && (
                        <div
                          onClick={() => galleryInputRef.current.click()}
                          className="aspect-video rounded-xl border-2 border-dashed border-white/10 hover:border-emerald-500/50 hover:bg-white/5 flex flex-col items-center justify-center cursor-pointer transition-all group"
                        >
                          {uploading ? <Loader2 className="animate-spin text-emerald-500" /> : <UploadCloud className="text-zinc-600 group-hover:text-emerald-500 mb-2" />}
                          <span className="text-xs font-bold text-zinc-500 group-hover:text-zinc-300">{uploading ? "Uploading..." : "Add Photo"}</span>
                          <input type="file" ref={galleryInputRef} className="hidden" accept="image/*" onChange={handleGalleryUpload} />
                        </div>
                      )}
                    </div>
                    <p className="text-[10px] text-zinc-500">*The first photo will be your Main Cover.</p>
                  </div>

                  {/* Staff Manager */}
                  <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-5 lg:p-6">
                    <h3 className="font-bold text-lg text-white mb-4 flex items-center gap-2"><UserCheck className="text-blue-400" size={20} /> Staff</h3>
                    <div className="flex gap-2 mb-4">
                      <input type="text" placeholder="Staff Name" className="flex-1 bg-zinc-900 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-blue-500 outline-none" value={newStaffName} onChange={(e) => setNewStaffName(e.target.value)} />
                      <button onClick={handleAddStaff} className="px-4 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-400 active:scale-95 transition-all">Add</button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {staff.map((s, i) => (
                        <div key={i} className="px-3 py-1.5 bg-zinc-800 rounded-lg text-xs text-white border border-white/5 flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div> {s.name}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
          )}

        </div>

        {/* --- MOBILE: BOTTOM NAVIGATION BAR --- */}
        <div className="lg:hidden fixed bottom-0 left-0 w-full bg-zinc-900/80 backdrop-blur-xl border-t border-white/10 z-50 pb-safe">
          <div className="flex items-center justify-around h-16 px-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex flex-col items-center justify-center w-14 h-full space-y-1 ${activeTab === 'dashboard' ? 'text-white' : 'text-zinc-500'}`}
            >
              <Home size={22} strokeWidth={activeTab === 'dashboard' ? 3 : 2} />
              <span className="text-[10px] font-medium">Home</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex flex-col items-center justify-center w-14 h-full space-y-1 ${activeTab === 'history' ? 'text-white' : 'text-zinc-500'}`}
            >
              <FileText size={22} strokeWidth={activeTab === 'history' ? 3 : 2} />
              <span className="text-[10px] font-medium">History</span>
            </button>

            {/* CENTRAL ACTION BUTTON: ADD WALK-IN */}
            <button
              onClick={() => setIsWalkInOpen(true)}
              className="flex items-center justify-center w-14 h-14 bg-white text-black rounded-full shadow-lg shadow-white/10 -mt-6 border-4 border-zinc-900 active:scale-90 transition-transform"
            >
              <UserPlus size={24} />
            </button>

            {/* NEW: MOBILE REVIEWS TAB */}
            <button
              onClick={() => setActiveTab('reviews')}
              className={`flex flex-col items-center justify-center w-14 h-full space-y-1 ${activeTab === 'reviews' ? 'text-white' : 'text-zinc-500'}`}
            >
              <Star size={22} strokeWidth={activeTab === 'reviews' ? 3 : 2} />
              <span className="text-[10px] font-medium">Reviews</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`flex flex-col items-center justify-center w-14 h-full space-y-1 ${activeTab === 'settings' ? 'text-white' : 'text-zinc-500'}`}
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