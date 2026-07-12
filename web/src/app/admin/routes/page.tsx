"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ChevronLeft, 
  Plus, 
  Trash2, 
  Edit, 
  MapPin, 
  Truck, 
  Save, 
  RefreshCw, 
  AlertTriangle,
  MoveUp,
  MoveDown,
  Info,
  BatteryCharging,
  Send,
  CheckCircle
} from "lucide-react";

interface TruckRecord {
  id: string;
  name: string;
  driverName?: string;
  status: string;
  lat: number;
  lng: number;
  lastSeen?: string;
}

interface StationRecord {
  id: string;
  name: string;
  lat: number;
  lng: number;
  status: string;
  powerLimit: string;
  socketStatus: string;
}

interface RouteRecord {
  id: number;
  name: string;
  truck_id: string | null;
  truck_name: string | null;
  stations: string[];
  created_at: string;
  updated_at: string;
}

export default function AdminDashboard() {
  // Navigation Tabs: 'ROUTES' | 'STATIONS' | 'TRUCKS'
  const [activeTab, setActiveTab] = useState<"ROUTES" | "STATIONS" | "TRUCKS">("ROUTES");

  // Live Data lists
  const [routes, setRoutes] = useState<RouteRecord[]>([]);
  const [trucks, setTrucks] = useState<TruckRecord[]>([]);
  const [stations, setStations] = useState<StationRecord[]>([]);
  
  // Loading & Action feedback states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dispatchingId, setDispatchingId] = useState<number | null>(null);
  const [dispatchedId, setDispatchedId] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // CRUD Routes Form States
  const [editingRouteId, setEditingRouteId] = useState<number | null>(null);
  const [routeName, setRouteName] = useState("");
  const [selectedTruckId, setSelectedTruckId] = useState("");
  const [selectedStations, setSelectedStations] = useState<string[]>([]);

  // CRUD Stations Form States
  const [editingStationId, setEditingStationId] = useState<string | null>(null);
  const [stationId, setStationId] = useState("");
  const [stationName, setStationName] = useState("");
  const [stationLat, setStationLat] = useState("");
  const [stationLng, setStationLng] = useState("");
  const [stationPowerLimit, setStationPowerLimit] = useState("150kW");
  const [stationStatus, setStationStatus] = useState("Available");
  const [stationSocketStatus, setStationSocketStatus] = useState("Available");

  // CRUD Trucks Form States
  const [editingTruckId, setEditingTruckId] = useState<string | null>(null);
  const [truckId, setTruckId] = useState("");
  const [truckName, setTruckName] = useState("");
  const [truckDriverName, setTruckDriverName] = useState("");
  const [truckLat, setTruckLat] = useState("");
  const [truckLng, setTruckLng] = useState("");
  const [truckStatus, setTruckStatus] = useState("Idle");

  // Fetch initial data
  const fetchData = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      // Fetch routes
      const routesRes = await fetch("/api/routes");
      if (!routesRes.ok) throw new Error("Failed to load routes from database.");
      const routesData = await routesRes.json();
      setRoutes(routesData);

      // Fetch trucks
      const fleetRes = await fetch("/api/fleet");
      if (!fleetRes.ok) throw new Error("Failed to load active fleet.");
      const fleetData = await fleetRes.json();
      setTrucks(fleetData);

      // Fetch stations from DB
      const stationsRes = await fetch("/api/ocpp/stations");
      if (!stationsRes.ok) throw new Error("Failed to load stations registry.");
      const stationsData = await stationsRes.json();
      setStations(stationsData);
    } catch (error: any) {
      setErrorMsg(error.message || "An error occurred fetching records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- Route Handlers ---
  const handleRouteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!routeName.trim()) {
      setErrorMsg("Route name is required.");
      return;
    }
    if (selectedStations.length < 2) {
      setErrorMsg("A route itinerary requires at least 2 stations (Origin and Destination).");
      return;
    }

    setSaving(true);
    setErrorMsg("");
    setSuccessMsg("");

    const payload = {
      id: editingRouteId,
      name: routeName,
      truckId: selectedTruckId || null,
      stations: selectedStations
    };

    try {
      const method = editingRouteId ? "PUT" : "POST";
      const res = await fetch("/api/routes", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to save route");
      }

      setSuccessMsg(editingRouteId ? `Route '${routeName}' updated successfully!` : `Route '${routeName}' created successfully!`);
      resetRouteForm();
      await fetchData();
    } catch (error: any) {
      setErrorMsg(error.message || "Failed to save route.");
    } finally {
      setSaving(false);
    }
  };

  const handleRouteEdit = (route: RouteRecord) => {
    setEditingRouteId(route.id);
    setRouteName(route.name);
    setSelectedTruckId(route.truck_id || "");
    setSelectedStations(route.stations);
    setErrorMsg("");
    setSuccessMsg("");
  };

  const handleRouteDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this route?")) return;

    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch(`/api/routes?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete route");

      setSuccessMsg("Route deleted successfully.");
      await fetchData();
    } catch (error: any) {
      setErrorMsg(error.message || "Failed to delete route.");
    }
  };

  const handleRouteDispatch = async (routeId: number) => {
    setDispatchingId(routeId);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/routes/dispatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ routeId })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to dispatch route to truck.");
      }

      const resData = await res.json();
      setDispatchedId(routeId);
      setSuccessMsg(`Route successfully dispatched to Truck ${resData.truckId}!`);
      
      setTimeout(() => {
        setDispatchedId(null);
      }, 3000);

      await fetchData();
    } catch (error: any) {
      setErrorMsg(error.message || "Failed to dispatch route.");
    } finally {
      setDispatchingId(null);
    }
  };

  const resetRouteForm = () => {
    setEditingRouteId(null);
    setRouteName("");
    setSelectedTruckId("");
    setSelectedStations([]);
  };

  // --- Station Handlers ---
  const handleStationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stationId.trim()) {
      setErrorMsg("Station ID is required.");
      return;
    }
    if (!stationName.trim()) {
      setErrorMsg("Station name is required.");
      return;
    }
    if (!stationLat.trim() || !stationLng.trim()) {
      setErrorMsg("Coordinates are required.");
      return;
    }

    setSaving(true);
    setErrorMsg("");
    setSuccessMsg("");

    const payload = {
      id: stationId.trim(),
      name: stationName.trim(),
      lat: parseFloat(stationLat),
      lng: parseFloat(stationLng),
      powerLimit: stationPowerLimit,
      status: stationStatus,
      socketStatus: stationSocketStatus
    };

    try {
      const method = editingStationId ? "PUT" : "POST";
      const res = await fetch("/api/ocpp/stations", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to save station");
      }

      setSuccessMsg(editingStationId ? `Station '${stationName}' updated successfully!` : `Station '${stationName}' created successfully!`);
      resetStationForm();
      await fetchData();
    } catch (error: any) {
      setErrorMsg(error.message || "Failed to save station.");
    } finally {
      setSaving(false);
    }
  };

  const handleStationEdit = (station: StationRecord) => {
    setEditingStationId(station.id);
    setStationId(station.id);
    setStationName(station.name);
    setStationLat(station.lat.toString());
    setStationLng(station.lng.toString());
    setStationPowerLimit(station.powerLimit);
    setStationStatus(station.status);
    setStationSocketStatus(station.socketStatus);
    setErrorMsg("");
    setSuccessMsg("");
  };

  const handleStationDelete = async (id: string) => {
    if (!confirm(`Are you sure you want to delete station '${id}'? This will remove it from all route itineraries.`)) return;

    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch(`/api/ocpp/stations?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete station");

      setSuccessMsg("Station deleted successfully.");
      await fetchData();
    } catch (error: any) {
      setErrorMsg(error.message || "Failed to delete station.");
    }
  };

  const resetStationForm = () => {
    setEditingStationId(null);
    setStationId("");
    setStationName("");
    setStationLat("");
    setStationLng("");
    setStationPowerLimit("150kW");
    setStationStatus("Available");
    setStationSocketStatus("Available");
  };

  // --- Truck Handlers ---
  const handleTruckSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!truckId.trim()) {
      setErrorMsg("Truck ID is required.");
      return;
    }
    if (!truckName.trim()) {
      setErrorMsg("Truck name is required.");
      return;
    }
    if (!truckLat.trim() || !truckLng.trim()) {
      setErrorMsg("Coordinates are required.");
      return;
    }

    setSaving(true);
    setErrorMsg("");
    setSuccessMsg("");

    const payload = {
      id: truckId.trim(),
      name: truckName.trim(),
      driverName: truckDriverName.trim() || null,
      status: truckStatus,
      lat: parseFloat(truckLat),
      lng: parseFloat(truckLng)
    };

    try {
      const method = editingTruckId ? "PUT" : "POST";
      const res = await fetch("/api/fleet", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to save truck.");
      }

      setSuccessMsg(editingTruckId ? `Truck '${truckName}' updated successfully!` : `Truck '${truckName}' created successfully!`);
      resetTruckForm();
      await fetchData();
    } catch (error: any) {
      setErrorMsg(error.message || "Failed to save truck.");
    } finally {
      setSaving(false);
    }
  };

  const handleTruckEdit = (truck: TruckRecord) => {
    setEditingTruckId(truck.id);
    setTruckId(truck.id);
    setTruckName(truck.name);
    setTruckDriverName(truck.driverName || "");
    setTruckLat(truck.lat.toString());
    setTruckLng(truck.lng.toString());
    setTruckStatus(truck.status);
    setErrorMsg("");
    setSuccessMsg("");
  };

  const handleTruckDelete = async (id: string) => {
    if (!confirm(`Are you sure you want to delete EV truck '${id}'? This will unassign it from any routes.`)) return;

    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch(`/api/fleet?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete truck.");

      setSuccessMsg("Truck deleted successfully.");
      await fetchData();
    } catch (error: any) {
      setErrorMsg(error.message || "Failed to delete truck.");
    }
  };

  const resetTruckForm = () => {
    setEditingTruckId(null);
    setTruckId("");
    setTruckName("");
    setTruckDriverName("");
    setTruckLat("");
    setTruckLng("");
    setTruckStatus("Idle");
  };

  // Checklist toggles
  const handleStationToggle = (sId: string) => {
    setSelectedStations(prev => {
      if (prev.includes(sId)) {
        return prev.filter(id => id !== sId);
      } else {
        return [...prev, sId];
      }
    });
  };

  const moveStation = (index: number, direction: "up" | "down") => {
    const newStations = [...selectedStations];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= newStations.length) return;
    
    const temp = newStations[index];
    newStations[index] = newStations[targetIndex];
    newStations[targetIndex] = temp;
    
    setSelectedStations(newStations);
  };

  const statusBg = (status: string) => {
    switch (status) {
      case "En Route":
      case "Returning":
        return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
      case "Loading":
        return "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20";
      case "Idle":
        return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
      case "Offline":
        return "bg-slate-800 text-slate-500 border border-white/5";
      default:
        return "bg-purple-500/10 text-purple-400 border border-purple-500/20";
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased">
      {/* Background decoration grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none opacity-40"></div>

      {/* Header Container */}
      <header className="relative border-b border-white/10 bg-slate-900/60 backdrop-blur-md px-6 py-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <Link 
            href="/remote-control" 
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition text-sm font-semibold text-slate-300 hover:text-white"
          >
            <ChevronLeft size={16} />
            Back to Tracker
          </Link>
          <span className="w-1.5 h-6 bg-cyan-500 rounded-full"></span>
          <div>
            <h1 className="text-lg font-black tracking-wider text-white uppercase">Siam EV Control Panel</h1>
            <p className="text-[10px] text-slate-400 font-medium">Administrative CRUD Configuration Suite</p>
          </div>
        </div>

        {/* Tab Selection Switches */}
        <div className="flex items-center gap-1.5 bg-slate-950/80 border border-white/15 p-1 rounded-xl">
          <button
            onClick={() => { setActiveTab("ROUTES"); resetRouteForm(); resetStationForm(); resetTruckForm(); }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-black tracking-wide uppercase transition ${
              activeTab === "ROUTES" 
                ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-950/10" 
                : "text-slate-400 hover:text-white bg-transparent"
            }`}
          >
            <MapPin size={12} />
            Routes
          </button>
          <button
            onClick={() => { setActiveTab("STATIONS"); resetRouteForm(); resetStationForm(); resetTruckForm(); }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-black tracking-wide uppercase transition ${
              activeTab === "STATIONS" 
                ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-950/10" 
                : "text-slate-400 hover:text-white bg-transparent"
            }`}
          >
            <BatteryCharging size={12} />
            Stations
          </button>
          <button
            onClick={() => { setActiveTab("TRUCKS"); resetRouteForm(); resetStationForm(); resetTruckForm(); }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-black tracking-wide uppercase transition ${
              activeTab === "TRUCKS" 
                ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-950/10" 
                : "text-slate-400 hover:text-white bg-transparent"
            }`}
          >
            <Truck size={12} />
            EV Trucks
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 z-10">
        
        {/* Success/Error notifications */}
        <div className="lg:col-span-12">
          {errorMsg && (
            <div className="flex items-start gap-3 p-4 rounded-xl border border-rose-500/20 bg-rose-950/20 text-rose-300 text-sm animate-in fade-in slide-in-from-top-2">
              <AlertTriangle className="shrink-0 mt-0.5" size={18} />
              <div>
                <span className="font-bold">Error:</span> {errorMsg}
              </div>
            </div>
          )}
          {successMsg && (
            <div className="flex items-start gap-3 p-4 rounded-xl border border-emerald-500/20 bg-emerald-950/20 text-emerald-300 text-sm animate-in fade-in slide-in-from-top-2">
              <CheckCircle className="shrink-0 mt-0.5" size={18} />
              <div>
                <span className="font-bold">Success:</span> {successMsg}
              </div>
            </div>
          )}
        </div>

        {/* ==================== TAB 1: ROUTES MANAGER ==================== */}
        {activeTab === "ROUTES" && (
          <>
            {/* Left Col: Route Creator Panel */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur-xl p-6 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 blur-2xl rounded-full"></div>
                
                <h2 className="text-sm font-black text-white uppercase tracking-wider mb-6 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span>
                  {editingRouteId ? "Edit Route Profile" : "Create Fleet Route"}
                </h2>

                <form onSubmit={handleRouteSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Route Name</label>
                    <input 
                      type="text" 
                      value={routeName}
                      onChange={(e) => setRouteName(e.target.value)}
                      placeholder="e.g. Bangkok North Delivery Express"
                      className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 transition font-medium"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Assigned EV Truck</label>
                    <div className="relative">
                      <select 
                        value={selectedTruckId}
                        onChange={(e) => setSelectedTruckId(e.target.value)}
                        className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500/50 appearance-none font-medium"
                      >
                        <option value="">-- No Truck Assigned --</option>
                        {trucks.map(truck => (
                          <option key={truck.id} value={truck.id}>
                            {truck.name} {truck.driverName ? `(${truck.driverName})` : ""}
                          </option>
                        ))}
                      </select>
                      <Truck className="absolute right-4 top-3.5 text-slate-500 pointer-events-none" size={16} />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Itinerary Stations</label>
                      <span className="text-[10px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded-full font-bold">
                        {selectedStations.length} Selected
                      </span>
                    </div>

                    <div className="max-h-48 overflow-y-auto border border-white/5 bg-slate-950/60 rounded-xl p-3 space-y-1.5 scrollbar-thin">
                      {stations.map(station => {
                        const isChecked = selectedStations.includes(station.id);
                        return (
                          <div 
                            key={station.id}
                            onClick={() => handleStationToggle(station.id)}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border transition cursor-pointer select-none ${
                              isChecked 
                                ? "bg-cyan-500/5 border-cyan-500/30 text-white" 
                                : "bg-transparent border-transparent text-slate-400 hover:bg-white/5"
                            }`}
                          >
                            <div className={`w-4 h-4 rounded flex items-center justify-center border transition ${
                              isChecked ? "bg-cyan-500 border-cyan-500" : "border-slate-600 bg-slate-900"
                            }`}>
                              {isChecked && <Plus size={12} className="text-slate-950 font-bold" />}
                            </div>
                            <div className="flex-1">
                              <p className="text-xs font-bold leading-tight">{station.name}</p>
                              <p className="text-[9px] text-slate-500 font-semibold">{station.lat.toFixed(4)}, {station.lng.toFixed(4)}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {selectedStations.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Itinerary Sequence</p>
                        <div className="space-y-1.5 font-medium text-xs">
                          {selectedStations.map((id, index) => {
                            const s = stations.find(st => st.id === id);
                            if (!s) return null;
                            const isOrigin = index === 0;
                            const isDest = index === selectedStations.length - 1;

                            return (
                              <div 
                                key={id}
                                className="flex items-center justify-between px-3 py-2 bg-slate-950 border border-white/5 rounded-lg"
                              >
                                <div className="flex items-center gap-2">
                                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black ${
                                    isOrigin 
                                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                                      : isDest 
                                      ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                                      : "bg-slate-800 text-slate-400"
                                  }`}>
                                    {index + 1}
                                  </span>
                                  <span className="font-bold text-slate-300">{s.name}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <button 
                                    type="button"
                                    onClick={() => moveStation(index, "up")}
                                    disabled={isOrigin}
                                    className="p-1 hover:bg-white/5 rounded text-slate-500 hover:text-white transition disabled:opacity-30"
                                  >
                                    <MoveUp size={12} />
                                  </button>
                                  <button 
                                    type="button"
                                    onClick={() => moveStation(index, "down")}
                                    disabled={isDest}
                                    className="p-1 hover:bg-white/5 rounded text-slate-500 hover:text-white transition disabled:opacity-30"
                                  >
                                    <MoveDown size={12} />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 active:scale-95 text-slate-950 font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-50 shadow-lg shadow-cyan-950/20"
                    >
                      <Save size={14} />
                      {saving ? "Saving Route..." : editingRouteId ? "Save Route Updates" : "Generate Route"}
                    </button>
                    {editingRouteId && (
                      <button
                        type="button"
                        onClick={resetRouteForm}
                        className="px-4 py-3 bg-white/5 border border-white/10 hover:bg-white/10 active:scale-95 text-xs font-bold text-slate-300 hover:text-white rounded-xl transition"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>

            {/* Right Col: Route Cards Grid */}
            <div className="lg:col-span-7 space-y-6">
              <div className="rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur-xl p-6 shadow-2xl">
                <h2 className="text-sm font-black text-white uppercase tracking-wider mb-6 flex items-center gap-2">
                  <MapPin size={16} className="text-cyan-500" />
                  Routes Registry ({routes.length})
                </h2>

                {loading ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-500 text-sm">
                    <RefreshCw size={24} className="animate-spin text-cyan-500" />
                    Querying routes registry...
                  </div>
                ) : routes.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center text-slate-500 border border-dashed border-white/10 rounded-2xl animate-in fade-in-50">
                    <MapPin size={32} className="text-slate-700 mb-2" />
                    <p className="font-bold text-slate-400">No Routes Found</p>
                    <p className="text-xs text-slate-600 mt-1 max-w-xs">Create a new delivery path itinerary using the generator on the left.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {routes.map(route => {
                      const isDispatching = dispatchingId === route.id;
                      const isDispatched = dispatchedId === route.id;
                      
                      return (
                        <div 
                          key={route.id}
                          className="group relative rounded-xl border border-white/10 bg-slate-950/60 p-5 hover:bg-slate-950 hover:border-white/20 transition duration-300"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h3 className="font-black text-sm text-white group-hover:text-cyan-400 transition leading-tight mb-2 uppercase tracking-wide">
                                {route.name}
                              </h3>
                              <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-400 font-semibold">
                                <span className="flex items-center gap-1 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
                                  <Truck size={10} className="text-cyan-500" />
                                  {route.truck_name ? (
                                    <span className="text-slate-200">Truck: {route.truck_name}</span>
                                  ) : (
                                    <span className="text-slate-500 italic">No Truck Assigned</span>
                                  )}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleRouteDispatch(route.id)}
                                disabled={!route.truck_id || isDispatching}
                                className={`flex items-center gap-1 px-3 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition ${
                                  isDispatched
                                    ? "bg-emerald-500 text-slate-950 border border-emerald-500"
                                    : isDispatching
                                    ? "bg-white/5 border border-white/10 text-slate-500"
                                    : !route.truck_id
                                    ? "bg-white/5 border border-white/5 text-slate-600 cursor-not-allowed opacity-50"
                                    : "bg-cyan-500/10 text-cyan-400 border border-cyan-500/25 hover:bg-cyan-500 hover:text-slate-950"
                                }`}
                                title={!route.truck_id ? "Assign a truck to enable dispatching" : "Send waypoints update to assigned truck"}
                              >
                                {isDispatched ? (
                                  <>
                                    <CheckCircle size={10} />
                                    Dispatched!
                                  </>
                                ) : isDispatching ? (
                                  <>
                                    <RefreshCw size={10} className="animate-spin" />
                                    Sending...
                                  </>
                                ) : (
                                  <>
                                    <Send size={10} />
                                    Dispatch
                                  </>
                                )}
                              </button>

                              <button
                                onClick={() => handleRouteEdit(route)}
                                className="p-2 bg-white/5 border border-white/5 hover:border-white/15 hover:bg-white/10 text-slate-300 hover:text-white rounded-lg transition"
                                title="Edit Route"
                              >
                                <Edit size={12} />
                              </button>
                              <button
                                onClick={() => handleRouteDelete(route.id)}
                                className="p-2 bg-rose-500/10 border border-rose-500/10 hover:border-rose-500/30 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 rounded-lg transition"
                                title="Delete Route"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>

                          <div className="mt-4 pt-4 border-t border-white/5">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2.5">Route Stations Array ({route.stations.length})</p>
                            
                            <div className="flex flex-wrap items-center gap-y-2">
                              {route.stations.map((stationId, idx) => {
                                const isLast = idx === route.stations.length - 1;
                                const s = stations.find(st => st.id === stationId);
                                return (
                                  <div key={stationId} className="flex items-center gap-1.5 text-xs">
                                    <span className={`px-2 py-1 rounded font-bold text-[10px] ${
                                      idx === 0 
                                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                        : isLast 
                                        ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                                        : "bg-slate-800 text-slate-300"
                                    }`}>
                                      {s ? s.name : stationId}
                                    </span>
                                    {!isLast && (
                                      <span className="text-slate-600 font-bold px-0.5">→</span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* ==================== TAB 2: STATIONS MANAGER ==================== */}
        {activeTab === "STATIONS" && (
          <>
            <div className="lg:col-span-5">
              <div className="rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur-xl p-6 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 blur-2xl rounded-full"></div>
                
                <h2 className="text-sm font-black text-white uppercase tracking-wider mb-6 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span>
                  {editingStationId ? "Edit Charging Station" : "Create Charging Station"}
                </h2>

                <form onSubmit={handleStationSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Station ID</label>
                    <input 
                      type="text" 
                      value={stationId}
                      onChange={(e) => setStationId(e.target.value)}
                      disabled={!!editingStationId}
                      placeholder="e.g. station-bkk-011"
                      className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 disabled:opacity-40 transition font-medium"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Station Name</label>
                    <input 
                      type="text" 
                      value={stationName}
                      onChange={(e) => setStationName(e.target.value)}
                      placeholder="e.g. Silom Central Charging Hub"
                      className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 transition font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Latitude</label>
                      <input 
                        type="number" 
                        step="0.000001"
                        value={stationLat}
                        onChange={(e) => setStationLat(e.target.value)}
                        placeholder="13.7462"
                        className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 transition font-medium"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Longitude</label>
                      <input 
                        type="number" 
                        step="0.000001"
                        value={stationLng}
                        onChange={(e) => setStationLng(e.target.value)}
                        placeholder="100.5347"
                        className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 transition font-medium"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Power Charging Limit</label>
                    <input 
                      type="text" 
                      value={stationPowerLimit}
                      onChange={(e) => setStationPowerLimit(e.target.value)}
                      placeholder="e.g. 150kW, 350kW"
                      className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 transition font-medium"
                    />
                  </div>

                  {editingStationId && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Station Status</label>
                        <select
                          value={stationStatus}
                          onChange={(e) => setStationStatus(e.target.value)}
                          className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500/50 font-medium"
                        >
                          <option value="Available">Available</option>
                          <option value="Charging">Charging</option>
                          <option value="Reserved">Reserved</option>
                          <option value="Faulted">Faulted</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Socket Status</label>
                        <select
                          value={stationSocketStatus}
                          onChange={(e) => setStationSocketStatus(e.target.value)}
                          className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500/50 font-medium"
                        >
                          <option value="Available">Available</option>
                          <option value="Occupied">Occupied</option>
                          <option value="Reserved">Reserved</option>
                          <option value="Out of Service">Out of Service</option>
                        </select>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 active:scale-95 text-slate-950 font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-50 shadow-lg shadow-cyan-950/20"
                    >
                      <Save size={14} />
                      {saving ? "Saving Station..." : editingStationId ? "Save Station Details" : "Create Station"}
                    </button>
                    {editingStationId && (
                      <button
                        type="button"
                        onClick={resetStationForm}
                        className="px-4 py-3 bg-white/5 border border-white/10 hover:bg-white/10 active:scale-95 text-xs font-bold text-slate-300 hover:text-white rounded-xl transition"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-6">
              <div className="rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur-xl p-6 shadow-2xl">
                <h2 className="text-sm font-black text-white uppercase tracking-wider mb-6 flex items-center gap-2">
                  <BatteryCharging size={16} className="text-cyan-500" />
                  Charging Stations Registry ({stations.length})
                </h2>

                {loading ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-500 text-sm">
                    <RefreshCw size={24} className="animate-spin text-cyan-500" />
                    Querying stations registry...
                  </div>
                ) : stations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center text-slate-500 border border-dashed border-white/10 rounded-2xl">
                    <BatteryCharging size={32} className="text-slate-700 mb-2" />
                    <p className="font-bold text-slate-400">No Stations Found</p>
                    <p className="text-xs text-slate-600 mt-1 max-w-xs">Create a new OCPP charging node using the panel on the left.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-white/10 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                          <th className="pb-3 pl-2">ID</th>
                          <th className="pb-3">Name</th>
                          <th className="pb-3 text-center">Power</th>
                          <th className="pb-3 text-center">Coordinates</th>
                          <th className="pb-3 text-right pr-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-xs">
                        {stations.map(station => (
                          <tr key={station.id} className="hover:bg-white/[0.02] transition">
                            <td className="py-3 pl-2 font-mono text-[10px] text-cyan-500">{station.id}</td>
                            <td className="py-3 font-bold text-slate-200">
                              {station.name}
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className={`text-[7px] font-black px-1 rounded-sm uppercase tracking-wide ${
                                  station.status === "Available" 
                                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                    : station.status === "Charging"
                                    ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                                    : "bg-slate-800 text-slate-500 border border-white/5"
                                }`}>
                                  {station.status}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 text-center font-bold text-slate-400">{station.powerLimit}</td>
                            <td className="py-3 text-center font-mono text-[9px] text-slate-500">
                              {station.lat.toFixed(4)}, {station.lng.toFixed(4)}
                            </td>
                            <td className="py-3 text-right pr-2">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleStationEdit(station)}
                                  className="p-1.5 bg-white/5 border border-white/5 hover:border-white/15 hover:bg-white/10 text-slate-300 hover:text-white rounded-md transition"
                                  title="Edit Station"
                                >
                                  <Edit size={10} />
                                </button>
                                <button
                                  onClick={() => handleStationDelete(station.id)}
                                  className="p-1.5 bg-rose-500/10 border border-rose-500/10 hover:border-rose-500/30 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 rounded-md transition"
                                  title="Delete Station"
                                >
                                  <Trash2 size={10} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* ==================== TAB 3: TRUCKS MANAGER ==================== */}
        {activeTab === "TRUCKS" && (
          <>
            {/* Left Col: Truck Creator Panel */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur-xl p-6 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 blur-2xl rounded-full"></div>
                
                <h2 className="text-sm font-black text-white uppercase tracking-wider mb-6 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span>
                  {editingTruckId ? "Edit EV Truck details" : "Create EV Truck"}
                </h2>

                <form onSubmit={handleTruckSubmit} className="space-y-4">
                  {/* Truck ID (Primary Key) */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Truck ID</label>
                    <input 
                      type="text" 
                      value={truckId}
                      onChange={(e) => setTruckId(e.target.value)}
                      disabled={!!editingTruckId}
                      placeholder="e.g. truck-007"
                      className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 disabled:opacity-40 transition font-medium"
                    />
                  </div>

                  {/* Truck Name */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Truck Name</label>
                    <input 
                      type="text" 
                      value={truckName}
                      onChange={(e) => setTruckName(e.target.value)}
                      placeholder="e.g. BKK-Swift-07"
                      className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 transition font-medium"
                    />
                  </div>

                  {/* Driver Name */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Driver Name</label>
                    <input 
                      type="text" 
                      value={truckDriverName}
                      onChange={(e) => setTruckDriverName(e.target.value)}
                      placeholder="e.g. Nattapong K."
                      className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 transition font-medium"
                    />
                  </div>

                  {/* Lat / Lng coordinates */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Latitude</label>
                      <input 
                        type="number" 
                        step="0.000001"
                        value={truckLat}
                        onChange={(e) => setTruckLat(e.target.value)}
                        placeholder="13.7462"
                        className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 transition font-medium"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Longitude</label>
                      <input 
                        type="number" 
                        step="0.000001"
                        value={truckLng}
                        onChange={(e) => setTruckLng(e.target.value)}
                        placeholder="100.5347"
                        className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 transition font-medium"
                      />
                    </div>
                  </div>

                  {/* Truck Status */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Operational Status</label>
                    <select
                      value={truckStatus}
                      onChange={(e) => setTruckStatus(e.target.value)}
                      className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500/50 font-medium"
                    >
                      <option value="Offline">Offline</option>
                      <option value="Idle">Idle</option>
                      <option value="Loading">Loading</option>
                      <option value="En Route">En Route</option>
                      <option value="Returning">Returning</option>
                      <option value="Maintenance">Maintenance</option>
                    </select>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 active:scale-95 text-slate-950 font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-50 shadow-lg shadow-cyan-950/20"
                    >
                      <Save size={14} />
                      {saving ? "Saving Truck..." : editingTruckId ? "Save Truck Details" : "Create EV Truck"}
                    </button>
                    {editingTruckId && (
                      <button
                        type="button"
                        onClick={resetTruckForm}
                        className="px-4 py-3 bg-white/5 border border-white/10 hover:bg-white/10 active:scale-95 text-xs font-bold text-slate-300 hover:text-white rounded-xl transition"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>

            {/* Right Col: Trucks Registry list table */}
            <div className="lg:col-span-7 space-y-6">
              <div className="rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur-xl p-6 shadow-2xl">
                <h2 className="text-sm font-black text-white uppercase tracking-wider mb-6 flex items-center gap-2">
                  <Truck size={16} className="text-cyan-500" />
                  EV Fleet Trucks Registry ({trucks.length})
                </h2>

                {loading ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-500 text-sm">
                    <RefreshCw size={24} className="animate-spin text-cyan-500" />
                    Querying trucks registry...
                  </div>
                ) : trucks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center text-slate-500 border border-dashed border-white/10 rounded-2xl">
                    <Truck size={32} className="text-slate-700 mb-2" />
                    <p className="font-bold text-slate-400">No Vehicles Registered</p>
                    <p className="text-xs text-slate-600 mt-1 max-w-xs">Use the panel on the left to add a new EV Truck to your fleet tracker.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-white/10 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                          <th className="pb-3 pl-2">ID</th>
                          <th className="pb-3">Name / Driver</th>
                          <th className="pb-3 text-center">Status</th>
                          <th className="pb-3 text-center">Coordinates</th>
                          <th className="pb-3 text-right pr-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-xs font-semibold">
                        {trucks.map(truck => (
                          <tr key={truck.id} className="hover:bg-white/[0.02] transition">
                            <td className="py-3 pl-2 font-mono text-[10px] text-cyan-500">{truck.id}</td>
                            <td className="py-3">
                              <p className="font-bold text-slate-200 leading-tight">{truck.name}</p>
                              <p className="text-[9px] text-slate-500 font-medium">Driver: {truck.driverName || "Unassigned"}</p>
                            </td>
                            <td className="py-3 text-center">
                              <span className={`text-[7px] font-black px-1.5 py-0.5 rounded uppercase ${statusBg(truck.status)}`}>
                                {truck.status}
                              </span>
                            </td>
                            <td className="py-3 text-center font-mono text-[9px] text-slate-500">
                              {truck.lat.toFixed(4)}, {truck.lng.toFixed(4)}
                            </td>
                            <td className="py-3 text-right pr-2">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleTruckEdit(truck)}
                                  className="p-1.5 bg-white/5 border border-white/5 hover:border-white/15 hover:bg-white/10 text-slate-300 hover:text-white rounded-md transition"
                                  title="Edit Truck"
                                >
                                  <Edit size={10} />
                                </button>
                                <button
                                  onClick={() => handleTruckDelete(truck.id)}
                                  className="p-1.5 bg-rose-500/10 border border-rose-500/10 hover:border-rose-500/30 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 rounded-md transition"
                                  title="Delete Truck"
                                >
                                  <Trash2 size={10} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
