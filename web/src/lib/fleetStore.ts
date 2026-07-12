import { Truck } from "@/app/remote-control/types";
import mqtt from "mqtt";
import { logStore } from "./logStore";
import { initDb, pool } from "./db";

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
    lat: 13.7280,
    lng: 100.5680,
    status: "Idle",
    loadLevel: 1,
    loadPercent: 92,
    speed: 0,
    heading: 270,
    route: {
      origin: FLEET_NODES["facility-002"],
      destination: FLEET_NODES["facility-004"],
      waypoints: [],
      eta: "14:30",
      distanceRemaining: 24.1,
    },
    parcelsLoaded: 12,
    parcelsCapacity: 300,
    parcelsAvailable: 288,
    containerImages: [],
  },
  {
    id: "truck-003",
    name: "BKK-Swift-03",
    driverName: "Kitti K.",
    lat: 13.7230,
    lng: 100.7480,
    status: "Loading",
    loadLevel: 0,
    loadPercent: 12,
    speed: 0,
    heading: 0,
    route: {
      origin: FLEET_NODES["facility-004"],
      destination: FLEET_NODES["facility-005"],
      waypoints: [],
      eta: "16:45",
      distanceRemaining: 32.5,
    },
    parcelsLoaded: 0,
    parcelsCapacity: 90,
    parcelsAvailable: 90,
    containerImages: [],
  },
  {
    id: "truck-004",
    name: "BKK-Cargo-04",
    driverName: "Anan P.",
    lat: 13.6610,
    lng: 100.6350,
    status: "Maintenance",
    loadLevel: 5,
    loadPercent: 88,
    speed: 0,
    heading: 90,
    route: {
      origin: FLEET_NODES["facility-003"],
      destination: FLEET_NODES["facility-001"],
      waypoints: [],
      eta: "-",
      distanceRemaining: 0,
    },
    parcelsLoaded: 120,
    parcelsCapacity: 120,
    parcelsAvailable: 0,
    containerImages: [],
  },
  {
    id: "truck-005",
    name: "BKK-Rapid-05",
    driverName: "Natee M.",
    lat: 13.7990,
    lng: 100.5530,
    status: "Returning",
    loadLevel: 2,
    loadPercent: 45,
    speed: 55,
    heading: 315,
    route: {
      origin: FLEET_NODES["facility-001"],
      destination: FLEET_NODES["facility-005"],
      waypoints: [
        { lat: 13.7500, lng: 100.5400 },
        { lat: 13.7800, lng: 100.5500 },
      ],
      eta: "12:05",
      distanceRemaining: 6.2,
    },
    parcelsLoaded: 45,
    parcelsCapacity: 150,
    parcelsAvailable: 105,
    containerImages: [],
  },
  {
    id: "truck-006",
    name: "BKK-Maint-06",
    driverName: "Sarawut T.",
    lat: 13.7455,
    lng: 100.5350,
    status: "Maintenance",
    loadLevel: 0,
    loadPercent: 5,
    speed: 0,
    heading: 180,
    route: {
      origin: FLEET_NODES["facility-001"],
      destination: FLEET_NODES["facility-005"],
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

async function seedInitialTrucks() {
  try {
    const { rows } = await pool.query("SELECT COUNT(*) FROM trucks");
    if (parseInt(rows[0].count, 10) === 0) {
      console.log("🌱 Database is empty. Seeding initial trucks...");
      for (const t of initialTrucks) {
        const data = {
          loadLevel: t.loadLevel,
          loadPercent: t.loadPercent,
          speed: t.speed,
          heading: t.heading,
          route: t.route,
          parcelsLoaded: t.parcelsLoaded,
          parcelsCapacity: t.parcelsCapacity,
          parcelsAvailable: t.parcelsAvailable,
          containerImages: t.containerImages,
          obd: t.obd,
          device: t.device
        };
        await pool.query(`
          INSERT INTO trucks (id, name, driver_name, status, lat, lng, last_seen, data)
          VALUES ($1, $2, $3, $4, $5, $6, NOW(), $7)
        `, [t.id, t.name, t.driverName, t.status, t.lat, t.lng, data]);
      }
      console.log("🌱 Database seeded successfully!");
    }
  } catch (error) {
    console.error("❌ Failed to seed initial trucks:", error);
  }
}

export const fleetStore = {
  getTrucks: async (): Promise<Truck[]> => {
    await initDb();
    await seedInitialTrucks();
    
    try {
      const { rows } = await pool.query(`
        SELECT id, name, driver_name AS "driverName", status, lat, lng, last_seen AS "lastSeen", data 
        FROM trucks 
        ORDER BY id ASC
      `);

      const now = Date.now();
      const mappedTrucks: Truck[] = [];

      for (const row of rows) {
        let status = row.status;
        const lastSeenTime = row.lastSeen ? new Date(row.lastSeen).getTime() : 0;
        const diffSeconds = (now - lastSeenTime) / 1000;

        // Gray out trucks not seen for more than 30 seconds
        if (row.lastSeen && diffSeconds > 30 && status !== "Offline") {
          status = "Offline";
          await pool.query("UPDATE trucks SET status = 'Offline', updated_at = NOW() WHERE id = $1", [row.id]);
        }

        mappedTrucks.push({
          id: row.id,
          name: row.name,
          driverName: row.driverName || "Active Driver",
          status,
          lat: row.lat,
          lng: row.lng,
          lastSeen: row.lastSeen ? new Date(row.lastSeen).toISOString() : undefined,
          loadLevel: row.data.loadLevel || 1,
          loadPercent: row.data.loadPercent || 0,
          speed: status === "Offline" ? 0 : (row.data.speed || 0),
          heading: row.data.heading || 0,
          route: row.data.route || {
            origin: { facilityId: "depot", name: "Depot", lat: row.lat, lng: row.lng },
            destination: { facilityId: "destination", name: "Destination", lat: row.lat, lng: row.lng },
            waypoints: [],
            eta: "-",
            distanceRemaining: 0
          },
          parcelsLoaded: row.data.parcelsLoaded || 0,
          parcelsCapacity: row.data.parcelsCapacity || 100,
          parcelsAvailable: row.data.parcelsAvailable || 100,
          containerImages: row.data.containerImages || [],
          obd: row.data.obd,
          device: row.data.device
        });
      }

      return mappedTrucks;
    } catch (error) {
      console.error("Failed to fetch trucks from database:", error);
      return [];
    }
  },

  addPhotoToTruck: async (truckId: string, photoUrl: string): Promise<boolean> => {
    await initDb();
    try {
      const { rows } = await pool.query("SELECT id, name, driver_name, status, lat, lng, data FROM trucks WHERE id = $1", [truckId]);
      
      let truckData: any = {};
      let name = truckId.toUpperCase();
      let driverName = "Active Driver";
      let status = "En Route";
      let lat = 13.75;
      let lng = 100.52;

      if (rows.length > 0) {
        const row = rows[0];
        name = row.name;
        driverName = row.driver_name;
        status = row.status;
        lat = row.lat;
        lng = row.lng;
        truckData = row.data;
      }

      const containerImages = [photoUrl, ...(truckData.containerImages || [])];
      truckData.containerImages = containerImages;

      await pool.query(`
        INSERT INTO trucks (id, name, driver_name, status, lat, lng, last_seen, data)
        VALUES ($1, $2, $3, $4, $5, $6, NOW(), $7)
        ON CONFLICT (id) DO UPDATE SET
          last_seen = NOW(),
          data = EXCLUDED.data,
          updated_at = NOW();
      `, [truckId, name, driverName, status, lat, lng, truckData]);

      return true;
    } catch (error) {
      console.error("Failed to add photo to truck in database:", error);
      return false;
    }
  }
};

// --- Remote MQTT Subscriber Integration ---
async function updateTruckTelemetry(truckId: string, telemetry: any) {
  await initDb();
  try {
    const { rows } = await pool.query("SELECT id, name, driver_name, status, lat, lng, data FROM trucks WHERE id = $1", [truckId]);
    
    let truckData: any = {};
    let name = truckId.toUpperCase();
    let driverName = "Active Driver";
    let status = "En Route";
    let lat = telemetry.gps?.lat || 13.75;
    let lng = telemetry.gps?.lng || 100.52;
    let speed = telemetry.gps?.speedKph || 0;
    let heading = telemetry.gps?.headingDeg || 0;

    if (rows.length > 0) {
      const row = rows[0];
      name = row.name;
      driverName = row.driver_name;
      status = row.status === "Offline" ? "En Route" : row.status; // Bring back online
      truckData = row.data;
    }

    if (telemetry.gps) {
      lat = telemetry.gps.lat;
      lng = telemetry.gps.lng;
      speed = telemetry.gps.speedKph;
      heading = telemetry.gps.headingDeg;
    }

    truckData.speed = speed;
    truckData.heading = heading;

    if (telemetry.obd) {
      truckData.loadPercent = telemetry.obd.fuelLevelPct;
      truckData.obd = {
        rpm: telemetry.obd.rpm,
        engineLoadPct: telemetry.obd.engineLoadPct,
        coolantTempC: telemetry.obd.coolantTempC,
        fuelLevelPct: telemetry.obd.fuelLevelPct,
        throttlePct: telemetry.obd.throttlePct,
        dtcCount: telemetry.obd.dtcCount,
        mil: telemetry.obd.mil
      };
    }

    if (telemetry.device) {
      truckData.device = {
        battV: telemetry.device.battV,
        signalDbm: telemetry.device.signalDbm,
        seqNo: telemetry.device.seqNo,
        clkSource: telemetry.device.clkSource
      };
    }

    // Save updated truck state
    await pool.query(`
      INSERT INTO trucks (id, name, driver_name, status, lat, lng, last_seen, data)
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), $7)
      ON CONFLICT (id) DO UPDATE SET
        lat = EXCLUDED.lat,
        lng = EXCLUDED.lng,
        status = EXCLUDED.status,
        last_seen = NOW(),
        data = EXCLUDED.data,
        updated_at = NOW();
    `, [truckId, name, driverName, status, lat, lng, truckData]);

    // Insert historical telemetry record
    await pool.query(`
      INSERT INTO telemetry_history (truck_id, lat, lng, speed, data)
      VALUES ($1, $2, $3, $4, $5)
    `, [truckId, lat, lng, speed, { obd: truckData.obd, device: truckData.device }]);

    // Prune history data older than 90 days
    await pool.query(`
      DELETE FROM telemetry_history 
      WHERE timestamp < NOW() - INTERVAL '90 days'
    `);

  } catch (error) {
    console.error(`Failed to update telemetry in database for truck ${truckId}:`, error);
  }
}

async function updateTruckStatus(truckId: string, eventType: string) {
  await initDb();
  try {
    const { rows } = await pool.query("SELECT id, name, driver_name, status, lat, lng, data FROM trucks WHERE id = $1", [truckId]);
    
    let truckData: any = {};
    let name = truckId.toUpperCase();
    let driverName = "Active Driver";
    let status = "En Route";
    let lat = 13.75;
    let lng = 100.52;

    if (rows.length > 0) {
      const row = rows[0];
      name = row.name;
      driverName = row.driver_name;
      status = row.status;
      lat = row.lat;
      lng = row.lng;
      truckData = row.data;
    }

    if (eventType === "DeviceOnline") {
      status = "Idle";
    } else if (eventType === "StationArrival") {
      status = "Loading";
    } else if (eventType === "StationDeparture") {
      status = "En Route";
    } else if (eventType === "DeviceOffline") {
      status = "Maintenance";
    }

    await pool.query(`
      INSERT INTO trucks (id, name, driver_name, status, lat, lng, last_seen, data)
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), $7)
      ON CONFLICT (id) DO UPDATE SET
        status = EXCLUDED.status,
        last_seen = NOW(),
        updated_at = NOW();
    `, [truckId, name, driverName, status, lat, lng, truckData]);

  } catch (error) {
    console.error(`Failed to update status in database for truck ${truckId}:`, error);
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

  client.on("message", async (topic, message) => {
    try {
      const payload = JSON.parse(message.toString());
      const topicParts = topic.split("/");
      const truckId = topicParts[1];

      if (topic.endsWith("/telemetry")) {
        await logStore.addLog("MQTT", "INFO", `MQTT Telemetry received: ${topic}`, payload);
        await updateTruckTelemetry(truckId, payload);
      } else if (topic.endsWith("/event")) {
        await logStore.addLog("MQTT", "INFO", `MQTT Event received: ${topic} [${payload.type}]`, payload);
        await updateTruckStatus(truckId, payload.type);
      } else if (topic.endsWith("/photo/ready")) {
        await logStore.addLog("MQTT", "INFO", `MQTT PhotoReady received: ${topic}`, payload);
      }
    } catch (err: any) {
      console.error("Error processing MQTT message on dashboard:", err.message);
    }
  });

  client.on("error", (err) => {
    console.error("📡 Dashboard Server: MQTT Connection error:", err.message);
  });
}
