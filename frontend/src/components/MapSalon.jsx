import React, { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { Scissors, Clock, Users, MapPin, ArrowRight } from "lucide-react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";

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

// --- Custom User Navigation Triangle Icon ---
const getUserIcon = (heading) => L.divIcon({
  className: 'custom-user-marker',
  html: `
    <div style="transform: rotate(${heading || 0}deg); transition: transform 0.2s ease-out; display: flex; align-items: center; justify-content: center;">
      <div style="width: 0; height: 0; border-left: 8px solid transparent; border-right: 8px solid transparent; border-bottom: 20px solid #3b82f6; filter: drop-shadow(0 2px 3px rgba(0,0,0,0.3)); position: relative; z-index: 2;"></div>
      <div style="position: absolute; background-color: #3b82f6; width: 12px; height: 12px; border-radius: 50%; animation: pulse 2s infinite; z-index: 1;"></div>
    </div>
    <style>
      @keyframes pulse { 0% { transform: scale(1); opacity: 0.6; } 100% { transform: scale(3.5); opacity: 0; } }
    </style>
  `,
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

// --- NEW: Routing Logic Component ---
const RoutingPath = ({ userLocation, destination }) => {
  const map = useMap();
  const routingControlRef = useRef(null);

  useEffect(() => {
    if (!map || !userLocation || !destination) return;

    // Remove existing route if destination changes
    if (routingControlRef.current) {
      map.removeControl(routingControlRef.current);
    }

    routingControlRef.current = L.Routing.control({
      waypoints: [
        L.latLng(userLocation.lat, userLocation.lng),
        L.latLng(destination.lat, destination.lng)
      ],
      lineOptions: {
        styles: [{ color: "#3b82f6", weight: 6, opacity: 0.8 }]
      },
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      showAlternatives: false,
      createMarker: () => null, // Hide extra markers from routing machine
    }).addTo(map);

    // Hide the turn-by-turn instruction panel (Google Maps style)
    const container = routingControlRef.current.getContainer();
    if (container) container.style.display = 'none';

    return () => {
      if (routingControlRef.current) map.removeControl(routingControlRef.current);
    };
  }, [map, userLocation, destination]);

  return null;
};

const MapAutoCenter = ({ center }) => {
  const map = useMap();
  const hasCentered = useRef(false);

  useEffect(() => {
    if (center && !hasCentered.current) {
      map.flyTo([center.lat, center.lng], 14, { duration: 1.5 });
      hasCentered.current = true;
    }
  }, [center, map]);
  return null;
};

const MapSalon = ({ salons, onSelect, userLocation, heading, selectedDestination }) => {
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
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        {/* --- 1. USER'S LIVE LOCATION --- */}
        {userLocation && (
          <>
            <Marker 
              position={[userLocation.lat, userLocation.lng]} 
              icon={getUserIcon(heading)} 
              interactive={false}
            >
              <Popup>Aap Yahan Hain</Popup>
            </Marker>
            {!selectedDestination && <MapAutoCenter center={userLocation} />}
          </>
        )}

        {/* --- 2. NAVIGATION ROUTE --- */}
        {userLocation && selectedDestination && (
          <RoutingPath userLocation={userLocation} destination={selectedDestination} />
        )}

        {/* --- 3. SALON MARKERS --- */}
        {salons.map((salon) => (
          salon.latitude && salon.longitude && (
            <Marker 
              key={salon._id} 
              position={[salon.latitude, salon.longitude]}
            >
              <Popup className="custom-popup">
                <div className="p-1 min-w-[180px]">
                  <h3 className="font-bold text-sm text-zinc-900">{salon.salonName}</h3>
                  <p className="text-[10px] text-zinc-500 mb-2 flex items-center gap-1">
                    <MapPin size={10} /> {salon.area || "City Center"}
                  </p>
                  <button
                    onClick={() => onSelect(salon)}
                    disabled={!salon.isOnline}
                    className={`w-full py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-colors ${
                      salon.isOnline ? 'bg-zinc-900 text-white' : 'bg-zinc-200 text-zinc-400'
                    }`}
                  >
                    {salon.isOnline ? <>Book Now <ArrowRight size={12} /></> : "Closed"}
                  </button>
                </div>
              </Popup>
            </Marker>
          )
        ))}
      </MapContainer>

      <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full border border-white/20 text-[10px] font-bold text-zinc-600 shadow-lg z-[400] flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        Live Traffic Layer
      </div>
    </div>
  );
};

export default MapSalon;