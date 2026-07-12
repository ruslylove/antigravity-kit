import { NextResponse } from "next/server";
import { fleetStore } from "@/lib/fleetStore";
import { logStore } from "@/lib/logStore";

export async function GET() {
  const now = new Date();
  const trucks = fleetStore.getTrucks();

  logStore.addLog("HTTP", "DEBUG", `GET /api/fleet - Fetched telemetry for ${trucks.length} trucks`, {
    truckCount: trucks.length,
    timestamp: now.toISOString(),
    truckDetails: trucks.map(t => ({ id: t.id, name: t.name, status: t.status, speed: t.speed, lat: t.lat, lng: t.lng }))
  });

  return NextResponse.json(trucks);
}

