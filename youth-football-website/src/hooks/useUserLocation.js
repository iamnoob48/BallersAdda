import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "ballersadda_user_location";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

function getCachedLocation() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Date.now() - parsed.timestamp > CACHE_TTL_MS) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function setCachedLocation(data) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ ...data, timestamp: Date.now() })
  );
}

async function reverseGeocode(lat, lon) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`,
    { headers: { "Accept-Language": "en" } }
  );
  if (!res.ok) throw new Error("Geocode failed");
  const data = await res.json();
  const addr = data.address || {};
  return {
    city:
      addr.city ||
      addr.town ||
      addr.village ||
      addr.county ||
      addr.state_district ||
      "",
    state: addr.state || "",
    country: addr.country || "",
    lat,
    lon,
  };
}

export default function useUserLocation() {
  const [location, setLocation] = useState(getCachedLocation);
  const [status, setStatus] = useState(
    getCachedLocation() ? "resolved" : "idle"
  );
  const [error, setError] = useState(null);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setStatus("error");
      setError("Geolocation not supported");
      return;
    }

    setStatus("requesting");
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          setStatus("geocoding");
          const result = await reverseGeocode(
            pos.coords.latitude,
            pos.coords.longitude
          );
          setCachedLocation(result);
          setLocation(result);
          setStatus("resolved");
        } catch (e) {
          setStatus("error");
          setError("Could not determine city");
        }
      },
      (err) => {
        setStatus("error");
        setError(
          err.code === 1
            ? "Location permission denied"
            : "Could not get location"
        );
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  }, []);

  const clearLocation = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setLocation(null);
    setStatus("idle");
    setError(null);
  }, []);

  return { location, status, error, requestLocation, clearLocation };
}
