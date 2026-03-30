import React, { useEffect, useState } from 'react';
import { Shield, Users, Truck, Key, Search, Plus, Edit2, Trash2, Mail, CheckCircle2, MapPin, X } from 'lucide-react';
import api from '../api';

export default function AdminView() {
  const [activeTab, setActiveTab] = useState('users');
  const [showModal, setShowModal] = useState<string | null>(null);
  const [fleetData, setFleetData] = useState<any[]>([]);
  const [usersData, setUsersData] = useState<any[]>([]);
  const [depotsData, setDepotsData] = useState<any[]>([]);

  const loadFleet = () => {
    api.getFleetVehicles().then(setFleetData).catch(console.error);
  };

  const loadUsers = () => {
    api.listUsers().then(setUsersData).catch(console.error);
  };

  const loadDepots = () => {
    api.listDepots().then(setDepotsData).catch(console.error);
  };

  useEffect(() => {
    loadFleet();
    loadUsers();
    loadDepots();
  }, []);

  return (
    <div className="flex-1 overflow-y-auto p-8 lg:p-12 bg-background flex flex-col h-full relative">
      <div className="flex justify-between items-end mb-8 shrink-0">
        <div>
          <h2 className="text-on-surface font-headline text-3xl font-extrabold tracking-tight">Admin Center</h2>
          <p className="text-on-surface-variant mt-2 text-sm">Manage users, access roles, fleet records, depots, and integrations.</p>
        </div>
        <button
          onClick={() => setShowModal(activeTab)}
          className="primary-gradient text-on-primary px-6 py-2.5 rounded-xl font-bold text-sm shadow-md hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2"
        >
          <Plus size={18} />
          {activeTab === 'users' ? 'Add User/Driver' : activeTab === 'fleet' ? 'Add Vehicle' : activeTab === 'depots' ? 'Add Depot' : 'Add Key'}
        </button>
      </div>

      <div className="flex items-center gap-2 mb-8 border-b border-outline-variant/20 shrink-0">
        <TabButton active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon={Users} label="Users & Drivers" />
        <TabButton active={activeTab === 'fleet'} onClick={() => setActiveTab('fleet')} icon={Truck} label="Fleet Database" />
        <TabButton active={activeTab === 'depots'} onClick={() => setActiveTab('depots')} icon={MapPin} label="Depots & Hubs" />
        <TabButton active={activeTab === 'api'} onClick={() => setActiveTab('api')} icon={Key} label="API Keys" />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden bg-surface-container-lowest rounded-2xl border border-outline-variant/20 shadow-sm relative">
        <div className="flex items-center justify-between p-5 border-b border-outline-variant/10 shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-4 h-4" />
            <input type="text" placeholder={`Search ${activeTab}...`} className="pl-10 pr-4 py-2 bg-surface-container-low border border-outline-variant/10 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 w-64 outline-none text-on-surface placeholder:text-outline" />
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {activeTab === 'users' && <UsersTable usersData={usersData} />}
          {activeTab === 'fleet' && <FleetTable fleetData={fleetData} />}
          {activeTab === 'depots' && <DepotsTable depotsData={depotsData} />}
          {activeTab === 'api' && <ApiKeysList />}
        </div>
      </div>

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
              {showModal === 'users' && <UserForm onClose={() => setShowModal(null)} onCreated={loadUsers} />}
              {showModal === 'fleet' && <FleetForm onClose={() => setShowModal(null)} onCreated={loadFleet} />}
              {showModal === 'depots' && <DepotForm onClose={() => setShowModal(null)} onCreated={loadDepots} />}
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

function UserForm({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    role: 'Driver',
    phone: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      setIsSaving(true);
      await api.createUser(formData);
      onCreated();
      window.alert('Tao user thanh cong.');
      onClose();
    } catch (error) {
      console.error(error);
      window.alert('Khong the tao user.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <div><label className="text-xs font-bold text-on-surface-variant uppercase">Full Name</label><input type="text" required value={formData.full_name} onChange={e => setFormData(prev => ({ ...prev, full_name: e.target.value }))} className="mt-1 w-full h-10 bg-surface-container-low rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" /></div>
      <div><label className="text-xs font-bold text-on-surface-variant uppercase">Email</label><input type="email" required value={formData.email} onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))} className="mt-1 w-full h-10 bg-surface-container-low rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" /></div>
      <div>
        <label className="text-xs font-bold text-on-surface-variant uppercase">Role</label>
        <select value={formData.role} onChange={e => setFormData(prev => ({ ...prev, role: e.target.value }))} className="mt-1 w-full h-10 bg-surface-container-low rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
          <option>Driver</option><option>Dispatcher</option><option>System Admin</option>
        </select>
      </div>
      <div><label className="text-xs font-bold text-on-surface-variant uppercase">Phone</label><input type="text" value={formData.phone} onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))} className="mt-1 w-full h-10 bg-surface-container-low rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" /></div>
      <button disabled={isSaving} type="submit" className="mt-4 primary-gradient text-on-primary h-10 rounded-lg font-bold text-sm disabled:opacity-60">{isSaving ? 'Saving...' : 'Save User'}</button>
    </form>
  );
}

function FleetForm({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    capacity_kg: 0,
    volume_m3: 0,
    ev: false,
    driver_name: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      setIsSaving(true);
      await api.createFleetVehicle(formData);
      onCreated();
      window.alert('Tao vehicle thanh cong.');
      onClose();
    } catch (error) {
      console.error(error);
      window.alert('Khong the tao vehicle.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <div><label className="text-xs font-bold text-on-surface-variant uppercase">Vehicle ID</label><input type="text" required value={formData.id} onChange={e => setFormData(prev => ({ ...prev, id: e.target.value }))} className="mt-1 w-full h-10 bg-surface-container-low rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" /></div>
      <div><label className="text-xs font-bold text-on-surface-variant uppercase">Vehicle Name</label><input type="text" required value={formData.name} onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))} className="mt-1 w-full h-10 bg-surface-container-low rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" /></div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="text-xs font-bold text-on-surface-variant uppercase">Max Weight (kg)</label><input type="number" required value={formData.capacity_kg} onChange={e => setFormData(prev => ({ ...prev, capacity_kg: Number(e.target.value) }))} className="mt-1 w-full h-10 bg-surface-container-low rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" /></div>
        <div><label className="text-xs font-bold text-on-surface-variant uppercase">Max Volume (m3)</label><input type="number" required value={formData.volume_m3} onChange={e => setFormData(prev => ({ ...prev, volume_m3: Number(e.target.value) }))} className="mt-1 w-full h-10 bg-surface-container-low rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" /></div>
      </div>
      <div>
        <label className="text-xs font-bold text-on-surface-variant uppercase">Vehicle Type</label>
        <select value={formData.ev ? 'Electric Van' : 'Delivery Van'} onChange={e => setFormData(prev => ({ ...prev, ev: e.target.value === 'Electric Van' }))} className="mt-1 w-full h-10 bg-surface-container-low rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
          <option>Delivery Van</option><option>Heavy Truck</option><option>Electric Van</option>
        </select>
      </div>
      <div><label className="text-xs font-bold text-on-surface-variant uppercase">Driver Name</label><input type="text" value={formData.driver_name} onChange={e => setFormData(prev => ({ ...prev, driver_name: e.target.value }))} className="mt-1 w-full h-10 bg-surface-container-low rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" /></div>
      <button disabled={isSaving} type="submit" className="mt-4 primary-gradient text-on-primary h-10 rounded-lg font-bold text-sm disabled:opacity-60">{isSaving ? 'Saving...' : 'Save Vehicle'}</button>
    </form>
  );
}

function DepotForm({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    lat: 0,
    lng: 0,
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      setIsSaving(true);
      await api.createDepot({
        name: formData.name,
        coordinates: { lat: formData.lat, lng: formData.lng },
      });
      onCreated();
      window.alert('Tao depot thanh cong.');
      onClose();
    } catch (error) {
      console.error(error);
      window.alert('Khong the tao depot.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <div><label className="text-xs font-bold text-on-surface-variant uppercase">Depot Name</label><input type="text" required value={formData.name} onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))} className="mt-1 w-full h-10 bg-surface-container-low rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" /></div>
      <div><label className="text-xs font-bold text-on-surface-variant uppercase">Address</label><input type="text" required className="mt-1 w-full h-10 bg-surface-container-low rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" /></div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="text-xs font-bold text-on-surface-variant uppercase">Latitude</label><input type="number" step="0.000001" value={formData.lat} onChange={e => setFormData(prev => ({ ...prev, lat: Number(e.target.value) }))} className="mt-1 w-full h-10 bg-surface-container-low rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" /></div>
        <div><label className="text-xs font-bold text-on-surface-variant uppercase">Longitude</label><input type="number" step="0.000001" value={formData.lng} onChange={e => setFormData(prev => ({ ...prev, lng: Number(e.target.value) }))} className="mt-1 w-full h-10 bg-surface-container-low rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" /></div>
      </div>
      <div className="flex items-center gap-2 mt-2">
        <span className="text-sm text-outline cursor-pointer hover:text-primary transition-colors flex items-center gap-1 font-medium"><MapPin size={16} /> Auto-Geocode from Address</span>
      </div>
      <button disabled={isSaving} type="submit" className="mt-4 primary-gradient text-on-primary h-10 rounded-lg font-bold text-sm disabled:opacity-60">{isSaving ? 'Saving...' : 'Save Depot'}</button>
    </form>
  );
}

function UsersTable({ usersData }: { usersData: any[] }) {
  return (
    <table className="w-full text-left text-sm whitespace-nowrap">
      <thead className="bg-surface-container-low/50 sticky top-0 z-10 font-bold text-on-surface-variant uppercase text-xs tracking-wider border-b border-outline-variant/10">
        <tr><th className="px-6 py-4">User / Driver</th><th className="px-6 py-4">Role</th><th className="px-6 py-4">Assigned Vehicle</th><th className="px-6 py-4">Status</th><th className="px-6 py-4 text-right">Actions</th></tr>
      </thead>
      <tbody className="divide-y divide-outline-variant/10">
        {usersData.length === 0 ? (
          <tr><td colSpan={5} className="px-6 py-4 text-sm text-on-surface-variant">No users found.</td></tr>
        ) : (
          usersData.map((user) => (
            <UserRow
              key={user.id}
              name={user.full_name || 'Unknown'}
              email={user.email || '-'}
              role={user.role || 'N/A'}
              vehicle="-"
              status="active"
            />
          ))
        )}
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

function FleetTable({ fleetData }: { fleetData: any[] }) {
  return (
    <table className="w-full text-left text-sm whitespace-nowrap">
      <thead className="bg-surface-container-low/50 sticky top-0 z-10 font-bold text-on-surface-variant uppercase text-xs tracking-wider border-b border-outline-variant/10">
        <tr><th className="px-6 py-4">Vehicle ID</th><th className="px-6 py-4">Type & Model</th><th className="px-6 py-4">Capacity (kg/m3)</th><th className="px-6 py-4">Current Driver</th><th className="px-6 py-4 text-right">Actions</th></tr>
      </thead>
      <tbody className="divide-y divide-outline-variant/10">
        {fleetData.length === 0 ? (
          <tr><td colSpan={5} className="px-6 py-4 text-sm text-on-surface-variant">No vehicles found.</td></tr>
        ) : (
          fleetData.map(vehicle => (
            <FleetRow
              key={vehicle.id}
              id={vehicle.id}
              model={vehicle.name}
              type={vehicle.ev ? 'Electric Van' : 'Delivery Vehicle'}
              capKg={String(vehicle.capacity_kg || 0)}
              capVol={String(vehicle.volume_m3 || 0)}
              driver={vehicle.driver_name || 'Unassigned'}
            />
          ))
        )}
      </tbody>
    </table>
  );
}

function FleetRow({ id, model, type, capKg, capVol, driver }: any) {
  return (
    <tr className="hover:bg-surface-container-low/50 transition-colors group">
      <td className="px-6 py-4"><span className="font-extrabold text-primary font-mono bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20">{id}</span></td>
      <td className="px-6 py-4"><p className="font-bold text-on-surface">{model}</p><p className="text-[11px] text-on-surface-variant mt-0.5">{type}</p></td>
      <td className="px-6 py-4 font-mono text-on-surface-variant text-xs">{capKg} <span className="opacity-40">kg</span> / {capVol} <span className="opacity-40">m3</span></td>
      <td className="px-6 py-4 font-medium text-on-surface-variant">{driver}</td>
      <td className="px-6 py-4 text-right"><div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity"><button className="p-2 text-outline hover:text-primary transition-colors bg-surface-container-low rounded-lg"><Edit2 size={16} /></button><button className="p-2 text-outline hover:text-error transition-colors bg-surface-container-low rounded-lg"><Trash2 size={16} /></button></div></td>
    </tr>
  );
}

function DepotsTable({ depotsData }: { depotsData: any[] }) {
  return (
    <table className="w-full text-left text-sm whitespace-nowrap">
      <thead className="bg-surface-container-low/50 sticky top-0 z-10 font-bold text-on-surface-variant uppercase text-xs tracking-wider border-b border-outline-variant/10">
        <tr><th className="px-6 py-4">Depot ID / Name</th><th className="px-6 py-4">Address</th><th className="px-6 py-4">Coordinates</th><th className="px-6 py-4">Type</th><th className="px-6 py-4 text-right">Actions</th></tr>
      </thead>
      <tbody className="divide-y divide-outline-variant/10">
        {depotsData.length === 0 ? (
          <tr><td colSpan={5} className="px-6 py-4 text-sm text-on-surface-variant">No depots found.</td></tr>
        ) : (
          depotsData.map((depot) => (
            <DepotRow
              key={depot.id}
              id={depot.id}
              name={depot.name || 'Unknown'}
              address="-"
              coords={`${depot.coordinates?.lat ?? 0}, ${depot.coordinates?.lng ?? 0}`}
              type="Hub"
            />
          ))
        )}
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
