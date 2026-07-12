"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  RefreshCw,
  Terminal,
  Trash2,
  Filter,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Copy,
  Wifi,
  WifiOff,
  Search,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { LogEntry } from "@/lib/logStore";

interface DevLogsConsoleProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DevLogsConsole({ isOpen, onClose }: DevLogsConsoleProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedType, setSelectedType] = useState<"ALL" | "HTTP" | "MQTT">("ALL");
  const [selectedLevel, setSelectedLevel] = useState<"ALL" | "INFO" | "WARN" | "ERROR" | "DEBUG">("ALL");
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [isLive, setIsLive] = useState<boolean>(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchLogs = async () => {
    try {
      const response = await fetch("/api/logs");
      if (response.ok) {
        const data = await response.json();
        setLogs(data);
      }
    } catch (error) {
      console.error("Failed to fetch logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearLogs = async () => {
    if (!confirm("Are you sure you want to clear all developer logs on the server?")) return;
    try {
      const response = await fetch("/api/logs", { method: "DELETE" });
      if (response.ok) {
        setLogs([]);
      }
    } catch (error) {
      console.error("Failed to clear logs:", error);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    
    fetchLogs();
    
    if (!isLive) return;

    const interval = setInterval(fetchLogs, 3000);
    return () => clearInterval(interval);
  }, [isOpen, isLive]);

  const handleCopyJson = (id: string, obj: any) => {
    navigator.clipboard.writeText(JSON.stringify(obj, null, 2));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.details && JSON.stringify(log.details).toLowerCase().includes(searchQuery.toLowerCase()));
      
    const matchesType = selectedType === "ALL" || log.type === selectedType;
    const matchesLevel = selectedLevel === "ALL" || log.level === selectedLevel;

    return matchesSearch && matchesType && matchesLevel;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 md:p-10 animate-in fade-in zoom-in-95 duration-300">
      <div className="absolute inset-0 bg-[#061114]/90 backdrop-blur-xl" onClick={onClose} />
      
      <div className="relative w-full max-w-6xl h-[85vh] bg-[#071317]/95 border border-white/10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col pointer-events-auto">
        
        <header className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Terminal size={18} />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-white">Truck-to-Server Dev Console</h2>
              <p className="text-[10px] text-white/40 font-medium">Monitor live HTTP upload packages and MQTT broker publishes</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsLive(!isLive)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-wider transition-all ${
                isLive
                  ? "bg-siam-green/20 border-siam-green/30 text-siam-green"
                  : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10"
              }`}
            >
              {isLive ? <Wifi size={12} className="animate-pulse" /> : <WifiOff size={12} />}
              {isLive ? "Live Stream" : "Paused"}
            </button>

            <button
              onClick={handleClearLogs}
              className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-red-400 hover:bg-red-400/10 hover:border-red-400/20 transition-all"
              title="Clear all logs"
            >
              <Trash2 size={14} />
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all"
            >
              <X size={16} />
            </button>
          </div>
        </header>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 px-6 py-3 border-b border-white/5 bg-white/[0.01]">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-white/40 text-[10px] uppercase font-black mr-2">
              <Filter size={11} />
              <span>Filter:</span>
            </div>

            <div className="flex rounded-lg border border-white/5 bg-[#050c0f] overflow-hidden">
              {(["ALL", "HTTP", "MQTT"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-3 py-1 text-[9px] font-black uppercase tracking-wider transition-all ${
                    selectedType === type
                      ? "bg-cyan-500/20 text-cyan-400"
                      : "text-white/40 hover:text-white/70 hover:bg-white/5"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            <div className="flex rounded-lg border border-white/5 bg-[#050c0f] overflow-hidden">
              {(["ALL", "INFO", "WARN", "ERROR", "DEBUG"] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setSelectedLevel(lvl)}
                  className={`px-3 py-1 text-[9px] font-black uppercase tracking-wider transition-all ${
                    selectedLevel === lvl
                      ? lvl === "ERROR"
                        ? "bg-red-500/20 text-red-400"
                        : lvl === "WARN"
                        ? "bg-amber-400/20 text-amber-400"
                        : lvl === "DEBUG"
                        ? "bg-purple-500/20 text-purple-400"
                        : "bg-cyan-500/20 text-cyan-400"
                      : "text-white/40 hover:text-white/70 hover:bg-white/5"
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={12} />
            <input
              type="text"
              placeholder="Search logs message or details..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-8 pl-8 pr-3 rounded-lg border border-white/5 bg-[#050c0f] text-[10px] text-white placeholder-white/30 focus:outline-none focus:border-cyan-500/30 transition-all font-mono"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 font-mono no-scrollbar space-y-2 bg-[#050c0e]">
          {loading ? (
            <div className="h-full flex items-center justify-center gap-2 text-white/40 text-xs">
              <RefreshCw size={14} className="animate-spin text-cyan-400" />
              <span>Fetching console data stream...</span>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-white/20 text-xs py-20">
              <Terminal size={32} className="opacity-10 mb-3" />
              <span>No communication packets recorded matching filters</span>
            </div>
          ) : (
            filteredLogs.map((log) => {
              const isExpanded = expandedLogId === log.id;
              
              const typeColor = log.type === "HTTP" ? "text-cyan-400 bg-cyan-950/40 border border-cyan-800/30" : "text-amber-400 bg-amber-950/40 border border-amber-800/30";
              const levelStyle =
                log.level === "ERROR"
                  ? "text-red-400 bg-red-950/40"
                  : log.level === "WARN"
                  ? "text-amber-400 bg-amber-950/40"
                  : log.level === "DEBUG"
                  ? "text-purple-400 bg-purple-950/40"
                  : "text-siam-green bg-siam-green/10";

              return (
                <div
                  key={log.id}
                  className={`rounded-xl border transition-all overflow-hidden ${
                    isExpanded
                      ? "border-cyan-500/30 bg-[#081519]/70 shadow-lg"
                      : "border-white/5 bg-white/[0.01] hover:bg-white/[0.02]"
                  }`}
                >
                  <div
                    onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                    className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none"
                  >
                    <span className="text-[9px] text-white/30 font-bold whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                    
                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded tracking-wider ${typeColor}`}>
                      {log.type}
                    </span>

                    <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${levelStyle}`}>
                      {log.level}
                    </span>

                    <span className="text-[10px] text-white/80 font-bold flex-1 truncate">
                      {log.message}
                    </span>

                    <div className="text-white/30 hover:text-white/60 transition-colors">
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </div>
                  </div>

                  {isExpanded && log.details && (
                    <div className="border-t border-white/5 bg-black/40 p-4 relative animate-in slide-in-from-top-2 duration-300">
                      <div className="absolute right-4 top-4 flex items-center gap-2 z-10">
                        <button
                          onClick={() => handleCopyJson(log.id, log.details)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-white/5 border border-white/10 text-[9px] font-bold text-white/70 hover:text-white hover:bg-white/10 transition-all active:scale-95"
                        >
                          <Copy size={10} />
                          {copiedId === log.id ? "Copied!" : "Copy Payload"}
                        </button>
                      </div>
                      
                      <div className="text-[9px] text-cyan-400 font-bold uppercase tracking-widest mb-2 flex items-center gap-1">
                        <span>Payload Parameters & Details</span>
                      </div>

                      <pre className="text-[10px] text-white/70 overflow-x-auto p-4 rounded-lg bg-[#04090b]/80 border border-white/5 max-h-96 no-scrollbar leading-relaxed font-mono">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        <footer className="px-6 py-3 border-t border-white/5 bg-white/[0.02] flex items-center justify-between text-[9px] text-white/30 uppercase font-black tracking-widest">
          <span>Buffer: {logs.length} / 200 Logs</span>
          <span className="text-cyan-500/80 animate-pulse">● System Diagnostic OK</span>
        </footer>
      </div>
    </div>
  );
}
