import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  MapPin,
  Clock,
  Users,
  Star,
  Ticket,
  X,
  Filter,
  Search,
  Check,
  Sparkles,
  Navigation, 
  Crosshair, 
  Menu 
} from "lucide-react";
import { io } from "socket.io-client"; 
import api from "../utils/api"; 

// Imports
import MapSalon from "./MapSalon";
import { BackgroundAurora, NoiseOverlay, Logo } from "./SharedUI";
import AIConcierge from "./AIConcierge"; 

/* ---------------------------------
   HELPER: HAVERSINE DISTANCE FORMULA
---------------------------------- */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;

  const R = 6371; 
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; 
  
  if (d < 1) {
    return `${Math.round(d * 1000)} m`; 
  }
  return `${d.toFixed(1)} km`; 
};

const deg2rad = (deg) => {
  return deg * (Math.PI / 180);
};

/* ---------------------------------
   HELPER COMPONENT: SERVICE MODAL 
---------------------------------- */
const ServiceSelectionModal = ({ salon, onClose, onConfirm }) => {
  const [selectedServices, setSelectedServices] = useState([]);
  const servicesList = salon.services || [];

  const toggleService = (serviceId) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const totalDetails = useMemo(() => {
    return selectedServices.reduce(
      (acc, id) => {
        const service = servicesList.find((s) => s._id === id); 
        if (service) {
          acc.price += service.price;
          acc.time += service.time;
        }
        return acc;
      },
      { price: 0, time: 0 }
    );
  }, [selectedServices, servicesList]);

  const handleConfirm = () => {
    if (selectedServices.length === 0) return;
    const finalServices = servicesList.filter((s) =>
      selectedServices.includes(s._id)
    );
    onConfirm(salon, finalServices, totalDetails);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 bg-zinc-50 border-b border-zinc-100 flex justify-between items-start">
          <div>
            <h2 className="text-lg font-bold text-zinc-900">{salon.salonName}</h2>
            <p className="text-xs text-zinc-500">Select services to join queue</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-zinc-200 transition">
            <X size={20} className="text-zinc-500" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {servicesList.length === 0 ? (
             <div className="text-center text-zinc-400 py-10 text-sm">No services listed by this salon yet.</div>
          ) : (
            servicesList.map((service) => {
                const isSelected = selectedServices.includes(service._id);
                return (
                <div
                    key={service._id}
                    onClick={() => toggleService(service._id)}
                    className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                    isSelected ? "border-zinc-900 bg-zinc-50 ring-1 ring-zinc-900" : "border-zinc-200 hover:border-zinc-300 bg-white"
                    }`}
                >
                    <div className="flex items-start gap-3">
                    <div className={`mt-1 w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${isSelected ? "bg-zinc-900 border-zinc-900" : "border-zinc-300 bg-white"}`}>
                        {isSelected && <Check size={12} className="text-white" />}
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold text-zinc-900">{service.name}</h4>
                        <p className="text-xs text-zinc-500">{service.time} mins • {service.category}</p>
                    </div>
                    </div>
                    <div className="text-right"><span className="text-sm font-bold text-zinc-900">₹{service.price}</span></div>
                </div>
                );
            })
          )}
        </div>
        <div className="p-4 bg-white border-t border-zinc-100">
          <div className="flex justify-between items-end mb-4 px-2">
            <div>
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Total Estimate</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-zinc-900">₹{totalDetails.price}</span>
                <span className="text-sm text-zinc-500 font-medium">for {totalDetails.time} mins</span>
              </div>
            </div>
            <div className="text-right">
                <span className="text-xs font-bold bg-zinc-100 px-2 py-1 rounded text-zinc-600">{selectedServices.length} items</span>
            </div>
          </div>
          <button onClick={handleConfirm} disabled={selectedServices.length === 0} className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${selectedServices.length > 0 ? "bg-zinc-900 text-white shadow-lg shadow-zinc-900/20 hover:scale-[1.02]" : "bg-zinc-100 text-zinc-400 cursor-not-allowed"}`}>
            <span>Confirm & Join Queue</span>
            <Ticket size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

/* ---------------------------------
   MAIN COMPONENT 
---------------------------------- */

const UserDashboard = ({ user, onLogout, onJoinQueue, onProfileClick }) => {
  const [selectedCity, setSelectedCity] = useState("Locating...");
  const [sortBy, setSortBy] = useState("distance"); 
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("All");
  
  const [salons, setSalons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeBookingSalon, setActiveBookingSalon] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); 
  
  const [userLocation, setUserLocation] = useState(null); 
  const [heading, setHeading] = useState(0); 
  const [routeDestination, setRouteDestination] = useState(null); // 🔥 NEW: Route State
  const watchId = useRef(null); 

  const startLocationTracking = () => {
    if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser.");
        setSelectedCity("Location N/A");
        return;
    }

    const handleOrientation = (e) => {
        const compass = e.webkitCompassHeading || (360 - e.alpha);
        if (compass) {
            setHeading(compass);
        }
    };

    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission()
            .then(response => {
                if (response === 'granted') {
                    window.addEventListener('deviceorientation', handleOrientation);
                }
            })
            .catch(console.error);
    } else {
        window.addEventListener('deviceorientation', handleOrientation);
    }

    if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
    }

    setSelectedCity("Locating...");

    watchId.current = navigator.geolocation.watchPosition(
        (position) => {
            setUserLocation({
                lat: position.coords.latitude,
                lng: position.coords.longitude
            });
            if (position.coords.heading !== null && position.coords.heading !== undefined) {
                setHeading(position.coords.heading);
            }
            setSelectedCity("Live Tracking");
        },
        (error) => {
            console.error("❌ Location Error:", error);
            if(error.code === 3) {
                setSelectedCity("GPS Weak");
            } else {
                setSelectedCity("Location Offline");
            }
        },
        { 
          enableHighAccuracy: true, 
          timeout: 20000, 
          maximumAge: 5000 
        } 
    );
  };

  // 🔥 NEW: Handle Routing Click
 // 🔥 UPDATED: Safe Route Handler
  const handleRoute = (salon) => {
    // 1. Check if user location exists
    if (!userLocation) {
        alert("Please enable location first to get directions.");
        startLocationTracking();
        return;
    }

    // 2. Safety Check: Agar salon ki location missing ho toh crash mat hona
    if(!salon.latitude || !salon.longitude) {
        alert("Salon location not found on map.");
        return;
    }

    // 3. Set destination (String ko Number mein convert karna zaroori hai)
    setRouteDestination({
        lat: Number(salon.latitude),
        lng: Number(salon.longitude)
    });

    // 4. Scroll map into view smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    startLocationTracking();

    const socket = io(import.meta.env.VITE_BACKEND_URL);
    if(user?._id) socket.emit("join_room", `user_${user._id}`); 

    socket.on("salon_updated", (updatedData) => {
        setSalons(prevSalons => prevSalons.map(s => 
            s._id === updatedData.id ? { ...s, ...updatedData } : s
        ));
    });

    socket.on("salon_registered", (newSalon) => {
        setSalons((prevSalons) => [newSalon, ...prevSalons]);
    });

    socket.on("queue_update_broadcast", ({ salonId, waitingCount, estTime }) => {
        setSalons((prevSalons) => 
            prevSalons.map((salon) => {
                if (salon._id === salonId) {
                    return { 
                        ...salon, 
                        waiting: waitingCount, 
                        estTime: estTime 
                    }; 
                }
                return salon;
            })
        );
    });

    fetchSalons();

    return () => {
      socket.disconnect();
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
      }
    };
  }, [user]);

  const fetchSalons = async () => {
    try {
        setLoading(true);
        let query = `/salon/all?search=${searchTerm}`;
        if(filterType !== "All") query += `&type=${filterType}`;

        const { data } = await api.get(query);
        if(data.success) {
            setSalons(data.salons);
        }
    } catch (error) {
        console.error("Error fetching salons:", error);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => fetchSalons(), 500); 
    return () => clearTimeout(timer);
  }, [searchTerm, filterType]);

  const salonsWithDistance = useMemo(() => {
      return salons.map(salon => {
          let distStr = null;
          if (userLocation && salon.latitude && salon.longitude) {
              distStr = calculateDistance(userLocation.lat, userLocation.lng, salon.latitude, salon.longitude);
          }
          return { ...salon, distance: distStr };
      });
  }, [salons, userLocation]);

  const sortedSalons = useMemo(() => {
      let sorted = [...salonsWithDistance];
      sorted.sort((a, b) => b.isOnline - a.isOnline);

      if (sortBy === "distance") {
          sorted.sort((a, b) => {
              if (a.distance === null) return 1;
              if (b.distance === null) return -1;
              const getVal = (s) => {
                if(!s) return Infinity;
                if(s.includes('m')) return parseFloat(s) / 1000;
                return parseFloat(s);
              };
              return getVal(a.distance) - getVal(b.distance);
          });
      } else if (sortBy === "waiting") {
          sorted.sort((a, b) => (a.waiting || 0) - (b.waiting || 0)); 
      } else if (sortBy === "rating") {
          sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      }
      return sorted;
  }, [salonsWithDistance, sortBy]);

  const handleOpenBooking = (salon) => {
    if(!salon.isOnline) {
        alert("This salon is currently offline.");
        return;
    }
    setActiveBookingSalon(salon);
  };

  const handleCloseBooking = () => setActiveBookingSalon(null);

  const handleConfirmBooking = async (salon, services, totals) => {
    try {
        const payload = {
            salonId: salon._id, 
            services: services.map(s => ({ 
                name: s.name, 
                price: s.price, 
                time: s.time, 
                category: s.category 
             })),
            totalPrice: totals.price,
            totalTime: totals.time
        };

        const { data } = await api.post("/queue/join", payload);

        if(data.success) {
            onJoinQueue({
                ...salon,
                ticketId: data.ticket._id,
                status: data.ticket.status,
                number: data.ticket.queueNumber, 
                eta: totals.time
            });
            setActiveBookingSalon(null);
        }
    } catch (error) {
        alert(error.response?.data?.message || "Failed to join queue");
    }
  };

  return (
    <div className="min-h-screen w-full bg-zinc-50 font-sans overflow-x-hidden pb-32">
      <BackgroundAurora />
      <NoiseOverlay />

      {activeBookingSalon && (
        <ServiceSelectionModal 
            salon={activeBookingSalon} 
            onClose={handleCloseBooking} 
            onConfirm={handleConfirmBooking} 
        />
      )}

      {/* HEADER */}
      <header className="fixed top-0 left-0 w-full z-40 bg-white/80 backdrop-blur-xl border-b border-zinc-200/60 transition-all duration-300">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between relative">
          
          <div className="flex items-center gap-3">
            <Logo />
            <div className="h-6 w-px bg-zinc-200 hidden md:block"></div>
            
            <div onClick={onProfileClick} className="hidden md:flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 p-[2px] shadow-lg transition-all duration-300">
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
              <button 
                  onClick={startLocationTracking}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${userLocation ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-zinc-100 text-zinc-600 border-zinc-200'}`}
              >
                {userLocation ? <Navigation size={12} className="animate-pulse" /> : <Crosshair size={12} />}
                <span>{selectedCity}</span>
              </button>
              <button onClick={onLogout} className="text-xs font-bold px-4 py-2 rounded-full bg-zinc-900 text-white hover:bg-zinc-800 transition-colors">Log out</button>
            </div>

            <div className="md:hidden flex items-center gap-3">
              <div onClick={onProfileClick} className="relative cursor-pointer active:scale-95 transition-transform">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 p-[1.5px] shadow-sm">
                  <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || "Guest"}`} alt="User" className="w-full h-full object-cover" />
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
                className={`p-2 rounded-lg transition-all duration-200 ${isMobileMenuOpen ? 'bg-zinc-100 text-zinc-900' : 'bg-transparent text-zinc-700 hover:bg-zinc-50'}`}
              >
                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          <div className={`
              md:hidden
              absolute top-[calc(100%+8px)] right-4 w-60
              bg-white/95 backdrop-blur-2xl border border-zinc-100
              rounded-2xl shadow-2xl shadow-zinc-900/10 p-2 flex flex-col gap-2
              origin-top-right transition-all duration-300 cubic-bezier(0.16, 1, 0.3, 1)
              ${isMobileMenuOpen ? 'opacity-100 scale-100 translate-y-0 visible' : 'opacity-0 scale-90 -translate-y-4 invisible pointer-events-none'}
          `}>
              <button 
                onClick={() => { startLocationTracking(); setIsMobileMenuOpen(false); }}
                className={`w-full flex items-center justify-start gap-3 px-4 py-3 rounded-xl font-bold text-sm border transition-all ${userLocation ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-zinc-50 text-zinc-600 border-zinc-100 hover:bg-zinc-100'}`}
              >
                {userLocation ? <Navigation size={16} className="animate-pulse" /> : <Crosshair size={16} />}
                <span className="truncate">{selectedCity}</span>
              </button>

              <button 
                onClick={onLogout} 
                className="w-full flex items-center justify-start gap-3 px-4 py-3 rounded-xl bg-zinc-900 text-white font-bold text-sm shadow-md shadow-zinc-900/10 active:scale-[0.98] transition-transform"
              >
                Log out
              </button>
          </div>

        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 pt-24 sm:pt-24 pb-16 relative z-10">
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

          {/* 🔥 PASSING NEW PROPS TO MAP */}
          <MapSalon 
            salons={sortedSalons} 
            userLocation={userLocation}
            heading={heading} 
            onSelect={(s) => handleOpenBooking(s)} 
            routeDestination={routeDestination} 
            onRouteClick={handleRoute}
          />

          <div className="flex flex-col md:flex-row gap-4 mt-6">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
              <input type="text" placeholder="Search salons..." className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white border border-zinc-200 shadow-sm focus:ring-2 focus:ring-zinc-900" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider whitespace-nowrap">Sort:</span>
              {["distance", "waiting", "rating"].map((criteria) => (
                <button key={criteria} onClick={() => setSortBy(criteria)} className={`text-[10px] px-3 py-1.5 rounded-full border whitespace-nowrap ${sortBy === criteria ? "bg-zinc-900 text-white border-zinc-900" : "bg-white border-zinc-200 text-zinc-500"}`}>{criteria.charAt(0).toUpperCase() + criteria.slice(1)}</button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
            <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-zinc-900"></div></div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {sortedSalons.map((salon) => (
                <div key={salon._id} className="group relative rounded-2xl bg-white border border-zinc-200 shadow-sm overflow-hidden flex flex-col">
                <div className="p-4 sm:p-5 flex flex-col gap-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center flex-wrap gap-2 mb-1">
                          <h2 className="text-base sm:text-lg font-bold text-zinc-900">{salon.salonName}</h2>
                          {salon.isOnline ? 
                            <span className="px-2 py-0.5 rounded-md bg-emerald-500 text-[9px] font-bold text-white">OPEN</span> : 
                            <span className="px-2 py-0.5 rounded-md bg-red-500 text-[9px] font-bold text-white">CLOSED</span>
                          }
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-zinc-500">
                            {salon.distance ? (
                                <span className="flex items-center gap-1 text-emerald-600 font-bold"><Navigation size={10} fill="currentColor" /> {salon.distance} away</span>
                            ) : (
                                <span className="flex items-center gap-1"><MapPin size={10} /> {salon.address || "Unknown"}</span>
                            )}
                            <span className="w-1 h-1 bg-zinc-300 rounded-full"></span>
                            <span className="font-semibold">{salon.salonType || "Unisex"}</span>
                        </div>
                      </div>

                      {/* 🔥 NEW: ROUTE BUTTON & RATING */}
                      <div className="flex flex-col items-end gap-2">
                        <button 
                            onClick={() => handleRoute(salon)}
                            className="p-2 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors border border-blue-100 shadow-sm"
                            title="Get Directions"
                        >
                             <Navigation size={18} fill="currentColor" className="transform rotate-45" />
                        </button>

                        <div className="flex items-center justify-end gap-1 text-sm font-bold text-zinc-900">
                          <Star className="text-yellow-400 fill-yellow-400" size={14} />
                          {salon.rating ? salon.rating.toFixed(1) : "New"}
                        </div>
                        <p className="text-[10px] text-zinc-400 text-right">{salon.reviewsCount || 0} reviews</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 py-3 border-y border-zinc-50">
                      <div className="flex flex-col items-center sm:items-start">
                        <span className="text-[9px] uppercase text-zinc-400 font-bold tracking-tight">Waiting</span>
                        <div className="flex items-baseline gap-0.5">
                          <span className="text-xl sm:text-2xl font-black text-zinc-900">{salon.waiting || 0}</span>
                          <span className="text-[9px] text-zinc-500">pax</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-center sm:items-start border-x border-zinc-100 px-2">
                        <span className="text-[9px] uppercase text-zinc-400 font-bold tracking-tight">Est. Time</span>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Clock size={12} className="text-zinc-400" />
                          <span className="text-xs sm:text-sm font-bold text-zinc-900">
                            {salon.estTime || 0} min
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-center sm:items-end">
                        <span className="text-[9px] uppercase text-zinc-400 font-bold tracking-tight">Team</span>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Users size={12} className="text-zinc-400" />
                          <span className="text-xs sm:text-sm font-bold text-zinc-900">{salon.staff?.length || 1} staff</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3 pt-1">
                      <div className="flex items-center gap-1.5 text-[10px] text-emerald-700 font-bold bg-emerald-50/50 px-2 py-1 rounded-lg">
                        <Sparkles size={12} />
                        <span className="truncate max-w-[100px]">{salon.tag || "Top Rated"}</span>
                      </div>
                      <button 
                        onClick={() => handleOpenBooking(salon)} 
                        disabled={!salon.isOnline} 
                        className={`px-5 py-2.5 rounded-xl text-white text-[11px] font-bold transition-all flex items-center gap-2 shadow-sm ${salon.isOnline ? 'bg-zinc-900 active:scale-95' : 'bg-zinc-300'}`}
                      >
                        {salon.isOnline ? "Join Queue" : "Offline"} 
                        <Ticket size={14} />
                      </button>
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
        <AIConcierge />
      </main>
    </div>
  );
};

export default UserDashboard;