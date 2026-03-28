"use client";

import React, { useEffect, useState, useImperativeHandle, forwardRef } from "react";
import { Plus, Minus, Target, Map as MapIcon } from "lucide-react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import type { Station, Facility, Truck, LayerVisibility } from "@/app/remote-control/types";

const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false });
const Polyline = dynamic(() => import("react-leaflet").then((mod) => mod.Polyline), { ssr: false });

interface MapViewportProps {
  stations: Station[];
  facilities: Facility[];
  trucks: Truck[];
  layers: LayerVisibility;
  loading?: boolean;
  selectedStationId?: string | null;
  selectedFacilityId?: string | null;
  selectedTruckId?: string | null;
  onStationClick?: (id: string | null) => void;
  onFacilityClick?: (id: string | null) => void;
  onTruckClick?: (id: string | null) => void;
}

export const MapViewport = forwardRef(({
  stations, facilities, trucks, layers,
  loading,
  selectedStationId, selectedFacilityId, selectedTruckId,
  onStationClick, onFacilityClick, onTruckClick,
}: MapViewportProps, ref) => {
  const [L, setL] = useState<any>(null);
  const [map, setMap] = useState<any>(null);
  const [mapStyle, setMapStyle] = useState<"satellite" | "roadmap">("satellite");

  useEffect(() => {
    import("leaflet").then((mod) => setL(mod.default));
  }, []);

  useImperativeHandle(ref, () => ({
    zoomIn: () => map?.zoomIn(),
    zoomOut: () => map?.zoomOut(),
    centerMap: () => map?.flyTo([13.7367, 100.5232], 12, { duration: 1.5 }),
  }));

  if (!L || loading) {
    return (
      <div className="absolute inset-0 z-0 bg-[#081326] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-white/10 border-t-siam-green rounded-full animate-spin" />
      </div>
    );
  }

  const center: [number, number] = [13.7367, 100.5232];

  // --- EV Station Icons ---
  const createStationIcon = (status: string, isSelected: boolean) => {
    const color = status === "Available" ? "#00e676" : status === "Charging" ? "#3b82f6" : "#ef4444";
    const ring = isSelected ? "rgba(255,255,255,1)" : "rgba(255,255,255,0.3)";
    const shadowSize = isSelected ? "15px" : "6px";
    
    // Custom EV Charger SVG matching the reference (fuel-pump style EV point)
    const evSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Pedestal Body -->
      <path d="M14 22H4V5C4 3.895 4.895 3 6 3H12C13.105 3 14 3.895 14 5V22Z" fill="${color}"/>
      <!-- Base Line -->
      <path d="M2 22H16" stroke="${color}" stroke-width="2" stroke-linecap="round"/>
      <!-- Screen cut-out -->
      <rect x="6" y="5" width="6" height="3" rx="0.5" fill="#081326"/>
      <!-- Lightning cut-out -->
      <path d="M10.5 9L7.5 14H10L8.5 18L12 12H9.5L10.5 9Z" fill="#081326"/>
      <!-- Cable -->
      <path d="M14 8H18C19.1046 8 20 8.89543 20 10V13C20 14.1046 19.1046 15 18 15H17" stroke="${color}" stroke-width="1.5" fill="none"/>
      <!-- Plug Body -->
      <path d="M16 15H18V18C18 18.5523 17.5523 19 17 19C16.4477 19 16 18.5523 16 18V15Z" fill="${color}"/>
      <path d="M17 19V20.5" stroke="${color}" stroke-width="1.5" stroke-linecap="round"/>
    </svg>`;

    return L.divIcon({
      className: "custom-leaflet-marker",
      html: `<div class="relative flex flex-col items-center">
        ${isSelected ? '<div class="absolute -inset-6 bg-siam-green/10 blur-xl rounded-full"></div>' : ""}
        <div class="flex items-center justify-center rounded-xl shadow-2xl ring-2 transition-all duration-500 ${isSelected ? "scale-125 z-40" : "hover:scale-110"}"
             style="width:40px;height:44px;background:rgba(8,19,38,0.92);border:2px solid ${ring};box-shadow:0 0 ${shadowSize} ${color}55;">
          ${evSvg}
        </div>
        <div class="mt-1 px-1.5 py-0.5 rounded text-[7px] font-black uppercase tracking-wider" style="background:rgba(8,19,38,0.85);color:${color};border:1px solid ${color}33;">${status.substring(0, 4)}</div>
      </div>`,
      iconSize: [40, 56],
      iconAnchor: [20, 22],
    });
  };

  // --- Facility Icons ---
  const createFacilityIcon = (facility: Facility, isSelected: boolean) => {
    const color = facility.status === "Normal" ? "#3bae49" : facility.status === "High Usage" ? "#fbbf24" : facility.status === "Critical" ? "#ef4444" : "#666";
    const ring = isSelected ? "rgba(255,255,255,1)" : "rgba(255,255,255,0.3)";
    const size = isSelected ? 48 : 40;

    return L.divIcon({
      className: "custom-leaflet-marker",
      html: `<div class="relative flex flex-col items-center">
        ${isSelected ? '<div class="absolute -inset-6 bg-amber-400/10 blur-xl rounded-full"></div>' : ""}
        <div class="flex items-center justify-center rounded-xl shadow-2xl ring-2 transition-all duration-500 ${isSelected ? "scale-110 z-40" : "hover:scale-105"}"
             style="width:${size}px;height:${size}px;background:rgba(8,19,38,0.9);border:2px solid ${ring};box-shadow:0 0 8px ${color}44;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>
        </div>
        <div class="mt-1 px-1.5 py-0.5 rounded text-[7px] font-black uppercase tracking-wider" style="background:rgba(8,19,38,0.85);color:${color};border:1px solid ${color}33;">${facility.type.substring(0, 4)}</div>
      </div>`,
      iconSize: [size, size + 16],
      iconAnchor: [size / 2, size / 2],
    });
  };

  // --- Truck Icons (red parcel truck) ---
  const createTruckIcon = (truck: Truck, isSelected: boolean) => {
    const ring = isSelected ? "rgba(255,255,255,1)" : "rgba(255,255,255,0.3)";
    const truckColor = "#ef4444"; // always red
    const glowSize = isSelected ? "15px" : "6px";

    // Parcel truck SVG — side-view delivery truck silhouette
    const truckSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1 12.5V17a1 1 0 001 1h1.05a2.5 2.5 0 004.9 0h6.1a2.5 2.5 0 004.9 0H20a1 1 0 001-1v-5a1 1 0 00-.3-.7l-3-3A1 1 0 0017 8h-2V6a1 1 0 00-1-1H3a1 1 0 00-1 1v6.5z" fill="${truckColor}"/>
      <path d="M15 8h2l3 3v4h-5V8z" fill="#b91c1c"/>
      <circle cx="5.5" cy="18" r="1.5" fill="#1e293b" stroke="${truckColor}" stroke-width="0.5"/>
      <circle cx="17.5" cy="18" r="1.5" fill="#1e293b" stroke="${truckColor}" stroke-width="0.5"/>
      <rect x="2" y="7" width="5" height="3" rx="0.5" fill="#fca5a5" opacity="0.6"/>
      <rect x="8" y="7" width="4" height="3" rx="0.5" fill="#fca5a5" opacity="0.4"/>
    </svg>`;

    return L.divIcon({
      className: "custom-leaflet-marker",
      html: `<div class="relative flex flex-col items-center">
        ${isSelected ? '<div class="absolute -inset-6 bg-red-400/15 blur-xl rounded-full"></div>' : ""}
        <div class="flex items-center justify-center rounded-xl shadow-2xl ring-2 transition-all duration-500 ${isSelected ? "scale-125 z-40" : "hover:scale-110"}"
             style="width:46px;height:36px;background:rgba(8,19,38,0.92);border:2px solid ${ring};box-shadow:0 0 ${glowSize} ${truckColor}55;">
          ${truckSvg}
        </div>
        <div class="mt-1 px-1.5 py-0.5 rounded text-[7px] font-black uppercase tracking-wider" style="background:rgba(8,19,38,0.85);color:${truckColor};border:1px solid ${truckColor}33;">${truck.speed}km/h</div>
      </div>`,
      iconSize: [46, 52],
      iconAnchor: [23, 18],
    });
  };

  // Route polyline color
  const routeColor = (status: string) =>
    status === "En Route" ? "#3b82f6" : status === "Returning" ? "#22d3ee" : "#fbbf2480";

  return (
    <div className="absolute inset-0 z-0 bg-[#081326]">
      <MapContainer
        center={center}
        zoom={12}
        scrollWheelZoom={true}
        zoomControl={false}
        className="w-full h-full grayscale-[0.2] brightness-[0.75]"
        style={{ background: "#081326" }}
        ref={setMap}
      >
        <TileLayer
          attribution='&copy; Google'
          url={mapStyle === "satellite" ? "https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}" : "https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"}
        />

        {/* === EV Stations Layer === */}
        {layers.EV && stations.map((station) => {
          const isSelected = station.id === selectedStationId;
          return (
            <Marker
              key={`ev-${station.id}-${isSelected}-${station.status}`}
              position={[station.lat, station.lng]}
              icon={createStationIcon(station.status, isSelected)}
              eventHandlers={{ click: () => onStationClick?.(station.id) }}
            >
              <Popup className="glass-popup">
                <div className="bg-[#050b14]/90 backdrop-blur-md text-white p-3 rounded-xl border border-white/10 min-w-[160px] shadow-2xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">{station.id.replace("station-", "").toUpperCase()}</span>
                    <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${station.status === "Available" ? "bg-siam-green text-black" : station.status === "Charging" ? "bg-blue-500 text-white" : "bg-red-500 text-white"}`}>{station.status}</span>
                  </div>
                  <h4 className="text-[11px] font-bold text-white mb-2 uppercase leading-snug">{station.name}</h4>
                  <div className="space-y-2 border-t border-white/10 pt-2">
                    <div className="flex justify-between"><span className="text-[8px] text-white/40 font-black uppercase">Live Power</span><span className="text-[10px] font-black text-siam-green">{(station.powerOutput || 0).toFixed(1)} kW</span></div>
                    <div className="flex justify-between"><span className="text-[8px] text-white/40 font-black uppercase">Energy Used</span><span className="text-[10px] font-black text-white">{(station.currentMeter || 0).toFixed(1)} kWh</span></div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* === Facilities Layer === */}
        {layers.FACILITIES && facilities.map((facility) => {
          const isSelected = facility.id === selectedFacilityId;
          return (
            <Marker
              key={`fac-${facility.id}-${isSelected}-${facility.status}`}
              position={[facility.lat, facility.lng]}
              icon={createFacilityIcon(facility, isSelected)}
              eventHandlers={{ click: () => onFacilityClick?.(facility.id) }}
            >
              <Popup className="glass-popup">
                <div className="bg-[#050b14]/90 backdrop-blur-md text-white p-3 rounded-xl border border-white/10 min-w-[180px] shadow-2xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">{facility.type}</span>
                    <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${facility.status === "Normal" ? "bg-siam-green/20 text-siam-green" : facility.status === "High Usage" ? "bg-amber-400/20 text-amber-400" : facility.status === "Critical" ? "bg-red-500/20 text-red-400" : "bg-white/10 text-white/40"}`}>{facility.status}</span>
                  </div>
                  <h4 className="text-[11px] font-bold text-white mb-2 uppercase leading-snug">{facility.name}</h4>
                  <div className="space-y-2 border-t border-white/10 pt-2">
                    <div className="flex justify-between"><span className="text-[8px] text-white/40 font-black uppercase">Power</span><span className="text-[10px] font-black text-amber-400">{facility.currentPower.toFixed(0)} kW</span></div>
                    <div className="flex justify-between"><span className="text-[8px] text-white/40 font-black uppercase">Daily</span><span className="text-[10px] font-black text-white">{(facility.dailyEnergy / 1000).toFixed(1)} MWh</span></div>
                    <div className="flex justify-between"><span className="text-[8px] text-white/40 font-black uppercase">Zones</span><span className="text-[10px] font-black text-white">{facility.zones.length}</span></div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* === Fleet Layer: Route Polylines === */}
        {layers.FLEET && trucks.map((truck) => {
          if ((truck.status === "En Route" || truck.status === "Returning") && truck.route.waypoints.length > 0) {
            const routePoints: [number, number][] = [
              [truck.route.origin.lat, truck.route.origin.lng],
              ...truck.route.waypoints.map((w) => [w.lat, w.lng] as [number, number]),
              [truck.route.destination.lat, truck.route.destination.lng],
            ];
            return (
              <Polyline
                key={`route-${truck.id}`}
                positions={routePoints}
                pathOptions={{
                  color: routeColor(truck.status),
                  weight: 3,
                  opacity: 0.6,
                  dashArray: "8, 12",
                  lineCap: "round",
                }}
              />
            );
          }
          return null;
        })}

        {/* === Fleet Layer: Truck Markers === */}
        {layers.FLEET && trucks.map((truck) => {
          const isSelected = truck.id === selectedTruckId;
          return (
            <Marker
              key={`truck-${truck.id}-${isSelected}-${truck.status}-${truck.lat}`}
              position={[truck.lat, truck.lng]}
              icon={createTruckIcon(truck, isSelected)}
              eventHandlers={{ click: () => onTruckClick?.(truck.id) }}
            >
              <Popup className="glass-popup">
                <div className="bg-[#050b14]/90 backdrop-blur-md text-white p-3 rounded-xl border border-white/10 min-w-[180px] shadow-2xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">{truck.driverName}</span>
                    <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${truck.status === "En Route" ? "bg-blue-500/20 text-blue-400" : truck.status === "Returning" ? "bg-cyan-400/20 text-cyan-400" : truck.status === "Loading" ? "bg-amber-400/20 text-amber-400" : truck.status === "Idle" ? "bg-siam-green/20 text-siam-green" : "bg-red-500/20 text-red-400"}`}>{truck.status}</span>
                  </div>
                  <h4 className="text-[11px] font-bold text-white mb-2 uppercase leading-snug">{truck.name}</h4>
                  <div className="space-y-2 border-t border-white/10 pt-2">
                    <div className="flex justify-between"><span className="text-[8px] text-white/40 font-black uppercase">Load</span><span className="text-[10px] font-black text-cyan-400">{truck.loadPercent}% ({truck.parcelsLoaded}/{truck.parcelsCapacity})</span></div>
                    <div className="flex justify-between"><span className="text-[8px] text-white/40 font-black uppercase">Available</span><span className="text-[10px] font-black text-siam-green">{truck.parcelsAvailable} slots</span></div>
                    {truck.route.eta !== "-" && <div className="flex justify-between"><span className="text-[8px] text-white/40 font-black uppercase">ETA</span><span className="text-[10px] font-black text-white">{truck.route.eta}</span></div>}
                    <div className="flex justify-between"><span className="text-[8px] text-white/40 font-black uppercase">Speed</span><span className="text-[10px] font-black text-white">{truck.speed} km/h</span></div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Map Label Overlay */}
      <div className="absolute top-6 left-6 z-[1001] pointer-events-none hidden md:flex flex-col gap-1.5 backdrop-blur-md bg-black/40 p-4 rounded-xl border border-white/10 shadow-3xl">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-siam-green animate-pulse" />
          <span className="text-[10px] font-black text-white/50 tracking-[0.2em] uppercase">Status Check: Normal</span>
        </div>
        <span className="text-[10px] font-manrope font-black uppercase tracking-[0.3em] text-siam-green/95 drop-shadow-[0_0_5px_rgba(0,230,118,0.3)]">
          Bangkok Operational Hub • Google {mapStyle === "satellite" ? "Satellite" : "Road Map"}
        </span>
      </div>

      <div className="absolute bottom-6 left-6 z-[1001] pointer-events-none hidden md:flex flex-col gap-1.5">
        <div className="w-24 h-[2px] bg-white/60" />
        <span className="text-[10px] font-black text-white/80 tracking-widest uppercase">Live Operational View</span>
      </div>

      {/* Zoom Controls */}
      <div className="absolute right-6 top-1/2 -translate-y-1/2 z-[1001] flex flex-col gap-2">
        <button onClick={() => map?.zoomIn()} className="w-10 h-10 glass rounded-xl flex items-center justify-center border border-white/10 text-white/60 hover:text-white hover:bg-white/10 active:scale-90 transition-all shadow-2xl" title="Zoom In">
          <Plus size={18} />
        </button>
        <button
          onClick={() => {
            if (!map || !L) return;
            const allPoints: [number, number][] = [];
            if (layers.EV) stations.forEach((s) => allPoints.push([s.lat, s.lng]));
            if (layers.FACILITIES) facilities.forEach((f) => allPoints.push([f.lat, f.lng]));
            if (layers.FLEET) trucks.forEach((t) => allPoints.push([t.lat, t.lng]));
            if (allPoints.length > 0) {
              const bounds = L.latLngBounds(allPoints);
              map.flyToBounds(bounds, { padding: [50, 50], duration: 1.5 });
            }
          }}
          className="w-10 h-10 glass rounded-xl flex items-center justify-center border border-white/10 text-siam-green hover:bg-white/10 active:scale-90 transition-all shadow-2xl" title="Zoom to All"
        >
          <Target size={18} />
        </button>
        <button onClick={() => map?.zoomOut()} className="w-10 h-10 glass rounded-xl flex items-center justify-center border border-white/10 text-white/60 hover:text-white hover:bg-white/10 active:scale-90 transition-all shadow-2xl" title="Zoom Out">
          <Minus size={18} />
        </button>
        <div className="w-10 h-px bg-white/10 my-1" />
        <button 
          onClick={() => setMapStyle(prev => prev === "satellite" ? "roadmap" : "satellite")} 
          className="w-10 h-10 glass rounded-xl flex items-center justify-center border border-white/10 text-cyan-400 hover:bg-white/10 active:scale-90 transition-all shadow-2xl cursor-pointer" title="Toggle Map Style"
        >
          <MapIcon size={18} />
        </button>
      </div>

      <style jsx global>{`
        .custom-leaflet-marker {
          background: transparent !important;
          border: none !important;
        }
      `}</style>
    </div>
  );
});

MapViewport.displayName = "MapViewport";
