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
  driver_name?: string | null;
}

export interface OptimizeRunRequestDTO {
  project_id: string;
  solver_algorithm: string;
  vehicles: string[];
  locations: string[];
  objective: string;
  constraints?: Record<string, boolean>;
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
  driver_name?: string | null;
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

export interface RouteStatusUpdateDTO {
  status: string;
  note?: string | null;
}
