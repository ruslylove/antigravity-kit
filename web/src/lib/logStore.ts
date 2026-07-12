import { initDb, pool } from "./db";

export interface LogEntry {
  id: string;
  timestamp: string;
  type: "HTTP" | "MQTT";
  level: "INFO" | "WARN" | "ERROR" | "DEBUG";
  message: string;
  details?: any;
}

export const logStore = {
  getLogs: async (): Promise<LogEntry[]> => {
    await initDb();
    try {
      const { rows } = await pool.query(`
        SELECT id, timestamp, type, level, message, metadata AS details 
        FROM logs 
        ORDER BY timestamp DESC 
        LIMIT 200
      `);
      return rows.map((r) => ({
        id: String(r.id),
        timestamp: new Date(r.timestamp).toISOString(),
        type: r.type,
        level: r.level,
        message: r.message,
        details: r.details
      }));
    } catch (error) {
      console.error("Failed to load logs from database:", error);
      return [];
    }
  },
  
  addLog: async (
    type: "HTTP" | "MQTT", 
    level: "INFO" | "WARN" | "ERROR" | "DEBUG", 
    message: string, 
    details?: any
  ): Promise<void> => {
    await initDb();
    try {
      await pool.query(`
        INSERT INTO logs (type, level, message, metadata) 
        VALUES ($1, $2, $3, $4)
      `, [type, level, message, details || {}]);
      
      // Auto-prune logs older than 90 days to satisfy historical bounded tracking
      await pool.query(`
        DELETE FROM logs 
        WHERE timestamp < NOW() - INTERVAL '90 days'
      `);
    } catch (error) {
      console.error("Failed to add log to database:", error);
    }
  },
  
  clearLogs: async (): Promise<void> => {
    await initDb();
    try {
      await pool.query("TRUNCATE TABLE logs");
    } catch (error) {
      console.error("Failed to clear logs in database:", error);
    }
  }
};
