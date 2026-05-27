/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { SecurityCamera, NPC } from "../types";
import { soundEngine } from "../utils/audio";
import { Video, Calendar, EyeOff, Radio, Play, Pause, RefreshCw, Cpu } from "lucide-react";

interface CCTVSystemProps {
  cameras: SecurityCamera[];
  npcs: NPC[];
}

export default function CCTVSystem({ cameras, npcs }: CCTVSystemProps) {
  const [selectedCam, setSelectedCam] = useState<SecurityCamera>(cameras[0]);
  const [selectedHour, setSelectedHour] = useState<string>("22:00");
  const [isPlaying, setIsPlaying] = useState(true);
  const [timelineTick, setTimelineTick] = useState(0); // 0 to 59 minutes

  // Handle active playback animation ticking
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setTimelineTick((prev) => (prev >= 59 ? 0 : prev + 1));
    }, 800);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const handleHourChange = (hour: string) => {
    soundEngine.playMenuClick();
    setSelectedHour(hour);
    setTimelineTick(0);
  };

  const handleCamChange = (cam: SecurityCamera) => {
    soundEngine.playMenuClick();
    setSelectedCam(cam);
    setTimelineTick(0);
  };

  // Find camera feed events at selected hour
  const currentFeed = selectedCam.cameraFeed[selectedHour] || [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-5 h-full opacity-100 font-mono" id="cctv_root">
      
      {/* Target Cameras Sidebar */}
      <div className="md:col-span-4 glass-panel border-l-2 border-magenta rounded-xl p-4 flex flex-col space-y-3 shadow-lg shadow-black/40">
        <h3 className="text-sm font-semibold neon-magenta tracking-wider flex items-center gap-2 border-b border-magenta/20 pb-2">
          <Radio className="w-4 h-4 animate-pulse text-magenta" /> SENSORI TELECAMERE (CCTV)
        </h3>

        {/* Hour selector */}
        <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1.5 rounded-lg border border-slate-900 mb-2">
          {["21:00", "22:00", "23:00"].map((hr) => (
            <button
              key={hr}
              onClick={() => handleHourChange(hr)}
              className={`py-1 text-xs font-mono rounded font-bold transition-all ${
                selectedHour === hr
                  ? "bg-cyan-500 text-black shadow-md shadow-cyan-500/15"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
              }`}
            >
              {hr}
            </button>
          ))}
        </div>

        {/* Camera List */}
        <div className="flex-1 space-y-2 overflow-y-auto pr-1 custom-scrollbar">
          {cameras.map((cam) => {
            const active = selectedCam.id === cam.id;
            return (
              <button
                key={cam.id}
                onClick={() => handleCamChange(cam)}
                className={`w-full text-left p-3 rounded-lg border transition-all duration-300 flex items-center gap-3 ${
                  active
                    ? "bg-cyan-950/40 border-cyan-400/80 shadow-md shadow-cyan-950/20"
                    : "bg-slate-900/40 border-slate-800/40 hover:border-slate-700 hover:bg-slate-800/20"
                }`}
              >
                <div className={`p-1.5 rounded-full ${active ? "bg-cyan-950 text-cyan-400" : "bg-slate-950 text-slate-500"}`}>
                  <Video className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200">{cam.nome}</h4>
                  <p className="text-[9px] font-mono text-slate-500">ATTIVITÀ CAPTURATA: {cam.cameraFeed[selectedHour]?.length || 0} SEGNALI</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main CCTV Feed Monitor */}
      <div className="md:col-span-8 glass-panel border-r-2 border-cyan-500 rounded-xl p-5 flex flex-col justify-between shadow-xl relative overflow-hidden min-h-[420px]">
        
        {/* VHS Scanline overlays */}
        <div className="absolute inset-0 bg-scanlines pointer-events-none opacity-[0.06] z-20"></div>
        <div className="absolute top-0 left-0 w-full h-[3px] bg-cyan-500/10 animate-vhs-scan pointer-events-none z-20"></div>

        {/* Top telemetry layer */}
        <div className="flex items-center justify-between z-10 border-b border-cyan-500/10 pb-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-650 animate-ping"></span>
            <span className="text-[10px] font-mono text-red-500 tracking-wider font-extrabold flex items-center gap-1">
              ● RE-PLAY IN CORSO // REC
            </span>
          </div>
          <span className="text-[10px] font-mono text-cyan-400 font-bold neon-cyan">CANALE: {selectedCam.id.toUpperCase()}</span>
        </div>

        {/* Interactive Simulated Video Terminal Screen */}
        <div className="flex-1 bg-black/80 border border-slate-950 rounded-lg p-4 flex flex-col justify-between relative overflow-hidden min-h-[250px] shadow-inner select-none z-10">
          
          {/* Telemetry data info overlay */}
          <div className="absolute top-4 left-4 font-mono text-[9px] text-cyan-400/60 leading-tight space-y-0.5">
            <div>CAM_SOURCE: ECLIPSE_INTEGRATED</div>
            <div>STATUS: CORRELATION SECURED</div>
            <div>STAMP_UTC: 2026-05-27 {selectedHour.replace(":00", "")}:{timelineTick.toString().padStart(2, "0")}</div>
          </div>

          <div className="absolute top-4 right-4 text-right font-mono text-[9px] text-cyan-400/60 leading-tight">
            <div>ZOOM: 145%</div>
            <div>SIGNAL: STABLE [99%]</div>
          </div>

          {/* Visual radar pulse grid for entity dots */}
          <div className="flex-1 flex items-center justify-center relative">
            
            {/* Ambient concentric radar rings */}
            <div className="absolute w-44 h-44 rounded-full border border-cyan-500/5 animate-radar-pulse"></div>
            <div className="absolute w-28 h-28 rounded-full border border-cyan-500/5"></div>
            <div className="absolute w-14 h-14 rounded-full border border-cyan-500/5"></div>
            <div className="absolute h-full w-[1px] bg-cyan-500/[0.03]"></div>
            <div className="absolute w-full h-[1px] bg-cyan-500/[0.03]"></div>

            {/* Simulated Live visual entities */}
            {currentFeed.length === 0 ? (
              <div className="flex flex-col items-center space-y-2 text-slate-600 font-mono z-10">
                <EyeOff className="w-8 h-8 opacity-40 text-slate-650" />
                <span className="text-[10px]">NESSUN MOVIMENTO SENSORI RILEVATO</span>
              </div>
            ) : (
              <div className="w-full h-full relative flex items-center justify-center">
                {currentFeed.map((feedItem, index) => {
                  const npc = npcs.find((n) => n.id === feedItem.npcId);
                  const isVittima = feedItem.npcId === "vittima_sato";
                  const color = isVittima ? "#FF0033" : npc?.avatarColor || "#FFFFFF";
                  const label = isVittima ? "K. SATO [Chief]" : npc?.nome || "Ignoto";

                  // Place entities around according to their index and playback minute offsets
                  const angle = (index * (360 / currentFeed.length) + timelineTick * 3) * (Math.PI / 180);
                  const radius = 55 + (index * 15) + Math.sin(timelineTick * 0.1) * 8;
                  const x = Math.cos(angle) * radius;
                  const y = Math.sin(angle) * radius;

                  return (
                    <div
                      key={index}
                      className="absolute transition-all duration-700 ease-out flex flex-col items-center"
                      style={{
                        transform: `translate(${x}px, ${y}px)`,
                      }}
                    >
                      {/* Scanning Ping */}
                      <span
                        className="absolute w-4 h-4 rounded-full animate-ping opacity-60"
                        style={{ backgroundColor: color }}
                      ></span>
                      <div
                        className="w-3 h-3 rounded-full border border-black shadow shadow-black flex items-center justify-center font-bold font-mono text-[8px]"
                        style={{ backgroundColor: color }}
                      ></div>
                      <span className="text-[8px] font-mono mt-1 text-slate-300 font-extrabold px-1 py-0.5 rounded bg-black/60 shadow shadow-black border border-slate-900 whitespace-nowrap">
                        {label} [{selectedHour.split(":")[0]}:{feedItem.timeOffset.toString().padStart(2, "0")}]
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Lower status telemetry footer */}
          <div className="border-t border-cyan-500/10 pt-2 flex items-center justify-between font-mono text-[9px] text-slate-500">
            <span>BITRATE: 4.5 MBPS // H265</span>
            <span className="text-[#00FFFF] animate-pulse font-extrabold pb-0.5">MATRIX DECRYPT READY</span>
          </div>

        </div>

        {/* Media Control Deck */}
        <div className="mt-4 flex items-center justify-between bg-slate-950 p-2.5 rounded-lg border border-slate-900 gap-4 z-10">
          
          <div className="flex gap-1.5">
            <button
              onClick={() => {
                soundEngine.playClick();
                setIsPlaying(!isPlaying);
              }}
              className="p-1.5 rounded bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-cyan-400 cursor-pointer"
              title={isPlaying ? "Pausa" : "Play"}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <button
              onClick={() => {
                soundEngine.playClick();
                setTimelineTick(0);
              }}
              className="p-1.5 rounded bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-cyan-400 cursor-pointer"
              title="Reset"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Scrub timeline tracking slot */}
          <div className="flex-1 flex items-center gap-3">
            <span className="text-[10px] font-mono text-slate-500">22:00</span>
            <div className="flex-1 h-1.5 bg-slate-900 rounded-full overflow-hidden relative border border-slate-800">
              <div
                className="h-full bg-cyan-500 transition-all duration-300 shadow shadow-cyan-500"
                style={{ width: `${(timelineTick / 59) * 100}%` }}
              ></div>
            </div>
            <span className="text-[10px] font-mono text-slate-500">22:59</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono font-medium">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            {timelineTick.toString().padStart(2, "0")}m
          </div>

        </div>

      </div>
    </div>
  );
}
