/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState } from "react";
import { NPC, Evidence, Room } from "../types";
import { soundEngine } from "../utils/audio";
import { MessageSquare, Flame, HelpCircle, ShieldAlert, Heart, Info, ArrowRight, UserMinus } from "lucide-react";

interface InterrogationPanelProps {
  npcs: NPC[];
  evidence: Evidence[];
  rooms: Room[];
  assassinoId: string;
  armaDelittoId: string;
  onSecretUnlocked: (npcId: string, secretIndex: number) => void;
  onUpdateStress: (npcId: string, stress: number, cooperation: number) => void;
  gameLog: (message: string) => void;
}

interface ChatMessage {
  sender: "player" | "npc";
  text: string;
  timestamp: string;
}

export default function InterrogationPanel({
  npcs,
  evidence,
  rooms,
  assassinoId,
  armaDelittoId,
  onSecretUnlocked,
  onUpdateStress,
  gameLog,
}: InterrogationPanelProps) {
  const [selectedNpcId, setSelectedNpcId] = useState<string>(npcs[0]?.id || "");
  const [chatLogs, setChatLogs] = useState<Record<string, ChatMessage[]>>({});

  const activeNpc = npcs.find((n) => n.id === selectedNpcId)!;

  const currentChat = chatLogs[selectedNpcId] || [
    {
      sender: "npc",
      text: `Sono a tua disposizione, investigatore. Eclipse Inc. mi ha ordinato di cooperare, ma ti prego di essere breve. Ho molto lavoro da completare.`,
      timestamp: "Adesso",
    },
  ];

  const addMessage = (sender: "player" | "npc", text: string) => {
    setChatLogs((prev) => {
      const logs = prev[selectedNpcId] || [];
      return {
        ...prev,
        [selectedNpcId]: [...logs, { sender, text, timestamp: "Oggi" }],
      };
    });
  };

  const getNPCReactionToOther = (npcId: string, targetId: string): string => {
    switch (npcId) {
      case "rachel":
        if (targetId === "luna") return "Luna Chen? È scaltra, conosce bene il mercato sotterraneo. Diciamo che ci intendiamo sugli affari crittografati.";
        if (targetId === "silas") return "Vance è lo stereotipo del colletto bianco corporativo. Non capisce nulla di quantistica, vuole solo spremere i dati per fare profitto.";
        if (targetId === "vektor") return "Il dottor Cross è un genio della bio-meccanica clinica, anche se ultimamente il suo livello di ansia mi sembra fuori controllo.";
        return "Jax Colton è solo un mastino cibernetico sottomesso a Silas Vance. Fa tutto ciò che gli viene pagato.";
      case "silas":
        if (targetId === "jax") return "Jax Colton è un eccellente garante della stabilità. Fa pattugliamenti per conto mio e non fa troppe domande inopportune.";
        if (targetId === "rachel") return "Hawke è piena di sé. Le sue competenze sull'intelligenza artificiale sono insostituibili, ma manca di lealtà aziendale.";
        if (targetId === "vektor") return "Vektor Cross si sta spingendo troppo oltre con quegli strani innesti illegali. Se non fosse per i brevetti, lo avrei già rimosso.";
        return "Luna Chen? Un parassita del mercato nero che si aggira intorno all'Eclipse. Dovrebbe essere trattenuta nei bassifondi.";
      case "vektor":
        if (targetId === "rachel") return "La dottoressa Rachel Hawke apprezza le complessità neurali. A volte assembliamo cloni digitali insieme, ma non ama condividere le sue sorgenti.";
        if (targetId === "luna") return "Luna mi fornisce materiali biomorfi eccellenti e rari per i miei impianti clinici. Senza di lei la biosicurezza mi bloccherebbe.";
        return "Colton e Vance sono ossessionati dalla disciplina e dai crediti. Non hanno alcun interesse nel progresso transhumanista.";
      case "jax":
        if (targetId === "silas") return "Il manager Vance approva il valore dell'ordine logistico. Mi paga bene per assicurarmi che le telecamere ignorino elementi privati.";
        if (targetId === "luna") return "Luna Chen viola costantemente la recinzione per vendere protesi illegali. Sto solo aspettando l'autorizzazione per sbatterla in cella.";
        return "Dottor Cross ed Rachel Hawke passano ore rintanati nei laboratori a modificare codici biometrici. Entrambi non mi piacciono.";
      case "luna":
        if (targetId === "rachel") return "Rachel? Oh, è una donna fantastica. Capisce la bellezza del traffico dati non tracciabile. Collaboriamo... in modo ravvicinato.";
        if (targetId === "vektor") return "Il buon vecchio Vektor ha bisogno del mio canale oscuro per portare avanti la sua scienza d'avanguardia. È un amico fedele.";
        return "Jax Colton si nasconde dietro quel braccio cromato, ma so bene che riceve carretti di crediti offshore da Silas Vance per girarsi dall'altra parte.";
      default:
        return "Non ho alcuna opinione specifica su quel soggetto.";
    }
  };

  // 1. Chiedi alibi
  const discussAlibi = () => {
    soundEngine.playClick();
    const qText = "Spiegami esattamente cosa stavi facendo alle 22:00, l'ora presunta del delitto.";
    addMessage("player", qText);

    setTimeout(() => {
      const alibiStr = activeNpc.alibi["22:00"].descrizioneDichiarata;
      addMessage("npc", alibiStr);
      
      // Update stress slightly
      const currentStress = activeNpc.id === assassinoId ? 35 : 15;
      onUpdateStress(activeNpc.id, currentStress, 60);
    }, 700);
  };

  // 2. Chiedi degli altri
  const discussOtherNpc = (npcId: string) => {
    soundEngine.playClick();
    const other = npcs.find((n) => n.id === npcId)!;
    const qText = `Cosa sai dirmi a riguardo di ${other.nome}?`;
    addMessage("player", qText);

    setTimeout(() => {
      const reply = getNPCReactionToOther(activeNpc.id, other.id);
      addMessage("npc", reply);
    }, 700);
  };

  // 3. Presenta Indizio / Prova (The key mechanic)
  const presentEvidence = (clue: Evidence) => {
    soundEngine.playClick();
    addMessage("player", `Guarda questa prova che ho reperito: '${clue.nome}'. Cosa hai da dire in merito?`);

    setTimeout(() => {
      let reaction = "";
      let newStress = activeNpc.statoPsicologico.stress;
      let newCoop = activeNpc.statoPsicologico.cooperazione;

      const isKiller = activeNpc.id === assassinoId;

      // SPECIFIC SYSTEM CONTRADICTIONS:
      // A) Se presenti la Fibra Tessile all'assassino corrispondente
      if (clue.id === "indizio_fibra" && clue.scoperto) {
        soundEngine.playGlitch();
        
        if (isKiller) {
          // L'assassino cede o entra in paranoia pura!
          newStress = 100;
          newCoop = 20;
          reaction = `C-Cosa?! Come hai trovato questa fibra? È... è un frammento del mio vestito. Maledizione! Sato mi stava ricattando! Esigeva crediti per non farmi bandire dalla corporazione. Non avevo altra scelta! Ma vi prego, nessuno piangerà per lui!`;
          
          onSecretUnlocked(activeNpc.id, 0); // sblocca il segreto
          gameLog(`SCONTRO PSICOLOGICO: L'assassino ${activeNpc.nome} ha avuto un crollo nervoso completo davanti alla prova tessile! Confessione parziale raccolta.`);
        } else {
          // L'innocente smentisce e suggerisce di controllare chi indossa quel colore
          newStress = 25;
          newCoop = 80;
          reaction = `Un frammento tessile? Io non indosso quel tipo di materiale molecolare. Esamina bene i profili nel tuo taccuino, investigatore. Quel frammento corrisponde in modo univoco all'uniforme o al camice di qualcun altro presente qui!`;
        }
      } 
      
      // B) Se presenti il Registro Porte Elettroniche (corrisponde al ruolo del killer)
      else if (clue.id === "access_logs_clue" && clue.scoperto) {
        if (isKiller) {
          soundEngine.playGlitch();
          newStress = 90;
          newCoop = 30;
          reaction = `Il log porte... dice che un utente con il ruolo di '${activeNpc.ruolo}' ha aperto il varco del delitto alle 22:01. I-Io... d'accordo, sono sceso giù. Ma volevo solo parlargli! Sato si è scagliato contro di me con un coltello elettrico, volevo solo difendermi!`;
          
          onSecretUnlocked(activeNpc.id, 0);
          gameLog(`CONTRADDIZIONE RILEVATA: Messo alle strette con i log d'accesso porte, il colpevole ${activeNpc.nome} ha ammesso la sua presenza sul luogo del delitto!`);
        } else {
          // Se la guardia Jax Colson riceve questa prova e ha sbloccato il segreto della corruzione
          if (activeNpc.id === "jax") {
            soundEngine.playGlitch();
            newStress = 80;
            newCoop = 90;
            reaction = `O-Ok! I log mostrano un bypass biometrico... sentimi bene: Silas Vance mi ha bonificato 100.000 crediti offshore proprio stasera (controlla i ledger bancari se non mi credi!). Sospetto mi avesse pagato per facilitare il passaggio all'assassino o per consentirgli di infiltrarsi nel server delle 22:00 senza telecamere! Io ho solo disattivato la griglia biometrica, non ho ucciso nessuno!`;
            
            onSecretUnlocked("jax", 0); // sblocca segreto corruzione Jax
            gameLog(`CONFESSIONE RACCOLTA: Il Capo Sicurezza Jax Colton ammette di aver disattivato i varchi biometrici in cambio di tangenti da Silas Vance!`);
          } else {
            reaction = `La registrazione delle porte indica che una credenziale di rango '${clue.descrizione.match(/'([^']+)'/)?.[1] || "sicurezza"}' ha forzato la stanza. Io non ho quel livello di autorizzazione d'accesso o non ero lì alle 22:00.`;
          }
        }
      }

      // C) Se presenti il Datapad di Sato
      else if (clue.id === "datapad_sato" && clue.scoperto) {
        if (isKiller) {
          soundEngine.playGlitch();
          newStress = 85;
          newCoop = 40;
          reaction = `Il datapad di Kenji Sato... era crittografato. Se sei riuscito a leggere gli scambi mail, allora sai già del ricatto e delle minacce sul wallet. Mi teneva in pugno...`;
        } else {
          // Se presenti a Silas Vance
          if (activeNpc.id === "silas") {
            soundEngine.playGlitch();
            newStress = 70;
            newCoop = 75;
            reaction = `Questo datapad dimostra solo che Sato era un ricattatore avido che estorceva fondi di ricerca per finanziare i suoi sfizi clinici sotterranei. Ha minacciato molti di noi. Non sono sconvolto che qualcuno lo abbia liquidato.`;
          } else {
            reaction = `Sato teneva sempre quel datapad agganciato al suo cyber-deck spinale. Chiunque lo abbia ucciso lo ha gettato a terra per cancellarne le memorie o coprire i ricatti.`;
          }
        }
      }

      // D) Se presenti l'Arma del Delitto (quella corretta generata proceduralmente)
      else if (clue.isArmaDelitto && clue.scoperto) {
        soundEngine.playGlitch();
        if (isKiller) {
          newStress = 95;
          newCoop = 10;
          reaction = `Q-Quella... quella è proprio l'arma '${clue.nome}' ricoperta di tracce plasmatiche... Dov'era nascosta?! N-No, non dirò una parola in più senza il mio avvocato cybernetico. Avete truccato le prove!`;
          gameLog(`CONTRADDIZIONE CHIAVE: Presentando l'arma del delitto corretta '${clue.nome}' al killer ${activeNpc.nome}, la sua barriera psicologica è andata in fumo!`);
        } else {
          newStress = 45;
          newCoop = 65;
          reaction = `Questa è chiaramente l'arma che ha causato la ferita sul corpo dello scienziato. Il colpevole l'ha nascosta in fretta nei pressi dei laboratori o del magazzino per coprire i propri passi. Una mossa disperata.`;
        }
      }

      // E) Armi non del delitto (Innocenti)
      else if (clue.tipo === "weapon" && !clue.isArmaDelitto && clue.scoperto) {
        reaction = `Un'arma '${clue.nome}'... È letale, sì, ma l'autopsia microscopica della ferita non corrisponde a quest'arma. Guarda bene i dettagli delle ferite nel Taccuino, investigatore. Non lasciarti sviare.`;
      }

      // F) Fallback generico
      else {
        reaction = `Capisco che questa prova '${clue.nome}' sia d'interesse per il tuo log indizi, ma non ho alcun collegamento con essa. Forse dovresti chiedere ai tecnici o controllare i file in cyberspace.`;
      }

      addMessage("npc", reaction);
      onUpdateStress(activeNpc.id, newStress, newCoop);
    }, 850);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-full opacity-100 font-mono" id="interrogation_root">
      
      {/* List of Suspects sidebar */}
      <div className="lg:col-span-3 glass-panel border-l-2 border-magenta rounded-xl p-3 flex flex-col space-y-3.5 shadow-lg">
        <h3 className="text-xs font-semibold neon-magenta tracking-wider flex items-center gap-1.5 border-b border-magenta/20 pb-2">
          <MessageSquare className="w-4 h-4 animate-pulse text-magenta" /> SELEZIONA SOSPETTO
        </h3>

        <div className="space-y-2 flex-1 overflow-y-auto pr-1 custom-scrollbar">
          {npcs.map((npc) => {
            const active = selectedNpcId === npc.id;
            return (
              <button
                key={npc.id}
                onClick={() => {
                  soundEngine.playMenuClick();
                  setSelectedNpcId(npc.id);
                }}
                className={`w-full text-left p-3 rounded-lg border transition-all duration-300 flex items-center gap-2.5 ${
                  active
                    ? "bg-slate-900/60 border-cyan-400/80 shadow"
                    : "bg-slate-900/45 border-slate-800/40 hover:border-slate-700 hover:bg-slate-800/20"
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full border border-black shadow" style={{ backgroundColor: npc.avatarColor }}></span>
                <div>
                  <h4 className="text-xs font-bold text-slate-200">{npc.nome}</h4>
                  <p className="text-[9px] font-mono text-slate-500">{npc.ruolo}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Hologram & Chats columns */}
      <div className="lg:col-span-6 glass-panel border-y-2 border-cyan-500/40 rounded-xl p-4 flex flex-col justify-between shadow-xl relative overflow-hidden min-h-[440px]">
        {/* CRT Scanline look */}
        <div className="absolute inset-0 bg-scanlines pointer-events-none opacity-[0.04]"></div>

        {/* Holo viewport and Dialogue stream */}
        <div className="flex-1 flex flex-col justify-between h-full z-10 space-y-4">
          
          {/* Hologram Box on top */}
          <div className="bg-black/60 border border-cyan-500/10 p-3 rounded-lg flex items-center gap-4 relative overflow-hidden">
            {/* animated hologram beams */}
            <div className="absolute bottom-0 left-0 w-full h-[2px] bg-cyan-400/20 animate-hacker-beams pointer-events-none"></div>

            <div
              className="w-16 h-16 rounded-lg flex items-center justify-center font-bold text-slate-100 border relative overflow-hidden shrink-0 shadow shadow-black"
              style={{
                background: activeNpc.immagineSfondo,
                borderColor: activeNpc.avatarColor,
              }}
            >
              <span className="absolute text-5xl opacity-10 pointer-events-none text-white select-none">HOLO</span>
              <span className="text-xl tracking-wider select-none">
                {activeNpc.nome.split(" ")[0].substring(0, 2).toUpperCase()}
              </span>
            </div>

            <div className="flex-1 space-y-1 select-text">
              <div className="flex items-center gap-2">
                <span className="text-sm font-extrabold text-slate-100 tracking-wide">{activeNpc.nome}</span>
                <span className="text-[9px] font-mono bg-cyan-950 px-1 rounded text-cyan-400 uppercase font-bold tracking-widest">{activeNpc.ruolo}</span>
              </div>
              <p className="text-[10px] font-mono text-slate-400">
                Stato Emotivo: <span className="text-red-400 font-extrabold">{activeNpc.statoPsicologico.stress > 60 ? "CRISI PANICO" : activeNpc.statoPsicologico.stress > 30 ? "SOSPETTO/IRRITATO" : "STABILE"}</span>
              </p>
              {/* Quick bio summary */}
              <p className="text-[10.5px] font-sans text-slate-400 truncate w-full">{activeNpc.descrizione}</p>
            </div>
          </div>

          {/* Scrolling Chat Bubble list */}
          <div className="flex-1 bg-black/40 border border-slate-900 rounded-lg p-3 overflow-y-auto space-y-3.5 custom-scrollbar min-h-[180px] leading-relaxed">
            {currentChat.map((msg, i) => {
              const isPlayer = msg.sender === "player";
              return (
                <div key={i} className={`flex flex-col ${isPlayer ? "items-end" : "items-start"}`}>
                  <span className="text-[9px] font-mono text-slate-500 mb-0.5">
                    {isPlayer ? "TU (INVESTIGATORE)" : activeNpc.nome.toUpperCase()}
                  </span>
                  <div
                    className={`max-w-[85%] rounded-xl px-3 py-2 text-xs select-text shadow-sm border ${
                      isPlayer
                        ? "bg-cyan-950/40 border-cyan-500/25 text-cyan-300"
                        : "bg-slate-900/65 border-slate-850/40 text-slate-200"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick diagnostic ask keys */}
          <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-850">
            <button
              onClick={discussAlibi}
              className="px-3 py-1.5 bg-cyan-950/50 hover:bg-cyan-500/25 border border-cyan-400/30 text-cyan-400 rounded-md font-mono text-[10.5px] font-bold uppercase transition flex items-center gap-1 cursor-pointer"
            >
              <Info className="w-3.5 h-3.5" /> Chiedi Alibi (Ora 22:00)
            </button>

            {npcs
              .filter((n) => n.id !== activeNpc.id)
              .map((other) => (
                <button
                  key={other.id}
                  onClick={() => discussOtherNpc(other.id)}
                  className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-350 rounded-md font-mono text-[9.5px] font-medium transition flex items-center gap-1 cursor-pointer"
                >
                  <ArrowRight className="w-3 h-3 text-slate-500" /> Sospetto su {other.nome.split(" ")[0]}
                </button>
              ))}
          </div>

        </div>
      </div>

      {/* Discovered Clues toolbox panel to present right sidebar */}
      <div className="lg:col-span-3 glass-panel border-r-2 border-cyan-500 rounded-xl p-3 flex flex-col space-y-3.5 shadow-lg">
        <h3 className="text-xs font-semibold neon-cyan tracking-wider flex items-center gap-1.5 border-b border-cyan-500/25 pb-2">
          <ShieldAlert className="w-4 h-4 text-red-500 animate-pulse" /> PRESENTA INDIZIO CHIAVE
        </h3>
        
        <p className="text-[10px] text-slate-400 leading-snug">
          Seleziona e brandisci un indizio raccolto per metterli sotto pressione psicologica ed evidenziare le discordanze delle bugie.
        </p>

        <div className="space-y-2 flex-1 overflow-y-auto pr-1 custom-scrollbar max-h-[300px]">
          {evidence.filter((e) => e.scoperto).length === 0 ? (
            <div className="font-mono text-[10px] italic text-slate-500 text-center py-5">
              Nessun reperto scoperto finora. Esplora le stanze ed esegui i Breach hack per accumulare risorse d'inchiesta.
            </div>
          ) : (
            evidence
              .filter((e) => e.scoperto)
              .map((clue) => {
                return (
                  <button
                    key={clue.id}
                    id={`present_clue_btn_${clue.id}`}
                    onClick={() => presentEvidence(clue)}
                    className="w-full text-left p-2.5 bg-slate-900/60 hover:bg-slate-850 hover:border-cyan-500/40 rounded-lg border border-slate-800/60 transition duration-300 flex flex-col space-y-1 text-xs text-slate-300 hover:text-cyan-300 font-bold cursor-pointer"
                  >
                    <span>🔍 {clue.nome}</span>
                    <span className="text-[8px] font-mono uppercase bg-slate-950 px-1 py-0.5 rounded text-slate-500 w-max font-bold">
                      {clue.tipo}
                    </span>
                  </button>
                );
              })
          )}
        </div>
      </div>

    </div>
  );
}
