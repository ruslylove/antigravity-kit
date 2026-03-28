import { NextResponse } from "next/server";

export async function GET() {
  const now = new Date();
  const hourFactor = Math.sin((now.getHours() * Math.PI) / 12);

  const facilities = [
    {
      id: "facility-001",
      name: "Siam Paragon Warehouse",
      type: "Warehouse",
      imageUrl: "/images/facilities/warehouse.png",
      lat: 13.7455,
      lng: 100.5350,
      status: "Normal",
      currentPower: 120 + hourFactor * 40 + Math.random() * 10,
      dailyEnergy: 1840 + Math.random() * 100,
      monthlyEnergy: 52400 + Math.random() * 500,
      peakDemand: 185 + Math.random() * 15,
      capacity: 250,
      pue: 1.32 + Math.random() * 0.05,
      zones: [
        { id: "z-001-1", name: "Floor 1 — Receiving", type: "Floor", currentPower: 35 + Math.random() * 5, dailyEnergy: 520, status: "Normal", occupancy: 72 },
        { id: "z-001-2", name: "Floor 2 — Storage", type: "Floor", currentPower: 48 + Math.random() * 8, dailyEnergy: 740, status: "Normal", occupancy: 88 },
        { id: "z-001-3", name: "Floor 3 — Dispatch", type: "Floor", currentPower: 28 + Math.random() * 4, dailyEnergy: 410, status: "Normal", occupancy: 45 },
        { id: "z-001-4", name: "Cold Storage Bay", type: "Bay", currentPower: 9 + Math.random() * 2, dailyEnergy: 170, status: "High Usage", occupancy: 95 },
      ],
    },
    {
      id: "facility-002",
      name: "Sukhumvit Distribution Hub",
      type: "Distribution Center",
      imageUrl: "/images/facilities/distribution_center.png",
      lat: 13.7280,
      lng: 100.5680,
      status: "High Usage",
      currentPower: 340 + hourFactor * 80 + Math.random() * 20,
      dailyEnergy: 5120 + Math.random() * 200,
      monthlyEnergy: 148000 + Math.random() * 1000,
      peakDemand: 420 + Math.random() * 30,
      capacity: 500,
      pue: 1.45 + Math.random() * 0.08,
      zones: [
        { id: "z-002-1", name: "Ground — Sorting Area", type: "Floor", currentPower: 110 + Math.random() * 15, dailyEnergy: 1650, status: "High Usage", occupancy: 92 },
        { id: "z-002-2", name: "Floor 1 — Packaging", type: "Floor", currentPower: 85 + Math.random() * 10, dailyEnergy: 1280, status: "Normal", occupancy: 76 },
        { id: "z-002-3", name: "Floor 2 — Office Wing", type: "Office", currentPower: 32 + Math.random() * 5, dailyEnergy: 480, status: "Normal", occupancy: 60 },
        { id: "z-002-4", name: "Loading Bay A", type: "Bay", currentPower: 55 + Math.random() * 8, dailyEnergy: 840, status: "High Usage", occupancy: 100 },
        { id: "z-002-5", name: "Loading Bay B", type: "Bay", currentPower: 58 + Math.random() * 10, dailyEnergy: 870, status: "Critical", occupancy: 100 },
      ],
    },
    {
      id: "facility-003",
      name: "Bangna Office Complex",
      type: "Office",
      imageUrl: "/images/facilities/office.png",
      lat: 13.6610,
      lng: 100.6350,
      status: "Normal",
      currentPower: 45 + hourFactor * 20 + Math.random() * 5,
      dailyEnergy: 680 + Math.random() * 50,
      monthlyEnergy: 19200 + Math.random() * 300,
      peakDemand: 78 + Math.random() * 8,
      capacity: 120,
      pue: 1.18 + Math.random() * 0.04,
      zones: [
        { id: "z-003-1", name: "Floor 1 — Reception", type: "Floor", currentPower: 8 + Math.random() * 2, dailyEnergy: 120, status: "Normal", occupancy: 30 },
        { id: "z-003-2", name: "Floor 2 — Open Office", type: "Office", currentPower: 18 + Math.random() * 3, dailyEnergy: 270, status: "Normal", occupancy: 65 },
        { id: "z-003-3", name: "Floor 3 — Management", type: "Office", currentPower: 12 + Math.random() * 2, dailyEnergy: 180, status: "Normal", occupancy: 50 },
        { id: "z-003-4", name: "Server Room", type: "Room", currentPower: 7 + Math.random() * 1, dailyEnergy: 110, status: "Normal", occupancy: 0 },
      ],
    },
    {
      id: "facility-004",
      name: "Lat Krabang Factory",
      type: "Factory",
      imageUrl: "/images/facilities/factory.png",
      lat: 13.7230,
      lng: 100.7480,
      status: "Critical",
      currentPower: 580 + hourFactor * 120 + Math.random() * 30,
      dailyEnergy: 9800 + Math.random() * 500,
      monthlyEnergy: 284000 + Math.random() * 2000,
      peakDemand: 720 + Math.random() * 40,
      capacity: 800,
      pue: 1.62 + Math.random() * 0.1,
      zones: [
        { id: "z-004-1", name: "Production Line A", type: "Wing", currentPower: 210 + Math.random() * 20, dailyEnergy: 3500, status: "Critical", occupancy: 100 },
        { id: "z-004-2", name: "Production Line B", type: "Wing", currentPower: 195 + Math.random() * 15, dailyEnergy: 3200, status: "High Usage", occupancy: 95 },
        { id: "z-004-3", name: "Assembly Hall", type: "Floor", currentPower: 120 + Math.random() * 10, dailyEnergy: 2000, status: "High Usage", occupancy: 88 },
        { id: "z-004-4", name: "QC Office", type: "Office", currentPower: 15 + Math.random() * 3, dailyEnergy: 250, status: "Normal", occupancy: 40 },
        { id: "z-004-5", name: "Shipping Dock", type: "Bay", currentPower: 40 + Math.random() * 8, dailyEnergy: 850, status: "Normal", occupancy: 70 },
      ],
    },
    {
      id: "facility-005",
      name: "Chatuchak Depot",
      type: "Warehouse",
      imageUrl: "/images/facilities/warehouse.png",
      lat: 13.7990,
      lng: 100.5530,
      status: "Normal",
      currentPower: 210 + hourFactor * 30 + Math.random() * 15,
      dailyEnergy: 3200 + Math.random() * 150,
      monthlyEnergy: 92000 + Math.random() * 800,
      peakDemand: 270 + Math.random() * 20,
      capacity: 350,
      pue: 1.55 + Math.random() * 0.06,
      zones: [
        { id: "z-005-1", name: "Floor 1 — Main Storage", type: "Floor", currentPower: 95 + Math.random() * 10, dailyEnergy: 1450, status: "Normal", occupancy: 82 },
        { id: "z-005-2", name: "Floor 2 — Overflow", type: "Floor", currentPower: 65 + Math.random() * 8, dailyEnergy: 1000, status: "Normal", occupancy: 55 },
        { id: "z-005-3", name: "Fleet Operations Office", type: "Office", currentPower: 22 + Math.random() * 3, dailyEnergy: 340, status: "Normal", occupancy: 70 },
        { id: "z-005-4", name: "Vehicle Charging Bay", type: "Bay", currentPower: 28 + Math.random() * 5, dailyEnergy: 410, status: "Normal", occupancy: 35 },
      ],
    },
  ];

  const rounded = facilities.map((f) => ({
    ...f,
    currentPower: Math.round(f.currentPower * 10) / 10,
    dailyEnergy: Math.round(f.dailyEnergy),
    monthlyEnergy: Math.round(f.monthlyEnergy),
    peakDemand: Math.round(f.peakDemand * 10) / 10,
    pue: Math.round(f.pue * 100) / 100,
    zones: f.zones.map((z) => ({
      ...z,
      currentPower: Math.round(z.currentPower * 10) / 10,
    })),
  }));

  await new Promise((resolve) => setTimeout(resolve, 200));

  return NextResponse.json(rounded);
}
