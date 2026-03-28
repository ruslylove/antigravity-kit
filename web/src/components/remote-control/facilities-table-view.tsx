"use client";

import React from "react";
import { Building2, Zap, Gauge, TrendingUp, ArrowRight, MoreVertical } from "lucide-react";
import type { Facility } from "@/app/remote-control/types";

interface FacilitiesTableViewProps {
  facilities: Facility[];
  selectedFacilityId: string | null;
  onFacilityClick: (id: string | null) => void;
}

export function FacilitiesTableView({ facilities, selectedFacilityId, onFacilityClick }: FacilitiesTableViewProps) {
  const statusColor = (s: string) =>
    s === "Normal" ? "bg-siam-green text-siam-green" :
    s === "High Usage" ? "bg-amber-400 text-amber-400" :
    s === "Critical" ? "bg-red-500 text-red-500" :
    "bg-white/30 text-white/30";

  return (
    <div className="absolute inset-0 bg-[#061114] p-6 pt-24 md:p-12 md:pt-32 overflow-y-auto no-scrollbar z-0">
      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_10px_#fbbf24]" />
              <span className="text-[10px] font-black tracking-[0.3em] uppercase text-white/40">Energy Monitor</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-manrope font-black text-white uppercase tracking-tighter">
              Facility <span className="text-amber-400">Sites</span>
            </h1>
          </div>
          <div className="flex gap-4">
            <div className="glass p-3 px-6 rounded-2xl border border-white/5 flex items-center gap-3">
              <div className="text-right">
                <p className="text-[8px] font-black text-white/30 uppercase tracking-widest">Total Sites</p>
                <p className="text-xl font-black text-white leading-none">{facilities.length}</p>
              </div>
              <Building2 size={20} className="text-amber-400/40" />
            </div>
          </div>
        </div>

        <div className="glass shadow-3xl rounded-[2.5rem] border border-white/10 overflow-hidden backdrop-blur-3xl bg-black/40">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-white/[0.03] border-b border-white/10">
                  <th className="px-8 py-6 text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Facility</th>
                  <th className="px-8 py-6 text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Type</th>
                  <th className="px-8 py-6 text-[10px] font-black text-white/40 uppercase tracking-[0.2em] text-center">Status</th>
                  <th className="px-8 py-6 text-[10px] font-black text-white/40 uppercase tracking-[0.2em] text-center">Power Draw</th>
                  <th className="px-8 py-6 text-[10px] font-black text-white/40 uppercase tracking-[0.2em] text-center">Daily Energy</th>
                  <th className="px-8 py-6 text-[10px] font-black text-white/40 uppercase tracking-[0.2em] text-center">PUE</th>
                  <th className="px-8 py-6 text-[10px] font-black text-white/40 uppercase tracking-[0.2em] text-center">Zones</th>
                  <th className="px-8 py-6 text-[10px] font-black text-white/40 uppercase tracking-[0.2em] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {facilities.map((f) => (
                  <tr
                    key={f.id}
                    onClick={() => onFacilityClick(f.id)}
                    className={`group cursor-pointer hover:bg-white/[0.03] transition-all duration-300 ${selectedFacilityId === f.id ? "bg-amber-400/5 border-l-4 border-l-amber-400" : ""}`}
                  >
                    <td className="px-8 py-6">
                      <span className="text-sm font-black text-white uppercase tracking-tight group-hover:text-amber-400 transition-colors">{f.name}</span>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-[10px] font-black text-white/40 uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">{f.type}</span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center justify-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${statusColor(f.status).split(" ")[0]}`} />
                        <span className={`text-[10px] font-black uppercase tracking-widest ${statusColor(f.status).split(" ")[1]}`}>{f.status}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <div className="flex flex-col items-center">
                        <div className="flex items-center gap-1.5">
                          <Zap size={14} className={f.currentPower > f.capacity * 0.8 ? "text-red-500" : "text-amber-400"} />
                          <span className="text-lg font-black text-white tracking-tighter">{f.currentPower.toFixed(0)}</span>
                          <span className="text-[10px] font-black text-white/20">kW</span>
                        </div>
                        <div className="w-16 h-1.5 bg-white/5 rounded-full mt-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${(f.currentPower / f.capacity) > 0.8 ? "bg-red-500" : (f.currentPower / f.capacity) > 0.6 ? "bg-amber-400" : "bg-siam-green"}`}
                            style={{ width: `${Math.min(100, (f.currentPower / f.capacity) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <TrendingUp size={14} className="text-white/30" />
                        <span className="text-lg font-black text-white tracking-tighter">{(f.dailyEnergy / 1000).toFixed(1)}</span>
                        <span className="text-[10px] font-black text-white/20">MWh</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className={`text-sm font-black ${f.pue > 1.5 ? "text-amber-400" : "text-siam-green"}`}>{f.pue}</span>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className="text-sm font-black text-white/50">{f.zones.length}</span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-all active:scale-90"><MoreVertical size={16} /></button>
                        <button className="p-2.5 rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-400 hover:bg-amber-400 hover:text-black transition-all active:scale-90"><ArrowRight size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-center pb-12">
          <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">End of Facility Registry</p>
        </div>
      </div>
    </div>
  );
}
