/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect, useState } from "react";
import { Room, NPC, Evidence } from "../types";
import { soundEngine } from "../utils/audio";
import { Move, Search, Eye, AlertTriangle, ArrowUp, ArrowDown, User, ShieldCheck } from "lucide-react";

interface GameCanvasProps {
  currentFloor: number;
  rooms: Room[];
  npcs: NPC[];
  evidence: Evidence[];
  cluesOwned: string[];
  playerX: number;
  playerY: number;
  onMovePlayer: (x: number, y: number) => void;
  onUpdateFloor: (floor: number) => void;
  onClueDiscovered: (clueId: string) => void;
  gameLog: (message: string) => void;
  blackoutActive: boolean;
}

export default function GameCanvas({
  currentFloor,
  rooms,
  npcs,
  evidence,
  cluesOwned,
  playerX,
  playerY,
  onMovePlayer,
  onUpdateFloor,
  onClueDiscovered,
  gameLog,
  blackoutActive,
}: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchPercentage, setSearchPercentage] = useState(0);

  // Filter items corresponding to active floor
  const floorRooms = rooms.filter((r) => r.piano === currentFloor);
  
  // Realtime positions of NPCs based on active schedule at 22:00 (murder hour)
  const isCorrectNpcOnFloor = (npc: NPC) => {
    // get their 22:00 real room floor
    const alibi = npc.alibi["22:00"];
    if (!alibi) return false;
    const realRoom = rooms.find((r) => r.id === alibi.veritaLuogoId);
    return realRoom?.piano === currentFloor;
  };

  const getNPCInRoomAt2200 = (roomId: string): NPC[] => {
    return npcs.filter((n) => n.alibi["22:00"]?.veritaLuogoId === roomId);
  };

  // Keyboard controls for WASD movement
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      let dx = 0;
      let dy = 0;
      if (e.key === "w" || e.key === "W" || e.key === "ArrowUp") dy = -15;
      if (e.key === "s" || e.key === "S" || e.key === "ArrowDown") dy = 15;
      if (e.key === "a" || e.key === "A" || e.key === "ArrowLeft") dx = -15;
      if (e.key === "d" || e.key === "D" || e.key === "ArrowRight") dx = 15;

      if (dx !== 0 || dy !== 0) {
        e.preventDefault();
        const targetX = Math.max(20, Math.min(520, playerX + dx));
        const targetY = Math.max(20, Math.min(180, playerY + dy));
        onMovePlayer(targetX, targetY);

        // Auto determine which room player has stepped into
        const roomStr = checkRoomCollision(targetX, targetY);
        if (roomStr !== selectedRoomId) {
          setSelectedRoomId(roomStr);
          if (roomStr) {
            soundEngine.playClick();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [playerX, playerY, selectedRoomId, currentFloor]);

  // Main Canvas Rendering Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let frames = 0;

    const render = () => {
      frames++;
      ctx.fillStyle = "#02040b"; // Deepest black
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 1. Draw glowing blueprint digital grid
      ctx.strokeStyle = "rgba(0, 255, 255, 0.03)";
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 25) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 25) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // 2. Draw Floor Blueprint Rooms
      floorRooms.forEach((room) => {
        const isPlayerInside = checkRoomCollision(playerX, playerY) === room.id;
        const color = blackoutActive ? "#FF0033" : room.neonColor;

        // Draw Room Floor shading
        ctx.fillStyle = isPlayerInside ? "rgba(0, 255, 255, 0.04)" : "rgba(10, 14, 39, 0.4)";
        ctx.fillRect(room.x, room.y, room.w, room.h);

        // Draw Room border lines
        ctx.strokeStyle = color;
        ctx.lineWidth = isPlayerInside ? 2.5 : 1.25;
        ctx.strokeRect(room.x, room.y, room.w, room.h);

        // Draw neon glows
        ctx.shadowColor = color;
        ctx.shadowBlur = isPlayerInside ? 16 : 4;
        ctx.strokeStyle = color;
        ctx.strokeRect(room.x, room.y, room.w, room.h);
        ctx.shadowBlur = 0; // reset shadow

        // Label Room Names with space-grotesk styling look
        ctx.fillStyle = isPlayerInside ? "#ffffff" : "rgba(224, 224, 255, 0.8)";
        ctx.font = "bold 10px monospace";
        ctx.fillText(room.nome.toUpperCase(), room.x + 8, room.y + 18);

        // Draw room subtext
        ctx.fillStyle = "rgba(200, 200, 255, 0.45)";
        ctx.font = "8px monospace";
        ctx.fillText(`ID: ${room.id.replace("_", "")}`, room.x + 8, room.y + 28);

        // Draw physical clues indicator lying inside room which has not been discovered yet
        const undiscoveredCluesInRoom = room.clues.filter((clueId) => !cluesOwned.includes(clueId));
        if (undiscoveredCluesInRoom.length > 0) {
          // Pulse glowing node to investigate
          const pulseRadius = 3.5 + Math.sin(frames * 0.1) * 1.5;
          ctx.beginPath();
          ctx.arc(room.x + room.w - 15, room.y + 15, pulseRadius, 0, Math.PI * 2);
          ctx.fillStyle = "#ffaa00";
          ctx.shadowColor = "#ffaa00";
          ctx.shadowBlur = 10;
          ctx.fill();
          ctx.shadowBlur = 0;
        }

        // Draw NPCs situated inside this room at 22:00
        const roomNpcs = getNPCInRoomAt2200(room.id);
        roomNpcs.forEach((npc, idx) => {
          const npcX = room.x + 20 + idx * 16;
          const npcY = room.y + room.h - 18;

          // Drawing glowing NPC dot
          ctx.beginPath();
          ctx.arc(npcX, npcY, 4.5, 0, Math.PI * 2);
          ctx.fillStyle = npc.avatarColor;
          ctx.shadowColor = npc.avatarColor;
          ctx.shadowBlur = 8;
          ctx.fill();
          ctx.shadowBlur = 0;

          // Draw floating initials label
          ctx.fillStyle = "#ffffff";
          ctx.font = "7.5px monospace";
          ctx.fillText(npc.nome.substring(0, 1), npcX - 2.5, npcY + 2.5);
        });

      });

      // 3. Cybernetic Rain Dripping overlay effect
      ctx.fillStyle = "rgba(0, 255, 255, 0.07)";
      for (let i = 0; i < 15; i++) {
        const rx = ((frames * 4 + i * 115) % canvas.width);
        const ry = ((frames * 3 + i * 75) % canvas.height);
        ctx.fillRect(rx, ry, 1, 8);
      }

      // 4. Draw security camera sweep cone on specific locations for high immersive detail
      if (!blackoutActive) {
        ctx.save();
        ctx.strokeStyle = "rgba(255, 0, 50, 0.18)";
        ctx.fillStyle = "rgba(255, 0, 50, 0.03)";
        ctx.lineWidth = 1;
        
        const sweepAngle = Math.sin(frames * 0.02) * 0.6;
        ctx.beginPath();
        ctx.moveTo(10, 10);
        ctx.arc(10, 10, 95, 0.2 + sweepAngle, 0.8 + sweepAngle);
        ctx.lineTo(10, 10);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }

      // 5. Draw Player Avatar position
      ctx.beginPath();
      ctx.arc(playerX, playerY, 6.5, 0, Math.PI * 2);
      ctx.fillStyle = "#00FFFF";
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#ffffff";
      ctx.shadowColor = "#00FFFF";
      ctx.shadowBlur = 12;
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Draw pointer beacon targeting nearest nodes
      const pulseScalar = Math.sin(frames * 0.07) * 2;
      ctx.beginPath();
      ctx.arc(playerX, playerY, 12 + pulseScalar, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(0, 255, 255, 0.35)";
      ctx.lineWidth = 1;
      ctx.stroke();

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [floorRooms, playerX, playerY, cluesOwned, blackoutActive]);

  // Click Canvas to move/traverse or select rooms
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    soundEngine.playClick();
    onMovePlayer(clickX, clickY);

    const roomStr = checkRoomCollision(clickX, clickY);
    setSelectedRoomId(roomStr);
  };

  // Logic: determines which room has bounding coordinates overlapping clicked X/Y
  const checkRoomCollision = (x: number, y: number): string | null => {
    for (const room of floorRooms) {
      if (x >= room.x && x <= room.x + room.w && y >= room.y && y <= room.y + room.h) {
        return room.id;
      }
    }
    return null;
  };

  // Launch a localized search sweeps for clues
  const triggerRoomSearch = () => {
    if (!selectedRoomId) return;
    soundEngine.playMenuClick();
    setIsSearching(true);
    setSearchPercentage(0);

    const curRoom = rooms.find((r) => r.id === selectedRoomId)!;

    const interval = setInterval(() => {
      setSearchPercentage((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          finishSearch(curRoom);
          return 100;
        }
        // sweep beep
        if (prev % 20 === 0) soundEngine.playBeep(450, 0.05, "triangle");
        return prev + 10;
      });
    }, 150);
  };

  const finishSearch = (room: Room) => {
    setIsSearching(false);
    
    // Find clues located here
    const cluesInRoom = evidence.filter((e) => e.luogoId === room.id);
    const undiscovered = cluesInRoom.filter((c) => !cluesOwned.includes(c.id));

    if (undiscovered.length > 0) {
      soundEngine.playClueDiscovered();
      undiscovered.forEach((c) => {
        onClueDiscovered(c.id);
        gameLog(`RITROVAMENTO PROVA: Scansionato il compartimento "${room.nome}". Individuato indizio cruciale: "${c.nome}". Aggiunto nel taccuino.`);
      });
    } else {
      soundEngine.playBeep(250, 0.2, "sawtooth");
      gameLog(`RICERCA STERILE: Nessun indizio fisico addizionale individuato nell'area "${room.nome}".`);
    }
  };

  const getFloorName = (fl: number): string => {
    switch (fl) {
      case -2: return "Piano -2 (Stanza Server)";
      case -1: return "Piano -1 (Sotterraneo)";
      case 0: return "Piano 0 (Atrio Complesso)";
      case 1: return "Piano 1 (Amministrazione)";
      case 2: return "Piano 2 (Divisione Laboratori)";
      case 3: return "Piano 3 (Quartiere Personale)";
      case 4: return "Tetto (Eliporto & Trasmettitori)";
      default: return `Livello ${fl}`;
    }
  };

  const selectedRoom = rooms.find((r) => r.id === selectedRoomId);
  const npcsOnFloor = npcs.filter(isCorrectNpcOnFloor);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch" id="map_viewport_segment">
      
      {/* Target Floor Controller on left side */}
      <div className="lg:col-span-1.5 flex flex-row lg:flex-col justify-between gap-1.5 glass-panel border-l-2 border-magenta p-2.5 rounded-xl shadow-lg">
        {[4, 3, 2, 1, 0, -1, -2].map((fl) => {
          const active = currentFloor === fl;
          return (
            <button
              key={fl}
              onClick={() => {
                soundEngine.playMenuClick();
                onUpdateFloor(fl);
                setSelectedRoomId(null);
              }}
              className={`flex-1 py-3 text-xs font-mono font-black rounded-lg border transition-all cursor-pointer text-center ${
                active
                  ? "bg-cyan-500 text-black border-cyan-400 shadow shadow-cyan-500/20"
                  : "bg-slate-950 border-slate-900 text-slate-500 hover:text-slate-300 hover:border-slate-800"
              }`}
            >
              P{fl >= 0 ? `+${fl}` : fl}
            </button>
          );
        })}
      </div>

      {/* Main CANVAS drawing viewport */}
      <div className="lg:col-span-7 bg-black border-2 border-cyan-500/50 rounded-xl overflow-hidden shadow-xl flex flex-col justify-between relative min-h-[290px] map-grid">
        {/* Absolute Floor labels */}
        <div className="absolute top-3.5 left-4 z-10 font-mono text-[10.5px] font-extrabold text-cyan-400 tracking-wider flex items-center gap-1.5">
          <Move className="w-3.5 h-3.5 animate-pulse" /> MAPPA ECLIPSE: {getFloorName(currentFloor)}
        </div>

        {blackoutActive && (
          <div className="absolute top-3.5 right-4 z-10 font-mono text-[9px] text-red-500 font-extrabold flex items-center gap-1 animate-pulse">
            <AlertTriangle className="w-3 h-3 text-red-500" /> BLACKOUT ATTIVO
          </div>
        )}

        <canvas
          ref={canvasRef}
          width={540}
          height={200}
          onClick={handleCanvasClick}
          className="w-full flex-1 aspect-[54/20] cursor-crosshair border-b border-cyan-500/35"
        />

        {/* Movement hotkeys guideline bar */}
        <div className="bg-slate-950 p-2 text-center text-[10px] font-mono text-slate-500 border-t border-slate-900">
          Usa <kbd className="bg-slate-900 px-1 py-0.5 rounded border border-slate-800 text-slate-400">WASD</kbd> / <kbd className="bg-slate-900 px-1 py-0.5 rounded border border-slate-800 text-slate-400">Frecce</kbd> per muoverti, oppure clicca direttamente sulle stanze della mappa.
        </div>
      </div>

      {/* Spatial details context sidebar */}
      <div className="lg:col-span-3.5 glass-panel border-r-2 border-cyan-500 rounded-xl p-4 flex flex-col justify-between shadow-xl">
        
        {selectedRoomId && selectedRoom ? (
          <div className="flex flex-col justify-between h-full space-y-4">
            
            {/* Room description */}
            <div className="space-y-1.5 select-text">
              <span className="text-[9px] font-mono tracking-widest text-cyan-400 font-bold block uppercase border-b border-cyan-500/10 pb-1">STANZA SELEZIONATA</span>
              <h3 className="text-sm font-extrabold text-slate-100">{selectedRoom.nome}</h3>
              <p className="text-[11.5px] py-1 text-slate-400 leading-relaxed font-sans">{selectedRoom.descrizione}</p>
            </div>

            {/* List NPCs currently present at 22:00 */}
            <div className="space-y-1.5 select-text">
              <span className="text-[9px] font-mono font-bold text-slate-500 block uppercase">NUCLEI NPCS RILEVATI (ORA 22:00):</span>
              {getNPCInRoomAt2200(selectedRoom.id).length === 0 ? (
                <div className="text-[10px] text-slate-500 font-mono italic p-2 bg-slate-950/60 rounded border border-slate-900 text-center">Nessun soggetto localizzato qui alle 22:00</div>
              ) : (
                <div className="space-y-1">
                  {getNPCInRoomAt2200(selectedRoom.id).map((npc) => (
                    <div key={npc.id} className="flex items-center gap-2 p-1.5 bg-slate-950 border border-slate-850 rounded">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: npc.avatarColor }}></span>
                      <span className="text-xs font-bold text-slate-200">{npc.nome} ({npc.ruolo})</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action Search trigger */}
            <div className="space-y-2">
              {isSearching ? (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span className="animate-pulse">Scansione termica radiazioni...</span>
                    <span>{searchPercentage}%</span>
                  </div>
                  <div className="h-2 bg-slate-950 border border-slate-900 rounded-full overflow-hidden relative">
                    <div className="h-full bg-cyan-400 shadow shadow-cyan-400 transition-all duration-150" style={{ width: `${searchPercentage}%` }}></div>
                  </div>
                </div>
              ) : (
                <button
                  id="search_room_clues_btn"
                  onClick={triggerRoomSearch}
                  className="w-full bg-cyan-500 text-black border border-cyan-405 font-mono text-xs uppercase py-2.5 font-extrabold tracking-widest rounded-lg flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-cyan-950/20 text-center transform active:scale-95 transition-all"
                >
                  <Search className="w-4 h-4 text-black animate-pulse" /> SCANSIONA LA STANZA
                </button>
              )}
            </div>

          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-3 font-mono text-slate-500 h-full">
            <Eye className="w-10 h-10 opacity-30 text-slate-650" />
            <span className="text-xs">Seleziona una stanza sulla mappa cliccando sul disegno per investigare gli indizi fisici latenti.</span>
            
            {/* Quick telemetry indicators on current floor */}
            <div className="border-t border-slate-900 pt-4 w-full text-left space-y-1.5 select-text">
              <span className="text-[8.5px] uppercase font-bold text-slate-600 block">telemetria di piano:</span>
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span>Rilevamento droni:</span>
                <span className="text-emerald-400 font-bold">REGOLARE</span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span>Sospetti su piano:</span>
                <span className="text-cyan-400 font-bold">{npcsOnFloor.length}</span>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
