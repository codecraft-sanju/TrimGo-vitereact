import React, { useState, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
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


const LocationPicker = ({ onLocationSelect }) => {
  const defaultCenter = { lat: 26.2389, lng: 73.0243 }; // Default: Falna/Jodhpur region
  const [position, setPosition] = useState(defaultCenter);
  const markerRef = useRef(null);

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const newPos = marker.getLatLng();
          setPosition(newPos);
          onLocationSelect({ lat: newPos.lat, lng: newPos.lng });
        }
      },
    }),
    [onLocationSelect],
  );

  return (
    <div className="h-64 w-full rounded-xl overflow-hidden border border-zinc-200 relative z-0">
      <MapContainer 
        center={defaultCenter} 
        zoom={13} 
        scrollWheelZoom={false} 
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker 
          draggable={true} 
          eventHandlers={eventHandlers} 
          position={position} 
          ref={markerRef}
        >
          <Popup minWidth={90}>
            Drag me to your shop!
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default LocationPicker;