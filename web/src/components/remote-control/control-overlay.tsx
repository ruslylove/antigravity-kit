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
  Flame
} from "lucide-react";
import { Station } from "@/app/remote-control/page";

interface ControlOverlayProps {
  stations: Station[];
  selectedStationId: string | null;
}

export function ControlOverlay({ stations, selectedStationId }: ControlOverlayProps) {
  // Stats & Network Totals Calculation
  const stats = useMemo(() => {
    return {
      available: stations.filter(s => s.status === "Available").length,
      charging: stations.filter(s => s.status === "Charging").length,
      faulted: stations.filter(s => s.status === "Faulted").length,
      totalEnergy: stations.reduce((acc, s) => acc + (s.currentMeter || 0), 0),
      totalPower: stations.reduce((acc, s) => acc + (s.powerOutput || 0), 0),
    }
  }, [stations]);

  // Selected Station Details
  const selectedStation = useMemo(() => {
    return stations.find(s => s.id === selectedStationId) || null;
  }, [stations, selectedStationId]);

  return (
    <aside className="w-[320px] h-full glass-sidebar flex flex-col pointer-events-auto p-6 z-[1001] border-r border-white/10 shadow-3xl">
      {/* Brand Header */}
      <div className="mb-8 animate-in fade-in slide-in-from-left-4 duration-700">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-arb-primary rounded-[4px] flex items-center justify-center">
            <Zap size={12} className="text-black fill-current" />
          </div>
          <h1 className="font-manrope font-extrabold text-lg text-white tracking-tight">Kinetic Arboretum</h1>
        </div>
        <p className="text-[10px] font-bold text-arb-primary/80 tracking-[0.2em] mt-1 uppercase">Operational Hub BKK</p>
      </div>

      {/* Network Overview Summary */}
      <section className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-[11px] font-black uppercase tracking-widest text-white/90">Network Summary</h2>
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-white/10 border border-white/10 text-[9px] font-black text-white/90">
             LIVE
          </span>
        </div>
        
        {/* Network Totals Table */}
        <div className="glass-panel p-4 mb-3 rounded-2xl bg-white/[0.03] space-y-3 transition-colors hover:bg-white/[0.05]">
           <div className="flex justify-between items-end">
              <div className="space-y-0.5">
                <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Total Active Energy</span>
                <div className="text-xl font-black text-white tracking-tight leading-none">{stats.totalEnergy.toFixed(2)} <span className="text-[11px] text-white/40">kWh</span></div>
              </div>
              <Battery size={18} className="text-arb-primary mb-1 opacity-60" />
           </div>
           <div className="flex justify-between items-end pt-3 border-t border-white/5">
              <div className="space-y-0.5">
                <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Total Net Power</span>
                <div className="text-xl font-black text-arb-primary tracking-tight leading-none">{stats.totalPower.toFixed(1)} <span className="text-[11px] text-white/40">kW</span></div>
              </div>
              <Flame size={18} className="text-arb-primary mb-1 opacity-60" />
           </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <StatusCard icon={<CheckCircle2 size={12} className="text-arb-primary"/>} count={stats.available.toString()} label="AVAL" color="text-arb-primary" />
          <StatusCard icon={<Zap size={12} className="text-[#3b82f6]"/>} count={stats.charging.toString()} label="CHRG" color="text-[#3b82f6]" />
          <StatusCard icon={<AlertCircle size={12} className="text-[#ef4444]"/>} count={stats.faulted.toString()} label="FLTD" color="text-[#ef4444]" />
        </div>
      </section>

      {/* Selected Station Details */}
      <section className="flex-1 space-y-5 overflow-y-auto no-scrollbar">
        {selectedStation ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${selectedStation.status === 'Available' ? 'bg-arb-primary' : selectedStation.status === 'Charging' ? 'bg-blue-500' : 'bg-red-500'} shadow-lg`} />
                <span className="text-[9px] font-black tracking-widest text-white/50 uppercase">{selectedStation.id.toUpperCase()}</span>
              </div>
              <button className="text-white/40 hover:text-white transition-colors">
                <MoreVertical size={14} />
              </button>
            </div>
            <h3 className="font-manrope font-extrabold text-xl text-white mb-4 uppercase tracking-tighter leading-tight">{selectedStation.name}</h3>

            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="glass-panel p-3 rounded-xl ring-1 ring-white/5 bg-white/[0.02]">
                <span className="text-[8px] font-black text-white/40 uppercase block mb-1 tracking-widest">Status</span>
                <span className={`text-[11px] font-black uppercase ${selectedStation.status === 'Available' ? 'text-arb-primary' : selectedStation.status === 'Charging' ? 'text-[#3b82f6]' : 'text-[#ef4444]'}`}>
                  {selectedStation.status}
                </span>
              </div>
              <div className="glass-panel p-3 rounded-xl ring-1 ring-white/5 bg-white/[0.02]">
                <span className="text-[8px] font-black text-white/40 uppercase block mb-1 tracking-widest">Max Power</span>
                <span className="text-[11px] font-black text-white tracking-tight">{selectedStation.powerLimit}</span>
              </div>
            </div>

            <div className="glass-panel p-5 rounded-2xl ring-1 ring-white/10 bg-white/[0.04] shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Activity size={40} className="text-arb-primary" />
              </div>

              <div className="flex items-center gap-2 mb-4">
                <Activity size={12} className="text-arb-primary" />
                <span className="text-[9px] font-black tracking-[0.2em] text-white/60 uppercase">Real-Time Telemetry</span>
              </div>
              
              <div className="space-y-6">
                 <div>
                   <span className="text-[10px] text-white/40 font-black uppercase tracking-widest mb-1.5 block">Session Energy Used</span>
                   <div className="flex items-baseline gap-1 animate-pulse-slow">
                     <span className="text-4xl font-black text-white tracking-tighter">{(selectedStation.currentMeter || 0).toFixed(2)}</span>
                     <span className="text-xs font-black text-white/30 uppercase tracking-widest">kWh</span>
                   </div>
                 </div>

                 <div className="pt-4 border-t border-white/5">
                   <span className="text-[10px] text-white/40 font-black uppercase tracking-widest mb-1.5 block">Current Live Power</span>
                   <div className="flex items-baseline gap-2">
                     <span className="text-4xl font-black text-arb-primary tracking-tighter">{(selectedStation.powerOutput || 0).toFixed(1)}</span>
                     <span className="text-xs font-black text-arb-primary/40 uppercase tracking-widest">kW</span>
                   </div>
                 </div>

                 <div className="pt-2">
                   <LogItem label="Socket Status" value={selectedStation.socketStatus || "Ready"} valueClass="text-white/80 font-black" />
                 </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-40 flex items-center justify-center border border-white/10 rounded-2xl bg-white/[0.01]">
            <span className="text-[9px] font-black text-white/20 tracking-[0.3em] uppercase">Select station for data</span>
          </div>
        )}
      </section>

      {/* Action Buttons */}
      <div className="pt-6 space-y-2 mt-auto">
        <button className="w-full bg-arb-primary hover:bg-[#00f383] text-black font-black py-4 rounded-xl transition-all active:scale-[0.98] shadow-lg flex items-center justify-center gap-2 text-[12px] uppercase tracking-wider">
          View Analytics
        </button>
        <button className="w-full bg-white/5 hover:bg-white/10 text-white font-black py-4 rounded-xl border border-white/10 transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-[12px] uppercase tracking-wider">
          <Power size={18} />
          Stop Charging
        </button>
      </div>

      {/* Context Navigation */}
      <nav className="mt-8 pt-6 border-t border-white/10 flex justify-between items-center px-1">
        <NavIcon icon={<MapIcon size={16}/>} label="MAP" active />
        <NavIcon icon={<HardDrive size={16}/>} label="NODES" />
        <NavIcon icon={<History size={16}/>} label="LOGS" />
        <NavIcon icon={<Settings size={16}/>} label="DATA" />
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

function NavIcon({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <button className={`flex flex-col items-center gap-1 group`}>
      <div className={`transition-all duration-300 ${active ? "text-arb-primary" : "text-white/20 group-hover:text-white"}`}>
        {icon}
      </div>
      <span className={`text-[6px] font-black tracking-[0.2em] ${active ? "text-arb-primary" : "text-white/20 group-hover:text-white"}`}>
        {label}
      </span>
    </button>
  );
}
