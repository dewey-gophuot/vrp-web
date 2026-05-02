import React, { useMemo, useState } from 'react';
import { AlertCircle, Locate, Minus, Plus } from 'lucide-react';
import { isMapProviderConfigured, mapProvider, type LatLng, type MapMarker } from '../api/mapProvider';

type ProviderMapProps = {
  center?: LatLng;
  zoom?: number;
  markers?: MapMarker[];
  className?: string;
};

const TILE_SIZE = 256;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function lngToTileX(lng: number, zoom: number) {
  return ((lng + 180) / 360) * Math.pow(2, zoom);
}

function latToTileY(lat: number, zoom: number) {
  const rad = (lat * Math.PI) / 180;
  return ((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) * Math.pow(2, zoom);
}

function tileToLng(x: number, zoom: number) {
  return (x / Math.pow(2, zoom)) * 360 - 180;
}

function tileToLat(y: number, zoom: number) {
  const n = Math.PI - (2 * Math.PI * y) / Math.pow(2, zoom);
  return (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
}

export default function ProviderMap({ center = mapProvider.defaultCenter, zoom = mapProvider.defaultZoom, markers = [], className = '' }: ProviderMapProps) {
  const [currentZoom, setCurrentZoom] = useState(clamp(zoom, mapProvider.minZoom, mapProvider.maxZoom));
  const [currentCenter, setCurrentCenter] = useState(center);

  const tileData = useMemo(() => {
    const centerX = lngToTileX(currentCenter.lng, currentZoom);
    const centerY = latToTileY(currentCenter.lat, currentZoom);
    const baseX = Math.floor(centerX) - 2;
    const baseY = Math.floor(centerY) - 2;
    const offsetX = (centerX - Math.floor(centerX)) * TILE_SIZE;
    const offsetY = (centerY - Math.floor(centerY)) * TILE_SIZE;
    const tiles = [];

    for (let row = 0; row < 5; row += 1) {
      for (let col = 0; col < 5; col += 1) {
        const x = baseX + col;
        const y = baseY + row;
        tiles.push({ x, y, col, row, url: mapProvider.getTileUrl(x, y, currentZoom) });
      }
    }

    return { baseX, baseY, offsetX, offsetY, tiles };
  }, [currentCenter, currentZoom]);

  const projectedMarkers = markers.map(marker => {
    const x = (lngToTileX(marker.lng, currentZoom) - tileData.baseX) * TILE_SIZE - tileData.offsetX;
    const y = (latToTileY(marker.lat, currentZoom) - tileData.baseY) * TILE_SIZE - tileData.offsetY;
    return { ...marker, x, y };
  });

  const handleNudge = (dx: number, dy: number) => {
    const centerX = lngToTileX(currentCenter.lng, currentZoom) + dx;
    const centerY = latToTileY(currentCenter.lat, currentZoom) + dy;
    setCurrentCenter({ lat: tileToLat(centerY, currentZoom), lng: tileToLng(centerX, currentZoom) });
  };

  return (
    <div className={`relative overflow-hidden bg-surface-container-high ${className}`}>
      {!isMapProviderConfigured && (
        <div className="absolute left-1/2 top-6 z-30 -translate-x-1/2 rounded-2xl border border-warning/20 bg-warning/10 px-4 py-3 text-sm font-semibold text-on-surface shadow-lg backdrop-blur-md flex items-center gap-2">
          <AlertCircle size={16} className="text-warning" /> Missing VITE_LOCATIONIQ_API_KEY
        </div>
      )}

      <div className="absolute left-1/2 top-1/2 h-[1280px] w-[1280px] -translate-x-1/2 -translate-y-1/2">
        {tileData.tiles.map(tile => (
          <img
            key={`${currentZoom}-${tile.x}-${tile.y}`}
            src={tile.url}
            alt=""
            className="absolute select-none object-cover"
            style={{
              left: tile.col * TILE_SIZE - tileData.offsetX,
              top: tile.row * TILE_SIZE - tileData.offsetY,
              width: TILE_SIZE + 2,
              height: TILE_SIZE + 2,
            }}
            draggable={false}
          />
        ))}
      </div>

      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/10 pointer-events-none" />

      {projectedMarkers.map(marker => (
        <div
          key={marker.id}
          className="absolute z-20 -translate-x-1/2 -translate-y-full flex flex-col items-center gap-1"
          style={{ left: `calc(50% - 640px + ${marker.x}px)`, top: `calc(50% - 640px + ${marker.y}px)` }}
        >
          {marker.label && <span className="rounded-full bg-surface-container-lowest/95 px-2.5 py-1 text-[10px] font-bold text-on-surface shadow-md border border-outline-variant/20 whitespace-nowrap">{marker.label}</span>}
          <span className={`h-4 w-4 rounded-full border-2 border-white shadow-lg ${marker.color || 'bg-primary'}`} />
        </div>
      ))}

      <div className="absolute left-8 top-8 flex flex-col gap-3 z-30">
        <div className="flex flex-col rounded-2xl glass-panel p-1.5">
          <button type="button" onClick={() => setCurrentZoom(z => clamp(z + 1, mapProvider.minZoom, mapProvider.maxZoom))} className="p-2.5 hover:bg-surface-container rounded-xl text-on-surface transition-colors"><Plus size={20} /></button>
          <div className="h-px bg-outline-variant/20 mx-3 my-1" />
          <button type="button" onClick={() => setCurrentZoom(z => clamp(z - 1, mapProvider.minZoom, mapProvider.maxZoom))} className="p-2.5 hover:bg-surface-container rounded-xl text-on-surface transition-colors"><Minus size={20} /></button>
        </div>
        <button type="button" onClick={() => setCurrentCenter(center)} className="w-12 h-12 flex items-center justify-center rounded-2xl glass-panel text-on-surface hover:bg-surface-container transition-colors"><Locate size={20} /></button>
      </div>

      <div className="absolute bottom-4 left-4 z-30 rounded-full bg-surface-container-lowest/90 px-3 py-1.5 text-[10px] font-semibold text-on-surface-variant shadow-sm border border-outline-variant/20">
        {mapProvider.attribution}
      </div>

      <div className="absolute bottom-4 right-4 z-30 grid grid-cols-3 gap-1 rounded-2xl glass-panel p-2 text-on-surface">
        <span />
        <button type="button" onClick={() => handleNudge(0, -0.4)} className="h-8 w-8 rounded-lg hover:bg-surface-container">↑</button>
        <span />
        <button type="button" onClick={() => handleNudge(-0.4, 0)} className="h-8 w-8 rounded-lg hover:bg-surface-container">←</button>
        <button type="button" onClick={() => setCurrentCenter(center)} className="h-8 w-8 rounded-lg hover:bg-surface-container text-xs font-bold">•</button>
        <button type="button" onClick={() => handleNudge(0.4, 0)} className="h-8 w-8 rounded-lg hover:bg-surface-container">→</button>
        <span />
        <button type="button" onClick={() => handleNudge(0, 0.4)} className="h-8 w-8 rounded-lg hover:bg-surface-container">↓</button>
        <span />
      </div>
    </div>
  );
}
