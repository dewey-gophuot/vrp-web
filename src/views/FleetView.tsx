import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Truck, Loader2, X, Search, Gauge, DollarSign, Package } from 'lucide-react';
import api from '../api';

interface Vehicle {
  id: string;
  name?: string;
  license_plate?: string;
  capacity_kg?: number;
  volume_m3?: number;
  cost_per_km?: number;
  cost_per_hour?: number;
  max_shift_hours?: number;
  status?: string;
  depot_id?: string;
  driver_id?: string;
}

interface VehicleFormData {
  name: string;
  license_plate: string;
  capacity_kg: string;
  volume_m3: string;
  cost_per_km: string;
  cost_per_hour: string;
  max_shift_hours: string;
  depot_id: string;
}

export default function FleetView() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [deletingVehicle, setDeletingVehicle] = useState<Vehicle | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState<VehicleFormData>({
    name: '',
    license_plate: '',
    capacity_kg: '',
    volume_m3: '',
    cost_per_km: '',
    cost_per_hour: '',
    max_shift_hours: '8',
    depot_id: '',
  });

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    setIsLoading(true);
    try {
      const res = await api.getFleetVehicles();
      setVehicles(res || []);
    } catch (error) {
      console.error('Failed to load vehicles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (vehicle?: Vehicle) => {
    if (vehicle) {
      setEditingVehicle(vehicle);
      setFormData({
        name: vehicle.name || '',
        license_plate: vehicle.license_plate || '',
        capacity_kg: vehicle.capacity_kg?.toString() || '',
        volume_m3: vehicle.volume_m3?.toString() || '',
        cost_per_km: vehicle.cost_per_km?.toString() || '',
        cost_per_hour: vehicle.cost_per_hour?.toString() || '',
        max_shift_hours: vehicle.max_shift_hours?.toString() || '8',
        depot_id: vehicle.depot_id || '',
      });
    } else {
      setEditingVehicle(null);
      setFormData({
        name: '',
        license_plate: '',
        capacity_kg: '',
        volume_m3: '',
        cost_per_km: '',
        cost_per_hour: '',
        max_shift_hours: '8',
        depot_id: '',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingVehicle(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      window.alert('Please enter a vehicle name');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        id: editingVehicle ? editingVehicle.id : `veh_${Date.now()}`,
        name: formData.name,
        license_plate: formData.license_plate,
        capacity_kg: parseFloat(formData.capacity_kg) || 0,
        volume_m3: parseFloat(formData.volume_m3) || 0,
        cost_per_km: parseFloat(formData.cost_per_km) || 0,
        cost_per_hour: parseFloat(formData.cost_per_hour) || 0,
        max_shift_hours: parseInt(formData.max_shift_hours) || 8,
        depot_id: formData.depot_id || undefined,
      };

      if (editingVehicle) {
        await api.updateFleetVehicle(editingVehicle.id, payload);
      } else {
        await api.createFleetVehicle(payload);
      }

      await loadVehicles();
      handleCloseModal();
    } catch (error) {
      console.error('Failed to save vehicle:', error);
      window.alert('Failed to save vehicle. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingVehicle) return;

    setIsDeleting(true);
    try {
      await api.deleteFleetVehicle(deletingVehicle.id);
      await loadVehicles();
      setDeletingVehicle(null);
    } catch (error) {
      console.error('Failed to delete vehicle:', error);
      window.alert('Failed to delete vehicle. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredVehicles = vehicles.filter(v =>
    v.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.license_plate?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active': return 'bg-success/10 text-success';
      case 'maintenance': return 'bg-warning/10 text-warning';
      case 'retired': return 'bg-error/10 text-error';
      default: return 'bg-surface-container text-on-surface-variant';
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 lg:p-12 bg-background">
      {/* Header */}
      <div className="flex flex-col gap-4 mb-10">
        <div className="flex items-center gap-2 text-on-surface-variant text-sm font-medium">
          <Truck size={16} />
          <span>Management</span>
        </div>
        <div className="flex flex-wrap justify-between items-end gap-4">
          <div>
            <h2 className="text-on-surface font-headline text-4xl font-extrabold tracking-tight">Fleet</h2>
            <p className="text-on-surface-variant mt-2">
              Manage delivery vehicles and their specifications
            </p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 primary-gradient text-on-primary px-6 py-3 rounded-xl shadow-lg shadow-primary/20 font-bold text-sm hover:scale-[1.02] active:scale-95 transition-all"
          >
            <Plus size={20} />
            Add Vehicle
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="flex items-center gap-2 max-w-md bg-surface-container-low rounded-xl px-4 py-3">
          <Search size={20} className="text-on-surface-variant" />
          <input
            type="text"
            placeholder="Search vehicles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-sm text-on-surface placeholder:text-on-surface-variant"
          />
        </div>
      </div>

      {/* Vehicle Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 size={32} className="animate-spin text-primary" />
        </div>
      ) : filteredVehicles.length === 0 ? (
        <div className="text-center py-16">
          <Truck size={48} className="mx-auto mb-4 text-on-surface-variant opacity-50" />
          <p className="text-on-surface-variant font-medium">
            {searchQuery ? 'No vehicles found matching your search' : 'No vehicles yet. Add your first vehicle!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVehicles.map((vehicle) => (
            <div
              key={vehicle.id}
              className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/10 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Truck size={24} className="text-primary" />
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleOpenModal(vehicle)}
                    className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => setDeletingVehicle(vehicle)}
                    className="p-2 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <h3 className="font-headline text-lg font-bold text-on-surface mb-1">{vehicle.name || 'Unnamed Vehicle'}</h3>
              <p className="text-sm text-on-surface-variant mb-3">{vehicle.license_plate || 'No plate'}</p>

              <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold mb-4 ${getStatusColor(vehicle.status)}`}>
                {vehicle.status || 'Unknown'}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-surface-container-low rounded-lg p-3">
                  <div className="flex items-center gap-1.5 text-xs text-on-surface-variant mb-1">
                    <Package size={12} />
                    <span>Capacity</span>
                  </div>
                  <p className="text-sm font-bold text-on-surface">{vehicle.capacity_kg || 0} kg</p>
                </div>
                <div className="bg-surface-container-low rounded-lg p-3">
                  <div className="flex items-center gap-1.5 text-xs text-on-surface-variant mb-1">
                    <DollarSign size={12} />
                    <span>Cost/km</span>
                  </div>
                  <p className="text-sm font-bold text-on-surface">${vehicle.cost_per_km || 0}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-surface-container-lowest w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-outline-variant/10 sticky top-0 bg-surface-container-lowest">
              <h3 className="text-xl font-bold text-on-surface font-headline">
                {editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg hover:bg-surface-container transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase mb-2">
                    Vehicle Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Truck 01"
                    className="w-full h-12 bg-surface-container-low rounded-xl px-4 text-sm outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase mb-2">
                    License Plate
                  </label>
                  <input
                    type="text"
                    value={formData.license_plate}
                    onChange={(e) => setFormData({ ...formData, license_plate: e.target.value })}
                    placeholder="e.g. 51G-12345"
                    className="w-full h-12 bg-surface-container-low rounded-xl px-4 text-sm outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase mb-2">
                    Capacity (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.capacity_kg}
                    onChange={(e) => setFormData({ ...formData, capacity_kg: e.target.value })}
                    placeholder="1000"
                    className="w-full h-12 bg-surface-container-low rounded-xl px-4 text-sm outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase mb-2">
                    Volume (m³)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.volume_m3}
                    onChange={(e) => setFormData({ ...formData, volume_m3: e.target.value })}
                    placeholder="15"
                    className="w-full h-12 bg-surface-container-low rounded-xl px-4 text-sm outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase mb-2">
                    Cost per km ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.cost_per_km}
                    onChange={(e) => setFormData({ ...formData, cost_per_km: e.target.value })}
                    placeholder="0.50"
                    className="w-full h-12 bg-surface-container-low rounded-xl px-4 text-sm outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase mb-2">
                    Cost per hour ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.cost_per_hour}
                    onChange={(e) => setFormData({ ...formData, cost_per_hour: e.target.value })}
                    placeholder="25.00"
                    className="w-full h-12 bg-surface-container-low rounded-xl px-4 text-sm outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase mb-2">
                  Max Shift Hours
                </label>
                <input
                  type="number"
                  value={formData.max_shift_hours}
                  onChange={(e) => setFormData({ ...formData, max_shift_hours: e.target.value })}
                  placeholder="8"
                  className="w-full h-12 bg-surface-container-low rounded-xl px-4 text-sm outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div className="flex gap-3 pt-4 sticky bottom-0 bg-surface-container-lowest pb-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 h-12 rounded-xl bg-surface-container text-on-surface font-bold text-sm hover:bg-surface-container-high transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 h-12 rounded-xl primary-gradient text-on-primary font-bold text-sm disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    editingVehicle ? 'Update Vehicle' : 'Create Vehicle'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deletingVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-surface-container-lowest w-full max-w-sm rounded-2xl shadow-2xl p-8 text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-14 h-14 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={26} className="text-error" />
            </div>
            <h3 className="text-lg font-bold text-on-surface mb-2">Delete Vehicle?</h3>
            <p className="text-sm text-on-surface-variant mb-1 font-mono text-xs">{deletingVehicle.name}</p>
            <p className="text-sm text-on-surface-variant mb-6">
              This will permanently remove this vehicle from the fleet.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeletingVehicle(null)}
                className="flex-1 h-10 rounded-xl bg-surface-container text-on-surface font-bold text-sm hover:bg-surface-container-high transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 h-10 rounded-xl bg-error text-white font-bold text-sm disabled:opacity-60 hover:bg-error/90 transition-colors flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
