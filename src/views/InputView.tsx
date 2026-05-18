import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Truck, Upload, Plus, Edit2, Trash2, ChevronLeft, ChevronRight, Map as MapIcon, AlertTriangle, Settings2, MessageSquare, Route, X, FileSpreadsheet, MapPin, Zap, Play, Pause, Square, RefreshCw, BarChart3, Clock, Users, TrendingUp, Settings, CheckCircle, AlertCircle, Navigation, Calendar, Filter, Download, Eye, ExternalLink } from 'lucide-react';
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
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
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
  const [deletingRouteId, setDeletingRouteId] = useState<string | null>(null);
  const [isDeletingRoute, setIsDeletingRoute] = useState(false);
  
  // Metrics State
  const [metrics, setMetrics] = useState<any>(null);
  
  // Optimize stepper state — sync với URL ?step=
  const stepFromUrl = parseInt(searchParams.get('step') || '1') as 1 | 2 | 3 | 4 | 5 | 6;
  const [optimizeStep, setOptimizeStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(
    stepFromUrl >= 1 && stepFromUrl <= 4 ? stepFromUrl : 1
  );
  const [depots, setDepots] = useState<any[]>([]);
  const [selectedDepotId, setSelectedDepotId] = useState<string | null>(null);
  const [selectedVehicleIds, setSelectedVehicleIds] = useState<string[]>([]);

  // UI State — sync với URL ?tab=
  const tabFromUrl = searchParams.get('tab') as 'setup' | 'optimize' | 'routes' | 'tracking' | null;
  const [activeTab, setActiveTab] = useState<'setup' | 'optimize' | 'routes' | 'tracking'>(tabFromUrl ?? 'setup');

  useEffect(() => {
    const t = searchParams.get('tab') as 'setup' | 'optimize' | 'routes' | 'tracking' | null;
    if (t && t !== activeTab) setActiveTab(t);
    const s = parseInt(searchParams.get('step') || '0');
    if (s >= 1 && s <= 4 && s !== optimizeStep) setOptimizeStep(s as 1 | 2 | 3 | 4 | 5 | 6);
  }, [searchParams]);

  const goToStep = (step: 1 | 2 | 3 | 4 | 5 | 6) => {
    setOptimizeStep(step);
    setSearchParams({ tab: 'optimize', step: String(step) }, { replace: true });
  };
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

  const loadDepots = () => {
    api.listDepots().then(setDepots).catch(console.error);
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
            setOptimizeStep(6);
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
    loadDepots();
    
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
    if (selectedVehicleIds.length === 0 || locations.length === 0) {
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
        vehicles: selectedVehicleIds,
        locations: locations.map(loc => loc.id),
        constraints: optimizeSettings.constraints,
      });

      setCurrentJob({ job_id: runRes.job_id, status: 'calculating' });
      setOptimizeStep(5);
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

  const handleDeleteRoute = async () => {
    if (!deletingRouteId) return;
    setIsDeletingRoute(true);
    try {
      await api.deleteRoute(deletingRouteId);
      setDeletingRouteId(null);
      loadRoutes();
      loadMetrics();
    } catch (error) {
      console.error(error);
      window.alert('Xóa lộ trình thất bại.');
    } finally {
      setIsDeletingRoute(false);
    }
  };

  const handleExportRoute = async (routeId: string, format: 'json' | 'xlsx') => {
    try {
      const blob = await api.exportRoute(routeId, format);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `route-${routeId}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      window.alert('Export thất bại.');
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

  const handleEditLocation = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingLoc?.id) return;
    if (!pointForm.name.trim()) { window.alert('Vui lòng nhập tên điểm giao.'); return; }
    console.log('[DEBUG] Submit editLocation:', { id: editingLoc.id, lat: pointForm.lat, lng: pointForm.lng, address: pointForm.address });
    try {
      setIsSubmittingPoint(true);
      await api.updateLocation(editingLoc.id, {
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
      setShowAddPoint(false);
      setEditingLoc(null);
      setPointForm({ id: '', name: '', address: '', lat: '', lng: '', demand: '', service_time: '15', time_window_start: '', time_window_end: '', priority: '1', phone: '' });
      await loadFleetAndLocations();
    } catch (error) { console.error(error); window.alert('Cập nhật thất bại.'); }
    finally { setIsSubmittingPoint(false); }
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
            { id: 'tracking', label: 'Tracking', icon: MapIcon },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => {
              setActiveTab(id as any);
              const params: Record<string, string> = { tab: id };
              if (id === 'optimize') params.step = String(optimizeStep);
              setSearchParams(params, { replace: true });
            }}
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
                                <button 
                                  onClick={() => {
                                    setEditingLoc(loc);
                                    setPointForm({
                                      id: loc.id || '',
                                      name: loc.name || '',
                                      address: loc.address_string || loc.address || '',
                                      lat: (loc.coordinates?.lat ?? loc.lat)?.toString() || '',
                                      lng: (loc.coordinates?.lng ?? loc.lng)?.toString() || '',
                                      demand: loc.demand_kg?.toString() || loc.demand?.toString() || '',
                                      service_time: loc.service_time_mins?.toString() || '15',
                                      time_window_start: loc.time_window_start || '',
                                      time_window_end: loc.time_window_end || '',
                                      priority: loc.priority?.toString() || '1',
                                      phone: loc.phone || '',
                                    });
                                    setShowAddPoint(true);
                                  }}
                                  className="p-2 text-outline hover:text-primary bg-surface-container-low rounded-lg hover:bg-primary/10 transition-colors"
                                >
                                  <Edit2 size={14} />
                                </button>
                                <button 
                                  onClick={() => setDeletingLocId(loc.id)}
                                  className="p-2 text-outline hover:text-error bg-surface-container-low rounded-lg hover:bg-error/10 transition-colors"
                                >
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
                     <div className="p-4 bg-primary rounded-2xl text-on-primary shadow-lg shadow-primary/20"><MapIcon size={24} /></div>
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

        {activeTab === 'optimize' && (() => {
          const selectedDepot = depots.find(d => d.id === selectedDepotId);
          const eligibleVehicles = fleet.filter(v => v.driver_id && v.depot_id === selectedDepotId);
          const selectedVehicles = fleet.filter(v => selectedVehicleIds.includes(v.id));
          const selectedCapacity = selectedVehicles.reduce((s, v) => s + (v.capacity_kg || 0), 0);
          const capacityShortfall = totalDemand > selectedCapacity;
          const token = localStorage.getItem('access_token') || '';

          const STEPS = [
            { n: 1, label: 'Điểm giao' },
            { n: 2, label: 'Depot' },
            { n: 3, label: 'Chọn xe' },
            { n: 4, label: 'Thuật toán' },
            { n: 5, label: 'Đang chạy' },
            { n: 6, label: 'Kết quả' },
          ];

          return (
            <div className="flex flex-col h-full overflow-hidden">
              {/* Stepper header */}
              <div className="shrink-0 px-10 pt-6 pb-4 bg-surface-container-low border-b border-outline-variant/15">
                <div className="flex items-center gap-0">
                  {STEPS.map((s, i) => (
                    <React.Fragment key={s.n}>
                      <div className="flex flex-col items-center gap-1">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                          optimizeStep > s.n ? 'bg-primary text-on-primary' :
                          optimizeStep === s.n ? 'bg-primary text-on-primary ring-4 ring-primary/20' :
                          'bg-surface-container text-on-surface-variant'
                        }`}>
                          {optimizeStep > s.n ? <CheckCircle size={14} /> : s.n}
                        </div>
                        <span className={`text-[10px] font-semibold whitespace-nowrap ${optimizeStep === s.n ? 'text-primary' : 'text-on-surface-variant'}`}>{s.label}</span>
                      </div>
                      {i < STEPS.length - 1 && (
                        <div className={`flex-1 h-0.5 mx-1 mb-4 ${optimizeStep > s.n ? 'bg-primary' : 'bg-surface-container-high'}`} />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Step content */}
              <div className="flex-1 overflow-y-auto px-10 py-8">

                {/* ── BƯỚC 1: Điểm giao hàng ── */}
                {optimizeStep === 1 && (
                  <div className="max-w-2xl mx-auto">
                    <h2 className="text-2xl font-bold font-headline text-on-surface mb-2">Điểm giao hàng</h2>
                    <p className="text-on-surface-variant text-sm mb-6">Kiểm tra danh sách điểm giao trước khi tối ưu.</p>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="rounded-xl bg-surface-container-low border border-outline-variant/10 p-5 flex flex-col gap-1">
                        <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Số điểm giao</span>
                        <span className="text-3xl font-bold text-primary font-headline">{locations.length}</span>
                      </div>
                      <div className="rounded-xl bg-surface-container-low border border-outline-variant/10 p-5 flex flex-col gap-1">
                        <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Tổng demand</span>
                        <span className="text-3xl font-bold text-primary font-headline">{totalDemand} <span className="text-base font-medium opacity-60">kg</span></span>
                      </div>
                    </div>
                    {locations.length === 0 && (
                      <div className="mb-6 p-4 rounded-xl bg-error/10 border border-error/20 flex items-center gap-3 text-error text-sm font-medium">
                        <AlertTriangle size={18} className="shrink-0" />
                        Chưa có điểm giao nào. Vui lòng thêm điểm ở tab Setup.
                      </div>
                    )}
                    <div className="rounded-xl bg-surface-container-lowest border border-outline-variant/10 overflow-hidden mb-6">
                      <table className="w-full border-collapse text-left">
                        <thead className="bg-surface-container-low">
                          <tr>
                            <th className="px-4 py-3 text-xs font-bold text-outline uppercase tracking-wider">Tên</th>
                            <th className="px-4 py-3 text-xs font-bold text-outline uppercase tracking-wider">Địa chỉ</th>
                            <th className="px-4 py-3 text-xs font-bold text-outline uppercase tracking-wider">Demand (kg)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant/10">
                          {locations.length === 0 ? (
                            <tr><td colSpan={3} className="px-4 py-3 text-sm text-on-surface-variant text-center">Không có dữ liệu</td></tr>
                          ) : locations.map((loc, idx) => (
                            <tr key={loc.id || idx} className="hover:bg-surface-container-low/50">
                              <td className="px-4 py-3 text-sm font-semibold text-on-surface">{loc.name}</td>
                              <td className="px-4 py-3 text-xs text-on-surface-variant max-w-xs truncate">{loc.address_string || loc.address || '—'}</td>
                              <td className="px-4 py-3 text-sm font-mono">{loc.demand_kg || 0}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="flex justify-end">
                      <button
                        disabled={locations.length === 0}
                        onClick={() => goToStep(2)}
                        className="h-11 px-8 rounded-xl bg-primary text-on-primary font-bold text-sm flex items-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Tiếp theo <ChevronRight size={18} />
                      </button>
                    </div>
                  </div>
                )}

                {/* ── BƯỚC 2: Chọn Depot ── */}
                {optimizeStep === 2 && (
                  <div className="max-w-2xl mx-auto">
                    <h2 className="text-2xl font-bold font-headline text-on-surface mb-2">Chọn Depot</h2>
                    <p className="text-on-surface-variant text-sm mb-6">Chọn kho xuất phát cho chuyến hàng này.</p>
                    {depots.length === 0 ? (
                      <div className="mb-6 space-y-4">
                        <div className="p-4 rounded-xl bg-error/10 border border-error/20 flex items-start gap-3 text-error text-sm">
                          <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                          <div>
                            <p className="font-semibold">Chưa có depot nào trong hệ thống.</p>
                            <p className="text-error/80 mt-0.5">Bạn cần tạo ít nhất một depot trước khi tối ưu lộ trình.</p>
                          </div>
                        </div>
                        <button
                          onClick={() => navigate('/admin')}
                          className="flex items-center gap-2 h-11 px-6 rounded-xl bg-primary text-on-primary font-bold text-sm hover:bg-primary/90 transition-colors"
                        >
                          <ExternalLink size={16} /> Đến trang Admin để tạo Depot
                        </button>
                      </div>
                    ) : (
                      <div className="grid gap-3 mb-6">
                        {depots.map(depot => {
                          const depotVehicles = fleet.filter(v => v.depot_id === depot.id);
                          const isSelected = selectedDepotId === depot.id;
                          return (
                            <button
                              key={depot.id}
                              onClick={() => { setSelectedDepotId(depot.id); setSelectedVehicleIds([]); }}
                              className={`w-full text-left p-5 rounded-xl border-2 transition-all ${
                                isSelected
                                  ? 'border-primary bg-primary/5'
                                  : 'border-outline-variant/20 bg-surface-container-lowest hover:border-primary/40 hover:bg-surface-container-low'
                              }`}
                            >
                              <div className="flex items-start justify-between">
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <MapPin size={16} className={isSelected ? 'text-primary' : 'text-outline'} />
                                    <span className="font-bold text-on-surface">{depot.name}</span>
                                  </div>
                                  <p className="text-xs text-on-surface-variant ml-6">{depot.address || `${depot.coordinates?.lat?.toFixed(4)}, ${depot.coordinates?.lng?.toFixed(4)}`}</p>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  <span className="text-xs bg-surface-container px-2 py-1 rounded-full font-medium text-on-surface-variant">
                                    {depotVehicles.length} xe
                                  </span>
                                  {isSelected && <CheckCircle size={18} className="text-primary" />}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                    <div className="flex justify-between">
                      <button onClick={() => goToStep(1)} className="h-11 px-6 rounded-xl bg-surface-container-high font-bold text-sm flex items-center gap-2 hover:bg-surface-container-highest transition-colors">
                        <ChevronLeft size={18} /> Quay lại
                      </button>
                      <button
                        disabled={!selectedDepotId}
                        onClick={() => goToStep(3)}
                        className="h-11 px-8 rounded-xl bg-primary text-on-primary font-bold text-sm flex items-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Tiếp theo <ChevronRight size={18} />
                      </button>
                    </div>
                  </div>
                )}

                {/* ── BƯỚC 3: Chọn xe ── */}
                {optimizeStep === 3 && (
                  <div className="max-w-2xl mx-auto">
                    <h2 className="text-2xl font-bold font-headline text-on-surface mb-2">Chọn xe</h2>
                    <p className="text-on-surface-variant text-sm mb-1">Chỉ hiển thị xe có tài xế thuộc depot <span className="font-semibold text-on-surface">{selectedDepot?.name}</span>.</p>

                    {/* Capacity bar */}
                    <div className={`mb-5 p-4 rounded-xl border ${capacityShortfall && selectedVehicleIds.length > 0 ? 'bg-error/10 border-error/20' : 'bg-surface-container-low border-outline-variant/10'}`}>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-semibold text-on-surface-variant">Capacity đã chọn / Tổng demand</span>
                        <span className={`font-bold ${capacityShortfall && selectedVehicleIds.length > 0 ? 'text-error' : 'text-primary'}`}>
                          {selectedCapacity} / {totalDemand} kg
                        </span>
                      </div>
                      <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${capacityShortfall && selectedVehicleIds.length > 0 ? 'bg-error' : 'bg-primary'}`}
                          style={{ width: `${Math.min(totalDemand > 0 ? (selectedCapacity / totalDemand) * 100 : 0, 100)}%` }}
                        />
                      </div>
                      {capacityShortfall && selectedVehicleIds.length > 0 && (
                        <p className="text-xs text-error mt-2 font-medium">Cảnh báo: Tổng capacity xe chưa đủ để giao hết hàng.</p>
                      )}
                    </div>

                    {eligibleVehicles.length === 0 ? (
                      <div className="mb-6 space-y-4">
                        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-amber-700 text-sm">
                          <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                          <div>
                            <p className="font-semibold">Không có xe nào sẵn sàng tại depot này.</p>
                            <p className="text-amber-600 mt-0.5">Chỉ hiển thị xe đã được gán tài xế. Vui lòng cấu hình xe và tài xế ở trang Admin.</p>
                          </div>
                        </div>
                        <button
                          onClick={() => navigate('/admin')}
                          className="flex items-center gap-2 h-11 px-6 rounded-xl bg-primary text-on-primary font-bold text-sm hover:bg-primary/90 transition-colors"
                        >
                          <ExternalLink size={16} /> Đến trang Admin để cấu hình xe
                        </button>
                      </div>
                    ) : (
                      <div className="grid gap-3 mb-6">
                        {eligibleVehicles.map(v => {
                          const isChecked = selectedVehicleIds.includes(v.id);
                          return (
                            <label
                              key={v.id}
                              className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                isChecked
                                  ? 'border-primary bg-primary/5'
                                  : 'border-outline-variant/20 bg-surface-container-lowest hover:border-primary/30 hover:bg-surface-container-low'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => setSelectedVehicleIds(prev =>
                                  prev.includes(v.id) ? prev.filter(id => id !== v.id) : [...prev, v.id]
                                )}
                                className="mt-1 w-4 h-4 rounded accent-primary shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <Truck size={15} className={isChecked ? 'text-primary' : 'text-outline'} />
                                  <span className="font-bold text-sm text-on-surface">{v.name || v.id}</span>
                                  <span className="text-xs font-mono text-on-surface-variant bg-surface-container px-2 py-0.5 rounded">{v.license_plate || '—'}</span>
                                </div>
                                <div className="flex gap-4 text-xs text-on-surface-variant ml-5">
                                  <span>Tải trọng: <b className="text-on-surface">{v.capacity_kg || 0} kg</b></span>
                                  <span>Tài xế: <b className="text-on-surface">{v.driver_name || v.driver_id}</b></span>
                                  <span className={`font-bold ${v.status === 'available' ? 'text-green-600' : 'text-amber-600'}`}>{v.status}</span>
                                </div>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    )}

                    <div className="flex justify-between">
                      <button onClick={() => goToStep(2)} className="h-11 px-6 rounded-xl bg-surface-container-high font-bold text-sm flex items-center gap-2 hover:bg-surface-container-highest transition-colors">
                        <ChevronLeft size={18} /> Quay lại
                      </button>
                      <button
                        disabled={selectedVehicleIds.length === 0}
                        onClick={() => goToStep(4)}
                        className="h-11 px-8 rounded-xl bg-primary text-on-primary font-bold text-sm flex items-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Tiếp theo <ChevronRight size={18} />
                      </button>
                    </div>
                  </div>
                )}

                {/* ── BƯỚC 4: Cài đặt thuật toán ── */}
                {optimizeStep === 4 && (
                  <div className="max-w-2xl mx-auto">
                    <h2 className="text-2xl font-bold font-headline text-on-surface mb-2">Cài đặt thuật toán</h2>
                    <p className="text-on-surface-variant text-sm mb-6">Chọn thuật toán và mục tiêu tối ưu.</p>
                    <div className="space-y-5 mb-8">
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-on-surface-variant">Thuật toán</label>
                        <select
                          value={optimizeSettings.solver_algorithm}
                          onChange={(e) => setOptimizeSettings(prev => ({ ...prev, solver_algorithm: e.target.value }))}
                          className="w-full h-12 bg-surface-container-lowest border border-outline-variant/10 rounded-xl px-4 text-on-surface focus:ring-2 focus:ring-primary/30 outline-none"
                        >
                          <option value="nearest_neighbor">Nearest Neighbor</option>
                          <option value="genetic_algorithm">Genetic Algorithm</option>
                          <option value="clarke_wright_savings">Clarke-Wright Savings</option>
                        </select>
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-on-surface-variant">Mục tiêu</label>
                        <select
                          value={optimizeSettings.objective}
                          onChange={(e) => setOptimizeSettings(prev => ({ ...prev, objective: e.target.value }))}
                          className="w-full h-12 bg-surface-container-lowest border border-outline-variant/10 rounded-xl px-4 text-on-surface focus:ring-2 focus:ring-primary/30 outline-none"
                        >
                          <option value="minimize_distance">Minimize Distance</option>
                          <option value="minimize_time">Minimize Time</option>
                          <option value="minimize_cost">Minimize Cost</option>
                        </select>
                      </div>
                      <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-on-surface-variant">Ràng buộc</h3>
                        {[
                          { key: 'strict_time_windows', label: 'Strict Time Windows', icon: Clock },
                          { key: 'respect_capacity', label: 'Respect Capacity', icon: Truck },
                          { key: 'avoid_tolls', label: 'Avoid Tolls', icon: Navigation },
                        ].map(({ key, label, icon: Icon }) => (
                          <label key={key} className="flex items-center gap-3 cursor-pointer p-3 bg-surface-container-lowest rounded-lg border border-outline-variant/10 hover:bg-surface-container transition-colors">
                            <input
                              type="checkbox"
                              checked={(optimizeSettings.constraints as any)[key]}
                              onChange={(e) => setOptimizeSettings(prev => ({
                                ...prev,
                                constraints: { ...prev.constraints, [key]: e.target.checked }
                              }))}
                              className="w-4 h-4 rounded accent-primary"
                            />
                            <div className="flex items-center gap-2 text-sm font-medium text-on-surface">
                              <Icon size={15} className="text-primary" /> {label}
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <button onClick={() => goToStep(3)} className="h-11 px-6 rounded-xl bg-surface-container-high font-bold text-sm flex items-center gap-2 hover:bg-surface-container-highest transition-colors">
                        <ChevronLeft size={18} /> Quay lại
                      </button>
                      <button
                        onClick={handleOptimize}
                        disabled={isOptimizing}
                        className="h-11 px-8 rounded-xl bg-primary text-on-primary font-bold text-sm flex items-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isOptimizing ? <><RefreshCw className="animate-spin" size={16} /> Đang gửi...</> : <><Play size={16} /> Chạy tối ưu</>}
                      </button>
                    </div>
                  </div>
                )}

                {/* ── BƯỚC 5: Đang chạy ── */}
                {optimizeStep === 5 && (
                  <div className="max-w-xl mx-auto flex flex-col items-center text-center pt-10">
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                      <RefreshCw size={36} className="text-primary animate-spin" />
                    </div>
                    <h2 className="text-2xl font-bold font-headline text-on-surface mb-2">Đang tối ưu lộ trình</h2>
                    <p className="text-on-surface-variant text-sm mb-8">Hệ thống đang tính toán phân công lộ trình tối ưu nhất cho {selectedVehicleIds.length} xe và {locations.length} điểm giao...</p>
                    <div className="w-full bg-surface-container rounded-full h-2 overflow-hidden mb-3">
                      <div className="h-full bg-primary rounded-full animate-pulse" style={{ width: '65%' }} />
                    </div>
                    <p className="text-xs text-on-surface-variant mb-8">
                      Job ID: <span className="font-mono">{currentJob?.job_id}</span>
                    </p>
                    {currentJob?.status === 'failed' && (
                      <div className="w-full p-4 rounded-xl bg-error/10 border border-error/20 text-error text-sm font-medium flex items-center gap-2 mb-4">
                        <AlertCircle size={16} /> Tối ưu thất bại. Vui lòng thử lại.
                      </div>
                    )}
                    <div className="flex gap-3">
                      {currentJob?.status === 'calculating' && (
                        <button
                          onClick={async () => { await handleCancelJob(); setOptimizeStep(4); }}
                          className="h-10 px-6 rounded-xl bg-error text-white font-bold text-sm flex items-center gap-2 hover:bg-error/90 transition-colors"
                        >
                          <Square size={15} /> Hủy job
                        </button>
                      )}
                      {currentJob?.status === 'failed' && (
                        <button onClick={() => setOptimizeStep(4)} className="h-10 px-6 rounded-xl bg-surface-container-high font-bold text-sm flex items-center gap-2 hover:bg-surface-container-highest transition-colors">
                          <ChevronLeft size={15} /> Thử lại
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* ── BƯỚC 6: Kết quả ── */}
                {optimizeStep === 6 && currentJob && (
                  <div className="max-w-3xl mx-auto">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckCircle size={22} className="text-green-600" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold font-headline text-on-surface">Tối ưu hoàn tất!</h2>
                        <p className="text-on-surface-variant text-sm">Job: <span className="font-mono">{currentJob.job_id}</span></p>
                      </div>
                    </div>

                    {/* Summary cards */}
                    <div className="grid grid-cols-4 gap-4 mb-6">
                      {[
                        { label: 'Lộ trình', value: currentJob.result?.routes?.length ?? 0, unit: '' },
                        { label: 'Tổng km', value: currentJob.result?.total_distance_km ?? 0, unit: 'km' },
                        { label: 'Thời gian', value: Math.round(currentJob.result?.total_duration_mins ?? 0), unit: 'phút' },
                        { label: 'Chi phí', value: currentJob.result?.total_cost ?? 0, unit: '$' },
                      ].map(c => (
                        <div key={c.label} className="rounded-xl bg-surface-container-low border border-outline-variant/10 p-4 text-center">
                          <div className="text-2xl font-bold text-primary font-headline">{c.value}<span className="text-sm font-medium opacity-60 ml-1">{c.unit}</span></div>
                          <div className="text-xs text-on-surface-variant mt-1">{c.label}</div>
                        </div>
                      ))}
                    </div>

                    {/* Routes table */}
                    {currentJob.result?.routes && currentJob.result.routes.length > 0 && (
                      <div className="rounded-xl bg-surface-container-lowest border border-outline-variant/10 overflow-hidden mb-6">
                        <table className="w-full border-collapse text-left">
                          <thead className="bg-surface-container-low">
                            <tr>
                              <th className="px-4 py-3 text-xs font-bold text-outline uppercase">Lộ trình</th>
                              <th className="px-4 py-3 text-xs font-bold text-outline uppercase">Xe</th>
                              <th className="px-4 py-3 text-xs font-bold text-outline uppercase">Stops</th>
                              <th className="px-4 py-3 text-xs font-bold text-outline uppercase">Km</th>
                              <th className="px-4 py-3 text-xs font-bold text-outline uppercase">Tải (kg)</th>
                              <th className="px-4 py-3 text-xs font-bold text-outline uppercase">Sử dụng</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-outline-variant/10">
                            {currentJob.result.routes.map((r: any, idx: number) => (
                              <tr key={r.route_id || idx} className="hover:bg-surface-container-low/50">
                                <td className="px-4 py-3 font-mono text-xs text-primary">{r.route_id || `Route ${idx + 1}`}</td>
                                <td className="px-4 py-3 text-sm font-medium">{r.vehicle_id}</td>
                                <td className="px-4 py-3 text-sm">{r.stop_count}</td>
                                <td className="px-4 py-3 text-sm font-mono">{r.distance_km ?? r.total_distance_km ?? 0}</td>
                                <td className="px-4 py-3 text-sm font-mono">{r.load_kg}</td>
                                <td className="px-4 py-3">
                                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${(r.utilization_pct || 0) > 90 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                    {r.utilization_pct || 0}%
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => { setOptimizeStep(1); setSelectedDepotId(null); setSelectedVehicleIds([]); setCurrentJob(null); setIsOptimizing(false); }}
                        className="h-11 px-6 rounded-xl bg-surface-container-high font-bold text-sm flex items-center gap-2 hover:bg-surface-container-highest transition-colors"
                      >
                        <RefreshCw size={16} /> Tối ưu mới
                      </button>
                      <a
                        href={`http://localhost:8501?job_id=${currentJob.job_id}&token=${encodeURIComponent(token)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-11 px-8 rounded-xl bg-primary text-on-primary font-bold text-sm flex items-center gap-2 hover:bg-primary/90 transition-colors"
                      >
                        <ExternalLink size={16} /> Xem trực quan (Streamlit)
                      </a>
                    </div>
                  </div>
                )}

              </div>
            </div>
          );
        })()}

        {activeTab === 'routes' && (
          <div className="flex h-full">
            {/* Routes List */}
            <section className="flex-1 flex flex-col p-10 overflow-y-auto relative">
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
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 content-start pb-4">
                {(Array.from(new Map([...routes, ...activeRoutes].map(r => [r.id || r.route_id, r])).values()) as any[]).map((route) => (
                  <div key={route.id || route.route_id} className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 hover:shadow-lg transition-shadow">
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
                        <button
                          onClick={() => setSelectedRoute(route)}
                          className="h-8 px-3 rounded-lg bg-surface-container text-xs font-medium hover:bg-surface-container-high transition-colors flex items-center justify-center gap-1"
                        >
                          <Eye size={14} /> View
                        </button>
                        <button
                          onClick={() => handleExportRoute(route.id || route.route_id, 'xlsx')}
                          className="h-8 px-3 rounded-lg bg-surface-container text-xs font-medium hover:bg-surface-container-high transition-colors flex items-center justify-center gap-1"
                        >
                          <Download size={14} /> Export
                        </button>
                        <button
                          onClick={() => setDeletingRouteId(route.id || route.route_id)}
                          className="h-8 px-3 rounded-lg bg-error/10 text-error text-xs font-medium hover:bg-error/20 transition-colors flex items-center justify-center gap-1"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Delete Route Confirm */}
              {deletingRouteId && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-outline/20 backdrop-blur-sm">
                  <div className="bg-surface-container-lowest rounded-2xl shadow-2xl p-8 text-center w-80">
                    <Trash2 size={28} className="text-error mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-on-surface mb-2">Xóa lộ trình?</h3>
                    <p className="text-sm text-on-surface-variant mb-6">Hành động này không thể hoàn tác.</p>
                    <div className="flex gap-3">
                      <button onClick={() => setDeletingRouteId(null)} className="flex-1 h-10 rounded-xl bg-surface-container font-bold text-sm">Hủy</button>
                      <button onClick={handleDeleteRoute} disabled={isDeletingRoute} className="flex-1 h-10 rounded-xl bg-error text-white font-bold text-sm disabled:opacity-60">
                        {isDeletingRoute ? 'Đang xóa...' : 'Xóa'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

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
                          <MapIcon size={14} /> View Map
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
                    <MapIcon className="mx-auto text-outline mb-4" size={48} />
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
              <h3 className="text-xl font-bold text-on-surface font-headline">{editingLoc ? 'Edit Delivery Point' : 'Add Delivery Point'}</h3>
              <button onClick={() => { setShowAddPoint(false); setEditingLoc(null); setPointForm({ id: '', name: '', address: '', lat: '', lng: '', demand: '', service_time: '15', time_window_start: '', time_window_end: '', priority: '1', phone: '' }); }} className="text-outline hover:text-on-surface p-1 rounded-lg hover:bg-surface-container"><X size={20} /></button>
            </div>
            <form className="p-6 flex flex-col gap-4" onSubmit={editingLoc ? handleEditLocation : handleAddPoint}>
              <div><label className="text-xs font-bold text-on-surface-variant uppercase">Order ID</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="e.g. ORD-1099" 
                    value={pointForm.id} 
                    onChange={e => setPointForm(prev => ({ ...prev, id: e.target.value }))} 
                    readOnly={!!editingLoc}
                    className={`mt-1 w-full h-10 bg-surface-container-low rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 flex-1 ${editingLoc ? 'opacity-60 cursor-not-allowed' : ''}`} 
                  />
                  {!editingLoc && (
                    <button
                      type="button"
                      onClick={() => setPointForm(prev => ({ ...prev, id: generateId() }))}
                      className="mt-1 px-3 py-2 bg-surface-container-low hover:bg-surface-container text-sm font-medium text-on-surface rounded-lg transition-colors flex items-center gap-1"
                      title="Generate random ID"
                    >
                      <Zap size={14} /> Gen
                    </button>
                  )}
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
                {isSubmittingPoint ? 'Saving...' : (editingLoc ? 'Update Point' : 'Add Point to Route')}
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
