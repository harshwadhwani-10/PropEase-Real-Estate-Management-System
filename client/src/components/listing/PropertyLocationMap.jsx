import { useEffect, useState, useMemo, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";
import { Link } from "react-router-dom";
import L from "leaflet";
import { MapPin } from "lucide-react";
import api from "../../utils/api";
import MapListPopup from "../Map/MapListPopup.jsx";

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Custom marker icon for current property
const createCurrentPropertyIcon = () => {
  return L.divIcon({
    html: `
      <div style="
        width: 50px;
        height: 50px;
        background: #F6AD55;
        border: 4px solid white;
        border-radius: 50%;
        box-shadow: 0 4px 12px rgba(0,0,0,0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        color: white;
        font-size: 20px;
      ">📍</div>
    `,
    className: "current-property-marker",
    iconSize: [50, 50],
    iconAnchor: [25, 50],
  });
};

// Custom marker icon for nearby properties
const createNearbyPropertyIcon = (price, type) => {
  const priceText =
    price >= 1000000
      ? `₹${(price / 1000000).toFixed(1)}M`
      : price >= 1000
      ? `₹${(price / 1000).toFixed(0)}K`
      : `₹${price}`;

  const color =
    type === "rent"
      ? "#10B981" // Green for rent
      : type === "commercial"
      ? "#9333EA" // Purple for commercial
      : "#3B82F6"; // Blue for sale

  const svg = `
    <svg width="48" height="48" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="22" fill="${color}" stroke="#FFFFFF" stroke-width="3"/>
      <text x="24" y="28" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#FFFFFF" text-anchor="middle">${priceText}</text>
    </svg>
  `;

  return L.divIcon({
    html: svg,
    className: "nearby-property-marker",
    iconSize: [48, 48],
    iconAnchor: [24, 48],
  });
};

// Component to set initial map view (only once, not on every change)
function MapInitializer({ center, zoom }) {
  const map = useMap();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (center && zoom && !initialized && map) {
      map.setView(center, zoom);
      setInitialized(true);
    }
  }, [map, center, zoom, initialized]);

  return null;
}

// Component to track zoom level
function ZoomTracker({ onZoomChange }) {
  const map = useMap();
  useMapEvents({
    zoomend: () => {
      if (onZoomChange) {
        onZoomChange(map.getZoom());
      }
    },
  });
  return null;
}

// Helper function to find nearby markers within pixel distance
function findNearbyMarkers(clickedListing, allListings, map, pixelRadius = 50) {
  if (!map || !clickedListing) return [clickedListing];

  const clickedLat = clickedListing.location.coordinates[1];
  const clickedLng = clickedListing.location.coordinates[0];
  const clickedPoint = map.latLngToContainerPoint([clickedLat, clickedLng]);

  const nearbyListings = [clickedListing];

  allListings.forEach((listing) => {
    if (listing._id === clickedListing._id) return;

    const listingLat = listing.location.coordinates[1];
    const listingLng = listing.location.coordinates[0];
    const listingPoint = map.latLngToContainerPoint([listingLat, listingLng]);

    // Calculate pixel distance
    const distance = Math.sqrt(
      Math.pow(clickedPoint.x - listingPoint.x, 2) +
        Math.pow(clickedPoint.y - listingPoint.y, 2)
    );

    if (distance <= pixelRadius) {
      nearbyListings.push(listing);
    }
  });

  return nearbyListings;
}

export default function PropertyLocationMap({ listing }) {
  const [nearbyListings, setNearbyListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState(null);
  const [mapZoom, setMapZoom] = useState(15);
  const [currentZoom, setCurrentZoom] = useState(15);
  const [clickedMarkerData, setClickedMarkerData] = useState(null);
  const [mapInstance, setMapInstance] = useState(null);
  const listPopupRef = useRef(null);
  const hasFetchedRef = useRef(false);
  const hasInitializedMapRef = useRef(false);

  // Memoize property coordinates to prevent infinite loops
  const propertyCoords = useMemo(() => {
    if (
      listing?.location?.coordinates &&
      listing.location.coordinates.length === 2 &&
      listing.location.coordinates[0] !== 0 &&
      listing.location.coordinates[1] !== 0
    ) {
      return [listing.location.coordinates[1], listing.location.coordinates[0]]; // [lat, lng]
    }
    return null;
  }, [
    listing?.location?.coordinates?.[0],
    listing?.location?.coordinates?.[1],
  ]);

  // Get user's current location on component mount (for context, but prioritize property location)
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
        },
        (error) => {
          console.log("Geolocation error:", error);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      );
    }
  }, []);

  // Set initial map center - prioritize property location, fallback to user location or default
  // Only set once to prevent infinite loops
  useEffect(() => {
    if (hasInitializedMapRef.current) return; // Already initialized, don't update again

    if (propertyCoords) {
      // Show property location
      setMapCenter(propertyCoords);
      setMapZoom(15);
      hasInitializedMapRef.current = true;
    } else if (userLocation) {
      // Show user's current location if no property location
      setMapCenter(userLocation);
      setMapZoom(12);
      hasInitializedMapRef.current = true;
    } else {
      // Default fallback - wait a bit for geolocation, then set default
      const timer = setTimeout(() => {
        if (!hasInitializedMapRef.current) {
          setMapCenter([23.2156, 72.6369]); // Default: Gandhinagar
          setMapZoom(12);
          hasInitializedMapRef.current = true;
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [propertyCoords, userLocation]);

  // Fetch nearby properties - only once per listing
  useEffect(() => {
    // Prevent multiple fetches
    if (hasFetchedRef.current || !propertyCoords || !listing?._id) {
      if (!propertyCoords) {
        setLoading(false);
      }
      return;
    }

    const fetchNearbyProperties = async () => {
      hasFetchedRef.current = true;

      try {
        // Fetch approved listings within a reasonable radius
        const res = await api.get(`/api/listing/get?status=approved&limit=50`);
        const allListings = res.data || [];

        // Filter listings with valid coordinates and exclude current listing
        const validListings = allListings.filter(
          (l) =>
            l._id !== listing._id &&
            l.location &&
            l.location.coordinates &&
            l.location.coordinates.length === 2 &&
            l.location.coordinates[0] !== 0 &&
            l.location.coordinates[1] !== 0
        );

        // Calculate distance and sort by proximity (simple distance calculation)
        const listingsWithDistance = validListings.map((l) => {
          const lat1 = propertyCoords[0];
          const lon1 = propertyCoords[1];
          const lat2 = l.location.coordinates[1];
          const lon2 = l.location.coordinates[0];

          // Haversine formula for distance calculation
          const R = 6371; // Earth's radius in km
          const dLat = ((lat2 - lat1) * Math.PI) / 180;
          const dLon = ((lon2 - lon1) * Math.PI) / 180;
          const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((lat1 * Math.PI) / 180) *
              Math.cos((lat2 * Math.PI) / 180) *
              Math.sin(dLon / 2) *
              Math.sin(dLon / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          const distance = R * c;

          return { ...l, distance };
        });

        // Sort by distance and take closest 10
        const nearby = listingsWithDistance
          .sort((a, b) => a.distance - b.distance)
          .slice(0, 10);

        setNearbyListings(nearby);
      } catch (error) {
        console.error("Error fetching nearby properties:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNearbyProperties();
  }, [listing?._id, propertyCoords]);

  // Reset flags when listing changes
  useEffect(() => {
    hasFetchedRef.current = false;
    hasInitializedMapRef.current = false;
    setMapCenter(null); // Reset map center so it can be reinitialized
    setClickedMarkerData(null); // Reset clicked marker data
  }, [listing?._id]);

  // Open list popup when marker data is set
  useEffect(() => {
    if (
      clickedMarkerData &&
      clickedMarkerData.listings.length > 1 &&
      listPopupRef.current
    ) {
      // Small delay to ensure marker is rendered
      const timer = setTimeout(() => {
        if (listPopupRef.current) {
          listPopupRef.current.openPopup();
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [clickedMarkerData]);

  if (!propertyCoords) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <MapPin className="w-6 h-6 text-[#2A4365]" />
          Property Location
        </h2>
        <p className="text-gray-600">
          Location information not available for this property.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 lg:p-8 border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <MapPin className="w-6 h-6 text-[#2A4365]" />
        Property Location
      </h2>
      <p className="text-gray-600 mb-4">
        Here is the property location. Zoom out to see other properties in the
        area.
      </p>

      <div className="relative h-96 rounded-xl overflow-hidden border border-gray-200">
        {mapCenter && (
          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            style={{ height: "100%", width: "100%" }}
            scrollWheelZoom={true}
            zoomControl={true}
            dragging={true}
            touchZoom={true}
            doubleClickZoom={true}
            key={listing?._id || "map"} // Only remount when listing changes
            whenReady={({ target }) => setMapInstance(target)}
          >
            <MapInitializer center={mapCenter} zoom={mapZoom} />
            <ZoomTracker onZoomChange={setCurrentZoom} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Current Property Marker */}
            <Marker
              position={propertyCoords}
              icon={createCurrentPropertyIcon()}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-bold text-sm mb-1 text-gray-900">
                    {listing.name}
                  </h3>
                  <p className="text-xs text-gray-600 mb-2">
                    {listing.address}
                  </p>
                  <p className="text-sm font-bold text-[#2A4365]">
                    ₹
                    {(listing.offer
                      ? listing.discountPrice
                      : listing.regularPrice
                    ).toLocaleString("en-IN")}
                    {listing.type === "rent" && " / month"}
                  </p>
                  <p className="text-xs text-orange-600 mt-1 font-semibold">
                    📍 This Property
                  </p>
                </div>
              </Popup>
            </Marker>

            {/* Nearby Properties Markers */}
            {!loading &&
              nearbyListings.map((nearbyListing) => {
                const nearbyCoords = [
                  nearbyListing.location.coordinates[1],
                  nearbyListing.location.coordinates[0],
                ];
                const price = nearbyListing.offer
                  ? nearbyListing.discountPrice
                  : nearbyListing.regularPrice;

                return (
                  <Marker
                    key={nearbyListing._id}
                    position={nearbyCoords}
                    icon={createNearbyPropertyIcon(price, nearbyListing.type)}
                    eventHandlers={{
                      click: (e) => {
                        if (!mapInstance) return;

                        const zoom = mapInstance.getZoom();

                        // If zoomed in enough (>= 13), show individual popup
                        if (zoom >= 13) {
                          e.target.openPopup();
                          setClickedMarkerData(null);
                          return;
                        }

                        // If zoomed out, check for nearby markers
                        // Include current listing in the search (convert to same format)
                        const currentListingForSearch = {
                          ...listing,
                          location: listing.location,
                        };
                        const allNearbyListings = [
                          currentListingForSearch,
                          ...nearbyListings,
                        ];
                        const nearbyMarkers = findNearbyMarkers(
                          nearbyListing,
                          allNearbyListings,
                          mapInstance,
                          60
                        );

                        // If multiple markers nearby, show list popup
                        if (nearbyMarkers.length > 1) {
                          const listPosition = [
                            nearbyListing.location.coordinates[1],
                            nearbyListing.location.coordinates[0],
                          ];

                          setClickedMarkerData({
                            listings: nearbyMarkers,
                            position: listPosition,
                          });

                          // Close any open individual popups
                          mapInstance.eachLayer((layer) => {
                            if (
                              layer instanceof L.Marker &&
                              layer.isPopupOpen()
                            ) {
                              layer.closePopup();
                            }
                          });
                        } else {
                          // Single marker, show individual popup
                          e.target.openPopup();
                          setClickedMarkerData(null);
                        }
                      },
                    }}
                  >
                    <Popup>
                      <div className="p-2 max-w-xs">
                        <img
                          src={
                            nearbyListing.imageUrls?.[0] ||
                            "https://via.placeholder.com/300"
                          }
                          alt={nearbyListing.name}
                          className="w-full h-24 object-cover rounded-lg mb-2"
                        />
                        <h3 className="font-bold text-sm mb-1 text-gray-900 line-clamp-1">
                          {nearbyListing.name}
                        </h3>
                        <p className="text-xs text-gray-600 mb-2 line-clamp-1">
                          {nearbyListing.address}
                        </p>
                        <p className="text-sm font-bold text-[#2A4365] mb-2">
                          ₹{price.toLocaleString("en-IN")}
                          {nearbyListing.type === "rent" && " / month"}
                        </p>
                        <Link
                          to={`/listing/${nearbyListing._id}`}
                          className="block w-full bg-[#2A4365] text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-[#1e2f47] transition-colors text-center"
                        >
                          View Details
                        </Link>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}

            {/* List Popup for Clustered Markers */}
            {clickedMarkerData && clickedMarkerData.listings.length > 1 && (
              <Marker
                position={clickedMarkerData.position}
                icon={L.divIcon({
                  className: "hidden",
                  iconSize: [0, 0],
                  iconAnchor: [0, 0],
                })}
                ref={listPopupRef}
              >
                <Popup
                  closeButton={true}
                  className="custom-popup"
                  autoPan={true}
                  autoPanPadding={[50, 50]}
                  onClose={() => setClickedMarkerData(null)}
                >
                  <MapListPopup
                    listings={clickedMarkerData.listings}
                    onNavigate={(listingId) => {
                      window.location.href = `/listing/${listingId}`;
                    }}
                  />
                </Popup>
              </Marker>
            )}
          </MapContainer>
        )}
      </div>
    </div>
  );
}
