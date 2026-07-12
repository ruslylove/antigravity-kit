import { Pool } from "pg";
import { getBaseStations } from "./stations";

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:Qq1150++@91.210.146.166/postgres?sslmode=disable";

export const pool = new Pool({
  connectionString,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

export const query = (text: string, params?: any[]) => pool.query(text, params);

let initialized = false;

export async function initDb() {
  if (initialized) return;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    
    // Create trucks table
    await client.query(`
      CREATE TABLE IF NOT EXISTS trucks (
        id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        driver_name VARCHAR(100),
        status VARCHAR(50) DEFAULT 'En Route',
        lat DOUBLE PRECISION NOT NULL,
        lng DOUBLE PRECISION NOT NULL,
        last_seen TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        data JSONB NOT NULL DEFAULT '{}'::jsonb,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create telemetry_history table
    await client.query(`
      CREATE TABLE IF NOT EXISTS telemetry_history (
        id SERIAL PRIMARY KEY,
        truck_id VARCHAR(100) NOT NULL REFERENCES trucks(id) ON DELETE CASCADE,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        lat DOUBLE PRECISION NOT NULL,
        lng DOUBLE PRECISION NOT NULL,
        speed DOUBLE PRECISION NOT NULL,
        data JSONB NOT NULL DEFAULT '{}'::jsonb
      );
    `);

    // Create logs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS logs (
        id SERIAL PRIMARY KEY,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        type VARCHAR(50) NOT NULL,
        level VARCHAR(50) NOT NULL,
        message TEXT NOT NULL,
        metadata JSONB NOT NULL DEFAULT '{}'::jsonb
      );
    `);

    // Create stations table
    await client.query(`
      CREATE TABLE IF NOT EXISTS stations (
        id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        lat DOUBLE PRECISION NOT NULL,
        lng DOUBLE PRECISION NOT NULL,
        status VARCHAR(50) DEFAULT 'Available',
        power_limit VARCHAR(50) DEFAULT '150kW',
        socket_status VARCHAR(50) DEFAULT 'Available',
        current_meter DOUBLE PRECISION DEFAULT 0.0,
        power_output DOUBLE PRECISION DEFAULT 0.0,
        schedule JSONB DEFAULT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create routes table
    await client.query(`
      CREATE TABLE IF NOT EXISTS routes (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        truck_id VARCHAR(100) REFERENCES trucks(id) ON DELETE SET NULL,
        stations VARCHAR(100)[] NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Seed default stations if empty
    const stationsCountRes = await client.query("SELECT COUNT(*) FROM stations");
    if (parseInt(stationsCountRes.rows[0].count, 10) === 0) {
      console.log("🌱 Seeding default charging stations into PostgreSQL...");
      const baseStations = getBaseStations();
      for (const s of baseStations) {
        await client.query(`
          INSERT INTO stations (id, name, lat, lng, status, power_limit, socket_status, current_meter, power_output)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `, [s.id, s.name, s.lat, s.lng, s.status, s.powerLimit, s.socketStatus, s.currentMeter, s.powerOutput]);
      }
      console.log("🌱 Default charging stations seeded successfully!");
    }

    // Create indexes for fast querying
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_telemetry_history_truck_ts ON telemetry_history(truck_id, timestamp DESC);
      CREATE INDEX IF NOT EXISTS idx_logs_ts ON logs(timestamp DESC);
    `);

    await client.query("COMMIT");
    initialized = true;
    console.log("✅ PostgreSQL Database Initialized Successfully!");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("❌ Failed to initialize PostgreSQL Database:", error);
    throw error;
  } finally {
    client.release();
  }
}
