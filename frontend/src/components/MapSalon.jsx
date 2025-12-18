"use client";
import React, { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { Scissors, Clock, Users, MapPin, ArrowRight } from "lucide-react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

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

// --- Custom User Blue Dot Icon ---
const userIcon = L.divIcon({
  className: 'custom-user-marker',
  html: `
    <div style="position: relative;">
      <div style="background-color: #3b82f6; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; position: relative; z-index: 2;"></div>
      <div style="background-color: #3b82f6; width: 14px; height: 14px; border-radius: 50%; position: absolute; top: 0; left: 0; animation: pulse 2s infinite; z-index: 1;"></div>
    </div>
    <style>
      @keyframes pulse {
        0% { transform: scale(1); opacity: 0.8; }
        100% { transform: scale(3); opacity: 0; }
      }
    </style>
  `,
  iconSize: [14, 14],
  iconAnchor: [7, 7]
});

// Helper to auto-center map smoothly
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

const MapSalon = ({ salons, onSelect, userLocation }) => {
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
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        {/* --- 1. USER'S LIVE LOCATION --- */}
        {userLocation && (
          <>
            <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon} interactive={false}>
              <Popup>Aap Yahan Hain</Popup>
            </Marker>
            <MapAutoCenter center={userLocation} />
          </>
        )}

        {/* --- 2. SALON MARKERS --- */}
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
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-white ${salon.isOnline ? 'bg-zinc-900' : 'bg-red-500'}`}>
                        <Scissors size={12} />
                    </div>
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
                            <Clock size={12} className="text-emerald-500"/> {salon.eta || 15}m
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
                    {salon.isOnline ? (
                        <>Book Now <ArrowRight size={12} /></>
                    ) : (
                        "Closed"
                    )}
                  </button>
                </div>
              </Popup>
            </Marker>
          )
        ))}
      </MapContainer>

      <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full border border-white/20 text-[10px] font-bold text-zinc-600 shadow-lg z-[400] pointer-events-none flex items-center gap-2">
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