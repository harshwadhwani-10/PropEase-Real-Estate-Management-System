import { useMap } from "react-leaflet";
import { Navigation } from "lucide-react";
import { useState } from "react";

// Component that uses useMap hook (must be inside MapContainer)
function RecenterButtonInner({ center, zoom = 12, onLocationUpdate }) {
  const map = useMap();
  const [isLocating, setIsLocating] = useState(false);

  const handleRecenter = () => {
    if (navigator.geolocation) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const userLocation = [latitude, longitude];
          
          if (map) {
            map.flyTo(userLocation, 15, {
              duration: 1.5,
              easeLinearity: 0.25,
            });
          }
          
          if (onLocationUpdate) {
            onLocationUpdate(userLocation);
          }
          
          setIsLocating(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          // Fallback to default center
          if (map && center) {
            map.flyTo(center, zoom, {
              duration: 1.5,
              easeLinearity: 0.25,
            });
          }
          setIsLocating(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      );
    } else {
      // Fallback if geolocation not supported
      if (map && center) {
        map.flyTo(center, zoom, {
          duration: 1.5,
          easeLinearity: 0.25,
        });
      }
    }
  };

  if (!map) return null;

  return (
    <div
      className="leaflet-top leaflet-right"
      style={{
        position: "absolute",
        zIndex: 1000,
        pointerEvents: "none",
        top: "10px",
        right: "10px",
      }}
    >
      <div className="leaflet-control" style={{ pointerEvents: "auto" }}>
        <button
          onClick={handleRecenter}
          disabled={isLocating}
          className="bg-white/95 backdrop-blur-md rounded-full p-3 shadow-2xl border border-white/20 hover:bg-white transition-all cursor-pointer group disabled:opacity-50 disabled:cursor-not-allowed"
          title={isLocating ? "Locating..." : "Recenter to My Location"}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "44px",
            height: "44px",
          }}
        >
          <Navigation className={`w-5 h-5 text-[#2A4365] ${isLocating ? 'animate-spin' : 'group-hover:rotate-90'} transition-transform duration-300`} />
        </button>
      </div>
    </div>
  );
}

// Wrapper component that renders the button outside map context
export default function RecenterButton({ center, zoom = 12, mapInstance }) {
  if (!mapInstance) {
    return (
      <button
        onClick={() => {
          if (center) {
            // This will be handled by the inner component
          }
        }}
        className="absolute bottom-6 right-6 z-[1000] bg-white/95 backdrop-blur-md rounded-full p-3 shadow-2xl border border-white/20 hover:bg-white transition-all cursor-pointer group"
        title="Recenter Map"
      >
        <Navigation className="w-6 h-6 text-[#2A4365] group-hover:rotate-90 transition-transform duration-300" />
      </button>
    );
  }
  return null;
}

export { RecenterButtonInner };

