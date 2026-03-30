import React, { useEffect, useState, useRef } from 'react';
import { Search, Bell, Settings, Plus, Minus, Locate, Layers, Info, RefreshCw, Truck, Zap, GripVertical, CheckCircle2, X, Trash2, ChevronDown, AlertCircle, Clock } from 'lucide-react';
import api from '../api';

export default function MapView() {
  const [routes, setRoutes] = useState<any[]>([]);
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatched, setDispatched] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Delete route state
  const [deletingRoute, setDeletingRoute] = useState<{ id: string; name: string } | null>(null);
  const [isDeletingRoute, setIsDeletingRoute] = useState(false);

  // Route actions menu
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Status update
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);

  const loadRoutes = async () => {
    setIsLoading(true);
    try {
      const res = await api.listRoutes();
      if (!res || res.length === 0) { setRoutes([]); return; }

      const manifests = await Promise.all(
        res.map((route: any) => api.getRouteManifest(route.route_id).catch(() => null)),
      );

      const mapped = res.map((route: any, index: number) => {
        const manifest = manifests[index];
        const stops = (manifest?.stops || []).map((stop: any) => ({
          id: stop.stop_id,
          name: stop.name || 'Stop',
          address: stop.address || 'N/A',
          demand: stop.status || 'pending',
        }));

        return {
          id: route.route_id,
          name: `Route ${index + 1} - ${route.route_id.substring(0, 12)}`,
          vehicle: route.vehicle_id || 'Unknown',
          status: route.status || 'pending',
          color: ['bg-primary', 'bg-warning', 'bg-success', 'bg-secondary'][index % 4],
          distance: `${Number(route.total_distance_km || 0).toFixed(1)} km`,
          time: `${Math.max(0, Math.floor(Math.round(Number(route.total_duration_minutes || 0)) / 60))}h ${Math.max(0, Math.round(Number(route.total_duration_minutes || 0)) % 60)}m`,
          stops,
        };
      });

      setRoutes(mapped);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRoutes();
  }, []);

  // Close menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Drag and Drop
  const handleDragStart = (e: React.DragEvent, stopId: string, sourceRouteId: string) => {
    e.dataTransfer.setData('stopId', stopId);
    e.dataTransfer.setData('sourceRouteId', sourceRouteId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetRouteId: string) => {
    e.preventDefault();
    const stopId = e.dataTransfer.getData('stopId');
    const sourceRouteId = e.dataTransfer.getData('sourceRouteId');
    if (sourceRouteId === targetRouteId) return;

    setRoutes(prev => {
      const source = prev.find(r => r.id === sourceRouteId);
      const stop = source?.stops.find((s: any) => s.id === stopId);
      if (!stop) return prev;
      return prev.map(r => {
        if (r.id === sourceRouteId) return { ...r, stops: r.stops.filter((s: any) => s.id !== stopId) };
        if (r.id === targetRouteId) return { ...r, stops: [...r.stops, stop] };
        return r;
      });
    });

    try {
      await api.adjustRoute(targetRouteId, {
        stop_id: stopId,
        source_route_id: sourceRouteId,
        target_route_id: targetRouteId,
        new_sequence_index: 0,
      });
    } catch (err) { console.error(err); }
  };

  // Delete route
  const handleDeleteRoute = async () => {
    if (!deletingRoute) return;
    setIsDeletingRoute(true);
    try {
      await api.deleteRoute(deletingRoute.id);
      setRoutes(prev => prev.filter(r => r.id !== deletingRoute.id));
      setDeletingRoute(null);
    } catch (err: any) {
      console.error(err);
      window.alert('Xóa route thất bại: ' + (err?.message || 'Unknown error'));
    } finally {
      setIsDeletingRoute(false);
    }
  };

  // Update route status
  const handleStatusUpdate = async (routeId: string, status: string) => {
    setUpdatingStatusId(routeId);
    setOpenMenuId(null);
    try {
      await api.updateRouteStatus(routeId, { status });
      setRoutes(prev => prev.map(r => r.id === routeId ? { ...r, status } : r));
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingStatusId(null);
    }
  };

  // Complete route
  const handleCompleteRoute = async (routeId: string) => {
    setOpenMenuId(null);
    setUpdatingStatusId(routeId);
    try {
      await api.completeRoute(routeId);
      setRoutes(prev => prev.map(r => r.id === routeId ? { ...r, status: 'completed' } : r));
    } catch (err) { console.error(err); }
    finally { setUpdatingStatusId(null); }
  };

  // Dispatch all
  const handleDispatch = async () => {
    setIsDispatching(true);
    try {
      await Promise.all(routes.map(route => api.dispatchRoute(route.id)));
      setIsDispatching(false);
      setDispatched(true);
      setTimeout(() => setShowDispatchModal(false), 1500);
    } catch (err) {
      console.error(err);
      setIsDispatching(false);
      window.alert('Dispatch thất bại cho một số route.');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-success/10 text-success"><CheckCircle2 size={10} /> Completed</span>;
      case 'active': return <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary"><Zap size={10} /> Active</span>;
      case 'delayed': return <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-error/10 text-error"><AlertCircle size={10} /> Delayed</span>;
      default: return <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant"><Clock size={10} /> Pending</span>;
    }
  };

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-background">
      {/* Header */}
      <header className="flex h-16 shrink-0 items-center justify-between bg-surface-container-lowest px-8 z-30 ghost-shadow">
        <div className="flex items-center gap-4 text-primary">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-on-primary font-bold">P</div>
          <h2 className="text-on-surface font-headline text-xl font-bold tracking-tight">Precision Logistics</h2>
        </div>

        <div className="flex flex-1 justify-center max-w-2xl mx-12">
          <div className="flex w-full items-center rounded-xl h-11 bg-surface-container-low px-4 focus-within:ring-2 focus-within:ring-primary-fixed-dim transition-all">
            <Search className="text-on-surface-variant w-5 h-5 mr-3" />
            <input type="text" placeholder="Search routes, vehicles, or waypoints..." className="w-full bg-transparent border-none text-sm focus:outline-none text-on-surface placeholder:text-outline" />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="w-11 h-11 flex items-center justify-center rounded-xl bg-surface-container-low text-on-surface hover:bg-surface-container-high transition-colors"><Bell size={20} /></button>
          <button className="w-11 h-11 flex items-center justify-center rounded-xl bg-surface-container-low text-on-surface hover:bg-surface-container-high transition-colors"><Settings size={20} /></button>
          <div className="h-8 w-px bg-outline-variant/30 mx-2"></div>
          <div className="flex items-center gap-3 pl-2">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold font-headline text-on-surface">Alex Thompson</p>
              <p className="text-[11px] text-on-surface-variant uppercase tracking-wider">Fleet Manager</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-bold text-sm">AT</div>
          </div>
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden relative">
        {/* Map Area */}
        <div className="flex-1 relative bg-surface-container-high overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=2000"
            alt="Map Background"
            className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-multiply"
          />

          <div className="absolute left-8 top-8 flex flex-col gap-3 z-10">
            <div className="flex flex-col rounded-2xl glass-panel p-1.5">
              <button className="p-2.5 hover:bg-surface-container rounded-xl text-on-surface transition-colors"><Plus size={20} /></button>
              <div className="h-px bg-outline-variant/20 mx-3 my-1"></div>
              <button className="p-2.5 hover:bg-surface-container rounded-xl text-on-surface transition-colors"><Minus size={20} /></button>
            </div>
            <button className="w-12 h-12 flex items-center justify-center rounded-2xl glass-panel text-on-surface hover:bg-surface-container transition-colors"><Locate size={20} /></button>
            <button className="w-12 h-12 flex items-center justify-center rounded-2xl glass-panel text-on-surface hover:bg-surface-container transition-colors"><Layers size={20} /></button>
          </div>

          {/* Route chips */}
          <div className="absolute top-8 right-8 z-10 flex flex-wrap gap-3 max-w-sm justify-end">
            {routes.slice(0, 4).map((r, i) => (
              <div key={r.id} className="flex items-center gap-3 px-5 py-3 rounded-full bg-surface-container-lowest ghost-shadow border border-primary/5">
                <span className={`w-3.5 h-3.5 rounded-full ${r.color}`}></span>
                <span className="text-sm font-bold text-on-surface truncate max-w-[120px]">{r.name.split(' - ')[0]}: {r.id.substring(0, 8)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side Panel */}
        <aside className="w-[440px] shrink-0 bg-surface flex flex-col z-20 ghost-shadow border-l border-outline-variant/10">
          <div className="p-6 flex flex-col gap-4 bg-surface-container-low/50">
            <div className="flex items-center justify-between">
              <h3 className="font-headline text-xl font-extrabold text-on-surface">Optimization</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={loadRoutes}
                  title="Refresh routes"
                  className="w-9 h-9 flex items-center justify-center rounded-xl bg-surface-container hover:bg-surface-container-high transition-colors text-on-surface-variant hover:text-primary"
                >
                  <RefreshCw size={16} />
                </button>
                <Info className="text-on-surface-variant cursor-pointer" size={20} />
              </div>
            </div>
            <button className="w-full flex items-center justify-center gap-3 primary-gradient text-on-primary py-3.5 rounded-xl font-headline font-bold text-sm tracking-wide shadow-lg hover:shadow-primary/20 transition-all active:scale-[0.98]">
              <RefreshCw size={18} />
              RE-CALCULATE ROUTES
            </button>
          </div>

          <div className="h-px bg-outline-variant/10 mx-6"></div>

          <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">
                Active Routes ({routes.length})
              </span>
              <span className="text-[10px] text-outline italic">Drag & Drop orders to reassign</span>
            </div>

            {isLoading && (
              <div className="flex flex-col gap-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="rounded-2xl bg-surface-container-lowest p-5 border border-outline-variant/10 animate-pulse h-28"></div>
                ))}
              </div>
            )}

            {!isLoading && routes.length === 0 && (
              <div className="text-center py-12 text-on-surface-variant">
                <Truck size={36} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm font-bold">No routes yet</p>
                <p className="text-xs mt-1">Run the optimizer from the Input page to generate routes.</p>
              </div>
            )}

            {!isLoading && routes.map(route => (
              <div
                key={route.id}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, route.id)}
                className="relative rounded-2xl bg-surface-container-lowest p-5 border border-transparent hover:border-primary-fixed hover:bg-surface-bright transition-all shadow-sm flex flex-col gap-4"
              >
                {/* Route header */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-10 rounded-full ${route.color} shrink-0`}></div>
                    <div>
                      <h4 className="font-headline font-extrabold text-on-surface text-sm leading-tight">{route.name}</h4>
                      <p className="text-[11px] text-on-surface-variant mt-0.5">Vehicle: {route.vehicle}</p>
                      <div className="mt-1">{getStatusBadge(route.status)}</div>
                    </div>
                  </div>

                  {/* 3-dot actions menu */}
                  <div className="relative" ref={openMenuId === route.id ? menuRef : undefined}>
                    <button
                      onClick={() => setOpenMenuId(openMenuId === route.id ? null : route.id)}
                      className="p-2 rounded-xl text-on-surface-variant hover:text-primary hover:bg-primary/10 transition-colors"
                    >
                      <ChevronDown size={16} />
                    </button>

                    {openMenuId === route.id && (
                      <div className="absolute right-0 top-10 z-50 bg-surface-container-lowest rounded-xl shadow-xl border border-outline-variant/20 w-52 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                        <div className="p-1">
                          <button
                            onClick={() => handleStatusUpdate(route.id, 'active')}
                            className="w-full text-left px-3 py-2.5 text-sm rounded-lg hover:bg-primary/10 text-on-surface flex items-center gap-2 font-medium"
                          >
                            <Zap size={14} className="text-primary" /> Mark as Active
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(route.id, 'delayed')}
                            className="w-full text-left px-3 py-2.5 text-sm rounded-lg hover:bg-warning/10 text-on-surface flex items-center gap-2 font-medium"
                          >
                            <AlertCircle size={14} className="text-warning" /> Mark as Delayed
                          </button>
                          <button
                            onClick={() => handleCompleteRoute(route.id)}
                            className="w-full text-left px-3 py-2.5 text-sm rounded-lg hover:bg-success/10 text-on-surface flex items-center gap-2 font-medium"
                          >
                            <CheckCircle2 size={14} className="text-success" /> Mark as Completed
                          </button>
                          <div className="h-px bg-outline-variant/15 my-1"></div>
                          <button
                            onClick={() => { setOpenMenuId(null); setDeletingRoute({ id: route.id, name: route.name }); }}
                            className="w-full text-left px-3 py-2.5 text-sm rounded-lg hover:bg-error/10 text-error flex items-center gap-2 font-medium"
                          >
                            <Trash2 size={14} /> Delete Route
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-surface-container-low rounded-xl p-2 flex flex-col items-center">
                    <span className="text-[10px] text-on-surface-variant uppercase font-bold mb-1 tracking-wider">Distance</span>
                    <span className="text-sm font-bold text-on-surface">{route.distance}</span>
                  </div>
                  <div className="bg-surface-container-low rounded-xl p-2 flex flex-col items-center">
                    <span className="text-[10px] text-on-surface-variant uppercase font-bold mb-1 tracking-wider">Time</span>
                    <span className="text-sm font-bold text-on-surface">{route.time}</span>
                  </div>
                  <div className="bg-surface-container-low rounded-xl p-2 flex flex-col items-center">
                    <span className="text-[10px] text-on-surface-variant uppercase font-bold mb-1 tracking-wider">Stops</span>
                    <span className="text-sm font-bold text-on-surface">{route.stops.length}</span>
                  </div>
                </div>

                {/* Stops list */}
                <div className="flex flex-col gap-2">
                  {route.stops.map((stop: any) => (
                    <div
                      key={stop.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, stop.id, route.id)}
                      className="bg-surface-container-low p-3 rounded-lg flex items-center gap-3 cursor-grab active:cursor-grabbing border border-outline-variant/10 hover:border-primary/30 transition-colors"
                    >
                      <GripVertical size={16} className="text-outline shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-on-surface truncate">{stop.name}</p>
                        <p className="text-[11px] text-on-surface-variant truncate">{stop.address} • {stop.demand}</p>
                      </div>
                    </div>
                  ))}
                  {route.stops.length === 0 && (
                    <div className="text-center p-4 border-2 border-dashed border-outline-variant/30 rounded-lg text-xs font-bold text-outline uppercase tracking-wider">
                      Drop orders here
                    </div>
                  )}
                </div>

                {/* Loading spinner when updating status */}
                {updatingStatusId === route.id && (
                  <div className="absolute inset-0 bg-surface/60 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="p-6 bg-surface-container-lowest border-t border-outline-variant/10 shrink-0">
            <div className="w-full bg-surface-container-high h-2 rounded-full mb-4 overflow-hidden relative">
              <div className="h-full bg-primary rounded-full absolute left-0" style={{ width: `${routes.length > 0 ? 75 : 0}%` }}></div>
            </div>
            <div className="flex gap-4">
              <button className="flex-1 py-3.5 rounded-xl bg-surface-container text-on-surface text-sm font-bold hover:bg-surface-container-high transition-colors">
                Export PDF
              </button>
              <button
                onClick={() => setShowDispatchModal(true)}
                disabled={routes.length === 0}
                className="flex-1 py-3.5 rounded-xl bg-primary text-on-primary text-sm font-bold hover:bg-primary-container transition-colors shadow-md shadow-primary/10 disabled:opacity-50"
              >
                Approve & Dispatch
              </button>
            </div>
          </div>
        </aside>
      </main>

      {/* Delete Route Confirmation */}
      {deletingRoute && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-outline/20 backdrop-blur-sm p-4">
          <div className="bg-surface-container-lowest w-full max-w-sm rounded-2xl shadow-2xl p-8 text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-14 h-14 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={26} className="text-error" />
            </div>
            <h3 className="text-lg font-bold text-on-surface mb-2">Delete Route?</h3>
            <p className="text-sm text-on-surface-variant mb-1 font-mono text-xs">{deletingRoute.name}</p>
            <p className="text-sm text-on-surface-variant mb-6">This will permanently remove the route and all its data.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeletingRoute(null)}
                className="flex-1 h-10 rounded-xl bg-surface-container hover:bg-surface-container-high font-bold text-sm text-on-surface transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteRoute}
                disabled={isDeletingRoute}
                className="flex-1 h-10 rounded-xl bg-error text-white font-bold text-sm disabled:opacity-60 hover:bg-error/90 transition-colors"
              >
                {isDeletingRoute ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dispatch Modal */}
      {showDispatchModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-outline/20 backdrop-blur-sm p-4">
          <div className="bg-surface-container-lowest w-full max-w-sm rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 p-8 text-center text-on-surface">
            {dispatched ? (
              <div className="flex flex-col items-center animate-in zoom-in">
                <div className="w-16 h-16 bg-success/20 text-success rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-xl font-bold font-headline">Routes Dispatched!</h3>
                <p className="text-sm text-on-surface-variant mt-2">Drivers have been notified via the mobile app.</p>
              </div>
            ) : isDispatching ? (
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                <h3 className="text-lg font-bold">Syncing to Drivers...</h3>
                <p className="text-xs text-on-surface-variant mt-2">Uploading coordinates and manifests</p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-4">
                  <Truck size={32} />
                </div>
                <h3 className="text-xl font-bold font-headline">Confirm Dispatch</h3>
                <p className="text-sm text-on-surface-variant mt-2 mb-6">
                  Ready to lock these <strong>{routes.length}</strong> routes and send manifests to drivers?
                </p>
                <div className="flex gap-3 w-full">
                  <button onClick={() => setShowDispatchModal(false)} className="flex-1 h-12 rounded-xl bg-surface-container hover:bg-surface-container-high font-bold text-sm transition-colors">
                    Cancel
                  </button>
                  <button onClick={handleDispatch} className="flex-1 h-12 rounded-xl primary-gradient text-on-primary font-bold text-sm shadow-md">
                    Dispatch All
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
