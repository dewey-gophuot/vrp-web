import React, { useState, useEffect } from 'react';
import { Truck, Upload, Plus, Edit2, Trash2, ChevronLeft, ChevronRight, Map, AlertTriangle, Settings2, MessageSquare, Route, X, FileSpreadsheet, MapPin, Zap, Play, Pause, Square, RefreshCw, BarChart3, Clock, Users, TrendingUp, Settings, CheckCircle, AlertCircle, Navigation, Calendar, Filter, Download, Eye, ExternalLink } from 'lucide-react';
import api from '../api';

// Generate ID: 3 letters + 3 numbers (e.g. ABC-123)
function generateId(): string {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  
  let result = '';
  for (let i = 0; i < 3; i++) {
    result += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  result += '-';
  for (let i = 0; i < 3; i++) {
    result += numbers.charAt(Math.floor(Math.random() * numbers.length));
  }
  
  return result;
}

export default function InputView() {
  const [showAddPoint, setShowAddPoint] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isSubmittingPoint, setIsSubmittingPoint] = useState(false);
  const [optimizeMessage, setOptimizeMessage] = useState('');
  const [manifestFile, setManifestFile] = useState<File | null>(null);
  
  const [fleet, setFleet] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [editingLoc, setEditingLoc] = useState<any | null>(null);
  const [deletingLocId, setDeletingLocId] = useState<string | null>(null);
  const [isDeletingLoc, setIsDeletingLoc] = useState(false);
  const [pointForm, setPointForm] = useState({
    id: '',
    name: '',
    address: '',
    lat: '',
    lng: '',
    demand: '',
    service_time: '15',
    time_window_start: '',
    time_window_end: '',
    priority: '1',
    phone: '',
  });
  const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const [selectedGmapUrl, setSelectedGmapUrl] = useState<string | null>(null);
  
  // Optimization Jobs State
  const [optimizationJobs, setOptimizationJobs] = useState<any[]>([]);
  const [currentJob, setCurrentJob] = useState<any | null>(null);
  const [jobPolling, setJobPolling] = useState<NodeJS.Timeout | null>(null);
  
  // Routes State
  const [routes, setRoutes] = useState<any[]>([]);
  const [activeRoutes, setActiveRoutes] = useState<any[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<any | null>(null);
  
  // Metrics State
  const [metrics, setMetrics] = useState<any>(null);
  
  // UI State
  const [activeTab, setActiveTab] = useState<'setup' | 'optimize' | 'routes' | 'tracking'>('setup');
  const [showOptimizeSettings, setShowOptimizeSettings] = useState(false);
  const [optimizeSettings, setOptimizeSettings] = useState({
    solver_algorithm: 'nearest_neighbor',
    objective: 'minimize_distance',
    constraints: {
      strict_time_windows: true,
      respect_capacity: true,
      avoid_tolls: false,
    },
  });

  const loadFleetAndLocations = () => {
    Promise.all([api.getFleetVehicles(), api.getLocationDemands()])
      .then(([fleetRes, locationRes]) => {
        setFleet(fleetRes || []);
        setLocations(locationRes || []);
      })
      .catch(console.error);
  };

  const loadMetrics = () => {
    api.getMetricsDashboard().then(setMetrics).catch(console.error);
  };

  const loadRoutes = () => {
    Promise.all([api.getRoutes(), api.getActiveRoutes()])
      .then(([allRoutes, activeRoutes]) => {
        setRoutes(allRoutes || []);
        setActiveRoutes(activeRoutes || []);
      })
      .catch(console.error);
  };

  const loadOptimizationJobs = () => {
    api.getOptimizationJobs().then(setOptimizationJobs).catch(console.error);
  };

  const pollJobStatus = (jobId: string) => {
    const poll = setInterval(async () => {
      try {
        const job = await api.getOptimizationJob(jobId);
        setCurrentJob(job);
        
        if (job.status === 'completed' || job.status === 'failed' || job.status === 'cancelled') {
          clearInterval(poll);
          setJobPolling(null);
          if (job.status === 'completed') {
            loadRoutes();
            loadMetrics();
          }
        }
      } catch (error) {
        clearInterval(poll);
        setJobPolling(null);
      }
    }, 2000);
    
    setJobPolling(poll);
  };

  useEffect(() => {
    loadFleetAndLocations();
    loadMetrics();
    loadRoutes();
    loadOptimizationJobs();
    
    return () => {
      if (jobPolling) clearInterval(jobPolling);
    };
  }, []);

  const activeVehicles = fleet.length;
  const totalCapacity = fleet.reduce((sum, v) => sum + (v.capacity_kg || 0), 0);
  const totalDemand = locations.reduce((sum, loc) => sum + (loc.demand_kg || loc.demand || 0), 0);
  
  const isOverloaded = totalCapacity > 0 && totalDemand > totalCapacity;
  const utilization = totalCapacity > 0 ? Math.round((totalDemand / totalCapacity) * 100) : 0;

  const handleAddressChange = (value: string) => {
    setPointForm(prev => ({ ...prev, address: value }));
    
    // Clear existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    // Only search if query is at least 2 characters
    if (value.length >= 2) {
      const timeout = setTimeout(async () => {
        try {
          const results = await api.geocodeAutocomplete(value, 5);
          setAddressSuggestions(results);
          setShowSuggestions(true);
        } catch (error) {
          console.error('Address search failed:', error);
          setAddressSuggestions([]);
        }
      }, 300); // 300ms debounce
      
      setSearchTimeout(timeout);
    } else {
      setAddressSuggestions([]);
      setShowSuggestions(false);
    }
  };
  
  const handleSelectAddress = (suggestion: any) => {
    setPointForm(prev => ({
      ...prev,
      address: suggestion.display_name,
      lat: suggestion.lat.toString(),
      lng: suggestion.lng.toString(),
    }));
    setSelectedGmapUrl(suggestion.gmap_url ?? null);
    setShowSuggestions(false);
    setAddressSuggestions([]);
  };

  const handleAddPoint = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!pointForm.name.trim()) { window.alert('Vui lòng nhập tên điểm giao.'); return; }
    try {
      setIsSubmittingPoint(true);
      await api.createLocation({
        id: pointForm.id || undefined,
        name: pointForm.name,
        address_string: pointForm.address,
        lat: parseFloat(pointForm.lat) || 0,
        lng: parseFloat(pointForm.lng) || 0,
        demand_kg: pointForm.demand ? parseFloat(pointForm.demand) : 0,
        time_window_start: pointForm.time_window_start || undefined,
        time_window_end: pointForm.time_window_end || undefined,
        service_time_mins: pointForm.service_time ? parseFloat(pointForm.service_time) : 15,
        priority: parseInt(pointForm.priority) || 1,
        phone: pointForm.phone || undefined,
      });
      loadFleetAndLocations();
      setShowAddPoint(false);
      setPointForm({ id: '', name: '', address: '', lat: '', lng: '', demand: '', service_time: '15', time_window_start: '', time_window_end: '', priority: '1', phone: '' });
    } catch (error) { console.error(error); window.alert('Không thể thêm điểm giao.'); }
    finally { setIsSubmittingPoint(false); }
  };

  const handleOptimize = async () => {
    if (fleet.length === 0 || locations.length === 0) {
      setOptimizeMessage('Cần có ít nhất 1 xe và 1 điểm giao để tối ưu.');
      return;
    }

    try {
      setIsOptimizing(true);
      setOptimizeMessage('Đang gửi yêu cầu tối ưu...');

      const runRes = await api.runOptimizer({
        project_id: `vrp-${Date.now()}`,
        solver_algorithm: optimizeSettings.solver_algorithm,
        objective: optimizeSettings.objective,
        vehicles: fleet.map(v => v.id),
        locations: locations.map(loc => loc.id),
        constraints: optimizeSettings.constraints,
      });

      setCurrentJob({ job_id: runRes.job_id, status: 'calculating' });
      pollJobStatus(runRes.job_id);
      setOptimizeMessage('Đang tính toán lộ trình tối ưu...');
    } catch (error) {
      console.error(error);
      setOptimizeMessage('Chạy tối ưu thất bại.');
      setIsOptimizing(false);
    }
  };

  const handleCancelJob = async () => {
    if (!currentJob) return;
    
    try {
      await api.cancelOptimizationJob(currentJob.job_id);
      if (jobPolling) {
        clearInterval(jobPolling);
        setJobPolling(null);
      }
      setCurrentJob(null);
      setOptimizeMessage('Đã huỷ yêu cầu tối ưu.');
      setIsOptimizing(false);
    } catch (error) {
      console.error(error);
      setOptimizeMessage('Huỷ yêu cầu thất bại.');
    }
  };

  const handleDispatchRoute = async (routeId: string) => {
    try {
      await api.dispatchRoute(routeId);
      loadRoutes();
      loadMetrics();
      setOptimizeMessage('Đã điều phối lộ trình cho tài xế.');
    } catch (error) {
      console.error(error);
      setOptimizeMessage('Điều phối thất bại.');
    }
  };

  const handleCompleteRoute = async (routeId: string) => {
    try {
      await api.completeRoute(routeId);
      loadRoutes();
      loadMetrics();
      setOptimizeMessage('Đã hoàn thành lộ trình.');
    } catch (error) {
      console.error(error);
      setOptimizeMessage('Hoàn thành lộ trình thất bại.');
    }
  };

  const handleUploadManifest = async () => {
    if (!manifestFile) {
      window.alert('Vui lòng chọn file CSV/XLSX trước khi upload.');
      return;
    }

    try {
      setIsUploading(true);
      const res = await api.uploadManifest(manifestFile);
      loadFleetAndLocations();
      setShowUpload(false);
      setManifestFile(null);
      window.alert(`Upload thành công: ${res.created_locations}/${res.uploaded_rows} điểm mới.`);
    } catch (error) {
      console.error(error);
      window.alert('Upload manifest thất bại.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteLocation = async () => {
    if (!deletingLocId) return;
    setIsDeletingLoc(true);
    try {
      await api.deleteLocation(deletingLocId);
      loadFleetAndLocations();
      setDeletingLocId(null);
    } catch (error) { console.error(error); window.alert('Xóa thất bại.'); }
    finally { setIsDeletingLoc(false); }
  };

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-background relative">
      {/* Header */}
      <header className="flex items-center justify-between shrink-0 border-b border-outline-variant/15 bg-surface-container-lowest px-10 py-4">
        <div className="flex items-center gap-4 text-primary">
          <Route size={24} />
          <h2 className="text-on-surface text-lg font-bold font-headline">VRP Optimizer</h2>
        </div>
        <div className="flex items-center gap-4">
          {metrics && (
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Truck className="text-outline" size={16} />
                <span className="text-on-surface-variant">{metrics.total_active_routes}/{metrics.total_vehicles} Active</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="text-outline" size={16} />
                <span className="text-on-surface-variant">{metrics.vehicle_utilization_pct}% Utilization</span>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="flex shrink-0 border-b border-outline-variant/15 bg-surface-container-low px-10">
        <nav className="flex gap-8">
          {[
            { id: 'setup', label: 'Setup', icon: Settings },
            { id: 'optimize', label: 'Optimize', icon: BarChart3 },
            { id: 'routes', label: 'Routes', icon: Route },
            { id: 'tracking', label: 'Tracking', icon: Map },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center gap-2 py-4 border-b-2 transition-colors ${
                activeTab === id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <Icon size={18} />
              <span className="font-medium">{label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Status Message */}
      {optimizeMessage && (
        <div className="px-10 pt-4">
          <div className="rounded-xl border border-outline-variant/20 bg-surface-container-low px-4 py-3 text-sm text-on-surface flex items-center gap-3">
            {currentJob?.status === 'calculating' && <RefreshCw className="animate-spin" size={16} />}
            {currentJob?.status === 'completed' && <CheckCircle className="text-success" size={16} />}
            {currentJob?.status === 'failed' && <AlertCircle className="text-error" size={16} />}
            {optimizeMessage}
          </div>
        </div>
      )}

      {/* Tab Content */}
      <main className="flex-1 overflow-hidden">
        {activeTab === 'setup' && (
          <div className="flex h-full">
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
                      readOnly
                      value={activeVehicles}
                      className="w-full h-12 bg-surface-container-lowest border-none rounded-xl px-4 py-2 text-on-surface focus:ring-2 focus:ring-primary-fixed-dim outline-none cursor-not-allowed opacity-80"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-outline text-xs uppercase font-bold">Units</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-on-surface-variant">Total Fleet Capacity</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      readOnly
                      value={totalCapacity}
                      className="w-full h-12 bg-surface-container-lowest border-none rounded-xl px-4 py-2 text-on-surface focus:ring-2 focus:ring-primary-fixed-dim outline-none cursor-not-allowed opacity-80"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-outline text-xs uppercase font-bold">KG</span>
                  </div>
                </div>

                {isOverloaded && (
                  <div className="bg-error/10 border border-error/20 p-4 rounded-xl flex gap-3 text-error mt-2 animate-in slide-in-from-top-2">
                    <AlertTriangle size={20} className="shrink-0" />
                    <div>
                      <h4 className="font-bold text-sm">Capacity Exceeded</h4>
                      <p className="text-xs mt-1 text-on-surface-variant">
                        Total demand ({totalDemand} kg) exceeds fleet capacity ({totalCapacity} kg).
                      </p>
                    </div>
                  </div>
                )}

                <div className="pt-6 border-t border-outline-variant/20">
                  <button className="flex items-center justify-between w-full text-sm font-bold text-on-secondary-fixed-variant">
                    <span>Advanced Constraints</span>
                    <ChevronRight size={18} className="rotate-90" />
                  </button>
                </div>
              </div>

              <div className="mt-auto pt-8">
                <button 
                  onClick={() => setShowUpload(true)}
                  className="w-full h-12 rounded-xl bg-surface-container-highest border border-outline-variant/30 flex items-center justify-center gap-2 text-on-surface font-bold text-sm hover:bg-surface-variant transition-colors"
                >
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
                <button 
                  onClick={() => setShowAddPoint(true)}
                  className="h-10 px-5 rounded-xl bg-primary-fixed text-on-primary-fixed font-bold text-sm flex items-center gap-2 hover:bg-primary-fixed-dim transition-colors"
                >
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
                        <th className="px-6 py-4 text-xs font-bold text-outline uppercase tracking-wider">Order ID</th>
                        <th className="px-6 py-4 text-xs font-bold text-outline uppercase tracking-wider">Location / Address</th>
                        <th className="px-6 py-4 text-xs font-bold text-outline uppercase tracking-wider">Demand (kg)</th>
                        <th className="px-6 py-4 text-xs font-bold text-outline uppercase tracking-wider">Time Window</th>
                        <th className="px-6 py-4 text-xs font-bold text-outline uppercase tracking-wider">Priority</th>
                        <th className="px-6 py-4 text-xs font-bold text-outline uppercase tracking-wider text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/10">
                      {locations.length === 0 ? (
                        <tr><td colSpan={6} className="px-6 py-4 text-center text-sm text-on-surface-variant">No locations found. Add or import points.</td></tr>
                      ) : (
                        locations.map((loc, idx) => (
                          <tr key={loc.id || idx} className="hover:bg-surface-container-low transition-colors group">
                            <td className="px-6 py-5 font-mono font-bold text-primary text-[11px]">
                              <span className="bg-primary/10 px-2 py-1 rounded">{loc.id || `ORD-${idx+1}`}</span>
                            </td>
                            <td className="px-6 py-5">
                              <p className="font-semibold text-on-surface text-sm">{loc.name}</p>
                              <p className="text-[11px] text-on-surface-variant mt-0.5">{loc.address_string || loc.address || 'Unknown'}</p>
                            </td>
                            <td className="px-6 py-5 text-on-surface text-sm font-mono">{loc.demand_kg || loc.demand || 0}</td>
                            <td className="px-6 py-5">
                              <span className="px-3 py-1.5 rounded-full text-[11px] font-bold bg-surface-container-high text-primary">
                                {loc.time_window_start ? `${loc.time_window_start} - ${loc.time_window_end || ''}` : 'Flexible'}
                              </span>
                            </td>
                            <td className="px-6 py-5">
                              <span className="px-2 py-1 rounded text-xs font-medium bg-amber-100 text-amber-800">
                                P{loc.priority || 1}
                              </span>
                            </td>
                            <td className="px-6 py-5 text-right">
                              <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="p-2 text-outline hover:text-primary bg-surface-container-low rounded-lg hover:bg-primary/10 transition-colors">
                                  <Edit2 size={14} />
                                </button>
                                <button className="p-2 text-outline hover:text-error bg-surface-container-low rounded-lg hover:bg-error/10 transition-colors">
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Bottom Widgets */}
              <div className="grid grid-cols-3 gap-6 shrink-0 pb-2">
                <div className="col-span-2 relative h-32 rounded-2xl overflow-hidden shadow-sm bg-surface-container-high border border-outline-variant/10 flex items-center justify-between p-8">
                  <div className="flex items-center gap-4">
                     <div className="p-4 bg-primary rounded-2xl text-on-primary shadow-lg shadow-primary/20"><Map size={24} /></div>
                     <div>
                       <h4 className="font-bold text-on-surface text-lg">Geospatial Validation</h4>
                       <p className="text-on-surface-variant text-sm mt-1">Geocoding: {locations.length}/{locations.length} addresses mapped to coordinates.</p>
                     </div>
                  </div>
                </div>
                
                <div className={`rounded-2xl p-6 flex flex-col justify-center gap-1 border ${isOverloaded ? 'bg-error/10 border-error/20' : 'bg-surface-container-lowest border-primary/10'}`}>
                  <span className={`text-xs font-bold uppercase tracking-widest ${isOverloaded ? 'text-error' : 'text-on-surface-variant'}`}>
                    Total Demand / Capacity
                  </span>
                  <div className={`text-3xl font-bold font-headline tracking-tighter ${isOverloaded ? 'text-error' : 'text-primary'}`}>
                    {totalDemand} <span className="text-sm font-medium opacity-70">/ {totalCapacity} kg</span>
                  </div>
                  <div className={`mt-2 w-full h-2 rounded-full overflow-hidden ${isOverloaded ? 'bg-error/20' : 'bg-surface-container'}`}>
                    <div 
                      className={`h-full rounded-full transition-all ${isOverloaded ? 'bg-error' : 'bg-primary'}`}
                      style={{ width: `${Math.min(utilization, 100)}%` }}
                    ></div>
                  </div>
                  <div className={`text-xs font-bold mt-1 text-right ${isOverloaded ? 'text-error' : 'text-primary'}`}>
                    {utilization}% Utilized
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'optimize' && (
          <div className="flex h-full">
            {/* Left Column: Optimization Settings */}
            <aside className="w-[420px] border-r border-outline-variant/15 bg-surface-container-low flex flex-col p-8 overflow-y-auto shrink-0">
              <div className="flex items-center gap-3 mb-8">
                <BarChart3 className="text-primary" size={24} />
                <h2 className="text-xl font-bold font-headline text-on-surface">Optimization Settings</h2>
              </div>

              <div className="space-y-6">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-on-surface-variant">Solver Algorithm</label>
                  <select 
                    value={optimizeSettings.solver_algorithm}
                    onChange={(e) => setOptimizeSettings(prev => ({ ...prev, solver_algorithm: e.target.value }))}
                    className="w-full h-12 bg-surface-container-lowest border border-outline-variant/10 rounded-xl px-4 py-2 text-on-surface focus:ring-2 focus:ring-primary-fixed-dim outline-none"
                  >
                    <option value="nearest_neighbor">Nearest Neighbor</option>
                    <option value="or-tools">Google OR-Tools</option>
                    <option value="genetic">Genetic Algorithm</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-on-surface-variant">Objective</label>
                  <select 
                    value={optimizeSettings.objective}
                    onChange={(e) => setOptimizeSettings(prev => ({ ...prev, objective: e.target.value }))}
                    className="w-full h-12 bg-surface-container-lowest border border-outline-variant/10 rounded-xl px-4 py-2 text-on-surface focus:ring-2 focus:ring-primary-fixed-dim outline-none"
                  >
                    <option value="minimize_distance">Minimize Distance</option>
                    <option value="minimize_time">Minimize Time</option>
                    <option value="minimize_cost">Minimize Cost</option>
                    <option value="balance_load">Balance Load</option>
                  </select>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-on-surface-variant">Constraints</h3>
                  
                  <label className="flex items-center gap-3 cursor-pointer p-3 bg-surface-container-lowest rounded-lg border border-outline-variant/10 hover:bg-surface-container transition-colors">
                    <input 
                      type="checkbox" 
                      checked={optimizeSettings.constraints.strict_time_windows}
                      onChange={(e) => setOptimizeSettings(prev => ({
                        ...prev,
                        constraints: { ...prev.constraints, strict_time_windows: e.target.checked }
                      }))}
                      className="w-4 h-4 rounded accent-primary" 
                    />
                    <div className="flex items-center gap-2 text-sm font-medium text-on-surface">
                      <Clock size={16} className="text-primary" /> Strict Time Windows
                    </div>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer p-3 bg-surface-container-lowest rounded-lg border border-outline-variant/10 hover:bg-surface-container transition-colors">
                    <input 
                      type="checkbox" 
                      checked={optimizeSettings.constraints.respect_capacity}
                      onChange={(e) => setOptimizeSettings(prev => ({
                        ...prev,
                        constraints: { ...prev.constraints, respect_capacity: e.target.checked }
                      }))}
                      className="w-4 h-4 rounded accent-primary" 
                    />
                    <div className="flex items-center gap-2 text-sm font-medium text-on-surface">
                      <Truck size={16} className="text-primary" /> Respect Capacity
                    </div>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer p-3 bg-surface-container-lowest rounded-lg border border-outline-variant/10 hover:bg-surface-container transition-colors">
                    <input 
                      type="checkbox" 
                      checked={optimizeSettings.constraints.avoid_tolls}
                      onChange={(e) => setOptimizeSettings(prev => ({
                        ...prev,
                        constraints: { ...prev.constraints, avoid_tolls: e.target.checked }
                      }))}
                      className="w-4 h-4 rounded accent-primary" 
                    />
                    <div className="flex items-center gap-2 text-sm font-medium text-on-surface">
                      <Navigation size={16} className="text-primary" /> Avoid Tolls
                    </div>
                  </label>
                </div>
              </div>

              <div className="mt-auto pt-8 space-y-3">
                <button 
                  onClick={handleOptimize}
                  disabled={isOverloaded || isOptimizing}
                  className={`w-full h-12 rounded-xl font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 ${
                    isOverloaded || isOptimizing
                      ? 'bg-surface-container text-on-surface-variant cursor-not-allowed opacity-50' 
                      : 'primary-gradient text-on-primary active:scale-95'
                  }`}
                >
                  {isOptimizing ? (
                    <>
                      <RefreshCw className="animate-spin" size={18} />
                      Optimizing...
                    </>
                  ) : (
                    <>
                      <Play size={18} />
                      Run Optimization
                    </>
                  )}
                </button>

                {currentJob && currentJob.status === 'calculating' && (
                  <button 
                    onClick={handleCancelJob}
                    className="w-full h-12 rounded-xl bg-error text-white font-bold text-sm hover:bg-error/90 transition-colors flex items-center justify-center gap-2"
                  >
                    <Square size={18} />
                    Cancel Job
                  </button>
                )}
              </div>
            </aside>

            {/* Right Column: Jobs History & Results */}
            <section className="flex-1 flex flex-col p-10 overflow-hidden relative">
              <div className="flex items-center justify-between mb-8 shrink-0">
                <div>
                  <h1 className="text-3xl font-bold font-headline text-on-surface tracking-tight">Optimization Jobs</h1>
                  <p className="text-on-surface-variant text-sm mt-1">Job history and results</p>
                </div>
                <button 
                  onClick={loadOptimizationJobs}
                  className="h-10 px-5 rounded-xl bg-surface-container-highest border border-outline-variant/30 font-bold text-sm flex items-center gap-2 hover:bg-surface-variant transition-colors"
                >
                  <RefreshCw size={18} />
                  Refresh
                </button>
              </div>

              {/* Current Job Status */}
              {currentJob && (
                <div className="mb-6 p-6 rounded-xl border border-outline-variant/20 bg-surface-container-low">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-on-surface">Current Job</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      currentJob.status === 'calculating' ? 'bg-blue-100 text-blue-800' :
                      currentJob.status === 'completed' ? 'bg-green-100 text-green-800' :
                      currentJob.status === 'failed' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {currentJob.status}
                    </span>
                  </div>
                  
                  {currentJob.status === 'calculating' && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-on-surface-variant">Progress</span>
                        <span className="font-medium">Calculating...</span>
                      </div>
                      <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full animate-pulse" style={{ width: '60%' }}></div>
                      </div>
                    </div>
                  )}

                  {currentJob.status === 'completed' && currentJob.result && (
                    <div className="grid grid-cols-4 gap-4 mt-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{currentJob.result.routes?.length || 0}</div>
                        <div className="text-xs text-on-surface-variant">Routes</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{currentJob.result.total_distance_km || 0}</div>
                        <div className="text-xs text-on-surface-variant">Distance (km)</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{currentJob.result.total_duration_mins || 0}</div>
                        <div className="text-xs text-on-surface-variant">Duration (min)</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{currentJob.result.total_cost || 0}</div>
                        <div className="text-xs text-on-surface-variant">Cost ($)</div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Jobs History */}
              <div className="flex-1 bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/10 flex flex-col overflow-hidden">
                <div className="overflow-y-auto flex-1">
                  <table className="w-full border-collapse text-left">
                    <thead className="sticky top-0 bg-surface-container-low z-10">
                      <tr>
                        <th className="px-6 py-4 text-xs font-bold text-outline uppercase tracking-wider">Job ID</th>
                        <th className="px-6 py-4 text-xs font-bold text-outline uppercase tracking-wider">Algorithm</th>
                        <th className="px-6 py-4 text-xs font-bold text-outline uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-xs font-bold text-outline uppercase tracking-wider">Result</th>
                        <th className="px-6 py-4 text-xs font-bold text-outline uppercase tracking-wider">Created</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/10">
                      {optimizationJobs.length === 0 ? (
                        <tr><td colSpan={5} className="px-6 py-4 text-center text-sm text-on-surface-variant">No optimization jobs found.</td></tr>
                      ) : (
                        optimizationJobs.map((job) => (
                          <tr key={job.job_id} className="hover:bg-surface-container-low transition-colors">
                            <td className="px-6 py-5 font-mono text-sm">{job.job_id}</td>
                            <td className="px-6 py-5 text-sm">{job.solver_algorithm}</td>
                            <td className="px-6 py-5">
                              <span className={`px-3 py-1.5 rounded-full text-[11px] font-bold ${
                                job.status === 'calculating' ? 'bg-blue-100 text-blue-800' :
                                job.status === 'completed' ? 'bg-green-100 text-green-800' :
                                job.status === 'failed' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {job.status}
                              </span>
                            </td>
                            <td className="px-6 py-5 text-sm">
                              {job.result ? `${job.result.routes?.length || 0} routes` : '-'}
                            </td>
                            <td className="px-6 py-5 text-sm text-on-surface-variant">
                              {new Date(job.created_at).toLocaleString()}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'routes' && (
          <div className="flex h-full">
            {/* Routes List */}
            <section className="flex-1 flex flex-col p-10 overflow-hidden relative">
              <div className="flex items-center justify-between mb-8 shrink-0">
                <div>
                  <h1 className="text-3xl font-bold font-headline text-on-surface tracking-tight">Routes Management</h1>
                  <p className="text-on-surface-variant text-sm mt-1">Manage and dispatch routes</p>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={loadRoutes}
                    className="h-10 px-5 rounded-xl bg-surface-container-highest border border-outline-variant/30 font-bold text-sm flex items-center gap-2 hover:bg-surface-variant transition-colors"
                  >
                    <RefreshCw size={18} />
                    Refresh
                  </button>
                </div>
              </div>

              {/* Routes Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 overflow-y-auto flex-1">
                {[...routes, ...activeRoutes].map((route) => (
                  <div key={route.id} className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Truck className="text-primary" size={20} />
                          <h3 className="font-bold text-on-surface">{route.vehicle_id}</h3>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          route.status === 'planned' ? 'bg-blue-100 text-blue-800' :
                          route.status === 'dispatched' ? 'bg-amber-100 text-amber-800' :
                          route.status === 'in_progress' ? 'bg-green-100 text-green-800' :
                          route.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {route.status}
                        </span>
                      </div>

                      <div className="space-y-3 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-on-surface-variant">Stops</span>
                          <span className="font-medium">{route.stop_count || 0}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-on-surface-variant">Distance</span>
                          <span className="font-medium">{route.total_distance_km || 0} km</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-on-surface-variant">Duration</span>
                          <span className="font-medium">{route.total_duration_mins || 0} min</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-on-surface-variant">Load</span>
                          <span className="font-medium">{route.load_kg || 0} kg</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-on-surface-variant">Utilization</span>
                          <span className="font-medium">{route.utilization_pct || 0}%</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {route.status === 'planned' && (
                          <button 
                            onClick={() => handleDispatchRoute(route.id)}
                            className="flex-1 h-8 rounded-lg bg-primary text-white text-xs font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-1"
                          >
                            <Play size={14} /> Dispatch
                          </button>
                        )}
                        {route.status === 'dispatched' && (
                          <button 
                            onClick={() => handleCompleteRoute(route.id)}
                            className="flex-1 h-8 rounded-lg bg-success text-white text-xs font-medium hover:bg-success/90 transition-colors flex items-center justify-center gap-1"
                          >
                            <CheckCircle size={14} /> Complete
                          </button>
                        )}
                        <button className="h-8 px-3 rounded-lg bg-surface-container text-xs font-medium hover:bg-surface-container-high transition-colors flex items-center justify-center gap-1">
                          <Eye size={14} /> View
                        </button>
                        <button className="h-8 px-3 rounded-lg bg-surface-container text-xs font-medium hover:bg-surface-container-high transition-colors flex items-center justify-center gap-1">
                          <Download size={14} /> Export
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {routes.length === 0 && activeRoutes.length === 0 && (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <Route className="mx-auto text-outline mb-4" size={48} />
                    <h3 className="text-lg font-semibold text-on-surface mb-2">No Routes Found</h3>
                    <p className="text-sm text-on-surface-variant">Run optimization to generate routes.</p>
                  </div>
                </div>
              )}
            </section>
          </div>
        )}

        {activeTab === 'tracking' && (
          <div className="flex h-full">
            {/* Real-time Tracking */}
            <section className="flex-1 flex flex-col p-10 overflow-hidden relative">
              <div className="flex items-center justify-between mb-8 shrink-0">
                <div>
                  <h1 className="text-3xl font-bold font-headline text-on-surface tracking-tight">Real-time Tracking</h1>
                  <p className="text-on-surface-variant text-sm mt-1">Monitor active routes and vehicle progress</p>
                </div>
                <div className="flex gap-3">
                  <button className="h-10 px-5 rounded-xl bg-surface-container-highest border border-outline-variant/30 font-bold text-sm flex items-center gap-2 hover:bg-surface-variant transition-colors">
                    <Filter size={18} />
                    Filter
                  </button>
                  <button 
                    onClick={loadRoutes}
                    className="h-10 px-5 rounded-xl bg-surface-container-highest border border-outline-variant/30 font-bold text-sm flex items-center gap-2 hover:bg-surface-variant transition-colors"
                  >
                    <RefreshCw size={18} />
                    Refresh
                  </button>
                </div>
              </div>

              {/* Active Routes Tracking */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-y-auto flex-1">
                {activeRoutes.map((route) => (
                  <div key={route.route_id} className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 overflow-hidden">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Navigation className="text-primary" size={20} />
                          <h3 className="font-bold text-on-surface">{route.vehicle_id}</h3>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          route.tracking_status === 'on_time' ? 'bg-green-100 text-green-800' :
                          route.tracking_status === 'delayed' ? 'bg-amber-100 text-amber-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {route.tracking_status}
                        </span>
                      </div>

                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-on-surface-variant">Progress</span>
                          <span className="font-medium">{route.progress_percentage || 0}%</span>
                        </div>
                        <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all ${
                              route.tracking_status === 'on_time' ? 'bg-success' :
                              route.tracking_status === 'delayed' ? 'bg-warning' :
                              'bg-error'
                            }`}
                            style={{ width: `${route.progress_percentage || 0}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="space-y-3 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-on-surface-variant">Driver</span>
                          <span className="font-medium">{route.driver_name}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-on-surface-variant">Next Stop</span>
                          <span className="font-medium">{route.next_stop?.location_name || 'None'}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-on-surface-variant">Delay</span>
                          <span className={`font-medium ${route.delay_mins > 0 ? 'text-error' : 'text-success'}`}>
                            {route.delay_mins > 0 ? `+${route.delay_mins} min` : 'On time'}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button className="flex-1 h-8 rounded-lg bg-primary text-white text-xs font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-1">
                          <Map size={14} /> View Map
                        </button>
                        <button className="h-8 px-3 rounded-lg bg-surface-container text-xs font-medium hover:bg-surface-container-high transition-colors flex items-center justify-center gap-1">
                          <MessageSquare size={14} /> Contact
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {activeRoutes.length === 0 && (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <Map className="mx-auto text-outline mb-4" size={48} />
                    <h3 className="text-lg font-semibold text-on-surface mb-2">No Active Routes</h3>
                    <p className="text-sm text-on-surface-variant">Dispatch routes to start tracking.</p>
                  </div>
                </div>
              )}
            </section>
          </div>
        )}
      </main>

      {/* Modals */}
      {showAddPoint && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-outline/20 backdrop-blur-sm p-4">
          <div className="bg-surface-container-lowest w-full max-w-lg rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-outline-variant/10">
              <h3 className="text-xl font-bold text-on-surface font-headline">Add Delivery Point</h3>
              <button onClick={() => setShowAddPoint(false)} className="text-outline hover:text-on-surface p-1 rounded-lg hover:bg-surface-container"><X size={20} /></button>
            </div>
            <form className="p-6 flex flex-col gap-4" onSubmit={handleAddPoint}>
              <div><label className="text-xs font-bold text-on-surface-variant uppercase">Order ID</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="e.g. ORD-1099" 
                    value={pointForm.id} 
                    onChange={e => setPointForm(prev => ({ ...prev, id: e.target.value }))} 
                    className="mt-1 w-full h-10 bg-surface-container-low rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 flex-1" 
                  />
                  <button
                    type="button"
                    onClick={() => setPointForm(prev => ({ ...prev, id: generateId() }))}
                    className="mt-1 px-3 py-2 bg-surface-container-low hover:bg-surface-container text-sm font-medium text-on-surface rounded-lg transition-colors flex items-center gap-1"
                    title="Generate random ID"
                  >
                    <Zap size={14} /> Gen
                  </button>
                </div>
              </div>
              <div><label className="text-xs font-bold text-on-surface-variant uppercase">Tên điểm giao</label><input type="text" placeholder="e.g. Metro Grocers #42" required value={pointForm.name} onChange={e => setPointForm(prev => ({ ...prev, name: e.target.value }))} className="mt-1 w-full h-10 bg-surface-container-low rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" /></div>
              <div><label className="text-xs font-bold text-on-surface-variant uppercase">Address or Coordinates</label>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="e.g. 10 Downing St, London" 
                    required 
                    value={pointForm.address} 
                    onChange={e => { handleAddressChange(e.target.value); setSelectedGmapUrl(null); }}
                    onFocus={() => setShowSuggestions(addressSuggestions.length > 0)}
                    className="mt-1 w-full h-10 bg-surface-container-low rounded-lg pl-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" 
                  />
                  {selectedGmapUrl ? (
                    <a
                      href={selectedGmapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-primary hover:text-primary/70 transition-colors"
                      title="Xem trên Google Maps"
                    >
                      <ExternalLink size={16} />
                    </a>
                  ) : (
                    <MapPin size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-outline" />
                  )}
                  {showSuggestions && addressSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-surface-container-lowest border border-outline-variant/20 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                      {addressSuggestions.map((suggestion, index) => (
                        <div
                          key={suggestion.place_id || index}
                          className="flex items-center gap-2 border-b border-outline-variant/10 last:border-b-0 hover:bg-surface-container-low transition-colors"
                        >
                          <button
                            type="button"
                            className="flex-1 text-left px-3 py-2 text-sm"
                            onClick={() => handleSelectAddress(suggestion)}
                          >
                            <div className="font-medium text-on-surface">{suggestion.display_name}</div>
                            <div className="text-xs text-on-surface-variant mt-0.5">{suggestion.address}</div>
                          </button>
                          {suggestion.gmap_url && (
                            <a
                              href={suggestion.gmap_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-shrink-0 pr-3 text-primary hover:text-primary/70 transition-colors"
                              title="Xem trên Google Maps"
                              onClick={e => e.stopPropagation()}
                            >
                              <ExternalLink size={14} />
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-bold text-on-surface-variant uppercase">Latitude</label><input type="number" step="0.000001" placeholder="e.g. 10.7769" value={pointForm.lat || ''} onChange={e => setPointForm(prev => ({ ...prev, lat: e.target.value }))} className="mt-1 w-full h-10 bg-surface-container-low rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" /></div>
                <div><label className="text-xs font-bold text-on-surface-variant uppercase">Longitude</label><input type="number" step="0.000001" placeholder="e.g. 106.7009" value={pointForm.lng || ''} onChange={e => setPointForm(prev => ({ ...prev, lng: e.target.value }))} className="mt-1 w-full h-10 bg-surface-container-low rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-bold text-on-surface-variant uppercase">Demand / Weight (kg)</label><input type="number" step="0.1" required value={pointForm.demand} onChange={e => setPointForm(prev => ({ ...prev, demand: e.target.value }))} className="mt-1 w-full h-10 bg-surface-container-low rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" /></div>
                <div><label className="text-xs font-bold text-on-surface-variant uppercase">Priority</label>
                  <select value={pointForm.priority} onChange={e => setPointForm(prev => ({ ...prev, priority: e.target.value }))} className="mt-1 w-full h-10 bg-surface-container-low rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                    <option value="1">1 - High</option>
                    <option value="2">2 - Medium</option>
                    <option value="3">3 - Low</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-bold text-on-surface-variant uppercase">Service Time (mins)</label><input type="number" value={pointForm.service_time} onChange={e => setPointForm(prev => ({ ...prev, service_time: e.target.value }))} className="mt-1 w-full h-10 bg-surface-container-low rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" /></div>
                <div><label className="text-xs font-bold text-on-surface-variant uppercase">Phone</label><input type="tel" value={pointForm.phone} onChange={e => setPointForm(prev => ({ ...prev, phone: e.target.value }))} className="mt-1 w-full h-10 bg-surface-container-low rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="e.g. 0901234567" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-bold text-on-surface-variant uppercase">Time Window Start</label><input type="time" value={pointForm.time_window_start} onChange={e => setPointForm(prev => ({ ...prev, time_window_start: e.target.value }))} className="mt-1 w-full h-10 bg-surface-container-low rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" /></div>
                <div><label className="text-xs font-bold text-on-surface-variant uppercase">Time Window End</label><input type="time" value={pointForm.time_window_end} onChange={e => setPointForm(prev => ({ ...prev, time_window_end: e.target.value }))} className="mt-1 w-full h-10 bg-surface-container-low rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" /></div>
              </div>
              
              <button type="submit" disabled={isSubmittingPoint} className="mt-4 primary-gradient text-on-primary h-12 rounded-xl font-bold text-sm shadow-md disabled:opacity-60">
                {isSubmittingPoint ? 'Saving...' : 'Add Point to Route'}
              </button>
            </form>
          </div>
        </div>
      )}

      {showUpload && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-outline/20 backdrop-blur-sm p-4">
          <div className="bg-surface-container-lowest w-full max-w-md rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 p-8 text-center">
             <div className="w-16 h-16 bg-primary-fixed rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary">
               <FileSpreadsheet size={32} />
             </div>
             <h3 className="text-xl font-bold text-on-surface font-headline">Import Excel/CSV</h3>
             <p className="text-sm text-on-surface-variant mt-2 mb-6">Upload your master delivery list containing addresses, coordinates, and order weights. The system will auto-geocode missing coordinates.</p>
             <div className="border-2 border-dashed border-outline-variant/30 rounded-xl p-8 mb-6 bg-surface-container-low/50 hover:bg-surface-container transition-colors cursor-pointer group">
               <Upload size={24} className="mx-auto text-outline group-hover:text-primary transition-colors mb-2" />
               <p className="text-sm font-bold text-on-surface">Click to browse or drag & drop</p>
               <p className="text-xs text-on-surface-variant mt-1">.xlsx, .csv (Max 10MB)</p>
               <input
                 type="file"
                 accept=".csv,.xlsx,.xls"
                 className="mt-4 w-full text-xs"
                 onChange={e => setManifestFile(e.target.files?.[0] || null)}
               />
               {manifestFile && <p className="text-xs mt-2 text-primary">Selected: {manifestFile.name}</p>}
             </div>
             <div className="flex gap-3 w-full">
               <button onClick={() => setShowUpload(false)} className="flex-1 h-12 rounded-xl bg-surface-container hover:bg-surface-container-high transition-colors font-bold text-sm text-on-surface">Cancel</button>
               <button disabled={isUploading} onClick={handleUploadManifest} className="flex-1 h-12 rounded-xl primary-gradient text-on-primary font-bold text-sm shadow-md disabled:opacity-60">
                 {isUploading ? 'Uploading...' : 'Upload Data'}
               </button>
             </div>
          </div>
        </div>
      )}

      {/* Delete Location Confirmation */}
      {deletingLocId && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-outline/20 backdrop-blur-sm p-4">
          <div className="bg-surface-container-lowest w-full max-w-sm rounded-2xl shadow-2xl p-8 text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-14 h-14 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-4"><Trash2 size={26} className="text-error" /></div>
            <h3 className="text-lg font-bold text-on-surface mb-2">Delete this point?</h3>
            <p className="text-sm text-on-surface-variant mb-6">This will remove it from all route calculations.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeletingLocId(null)} className="flex-1 h-10 rounded-xl bg-surface-container hover:bg-surface-container-high font-bold text-sm text-on-surface">Cancel</button>
              <button onClick={handleDeleteLocation} disabled={isDeletingLoc} className="flex-1 h-10 rounded-xl bg-error text-white font-bold text-sm disabled:opacity-60 hover:bg-error/90">
                {isDeletingLoc ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
