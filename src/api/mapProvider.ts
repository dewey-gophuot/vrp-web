export type LatLng = {
  lat: number;
  lng: number;
};

export type MapMarker = LatLng & {
  id: string;
  label?: string;
  color?: string;
};

export type MapProvider = {
  name: string;
  attribution: string;
  defaultCenter: LatLng;
  defaultZoom: number;
  minZoom: number;
  maxZoom: number;
  getTileUrl: (x: number, y: number, z: number) => string;
};

const locationIqKey = import.meta.env.VITE_LOCATIONIQ_API_KEY || import.meta.env.LOCATIONIQ_API_KEY || '';

export const locationIqMapProvider: MapProvider = {
  name: 'locationiq',
  attribution: '© LocationIQ © OpenStreetMap contributors',
  defaultCenter: { lat: 10.7769, lng: 106.7009 },
  defaultZoom: 12,
  minZoom: 2,
  maxZoom: 18,
  getTileUrl: (x, y, z) => `https://tiles.locationiq.com/v3/streets/r/${z}/${x}/${y}.png?key=${encodeURIComponent(locationIqKey)}`,
};

export const mapProvider = locationIqMapProvider;

export const isMapProviderConfigured = Boolean(locationIqKey);
