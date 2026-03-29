"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { MapViewport } from "@/components/remote-control/map-viewport";
import { ControlOverlay } from "@/components/remote-control/control-overlay";
import { FacilitiesOverlay } from "@/components/remote-control/facilities-overlay";
import { FleetOverlay } from "@/components/remote-control/fleet-overlay";
import { NodesTableView } from "@/components/remote-control/nodes-table-view";
import { FacilitiesTableView } from "@/components/remote-control/facilities-table-view";
import { FleetTableView } from "@/components/remote-control/fleet-table-view";
import type { Station, Facility, Truck, DomainType, LayerVisibility } from "./types";
import {
  LayoutDashboard,
  User,
  MapPin,
  Maximize,
  Minimize,
  Zap,
  Battery,
  Flame,
  Building2,
  Truck as TruckIcon,
  Package,
  Eye,
  EyeOff,
} from "lucide-react";

// Re-export Station for backward compatibility
export type { Station } from "./types";

export default function RemoteControlPage() {
  // --- Shared State ---
  const [loading, setLoading] = useState(true);
  const [apiUrl, setApiUrl] = useState<string>("");
  const [isApiHealthy, setIsApiHealthy] = useState<boolean>(true);
  const [showSidebar, setShowSidebar] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [sidebarWidth, setSidebarWidth] = useState<number>(320); // Desktop sidebar width (minimized by default)
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  // --- Domain / Layer State ---
  const [activeDomain, setActiveDomain] = useState<DomainType>("EV");
  const layers: LayerVisibility = { EV: activeDomain === "EV", FACILITIES: activeDomain === "FACILITIES", FLEET: activeDomain === "FLEET" };

  // --- EV State ---
  const [stations, setStations] = useState<Station[]>([]);
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null);
  const [evTab, setEvTab] = useState<"MAP" | "SETTINGS" | "NODES" | "LOGS">("MAP");

  // --- Facilities State ---
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [selectedFacilityId, setSelectedFacilityId] = useState<string | null>(null);
  const [facTab, setFacTab] = useState<"MAP" | "SETTINGS" | "LIST" | "LOGS">("MAP");

  // --- Fleet State ---
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [selectedTruckId, setSelectedTruckId] = useState<string | null>(null);
  const [fleetTab, setFleetTab] = useState<"MAP" | "SETTINGS" | "LIST" | "LOGS">("MAP");

  const mapRef = useRef<any>(null);

  // --- Load saved API URL ---
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("siam_ocpp_url");
    if (saved) {
      setApiUrl(saved);
    } else {
      // Automatic fallback to the production mock API deployed on the VPS
      setApiUrl("http://141.11.156.67:1880");
    }
  }, []);

  const handleUpdateSchedule = async (stationId: string, schedule: any) => {
    try {
      const response = await fetch("/api/ocpp/stations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stationId, schedule }),
      });
      
      if (!response.ok) throw new Error("Failed to update schedule via API");
      
      // Update local state by re-triggering station fetch or optimistic update
      setStations(prev => prev.map(s => s.id === stationId ? { ...s, schedule } : s));
    } catch (error) {
      console.error("API Update Error:", error);
    }
  };

  // --- EV Stats ---
  const evStats = useMemo(() => ({
    available: stations.filter((s) => s.status === "Available").length,
    charging: stations.filter((s) => s.status === "Charging").length,
    faulted: stations.filter((s) => s.status === "Faulted").length,
    totalEnergy: stations.reduce((acc, s) => acc + (s.currentMeter || 0), 0),
    totalPower: stations.reduce((acc, s) => acc + (s.powerOutput || 0), 0),
    totalCapacity: stations.reduce((acc, s) => acc + (s.powerLimit || 0), 0),
  }), [stations]);

  // --- Fetch EV Stations ---
  useEffect(() => {
    async function fetchStations() {
      try {
        const fetchUrl = apiUrl ? `/api/proxy?url=${encodeURIComponent(apiUrl)}` : "/api/ocpp/stations";
        const response = await fetch(fetchUrl);
        if (!response.ok) throw new Error("Failed to fetch stations");
        const data = await response.json();
        const mapped = data.map((s: any) => ({
          ...s,
          powerLimit: typeof s.powerLimit === "string" ? parseInt(s.powerLimit) || 0 : s.powerLimit || 0,
        }));
        setStations(mapped);
        setIsApiHealthy(true);
        if (!selectedStationId && mapped.length > 0) {
          const first = mapped.find((s: Station) => s.status === "Charging") || mapped[0];
          setSelectedStationId(first.id);
        }
      } catch (error) {
        console.error("OCPP API Error:", error);
        setIsApiHealthy(false);
      } finally {
        setLoading(false);
      }
    }
    fetchStations();
    const interval = setInterval(fetchStations, 5000);
    return () => clearInterval(interval);
  }, [apiUrl, selectedStationId]);

  // --- Fetch Facilities ---
  useEffect(() => {
    async function fetchFacilities() {
      try {
        const res = await fetch("/api/facilities");
        if (!res.ok) throw new Error("Failed to fetch facilities");
        const data = await res.json();
        setFacilities(data);
        if (!selectedFacilityId && data.length > 0) {
          setSelectedFacilityId(data[0].id);
        }
      } catch (error) {
        console.error("Facilities API Error:", error);
      }
    }
    fetchFacilities();
    const interval = setInterval(fetchFacilities, 5000);
    return () => clearInterval(interval);
  }, [selectedFacilityId]);

  // --- Fetch Fleet ---
  useEffect(() => {
    async function fetchFleet() {
      try {
        const res = await fetch("/api/fleet");
        if (!res.ok) throw new Error("Failed to fetch fleet");
        const data = await res.json();
        setTrucks(data);
        if (!selectedTruckId && data.length > 0) {
          const first = data.find((t: Truck) => t.status === "En Route") || data[0];
          setSelectedTruckId(first.id);
        }
      } catch (error) {
        console.error("Fleet API Error:", error);
      }
    }
    fetchFleet();
    const interval = setInterval(fetchFleet, 3000);
    return () => clearInterval(interval);
  }, [selectedTruckId]);

  // --- Fullscreen ---
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(console.error);
    } else {
      document.exitFullscreen?.();
    }
  };

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  // --- Resize Slider Logic ---
  const startResizing = React.useCallback((mouseDownEvent: React.MouseEvent) => {
    setIsResizing(true);
  }, []);

  const stopResizing = React.useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = React.useCallback(
    (mouseMoveEvent: MouseEvent) => {
      if (isResizing) {
        // Calculate bounds: [320px, 60% of screen (max 800px)]
        const minWidth = 320;
        const maxWidth = Math.min(800, window.innerWidth * 0.6);
        const newWidth = Math.min(Math.max(minWidth, mouseMoveEvent.clientX), maxWidth);
        setSidebarWidth(newWidth);
      }
    },
    [isResizing]
  );

  useEffect(() => {
    if (isResizing) {
      window.addEventListener("mousemove", resize);
      window.addEventListener("mouseup", stopResizing);
    } else {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    }
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [isResizing, resize, stopResizing]);

  // --- Map Resize Fix ---
  useEffect(() => {
    // Immediate sync on width change
    mapRef.current?.invalidateSize?.();
    
    // Fallback sync on initial mount to handle hydration/layout settles
    const timer = setTimeout(() => {
      mapRef.current?.invalidateSize?.();
    }, 500);
    
    return () => clearTimeout(timer);
  }, [sidebarWidth]);



  // --- Which table view to show ---
  const showingTable =
    (activeDomain === "EV" && evTab === "NODES") ||
    (activeDomain === "FACILITIES" && facTab === "LIST") ||
    (activeDomain === "FLEET" && fleetTab === "LIST");

  return (
    <div className={`relative h-screen w-full bg-[#061114] font-inter text-white overflow-hidden flex flex-col md:flex-row antialiased ${isResizing ? "cursor-col-resize select-none" : ""}`}>
      {/* === Sidebar === */}
      <div 
        className={`${showSidebar ? "flex w-full absolute bg-[#061114]/95" : "hidden"} md:flex md:relative h-full z-[2000] md:z-10 overflow-hidden border-r border-white/5 shadow-22xl md:w-[320px] flex-none`}
        style={mounted && typeof window !== 'undefined' && window.innerWidth >= 768 ? { 
          width: `${sidebarWidth}px`,
          minWidth: `${sidebarWidth}px`,
          maxWidth: `${sidebarWidth}px`,
          flex: `0 0 ${sidebarWidth}px`
        } : {}}
      >
        {activeDomain === "FACILITIES" ? (
          <FacilitiesOverlay
            facilities={facilities}
            selectedFacilityId={selectedFacilityId}
            onFacilityClick={setSelectedFacilityId}
            activeTab={facTab}
            setActiveTab={setFacTab}
            isApiHealthy={isApiHealthy}
            onClose={() => setShowSidebar(false)}
          />
        ) : activeDomain === "FLEET" ? (
          <FleetOverlay
            trucks={trucks}
            selectedTruckId={selectedTruckId}
            onTruckClick={setSelectedTruckId}
            activeTab={fleetTab}
            setActiveTab={setFleetTab}
            isApiHealthy={isApiHealthy}
            onClose={() => setShowSidebar(false)}
          />
        ) : (
          <ControlOverlay
            stations={stations}
            selectedStationId={selectedStationId}
            activeTab={evTab}
            setActiveTab={setEvTab}
            apiUrl={apiUrl}
            setApiUrl={setApiUrl}
            isApiHealthy={isApiHealthy}
            stats={evStats}
            onStationClick={setSelectedStationId}
            onUpdateSchedule={handleUpdateSchedule}
            onClose={() => setShowSidebar(false)}
          />
        )}
      </div>

      {/* === Resize Handle === */}
      <div
        onMouseDown={startResizing}
        className="hidden md:block absolute top-0 bottom-0 z-[1002] cursor-col-resize group"
        style={{ left: mounted ? `${sidebarWidth - 4}px` : "316px", width: "8px" }}
      >
        <div className="w-full h-full flex items-center justify-center transition-colors group-hover:bg-siam-green/20">
          <div className="w-[1px] h-32 bg-white/10 group-hover:bg-siam-green/50 transition-colors" />
        </div>
      </div>

      {/* === Main View === */}
      <div className={`flex-1 relative h-full w-full ${isResizing ? "pointer-events-none" : ""}`}>
        {/* Top Header */}
        <header className="absolute top-0 left-0 right-0 p-4 md:p-6 flex items-center justify-between md:justify-end gap-3 md:gap-4 z-[1001] pointer-events-none">
          <button
            onClick={() => setShowSidebar(true)}
            className="md:hidden glass w-11 h-11 rounded-2xl flex items-center justify-center pointer-events-auto border border-white/10 active:scale-90"
          >
            <LayoutDashboard size={18} className="text-siam-green" />
          </button>

          <div className="flex items-center gap-2 md:gap-4">
            {/* Mobile logo */}
            <div className="flex md:hidden animate-in fade-in duration-700 pointer-events-auto items-center mr-auto">
              <div className="bg-white rounded-lg shadow-sm border border-white/10 h-7 w-7 overflow-hidden">
                <img src="/assets/siamev_logo.jpg" alt="SIAM EV" className="w-[180%] max-w-none h-full object-cover object-left" />
              </div>
            </div>

            {/* === Domain Switcher === */}
            <div className="glass h-10 md:h-11 rounded-2xl flex items-center pointer-events-auto border border-white/10 shadow-2xl overflow-hidden">
              <DomainButton icon={<Zap size={14} />} label="EV" active={activeDomain === "EV"} color="text-siam-green" onClick={() => setActiveDomain("EV")} />
              <div className="w-px h-5 bg-white/10" />
              <DomainButton icon={<Building2 size={14} />} label="Facilities" active={activeDomain === "FACILITIES"} color="text-amber-400" onClick={() => setActiveDomain("FACILITIES")} />
              <div className="w-px h-5 bg-white/10" />
              <DomainButton icon={<TruckIcon size={14} />} label="Fleet" active={activeDomain === "FLEET"} color="text-cyan-400" onClick={() => setActiveDomain("FLEET")} />
            </div>



            <div className="glass h-10 md:h-11 px-4 md:px-6 rounded-2xl flex items-center gap-2 md:gap-3 pointer-events-auto border border-white/10 shadow-2xl">
              <MapPin size={14} className="text-siam-green" />
              <span className="text-[10px] md:text-xs font-bold text-white tracking-wide">BKK HUB</span>
            </div>

            <button
              onClick={toggleFullscreen}
              className="hidden md:flex glass w-11 h-11 rounded-2xl items-center justify-center pointer-events-auto border border-white/10 hover:bg-white/10 transition-all active:scale-95"
            >
              {isFullscreen ? <Minimize size={18} className="text-siam-green" /> : <Maximize size={18} className="text-white/80" />}
            </button>

            <button className="glass w-10 md:w-11 h-10 md:h-11 rounded-xl flex items-center justify-center pointer-events-auto border border-white/10 overflow-hidden hover:scale-105 transition-transform active:scale-90">
              <div className="w-full h-full bg-gradient-to-br from-siam-green/20 to-siam-blue/20 flex items-center justify-center">
                <User size={18} className="text-white" />
              </div>
            </button>
          </div>
        </header>

        {/* === Content View (Map or Table) === */}
        {showingTable ? (
          activeDomain === "EV" ? (
            <NodesTableView
              stations={stations}
              selectedStationId={selectedStationId}
              onStationClick={(id) => { setSelectedStationId(id); setEvTab("MAP"); }}
            />
          ) : activeDomain === "FACILITIES" ? (
            <FacilitiesTableView
              facilities={facilities}
              selectedFacilityId={selectedFacilityId}
              onFacilityClick={(id) => { setSelectedFacilityId(id); setFacTab("MAP"); }}
            />
          ) : (
            <FleetTableView
              trucks={trucks}
              selectedTruckId={selectedTruckId}
              onTruckClick={(id) => { setSelectedTruckId(id); setFleetTab("MAP"); }}
            />
          )
        ) : (
          <MapViewport
            ref={mapRef}
            stations={stations}
            facilities={facilities}
            trucks={trucks}
            layers={layers}
            loading={loading}
            selectedStationId={selectedStationId}
            selectedFacilityId={selectedFacilityId}
            selectedTruckId={selectedTruckId}
            onStationClick={setSelectedStationId}
            onFacilityClick={setSelectedFacilityId}
            onTruckClick={setSelectedTruckId}
          />
        )}

        {/* Floating Global Overview (Desktop & Mobile) */}
        <div className={`absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] lg:w-auto z-[1001] pointer-events-none transition-all duration-500 ease-in-out ${showSidebar ? "lg:translate-y-0 lg:opacity-100 translate-y-20 opacity-0" : "translate-y-0 opacity-100"}`}>
          <div className="glass px-6 py-4 md:py-5 rounded-3xl border border-white/10 shadow-[0_10px_50px_rgba(0,0,0,0.8)] flex items-center justify-between md:justify-center gap-4 md:gap-14 pointer-events-auto backdrop-blur-2xl bg-[#061114]/90">
            {activeDomain === "EV" ? (
              <>
                <GlobalStat label="Net Energy" value={`${evStats.totalEnergy.toFixed(1)}`} unit="kWh" icon={<Battery size={16} className="text-siam-green" />} />
                <div className="w-px h-8 md:h-10 bg-white/10" />
                <GlobalStat label="Max Capacity" value={`${evStats.totalCapacity}`} unit="kW" icon={<Zap size={16} className="text-blue-400" />} />
                <div className="w-px h-8 md:h-10 bg-white/10" />
                <GlobalStat label="Live Output" value={`${evStats.totalPower.toFixed(1)}`} unit="kW" icon={<Flame size={16} className="text-siam-green animate-pulse" />} color="text-siam-green" />
              </>
            ) : activeDomain === "FACILITIES" ? (
              <>
                <GlobalStat label="Sites Online" value={`${facilities.length}`} icon={<Building2 size={16} className="text-amber-400" />} />
                <div className="w-px h-8 md:h-10 bg-white/10" />
                <GlobalStat label="Power Draw" value={`${facilities.reduce((a, f) => a + f.currentPower, 0).toFixed(0)}`} unit="kW" icon={<Zap size={16} className="text-amber-400 animate-pulse" />} color="text-amber-400" />
                <div className="w-px h-8 md:h-10 bg-white/10" />
                <GlobalStat label="Active Zones" value={`${facilities.reduce((a, f) => a + f.zones.length, 0)}`} icon={<Building2 size={16} className="text-white/40" />} />
              </>
            ) : (
              <>
                <GlobalStat label="Active Fleet" value={`${trucks.filter((t) => t.status === "En Route" || t.status === "Returning").length}`} icon={<TruckIcon size={16} className="text-cyan-400" />} />
                <div className="w-px h-8 md:h-10 bg-white/10" />
                <GlobalStat label="Moving Parcels" value={`${trucks.reduce((a, t) => a + t.parcelsLoaded, 0)}`} unit="pcs" icon={<Package size={16} className="text-cyan-400 animate-pulse" />} color="text-cyan-400" />
                <div className="w-px h-8 md:h-10 bg-white/10" />
                <GlobalStat label="Free Slots" value={`${trucks.reduce((a, t) => a + t.parcelsAvailable, 0)}`} unit="slots" icon={<Package size={16} className="text-white/40" />} />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Sub-Components ---

function DomainButton({ icon, label, active, color, onClick }: { icon: React.ReactNode; label: string; active: boolean; color: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 md:px-4 py-2 transition-all duration-300 text-[9px] md:text-[10px] font-black uppercase tracking-widest ${
        active ? `${color} bg-white/10` : "text-white/30 hover:text-white/60 hover:bg-white/5"
      }`}
    >
      <span className={active ? color : "text-white/20"}>{icon}</span>
      <span className="hidden md:inline">{label}</span>
    </button>
  );
}



function GlobalStat({ label, value, unit, icon, color }: { label: string; value: string; unit?: string; icon: React.ReactNode; color?: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-[8px] md:text-[9px] font-black text-white/40 uppercase tracking-[0.2em] mb-1 md:mb-1.5">{label}</span>
      <div className="flex items-center gap-1.5">
        {icon}
        <span className={`text-sm md:text-xl font-black ${color || "text-white"} tracking-tight leading-none`}>
          {value} {unit && <span className="text-[9px] md:text-xs opacity-40 font-bold ml-0.5 tracking-wider">{unit}</span>}
        </span>
      </div>
    </div>
  );
}
