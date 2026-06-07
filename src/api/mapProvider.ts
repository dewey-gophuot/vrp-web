export type LatLng = {
  lat: number;
  lng: number;
};

export type MapMarker = LatLng & {
  id: string;
  label?: string;
  color?: string;
  /** Sequence number shown inside the marker (e.g. stop order). */
  order?: number;
  /** Extra line shown in the popup (e.g. address, ETA). */
  description?: string;
  /** Allow the user to drag this marker; emits onMarkerDragEnd. */
  draggable?: boolean;
  /** Arbitrary owner id (e.g. route id) used by drag-to-reassign. */
  groupId?: string;
};

/** A route drawn as a polyline connecting an ordered list of points. */
export type MapRoute = {
  id: string;
  points: LatLng[];
  /** Road-following geometry; drawn instead of `points` when present. */
  geometry?: LatLng[];
  color?: string;
  label?: string;
};

/** A depot / warehouse origin shown with a distinct icon. */
export type DepotMarker = LatLng & {
  id?: string;
  label?: string;
};

export type MapProvider = {
  name: string;
  attribution: string;
  defaultCenter: LatLng;
  defaultZoom: number;
  minZoom: number;
  maxZoom: number;
  getTileUrl: (x: number, y: number, z: number) => string;
  /** Leaflet-style URL template ({s}/{z}/{x}/{y}) for use with L.tileLayer. */
  tileUrlTemplate: string;
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
  tileUrlTemplate: `https://tiles.locationiq.com/v3/streets/r/{z}/{x}/{y}.png?key=${encodeURIComponent(locationIqKey)}`,
};

/** OpenStreetMap fallback so the map still renders when no LocationIQ key is set. */
export const osmFallbackProvider: MapProvider = {
  name: 'osm',
  attribution: '© OpenStreetMap contributors',
  defaultCenter: locationIqMapProvider.defaultCenter,
  defaultZoom: locationIqMapProvider.defaultZoom,
  minZoom: 2,
  maxZoom: 19,
  getTileUrl: (x, y, z) => `https://tile.openstreetmap.org/${z}/${x}/${y}.png`,
  tileUrlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
};

export const mapProvider = locationIqMapProvider;

export const isMapProviderConfigured = Boolean(locationIqKey);

/** Provider actually used for rendering — falls back to OSM when no key is configured. */
export const activeMapProvider: MapProvider = isMapProviderConfigured ? locationIqMapProvider : osmFallbackProvider;

/**
 * Resolve a color token (Tailwind `bg-*` class or a CSS color) into a concrete
 * CSS color usable by Leaflet (markers/polylines need real colors, not classes).
 */
const TAILWIND_COLOR_MAP: Record<string, string> = {
  'bg-primary': '#4f46e5',
  'bg-secondary': '#0891b2',
  'bg-tertiary': '#7c3aed',
  'bg-success': '#16a34a',
  'bg-warning': '#f59e0b',
  'bg-error': '#dc2626',
  'bg-info': '#2563eb',
};

const ROUTE_PALETTE = ['#4f46e5', '#f59e0b', '#16a34a', '#0891b2', '#dc2626', '#7c3aed'];

export function resolveColor(token?: string, fallback = '#4f46e5'): string {
  if (!token) return fallback;
  if (TAILWIND_COLOR_MAP[token]) return TAILWIND_COLOR_MAP[token];
  // Already a usable CSS color (hex, rgb(), hsl(), named color).
  if (/^#|^rgb|^hsl/.test(token)) return token;
  return fallback;
}

/** Pick a stable palette color by index (used when no explicit color is given). */
export function paletteColor(index: number): string {
  return ROUTE_PALETTE[index % ROUTE_PALETTE.length];
}
