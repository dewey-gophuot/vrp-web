import React from 'react';
import { Search, Bell, Settings, Plus, Minus, Locate, Layers, Info, RefreshCw, Truck, Zap, MoreVertical } from 'lucide-react';

export default function MapView() {
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
          
          {/* Map Controls */}
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

          {/* Map Stats Overlay */}
          <div className="absolute left-8 bottom-8 z-10">
            <div className="glass-panel rounded-2xl p-5 flex gap-8 items-center">
              <div className="flex flex-col">
                <span className="text-[11px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">Fleet Health</span>
                <span className="text-base font-bold text-on-surface flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-success"></span> 94% Optimized
                </span>
              </div>
              <div className="h-10 w-px bg-outline-variant/30"></div>
              <div className="flex flex-col">
                <span className="text-[11px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">Live Traffic</span>
                <span className="text-base font-bold text-on-surface">Moderate</span>
              </div>
            </div>
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
          <div className="p-8 flex flex-col gap-6 bg-surface-container-low/50">
            <div className="flex items-center justify-between">
              <h3 className="font-headline text-2xl font-extrabold text-on-surface">Optimization</h3>
              <Info className="text-on-surface-variant cursor-pointer" size={20} />
            </div>
            <button className="w-full flex items-center justify-center gap-3 primary-gradient text-on-primary py-4 rounded-2xl font-headline font-bold text-base tracking-wide shadow-lg hover:shadow-primary/20 transition-all active:scale-[0.98]">
              <RefreshCw size={20} />
              RE-OPTIMIZE ROUTES
            </button>
          </div>

          <div className="px-8 py-6 flex flex-col gap-6">
            <div className="flex flex-col gap-5">
              <span className="text-[12px] font-bold uppercase tracking-widest text-on-surface-variant">Visibility Layers</span>
              
              <div className="flex items-center justify-between group cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-primary">
                    <Truck size={20} />
                  </div>
                  <span className="text-base font-semibold text-on-surface">Heavy Vehicles</span>
                </div>
                <div className="w-12 h-7 rounded-full bg-primary p-0.5 flex justify-end">
                  <div className="w-6 h-6 rounded-full bg-white shadow-sm"></div>
                </div>
              </div>

              <div className="flex items-center justify-between group cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-primary">
                    <Zap size={20} />
                  </div>
                  <span className="text-base font-semibold text-on-surface">EV Fleet Only</span>
                </div>
                <div className="w-12 h-7 rounded-full bg-outline-variant p-0.5 flex justify-start">
                  <div className="w-6 h-6 rounded-full bg-white shadow-sm"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="h-px bg-outline-variant/10 mx-8"></div>

          <div className="flex-1 overflow-y-auto px-8 py-6 flex flex-col gap-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[12px] font-bold uppercase tracking-widest text-on-surface-variant">Active Routes (3)</span>
              <button className="text-xs font-bold text-primary hover:underline">Collapse All</button>
            </div>

            <RouteCard 
              name="Route 1 - Alpha" 
              vehicle="Mercedes Sprinter (VAN-04)" 
              color="bg-primary"
              distance="42.8 km" time="2h 15m" stops="14" 
            />
            <RouteCard 
              name="Route 2 - Beta" 
              vehicle="Ford Transit (VAN-09)" 
              color="bg-warning"
              distance="31.2 km" time="1h 45m" stops="09" 
            />
            <RouteCard 
              name="Route 3 - Gamma" 
              vehicle="Rivian EDV (EV-22)" 
              color="bg-success"
              distance="55.1 km" time="3h 20m" stops="21" 
            />
          </div>

          <div className="p-8 bg-surface-container-lowest border-t border-outline-variant/10">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-bold text-on-surface">Total Fleet Distance</span>
              <span className="text-sm font-extrabold text-primary">129.1 km</span>
            </div>
            <div className="w-full bg-surface-container-high h-2 rounded-full mb-6 overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: '75%' }}></div>
            </div>
            <div className="flex gap-4">
              <button className="flex-1 py-3.5 rounded-xl bg-surface-container text-on-surface text-sm font-bold hover:bg-surface-container-high transition-colors">
                Export PDF
              </button>
              <button className="flex-1 py-3.5 rounded-xl bg-primary text-on-primary text-sm font-bold hover:bg-primary-container transition-colors shadow-md shadow-primary/10">
                Dispatch All
              </button>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}

function RouteCard({ name, vehicle, color, distance, time, stops }: any) {
  return (
    <div className="group relative rounded-2xl bg-surface-container-lowest p-5 border border-transparent hover:border-primary-fixed hover:bg-surface-bright transition-all cursor-pointer shadow-sm">
      <div className="flex justify-between items-start mb-5">
        <div className="flex items-center gap-4">
          <div className={`w-2 h-12 rounded-full ${color}`}></div>
          <div>
            <h4 className="font-headline font-extrabold text-on-surface text-base">{name}</h4>
            <p className="text-xs text-on-surface-variant mt-0.5">Vehicle: {vehicle}</p>
          </div>
        </div>
        <MoreVertical className="text-on-surface-variant group-hover:text-primary" size={20} />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-surface-container-low rounded-xl p-3 flex flex-col items-center">
          <span className="text-[10px] text-on-surface-variant uppercase font-bold mb-1 tracking-wider">Distance</span>
          <span className="text-sm font-bold text-on-surface">{distance}</span>
        </div>
        <div className="bg-surface-container-low rounded-xl p-3 flex flex-col items-center">
          <span className="text-[10px] text-on-surface-variant uppercase font-bold mb-1 tracking-wider">Time</span>
          <span className="text-sm font-bold text-on-surface">{time}</span>
        </div>
        <div className="bg-surface-container-low rounded-xl p-3 flex flex-col items-center">
          <span className="text-[10px] text-on-surface-variant uppercase font-bold mb-1 tracking-wider">Stops</span>
          <span className="text-sm font-bold text-on-surface">{stops}</span>
        </div>
      </div>
    </div>
  );
}
