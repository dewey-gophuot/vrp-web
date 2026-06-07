export interface PointCreateDTO {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  demand: number;
  priority: number;
  phone: string;
  time_window_start: string;
  time_window_end: string;
  service_time: number;
  address: string;
}

export interface PointUpdateDTO {
  name?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  demand?: number | null;
  priority?: number | null;
  phone?: string | null;
  time_window_start?: string | null;
  time_window_end?: string | null;
  service_time?: number | null;
  address?: string | null;
}

export interface DepotCoordinatesDTO {
  lat: number;
  lng: number;
}

export interface DepotCreateDTO {
  name: string;
  coordinates: DepotCoordinatesDTO;
  operating_windows?: string[];
}

export interface VehicleCreateDTO {
  id: string;
  name: string;
  status?: string;
  capacity_kg?: number;
  volume_m3?: number;
  cost_per_km?: number;
  ev?: boolean;
  license_plate?: string | null;
  cost_per_hour?: number | null;
  max_shift_hours?: number | null;
  depot_lat?: number | null;
  depot_lon?: number | null;
  driver_id?: string | null;
}

export interface ProjectResponse {
  id: string;
  name: string;
  location_count: number;
  created_at: string;
}

export interface OptimizeRunRequestDTO {
  project_id: string;
  solver_algorithm: string;
  vehicles: string[];
  locations: string[];
  objective: string;
  constraints?: Record<string, boolean>;
  replace_existing?: boolean;
}

export interface RouteAdjustDTO {
  stop_id: string;
  source_route_id: string;
  target_route_id: string;
  new_sequence_index: number;
}

export interface UserCreateDTO {
  full_name: string;
  role: string;
  phone?: string | null;
  email?: string | null;
}

export interface DriverStopStatusUpdateDTO {
  status: string;
  proof_of_delivery_url?: string | null;
  notes?: string | null;
}

export interface LocationCreateDTO {
  id?: string;
  project_id: string;
  name: string;
  address_string: string;
  lat: number;
  lng: number;
  demand_kg?: number;
  priority?: number;
  phone?: string | null;
  time_window_start?: string;
  time_window_end?: string;
  service_time_mins?: number;
}

export interface LocationUpdateDTO {
  name?: string | null;
  address_string?: string | null;
  lat?: number | null;
  lng?: number | null;
  demand_kg?: number | null;
  priority?: number | null;
  phone?: string | null;
  time_window_start?: string | null;
  time_window_end?: string | null;
  service_time_mins?: number | null;
}

export interface VehicleUpdateDTO {
  name?: string;
  status?: string;
  capacity_kg?: number;
  volume_m3?: number;
  cost_per_km?: number;
  ev?: boolean;
  license_plate?: string | null;
  cost_per_hour?: number | null;
  max_shift_hours?: number | null;
  depot_lat?: number | null;
  depot_lon?: number | null;
  driver_id?: string | null;
}

export interface DepotUpdateDTO {
  name?: string;
  coordinates?: DepotCoordinatesDTO;
  operating_windows?: string[];
}

export interface UserUpdateDTO {
  full_name?: string;
  role?: string;
  phone?: string | null;
  email?: string | null;
}

export interface UserDepotAssignDTO {
  depot_id: string;
}

// ==================== GEOCODING TYPES ====================

export interface GeocodeAutocompleteResult {
  place_id: string;
  display_name: string;
  address: string;
  lat: number;
  lng: number;
  gmap_url: string | null;
}

export interface GeocodePlaceDetail {
  place_id: string;
  display_name: string;
  address: string;
  lat: number;
  lng: number;
  gmap_url: string | null;
}

export interface GeocodeForwardResult {
  lat: number;
  lng: number;
  display_name: string;
  address: string;
}

export interface GeocodeReverseResult {
  lat: number;
  lng: number;
  display_name: string;
  address: string;
}

// ==================== METRICS TYPES ====================

export interface MetricsResponse {
  total_active_routes: number;
  total_vehicles: number;
  vehicles_in_use: number;
  vehicle_utilization_pct: number;
  total_distance_km: number;
  cost_savings_usd: number;
  efficiency_trend: number[];
}

export interface RouteMetricsResponse {
  route_id: string;
  status: string;
  total_distance_km: number;
  total_duration_mins: number;
  total_cost: number;
  stop_count: number;
  completed_stops: number;
  completion_pct: number;
}

// ==================== ROUTES TYPES ====================

export interface RouteSummary {
  id: string;
  vehicle_id: string;
  depot_id: string;
  job_id: string;
  status: 'planned' | 'dispatched' | 'in_progress' | 'completed' | 'cancelled';
  total_distance_km: number;
  total_duration_mins: number;
  total_cost: number;
  load_kg: number;
  utilization_pct: number;
  stop_count: number;
}

export interface ActiveRoute {
  route_id: string;
  vehicle_id: string;
  driver_name: string;
  tracking_status: 'on_time' | 'delayed' | 'early';
  progress_percentage: number;
  current_coordinates: { lat: number; lng: number };
  next_stop: {
    id: string;
    location_id: string;
    location_name: string;
    sequence_index: number;
    status: string;
  };
  delay_mins: number;
  updated_at: string;
}

export interface ActiveRouteTracking {
  route_id: string;
  vehicle_id: string;
  driver_name: string;
  tracking_status: 'on_time' | 'delayed' | 'early';
  progress_percentage: number;
  current_coordinates: { lat: number; lng: number };
  next_stop: {
    id: string;
    location_id: string;
    location_name: string;
    sequence_index: number;
    status: string;
  } | null;
  delay_mins: number;
  updated_at: string;
}

export interface StopDetail {
  stop_id: string;
  location_id: string;
  name: string;
  address: string;
  sequence: number;
  status: string;
  demand_kg: number;
  service_time_mins: number;
  time_window_start?: string;
  time_window_end?: string;
  actual_arrived_at?: string;
  actual_completed_at?: string;
  notes?: string;
  proof_of_delivery_url?: string;
}

export interface RouteDetail {
  id: string;
  vehicle_id: string;
  driver_name: string;
  status: string;
  stops: RouteStop[];
  total_distance_km: number;
  total_duration_mins: number;
  total_cost: number;
  load_kg: number;
  utilization_pct: number;
  stop_count: number;
  completed_stops: number;
  completion_pct: number;
}

export interface RouteStop {
  stop_id: string;
  location_id: string;
  name: string;
  address: string;
  sequence: number;
  status: 'pending' | 'arrived' | 'completed' | 'failed' | 'skipped';
  actual_arrived_at?: string;
  actual_completed_at?: string;
  notes?: string;
}

export interface ManifestStop {
  stop_id: string;
  location_id: string;
  name: string;
  address: string;
  sequence: number;
  status: string;
  lat?: number | null;
  lng?: number | null;
  demand_kg?: number | null;
  service_time_mins?: number | null;
  time_window_start?: string | null;
  time_window_end?: string | null;
  planned_eta?: string | null;
}

export interface ManifestDepot {
  depot_id: string;
  name: string;
  lat: number;
  lng: number;
}

export interface RouteManifest {
  route_id: string;
  vehicle_id: string;
  driver_name: string;
  status: string;
  depot?: ManifestDepot | null;
  stops: (RouteStop | ManifestStop)[];
}

// ==================== OPTIMIZATION TYPES ====================

export interface OptimizationRequest {
  project_id: string;
  solver_algorithm?: string;
  objective?: string;
  vehicles: string[];
  locations: string[];
  constraints?: {
    avoid_tolls?: boolean;
    strict_time_windows?: boolean;
    respect_capacity?: boolean;
  };
}

export interface OptimizationJobResponse {
  job_id: string;
  status: 'calculating' | 'completed' | 'failed' | 'cancelled';
  estimated_time_seconds?: number;
}

export interface OptimizationJob {
  job_id: string;
  status: 'calculating' | 'completed' | 'failed' | 'cancelled';
  solver_algorithm?: string;
  objective?: string;
  created_at: string;
  updated_at?: string;
  result?: OptimizationResult;
  estimated_time_seconds?: number;
}

export interface OptimizationResult {
  total_distance_km: number;
  total_duration_mins: number;
  total_cost: number;
  routes: OptimizationRoute[];
}

export interface OptimizationRoute {
  route_id: string;
  vehicle_id: string;
  stop_count: number;
  load_kg: number;
  utilization_pct: number;
  distance_km: number;
  duration_mins: number;
  cost: number;
}

// ==================== DRIVER TYPES ====================

export interface DriverResponse {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  license_number: string | null;
  license_expiry: string | null;
  status: 'active' | 'inactive' | 'suspended';
  vehicle_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface DriverCreateDTO {
  full_name: string;
  email?: string | null;
  phone?: string | null;
  license_number?: string | null;
  license_expiry?: string | null;
  vehicle_id?: string | null;
  depot_id?: string;
}

export interface DriverUpdateDTO {
  full_name?: string;
  email?: string | null;
  phone?: string | null;
  license_number?: string | null;
  license_expiry?: string | null;
  status?: 'active' | 'inactive' | 'suspended';
  vehicle_id?: string | null;
}

export interface RouteStatusUpdateDTO {
  status: string;
  note?: string | null;
}

// ==================== AUTH TYPES ====================

export interface AuthRegisterDTO {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
}

export interface AuthLoginDTO {
  email: string;
  password: string;
}

export interface AuthChangePasswordDTO {
  current_password: string;
  new_password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: UserResponse;
}

// ==================== ENUMS ====================

export enum UserRole {
  ADMIN = 'admin',
  DISPATCHER = 'dispatcher',
  DRIVER = 'driver',
}

export enum VehicleStatus {
  AVAILABLE = 'available',
  IN_USE = 'in_use',
  MAINTENANCE = 'maintenance',
  RETIRED = 'retired',
}

export enum SolverAlgorithm {
  NEAREST_NEIGHBOR = 'nearest_neighbor',
  GENETIC_ALGORITHM = 'genetic_algorithm',
  CLARKE_WRIGHT_SAVINGS = 'clarke_wright_savings',
}

export enum Objective {
  MINIMIZE_DISTANCE = 'minimize_distance',
  MINIMIZE_TIME = 'minimize_time',
  MINIMIZE_COST = 'minimize_cost',
}

export enum RouteStatus {
  PLANNED = 'planned',
  DISPATCHED = 'dispatched',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum StopStatus {
  PENDING = 'pending',
  EN_ROUTE = 'en_route',
  ARRIVED = 'arrived',
  COMPLETED = 'completed',
  FAILED = 'failed',
  SKIPPED = 'skipped',
}

export enum TrackingStatus {
  ON_TIME = 'on_time',
  DELAYED = 'delayed',
  OFF_ROUTE = 'off_route',
}

// ==================== RESPONSE TYPES ====================

export interface DepotResponse {
  id: string;
  name: string;
  coordinates: { lat: number; lng: number };
  address: string;
  operating_windows: string[];
  created_at: string;
  updated_at: string;
}

export interface VehicleResponse {
  id: string;
  name: string;
  license_plate: string;
  status: VehicleStatus;
  capacity_kg: number;
  volume_m3: number;
  cost_per_km: number;
  cost_per_hour: number | null;
  max_shift_hours: number;
  ev: boolean;
  depot_id: string;
  driver_id: string;
  driver_name: string;
  created_at: string;
  updated_at: string;
}

export interface LocationResponse {
  id: string;
  name: string;
  address: string;
  coordinates: { lat: number; lng: number };
  demand_kg: number;
  priority: number;
  phone: string;
  time_window_start: string;
  time_window_end: string;
  service_time_mins: number;
  created_at: string;
  updated_at: string;
}

export interface UploadManifestResponse {
  success: boolean;
  message: string;
  uploaded_rows: number;
  created_locations: number;
  skipped_existing: number;
}

export interface OptimizeJobResponse {
  job_id: string;
  status: 'calculating' | 'completed' | 'cancelled' | 'failed';
  estimated_time_seconds?: number;
  result?: {
    total_distance_km: number;
    total_duration_mins: number;
    routes: RouteSummary[];
  };
}

export interface RouteSummary {
  route_id: string;
  vehicle_id: string;
  stop_count: number;
  load_kg: number;
  utilization_pct: number;
  distance_km: number;
  duration_mins: number;
}


export interface UserResponse {
  id: string;
  full_name: string;
  role: UserRole;
  email: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface DashboardMetrics {
  total_active_routes: number;
  total_vehicles: number;
  vehicles_in_use: number;
  vehicle_utilization_pct: number;
  total_distance_km: number;
  cost_savings_usd: number;
  efficiency_trend: number[];
}

export interface RouteMetrics {
  route_id: string;
  status: RouteStatus;
  total_distance_km: number;
  total_duration_mins: number;
  total_cost: number;
  stop_count: number;
  completed_stops: number;
  completion_pct: number;
}
