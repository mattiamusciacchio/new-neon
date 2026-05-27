/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { NPC, Evidence, Case, MotiveType } from "../types";
import { soundEngine } from "../utils/audio";
import { MOTIVES } from "../utils/procedural";
import { ShieldAlert, Send, FileCheck, RefreshCw, AlertCircle, Award } from "lucide-react";

interface AccuseVerdictProps {
  npcs: NPC[];
  evidence: Evidence[];
  gameCase: Case | null;
  onAccuseSubmitted: (
    assassinoId: string,
    armaDelittoId: string,
    motiveType: MotiveType,
    provingClueId: string
  ) => void;
  victoryState: "playing" | "success" | "failure" | "compromise";
  endingText: string;
  onResetGame: () => void;
}

export default function AccuseVerdict({
  npcs,
  evidence,
  gameCase,
  onAccuseSubmitted,
  victoryState,
  endingText,
  onResetGame,
}: AccuseVerdictProps) {
  const [selectedKillerId, setSelectedKillerId] = useState<string>("");
  const [selectedWeaponId, setSelectedWeaponId] = useState<string>("");
  const [selectedMotiveType, setSelectedMotiveType] = useState<MotiveType | "">("");
  const [selectedProvingClueId, setSelectedProvingClueId] = useState<string>("");
  const [isVerifying, setIsVerifying] = useState(false);

  if (!gameCase) return null;

  const weaponsList = evidence.filter((e) => e.tipo === "weapon");
  const discoveredClues = evidence.filter((e) => e.scoperto);

  const handleSubmitCase = () => {
    if (!selectedKillerId || !selectedWeaponId || !selectedMotiveType || !selectedProvingClueId) {
      soundEngine.playBeep(150, 0.2, "sawtooth");
      return;
    }

    soundEngine.playMenuClick();
    setIsVerifying(true);

    // After an automated dramatic terminal sweep delay of 1.5s, post results
    setTimeout(() => {
      setIsVerifying(false);
      onAccuseSubmitted(
        selectedKillerId,
        selectedWeaponId,
        selectedMotiveType as MotiveType,
        selectedProvingClueId
      );
    }, 1500);
  };

  const getEndingTitle = () => {
    switch (victoryState) {
      case "success": return "🏆 INDAGINE CONCLUSA: FINE PERFETTA";
      case "failure": return "🚨 ERRORE FATALE: FALSA ACCUSA";
      case "compromise": return "⚠️ ACCORDO DI COMPROMESSO";
      default: return "NOT_YET_RESOLVED";
    }
  };

  return (
    <div className="glass-panel border-l-2 border-magenta rounded-xl p-5 shadow-2xl h-full min-h-[460px] flex flex-col justify-between font-mono" id="verdict_root_panel">
      
      {/* Title */}
      <div className="border-b border-cyan-500/10 pb-3 mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold neon-magenta tracking-wider flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 animate-pulse text-red-500" /> CORPO D'ACCUSA FINALE
          </h2>
          <p className="text-[11px] text-slate-400 pt-0.5">
            Formula il verdetto d'accusa definitivo sull'assassinio di Kenji Sato. Compila l'indagine trasmettendo il profilo del colpevole.
          </p>
        </div>
      </div>

      {victoryState === "playing" ? (
        /* Form mode */
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-5 z-10">
          
          {/* Left Inputs column */}
          <div className="space-y-4">
            
            {/* 1. Murderer Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-slate-400 block uppercase">1. IDENTIFICA IL RESPONSABILE (ASSASSINO):</label>
              <select
                id="accuse_killer_select"
                value={selectedKillerId}
                onChange={(e) => setSelectedKillerId(e.target.value)}
                className="w-full bg-slate-950 text-slate-200 border border-slate-800 rounded-lg p-2.5 text-xs font-mono outline-none focus:border-red-500 transition"
              >
                <option value="">-- Seleziona Sospettato --</option>
                {npcs.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.nome} ({n.ruolo})
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Murder Weapon Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-slate-400 block uppercase">2. SELEZIONA L'ARMA DEL DELITTO:</label>
              <select
                id="accuse_weapon_select"
                value={selectedWeaponId}
                onChange={(e) => setSelectedWeaponId(e.target.value)}
                className="w-full bg-slate-950 text-slate-200 border border-slate-800 rounded-lg p-2.5 text-xs font-mono outline-none focus:border-red-500 transition"
              >
                <option value="">-- Seleziona Arma --</option>
                {weaponsList.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.nome}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Motive Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-slate-400 block uppercase">3. ASSOCIA IL MOVENTE CORRETTO:</label>
              <select
                id="accuse_motive_select"
                value={selectedMotiveType}
                onChange={(e) => setSelectedMotiveType(e.target.value as MotiveType)}
                className="w-full bg-slate-950 text-slate-200 border border-slate-800 rounded-lg p-2.5 text-xs font-mono outline-none focus:border-red-500 transition"
              >
                <option value="">-- Seleziona Movente --</option>
                {MOTIVES.map((m) => (
                  <option key={m.tipo} value={m.tipo}>
                    {m.titolo}
                  </option>
                ))}
              </select>
            </div>

          </div>

          {/* Right Column: Proving evidence & Submit button */}
          <div className="space-y-4 flex flex-col justify-between">
            
            {/* 4. Proving evidence picker */}
            <div className="space-y-1.5 flex-1">
              <label className="text-xs font-mono font-bold text-slate-400 block uppercase">4. ALLEGA PROVA CHIAVE INCRIMINANTE:</label>
              <select
                id="accuse_clue_select"
                value={selectedProvingClueId}
                onChange={(e) => setSelectedProvingClueId(e.target.value)}
                className="w-full bg-slate-950 text-slate-200 border border-slate-800 rounded-lg p-2.5 text-xs font-mono outline-none focus:border-red-500 transition"
              >
                <option value="">-- Allega Prova --</option>
                {discoveredClues.map((c) => (
                  <option key={c.id} value={c.id}>
                    🔍 {c.nome} ({c.tipo})
                  </option>
                ))}
              </select>

              {discoveredClues.length === 0 && (
                <p className="text-[10px] text-red-500 font-mono italic pt-1 animate-pulse">
                  ⚠️ Attenzione! Non possiedi alcuna prova sbloccata da allegare. Esplora il complesso!
                </p>
              )}
            </div>

            {/* Status instructions warning card */}
            <div className="bg-red-950/20 border border-red-500/20 p-3.5 rounded-lg space-y-1.5">
              <p className="text-[10.5px] font-mono text-red-400 leading-snug flex items-start gap-1.5 select-text">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>Le accuse errate danneggeranno la tua reputazione, causando la fuga tempestiva del vero assassino nei bassifondi! Assicurati di confrontare la timeline e le testimonianze del Taccuino.</span>
              </p>
            </div>

            {/* Verification trigger button */}
            {isVerifying ? (
              <div className="w-full bg-red-950/40 text-red-400 border border-red-500/40 font-mono text-xs uppercase py-3 font-extrabold tracking-widest rounded-lg flex items-center justify-center gap-2">
                <span className="w-4.5 h-4.5 border-2 border-t-transparent border-red-500 rounded-full animate-spin"></span>
                TRASMISSIONE RELAZIONE INDAGINE...
              </div>
            ) : (
              <button
                id="submit_accuse_indictment_btn"
                onClick={handleSubmitCase}
                disabled={!selectedKillerId || !selectedWeaponId || !selectedMotiveType || !selectedProvingClueId}
                className="w-full bg-red-600 text-white hover:bg-red-500 font-mono text-xs font-black uppercase py-3 rounded-lg tracking-widest transition-all cursor-pointer shadow-lg shadow-red-950/20 flex items-center justify-center gap-2 transform active:scale-95 disabled:bg-slate-900 disabled:text-slate-500 disabled:border-slate-800 disabled:cursor-not-allowed border border-transparent select-none"
              >
                <Send className="w-4 h-4 text-white animate-pulse" /> INVIA VERDETTO FINALE
              </button>
            )}

          </div>

        </div>
      ) : (
        /* Epilogue screen display */
        <div className="flex-1 bg-black/60 border border-slate-850 rounded-xl p-5 flex flex-col justify-between align-middle items-center space-y-5 z-10 relative overflow-hidden">
          <div className="absolute inset-0 bg-scanlines pointer-events-none opacity-5"></div>

          <div className="w-14 h-14 bg-red-950/20 border border-red-500/30 rounded-full flex items-center justify-center text-red-500 animate-pulse shrink-0">
            {victoryState === "success" ? <Award className="w-8 h-8 text-cyan-400" /> : <AlertCircle className="w-8 h-8 text-red-500" />}
          </div>

          <div className="text-center space-y-3 max-w-xl flex-1 select-text">
            <h3 className={`text-base font-extrabold font-mono tracking-widest ${victoryState === "success" ? "text-cyan-400" : "text-red-500 animate-pulse"}`}>
              {getEndingTitle()}
            </h3>
            
            <div className="bg-slate-950/90 border border-slate-900 p-4 rounded-lg font-mono text-xs text-slate-300 leading-relaxed shadow-inner max-h-[220px] overflow-y-auto custom-scrollbar whitespace-pre-wrap select-text text-left">
              {endingText}
            </div>
          </div>

          <button
            onClick={() => {
              soundEngine.playMenuClick();
              onResetGame();
            }}
            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-slate-800 hover:border-cyan-500/40 font-mono text-xs uppercase font-extrabold tracking-widest rounded-lg flex items-center gap-1.5 transition duration-300 cursor-pointer shadow-md"
          >
            <RefreshCw className="w-4 h-4 animate-spin-slow" /> GENERATORE PARTITA NUOVA
          </button>

        </div>
      )}

    </div>
  );
}
