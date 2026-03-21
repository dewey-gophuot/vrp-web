import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import DashboardView from './views/Dashboard';
import InputView from './views/InputView';
import MapView from './views/MapView';
import ReportsView from './views/ReportsView';
import ActiveRoutesView from './views/ActiveRoutesView';
import SettingsView from './views/SettingsView';
import AdminView from './views/AdminView';

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const location = useLocation();
  const currentPath = location.pathname.replace('/', '') || 'dashboard';
  const sidebarVariant = currentPath.startsWith('reports') ? 'reports' : 'default';

  return (
    <div className="h-dvh w-dvw overflow-hidden bg-background flex items-center justify-center p-2">
      <div className="w-full h-full max-w-[1920px] mx-auto overflow-hidden rounded-2xl border border-outline-variant/20 bg-background font-sans text-on-surface shadow-2xl">
        <div className="flex h-full w-full overflow-hidden">
          <Sidebar 
            variant={sidebarVariant} 
            isDarkMode={isDarkMode}
            setIsDarkMode={setIsDarkMode}
          />

          <div className="relative flex flex-1 flex-col overflow-hidden">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardView />} />
              <Route path="/input" element={<InputView />} />
              <Route path="/map" element={<MapView />} />
              <Route path="/reports" element={<ReportsView />} />
              <Route path="/reports-active" element={<ActiveRoutesView />} />
              <Route path="/reports-settings" element={<SettingsView />} />
              <Route path="/admin" element={<AdminView />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  );
}
