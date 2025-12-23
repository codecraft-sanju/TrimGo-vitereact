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

// --- IMPORTANT: Component to Fly to New Location ---
// Yeh component map ko force karega nayi location par jaane ke liye
const FlyToLocation = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo([center.lat, center.lng], 13); // 13 is zoom level
    }
  }, [center, map]);
  return null;
};

// --- Helper Component: Click on Map to Move Marker ---
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
      <Popup minWidth={90}>Dukan yahan hai!</Popup>
    </Marker>
  );
};

const LocationPicker = ({ onLocationSelect }) => {
  // Default Center (Falna/Jodhpur region)
  const defaultCenter = { lat: 26.2389, lng: 73.0243 }; 
  const [position, setPosition] = useState(defaultCenter);
  const [searchText, setSearchText] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingLoc, setIsLoadingLoc] = useState(false);

  // 1. Function to handle "Use My Current Location"
  const handleCurrentLocation = (e) => {
    e.preventDefault(); // Prevent form submission if inside form
    setIsLoadingLoc(true);
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      setIsLoadingLoc(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const newPos = { lat: latitude, lng: longitude };
        setPosition(newPos);
        onLocationSelect(newPos);
        setIsLoadingLoc(false);
      },
      (err) => {
        console.error(err);
        alert("Location access denied or unavailable.");
        setIsLoadingLoc(false);
      }
    );
  };

  // 2. Function to Search Address
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchText) return;
    
    setIsSearching(true);
    try {
      // Adding '&countrycodes=in' to prioritize India results
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${searchText}&countrycodes=in`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        const newPos = { lat: parseFloat(lat), lng: parseFloat(lon) };
        
        // Update State (Marker aur Map dono update honge)
        setPosition(newPos);
        onLocationSelect(newPos);
      } else {
        alert("Location nahi mili. Kripya shahar ya area ka naam sahi likhein.");
      }
    } catch (error) {
      console.error("Search error:", error);
      alert("Network error. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="relative w-full h-80 rounded-xl overflow-hidden border border-zinc-200 z-0 bg-zinc-100">
      
      {/* --- Search Bar Overlay --- */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex gap-2">
        <form onSubmit={handleSearch} className="flex-1 relative shadow-lg rounded-lg">
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search city or area (e.g. Delhi, Falna)"
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

      {/* --- GPS Button Overlay --- */}
      <button
        onClick={handleCurrentLocation}
        disabled={isLoadingLoc}
        className="absolute bottom-4 right-4 z-[1000] bg-white text-zinc-900 p-3 rounded-full shadow-xl hover:bg-zinc-50 active:scale-95 transition-all border border-zinc-100 flex items-center justify-center"
        title="Use Current Location"
        type="button" 
      >
        {isLoadingLoc ? (
          <Loader2 className="animate-spin text-zinc-500" size={20} />
        ) : (
          <Crosshair size={20} />
        )}
      </button>

      {/* --- Map --- */}
      <MapContainer 
        center={defaultCenter} 
        zoom={13} 
        scrollWheelZoom={true}
        zoomControl={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* YEH LINE MAGIC KAREGI: Jab position badlegi, map waha udega */}
        <FlyToLocation center={position} />

        {/* Handle Marker Logic */}
        <LocationMarker 
           position={position} 
           setPosition={setPosition} 
           onLocationSelect={onLocationSelect} 
        />
      </MapContainer>
    </div>
  );
};

// Simple Arrow Icon
const ArrowRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);

export default LocationPicker;