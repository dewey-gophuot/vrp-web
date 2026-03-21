import React, { useEffect, useState } from 'react';
import Sidebar from './components/Sidebar';
import DashboardView from './views/Dashboard';
import InputView from './views/InputView';
import MapView from './views/MapView';
import ReportsView from './views/ReportsView';

export default function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      const nextScale = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
      setScale(Math.min(1, nextScale));
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView />;
      case 'input':
        return <InputView />;
      case 'map':
        return <MapView />;
      case 'reports':
        return <ReportsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-background">
      <div
        className="absolute left-1/2 top-1/2 overflow-hidden rounded-2xl border border-outline-variant/20 bg-background font-sans text-on-surface shadow-2xl"
        style={{
          width: 1920,
          height: 1080,
          transform: `translate(-50%, -50%) scale(${scale})`,
          transformOrigin: 'center center',
        }}
      >
        <div className="flex h-full w-full overflow-hidden">
          {currentView === 'dashboard' && (
            <Sidebar currentView={currentView} setCurrentView={setCurrentView} variant="default" />
          )}

          {currentView === 'reports' && (
            <Sidebar currentView={currentView} setCurrentView={setCurrentView} variant="reports" />
          )}

          <div className="relative flex flex-1 flex-col overflow-hidden">
            {(currentView === 'input' || currentView === 'map') && (
              <div className="absolute top-4 left-1/2 z-50 flex -translate-x-1/2 gap-2 rounded-full border border-outline-variant/20 bg-surface-container-lowest/80 p-2 shadow-lg backdrop-blur-md">
                <button onClick={() => setCurrentView('dashboard')} className="rounded-full px-4 py-1.5 text-xs font-bold transition-colors hover:bg-surface-container">Dashboard</button>
                <button onClick={() => setCurrentView('input')} className={`rounded-full px-4 py-1.5 text-xs font-bold transition-colors ${currentView === 'input' ? 'bg-primary text-on-primary' : 'hover:bg-surface-container'}`}>Input</button>
                <button onClick={() => setCurrentView('map')} className={`rounded-full px-4 py-1.5 text-xs font-bold transition-colors ${currentView === 'map' ? 'bg-primary text-on-primary' : 'hover:bg-surface-container'}`}>Map</button>
                <button onClick={() => setCurrentView('reports')} className="rounded-full px-4 py-1.5 text-xs font-bold transition-colors hover:bg-surface-container">Reports</button>
              </div>
            )}

            {renderView()}
          </div>
        </div>
      </div>
    </div>
  );
}
