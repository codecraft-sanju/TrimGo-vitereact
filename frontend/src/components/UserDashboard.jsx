import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  MapPin, Clock, Users, Star, Ticket, X, Filter, Search, Check,
  Sparkles, Navigation, Crosshair, Menu, Gift, BadgeCheck,
  Loader2, Image as ImageIcon, ChevronLeft, ChevronRight
} from "lucide-react";
import { io } from "socket.io-client";
import Lenis from 'lenis';
import api from "../utils/api";

// Imports
import MapSalon from "./MapSalon";
import { BackgroundAurora, NoiseOverlay, Logo } from "./SharedUI";
import AIConcierge from "./AIConcierge";

/* ---------------------------------
   ⚡ PERFORMANCE COMPONENTS
---------------------------------- */

// Optimized Image Loader (Same as before)
const PremiumImageLoader = ({ src, alt, className }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  return (
    <div className={`relative w-full h-full overflow-hidden bg-zinc-100 ${className}`}>
      {!isLoaded && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-zinc-50 animate-pulse">
           <Loader2 className="text-zinc-400 animate-spin" size={24} />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        onLoad={() => setIsLoaded(true)}
        className={`w-full h-full object-cover transition-all duration-700 ease-out ${isLoaded ? 'opacity-100 scale-100 blur-0' : 'opacity-0 scale-110 blur-sm'}`}
      />
    </div>
  );
};

/* ---------------------------------
   HELPER: SALON GALLERY MODAL
---------------------------------- */
const SalonGalleryModal = ({ isOpen, onClose, images, salonName }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  if (!isOpen || !images || images.length === 0) return null;

  const nextImage = (e) => { e.stopPropagation(); setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1)); };
  const prevImage = (e) => { e.stopPropagation(); setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1)); };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl animate-in fade-in duration-300" onClick={onClose}>
      <button onClick={onClose} className="absolute top-6 right-6 text-white/50 hover:text-white z-50 p-2"><X size={32} /></button>
      <div className="relative w-full max-w-5xl h-[85vh] flex flex-col items-center justify-center" onClick={(e) => e.stopPropagation()}>
        <div className="relative w-full h-full flex items-center justify-center px-4 md:px-10">
          <img src={images[currentIndex]} alt="View" className="max-h-full max-w-full object-contain rounded-sm shadow-2xl animate-in zoom-in-95 duration-500" />
          {images.length > 1 && (
            <>
              <button onClick={prevImage} className="absolute left-4 md:left-0 p-4 rounded-full text-white/50 hover:text-white hover:bg-white/10"><ChevronLeft size={40} /></button>
              <button onClick={nextImage} className="absolute right-4 md:right-0 p-4 rounded-full text-white/50 hover:text-white hover:bg-white/10"><ChevronRight size={40} /></button>
            </>
          )}
        </div>
        <div className="absolute bottom-6 left-0 w-full text-center pointer-events-none">
             <div className="inline-block bg-zinc-900/80 backdrop-blur-md px-6 py-3 rounded-full border border-white/10">
                <h3 className="text-white font-medium text-sm tracking-wide">{salonName}</h3>
                <div className="flex gap-1.5 items-center justify-center mt-2">
                    {images.map((_, idx) => (
                        <div key={idx} className={`h-1 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/20'}`} />
                    ))}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

/* ---------------------------------
   HELPER: DISTANCE & SERVICE MODAL
---------------------------------- */
const deg2rad = (deg) => deg * (Math.PI / 180);
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return d < 1 ? `${Math.round(d * 1000)} m` : `${d.toFixed(1)} km`;
};

const ServiceSelectionModal = ({ salon, onClose, onConfirm, isJoining }) => {
  const [selectedServices, setSelectedServices] = useState([]);
  const servicesList = salon.services || [];

  const toggleService = (serviceId) => {
    if (isJoining) return;
    setSelectedServices((prev) => prev.includes(serviceId) ? prev.filter((id) => id !== serviceId) : [...prev, serviceId]);
  };

  const totalDetails = useMemo(() => {
    return selectedServices.reduce((acc, id) => {
      const service = servicesList.find((s) => s._id === id);
      if (service) { acc.price += service.price; acc.time += service.time; }
      return acc;
    }, { price: 0, time: 0 });
  }, [selectedServices, servicesList]);

  const handleConfirm = () => {
    if (selectedServices.length === 0 || isJoining) return;
    const finalServices = servicesList.filter((s) => selectedServices.includes(s._id));
    onConfirm(salon, finalServices, totalDetails);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={!isJoining ? onClose : undefined}></div>
      <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 bg-zinc-50 border-b border-zinc-100 flex justify-between items-start">
          <div><h2 className="text-lg font-bold text-zinc-900">{salon.salonName}</h2><p className="text-xs text-zinc-500">Select services</p></div>
          <button onClick={onClose} disabled={isJoining} className="p-1 rounded-full hover:bg-zinc-200"><X size={20} className="text-zinc-500" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {servicesList.length === 0 ? <div className="text-center text-zinc-400 py-10 text-sm">No services listed.</div> : servicesList.map((service) => {
             const isSelected = selectedServices.includes(service._id);
             return (
               <div key={service._id} onClick={() => toggleService(service._id)} className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${isSelected ? "border-zinc-900 bg-zinc-50 ring-1 ring-zinc-900" : "border-zinc-200 bg-white"} ${isJoining ? "opacity-50" : ""}`}>
                  <div className="flex items-start gap-3">
                     <div className={`mt-1 w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${isSelected ? "bg-zinc-900 border-zinc-900" : "border-zinc-300 bg-white"}`}>{isSelected && <Check size={12} className="text-white" />}</div>
                     <div><h4 className="text-sm font-semibold text-zinc-900">{service.name}</h4><p className="text-xs text-zinc-500">{service.time} mins • {service.category}</p></div>
                  </div>
                  <div className="text-right"><span className="text-sm font-bold text-zinc-900">₹{service.price}</span></div>
               </div>
             );
          })}
        </div>
        <div className="p-4 bg-white border-t border-zinc-100">
           <div className="flex justify-between items-end mb-4 px-2">
              <div><p className="text-xs font-semibold text-zinc-500 uppercase">Total</p><div className="flex items-baseline gap-2"><span className="text-2xl font-black text-zinc-900">₹{totalDetails.price}</span><span className="text-sm text-zinc-500 font-medium">{totalDetails.time} mins</span></div></div>
              <span className="text-xs font-bold bg-zinc-100 px-2 py-1 rounded text-zinc-600">{selectedServices.length} items</span>
           </div>
           <button onClick={handleConfirm} disabled={selectedServices.length === 0 || isJoining} className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${selectedServices.length > 0 && !isJoining ? "bg-zinc-900 text-white shadow-lg shadow-zinc-900/20 active:scale-[0.98]" : "bg-zinc-100 text-zinc-400 cursor-not-allowed"}`}>
              {isJoining ? <><Loader2 size={16} className="animate-spin" /><span>Securing Spot...</span></> : <><span>Confirm & Join Queue</span><Ticket size={16} /></>}
           </button>
        </div>
      </div>
    </div>
  );
};

/* ---------------------------------
   🚀 MAIN COMPONENT
---------------------------------- */
const UserDashboard = ({ user, onLogout, onProfileClick, onReferralClick }) => {
  const [selectedCity, setSelectedCity] = useState("Locating...");
  const [sortBy, setSortBy] = useState("distance");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("All");

  const [salons, setSalons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isJoiningQueue, setIsJoiningQueue] = useState(false);
  const [activeBookingSalon, setActiveBookingSalon] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [activeTicket, setActiveTicket] = useState(null);
  const [canceling, setCanceling] = useState(false);
  const [galleryModal, setGalleryModal] = useState({ isOpen: false, images: [], name: "" });

  const [userLocation, setUserLocation] = useState(null);
  const [heading, setHeading] = useState(0);
  const [routeDestination, setRouteDestination] = useState(null);
  const watchId = useRef(null);

  // --- 🔥 OPTIMIZED SCROLL: LENIS + NATIVE FEEL ---
  useEffect(() => {
    // We use a lower duration for a snappier, less "floaty" feel
    const lenis = new Lenis({
      duration: 0.8, // ⚡ Faster than 1.2
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2, // Better touch response
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    return () => lenis.destroy();
  }, []);

  // --- LOCATION & SOCKETS (Same Logic) ---
  const startLocationTracking = () => {
    if (!navigator.geolocation) { setSelectedCity("Location N/A"); return; }
    
    // Heading Logic
    const handleOrientation = (e) => {
       const compass = e.webkitCompassHeading || (360 - e.alpha);
       if (compass) setHeading(compass);
    };
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission().then(r => r === 'granted' && window.addEventListener('deviceorientation', handleOrientation)).catch(console.error);
    } else {
        window.addEventListener('deviceorientation', handleOrientation);
    }

    if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
    setSelectedCity("Locating...");

    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        if (pos.coords.heading) setHeading(pos.coords.heading);
        setSelectedCity("Live Tracking");
      },
      (err) => setSelectedCity(err.code === 3 ? "GPS Weak" : "Location Offline"),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 5000 }
    );
  };

  const handleRoute = (salon) => {
     if (!userLocation) { alert("Please enable location."); startLocationTracking(); return; }
     if (!salon.latitude) { alert("Location not found."); return; }
     setRouteDestination({ lat: Number(salon.latitude), lng: Number(salon.longitude) });
     window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    startLocationTracking();
    fetchActiveTicket();
    const socket = io(import.meta.env.VITE_BACKEND_URL);
    if(user?._id) socket.emit("join_room", `user_${user._id}`);

    socket.on("salon_updated", (u) => setSalons(p => p.map(s => s._id === u.id ? { ...s, ...u } : s)));
    socket.on("salon_registered", (n) => setSalons(p => [n, ...p]));
    socket.on("queue_update_broadcast", ({ salonId, waitingCount, estTime }) => {
       setSalons(p => p.map(s => s._id === salonId ? { ...s, waiting: waitingCount, estTime } : s));
    });
    socket.on("request_accepted", (t) => setActiveTicket(t));
    socket.on("request_rejected", () => { setActiveTicket(null); alert("Request rejected."); });
    socket.on("status_change", (d) => setActiveTicket(p => p ? {...p, status: d.status, chairId: d.chairId} : null));
    socket.on("service_completed", () => { setActiveTicket(null); alert("Service completed!"); });
    fetchSalons();
    return () => { socket.disconnect(); if (watchId.current) navigator.geolocation.clearWatch(watchId.current); };
  }, [user]);

  const fetchSalons = async () => {
    try {
        setLoading(true);
        let query = `/salon/all?search=${searchTerm}`;
        if(filterType !== "All") query += `&type=${filterType}`;
        const { data } = await api.get(query);
        if(data.success) setSalons(data.salons);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const fetchActiveTicket = async () => {
      try { const { data } = await api.get("/queue/my-ticket"); setActiveTicket(data.success ? data.ticket : null); } catch (e) { console.error(e); }
  };

  useEffect(() => { const t = setTimeout(() => fetchSalons(), 500); return () => clearTimeout(t); }, [searchTerm, filterType]);

  // Sorting Logic
  const salonsWithDistance = useMemo(() => salons.map(s => ({ ...s, distance: calculateDistance(userLocation?.lat, userLocation?.lng, s.latitude, s.longitude) })), [salons, userLocation]);
  const sortedSalons = useMemo(() => {
      let sorted = [...salonsWithDistance];
      sorted.sort((a, b) => b.isOnline - a.isOnline);
      if (sortBy === "distance") {
          sorted.sort((a, b) => {
             const getVal = (s) => !s ? Infinity : (s.includes('m') ? parseFloat(s)/1000 : parseFloat(s));
             return getVal(a.distance) - getVal(b.distance);
          });
      } else if (sortBy === "waiting") sorted.sort((a, b) => (a.waiting || 0) - (b.waiting || 0));
      else if (sortBy === "rating") sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      return sorted;
  }, [salonsWithDistance, sortBy]);

  const handleConfirmBooking = async (salon, services, totals) => {
    setIsJoiningQueue(true);
    try {
        const payload = { salonId: salon._id, services: services.map(s => ({ name: s.name, price: s.price, time: s.time, category: s.category })), totalPrice: totals.price, totalTime: totals.time };
        const { data } = await api.post("/queue/join", payload);
        if(data.success) { setActiveTicket(data.ticket); setActiveBookingSalon(null); }
    } catch (e) { alert(e.response?.data?.message || "Failed"); } finally { setIsJoiningQueue(false); }
  };

  const handleCancelTicket = async () => {
      if(!activeTicket || !window.confirm("Cancel spot?")) return;
      setCanceling(true);
      try { const { data } = await api.post("/queue/cancel", { ticketId: activeTicket._id }); if(data.success) setActiveTicket(null); } catch (e) { alert("Failed"); } finally { setCanceling(false); }
  };

  return (
    // 🔥 ROOT: Fixed mobile height jump & native smooth touch
    <div className="relative min-h-[100dvh] w-full bg-[#F5F5F7] touch-pan-y overflow-x-hidden selection:bg-indigo-100 font-sans text-zinc-900">
      
      {/* 🔥 BACKGROUND: Fixed so it doesn't repaint on scroll */}
      <div className="fixed inset-0 z-0 pointer-events-none transform-gpu">
         <BackgroundAurora />
         <NoiseOverlay />
      </div>

      {/* --- MODALS --- */}
      {activeBookingSalon && <ServiceSelectionModal salon={activeBookingSalon} onClose={() => !isJoiningQueue && setActiveBookingSalon(null)} onConfirm={handleConfirmBooking} isJoining={isJoiningQueue} />}
      <SalonGalleryModal isOpen={galleryModal.isOpen} onClose={() => setGalleryModal({isOpen: false, images: [], name: ""})} images={galleryModal.images} salonName={galleryModal.name} />

      {/* 🔥 HEADER: Glass on Desktop, Solid on Mobile (Performance) */}
      <header className="fixed top-0 left-0 w-full z-40 px-0 md:px-0 transition-all duration-300 pointer-events-none">
        {/* We use an inner container for the background styling to keep layout clean */}
        <div className="w-full bg-white/95 md:bg-white/70 md:backdrop-blur-xl border-b border-zinc-200/50 shadow-sm pointer-events-auto">
            <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between relative">
            
            <div className="flex items-center gap-3">
                <Logo />
                <div className="h-6 w-px bg-zinc-200 hidden md:block"></div>
                <div onClick={onProfileClick} className="hidden md:flex items-center gap-3 cursor-pointer group">
                <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 p-[2px] shadow-lg">
                    <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || "Guest"}`} alt="User" className="w-full h-full object-cover" />
                    </div>
                    </div>
                </div>
                <div className="flex flex-col">
                    <span className="text-sm font-bold text-zinc-900 leading-none">{user?.name || "Guest"}</span>
                    <span className="text-[10px] font-medium text-zinc-500 mt-0.5">Free Plan</span>
                </div>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center gap-4">
                <button onClick={onReferralClick} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 text-xs font-bold hover:bg-indigo-100 transition-colors">
                    <Gift size={14} /><span>Earn Rewards</span>
                </button>
                <button onClick={startLocationTracking} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${userLocation ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-zinc-100 text-zinc-600 border-zinc-200'}`}>
                    {userLocation ? <Navigation size={12} className="animate-pulse" /> : <Crosshair size={12} />}<span>{selectedCity}</span>
                </button>
                <button onClick={onLogout} className="text-xs font-bold px-4 py-2 rounded-full bg-zinc-900 text-white hover:bg-zinc-800 transition-colors">Log out</button>
                </div>

                <div className="md:hidden flex items-center gap-3">
                <button onClick={onReferralClick} className="w-8 h-8 flex items-center justify-center rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 active:scale-95"><Gift size={16} /></button>
                <div onClick={onProfileClick} className="relative cursor-pointer active:scale-95 transition-transform">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 p-[1.5px] shadow-sm">
                    <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || "Guest"}`} alt="User" className="w-full h-full object-cover" />
                    </div>
                    </div>
                </div>
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className={`p-2 rounded-lg transition-all ${isMobileMenuOpen ? 'bg-zinc-100 text-zinc-900' : 'bg-transparent text-zinc-700'}`}>
                    {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
                </div>
            </div>

            {/* Mobile Dropdown */}
            <div className={`md:hidden absolute top-[calc(100%+8px)] right-4 w-60 bg-white/95 backdrop-blur-2xl border border-zinc-100 rounded-2xl shadow-2xl p-2 flex flex-col gap-2 origin-top-right transition-all duration-300 ${isMobileMenuOpen ? 'opacity-100 scale-100 translate-y-0 visible' : 'opacity-0 scale-90 -translate-y-4 invisible pointer-events-none'}`}>
                <button onClick={() => { onReferralClick(); setIsMobileMenuOpen(false); }} className="w-full flex items-center justify-start gap-3 px-4 py-3 rounded-xl font-bold text-sm hover:bg-zinc-50 text-zinc-700"><Gift size={16} className="text-indigo-500"/><span>Partner Program</span></button>
                <button onClick={() => { startLocationTracking(); setIsMobileMenuOpen(false); }} className={`w-full flex items-center justify-start gap-3 px-4 py-3 rounded-xl font-bold text-sm border transition-all ${userLocation ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-zinc-50 text-zinc-600 border-zinc-100'}`}>{userLocation ? <Navigation size={16} className="animate-pulse" /> : <Crosshair size={16} />}<span className="truncate">{selectedCity}</span></button>
                <button onClick={onLogout} className="w-full flex items-center justify-start gap-3 px-4 py-3 rounded-xl bg-zinc-900 text-white font-bold text-sm shadow-md active:scale-[0.98]">Log out</button>
            </div>
            </div>
        </div>
      </header>

      {/* --- CONTENT (Relative z-10 to scroll over fixed background) --- */}
      <main className="relative z-10 max-w-6xl mx-auto px-4 pt-24 sm:pt-24 pb-32">
        
        <div className="mb-8 sm:mb-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
            <div>
              <p className="text-[10px] sm:text-xs font-semibold text-zinc-500 mb-1 uppercase tracking-[0.16em]">Live Availability</p>
              <h1 className="text-3xl sm:text-4xl font-black text-zinc-900 tracking-tight">Find a salon near you.</h1>
            </div>
            <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
              {["All", "Unisex", "Men Only", "Women Only"].map((type) => (
                <button key={type} onClick={() => setFilterType(type)} className={`px-4 py-2.5 rounded-xl font-bold whitespace-nowrap border transition-all text-[11px] sm:text-sm ${filterType === type ? "bg-zinc-900 text-white border-zinc-900" : "bg-white text-zinc-600 border-zinc-200"}`}>{type}</button>
              ))}
            </div>
          </div>

          <MapSalon salons={sortedSalons} userLocation={userLocation} heading={heading} onSelect={(s) => !activeTicket ? setActiveBookingSalon(s) : alert("Cancel current ticket first")} routeDestination={routeDestination} onRouteClick={handleRoute} />

          <div className="flex flex-col md:flex-row gap-4 mt-6">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
              <input type="text" placeholder="Search salons..." className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white border border-zinc-200 shadow-sm focus:ring-2 focus:ring-zinc-900 transition-all" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider whitespace-nowrap">Sort:</span>
              {["distance", "waiting", "rating"].map((criteria) => (
                <button key={criteria} onClick={() => setSortBy(criteria)} className={`text-[10px] px-3 py-1.5 rounded-full border whitespace-nowrap transition-colors ${sortBy === criteria ? "bg-zinc-900 text-white border-zinc-900" : "bg-white border-zinc-200 text-zinc-500"}`}>{criteria.charAt(0).toUpperCase() + criteria.slice(1)}</button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
            <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-zinc-900"></div></div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {sortedSalons.map((salon) => (
                <div key={salon._id} className="group relative rounded-2xl bg-white border border-zinc-200 shadow-sm overflow-hidden flex flex-col hover:shadow-lg hover:border-zinc-300 transition-all duration-300">
                
                {/* Image Section */}
                <div className="relative h-48 w-full bg-zinc-100 overflow-hidden">
                    {salon.gallery && salon.gallery.length > 0 ? (
                        <PremiumImageLoader src={salon.gallery[0]} alt={salon.salonName} />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-zinc-300 bg-zinc-50"><ImageIcon size={40} /></div>
                    )}
                    <div className="absolute top-3 right-3 flex flex-col items-end gap-1 z-20">
                          {salon.isOnline ? <span className="px-2 py-1 rounded-md bg-emerald-500 text-[10px] font-bold text-white shadow-sm">OPEN</span> : <span className="px-2 py-1 rounded-md bg-red-500 text-[10px] font-bold text-white shadow-sm">CLOSED</span>}
                    </div>
                    {salon.gallery && salon.gallery.length > 1 && (
                        <button onClick={(e) => { e.stopPropagation(); setGalleryModal({isOpen: true, images: salon.gallery, name: salon.salonName}); }} className="absolute bottom-3 right-3 px-2.5 py-1.5 bg-black/50 backdrop-blur-md text-white text-[10px] font-bold rounded-lg flex items-center gap-1.5 hover:bg-black/70 transition z-20">
                            <ImageIcon size={12} /><span>+{salon.gallery.length - 1} photos</span>
                        </button>
                    )}
                </div>

                <div className="p-4 sm:p-5 flex flex-col gap-4 flex-1">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h2 className="text-lg font-bold text-zinc-900 line-clamp-1">{salon.salonName}</h2>
                          {salon.verified && <BadgeCheck size={18} className="text-blue-500 fill-white ml-0.5 shrink-0" />}
                        </div>
                        <p className="text-[11px] text-zinc-500 line-clamp-1 mb-1.5 flex items-center gap-1"><MapPin size={12} className="shrink-0" />{salon.address || "N/A"}</p>
                        <div className="flex items-center gap-2 text-[11px] text-zinc-500">
                            {salon.distance && <span className="flex items-center gap-1 text-emerald-600 font-bold"><Navigation size={10} fill="currentColor" /> {salon.distance} away</span>}
                            <span className="w-1 h-1 bg-zinc-300 rounded-full"></span><span className="font-semibold">{salon.salonType || "Unisex"}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="flex items-center justify-end gap-1 text-sm font-bold text-zinc-900 bg-zinc-50 px-2 py-1 rounded-lg">
                          <Star className="text-yellow-400 fill-yellow-400" size={14} />{salon.rating ? salon.rating.toFixed(1) : "New"}
                        </div>
                        <p className="text-[10px] text-zinc-400 text-right mt-1">{salon.reviewsCount || 0} reviews</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 py-3 border-y border-zinc-50">
                      <div className="flex flex-col items-center sm:items-start">
                        <span className="text-[9px] uppercase text-zinc-400 font-bold tracking-tight">Waiting</span>
                        <div className="flex items-baseline gap-0.5"><span className="text-xl sm:text-2xl font-black text-zinc-900">{salon.waiting || 0}</span><span className="text-[9px] text-zinc-500">pax</span></div>
                      </div>
                      <div className="flex flex-col items-center sm:items-start border-x border-zinc-100 px-2">
                        <span className="text-[9px] uppercase text-zinc-400 font-bold tracking-tight">Est. Time</span>
                        <div className="flex items-center gap-1 mt-0.5"><Clock size={12} className="text-zinc-400" /><span className="text-xs sm:text-sm font-bold text-zinc-900">{salon.estTime || 0} min</span></div>
                      </div>
                      <div className="flex flex-col items-center sm:items-end">
                        <span className="text-[9px] uppercase text-zinc-400 font-bold tracking-tight">Team</span>
                        <div className="flex items-center gap-1 mt-0.5"><Users size={12} className="text-zinc-400" /><span className="text-xs sm:text-sm font-bold text-zinc-900">{salon.staff?.length || 1} staff</span></div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3 pt-1 mt-auto">
                      <div className="flex items-center gap-1.5 text-[10px] text-emerald-700 font-bold bg-emerald-50/50 px-2 py-1 rounded-lg">
                        <Sparkles size={12} /><span className="truncate max-w-[100px]">{salon.tag || "Top Rated"}</span>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleRoute(salon)} className="p-2.5 rounded-xl bg-zinc-50 text-zinc-600 hover:bg-zinc-100 border border-zinc-100"><Navigation size={18} fill="currentColor" className="transform rotate-45" /></button>
                        <button onClick={() => setActiveBookingSalon(salon)} disabled={!salon.isOnline || (activeTicket && activeTicket.salonId?._id !== salon._id)} className={`px-5 py-2.5 rounded-xl text-white text-[11px] font-bold transition-all flex items-center gap-2 shadow-sm ${!salon.isOnline ? 'bg-zinc-300 cursor-not-allowed' : activeTicket ? 'bg-zinc-400 cursor-not-allowed' : 'bg-zinc-900 active:scale-95'}`}>
                            {salon.isOnline ? (activeTicket ? "Busy" : "Join Queue") : "Offline"} <Ticket size={14} />
                        </button>
                      </div>
                    </div>
                </div>
                </div>
            ))}
            </div>
        )}

        {sortedSalons.length === 0 && !loading && (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-zinc-200">
            <Filter size={40} className="mx-auto mb-3 text-zinc-300" />
            <p className="text-lg font-bold text-zinc-900">No salons found</p>
            <p className="text-sm text-zinc-500">Try adjusting your filters or search.</p>
          </div>
        )}

        <p className="mt-12 text-[10px] text-zinc-400 text-center uppercase tracking-widest font-medium">Live TrimGo Network • © 2025</p>
        <AIConcierge salons={sortedSalons} onSalonSelect={!activeTicket ? setActiveBookingSalon : () => {}} />
      </main>

      {/* 🔥 ACTIVE TICKET FLOATING CARD */}
      {activeTicket && (
        <div className="fixed bottom-4 left-4 right-4 z-50 animate-in slide-in-from-bottom-20 duration-500">
            <div className="bg-zinc-900/95 backdrop-blur-lg rounded-2xl shadow-2xl p-4 border border-white/10 text-white flex flex-col gap-3 max-w-lg mx-auto">
                <div className="flex justify-between items-center">
                    <div>
                        <div className="flex items-center gap-2 mb-1"><span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span><span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Current Status</span></div>
                        <h3 className="font-bold text-lg">{activeTicket.salonId?.salonName || "Salon"}</h3>
                        <p className="text-xs text-zinc-400">Queue #{activeTicket.queueNumber} • {activeTicket.status.toUpperCase()}</p>
                    </div>
                    <div className="text-right"><div className="text-2xl font-black">₹{activeTicket.totalPrice}</div><div className="text-xs text-zinc-400">to pay</div></div>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => handleRoute(salons.find(s => s._id === (activeTicket.salonId?._id || activeTicket.salonId)) || activeTicket.salonId)} className="flex-1 bg-white/10 hover:bg-white/20 py-3 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2"><Navigation size={16} /> Directions</button>
                    <button onClick={handleCancelTicket} disabled={canceling} className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 py-3 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2">{canceling ? <Loader2 size={16} className="animate-spin"/> : <X size={16} />} Cancel</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;