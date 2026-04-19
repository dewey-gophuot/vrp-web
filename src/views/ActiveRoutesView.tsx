import React, { useState, useEffect } from 'react';
import { Map, Clock, AlertCircle, CheckCircle2, Navigation, MoreVertical, Truck } from 'lucide-react';
import api from '../api';

export default function ActiveRoutesView() {
  const [routes, setRoutes] = useState<any[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<any | null>(null);
  const [manifest, setManifest] = useState<any | null>(null);

  useEffect(() => {
    api.getActiveRoutes()
      .then(res => {
        setRoutes(res || []);
        if (res && res.length > 0) setSelectedRoute(res[0]);
      })
      .catch(console.error);
  }, []);

  // Load manifest when selected route changes
  useEffect(() => {
    if (!selectedRoute) { setManifest(null); return; }
    api.getRouteManifest(selectedRoute.route_id)
      .then(res => setManifest(res))
      .catch(() => setManifest(null));
  }, [selectedRoute?.route_id]);

  const isDelayed = selectedRoute?.status === 'delayed';
  const nextStop = selectedRoute?.next_stop;
  const manifestStops = manifest?.stops || [];

  return (
    <div className="flex-1 overflow-y-auto p-8 lg:p-12 bg-background flex flex-col h-full">
      {/* Header */}
      <div className="flex justify-between items-end mb-10 shrink-0">
        <div>
          <h2 className="text-on-surface font-headline text-3xl font-extrabold tracking-tight">Active Routes Monitoring</h2>
          <p className="text-on-surface-variant mt-2 text-sm">Real-time tracking of dispatched fleet and delivery progress.</p>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-2 bg-success/10 text-success px-4 py-2 rounded-lg font-bold text-sm">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
            Live Sync: Active
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 min-h-0">
        {/* Left Column - Route List */}
        <div className="lg:col-span-2 flex flex-col gap-6 overflow-hidden">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-on-surface">Currently Dispatched</h3>
            <div className="flex gap-2">
              <span className="text-xs font-bold bg-surface-container-high px-3 py-1.5 rounded-lg text-on-surface-variant">{routes.filter(r => r.status && r.status !== 'completed').length} Active</span>
              <span className="text-xs font-bold bg-error/10 px-3 py-1.5 rounded-lg text-error">{routes.filter(r => r.status === 'delayed').length} Delayed</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 space-y-4">
            {routes.length === 0 ? (
              <p className="text-on-surface-variant text-sm mt-4">No active routes currently.</p>
            ) : (
              routes.map(r => (
                <ActiveRouteCard 
                  key={r.route_id}
                  id={r.route_id} 
                  driver={r.driver_name} 
                  vehicle={r.vehicle_id} 
                  progress={r.progress_percentage} 
                  eta={r.next_stop?.eta || 'N/A'} 
                  nextStop={r.next_stop ? `${r.next_stop.name} (Stop ${r.next_stop.stop_index}/${r.next_stop.total_stops})` : 'Returned to Depot'}
                  status={r.status}
                  delay={r.delay_mins ? `${r.delay_mins} mins` : undefined}
                  isSelected={selectedRoute?.route_id === r.route_id}
                  onClick={() => setSelectedRoute(r)}
                />
              ))
            )}
          </div>
        </div>

        {/* Right Column - Selected Route Details */}
        <div className="flex flex-col gap-6">
          <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/10 overflow-hidden flex-1 flex flex-col">
            {/* Map Placeholder */}
            <div className="h-64 relative bg-surface-container-high shrink-0">
              <img 
                src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=800" 
                alt="Live Map" 
                className="w-full h-full object-cover opacity-70 mix-blend-multiply"
              />
              <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-md p-3 rounded-xl border border-outline-variant/20 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center text-primary">
                    <Navigation size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase text-on-surface-variant tracking-wider">Focus Target</p>
                    <p className="text-sm font-bold text-on-surface">{selectedRoute?.route_id || 'None'}</p>
                  </div>
                </div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-4 h-4 rounded-full bg-error border-2 border-white shadow-lg shadow-error/50"></div>
              </div>
            </div>

            {/* Selected Route Details */}
            <div className="p-6 flex flex-col gap-5 flex-1 overflow-y-auto">
              {selectedRoute ? (
                <>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-lg text-on-surface">Route Details</h4>
                      <span className={`text-xs font-bold px-2 py-1 rounded-md border ${
                        isDelayed 
                          ? 'text-error bg-error/10 border-error/20' 
                          : selectedRoute.status === 'completed'
                            ? 'text-success bg-success/10 border-success/20'
                            : 'text-primary bg-primary/10 border-primary/20'
                      }`}>
                        {selectedRoute.status === 'on-time' ? 'On Time' : selectedRoute.status?.charAt(0).toUpperCase() + selectedRoute.status?.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-on-surface-variant flex items-center gap-2">
                      <Truck size={14} /> {selectedRoute.vehicle_id} • {selectedRoute.driver_name}
                    </p>
                  </div>

                  {isDelayed && selectedRoute.delay_mins > 0 && (
                    <div className="bg-surface-container pl-4 py-3 pr-3 text-sm rounded-xl border-l-4 border-error flex items-start gap-3">
                      <AlertCircle size={18} className="text-error shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-on-surface">Delay Reported</p>
                        <p className="text-xs text-on-surface-variant mt-1">Impact: +{selectedRoute.delay_mins} minutes to route.</p>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col gap-3">
                    <h5 className="text-xs font-bold uppercase text-outline tracking-wider">
                      {manifestStops.length > 0 ? `Stops (${manifestStops.length})` : 'Next Destination'}
                    </h5>
                    
                    {manifestStops.length > 0 ? (
                      manifestStops.slice(0, 5).map((stop: any, idx: number) => (
                        <div key={stop.stop_id || idx} className="flex items-start gap-4 relative">
                          {idx < manifestStops.length - 1 && (
                            <div className="absolute left-2.5 top-5 bottom-[-20px] w-0.5 bg-outline-variant/30"></div>
                          )}
                          <div className={`w-5 h-5 rounded-full z-10 shrink-0 mt-0.5 flex items-center justify-center ${
                            stop.status === 'completed' 
                              ? 'bg-success' 
                              : idx === 0 
                                ? 'bg-primary border-[3px] border-surface-container-lowest' 
                                : 'border-2 border-outline-variant bg-surface-container-lowest'
                          }`}>
                            {stop.status === 'completed' && <CheckCircle2 size={10} className="text-white" />}
                          </div>
                          <div className={`p-3 rounded-xl flex-1 ${idx === 0 ? 'bg-surface-container-low border border-primary/20' : 'p-2'}`}>
                            <p className={`text-xs font-${idx === 0 ? 'bold' : 'medium'} text-on-surface`}>{stop.name || stop.stop_id}</p>
                            <p className="text-[11px] text-on-surface-variant mt-0.5">
                              {stop.address || ''} {stop.status && `• ${stop.status}`}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : nextStop ? (
                      <div className="flex items-start gap-4">
                        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center z-10 shrink-0 border-[3px] border-surface-container-lowest mt-0.5"></div>
                        <div className="bg-surface-container-low p-3 rounded-xl flex-1 border border-primary/20">
                          <p className="text-xs font-bold text-on-surface">{nextStop.name}</p>
                          <p className="text-[11px] text-on-surface-variant mt-1">
                            Stop {nextStop.stop_index}/{nextStop.total_stops}
                            {nextStop.eta && ` • ETA: ${nextStop.eta}`}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-on-surface-variant">No stop information available.</p>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center text-center py-12 text-on-surface-variant">
                  <Truck size={32} className="opacity-30 mb-3" />
                  <p className="text-sm font-bold">Select a route</p>
                  <p className="text-xs mt-1">Click on a route card to view details.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ActiveRouteCard({ id, driver, vehicle, progress, eta, nextStop, status, delay, isSelected, onClick }: any) {
  const isCompleted = status === 'completed';
  const isDelayed = status === 'delayed';

  const statusColor = isCompleted 
    ? 'text-success bg-success/10 border-success/20' 
    : isDelayed 
      ? 'text-error bg-error/10 border-error/20' 
      : 'text-primary bg-primary/10 border-primary/20';

  const progressColor = isCompleted ? 'bg-success' : isDelayed ? 'bg-error' : 'bg-primary';

  return (
    <div
      onClick={onClick}
      className={`p-5 rounded-2xl border transition-all hover:shadow-md cursor-pointer ${
        isSelected 
          ? 'border-primary/50 bg-primary/5 ring-2 ring-primary/20'
          : isDelayed 
            ? 'border-error/30 bg-error/5 hover:border-error/50' 
            : 'border-outline-variant/20 bg-surface-container-lowest hover:border-primary/30'
      }`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${statusColor}`}>
            {isCompleted ? <CheckCircle2 size={20} /> : <Truck size={20} />}
          </div>
          <div>
            <h4 className="font-bold text-base text-on-surface">{id}</h4>
            <p className="text-xs text-on-surface-variant mt-0.5">{driver} • {vehicle}</p>
          </div>
        </div>
        <button className="text-outline hover:text-on-surface p-2 rounded-lg hover:bg-surface-container transition-colors">
          <MoreVertical size={18} />
        </button>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-xs font-bold mb-2">
          <span className="text-on-surface-variant uppercase tracking-wider text-[10px]">Progress</span>
          <span className={isDelayed ? 'text-error' : 'text-primary'}>{progress}%</span>
        </div>
        <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden">
          <div className={`h-full rounded-full ${progressColor}`} style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm bg-surface-container-low p-3 rounded-xl border border-outline-variant/10">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-bold text-outline tracking-wider mb-0.5">Next Stop</span>
          <span className="font-semibold text-on-surface text-xs truncate max-w-[200px]">{nextStop}</span>
        </div>
        <div className="w-px h-8 bg-outline-variant/20"></div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] uppercase font-bold text-outline tracking-wider mb-0.5">ETA</span>
          <span className={`font-bold text-xs flex items-center gap-1 ${isDelayed ? 'text-error' : 'text-on-surface'}`}>
            <Clock size={12} />
            {eta}
          </span>
          {delay && <span className="text-[9px] text-error font-bold block mt-0.5">+{delay}</span>}
        </div>
      </div>
    </div>
  );
}
