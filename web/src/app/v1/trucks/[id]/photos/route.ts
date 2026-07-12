import { NextRequest, NextResponse } from "next/server";
import { fleetStore } from "@/lib/fleetStore";
import { logStore } from "@/lib/logStore";
import fs from "fs/promises";
import path from "path";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let truckId = "unknown";
  let stationId: string | null = null;
  let camera: string | null = null;
  let timestampStr: string | null = null;
  
  try {
    const { id } = await params;
    truckId = id;
    
    // 1. Retrieve and validate headers
    stationId = request.headers.get("x-station-id");
    camera = request.headers.get("x-camera");
    timestampStr = request.headers.get("x-timestamp");
    const contentType = request.headers.get("content-type");

    const headerDetails = {
      truckId,
      stationId,
      camera,
      timestamp: timestampStr,
      contentType,
      userAgent: request.headers.get("user-agent")
    };

    if (!stationId) {
      logStore.addLog("HTTP", "WARN", `POST /v1/trucks/${truckId}/photos - Validation failed: Missing x-station-id`, headerDetails);
      return NextResponse.json({ error: "Missing x-station-id header" }, { status: 400 });
    }

    if (!camera || (camera !== "cargo-front" && camera !== "cargo-rear")) {
      logStore.addLog("HTTP", "WARN", `POST /v1/trucks/${truckId}/photos - Validation failed: Invalid x-camera (${camera})`, headerDetails);
      return NextResponse.json(
        { error: "Invalid or missing x-camera header (must be 'cargo-front' or 'cargo-rear')" },
        { status: 400 }
      );
    }

    if (!timestampStr || isNaN(Number(timestampStr))) {
      logStore.addLog("HTTP", "WARN", `POST /v1/trucks/${truckId}/photos - Validation failed: Invalid x-timestamp (${timestampStr})`, headerDetails);
      return NextResponse.json({ error: "Invalid or missing x-timestamp header" }, { status: 400 });
    }

    if (!contentType || !contentType.startsWith("image/")) {
      logStore.addLog("HTTP", "WARN", `POST /v1/trucks/${truckId}/photos - Validation failed: Invalid content type (${contentType})`, headerDetails);
      return NextResponse.json({ error: "Content-Type must be an image (e.g. image/jpeg)" }, { status: 400 });
    }

    // 2. Read and validate binary body
    const bodyArrayBuffer = await request.arrayBuffer();
    const buffer = Buffer.from(bodyArrayBuffer);

    if (buffer.length === 0) {
      logStore.addLog("HTTP", "WARN", `POST /v1/trucks/${truckId}/photos - Validation failed: Empty request body`, headerDetails);
      return NextResponse.json({ error: "Request body is empty" }, { status: 400 });
    }

    // Allow 512 KB maximum payload size (plus a small buffer of 10% just in case)
    const MAX_SIZE = 512 * 1024 * 1.1;
    if (buffer.length > MAX_SIZE) {
      logStore.addLog("HTTP", "WARN", `POST /v1/trucks/${truckId}/photos - Rejected: Payload size ${buffer.length} bytes exceeds limit`, { ...headerDetails, sizeBytes: buffer.length });
      return NextResponse.json({ error: "Payload exceeds 512 KB limit" }, { status: 413 });
    }

    // 3. Define local folder paths and save the image
    const publicDir = path.join(process.cwd(), "public");
    const uploadsDir = path.join(publicDir, "uploads");
    
    // Ensure the uploads directory exists
    await fs.mkdir(uploadsDir, { recursive: true });

    // Sanitize parameters for the filename
    const sanitizedId = truckId.replace(/[^a-zA-Z0-9-_]/g, "");
    const sanitizedCamera = camera.replace(/[^a-zA-Z0-9-_]/g, "");
    const sanitizedTimestamp = timestampStr.replace(/[^0-9]/g, "");
    const filename = `${sanitizedId}-${sanitizedCamera}-${sanitizedTimestamp}.jpg`;
    const filePath = path.join(uploadsDir, filename);

    // Write file to disk
    await fs.writeFile(filePath, buffer);
    console.log(`Saved truck photo to ${filePath} (${buffer.length} bytes)`);

    // 4. Update the shared fleet state
    const publicUrl = `/uploads/${filename}`;
    const updated = fleetStore.addPhotoToTruck(truckId, publicUrl);

    if (!updated) {
      // Clean up the file if truck does not exist in store
      await fs.unlink(filePath).catch(() => {});
      logStore.addLog("HTTP", "WARN", `POST /v1/trucks/${truckId}/photos - Failed: Truck ID not found in fleet store`, headerDetails);
      return NextResponse.json({ error: `Truck with ID '${truckId}' not found` }, { status: 404 });
    }

    // 5. Respond with documented JSON payload
    const photoId = `photo-${sanitizedId}-${sanitizedCamera}-${sanitizedTimestamp}`;
    logStore.addLog("HTTP", "INFO", `POST /v1/trucks/${truckId}/photos - Photo saved and registered`, {
      photoId,
      filename,
      sizeBytes: buffer.length,
      truckId,
      stationId,
      camera,
      timestamp: timestampStr
    });
    return NextResponse.json({ photoId }, { status: 200 });

  } catch (error: any) {
    console.error("Error handling truck photo upload:", error);
    logStore.addLog("HTTP", "ERROR", `POST /v1/trucks/${truckId}/photos - Internal error: ${error.message}`, {
      error: error.stack,
      truckId,
      stationId,
      camera,
      timestamp: timestampStr
    });
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
