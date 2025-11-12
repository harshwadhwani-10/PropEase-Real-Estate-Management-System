import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { useMap } from "react-leaflet";
import { GeoSearchControl, OpenStreetMapProvider } from "leaflet-geosearch";
import "leaflet-geosearch/dist/geosearch.css";

export default function MapSearchBar({ onLocationSelect, placeholder = "Search locations or societies..." }) {
  const map = useMap();
  const [searchControl, setSearchControl] = useState(null);
  const [isSearchActive, setIsSearchActive] = useState(false);

  useEffect(() => {
    if (!map) return;

    const provider = new OpenStreetMapProvider();
    const control = new GeoSearchControl({
      provider,
      style: "bar",
      showMarker: false,
      showPopup: false,
      maxMarkers: 1,
      retainZoomLevel: false,
      animateZoom: true,
      autoClose: true,
      searchLabel: placeholder,
      keepResult: true,
      position: "topleft",
    });

    map.addControl(control);
    setSearchControl(control);

    // Handle search result
    const handleSearchResult = (e) => {
      const { location } = e;
      if (onLocationSelect) {
        onLocationSelect({ lat: location.y, lng: location.x });
      }
      // Animate map to searched location
      map.setView([location.y, location.x], 15, { animate: true, duration: 1 });
    };

    map.on("geosearch/showlocation", handleSearchResult);

    return () => {
      map.removeControl(control);
      map.off("geosearch/showlocation", handleSearchResult);
    };
  }, [map, onLocationSelect, placeholder]);

  return null;
}

