import axios from "axios";

/**
 * Geocode an address to get latitude and longitude
 * Uses OpenStreetMap Nominatim API (free, no API key required)
 * For production, consider using Google Geocoding API for better accuracy
 */
export const geocodeAddress = async (address) => {
  try {
    // Using OpenStreetMap Nominatim API (free, no key required)
    const response = await axios.get("https://nominatim.openstreetmap.org/search", {
      params: {
        q: address,
        format: "json",
        limit: 1,
      },
      headers: {
        "User-Agent": "MERN-Real-Estate-App", // Required by Nominatim
      },
    });

    if (response.data && response.data.length > 0) {
      const { lat, lon } = response.data[0];
      return {
        latitude: parseFloat(lat),
        longitude: parseFloat(lon),
      };
    }

    // Fallback: return null if geocoding fails
    return null;
  } catch (error) {
    console.error("Geocoding error:", error.message);
    return null;
  }
};

/**
 * Alternative: Google Geocoding API (requires API key)
 * Uncomment and use if you have Google API key
 */
/*
export const geocodeAddressGoogle = async (address) => {
  try {
    const response = await axios.get("https://maps.googleapis.com/maps/api/geocode/json", {
      params: {
        address: address,
        key: process.env.GOOGLE_MAPS_API_KEY,
      },
    });

    if (response.data.status === "OK" && response.data.results.length > 0) {
      const location = response.data.results[0].geometry.location;
      return {
        latitude: location.lat,
        longitude: location.lng,
      };
    }

    return null;
  } catch (error) {
    console.error("Google Geocoding error:", error.message);
    return null;
  }
};
*/

