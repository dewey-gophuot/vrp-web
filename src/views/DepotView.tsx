import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, MapPin, Loader2, X, Search, Building2 } from 'lucide-react';
import api from '../api';

interface Depot {
  id: string;
  name: string;
  coordinates: { lat: number; lng: number };
  operating_windows?: string[];
  address?: string;
}

interface DepotFormData {
  name: string;
  lat: string;
  lng: string;
  address: string;
}

export default function DepotView() {
  const [depots, setDepots] = useState<Depot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDepot, setEditingDepot] = useState<Depot | null>(null);
  const [deletingDepot, setDeletingDepot] = useState<Depot | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState<DepotFormData>({
    name: '',
    lat: '',
    lng: '',
    address: '',
  });

  useEffect(() => {
    loadDepots();
  }, []);

  const loadDepots = async () => {
    setIsLoading(true);
    try {
      const res = await api.listDepots();
      setDepots(res || []);
    } catch (error) {
      console.error('Failed to load depots:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (depot?: Depot) => {
    if (depot) {
      setEditingDepot(depot);
      setFormData({
        name: depot.name,
        lat: depot.coordinates?.lat?.toString() || '',
        lng: depot.coordinates?.lng?.toString() || '',
        address: depot.address || '',
      });
    } else {
      setEditingDepot(null);
      setFormData({ name: '', lat: '', lng: '', address: '' });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingDepot(null);
    setFormData({ name: '', lat: '', lng: '', address: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      window.alert('Please enter a depot name');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        address: formData.address,
        coordinates: {
          lat: parseFloat(formData.lat) || 0,
          lng: parseFloat(formData.lng) || 0,
        },
      };

      if (editingDepot) {
        await api.updateDepot(editingDepot.id, payload);
      } else {
        await api.createDepot(payload);
      }

      await loadDepots();
      handleCloseModal();
    } catch (error) {
      console.error('Failed to save depot:', error);
      window.alert('Failed to save depot. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingDepot) return;

    setIsDeleting(true);
    try {
      await api.deleteDepot(deletingDepot.id);
      await loadDepots();
      setDeletingDepot(null);
    } catch (error) {
      console.error('Failed to delete depot:', error);
      window.alert('Failed to delete depot. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredDepots = depots.filter(d =>
    d.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.address?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-y-auto p-8 lg:p-12 bg-background">
      {/* Header */}
      <div className="flex flex-col gap-4 mb-10">
        <div className="flex items-center gap-2 text-on-surface-variant text-sm font-medium">
          <Building2 size={16} />
          <span>Management</span>
        </div>
        <div className="flex flex-wrap justify-between items-end gap-4">
          <div>
            <h2 className="text-on-surface font-headline text-4xl font-extrabold tracking-tight">Depots</h2>
            <p className="text-on-surface-variant mt-2">
              Manage warehouse and distribution center locations
            </p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 primary-gradient text-on-primary px-6 py-3 rounded-xl shadow-lg shadow-primary/20 font-bold text-sm hover:scale-[1.02] active:scale-95 transition-all"
          >
            <Plus size={20} />
            Add Depot
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="flex items-center gap-2 max-w-md bg-surface-container-low rounded-xl px-4 py-3">
          <Search size={20} className="text-on-surface-variant" />
          <input
            type="text"
            placeholder="Search depots..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-sm text-on-surface placeholder:text-on-surface-variant"
          />
        </div>
      </div>

      {/* Depot Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 size={32} className="animate-spin text-primary" />
        </div>
      ) : filteredDepots.length === 0 ? (
        <div className="text-center py-16">
          <Building2 size={48} className="mx-auto mb-4 text-on-surface-variant opacity-50" />
          <p className="text-on-surface-variant font-medium">
            {searchQuery ? 'No depots found matching your search' : 'No depots yet. Add your first depot!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDepots.map((depot) => (
            <div
              key={depot.id}
              className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/10 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <MapPin size={24} className="text-primary" />
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleOpenModal(depot)}
                    className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => setDeletingDepot(depot)}
                    className="p-2 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <h3 className="font-headline text-lg font-bold text-on-surface mb-2">{depot.name}</h3>

              {depot.address && (
                <p className="text-sm text-on-surface-variant mb-3">{depot.address}</p>
              )}

              <div className="flex items-center gap-2 text-xs text-on-surface-variant bg-surface-container-low rounded-lg px-3 py-2">
                <MapPin size={12} />
                <span>
                  {depot.coordinates?.lat?.toFixed(6)}, {depot.coordinates?.lng?.toFixed(6)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-surface-container-lowest w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-outline-variant/10">
              <h3 className="text-xl font-bold text-on-surface font-headline">
                {editingDepot ? 'Edit Depot' : 'Add New Depot'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg hover:bg-surface-container transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase mb-2">
                  Depot Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Main Warehouse"
                  className="w-full h-12 bg-surface-container-low rounded-xl px-4 text-sm outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase mb-2">
                  Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="e.g. 123 Warehouse St, District 7"
                  className="w-full h-12 bg-surface-container-low rounded-xl px-4 text-sm outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase mb-2">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    value={formData.lat}
                    onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
                    placeholder="10.123456"
                    className="w-full h-12 bg-surface-container-low rounded-xl px-4 text-sm outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase mb-2">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    value={formData.lng}
                    onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
                    placeholder="106.123456"
                    className="w-full h-12 bg-surface-container-low rounded-xl px-4 text-sm outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
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
                    editingDepot ? 'Update Depot' : 'Create Depot'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deletingDepot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-surface-container-lowest w-full max-w-sm rounded-2xl shadow-2xl p-8 text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-14 h-14 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={26} className="text-error" />
            </div>
            <h3 className="text-lg font-bold text-on-surface mb-2">Delete Depot?</h3>
            <p className="text-sm text-on-surface-variant mb-1 font-mono text-xs">{deletingDepot.name}</p>
            <p className="text-sm text-on-surface-variant mb-6">
              This will permanently remove this depot. Vehicles assigned to this depot will need to be reassigned.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeletingDepot(null)}
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
