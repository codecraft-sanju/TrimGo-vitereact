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
  Navigation, // Icon for location
  Crosshair // Icon for Locate Me
} from "lucide-react";
import { io } from "socket.io-client"; 
import api from "../utils/api"; 

// Imports
import MapSalon from "./MapSalon";
import { BackgroundAurora, NoiseOverlay, Logo } from "./SharedUI";
import AIConcierge from "./AIConcierge"; 

/* ---------------------------------
   HELPER: HAVERSINE DISTANCE FORMULA (Updated for Meters/KM)
---------------------------------- */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;

  const R = 6371; // Radius of earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; 
  
  if (d < 1) {
    return `${Math.round(d * 1000)} m`; // Returns meters if less than 1km
  }
  return `${d.toFixed(1)} km`; // Returns km otherwise
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
                <span className="text-xs font-bold bg-zinc-100 px-2 py-1 rounded text-zinc-600">{selectedServices.length} items selected</span>
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
  
  // User Location
  const [userLocation, setUserLocation] = useState(null); 
  const watchId = useRef(null); 

  // --- 1. FUNCTION TO GET LIVE LOCATION (Optimized for Laptop/Timeout) ---
  const startLocationTracking = () => {
    if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser.");
        setSelectedCity("Location N/A");
        return;
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
            setSelectedCity("Live Tracking");
        },
        (error) => {
            console.error("❌ Location Error:", error);
            // Handle Timeout specifically for Laptops
            if(error.code === 3) {
                setSelectedCity("GPS Signal Weak");
            } else if(error.code === 1) {
                alert("Please allow location access for real-time tracking.");
                setSelectedCity("Location Offline"); 
            } else {
                setSelectedCity("Location Offline");
            }
        },
        { 
          enableHighAccuracy: true, 
          timeout: 20000, // Increased to 20 seconds to prevent timeout on laptops
          maximumAge: 5000 // Allow using a location cached in the last 5 seconds
        } 
    );
  };

  // --- 2. INITIAL FETCH & SOCKET ---
  useEffect(() => {
    startLocationTracking();

    const socket = io("http://localhost:5000"); 
    if(user?._id) socket.emit("join_room", `user_${user._id}`); 

    socket.on("salon_updated", (updatedData) => {
        setSalons(prevSalons => prevSalons.map(s => 
            s._id === updatedData.id ? { ...s, ...updatedData } : s
        ));
    });

    fetchSalons();

    return () => {
      socket.disconnect();
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
      }
    };
  }, [user]);

  // --- 3. FETCH SALONS ---
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

  // --- 4. CALCULATE DISTANCE & SORT ---
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


  // --- HANDLERS ---
  const handleOpenBooking = (salon) => {
    if(!salon.isOnline) {
        alert("This salon is currently offline and not accepting requests.");
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

      <header className="fixed top-0 left-0 w-full z-40 bg-white/80 backdrop-blur-xl border-b border-zinc-200/60">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Logo />
            <div className="h-6 w-px bg-zinc-200 hidden sm:block"></div>
            <div onClick={onProfileClick} className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 p-[2px] shadow-lg group-hover:shadow-indigo-500/20 transition-all duration-300">
                  <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || "Guest"}`} alt={user?.name || "User"} className="w-full h-full object-cover" />
                  </div>
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="text-sm font-bold text-zinc-900 group-hover:text-indigo-600 transition-colors">{user?.name || "Guest"}</span>
                <span className="text-[10px] font-medium text-zinc-500">Free Plan</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            
            <button 
                onClick={startLocationTracking}
                className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${userLocation ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-zinc-100 text-zinc-600 border-zinc-200 hover:bg-zinc-200'}`}
                title="Click to re-sync tracking"
            >
              {userLocation ? <Navigation size={14} className="animate-pulse" /> : <Crosshair size={14} />}
              <span>{selectedCity}</span>
            </button>

            <button onClick={onLogout} className="text-xs sm:text-sm font-bold px-4 py-2 rounded-full bg-zinc-900 text-white hover:scale-105 transition-transform">Log out</button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 pt-24 pb-16 relative z-10">
        <div className="mb-10">
          <div className="flex flex-col md:flex-row justify-between items-end mb-6">
            <div>
              <p className="text-xs font-semibold text-zinc-500 mb-1 uppercase tracking-[0.16em]">Live Availability</p>
              <h1 className="text-3xl md:text-4xl font-black text-zinc-900 tracking-tight">Find a salon near you.</h1>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
              {["All", "Unisex", "Men Only", "Women Only"].map((type) => (
                <button key={type} onClick={() => setFilterType(type)} className={`px-4 py-3 rounded-2xl font-bold whitespace-nowrap border transition-all text-xs md:text-sm ${filterType === type ? "bg-zinc-900 text-white border-zinc-900" : "bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50"}`}>{type}</button>
              ))}
            </div>
          </div>

          <MapSalon salons={sortedSalons} 
          userLocation={userLocation}
          onSelect={(s) => handleOpenBooking(s)} />

          <div className="flex flex-col md:flex-row gap-4 mt-6">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-x-0 -translate-y-1/2 text-zinc-400" size={20} />
              <input type="text" placeholder="Search by salon name or area..." className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border border-zinc-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-900" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider whitespace-nowrap">Sort by:</span>
              {["distance", "waiting", "rating"].map((criteria) => (
                <button key={criteria} onClick={() => setSortBy(criteria)} className={`text-xs px-3 py-1 rounded-full border ${sortBy === criteria ? "bg-zinc-900 text-white border-zinc-900" : "bg-transparent border-zinc-300 text-zinc-500"}`}>{criteria.charAt(0).toUpperCase() + criteria.slice(1)}</button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
            <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-zinc-900"></div></div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sortedSalons.map((salon) => (
                <div key={salon._id} className="group relative rounded-2xl bg-white/80 backdrop-blur-sm border border-zinc-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/60 via-transparent to-sky-50/60 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative p-5 flex flex-col gap-4">
                    <div className="flex items-start justify-between gap-3">
                    <div>
                        <h2 className="text-base md:text-lg font-bold text-zinc-900 flex items-center gap-2">
                        {salon.salonName || "Unknown Salon"}
                        {salon.isOnline ? <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-[10px] font-semibold text-white uppercase tracking-wide">OPEN</span> : <span className="px-2 py-0.5 rounded-full bg-red-500 text-[10px] font-semibold text-white uppercase tracking-wide">CLOSED</span>}
                        </h2>
                        
                        <div className="flex items-center gap-2 text-xs text-zinc-500 mt-1">
                            {salon.distance ? (
                                <span className="flex items-center gap-1 text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                                    <Navigation size={12} fill="currentColor" /> {salon.distance} away
                                </span>
                            ) : (
                                <span className="flex items-center gap-1">
                                    <MapPin size={12} /> {salon.address || "No address"}
                                </span>
                            )}
                        </div>

                        <div className="mt-2 text-[10px] text-zinc-500 font-bold uppercase tracking-wider bg-zinc-100 inline-block px-2 py-0.5 rounded-md">{salon.salonType || "Unisex"}</div>
                    </div>
                    <div className="flex flex-col items-end">
                        <div className="flex items-center gap-1 text-sm font-semibold text-zinc-900"><Star className="text-yellow-400 fill-yellow-400" size={14} />{salon.rating ? salon.rating.toFixed(1) : "New"}</div>
                        <p className="text-[11px] text-zinc-500">{salon.reviewsCount || 0}+ ratings</p>
                    </div>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col"><span className="text-[11px] uppercase text-zinc-500 font-semibold tracking-[0.16em]">Current waiting</span><div className="flex items-baseline gap-1"><span className="text-3xl font-black text-zinc-900">{salon.waiting || 0}</span><span className="text-xs text-zinc-500 font-medium">people</span></div></div>
                        <div className="hidden sm:flex flex-col border-l border-dashed border-zinc-200 pl-4"><span className="text-[11px] uppercase text-zinc-500 font-semibold tracking-[0.16em]">Est. Wait</span><span className="text-sm font-semibold text-zinc-900">{(salon.waiting || 0) * 15} mins</span></div>
                    </div>
                    <div className="hidden md:flex flex-col items-end text-[11px] text-zinc-500">
                        <div className="flex items-center gap-1"><Users size={14} /><span>Staff: {salon.staff?.length || 1}</span></div>
                        <div className="flex items-center gap-1 mt-1"><Clock size={14} /><span>Live Updates</span></div>
                    </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 border-t border-zinc-100">
                    <div className="flex items-center gap-2 text-xs text-emerald-700 font-semibold"><Sparkles size={14} /><span>{salon.tag || "Best in Town"}</span></div>
                    <div className="flex gap-2">
                        <button onClick={() => handleOpenBooking(salon)} disabled={!salon.isOnline} className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-white text-xs font-bold transition-transform flex items-center justify-center gap-1.5 ${salon.isOnline ? 'bg-zinc-900 hover:scale-105' : 'bg-zinc-300 cursor-not-allowed'}`}>
                        {salon.isOnline ? "Join Queue" : "Offline"} <Ticket size={14} />
                        </button>
                    </div>
                    </div>
                </div>
                </div>
            ))}
            </div>
        )}

        {sortedSalons.length === 0 && !loading && (
          <div className="text-center py-20 opacity-50">
            <Filter size={48} className="mx-auto mb-4" />
            <p className="text-xl font-bold">No salons found</p>
            <p>Try changing your search or filters.</p>
          </div>
        )}

        <p className="mt-8 text-[11px] text-zinc-400 text-center">Connected to Live TrimGo Network</p>
        <AIConcierge />
      </main>
    </div>
  );
};

export default UserDashboard;