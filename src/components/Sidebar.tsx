import React, { useState } from 'react';
import { FolderKanban, Database, Map as MapIcon, BarChart3, Sun, Moon, Shield, LogOut, User, Key } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useProject } from '../contexts/ProjectContext';

interface SidebarProps {
  isDarkMode?: boolean;
  setIsDarkMode?: (dark: boolean) => void;
}

export default function Sidebar({ isDarkMode, setIsDarkMode }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { activeProject } = useProject();
  const currentView = location.pathname.replace('/', '') || 'projects';
  const [showChangePassword, setShowChangePassword] = useState(false);

  const navItems = [
    { id: 'projects', label: 'Projects', icon: FolderKanban },
    { id: 'input', label: 'Input', icon: Database },
    { id: 'map', label: 'Map', icon: MapIcon },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'admin', label: 'Admin Center', icon: Shield },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <aside className="w-64 bg-surface-container-low flex flex-col border-r border-outline-variant/10 shrink-0 h-full">
      <div className="p-6 flex flex-col gap-1">
        <h1 className="text-on-surface text-xl font-headline font-bold leading-tight tracking-tight">
          VRP Optimizer
        </h1>
        <p className="text-on-surface-variant text-xs font-medium uppercase tracking-widest">
          Fleet Management
        </p>
      </div>

      {/* Project đang chọn */}
      <div className="px-4 pb-2">
        <button
          onClick={() => navigate('/projects')}
          className="w-full rounded-xl bg-surface-container px-3 py-2 text-left hover:bg-surface-container-high transition-colors"
          title="Đổi project"
        >
          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Project</p>
          <p className="text-sm font-bold text-on-surface truncate">{activeProject ? activeProject.name : 'Chưa chọn'}</p>
        </button>
      </div>

      <nav className="flex-1 px-4 py-4 flex flex-col gap-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => navigate('/' + item.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors w-full text-left ${
                isActive 
                  ? 'bg-surface-container-high text-primary font-bold' 
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface font-medium'
              }`}
            >
              <Icon size={20} className={isActive ? 'text-primary' : ''} />
              <span className="text-sm">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User Profile Section */}
      <div className="p-4 border-t border-outline-variant/10">
        <div className="flex items-center gap-3 p-2">
          <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-bold text-sm">
            {user ? getInitials(user.full_name) : '??'}
          </div>
          <div className="flex flex-col text-left flex-1 min-w-0">
            <span className="text-sm font-bold text-on-surface truncate">{user?.full_name || 'Loading...'}</span>
            <span className="text-xs text-on-surface-variant capitalize">{user?.role || 'User'}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1 mt-2">
          <button
            onClick={() => setShowChangePassword(true)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-on-surface-variant hover:bg-surface-container transition-colors"
            title="Đổi mật khẩu"
          >
            <Key size={14} />
            Đổi MK
          </button>
          {setIsDarkMode && (
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-lg transition-colors"
              title="Toggle Dark Mode"
            >
              {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          )}
          <button
            onClick={handleLogout}
            className="p-2 text-error/70 hover:text-error hover:bg-error/10 rounded-lg transition-colors"
            title="Đăng xuất"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>

      {/* Change Password Modal */}
      {showChangePassword && (
        <ChangePasswordModal onClose={() => setShowChangePassword(false)} />
      )}
    </aside>
  );
}

// Change Password Modal Component
function ChangePasswordModal({ onClose }: { onClose: () => void }) {
  const { changePassword } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu mới không khớp');
      return;
    }

    if (newPassword.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }

    setIsLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      setSuccess(true);
      setTimeout(() => onClose(), 1500);
    } catch (err: any) {
      setError(err.message || 'Đổi mật khẩu thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-outline/50 backdrop-blur-sm p-4">
      <div className="bg-surface-container-lowest w-full max-w-sm rounded-2xl shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-200">
        <h3 className="text-lg font-bold text-on-surface mb-4">Đổi mật khẩu</h3>

        {success ? (
          <div className="p-4 rounded-xl bg-success/10 border border-success/20 text-success text-sm text-center">
            Đổi mật khẩu thành công!
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            {error && (
              <div className="p-3 rounded-lg bg-error/10 border border-error/20 text-error text-sm">
                {error}
              </div>
            )}
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wide mb-1">
                Mật khẩu hiện tại
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full h-10 bg-surface-container-low rounded-lg px-3 text-sm text-on-surface border border-outline-variant/10 focus:outline-none focus:ring-2 focus:ring-primary/50"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wide mb-1">
                Mật khẩu mới
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full h-10 bg-surface-container-low rounded-lg px-3 text-sm text-on-surface border border-outline-variant/10 focus:outline-none focus:ring-2 focus:ring-primary/50"
                required
                minLength={6}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wide mb-1">
                Xác nhận mật khẩu mới
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full h-10 bg-surface-container-low rounded-lg px-3 text-sm text-on-surface border border-outline-variant/10 focus:outline-none focus:ring-2 focus:ring-primary/50"
                required
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 h-10 rounded-xl bg-surface-container hover:bg-surface-container-high font-bold text-sm text-on-surface transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 h-10 rounded-xl bg-primary text-on-primary font-bold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Đang xử lý...' : 'Xác nhận'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
