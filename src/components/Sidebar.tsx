import React from 'react';
import { LayoutDashboard, Database, Map as MapIcon, BarChart3, Sun, Moon, Shield, Smartphone } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

interface SidebarProps {
  variant?: 'default' | 'reports';
  isDarkMode?: boolean;
  setIsDarkMode?: (dark: boolean) => void;
}

export default function Sidebar({ variant = 'default', isDarkMode, setIsDarkMode }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const currentView = location.pathname.replace('/', '') || 'dashboard';
  
  const navItems = variant === 'default' ? [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'input', label: 'Input', icon: Database },
    { id: 'map', label: 'Map', icon: MapIcon },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'admin', label: 'Admin Center', icon: Shield },
  ] : [
    { id: 'reports', label: 'Route Analytics', icon: BarChart3 },
    { id: 'reports-active', label: 'Active Routes', icon: MapIcon },
    { id: 'reports-settings', label: 'Settings', icon: Database },
    { id: 'dashboard', label: 'Back to Dashboard', icon: LayoutDashboard },
  ];

  return (
    <aside className="w-64 bg-surface-container-low flex flex-col border-r border-outline-variant/10 shrink-0 h-full">
      <div className="p-6 flex flex-col gap-1">
        <h1 className="text-on-surface text-xl font-headline font-bold leading-tight tracking-tight">
          {variant === 'default' ? 'VRP Optimizer' : 'Logistics Pro'}
        </h1>
        <p className="text-on-surface-variant text-xs font-medium uppercase tracking-widest">
          {variant === 'default' ? 'Fleet Management' : 'Fleet Manager Admin'}
        </p>
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

      {variant === 'default' ? (
        <div className="p-4 border-t border-outline-variant/10">
          <div className="flex items-center gap-3 p-2">
            <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-bold text-sm">
              JD
            </div>
            <div className="flex flex-col text-left flex-1">
              <span className="text-sm font-bold text-on-surface">John Doe</span>
              <span className="text-xs text-on-surface-variant">Fleet Admin</span>
            </div>
            {setIsDarkMode && (
              <button 
                onClick={() => setIsDarkMode(!isDarkMode)} 
                className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-xl transition-colors"
                title="Toggle Dark Mode"
              >
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="mt-auto">
          {setIsDarkMode && (
            <div className="px-6 pb-2">
              <button 
                onClick={() => setIsDarkMode(!isDarkMode)} 
                className="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors w-full text-left text-on-surface-variant hover:bg-surface-container hover:text-on-surface font-medium"
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                <span className="text-sm">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
              </button>
            </div>
          )}
          <div className="m-6 mt-2 p-4 rounded-xl bg-primary-container text-on-primary-container">
            <p className="text-xs font-bold uppercase tracking-wider mb-2">System Status</p>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-on-tertiary-container animate-pulse"></span>
              <span className="text-sm">Real-time Sync Active</span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
