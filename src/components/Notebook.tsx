/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { NPC, Evidence, Room, TimelineMark, Relation } from "../types";
import { soundEngine } from "../utils/audio";
import {
  BookOpen,
  Clock,
  Sparkles,
  Users,
  Briefcase,
  FileText,
  Frown,
  CheckCircle,
  HelpCircle,
  AlertTriangle,
  Flame,
  Scissors,
  Syringe,
  Zap,
  Tablet,
  Heart,
  UserCheck
} from "lucide-react";

interface NotebookProps {
  npcs: NPC[];
  evidence: Evidence[];
  rooms: Room[];
  timelineMarks: TimelineMark[];
  notes: string;
  onUpdateNotes: (newNotes: string) => void;
  onSetTimelineMark: (ora: string, npcId: string, luogoId: string) => void;
  notebookTab: "timeline" | "clues" | "profiles" | "relations" | "notes";
  onChangeNotebookTab: (tab: "timeline" | "clues" | "profiles" | "relations" | "notes") => void;
}

export default function Notebook({
  npcs,
  evidence,
  rooms,
  timelineMarks,
  notes,
  onUpdateNotes,
  onSetTimelineMark,
  notebookTab,
  onChangeNotebookTab,
}: NotebookProps) {
  const [selectedNpcId, setSelectedNpcId] = useState<string>(npcs[0]?.id || "");
  const [selectedClueId, setSelectedClueId] = useState<string | null>(null);

  // SVG coordinates for suspects network graph
  const npcNodes: Record<string, { cx: number; cy: number; color: string; short: string }> = {
    rachel: { cx: 250, cy: 90, color: "#00FFFF", short: "RH" },
    silas: { cx: 410, cy: 190, color: "#FF00FF", short: "SV" },
    vektor: { cx: 350, cy: 340, color: "#00FF33", short: "VC" },
    jax: { cx: 150, cy: 340, color: "#FF0033", short: "JC" },
    luna: { cx: 90, cy: 190, color: "#FFFF00", short: "LC" },
  };

  // Static relations list for graphing
  const relationsGraph = [
    { from: "rachel", to: "luna", type: "secret_lover", label: "Relazione Segreta", color: "#FF00FF" },
    { from: "rachel", to: "vektor", type: "colleague", label: "Colleghi (Progetto Cloni)", color: "#00FF33" },
    { from: "silas", to: "jax", type: "blackmailer", label: "Ricatto (Corruzione)", color: "#FFFF00" },
    { from: "rachel", to: "silas", type: "rival", label: "Competitori", color: "#FF0033" },
    { from: "vektor", to: "luna", type: "friend", label: "Contrabbando Materiali", color: "#00FFFF" },
  ];

  const handleTimelineClick = (ora: string, npcId: string, roomVal: string) => {
    soundEngine.playClick();
    onSetTimelineMark(ora, npcId, roomVal);
  };

  const getTimelineMarkRoom = (ora: string, npcId: string): string => {
    const mark = timelineMarks.find((m) => m.ora === ora && m.npcId === npcId);
    return mark ? mark.luogoId : "";
  };

  const renderWeaponIcon = (iconName: string) => {
    switch (iconName) {
      case "Flame": return <Flame className="w-5 h-5 text-red-400" />;
      case "Scissors": return <Scissors className="w-5 h-5 text-purple-400" />;
      case "Syringe": return <Syringe className="w-5 h-5 text-yellow-500" />;
      case "Zap": return <Zap className="w-5 h-5 text-cyan-400" />;
      case "Tablet": return <Tablet className="w-5 h-5 text-blue-400" />;
      default: return <FileText className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div className="flex flex-col glass-panel border-r-2 border-cyan-500 rounded-xl overflow-hidden shadow-2xl h-full min-h-[500px]" id="notepad_wrapper">
      
      {/* Sub tabs hierarchy */}
      <div className="flex flex-wrap border-b border-cyan-500/30 bg-[#0a0e27]/85">
        {[
          { id: "timeline", title: "Timeline", icon: Clock },
          { id: "clues", title: "Prove", icon: Sparkles },
          { id: "profiles", title: "Profili", icon: Users },
          { id: "relations", title: "Relazioni", icon: BookOpen },
          { id: "notes", title: "Notes", icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = notebookTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                soundEngine.playMenuClick();
                onChangeNotebookTab(tab.id as any);
              }}
              className={`flex items-center gap-2 px-5 py-3.5 text-xs font-mono font-bold tracking-widest uppercase transition-all duration-300 border-r border-cyan-500/30 ${
                active
                  ? "bg-cyan-950/20 text-[#00FFFF] neon-cyan border-t-2 border-t-[#00FFFF]"
                  : "text-slate-500 hover:text-slate-350 hover:bg-slate-900/10"
              }`}
            >
              <Icon className="w-3.5 h-3.5" /> {tab.title}
            </button>
          );
        })}
      </div>

      <div className="flex-1 p-5 overflow-y-auto custom-scrollbar bg-[#060a1f]/60 relative select-text">
        <div className="absolute inset-0 bg-scanlines pointer-events-none opacity-[0.02]"></div>

        {/* 1. TIMELINE INTERATTIVA */}
        {notebookTab === "timeline" && (
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-2.5">
              <h2 className="text-sm font-bold text-slate-100 tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" /> TIMELINE RICOSTRUZIONE SPOSTAMENTI
              </h2>
              <p className="text-[11px] text-slate-400 pt-0.5">
                Associa ciascun sospettato a una camera per ciascun intervallo orario. Un simbolo verde indica che la posizione corrisponde a un riscontro oggettivo.
              </p>
            </div>

            <div className="space-y-4">
              {["21:00", "22:00", "23:00"].map((ora) => (
                <div key={ora} className="bg-slate-950/70 border border-slate-850 p-4 rounded-lg space-y-3.5 shadow-md">
                  <h3 className="text-xs font-bold text-cyan-400 font-mono tracking-widest uppercase border-b border-cyan-500/10 pb-1.5 flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5" /> REPERTO ORARIO: {ora}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5">
                    {npcs.map((npc) => {
                      const selectedRoomId = getTimelineMarkRoom(ora, npc.id);
                      // Verify if selection matches the actual location (proven by physical logs/CCTV)
                      const isCorrect = selectedRoomId === npc.alibi[ora]?.veritaLuogoId;

                      return (
                        <div key={npc.id} className="bg-slate-900/85 border border-slate-800 rounded-lg p-2.5 space-y-2 flex flex-col justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full border border-black shadow" style={{ backgroundColor: npc.avatarColor }}></span>
                            <span className="text-xs font-bold text-slate-200 truncate">{npc.nome}</span>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] font-mono text-slate-500 tracking-wider uppercase block">Assegna Camera:</label>
                            <select
                              value={selectedRoomId}
                              id={`timeline_select_${ora}_${npc.id}`}
                              onChange={(e) => handleTimelineClick(ora, npc.id, e.target.value)}
                              className="w-full bg-slate-950 text-slate-300 border border-slate-800 rounded px-1.5 py-1 text-[11px] font-mono focus:border-cyan-500 outline-none"
                            >
                              <option value="">Sconosciuto</option>
                              {rooms.map((rm) => (
                                <option key={rm.id} value={rm.id}>
                                  {rm.nome} (P {rm.piano})
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="flex items-center justify-between text-[10px] font-mono pt-1">
                            <span className="text-slate-400">Verificato:</span>
                            {selectedRoomId === "" ? (
                              <span className="text-slate-500 flex items-center gap-1 font-extrabold text-[9px] uppercase tracking-wider">
                                <HelpCircle className="w-3 h-3" /> ND
                              </span>
                            ) : isCorrect ? (
                              <span className="text-emerald-400 flex items-center gap-0.5 font-extrabold text-[9px] uppercase tracking-wider animate-pulse">
                                <CheckCircle className="w-3 h-3" /> RISCONTRO
                              </span>
                            ) : (
                              <span className="text-red-500 flex items-center gap-0.5 font-extrabold text-[9px] uppercase tracking-widest">
                                <AlertTriangle className="w-3 h-3 text-red-500" /> CONFLITTO
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. ARCHIVIO PROVE */}
        {notebookTab === "clues" && (
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-2.5 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-100 tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" /> FILE PROVE REQUISITE ED ESTRATTE
                </h2>
                <p className="text-[11px] text-slate-400 pt-0.5">
                  Elenco indizi fisici, digitali e balistici raccolti investigando l'Eclipse Complex o decrittando database.
                </p>
              </div>
              <span className="text-[10px] font-mono bg-cyan-950 text-cyan-400 border border-cyan-500/20 px-2 py-1 rounded">
                RACCOLTI: {evidence.filter((e) => e.scoperto).length} / {evidence.length}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              
              {/* Clues layout left select list */}
              <div className="md:col-span-5 space-y-2 max-h-[350px] overflow-y-auto pr-1.5 custom-scrollbar">
                {evidence.map((clue) => {
                  const active = selectedClueId === clue.id;
                  
                  if (!clue.scoperto) {
                    return (
                      <div
                        key={clue.id}
                        className="p-3 bg-slate-900/10 border border-dashed border-slate-800 text-slate-600 rounded-lg text-xs font-mono flex items-center gap-2 select-none"
                      >
                        <HelpCircle className="w-4 h-4 text-slate-700" /> Indizio Ignoto [Esplora o decritta]
                      </div>
                    );
                  }

                  return (
                    <button
                      key={clue.id}
                      id={`notebook_clue_btn_${clue.id}`}
                      onClick={() => {
                        soundEngine.playMenuClick();
                        setSelectedClueId(clue.id);
                      }}
                      className={`w-full text-left p-2.5 rounded-lg border transition-all duration-300 flex items-center gap-3 ${
                        active
                          ? "bg-cyan-950/40 border-cyan-400/80 shadow shadow-cyan-950/20"
                          : "bg-slate-900/40 border-slate-800/40 hover:border-slate-700 hover:bg-slate-800/20"
                      }`}
                    >
                      <div className={`p-1.5 rounded-md ${clue.isArmaDelitto ? "bg-red-950 border border-red-500/20" : "bg-slate-950 border border-slate-800"}`}>
                        {renderWeaponIcon(clue.iconName)}
                      </div>
                      <div className="flex-1 truncate">
                        <h4 className="text-[11.5px] font-bold text-slate-200 truncate">{clue.nome}</h4>
                        <span className="text-[8px] font-mono uppercase bg-slate-950 px-1 py-0.5 rounded text-slate-400">
                          {clue.tipo} • {rooms.find((r) => r.id === clue.luogoId)?.nome || "Hacked"}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Clues detailed view card */}
              <div className="md:col-span-7">
                {selectedClueId && evidence.find((e) => e.id === selectedClueId)?.scoperto ? (
                  (() => {
                    const clue = evidence.find((e) => e.id === selectedClueId)!;
                    const roomInfo = rooms.find((r) => r.id === clue.luogoId);
                    return (
                      <div className="bg-slate-950 border border-slate-850 rounded-xl p-5 space-y-4 shadow-xl shadow-black/30 min-h-[250px] flex flex-col justify-between">
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className={`text-[10px] font-mono tracking-wider font-extrabold px-2 py-0.5 rounded uppercase border ${
                              clue.isArmaDelitto ? "bg-red-950/50 text-red-400 border-red-500/20" : "bg-cyan-950/50 text-cyan-400 border-cyan-500/20"
                            }`}>
                              {clue.isArmaDelitto ? "⚠️ ARMA DEL DELITTO POSSIBILE" : "🔍 INDIZIO RILEVATO"}
                            </span>
                            <span className="text-[10px] font-mono text-slate-500">ID: {clue.id.toUpperCase()}</span>
                          </div>

                          <h3 className="text-base font-bold text-slate-100 tracking-wide">{clue.nome}</h3>
                          
                          <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-850 font-mono text-xs text-slate-350 leading-relaxed shadow-inner">
                            {clue.descrizione}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-[10.5px] font-mono border-t border-slate-900 pt-3 text-slate-400">
                          <div>
                            <span className="text-slate-600">RITROVAMENTO:</span><br />
                            <span className="text-slate-300 font-bold">{roomInfo ? `${roomInfo.nome} (Piano ${roomInfo.piano})` : "Canale Digitale Hacked"}</span>
                          </div>
                          <div>
                            <span className="text-slate-600">CATEGORIA REPERTO:</span><br />
                            <span className="text-slate-300 font-bold uppercase">{clue.tipo}</span>
                          </div>
                        </div>

                      </div>
                    );
                  })()
                ) : (
                  <div className="border border-dotted border-slate-800 rounded-xl p-8 text-center flex flex-col items-center justify-center min-h-[250px] space-y-2 bg-slate-950/20 text-slate-500 font-mono">
                    <BookOpen className="w-10 h-10 opacity-30 text-slate-650" />
                    <span className="text-xs">Seleziona un indizio a sinistra per controllarne i dettagli balistici e l'analisi sul campo.</span>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* 3. PROFILI SUSPECTS */}
        {notebookTab === "profiles" && (
          <div className="space-y-5">
            <div className="border-b border-slate-800 pb-2.5">
              <h2 className="text-sm font-bold text-slate-100 tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-400" /> PROFILI PSICOLOGICI & REGISTRI SOSPETTI
              </h2>
              <p className="text-[11px] text-slate-400 pt-0.5">
                Valuta le risposte psicologiche, le personalità, le relazioni sensibili e gli alibi dichiarati di ogni NPC per scovarne le bugie.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              
              {/* NPC Tab selection list */}
              <div className="md:col-span-3 flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-x-visible pb-1.5 md:pb-0">
                {npcs.map((npc) => {
                  const active = selectedNpcId === npc.id;
                  return (
                    <button
                      key={npc.id}
                      onClick={() => {
                        soundEngine.playMenuClick();
                        setSelectedNpcId(npc.id);
                      }}
                      className={`flex-1 md:flex-initial text-left p-3 rounded-lg border transition-all duration-300 flex items-center gap-2.5 whitespace-nowrap md:whitespace-normal ${
                        active
                          ? "bg-cyan-950/30 border-cyan-500/60 shadow"
                          : "bg-slate-900/40 border-slate-800/40 hover:border-slate-700 hover:bg-slate-800/20"
                      }`}
                    >
                      <span className="w-3 h-3 rounded-full border border-black" style={{ backgroundColor: npc.avatarColor }}></span>
                      <div className="text-xs font-bold text-slate-200">{npc.nome}</div>
                    </button>
                  );
                })}
              </div>

              {/* Selected Profile content panel */}
              <div className="md:col-span-9">
                {npcs.map((npc) => {
                  if (npc.id !== selectedNpcId) return null;
                  return (
                    <div key={npc.id} className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950 border border-slate-850 p-4 rounded-xl shadow-lg relative overflow-hidden">
                      {/* background ambient gradient flair */}
                      <div className="absolute top-0 right-0 w-24 h-24 rounded-full filter blur-2xl opacity-15 pointer-events-none" style={{ background: npc.avatarColor }}></div>

                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full border border-black shadow" style={{ backgroundColor: npc.avatarColor }}></span>
                            <h3 className="text-lg font-extrabold text-slate-100 font-sans tracking-wide">{npc.nome}</h3>
                          </div>
                          <p className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">{npc.ruolo}</p>
                          <p className="text-xs text-slate-400 leading-relaxed mt-2.5">{npc.descrizione}</p>
                        </div>

                        {/* Personality Matrix progress dials */}
                        <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-850-custom space-y-2 shadow-inner">
                          <h4 className="text-[10px] font-mono text-slate-500 tracking-wider block border-b border-slate-850 pb-1 uppercase font-bold">MATRICE PSICOLOGICA DI BASE:</h4>
                          
                          <div className="space-y-1.5 text-[11px] font-mono">
                            {[
                              { label: "Intelligenza", val: npc.personality.intelligence, col: "bg-cyan-500" },
                              { label: "Nervosismo", val: npc.personality.nervosismo, col: "bg-red-500 animate-pulse" },
                              { label: "Aggressività", val: npc.personality.aggressivita, col: "bg-amber-600" },
                              { label: "Furbizia", val: npc.personality.furbizia, col: "bg-purple-500" },
                            ].map((trait, i) => (
                              <div key={i} className="flex items-center">
                                <span className="w-24 text-slate-400 text-[10px]">{trait.label}:</span>
                                <div className="flex-1 h-1.5 bg-slate-950 rounded-full border border-slate-900 overflow-hidden relative">
                                  <div className={`h-full ${trait.col}`} style={{ width: `${trait.val}%` }}></div>
                                </div>
                                <span className="w-8 text-right text-slate-300 font-bold">{trait.val}%</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Right column: Alibi & Secrets */}
                      <div className="space-y-4 flex flex-col justify-between">
                        
                        {/* Declared Alibi block */}
                        <div className="bg-slate-905 p-3.5 rounded-lg border border-slate-850 space-y-1.5">
                          <span className="text-[10px] font-mono text-slate-500 font-bold uppercase block tracking-wider">🔒 ALIBI DICHIARATO PER LE 22:00:</span>
                          <p className="text-[11.5px] font-sans font-medium text-slate-200 bg-slate-900/60 p-2.5 rounded border border-slate-850 italic select-text leading-relaxed">
                            "{npc.alibi["22:00"]?.descrizioneDichiarata}"
                          </p>
                        </div>

                        {/* Current stress factor warnings */}
                        <div className="flex items-center justify-between p-3 bg-slate-900/60 border border-slate-850 rounded-lg">
                          <div className="space-y-1">
                            <span className="text-[10px] font-mono text-slate-500 font-bold uppercase block tracking-wider">FATTORE DI STRESS INVESTIGATIVO</span>
                            <div className="flex items-center gap-2">
                              <div className="w-24 h-2.5 bg-slate-950 rounded-full border border-slate-800 overflow-hidden relative">
                                <div
                                  className={`h-full transition-all duration-500 ${
                                    npc.statoPsicologico.stress > 70 ? "bg-red-500" :
                                    npc.statoPsicologico.stress > 40 ? "bg-amber-500" :
                                    "bg-emerald-500"
                                  }`}
                                  style={{ width: `${npc.statoPsicologico.stress ?? 10}%` }}
                                ></div>
                              </div>
                              <span className="text-[10.5px] font-mono font-extrabold text-slate-300">{npc.statoPsicologico.stress ?? 10}%</span>
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-end">
                            <span className="text-[9px] font-mono text-slate-500 uppercase">cooperazione</span>
                            <span className="text-xs font-mono font-bold text-cyan-400">{npc.statoPsicologico.cooperazione ?? 50}%</span>
                          </div>
                        </div>

                        {/* Known Secrets list */}
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-mono text-slate-500 font-bold uppercase block tracking-wider">📂 SEGRETI DEL SOGGETTO DISPENSATI:</span>
                          {npc.segreti.some((s) => s.sbloccato) ? (
                            npc.segreti.filter((s) => s.sbloccato).map((secret, sIdx) => (
                              <div key={sIdx} className="bg-cyan-950/15 border border-cyan-500/20 px-2.5 py-1.5 rounded text-[11px] text-cyan-300 flex items-start gap-2 select-text font-mono shadow-inner shadow-cyan-950/10 leading-snug">
                                <UserCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                                <div>
                                  <span className="text-[8.5px] uppercase font-extrabold bg-cyan-950 px-1 rounded text-cyan-400">sbloccato</span>
                                  <p className="mt-0.5">{secret.descrizione}</p>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="font-mono text-[10px] italic text-slate-600 bg-[#0d0718]/40 border border-slate-850 p-2.5 rounded text-center">
                              ⚠️ NESSUN SEGRETO RIVELATO ANCORA. Interroga il soggetto o decritta file offshore per farlo parlare.
                            </div>
                          )}
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          </div>
        )}

        {/* 4. MAPPA RELAZIONI */}
        {notebookTab === "relations" && (
          <div className="space-y-5">
            <div className="border-b border-slate-800 pb-2.5">
              <h2 className="text-sm font-bold text-slate-100 tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-[#FF00FF]" /> COGNIZIONE GRAFO DELLE RELAZIONI INCROCIATE
              </h2>
              <p className="text-[11px] text-slate-400 pt-0.5">
                Mappa topologica delle connessioni note tra i sospettati dell'Eclipse Complex. Passa con il mouse sulle linee colorate per esaminare i segreti associati o potenziali moventi di alleanza o rivalità.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
              {/* Left Graph visual block (SVG render) */}
              <div className="md:col-span-8 bg-[#04081c] border border-slate-850 p-4 rounded-xl flex items-center justify-center min-h-[360px] relative shadow-lg shadow-black/40">
                
                {/* SVG canvas graph */}
                <svg className="w-full h-80 select-none cursor-default max-w-lg z-10" viewBox="0 0 500 400">
                  
                  {/* Dynamic background grid circles for aesthetic cyberpunk vibe */}
                  <circle cx="250" cy="200" r="150" fill="none" stroke="#2d3561" strokeWidth="0.5" strokeDasharray="3 6" opacity="0.4" />
                  <circle cx="250" cy="200" r="80" fill="none" stroke="#2d3561" strokeWidth="0.5" strokeDasharray="2 4" opacity="0.3" />

                  {/* Draw Relationship Lines */}
                  {relationsGraph.map((rel, index) => {
                    const fromNode = npcNodes[rel.from];
                    const toNode = npcNodes[rel.to];
                    if (!fromNode || !toNode) return null;

                    // compute mid point for simple labels
                    const midX = (fromNode.cx + toNode.cx) / 2;
                    const midY = (fromNode.cy + toNode.cy) / 2;

                    return (
                      <g key={index} className="group cursor-help">
                        {/* Interactive hover glowing wire padding */}
                        <line
                          x1={fromNode.cx}
                          y1={fromNode.cy}
                          x2={toNode.cx}
                          y2={toNode.cy}
                          stroke={rel.color}
                          strokeWidth="5"
                          opacity="0.1"
                          className="hover:opacity-40 transition-opacity duration-300"
                        />
                        {/* The solid connection line */}
                        <line
                          x1={fromNode.cx}
                          y1={fromNode.cy}
                          x2={toNode.cx}
                          y2={toNode.cy}
                          stroke={rel.color}
                          strokeWidth="2"
                          strokeDasharray={rel.type === "secret_lover" ? "5 3" : "none"}
                        />
                        {/* Text labels floating above */}
                        <g transform={`translate(${midX}, ${midY})`}>
                          <rect
                            x="-65"
                            y="-9"
                            width="130"
                            height="16"
                            rx="4"
                            fill="#04081c"
                            stroke="#1a1f3a"
                            strokeWidth="1"
                            className="opacity-90 shadow"
                          />
                          <text
                            textAnchor="middle"
                            y="2"
                            fontFamily="monospace"
                            fontSize="8"
                            fontWeight="bold"
                            fill="#cbd5e1"
                          >
                            {rel.label}
                          </text>
                        </g>
                      </g>
                    );
                  })}

                  {/* Draw Person Nodes */}
                  {Object.entries(npcNodes).map(([id, node]) => {
                    const originalNpc = npcs.find((n) => n.id === id);
                    if (!originalNpc) return null;
                    return (
                      <g key={id} className="group">
                        {/* Glowing aura */}
                        <circle
                          cx={node.cx}
                          cy={node.cy}
                          r="25"
                          fill="#04081c"
                          stroke={node.color}
                          strokeWidth="1.5"
                          className="group-hover:stroke-white transition-all duration-300 shadow shadow-black"
                        />
                        <circle
                          cx={node.cx}
                          cy={node.cy}
                          r="21"
                          fill="url(#node_dark_fade)"
                          opacity="0.9"
                        />
                        {/* Initial Letters Text */}
                        <text
                          cx={node.cx}
                          cy={node.cy}
                          x={node.cx}
                          y={node.cy + 5}
                          textAnchor="middle"
                          fontFamily="sans-serif"
                          fontSize="13"
                          fontWeight="bold"
                          fill="#f8fafc"
                          className="cursor-pointer"
                        >
                          {node.short}
                        </text>

                        {/* Tooltip hovering tag */}
                        <g transform={`translate(${node.cx}, ${node.cy - 38})`} className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                          <rect x="-60" y="-10" width="120" height="20" rx="3" fill="#080d28" stroke={node.color} strokeWidth="1" />
                          <text textAnchor="middle" y="3" fontFamily="monospace" fontSize="9" fill="#f8fafc" fontWeight="bold">
                            {originalNpc.nome}
                          </text>
                        </g>
                      </g>
                    );
                  })}

                  {/* Definition filters */}
                  <defs>
                    <radialGradient id="node_dark_fade" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#1e293b" />
                      <stop offset="100%" stopColor="#04081c" />
                    </radialGradient>
                  </defs>
                </svg>

                {/* Bottom graphical legend indicator */}
                <div className="absolute bottom-3 left-4 flex flex-wrap gap-3 font-mono text-[9px] text-slate-500">
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF00FF]"></span> Secret Lovers
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00FF33]"></span> Colleghi
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FFFF00]"></span> Ricatti
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF0033]"></span> Competitori
                  </div>
                </div>

              </div>

              {/* Right Side Info Box summarizing conflicts */}
              <div className="md:col-span-4 bg-[#080d28]/60 border border-slate-850 p-4 rounded-xl flex flex-col justify-between shadow">
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-200 font-mono uppercase tracking-widest border-b border-cyan-500/10 pb-1 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-cyan-400" /> SINTESI LEI-NEXUS
                  </h4>

                  <div className="space-y-4 text-xs leading-relaxed text-slate-350">
                    <div className="space-y-1 select-text">
                      <p className="font-bold text-cyan-400">💞 Rachel & Luna</p>
                      <p className="text-[10.5px]">Rachel sabota silenziosamente dati aziendali preziosi per conto della contrabbandiera Luna Chen.</p>
                    </div>
                    <div className="space-y-1 select-text">
                      <p className="font-bold text-yellow-500">⚠️ Silas & Jax</p>
                      <p className="text-[10.5px]">Il Vice-Presidente Vance compie bonifici anonimi cospicui al Guardiano Jax per bypassare periodicamente i registri di sorveglianza.</p>
                    </div>
                    <div className="space-y-1 select-text">
                      <p className="font-bold text-[#00FF33]">🧪 Vektor & Rachel / Luna</p>
                      <p className="text-[10.5px]">Cross e Rachel cooperano tecnicamente sull'impianto biometrico, mentre Luna garantisce a Cross pezzi proibiti.</p>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-900 font-mono text-[9.5px] text-slate-500 italic select-text">
                  C'era forte tensione professionale. Kenji Sato intralciava questi canali, fornendo un movente comune!
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 5. NOTE PERSONALI */}
        {notebookTab === "notes" && (
          <div className="space-y-4 h-full flex flex-col">
            <div className="border-b border-slate-800 pb-2.5">
              <h2 className="text-sm font-bold text-slate-100 tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-450" /> BLOCCO NOTE DEDUTTIVE PERSONALI
              </h2>
              <p className="text-[11px] text-slate-400 pt-0.5">
                Utilizza questo spazio ad inserimento libero per annotare discordanze di dichiarazioni, collegare prove balistiche o pianificare i prossimi interrogatori.
              </p>
            </div>

            <textarea
              id="notebook_notes_textarea"
              value={notes}
              onChange={(e) => onUpdateNotes(e.target.value)}
              placeholder="Digita qui i tuoi appunti sulle indagini... Es:\n- Jax Colton sostiene di essere stato in security room, ma i log indicano accesso assente.\n- La cam alle 22:00 mostra solo Vektor Cross ed Rachel...\n- L'arma è il bisturi termico a causa delle cicatrici cauterizzate."
              className="flex-1 w-full bg-[#030614] text-slate-200 border border-slate-850 rounded-xl p-4 font-mono text-xs focus:ring-1 focus:ring-cyan-500/50 outline-none select-text resize-none min-h-[220px] shadow-inner"
            ></textarea>

            <div className="flex items-center justify-between font-mono text-[9px] text-slate-500">
              <span>SALVATAGGIO AUTOMATICO ATTIVO // HARDWARE SYNCED</span>
              <span>CARATTERI INSERITI: {notes.length}</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
