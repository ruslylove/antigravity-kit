import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "schedules.json");

console.log("OCPP Stations API: Using data file at:", DATA_FILE);

async function getSchedules() {
  try {
    const data = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    return {};
  }
}

async function saveSchedules(schedules: any) {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify(schedules, null, 2), "utf-8");
  } catch (error) {
    console.error("Failed to save schedules:", error);
  }
}

export async function GET() {
  // Mock logic to simulate dynamic data
  const now = new Date();
  
  const stations = [
    {
      id: "station-bkk-001",
      name: "Siam Paragon Hub",
      lat: 13.7462,
      lng: 100.5347,
      status: "Available",
      powerLimit: "150kW",
      socketStatus: "Available",
      currentMeter: 0,
      powerOutput: 0
    },
    {
      id: "station-bkk-002",
      name: "Sukhumvit 21 Fast",
      lat: 13.7410,
      lng: 100.5600,
      status: "Charging",
      powerLimit: "75kW",
      socketStatus: "Occupied",
      currentMeter: 42.15 + (Math.sin(now.getTime() / 10000) * 5),
      powerOutput: 68.4 + (Math.random() * 2) 
    },
    {
      id: "station-bkk-003",
      name: "Lumphini Park Charging",
      lat: 13.7310,
      lng: 100.5410,
      status: "Faulted",
      powerLimit: "120kW",
      socketStatus: "Out of Service",
      currentMeter: 12.8,
      powerOutput: 0
    },
    {
      id: "station-bkk-004",
      name: "Bangkok Old Town Hub",
      lat: 13.7530,
      lng: 100.4930,
      status: "Available",
      powerLimit: "350kW",
      socketStatus: "Available",
      currentMeter: 0,
      powerOutput: 0
    },
    {
      id: "station-bkk-005",
      name: "Bangna Complex Ultra-Fast",
      lat: 13.6605,
      lng: 100.6355,
      status: "Charging",
      powerLimit: "250kW",
      socketStatus: "Occupied",
      currentMeter: 125.4,
      powerOutput: 210.5 + (Math.random() * 5)
    },
    {
      id: "station-bkk-006",
      name: "Lat Krabang Factory Charger",
      lat: 13.7240,
      lng: 100.7485,
      status: "Available",
      powerLimit: "150kW",
      socketStatus: "Available",
      currentMeter: 0,
      powerOutput: 0
    },
    {
      id: "station-bkk-007",
      name: "Chatuchak Depot Fleet Charge",
      lat: 13.7985,
      lng: 100.5520,
      status: "Charging",
      powerLimit: "350kW",
      socketStatus: "Occupied",
      currentMeter: 312.8,
      powerOutput: 335.2 + (Math.random() * 4)
    },
    {
      id: "station-bkk-008",
      name: "Sukhumvit Distro Station",
      lat: 13.7275,
      lng: 100.5690,
      status: "Reserved",
      powerLimit: "75kW",
      socketStatus: "Reserved",
      currentMeter: 0,
      powerOutput: 0
    },
    {
      id: "station-bkk-009",
      name: "Don Mueang Airport Terminal",
      lat: 13.9126,
      lng: 100.5967,
      status: "Charging",
      powerLimit: "120kW",
      socketStatus: "Occupied",
      currentMeter: 84.1,
      powerOutput: 110.4 + (Math.random() * 3)
    },
    {
      id: "station-bkk-010",
      name: "Mega Bangna Supercharger",
      lat: 13.6468,
      lng: 100.6797,
      status: "Faulted",
      powerLimit: "350kW",
      socketStatus: "Out of Service",
      currentMeter: 45.2,
      powerOutput: 0
    }
  ];

  // Simulate server latency
  await new Promise((resolve) => setTimeout(resolve, 300));

  // Merge with persistent schedules
  const schedules = await getSchedules();
  const stationsWithSchedules = stations.map(s => ({
    ...s,
    schedule: schedules[s.id] || undefined
  }));

  return NextResponse.json(stationsWithSchedules);
}

export async function POST(request: Request) {
  try {
    const { stationId, schedule } = await request.json();
    
    if (!stationId || !schedule) {
      return NextResponse.json({ error: "Missing stationId or schedule" }, { status: 400 });
    }

    const schedules = await getSchedules();
    schedules[stationId] = schedule;
    await saveSchedules(schedules);

    return NextResponse.json({ success: true, schedule });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update schedule" }, { status: 500 });
  }
}
