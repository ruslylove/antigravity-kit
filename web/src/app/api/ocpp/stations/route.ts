import { NextResponse } from "next/server";

export async function GET() {
  // Mock logic to simulate dynamic data
  const now = new Date();
  
  // Base stations with static locations but dynamic status
  const stations = [
    {
      id: "station-bkk-001",
      name: "Siam Paragon Hub",
      lat: 13.7462,
      lng: 100.5347,
      status: "Available",
      powerLimit: "150kW",
      // Telemetry
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
      // Telemetry
      socketStatus: "Occupied",
      currentMeter: 42.15 + (Math.sin(now.getTime() / 10000) * 5), // Simulating usage
      powerOutput: 68.4 + (Math.random() * 2) 
    },
    {
      id: "station-bkk-003",
      name: "Lumphini Park Charging",
      lat: 13.7310,
      lng: 100.5410,
      status: "Faulted",
      powerLimit: "120kW",
      // Telemetry
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
      // Telemetry
      socketStatus: "Available",
      currentMeter: 0,
      powerOutput: 0
    }
  ];

  // Simulate server latency
  await new Promise((resolve) => setTimeout(resolve, 300));

  return NextResponse.json(stations);
}
