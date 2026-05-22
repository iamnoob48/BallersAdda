const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

async function nominatimSearch(q) {
  const url = `${NOMINATIM_URL}?${new URLSearchParams({
    q,
    format: "json",
    limit: "1",
    addressdetails: "0",
  })}`;

  const res = await fetch(url, {
    headers: {
      "User-Agent": "BallersAdda/1.0",
      "Accept-Language": "en",
    },
  });

  if (!res.ok) return null;
  const data = await res.json();
  if (!data.length) return null;

  return {
    latitude: parseFloat(data[0].lat),
    longitude: parseFloat(data[0].lon),
  };
}

export async function geocodeAddress({ address, city, state, country, pinCode }) {
  const queries = [
    [address, city, state, pinCode, country],
    [address, city, state, country],
    [city, state, country],
  ];

  for (const parts of queries) {
    const q = parts.filter(Boolean).join(", ");
    if (!q.trim()) continue;
    const result = await nominatimSearch(q);
    if (result) return result;
    await new Promise((r) => setTimeout(r, 1100));
  }

  return null;
}

export function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
