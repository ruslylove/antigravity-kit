import { NextResponse } from "next/server";
import { query } from "@/lib/db";

// GET all stations
export async function GET() {
  try {
    const res = await query("SELECT * FROM stations ORDER BY id ASC");
    
    // Map column names back to camelCase camelized frontend model structures
    const mapped = res.rows.map(s => ({
      id: s.id,
      name: s.name,
      lat: parseFloat(s.lat),
      lng: parseFloat(s.lng),
      status: s.status,
      powerLimit: s.power_limit,
      socketStatus: s.socket_status,
      currentMeter: parseFloat(s.current_meter || 0),
      powerOutput: parseFloat(s.power_output || 0),
      schedule: s.schedule || undefined
    }));

    return NextResponse.json(mapped);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST create a new station
export async function POST(request: Request) {
  try {
    const { id, name, lat, lng, powerLimit } = await request.json();

    if (!id || !name || lat === undefined || lng === undefined) {
      return NextResponse.json({ error: "Missing required fields (id, name, lat, lng)" }, { status: 400 });
    }

    const cleanId = id.trim().toLowerCase().replace(/\s+/g, "-");

    const res = await query(`
      INSERT INTO stations (id, name, lat, lng, power_limit)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [cleanId, name, parseFloat(lat), parseFloat(lng), powerLimit || "150kW"]);

    const newStation = res.rows[0];

    await query(
      "INSERT INTO logs (type, level, message) VALUES ($1, $2, $3)",
      ["HTTP", "INFO", `Created charging station '${name}' (${cleanId})`]
    );

    return NextResponse.json(newStation);
  } catch (error: any) {
    if (error.code === "23505") { // Unique key constraint
      return NextResponse.json({ error: "Station ID already exists" }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT update a station or its schedule
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing station ID" }, { status: 400 });
    }

    let res;

    // Check if updating only schedule timer settings
    if ("schedule" in body) {
      const { schedule } = body;
      res = await query(`
        UPDATE stations 
        SET schedule = $1, updated_at = NOW() 
        WHERE id = $2 
        RETURNING *
      `, [schedule ? JSON.stringify(schedule) : null, id]);
    } else {
      // Normal details update
      const { name, lat, lng, powerLimit, status, socketStatus } = body;
      
      if (!name || lat === undefined || lng === undefined) {
        return NextResponse.json({ error: "Missing name, lat, or lng" }, { status: 400 });
      }

      res = await query(`
        UPDATE stations 
        SET name = $1, lat = $2, lng = $3, power_limit = $4, status = $5, socket_status = $6, updated_at = NOW() 
        WHERE id = $7 
        RETURNING *
      `, [name, parseFloat(lat), parseFloat(lng), powerLimit || "150kW", status || "Available", socketStatus || "Available", id]);
    }

    if (res.rows.length === 0) {
      return NextResponse.json({ error: "Station not found" }, { status: 404 });
    }

    const updatedStation = res.rows[0];

    await query(
      "INSERT INTO logs (type, level, message) VALUES ($1, $2, $3)",
      ["HTTP", "INFO", `Updated station ID ${id} (${updatedStation.name})`]
    );

    return NextResponse.json(updatedStation);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE a station
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing station ID" }, { status: 400 });
    }

    // Begin delete transaction to keep routes consistent
    await query("BEGIN");

    const res = await query("DELETE FROM stations WHERE id = $1 RETURNING *", [id]);

    if (res.rows.length === 0) {
      await query("ROLLBACK");
      return NextResponse.json({ error: "Station not found" }, { status: 404 });
    }

    const deletedStation = res.rows[0];

    // Filter out deleted station ID from all routes itineraries
    await query("UPDATE routes SET stations = array_remove(stations, $1)", [id]);

    await query("COMMIT");

    await query(
      "INSERT INTO logs (type, level, message) VALUES ($1, $2, $3)",
      ["HTTP", "INFO", `Deleted station ID ${id} (${deletedStation.name})`]
    );

    return NextResponse.json({ success: true, deletedStation });
  } catch (error: any) {
    await query("ROLLBACK");
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
