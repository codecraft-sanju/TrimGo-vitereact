// LocationPicker.jsx
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import { Search, Crosshair, Loader2, MapPin } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// --- Icon Fix for React-Leaflet ---
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon.src || icon,
  shadowUrl: iconShadow.src || iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// --- Helper: Fly to Location on Change ---
const FlyToLocation = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo([center.lat, center.lng], 16); // Increased zoom level (16) for street view
    }
  }, [center, map]);
  return null;
};

// --- Helper: Click to Move Marker ---
const LocationMarker = ({ position, setPosition, onLocationSelect }) => {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onLocationSelect({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });

  return (
    <Marker 
      position={position} 
      draggable={true}
      eventHandlers={{
        dragend: (e) => {
          const marker = e.target;
          const newPos = marker.getLatLng();
          setPosition(newPos);
          onLocationSelect({ lat: newPos.lat, lng: newPos.lng });
        }
      }}
    >
      <Popup minWidth={90}>Aapki Dukan Yahan Hai?</Popup>
    </Marker>
  );
};

const LocationPicker = ({ onLocationSelect }) => {
  // FALLBACK: Agar GPS fail ho jaye toh New Delhi (India Center) dikhayenge
  const FALLBACK_CENTER = { lat: 28.6139, lng: 77.2090 }; 
  
  const [position, setPosition] = useState(null); // Start with NULL to show loader
  const [searchText, setSearchText] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingLoc, setIsLoadingLoc] = useState(true); // Default loading true

  // --- 1. Auto-Detect Location on Mount ---
  useEffect(() => {
    // Component load hote hi location maang lo
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          const userPos = { lat: latitude, lng: longitude };
          setPosition(userPos);
          onLocationSelect(userPos);
          setIsLoadingLoc(false);
        },
        (err) => {
          console.error("Location access denied/error:", err);
          // Agar user mana karde, toh Fallback center use karo
          setPosition(FALLBACK_CENTER);
          onLocationSelect(FALLBACK_CENTER);
          setIsLoadingLoc(false);
          // Optional: Alert hata diya taaki user irritate na ho
        }
      );
    } else {
      setPosition(FALLBACK_CENTER);
      setIsLoadingLoc(false);
    }
  }, []); // Empty dependency array = Runs once on mount

  // --- 2. Manual "Locate Me" Button Logic ---
  const handleCurrentLocation = (e) => {
    e.preventDefault();
    setIsLoadingLoc(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const newPos = { lat: latitude, lng: longitude };
        setPosition(newPos);
        onLocationSelect(newPos);
        setIsLoadingLoc(false);
      },
      (err) => {
        alert("Location access denied.");
        setIsLoadingLoc(false);
      }
    );
  };

  // --- 3. Search Logic ---
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchText) return;
    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${searchText}&countrycodes=in`
      );
      const data = await response.json();
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        const newPos = { lat: parseFloat(lat), lng: parseFloat(lon) };
        setPosition(newPos);
        onLocationSelect(newPos);
      } else {
        alert("Location nahi mili.");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSearching(false);
    }
  };

  // --- RENDER LOADING STATE ---
  // Jab tak location nahi milti, map mat dikhao, loader dikhao
  if (isLoadingLoc && !position) {
    return (
      <div className="w-full h-80 rounded-xl border border-zinc-200 bg-zinc-50 flex flex-col items-center justify-center text-zinc-400 gap-3">
        <Loader2 className="animate-spin text-zinc-900" size={32} />
        <span className="text-sm font-medium animate-pulse">Detecting your location...</span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-80 rounded-xl overflow-hidden border border-zinc-200 z-0 bg-zinc-100">
      
      {/* Search Bar */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex gap-2">
        <form onSubmit={handleSearch} className="flex-1 relative shadow-lg rounded-lg">
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search area..."
            className="w-full pl-10 pr-12 py-2.5 bg-white rounded-lg text-sm font-medium text-zinc-800 border-none outline-none focus:ring-2 focus:ring-zinc-900"
          />
          <Search className="absolute left-3 top-2.5 text-zinc-400" size={16} />
          <button 
            type="submit" 
            className="absolute right-2 top-1.5 bg-zinc-100 hover:bg-zinc-200 p-1 px-2 rounded-md text-zinc-600 transition-colors"
            disabled={isSearching}
          >
            {isSearching ? <Loader2 className="animate-spin" size={16}/> : <ArrowRightIcon />}
          </button>
        </form>
      </div>

      {/* GPS Button */}
      <button
        onClick={handleCurrentLocation}
        className="absolute bottom-4 right-4 z-[1000] bg-white text-zinc-900 p-3 rounded-full shadow-xl hover:bg-zinc-50 active:scale-95 transition-all border border-zinc-100 flex items-center justify-center"
        title="My Location"
        type="button" 
      >
         <Crosshair size={20} />
      </button>

      {/* Map */}
      <MapContainer 
        center={position || FALLBACK_CENTER} 
        zoom={16} // Closer zoom for better accuracy
        scrollWheelZoom={true}
        zoomControl={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <FlyToLocation center={position} />

        {position && (
          <LocationMarker 
             position={position} 
             setPosition={setPosition} 
             onLocationSelect={onLocationSelect} 
          />
        )}
      </MapContainer>
    </div>
  );
};

const ArrowRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);

export default LocationPicker;