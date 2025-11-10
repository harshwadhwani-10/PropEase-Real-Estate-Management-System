import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import ListingItem from "../components/ListingItem";

// Check if Google Maps API key is available
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

// Google Maps Component
function GoogleMapView({ listings, center, onMarkerClick }) {
  const [map, setMap] = useState(null);
  const [selectedListing, setSelectedListing] = useState(null);

  useEffect(() => {
    if (!window.google) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
      script.onload = () => {
        // Load MarkerClusterer
        const clusterScript = document.createElement("script");
        clusterScript.src = "https://unpkg.com/@googlemaps/markerclusterer/dist/index.min.js";
        clusterScript.onload = () => {
          initializeMap();
        };
        document.head.appendChild(clusterScript);
      };
    } else {
      initializeMap();
    }
  }, []);

  const initializeMap = () => {
    const mapElement = document.getElementById("google-map");
    if (mapElement && window.google) {
      const newMap = new window.google.maps.Map(mapElement, {
        center: { lat: center[0], lng: center[1] },
        zoom: 12,
      });

      // Create markers with clustering
      const markers = listings
        .filter(
          (listing) =>
            listing.location &&
            listing.location.coordinates &&
            listing.location.coordinates[0] !== 0 &&
            listing.location.coordinates[1] !== 0
        )
        .map((listing) => {
          const marker = new window.google.maps.Marker({
            position: {
              lat: listing.location.coordinates[1],
              lng: listing.location.coordinates[0],
            },
            map: newMap,
            title: listing.name,
            icon: {
              url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
              scaledSize: new window.google.maps.Size(32, 32),
            },
          });

          marker.addListener("click", () => {
            setSelectedListing(listing);
          });

          return marker;
        });

      // Simple clustering (group markers when zoomed out)
      if (window.MarkerClusterer) {
        new window.MarkerClusterer({
          map: newMap,
          markers: markers,
        });
      }

      setMap(newMap);
    }
  };

  return (
    <div className="relative w-full h-full">
      <div id="google-map" className="w-full h-full"></div>
      {selectedListing && (
        <div className="absolute top-4 right-4 bg-white p-4 rounded-lg shadow-lg max-w-sm z-10">
          <img
            src={selectedListing.imageUrls[0]}
            alt={selectedListing.name}
            className="w-full h-32 object-cover rounded mb-2"
          />
          <h3 className="font-semibold text-sm mb-1">{selectedListing.name}</h3>
          <p className="text-xs text-gray-600 mb-2">{selectedListing.address}</p>
          <p className="text-sm font-bold text-green-700 mb-2">
            ₹
            {selectedListing.offer
              ? selectedListing.discountPrice.toLocaleString("en-IN")
              : selectedListing.regularPrice.toLocaleString("en-IN")}
            {selectedListing.type === "rent" && " / month"}
          </p>
          <button
            onClick={() => {
              onMarkerClick(selectedListing._id);
              setSelectedListing(null);
            }}
            className="w-full bg-slate-700 text-white px-3 py-1 rounded text-sm hover:opacity-95"
          >
            View Details
          </button>
          <button
            onClick={() => setSelectedListing(null)}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}

// Leaflet Map Component (Fallback)
function LeafletMapView({ listings, center, onMarkerClick }) {
  const [MapContainer, setMapContainer] = useState(null);
  const [TileLayer, setTileLayer] = useState(null);
  const [Marker, setMarker] = useState(null);
  const [Popup, setPopup] = useState(null);
  const [useMap, setUseMap] = useState(null);

  useEffect(() => {
    import("react-leaflet").then((leaflet) => {
      import("leaflet/dist/leaflet.css");
      import("leaflet").then((L) => {
        delete L.default.Icon.Default.prototype._getIconUrl;
        L.default.Icon.Default.mergeOptions({
          iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
          iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
          shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        });
      });
      setMapContainer(leaflet.MapContainer);
      setTileLayer(leaflet.TileLayer);
      setMarker(leaflet.Marker);
      setPopup(leaflet.Popup);
      setUseMap(leaflet.useMap);
    });
  }, []);

  if (!MapContainer) {
    return <div className="flex items-center justify-center h-full">Loading map...</div>;
  }

  function MapViewUpdater({ center, zoom }) {
    const map = useMap();
    useEffect(() => {
      map.setView(center, zoom);
    }, [map, center, zoom]);
    return null;
  }

  return (
    <MapContainer
      center={center}
      zoom={12}
      style={{ height: "100%", width: "100%" }}
      scrollWheelZoom={true}
    >
      <MapViewUpdater center={center} zoom={12} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {listings
        .filter(
          (listing) =>
            listing.location &&
            listing.location.coordinates &&
            listing.location.coordinates[0] !== 0 &&
            listing.location.coordinates[1] !== 0
        )
        .map((listing) => (
          <Marker
            key={listing._id}
            position={[listing.location.coordinates[1], listing.location.coordinates[0]]}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold text-sm mb-1">{listing.name}</h3>
                <p className="text-xs text-gray-600 mb-2">{listing.address}</p>
                <p className="text-sm font-bold text-green-700">
                  ₹
                  {listing.offer
                    ? listing.discountPrice.toLocaleString("en-IN")
                    : listing.regularPrice.toLocaleString("en-IN")}
                  {listing.type === "rent" && " / month"}
                </p>
                <button
                  onClick={() => onMarkerClick(listing._id)}
                  className="mt-2 text-xs bg-slate-700 text-white px-2 py-1 rounded hover:opacity-95"
                >
                  View Details
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
    </MapContainer>
  );
}

export default function Map() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [center, setCenter] = useState([28.6139, 77.2090]); // Default: New Delhi, India
  const navigate = useNavigate();

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        const res = await api.get("/api/listing/get?limit=50");
        const data = res.data;

        if (data && data.length > 0) {
          setListings(data);

          // Calculate center from listings if available
          const listingsWithLocation = data.filter(
            (listing) =>
              listing.location &&
              listing.location.coordinates &&
              listing.location.coordinates[0] !== 0 &&
              listing.location.coordinates[1] !== 0
          );

          if (listingsWithLocation.length > 0) {
            const avgLat =
              listingsWithLocation.reduce(
                (sum, listing) => sum + listing.location.coordinates[1],
                0
              ) / listingsWithLocation.length;
            const avgLng =
              listingsWithLocation.reduce(
                (sum, listing) => sum + listing.location.coordinates[0],
                0
              ) / listingsWithLocation.length;
            setCenter([avgLat, avgLng]);
          }
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching listings:", error);
        setError(true);
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  const handleMarkerClick = useCallback((listingId) => {
    navigate(`/listing/${listingId}`);
  }, [navigate]);

  const handleListingClick = useCallback((listingId) => {
    navigate(`/listing/${listingId}`);
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-xl">Loading map...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-xl text-red-500">Error loading map data</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-screen">
      {/* Listings Sidebar */}
      <div className="w-full md:w-1/3 overflow-y-auto p-4 bg-white border-r">
        <h1 className="text-2xl font-semibold mb-4">Property Listings</h1>
        {listings.length === 0 ? (
          <p className="text-gray-500">No listings found</p>
        ) : (
          <div className="space-y-4">
            {listings.map((listing) => (
              <div
                key={listing._id}
                className="border rounded-lg p-3 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleListingClick(listing._id)}
              >
                <ListingItem listing={listing} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Map */}
      <div className="w-full md:w-2/3 h-screen">
        {GOOGLE_MAPS_API_KEY ? (
          <GoogleMapView
            listings={listings}
            center={center}
            onMarkerClick={handleMarkerClick}
          />
        ) : (
          <LeafletMapView
            listings={listings}
            center={center}
            onMarkerClick={handleMarkerClick}
          />
        )}
      </div>
    </div>
  );
}
