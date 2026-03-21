import React, { useState } from 'react';
import { Search, Bell, Settings, Plus, Minus, Locate, Layers, Info, RefreshCw, Truck, Zap, MoreVertical, GripVertical, CheckCircle2, X } from 'lucide-react';

const INITIAL_ROUTES = [
  {
    id: 'r1',
    name: 'Route 1 - Alpha',
    vehicle: 'Mercedes Sprinter',
    color: 'bg-primary',
    distance: '42.8 km',
    time: '2h 15m',
    stops: [
      { id: 's1', name: 'Terminal A - Retail', address: 'Main St. 450', demand: '450 kg' },
      { id: 's2', name: 'Central Hub', address: 'Market Square', demand: '200 kg' }
    ]
  },
  {
    id: 'r2',
    name: 'Route 2 - Beta',
    vehicle: 'Ford Transit',
    color: 'bg-warning',
    distance: '31.2 km',
    time: '1h 45m',
    stops: [
      { id: 's3', name: 'Westside Storage', address: 'Industrial Park', demand: '1200 kg' },
      { id: 's4', name: 'North Clinic', address: 'Health Ave 10', demand: '350 kg' }
    ]
  },
  {
    id: 'r3',
    name: 'Route 3 - Gamma',
    vehicle: 'Rivian EDV',
    color: 'bg-success',
    distance: '55.1 km',
    time: '3h 20m',
    stops: [
      { id: 's5', name: 'South Depot', address: 'Logistic Way', demand: '800 kg' }
    ]
  }
];

export default function MapView() {
  const [routes, setRoutes] = useState(INITIAL_ROUTES);
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatched, setDispatched] = useState(false);

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, stopId: string, sourceRouteId: string) => {
    e.dataTransfer.setData('stopId', stopId);
    e.dataTransfer.setData('sourceRouteId', sourceRouteId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetRouteId: string) => {
    e.preventDefault();
    const stopId = e.dataTransfer.getData('stopId');
    const sourceRouteId = e.dataTransfer.getData('sourceRouteId');

    if (sourceRouteId === targetRouteId) return; // Dropped in same route

    setRoutes(prevRoutes => {
      const sourceRoute = prevRoutes.find(r => r.id === sourceRouteId);
      const stopToMove = sourceRoute?.stops.find(s => s.id === stopId);
      
      if (!stopToMove) return prevRoutes;

      return prevRoutes.map(route => {
        if (route.id === sourceRouteId) {
          return { ...route, stops: route.stops.filter(s => s.id !== stopId) };
        }
        if (route.id === targetRouteId) {
          return { ...route, stops: [...route.stops, stopToMove] };
        }
        return route;
      });
    });
  };

  const handleDispatch = () => {
    setIsDispatching(true);
    setTimeout(() => {
      setIsDispatching(false);
      setDispatched(true);
      setTimeout(() => {
        setShowDispatchModal(false);
      }, 1500);
    }, 2000);
  };

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-background">
      {/* Header */}
      <header className="flex h-16 shrink-0 items-center justify-between bg-surface-container-lowest px-8 z-30 ghost-shadow">
        <div className="flex items-center gap-4 text-primary">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-on-primary font-bold">
            P
          </div>
          <h2 className="text-on-surface font-headline text-xl font-bold tracking-tight">Precision Logistics</h2>
        </div>
        
        <div className="flex flex-1 justify-center max-w-2xl mx-12">
          <div className="flex w-full items-center rounded-xl h-11 bg-surface-container-low px-4 focus-within:ring-2 focus-within:ring-primary-fixed-dim transition-all">
            <Search className="text-on-surface-variant w-5 h-5 mr-3" />
            <input 
              type="text" 
              placeholder="Search routes, vehicles, or waypoints..." 
              className="w-full bg-transparent border-none text-sm focus:outline-none text-on-surface placeholder:text-outline"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="w-11 h-11 flex items-center justify-center rounded-xl bg-surface-container-low text-on-surface hover:bg-surface-container-high transition-colors">
            <Bell size={20} />
          </button>
          <button className="w-11 h-11 flex items-center justify-center rounded-xl bg-surface-container-low text-on-surface hover:bg-surface-container-high transition-colors">
            <Settings size={20} />
          </button>
          <div className="h-8 w-px bg-outline-variant/30 mx-2"></div>
          <div className="flex items-center gap-3 pl-2">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold font-headline text-on-surface">Alex Thompson</p>
              <p className="text-[11px] text-on-surface-variant uppercase tracking-wider">Fleet Manager</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-bold text-sm">
              AT
            </div>
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
              <button className="p-2.5 hover:bg-surface-container rounded-xl text-on-surface transition-colors">
                <Plus size={20} />
              </button>
              <div className="h-px bg-outline-variant/20 mx-3 my-1"></div>
              <button className="p-2.5 hover:bg-surface-container rounded-xl text-on-surface transition-colors">
                <Minus size={20} />
              </button>
            </div>
            <button className="w-12 h-12 flex items-center justify-center rounded-2xl glass-panel text-on-surface hover:bg-surface-container transition-colors">
              <Locate size={20} />
            </button>
            <button className="w-12 h-12 flex items-center justify-center rounded-2xl glass-panel text-on-surface hover:bg-surface-container transition-colors">
              <Layers size={20} />
            </button>
          </div>

          {/* Floating Route Chips */}
          <div className="absolute top-8 right-8 z-10 flex gap-3">
            <div className="flex items-center gap-3 px-5 py-3 rounded-full bg-surface-container-lowest ghost-shadow border border-primary/5">
              <span className="w-3.5 h-3.5 rounded-full bg-primary"></span>
              <span className="text-sm font-bold text-on-surface">Route 1: Alpha</span>
            </div>
            <div className="flex items-center gap-3 px-5 py-3 rounded-full bg-surface-container-lowest ghost-shadow border border-primary/5">
              <span className="w-3.5 h-3.5 rounded-full bg-warning"></span>
              <span className="text-sm font-bold text-on-surface">Route 2: Beta</span>
            </div>
          </div>
        </div>

        {/* Right Side Panel */}
        <aside className="w-[440px] shrink-0 bg-surface flex flex-col z-20 ghost-shadow border-l border-outline-variant/10">
          <div className="p-6 flex flex-col gap-4 bg-surface-container-low/50">
            <div className="flex items-center justify-between">
              <h3 className="font-headline text-xl font-extrabold text-on-surface">Optimization</h3>
              <Info className="text-on-surface-variant cursor-pointer" size={20} />
            </div>
            <button className="w-full flex items-center justify-center gap-3 primary-gradient text-on-primary py-3.5 rounded-xl font-headline font-bold text-sm tracking-wide shadow-lg hover:shadow-primary/20 transition-all active:scale-[0.98]">
              <RefreshCw size={18} />
              RE-CALCULATE ROUTES
            </button>
          </div>

          <div className="h-px bg-outline-variant/10 mx-6"></div>

          <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">Active Routes ({routes.length})</span>
              <span className="text-[10px] text-outline italic">Drag & Drop orders to reassign</span>
            </div>

            {routes.map(route => (
              <div 
                key={route.id}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, route.id)}
                className="group relative rounded-2xl bg-surface-container-lowest p-5 border border-transparent hover:border-primary-fixed hover:bg-surface-bright transition-all shadow-sm flex flex-col gap-4"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className={`w-2 h-12 rounded-full ${route.color}`}></div>
                    <div>
                      <h4 className="font-headline font-extrabold text-on-surface text-base">{route.name}</h4>
                      <p className="text-xs text-on-surface-variant mt-0.5">Vehicle: {route.vehicle}</p>
                    </div>
                  </div>
                  <MoreVertical className="text-on-surface-variant group-hover:text-primary" size={20} />
                </div>
                
                <div className="grid grid-cols-3 gap-3">
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

                {/* Draggable Stops List */}
                <div className="flex flex-col gap-2 mt-2">
                  {route.stops.map(stop => (
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
              </div>
            ))}
          </div>

          <div className="p-6 bg-surface-container-lowest border-t border-outline-variant/10 shrink-0">
            <div className="w-full bg-surface-container-high h-2 rounded-full mb-4 overflow-hidden relative">
              <div className="h-full bg-primary rounded-full absolute left-0" style={{ width: '75%' }}></div>
            </div>
            <div className="flex gap-4">
              <button className="flex-1 py-3.5 rounded-xl bg-surface-container text-on-surface text-sm font-bold hover:bg-surface-container-high transition-colors">
                Export PDF
              </button>
              <button 
                onClick={() => setShowDispatchModal(true)}
                className="flex-1 py-3.5 rounded-xl bg-primary text-on-primary text-sm font-bold hover:bg-primary-container transition-colors shadow-md shadow-primary/10"
              >
                Approve & Dispatch
              </button>
            </div>
          </div>
        </aside>
      </main>

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
                  Are you ready to lock these routes and send the manifests to 3 drivers?
                </p>
                <div className="flex gap-3 w-full">
                  <button onClick={() => setShowDispatchModal(false)} className="flex-1 h-12 rounded-xl bg-surface-container hover:bg-surface-container-high font-bold text-sm">Cancel</button>
                  <button onClick={handleDispatch} className="flex-1 h-12 rounded-xl primary-gradient text-on-primary font-bold text-sm shadow-md">Dispatch All</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
