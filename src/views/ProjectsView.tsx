import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderKanban, Plus, MapPin, Trash2, ArrowRight, X, Check } from 'lucide-react';
import api from '../api';
import { useProject } from '../contexts/ProjectContext';
import { ProjectResponse } from '../api/types';

export default function ProjectsView() {
  const navigate = useNavigate();
  const { projects, activeProjectId, setActiveProject, reloadProjects, isLoading } = useProject();
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<ProjectResponse | null>(null);

  useEffect(() => { reloadProjects(); }, [reloadProjects]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const p = await api.createProject({ name: newName.trim() });
      await reloadProjects();
      setShowCreate(false);
      setNewName('');
      // Tự chọn project vừa tạo và sang Input
      setActiveProject(p.id);
      navigate('/input');
    } catch (err) {
      console.error(err);
      window.alert('Tạo project thất bại.');
    } finally {
      setCreating(false);
    }
  };

  const handleOpen = (p: ProjectResponse) => {
    setActiveProject(p.id);
    navigate('/input');
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await api.deleteProject(deleting.id);
      if (activeProjectId === deleting.id) setActiveProject(null);
      setDeleting(null);
      await reloadProjects();
    } catch (err) {
      console.error(err);
      window.alert('Xóa project thất bại.');
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <FolderKanban className="text-primary" size={28} />
          <div>
            <h1 className="text-3xl font-bold font-headline text-on-surface tracking-tight">Projects</h1>
            <p className="text-on-surface-variant text-sm mt-1">Mỗi project là một bài toán VRP với tập điểm giao riêng.</p>
          </div>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="h-11 px-5 rounded-xl bg-primary text-on-primary font-bold text-sm flex items-center gap-2 hover:bg-primary/90 transition-colors"
        >
          <Plus size={18} /> Tạo project
        </button>
      </div>

      {isLoading ? (
        <p className="text-on-surface-variant text-sm">Đang tải...</p>
      ) : projects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-outline-variant/30 p-12 text-center">
          <FolderKanban className="mx-auto text-outline mb-3" size={40} />
          <p className="font-bold text-on-surface">Chưa có project nào</p>
          <p className="text-on-surface-variant text-sm mt-1 mb-5">Tạo project đầu tiên để bắt đầu nhập điểm giao và tối ưu.</p>
          <button onClick={() => setShowCreate(true)} className="h-10 px-5 rounded-xl bg-primary text-on-primary font-bold text-sm inline-flex items-center gap-2 hover:bg-primary/90">
            <Plus size={16} /> Tạo project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((p) => (
            <div
              key={p.id}
              className={`rounded-2xl border p-6 bg-surface-container-lowest hover:shadow-lg transition-shadow flex flex-col ${
                activeProjectId === p.id ? 'border-primary ring-1 ring-primary/30' : 'border-outline-variant/15'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <FolderKanban size={22} />
                </div>
                {activeProjectId === p.id && (
                  <span className="text-[11px] font-bold px-2 py-1 rounded-full bg-primary/10 text-primary flex items-center gap-1">
                    <Check size={12} /> Đang chọn
                  </span>
                )}
              </div>
              <h3 className="font-bold text-on-surface text-lg truncate">{p.name}</h3>
              <div className="flex items-center gap-1.5 text-on-surface-variant text-sm mt-1">
                <MapPin size={14} /> {p.location_count} điểm giao
              </div>
              <div className="flex items-center gap-2 mt-5 pt-4 border-t border-outline-variant/10">
                <button
                  onClick={() => handleOpen(p)}
                  className="flex-1 h-10 rounded-xl bg-primary-fixed text-on-primary-fixed font-bold text-sm flex items-center justify-center gap-2 hover:bg-primary-fixed-dim transition-colors"
                >
                  Mở <ArrowRight size={15} />
                </button>
                <button
                  onClick={() => setDeleting(p)}
                  className="h-10 w-10 rounded-xl bg-surface-container-low text-outline hover:text-error hover:bg-error/10 flex items-center justify-center transition-colors"
                  title="Xóa project"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-outline/20 backdrop-blur-sm p-4">
          <div className="bg-surface-container-lowest w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-outline-variant/10">
              <h3 className="text-xl font-bold text-on-surface font-headline">Tạo project mới</h3>
              <button onClick={() => { setShowCreate(false); setNewName(''); }} className="text-outline hover:text-on-surface p-1 rounded-lg hover:bg-surface-container"><X size={20} /></button>
            </div>
            <form onSubmit={handleCreate} className="p-6 flex flex-col gap-4">
              <div>
                <label className="text-xs font-bold text-on-surface-variant uppercase">Tên project</label>
                <input
                  autoFocus
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="vd: Giao hàng quận 1 - sáng"
                  className="mt-1 w-full h-11 bg-surface-container-low rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <button type="submit" disabled={creating || !newName.trim()} className="mt-2 h-11 rounded-xl bg-primary text-on-primary font-bold text-sm disabled:opacity-50">
                {creating ? 'Đang tạo...' : 'Tạo & mở'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-outline/20 backdrop-blur-sm p-4">
          <div className="bg-surface-container-lowest w-full max-w-sm rounded-2xl shadow-2xl p-6">
            <h3 className="text-lg font-bold text-on-surface">Xóa project?</h3>
            <p className="text-sm text-on-surface-variant mt-2">
              Xóa <span className="font-semibold">"{deleting.name}"</span> sẽ xóa toàn bộ {deleting.location_count} điểm giao của nó. Hành động không thể hoàn tác.
            </p>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setDeleting(null)} className="flex-1 h-10 rounded-xl bg-surface-container hover:bg-surface-container-high font-bold text-sm text-on-surface">Hủy</button>
              <button onClick={handleDelete} className="flex-1 h-10 rounded-xl bg-error text-white font-bold text-sm hover:bg-error/90">Xóa</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
