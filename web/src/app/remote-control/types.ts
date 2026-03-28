// Shared types for the multi-domain remote control dashboard

export type DomainType = "EV" | "FACILITIES" | "FLEET";

// Active layer state (multiple can be on simultaneously)
export interface LayerVisibility {
  EV: boolean;
  FACILITIES: boolean;
  FLEET: boolean;
}

// --- EV Domain ---
export interface Station {
  id: string;
  name: string;
  lat: number;
  lng: number;
  status: "Available" | "Charging" | "Faulted" | string;
  powerLimit: number;
  socketStatus?: string;
  currentMeter?: number;
  powerOutput?: number;
}

// --- Facilities Domain ---
export interface FacilityZone {
  id: string;
  name: string;            // "Floor 1", "Office A", "Cold Storage Bay 2"
  type: "Floor" | "Office" | "Bay" | "Room" | "Wing";
  currentPower: number;    // kW
  dailyEnergy: number;     // kWh
  status: "Normal" | "High Usage" | "Critical" | "Offline";
  occupancy?: number;      // percentage 0-100
}

export interface Facility {
  id: string;
  name: string;
  type: "Warehouse" | "Office" | "Factory" | "Distribution Center";
  lat: number;
  lng: number;
  status: "Normal" | "High Usage" | "Critical" | "Offline";
  currentPower: number;    // kW total real-time draw
  dailyEnergy: number;     // kWh consumed today
  monthlyEnergy: number;   // kWh consumed this month
  peakDemand: number;      // kW peak load today
  capacity: number;        // kW max rated capacity
  pue: number;             // Power Usage Effectiveness (1.0-2.0)
  zones: FacilityZone[];   // per-floor / per-office breakdown
}

// --- Fleet Domain ---
// Facilities serve as fleet nodes (origins/destinations)
export interface FleetNode {
  facilityId: string;      // references a Facility.id
  name: string;
  lat: number;
  lng: number;
}

export interface TruckRoute {
  origin: FleetNode;
  destination: FleetNode;
  waypoints: { lat: number; lng: number }[];
  eta: string;
  distanceRemaining: number; // km
}

export type LoadLevel = 0 | 1 | 2 | 3 | 4 | 5;

export interface Truck {
  id: string;
  name: string;
  driverName: string;
  lat: number;
  lng: number;
  status: "En Route" | "Idle" | "Loading" | "Returning" | "Maintenance";
  loadLevel: LoadLevel;       // 0-5 (6 discrete levels)
  loadPercent: number;        // 0-100
  speed: number;              // km/h
  heading: number;            // 0-360 degrees for marker rotation
  route: TruckRoute;
  parcelsLoaded: number;
  parcelsCapacity: number;
  parcelsAvailable: number;   // capacity remaining
  containerImages: string[];  // URLs to sample images of container interior
}
