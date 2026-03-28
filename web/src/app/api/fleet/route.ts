import { NextResponse } from "next/server";

// Facilities serve as fleet nodes — shared reference
const FLEET_NODES = {
  "facility-001": { facilityId: "facility-001", name: "Siam Paragon WH", lat: 13.7455, lng: 100.5350 },
  "facility-002": { facilityId: "facility-002", name: "Sukhumvit Hub", lat: 13.7280, lng: 100.5680 },
  "facility-003": { facilityId: "facility-003", name: "Bangna Office", lat: 13.6610, lng: 100.6350 },
  "facility-004": { facilityId: "facility-004", name: "Lat Krabang Factory", lat: 13.7230, lng: 100.7480 },
  "facility-005": { facilityId: "facility-005", name: "Chatuchak Depot", lat: 13.7990, lng: 100.5530 },
};

export async function GET() {
  const now = new Date();
  const drift = (base: number, range: number) =>
    base + Math.sin(now.getTime() / 15000) * range * 0.3 + (Math.random() - 0.5) * range * 0.1;

  const trucks = [
    {
      id: "truck-001",
      name: "BKK-Express-01",
      driverName: "Somchai P.",
      lat: drift(13.7520, 0.01),
      lng: drift(100.5120, 0.01),
      status: "En Route",
      loadLevel: 4,
      loadPercent: 78,
      speed: 42 + Math.random() * 10,
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
        eta: formatETA(35),
        distanceRemaining: 8.4 + Math.random() * 2,
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
      lat: drift(13.6650, 0.008),
      lng: drift(100.6300, 0.008),
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
        eta: formatETA(55),
        distanceRemaining: 15.2 + Math.random() * 3,
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
      lat: drift(13.7380, 0.012),
      lng: drift(100.5550, 0.012),
      status: "En Route",
      loadLevel: 5,
      loadPercent: 95,
      speed: 28 + Math.random() * 8,
      heading: 270,
      route: {
        origin: FLEET_NODES["facility-002"],
        destination: FLEET_NODES["facility-001"],
        waypoints: [
          { lat: 13.7320, lng: 100.5600 },
          { lat: 13.7380, lng: 100.5550 },
          { lat: 13.7420, lng: 100.5450 },
        ],
        eta: formatETA(12),
        distanceRemaining: 3.1 + Math.random(),
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
      lat: drift(13.7100, 0.015),
      lng: drift(100.7100, 0.015),
      status: "Returning",
      loadLevel: 1,
      loadPercent: 12,
      speed: 55 + Math.random() * 15,
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
        eta: formatETA(42),
        distanceRemaining: 22.5 + Math.random() * 5,
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

  const rounded = trucks.map((t) => ({
    ...t,
    lat: Math.round(t.lat * 10000) / 10000,
    lng: Math.round(t.lng * 10000) / 10000,
    speed: Math.round(t.speed),
    route: {
      ...t.route,
      distanceRemaining: Math.round(t.route.distanceRemaining * 10) / 10,
    },
  }));

  await new Promise((resolve) => setTimeout(resolve, 200));

  return NextResponse.json(rounded);
}

function formatETA(minutesFromNow: number): string {
  const eta = new Date(Date.now() + minutesFromNow * 60000);
  return `${eta.getHours().toString().padStart(2, "0")}:${eta.getMinutes().toString().padStart(2, "0")}`;
}
