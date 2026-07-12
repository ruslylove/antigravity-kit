import { NextResponse } from "next/server";
import { query } from "@/lib/db";

// GET all routes
export async function GET() {
  try {
    const res = await query(`
      SELECT r.*, t.name as truck_name 
      FROM routes r 
      LEFT JOIN trucks t ON r.truck_id = t.id 
      ORDER BY r.id ASC
    `);
    return NextResponse.json(res.rows);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST create a new route (auto-sync removed for manual dispatch control)
export async function POST(request: Request) {
  try {
    const { name, truckId, stations } = await request.json();

    if (!name || !Array.isArray(stations) || stations.length === 0) {
      return NextResponse.json({ error: "Missing name or stations list" }, { status: 400 });
    }

    // Begin transaction
    await query("BEGIN");

    // If this truck was assigned to any other route, clear it first (one route per truck)
    if (truckId) {
      await query("UPDATE routes SET truck_id = NULL WHERE truck_id = $1", [truckId]);
    }

    const res = await query(
      "INSERT INTO routes (name, truck_id, stations) VALUES ($1, $2, $3) RETURNING *",
      [name, truckId || null, stations]
    );

    await query("COMMIT");

    const newRoute = res.rows[0];

    // Log database operation
    await query(
      "INSERT INTO logs (type, level, message) VALUES ($1, $2, $3)",
      ["HTTP", "INFO", `Created route '${name}' with ${stations.length} stations`]
    );

    return NextResponse.json(newRoute);
  } catch (error: any) {
    await query("ROLLBACK");
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT update a route (auto-sync removed for manual dispatch control)
export async function PUT(request: Request) {
  try {
    const { id, name, truckId, stations } = await request.json();

    if (!id || !name || !Array.isArray(stations) || stations.length === 0) {
      return NextResponse.json({ error: "Missing id, name, or stations list" }, { status: 400 });
    }

    await query("BEGIN");

    // Clear truck assignment on other routes
    if (truckId) {
      await query("UPDATE routes SET truck_id = NULL WHERE truck_id = $1 AND id != $2", [truckId, id]);
    }

    const res = await query(
      "UPDATE routes SET name = $1, truck_id = $2, stations = $3, updated_at = NOW() WHERE id = $4 RETURNING *",
      [name, truckId || null, stations, id]
    );

    await query("COMMIT");

    if (res.rows.length === 0) {
      return NextResponse.json({ error: "Route not found" }, { status: 404 });
    }

    const updatedRoute = res.rows[0];

    await query(
      "INSERT INTO logs (type, level, message) VALUES ($1, $2, $3)",
      ["HTTP", "INFO", `Updated route ID ${id} ('${name}')`]
    );

    return NextResponse.json(updatedRoute);
  } catch (error: any) {
    await query("ROLLBACK");
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE a route
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing route id" }, { status: 400 });
    }

    const res = await query("DELETE FROM routes WHERE id = $1 RETURNING *", [id]);

    if (res.rows.length === 0) {
      return NextResponse.json({ error: "Route not found" }, { status: 404 });
    }

    const deletedRoute = res.rows[0];

    await query(
      "INSERT INTO logs (type, level, message) VALUES ($1, $2, $3)",
      ["HTTP", "INFO", `Deleted route ID ${id} ('${deletedRoute.name}')`]
    );

    return NextResponse.json({ success: true, deletedRoute });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
