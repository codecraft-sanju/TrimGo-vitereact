import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import { Search, Crosshair, Loader2, MapPin, X, Navigation } from 'lucide-react'; // Navigation icon added
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon.src || icon,
  shadowUrl: iconShadow.src || iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// --- Helper: Fly to Location ---
const FlyToLocation = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo([center.lat, center.lng], 16);
  }, [center, map]);
  return null;
};

// --- Helper: Click Marker ---
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
      <Popup minWidth={90}>Selected Location</Popup>
    </Marker>
  );
};

const LocationPicker = ({ onLocationSelect }) => {
  const FALLBACK_CENTER = { lat: 28.6139, lng: 77.2090 };
  
  const [position, setPosition] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingLoc, setIsLoadingLoc] = useState(true); // Default loading true
  const [showSuggestions, setShowSuggestions] = useState(false);

  const isSelectingRef = useRef(false);
  const wrapperRef = useRef(null);

  // --- 1. Click Outside Logic ---
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- 2. Auto-Detect Location (On Mount) ---
  useEffect(() => {
    // Thoda artificial delay taki user ko premium animation dikhe (Optional)
    // Real fetching start:
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setPosition(newPos);
          onLocationSelect(newPos);
          setIsLoadingLoc(false);
        },
        () => {
          // Error or Permission Denied
          setPosition(FALLBACK_CENTER);
          setIsLoadingLoc(false);
        },
        { timeout: 10000 } // 10 sec timeout
      );
    } else {
      setPosition(FALLBACK_CENTER);
      setIsLoadingLoc(false);
    }
  }, []);

  // --- 3. Live Search Logic ---
  useEffect(() => {
    if (isSelectingRef.current) {
      isSelectingRef.current = false;
      return;
    }

    const timer = setTimeout(async () => {
      if (searchText.length > 2) {
        setIsSearching(true);
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${searchText}&countrycodes=in&limit=5`
          );
          const data = await response.json();
          setSuggestions(data);
          setShowSuggestions(true);
        } catch (error) {
          console.error(error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setShowSuggestions(false);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [searchText]);

  const handleSuggestionClick = (place) => {
    isSelectingRef.current = true; 
    const lat = parseFloat(place.lat);
    const lng = parseFloat(place.lon);
    const newPos = { lat, lng };
    setPosition(newPos);
    onLocationSelect(newPos);
    setSearchText(place.display_name.split(',')[0]);
    setShowSuggestions(false);
  };

  const handleClearSearch = () => {
    setSearchText("");
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const handleCurrentLocation = (e) => {
    e.preventDefault();
    setIsLoadingLoc(true); // Start Loader
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setPosition(newPos);
        onLocationSelect(newPos);
        setIsLoadingLoc(false); // Stop Loader
        setSearchText("");
        setShowSuggestions(false);
      },
      () => {
        alert("Location access denied. Please enable GPS.");
        setIsLoadingLoc(false);
      }
    );
  };

  // --- PREMIUM LOADER UI ---
  if (isLoadingLoc && !position) {
    return (
      <div className="relative w-full h-full rounded-xl bg-zinc-900 overflow-hidden flex flex-col items-center justify-center text-white z-0 border border-zinc-800">
        {/* Abstract Background Noise */}
        <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>
        
        {/* Radar / Pulse Animation */}
        <div className="relative flex items-center justify-center mb-6">
          {/* Outer Ring 1 */}
          <div className="absolute w-32 h-32 border border-emerald-500/20 rounded-full animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
          {/* Outer Ring 2 (Delayed) */}
          <div className="absolute w-32 h-32 border border-emerald-500/10 rounded-full animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite] animation-delay-500"></div>
          
          {/* Center Icon Circle */}
          <div className="relative z-10 bg-zinc-800 p-4 rounded-full border border-zinc-700 shadow-2xl shadow-emerald-500/10">
             <Navigation className="text-emerald-400 animate-pulse" size={28} />
          </div>
        </div>

        <div className="text-center space-y-1 relative z-10">
          <h4 className="text-sm font-bold text-white tracking-wide">Detecting Location...</h4>
          <p className="text-[10px] text-zinc-400 uppercase tracking-wider">Please Wait</p>
        </div>
      </div>
    );
  }

  // --- MAIN MAP UI ---
  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden border border-zinc-200 bg-zinc-100 z-0">
      
      {/* Search Bar */}
      <div ref={wrapperRef} className="absolute top-3 left-3 right-3 z-[1000] flex flex-col gap-1">
        <div className="relative shadow-md rounded-lg bg-white">
          <input
            type="text"
            value={searchText}
            onFocus={() => { if(suggestions.length > 0) setShowSuggestions(true); }}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search area..."
            className="w-full pl-10 pr-10 py-2.5 rounded-lg text-xs sm:text-sm font-medium text-zinc-800 border-none outline-none focus:ring-2 focus:ring-zinc-900"
          />
          <Search className="absolute left-3 top-2.5 text-zinc-400" size={16} />
          
          <div className="absolute right-2 top-1.5 flex items-center">
            {isSearching ? (
              <Loader2 className="animate-spin text-zinc-400 m-1" size={16}/>
            ) : searchText ? (
              <button onClick={handleClearSearch} className="p-1 hover:bg-zinc-100 rounded-full text-zinc-400">
                <X size={16} />
              </button>
            ) : null}
          </div>
        </div>

        {/* Suggestions List */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="bg-white rounded-lg shadow-xl border border-zinc-100 overflow-hidden max-h-48 overflow-y-auto">
            {suggestions.map((place) => (
              <button
                key={place.place_id}
                onClick={() => handleSuggestionClick(place)}
                className="w-full text-left px-4 py-2 text-xs text-zinc-700 hover:bg-zinc-100 border-b border-zinc-50 last:border-none transition-colors flex items-center gap-2"
              >
                <MapPin size={12} className="text-zinc-400 shrink-0" />
                <span className="truncate">{place.display_name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Recenter Button */}
      <button
        onClick={handleCurrentLocation}
        className="absolute bottom-4 right-4 z-[1000] bg-white text-zinc-900 p-3 rounded-full shadow-lg hover:bg-zinc-50 border border-zinc-100 transition-transform active:scale-95"
        type="button"
        title="Find My Location"
      >
         <Crosshair size={20} />
      </button>

      <MapContainer 
        center={position || FALLBACK_CENTER} 
        zoom={16} 
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

export default LocationPicker;