"use client";

import React, { useMemo, useState } from "react";
import {
  Truck as TruckIcon,
  MapPin,
  Map as MapIcon,
  HardDrive,
  History,
  Settings,
  Navigation,
  Package,
  Clock,
  Gauge,
  X,
  MoreVertical,
  Activity,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  User,
} from "lucide-react";
import type { Truck } from "@/app/remote-control/types";

interface FleetOverlayProps {
  trucks: Truck[];
  selectedTruckId: string | null;
  onTruckClick?: (id: string | null) => void;
  activeTab: "MAP" | "SETTINGS" | "LIST" | "LOGS";
  setActiveTab: React.Dispatch<React.SetStateAction<"MAP" | "SETTINGS" | "LIST" | "LOGS">>;
  isApiHealthy: boolean;
  onClose?: () => void;
}

const LOAD_COLORS = ["text-white/30", "text-siam-green", "text-siam-green", "text-amber-400", "text-amber-400", "text-red-400"];
const LOAD_BG = ["bg-white/10", "bg-siam-green/20", "bg-siam-green/20", "bg-amber-400/20", "bg-amber-400/20", "bg-red-400/20"];
const LOAD_LABELS = ["Empty", "Light", "Medium", "Standard", "Heavy", "Full"];

export function FleetOverlay({
  trucks,
  selectedTruckId,
  onTruckClick,
  activeTab,
  setActiveTab,
  isApiHealthy,
  onClose,
}: FleetOverlayProps) {
  const selectedTruck = useMemo(
    () => trucks.find((t) => t.id === selectedTruckId) || null,
    [trucks, selectedTruckId]
  );

  const stats = useMemo(() => ({
    active: trucks.filter((t) => t.status === "En Route" || t.status === "Returning").length,
    loading: trucks.filter((t) => t.status === "Loading").length,
    idle: trucks.filter((t) => t.status === "Idle").length,
    maintenance: trucks.filter((t) => t.status === "Maintenance").length,
    totalParcels: trucks.reduce((acc, t) => acc + t.parcelsLoaded, 0),
    totalAvailable: trucks.reduce((acc, t) => acc + t.parcelsAvailable, 0),
  }), [trucks]);

  const statusColor = (status: string) => {
    switch (status) {
      case "En Route": return "text-[#3b82f6]";
      case "Returning": return "text-cyan-400";
      case "Loading": return "text-amber-400";
      case "Idle": return "text-siam-green";
      case "Maintenance": return "text-red-500";
      default: return "text-white/50";
    }
  };

  const statusBg = (status: string) => {
    switch (status) {
      case "En Route": return "bg-blue-500/20 text-blue-400";
      case "Returning": return "bg-cyan-400/20 text-cyan-400";
      case "Loading": return "bg-amber-400/20 text-amber-400";
      case "Idle": return "bg-siam-green/20 text-siam-green";
      case "Maintenance": return "bg-red-500/20 text-red-400";
      default: return "bg-white/10 text-white/40";
    }
  };

  return (
    <aside className="w-full md:w-[380px] h-full glass-sidebar flex flex-col pointer-events-auto p-6 md:p-8 z-[2000] border-r border-white/10 shadow-3xl overflow-y-auto no-scrollbar pb-12">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between mb-6">
        <button onClick={onClose} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-400 text-black font-black text-[10px] uppercase tracking-widest shadow-lg active:scale-95">
          <MapIcon size={14} />
          Back to Map
        </button>
        <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white active:scale-90">
          <X size={20} />
        </button>
      </div>

      {/* Brand Header */}
      <div className="mb-8 animate-in fade-in slide-in-from-left-4 duration-700">
        <div className="group relative overflow-hidden flex items-center justify-center bg-white p-2 rounded-xl shadow-lg border border-white/10 mb-2 h-16 transition-all duration-500 hover:shadow-[0_0_25px_rgba(27,69,143,0.3)] hover:border-siam-blue/40 cursor-default">
          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-siam-blue/10 to-transparent transform -skew-x-12 -translate-x-[200%] group-hover:translate-x-[200%] transition-transform duration-[1.2s] ease-in-out pointer-events-none z-20" />
          <img src="/assets/siamev_logo.jpg" alt="SIAM EV Corporate Logo" className="w-full h-full object-contain relative z-10 transition-transform duration-500 group-hover:scale-[1.03]" />
        </div>
        <p className="text-[10px] font-bold text-cyan-400/90 tracking-[0.2em] mt-1 ml-1 uppercase">Fleet Tracker</p>
      </div>



      {/* Content Area */}
      <section className="flex-1 space-y-5 overflow-y-auto no-scrollbar">
        {activeTab === "SETTINGS" ? (
          <div className="text-center py-12">
            <Settings size={32} className="mx-auto text-white/10 mb-4" />
            <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Fleet Settings</p>
            <p className="text-[9px] text-white/10 mt-2">Configure GPS polling, route optimization, alerts</p>
          </div>
        ) : activeTab === "LOGS" ? (
          <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex items-center gap-4 mb-2 opacity-80">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent to-white/20" />
              <span className="text-[9px] font-black tracking-[0.4em] text-white/50 uppercase">Fleet Log</span>
              <div className="flex-1 h-px bg-gradient-to-l from-transparent to-white/20" />
            </div>
            <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-2">
              {trucks.map((t) => (
                <div key={`log-${t.id}`} className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[8px] font-black text-white/30 uppercase tracking-widest">{t.name}</span>
                    <span className={`text-[7px] font-black px-1.5 py-0.5 rounded uppercase ${statusBg(t.status)}`}>{t.status}</span>
                  </div>
                  <div className="text-[9px] text-white/50 font-bold">
                    {t.status === "En Route" || t.status === "Returning"
                      ? `${t.route.origin.name} → ${t.route.destination.name} • ${t.speed} km/h • ETA ${t.route.eta}`
                      : t.status === "Loading"
                      ? `Loading at ${t.route.origin.name} — ${t.loadPercent}% capacity`
                      : t.status === "Idle"
                      ? `Parked at ${t.route.origin.name}`
                      : `Under maintenance`
                    }
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : activeTab === "LIST" ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex items-center gap-2 mb-2">
              <TruckIcon size={14} className="text-cyan-400" />
              <span className="text-[10px] font-black tracking-[0.3em] uppercase text-white/40">All Trucks</span>
            </div>
            <div className="space-y-3">
              {trucks.map((t) => (
                <button
                  key={t.id}
                  onClick={() => { onTruckClick?.(t.id); setActiveTab("MAP"); }}
                  className={`w-full text-left p-4 rounded-2xl glass-panel border transition-all active:scale-[0.98] ${selectedTruckId === t.id ? "border-cyan-400/40 bg-cyan-400/5" : "border-white/5 hover:bg-white/[0.04]"}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <User size={10} className="text-white/30" />
                      <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">{t.driverName}</span>
                    </div>
                    <span className={`text-[7px] font-black px-1.5 py-0.5 rounded uppercase ${statusBg(t.status)}`}>{t.status}</span>
                  </div>
                  <h4 className="text-sm font-black text-white uppercase tracking-tight mb-2">{t.name}</h4>
                  <div className="flex items-center gap-3">
                    {/* Load level bar */}
                    <div className="flex gap-0.5">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <div key={i} className={`w-3 h-1.5 rounded-sm ${i < t.loadLevel ? (t.loadLevel <= 2 ? "bg-siam-green" : t.loadLevel <= 4 ? "bg-amber-400" : "bg-red-400") : "bg-white/10"}`} />
                      ))}
                    </div>
                    <span className="text-[9px] font-bold text-white/40">{t.loadPercent}%</span>
                    {(t.status === "En Route" || t.status === "Returning") && (
                      <>
                        <Clock size={10} className="text-white/30 ml-auto" />
                        <span className="text-[9px] font-bold text-white/50">{t.route.eta}</span>
                      </>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* MAP tab — selected truck detail */
          <div className="space-y-5">
            <div className="flex items-center gap-4 mb-5 opacity-80">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent to-white/20" />
              <span className="text-[9px] font-black tracking-[0.4em] text-white/50 uppercase">Active Vehicle</span>
              <div className="flex-1 h-px bg-gradient-to-l from-transparent to-white/20" />
            </div>

            {selectedTruck ? (
              <SelectedTruckDetail truck={selectedTruck} statusColor={statusColor} />
            ) : (
              <div className="h-40 flex items-center justify-center border border-white/10 rounded-2xl bg-white/[0.01]">
                <span className="text-[9px] font-black text-white/20 tracking-[0.3em] uppercase">Select truck for data</span>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Navigation */}
      <nav className="mt-8 pt-6 border-t border-white/10 flex justify-between items-center px-1">
        <FleetNavIcon icon={<MapIcon size={16} />} label="MAP" active={activeTab === "MAP"} onClick={() => setActiveTab("MAP")} />
        <FleetNavIcon icon={<HardDrive size={16} />} label="LIST" active={activeTab === "LIST"} onClick={() => setActiveTab("LIST")} />
        <FleetNavIcon icon={<History size={16} />} label="LOGS" active={activeTab === "LOGS"} onClick={() => setActiveTab("LOGS")} />
        <FleetNavIcon icon={<Settings size={16} />} label="SETTINGS" active={activeTab === "SETTINGS"} onClick={() => setActiveTab("SETTINGS")} />
      </nav>
    </aside>
  );
}

function SelectedTruckDetail({ truck, statusColor }: { truck: Truck; statusColor: (s: string) => string }) {
  const [imgIndex, setImgIndex] = useState(0);
  const hasImages = truck.containerImages.length > 0;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="relative flex w-2.5 h-2.5">
            <span className={`relative inline-flex rounded-full w-2.5 h-2.5 shadow-lg ${truck.status === "En Route" ? "bg-blue-500" : truck.status === "Returning" ? "bg-cyan-400" : truck.status === "Loading" ? "bg-amber-400" : truck.status === "Idle" ? "bg-siam-green" : "bg-red-500"}`} />
          </span>
          <span className="text-[9px] font-black tracking-widest text-white/50 uppercase ml-1">{truck.driverName}</span>
        </div>
        <button className="text-white/40 hover:text-white transition-colors"><MoreVertical size={14} /></button>
      </div>
      <h3 className="font-manrope font-extrabold text-xl text-white mb-4 uppercase tracking-tighter leading-tight">{truck.name}</h3>

      {/* Status + Speed */}
      <div className="grid grid-cols-2 gap-2 mb-5">
        <div className="glass-panel p-3.5 rounded-xl ring-1 ring-white/5 bg-white/[0.02]">
          <span className="text-[9px] font-black text-white/40 uppercase block mb-1.5 tracking-widest">Status</span>
          <span className={`text-base font-black uppercase tracking-tight ${statusColor(truck.status)}`}>{truck.status}</span>
        </div>
        <div className="glass-panel p-3.5 rounded-xl ring-1 ring-white/5 bg-white/[0.02]">
          <span className="text-[9px] font-black text-white/40 uppercase block mb-1.5 tracking-widest">Speed</span>
          <span className="text-base font-black text-white tracking-tight">{truck.speed} <span className="text-[9px] text-white/30">km/h</span></span>
        </div>
      </div>

      {/* Load Capacity */}
      <div className="glass-panel p-5 rounded-2xl ring-1 ring-white/10 bg-white/[0.04] shadow-2xl mb-5">
        <div className="flex items-center gap-2 mb-3">
          <Package size={12} className="text-cyan-400" />
          <span className="text-[9px] font-black tracking-[0.2em] text-white/60 uppercase">Load Capacity</span>
        </div>
        {/* 6-level load bar */}
        <div className="flex gap-1 mb-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className={`flex-1 h-3 rounded ${i < truck.loadLevel ? (truck.loadLevel <= 2 ? "bg-siam-green" : truck.loadLevel <= 4 ? "bg-amber-400" : "bg-red-400") : "bg-white/5"} transition-all duration-500`} />
          ))}
        </div>
        <div className="flex justify-between items-center">
          <span className={`text-[10px] font-black ${LOAD_COLORS[truck.loadLevel]}`}>{LOAD_LABELS[truck.loadLevel]} — {truck.loadPercent}%</span>
          <span className="text-[9px] font-bold text-white/30">{truck.parcelsLoaded}/{truck.parcelsCapacity} parcels</span>
        </div>
        <div className="mt-2 pt-2 border-t border-white/5">
          <div className="flex justify-between items-center">
            <span className="text-[8px] text-white/40 font-black uppercase tracking-widest">Available</span>
            <span className="text-[10px] font-black text-cyan-400">{truck.parcelsAvailable} slots</span>
          </div>
        </div>
      </div>

      {/* Route Info */}
      {(truck.status === "En Route" || truck.status === "Returning" || truck.status === "Loading") && (
        <div className="glass-panel p-5 rounded-2xl ring-1 ring-white/10 bg-white/[0.04] shadow-2xl relative overflow-hidden group mb-5">
          <div className="flex items-center gap-2 mb-4">
            <Navigation size={12} className="text-cyan-400" />
            <span className="text-[9px] font-black tracking-[0.2em] text-white/60 uppercase">Route</span>
          </div>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex flex-col items-center gap-0.5 mt-1">
                <div className="w-2 h-2 rounded-full bg-siam-green" />
                <div className="w-px h-6 bg-white/10" />
                <div className="w-2 h-2 rounded-full bg-cyan-400" />
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <span className="text-[8px] text-white/30 font-black uppercase tracking-widest block">Origin</span>
                  <span className="text-[11px] font-black text-white">{truck.route.origin.name}</span>
                </div>
                <div>
                  <span className="text-[8px] text-white/30 font-black uppercase tracking-widest block">Destination</span>
                  <span className="text-[11px] font-black text-white">{truck.route.destination.name}</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
              <div>
                <span className="text-[8px] text-white/30 font-black uppercase tracking-widest block mb-0.5">ETA</span>
                <span className="text-sm font-black text-cyan-400">{truck.route.eta}</span>
              </div>
              <div>
                <span className="text-[8px] text-white/30 font-black uppercase tracking-widest block mb-0.5">Remaining</span>
                <span className="text-sm font-black text-white">{truck.route.distanceRemaining} km</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Container Images */}
      {hasImages && (
        <div className="glass-panel p-4 rounded-2xl ring-1 ring-white/10 bg-white/[0.04] shadow-2xl mb-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ImageIcon size={12} className="text-cyan-400" />
              <span className="text-[9px] font-black tracking-[0.2em] text-white/60 uppercase">Container View</span>
            </div>
            {truck.containerImages.length > 1 && (
              <div className="flex gap-1">
                <button onClick={() => setImgIndex((prev) => Math.max(0, prev - 1))} className="w-6 h-6 rounded bg-white/5 flex items-center justify-center text-white/40 hover:text-white active:scale-90"><ChevronLeft size={12} /></button>
                <button onClick={() => setImgIndex((prev) => Math.min(truck.containerImages.length - 1, prev + 1))} className="w-6 h-6 rounded bg-white/5 flex items-center justify-center text-white/40 hover:text-white active:scale-90"><ChevronRight size={12} /></button>
              </div>
            )}
          </div>
          <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black/40">
            <img
              src={truck.containerImages[imgIndex]}
              alt={`Container interior ${imgIndex + 1}`}
              className="w-full h-full object-cover transition-opacity duration-300"
            />
            <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/60 text-[8px] font-black text-white/60">
              {imgIndex + 1} / {truck.containerImages.length}
            </div>
          </div>
        </div>
      )}

      {/* GPS Coordinates */}
      <div className="glass-panel p-3 rounded-xl ring-1 ring-white/5 bg-white/[0.02] mb-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin size={10} className="text-white/30" />
            <span className="text-[8px] text-white/30 font-black uppercase tracking-widest">GPS</span>
          </div>
          <span className="text-[9px] font-mono text-white/50">{truck.lat.toFixed(4)}, {truck.lng.toFixed(4)}</span>
        </div>
      </div>
    </div>
  );
}

function FleetStatusCard({ icon, count, label, color }: { icon: React.ReactNode; count: number; label: string; color: string }) {
  return (
    <div className="glass-panel p-2 rounded-xl flex flex-col items-center text-center ring-1 ring-white/5 bg-white/[0.02]">
      <div className="mb-1">{icon}</div>
      <div className={`text-lg font-black ${color} tracking-tighter leading-none`}>{count}</div>
      <div className="text-[6px] font-black text-white/30 uppercase tracking-widest mt-0.5">{label}</div>
    </div>
  );
}

function FleetNavIcon({ icon, label, active = false, onClick }: { icon: React.ReactNode; label: string; active?: boolean; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1 group">
      <div className={`transition-all duration-300 ${active ? "text-cyan-400" : "text-white/20 group-hover:text-white"}`}>{icon}</div>
      <span className={`text-[6px] font-black tracking-[0.2em] ${active ? "text-cyan-400" : "text-white/20 group-hover:text-white"}`}>{label}</span>
    </button>
  );
}
