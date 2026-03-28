"use client";

import React, { useMemo } from "react";
import {
  Zap,
  AlertCircle,
  CheckCircle2,
  Activity,
  Building2,
  Map as MapIcon,
  HardDrive,
  History,
  Settings,
  MoreVertical,
  Gauge,
  TrendingUp,
  X,
  WifiOff,
} from "lucide-react";
import type { Facility } from "@/app/remote-control/types";

interface FacilitiesOverlayProps {
  facilities: Facility[];
  selectedFacilityId: string | null;
  onFacilityClick?: (id: string | null) => void;
  activeTab: "MAP" | "SETTINGS" | "LIST" | "LOGS";
  setActiveTab: React.Dispatch<React.SetStateAction<"MAP" | "SETTINGS" | "LIST" | "LOGS">>;
  isApiHealthy: boolean;
  onClose?: () => void;
}

export function FacilitiesOverlay({
  facilities,
  selectedFacilityId,
  onFacilityClick,
  activeTab,
  setActiveTab,
  isApiHealthy,
  onClose,
}: FacilitiesOverlayProps) {
  const selectedFacility = useMemo(
    () => facilities.find((f) => f.id === selectedFacilityId) || null,
    [facilities, selectedFacilityId]
  );

  const stats = useMemo(() => ({
    totalPower: facilities.reduce((acc, f) => acc + f.currentPower, 0),
    totalDailyEnergy: facilities.reduce((acc, f) => acc + f.dailyEnergy, 0),
    normal: facilities.filter((f) => f.status === "Normal").length,
    highUsage: facilities.filter((f) => f.status === "High Usage").length,
    critical: facilities.filter((f) => f.status === "Critical").length,
    offline: facilities.filter((f) => f.status === "Offline").length,
  }), [facilities]);

  const statusColor = (status: string) => {
    switch (status) {
      case "Normal": return "text-siam-green";
      case "High Usage": return "text-amber-400";
      case "Critical": return "text-red-500";
      case "Offline": return "text-white/30";
      default: return "text-white/50";
    }
  };

  const statusBg = (status: string) => {
    switch (status) {
      case "Normal": return "bg-siam-green/20 text-siam-green";
      case "High Usage": return "bg-amber-400/20 text-amber-400";
      case "Critical": return "bg-red-500/20 text-red-400";
      case "Offline": return "bg-white/10 text-white/40";
      default: return "bg-white/10 text-white/40";
    }
  };

  return (
    <aside className="w-full md:w-full h-full glass-sidebar flex flex-col pointer-events-auto p-6 md:p-8 z-[2000] border-r border-white/10 shadow-3xl overflow-y-auto no-scrollbar pb-12">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between mb-6">
        <button
          onClick={onClose}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-400 text-black font-black text-[10px] uppercase tracking-widest shadow-lg active:scale-95"
        >
          <MapIcon size={14} />
          Back to Map
        </button>
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white active:scale-90"
        >
          <X size={20} />
        </button>
      </div>

      {/* Brand Header */}
      <div className="mb-8 animate-in fade-in slide-in-from-left-4 duration-700">
        <div className="group relative overflow-hidden flex items-center justify-center bg-white p-2 rounded-xl shadow-lg border border-white/10 mb-2 h-16 transition-all duration-500 hover:shadow-[0_0_25px_rgba(27,69,143,0.3)] hover:border-siam-blue/40 cursor-default">
          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-siam-blue/10 to-transparent transform -skew-x-12 -translate-x-[200%] group-hover:translate-x-[200%] transition-transform duration-[1.2s] ease-in-out pointer-events-none z-20" />
          <img src="/assets/siamev_logo.jpg" alt="SIAM EV Corporate Logo" className="w-full h-full object-contain relative z-10 transition-transform duration-500 group-hover:scale-[1.03]" />
        </div>
        <p className="text-[10px] font-bold text-amber-400/90 tracking-[0.2em] mt-1 ml-1 uppercase">Facilities Monitor</p>
      </div>



      {/* Content Area */}
      <section className="flex-1 space-y-5 overflow-y-auto no-scrollbar">
        {activeTab === "SETTINGS" ? (
          <div className="text-center py-12">
            <Settings size={32} className="mx-auto text-white/10 mb-4" />
            <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Facility Settings</p>
            <p className="text-[9px] text-white/10 mt-2">Configure alert thresholds and monitoring intervals</p>
          </div>
        ) : activeTab === "LOGS" ? (
          <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex items-center gap-4 mb-2 opacity-80">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent to-white/20" />
              <span className="text-[9px] font-black tracking-[0.4em] text-white/50 uppercase">Energy Log</span>
              <div className="flex-1 h-px bg-gradient-to-l from-transparent to-white/20" />
            </div>
            <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-2">
              {facilities.map((f) => (
                <div key={`log-${f.id}`} className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[8px] font-black text-white/30 uppercase tracking-widest">{f.name}</span>
                    <span className={`text-[7px] font-black px-1.5 py-0.5 rounded uppercase ${statusBg(f.status)}`}>{f.status}</span>
                  </div>
                  <div className="text-[9px] text-white/50 font-bold">
                    Drawing {f.currentPower.toFixed(0)} kW — {((f.currentPower / f.capacity) * 100).toFixed(0)}% of capacity
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : activeTab === "LIST" ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Building2 size={14} className="text-amber-400" />
                <span className="text-[10px] font-black tracking-[0.3em] uppercase text-white/40">Facility List</span>
              </div>
            </div>
            <div className="space-y-3">
              {facilities.map((f) => (
                <button
                  key={f.id}
                  onClick={() => { onFacilityClick?.(f.id); setActiveTab("MAP"); }}
                  className={`w-full text-left p-4 rounded-2xl glass-panel border transition-all active:scale-[0.98] ${selectedFacilityId === f.id ? "border-amber-400/40 bg-amber-400/5" : "border-white/5 hover:bg-white/[0.04]"}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">{f.type}</span>
                    <span className={`text-[7px] font-black px-1.5 py-0.5 rounded uppercase ${statusBg(f.status)}`}>{f.status}</span>
                  </div>
                  <h4 className="text-sm font-black text-white uppercase tracking-tight mb-2">{f.name}</h4>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Zap size={10} className="text-amber-400" />
                      <span className="text-[10px] font-black text-white">{f.currentPower.toFixed(0)} kW</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Gauge size={10} className="text-white/40" />
                      <span className="text-[10px] font-bold text-white/50">PUE {f.pue}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* MAP tab — selected facility detail */
          <div className="space-y-5">
            <div className="flex items-center gap-4 mb-5 opacity-80">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent to-white/20" />
              <span className="text-[9px] font-black tracking-[0.4em] text-white/50 uppercase">Active Site</span>
              <div className="flex-1 h-px bg-gradient-to-l from-transparent to-white/20" />
            </div>

            {selectedFacility ? (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`relative flex w-2.5 h-2.5`}>
                      <span className={`relative inline-flex rounded-full w-2.5 h-2.5 ${selectedFacility.status === "Normal" ? "bg-siam-green" : selectedFacility.status === "High Usage" ? "bg-amber-400" : selectedFacility.status === "Critical" ? "bg-red-500" : "bg-white/30"} shadow-lg`} />
                    </span>
                    <span className="text-[9px] font-black tracking-widest text-white/50 uppercase ml-1">{selectedFacility.type}</span>
                  </div>
                  <button className="text-white/40 hover:text-white transition-colors"><MoreVertical size={14} /></button>
                </div>
                <h3 className="font-manrope font-extrabold text-xl text-white mb-4 uppercase tracking-tighter leading-tight">{selectedFacility.name}</h3>

                <div className="grid grid-cols-2 gap-2 mb-5">
                  <div className="glass-panel p-3.5 rounded-xl ring-1 ring-white/5 bg-white/[0.02]">
                    <span className="text-[9px] font-black text-white/40 uppercase block mb-1.5 tracking-widest">Status</span>
                    <span className={`text-base font-black uppercase tracking-tight ${statusColor(selectedFacility.status)}`}>{selectedFacility.status}</span>
                  </div>
                  <div className="glass-panel p-3.5 rounded-xl ring-1 ring-white/5 bg-white/[0.02]">
                    <span className="text-[9px] font-black text-white/40 uppercase block mb-1.5 tracking-widest">PUE</span>
                    <span className="text-base font-black text-white tracking-tight">{selectedFacility.pue}</span>
                  </div>
                </div>

                <div className="glass-panel p-5 rounded-2xl ring-1 ring-white/10 bg-white/[0.04] shadow-2xl relative overflow-hidden group mb-6">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Activity size={40} className="text-amber-400" />
                  </div>
                  <div className="flex items-center gap-2 mb-4">
                    <Activity size={12} className="text-amber-400" />
                    <span className="text-[9px] font-black tracking-[0.2em] text-white/60 uppercase">Energy Telemetry</span>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <span className="text-[10px] text-white/40 font-black uppercase tracking-widest mb-1.5 block">Current Power</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black text-amber-400 tracking-tighter">{selectedFacility.currentPower.toFixed(0)}</span>
                        <span className="text-xs font-black text-amber-400/40 uppercase tracking-widest">kW</span>
                      </div>
                      {/* Usage bar */}
                      <div className="w-full h-2 bg-white/5 rounded-full mt-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-1000 ${(selectedFacility.currentPower / selectedFacility.capacity) > 0.8 ? "bg-red-500" : (selectedFacility.currentPower / selectedFacility.capacity) > 0.6 ? "bg-amber-400" : "bg-siam-green"}`}
                          style={{ width: `${Math.min(100, (selectedFacility.currentPower / selectedFacility.capacity) * 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-[8px] text-white/20 font-bold">0 kW</span>
                        <span className="text-[8px] text-white/20 font-bold">{selectedFacility.capacity} kW</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-white/5 grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-[10px] text-white/40 font-black uppercase tracking-widest mb-1 block">Today</span>
                        <span className="text-lg font-black text-white">{(selectedFacility.dailyEnergy / 1000).toFixed(1)} <span className="text-[9px] text-white/30">MWh</span></span>
                      </div>
                      <div>
                        <span className="text-[10px] text-white/40 font-black uppercase tracking-widest mb-1 block">Month</span>
                        <span className="text-lg font-black text-white">{(selectedFacility.monthlyEnergy / 1000).toFixed(0)} <span className="text-[9px] text-white/30">MWh</span></span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-white/5">
                      <div className="flex justify-between items-center">
                        <span className="text-[8px] text-white/50 font-black uppercase tracking-widest">Peak Demand</span>
                        <span className="text-[10px] font-black text-white/80">{selectedFacility.peakDemand.toFixed(0)} kW</span>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Zone / Floor Breakdown */}
                <div className="glass-panel p-4 rounded-2xl ring-1 ring-white/10 bg-white/[0.03] mb-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Building2 size={12} className="text-amber-400" />
                    <span className="text-[9px] font-black tracking-[0.2em] text-white/60 uppercase">Zone Breakdown</span>
                    <span className="ml-auto text-[8px] font-black text-white/20">{selectedFacility.zones.length} zones</span>
                  </div>
                  <div className="space-y-2">
                    {selectedFacility.zones.map((zone) => (
                      <div key={zone.id} className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[9px] font-black text-white/60">{zone.name}</span>
                          <span className={`text-[7px] font-black px-1 py-0.5 rounded uppercase ${statusBg(zone.status)}`}>{zone.status}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <Zap size={9} className="text-amber-400/60" />
                            <span className="text-[9px] font-black text-white">{zone.currentPower.toFixed(0)} kW</span>
                          </div>
                          {zone.occupancy !== undefined && (
                            <div className="flex-1 flex items-center gap-1.5">
                              <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${zone.occupancy > 90 ? "bg-red-400" : zone.occupancy > 70 ? "bg-amber-400" : "bg-siam-green"}`} style={{ width: `${zone.occupancy}%` }} />
                              </div>
                              <span className="text-[7px] font-bold text-white/30">{zone.occupancy}%</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-40 flex items-center justify-center border border-white/10 rounded-2xl bg-white/[0.01]">
                <span className="text-[9px] font-black text-white/20 tracking-[0.3em] uppercase">Select facility for data</span>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Navigation */}
      <nav className="mt-8 pt-6 border-t border-white/10 flex justify-between items-center px-1">
        <FacNavIcon icon={<MapIcon size={16} />} label="MAP" active={activeTab === "MAP"} onClick={() => setActiveTab("MAP")} />
        <FacNavIcon icon={<HardDrive size={16} />} label="LIST" active={activeTab === "LIST"} onClick={() => setActiveTab("LIST")} />
        <FacNavIcon icon={<History size={16} />} label="LOGS" active={activeTab === "LOGS"} onClick={() => setActiveTab("LOGS")} />
        <FacNavIcon icon={<Settings size={16} />} label="SETTINGS" active={activeTab === "SETTINGS"} onClick={() => setActiveTab("SETTINGS")} />
      </nav>
    </aside>
  );
}

function FacStatusCard({ icon, count, label, color }: { icon: React.ReactNode; count: number; label: string; color: string }) {
  return (
    <div className="glass-panel p-2 rounded-xl flex flex-col items-center text-center ring-1 ring-white/5 bg-white/[0.02]">
      <div className="mb-1">{icon}</div>
      <div className={`text-lg font-black ${color} tracking-tighter leading-none`}>{count}</div>
      <div className="text-[6px] font-black text-white/30 uppercase tracking-widest mt-0.5">{label}</div>
    </div>
  );
}

function FacNavIcon({ icon, label, active = false, onClick }: { icon: React.ReactNode; label: string; active?: boolean; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1 group">
      <div className={`transition-all duration-300 ${active ? "text-amber-400" : "text-white/20 group-hover:text-white"}`}>{icon}</div>
      <span className={`text-[6px] font-black tracking-[0.2em] ${active ? "text-amber-400" : "text-white/20 group-hover:text-white"}`}>{label}</span>
    </button>
  );
}
