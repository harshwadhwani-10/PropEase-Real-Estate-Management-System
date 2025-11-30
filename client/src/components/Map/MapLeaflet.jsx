import { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import MapPopup from "./MapPopup.jsx";
import MapListPopup from "./MapListPopup.jsx";
import MapSearchBar from "./MapSearchBar.jsx";
import { RecenterButtonInner } from "./RecenterButton.jsx";

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Create custom marker icons with pin shape and price badge
const createCustomIcon = (price, type, isHighlighted = false) => {
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

  const pinWidth = isHighlighted ? 40 : 36;
  const pinHeight = isHighlighted ? 55 : 50;
  const fontSize = 9;

  const svg = `
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
            stroke-width="2.5"
            style="filter: ${
              isHighlighted ? "drop-shadow(0 0 6px " + color + ")" : "none"
            };"/>
      <!-- Price badge circle on top -->
      <circle cx="${pinWidth / 2}" cy="${pinHeight * 0.2}" r="${
    pinWidth * 0.22
  }" fill="${color}" stroke="#FFFFFF" stroke-width="2"/>
      <text x="${pinWidth / 2}" y="${
    pinHeight * 0.25
  }" font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="bold" fill="#FFFFFF" text-anchor="middle">${priceText}</text>
    </svg>
  `;

  return L.divIcon({
    html: svg,
    className: `custom-marker ${isHighlighted ? "marker-highlighted" : ""}`,
    iconSize: [pinWidth, pinHeight + 5],
    iconAnchor: [pinWidth / 2, pinHeight + 5],
    popupAnchor: [0, -(pinHeight + 5)],
  });
};

// Component to update map view when center/zoom changes
function MapUpdater({ center, zoom, animate = true }) {
  const map = useMap();
  useEffect(() => {
    if (center && zoom !== undefined) {
      if (animate) {
        map.flyTo(center, zoom, {
          duration: 1,
        });
      } else {
        map.setView(center, zoom);
      }
    }
  }, [map, center, zoom, animate]);
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

export default function MapLeaflet({
  listings = [],
  center = [23.2156, 72.6369], // Default: Gandhinagar
  zoom = 12,
  onMarkerClick,
  selectedListingId = null,
  filters = { showRent: true, showSale: true, showCommercial: true },
  onBoundsChange,
  onSearchLocationSelect,
  initialCenter = [23.2156, 72.6369],
  onRecenter,
}) {
  const [map, setMap] = useState(null);
  const [currentZoom, setCurrentZoom] = useState(zoom);
  const [clickedMarkerData, setClickedMarkerData] = useState(null);
  const markerRefs = useRef({});
  const listPopupRef = useRef(null);

  // Filter listings based on type filters
  const filteredListings = listings.filter((listing) => {
    if (listing.type === "rent" && !filters.showRent) return false;
    if (listing.type === "sale" && !filters.showSale) return false;
    if (listing.type === "commercial" && !filters.showCommercial) return false;
    return true;
  });

  // Filter listings with valid coordinates
  const validListings = filteredListings.filter(
    (listing) =>
      listing.location &&
      listing.location.coordinates &&
      listing.location.coordinates.length === 2 &&
      listing.location.coordinates[0] !== 0 &&
      listing.location.coordinates[1] !== 0
  );

  // Handle map load
  const handleMapReady = (mapInstance) => {
    setMap(mapInstance);
    setCurrentZoom(mapInstance.getZoom());

    // Listen to bounds change
    if (onBoundsChange) {
      mapInstance.on("moveend", () => {
        const bounds = mapInstance.getBounds();
        onBoundsChange({
          north: bounds.getNorth(),
          south: bounds.getSouth(),
          east: bounds.getEast(),
          west: bounds.getWest(),
        });
      });
    }
  };

  // Handle marker click with clustering detection
  const handleMarkerClick = (e, clickedListing) => {
    if (!map) return;

    const zoom = map.getZoom();

    // If zoomed in enough (>= 13), show individual popup
    if (zoom >= 13) {
      e.target.openPopup();
      setClickedMarkerData(null);
      return;
    }

    // If zoomed out, check for nearby markers
    const nearbyListings = findNearbyMarkers(
      clickedListing,
      validListings,
      map,
      60
    );

    // If multiple markers nearby, show list popup
    if (nearbyListings.length > 1) {
      const listPosition = [
        clickedListing.location.coordinates[1],
        clickedListing.location.coordinates[0],
      ];

      setClickedMarkerData({
        listings: nearbyListings,
        position: listPosition,
      });

      // Close any open individual popups
      map.eachLayer((layer) => {
        if (layer instanceof L.Marker && layer.isPopupOpen()) {
          layer.closePopup();
        }
      });

      // The popup will be opened via useEffect when the marker is rendered
    } else {
      // Single marker, show individual popup
      e.target.openPopup();
      setClickedMarkerData(null);
    }
  };

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

  // Don't update marker icons on hover to prevent disappearing
  // Markers are created with the correct state initially

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
        whenReady={({ target }) => handleMapReady(target)}
        zoomControl={true}
      >
        <MapUpdater center={center} zoom={zoom} animate={true} />
        <ZoomTracker onZoomChange={setCurrentZoom} />
        {onSearchLocationSelect && (
          <MapSearchBar onLocationSelect={onSearchLocationSelect} />
        )}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Recenter Button (inside map context) */}
        {onRecenter && (
          <RecenterButtonInner
            center={initialCenter || center}
            zoom={12}
            onLocationUpdate={(location) => {
              // Update center when user location is found
              if (onSearchLocationSelect) {
                onSearchLocationSelect({ lat: location[0], lng: location[1] });
              }
            }}
          />
        )}

        {/* Property Markers */}
        {validListings.map((listing) => {
          const position = [
            listing.location.coordinates[1], // lat
            listing.location.coordinates[0], // lng
          ];

          const price = listing.offer
            ? listing.discountPrice
            : listing.regularPrice;
          const isSelected = selectedListingId === listing._id;

          return (
            <Marker
              key={listing._id}
              position={position}
              icon={createCustomIcon(price, listing.type, isSelected)}
              ref={(ref) => {
                if (ref) markerRefs.current[listing._id] = ref;
              }}
              eventHandlers={{
                click: (e) => {
                  handleMarkerClick(e, listing);
                },
              }}
            >
              <Popup
                closeButton={true}
                className="custom-popup"
                autoPan={true}
                autoPanPadding={[50, 50]}
              >
                <MapPopup listing={listing} onNavigate={onMarkerClick} />
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
                onNavigate={onMarkerClick}
              />
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
