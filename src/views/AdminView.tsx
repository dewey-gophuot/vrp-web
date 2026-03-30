import React, { useEffect, useState } from 'react';
import { Shield, Users, Truck, Key, Search, Plus, Edit2, Trash2, Mail, CheckCircle2, MapPin, X, Eye, Zap } from 'lucide-react';
import api from '../api';

// ─── Shared helpers ──────────────────────────────────────────────────────────

function inputCls(extra = '') {
  return `mt-1 w-full h-10 bg-surface-container-low rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 border border-outline-variant/10 text-on-surface ${extra}`;
}
function labelCls() { return 'text-xs font-bold text-on-surface-variant uppercase tracking-wide'; }

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className={labelCls()}>{label}</label>{children}</div>;
}

function ModalWrap({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-outline/20 backdrop-blur-sm p-4">
      <div className="bg-surface-container-lowest w-full max-w-md rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh]">
        <div className="flex justify-between items-center p-6 border-b border-outline-variant/10 shrink-0">
          <h3 className="text-xl font-bold text-on-surface font-headline">{title}</h3>
          <button onClick={onClose} className="text-outline hover:text-on-surface transition-colors p-1 rounded-lg hover:bg-surface-container"><X size={20} /></button>
        </div>
        <div className="p-6 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

function ConfirmDelete({ name, onConfirm, onCancel, isDeleting }: { name: string; onConfirm: () => void; onCancel: () => void; isDeleting: boolean }) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-outline/20 backdrop-blur-sm p-4">
      <div className="bg-surface-container-lowest w-full max-w-sm rounded-2xl shadow-2xl p-8 text-center animate-in fade-in zoom-in-95 duration-200">
        <div className="w-14 h-14 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-4"><Trash2 size={26} className="text-error" /></div>
        <h3 className="text-lg font-bold text-on-surface mb-2">Delete "{name}"?</h3>
        <p className="text-sm text-on-surface-variant mb-6">This action cannot be undone.</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 h-10 rounded-xl bg-surface-container hover:bg-surface-container-high font-bold text-sm text-on-surface transition-colors">Cancel</button>
          <button onClick={onConfirm} disabled={isDeleting} className="flex-1 h-10 rounded-xl bg-error text-white font-bold text-sm disabled:opacity-60 transition-colors hover:bg-error/90">
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
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

// ─── Main View ────────────────────────────────────────────────────────────────

type ModalType = { type: 'create-user' | 'edit-user' | 'create-vehicle' | 'edit-vehicle' | 'create-depot' | 'edit-depot'; data?: any } | null;
type DeleteState = { entity: 'user' | 'vehicle' | 'depot'; id: string; name: string } | null;

export default function AdminView() {
  const [activeTab, setActiveTab] = useState('users');
  const [modal, setModal] = useState<ModalType>(null);
  const [deleteState, setDeleteState] = useState<DeleteState>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [fleetData, setFleetData] = useState<any[]>([]);
  const [usersData, setUsersData] = useState<any[]>([]);
  const [depotsData, setDepotsData] = useState<any[]>([]);

  const loadFleet = () => api.getFleetVehicles().then(setFleetData).catch(console.error);
  const loadUsers = () => api.listUsers().then(setUsersData).catch(console.error);
  const loadDepots = () => api.listDepots().then(setDepotsData).catch(console.error);

  useEffect(() => { loadFleet(); loadUsers(); loadDepots(); }, []);

  const handleDelete = async () => {
    if (!deleteState) return;
    setIsDeleting(true);
    try {
      if (deleteState.entity === 'vehicle') { await api.deleteFleetVehicle(deleteState.id); loadFleet(); }
      if (deleteState.entity === 'user') { await api.deleteUser(deleteState.id); loadUsers(); }
      if (deleteState.entity === 'depot') { await api.deleteDepot(deleteState.id); loadDepots(); }
      setDeleteState(null);
    } catch (e) { console.error(e); window.alert('Xóa thất bại.'); }
    finally { setIsDeleting(false); }
  };

  const addLabel = activeTab === 'users' ? 'Add User/Driver' : activeTab === 'fleet' ? 'Add Vehicle' : activeTab === 'depots' ? 'Add Depot' : 'Add Key';
  const addModal: ModalType = activeTab === 'users' ? { type: 'create-user' } : activeTab === 'fleet' ? { type: 'create-vehicle' } : activeTab === 'depots' ? { type: 'create-depot' } : null;

  return (
    <div className="flex-1 overflow-y-auto p-8 lg:p-12 bg-background flex flex-col h-full relative">
      <div className="flex justify-between items-end mb-8 shrink-0">
        <div>
          <h2 className="text-on-surface font-headline text-3xl font-extrabold tracking-tight">Admin Center</h2>
          <p className="text-on-surface-variant mt-2 text-sm">Manage users, access roles, fleet records, depots, and integrations.</p>
        </div>
        {activeTab !== 'api' && (
          <button onClick={() => setModal(addModal)} className="primary-gradient text-on-primary px-6 py-2.5 rounded-xl font-bold text-sm shadow-md hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2">
            <Plus size={18} />{addLabel}
          </button>
        )}
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
          {activeTab === 'users' && (
            <UsersTable
              usersData={usersData}
              onEdit={(u) => setModal({ type: 'edit-user', data: u })}
              onDelete={(u) => setDeleteState({ entity: 'user', id: u.id, name: u.full_name || u.email })}
            />
          )}
          {activeTab === 'fleet' && (
            <FleetTable
              fleetData={fleetData}
              onEdit={(v) => setModal({ type: 'edit-vehicle', data: v })}
              onDelete={(v) => setDeleteState({ entity: 'vehicle', id: v.id, name: v.name })}
            />
          )}
          {activeTab === 'depots' && (
            <DepotsTable
              depotsData={depotsData}
              onEdit={(d) => setModal({ type: 'edit-depot', data: d })}
              onDelete={(d) => setDeleteState({ entity: 'depot', id: d.id, name: d.name })}
            />
          )}
          {activeTab === 'api' && <ApiKeysList />}
        </div>
      </div>

      {/* Modals */}
      {modal?.type === 'create-user' && <ModalWrap title="Add User / Driver" onClose={() => setModal(null)}><UserForm onClose={() => setModal(null)} onCreated={loadUsers} /></ModalWrap>}
      {modal?.type === 'edit-user' && <ModalWrap title="Edit User" onClose={() => setModal(null)}><UserForm initial={modal.data} onClose={() => setModal(null)} onCreated={loadUsers} /></ModalWrap>}
      {modal?.type === 'create-vehicle' && <ModalWrap title="Add Vehicle" onClose={() => setModal(null)}><FleetForm onClose={() => setModal(null)} onCreated={loadFleet} /></ModalWrap>}
      {modal?.type === 'edit-vehicle' && <ModalWrap title="Edit Vehicle" onClose={() => setModal(null)}><FleetForm initial={modal.data} onClose={() => setModal(null)} onCreated={loadFleet} /></ModalWrap>}
      {modal?.type === 'create-depot' && <ModalWrap title="Add Depot" onClose={() => setModal(null)}><DepotForm onClose={() => setModal(null)} onCreated={loadDepots} /></ModalWrap>}
      {modal?.type === 'edit-depot' && <ModalWrap title="Edit Depot" onClose={() => setModal(null)}><DepotForm initial={modal.data} onClose={() => setModal(null)} onCreated={loadDepots} /></ModalWrap>}

      {/* Delete confirmation */}
      {deleteState && (
        <ConfirmDelete
          name={deleteState.name}
          isDeleting={isDeleting}
          onConfirm={handleDelete}
          onCancel={() => setDeleteState(null)}
        />
      )}
    </div>
  );
}

// ─── User Form (Create + Edit) ────────────────────────────────────────────────

function UserForm({ initial, onClose, onCreated }: { initial?: any; onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({
    full_name: initial?.full_name || '',
    email: initial?.email || '',
    role: initial?.role || 'Driver',
    phone: initial?.phone || '',
  });
  const [saving, setSaving] = useState(false);
  const isEdit = !!initial;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEdit) {
        await api.updateUser(initial.id, form);
      } else {
        await api.createUser(form);
      }
      onCreated();
      onClose();
    } catch (err) { console.error(err); window.alert(isEdit ? 'Cập nhật thất bại.' : 'Tạo user thất bại.'); }
    finally { setSaving(false); }
  };

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <Field label="Full Name"><input className={inputCls()} required value={form.full_name} onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))} /></Field>
      <Field label="Email"><input type="email" className={inputCls()} required value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} /></Field>
      <Field label="Role">
        <select className={inputCls()} value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}>
          <option>Driver</option><option>Dispatcher</option><option>System Admin</option>
        </select>
      </Field>
      <Field label="Phone"><input className={inputCls()} value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} /></Field>
      <button disabled={saving} type="submit" className="mt-2 primary-gradient text-on-primary h-10 rounded-lg font-bold text-sm disabled:opacity-60">
        {saving ? 'Saving...' : isEdit ? 'Update User' : 'Save User'}
      </button>
    </form>
  );
}

// ─── Fleet Form (Create + Edit) ───────────────────────────────────────────────

function FleetForm({ initial, onClose, onCreated }: { initial?: any; onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({
    id: initial?.id || '',
    name: initial?.name || '',
    capacity_kg: initial?.capacity_kg ?? 0,
    volume_m3: initial?.volume_m3 ?? 0,
    ev: initial?.ev ?? false,
    driver_name: initial?.driver_name || '',
    license_plate: initial?.license_plate || '',
    cost_per_km: initial?.cost_per_km ?? 0,
    max_shift_hours: initial?.max_shift_hours ?? 8,
  });
  const [saving, setSaving] = useState(false);
  const isEdit = !!initial;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEdit) {
        const { id, ...updateData } = form;
        await api.updateFleetVehicle(initial.id, updateData);
      } else {
        await api.createFleetVehicle(form);
      }
      onCreated();
      onClose();
    } catch (err) { console.error(err); window.alert(isEdit ? 'Cập nhật thất bại.' : 'Tạo vehicle thất bại.'); }
    finally { setSaving(false); }
  };

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      {!isEdit && <Field label="Vehicle ID"><input className={inputCls()} required value={form.id} onChange={e => setForm(p => ({ ...p, id: e.target.value }))} placeholder="e.g. TRK-001" /></Field>}
      <Field label="Vehicle Name"><input className={inputCls()} required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Max Weight (kg)"><input type="number" className={inputCls()} required value={form.capacity_kg} onChange={e => setForm(p => ({ ...p, capacity_kg: Number(e.target.value) }))} /></Field>
        <Field label="Max Volume (m³)"><input type="number" className={inputCls()} required value={form.volume_m3} onChange={e => setForm(p => ({ ...p, volume_m3: Number(e.target.value) }))} /></Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Cost/km"><input type="number" step="0.01" className={inputCls()} value={form.cost_per_km} onChange={e => setForm(p => ({ ...p, cost_per_km: Number(e.target.value) }))} /></Field>
        <Field label="Max Shift (hrs)"><input type="number" className={inputCls()} value={form.max_shift_hours} onChange={e => setForm(p => ({ ...p, max_shift_hours: Number(e.target.value) }))} /></Field>
      </div>
      <Field label="License Plate"><input className={inputCls()} value={form.license_plate} onChange={e => setForm(p => ({ ...p, license_plate: e.target.value }))} placeholder="e.g. 30A-12345" /></Field>
      <Field label="Driver Name"><input className={inputCls()} value={form.driver_name} onChange={e => setForm(p => ({ ...p, driver_name: e.target.value }))} /></Field>
      <label className="flex items-center gap-3 cursor-pointer p-3 bg-surface-container-low rounded-lg border border-outline-variant/10 hover:bg-surface-container transition-colors">
        <input type="checkbox" checked={form.ev} onChange={e => setForm(p => ({ ...p, ev: e.target.checked }))} className="w-4 h-4 rounded accent-primary" />
        <div className="flex items-center gap-2 text-sm font-semibold text-on-surface"><Zap size={16} className="text-primary" /> Electric Vehicle (EV)</div>
      </label>
      <button disabled={saving} type="submit" className="mt-2 primary-gradient text-on-primary h-10 rounded-lg font-bold text-sm disabled:opacity-60">
        {saving ? 'Saving...' : isEdit ? 'Update Vehicle' : 'Save Vehicle'}
      </button>
    </form>
  );
}

// ─── Depot Form (Create + Edit) ───────────────────────────────────────────────

function DepotForm({ initial, onClose, onCreated }: { initial?: any; onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({
    name: initial?.name || '',
    address: initial?.address || '',
    lat: initial?.coordinates?.lat ?? 0,
    lng: initial?.coordinates?.lng ?? 0,
  });
  const [saving, setSaving] = useState(false);
  const isEdit = !!initial;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { name: form.name, coordinates: { lat: form.lat, lng: form.lng } };
      if (isEdit) {
        await api.updateDepot(initial.id, payload);
      } else {
        await api.createDepot(payload);
      }
      onCreated();
      onClose();
    } catch (err) { console.error(err); window.alert(isEdit ? 'Cập nhật thất bại.' : 'Tạo depot thất bại.'); }
    finally { setSaving(false); }
  };

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <Field label="Depot Name"><input className={inputCls()} required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></Field>
      <Field label="Address"><input className={inputCls()} value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} placeholder="e.g. 123 Giai Phong, Ha Noi" /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Latitude"><input type="number" step="0.000001" className={inputCls()} value={form.lat || ''} onChange={e => setForm(p => ({ ...p, lat: Number(e.target.value) }))} placeholder="e.g. 21.028" /></Field>
        <Field label="Longitude"><input type="number" step="0.000001" className={inputCls()} value={form.lng || ''} onChange={e => setForm(p => ({ ...p, lng: Number(e.target.value) }))} placeholder="e.g. 105.834" /></Field>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-outline cursor-pointer hover:text-primary transition-colors flex items-center gap-1 font-medium"><MapPin size={16} /> Auto-Geocode from Address</span>
      </div>
      <button disabled={saving} type="submit" className="mt-2 primary-gradient text-on-primary h-10 rounded-lg font-bold text-sm disabled:opacity-60">
        {saving ? 'Saving...' : isEdit ? 'Update Depot' : 'Save Depot'}
      </button>
    </form>
  );
}

// ─── Tables ───────────────────────────────────────────────────────────────────

function ActionBtns({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
      <button onClick={onEdit} title="Edit" className="p-2 text-outline hover:text-primary transition-colors bg-surface-container-low rounded-lg hover:bg-primary/10"><Edit2 size={15} /></button>
      <button onClick={onDelete} title="Delete" className="p-2 text-outline hover:text-error transition-colors bg-surface-container-low rounded-lg hover:bg-error/10"><Trash2 size={15} /></button>
    </div>
  );
}

function UsersTable({ usersData, onEdit, onDelete }: { usersData: any[]; onEdit: (u: any) => void; onDelete: (u: any) => void }) {
  return (
    <table className="w-full text-left text-sm whitespace-nowrap">
      <thead className="bg-surface-container-low/50 sticky top-0 z-10 font-bold text-on-surface-variant uppercase text-xs tracking-wider border-b border-outline-variant/10">
        <tr><th className="px-6 py-4">User / Driver</th><th className="px-6 py-4">Role</th><th className="px-6 py-4">Phone</th><th className="px-6 py-4">Status</th><th className="px-6 py-4 text-right">Actions</th></tr>
      </thead>
      <tbody className="divide-y divide-outline-variant/10">
        {usersData.length === 0
          ? <tr><td colSpan={5} className="px-6 py-8 text-sm text-on-surface-variant text-center">No users found. Click "Add User/Driver" to create one.</td></tr>
          : usersData.map(u => (
            <tr key={u.id} className="hover:bg-surface-container-low/50 transition-colors group">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-xs uppercase shrink-0">
                    {(u.full_name || '?').split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                  </div>
                  <div><p className="font-bold text-on-surface text-sm">{u.full_name || 'Unknown'}</p><p className="text-[11px] text-on-surface-variant mt-0.5">{u.email || '-'}</p></div>
                </div>
              </td>
              <td className="px-6 py-4"><span className="font-bold text-on-surface bg-surface-container px-3 py-1 rounded-lg text-[11px] uppercase tracking-wider">{u.role || 'N/A'}</span></td>
              <td className="px-6 py-4 text-on-surface-variant text-xs font-mono">{u.phone || '-'}</td>
              <td className="px-6 py-4"><span className="bg-success/10 text-success px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 w-fit"><CheckCircle2 size={12} /> Active</span></td>
              <td className="px-6 py-4 text-right"><ActionBtns onEdit={() => onEdit(u)} onDelete={() => onDelete(u)} /></td>
            </tr>
          ))
        }
      </tbody>
    </table>
  );
}

function FleetTable({ fleetData, onEdit, onDelete }: { fleetData: any[]; onEdit: (v: any) => void; onDelete: (v: any) => void }) {
  return (
    <table className="w-full text-left text-sm whitespace-nowrap">
      <thead className="bg-surface-container-low/50 sticky top-0 z-10 font-bold text-on-surface-variant uppercase text-xs tracking-wider border-b border-outline-variant/10">
        <tr><th className="px-6 py-4">Vehicle ID</th><th className="px-6 py-4">Type & Model</th><th className="px-6 py-4">Capacity (kg/m³)</th><th className="px-6 py-4">Current Driver</th><th className="px-6 py-4">License</th><th className="px-6 py-4 text-right">Actions</th></tr>
      </thead>
      <tbody className="divide-y divide-outline-variant/10">
        {fleetData.length === 0
          ? <tr><td colSpan={6} className="px-6 py-8 text-sm text-on-surface-variant text-center">No vehicles found. Click "Add Vehicle" to create one.</td></tr>
          : fleetData.map(v => (
            <tr key={v.id} className="hover:bg-surface-container-low/50 transition-colors group">
              <td className="px-6 py-4"><span className="font-extrabold text-primary font-mono bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20">{v.id}</span></td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  {v.ev && <Zap size={14} className="text-primary shrink-0" />}
                  <div><p className="font-bold text-on-surface">{v.name}</p><p className="text-[11px] text-on-surface-variant mt-0.5">{v.ev ? 'Electric Van' : 'Delivery Vehicle'}</p></div>
                </div>
              </td>
              <td className="px-6 py-4 font-mono text-on-surface-variant text-xs">{v.capacity_kg ?? 0} <span className="opacity-40">kg</span> / {v.volume_m3 ?? 0} <span className="opacity-40">m³</span></td>
              <td className="px-6 py-4 font-medium text-on-surface-variant">{v.driver_name || <span className="text-outline italic text-xs">Unassigned</span>}</td>
              <td className="px-6 py-4 text-xs text-on-surface-variant font-mono">{v.license_plate || '-'}</td>
              <td className="px-6 py-4 text-right"><ActionBtns onEdit={() => onEdit(v)} onDelete={() => onDelete(v)} /></td>
            </tr>
          ))
        }
      </tbody>
    </table>
  );
}

function DepotsTable({ depotsData, onEdit, onDelete }: { depotsData: any[]; onEdit: (d: any) => void; onDelete: (d: any) => void }) {
  return (
    <table className="w-full text-left text-sm whitespace-nowrap">
      <thead className="bg-surface-container-low/50 sticky top-0 z-10 font-bold text-on-surface-variant uppercase text-xs tracking-wider border-b border-outline-variant/10">
        <tr><th className="px-6 py-4">Depot ID / Name</th><th className="px-6 py-4">Coordinates</th><th className="px-6 py-4">Type</th><th className="px-6 py-4 text-right">Actions</th></tr>
      </thead>
      <tbody className="divide-y divide-outline-variant/10">
        {depotsData.length === 0
          ? <tr><td colSpan={4} className="px-6 py-8 text-sm text-on-surface-variant text-center">No depots found. Click "Add Depot" to create one.</td></tr>
          : depotsData.map(d => (
            <tr key={d.id} className="hover:bg-surface-container-low/50 transition-colors group">
              <td className="px-6 py-4"><p className="font-bold text-on-surface">{d.name}</p><p className="font-mono text-[11px] text-outline mt-0.5">{d.id}</p></td>
              <td className="px-6 py-4"><span className="font-mono text-xs text-primary bg-primary/5 px-2 py-1 rounded">{d.coordinates?.lat?.toFixed(5) ?? 0}, {d.coordinates?.lng?.toFixed(5) ?? 0}</span></td>
              <td className="px-6 py-4"><span className="font-bold text-on-surface bg-surface-container px-3 py-1 rounded-lg text-[11px] uppercase tracking-wider">Hub</span></td>
              <td className="px-6 py-4 text-right"><ActionBtns onEdit={() => onEdit(d)} onDelete={() => onDelete(d)} /></td>
            </tr>
          ))
        }
      </tbody>
    </table>
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
