import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { routeId } = await request.json();

    if (!routeId) {
      return NextResponse.json({ error: "Missing route ID" }, { status: 400 });
    }

    // 1. Fetch the route from the database
    const routeRes = await query("SELECT * FROM routes WHERE id = $1", [routeId]);
    if (routeRes.rows.length === 0) {
      return NextResponse.json({ error: "Route not found" }, { status: 404 });
    }

    const route = routeRes.rows[0];
    const truckId = route.truck_id;
    const stationIds = route.stations;

    if (!truckId) {
      return NextResponse.json({ error: "No truck is assigned to this route" }, { status: 400 });
    }

    if (!stationIds || stationIds.length === 0) {
      return NextResponse.json({ error: "Route has no stations assigned" }, { status: 400 });
    }

    // 2. Fetch the stations from the database to get real-time coordinates
    const stationsRes = await query("SELECT id, name, lat, lng FROM stations");
    const dbStations = stationsRes.rows;

    const routeStations = (stationIds as string[])
      .map((id: string) => dbStations.find((s: any) => s.id === id))
      .filter((s): s is NonNullable<typeof s> => !!s);

    if (routeStations.length === 0) {
      return NextResponse.json({ error: "None of the route stations could be resolved in the database" }, { status: 404 });
    }

    const origin = routeStations[0];
    const destination = routeStations[routeStations.length - 1];
    
    // Construct waypoints list
    const waypoints = routeStations.map(s => ({
      lat: parseFloat(s.lat),
      lng: parseFloat(s.lng)
    }));

    // 3. Fetch current truck data to preserve other fields
    const truckRes = await query("SELECT data FROM trucks WHERE id = $1", [truckId]);
    if (truckRes.rows.length === 0) {
      return NextResponse.json({ error: `Truck ${truckId} not found` }, { status: 404 });
    }

    const currentData = truckRes.rows[0].data || {};
    const updatedData = {
      ...currentData,
      route: {
        origin: {
          lat: parseFloat(origin.lat),
          lng: parseFloat(origin.lng),
          name: origin.name,
          facilityId: origin.id
        },
        destination: {
          lat: parseFloat(destination.lat),
          lng: parseFloat(destination.lng),
          name: destination.name,
          facilityId: destination.id
        },
        waypoints: waypoints,
        distanceRemaining: 18.2, // Seeded distance remaining
        eta: "14:45"
      }
    };

    // Update truck record and set status to 'En Route'
    await query(
      "UPDATE trucks SET status = 'En Route', data = $1, updated_at = NOW() WHERE id = $2",
      [JSON.stringify(updatedData), truckId]
    );

    // Log the manual dispatch operation
    await query(
      "INSERT INTO logs (type, level, message) VALUES ($1, $2, $3)",
      ["HTTP", "INFO", `Dispatched route '${route.name}' to EV Truck ${truckId}`]
    );

    return NextResponse.json({ success: true, route, truckId });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
