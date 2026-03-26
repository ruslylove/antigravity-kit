"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { MapViewport } from "@/components/remote-control/map-viewport";
import { ControlOverlay } from "@/components/remote-control/control-overlay";
import { NodesTableView } from "@/components/remote-control/nodes-table-view";
import { 
  LayoutDashboard, 
  User, 
  MapPin, 
  Settings as SettingsIcon, 
  Map as MapIcon, 
  HardDrive, 
  History, 
  Maximize, 
  Minimize,
  Zap,
  Battery,
  Flame
} from "lucide-react";

export interface Station {
  id: string;
  name: string;
  lat: number;
  lng: number;
  status: "Available" | "Charging" | "Faulted" | string;
  powerLimit: string;
  socketStatus?: string;
  currentMeter?: number;
  powerOutput?: number;
}

export default function RemoteControlPage() {
  const [stations, setStations] = useState<Station[]>([]);
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"MAP" | "SETTINGS" | "NODES">("MAP");
  const [apiUrl, setApiUrl] = useState<string>("http://141.11.156.67:8080");
  const [isApiHealthy, setIsApiHealthy] = useState<boolean>(true);
  const [showSidebar, setShowSidebar] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  useEffect(() => {
    const saved = localStorage.getItem("siam_ocpp_url");
    if (saved) setApiUrl(saved);
  }, []);

  // Central Stats Calculation
  const stats = useMemo(() => {
    return {
      available: stations.filter(s => s.status === "Available").length,
      charging: stations.filter(s => s.status === "Charging").length,
      faulted: stations.filter(s => s.status === "Faulted").length,
      totalEnergy: stations.reduce((acc, s) => acc + (s.currentMeter || 0), 0),
      totalPower: stations.reduce((acc, s) => acc + (s.powerOutput || 0), 0),
      totalCapacity: stations.reduce((acc, s) => acc + parseInt(s.powerLimit || "0"), 0),
    }
  }, [stations]);
  
  // Reference to Map component to call zoom/center methods
  const mapRef = useRef<any>(null);

  useEffect(() => {
    async function fetchStations() {
      try {
        const fetchUrl = apiUrl ? `/api/proxy?url=${encodeURIComponent(apiUrl)}` : "/api/ocpp/stations";
        const response = await fetch(fetchUrl);
        if (!response.ok) throw new Error("Failed to fetch stations");
        const data = await response.json();
        setStations(data);
        setIsApiHealthy(true);
        
        // Auto-select the first charging station if none selected
        if (!selectedStationId && data.length > 0) {
          const firstCharging = data.find((s: Station) => s.status === "Charging" );
          setSelectedStationId(firstCharging ? firstCharging.id : data[0].id);
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

  // Fullscreen toggle logic
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  return (
    <div className="relative h-screen w-full bg-[#061114] font-inter text-white overflow-hidden flex flex-col md:flex-row antialiased">
      {/* Sidebar: Operational Hub Panel */}
      <div className={`${showSidebar ? 'flex' : 'hidden'} md:flex h-full w-full md:w-auto absolute md:relative z-[2000] md:z-10`}>
        <ControlOverlay 
          stations={stations} 
          selectedStationId={selectedStationId} 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          apiUrl={apiUrl}
          setApiUrl={setApiUrl}
          isApiHealthy={isApiHealthy}
          stats={stats}
          onStationClick={setSelectedStationId}
          onClose={() => setShowSidebar(false)}
        />
      </div>

      {/* Main View Area */}
      <div className="flex-1 relative h-full w-full">
        {/* Top Floating Header */}
        <header className="absolute top-0 left-0 right-0 p-4 md:p-6 flex items-center justify-between md:justify-end gap-3 md:gap-4 z-[1001] pointer-events-none">
          {/* Mobile Dashboard Toggle */}
          <button 
            onClick={() => setShowSidebar(true)}
            className="md:hidden glass w-11 h-11 rounded-2xl flex items-center justify-center pointer-events-auto border border-white/10 active:scale-90"
          >
            <LayoutDashboard size={18} className="text-siam-green" /> 
          </button>

          <div className="flex items-center gap-2 md:gap-4">
            {/* Mobile-only Hexagon Icon (Cropped) */}
            <div className="flex md:hidden animate-in fade-in duration-700 pointer-events-auto items-center mr-auto">
              <div className="bg-white rounded-lg shadow-sm border border-white/10 h-7 w-7 overflow-hidden">
                <img 
                  src="/assets/siamev_logo.jpg" 
                  alt="SIAM EV" 
                  className="w-[180%] max-w-none h-full object-cover object-left" 
                />
              </div>
            </div>
            
            <div className="glass h-10 md:h-11 px-4 md:px-6 rounded-2xl flex items-center gap-2 md:gap-3 pointer-events-auto border border-white/10 shadow-2xl">
              <MapPin size={14} className="text-siam-green" />
              <span className="text-[10px] md:text-xs font-bold text-white tracking-wide">BKK HUB</span>
            </div>
            
            <button className="hidden md:flex glass w-11 h-11 rounded-2xl items-center justify-center pointer-events-auto border border-white/10 hover:bg-white/10 transition-all active:scale-95">
              <LayoutDashboard size={18} className="text-white/80" />
            </button>
            
            <button 
              onClick={toggleFullscreen}
              className="hidden md:flex glass w-11 h-11 rounded-2xl items-center justify-center pointer-events-auto border border-white/10 hover:bg-white/10 transition-all active:scale-95"
              title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
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

        {/* The Map or Nodes Table Component */}
        {activeTab === "NODES" ? (
          <NodesTableView 
            stations={stations} 
            selectedStationId={selectedStationId} 
            onStationClick={(id) => {
              setSelectedStationId(id);
              setActiveTab("MAP");
            }} 
          />
        ) : (
          <MapViewport 
            ref={mapRef}
            stations={stations} 
            loading={loading} 
            selectedStationId={selectedStationId}
            onStationClick={setSelectedStationId}
          />
        )}

        {/* Mobile-only Floating Global Network Summary */}
        {!showSidebar && (
          <div className="md:hidden absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] z-[1001] pointer-events-none animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="glass p-4 rounded-2xl border border-white/10 shadow-2xl flex items-center justify-between pointer-events-auto backdrop-blur-xl bg-black/40">
              {/* Energy */}
              <div className="flex flex-col items-center">
                <span className="text-[7px] font-black text-white/40 uppercase tracking-[0.2em] mb-1">Energy Total</span>
                <div className="flex items-center gap-1">
                  <Battery size={10} className="text-siam-green" />
                  <span className="text-xs font-black text-white">{stats.totalEnergy.toFixed(1)} <span className="text-[8px] opacity-40">kWh</span></span>
                </div>
              </div>
              
              <div className="w-px h-6 bg-white/10"></div>

              {/* Capacity */}
              <div className="flex flex-col items-center">
                <span className="text-[7px] font-black text-white/40 uppercase tracking-[0.2em] mb-1">Capacity</span>
                <div className="flex items-center gap-1">
                  <Zap size={10} className="text-blue-400" />
                  <span className="text-xs font-black text-white">{stats.totalCapacity} <span className="text-[8px] opacity-40">kW</span></span>
                </div>
              </div>

              <div className="w-px h-6 bg-white/10"></div>

              {/* Live Power */}
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-1 mb-1">
                  <span className="text-[7px] font-black text-white/40 uppercase tracking-[0.2em]">Output</span>
                  <div className={`w-1 h-1 rounded-full ${isApiHealthy ? 'bg-siam-green animate-pulse' : 'bg-red-500'}`}></div>
                </div>
                <div className="flex items-center gap-1">
                  <Flame size={10} className="text-siam-green" />
                  <span className="text-xs font-black text-siam-green">{stats.totalPower.toFixed(1)} <span className="text-[8px] opacity-40">kW</span></span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
