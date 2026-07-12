import { NextResponse } from "next/server";
import { logStore } from "@/lib/logStore";

export async function GET() {
  try {
    const logs = await logStore.getLogs();
    return NextResponse.json(logs);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await logStore.clearLogs();
    await logStore.addLog("HTTP", "WARN", "Developer Console logs cleared by user");
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to clear logs" }, { status: 500 });
  }
}
