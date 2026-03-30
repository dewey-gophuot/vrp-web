import React, { useState, useEffect } from 'react';
import { Truck, Upload, Plus, MoreVertical, ChevronLeft, ChevronRight, Map, AlertTriangle, Settings2, MessageSquare, Route, X, FileSpreadsheet, MapPin } from 'lucide-react';
import api from '../api';

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
  const [pointForm, setPointForm] = useState({
    id: '',
    name: '',
    address: '',
    demand: 0,
    service_time: 15,
    time_window_start: '',
    time_window_end: '',
  });

  const loadFleetAndLocations = () => {
    Promise.all([api.getFleetVehicles(), api.getLocationDemands()])
      .then(([fleetRes, locationRes]) => {
        setFleet(fleetRes || []);
        setLocations(locationRes || []);
      })
      .catch(console.error);
  };

  useEffect(() => {
    loadFleetAndLocations();
  }, []);

  const activeVehicles = fleet.length;
  const totalCapacity = fleet.reduce((sum, v) => sum + (v.capacity_kg || 0), 0);
  const totalDemand = locations.reduce((sum, loc) => sum + (loc.demand_kg || loc.demand || 0), 0);
  
  const isOverloaded = totalCapacity > 0 && totalDemand > totalCapacity;
  const utilization = totalCapacity > 0 ? Math.round((totalDemand / totalCapacity) * 100) : 0;

  const handleAddPoint = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!pointForm.name.trim()) {
      window.alert('Vui lòng nhập tên điểm giao.');
      return;
    }

    try {
      setIsSubmittingPoint(true);
      await api.createLocation({
        id: pointForm.id || undefined,
        name: pointForm.name,
        address_string: pointForm.address,
        lat: 0,
        lng: 0,
        demand_kg: pointForm.demand,
        time_window_start: pointForm.time_window_start || undefined,
        time_window_end: pointForm.time_window_end || undefined,
        service_time_mins: pointForm.service_time,
      });
      loadFleetAndLocations();
      setShowAddPoint(false);
      setPointForm({
        id: '',
        name: '',
        address: '',
        demand: 0,
        service_time: 15,
        time_window_start: '',
        time_window_end: '',
      });
      window.alert('Đã thêm điểm giao thành công.');
    } catch (error) {
      console.error(error);
      window.alert('Không thể thêm điểm giao.');
    } finally {
      setIsSubmittingPoint(false);
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

  const handleOptimize = async () => {
    if (fleet.length === 0 || locations.length === 0) {
      setOptimizeMessage('Cần có ít nhất 1 xe và 1 điểm giao để tối ưu.');
      return;
    }

    try {
      setIsOptimizing(true);
      setOptimizeMessage('Đang gửi yêu cầu tối ưu...');

      const runRes = await api.runOptimizer({
        project_id: `project-${Date.now()}`,
        solver_algorithm: 'or-tools',
        vehicles: fleet.map(v => v.id),
        locations: locations.map(loc => loc.id),
        objective: 'minimize_distance',
        constraints: {
          strict_time_windows: true,
          respect_capacity: true,
        },
      });

      let completedResult: any = null;
      for (let i = 0; i < 20; i += 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const job = await api.getOptimizerJob(runRes.job_id);
        if (job.status === 'completed') {
          completedResult = job.result;
          break;
        }
      }

      if (completedResult) {
        const routeCount = completedResult.routes?.length || 0;
        setOptimizeMessage(`Tối ưu xong: ${routeCount} tuyến, tổng quãng đường ${completedResult.total_distance_km} km.`);
      } else {
        setOptimizeMessage('Yêu cầu đã tạo, thuật toán vẫn đang tính.');
      }
    } catch (error) {
      console.error(error);
      setOptimizeMessage('Chạy tối ưu thất bại.');
    } finally {
      setIsOptimizing(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-background relative">
      {/* Header */}
      <header className="flex items-center justify-between shrink-0 border-b border-outline-variant/15 bg-surface-container-lowest px-10 py-4">
        <div className="flex items-center gap-4 text-primary">
          <Route size={24} />
          <h2 className="text-on-surface text-lg font-bold font-headline">VRP Optimizer</h2>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleOptimize}
            className={`px-6 h-10 rounded-lg text-sm font-bold shadow-sm transition-all ${
              isOverloaded 
                ? 'bg-surface-container text-on-surface-variant cursor-not-allowed opacity-50' 
                : 'primary-gradient text-on-primary active:scale-95'
            }`}
            disabled={isOverloaded || isOptimizing}
          >
            {isOptimizing ? 'Optimizing...' : 'Optimize Route'}
          </button>
        </div>
      </header>

      {optimizeMessage && (
        <div className="px-10 pt-4">
          <div className="rounded-xl border border-outline-variant/20 bg-surface-container-low px-4 py-3 text-sm text-on-surface">
            {optimizeMessage}
          </div>
        </div>
      )}

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

            {/* Overload Alert UI */}
            {isOverloaded && (
              <div className="bg-error/10 border border-error/20 p-4 rounded-xl flex gap-3 text-error mt-2 animate-in slide-in-from-top-2">
                <AlertTriangle size={20} className="shrink-0" />
                <div>
                  <h4 className="font-bold text-sm">Capacity Exceeded</h4>
                  <p className="text-xs mt-1 text-on-surface-variant">
                    Total demand ({totalDemand} kg) exceeds fleet capacity ({totalCapacity} kg). Add more vehicles or increase capacity limits.
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
                    <th className="px-6 py-4 text-xs font-bold text-outline uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {locations.length === 0 ? (
                    <tr><td colSpan={5} className="px-6 py-4 text-center text-sm text-on-surface-variant">No locations found. Add or import points.</td></tr>
                  ) : (
                    locations.map((loc, idx) => (
                      <TableRow 
                        key={loc.id || idx} 
                        id={loc.id || `ORD-${idx+1}`} 
                        name={loc.name} 
                        address={loc.address_string || loc.address || 'Unknown'} 
                        demand={loc.demand_kg || loc.demand || 0} 
                        time={`${loc.time_window_start || 'Flexible'} - ${loc.time_window_end || ''}`} 
                        timeStyle="primary" 
                      />
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
                   <p className="text-on-surface-variant text-sm mt-1">Simulated Geocoding: 4/4 addresses mapped to coordinates.</p>
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
              <div><label className="text-xs font-bold text-on-surface-variant uppercase">Order ID</label><input type="text" placeholder="e.g. ORD-1099" value={pointForm.id} onChange={e => setPointForm(prev => ({ ...prev, id: e.target.value }))} className="mt-1 w-full h-10 bg-surface-container-low rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" /></div>
              <div><label className="text-xs font-bold text-on-surface-variant uppercase">Tên điểm giao</label><input type="text" placeholder="e.g. Metro Grocers #42" required value={pointForm.name} onChange={e => setPointForm(prev => ({ ...prev, name: e.target.value }))} className="mt-1 w-full h-10 bg-surface-container-low rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" /></div>
              <div><label className="text-xs font-bold text-on-surface-variant uppercase">Address or Coordinates</label>
                <div className="relative">
                  <input type="text" placeholder="e.g. 10 Downing St, London" required value={pointForm.address} onChange={e => setPointForm(prev => ({ ...prev, address: e.target.value }))} className="mt-1 w-full h-10 bg-surface-container-low rounded-lg pl-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  <MapPin size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-outline" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-bold text-on-surface-variant uppercase">Demand / Weight (kg)</label><input type="number" step="0.1" required value={pointForm.demand} onChange={e => setPointForm(prev => ({ ...prev, demand: Number(e.target.value) }))} className="mt-1 w-full h-10 bg-surface-container-low rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" /></div>
                <div><label className="text-xs font-bold text-on-surface-variant uppercase">Service Time (mins)</label><input type="number" value={pointForm.service_time} onChange={e => setPointForm(prev => ({ ...prev, service_time: Number(e.target.value) }))} className="mt-1 w-full h-10 bg-surface-container-low rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" /></div>
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

    </div>
  );
}

function TableRow({ id, name, address, demand, time, timeStyle }: any) {
  const getBadgeStyle = (style: string) => {
    switch (style) {
      case 'primary': return 'bg-surface-container-high text-primary';
      case 'secondary': return 'bg-secondary-container text-on-secondary-container';
      case 'tertiary': return 'bg-tertiary-fixed text-on-tertiary-fixed-variant';
      default: return 'bg-surface-container text-on-surface';
    }
  };

  return (
    <tr className="hover:bg-surface-container-low transition-colors group">
      <td className="px-6 py-5 font-mono font-bold text-primary text-[11px]"><span className="bg-primary/10 px-2 py-1 rounded">{id}</span></td>
      <td className="px-6 py-5">
        <p className="font-semibold text-on-surface text-sm">{name}</p>
        <p className="text-[11px] text-on-surface-variant mt-0.5">{address}</p>
      </td>
      <td className="px-6 py-5 text-on-surface text-sm font-mono">{demand}</td>
      <td className="px-6 py-5">
        <span className={`px-3 py-1.5 rounded-full text-[11px] font-bold ${getBadgeStyle(timeStyle)}`}>
          {time}
        </span>
      </td>
      <td className="px-6 py-5 text-right opacity-50 group-hover:opacity-100 transition-opacity">
        <button className="text-outline hover:text-primary transition-colors p-2 rounded-lg hover:bg-surface-container">
          <MoreVertical size={18} />
        </button>
      </td>
    </tr>
  );
}
