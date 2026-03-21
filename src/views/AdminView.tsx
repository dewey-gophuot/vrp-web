import React, { useState } from 'react';
import { Shield, Users, Truck, Key, Search, Plus, MoreVertical, Edit2, Trash2, Mail, CheckCircle2, XCircle, MapPin, X } from 'lucide-react';

export default function AdminView() {
  const [activeTab, setActiveTab] = useState('users');
  const [showModal, setShowModal] = useState<string | null>(null);

  const handleAddClick = () => {
    setShowModal(activeTab);
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 lg:p-12 bg-background flex flex-col h-full relative">
      {/* Header */}
      <div className="flex justify-between items-end mb-8 shrink-0">
        <div>
          <h2 className="text-on-surface font-headline text-3xl font-extrabold tracking-tight">Admin Center</h2>
          <p className="text-on-surface-variant mt-2 text-sm">Manage users, access roles, fleet records, depots, and integrations.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleAddClick}
            className="primary-gradient text-on-primary px-6 py-2.5 rounded-xl font-bold text-sm shadow-md hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2"
          >
            <Plus size={18} />
            {activeTab === 'users' ? 'Add User/Driver' : activeTab === 'fleet' ? 'Add Vehicle' : activeTab === 'depots' ? 'Add Depot' : 'Add Key'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-8 border-b border-outline-variant/20 shrink-0">
        <TabButton active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon={Users} label="Users & Drivers" />
        <TabButton active={activeTab === 'fleet'} onClick={() => setActiveTab('fleet')} icon={Truck} label="Fleet Database" />
        <TabButton active={activeTab === 'depots'} onClick={() => setActiveTab('depots')} icon={MapPin} label="Depots & Hubs" />
        <TabButton active={activeTab === 'api'} onClick={() => setActiveTab('api')} icon={Key} label="API Keys" />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden bg-surface-container-lowest rounded-2xl border border-outline-variant/20 shadow-sm relative">
        <div className="flex items-center justify-between p-5 border-b border-outline-variant/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-4 h-4" />
              <input type="text" placeholder={`Search ${activeTab}...`} className="pl-10 pr-4 py-2 bg-surface-container-low border border-outline-variant/10 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 w-64 outline-none text-on-surface placeholder:text-outline" />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {activeTab === 'users' && <UsersTable />}
          {activeTab === 'fleet' && <FleetTable />}
          {activeTab === 'depots' && <DepotsTable />}
          {activeTab === 'api' && <ApiKeysList />}
        </div>
      </div>

      {/* Modals */}
      {showModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-outline/20 backdrop-blur-sm p-4">
          <div className="bg-surface-container-lowest w-full max-w-md rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-outline-variant/10">
              <h3 className="text-xl font-bold text-on-surface font-headline">
                {showModal === 'users' ? 'Add User/Driver' : showModal === 'fleet' ? 'Add Vehicle' : showModal === 'depots' ? 'Add Depot' : 'Add Item'}
              </h3>
              <button onClick={() => setShowModal(null)} className="text-outline hover:text-on-surface transition-colors p-1 rounded-lg hover:bg-surface-container">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              {showModal === 'users' && <UserForm onClose={() => setShowModal(null)} />}
              {showModal === 'fleet' && <FleetForm onClose={() => setShowModal(null)} />}
              {showModal === 'depots' && <DepotForm onClose={() => setShowModal(null)} />}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, label }: any) {
  return (
    <button onClick={onClick} className={`flex items-center gap-2 px-6 py-4 font-bold text-sm border-b-2 transition-all ${active ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low/50 rounded-t-xl'}`}>
      <Icon size={18} />{label}
    </button>
  );
}

// ================= FORM COMPONENTS =================
function UserForm({ onClose }: { onClose: () => void }) {
  return (
    <form className="flex flex-col gap-4" onSubmit={(e) => { e.preventDefault(); onClose(); }}>
      <div><label className="text-xs font-bold text-on-surface-variant uppercase">Full Name</label><input type="text" required className="mt-1 w-full h-10 bg-surface-container-low rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" /></div>
      <div><label className="text-xs font-bold text-on-surface-variant uppercase">Email</label><input type="email" required className="mt-1 w-full h-10 bg-surface-container-low rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" /></div>
      <div>
        <label className="text-xs font-bold text-on-surface-variant uppercase">Role</label>
        <select className="mt-1 w-full h-10 bg-surface-container-low rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
          <option>Driver</option><option>Dispatcher</option><option>System Admin</option>
        </select>
      </div>
      <div>
        <label className="text-xs font-bold text-on-surface-variant uppercase">Assign Default Vehicle</label>
        <select className="mt-1 w-full h-10 bg-surface-container-low rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
          <option>None</option><option>VAN-0412</option><option>TRK-9902</option>
        </select>
      </div>
      <button type="submit" className="mt-4 primary-gradient text-on-primary h-10 rounded-lg font-bold text-sm">Save User</button>
    </form>
  );
}

function FleetForm({ onClose }: { onClose: () => void }) {
  return (
    <form className="flex flex-col gap-4" onSubmit={(e) => { e.preventDefault(); onClose(); }}>
      <div><label className="text-xs font-bold text-on-surface-variant uppercase">License/ID (Biển số)</label><input type="text" required className="mt-1 w-full h-10 bg-surface-container-low rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" /></div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="text-xs font-bold text-on-surface-variant uppercase">Max Weight (kg)</label><input type="number" required className="mt-1 w-full h-10 bg-surface-container-low rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" /></div>
        <div><label className="text-xs font-bold text-on-surface-variant uppercase">Max Volume (m³)</label><input type="number" required className="mt-1 w-full h-10 bg-surface-container-low rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" /></div>
      </div>
      <div>
        <label className="text-xs font-bold text-on-surface-variant uppercase">Vehicle Type</label>
        <select className="mt-1 w-full h-10 bg-surface-container-low rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
          <option>Delivery Van</option><option>Heavy Truck</option><option>Electric Van</option>
        </select>
      </div>
      <button type="submit" className="mt-4 primary-gradient text-on-primary h-10 rounded-lg font-bold text-sm">Save Vehicle</button>
    </form>
  );
}

function DepotForm({ onClose }: { onClose: () => void }) {
  return (
    <form className="flex flex-col gap-4" onSubmit={(e) => { e.preventDefault(); onClose(); }}>
      <div><label className="text-xs font-bold text-on-surface-variant uppercase">Depot Name</label><input type="text" required className="mt-1 w-full h-10 bg-surface-container-low rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" /></div>
      <div><label className="text-xs font-bold text-on-surface-variant uppercase">Address</label><input type="text" required className="mt-1 w-full h-10 bg-surface-container-low rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" /></div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="text-xs font-bold text-on-surface-variant uppercase">Latitude</label><input type="number" step="0.000001" className="mt-1 w-full h-10 bg-surface-container-low rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" /></div>
        <div><label className="text-xs font-bold text-on-surface-variant uppercase">Longitude</label><input type="number" step="0.000001" className="mt-1 w-full h-10 bg-surface-container-low rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" /></div>
      </div>
      <div className="flex items-center gap-2 mt-2">
         <span className="text-sm text-outline cursor-pointer hover:text-primary transition-colors flex items-center gap-1 font-medium"><MapPin size={16}/> Auto-Geocode from Address</span>
      </div>
      <button type="submit" className="mt-4 primary-gradient text-on-primary h-10 rounded-lg font-bold text-sm">Save Depot</button>
    </form>
  );
}

// ================= TABLE COMPONENTS =================
function UsersTable() {
  return (
    <table className="w-full text-left text-sm whitespace-nowrap">
      <thead className="bg-surface-container-low/50 sticky top-0 z-10 font-bold text-on-surface-variant uppercase text-xs tracking-wider border-b border-outline-variant/10">
        <tr><th className="px-6 py-4">User / Driver</th><th className="px-6 py-4">Role</th><th className="px-6 py-4">Assigned Vehicle</th><th className="px-6 py-4">Status</th><th className="px-6 py-4 text-right">Actions</th></tr>
      </thead>
      <tbody className="divide-y divide-outline-variant/10">
        <UserRow name="John Doe" email="john.doe@logistics.co" role="System Admin" vehicle="-" status="active" />
        <UserRow name="Sarah Palmer" email="s.palmer@logistics.co" role="Driver" vehicle="VAN-0412" status="active" />
        <UserRow name="Mike Ross" email="m.ross@logistics.co" role="Driver" vehicle="TRK-9902" status="invited" />
        <UserRow name="Jessica Pearson" email="j.pearson@logistics.co" role="Dispatcher" vehicle="-" status="active" />
      </tbody>
    </table>
  );
}

function UserRow({ name, email, role, vehicle, status }: any) {
  const getStatusBadge = () => {
    switch (status) {
      case 'active': return <span className="bg-success/10 text-success px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 w-fit"><CheckCircle2 size={12} /> Active</span>;
      case 'invited': return <span className="bg-warning/10 text-warning px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 w-fit"><Mail size={12} /> Invited</span>;
      default: return null;
    }
  };
  return (
    <tr className="hover:bg-surface-container-low/50 transition-colors group">
      <td className="px-6 py-4"><div className="flex items-center gap-3"><div className="w-9 h-9 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-xs uppercase">{name.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}</div><div><p className="font-bold text-on-surface text-sm">{name}</p><p className="text-[11px] text-on-surface-variant mt-0.5">{email}</p></div></div></td>
      <td className="px-6 py-4"><span className="font-bold text-on-surface bg-surface-container px-3 py-1 rounded-lg text-[11px] uppercase tracking-wider">{role}</span></td>
      <td className="px-6 py-4 font-mono text-on-surface-variant text-xs">{vehicle !== '-' ? <span className="px-2 py-1 bg-surface-container-high rounded border border-outline-variant/20">{vehicle}</span> : '-'}</td>
      <td className="px-6 py-4">{getStatusBadge()}</td>
      <td className="px-6 py-4 text-right"><div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity"><button className="p-2 text-outline hover:text-primary transition-colors bg-surface-container-low rounded-lg"><Edit2 size={16} /></button><button className="p-2 text-outline hover:text-error transition-colors bg-surface-container-low rounded-lg"><Trash2 size={16} /></button></div></td>
    </tr>
  );
}

function FleetTable() {
  return (
    <table className="w-full text-left text-sm whitespace-nowrap">
      <thead className="bg-surface-container-low/50 sticky top-0 z-10 font-bold text-on-surface-variant uppercase text-xs tracking-wider border-b border-outline-variant/10">
        <tr><th className="px-6 py-4">Vehicle ID</th><th className="px-6 py-4">Type & Model</th><th className="px-6 py-4">Capacity (kg/m³)</th><th className="px-6 py-4">Current Driver</th><th className="px-6 py-4 text-right">Actions</th></tr>
      </thead>
      <tbody className="divide-y divide-outline-variant/10">
        <FleetRow id="TRK-9902" model="Freightliner M2" type="Heavy Truck" capKg="8500" capVol="32" driver="Mike Ross" status="active" />
        <FleetRow id="VAN-0412" model="Ford Transit 350" type="Delivery Van" capKg="2200" capVol="11" driver="Sarah Palmer" status="maintenance" />
        <FleetRow id="EV-884" model="Rivian EDV-700" type="Electric Van" capKg="3100" capVol="19" driver="Unassigned" status="active" />
      </tbody>
    </table>
  );
}

function FleetRow({ id, model, type, capKg, capVol, driver, status }: any) {
  return (
    <tr className="hover:bg-surface-container-low/50 transition-colors group">
      <td className="px-6 py-4"><span className="font-extrabold text-primary font-mono bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20">{id}</span></td>
      <td className="px-6 py-4"><p className="font-bold text-on-surface">{model}</p><p className="text-[11px] text-on-surface-variant mt-0.5">{type}</p></td>
      <td className="px-6 py-4 font-mono text-on-surface-variant text-xs">{capKg} <span className="opacity-40">kg</span> / {capVol} <span className="opacity-40">m³</span></td>
      <td className="px-6 py-4 font-medium text-on-surface-variant">{driver}</td>
      <td className="px-6 py-4 text-right"><div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity"><button className="p-2 text-outline hover:text-primary transition-colors bg-surface-container-low rounded-lg"><Edit2 size={16} /></button><button className="p-2 text-outline hover:text-error transition-colors bg-surface-container-low rounded-lg"><Trash2 size={16} /></button></div></td>
    </tr>
  );
}

function DepotsTable() {
  return (
    <table className="w-full text-left text-sm whitespace-nowrap">
      <thead className="bg-surface-container-low/50 sticky top-0 z-10 font-bold text-on-surface-variant uppercase text-xs tracking-wider border-b border-outline-variant/10">
        <tr><th className="px-6 py-4">Depot ID / Name</th><th className="px-6 py-4">Address</th><th className="px-6 py-4">Coordinates</th><th className="px-6 py-4">Type</th><th className="px-6 py-4 text-right">Actions</th></tr>
      </thead>
      <tbody className="divide-y divide-outline-variant/10">
        <DepotRow id="DPT-01" name="North Hub Depot" address="122 Logistic Way, SE1 2BA, London" coords="51.503, -0.112" type="Main Hub" />
        <DepotRow id="DPT-02" name="Eastside Reload" address="Industrial Park B2, London" coords="51.521, 0.051" type="Refill Node" />
      </tbody>
    </table>
  );
}

function DepotRow({ id, name, address, coords, type }: any) {
  return (
    <tr className="hover:bg-surface-container-low/50 transition-colors group">
      <td className="px-6 py-4"><p className="font-extrabold text-on-surface">{name}</p><p className="font-mono text-[11px] text-outline mt-0.5">{id}</p></td>
      <td className="px-6 py-4 text-on-surface-variant text-sm truncate max-w-[200px]">{address}</td>
      <td className="px-6 py-4 font-mono text-xs text-primary bg-primary/5 px-2 py-1 rounded inline-block mt-3">{coords}</td>
      <td className="px-6 py-4"><span className="font-bold text-on-surface bg-surface-container px-3 py-1 rounded-lg text-[11px] uppercase tracking-wider">{type}</span></td>
      <td className="px-6 py-4 text-right"><div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity"><button className="p-2 text-outline hover:text-primary transition-colors bg-surface-container-low rounded-lg"><Edit2 size={16} /></button><button className="p-2 text-outline hover:text-error transition-colors bg-surface-container-low rounded-lg"><Trash2 size={16} /></button></div></td>
    </tr>
  );
}

function ApiKeysList() {
  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-6 flex items-center justify-between bg-primary/10 p-5 rounded-xl border border-primary/20">
        <div><h4 className="font-bold text-primary-fixed-variant flex items-center gap-2"><Shield size={18} /> API Authentication</h4><p className="text-xs text-on-surface-variant mt-1">Manage API keys used by external systems.</p></div>
        <button className="text-sm font-bold bg-primary text-on-primary px-4 py-2 rounded-lg hover:bg-primary-container transition-colors">Generate Key</button>
      </div>
    </div>
  );
}
