"use client";

import React, { useState, useEffect, useRef } from "react";
import { MapViewport } from "@/components/remote-control/map-viewport";
import { ControlOverlay } from "@/components/remote-control/control-overlay";
import { Bell, User, MapPin } from "lucide-react";

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
  
  // Reference to Map component to call zoom/center methods
  const mapRef = useRef<any>(null);

  useEffect(() => {
    async function fetchStations() {
      try {
        const response = await fetch("/api/ocpp/stations");
        if (!response.ok) throw new Error("Failed to fetch stations");
        const data = await response.json();
        setStations(data);
        
        // Auto-select the first charging station if none selected
        if (!selectedStationId && data.length > 0) {
          const firstCharging = data.find((s: Station) => s.status === "Charging");
          setSelectedStationId(firstCharging ? firstCharging.id : data[0].id);
        }
      } catch (error) {
        console.error("OCPP API Error:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStations();

    const interval = setInterval(fetchStations, 5000); 
    return () => clearInterval(interval);
  }, [selectedStationId]);

  return (
    <div className="relative h-screen w-full bg-[#061114] font-inter text-arb-on-bg overflow-hidden flex antialiased">
      {/* Sidebar: Operational Hub Panel */}
      <ControlOverlay 
        stations={stations} 
        selectedStationId={selectedStationId} 
      />

      {/* Main View Area */}
      <div className="flex-1 relative h-full">
        {/* Top Floating Header */}
        <header className="absolute top-0 right-0 p-6 flex items-center gap-4 z-[1001] pointer-events-none">
          <div className="glass h-11 px-6 rounded-2xl flex items-center gap-3 pointer-events-auto border border-white/10 shadow-2xl">
            <MapPin size={16} className="text-arb-primary" />
            <span className="text-xs font-bold text-white tracking-wide">Bangkok, Thailand</span>
          </div>
          
          <button className="glass w-11 h-11 rounded-2xl flex items-center justify-center pointer-events-auto border border-white/10 hover:bg-white/10 transition-all active:scale-95">
            <Bell size={18} className="text-white/80" />
          </button>
          
          <button className="glass w-11 h-11 rounded-xl flex items-center justify-center pointer-events-auto border border-white/10 overflow-hidden hover:scale-105 transition-transform active:scale-90">
            <div className="w-full h-full bg-gradient-to-br from-arb-primary/20 to-arb-secondary/20 flex items-center justify-center">
              <User size={18} className="text-white" />
            </div>
          </button>
        </header>

        {/* The Map Component */}
        <MapViewport 
          ref={mapRef}
          stations={stations} 
          loading={loading} 
          selectedStationId={selectedStationId}
          onStationClick={(id) => setSelectedStationId(id)}
        />

        {/* Map Controls (Floating) */}
        <div className="absolute bottom-8 right-8 flex flex-col gap-2 z-[1001] pointer-events-auto">
          <MapControlBtn label="+" onClick={() => mapRef.current?.zoomIn()} />
          <MapControlBtn label="−" onClick={() => mapRef.current?.zoomOut()} />
          <div className="mt-4 shadow-2xl">
            <button 
              onClick={() => mapRef.current?.centerMap()}
              className="glass w-12 h-12 rounded-full flex items-center justify-center border border-white/10 hover:bg-white/10 transition-all shadow-[0_0_20px_rgba(0,0,0,0.5)] active:scale-90 group"
            >
              <MapPin size={20} className="text-arb-primary group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>
      </div>
      
      <style jsx global>{`
        .text-high-contrast {
          color: rgba(255, 255, 255, 0.9) !important;
        }
        .label-high-contrast {
          color: rgba(255, 255, 255, 0.6) !important;
          font-weight: 700 !important;
        }
      `}</style>
    </div>
  );
}

function MapControlBtn({ label, onClick }: { label: string, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="glass w-10 h-10 rounded-xl flex items-center justify-center text-xl font-bold text-white/80 hover:text-white border border-white/10 hover:bg-white/10 transition-all shadow-xl active:scale-90"
    >
      {label}
    </button>
  );
}
