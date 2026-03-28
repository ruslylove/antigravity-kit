"use client";

import React, { useMemo } from "react";
import { 
  Zap, 
  CheckCircle2, 
  AlertCircle, 
  Activity, 
  Power,
  Map as MapIcon,
  HardDrive,
  History,
  Settings,
  MoreVertical,
  Battery,
  Flame,
  X,
  Search,
  LayoutDashboard
} from "lucide-react";
import { Station } from "@/app/remote-control/page";

interface ControlOverlayProps {
  stations: Station[];
  selectedStationId: string | null;
  onStationClick?: (id: string | null) => void;
  activeTab: "MAP" | "SETTINGS" | "NODES" | "LOGS";
  setActiveTab: React.Dispatch<React.SetStateAction<"MAP" | "SETTINGS" | "NODES" | "LOGS">>;
  apiUrl: string;
  setApiUrl: React.Dispatch<React.SetStateAction<string>>;
  isApiHealthy: boolean;
  stats: {
    available: number;
    charging: number;
    faulted: number;
    totalEnergy: number;
    totalPower: number;
    totalCapacity: number;
  };
  onClose?: () => void;
}

export function ControlOverlay({ 
  stations, 
  selectedStationId, 
  onStationClick,
  activeTab, 
  setActiveTab, 
  apiUrl, 
  setApiUrl, 
  isApiHealthy, 
  stats, 
  onClose 
}: ControlOverlayProps) {
  // Selected Station Details
  const selectedStation = useMemo(() => {
    return stations.find(s => s.id === selectedStationId) || null;
  }, [stations, selectedStationId]);

  return (
    <aside className="w-full md:w-full h-full glass-sidebar flex flex-col pointer-events-auto p-6 md:p-8 z-[2000] border-r border-white/10 shadow-3xl overflow-y-auto no-scrollbar pb-12">
      {/* Mobile Header with Close Button */}
      <div className="md:hidden flex items-center justify-between mb-6">
        <button 
          onClick={onClose}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-siam-green text-black font-black text-[10px] uppercase tracking-widest shadow-lg active:scale-95"
        >
          {activeTab === "NODES" ? <HardDrive size={14} /> : <MapIcon size={14} />}
          Back to {activeTab === "NODES" ? "Table" : "Map"}
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
          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/80 to-transparent transform -skew-x-12 -translate-x-[200%] group-hover:translate-x-[200%] transition-transform duration-[0.9s] ease-out pointer-events-none z-20 mix-blend-overlay" />
          <img src="/assets/siamev_logo.jpg" alt="SIAM EV Corporate Logo" className="w-full h-full object-contain relative z-10 transition-transform duration-500 group-hover:scale-[1.03]" />
        </div>
        <p className="text-[10px] font-bold text-siam-green/90 tracking-[0.2em] mt-1 ml-1 uppercase">Operational Hub BKK</p>
      </div>



      <section className="flex-1 space-y-5 overflow-y-auto no-scrollbar">
        {activeTab === "SETTINGS" ? (
          <div className="flex flex-col justify-center h-full">
            <div className="flex items-center gap-4 mb-2 opacity-80">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent to-white/20"></div>
              <span className="text-[9px] font-black tracking-[0.4em] text-white/50 uppercase">Connection Setup</span>
              <div className="flex-1 h-px bg-gradient-to-l from-transparent to-white/20"></div>
            </div>
            
            <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-5 shadow-2xl">
              <div>
                <label className="text-[10px] text-white/60 font-black uppercase tracking-[0.2em] block mb-2.5">Backend API URL</label>
                <input 
                  type="text" 
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  placeholder="http://localhost:1880"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-[13px] text-white font-mono focus:outline-none focus:border-siam-blue/60 transition-colors shadow-inner"
                />
                <p className="text-[8.5px] text-white/30 font-bold tracking-[0.05em] mt-2.5">Leave blank to connect to the internal UI JSON mock API instead of Node-RED.</p>
              </div>
              <div className="pt-2 border-t border-white/5">
                <button 
                  onClick={() => {
                    if (apiUrl) {
                      localStorage.setItem("siam_ocpp_url", apiUrl.replace(/\/$/, ""));
                    } else {
                      localStorage.removeItem("siam_ocpp_url");
                    }
                    window.location.reload();
                  }}
                  className="w-full bg-gradient-to-r from-siam-green to-[#2db34b] hover:from-[#3bae49] hover:to-[#21a83f] text-black font-black py-3.5 rounded-xl transition-all shadow-xl text-[11px] uppercase tracking-widest active:scale-95 border border-white/20"
                >
                  Save & Reconnect
                </button>
              </div>
            </div>
          </div>
        ) : activeTab === "LOGS" ? (
          <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex items-center gap-4 mb-2 opacity-80">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent to-white/20"></div>
              <span className="text-[9px] font-black tracking-[0.4em] text-white/50 uppercase">Activity Log</span>
              <div className="flex-1 h-px bg-gradient-to-l from-transparent to-white/20"></div>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-4 shadow-2xl">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">System Events</span>
                <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded ${isApiHealthy ? 'bg-siam-green/10 border border-siam-green/30' : 'bg-red-500/10 border border-red-500/30'}`}>
                  <span className={`relative flex w-1.5 h-1.5`}>
                    <span className={`relative inline-flex rounded-full w-1.5 h-1.5 ${isApiHealthy ? 'bg-siam-green' : 'bg-red-500'}`}></span>
                  </span>
                  <span className={`text-[7px] font-black tracking-widest uppercase ${isApiHealthy ? 'text-siam-green' : 'text-red-500'}`}>LIVE</span>
                </div>
              </div>

              <div className="space-y-2 max-h-[400px] overflow-y-auto no-scrollbar">
                {stations.map((station) => (
                  <div key={`log-${station.id}`} className="p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[8px] font-black text-white/30 uppercase tracking-widest">{station.id.toUpperCase()}</span>
                      <span className={`text-[7px] font-black px-1.5 py-0.5 rounded uppercase ${station.status === 'Available' ? 'bg-siam-green/20 text-siam-green' : station.status === 'Charging' ? 'bg-blue-500/20 text-blue-400' : 'bg-red-500/20 text-red-400'}`}>
                        {station.status}
                      </span>
                    </div>
                    <div className="text-[9px] text-white/60 font-bold">
                      {station.status === 'Charging' 
                        ? `Active session — ${(station.powerOutput || 0).toFixed(1)} kW output, ${(station.currentMeter || 0).toFixed(1)} kWh delivered`
                        : station.status === 'Available'
                        ? 'Idle — Ready for new session'
                        : 'Fault detected — Requires attention'
                      }
                    </div>
                  </div>
                ))}

                {stations.length === 0 && (
                  <div className="h-32 flex items-center justify-center">
                    <span className="text-[9px] font-black text-white/20 tracking-[0.3em] uppercase">No events recorded</span>
                  </div>
                )}
              </div>
            </div>

            <button 
              onClick={() => setActiveTab("MAP")}
              className="w-full py-4 rounded-xl bg-white/[0.03] border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 active:scale-95"
            >
              <MapIcon size={14} />
              Return to Live Map
            </button>
          </div>
        ) : activeTab === "NODES" ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <LayoutDashboard size={14} className="text-siam-green" />
                <span className="text-[10px] font-black tracking-[0.3em] uppercase text-white/40">Fleet Insights</span>
              </div>
              <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest leading-relaxed">Aggregate performance metrics and network health monitoring.</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {/* Detailed Breakdown Card */}
              <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-5">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Global Status</span>
                  <div className="px-2 py-0.5 rounded bg-siam-green text-black text-[8px] font-black">HEALTHY</div>
                </div>
                
                <div className="space-y-4">
                  <InsightRow label="Network Online" value="100%" color="text-siam-green" />
                  <InsightRow label="Peak Demand" value={`${(stats.totalPower * 1.1).toFixed(1)} kW`} color="text-white" />
                  <InsightRow label="Fault Rate" value="0.0%" color="text-white" />
                </div>
              </div>

              {/* Status Summary */}
              <div className="grid grid-cols-2 gap-3">
                 <div className="glass-panel p-4 rounded-xl border border-siam-green/20 bg-siam-green/[0.02]">
                    <p className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-1">Operational</p>
                    <p className="text-2xl font-black text-siam-green leading-none">{stats.available + stats.charging}</p>
                 </div>
                 <div className="glass-panel p-4 rounded-xl border border-red-500/20 bg-red-500/[0.02]">
                    <p className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-1">Critical</p>
                    <p className="text-2xl font-black text-red-500 leading-none">{stats.faulted}</p>
                 </div>
              </div>

              <button 
                onClick={() => setActiveTab("MAP")}
                className="w-full py-4 rounded-xl bg-white/[0.03] border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 active:scale-95"
              >
                <MapIcon size={14} />
                Return to Live Map
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Node Details Divider */}
            <div className="flex items-center gap-4 mb-5 opacity-80">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent to-white/20"></div>
              <span className="text-[9px] font-black tracking-[0.4em] text-white/50 uppercase">Active Node</span>
              <div className="flex-1 h-px bg-gradient-to-l from-transparent to-white/20"></div>
            </div>

            {/* Selected Station Details */}
            {selectedStation ? (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="relative flex w-2.5 h-2.5">
                      {selectedStation.status === 'Charging' && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>}
                      <span className={`relative inline-flex rounded-full w-2.5 h-2.5 ${selectedStation.status === 'Available' ? 'bg-siam-green' : selectedStation.status === 'Charging' ? 'bg-blue-500' : 'bg-red-500'} shadow-lg`} />
                    </span>
                    <span className="text-[9px] font-black tracking-widest text-white/50 uppercase ml-1">{selectedStation.id.toUpperCase()}</span>
                  </div>
                  <button className="text-white/40 hover:text-white transition-colors">
                    <MoreVertical size={14} />
                  </button>
                </div>
                <h3 className="font-manrope font-extrabold text-xl text-white mb-4 uppercase tracking-tighter leading-tight">{selectedStation.name}</h3>

                <div className="grid grid-cols-2 gap-2 mb-5">
                  <div className="glass-panel p-3.5 rounded-xl ring-1 ring-white/5 bg-white/[0.02]">
                    <span className="text-[9px] font-black text-white/40 uppercase block mb-1.5 tracking-widest">Status</span>
                    <span className={`text-base font-black uppercase tracking-tight ${selectedStation.status === 'Available' ? 'text-siam-green' : selectedStation.status === 'Charging' ? 'text-[#3b82f6]' : 'text-[#ef4444]'}`}>
                      {selectedStation.status}
                    </span>
                  </div>
                  <div className="glass-panel p-3.5 rounded-xl ring-1 ring-white/5 bg-white/[0.02]">
                    <span className="text-[9px] font-black text-white/40 uppercase block mb-1.5 tracking-widest">Max Power</span>
                    <span className="text-base font-black text-white tracking-tight">{selectedStation.powerLimit || "N/A"}</span>
                  </div>
                </div>

                <div className="glass-panel p-5 rounded-2xl ring-1 ring-white/10 bg-white/[0.04] shadow-2xl relative overflow-hidden group mb-6">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Activity size={40} className="text-siam-green" />
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <Activity size={12} className="text-siam-green" />
                    <span className="text-[9px] font-black tracking-[0.2em] text-white/60 uppercase">Real-Time Telemetry</span>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <span className="text-[10px] text-white/40 font-black uppercase tracking-widest mb-1.5 block">Session Energy Used</span>
                      <div className="flex items-baseline gap-1 animate-pulse-slow">
                        <span className="text-3xl font-black text-white tracking-tighter">{(selectedStation.currentMeter || 0).toFixed(2)}</span>
                        <span className="text-xs font-black text-white/30 uppercase tracking-widest">kWh</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-white/5">
                      <span className="text-[10px] text-white/40 font-black uppercase tracking-widest mb-1.5 block">Current Live Power</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-siam-green tracking-tighter">{(selectedStation.powerOutput || 0).toFixed(1)}</span>
                        <span className="text-xs font-black text-siam-green/40 uppercase tracking-widest">kW</span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <LogItem label="Socket Status" value={selectedStation.socketStatus || "Ready"} valueClass="text-white/80 font-black" />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 mb-6">
                  <button className="group relative overflow-hidden w-full bg-gradient-to-r from-siam-blue to-[#2a5baf] hover:from-[#153670] hover:to-[#1b458f] border border-white/10 text-white font-black py-4 rounded-xl transition-all active:scale-[0.98] shadow-xl flex items-center justify-center gap-2 text-[12px] uppercase tracking-wider">
                    <div className="absolute inset-0 w-full h-full bg-white/10 transform -skew-x-12 -translate-x-[200%] group-hover:translate-x-[200%] transition-transform duration-[1.2s] ease-out" />
                    <Activity size={16} className="text-white/60 group-hover:text-white transition-colors duration-300 z-10" />
                    <span className="z-10">View Analytics</span>
                  </button>
                  <button className="w-full bg-white/5 hover:bg-white/10 text-white font-black py-4 rounded-xl border border-white/10 transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-[12px] uppercase tracking-wider">
                    <Power size={18} />
                    Stop Charging
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-40 flex items-center justify-center border border-white/10 rounded-2xl bg-white/[0.01]">
                <span className="text-[9px] font-black text-white/20 tracking-[0.3em] uppercase">Select station for data</span>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Shared Navigation (Outside the Switch) */}
      <nav className="mt-8 pt-6 border-t border-white/10 flex justify-between items-center px-1">
        <NavIcon icon={<MapIcon size={16}/>} label="MAP" active={activeTab === "MAP"} onClick={() => setActiveTab("MAP")} />
        <NavIcon icon={<HardDrive size={16}/>} label="NODES" active={activeTab === "NODES"} onClick={() => setActiveTab("NODES")} />
        <NavIcon icon={<History size={16}/>} label="LOGS" active={activeTab === "LOGS"} onClick={() => setActiveTab("LOGS")} />
        <NavIcon icon={<Settings size={16}/>} label="SETTINGS" active={activeTab === "SETTINGS"} onClick={() => setActiveTab("SETTINGS")} />
      </nav>
    </aside>
  );
}

function StatusCard({ icon, count, label, color }: { icon: React.ReactNode, count: string, label: string, color: string }) {
  return (
    <div className="glass-panel p-2.5 rounded-xl flex flex-col items-center text-center ring-1 ring-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
      <div className="mb-1.5">{icon}</div>
      <div className={`text-lg font-black ${color} tracking-tighter leading-none`}>{count}</div>
      <div className="text-[7px] font-black text-white/30 uppercase tracking-widest mt-1">{label}</div>
    </div>
  );
}

function LogItem({ label, value, valueClass }: { label: string, value: string, valueClass: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-[8px] text-white/50 font-black uppercase tracking-widest">{label}</span>
      <span className={`text-[10px] ${valueClass} tracking-[0.05em]`}>{value}</span>
    </div>
  );
}

function NavIcon({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) {
  return (
    <button onClick={onClick} className={`flex flex-col items-center gap-1 group`}>
      <div className={`transition-all duration-300 ${active ? "text-siam-green" : "text-white/20 group-hover:text-white"}`}>
        {icon}
      </div>
      <span className={`text-[6px] font-black tracking-[0.2em] ${active ? "text-siam-green" : "text-white/20 group-hover:text-white"}`}>
        {label}
      </span>
    </button>
  );
}

function InsightRow({ label, value, color }: { label: string, value: string, color: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-[9px] text-white/40 font-black uppercase tracking-widest">{label}</span>
      <span className={`text-xs font-black ${color} tracking-tight`}>{value}</span>
    </div>
  );
}
