import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProjectProvider } from './contexts/ProjectContext';
import Sidebar from './components/Sidebar';
import ProjectsView from './views/ProjectsView';
import InputView from './views/InputView';
import MapView from './views/MapView';
import ReportsView from './views/ReportsView';
import ActiveRoutesView from './views/ActiveRoutesView';
import SettingsView from './views/SettingsView';
import AdminView from './views/AdminView';
import LoginView from './views/LoginView';
import RegisterView from './views/RegisterView';
import DepotView from './views/DepotView';
import FleetView from './views/FleetView';

// Additional views for backend workflow
const UsersView = () => <div className="p-6"><h2 className="text-xl font-bold">Users Management</h2><p className="text-on-surface-variant mt-2">POST/GET /api/v1/users</p></div>;
const DriversView = () => <div className="p-6"><h2 className="text-xl font-bold">Drivers Management</h2><p className="text-on-surface-variant mt-2">POST/GET /api/v1/drivers</p></div>;
const UploadManifestView = () => <div className="p-6"><h2 className="text-xl font-bold">Upload Manifest</h2><p className="text-on-surface-variant mt-2">POST /api/v1/locations/upload-manifest</p></div>;
const OptimizeView = () => <div className="p-6"><h2 className="text-xl font-bold">Run Optimize</h2><p className="text-on-surface-variant mt-2">POST /api/v1/optimize/run</p></div>;
const RouteDetailView = () => <div className="p-6"><h2 className="text-xl font-bold">Route Detail</h2><p className="text-on-surface-variant mt-2">GET /api/v1/routes/:id</p></div>;
const DispatchView = () => <div className="p-6"><h2 className="text-xl font-bold">Dispatch</h2><p className="text-on-surface-variant mt-2">POST /api/v1/routes/:id/dispatch</p></div>;

// Protected Route wrapper
function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen w-full bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

// Public Route wrapper (redirect if authenticated)
function PublicRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen w-full bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return !isAuthenticated ? <Outlet /> : <Navigate to="/projects" replace />;
}

// Layout with sidebar for authenticated users
function AuthenticatedLayout({ isDarkMode, setIsDarkMode }: { isDarkMode: boolean; setIsDarkMode: (v: boolean) => void }) {
  return (
    <div className="h-dvh w-dvw overflow-hidden bg-background flex items-center justify-center p-2">
      <div className="w-full h-full max-w-[1920px] mx-auto overflow-hidden rounded-2xl border border-outline-variant/20 bg-background font-sans text-on-surface shadow-2xl">
        <div className="flex h-full w-full overflow-hidden">
          <Sidebar isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
          <div className="relative flex flex-1 flex-col overflow-hidden">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}

function AppContent() {
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

  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<LoginView />} />
        <Route path="/register" element={<RegisterView />} />
      </Route>

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AuthenticatedLayout isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />}>
          {/* UI chính */}
          <Route path="/" element={<Navigate to="/projects" replace />} />
          <Route path="/projects" element={<ProjectsView />} />
          <Route path="/dashboard" element={<Navigate to="/projects" replace />} />
          <Route path="/input" element={<InputView />} />
          <Route path="/map" element={<MapView />} />
          <Route path="/reports" element={<ReportsView />} />
          <Route path="/reports-active" element={<ActiveRoutesView />} />
          <Route path="/reports-settings" element={<SettingsView />} />
          <Route path="/admin" element={<AdminView />} />

          {/* Routes thêm cho backend workflow (không hiển thị trên sidebar) */}
          {/* Bước 1: Setup */}
          <Route path="/depots" element={<DepotView />} />
          <Route path="/users" element={<UsersView />} />
          <Route path="/drivers" element={<DriversView />} />
          <Route path="/fleet" element={<FleetView />} />

          {/* Bước 2: Đơn hàng */}
          <Route path="/upload" element={<UploadManifestView />} />

          {/* Bước 3: Tối ưu */}
          <Route path="/optimize" element={<OptimizeView />} />
          <Route path="/routes/:id" element={<RouteDetailView />} />

          {/* Bước 4: Điều phối */}
          <Route path="/dispatch" element={<DispatchView />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/projects" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ProjectProvider>
        <AppContent />
      </ProjectProvider>
    </AuthProvider>
  );
}
