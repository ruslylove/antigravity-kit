"use client";

import React from "react";
import { 
  Zap, 
  CheckCircle2, 
  AlertCircle, 
  Flame, 
  Battery, 
  MoreVertical,
  Activity,
  ArrowRight
} from "lucide-react";
import { Station } from "@/app/remote-control/page";

interface NodesTableViewProps {
  stations: Station[];
  selectedStationId: string | null;
  onStationClick: (id: string | null) => void;
}

export function NodesTableView({ stations, selectedStationId, onStationClick }: NodesTableViewProps) {
  return (
    <div className="absolute inset-0 bg-[#061114] p-6 pt-24 md:p-12 md:pt-32 overflow-y-auto no-scrollbar z-0">
      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
               <div className="w-1.5 h-1.5 rounded-full bg-siam-green shadow-[0_0_10px_#00e676]"></div>
               <span className="text-[10px] font-black tracking-[0.3em] uppercase text-white/40">Fleet Overview</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-manrope font-black text-white uppercase tracking-tighter">Charging <span className="text-siam-green">Nodes</span></h1>
          </div>
          
          <div className="flex gap-4">
            <div className="glass p-3 px-6 rounded-2xl border border-white/5 flex items-center gap-3">
               <div className="text-right">
                  <p className="text-[8px] font-black text-white/30 uppercase tracking-widest">Total Stations</p>
                  <p className="text-xl font-black text-white leading-none">{stations.length}</p>
               </div>
               <Activity size={20} className="text-white/20" />
            </div>
          </div>
        </div>

        <div className="glass shadow-3xl rounded-[2.5rem] border border-white/10 overflow-hidden backdrop-blur-3xl bg-black/40">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-white/[0.03] border-b border-white/10">
                  <th className="px-8 py-6 text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Node ID</th>
                  <th className="px-8 py-6 text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Location / Name</th>
                  <th className="px-8 py-6 text-[10px] font-black text-white/40 uppercase tracking-[0.2em] text-center">Status</th>
                  <th className="px-8 py-6 text-[10px] font-black text-white/40 uppercase tracking-[0.2em] text-center">Current Load</th>
                  <th className="px-8 py-6 text-[10px] font-black text-white/40 uppercase tracking-[0.2em] text-center">Session Energy</th>
                  <th className="px-8 py-6 text-[10px] font-black text-white/40 uppercase tracking-[0.2em] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {stations.map((station) => (
                  <tr 
                    key={station.id}
                    onClick={() => onStationClick(station.id)}
                    className={`group cursor-pointer hover:bg-white/[0.03] transition-all duration-300 ${selectedStationId === station.id ? 'bg-siam-blue/10 border-l-4 border-l-siam-green' : ''}`}
                  >
                    <td className="px-8 py-6">
                      <span className="text-[11px] font-black text-white tracking-[0.1em] uppercase bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                        {station.id.replace('station-', '').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-white uppercase tracking-tight group-hover:text-siam-green transition-colors">{station.name}</span>
                        <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest mt-0.5">District Area 01</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex items-center justify-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${station.status === 'Available' ? 'bg-siam-green' : station.status === 'Charging' ? 'bg-[#3b82f6] shadow-[0_0_10px_#3b82f6] animate-pulse' : 'bg-[#ef4444] shadow-[0_0_10px_#ef4444]'}`}></div>
                          <span className={`text-[10px] font-black uppercase tracking-widest ${station.status === 'Available' ? 'text-siam-green' : station.status === 'Charging' ? 'text-[#3b82f6]' : 'text-[#ef4444]'}`}>
                            {station.status}
                          </span>
                       </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                       <div className="flex flex-col items-center">
                          <div className="flex items-center gap-1.5">
                             <Flame size={14} className={station.powerOutput ? "text-siam-green" : "text-white/10"} />
                             <span className="text-lg font-black text-white tracking-tighter">{(station.powerOutput || 0).toFixed(1)}</span>
                             <span className="text-[10px] font-black text-white/20 uppercase">kW</span>
                          </div>
                          <div className="w-16 h-1.5 bg-white/5 rounded-full mt-2 overflow-hidden">
                             <div 
                               className="h-full bg-siam-green rounded-full" 
                               style={{ width: `${Math.min(100, ((station.powerOutput || 0) / parseInt(station.powerLimit || "22")) * 100)}%` }}
                             />
                          </div>
                       </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                       <div className="flex flex-col items-center">
                          <div className="flex items-center gap-1.5">
                             <Battery size={14} className="text-white/40" />
                             <span className="text-lg font-black text-white tracking-tighter">{(station.currentMeter || 0).toFixed(1)}</span>
                             <span className="text-[10px] font-black text-white/20 uppercase">kWh</span>
                          </div>
                       </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                       <div className="flex items-center justify-end gap-3">
                          <button className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-all active:scale-90">
                             <MoreVertical size={16} />
                          </button>
                          <button className="p-2.5 rounded-xl bg-siam-green/10 border border-siam-green/20 text-siam-green hover:bg-siam-green hover:text-black transition-all active:scale-90 overflow-hidden group/btn relative">
                             <ArrowRight size={16} />
                          </button>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="flex justify-center pb-12">
           <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">End of Fleet Registry</p>
        </div>
      </div>
    </div>
  );
}
