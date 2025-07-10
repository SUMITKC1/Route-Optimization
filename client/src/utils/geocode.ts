export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;
  const res = await fetch(url, { headers: { 'User-Agent': 'RouteOptimizationApp/1.0' } });
  const data = await res.json();
  if (data && data.display_name) {
    return data.display_name;
  }
  return `(${lat.toFixed(4)}, ${lng.toFixed(4)})`;
} 