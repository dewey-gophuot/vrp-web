import React from 'react';
import { Map, Clock, AlertCircle, CheckCircle2, Navigation, MoreVertical, Truck } from 'lucide-react';

export default function ActiveRoutesView() {
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
              <span className="text-xs font-bold bg-surface-container-high px-3 py-1.5 rounded-lg text-on-surface-variant">3 Active</span>
              <span className="text-xs font-bold bg-error/10 px-3 py-1.5 rounded-lg text-error">1 Delayed</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 space-y-4">
            <ActiveRouteCard 
              id="VRP-2024-001" 
              driver="John Doe" 
              vehicle="TRK-9902" 
              progress={65} 
              eta="14:45" 
              nextStop="City Hospital Pharmacy (Stop 4/12)"
              status="on-time"
            />
            <ActiveRouteCard 
              id="VRP-2024-002" 
              driver="Sarah Palmer" 
              vehicle="VAN-0412" 
              progress={82} 
              eta="13:10" 
              nextStop="Metro Grocers #42 (Stop 8/10)"
              status="delayed"
              delay="15 mins"
            />
            <ActiveRouteCard 
              id="VRP-2024-003" 
              driver="Mike Ross" 
              vehicle="EV-884" 
              progress={20} 
              eta="16:30" 
              nextStop="Industrial Park B2 (Stop 2/8)"
              status="on-time"
            />
             <ActiveRouteCard 
              id="VRP-2024-004" 
              driver="Jessica Pearson" 
              vehicle="VAN-0922" 
              progress={100} 
              eta="Completed" 
              nextStop="Returned to Depot"
              status="completed"
            />
          </div>
        </div>

        {/* Right Column - Map & Details */}
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
                    <p className="text-sm font-bold text-on-surface">VRP-2024-002</p>
                  </div>
                </div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-4 h-4 rounded-full bg-error border-2 border-white shadow-lg shadow-error/50"></div>
              </div>
            </div>

            {/* Selected Route Details */}
            <div className="p-6 flex flex-col gap-5 flex-1 overflow-y-auto">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-lg text-on-surface">Route Details</h4>
                  <span className="text-xs font-bold text-error bg-error/10 px-2 py-1 rounded-md border border-error/20">Delayed</span>
                </div>
                <p className="text-sm text-on-surface-variant flex items-center gap-2">
                  <Truck size={14} /> VAN-0412 • Sarah Palmer
                </p>
              </div>

              <div className="space-y-4 mt-2">
                <div className="bg-surface-container pl-4 py-3 pr-3 text-sm rounded-xl border-l-4 border-error flex items-start gap-3">
                  <AlertCircle size={18} className="text-error shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-on-surface">Traffic Delay Reported</p>
                    <p className="text-xs text-on-surface-variant mt-1">Heavy congestion on I-95 North. Impact: +15 minutes to next stop.</p>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <h5 className="text-xs font-bold uppercase text-outline tracking-wider">Next Destinations</h5>
                  
                  <div className="flex items-start gap-4 relative">
                    <div className="absolute left-2.5 top-5 bottom-[-20px] w-0.5 bg-outline-variant/30"></div>
                    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center z-10 shrink-0 border-[3px] border-surface-container-lowest mt-0.5"></div>
                    <div className="bg-surface-container-low p-3 rounded-xl flex-1 border border-primary/20">
                      <p className="text-xs font-bold text-on-surface">Metro Grocers #42</p>
                      <p className="text-[11px] text-on-surface-variant mt-1">Est. Arrival: 13:10 (Delayed)</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4 relative">
                    <div className="absolute left-2.5 top-5 bottom-[-20px] w-0.5 bg-outline-variant/30"></div>
                    <div className="w-5 h-5 rounded-full border-2 border-outline-variant bg-surface-container-lowest z-10 shrink-0 mt-0.5"></div>
                    <div className="p-2 flex-1">
                      <p className="text-xs font-medium text-on-surface-variant">Westside Storage</p>
                      <p className="text-[11px] text-outline mt-0.5">Est. Arrival: 14:30</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-5 h-5 rounded-full border-2 border-outline-variant bg-surface-container-lowest z-10 shrink-0 mt-0.5 flex items-center justify-center">
                    </div>
                    <div className="p-2 flex-1">
                      <p className="text-xs font-medium text-on-surface-variant">Return to Depot</p>
                      <p className="text-[11px] text-outline mt-0.5">Est. Arrival: 15:45</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ActiveRouteCard({ id, driver, vehicle, progress, eta, nextStop, status, delay }: any) {
  const isCompleted = status === 'completed';
  const isDelayed = status === 'delayed';

  const statusColor = isCompleted 
    ? 'text-success bg-success/10 border-success/20' 
    : isDelayed 
      ? 'text-error bg-error/10 border-error/20' 
      : 'text-primary bg-primary/10 border-primary/20';

  const progressColor = isCompleted ? 'bg-success' : isDelayed ? 'bg-error' : 'bg-primary';

  return (
    <div className={`p-5 rounded-2xl border transition-all hover:shadow-md cursor-pointer ${
      isDelayed ? 'border-error/30 bg-error/5 hover:border-error/50' : 'border-outline-variant/20 bg-surface-container-lowest hover:border-primary/30'
    }`}>
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
