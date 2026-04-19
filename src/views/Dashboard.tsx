import React, { useState, useEffect } from 'react';
import { Search, Bell, Settings2, Route, Truck, MapPin, DollarSign, MoreVertical, Plus, Minus, Layers } from 'lucide-react';
import api from '../api';

export default function DashboardView() {
  const [metrics, setMetrics] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [fleet, setFleet] = useState<any[]>([]);

  useEffect(() => {
    api.getDashboardMetrics()
      .then(res => setMetrics(res))
      .catch(console.error);

    api.listOptimizerJobs()
      .then(res => setJobs(res || []))
      .catch(console.error);

    api.getFleetVehicles()
      .then(res => setFleet(res || []))
      .catch(console.error);
  }, []);

  const vehiclesOnRoute = metrics?.vehicles_in_use ?? 0;
  const vehiclesIdle = (fleet.length || 0) - vehiclesOnRoute;

  return (
    <div className="flex-1 overflow-y-auto bg-surface p-8">
      {/* Header */}
      <header className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-headline font-bold text-on-surface tracking-tight">VRP Dashboard Overview</h2>
          <p className="text-on-surface-variant mt-1 text-sm">Real-time logistics performance and optimization status.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search projects..." 
              className="pl-10 pr-4 py-2.5 bg-surface-container-low border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20 w-64 outline-none text-on-surface placeholder:text-outline"
            />
          </div>
          <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-surface-container-low text-on-surface hover:bg-surface-container transition-colors">
            <Bell size={20} />
          </button>
          <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-surface-container-low text-on-surface hover:bg-surface-container transition-colors">
            <Settings2 size={20} />
          </button>
        </div>
      </header>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <MetricCard icon={Route} title="Total Active Routes" value={metrics?.total_active_routes?.toLocaleString() || "---"} trend="+5%" trendType="positive" />
        <MetricCard icon={Truck} title="Vehicle Utilization" value={metrics ? `${metrics.vehicle_utilization_pct}%` : "---"} trend={metrics?.vehicle_utilization_pct > 70 ? "+OK" : "Low"} trendType={metrics?.vehicle_utilization_pct > 70 ? "positive" : "negative"} />
        <MetricCard icon={MapPin} title="Total Distance" value={metrics?.total_distance_km?.toLocaleString() || "---"} unit="km" trend="+12%" trendType="positive" />
        <MetricCard icon={DollarSign} title="Cost Savings" value={metrics ? `$${metrics.cost_savings_usd?.toLocaleString() || 0}` : "---"} trend="+18%" trendType="positive" />
      </div>

      {/* Optimization Performance & Projects */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Projects Table — LIVE from optimization jobs */}
        <div className="lg:col-span-2 bg-surface-container-lowest rounded-2xl ghost-shadow overflow-hidden">
          <div className="p-6 flex justify-between items-center">
            <h3 className="text-lg font-headline font-bold text-on-surface">Optimization Jobs</h3>
            <span className="text-sm font-bold text-on-surface-variant bg-surface-container-high px-4 py-2 rounded-lg">
              {jobs.length} Total
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low/50">
                  <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Job ID</th>
                  <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Created</th>
                  <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Est. Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {jobs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-sm text-on-surface-variant text-center">
                      No optimization jobs yet. Go to Input to run the optimizer.
                    </td>
                  </tr>
                ) : (
                  jobs.slice(0, 6).map(job => (
                    <JobRow
                      key={job.job_id}
                      jobId={job.job_id}
                      status={job.status}
                      createdAt={job.created_at}
                      estimatedTime={job.estimated_time_seconds}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Chart Card */}
        <div className="bg-surface-container-lowest p-6 rounded-2xl ghost-shadow">
          <div className="mb-6">
            <h3 className="text-lg font-headline font-bold text-on-surface">Efficiency Trend</h3>
            <p className="text-on-surface-variant text-sm mt-1">Weekly optimization accuracy</p>
          </div>
          <div className="flex flex-col gap-6">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-headline font-bold text-on-surface tracking-tight">
                {metrics?.vehicle_utilization_pct ?? 0}%
              </span>
              <span className="text-sm font-bold text-on-tertiary-container">utilization</span>
            </div>
            <div className="h-48 w-full">
              <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 400 150">
                <defs>
                  <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#dee8ff"></stop>
                    <stop offset="100%" stopColor="#ffffff" stopOpacity="0"></stop>
                  </linearGradient>
                </defs>
                <path d="M0,120 C50,110 80,40 120,50 C160,60 200,100 240,80 C280,60 320,20 360,30 L400,20 L400,150 L0,150 Z" fill="url(#chartGradient)"></path>
                <path d="M0,120 C50,110 80,40 120,50 C160,60 200,100 240,80 C280,60 320,20 360,30 L400,20" fill="none" stroke="#00113a" strokeLinecap="round" strokeWidth="3"></path>
              </svg>
            </div>
            <div className="grid grid-cols-7 text-center">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                <span key={day} className="text-xs font-bold text-outline uppercase">{day}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Operational Map Preview */}
      <div className="mt-10 mb-8">
        <h3 className="text-xl font-headline font-bold text-on-surface mb-6">Operational Map Preview</h3>
        <div className="relative w-full h-[400px] rounded-2xl overflow-hidden ghost-shadow bg-surface-container-high">
          <img 
            src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=2000" 
            alt="Map" 
            className="w-full h-full object-cover grayscale opacity-60 mix-blend-multiply"
          />
          
          {/* Map Overlays — LIVE data */}
          <div className="absolute top-6 left-6 p-5 glass-panel rounded-xl w-72">
            <div className="flex items-center gap-3 mb-5">
              <span className="w-3 h-3 rounded-full bg-tertiary-fixed-dim"></span>
              <span className="text-sm font-bold text-on-surface">Active Fleet Status</span>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center text-xs mb-2">
                  <span className="text-on-surface-variant font-medium">On-Route</span>
                  <span className="font-bold text-on-surface">{vehiclesOnRoute} Vehicle{vehiclesOnRoute !== 1 ? 's' : ''}</span>
                </div>
                <div className="w-full bg-surface-container rounded-full h-1.5">
                  <div className="bg-primary h-1.5 rounded-full" style={{ width: `${fleet.length > 0 ? Math.round((vehiclesOnRoute / fleet.length) * 100) : 0}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center text-xs mb-2">
                  <span className="text-on-surface-variant font-medium">Idle/Depot</span>
                  <span className="font-bold text-on-surface">{Math.max(0, vehiclesIdle)} Vehicle{vehiclesIdle !== 1 ? 's' : ''}</span>
                </div>
                <div className="w-full bg-surface-container rounded-full h-1.5">
                  <div className="bg-secondary-fixed-dim h-1.5 rounded-full" style={{ width: `${fleet.length > 0 ? Math.round((Math.max(0, vehiclesIdle) / fleet.length) * 100) : 0}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-6 right-6 flex flex-col gap-2">
            <div className="flex flex-col rounded-xl overflow-hidden glass-panel">
              <button className="p-3 text-on-surface hover:bg-white/40 transition-colors border-b border-white/20">
                <Plus size={18} />
              </button>
              <button className="p-3 text-on-surface hover:bg-white/40 transition-colors">
                <Minus size={18} />
              </button>
            </div>
            <button className="p-3 glass-panel rounded-xl text-on-surface hover:bg-white/40 transition-colors">
              <Layers size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ icon: Icon, title, value, unit, trend, trendType }: any) {
  const isPositive = trendType === 'positive';
  return (
    <div className="bg-surface-container-lowest p-6 rounded-2xl ghost-shadow">
      <div className="flex justify-between items-start mb-4">
        <span className="p-2.5 bg-surface-container-high rounded-xl text-primary">
          <Icon size={20} />
        </span>
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
          isPositive ? 'text-on-tertiary-container bg-tertiary-fixed' : 'text-error bg-error-container'
        }`}>
          {trend}
        </span>
      </div>
      <p className="text-on-surface-variant text-sm font-medium mb-1">{title}</p>
      <h3 className="text-2xl font-headline font-bold text-on-surface">
        {value} {unit && <span className="text-sm font-medium text-on-surface-variant">{unit}</span>}
      </h3>
    </div>
  );
}

function JobRow({ jobId, status, createdAt, estimatedTime }: any) {
  const getStatusStyle = (s: string) => {
    switch (s) {
      case 'completed': return 'bg-tertiary-fixed text-on-tertiary-fixed-variant';
      case 'calculating': return 'bg-secondary-container text-on-secondary-container';
      case 'failed': return 'bg-error-container text-error';
      case 'cancelled': return 'bg-surface-variant text-on-surface-variant';
      default: return 'bg-surface-variant text-on-surface-variant';
    }
  };

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch { return iso; }
  };

  const timeSince = (iso: string) => {
    try {
      const d = new Date(iso);
      const diff = Date.now() - d.getTime();
      const mins = Math.floor(diff / 60000);
      if (mins < 60) return `${mins}m ago`;
      const hrs = Math.floor(mins / 60);
      if (hrs < 24) return `${hrs}h ago`;
      return `${Math.floor(hrs / 24)}d ago`;
    } catch { return ''; }
  };

  return (
    <tr className="hover:bg-surface-container-low transition-colors group">
      <td className="px-6 py-5">
        <div className="flex flex-col">
          <span className="font-bold text-on-surface text-sm font-mono">{jobId}</span>
          <span className="text-xs text-on-surface-variant mt-0.5">{timeSince(createdAt)}</span>
        </div>
      </td>
      <td className="px-6 py-5">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold capitalize ${getStatusStyle(status)}`}>
          {status}
        </span>
      </td>
      <td className="px-6 py-5 text-sm text-on-surface-variant">{formatDate(createdAt)}</td>
      <td className="px-6 py-5 text-sm font-mono text-on-surface-variant">{estimatedTime ? `${estimatedTime.toFixed(1)}s` : '-'}</td>
    </tr>
  );
}
