"use client";

import React, { useEffect, useState, useImperativeHandle, forwardRef } from "react";
import { Plus, Minus, Target } from "lucide-react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

// Dynamic import for the MapContainer and basic components
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false });

interface Station {
  id: string;
  name: string;
  lat: number;
  lng: number;
  status: "Available" | "Charging" | "Faulted" | string;
  powerLimit: string;
  powerOutput?: number; // Added for telemetry
  currentMeter?: number; // Added for telemetry
}

interface MapViewportProps {
  stations: Station[];
  loading?: boolean;
  selectedStationId?: string | null;
  onStationClick?: (id: string | null) => void;
}

export const MapViewport = forwardRef(({ stations, loading, selectedStationId, onStationClick }: MapViewportProps, ref) => {
  const [L, setL] = useState<any>(null);
  const [map, setMap] = useState<any>(null);

  useEffect(() => {
    // Import Leaflet on the client side
    import("leaflet").then((mod) => {
      setL(mod.default);
    });
  }, []);

  // Expose map controls to the parent component
  useImperativeHandle(ref, () => ({
    zoomIn: () => map?.zoomIn(),
    zoomOut: () => map?.zoomOut(),
    centerMap: () => {
        map?.flyTo([13.7367, 100.5232], 13, { duration: 1.5 });
    }
  }));

  if (!L || loading) {
    return (
      <div className="absolute inset-0 z-0 bg-[#081326] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-white/10 border-t-siam-green rounded-full animate-spin" />
      </div>
    );
  }

  // Bangkok Center
  const center: [number, number] = [13.7367, 100.5232];

  // Custom Icon Factory
  const createCustomIcon = (status: string, isSelected: boolean) => {
    const activeColor = status === "Available" ? "#00e676" : status === "Charging" ? "#3b82f6" : "#ef4444";
    const ringColor = isSelected ? "rgba(255, 255, 255, 1)" : "rgba(255, 255, 255, 0.4)";
    const shadowSize = isSelected ? '15px' : '5px';

    const iconHtml = `
      <div class="relative flex flex-col items-center">
        ${isSelected ? `<div class="absolute -inset-8 bg-blue-500/10 blur-2xl rounded-full scale-125"></div>` : ''}
        <div class="w-10 h-10 rounded-full flex items-center justify-center shadow-3xl ring-2 transition-all duration-500 ${isSelected ? 'scale-125 z-40' : 'scale-100 hover:scale-110'}" 
             style="background-color: ${activeColor}; color: ${status === 'Available' ? 'black' : 'white'}; border: 2px solid ${ringColor}; box-shadow: 0 0 ${shadowSize} ${activeColor}44;">
          ${status === 'Available' ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>' : 
            status === 'Charging' ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M13 2L3 14h9l-1 8L21 10h-9l1-8z"></path></svg>' : 
            '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>'
          }
        </div>
      </div>
    `;

    return L.divIcon({
      className: 'custom-leaflet-marker',
      html: iconHtml,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });
  };

  return (
    <div className="absolute inset-0 z-0 bg-[#081326]">
      <MapContainer 
        center={center} 
        zoom={13} 
        scrollWheelZoom={true} 
        zoomControl={false}
        className="w-full h-full grayscale-[0.2] brightness-[0.75]"
        style={{ background: '#081326' }}
        ref={setMap}
      >
        <TileLayer
          attribution='&copy; Google'
          url="https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
        />

        {stations.map((station) => {
          const isSelected = station.id === selectedStationId;
          return (
            <Marker 
              key={`${station.id}-${isSelected}-${station.status}`} 
              position={[station.lat, station.lng]} 
              icon={createCustomIcon(station.status, isSelected)}
              eventHandlers={{
                click: () => onStationClick?.(station.id),
              }}
            >
              <Popup className="glass-popup">
                <div className="bg-[#050b14]/90 backdrop-blur-md text-white p-3 rounded-xl border border-white/10 min-w-[160px] shadow-2xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">{station.id.replace('station-', '').toUpperCase()}</span>
                    <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${station.status === 'Available' ? 'bg-siam-green text-black' : 'bg-blue-500 text-white'}`}>
                      {station.status}
                    </span>
                  </div>
                  <h4 className="text-[11px] font-bold text-white mb-2 uppercase leading-snug">{station.name}</h4>
                  
                  <div className="space-y-2 border-t border-white/10 pt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[8px] text-white/40 font-black uppercase tracking-tight">Live Power</span>
                      <span className="text-[10px] font-black text-siam-green">{(station.powerOutput || 0).toFixed(1)} kW</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[8px] text-white/40 font-black uppercase tracking-tight">Energy Used</span>
                      <span className="text-[10px] font-black text-white">{(station.currentMeter || 0).toFixed(1)} kWh</span>
                    </div>
                    <div className="flex justify-between items-center opacity-60">
                      <span className="text-[8px] text-white/40 font-black uppercase tracking-tight">Max Limit</span>
                      <span className="text-[9px] font-bold text-white/80">{station.powerLimit}</span>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Map Content Label (Overlay) */}
      <div className="absolute top-6 left-6 z-[1001] pointer-events-none hidden md:flex flex-col gap-1.5 backdrop-blur-md bg-black/40 p-4 rounded-xl border border-white/10 shadow-3xl">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-siam-green animate-pulse" />
          <span className="text-[10px] font-black text-white/50 tracking-[0.2em] uppercase">Status Check: Normal</span>
        </div>
        <span className="text-[10px] font-manrope font-black uppercase tracking-[0.3em] text-siam-green/95 drop-shadow-[0_0_5px_rgba(0,230,118,0.3)]">
          Bangkok Operational Hub • Google Satellite
        </span>
      </div>

      <div className="absolute bottom-6 left-6 z-[1001] pointer-events-none hidden md:flex flex-col gap-1.5">
        <div className="w-24 h-[2px] bg-white/60" />
        <span className="text-[10px] font-black text-white/80 tracking-widest uppercase">Live Operational View</span>
      </div>

      {/* Manual Zoom Controls */}
      <div className="absolute right-6 top-1/2 -translate-y-1/2 z-[1001] flex flex-col gap-2">
        <button 
          onClick={() => map?.zoomIn()}
          className="w-10 h-10 glass rounded-xl flex items-center justify-center border border-white/10 text-white/60 hover:text-white hover:bg-white/10 active:scale-90 transition-all shadow-2xl"
          title="Zoom In"
        >
          <Plus size={18} />
        </button>
        
        <button 
          onClick={() => {
            if (map && stations.length > 0 && L) {
              const bounds = L.latLngBounds(stations.map(s => [s.lat, s.lng]));
              map.flyToBounds(bounds, { padding: [50, 50], duration: 1.5 });
            }
          }}
          className="w-10 h-10 glass rounded-xl flex items-center justify-center border border-white/10 text-siam-green hover:bg-white/10 active:scale-90 transition-all shadow-2xl"
          title="Zoom to All Nodes"
        >
          <Target size={18} />
        </button>

        <button 
          onClick={() => map?.zoomOut()}
          className="w-10 h-10 glass rounded-xl flex items-center justify-center border border-white/10 text-white/60 hover:text-white hover:bg-white/10 active:scale-90 transition-all shadow-2xl"
          title="Zoom Out"
        >
          <Minus size={18} />
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
