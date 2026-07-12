const mqtt = require("mqtt");
const fs = require("fs");
const path = require("path");

const REMOTE_IP = "91.210.146.166";
const MQTT_BROKER = `mqtt://${REMOTE_IP}:1883`;
const SERVER_URL = `http://${REMOTE_IP}:3000`;
const TRUCK_ID = "truck-001";
const TRUCK_NAME = "BKK-Express-01";

const FRONT_PHOTO_PATH = path.join(__dirname, "front.jpeg");
const REAR_PHOTO_PATH = path.join(__dirname, "rear.jpg");

const JPEG_1X1_HEX = "ffd8ffe000104a46494600010101006000600000ffdb004300080606070605080707070909080a0c140d0c0b0b0c1912130f141d1a1f1e1d1a1c1c20242e2720222c231c1c2837292c30313434341f27393d38323c2e333432ffc0000b080001000101011100ffc4001f0000010501110101010100000000000000000102030405060708090a0bffc400b5100002010303020403050504040000017d01020300041105122131410613516107227114328191a1082342b1c11552d1f02433627282090a161718191a25262728292a3435363738393a434445464748494a535455565758595a636465666768696a737475767778797a838485868788898a92939495969798999a9b9c9d9e9fa2a3a4a5a6a7a8a9aaabacadaeafb2b3b4b5b6b7b8b9babbbcbdbebfc2c3c4c5c6c7c8c9cacbcccdcecfd2d3d4d5d6d7d8d9dadbdcdddedfe2e3e4e5e6e7e8e9eaebecedeeeffe0009000102030405060708ffda000c010100003f0037ffd9";
const jpegBuffer = Buffer.from(JPEG_1X1_HEX, "hex");

let lat = 13.7520;
let lng = 100.5120;
let seqNo = 1247;
let batterySOC = 98;
let telemetryLoopCount = 0;

console.log(`🔌 Connecting to MQTT Broker at ${MQTT_BROKER}...`);
const client = mqtt.connect(MQTT_BROKER, {
  clientId: TRUCK_ID,
  clean: true,
  keepalive: 60
});

client.on("connect", () => {
  console.log("✅ Connected to MQTT Broker successfully!");
  
  const onlineEvent = {
    v: 1,
    type: "DeviceOnline",
    ts: Math.floor(Date.now() / 1000),
    clkSource: "GPS",
    firmware: "1.4.2",
    stationTableVersion: 7
  };
  
  client.publish(`trucks/${TRUCK_ID}/event`, JSON.stringify(onlineEvent), { qos: 1 }, (err) => {
    if (err) console.error("❌ Failed to publish DeviceOnline event:", err);
    else console.log("📣 Published DeviceOnline event successfully");
  });
  
  startTelemetryLoop();
});

client.on("error", (err) => {
  console.error("❌ MQTT Connection Error:", err);
});

client.on("close", () => {
  console.log("🔌 MQTT Connection closed");
});

function startTelemetryLoop() {
  setInterval(() => {
    telemetryLoopCount++;
    seqNo++;
    
    lat += (Math.random() - 0.5) * 0.005;
    lng += (Math.random() - 0.5) * 0.005;
    
    const speed = Math.floor(Math.random() * 20) + 40; 
    const rpm = speed > 0 ? 1500 + Math.floor(Math.random() * 800) : 0;
    
    batterySOC -= 0.1;
    if (batterySOC < 20) batterySOC = 98; 
    
    const telemetryPayload = {
      v: 1,
      ts: Math.floor(Date.now() / 1000),
      gps: {
        lat: Math.round(lat * 10000) / 10000,
        lng: Math.round(lng * 10000) / 10000,
        altM: 12.5,
        speedKph: speed,
        headingDeg: Math.floor(Math.random() * 360),
        hdop: 1.2,
        satellites: 8,
        fixType: "3D"
      },
      obd: {
        speedKph: speed,
        rpm: rpm,
        engineLoadPct: Math.floor(Math.random() * 30) + 20,
        coolantTempC: 85 + Math.floor(Math.random() * 10),
        fuelLevelPct: Math.floor(batterySOC),
        throttlePct: 20 + Math.floor(Math.random() * 25),
        dtcCount: 0,
        mil: false
      },
      device: {
        battV: 12.8,
        signalDbm: -70 - Math.floor(Math.random() * 15),
        seqNo: seqNo,
        bufferDepth: 0,
        clkSource: "GPS"
      }
    };
    
    client.publish(`trucks/${TRUCK_ID}/telemetry`, JSON.stringify(telemetryPayload), { qos: 1 }, (err) => {
      if (err) console.error("❌ Failed to publish Telemetry:", err);
      else console.log(`📈 Published Telemetry [Seq: ${seqNo}] at coordinates (${telemetryPayload.gps.lat}, ${telemetryPayload.gps.lng})`);
    });
    
    if (telemetryLoopCount % 6 === 0) {
      simulateStationVisit();
    }
  }, 10000);
}

async function simulateStationVisit() {
  const stations = ["station-bkk-001", "station-bkk-002", "station-bkk-003", "station-bkk-004", "station-bkk-005"];
  const randomStation = stations[Math.floor(Math.random() * stations.length)];
  const tripId = `trip-${Date.now().toString().slice(-8)}`;
  
  console.log(`📍 Approaching Station: ${randomStation}...`);
  
  const arrivalPayload = {
    v: 1,
    type: "StationArrival",
    ts: Math.floor(Date.now() / 1000),
    stationId: randomStation,
    distM: 145.3,
    tripId: tripId
  };
  
  client.publish(`trucks/${TRUCK_ID}/event`, JSON.stringify(arrivalPayload), { qos: 1 }, (err) => {
    if (err) console.error("❌ StationArrival publish failed:", err);
    else console.log(`📥 Published StationArrival at ${randomStation}`);
  });
  
  setTimeout(async () => {
    console.log(`📤 Departing Station: ${randomStation}. Starting Photo Upload flow...`);
    
    const departurePayload = {
      v: 1,
      type: "StationDeparture",
      ts: Math.floor(Date.now() / 1000),
      stationId: randomStation,
      distM: 201.8,
      loadPct: 85,
      tripId: tripId
    };
    
    client.publish(`trucks/${TRUCK_ID}/event`, JSON.stringify(departurePayload), { qos: 1 }, (err) => {
      if (err) console.error("❌ StationDeparture publish failed:", err);
      else console.log(`📤 Published StationDeparture from ${randomStation}`);
    });
    
    await uploadPhoto(randomStation, "cargo-front");
    await uploadPhoto(randomStation, "cargo-rear");
    
  }, 8000);
}

async function uploadPhoto(stationId, camera) {
  const timestamp = Math.floor(Date.now() / 1000);
  const uploadUrl = `${SERVER_URL}/v1/trucks/${TRUCK_ID}/photos`;
  
  let photoBuffer;
  try {
    const photoPath = camera === "cargo-front" ? FRONT_PHOTO_PATH : REAR_PHOTO_PATH;
    if (fs.existsSync(photoPath)) {
      photoBuffer = fs.readFileSync(photoPath);
      console.log(`📖 Loaded real ${camera} photo from disk (${photoBuffer.length} bytes)`);
    } else {
      console.warn(`⚠️ Warning: ${photoPath} not found. Using fallback 1x1 JPEG.`);
      photoBuffer = jpegBuffer;
    }
  } catch (err) {
    console.error(`❌ Failed to read photo file for ${camera}:`, err.message);
    photoBuffer = jpegBuffer;
  }
  
  console.log(`📸 HTTP Uploading ${camera} photo to ${uploadUrl}...`);
  
  try {
    const response = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        "Content-Type": "image/jpeg",
        "X-Station-Id": stationId,
        "X-Camera": camera,
        "X-Timestamp": timestamp.toString()
      },
      body: photoBuffer
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Upload rejected with status ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    console.log(`✅ HTTP Uploaded ${camera} success! Received PhotoID: ${data.photoId}`);
    
    const photoReadyPayload = {
      v: 1,
      type: "PhotoReady",
      ts: Math.floor(Date.now() / 1000),
      photoId: data.photoId,
      camera: camera,
      stationId: stationId,
      sizeBytes: photoBuffer.length,
      cameraError: false
    };
    
    client.publish(`trucks/${TRUCK_ID}/photo/ready`, JSON.stringify(photoReadyPayload), { qos: 1 }, (err) => {
      if (err) console.error(`❌ Failed to publish PhotoReady for ${camera}:`, err);
      else console.log(`📣 Published PhotoReady event for ${camera} (${data.photoId})`);
    });
    
  } catch (error) {
    console.error(`❌ Photo Upload failed for ${camera}:`, error.message);
  }
}
