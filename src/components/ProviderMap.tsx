import React, { useEffect, useRef } from 'react';
import { AlertCircle } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import {
  activeMapProvider,
  isMapProviderConfigured,
  paletteColor,
  resolveColor,
  type DepotMarker,
  type LatLng,
  type MapMarker,
  type MapRoute,
} from '../api/mapProvider';

type ProviderMapProps = {
  center?: LatLng;
  zoom?: number;
  markers?: MapMarker[];
  /** Optional polylines (delivery routes) drawn over the map. */
  routes?: MapRoute[];
  /** Depot / origin shown with a distinct home icon. */
  depot?: DepotMarker | null;
  /** Group nearby markers into clusters (good for 100+ points). */
  cluster?: boolean;
  /** Auto fit the viewport to all content. Defaults to true. */
  fitToContent?: boolean;
  className?: string;
  /** Called when the user clicks an empty spot on the map. */
  onMapClick?: (p: LatLng) => void;
  /** Called after a draggable marker is dropped. */
  onMarkerDragEnd?: (id: string, p: LatLng) => void;
};

function markerIcon(color: string, order?: number) {
  const inner = order != null ? `<span class="vrp-marker__num">${order}</span>` : '';
  return L.divIcon({
    className: 'vrp-marker',
    html: `<span class="vrp-marker__dot" style="background:${color}">${inner}</span>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -14],
  });
}

function depotIcon() {
  return L.divIcon({
    className: 'vrp-depot',
    html: `<span class="vrp-depot__pin">🏠</span>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -18],
  });
}

export default function ProviderMap({
  center = activeMapProvider.defaultCenter,
  zoom = activeMapProvider.defaultZoom,
  markers = [],
  routes = [],
  depot = null,
  cluster = false,
  fitToContent = true,
  className = '',
  onMapClick,
  onMarkerDragEnd,
}: ProviderMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const overlayRef = useRef<L.LayerGroup | null>(null);
  const clusterRef = useRef<L.MarkerClusterGroup | null>(null);
  // Keep latest callbacks without re-initialising the map.
  const onMapClickRef = useRef(onMapClick);
  const onMarkerDragEndRef = useRef(onMarkerDragEnd);
  onMapClickRef.current = onMapClick;
  onMarkerDragEndRef.current = onMarkerDragEnd;

  // Initialise the Leaflet map once.
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [center.lat, center.lng],
      zoom,
      minZoom: activeMapProvider.minZoom,
      maxZoom: activeMapProvider.maxZoom,
    });

    L.tileLayer(activeMapProvider.tileUrlTemplate, {
      attribution: activeMapProvider.attribution,
      maxZoom: activeMapProvider.maxZoom,
    }).addTo(map);

    L.control.scale({ imperial: false, position: 'bottomleft' }).addTo(map);

    overlayRef.current = L.layerGroup().addTo(map);
    map.on('click', (e: L.LeafletMouseEvent) => {
      onMapClickRef.current?.({ lat: e.latlng.lat, lng: e.latlng.lng });
    });
    mapRef.current = map;

    requestAnimationFrame(() => map.invalidateSize());

    return () => {
      map.remove();
      mapRef.current = null;
      overlayRef.current = null;
      clusterRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-draw markers, routes and depot whenever the data changes.
  useEffect(() => {
    const map = mapRef.current;
    const overlay = overlayRef.current;
    if (!map || !overlay) return;

    overlay.clearLayers();
    if (clusterRef.current) {
      map.removeLayer(clusterRef.current);
      clusterRef.current = null;
    }

    const bounds = L.latLngBounds([]);

    // Routes (prefer road-following geometry, fall back to straight points).
    routes.forEach((route, routeIdx) => {
      const source = route.geometry && route.geometry.length >= 2 ? route.geometry : route.points;
      const pts = source
        .filter(p => Number.isFinite(p.lat) && Number.isFinite(p.lng))
        .map(p => [p.lat, p.lng] as [number, number]);
      if (pts.length < 2) return;

      const color = resolveColor(route.color, paletteColor(routeIdx));
      L.polyline(pts, { color, weight: 4, opacity: 0.85, lineJoin: 'round' })
        .addTo(overlay)
        .bindTooltip(route.label || `Route ${routeIdx + 1}`, { sticky: true });
      pts.forEach(p => bounds.extend(p));
    });

    // Depot.
    if (depot && Number.isFinite(depot.lat) && Number.isFinite(depot.lng)) {
      L.marker([depot.lat, depot.lng], { icon: depotIcon(), zIndexOffset: 1000 })
        .addTo(overlay)
        .bindPopup(`<strong>${depot.label || 'Depot'}</strong>`)
        .bindTooltip(depot.label || 'Depot', { direction: 'top', offset: [0, -16] });
      bounds.extend([depot.lat, depot.lng]);
    }

    // Stop markers (optionally clustered).
    const target: L.LayerGroup = cluster
      ? (clusterRef.current = L.markerClusterGroup({ maxClusterRadius: 48, showCoverageOnHover: false }))
      : overlay;

    markers.forEach((marker, idx) => {
      if (!Number.isFinite(marker.lat) || !Number.isFinite(marker.lng)) return;
      const color = resolveColor(marker.color, paletteColor(idx));
      const m = L.marker([marker.lat, marker.lng], {
        icon: markerIcon(color, marker.order ?? (marker.label ? undefined : idx + 1)),
        draggable: Boolean(marker.draggable),
      });

      const popupLines = [
        marker.label ? `<strong>${marker.label}</strong>` : '',
        marker.description ? `<span>${marker.description}</span>` : '',
      ].filter(Boolean);
      if (popupLines.length) m.bindPopup(popupLines.join('<br/>'));
      if (marker.label) m.bindTooltip(marker.label, { direction: 'top', offset: [0, -12] });

      if (marker.draggable) {
        m.on('dragend', () => {
          const { lat, lng } = m.getLatLng();
          onMarkerDragEndRef.current?.(marker.id, { lat, lng });
        });
      }

      m.addTo(target);
      bounds.extend([marker.lat, marker.lng]);
    });

    if (cluster && clusterRef.current) map.addLayer(clusterRef.current);

    if (fitToContent && bounds.isValid()) {
      map.fitBounds(bounds, { padding: [48, 48], maxZoom: 16 });
    } else {
      map.setView([center.lat, center.lng], zoom);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markers, routes, depot, cluster, center.lat, center.lng, zoom, fitToContent]);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {!isMapProviderConfigured && (
        <div className="absolute left-1/2 top-6 z-[1000] -translate-x-1/2 rounded-2xl border border-warning/20 bg-warning/10 px-4 py-3 text-sm font-semibold text-on-surface shadow-lg backdrop-blur-md flex items-center gap-2">
          <AlertCircle size={16} className="text-warning" /> Missing VITE_LOCATIONIQ_API_KEY — using OpenStreetMap
        </div>
      )}
      <div ref={containerRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
