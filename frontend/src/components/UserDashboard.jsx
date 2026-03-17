import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  MapPin, Clock, Users, Star, Ticket, X, Filter, Search, Check,
  Sparkles, Navigation, Crosshair, Menu, Gift, BadgeCheck,
  Loader2, AlertCircle, Image as ImageIcon, ChevronLeft,
  ChevronRight, Scissors, CheckCircle
} from "lucide-react";
import { io } from "socket.io-client"; 
import Lenis from 'lenis'; 
import api from "../utils/api"; 
import { motion, AnimatePresence } from "framer-motion"; 
import toast from 'react-hot-toast'; // Added for sleek notifications

import SalonReviewsModal from "./SalonReviewsModal";
import MapSalon from "./MapSalon";
import { BackgroundAurora, NoiseOverlay, Logo } from "./SharedUI";
import AIConcierge from "./AIConcierge"; 

const PremiumImageLoader = ({ src, alt, className }) => {
    const [isLoaded, setIsLoaded] = useState(false);
  
    return (
      <div className={`relative w-full h-full overflow-hidden bg-zinc-100 ${className}`}>
        {!isLoaded && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-zinc-50 animate-pulse">
            <div className="w-full h-full bg-zinc-200/50 flex items-center justify-center">
                <Loader2 className="text-zinc-400 animate-spin" size={24} />
            </div>
          </div>
        )}
        <img 
          src={src} 
          alt={alt} 
          onLoad={() => setIsLoaded(true)}
          className={`
            w-full h-full object-cover transition-all duration-700 ease-out
            ${isLoaded ? 'opacity-100 scale-100 blur-0' : 'opacity-0 scale-110 blur-sm'}
          `}
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

    const nextImage = (e) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };

    const prevImage = (e) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl animate-in fade-in duration-300" onClick={onClose}>
            <button onClick={onClose} className="absolute top-6 right-6 text-white/50 hover:text-white z-50 p-2 transition-colors">
                <X size={32} />
            </button>
            
            <div className="relative w-full max-w-5xl h-[85vh] flex flex-col items-center justify-center" onClick={(e) => e.stopPropagation()}>
                <div className="relative w-full h-full flex items-center justify-center px-4 md:px-10">
                    <img 
                        src={images[currentIndex]} 
                        alt={`View ${currentIndex + 1}`} 
                        className="max-h-full max-w-full object-contain rounded-sm shadow-2xl animate-in zoom-in-95 duration-500"
                    />
                    {images.length > 1 && (
                        <>
                            <button onClick={prevImage} className="absolute left-4 md:left-0 p-4 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-all">
                                <ChevronLeft size={40} />
                            </button>
                            <button onClick={nextImage} className="absolute right-4 md:right-0 p-4 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-all">
                                <ChevronRight size={40} />
                            </button>
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
   HELPER: HAVERSINE DISTANCE FORMULA
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

/* ---------------------------------
   PREMIUM SERVICE DRAWER
---------------------------------- */
const ServiceSelectionModal = ({ salon, onClose, onConfirm, isJoining }) => { 
  const [selectedServices, setSelectedServices] = useState([]);
  const [reachingTime, setReachingTime] = useState(15);
  
  const servicesList = salon.services || [];

  const toggleService = (serviceId) => {
    if (isJoining) return; 
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
    if (selectedServices.length === 0 || isJoining) return;
    const finalServices = servicesList.filter((s) =>
      selectedServices.includes(s._id)
    );
    onConfirm(salon, finalServices, totalDetails, reachingTime);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={!isJoining ? onClose : undefined}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      <motion.div 
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="relative bg-white w-full max-w-lg sm:rounded-3xl rounded-t-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] z-10"
      >
        <div className="w-full flex justify-center pt-4 pb-1 sm:hidden">
          <div className="w-12 h-1.5 bg-zinc-200 rounded-full"></div>
        </div>

        <div className="px-8 py-5 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
          <div>
            <h2 className="text-xl font-black text-zinc-900 tracking-tight">{salon.salonName}</h2>
            <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mt-0.5">Customize your service</p>
          </div>
          <button 
            onClick={onClose} 
            disabled={isJoining} 
            className="p-2 bg-white rounded-full shadow-sm border border-zinc-200 hover:bg-zinc-100 transition disabled:opacity-50"
          >
            <X size={20} className="text-zinc-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          {servicesList.length === 0 ? (
             <div className="text-center text-zinc-400 py-12 text-sm font-medium">No services listed yet.</div>
          ) : (
            servicesList.map((service) => {
                const isSelected = selectedServices.includes(service._id);
                return (
                <div
                    key={service._id}
                    onClick={() => toggleService(service._id)}
                    className={`flex items-center justify-between p-5 rounded-[1.5rem] border-2 transition-all duration-300 ${
                      isSelected 
                        ? "border-zinc-900 bg-zinc-900 text-white shadow-xl shadow-zinc-900/10 scale-[1.02]" 
                        : "border-zinc-100 hover:border-zinc-200 bg-white text-zinc-900"
                    } ${isJoining ? "opacity-50 cursor-not-allowed" : "cursor-pointer active:scale-95"}`}
                >
                    <div className="flex items-start gap-4">
                      <div className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? "bg-emerald-500 border-emerald-500" : "border-zinc-200 bg-white"}`}>
                          {isSelected && <Check size={14} className="text-white font-bold" strokeWidth={3} />}
                      </div>
                      <div>
                          <h4 className="text-base font-bold leading-tight">{service.name}</h4>
                          <p className={`text-xs font-medium mt-1 ${isSelected ? "text-zinc-400" : "text-zinc-500"}`}>{service.time} mins • {service.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-lg font-black ${isSelected ? "text-white" : "text-zinc-900"}`}>₹{service.price}</span>
                    </div>
                </div>
                );
            })
          )}
        </div>

        <div className="p-6 bg-white border-t border-zinc-100 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)]">
          <div className="mb-6">
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] block mb-3 ml-1">Arrival Estimate</label>
            <div className="flex gap-2">
              {[5, 15, 30, 45].map(time => (
                <button
                  key={time}
                  onClick={() => setReachingTime(time)}
                  className={`flex-1 py-2.5 rounded-2xl text-xs font-bold border-2 transition-all ${
                    reachingTime === time 
                      ? 'bg-zinc-100 border-zinc-900 text-zinc-900 shadow-inner' 
                      : 'bg-white border-zinc-100 text-zinc-500 hover:border-zinc-200'
                  }`}
                >
                  {time}m
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-end mb-5 px-1">
            <div>
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-1">Grand Total</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-zinc-900 tracking-tighter">₹{totalDetails.price}</span>
                <span className="text-sm text-zinc-500 font-bold">/ {totalDetails.time} mins</span>
              </div>
            </div>
            <div className="bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                <span className="text-xs font-black text-emerald-700">{selectedServices.length} Selected</span>
            </div>
          </div>
          
          <button 
            onClick={handleConfirm} 
            disabled={selectedServices.length === 0 || isJoining} 
            className={`
                w-full py-4.5 rounded-[1.4rem] font-black text-base flex items-center justify-center gap-3 transition-all duration-300 active:scale-[0.98] py-4
                ${selectedServices.length > 0 && !isJoining 
                    ? "bg-zinc-900 text-white shadow-2xl shadow-zinc-900/30 hover:bg-black" 
                    : "bg-zinc-100 text-zinc-400 cursor-not-allowed"}
            `}
          >
            {isJoining ? (
                <>
                    <Loader2 size={20} className="animate-spin" />
                    <span className="uppercase tracking-widest">Joining Queue...</span>
                </>
            ) : (
                <>
                    <span className="uppercase tracking-widest">Confirm & Join Now</span>
                    <Ticket size={20} fill="currentColor" />
                </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

/* ---------------------------------
   MAIN COMPONENT 
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

  const [timeLeftSeconds, setTimeLeftSeconds] = useState(0);
  const [timeLeftStr, setTimeLeftStr] = useState("");
  const [showAcceptedAnim, setShowAcceptedAnim] = useState(false);

  // --- NEW REVIEW STATES ---
  const [reviewRating, setReviewRating] = useState(0);
  const [hoverStar, setHoverStar] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [viewingReviewsSalon, setViewingReviewsSalon] = useState(null);

  // --- LENIS SMOOTH SCROLL ---
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), 
      smoothWheel: true,
      wheelMultiplier: 1,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  // --- LOCATION TRACKING ---
  const startLocationTracking = () => {
    if (!navigator.geolocation) {
        toast.error("Geolocation is not supported by your browser.");
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
        { enableHighAccuracy: true, timeout: 20000, maximumAge: 5000 } 
    );
  };
 
  const handleRoute = (salon) => {
    if (!userLocation) {
        toast.error("Please enable location first to get directions.");
        startLocationTracking();
        return;
    }

    if(!salon.latitude || !salon.longitude) {
        toast.error("Salon location not found on map.");
        return;
    }

    setRouteDestination({
        lat: Number(salon.latitude),
        lng: Number(salon.longitude)
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // --- SOCKETS & INITIAL DATA ---
  useEffect(() => {
    startLocationTracking();
    fetchActiveTicket(); 

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
                    return { ...salon, waiting: waitingCount, estTime: estTime }; 
                }
                return salon;
            })
        );
    });

    socket.on("my_queue_update", (data) => {
        setActiveTicket(prev => prev ? { 
            ...prev, 
            myWaitTime: data.myWaitTime, 
            myWaitTimeInSeconds: data.myWaitTimeInSeconds, 
            myPeopleAhead: data.myPeopleAhead,
            expectedStartTime: data.expectedStartTime 
        } : null);
    });

    socket.on("request_accepted", (ticket) => {
        setActiveTicket(ticket);
        setShowAcceptedAnim(true);
        setTimeout(() => setShowAcceptedAnim(false), 3500); 
    });

    socket.on("request_rejected", () => {
        setActiveTicket(null);
        toast.error("Your request was rejected by the salon.");
    });

    socket.on("status_change", (data) => {
        setActiveTicket(prev => prev ? {...prev, status: data.status, chairId: data.chairId} : null);
    });

    socket.on("ticket_updated", (updatedTicket) => {
        setActiveTicket(updatedTicket); 
    });

    // --- CHANGED START: MORPH INTO REVIEW ---
    socket.on("service_completed", (completedTicket) => {
        // Ticket ka status 'completed' set karte hain taki review UI render ho
        setActiveTicket(completedTicket);
        // Clean review states
        setReviewRating(0);
        setReviewText("");
    });
    // --- CHANGED END ---

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

  const fetchActiveTicket = async () => {
      try {
          const { data } = await api.get("/queue/my-ticket");
          if(data.success && data.ticket) {
              setActiveTicket(data.ticket);
          } else {
              setActiveTicket(null);
          }
      } catch (error) {
          console.error("Error fetching ticket", error);
      }
  };

  useEffect(() => {
    const timer = setTimeout(() => fetchSalons(), 500); 
    return () => clearTimeout(timer);
  }, [searchTerm, filterType]);

  // --- TIMER LOGIC ---
  useEffect(() => {
    if (activeTicket && activeTicket.status !== 'completed') {
      const seconds = activeTicket.myWaitTimeInSeconds ?? activeTicket.waitTimeInSeconds ?? (activeTicket.myWaitTime * 60) ?? ((activeTicket.totalTime || 0) * 60);
      setTimeLeftSeconds(seconds > 0 ? Math.floor(seconds) : 0);
    }
  }, [activeTicket?.myWaitTimeInSeconds, activeTicket?.waitTimeInSeconds, activeTicket?.myWaitTime, activeTicket?._id, activeTicket?.status]);

  useEffect(() => {
    if (!activeTicket || activeTicket.status === 'serving' || activeTicket.status === 'completed') return;
    const intervalId = setInterval(() => {
      setTimeLeftSeconds(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(intervalId); 
  }, [activeTicket]);

  useEffect(() => {
    if (timeLeftSeconds <= 0) {
      setTimeLeftStr("00:00");
    } else {
      const m = Math.floor(timeLeftSeconds / 60);
      const s = Math.floor(timeLeftSeconds % 60);
      setTimeLeftStr(`${m}:${s < 10 ? '0' : ''}${s}`);
    }
  }, [timeLeftSeconds]);

  const salonsWithDistance = useMemo(() => {
      return salons.map(salon => {
          let distStr = null;
          if (typeof calculateDistance === 'function' && userLocation && salon.latitude && salon.longitude) {
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
    if(activeTicket) {
        toast.error("You already have an active request. Cancel or review it first.");
        return;
    }
    if(!salon.isOnline) {
        toast.error("This salon is currently offline.");
        return;
    }
    setActiveBookingSalon(salon);
  };

  const handleCloseBooking = () => {
      if(!isJoiningQueue) setActiveBookingSalon(null); 
  };

  const handleConfirmBooking = async (salon, services, totals, reachingTime) => {
    setIsJoiningQueue(true); 
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
            totalTime: totals.time,
            reachingTime: reachingTime 
        };

        const { data } = await api.post("/queue/join", payload);

        if(data.success) {
            setActiveTicket(data.ticket);
            setActiveBookingSalon(null);
            toast.success(`Request sent to ${salon.salonName}`);
        }
    } catch (error) {
        toast.error(error.response?.data?.message || "Failed to join queue");
    } finally {
        setIsJoiningQueue(false); 
    }
  };

  const handleCancelTicket = async () => {
      if(!activeTicket) return;
      if(!window.confirm("Are you sure you want to cancel your spot?")) return;

      setCanceling(true);
      try {
          const { data } = await api.post("/queue/cancel", { ticketId: activeTicket._id });
          if(data.success) {
              setActiveTicket(null); 
              toast.success("Ticket cancelled successfully.");
          }
      } catch (error) {
          console.error(error);
          toast.error("Failed to cancel ticket");
      } finally {
          setCanceling(false);
      }
  };

  const handleOpenGallery = (salon) => {
      if(salon.gallery && salon.gallery.length > 0) {
          setGalleryModal({ isOpen: true, images: salon.gallery, name: salon.salonName });
      }
  };

  // --- NEW: SUBMIT REVIEW FUNCTION ---
  const submitReview = async () => {
    setIsSubmittingReview(true);
    try {
      const { data } = await api.post("/reviews/add", {
        salonId: activeTicket.salonId._id || activeTicket.salonId,
        ticketId: activeTicket._id,
        rating: reviewRating,
        reviewText: reviewText
      });
      if(data.success) {
        toast.success("Review submitted! Thank you.");
        setActiveTicket(null); // Dismiss the card
      }
    } catch(err) {
      toast.error(err.response?.data?.message || "Failed to submit review.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-zinc-50 font-sans overflow-x-hidden pb-32">
      <BackgroundAurora />
      <NoiseOverlay />

      <AnimatePresence>
        {showAcceptedAnim && (
            <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -50 }}
                className="fixed inset-0 z-[150] flex items-center justify-center pointer-events-none px-4"
            >
                <div className="bg-emerald-500 text-white px-8 py-6 rounded-3xl shadow-2xl flex flex-col items-center gap-3 text-center border border-emerald-400">
                    <CheckCircle size={56} className="animate-bounce" />
                    <h2 className="text-2xl font-black">Request Accepted!</h2>
                    <p className="text-sm font-medium text-emerald-50">Salon has confirmed your spot.</p>
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeBookingSalon && (
          <ServiceSelectionModal 
              salon={activeBookingSalon} 
              onClose={handleCloseBooking} 
              onConfirm={handleConfirmBooking} 
              isJoining={isJoiningQueue} 
          />
        )}
      </AnimatePresence>

      <SalonGalleryModal 
        isOpen={galleryModal.isOpen} 
        onClose={() => setGalleryModal({isOpen: false, images: [], name: ""})} 
        images={galleryModal.images} 
        salonName={galleryModal.name} 
      />
      
      <AnimatePresence>
        {viewingReviewsSalon && (
          <SalonReviewsModal 
            salon={viewingReviewsSalon} 
            onClose={() => setViewingReviewsSalon(null)} 
          />
        )}
      </AnimatePresence>

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
                onClick={onReferralClick}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 text-xs font-bold hover:bg-indigo-100 transition-colors"
              >
                <Gift size={14} />
                <span>Earn Rewards</span>
              </button>

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
              <button 
                onClick={onReferralClick}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 active:scale-95"
              >
                 <Gift size={16} />
              </button>

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
                onClick={() => { onReferralClick(); setIsMobileMenuOpen(false); }}
                className="w-full flex items-center justify-start gap-3 px-4 py-3 rounded-xl font-bold text-sm border border-transparent hover:bg-zinc-50 text-zinc-700"
              >
                <Gift size={16} className="text-indigo-500"/>
                <span>Partner Program</span>
              </button>

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

          <MapSalon 
            salons={sortedSalons} 
            userLocation={userLocation}
            heading={heading} 
            onSelect={(s) => handleOpenBooking(s)} 
            routeDestination={routeDestination} 
            onRouteClick={handleRoute}
            activeTicket={activeTicket}
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
            {sortedSalons.map((salon) => {
                const isActiveSalon = activeTicket && (activeTicket.salonId?._id === salon._id || activeTicket.salonId === salon._id);
                
                const displayWaiting = isActiveSalon && activeTicket.myPeopleAhead !== undefined 
                    ? activeTicket.myPeopleAhead 
                    : (salon.waiting || 0);
                    
                const displayEstTime = isActiveSalon && activeTicket.myWaitTime !== undefined 
                    ? activeTicket.myWaitTime 
                    : (salon.estTime || 0);

                return (
                <div key={salon._id} className="group relative rounded-2xl bg-white border border-zinc-200 shadow-sm overflow-hidden flex flex-col hover:shadow-lg transition-shadow duration-300">
                
                <div className="relative h-48 w-full bg-zinc-100 overflow-hidden">
                    {salon.gallery && salon.gallery.length > 0 ? (
                        <PremiumImageLoader 
                            src={salon.gallery[0]} 
                            alt={salon.salonName}
                        />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-zinc-300 bg-zinc-50">
                            <ImageIcon size={40} />
                        </div>
                    )}
                    
                    <div className="absolute top-3 right-3 flex flex-col items-end gap-1 z-20">
                          {salon.isOnline ? 
                            <span className="px-2 py-1 rounded-md bg-emerald-500 text-[10px] font-bold text-white shadow-sm">OPEN</span> : 
                            <span className="px-2 py-1 rounded-md bg-red-500 text-[10px] font-bold text-white shadow-sm">CLOSED</span>
                          }
                    </div>

                    {salon.gallery && salon.gallery.length > 1 && (
                        <button 
                            onClick={(e) => { e.stopPropagation(); handleOpenGallery(salon); }}
                            className="absolute bottom-3 right-3 px-2.5 py-1.5 bg-black/50 backdrop-blur-md text-white text-[10px] font-bold rounded-lg flex items-center gap-1.5 hover:bg-black/70 transition z-20"
                        >
                            <ImageIcon size={12} />
                            <span>+{salon.gallery.length - 1} photos</span>
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
                        <p className="text-[11px] text-zinc-500 line-clamp-1 mb-1.5 flex items-center gap-1">
                            <MapPin size={12} className="shrink-0" />
                            {salon.address || "Address not available"}
                        </p>
                        
                        <div className="flex items-center gap-2 text-[11px] text-zinc-500">
                            {salon.distance ? (
                                <span className="flex items-center gap-1 text-emerald-600 font-bold"><Navigation size={10} fill="currentColor" /> {salon.distance} away</span>
                            ) : null}
                            <span className="w-1 h-1 bg-zinc-300 rounded-full"></span>
                            <span className="font-semibold">{salon.salonType || "Unisex"}</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end">
                        <div 
                          onClick={(e) => {
                            e.stopPropagation();
                            if(salon.reviewsCount > 0) {
                              setViewingReviewsSalon(salon);
                            } else {
                              toast("No reviews yet!", { icon: "⭐" });
                            }
                          }}
                          className="flex items-center justify-end gap-1 text-sm font-bold text-zinc-900 bg-yellow-50 px-2 py-1 rounded-lg border border-yellow-100 hover:bg-yellow-100 cursor-pointer active:scale-95 transition-all"
                        >
                          <Star className="text-yellow-500 fill-yellow-500" size={14} />
                          {salon.rating ? salon.rating.toFixed(1) : "New"}
                        </div>
                        <p 
                          onClick={(e) => {
                            e.stopPropagation();
                            if(salon.reviewsCount > 0) setViewingReviewsSalon(salon);
                          }}
                          className="text-[10px] text-zinc-400 text-right mt-1.5 underline decoration-zinc-200 underline-offset-2 cursor-pointer hover:text-zinc-600"
                        >
                          {salon.reviewsCount || 0} reviews
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 py-3 border-y border-zinc-50">
                      <div className="flex flex-col items-center sm:items-start">
                        <span className="text-[9px] uppercase text-zinc-400 font-bold tracking-tight">Waiting</span>
                        <div className="flex items-baseline gap-0.5">
                          <span className="text-xl sm:text-2xl font-black text-zinc-900">{displayWaiting}</span>
                          <span className="text-[9px] text-zinc-500">pax</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-center sm:items-start border-x border-zinc-100 px-2">
                        <span className="text-[9px] uppercase text-zinc-400 font-bold tracking-tight">Est. Time*</span>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Clock size={12} className="text-zinc-400" />
                          <span className="text-xs sm:text-sm font-bold text-zinc-900">
                            {displayEstTime} min
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

                    <div className="flex items-center justify-between gap-3 pt-1 mt-auto">
                      <div className="flex items-center gap-1.5 text-[10px] text-emerald-700 font-bold bg-emerald-50/50 px-2 py-1 rounded-lg">
                        <Sparkles size={12} />
                        <span className="truncate max-w-[100px]">{salon.tag || "Top Rated"}</span>
                      </div>
                      
                      <div className="flex gap-2">
                        <button 
                            onClick={() => handleRoute(salon)}
                            className="p-2.5 rounded-xl bg-zinc-50 text-zinc-600 hover:bg-zinc-100 transition-colors border border-zinc-100"
                            title="Get Directions"
                        >
                             <Navigation size={18} fill="currentColor" className="transform rotate-45" />
                        </button>
                        <button 
                            onClick={() => handleOpenBooking(salon)} 
                            disabled={!salon.isOnline || (activeTicket && activeTicket.salonId?._id !== salon._id)} 
                            className={`px-5 py-2.5 rounded-xl text-white text-[11px] font-bold transition-all flex items-center gap-2 shadow-sm ${!salon.isOnline ? 'bg-zinc-300 cursor-not-allowed' : activeTicket ? 'bg-zinc-400 cursor-not-allowed' : 'bg-zinc-900 active:scale-95'}`}
                        >
                            {salon.isOnline ? (activeTicket ? "Busy" : "Join Queue") : "Offline"} 
                            <Ticket size={14} />
                        </button>
                      </div>
                    </div>
                </div>
                </div>
                );
            })}
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
        <AIConcierge 
            salons={sortedSalons} 
            onSalonSelect={handleOpenBooking} 
        />
      </main>

      {/* --- ACTIVE TICKET / REVIEW FLOATING CARD --- */}
      {activeTicket && (
        <div className="fixed bottom-4 left-4 right-4 z-50 animate-in slide-in-from-bottom-20 duration-500">
          
          {activeTicket.status === 'completed' ? (
            /* --- REVIEW MORPH STATE --- */
            <div className="bg-emerald-950/95 backdrop-blur-lg rounded-3xl shadow-2xl p-6 border border-emerald-500/30 text-white flex flex-col max-w-lg mx-auto relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-300 animate-[shimmer_2s_infinite]"></div>

              <div className="flex justify-between items-start mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <CheckCircle className="text-emerald-400" size={28} />
                  </div>
                  <div>
                    <h3 className="font-black text-xl">Service Completed!</h3>
                    <p className="text-emerald-200/80 text-xs font-medium">How was {activeTicket.salonId?.salonName || "your visit"}?</p>
                  </div>
                </div>
                <button
                  onClick={async () => {
                    const currentTicketId = activeTicket._id;
                    setActiveTicket(null); // UI se turant hatao
                    try {
                      // Backend ko batao ki dismiss kar diya h
                      await api.post("/queue/dismiss-review", { ticketId: currentTicketId });
                    } catch(e) {
                      console.error("Failed to dismiss review", e);
                    }
                  }}
                  className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition active:scale-95"
                  title="Close without reviewing"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="flex justify-center gap-2 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setReviewRating(star)}
                    onMouseEnter={() => setHoverStar(star)}
                    onMouseLeave={() => setHoverStar(0)}
                    className="transform transition-transform hover:scale-110 active:scale-90"
                  >
                    <Star
                      size={40}
                      className={`transition-colors duration-200 ${
                        star <= (hoverStar || reviewRating)
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-white/20 fill-transparent"
                      }`}
                    />
                  </button>
                ))}
              </div>

              <textarea
                rows="2"
                placeholder="Write a quick review..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-sm text-white placeholder:text-white/30 focus:border-emerald-500/50 outline-none resize-none mb-4"
              />

              <button
                onClick={submitReview}
                disabled={reviewRating === 0 || isSubmittingReview}
                className="w-full py-3.5 bg-white text-emerald-950 font-black rounded-xl hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:active:scale-100 active:scale-95"
              >
                {isSubmittingReview ? <Loader2 size={18} className="animate-spin" /> : "Submit Review"}
              </button>
            </div>
          ) : (
            /* --- NORMAL ACTIVE TICKET STATE --- */
            <div className="bg-zinc-900/95 backdrop-blur-lg rounded-2xl shadow-2xl p-4 border border-white/10 text-white flex flex-col max-w-lg mx-auto">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className={`w-2 h-2 rounded-full animate-pulse ${activeTicket.status === 'pending' ? 'bg-yellow-500' : 'bg-emerald-500'}`}></span>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Current Status</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-lg">{activeTicket.salonId?.salonName || activeTicket.salonName || "Salon"}</h3>
                            
                            {activeTicket.status === 'pending' ? (
                              <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/20 text-yellow-400 rounded-lg ml-4 border border-yellow-500/30">
                                <Loader2 size={14} className="animate-spin" />
                                <span className="text-[10px] font-bold uppercase tracking-wider">Waiting for Accept...</span>
                              </div>
                            ) : activeTicket.status !== 'serving' ? (
                              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/10 rounded-lg ml-4">
                                <Clock size={12} className="text-zinc-400" />
                                <span className="text-sm font-bold text-white tracking-wider">{timeLeftStr}</span>
                              </div>
                            ) : null}
                        </div>
                        
                        <p className="text-xs text-zinc-400 mt-2">Queue #{activeTicket.queueNumber || "-"} • {activeTicket.status.toUpperCase()}</p>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-black">₹{activeTicket.totalPrice}</div>
                        <div className="text-xs text-zinc-400">to pay</div>
                    </div>
                </div>
                
                <div className="flex gap-3 mt-4">
                    <button 
                        onClick={() => {
                            const sId = activeTicket.salonId?._id || activeTicket.salonId;
                            const targetSalon = salons.find(s => s._id === sId) || activeTicket.salonId;
                            handleRoute(targetSalon);
                        }}
                        className="flex-1 bg-white/10 hover:bg-white/20 py-3 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
                    >
                        <Navigation size={16} /> Directions
                    </button>
                    
                    {activeTicket.status !== 'serving' ? (
                      <button 
                          onClick={handleCancelTicket}
                          disabled={canceling}
                          className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 py-3 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
                      >
                          {canceling ? <Loader2 size={16} className="animate-spin"/> : <X size={16} />}
                          Cancel
                      </button>
                    ) : (
                      <div className="flex-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 cursor-default">
                        <Scissors size={16} className="animate-pulse" /> In Service
                      </div>
                    )}
                </div>

                <div className="mt-3 text-center bg-white/5 border border-white/10 p-1.5 rounded-lg">
                   <span className="text-[9px] text-zinc-400 leading-tight block">
                      *Wait time is estimated. Actual time may vary based on ongoing services.
                   </span>
                </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserDashboard;