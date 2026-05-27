/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { generateGameCase } from "./utils/procedural";
import { soundEngine } from "./utils/audio";
import { GameState, NPC, Evidence, Room, TimelineMark, CyberFile, SecurityCamera, Case, MotiveType } from "./types";
import GameCanvas from "./components/GameCanvas";
import CCTVSystem from "./components/CCTVSystem";
import HackingTerminal from "./components/HackingTerminal";
import Notebook from "./components/Notebook";
import InterrogationPanel from "./components/InterrogationPanel";
import AccuseVerdict from "./components/AccuseVerdict";
import { Shield, Sparkles, Terminal, BookOpen, MessageSquare, Volume2, VolumeX, AlertTriangle, Eye, RefreshCw, Cpu, Clock, Compass } from "lucide-react";

const LOCAL_STORAGE_KEY = "neon_shadows_save_state_v1";

export default function App() {
  const [showIntro, setShowIntro] = useState(true);
  
  // Game state
  const [currentFloor, setCurrentFloor] = useState<number>(0);
  const [playerX, setPlayerX] = useState<number>(80);
  const [playerY, setPlayerY] = useState<number>(100);
  const [activeTab, setActiveTab] = useState<"map" | "notebook" | "cctv" | "cyberspace" | "interrogations" | "accuse">("map");
  const [notebookTab, setNotebookTab] = useState<"timeline" | "clues" | "profiles" | "relations" | "notes">("timeline");
  
  const [cluesOwned, setCluesOwned] = useState<string[]>([]);
  const [notes, setNotes] = useState<string>("");
  const [timelineMarks, setTimelineMarks] = useState<TimelineMark[]>([]);
  const [hackedFileIds, setHackedFileIds] = useState<string[]>([]);
  
  // Procedural databases
  const [rooms, setRooms] = useState<Room[]>([]);
  const [npcs, setNpcs] = useState<NPC[]>([]);
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [cameras, setCameras] = useState<SecurityCamera[]>([]);
  const [files, setFiles] = useState<CyberFile[]>([]);
  const [gameCase, setGameCase] = useState<Case | null>(null);

  // Stats and settings
  const [soundVolume, setSoundVolume] = useState<number>(0.4);
  const [soundMuted, setSoundMuted] = useState<boolean>(false);
  const [blackoutActive, setBlackoutActive] = useState<boolean>(false);
  const [gameLog, setGameLog] = useState<string[]>([
    "SISTEMA REGISTRATO: Protocolli investigativi attivi. Sei bloccato all'Eclipse Complex.",
    "INDICAZIONE: Clicca su differenti stanze della mappa ed esegui la scansione termica per rinvenire prove fisiche."
  ]);

  // Victory resolution
  const [victoryState, setVictoryState] = useState<"playing" | "success" | "failure" | "compromise">("playing");
  const [endingText, setEndingText] = useState<string>("");

  // Sound helper initiation
  useEffect(() => {
    soundEngine.setVolume(soundMuted ? 0 : soundVolume);
  }, [soundVolume, soundMuted]);

  // Try parsing existing session backup on first boot
  useEffect(() => {
    try {
      const backup = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (backup) {
        const parsed = JSON.parse(backup);
        setRooms(parsed.rooms);
        setNpcs(parsed.npcs);
        setEvidence(parsed.evidence);
        setCameras(parsed.cameras);
        setFiles(parsed.files);
        setGameCase(parsed.gameCase);
        setCluesOwned(parsed.cluesOwned);
        setTimelineMarks(parsed.timelineMarks || []);
        setNotes(parsed.notes || "");
        setHackedFileIds(parsed.hackedFileIds || []);
        setBlackoutActive(parsed.blackoutActive || false);
        setGameLog(parsed.gameLog || []);
        setVictoryState(parsed.victoryState || "playing");
        setEndingText(parsed.endingText || "");
        setShowIntro(false);
      } else {
        createNewGame();
      }
    } catch {
      createNewGame();
    }
  }, []);

  // Sync state data on changes
  const saveStateToStorage = (updatedProps: Partial<any> = {}) => {
    try {
      const dataToSave = {
        rooms: updatedProps.rooms || rooms,
        npcs: updatedProps.npcs || npcs,
        evidence: updatedProps.evidence || evidence,
        cameras: updatedProps.cameras || cameras,
        files: updatedProps.files || files,
        gameCase: updatedProps.gameCase || gameCase,
        cluesOwned: updatedProps.cluesOwned !== undefined ? updatedProps.cluesOwned : cluesOwned,
        timelineMarks: updatedProps.timelineMarks !== undefined ? updatedProps.timelineMarks : timelineMarks,
        notes: updatedProps.notes !== undefined ? updatedProps.notes : notes,
        hackedFileIds: updatedProps.hackedFileIds !== undefined ? updatedProps.hackedFileIds : hackedFileIds,
        blackoutActive: updatedProps.blackoutActive !== undefined ? updatedProps.blackoutActive : blackoutActive,
        gameLog: updatedProps.gameLog || gameLog,
        victoryState: updatedProps.victoryState || victoryState,
        endingText: updatedProps.endingText || endingText,
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToSave));
    } catch {}
  };

  const createNewGame = () => {
    const data = generateGameCase();
    setRooms(data.rooms);
    setNpcs(data.npcs);
    setEvidence(data.evidence);
    setCameras(data.cameras);
    setFiles(data.files);
    setGameCase(data.gameCase);
    setCluesOwned([]);
    setTimelineMarks([]);
    setNotes("");
    setHackedFileIds([]);
    setBlackoutActive(false);
    setVictoryState("playing");
    setEndingText("");
    
    const introLogs = [
      "SISTEMA REGISTRATO: Protocolli d'inchiesta d'emergenza caricati.",
      "ORE 22:00: Omicidio dello scienziato Kenji Sato ad Eclipse City. Edificio isolato.",
      "ISTRUZIONE: Esplora i vari piani usando il radar di scansione, hackera i file digitali sul terminale e interroga i sospettati. Controlla il Taccuino!"
    ];
    setGameLog(introLogs);

    // Persist immediately
    saveStateToStorage({
      rooms: data.rooms,
      npcs: data.npcs,
      evidence: data.evidence,
      cameras: data.cameras,
      files: data.files,
      gameCase: data.gameCase,
      cluesOwned: [],
      timelineMarks: [],
      notes: "",
      hackedFileIds: [],
      blackoutActive: false,
      gameLog: introLogs,
      victoryState: "playing",
      endingText: ""
    });
  };

  const handleClueDiscovered = (clueId: string) => {
    setCluesOwned((prev) => {
      const next = prev.includes(clueId) ? prev : [...prev, clueId];
      
      // Update evidence flag database
      const updatedEvidence = evidence.map((e) => (e.id === clueId ? { ...e, scoperto: true } : e));
      setEvidence(updatedEvidence);

      saveStateToStorage({ cluesOwned: next, evidence: updatedEvidence });
      return next;
    });
  };

  const handleFileDecrypted = (fileId: string, unlockedClueIds: string[]) => {
    setHackedFileIds((prev) => {
      const next = prev.includes(fileId) ? prev : [...prev, fileId];
      
      // Mark unlocked files
      const updatedFiles = files.map((file) => (file.id === fileId ? { ...file, isLocked: false } : file));
      setFiles(updatedFiles);

      // Extract clues referenced by the hacked document
      const currentClues = [...cluesOwned];
      unlockedClueIds.forEach((cId) => {
        if (!currentClues.includes(cId)) {
          currentClues.push(cId);
        }
      });
      setCluesOwned(currentClues);

      const updatedEvidence = evidence.map((ev) =>
        unlockedClueIds.includes(ev.id) || (fileId === "mail_blackmail" && ev.id === "datapad_sato") || (fileId === "bank_ledger" && ev.id === "access_logs_clue")
          ? { ...ev, scoperto: true }
          : ev
      );
      setEvidence(updatedEvidence);

      saveStateToStorage({
        hackedFileIds: next,
        files: updatedFiles,
        cluesOwned: currentClues,
        evidence: updatedEvidence,
      });

      return next;
    });
  };

  const handleSetTimelineMark = (ora: string, npcId: string, luogoId: string) => {
    setTimelineMarks((prev) => {
      // filter out older mark for same NPC at same hour if exists
      const filtered = prev.filter((mark) => !(mark.ora === ora && mark.npcId === npcId));
      let next = [...filtered];
      if (luogoId) {
        next.push({ ora, npcId, luogoId });
      }
      saveStateToStorage({ timelineMarks: next });
      return next;
    });
  };

  const handleUpdateNotes = (newNotes: string) => {
    setNotes(newNotes);
    saveStateToStorage({ notes: newNotes });
  };

  // Stress spikes & profile secrets unlocking
  const handleSecretUnlocked = (npcId: string, secretIndex: number) => {
    const updatedNpcs = npcs.map((npc) => {
      if (npc.id === npcId) {
        const updatedSecrets = npc.segreti.map((sec, sIdx) =>
          sIdx === secretIndex ? { ...sec, sbloccato: true } : sec
        );
        return { ...npc, segreti: updatedSecrets };
      }
      return npc;
    });
    setNpcs(updatedNpcs);
    saveStateToStorage({ npcs: updatedNpcs });
  };

  const handleUpdateStress = (npcId: string, stress: number, cooperation: number) => {
    const updatedNpcs = npcs.map((npc) => {
      if (npc.id === npcId) {
        return {
          ...npc,
          statoPsicologico: {
            ...npc.statoPsicologico,
            stress: Math.max(0, Math.min(100, stress)),
            cooperazione: Math.max(0, Math.min(100, cooperation)),
          },
        };
      }
      return npc;
    });
    setNpcs(updatedNpcs);
    saveStateToStorage({ npcs: updatedNpcs });
  };

  const addGameLog = (msg: string) => {
    const timeStr = new Date().toISOString().substring(11, 19);
    const stamped = `[${timeStr}] ${msg}`;
    setGameLog((prev) => {
      const next = [stamped, ...prev.slice(0, 40)];
      saveStateToStorage({ gameLog: next });
      return next;
    });
  };

  // Submit Final indictment logic
  const handleAccuseSubmitted = (
    assassinoId: string,
    armaDelittoId: string,
    motiveType: MotiveType,
    provingClueId: string
  ) => {
    if (!gameCase) return;

    const killerNpc = npcs.find((n) => n.id === assassinoId)!;
    const correctKillerNpc = npcs.find((n) => n.id === gameCase.assassinoId)!;
    const correctWeapon = evidence.find((e) => e.id === gameCase.armaDelittoId)!;

    const isKillerCorrect = assassinoId === gameCase.assassinoId;
    const isWeaponCorrect = armaDelittoId === gameCase.armaDelittoId;
    const isMotiveCorrect = motiveType === gameCase.motive.tipo;
    const hasProvingClue = provingClueId === "indizio_fibra" || provingClueId === "access_logs_clue";

    let state: "success" | "failure" | "compromise";
    let text = "";

    if (isKillerCorrect && isWeaponCorrect && isMotiveCorrect && hasProvingClue) {
      state = "success";
      text = `EPILOGO NARRATIVO: FINE PERFETTA (INDAGINE ECCELLENTE)\n\nHai inchiodato ${killerNpc.nome} (${killerNpc.ruolo}) provandone la colpevolezza in modo inoppugnabile.\n\nFronteggiato con la prova balistica decisiva '${evidence.find(e => e.id === provingClueId)?.nome}' e le evidenze d'analisi della timeline, il colpevole ha avuto un drammatico cedimento emotivo, confessando di aver rimosso lo scienziato Kenji Sato per conto di '${gameCase.motive.descrizione}'.\n\nI droni di pattuglia corporativa ti consegnano la card d'espatrio. Eclipse City celebra un rarissimo momento di giustizia pura. Complimenti, investigatore.`;
    } else if (!isKillerCorrect) {
      state = "failure";
      text = `EPILOGO NARRATIVO: FALSA ACCUSA (ERRORE CATASTROFICO)\n\nHai ordinato l'arresto forzato di un innocente: ${killerNpc.nome}.\n\nNel caos procedurale derivato dalle vibranti smentite del sospetto, il vero colpevole (${correctKillerNpc.nome}) ha avuto tutto il tempo di corrompere i droni di evacuazione, raschiare i log d'accesso digitali residui e svanire nel labirinto di appartamenti e condutture fognarie dei bassifondi verticali più profondi.\n\nSenz'armi di rivalsa, la corporazione coprirà l'incidente ma la colpa di aver rovinato una vita graverà per sempre sul tuo cyberdeck cervicale.`;
    } else {
      state = "compromise";
      text = `EPILOGO NARRATIVO: COMPROMESSO DEBOLE (FUGA CON VIZIO DI FORMA)\n\nHai individuato il colpevole corretto (${killerNpc.nome}), ma la tua ricostruzione accusatoria era debole.\n\n${!isWeaponCorrect ? `• L'arma presentata era errata (quella vera era '${correctWeapon.nome}').\n` : ""}${!isMotiveCorrect ? `• Il movente imputato era errato.\n` : ""}• Mancavano prove regine solidamente accoppiate.\n\nGli avvocati di Eclipse Inc. hanno eccepito vizi procedurali sbloccando immediatamente lo stato detentivo e ottenendo il rilascio immediato del colpevole per insufficienza di prove. ${killerNpc.nome} cammina ora libero per i corridoi dell'edificio sghignazzando del tuo scarso operato. Un finale agrodolce.`;
    }

    setVictoryState(state);
    setEndingText(text);
    saveStateToStorage({ victoryState: state, endingText: text });
    soundEngine.playGlitch();
  };

  const toggleBlackoutEvent = () => {
    soundEngine.playGlitch();
    const nextBlackout = !blackoutActive;
    setBlackoutActive(nextBlackout);
    
    // Changing alert state changes stress of all suspects
    const updatedNpcs = npcs.map((npc) => {
      const addedStress = nextBlackout ? 25 : -20;
      return {
        ...npc,
        statoPsicologico: {
          ...npc.statoPsicologico,
          stress: Math.max(10, Math.min(100, npc.statoPsicologico.stress + addedStress)),
        }
      };
    });
    setNpcs(updatedNpcs);

    const msg = nextBlackout
      ? "RETICOLO ENERGETICO COLPITO: Sabotaggio alimentazione! Luci d'emergenza rosse attivate. Lo stress complessivo degli NPC aumenta."
      : "SISTEMA ELETTRICO RIPRISTINATO: Generatori ricollegati con successo.";
    
    addGameLog(msg);
    saveStateToStorage({ blackoutActive: nextBlackout, npcs: updatedNpcs });
  };

  return (
    <div className="min-h-screen bg-[#000000] text-[#e0e0ff] flex flex-col font-sans select-none relative overflow-hidden" id="neon_shadows_mainframe_outer">
      
      {/* Immersive CRT Scanline and subpixel color grid */}
      <div className="scanline pointer-events-none"></div>

      {/* Dynamic Cyber background grid */}
      <div className="absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-cyan-950/20 to-transparent pointer-events-none z-0"></div>
      
      {/* Intro Modal Overlay */}
      {showIntro && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center p-4 z-50 backdrop-blur-md">
          <div className="bg-[#04081c] border-2 border-cyan-500/30 max-w-xl w-full p-6.5 rounded-2xl shadow-xl shadow-cyan-950/20 text-center space-y-6 relative">
            <div className="absolute inset-0 bg-scanlines opacity-[0.04] pointer-events-none"></div>
            
            <div className="w-16 h-16 bg-cyan-950/40 border border-cyan-400/40 rounded-full flex items-center justify-center text-cyan-400 mx-auto animate-pulse">
              <Cpu className="w-8 h-8 text-cyan-400" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-widest text-[#00FFFF] font-mono leading-none">NEON SHADOWS</h1>
              <p className="text-[10px] uppercase font-mono tracking-widest text-slate-500">Mistero Cibernetico & Deduzione Logica</p>
            </div>

            <div className="bg-black/60 p-4 rounded-xl border border-slate-900 text-xs text-slate-300 font-mono leading-relaxed space-y-3.5 select-text text-left shadow-inner">
              <p className="text-cyan-400/90 font-bold border-b border-slate-900 pb-1 uppercase tracking-wider">▲ Eclipse Complex - Isolamento Attivo</p>
              <p>È stato rilevato un assassinio d'impatto alle ore <span className="text-red-400 font-extrabold">22:00</span>. Vittima: lo scienziato capo <span className="text-slate-100 font-semibold">Kenji Sato</span>.</p>
              <p>Il complesso verticale è sigillato sotto quarantena d'emergenza. Tutti i cinque sospettati negano e mentono per proteggere i loro canali oscuri.</p>
              <p>Indaga la mappa, analizza la timeline e raccogli le prove per formulare il verdetto d'accusa definitivo!</p>
            </div>

            <button
              onClick={() => {
                soundEngine.startNeonHum();
                soundEngine.playUnlock();
                setShowIntro(false);
              }}
              className="bg-cyan-500 hover:bg-cyan-400 text-black border border-cyan-400 px-8 py-3.5 rounded-xl font-mono text-sm uppercase tracking-widest font-black transition cursor-pointer shadow-lg shadow-cyan-500/10 inline-flex items-center gap-2"
            >
              <Compass className="w-5 h-5" /> AVVIA INVESTIGAZIONE
            </button>
          </div>
        </div>
      )}

      {/* Main Mainframe Header */}
      <header className="glass-panel border-b-2 border-cyan-500/50 px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4 z-10 select-none">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-cyan-500 rounded-sm shadow-[0_0_15px_rgba(0,255,255,0.8)] flex items-center justify-center font-bold text-black font-sans">NS</div>
          <div>
            <h1 className="text-xl font-bold tracking-tighter neon-cyan italic leading-none flex items-center gap-2">
              NEON SHADOWS <span className="text-xs font-mono not-italic opacity-50">V1.0.4-BETA</span>
            </h1>
            <p className="text-[10px] text-slate-500 font-mono">RETICOLO INDAGINE COMMESSO</p>
          </div>
        </div>

        {/* Global controller bar */}
        <div className="flex flex-wrap items-center gap-4">
          
          {/* Blackout toggle button */}
          <button
            onClick={toggleBlackoutEvent}
            className={`px-3 py-1.5 rounded-md border text-[10.5px] font-mono tracking-wider font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
              blackoutActive
                ? "bg-red-500 text-black border-red-500 shadow animate-pulse"
                : "bg-slate-950 hover:bg-slate-900 border-red-500/35 text-red-400 hover:border-red-500"
            }`}
          >
            <AlertTriangle className={`w-3.5 h-3.5 ${blackoutActive ? "text-black" : "text-red-500"}`} />
            {blackoutActive ? "SABOTAGGIO ATTIVO" : "DISINNESTA GENERATORE"}
          </button>

          {/* Volume toggle */}
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-900 rounded-lg px-3 py-1.5 font-mono text-[11px]">
            <button
              onClick={() => {
                soundEngine.playMenuClick();
                setSoundMuted(!soundMuted);
              }}
              className="text-slate-400 hover:text-cyan-400 cursor-pointer"
            >
              {soundMuted ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={soundVolume}
              onChange={(e) => setSoundVolume(parseFloat(e.target.value))}
              className="w-16 h-1 bg-slate-800 rounded-lg cursor-pointer accent-cyan-400 outline-none"
            />
          </div>

          {/* Quick reset */}
          <button
            onClick={() => {
              if (confirm("Sei sicuro di voler rimescolare l'alibi e rigenerare un caso del tutto diverso?")) {
                soundEngine.playUnlock();
                createNewGame();
              }
            }}
            className="p-1.5 rounded bg-slate-950 border border-slate-900 text-slate-500 hover:text-cyan-400 transition cursor-pointer"
            title="Rigenera Caso"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

        </div>
      </header>

      {/* Main tabs control deck */}
      <div className="flex flex-wrap border-b border-cyan-500/30 md:px-6 bg-[#0a0e27]/85 z-10 font-mono">
        {[
          { id: "map", title: "Mappa", icon: Compass },
          { id: "notebook", title: "Taccuino", icon: BookOpen },
          { id: "cctv", title: "Video CCTV", icon: Eye },
          { id: "cyberspace", title: "Rete Digitale", icon: Terminal },
          { id: "interrogations", title: "Interrogatori", icon: MessageSquare },
          { id: "accuse", title: "Accusa", icon: Shield },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                soundEngine.playMenuClick();
                setActiveTab(tab.id as any);
              }}
              className={`flex items-center gap-2 px-5 py-4 text-xs font-black tracking-widest uppercase transition-all duration-300 border-b-2 ${
                active
                  ? "border-b-[#00FFFF] text-[#00FFFF] neon-cyan bg-cyan-950/20 font-bold"
                  : "border-b-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-950/20"
              }`}
            >
              <Icon className="w-4 h-4" /> {tab.title}
            </button>
          );
        })}
      </div>

      {/* Primary Display Viewport */}
      <main className="flex-1 p-5 md:p-6 select-none z-10 overflow-y-auto max-w-7xl mx-auto w-full custom-scrollbar">
        
        {/* VIEWPORTS */}
        {activeTab === "map" && (
          <GameCanvas
            currentFloor={currentFloor}
            rooms={rooms}
            npcs={npcs}
            evidence={evidence}
            cluesOwned={cluesOwned}
            playerX={playerX}
            playerY={playerY}
            onMovePlayer={(x, y) => {
              setPlayerX(x);
              setPlayerY(y);
            }}
            onUpdateFloor={setCurrentFloor}
            onClueDiscovered={handleClueDiscovered}
            gameLog={addGameLog}
            blackoutActive={blackoutActive}
          />
        )}

        {activeTab === "notebook" && (
          <Notebook
            npcs={npcs}
            evidence={evidence}
            rooms={rooms}
            timelineMarks={timelineMarks}
            notes={notes}
            onUpdateNotes={handleUpdateNotes}
            onSetTimelineMark={handleSetTimelineMark}
            notebookTab={notebookTab}
            onChangeNotebookTab={setNotebookTab}
          />
        )}

        {activeTab === "cctv" && (
          <CCTVSystem
            cameras={cameras}
            npcs={npcs}
          />
        )}

        {activeTab === "cyberspace" && (
          <HackingTerminal
            files={files}
            hackedFileIds={hackedFileIds}
            evidence={evidence}
            onFileDecrypted={handleFileDecrypted}
            gameLog={addGameLog}
          />
        )}

        {activeTab === "interrogations" && (
          <InterrogationPanel
            npcs={npcs}
            evidence={evidence}
            rooms={rooms}
            assassinoId={gameCase?.assassinoId || ""}
            armaDelittoId={gameCase?.armaDelittoId || ""}
            onSecretUnlocked={handleSecretUnlocked}
            onUpdateStress={handleUpdateStress}
            gameLog={addGameLog}
          />
        )}

        {activeTab === "accuse" && (
          <AccuseVerdict
            npcs={npcs}
            evidence={evidence}
            gameCase={gameCase}
            onAccuseSubmitted={handleAccuseSubmitted}
            victoryState={victoryState}
            endingText={endingText}
            onResetGame={createNewGame}
          />
        )}

      </main>

      {/* Logs and diagnostic footer */}
      <footer className="border-t border-slate-900 bg-[#030614]/93 p-4 z-10 flex flex-col md:flex-row justify-between items-center gap-4">
        
        {/* scrolling logger stream */}
        <div className="flex-1 w-full max-h-[46px] overflow-y-auto custom-scrollbar select-text leading-relaxed bg-black/40 border border-slate-950 p-2 rounded-lg">
          {gameLog.length === 0 ? (
            <div className="text-[10px] font-mono text-slate-650 italic">Attesa scansioni di rete...</div>
          ) : (
            gameLog.slice(0, 2).map((log, lIdx) => (
              <div key={lIdx} className="text-[10px] font-mono text-slate-400 flex items-center gap-2">
                <span className="text-cyan-500 font-bold shrink-0">◀</span> {log}
              </div>
            ))
          )}
        </div>

        {/* metadata diagnostic badges */}
        <div className="flex items-center gap-3.5 text-[9.5px] font-mono text-slate-550 shrink-0">
          <div className="flex items-center gap-1">
            <Cpu className="w-3 h-3 text-cyan-400" /> CORRELATION MATCH: <span className="text-slate-350 font-bold">STABLE</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-cyan-400" /> UTC: <span className="text-slate-350 font-bold">22:45</span>
          </div>
        </div>

      </footer>

    </div>
  );
}
