import React from 'react';
import { Settings, Save, Server, Globe2, Truck, Sliders, ShieldCheck } from 'lucide-react';

export default function SettingsView() {
  return (
    <div className="flex-1 overflow-y-auto p-8 lg:p-12 bg-background flex flex-col h-full">
      {/* Header */}
      <div className="flex justify-between items-end mb-10 shrink-0">
        <div>
          <h2 className="text-on-surface font-headline text-3xl font-extrabold tracking-tight">System Configuration</h2>
          <p className="text-on-surface-variant mt-2 text-sm">Manage global routing parameters, API integrations, and fleet defaults.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-surface-container text-on-surface px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-surface-container-high transition-colors">
            Reset Defaults
          </button>
          <button className="primary-gradient text-on-primary px-6 py-2.5 rounded-xl font-bold text-sm shadow-md hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2">
            <Save size={18} />
            Save Changes
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 pb-12">
        {/* Left Column - Form Sections */}
        <div className="xl:col-span-2 flex flex-col gap-8">
          
          {/* Optimization Engine */}
          <section className="bg-surface-container-lowest p-8 rounded-2xl border border-outline-variant/20 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <Server className="text-primary" size={24} />
              <h3 className="text-xl font-headline font-bold text-on-surface">Routing & Optimization Engine</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider">Distance Matrix Provider</label>
                <select className="w-full h-12 bg-surface-container-low border border-outline-variant/10 rounded-xl px-4 py-2 text-on-surface focus:ring-2 focus:ring-primary focus:border-transparent outline-none appearance-none font-medium">
                  <option>OSRM (Open Source Routing Machine)</option>
                  <option>Google Maps Routes API</option>
                  <option>GraphHopper API</option>
                  <option>Mapbox Navigation API</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider">Primary VRP Solver Algorithm</label>
                <select className="w-full h-12 bg-surface-container-low border border-outline-variant/10 rounded-xl px-4 py-2 text-on-surface focus:ring-2 focus:ring-primary focus:border-transparent outline-none appearance-none font-medium">
                  <option>Google OR-Tools (Default)</option>
                  <option>Clarke-Wright Savings</option>
                  <option>Genetic Algorithm (Experimental)</option>
                  <option>Simulated Annealing</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-2">
               <label className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider">API Key (Encrypted)</label>
               <input 
                 type="password" 
                 defaultValue="sk-test-1234567890abcdef" 
                 className="w-full h-12 bg-surface-container-low border border-outline-variant/10 rounded-xl px-4 py-2 text-on-surface focus:ring-2 focus:ring-primary focus:border-transparent outline-none font-mono"
               />
               <p className="text-xs text-outline mt-1 flex items-center gap-1">
                 <ShieldCheck size={14} /> Secured via AWS KMS
               </p>
            </div>
          </section>

          {/* Route Preferences */}
          <section className="bg-surface-container-lowest p-8 rounded-2xl border border-outline-variant/20 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <Sliders className="text-primary" size={24} />
              <h3 className="text-xl font-headline font-bold text-on-surface">Optimization Objectives</h3>
            </div>

            <div className="space-y-8">
               <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center text-sm font-bold text-on-surface">
                    <span>Minimize Total Distance</span>
                    <span>Balance Workload</span>
                    <span>Minimize Total Time (ETA)</span>
                  </div>
                  <input type="range" min="0" max="100" defaultValue="70" className="w-full h-2 bg-surface-container rounded-lg appearance-none cursor-pointer accent-primary" />
                  <p className="text-xs text-on-surface-variant">Currently heavily prioritizing minimizing total travel time to ensure tight delivery windows are met.</p>
               </div>

               <div className="h-px bg-outline-variant/10"></div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="flex items-center gap-3 p-4 border border-outline-variant/20 rounded-xl cursor-pointer hover:bg-surface-container-low transition-colors">
                    <input type="checkbox" defaultChecked className="w-5 h-5 rounded text-primary bg-surface-container-high border-transparent focus:ring-primary" />
                    <span className="font-semibold text-on-surface text-sm">Avoid Tolls</span>
                  </label>
                  <label className="flex items-center gap-3 p-4 border border-outline-variant/20 rounded-xl cursor-pointer hover:bg-surface-container-low transition-colors">
                    <input type="checkbox" className="w-5 h-5 rounded text-primary bg-surface-container-high border-transparent focus:ring-primary" />
                    <span className="font-semibold text-on-surface text-sm">Avoid Highways</span>
                  </label>
                  <label className="flex items-center gap-3 p-4 border border-outline-variant/20 rounded-xl cursor-pointer hover:bg-surface-container-low transition-colors">
                    <input type="checkbox" defaultChecked className="w-5 h-5 rounded text-primary bg-surface-container-high border-transparent focus:ring-primary" />
                    <span className="font-semibold text-on-surface text-sm">Strict Time Windows</span>
                  </label>
                  <label className="flex items-center gap-3 p-4 border border-outline-variant/20 rounded-xl cursor-pointer hover:bg-surface-container-low transition-colors">
                    <input type="checkbox" className="w-5 h-5 rounded text-primary bg-surface-container-high border-transparent focus:ring-primary" />
                    <span className="font-semibold text-on-surface text-sm">Allow U-Turns</span>
                  </label>
               </div>
            </div>
          </section>

          {/* Fleet Defaults */}
          <section className="bg-surface-container-lowest p-8 rounded-2xl border border-outline-variant/20 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <Truck className="text-primary" size={24} />
              <h3 className="text-xl font-headline font-bold text-on-surface">Global Fleet Defaults</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider">Default Max Capacity (kg)</label>
                <input 
                  type="number" 
                  defaultValue="2000" 
                  className="w-full h-12 bg-surface-container-low border border-outline-variant/10 rounded-xl px-4 py-2 text-on-surface focus:ring-2 focus:ring-primary focus:border-transparent outline-none font-medium"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider">Default Max Working Hours</label>
                <input 
                  type="number" 
                  defaultValue="8" 
                  className="w-full h-12 bg-surface-container-low border border-outline-variant/10 rounded-xl px-4 py-2 text-on-surface focus:ring-2 focus:ring-primary focus:border-transparent outline-none font-medium"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider">Service Time per Stop (mins)</label>
                <input 
                  type="number" 
                  defaultValue="15" 
                  className="w-full h-12 bg-surface-container-low border border-outline-variant/10 rounded-xl px-4 py-2 text-on-surface focus:ring-2 focus:ring-primary focus:border-transparent outline-none font-medium"
                />
              </div>
               <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider">Average Fuel Cost ($/km)</label>
                <input 
                  type="number"
                  step="0.01" 
                  defaultValue="1.45" 
                  className="w-full h-12 bg-surface-container-low border border-outline-variant/10 rounded-xl px-4 py-2 text-on-surface focus:ring-2 focus:ring-primary focus:border-transparent outline-none font-medium"
                />
              </div>
            </div>
          </section>

        </div>

        {/* Right Column - Status Region */}
        <div className="flex flex-col gap-6">
          <div className="bg-primary/5 p-6 rounded-2xl border border-primary/20">
             <div className="flex items-center gap-3 mb-4">
                <Globe2 className="text-primary" size={24} />
                <h4 className="font-bold text-lg text-primary-fixed-variant">System Status</h4>
             </div>
             <p className="text-sm text-on-surface-variant leading-relaxed mb-6">
               The optimization microservice is currently running on the `production-us-east-1` cluster. 
               All mapping protocols are online and responding within operational limits.
             </p>
             <div className="space-y-4">
               <div className="flex justify-between items-center bg-surface-container-lowest p-3 rounded-xl">
                 <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Matrix API Status</span>
                 <span className="text-xs font-bold text-success flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-success"></span> ONLINE</span>
               </div>
               <div className="flex justify-between items-center bg-surface-container-lowest p-3 rounded-xl">
                 <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Solver Node</span>
                 <span className="text-xs font-bold text-success flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-success"></span> HEALTHY</span>
               </div>
               <div className="flex justify-between items-center bg-surface-container-lowest p-3 rounded-xl">
                 <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Last Sync</span>
                 <span className="text-xs font-bold text-on-surface font-mono">2 mins ago</span>
               </div>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}
