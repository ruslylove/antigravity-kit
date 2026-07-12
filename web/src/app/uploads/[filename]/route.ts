import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;
    
    const filePath = path.join(process.cwd(), "public", "uploads", filename);
    
    try {
      const buffer = await fs.readFile(filePath);
      
      let contentType = "image/jpeg";
      if (filename.endsWith(".png")) {
        contentType = "image/png";
      } else if (filename.endsWith(".webp")) {
        contentType = "image/webp";
      }
      
      return new NextResponse(buffer, {
        status: 200,
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=3600",
        },
      });
    } catch (err) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
