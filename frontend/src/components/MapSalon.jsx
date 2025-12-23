import React, { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { Clock, Users, MapPin, Navigation } from "lucide-react";
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

// --- HELPER: Distance Calculation (Haversine Formula) ---
// Iska use karke hum check karenge ki user kitna move hua hai
const getDistanceFromLatLonInMeters = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Earth radius in meters
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

// --- IMPROVED ROUTING MACHINE COMPONENT ---
const RoutingMachine = ({ userLocation, destination }) => {
  const map = useMap();
  const routingControlRef = useRef(null);
  
  // Ref to store last routed positions
  const lastRoutedRef = useRef({ 
      userLat: null, 
      userLng: null, 
      destLat: null, 
      destLng: null 
  });

  useEffect(() => {
    // 1. Basic Validation
    if (!map || !userLocation || !destination) return;

    // --- OPTIMIZATION START: Check difference ---
    const prev = lastRoutedRef.current;
    
    // Check 1: Kya destination badal gaya hai?
    const destChanged = prev.destLat !== destination.lat || prev.destLng !== destination.lng;

    // Check 2: User kitne meters move hua hai pichli calculation se?
    let distMoved = 0;
    if (prev.userLat) {
        distMoved = getDistanceFromLatLonInMeters(
            prev.userLat, prev.userLng,
            userLocation.lat, userLocation.lng
        );
    }

    // 🔥 MAIN LOGIC: Agar destination same hai AUR user 80 meters se kam hila hai
    // toh hum naya route calculate NAHI karenge. (Flickering Fixed)
    if (!destChanged && distMoved < 80 && routingControlRef.current) {
        return; 
    }

    // Update the ref with current values
    lastRoutedRef.current = {
        userLat: userLocation.lat,
        userLng: userLocation.lng,
        destLat: destination.lat,
        destLng: destination.lng
    };
    // --- OPTIMIZATION END ---

    // 2. CLEANUP: Sirf tab remove karo jab naya bana rahe ho
    if (routingControlRef.current) {
      try {
        map.removeControl(routingControlRef.current);
      } catch (error) {
        console.warn("Cleanup error:", error);
      }
      routingControlRef.current = null;
    }

    // 3. CREATE NEW ROUTE
    const routingControl = L.Routing.control({
      waypoints: [
        L.latLng(userLocation.lat, userLocation.lng),
        L.latLng(destination.lat, destination.lng)
      ],
      lineOptions: {
        styles: [{ color: "#2563eb", weight: 6, opacity: 0.8 }] 
      },
      // Using driving profile (faster calculation)
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

    // 4. Handle Errors
    routingControl.on('routingerror', function(e) {
      console.log('Routing failed:', e);
    });

    // 5. ADD TO MAP
    routingControl.addTo(map);
    routingControlRef.current = routingControl;

    // 6. CSS Injection (Hide Instructions Box)
    const styleId = 'leaflet-routing-hide-style';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.innerHTML = `
            .leaflet-routing-container, 
            .leaflet-routing-alternatives-container { 
                display: none !important; 
                visibility: hidden !important;
                opacity: 0 !important;
                pointer-events: none !important;
            }
        `;
        document.head.appendChild(style);
    }

    // Cleanup logic handled at start of next effect to prevent flash
    return () => {};
  }, [map, userLocation, destination]);

  return null;
};

// Helper to auto-center map
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

const MapSalon = ({ salons, onSelect, userLocation, heading, routeDestination, onRouteClick }) => {
  const defaultCenter = [26.2389, 73.0243];

  return (
    <div className="w-full h-[450px] bg-zinc-900 rounded-3xl overflow-hidden relative border border-zinc-200 shadow-2xl z-0 group">
      <MapContainer
        center={defaultCenter}
        zoom={13}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; OpenStreetMap &copy; CARTO'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        {/* ROUTING LOGIC */}
        <RoutingMachine userLocation={userLocation} destination={routeDestination} />

        {/* USER LOCATION */}
        {userLocation && (
          <>
            <Marker 
              position={[userLocation.lat, userLocation.lng]} 
              icon={getUserIcon(heading)} 
              interactive={false}
            >
              <Popup>Aap Yahan Hain</Popup>
            </Marker>
            <MapAutoCenter center={userLocation} isRouting={!!routeDestination} />
          </>
        )}

        {/* SALON MARKERS */}
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
                    {/* Route Button */}
                    <button 
                        onClick={() => onRouteClick(salon)}
                        className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-200 transition-colors"
                        title="Show Route"
                    >
                        <Navigation size={12} fill="currentColor" />
                    </button>
                  </div>

                  {/* Stats Grid */}
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
    </div>
  );
};

export default MapSalon;