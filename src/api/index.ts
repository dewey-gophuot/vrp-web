import * as Types from './types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Generic fetch wrapper
async function fetchApi<T>(url: string, options?: RequestInit): Promise<T> {
  const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
  const token = localStorage.getItem('access_token');
  const headers: Record<string, string> = {
    ...(options?.headers as Record<string, string> || {}),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  console.log(`API Request: ${options?.method || 'GET'} ${fullUrl}`);

  const response = await fetch(fullUrl, { ...options, headers });

  if (!response.ok) {
    let errorMessage = `API error: ${response.status} ${response.statusText}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorData.message || errorMessage;
      console.error('API Error Response:', errorData);
    } catch {
      console.error('API Error (no JSON body):', response.status, response.statusText);
    }
    throw new Error(errorMessage);
  }

  const data = await response.json();
  console.log(`API Response [${url}]:`, data);
  return data;
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
  getFleetVehicles: () => fetchApi<Types.VehicleResponse[]>('/api/v1/fleet/vehicles'),
  getFleetVehicleDetail: (vehicleId: string) => fetchApi<Types.VehicleResponse>(`/api/v1/fleet/vehicles/${vehicleId}`),
  createFleetVehicle: (data: Types.VehicleCreateDTO) =>
    fetchApi<Types.VehicleResponse>('/api/v1/fleet/vehicles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
  updateFleetVehicle: (vehicleId: string, data: Types.VehicleUpdateDTO) =>
    fetchApi<Types.VehicleResponse>(`/api/v1/fleet/vehicles/${vehicleId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
  deleteFleetVehicle: (vehicleId: string) =>
    fetchApi<void>(`/api/v1/fleet/vehicles/${vehicleId}`, { method: 'DELETE' }),

  // V1 Projects
  listProjects: () => fetchApi<Types.ProjectResponse[]>('/api/v1/projects'),
  createProject: (data: { name: string }) =>
    fetchApi<Types.ProjectResponse>('/api/v1/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
  getProject: (projectId: string) => fetchApi<Types.ProjectResponse>(`/api/v1/projects/${projectId}`),
  updateProject: (projectId: string, data: { name: string }) =>
    fetchApi<Types.ProjectResponse>(`/api/v1/projects/${projectId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
  deleteProject: (projectId: string) =>
    fetchApi<void>(`/api/v1/projects/${projectId}`, { method: 'DELETE' }),

  // V1 Locations
  getLocationDemands: (projectId: string) =>
    fetchApi<Types.LocationResponse[]>(`/api/v1/locations/demand?project_id=${encodeURIComponent(projectId)}`),
  createLocation: (data: Types.LocationCreateDTO) =>
    fetchApi<Types.LocationResponse>('/api/v1/locations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
  getLocationDetail: (locationId: string) => fetchApi<Types.LocationResponse>(`/api/v1/locations/${locationId}`),
  updateLocation: (locationId: string, data: Types.LocationUpdateDTO) =>
    fetchApi<Types.LocationResponse>(`/api/v1/locations/${locationId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
  deleteLocation: (locationId: string) =>
    fetchApi<void>(`/api/v1/locations/${locationId}`, { method: 'DELETE' }),
  createDepot: (data: Types.DepotCreateDTO) =>
    fetchApi<Types.DepotResponse>('/api/v1/locations/depots', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
  listDepots: () => fetchApi<Types.DepotResponse[]>('/api/v1/locations/depots'),
  getDepot: (depotId: string) => fetchApi<Types.DepotResponse>(`/api/v1/locations/depots/${depotId}`),
  updateDepot: (depotId: string, data: Types.DepotUpdateDTO) =>
    fetchApi<Types.DepotResponse>(`/api/v1/locations/depots/${depotId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
  deleteDepot: (depotId: string) =>
    fetchApi<void>(`/api/v1/locations/depots/${depotId}`, { method: 'DELETE' }),
  uploadManifest: (file: File, projectId: string) => {
    const formData = new FormData();
    formData.append('file', file);
    return fetchApi<Types.UploadManifestResponse>(
      `/api/v1/locations/upload-manifest?project_id=${encodeURIComponent(projectId)}`,
      { method: 'POST', body: formData },
    );
  },

  // V1 Optimize
  runOptimizer: (data: Types.OptimizeRunRequestDTO) =>
    fetchApi<{ job_id: string; status: string; estimated_time_seconds: number }>('/api/v1/optimize/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
  getOptimizerJob: (jobId: string) => fetchApi<Types.OptimizeJobResponse>(`/api/v1/optimize/job/${jobId}`),
  listOptimizerJobs: () => fetchApi<Types.OptimizeJobResponse[]>('/api/v1/optimize/jobs'),
  cancelOptimizerJob: (jobId: string) =>
    fetchApi<{ success: boolean }>(`/api/v1/optimize/job/${jobId}/cancel`, { method: 'POST' }),
  getOptimizerJobResult: (jobId: string) =>
    fetchApi<Types.OptimizeJobResponse>(`/api/v1/optimize/job/${jobId}/result`),

  // V1 Routes
  listRoutes: () => fetchApi<Types.RouteDetail[]>('/api/v1/routes'),
  getActiveRoutes: () => fetchApi<Types.ActiveRouteTracking[]>('/api/v1/routes/active'),
  getRouteDetail: (routeId: string) => fetchApi<Types.RouteDetail>(`/api/v1/routes/${routeId}`),
  getRouteManifest: (routeId: string) => fetchApi<Types.RouteManifest>(`/api/v1/routes/${routeId}/manifest`),
  dispatchRoute: (routeId: string) =>
    fetchApi<{ success: boolean; route_id: string; status: string }>(`/api/v1/routes/${routeId}/dispatch`, { method: 'POST' }),
  completeRoute: (routeId: string) =>
    fetchApi<{ success: boolean; route_id: string; status: string }>(`/api/v1/routes/${routeId}/complete`, { method: 'POST' }),
  updateRouteStatus: (routeId: string, data: Types.RouteStatusUpdateDTO) =>
    fetchApi<{ success: boolean }>(`/api/v1/routes/${routeId}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
  adjustRoute: (routeId: string, data: Types.RouteAdjustDTO) =>
    fetchApi<{ success: boolean }>(`/api/v1/routes/${routeId}/adjust`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
  deleteRoute: (routeId: string) =>
    fetchApi<void>(`/api/v1/routes/${routeId}`, { method: 'DELETE' }),
  exportRoute: (routeId: string, format: 'json' | 'xlsx' | 'pdf') =>
    fetchApi<Blob>(`/api/v1/routes/${routeId}/export?format=${format}`),

  // V1 Metrics
  getDashboardMetrics: () => fetchApi<Types.DashboardMetrics>('/api/v1/metrics/dashboard'),
  getRouteMetrics: (routeId: string) => fetchApi<Types.RouteMetrics>(`/api/v1/metrics/routes/${routeId}`),

  // V1 Reports (deprecated, use exportRoute instead)
  getRouteReport: (routeId: string) => fetchApi<Types.RouteDetail>(`/api/v1/reports/routes/${routeId}`),
  exportRouteReport: (routeId: string, format: 'pdf' | 'xlsx' | 'json') =>
    fetchApi<Blob>(`/api/v1/reports/routes/${routeId}/export?format=${format}`),

  // V1 Users
  listUsers: () => fetchApi<Types.UserResponse[]>('/api/v1/users'),
  getUser: (userId: string) => fetchApi<Types.UserResponse>(`/api/v1/users/${userId}`),
  createUser: (data: Types.UserCreateDTO) =>
    fetchApi<Types.UserResponse>('/api/v1/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
  updateUser: (userId: string, data: Types.UserUpdateDTO) =>
    fetchApi<Types.UserResponse>(`/api/v1/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
  deleteUser: (userId: string) => fetchApi<void>(`/api/v1/users/${userId}`, { method: 'DELETE' }),

  // Current User Depot Assignment (for sharing depot management)
  assignMyDepot: (data: Types.UserDepotAssignDTO) =>
    fetchApi<{ success: boolean; message: string }>('/api/v1/users/me/depots', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),

  // V1 Drivers (Dispatcher management)
  listDrivers: () => fetchApi<Types.DriverResponse[]>('/api/v1/drivers'),
  getDriver: (driverId: string) => fetchApi<Types.DriverResponse>(`/api/v1/drivers/${driverId}`),
  createDriver: (data: Types.DriverCreateDTO) =>
    fetchApi<Types.DriverResponse>('/api/v1/drivers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
  updateDriver: (driverId: string, data: Types.DriverUpdateDTO) =>
    fetchApi<Types.DriverResponse>(`/api/v1/drivers/${driverId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
  deleteDriver: (driverId: string) => fetchApi<void>(`/api/v1/drivers/${driverId}`, { method: 'DELETE' }),

  // V1 Driver App (for drivers)
  getDriverManifest: () => fetchApi<{ routes: Types.RouteManifest[] }>('/api/v1/driver/manifest'),
  getDriverRouteStops: (routeId: string) => fetchApi<Types.StopDetail[]>(`/api/v1/driver/routes/${routeId}/stops`),
  updateDriverStopStatus: (stopId: string, data: Types.DriverStopStatusUpdateDTO) =>
    fetchApi<{ success: boolean; progress_percentage: number; next_stop_id: string | null }>(`/api/v1/driver/stops/${stopId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
  getDriverStopStatus: (stopId: string) => fetchApi<Types.StopDetail>(`/api/v1/driver/stops/${stopId}`),

  // V1 Geocoding
  geocodeAutocomplete: (query: string, limit: number = 5) =>
    fetchApi<Types.GeocodeAutocompleteResult[]>(`/api/v1/geocode/autocomplete?q=${encodeURIComponent(query)}&limit=${limit}`),
  geocodePlaceDetail: (placeId: string) =>
    fetchApi<Types.GeocodePlaceDetail>(`/api/v1/geocode/place/${encodeURIComponent(placeId)}`),
  geocodeForward: (address: string) =>
    fetchApi<Types.GeocodeForwardResult>(`/api/v1/geocode/forward?address=${encodeURIComponent(address)}`),
  geocodeReverse: (lat: number, lng: number) =>
    fetchApi<Types.GeocodeReverseResult>(`/api/v1/geocode/reverse?lat=${lat}&lng=${lng}`),

  // V1 Directions (road-following geometry)
  getDirections: (points: { lat: number; lng: number }[]) =>
    fetchApi<{ geometry: [number, number][]; distance_km: number; duration_min: number }>(
      '/api/v1/directions',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ points }),
      },
    ),

  // V1 Metrics
  getMetricsDashboard: () => fetchApi<Types.MetricsResponse>('/api/v1/metrics/dashboard'),

  // V1 Routes
  getRoutes: (projectId?: string) =>
    fetchApi<Types.RouteSummary[]>(`/api/v1/routes${projectId ? `?project_id=${encodeURIComponent(projectId)}` : ''}`),
  getOptimizationJobs: (projectId?: string) =>
    fetchApi<Types.OptimizationJob[]>(`/api/v1/optimize/jobs${projectId ? `?project_id=${encodeURIComponent(projectId)}` : ''}`),
  getOptimizationJob: (jobId: string) => fetchApi<Types.OptimizationJob>(`/api/v1/optimize/job/${jobId}`),
  cancelOptimizationJob: (jobId: string) => 
    fetchApi<{ success: boolean; job_id: string; status: string }>(`/api/v1/optimize/job/${jobId}/cancel`, {
      method: 'POST',
    }),

  
  // Auth
  authRegister: (data: Types.AuthRegisterDTO) =>
    fetchApi<Types.AuthResponse>('/api/v1/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
  authLogin: (data: Types.AuthLoginDTO) =>
    fetchApi<Types.AuthResponse>('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
  authMe: () => fetchApi<Types.UserResponse>('/api/v1/auth/me'),
  authChangePassword: (data: Types.AuthChangePasswordDTO) =>
    fetchApi<{ success: boolean; message: string }>('/api/v1/auth/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
};

export default api;
