"use client";

import React from "react";
import { Truck as TruckIcon, Package, Navigation, Clock, ArrowRight, MoreVertical, User } from "lucide-react";
import type { Truck } from "@/app/remote-control/types";

interface FleetTableViewProps {
  trucks: Truck[];
  selectedTruckId: string | null;
  onTruckClick: (id: string | null) => void;
}

export function FleetTableView({ trucks, selectedTruckId, onTruckClick }: FleetTableViewProps) {
  const statusColor = (s: string) =>
    s === "En Route" ? "bg-blue-500 text-blue-400" :
    s === "Returning" ? "bg-cyan-400 text-cyan-400" :
    s === "Loading" ? "bg-amber-400 text-amber-400" :
    s === "Idle" ? "bg-siam-green text-siam-green" :
    "bg-red-500 text-red-500";

  return (
    <div className="absolute inset-0 bg-[#061114] p-6 pt-24 md:p-12 md:pt-32 overflow-y-auto no-scrollbar z-0">
      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee]" />
              <span className="text-[10px] font-black tracking-[0.3em] uppercase text-white/40">GPS Tracking</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-manrope font-black text-white uppercase tracking-tighter">
              Fleet <span className="text-cyan-400">Vehicles</span>
            </h1>
          </div>
          <div className="flex gap-4">
            <div className="glass p-3 px-6 rounded-2xl border border-white/5 flex items-center gap-3">
              <div className="text-right">
                <p className="text-[8px] font-black text-white/30 uppercase tracking-widest">Total Trucks</p>
                <p className="text-xl font-black text-white leading-none">{trucks.length}</p>
              </div>
              <TruckIcon size={20} className="text-cyan-400/40" />
            </div>
          </div>
        </div>

        <div className="glass shadow-3xl rounded-[2.5rem] border border-white/10 overflow-hidden backdrop-blur-3xl bg-black/40">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-white/[0.03] border-b border-white/10">
                  <th className="px-6 py-6 text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Vehicle</th>
                  <th className="px-6 py-6 text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Driver</th>
                  <th className="px-6 py-6 text-[10px] font-black text-white/40 uppercase tracking-[0.2em] text-center">Status</th>
                  <th className="px-6 py-6 text-[10px] font-black text-white/40 uppercase tracking-[0.2em] text-center">Load</th>
                  <th className="px-6 py-6 text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Route</th>
                  <th className="px-6 py-6 text-[10px] font-black text-white/40 uppercase tracking-[0.2em] text-center">ETA</th>
                  <th className="px-6 py-6 text-[10px] font-black text-white/40 uppercase tracking-[0.2em] text-center">Available</th>
                  <th className="px-6 py-6 text-[10px] font-black text-white/40 uppercase tracking-[0.2em] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {trucks.map((t) => (
                  <tr
                    key={t.id}
                    onClick={() => onTruckClick(t.id)}
                    className={`group cursor-pointer hover:bg-white/[0.03] transition-all duration-300 ${selectedTruckId === t.id ? "bg-cyan-400/5 border-l-4 border-l-cyan-400" : ""}`}
                  >
                    <td className="px-6 py-6">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-white uppercase tracking-tight group-hover:text-cyan-400 transition-colors">{t.name}</span>
                        <span className="text-[9px] font-mono text-white/20 mt-0.5">{t.lat.toFixed(4)}, {t.lng.toFixed(4)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-2">
                        <User size={12} className="text-white/20" />
                        <span className="text-[11px] font-black text-white/60">{t.driverName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center justify-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${statusColor(t.status).split(" ")[0]} ${(t.status === "En Route" || t.status === "Returning") ? "animate-pulse" : ""}`} />
                        <span className={`text-[10px] font-black uppercase tracking-widest ${statusColor(t.status).split(" ")[1]}`}>{t.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-center">
                      <div className="flex flex-col items-center gap-1.5">
                        <div className="flex gap-0.5">
                          {[0, 1, 2, 3, 4].map((i) => (
                            <div key={i} className={`w-4 h-2 rounded-sm ${i < t.loadLevel ? (t.loadLevel <= 2 ? "bg-siam-green" : t.loadLevel <= 4 ? "bg-amber-400" : "bg-red-400") : "bg-white/10"}`} />
                          ))}
                        </div>
                        <span className="text-[9px] font-black text-white/40">{t.loadPercent}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      {(t.status === "En Route" || t.status === "Returning") ? (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-white/60 font-bold truncate max-w-[100px]">{t.route.origin.name}</span>
                          <ArrowRight size={10} className="text-white/20 shrink-0" />
                          <span className="text-[10px] text-white/60 font-bold truncate max-w-[100px]">{t.route.destination.name}</span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-white/30 font-bold">{t.route.origin.name}</span>
                      )}
                    </td>
                    <td className="px-6 py-6 text-center">
                      {t.route.eta !== "-" ? (
                        <div className="flex items-center justify-center gap-1">
                          <Clock size={11} className="text-white/30" />
                          <span className="text-sm font-black text-cyan-400">{t.route.eta}</span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-white/20">—</span>
                      )}
                    </td>
                    <td className="px-6 py-6 text-center">
                      <span className={`text-sm font-black ${t.parcelsAvailable > 0 ? "text-cyan-400" : "text-red-400"}`}>{t.parcelsAvailable}</span>
                      <span className="text-[9px] text-white/20 ml-1">slots</span>
                    </td>
                    <td className="px-6 py-6 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-all active:scale-90"><MoreVertical size={16} /></button>
                        <button className="p-2.5 rounded-xl bg-cyan-400/10 border border-cyan-400/20 text-cyan-400 hover:bg-cyan-400 hover:text-black transition-all active:scale-90"><ArrowRight size={16} /></button>
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
