import fs from "fs";
import path from "path";

export interface LogEntry {
  id: string;
  timestamp: string;
  type: "HTTP" | "MQTT";
  level: "INFO" | "WARN" | "ERROR" | "DEBUG";
  message: string;
  details?: any;
}

const LOGS_FILE_PATH = path.join(process.cwd(), "data", "logs.json");
const MAX_LOGS = 200;

function loadLogs(): LogEntry[] {
  try {
    const dir = path.dirname(LOGS_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (fs.existsSync(LOGS_FILE_PATH)) {
      const fileContent = fs.readFileSync(LOGS_FILE_PATH, "utf-8");
      return JSON.parse(fileContent);
    }
    return [];
  } catch (error) {
    console.error("Error loading logs from disk:", error);
    return [];
  }
}

function saveLogs(logs: LogEntry[]) {
  try {
    fs.writeFileSync(LOGS_FILE_PATH, JSON.stringify(logs, null, 2), "utf-8");
  } catch (error) {
    console.error("Failed to save logs to disk:", error);
  }
}

export const logStore = {
  getLogs: (): LogEntry[] => {
    return loadLogs();
  },
  
  addLog: (type: "HTTP" | "MQTT", level: "INFO" | "WARN" | "ERROR" | "DEBUG", message: string, details?: any) => {
    const logs = loadLogs();
    const newEntry: LogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toISOString(),
      type,
      level,
      message,
      details,
    };
    
    logs.unshift(newEntry);
    if (logs.length > MAX_LOGS) {
      logs.splice(MAX_LOGS);
    }
    saveLogs(logs);
  },
  
  clearLogs: () => {
    saveLogs([]);
  }
};

function simulateMqttLogs(logs: LogEntry[]): LogEntry[] {
  const now = Date.now();
  
  const lastMqttLog = logs.find(l => l.type === "MQTT");
  const lastTime = lastMqttLog ? new Date(lastMqttLog.timestamp).getTime() : 0;
  
  if (now - lastTime > 6000) {
    const truckIds = ["truck-001", "truck-002", "truck-003", "truck-004", "truck-005", "truck-006"];
    const names = ["BKK-Express-01", "BKK-Heavy-02", "BKK-Swift-03", "BKK-Cargo-04", "BKK-Rapid-05", "BKK-Maint-06"];
    
    const count = Math.random() > 0.5 ? 2 : 1;
    const shuffled = [...truckIds].sort(() => 0.5 - Math.random());
    
    for (let i = 0; i < count; i++) {
      const id = shuffled[i];
      const name = names[truckIds.indexOf(id)];
      const battery = Math.floor(Math.random() * 40) + 60;
      const speed = id === "truck-004" || id === "truck-006" ? 0 : Math.floor(Math.random() * 30) + 30;
      
      const payload = {
        deviceId: id,
        deviceName: name,
        telemetry: {
          gps: {
            lat: 13.7 + (Math.random() * 0.1),
            lng: 100.5 + (Math.random() * 0.2),
            speed: speed,
            heading: Math.floor(Math.random() * 360)
          },
          battery: {
            soc: battery,
            voltage: 395.2 + (Math.random() * 5),
            temperature: 32.5 + (Math.random() * 2)
          },
          cargo: {
            doorClosed: Math.random() > 0.1,
            humidityPercent: 52 + Math.floor(Math.random() * 10),
            tempCelsius: 18.5 + (Math.random() * 3)
          }
        },
        qos: 1,
        retained: false
      };
      
      const newEntry: LogEntry = {
        id: `log-${now}-${i}-${Math.random().toString(36).substr(2, 5)}`,
        timestamp: new Date(now - (count - i) * 1200).toISOString(),
        type: "MQTT",
        level: "INFO",
        message: `MQTT Topic published: siam-ev/trucks/${id}/telemetry`,
        details: payload
      };
      
      logs.unshift(newEntry);
    }
    
    if (logs.length > MAX_LOGS) {
      logs.splice(MAX_LOGS);
    }
  }
  
  return logs;
}
