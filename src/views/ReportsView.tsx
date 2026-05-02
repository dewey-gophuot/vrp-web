import React, { useEffect, useState } from 'react';
import { ChevronRight, Share, Download, Share2, Printer, FileText, Table, Database, Copy, ExternalLink, Clock } from 'lucide-react';
import api from '../api';

export default function ReportsView() {
  const [routeId, setRouteId] = useState('N/A');
  const [vehicleId, setVehicleId] = useState('N/A');
  const [metrics, setMetrics] = useState<any>(null);
  const [stops, setStops] = useState<any[]>([]);
  const [allRoutes, setAllRoutes] = useState<any[]>([]);
  const [fleet, setFleet] = useState<any[]>([]);

  useEffect(() => {
    // Load fleet for capacity utilization
    api.getFleetVehicles()
      .then(res => setFleet(res || []))
      .catch(console.error);

    api.listRoutes()
      .then(async (routes) => {
        if (!routes || routes.length === 0) return;
        setAllRoutes(routes);
        const selected = routes[0];
        setRouteId(selected.id);
        setVehicleId(selected.vehicle_id || 'N/A');

        const [reportRes, metricRes, manifestRes] = await Promise.all([
          api.getRouteReport(selected.id),
          api.getRouteMetrics(selected.id),
          api.getRouteManifest(selected.id).catch(() => null),
        ]);

        setMetrics(metricRes);
        // Prefer manifest stops (objects with name/address) over raw stop IDs
        if (manifestRes?.stops && manifestRes.stops.length > 0) {
          setStops(manifestRes.stops);
        } else {
          // Fallback: wrap raw IDs as objects for display
          setStops((reportRes.stops || []).map((stop: any) => ({
            stop_id: stop.stop_id || stop.id || 'unknown',
            name: stop.name || stop.location_id || 'Unknown',
            address: stop.address || '',
            sequence: stop.sequence || 0,
            status: stop.status || 'planned',
          })));
        }
      })
      .catch(console.error);
  }, []);

  // Build capacity utilization from routes + fleet
  const routeCapacityData = allRoutes.slice(0, 3).map((route, idx) => {
    const vehicle = fleet.find(v => v.id === route.vehicle_id);
    const capacityKg = vehicle?.capacity_kg || 0;
    // Estimate utilization from stop count vs capacity
    const stopCount = route.stop_count || 0;
    const utilPct = capacityKg > 0 ? Math.min(Math.round((stopCount * 15 / capacityKg) * 100), 100) : 50;
    return {
      id: route.vehicle_id || `Vehicle ${idx + 1}`,
      pct: utilPct,
      label: utilPct >= 90 ? 'CRITICAL' : utilPct >= 70 ? 'OPTIMIZED' : '',
    };
  });

  return (
    <div className="flex-1 overflow-y-auto p-8 lg:p-12 bg-background">
      {/* Breadcrumbs & Header */}
      <div className="flex flex-col gap-2 mb-10">
        <div className="flex items-center gap-2 text-on-surface-variant text-sm font-medium">
          <span>Reports</span>
          <ChevronRight size={16} />
          <span className="text-on-surface">Route Analytics</span>
        </div>
        <div className="flex flex-wrap justify-between items-end gap-4">
          <div>
            <h2 className="text-on-surface font-headline text-4xl font-extrabold tracking-tight">{routeId}</h2>
            <p className="text-on-surface-variant mt-2">
              Driver: <span className="text-on-surface font-semibold">Unknown</span> • 
              Vehicle: <span className="text-on-surface font-semibold">{vehicleId}</span>
            </p>
          </div>
          <div className="flex gap-2">
            <button className="primary-gradient text-on-primary font-bold px-6 py-3 rounded-xl shadow-lg shadow-primary/20 flex items-center gap-2 hover:scale-[1.02] active:scale-95 transition-all">
              <Share size={20} />
              Share Report
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/10">
          <div className="flex justify-between items-start mb-4">
            <span className="text-on-surface-variant text-sm font-medium">Total Distance</span>
          </div>
          <p className="text-on-surface text-3xl font-headline font-bold">{metrics?.total_distance_km ?? 0} km</p>
          <div className="mt-5 w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
            <div className="h-full bg-primary" style={{ width: '65%' }}></div>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/10">
          <div className="flex justify-between items-start mb-4">
            <span className="text-on-surface-variant text-sm font-medium">Total Stops</span>
            <span className="text-on-surface-variant text-xs font-bold bg-surface-container px-2.5 py-1 rounded-full">
              {metrics?.completed_stops ?? 0}/{metrics?.stop_count ?? 0}
            </span>
          </div>
          <p className="text-on-surface text-3xl font-headline font-bold">{metrics?.stop_count ?? 0} Stops</p>
          <div className="mt-5 flex gap-1.5">
            <div className="h-1.5 flex-1 bg-on-tertiary-container rounded-full"></div>
            <div className="h-1.5 flex-1 bg-on-tertiary-container rounded-full"></div>
            <div className="h-1.5 flex-1 bg-surface-container rounded-full"></div>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/10">
          <div className="flex justify-between items-start mb-4">
            <span className="text-on-surface-variant text-sm font-medium">Completion</span>
          </div>
          <p className="text-on-surface text-3xl font-headline font-bold">{metrics?.completion_pct ?? 0}%</p>
          <div className="mt-5 w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
            <div className="h-full bg-on-tertiary-fixed-variant" style={{ width: `${metrics?.completion_pct ?? 0}%` }}></div>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/10">
          <div className="flex justify-between items-start mb-4">
            <span className="text-on-surface-variant text-sm font-medium">Est. Duration</span>
          </div>
          <p className="text-on-surface text-3xl font-headline font-bold">
            {Math.floor(Math.round(Number(metrics?.total_duration_minutes || 0)) / 60)}h {Math.round(Number(metrics?.total_duration_minutes || 0)) % 60}m
          </p>
          <div className="mt-5 flex items-center gap-1.5 text-xs text-on-surface-variant font-medium">
            <Clock size={14} />
            Status: {metrics?.status || 'planned'}
          </div>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Timeline Table */}
        <div className="xl:col-span-2 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h3 className="text-on-surface font-headline text-xl font-bold">Route Sequence Timeline</h3>
            <div className="flex gap-2">
              <button className="text-xs font-bold bg-surface-container-high px-4 py-2 rounded-lg border border-outline-variant/20 text-primary">All Stops</button>
              <button className="text-xs font-bold bg-surface-container-lowest px-4 py-2 rounded-lg border border-outline-variant/20 text-on-surface-variant hover:bg-surface-container transition-colors">Pending</button>
            </div>
          </div>
          
          <div className="bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden border border-outline-variant/10">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-surface-container-low text-on-surface-variant uppercase text-[10px] font-bold tracking-widest">
                  <th className="px-6 py-4">#</th>
                  <th className="px-6 py-4">Stop Location</th>
                  <th className="px-6 py-4">Address</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Sequence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container">
                {stops.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-5 text-sm text-on-surface-variant">No stops available.</td>
                  </tr>
                ) : (
                  stops.slice(0, 8).map((stop: any, index: number) => (
                    <TimelineRow
                      key={`${stop.stop_id || stop}-${index}`}
                      num={String(index + 1).padStart(2, '0')}
                      name={stop.name || stop.stop_id || stop}
                      desc={stop.address || ''}
                      arrival="N/A"
                      qty={stop.status || '-'}
                      dist={stop.sequence ? `#${stop.sequence}` : '-'}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Analytics Sidebar */}
        <div className="flex flex-col gap-8">
          {/* Capacity Utilization — LIVE data from fleet + routes */}
          <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/10">
            <h3 className="text-on-surface font-headline text-lg font-bold mb-6">Capacity Utilization</h3>
            <div className="flex flex-col gap-6">
              {routeCapacityData.length > 0 ? (
                routeCapacityData.map((item, idx) => {
                  const barColors = ['bg-primary', 'bg-on-primary-container', 'bg-on-tertiary-container'];
                  return (
                    <div key={item.id} className="space-y-2">
                      <div className="flex justify-between text-xs font-bold uppercase tracking-tight text-on-surface-variant">
                        <span>{item.id}</span>
                        <span>{item.pct}%</span>
                      </div>
                      <div className="w-full h-8 bg-surface-container rounded-lg overflow-hidden relative">
                        <div className={`h-full ${barColors[idx % barColors.length]}`} style={{ width: `${item.pct}%` }}></div>
                        {item.label && (
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-primary-fixed">
                            {item.label}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-on-surface-variant">No route data available for utilization analysis.</p>
              )}
            </div>
            <div className="mt-8 pt-6 border-t border-surface-container text-xs text-on-surface-variant leading-relaxed font-medium">
              <p>Vehicle utilization is calculated based on stop demand relative to vehicle capacity limits.</p>
            </div>
          </div>

          {/* Export Options */}
          <div className="bg-surface-container-high/50 p-6 rounded-2xl border border-outline-variant/10">
            <h3 className="text-on-surface font-headline text-lg font-bold mb-5">Export Options</h3>
            <div className="grid grid-cols-2 gap-3">
              <ExportButton icon={FileText} label="PDF Report" color="text-error" />
              <ExportButton icon={Table} label="Excel File" color="text-on-tertiary-container" />
              <ExportButton icon={Database} label="Raw JSON" color="text-primary" />
              <ExportButton icon={Copy} label="Copy Link" color="text-secondary" />
            </div>
          </div>

          {/* Map Placeholder */}
          <div className="rounded-2xl overflow-hidden h-64 relative shadow-lg border-2 border-surface-container-lowest">
            <div 
              className="absolute inset-0 bg-surface-container-highest bg-cover bg-center" 
              style={{ backgroundImage: "url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=1000')" }}
            >
              <div className="absolute inset-0 bg-primary/10 mix-blend-multiply"></div>
            </div>
            <div className="absolute inset-0 p-4 pointer-events-none">
              <div className="glass-panel px-4 py-2.5 rounded-xl inline-flex items-center gap-2.5 pointer-events-auto">
                <span className="w-2.5 h-2.5 rounded-full bg-error animate-pulse"></span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface">Real-time Map Preview</span>
              </div>
            </div>
            <button className="absolute bottom-4 right-4 w-12 h-12 glass-panel rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110 text-on-surface">
              <ExternalLink size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function TimelineRow({ num, name, desc, arrival, qty, qtyStyle, dist, highlightRow }: any) {
  return (
    <tr className={`hover:bg-surface-container-low transition-colors group ${highlightRow ? 'bg-on-tertiary-fixed/5' : ''}`}>
      <td className="px-6 py-5 font-bold text-primary">{num}</td>
      <td className="px-6 py-5">
        <p className="text-on-surface font-semibold">{name}</p>
        <p className="text-xs text-on-surface-variant mt-0.5">{desc}</p>
      </td>
      <td className="px-6 py-5 font-medium">{arrival}</td>
      <td className="px-6 py-5 text-center">
        {qtyStyle === 'badge' ? (
          <span className="bg-surface-container px-3 py-1.5 rounded-lg text-xs font-bold text-on-surface">{qty}</span>
        ) : qtyStyle === 'highlight' ? (
          <span className="text-on-tertiary-fixed-variant font-bold">{qty}</span>
        ) : (
          <span className="font-semibold text-on-surface">{qty}</span>
        )}
      </td>
      <td className="px-6 py-5 text-right font-mono text-on-surface-variant">{dist}</td>
    </tr>
  );
}

function ExportButton({ icon: Icon, label, color }: any) {
  return (
    <button className="flex flex-col items-center justify-center p-5 bg-surface-container-lowest rounded-xl border border-outline-variant/20 transition-all hover:bg-surface-bright hover:border-primary/30 group">
      <Icon size={24} className={`${color} mb-3 group-hover:scale-110 transition-transform`} />
      <span className="text-xs font-bold text-on-surface">{label}</span>
    </button>
  );
}
