import React, { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { Scissors, Clock, Users, MapPin, ArrowRight, Navigation } from "lucide-react";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css"; // Import Routing CSS
import L from "leaflet";
import "leaflet-routing-machine"; // Import Routing Logic

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

// --- ROUTING MACHINE COMPONENT ---
// This handles drawing the line
const RoutingMachine = ({ userLocation, destination }) => {
  const map = useMap();
  const routingControlRef = useRef(null);

  useEffect(() => {
    // If we don't have both points, remove any existing route
    if (!userLocation || !destination) {
      if (routingControlRef.current) {
        map.removeControl(routingControlRef.current);
        routingControlRef.current = null;
      }
      return;
    }

    // Remove previous route if exists
    if (routingControlRef.current) {
      map.removeControl(routingControlRef.current);
    }

    // Create new route
    routingControlRef.current = L.Routing.control({
      waypoints: [
        L.latLng(userLocation.lat, userLocation.lng),
        L.latLng(destination.lat, destination.lng)
      ],
      lineOptions: {
        styles: [{ color: "#3b82f6", weight: 5, opacity: 0.8 }] // Blue Route Line
      },
      createMarker: () => null, // Don't create extra markers on top of ours
      addWaypoints: false, // Disable dragging points
      draggableWaypoints: false,
      fitSelectedRoutes: true, // Auto zoom to fit the route
      show: false // Hide the text instruction box (turn-by-turn list)
    }).addTo(map);

    // Hide the container with CSS just in case 'show: false' leaves a white box
    const container = document.querySelector(".leaflet-routing-container");
    if(container) container.style.display = "none";

    return () => {
      if (routingControlRef.current) {
        map.removeControl(routingControlRef.current);
      }
    };
  }, [map, userLocation, destination]);

  return null;
};

// Helper to auto-center map (only runs if NO route is active)
const MapAutoCenter = ({ center, isRouting }) => {
  const map = useMap();
  const hasCentered = useRef(false);

  useEffect(() => {
    if (center && !hasCentered.current && !isRouting) {
      map.flyTo([center.lat, center.lng], 14, { duration: 1.5 });
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
                    {/* Route Button in Popup */}
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