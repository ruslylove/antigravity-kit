import { NextResponse } from "next/server";
import { fleetStore } from "@/lib/fleetStore";
import { logStore } from "@/lib/logStore";
import { query } from "@/lib/db";

// GET all trucks
export async function GET() {
  const now = new Date();
  const trucks = await fleetStore.getTrucks();

  await logStore.addLog("HTTP", "DEBUG", `GET /api/fleet - Fetched telemetry for ${trucks.length} trucks`, {
    truckCount: trucks.length,
    timestamp: now.toISOString(),
    truckDetails: trucks.map(t => ({ id: t.id, name: t.name, status: t.status, speed: t.speed, lat: t.lat, lng: t.lng }))
  });

  return NextResponse.json(trucks);
}

// POST create a new truck
export async function POST(request: Request) {
  try {
    const { id, name, driverName, status, lat, lng } = await request.json();

    if (!id || !name || lat === undefined || lng === undefined) {
      return NextResponse.json({ error: "Missing required fields (id, name, lat, lng)" }, { status: 400 });
    }

    const cleanId = id.trim().toLowerCase().replace(/\s+/g, "-");

    const res = await query(`
      INSERT INTO trucks (id, name, driver_name, status, lat, lng, last_seen, data)
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), '{}'::jsonb)
      RETURNING *
    `, [cleanId, name, driverName || null, status || "Idle", parseFloat(lat), parseFloat(lng)]);

    const newTruck = res.rows[0];

    await logStore.addLog("HTTP", "INFO", `Created EV Truck '${name}' (${cleanId})`);

    return NextResponse.json(newTruck);
  } catch (error: any) {
    if (error.code === "23505") { // Unique key constraint
      return NextResponse.json({ error: "Truck ID already exists" }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT update an existing truck
export async function PUT(request: Request) {
  try {
    const { id, name, driverName, status, lat, lng } = await request.json();

    if (!id || !name || lat === undefined || lng === undefined) {
      return NextResponse.json({ error: "Missing required fields (id, name, lat, lng)" }, { status: 400 });
    }

    const res = await query(`
      UPDATE trucks 
      SET name = $1, driver_name = $2, status = $3, lat = $4, lng = $5, updated_at = NOW() 
      WHERE id = $6 
      RETURNING *
    `, [name, driverName || null, status || "Idle", parseFloat(lat), parseFloat(lng), id]);

    if (res.rows.length === 0) {
      return NextResponse.json({ error: "Truck not found" }, { status: 404 });
    }

    const updatedTruck = res.rows[0];

    await logStore.addLog("HTTP", "INFO", `Updated EV Truck '${name}' details (${id})`);

    return NextResponse.json(updatedTruck);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE a truck
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing truck ID" }, { status: 400 });
    }

    // Begin delete transaction to keep routes consistent
    await query("BEGIN");

    // Clear reference to this truck in any route assignments
    await query("UPDATE routes SET truck_id = NULL WHERE truck_id = $1", [id]);

    // Delete telemetry history first (foreign key CASCADE handles this, but explicit query is safer)
    await query("DELETE FROM telemetry_history WHERE truck_id = $1", [id]);

    const res = await query("DELETE FROM trucks WHERE id = $1 RETURNING *", [id]);

    if (res.rows.length === 0) {
      await query("ROLLBACK");
      return NextResponse.json({ error: "Truck not found" }, { status: 404 });
    }

    const deletedTruck = res.rows[0];

    await query("COMMIT");

    await logStore.addLog("HTTP", "INFO", `Deleted EV Truck ID ${id} (${deletedTruck.name})`);

    return NextResponse.json({ success: true, deletedTruck });
  } catch (error: any) {
    await query("ROLLBACK");
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
