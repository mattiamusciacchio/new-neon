/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { CyberFile, Evidence } from "../types";
import { soundEngine } from "../utils/audio";
import { Terminal, Lock, Unlock, ShieldAlert, Cpu, Database, Eye } from "lucide-react";

interface HackingTerminalProps {
  files: CyberFile[];
  hackedFileIds: string[];
  evidence: Evidence[];
  onFileDecrypted: (fileId: string, unlockedClueIds: string[]) => void;
  gameLog: (message: string) => void;
}

export default function HackingTerminal({
  files,
  hackedFileIds,
  evidence,
  onFileDecrypted,
  gameLog,
}: HackingTerminalProps) {
  const [selectedFile, setSelectedFile] = useState<CyberFile | null>(files[0] || null);
  
  // Hacking Game State
  const [isHacking, setIsHacking] = useState(false);
  const [matrix, setMatrix] = useState<string[][]>([]);
  const [targets, setTargets] = useState<string[]>([]);
  const [buffer, setBuffer] = useState<string[]>([]);
  const [activeSelectionIsRow, setActiveSelectionIsRow] = useState(true);
  const [activeIdx, setActiveIdx] = useState(0); // active row/column index
  const [timeLeft, setTimeLeft] = useState(30);
  const [attempts, setAttempts] = useState(4);
  const [hackOutcome, setHackOutcome] = useState<"success" | "failed" | null>(null);

  // Generate a fresh cyber breach hack
  const startBreachProtocol = (file: CyberFile) => {
    soundEngine.playMenuClick();
    setIsHacking(true);
    setHackOutcome(null);
    setBuffer([]);
    setActiveSelectionIsRow(true);
    setActiveIdx(0);
    setTimeLeft(35);
    setAttempts(5);

    // Generate 5x5 Hex Matrix
    const hexPool = ["A1", "C9", "55", "FF", "7B", "E9", "BD", "D3", "4E", "2A"];
    const newMatrix: string[][] = [];
    for (let i = 0; i < 5; i++) {
      const row: string[] = [];
      for (let j = 0; j < 5; j++) {
        row.push(hexPool[Math.floor(Math.random() * hexPool.length)]);
      }
      newMatrix.push(row);
    }
    setMatrix(newMatrix);

    // Create a target sequence of 3 elements from the matrix to guarantee solubility
    const targetSeq: string[] = [];
    let r = 0;
    let c = Math.floor(Math.random() * 5);
    targetSeq.push(newMatrix[r][c]);

    for (let step = 0; step < 2; step++) {
      if (step === 0) {
        // move along column c to a random row
        const newR = (r + Math.floor(Math.random() * 4) + 1) % 5;
        targetSeq.push(newMatrix[newR][c]);
        r = newR;
      } else {
        // move along row r to a random column
        const newC = (c + Math.floor(Math.random() * 4) + 1) % 5;
        targetSeq.push(newMatrix[r][newC]);
        c = newC;
      }
    }

    setTargets(targetSeq);
  };

  // Timer countdown
  useEffect(() => {
    if (!isHacking || hackOutcome) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleHackFailure();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isHacking, hackOutcome]);

  const handleNodeClick = (r: number, c: number) => {
    if (!isHacking || hackOutcome) return;
    
    // Check if the clicked node is within the selected row/column constraints
    if (activeSelectionIsRow) {
      if (r !== activeIdx) {
        soundEngine.playBeep(150, 0.1, "sawtooth"); // error buzz
        return;
      }
    } else {
      if (c !== activeIdx) {
        soundEngine.playBeep(150, 0.1, "sawtooth"); // error buzz
        return;
      }
    }

    const clickedValue = matrix[r][c];
    soundEngine.playClick();
    
    // Add value to buffer
    const newBuffer = [...buffer, clickedValue];
    setBuffer(newBuffer);

    // Disable node or update matrix cell so it can't be clicked twice (replace with empty string)
    const updatedMatrix = matrix.map((rowArr, i) =>
      rowArr.map((val, j) => (i === r && j === c ? "XX" : val))
    );
    setMatrix(updatedMatrix);

    // Switch selection rule (alternating Row -> Column -> Row -> Column)
    if (activeSelectionIsRow) {
      setActiveSelectionIsRow(false);
      setActiveIdx(c); // restrict next step to the clicked column
    } else {
      setActiveSelectionIsRow(true);
      setActiveIdx(r); // restrict next step to the clicked row
    }

    // Check win condition: does the buffer contain the targets as a continuous sub-sequence?
    const isSuccess = checkTargetMatch(newBuffer, targets);
    if (isSuccess) {
      handleHackSuccess();
      return;
    }

    // Check loss condition
    const remainingAttempts = attempts - 1;
    setAttempts(remainingAttempts);
    if (remainingAttempts <= 0 || newBuffer.length >= 6) {
      handleHackFailure();
    }
  };

  const checkTargetMatch = (buf: string[], targetList: string[]): boolean => {
    if (buf.length < targetList.length) return false;
    // Check if target sequence exists anywhere inside the buffer in order
    // (We can relax to check if target is fully matched at the very end of buffer)
    const bufStr = buf.join(",");
    const targetStr = targetList.join(",");
    return bufStr.includes(targetStr);
  };

  const handleHackSuccess = () => {
    setHackOutcome("success");
    soundEngine.playUnlock();
    if (selectedFile) {
      onFileDecrypted(selectedFile.id, selectedFile.indiziSbloccabili);
      gameLog(`HACK EFFETTUATO: Scannerizzato file digitale crittografato "${selectedFile.titolo}". Nuove prove esportate.`);
    }
    setTimeout(() => {
      setIsHacking(false);
      setHackOutcome(null);
    }, 1800);
  };

  const handleHackFailure = () => {
    setHackOutcome("failed");
    soundEngine.playGlitch();
    gameLog(`CONTRO-MANOVRA CYBERNETICA: Fallito tentativo di decrittazione su file "${selectedFile?.titolo}". Protezione rinforzata.`);
    setTimeout(() => {
      setIsHacking(false);
      setHackOutcome(null);
    }, 1800);
  };

  const isUnlocked = (file: CyberFile) => {
    return !file.isLocked || hackedFileIds.includes(file.id);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-5 h-full opacity-100 font-mono" id="hacking_terminal_root">
      
      {/* File Sidebar */}
      <div className="md:col-span-4 glass-panel border-l-2 border-magenta rounded-xl p-4 flex flex-col space-y-3 shadow-lg shadow-black/40">
        <h3 className="text-sm font-semibold neon-magenta tracking-wider flex items-center gap-2 border-b border-magenta/20 pb-2">
          <Database className="w-4 h-4 text-magenta" /> RETE INTRANET ECLIPSE
        </h3>
        
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          {files.map((file) => {
            const unlocked = isUnlocked(file);
            const active = selectedFile?.id === file.id;
            return (
              <button
                key={file.id}
                id={`cyber_file_btn_${file.id}`}
                onClick={() => {
                  soundEngine.playMenuClick();
                  setSelectedFile(file);
                  setIsHacking(false);
                }}
                className={`w-full text-left p-3 rounded-lg border transition-all duration-300 flex flex-col space-y-1 ${
                  active
                    ? "bg-cyan-950/40 border-cyan-400/80 shadow-md shadow-cyan-950/20"
                    : "bg-slate-900/40 border-slate-800/40 hover:border-slate-700 hover:bg-slate-800/20"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className={`text-[11px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded ${
                    file.tipo === "email" ? "bg-purple-950/50 text-purple-400 border border-purple-500/20" :
                    file.tipo === "transaction" ? "bg-yellow-950/50 text-yellow-500 border border-yellow-500/20" :
                    "bg-red-950/50 text-red-400 border border-red-500/20"
                  }`}>
                    {file.tipo}
                  </span>
                  {unlocked ? (
                    <Unlock className="w-3 h-3 text-cyan-400 animate-pulse" />
                  ) : (
                    <Lock className="w-3 h-3 text-red-500" />
                  )}
                </div>
                <h4 className="text-xs font-medium text-slate-100 truncate w-full pt-1">
                  {file.titolo}
                </h4>
                <p className="text-[10px] font-mono text-slate-400">
                  {file.data}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Terminal Area */}
      <div className="md:col-span-8 glass-panel border-r-2 border-cyan-500 rounded-xl p-5 flex flex-col justify-between shadow-xl relative overflow-hidden min-h-[420px]">
        {/* Futuristic Scanline overlay */}
        <div className="absolute inset-0 bg-scanlines pointer-events-none opacity-5"></div>
        
        {selectedFile && (
          <div className="flex flex-col h-full justify-between z-10">
            
            {/* Header */}
            <div className="border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono text-cyan-500/80 tracking-widest flex items-center gap-1.5">
                  <Terminal className="w-3 h-3 animate-pulse" /> //CONESSIONE SECURA // ECLIPSE_SYS
                </span>
                <span className="text-[10px] font-mono text-slate-500">{selectedFile.id.toUpperCase()}</span>
              </div>
              <h2 className="text-lg font-bold text-slate-100 tracking-wide font-sans">{selectedFile.titolo}</h2>
              
              <div className="grid grid-cols-2 gap-2 mt-2 text-[11px] font-mono text-slate-400">
                {selectedFile.mittente && <div><span className="text-slate-600">Da:</span> {selectedFile.mittente}</div>}
                {selectedFile.destinatario && <div><span className="text-slate-600">A:</span> {selectedFile.destinatario}</div>}
                <div><span className="text-slate-600">Marcatore:</span> {selectedFile.data}</div>
              </div>
            </div>

            {/* Document Content Display */}
            {isUnlocked(selectedFile) ? (
              <div className="flex-1 bg-black/40 border border-slate-900 rounded-lg p-4 font-mono text-xs text-slate-300 space-y-3 overflow-y-auto leading-relaxed custom-scrollbar shadow-inner select-text">
                <div className="text-cyan-400/80 mb-2 border-b border-slate-900 pb-1 flex items-center gap-1.5 text-[10px]">
                  <Eye className="w-3 h-3" /> DECRITTATO AUTO_DECK_PROT.V1
                </div>
                {selectedFile.corpo.split("\n").map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
                
                {/* Linked Clues */}
                {selectedFile.indiziSbloccabili.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-cyan-500/15">
                    <p className="text-[10.5px] font-semibold text-cyan-400 tracking-wider mb-1.5 flex items-center gap-1">
                      <Cpu className="w-3.5 h-3.5" /> ESTRATTO DATAPACK PROVE:
                    </p>
                    <div className="space-y-1">
                      {selectedFile.indiziSbloccabili.map((indizioId) => {
                        const originalClue = evidence.find(e => e.id === indizioId || (indizioId === "reclamato_riscatto" && e.id === "datapad_sato") || (indizioId === "corruzione_jax" && e.id === "access_logs_clue"));
                        return (
                          <div key={indizioId} className="bg-slate-900/80 border border-cyan-500/10 px-2 py-1 rounded text-[10px] text-cyan-300 flex items-center justify-between">
                            <span>🔑 Indizio: {originalClue ? originalClue.nome : indizioId.toUpperCase().replace("_", " ")} sbloccato nel Taccuino</span>
                            <span className="text-[8px] bg-cyan-950 px-1 rounded text-cyan-400 font-bold uppercase">notebook aggiornato</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : !isHacking ? (
              /* Blocked View, Click to Breach */
              <div className="flex-1 flex flex-col items-center justify-center p-8 bg-black/40 border border-dotted border-red-500/20 rounded-lg text-center space-y-4">
                <div className="w-12 h-12 bg-red-950/20 border border-red-500/30 rounded-full flex items-center justify-center text-red-500 animate-pulse">
                  <Lock className="w-6 h-6" />
                </div>
                <div className="space-y-1.5">
                  <h4 className="text-sm font-bold text-red-400 tracking-wider">FILE CRITTOGRAFATO</h4>
                  <p className="text-xs text-slate-400 max-w-sm">
                    L'accesso a questo frammento è bloccato da cifratura molecolare. Usa la console per aggirare il sistema di sicurezza corporativo.
                  </p>
                </div>
                <button
                  onClick={() => startBreachProtocol(selectedFile)}
                  className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/40 font-mono text-xs uppercase px-4 py-2 rounded-lg transition-all cursor-pointer font-semibold tracking-widest hover:border-red-500 flex items-center gap-2 shadow-lg shadow-red-950/10"
                >
                  <Terminal className="w-4 h-4 animate-pulse" /> ESEGUI PROTOCOLLO BREACH
                </button>
              </div>
            ) : (
              /* Breach Hacking Game */
              <div className="flex-1 bg-black/60 border border-cyan-500/20 rounded-lg p-4 flex flex-col justify-between space-y-3">
                {/* Game Header */}
                <div className="flex items-center justify-between border-b border-cyan-500/10 pb-2">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-red-500 animate-pulse" />
                    <span className="text-xs font-mono font-bold text-red-400 tracking-widest uppercase">Breach Protocol Attivo</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-mono">
                    <div className="text-slate-400">Tentativi Buffer: <span className="text-cyan-400 font-bold">{6 - buffer.length}</span></div>
                    <div className="text-slate-400">Tempo Rimanente: <span className="text-yellow-500 font-bold">{timeLeft}s</span></div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 flex-1 items-center">
                  
                  {/* Left: Interactive 5x5 Grid */}
                  <div className="md:col-span-7 flex flex-col items-center">
                    <span className="text-[10px] font-mono text-slate-500 mb-2">
                      SELEZIONE ATTIVA: {activeSelectionIsRow ? `RIGA ${activeIdx + 1}` : `COLONNA ${activeIdx + 1}`}
                    </span>
                    <div className="grid grid-cols-5 gap-1.5 bg-slate-950 p-2.5 rounded-lg border border-cyan-500/10">
                      {matrix.map((row, rIdx) => (
                        row.map((val, cIdx) => {
                          const isSelectable = activeSelectionIsRow ? rIdx === activeIdx : cIdx === activeIdx;
                          const isEmpty = val === "XX";
                          const isRowLeader = activeSelectionIsRow && rIdx === activeIdx;
                          const isColLeader = !activeSelectionIsRow && cIdx === activeIdx;

                          return (
                            <button
                              key={`${rIdx}-${cIdx}`}
                              disabled={isEmpty || !isSelectable || !!hackOutcome}
                              onClick={() => handleNodeClick(rIdx, cIdx)}
                              className={`w-9 h-9 flex items-center justify-center font-mono text-[12.5px] rounded transition-all font-bold ${
                                isEmpty
                                  ? "bg-slate-900 border border-slate-950 text-slate-700 cursor-not-allowed"
                                  : isSelectable
                                  ? "bg-cyan-950/60 border-cyan-500/70 text-cyan-300 hover:bg-cyan-500 hover:text-black cursor-pointer shadow-sm shadow-cyan-900/20"
                                  : "bg-slate-900/30 border border-transparent text-slate-600 cursor-not-allowed"
                              } ${(isRowLeader || isColLeader) && !isEmpty ? "ring-1 ring-cyan-400/50" : ""}`}
                            >
                              {val}
                            </button>
                          );
                        })
                      ))}
                    </div>
                  </div>

                  {/* Right: Targets and Buffer */}
                  <div className="md:col-span-5 space-y-3.5 flex flex-col justify-center h-full">
                    {/* Hacking Targets */}
                    <div className="bg-slate-950 p-3 rounded border border-slate-900">
                      <span className="text-[10px] font-mono text-cyan-400 tracking-wider block mb-1">SEQUENZA DA COSTRUIRE</span>
                      <div className="flex gap-1.5">
                        {targets.map((tgt, i) => (
                          <span
                            key={i}
                            className={`px-2 py-1 font-mono text-xs rounded border ${
                              buffer.join(",").includes(targets.slice(0, i+1).join(","))
                                ? "bg-cyan-950/40 border-cyan-400 text-cyan-400 font-extrabold animate-pulse"
                                : "bg-slate-900 border-slate-800 text-slate-500"
                            }`}
                          >
                            {tgt}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Buffer Input Bar */}
                    <div className="bg-slate-950 p-3 rounded border border-slate-900">
                      <span className="text-[10px] font-mono text-slate-400 tracking-wider block mb-1">BUFFER DATI CARICATO({buffer.length}/6)</span>
                      <div className="flex gap-1.5 min-h-[28px] items-center">
                        {buffer.length === 0 ? (
                          <span className="text-[10px] font-mono text-slate-600 italic">Clicca sulle cifre attive...</span>
                        ) : (
                          buffer.map((bufValue, i) => (
                            <span key={i} className="px-1.5 py-0.5 bg-slate-900 border border-slate-800 rounded font-mono text-xs text-cyan-400">
                              {bufValue}
                            </span>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Progress feedback */}
                    <div className="text-center min-h-[30px] flex items-center justify-center font-mono font-bold text-xs">
                      {hackOutcome === "success" && (
                        <span className="text-cyan-400 animate-bounce tracking-widest uppercase">🔓 FILE DECRITTATO CORRETTAMENTE!</span>
                      )}
                      {hackOutcome === "failed" && (
                        <span className="text-red-500 animate-pulse tracking-widest uppercase">🚨 ACCESSO FALLITO - ALLARME</span>
                      )}
                    </div>

                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
