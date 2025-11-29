import { useEffect, useState, useCallback, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import { GeoSearchControl, OpenStreetMapProvider } from "leaflet-geosearch";
import { MapPin, Navigation, CheckCircle, Search } from "lucide-react";
import { motion } from "framer-motion";
import "leaflet-geosearch/dist/geosearch.css";

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Custom PIN marker icon for picker (actual pin shape, not circle)
const createPickerIcon = (isSelected = false) => {
  const pinWidth = 40;
  const pinHeight = 50;
  const color = isSelected ? "#F6AD55" : "#2A4365";

  return L.divIcon({
    html: `
      <svg width="${pinWidth}" height="${
      pinHeight + 5
    }" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${pinWidth} ${
      pinHeight + 5
    }">
        <!-- Pin shadow -->
        <ellipse cx="${pinWidth / 2}" cy="${pinHeight + 2}" rx="${
      pinWidth / 4
    }" ry="2" fill="rgba(0,0,0,0.3)"/>
        <!-- Pin body (teardrop/pin shape) -->
        <path d="M ${pinWidth / 2} 0
                L ${pinWidth * 0.75} ${pinHeight * 0.6}
                Q ${pinWidth * 0.8} ${pinHeight * 0.8}, ${
      pinWidth / 2
    } ${pinHeight}
                Q ${pinWidth * 0.2} ${pinHeight * 0.8}, ${pinWidth * 0.25} ${
      pinHeight * 0.6
    }
                Z"
              fill="${color}"
              stroke="#FFFFFF"
              stroke-width="2.5"/>
        <!-- Pin point circle -->
        <circle cx="${pinWidth / 2}" cy="${
      pinHeight * 0.2
    }" r="6" fill="#FFFFFF" stroke="${color}" stroke-width="2"/>
      </svg>
    `,
    className: "map-picker-marker",
    iconSize: [pinWidth, pinHeight + 5],
    iconAnchor: [pinWidth / 2, pinHeight + 5],
    popupAnchor: [0, -(pinHeight + 5)],
  });
};

// Component to add search control
function SearchControl({ onLocationSelect }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const provider = new OpenStreetMapProvider();
    const searchControl = new GeoSearchControl({
      provider,
      style: "bar",
      showMarker: false,
      showPopup: false,
      maxMarkers: 1,
      retainZoomLevel: false,
      animateZoom: true,
      autoClose: true,
      searchLabel: "Search address, society, or area...",
      keepResult: true,
      position: "topleft",
    });

    map.addControl(searchControl);

    // Handle search result - automatically save coordinates when place is searched
    const handleSearchResult = (e) => {
      const { location } = e;
      // Dispatch event to update coordinates
      const event = new CustomEvent("mapPickerLocationSelected", {
        detail: { lat: location.y, lng: location.x },
      });
      window.dispatchEvent(event);
      // Fly to location
      map.flyTo([location.y, location.x], 15, {
        duration: 1.5,
        easeLinearity: 0.25,
      });
    };

    map.on("geosearch/showlocation", handleSearchResult);

    return () => {
      map.removeControl(searchControl);
      map.off("geosearch/showlocation", handleSearchResult);
    };
  }, [map, onLocationSelect]);

  return null;
}

// Component to update map view (only on initial load or search, not on marker placement)
function MapViewUpdater({ center, zoom, shouldUpdate }) {
  const map = useMap();
  const lastUpdateRef = useRef({ center: null, zoom: null });

  useEffect(() => {
    // Only update view if shouldUpdate is true AND center/zoom actually changed
    if (center && zoom && shouldUpdate) {
      const centerChanged =
        !lastUpdateRef.current.center ||
        lastUpdateRef.current.center[0] !== center[0] ||
        lastUpdateRef.current.center[1] !== center[1];
      const zoomChanged = lastUpdateRef.current.zoom !== zoom;

      // Only update if center or zoom actually changed (not just position state update)
      if (centerChanged || zoomChanged) {
        map.setView(center, zoom, { animate: true, duration: 0.5 });
        lastUpdateRef.current = { center: [...center], zoom };
      }
    }
  }, [map, center, zoom, shouldUpdate]);
  return null;
}

// Component to handle map clicks and track zoom
function MapClickHandler({ onMapClick, onZoomChange }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    // Track zoom changes
    const handleZoomEnd = () => {
      if (onZoomChange) {
        onZoomChange(map.getZoom());
      }
    };

    // Handle map clicks
    const handleClick = (e) => {
      if (onMapClick) {
        const { lat, lng } = e.latlng;
        onMapClick({ lat, lng });
      }
    };

    map.on("click", handleClick);
    map.on("zoomend", handleZoomEnd);

    // Get initial zoom
    if (onZoomChange) {
      onZoomChange(map.getZoom());
    }

    return () => {
      map.off("click", handleClick);
      map.off("zoomend", handleZoomEnd);
    };
  }, [map, onMapClick, onZoomChange]);

  return null;
}

export default function MapPicker({
  initialLat = 23.2156,
  initialLng = 72.6369,
  onLocationSelect,
  height = "500px",
}) {
  const [position, setPosition] = useState([initialLat, initialLng]);
  const [coordinates, setCoordinates] = useState({
    lat: initialLat,
    lng: initialLng,
  });
  const [isLocationSet, setIsLocationSet] = useState(false);
  const [latInput, setLatInput] = useState(initialLat.toString());
  const [lngInput, setLngInput] = useState(initialLng.toString());
  const [shouldUpdateView, setShouldUpdateView] = useState(true); // Only update view on initial load
  const [mapZoom, setMapZoom] = useState(13); // Track current zoom level
  const [viewCenter, setViewCenter] = useState([initialLat, initialLng]); // Separate center for view updates

  // Update position when initial values change (from props, not from user clicks)
  useEffect(() => {
    if (initialLat && initialLng) {
      setPosition([initialLat, initialLng]);
      setCoordinates({ lat: initialLat, lng: initialLng });
      setLatInput(initialLat.toString());
      setLngInput(initialLng.toString());
      setViewCenter([initialLat, initialLng]); // Update view center for initial load
      setShouldUpdateView(true); // Allow view update when initial values change
    }
  }, [initialLat, initialLng]);

  // Update coordinates function - saves coordinates when marker is placed
  const updateCoordinates = useCallback(
    (lat, lng) => {
      setPosition([lat, lng]);
      setCoordinates({ lat, lng });
      setLatInput(lat.toFixed(6));
      setLngInput(lng.toFixed(6));
      setIsLocationSet(true);
      if (onLocationSelect) {
        onLocationSelect({ lat, lng });
      }
    },
    [onLocationSelect]
  );

  // Listen for search results - automatically save when place is searched
  useEffect(() => {
    const handleLocationSelect = (e) => {
      const { lat, lng } = e.detail;
      // When searching, allow view update to zoom to the searched location
      setViewCenter([lat, lng]); // Update view center for search
      setShouldUpdateView(true);
      // Automatically update coordinates when place is searched (e.g., "National Park")
      updateCoordinates(lat, lng);
    };

    window.addEventListener("mapPickerLocationSelected", handleLocationSelect);
    return () => {
      window.removeEventListener(
        "mapPickerLocationSelected",
        handleLocationSelect
      );
    };
  }, [updateCoordinates]);

  // Handle map click - click anywhere on map to place marker
  const handleMapClick = useCallback(
    ({ lat, lng }) => {
      // Place marker and save coordinates when clicking on map
      // Don't update the map view (zoom) - keep current zoom level
      setShouldUpdateView(false);
      updateCoordinates(lat, lng);
    },
    [updateCoordinates]
  );

  // Handle coordinate input change
  const handleLatInputChange = (e) => {
    const value = e.target.value;
    setLatInput(value);
    const lat = parseFloat(value);
    if (!isNaN(lat) && lat >= -90 && lat <= 90) {
      // Don't update view when manually entering coordinates - keep current zoom
      setShouldUpdateView(false);
      updateCoordinates(lat, coordinates.lng);
    }
  };

  const handleLngInputChange = (e) => {
    const value = e.target.value;
    setLngInput(value);
    const lng = parseFloat(value);
    if (!isNaN(lng) && lng >= -180 && lng <= 180) {
      // Don't update view when manually entering coordinates - keep current zoom
      setShouldUpdateView(false);
      updateCoordinates(coordinates.lat, lng);
    }
  };

  // Handle confirm location
  const handleConfirmLocation = () => {
    if (onLocationSelect) {
      onLocationSelect({ lat: coordinates.lat, lng: coordinates.lng });
    }
    setIsLocationSet(true);
  };

  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className=""
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#2A4365] rounded-lg">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">
                Select Property Location
              </h3>
              <p className="text-sm text-gray-600">
                Click on the map or enter coordinates to set the location
              </p>
            </div>
          </div>
          {isLocationSet && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-2 text-green-600"
            >
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm font-semibold">Location Set</span>
            </motion.div>
          )}
        </div>

        <div className="mb-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
          <div className="flex items-start gap-2">
            <Search className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">How to set location:</p>
              <ul className="list-disc list-inside space-y-1 text-blue-700">
                <li>
                  Use the search bar on the map to find addresses, societies, or
                  areas - coordinates will be saved automatically
                </li>
                <li>
                  Click anywhere on the map to place a PIN marker and save
                  coordinates
                </li>
                <li>
                  Or manually enter latitude and longitude coordinates below
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Coordinate Input Fields - Single row */}
        <div className="mb-4 flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Latitude
            </label>
            <input
              type="number"
              step="any"
              value={latInput}
              onChange={handleLatInputChange}
              placeholder="23.2156"
              min="-90"
              max="90"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2A4365] focus:border-transparent"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Longitude
            </label>
            <input
              type="number"
              step="any"
              value={lngInput}
              onChange={handleLngInputChange}
              placeholder="72.6369"
              min="-180"
              max="180"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2A4365] focus:border-transparent"
            />
          </div>
        </div>

        <div
          className="relative rounded-xl overflow-hidden border-2 border-gray-200 shadow-lg"
          style={{ height }}
        >
          <MapContainer
            center={position}
            zoom={13}
            style={{ height: "100%", width: "100%" }}
            scrollWheelZoom={true}
          >
            <MapViewUpdater
              center={viewCenter}
              zoom={mapZoom}
              shouldUpdate={shouldUpdateView}
            />
            <MapClickHandler
              onMapClick={handleMapClick}
              onZoomChange={setMapZoom}
            />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <SearchControl onLocationSelect={onLocationSelect} />
            <Marker
              position={position}
              icon={createPickerIcon(isLocationSet)}
              draggable={false}
            />
          </MapContainer>
        </div>
      </motion.div>
    </div>
  );
}
