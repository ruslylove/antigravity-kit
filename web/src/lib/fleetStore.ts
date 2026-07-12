import { Truck } from "@/app/remote-control/types";
import fs from "fs";
import path from "path";
import mqtt from "mqtt";
import { logStore } from "./logStore";

const FLEET_NODES = {
  "facility-001": { facilityId: "facility-001", name: "Siam Paragon WH", lat: 13.7455, lng: 100.5350 },
  "facility-002": { facilityId: "facility-002", name: "Sukhumvit Hub", lat: 13.7280, lng: 100.5680 },
  "facility-003": { facilityId: "facility-003", name: "Bangna Office", lat: 13.6610, lng: 100.6350 },
  "facility-004": { facilityId: "facility-004", name: "Lat Krabang Factory", lat: 13.7230, lng: 100.7480 },
  "facility-005": { facilityId: "facility-005", name: "Chatuchak Depot", lat: 13.7990, lng: 100.5530 },
};

const initialTrucks: Truck[] = [
  {
    id: "truck-001",
    name: "BKK-Express-01",
    driverName: "Somchai P.",
    lat: 13.7520,
    lng: 100.5120,
    status: "En Route",
    loadLevel: 4,
    loadPercent: 78,
    speed: 42,
    heading: 135,
    route: {
      origin: FLEET_NODES["facility-005"],
      destination: FLEET_NODES["facility-002"],
      waypoints: [
        { lat: 13.7850, lng: 100.5400 },
        { lat: 13.7700, lng: 100.5300 },
        { lat: 13.7520, lng: 100.5120 },
        { lat: 13.7400, lng: 100.5350 },
      ],
      eta: "11:15",
      distanceRemaining: 8.4,
    },
    parcelsLoaded: 142,
    parcelsCapacity: 180,
    parcelsAvailable: 38,
    containerImages: [
      "/images/fleet/container-1a.webp",
      "/images/fleet/container-1b.webp",
    ],
  },
  {
    id: "truck-002",
    name: "BKK-Heavy-02",
    driverName: "Wichai S.",
    lat: 13.6650,
    lng: 100.6300,
    status: "Loading",
    loadLevel: 2,
    loadPercent: 35,
    speed: 0,
    heading: 45,
    route: {
      origin: FLEET_NODES["facility-003"],
      destination: FLEET_NODES["facility-004"],
      waypoints: [
        { lat: 13.6750, lng: 100.6500 },
        { lat: 13.6900, lng: 100.6800 },
        { lat: 13.7100, lng: 100.7200 },
      ],
      eta: "11:35",
      distanceRemaining: 15.2,
    },
    parcelsLoaded: 64,
    parcelsCapacity: 180,
    parcelsAvailable: 116,
    containerImages: [
      "/images/fleet/container-2a.webp",
      "/images/fleet/container-2b.webp",
    ],
  },
  {
    id: "truck-003",
    name: "BKK-Swift-03",
    driverName: "Prasert K.",
    lat: 13.7380,
    lng: 100.5550,
    status: "En Route",
    loadLevel: 5,
    loadPercent: 95,
    speed: 28,
    heading: 270,
    route: {
      origin: FLEET_NODES["facility-002"],
      destination: FLEET_NODES["facility-001"],
      waypoints: [
        { lat: 13.7320, lng: 100.5600 },
        { lat: 13.7380, lng: 100.5550 },
        { lat: 13.7420, lng: 100.5450 },
      ],
      eta: "10:52",
      distanceRemaining: 3.1,
    },
    parcelsLoaded: 171,
    parcelsCapacity: 180,
    parcelsAvailable: 9,
    containerImages: [
      "/images/fleet/container-3a.webp",
      "/images/fleet/container-3b.webp",
    ],
  },
  {
    id: "truck-004",
    name: "BKK-Cargo-04",
    driverName: "Anon T.",
    lat: 13.7990,
    lng: 100.5530,
    status: "Idle",
    loadLevel: 0,
    loadPercent: 0,
    speed: 0,
    heading: 0,
    route: {
      origin: FLEET_NODES["facility-005"],
      destination: FLEET_NODES["facility-005"],
      waypoints: [],
      eta: "-",
      distanceRemaining: 0,
    },
    parcelsLoaded: 0,
    parcelsCapacity: 180,
    parcelsAvailable: 180,
    containerImages: [
      "/images/fleet/container-4a.webp",
    ],
  },
  {
    id: "truck-005",
    name: "BKK-Rapid-05",
    driverName: "Kittisak M.",
    lat: 13.7100,
    lng: 100.7100,
    status: "Returning",
    loadLevel: 1,
    loadPercent: 12,
    speed: 55,
    heading: 315,
    route: {
      origin: FLEET_NODES["facility-004"],
      destination: FLEET_NODES["facility-005"],
      waypoints: [
        { lat: 13.7200, lng: 100.7300 },
        { lat: 13.7100, lng: 100.7100 },
        { lat: 13.7300, lng: 100.6500 },
        { lat: 13.7600, lng: 100.5900 },
        { lat: 13.7800, lng: 100.5600 },
      ],
      eta: "11:22",
      distanceRemaining: 22.5,
    },
    parcelsLoaded: 22,
    parcelsCapacity: 180,
    parcelsAvailable: 158,
    containerImages: [
      "/images/fleet/container-5a.webp",
      "/images/fleet/container-5b.webp",
    ],
  },
  {
    id: "truck-006",
    name: "BKK-Maint-06",
    driverName: "Nattapong R.",
    lat: 13.7580,
    lng: 100.4950,
    status: "Maintenance",
    loadLevel: 0,
    loadPercent: 0,
    speed: 0,
    heading: 90,
    route: {
      origin: { facilityId: "service-center", name: "Service Center", lat: 13.7580, lng: 100.4950 },
      destination: { facilityId: "service-center", name: "Service Center", lat: 13.7580, lng: 100.4950 },
      waypoints: [],
      eta: "-",
      distanceRemaining: 0,
    },
    parcelsLoaded: 0,
    parcelsCapacity: 180,
    parcelsAvailable: 180,
    containerImages: [],
  },
];

const DATA_FILE_PATH = path.join(process.cwd(), "data", "trucks.json");

function loadTrucks(): Truck[] {
  try {
    const dir = path.dirname(DATA_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (fs.existsSync(DATA_FILE_PATH)) {
      const fileContent = fs.readFileSync(DATA_FILE_PATH, "utf-8");
      return JSON.parse(fileContent);
    } else {
      fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(initialTrucks, null, 2), "utf-8");
      return initialTrucks;
    }
  } catch (error) {
    console.error("Error loading trucks from disk, falling back to initial data:", error);
    return initialTrucks;
  }
}

function saveTrucks(trucks: Truck[]) {
  try {
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(trucks, null, 2), "utf-8");
  } catch (error) {
    console.error("Failed to save trucks to disk:", error);
  }
}

export const fleetStore = {
  getTrucks: (): Truck[] => {
    const trucks = loadTrucks();
    const now = Date.now();
    let modified = false;

    // Filter out trucks that haven't been seen for more than 60 seconds
    const activeTrucks = trucks.filter(t => {
      if (!t.lastSeen) return true; 
      const lastSeenTime = new Date(t.lastSeen).getTime();
      const diffSeconds = (now - lastSeenTime) / 1000;
      if (diffSeconds > 60) {
        modified = true;
        return false;
      }
      return true;
    });

    // Gray out trucks that haven't been seen for more than 30 seconds
    const decayedTrucks = activeTrucks.map(t => {
      if (!t.lastSeen) return t;
      const lastSeenTime = new Date(t.lastSeen).getTime();
      const diffSeconds = (now - lastSeenTime) / 1000;
      if (diffSeconds > 30 && t.status !== "Offline") {
        modified = true;
        return {
          ...t,
          status: "Offline" as const
        };
      }
      return t;
    });

    if (modified) {
      saveTrucks(decayedTrucks);
    }

    return decayedTrucks;
  },
  addPhotoToTruck: (truckId: string, photoUrl: string): boolean => {
    const trucks = loadTrucks();
    let truck = trucks.find((t) => t.id === truckId);
    if (!truck) {
      truck = {
        id: truckId,
        name: truckId.toUpperCase(),
        driverName: "Active Driver",
        lat: 13.75,
        lng: 100.52,
        status: "En Route",
        loadLevel: 1,
        loadPercent: 80,
        speed: 0,
        heading: 0,
        route: {
          origin: { facilityId: "depot", name: "Depot", lat: 13.75, lng: 100.52 },
          destination: { facilityId: "destination", name: "Destination", lat: 13.75, lng: 100.52 },
          waypoints: [],
          eta: "-",
          distanceRemaining: 0
        },
        parcelsLoaded: 0,
        parcelsCapacity: 100,
        parcelsAvailable: 100,
        containerImages: []
      };
      trucks.push(truck);
    }
    truck.containerImages = [photoUrl, ...truck.containerImages];
    truck.lastSeen = new Date().toISOString();
    saveTrucks(trucks);
    return true;
  }
};

// --- Remote MQTT Subscriber Integration ---
function updateTruckTelemetry(truckId: string, telemetry: any) {
  try {
    const trucks = loadTrucks();
    let truck = trucks.find(t => t.id === truckId);
    
    const obdData = telemetry.obd ? {
      rpm: telemetry.obd.rpm,
      engineLoadPct: telemetry.obd.engineLoadPct,
      coolantTempC: telemetry.obd.coolantTempC,
      fuelLevelPct: telemetry.obd.fuelLevelPct,
      throttlePct: telemetry.obd.throttlePct,
      dtcCount: telemetry.obd.dtcCount,
      mil: telemetry.obd.mil
    } : undefined;

    const deviceData = telemetry.device ? {
      battV: telemetry.device.battV,
      signalDbm: telemetry.device.signalDbm,
      seqNo: telemetry.device.seqNo,
      clkSource: telemetry.device.clkSource
    } : undefined;

    if (!truck) {
      truck = {
        id: truckId,
        name: truckId.toUpperCase(),
        driverName: "Active Driver",
        lat: telemetry.gps?.lat || 13.75,
        lng: telemetry.gps?.lng || 100.52,
        status: "En Route",
        loadLevel: 1,
        loadPercent: telemetry.obd?.fuelLevelPct || 80,
        speed: telemetry.gps?.speedKph || 0,
        heading: telemetry.gps?.headingDeg || 0,
        route: {
          origin: { facilityId: "depot", name: "Depot", lat: telemetry.gps?.lat || 13.75, lng: telemetry.gps?.lng || 100.52 },
          destination: { facilityId: "destination", name: "Destination", lat: telemetry.gps?.lat || 13.75, lng: telemetry.gps?.lng || 100.52 },
          waypoints: [],
          eta: "-",
          distanceRemaining: 0
        },
        parcelsLoaded: 0,
        parcelsCapacity: 100,
        parcelsAvailable: 100,
        containerImages: [],
        obd: obdData,
        device: deviceData
      };
      trucks.push(truck);
    } else {
      if (telemetry.gps) {
        truck.lat = telemetry.gps.lat;
        truck.lng = telemetry.gps.lng;
        truck.speed = telemetry.gps.speedKph;
        truck.heading = telemetry.gps.headingDeg;
      }
      if (telemetry.obd) {
        truck.loadPercent = telemetry.obd.fuelLevelPct;
        truck.obd = obdData;
      }
      if (telemetry.device) {
        truck.device = deviceData;
      }
    }
    truck.lastSeen = new Date().toISOString();
    saveTrucks(trucks);
  } catch (error) {
    console.error(`Failed to update telemetry for truck ${truckId}:`, error);
  }
}

function updateTruckStatus(truckId: string, eventType: string) {
  try {
    const trucks = loadTrucks();
    let truck = trucks.find(t => t.id === truckId);
    if (!truck) {
      truck = {
        id: truckId,
        name: truckId.toUpperCase(),
        driverName: "Active Driver",
        lat: 13.75,
        lng: 100.52,
        status: "En Route",
        loadLevel: 1,
        loadPercent: 80,
        speed: 0,
        heading: 0,
        route: {
          origin: { facilityId: "depot", name: "Depot", lat: 13.75, lng: 100.52 },
          destination: { facilityId: "destination", name: "Destination", lat: 13.75, lng: 100.52 },
          waypoints: [],
          eta: "-",
          distanceRemaining: 0
        },
        parcelsLoaded: 0,
        parcelsCapacity: 100,
        parcelsAvailable: 100,
        containerImages: []
      };
      trucks.push(truck);
    }
    
    if (eventType === "DeviceOnline") {
      truck.status = "Idle";
    } else if (eventType === "StationArrival") {
      truck.status = "Loading";
    } else if (eventType === "StationDeparture") {
      truck.status = "En Route";
    } else if (eventType === "DeviceOffline") {
      truck.status = "Maintenance";
    }
    truck.lastSeen = new Date().toISOString();
    saveTrucks(trucks);
  } catch (error) {
    console.error(`Failed to update status for truck ${truckId}:`, error);
  }
}

// Prevent multiple connections in Next.js development HMR reloads
const g = global as any;
if (!g.mqttClientInitialized) {
  g.mqttClientInitialized = true;

  const brokerUrl = "mqtt://127.0.0.1:1883";
  console.log(`📡 Dashboard Server: Connecting to local MQTT broker at ${brokerUrl}...`);

  const client = mqtt.connect(brokerUrl, {
    clientId: `dashboard-subscriber-${Math.random().toString(36).substr(2, 5)}`,
    clean: true
  });

  client.on("connect", () => {
    console.log("📡 Dashboard Server: Connected to MQTT broker successfully!");
    client.subscribe("trucks/+/telemetry", { qos: 1 });
    client.subscribe("trucks/+/event", { qos: 1 });
    client.subscribe("trucks/+/photo/ready", { qos: 1 });
  });

  client.on("message", (topic, message) => {
    try {
      const payload = JSON.parse(message.toString());
      const topicParts = topic.split("/");
      const truckId = topicParts[1];

      if (topic.endsWith("/telemetry")) {
        logStore.addLog("MQTT", "INFO", `MQTT Telemetry received: ${topic}`, payload);
        updateTruckTelemetry(truckId, payload);
      } else if (topic.endsWith("/event")) {
        logStore.addLog("MQTT", "INFO", `MQTT Event received: ${topic} [${payload.type}]`, payload);
        updateTruckStatus(truckId, payload.type);
      } else if (topic.endsWith("/photo/ready")) {
        logStore.addLog("MQTT", "INFO", `MQTT PhotoReady received: ${topic}`, payload);
      }
    } catch (err: any) {
      console.error("Error processing MQTT message on dashboard:", err.message);
    }
  });

  client.on("error", (err) => {
    console.error("📡 Dashboard Server: MQTT Connection error:", err.message);
  });
}
