import * as Types from './types';

// Generic fetch wrapper
async function fetchApi<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

export const api = {
  // Base
  getRoot: () => fetchApi<any>('/api/'),
  
  // Points
  getPoints: () => fetchApi<any[]>('/api/points'),
  createPoint: (data: Types.PointCreateDTO) => 
    fetchApi<any>('/api/points', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
  updatePoint: (id: string, data: Types.PointUpdateDTO) =>
    fetchApi<any>(`/api/points/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
  deletePoint: (id: string) =>
    fetchApi<any>(`/api/points/${id}`, { method: 'DELETE' }),

  // Optimization (Base)
  optimizeNearestNeighbor: () => fetchApi<any>('/api/optimize/nearest-neighbor', { method: 'POST' }),
  optimizeGeneticAlgorithm: () => fetchApi<any>('/api/optimize/genetic-algorithm', { method: 'POST' }),

  // V1 Fleet
  getFleetVehicles: () => fetchApi<any[]>('/api/v1/fleet/vehicles'),
  getFleetVehicleDetail: (vehicleId: string) => fetchApi<any>(`/api/v1/fleet/vehicles/${vehicleId}`),
  createFleetVehicle: (data: Types.VehicleCreateDTO) =>
    fetchApi<any>('/api/v1/fleet/vehicles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
  updateFleetVehicle: (vehicleId: string, data: Types.VehicleUpdateDTO) =>
    fetchApi<any>(`/api/v1/fleet/vehicles/${vehicleId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
  deleteFleetVehicle: (vehicleId: string) =>
    fetchApi<any>(`/api/v1/fleet/vehicles/${vehicleId}`, { method: 'DELETE' }),

  // V1 Locations
  getLocationDemands: () => fetchApi<any[]>('/api/v1/locations/demand'),
  createLocation: (data: Types.LocationCreateDTO) =>
    fetchApi<any>('/api/v1/locations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
  getLocationDetail: (locationId: string) => fetchApi<any>(`/api/v1/locations/${locationId}`),
  updateLocation: (locationId: string, data: Types.LocationUpdateDTO) =>
    fetchApi<any>(`/api/v1/locations/${locationId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
  deleteLocation: (locationId: string) =>
    fetchApi<any>(`/api/v1/locations/${locationId}`, { method: 'DELETE' }),
  createDepot: (data: Types.DepotCreateDTO) =>
    fetchApi<any>('/api/v1/locations/depots', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
  listDepots: () => fetchApi<any[]>('/api/v1/locations/depots'),
  getDepot: (depotId: string) => fetchApi<any>(`/api/v1/locations/depots/${depotId}`),
  updateDepot: (depotId: string, data: Types.DepotUpdateDTO) =>
    fetchApi<any>(`/api/v1/locations/depots/${depotId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
  deleteDepot: (depotId: string) =>
    fetchApi<any>(`/api/v1/locations/depots/${depotId}`, { method: 'DELETE' }),
  uploadManifest: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return fetchApi<any>('/api/v1/locations/upload-manifest', {
      method: 'POST',
      body: formData,
    });
  },

  // V1 Optimize
  runOptimizer: (data: Types.OptimizeRunRequestDTO) =>
    fetchApi<any>('/api/v1/optimize/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
  getOptimizerJob: (jobId: string) => fetchApi<any>(`/api/v1/optimize/job/${jobId}`),
  listOptimizerJobs: () => fetchApi<any[]>('/api/v1/optimize/jobs'),
  cancelOptimizerJob: (jobId: string) =>
    fetchApi<any>(`/api/v1/optimize/job/${jobId}/cancel`, { method: 'POST' }),
  getOptimizerJobResult: (jobId: string) =>
    fetchApi<any>(`/api/v1/optimize/job/${jobId}/result`),

  // V1 Routes
  listRoutes: () => fetchApi<any[]>('/api/v1/routes'),
  getActiveRoutes: () => fetchApi<any[]>('/api/v1/routes/active'),
  getRouteDetail: (routeId: string) => fetchApi<any>(`/api/v1/routes/${routeId}`),
  getRouteManifest: (routeId: string) => fetchApi<any>(`/api/v1/routes/${routeId}/manifest`),
  dispatchRoute: (routeId: string) => fetchApi<any>(`/api/v1/routes/${routeId}/dispatch`, { method: 'POST' }),
  completeRoute: (routeId: string) =>
    fetchApi<any>(`/api/v1/routes/${routeId}/complete`, { method: 'POST' }),
  updateRouteStatus: (routeId: string, data: Types.RouteStatusUpdateDTO) =>
    fetchApi<any>(`/api/v1/routes/${routeId}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
  adjustRoute: (routeId: string, data: Types.RouteAdjustDTO) =>
    fetchApi<any>(`/api/v1/routes/${routeId}/adjust`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
  deleteRoute: (routeId: string) =>
    fetchApi<any>(`/api/v1/routes/${routeId}`, { method: 'DELETE' }),

  // V1 Metrics
  getDashboardMetrics: () => fetchApi<any>('/api/v1/metrics/dashboard'),
  getRouteMetrics: (routeId: string) => fetchApi<any>(`/api/v1/metrics/routes/${routeId}`),

  // V1 Reports
  getRouteReport: (routeId: string) => fetchApi<any>(`/api/v1/reports/routes/${routeId}`),
  exportRouteReport: (routeId: string, format: 'pdf' | 'xlsx' | 'json') =>
    fetchApi<any>(`/api/v1/reports/routes/${routeId}/export?format=${format}`),

  // V1 Users
  listUsers: () => fetchApi<any[]>('/api/v1/users'),
  getUser: (userId: string) => fetchApi<any>(`/api/v1/users/${userId}`),
  createUser: (data: Types.UserCreateDTO) =>
    fetchApi<any>('/api/v1/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
  updateUser: (userId: string, data: Types.UserUpdateDTO) =>
    fetchApi<any>(`/api/v1/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
  deleteUser: (userId: string) => fetchApi<any>(`/api/v1/users/${userId}`, { method: 'DELETE' }),

  // V1 Driver
  getDriverManifest: () => fetchApi<any>('/api/v1/driver/manifest'),
  getDriverRouteStops: (routeId: string) => fetchApi<any>(`/api/v1/driver/routes/${routeId}/stops`),
  updateDriverStopStatus: (stopId: string, data: Types.DriverStopStatusUpdateDTO) =>
    fetchApi<any>(`/api/v1/driver/stops/${stopId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
  getDriverStopStatus: (stopId: string) => fetchApi<any>(`/api/v1/driver/stops/${stopId}`),
};

export default api;
