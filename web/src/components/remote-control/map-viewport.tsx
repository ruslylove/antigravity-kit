"use client";

import React, { useEffect, useState, useImperativeHandle, forwardRef } from "react";
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
      <div className="absolute inset-0 z-0 bg-[#0c1a1f] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-white/10 border-t-arb-primary rounded-full animate-spin" />
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
    <div className="absolute inset-0 z-0 bg-[#0c1a1f]">
      <MapContainer 
        center={center} 
        zoom={13} 
        scrollWheelZoom={true} 
        zoomControl={false}
        className="w-full h-full grayscale-[0.2] brightness-[0.75]"
        style={{ background: '#0c1a1f' }}
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
                dblclick: () => {
                  map?.flyTo([station.lat, station.lng], 16, {
                    duration: 1.5,
                    easeLinearity: 0.25
                  });
                }
              }}
            >
              <Popup className="glass-popup">
                <div className="p-3 space-y-1.5 min-w-[140px]">
                   <h4 className="text-[11px] font-black tracking-widest text-[#00e676] uppercase flex items-center gap-1.5">
                     <span className="w-1.5 h-1.5 rounded-full bg-arb-primary shadow-[0_0_8px_#00e676]"></span>
                     {station.id.replace('station-', '').toUpperCase()}
                   </h4>
                   <p className="text-[12px] text-white font-black uppercase tracking-tight leading-tight">{station.name}</p>
                   <div className="pt-1.5 border-t border-white/10 flex justify-between items-center">
                     <span className="text-[9px] font-bold text-white/50 uppercase">Power</span>
                     <span className="text-[10px] font-black text-arb-primary">{station.powerLimit}</span>
                   </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Map Content Label (Overlay) */}
      <div className="absolute top-24 left-1/2 -translate-x-1/2 glass px-6 py-2 rounded-full z-[1001] pointer-events-none transition-all duration-500">
        <span className="text-[10px] font-manrope font-black uppercase tracking-[0.3em] text-arb-primary/95 drop-shadow-[0_0_5px_rgba(0,230,118,0.3)]">
          Bangkok Operational Hub • Google Satellite
        </span>
      </div>

      <div className="absolute bottom-6 left-6 flex flex-col gap-1 z-[1001] pointer-events-none">
        <div className="w-24 h-[2px] bg-white/60" />
        <span className="text-[10px] font-black text-white/80 tracking-widest uppercase">Live Operational View</span>
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
