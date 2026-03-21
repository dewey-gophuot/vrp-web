import React from 'react';
import { Truck, Upload, Plus, MoreVertical, ChevronLeft, ChevronRight, Map, AlertTriangle, Settings2, MessageSquare, Route } from 'lucide-react';

export default function InputView() {
  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-background">
      {/* Header */}
      <header className="flex items-center justify-between shrink-0 border-b border-outline-variant/15 bg-surface-container-lowest px-10 py-4">
        <div className="flex items-center gap-4 text-primary">
          <Route size={24} />
          <h2 className="text-on-surface text-lg font-bold font-headline">VRP Optimizer</h2>
        </div>
        <div className="flex gap-3">
          <button className="primary-gradient text-on-primary px-6 h-10 rounded-lg text-sm font-bold shadow-sm active:scale-95 transition-transform">
            Optimize Route
          </button>
          <button className="flex items-center justify-center rounded-lg h-10 w-10 bg-surface-container-high text-on-surface hover:bg-surface-variant transition-colors">
            <Settings2 size={20} />
          </button>
          <button className="flex items-center justify-center rounded-lg h-10 w-10 bg-surface-container-high text-on-surface hover:bg-surface-variant transition-colors">
            <MessageSquare size={20} />
          </button>
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden">
        {/* Left Column: Fleet Configuration */}
        <aside className="w-[420px] border-r border-outline-variant/15 bg-surface-container-low flex flex-col p-8 overflow-y-auto shrink-0">
          <div className="flex items-center gap-3 mb-8">
            <Truck className="text-primary" size={24} />
            <h2 className="text-xl font-bold font-headline text-on-surface">Fleet Configuration</h2>
          </div>

          <div className="space-y-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-on-surface-variant">Number of Vehicles</label>
              <div className="relative">
                <input 
                  type="number" 
                  placeholder="e.g. 15" 
                  className="w-full h-12 bg-surface-container-lowest border-none rounded-xl px-4 py-2 text-on-surface focus:ring-2 focus:ring-primary-fixed-dim outline-none"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-outline text-xs uppercase font-bold">Units</span>
              </div>
              <p className="text-[11px] text-outline px-1">Maximum 50 vehicles per optimization run.</p>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-on-surface-variant">Vehicle Capacity</label>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="e.g. 1500" 
                  className="w-full h-12 bg-surface-container-lowest border-none rounded-xl px-4 py-2 text-on-surface focus:ring-2 focus:ring-primary-fixed-dim outline-none"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-outline text-xs uppercase font-bold">KG</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-on-surface-variant">Estimated Fuel Cost</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-outline font-bold">$</span>
                <input 
                  type="text" 
                  placeholder="1.45" 
                  className="w-full h-12 bg-surface-container-lowest border-none rounded-xl pl-8 pr-4 py-2 text-on-surface focus:ring-2 focus:ring-primary-fixed-dim outline-none"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-outline text-xs uppercase font-bold">/ KM</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-on-surface-variant">Operational Window</label>
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <input 
                    type="time" 
                    defaultValue="08:00" 
                    className="w-full h-12 bg-surface-container-lowest border-none rounded-xl px-4 py-2 text-on-surface focus:ring-2 focus:ring-primary-fixed-dim outline-none"
                  />
                  <div className="absolute -top-2 left-3 bg-surface-container-low px-1 text-[10px] font-bold text-primary uppercase">Start</div>
                </div>
                <div className="relative">
                  <input 
                    type="time" 
                    defaultValue="18:00" 
                    className="w-full h-12 bg-surface-container-lowest border-none rounded-xl px-4 py-2 text-on-surface focus:ring-2 focus:ring-primary-fixed-dim outline-none"
                  />
                  <div className="absolute -top-2 left-3 bg-surface-container-low px-1 text-[10px] font-bold text-primary uppercase">End</div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-outline-variant/20">
              <button className="flex items-center justify-between w-full text-sm font-bold text-on-secondary-fixed-variant">
                <span>Advanced Constraints</span>
                <ChevronRight size={18} className="rotate-90" />
              </button>
            </div>
          </div>

          <div className="mt-auto pt-8">
            <button className="w-full h-12 rounded-xl bg-surface-container-highest border border-outline-variant/30 flex items-center justify-center gap-2 text-on-surface font-bold text-sm hover:bg-surface-variant transition-colors">
              <Upload size={18} />
              Import CSV/Excel
            </button>
          </div>
        </aside>

        {/* Right Column: Delivery Points */}
        <section className="flex-1 flex flex-col p-10 overflow-hidden relative">
          <div className="flex items-center justify-between mb-8 shrink-0">
            <div>
              <h1 className="text-3xl font-bold font-headline text-on-surface tracking-tight">Delivery Points</h1>
              <p className="text-on-surface-variant text-sm mt-1">Manage destination nodes and time-window constraints</p>
            </div>
            <button className="h-10 px-5 rounded-xl bg-primary-fixed text-on-primary-fixed font-bold text-sm flex items-center gap-2 hover:bg-primary-fixed-dim transition-colors">
              <Plus size={18} />
              Add Point
            </button>
          </div>

          {/* Data Table */}
          <div className="flex-1 bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/10 flex flex-col overflow-hidden mb-8">
            <div className="overflow-y-auto flex-1">
              <table className="w-full border-collapse text-left">
                <thead className="sticky top-0 bg-surface-container-low z-10">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-outline uppercase tracking-wider">Location Name</th>
                    <th className="px-6 py-4 text-xs font-bold text-outline uppercase tracking-wider">Address</th>
                    <th className="px-6 py-4 text-xs font-bold text-outline uppercase tracking-wider">Demand (kg)</th>
                    <th className="px-6 py-4 text-xs font-bold text-outline uppercase tracking-wider">Time Window</th>
                    <th className="px-6 py-4 text-xs font-bold text-outline uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  <TableRow name="North Hub Depot" address="122 Logistic Way, SE1 2BA" demand="0.0" time="08:00 - 10:00" timeStyle="primary" />
                  <TableRow name="Terminal A - Retail" address="Main St. 450, London" demand="450.0" time="09:30 - 15:00" timeStyle="secondary" />
                  <TableRow name="Westside Storage" address="Industrial Park B2, Unit 4" demand="1,200.0" time="12:00 - 18:00" timeStyle="tertiary" />
                  <TableRow name="CBD Delivery Point" address="Market Square 12, London" demand="180.5" time="Flexible" timeStyle="primary" />
                </tbody>
              </table>
            </div>
            
            <div className="border-t border-outline-variant/10 p-4 flex items-center justify-between text-sm bg-surface-container-lowest shrink-0">
              <div className="text-on-surface-variant font-medium px-2">
                Showing <span className="text-on-surface font-bold">4</span> of <span className="text-on-surface font-bold">128</span> delivery points
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 rounded-lg hover:bg-surface-container-high transition-colors disabled:opacity-30" disabled>
                  <ChevronLeft size={18} />
                </button>
                <span className="font-bold text-primary px-2">1</span>
                <button className="p-2 rounded-lg hover:bg-surface-container-high transition-colors">
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Widgets */}
          <div className="grid grid-cols-3 gap-6 shrink-0 pb-20">
            <div className="col-span-2 relative h-48 rounded-2xl overflow-hidden shadow-sm bg-surface-container-high">
              <img 
                src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=1000" 
                alt="Map" 
                className="w-full h-full object-cover grayscale opacity-30 mix-blend-multiply"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
              <div className="absolute inset-0 flex flex-col justify-end p-6">
                <div className="glass-panel p-4 rounded-xl inline-flex items-center gap-4 max-w-md">
                  <div className="p-3 bg-primary rounded-xl text-on-primary">
                    <Map size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-on-surface text-sm">Geospatial Validation</h4>
                    <p className="text-on-surface-variant text-xs mt-0.5">All addresses geocoded successfully. Region: Greater London.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-surface-container-high rounded-2xl p-8 flex flex-col justify-center gap-2 border border-primary/5">
              <span className="text-xs font-bold text-on-primary-fixed-variant uppercase tracking-widest">Total Demand</span>
              <div className="text-4xl font-bold font-headline text-primary tracking-tighter">
                1,830.5 <span className="text-lg font-medium text-on-surface-variant">kg</span>
              </div>
              <div className="mt-2 flex items-center gap-2 text-xs font-semibold text-on-tertiary-fixed-variant">
                <AlertTriangle size={14} />
                24% capacity utilization
              </div>
            </div>
          </div>

          {/* Floating Action Bar */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-2xl px-6 z-20">
            <div className="glass-panel p-2.5 rounded-2xl shadow-2xl flex items-center justify-between">
              <div className="flex items-center gap-6 px-6">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-outline tracking-wider">Selected Model</span>
                  <span className="text-sm font-bold text-on-surface mt-0.5">Clarke-Wright Savings</span>
                </div>
                <div className="h-8 w-px bg-outline-variant/30"></div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-outline tracking-wider">ETA Optimization</span>
                  <span className="text-sm font-bold text-on-surface mt-0.5">&lt; 12.4s</span>
                </div>
              </div>
              <button className="primary-gradient text-on-primary px-8 h-12 rounded-xl font-bold text-sm flex items-center gap-3 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
                Generate Optimal Route
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function TableRow({ name, address, demand, time, timeStyle }: any) {
  const getBadgeStyle = (style: string) => {
    switch (style) {
      case 'primary': return 'bg-surface-container-high text-primary';
      case 'secondary': return 'bg-secondary-container text-on-secondary-container';
      case 'tertiary': return 'bg-tertiary-fixed text-on-tertiary-fixed-variant';
      default: return 'bg-surface-container text-on-surface';
    }
  };

  return (
    <tr className="hover:bg-surface-container-low transition-colors">
      <td className="px-6 py-5 font-semibold text-on-surface text-sm">{name}</td>
      <td className="px-6 py-5 text-on-surface-variant text-sm">{address}</td>
      <td className="px-6 py-5 text-on-surface text-sm font-mono">{demand}</td>
      <td className="px-6 py-5">
        <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${getBadgeStyle(timeStyle)}`}>
          {time}
        </span>
      </td>
      <td className="px-6 py-5 text-right">
        <button className="text-outline hover:text-primary transition-colors p-2 rounded-lg hover:bg-surface-container">
          <MoreVertical size={18} />
        </button>
      </td>
    </tr>
  );
}
