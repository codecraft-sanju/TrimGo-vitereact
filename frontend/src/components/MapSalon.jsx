import React, { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { Clock, Users, MapPin, Navigation, Scissors, Sparkles } from "lucide-react"; 
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import L from "leaflet";
import "leaflet-routing-machine";

// --- Fix for Default Leaflet Icon ---
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon.src || icon,
  shadowUrl: iconShadow.src || iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});
L.Marker.prototype.options.icon = DefaultIcon;

// --- Custom User Icon ---
const getUserIcon = (heading) => L.divIcon({
  className: 'custom-user-marker',
  html: `
    <div style="transform: rotate(${heading || 0}deg); transition: transform 0.2s ease-out; display: flex; align-items: center; justify-content: center;">
      <div style="width: 0; height: 0; border-left: 8px solid transparent; border-right: 8px solid transparent; border-bottom: 20px solid #3b82f6; filter: drop-shadow(0 2px 3px rgba(0,0,0,0.3)); position: relative; z-index: 2;"></div>
      <div style="position: absolute; background-color: #3b82f6; width: 12px; height: 12px; border-radius: 50%; animation: pulse 2s infinite; z-index: 1;"></div>
    </div>
    <style>@keyframes pulse { 0% { transform: scale(1); opacity: 0.6; } 100% { transform: scale(3.5); opacity: 0; } }</style>
  `,
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

// --- HELPER: Distance Calculation ---
const getDistanceFromLatLonInMeters = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; 
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

// --- 🔥 UPDATED ROUTING MACHINE (Handles Loader Logic) ---
const RoutingMachine = ({ userLocation, destination, setLoading }) => {
  const map = useMap();
  const routingControlRef = useRef(null);
  const lastRoutedRef = useRef({ userLat: null, userLng: null, destLat: null, destLng: null });

  useEffect(() => {
    if (!map || !userLocation || !destination) return;

    const prev = lastRoutedRef.current;
    const destChanged = prev.destLat !== destination.lat || prev.destLng !== destination.lng;
    
    let distMoved = 0;
    if (prev.userLat) {
        distMoved = getDistanceFromLatLonInMeters(prev.userLat, prev.userLng, userLocation.lat, userLocation.lng);
    }

    // Optimization: Agar same destination hai aur user 80m se kam hila hai, toh reload mat karo
    if (!destChanged && distMoved < 80 && routingControlRef.current) return; 

    // 🔥 START LOADING (Trigger Loader)
    if (setLoading) setLoading(true);

    lastRoutedRef.current = {
        userLat: userLocation.lat,
        userLng: userLocation.lng,
        destLat: destination.lat,
        destLng: destination.lng
    };

    // Cleanup old route
    if (routingControlRef.current) {
      try { map.removeControl(routingControlRef.current); } catch (error) { console.warn("Cleanup error:", error); }
      routingControlRef.current = null;
    }

    // Create new route
    const routingControl = L.Routing.control({
      waypoints: [
        L.latLng(userLocation.lat, userLocation.lng),
        L.latLng(destination.lat, destination.lng)
      ],
      lineOptions: { styles: [{ color: "#2563eb", weight: 6, opacity: 0.8 }] },
      router: L.Routing.osrmv1({
        serviceUrl: 'https://router.project-osrm.org/route/v1',
        profile: 'driving', 
      }),
      createMarker: () => null, 
      addWaypoints: false,      
      draggableWaypoints: false,
      fitSelectedRoutes: true,  
      showAlternatives: false,  
      containerClassName: 'routing-container-hidden', 
    });

    // 🔥 STOP LOADING (Jab Route Mil Jaye)
    routingControl.on('routesfound', function(e) {
      console.log("Route found!");
      if (setLoading) setLoading(false);
    });

    // 🔥 STOP LOADING (Agar Error Aaye)
    routingControl.on('routingerror', function(e) {
      console.error('Routing failed:', e);
      if (setLoading) setLoading(false);
    });

    routingControl.addTo(map);
    routingControlRef.current = routingControl;

    const styleId = 'leaflet-routing-hide-style';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.innerHTML = `
            .leaflet-routing-container, .leaflet-routing-alternatives-container { 
                display: none !important; visibility: hidden !important; opacity: 0 !important; pointer-events: none !important;
            }
        `;
        document.head.appendChild(style);
    }
    return () => {};
  }, [map, userLocation, destination, setLoading]);

  return null;
};

// --- MAP AUTO CENTER ---
const MapAutoCenter = ({ center, isRouting }) => {
  const map = useMap();
  const hasCentered = useRef(false);

  useEffect(() => {
    if (center && !hasCentered.current && !isRouting) {
      map.flyTo([center.lat, center.lng], 12, { duration: 1.5 });
      hasCentered.current = true;
    }
  }, [center, map, isRouting]);
  return null;
};

// --- 🔥 PREMIUM MAP LOADER (User Location Search) ---
const MapPremiumLoader = () => {
  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);
  
  const messages = [
    "Locating you...",
    "Scanning nearby salons...",
    "Calculating distances...",
    "Checking wait times...",
    "Optimizing routes...",
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((old) => (old >= 100 ? 100 : Math.min(old + Math.random() * 15, 100)));
    }, 150);
    const msgTimer = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 1000);
    return () => { clearInterval(timer); clearInterval(msgTimer); };
  }, []);

  return (
    <div className="absolute inset-0 z-[50] flex flex-col items-center justify-center bg-zinc-900 overflow-hidden rounded-3xl">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[30%] -left-[10%] w-[70%] h-[70%] rounded-full bg-blue-500/10 blur-[80px] animate-pulse"></div>
        <div className="absolute -bottom-[30%] -right-[10%] w-[70%] h-[70%] rounded-full bg-emerald-500/10 blur-[80px] animate-pulse"></div>
        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
      </div>
      <div className="relative z-10 flex flex-col items-center">
        <div className="relative mb-6 group">
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-500 to-emerald-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
          <div className="relative w-20 h-20 bg-zinc-800 rounded-2xl shadow-2xl border border-zinc-700/50 flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900 opacity-50"></div>
            <Scissors size={32} className="text-white relative z-10 animate-[spin_4s_linear_infinite_reverse]" strokeWidth={1.5} />
          </div>
        </div>
        <h2 className="text-xl font-black tracking-tight text-white mb-2">Map View</h2>
        <div className="h-5 overflow-hidden mb-6 text-center">
          <p className="text-zinc-400 text-xs font-medium tracking-wide animate-pulse key={messageIndex}">{messages[messageIndex]}</p>
        </div>
        <div className="w-48 h-1 bg-zinc-800 rounded-full overflow-hidden relative">
          <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-300 ease-out rounded-full" style={{ width: `${progress}%` }}>
            <div className="absolute top-0 right-0 h-full w-10 bg-gradient-to-r from-transparent to-white/50 blur-[1px]"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- 🔥 NEW: ROUTE CALCULATION LOADER (Specific for Routing) ---
const RouteCalculationLoader = () => {
  return (
    <div className="absolute inset-0 z-[60] flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm rounded-3xl animate-in fade-in duration-300">
      <div className="relative mb-4">
        {/* Outer Rotating Ring */}
        <div className="w-16 h-16 rounded-full border-4 border-blue-500/30 border-t-blue-500 animate-spin"></div>
        {/* Inner Icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Navigation size={24} className="text-white fill-white/20" />
        </div>
      </div>
      <h3 className="text-white font-bold text-lg">Calculating Route</h3>
      <p className="text-zinc-300 text-xs mt-1 animate-pulse">Finding the fastest path...</p>
    </div>
  );
};

// --- MAIN MAP COMPONENT ---
const MapSalon = ({ salons, onSelect, userLocation, heading, routeDestination, onRouteClick }) => {
  const defaultCenter = [26.2389, 73.0243];
  
  // 🔥 New State for Route Loader
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);

  return (
    <div className="w-full h-[450px] bg-zinc-900 rounded-3xl overflow-hidden relative border border-zinc-200 shadow-2xl z-0 group">
      
      {/* 1. Show Global Loader if NO user location */}
      {!userLocation ? (
        <MapPremiumLoader />
      ) : (
        /* Actual Map Renders Here */
        <MapContainer
          center={[userLocation.lat, userLocation.lng]} 
          zoom={13}
          scrollWheelZoom={false}
          style={{ height: "100%", width: "100%" }}
          className="z-0 animate-in fade-in duration-700"
        >
          <TileLayer
            attribution='&copy; OpenStreetMap &copy; CARTO'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />

          {/* 🔥 Pass setLoading to Routing Machine */}
          <RoutingMachine 
             userLocation={userLocation} 
             destination={routeDestination} 
             setLoading={setIsCalculatingRoute} 
          />

          {/* User Marker */}
          <Marker 
            position={[userLocation.lat, userLocation.lng]} 
            icon={getUserIcon(heading)} 
            interactive={false}
          >
            <Popup>Aap Yahan Hain</Popup>
          </Marker>
          <MapAutoCenter center={userLocation} isRouting={!!routeDestination} />

          {/* Salon Markers */}
          {salons.map((salon) => (
            salon.latitude && salon.longitude && (
              <Marker 
                key={salon._id} 
                position={[salon.latitude, salon.longitude]}
              >
                <Popup className="custom-popup">
                  <div className="p-1 min-w-[180px]">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                          <h3 className="font-bold text-sm text-zinc-900 line-clamp-1">{salon.salonName}</h3>
                          <p className="text-[10px] text-zinc-500 flex items-center gap-1">
                              <MapPin size={10} /> {salon.area || "City Center"}
                          </p>
                      </div>
                      <button 
                          onClick={() => onRouteClick(salon)}
                          className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-200 transition-colors"
                          title="Show Route"
                      >
                          <Navigation size={12} fill="currentColor" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-3 bg-zinc-50 p-2 rounded-lg border border-zinc-100">
                      <div className="flex flex-col items-center">
                          <span className="text-[10px] text-zinc-400 font-bold uppercase">Waiting</span>
                          <div className="flex items-center gap-1 font-bold text-zinc-900">
                              <Users size={12} className="text-blue-500"/> {salon.waiting || 0}
                          </div>
                      </div>
                      <div className="flex flex-col items-center border-l border-zinc-200">
                          <span className="text-[10px] text-zinc-400 font-bold uppercase">ETA</span>
                          <div className="flex items-center gap-1 font-bold text-zinc-900">
                              <Clock size={12} className="text-emerald-500"/> {salon.estTime || 15}m
                          </div>
                      </div>
                    </div>

                    <button
                      onClick={() => onSelect(salon)}
                      disabled={!salon.isOnline}
                      className={`w-full py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-colors ${
                          salon.isOnline 
                          ? 'bg-zinc-900 text-white hover:bg-black' 
                          : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
                      }`}
                    >
                      {salon.isOnline ? "Book Now" : "Closed"}
                    </button>
                  </div>
                </Popup>
              </Marker>
            )
          ))}
        </MapContainer>
      )}

      {/* 🔥 2. Show Route Calculation Loader on top of Map */}
      {isCalculatingRoute && <RouteCalculationLoader />}

    </div>
  );
};

export default MapSalon;