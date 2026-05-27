/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { NPC, Evidence, Room, CyberFile, SecurityCamera, Case, Motive, MotiveType, Role } from "../types";

export const ALL_ROOMS_SPEC: Omit<Room, "clues">[] = [
  // level -2
  { id: "stanza_server", nome: "Stanza Server", descrizione: "Il nucleo computazionale dell'edificio con giganteschi rack refrigeranti.", piano: -2, x: 40, y: 30, w: 160, h: 130, neonColor: "#00FFFF" },
  { id: "backup_storage", nome: "Backup Storage", descrizione: "Sistemi nastro isolati ad alta densità per l'archiviazione dati.", piano: -2, x: 220, y: 30, w: 110, h: 130, neonColor: "#FF00FF" },
  { id: "generatori", nome: "Generatori Primari", descrizione: "Reattori piezoelettrici che accumulano energia per Eclipse City.", piano: -2, x: 350, y: 30, w: 150, h: 130, neonColor: "#FF0033" },

  // level -1
  { id: "magazzino", nome: "Magazzino", descrizione: "Teche automatiche ricche di componenti tecnologiche smontate.", piano: -1, x: 40, y: 30, w: 150, h: 130, neonColor: "#2D3561" },
  { id: "cold_room", nome: "Cella Fredda", descrizione: "Struttura criogenica usata per lo stoccaggio di tessuti biomorfi.", piano: -1, x: 210, y: 30, w: 130, h: 130, neonColor: "#00FFFF" },
  { id: "deposito_chimico", nome: "Deposito Chimico", descrizione: "Vasi e serbatoi pressurizzati con reagenti volatili.", piano: -1, x: 360, y: 30, w: 140, h: 130, neonColor: "#FFFF00" },

  // level 0
  { id: "ingresso", nome: "Ingresso Principale", descrizione: "Scanner biometrici ad alto voltaggio e porte blindate laser.", piano: 0, x: 30, y: 35, w: 100, h: 120, neonColor: "#00FFFF" },
  { id: "reception", nome: "Reception", descrizione: "Terminale centrale olografico. Attualmente privo di personale.", piano: 0, x: 145, y: 35, w: 110, h: 120, neonColor: "#1A1F3A" },
  { id: "bar_neon", nome: "Bar Neon", descrizione: "Luci soffuse color magenta, distributori automatici di sintetico.", piano: 0, x: 270, y: 35, w: 130, h: 120, neonColor: "#FF00FF" },
  { id: "waiting_room", nome: "Sala d'Attesa", descrizione: "Poltrone ergonomiche traslucide e finti cactus bioluminescenti.", piano: 0, x: 415, y: 35, w: 100, h: 120, neonColor: "#2D3561" },

  // level 1
  { id: "uffici_direttivi", nome: "Uffici Direttivi", descrizione: "Architettura spaziosa con scrivanie in carbonio e pannelli di vetro intelligenti.", piano: 1, x: 30, y: 30, w: 150, h: 130, neonColor: "#FF00FF" },
  { id: "sala_riunioni", nome: "Sala Riunioni", descrizione: "Proiettori 3D spenti, una grande tavola tonda in grafene.", piano: 1, x: 195, y: 30, w: 110, h: 130, neonColor: "#00FFFF" },
  { id: "archivio", nome: "Archivio Fisico", descrizione: "Scaffali metallici polverosi risalenti alla fine del ventesimo secolo.", piano: 1, x: 315, y: 30, w: 80, h: 130, neonColor: "#1A1F3A" },
  { id: "ufficio_privato", nome: "Ufficio Privato Sato", descrizione: "L'ufficio del defunto scienziato Kenji Sato, ora sotto sigillo.", piano: 1, x: 410, y: 30, w: 115, h: 130, neonColor: "#FF0033" },

  // level 2
  { id: "lab_1", nome: "Lab Ricerca 1", descrizione: "Punteggiato da centrifughe molecolari e banchi di genomica.", piano: 2, x: 30, y: 30, w: 140, h: 130, neonColor: "#00FFFF" },
  { id: "lab_2", nome: "Lab Ricerca 2", descrizione: "Studi cibernetici clinici per il restyling degli arti neurali.", piano: 2, x: 185, y: 30, w: 140, h: 130, neonColor: "#FF00FF" },
  { id: "sala_sicurezza", nome: "Sala Sicurezza", descrizione: "Monitor TV ad alta definizione retroilluminati. Console di bypass.", piano: 2, x: 340, y: 30, w: 90, h: 130, neonColor: "#FF0033" },
  { id: "bio_storage", nome: "Biohazard Storage", descrizione: "Unità magnetiche rinforzate con campioni virali sensibili.", piano: 2, x: 445, y: 30, w: 85, h: 130, neonColor: "#FFFF00" },

  // level 3
  { id: "appartamenti", nome: "Residence Suite", descrizione: "Piccoli moduli abitativi per lo staff della corporazione.", piano: 3, x: 30, y: 30, w: 160, h: 130, neonColor: "#1A1F3A" },
  { id: "palestra", nome: "Palestra Bio-Fit", descrizione: "Pedane cinetiche gravitazionali e simulanti muscolari.", piano: 3, x: 205, y: 30, w: 100, h: 130, neonColor: "#00FFFF" },
  { id: "messa_privata", nome: "Mensa Privata", descrizione: "Distributori di nutrienti caldi e sedie fluttuanti.", piano: 3, x: 320, y: 30, w: 100, h: 130, neonColor: "#2D3561" },
  { id: "saletta_relax", nome: "Saletta Relax", descrizione: "Impianto di induzione del sonno e olo-relax virtuale.", piano: 3, x: 435, y: 30, w: 90, h: 130, neonColor: "#FF00FF" },

  // level 4 (Tetto)
  { id: "eliporto", nome: "Eliporto", descrizione: "Piattaforma circolare coperta da un velo di pioggia sferzata dal vento.", piano: 4, x: 40, y: 35, w: 160, h: 120, neonColor: "#FF0033" },
  { id: "trasmettitori", nome: "Trasmettitori", descrizione: "Paraboliche e antenne ad alta frequenza rivolte alla biosfera.", piano: 4, x: 215, y: 35, w: 140, h: 120, neonColor: "#00FFFF" },
  { id: "generatori_backup", nome: "Generatori di Emergenza", descrizione: "Casse sigillate collegate ad accumulatori a idrogeno.", piano: 4, x: 370, y: 35, w: 130, h: 120, neonColor: "#FF00FF" },
];

export const SUSPECT_PROFILES = [
  {
    id: "rachel",
    nome: "Rachel Hawke",
    ruolo: "AI Specialist" as Role,
    avatarColor: "#00FFFF", // Cyan
    immagineSfondo: "linear-gradient(135deg, #022030, #00FFFF)",
    descrizione: "Brillante e cinica studiosa di reti neurali clandestine. I suoi vestiti integrano fili luminosi ciano. Ha lavorato con Sato su codice bloccato.",
    personality: { simpatia: 40, aggressivita: 75, intelligence: 90, furbizia: 80, nervosismo: 45 },
  },
  {
    id: "silas",
    nome: "Silas Vance",
    ruolo: "Manager" as Role,
    avatarColor: "#FF00FF", // Magenta
    immagineSfondo: "linear-gradient(135deg, #250220, #FF00FF)",
    descrizione: "Vice-Presidente di Eclipse Inc. Freddo, calcolatore, indossa un completo grigio di sarto d'alto bordo con risvolti magenta. Detesta gli ostacoli burocratici.",
    personality: { simpatia: 30, aggressivita: 50, intelligence: 85, furbizia: 90, nervosismo: 20 },
  },
  {
    id: "vektor",
    nome: "Dr. Vektor Cross",
    ruolo: "Bio-Researcher" as Role,
    avatarColor: "#00FF00", // Green (re-mapped to custom neon-green)
    immagineSfondo: "linear-gradient(135deg, #052002, #00FF33)",
    descrizione: "Bio-scienziato ossessionato dalle protesi cibernetiche sintetiche. Indossa un camice verde fosforescente logorato da reattivi chimici. Parla velocemente.",
    personality: { simpatia: 65, aggressivita: 35, intelligence: 80, furbizia: 50, nervosismo: 85 },
  },
  {
    id: "jax",
    nome: "Jax Colton",
    ruolo: "Security Guard" as Role,
    avatarColor: "#FF0033", // Red
    immagineSfondo: "linear-gradient(135deg, #2a0005, #FF0033)",
    descrizione: "Capo della sicurezza fisica di Eclipse Inc. Enorme corporatura, braccio destro cibernetico cromato. Molto protettivo della sua arma laser.",
    personality: { simpatia: 25, aggressivita: 90, intelligence: 45, furbizia: 60, nervosismo: 60 },
  },
  {
    id: "luna",
    nome: "Luna Chen",
    ruolo: "Underground Dealer" as Role,
    avatarColor: "#FFFF00", // Yellow
    immagineSfondo: "linear-gradient(135deg, #252001, #FFFF00)",
    descrizione: "Una misteriosa intermediaria che commercia impianti neurorobotici sul mercato nero della città sotterranea. Indossa una giacca trapuntata gialla.",
    personality: { simpatia: 80, aggressivita: 40, intelligence: 70, furbizia: 85, nervosismo: 30 },
  }
];

export const WEAPONS_SPEC = [
  { id: "bisturi_termico", nome: "Bisturi Termico Clinico", tipo: "weapon" as const, descrizione: "Strumento operatorio che emette calore radiante a 1500°C. Lascia cicatrici perfettamente cauterizzate, tipiche dei laboratori di biologia.", luogoId: "", isArmaDelitto: false, scoperto: false, iconName: "Flame" },
  { id: "monofilamento", nome: "Cavo Monofilamento", tipo: "weapon" as const, descrizione: "Fibra molecolare di carbonio che taglia istantaneamente metallo e ossa. Usata dai sistemi di backup robotico o da sicari esperti.", luogoId: "", isArmaDelitto: false, scoperto: false, iconName: "Scissors" },
  { id: "neuro_iniettore", nome: "Neuro-Iniettore a Pistone", tipo: "weapon" as const, descrizione: "Dispositivo di rilascio tossico controllato. Spruzza neurotossine sintetiche che arrestano il cuore neurale in 5 secondi senza lasciare tracce.", luogoId: "", isArmaDelitto: false, scoperto: false, iconName: "Syringe" },
  { id: "elettrodo", nome: "Sovraccarico ad Elettrodo", tipo: "weapon" as const, descrizione: "Unità portatile usata per azzerare circuiti e nuclei energetici. Se collegato al cyber-deck spinale di un uomo, frigge all'istante l'attività cerebrale.", luogoId: "", isArmaDelitto: false, scoperto: false, iconName: "Zap" },
];

export const MOTIVES: Motive[] = [
  { tipo: "vendetta", titolo: "Rancore Personale (Vendetta)", descrizione: "Kenji Sato aveva sabotato un brevetto cyberware per rovinare la carriera medica dell'assassino." },
  { tipo: "denaro", titolo: "Ricatto Finanziario (Denaro)", descrizione: "Sato possedeva le prove di uno schema di riciclaggio di crediti e minacciava di denunciare alla corporazione madre." },
  { tipo: "gelosia", titolo: "Tradimento Professionale (Gelosia)", descrizione: "Sato voleva escludere l'assassino dal rivoluzionario progetto sull'immortalità digitale 'Cortex Prime'." },
  { tipo: "sabotaggio", titolo: "Sabotaggio Aziendale", descrizione: "L'assassino è stato lautamente pagato da una multinazionale concorrente per rubare la chiave crittografica e liquidare Sato." },
  { tipo: "ricatto", titolo: "Segreto Svelato (Ricatto)", descrizione: "Sato ricattava l'assassino minacciando di esporre la sua grave dipendenza o le sue transazioni sul mercato nero." },
  { tipo: "tradimento", titolo: "Fuga di Dati Privati", descrizione: "Sato voleva vendere il codice sorgente della città a ribelli, e l'assassino voleva appropriarsene per primo." },
];

export function generateGameCase(): {
  rooms: Room[];
  npcs: NPC[];
  evidence: Evidence[];
  cameras: SecurityCamera[];
  files: CyberFile[];
  gameCase: Case;
} {
  // 1. Decidi i parametri base dell'omicidio
  const killerProfile = SUSPECT_PROFILES[Math.floor(Math.random() * SUSPECT_PROFILES.length)];
  const isServerRoom = Math.random() > 0.5;
  const crimeRoomId = isServerRoom ? "stanza_server" : "cold_room";
  const weaponIndex = Math.floor(Math.random() * WEAPONS_SPEC.length);
  const selectedWeapon = { ...WEAPONS_SPEC[weaponIndex], isArmaDelitto: true };
  const murderMotive = MOTIVES[Math.floor(Math.random() * MOTIVES.length)];
  
  // 2. Cloni camere, armi, stanze
  const currentRooms: Room[] = ALL_ROOMS_SPEC.map(r => ({ ...r, clues: [] }));
  
  // Definisci le altre armi (innocenti) e distribuiscile in stanze casuali
  const otherWeapons = WEAPONS_SPEC.filter((_, idx) => idx !== weaponIndex).map(w => ({ ...w, isArmaDelitto: false, scoperto: false }));
  
  // Lista provvisoria evidenze fisiche/digitali
  const currentEvidence: Evidence[] = [];

  // Posiziona l'arma del delitto
  // L'arma del delitto DEVE essere trovata da qualche parte per incastrare l'assassino. 
  // Nascondiamola in un posto sensibile legato all'assassino o alla stanza del delitto
  let crimeWeaponRoomId = "";
  if (killerProfile.id === "vektor") crimeWeaponRoomId = "lab_1";
  else if (killerProfile.id === "jax") crimeWeaponRoomId = "sala_sicurezza";
  else if (killerProfile.id === "silas") crimeWeaponRoomId = "uffici_direttivi";
  else if (killerProfile.id === "rachel") crimeWeaponRoomId = "backup_storage";
  else crimeWeaponRoomId = "reception"; // Luna Chen o fallback

  selectedWeapon.luogoId = crimeWeaponRoomId;
  currentEvidence.push(selectedWeapon);

  // Posiziona le armi innocenti in stanze generiche
  const weaponRooms = ["magazzino", "deposito_chimico", "palestra", "generatori", "eliporto"];
  otherWeapons.forEach((w, index) => {
    const rm = weaponRooms[index % weaponRooms.length];
    w.luogoId = rm;
    currentEvidence.push(w);
  });

  // 3. Genera Alibi e Schedule di movimento per tutti gli NPC per le ore 21:00, 22:00 e 23:00.
  // Sato è morto alle 22:00 nel crimeRoomId (server_room or cold_room).
  // Costruiamo gli spostamenti fisici
  const npcs: NPC[] = SUSPECT_PROFILES.map(sp => {
    return {
      id: sp.id,
      nome: sp.nome,
      ruolo: sp.ruolo,
      avatarColor: sp.avatarColor,
      immagineSfondo: sp.immagineSfondo,
      descrizione: sp.descrizione,
      personality: { ...sp.personality },
      memoria: [],
      relazioni: [],
      segreti: [],
      alibi: {},
      statoPsicologico: { stress: 10, paura: 10, rabbia: 10, cooperazione: 50 }
    };
  });

  // Definiamo posizioni reali per 21:00, 22:00, 23:00
  // L'assassino DEVE essere al luogo del delitto alle 22:00.
  const physicalMovement: Record<string, Record<string, string>> = {}; // npcId -> hour -> room_id
  
  const possibleRooms2100 = ["bar_neon", "palestra", "lab_2", "reception", "uffici_direttivi"];
  const possibleRooms2300 = ["appartamenti", "saletta_relax", "messa_privata", "ingresso", "trasmettitori"];

  npcs.forEach((npc, i) => {
    physicalMovement[npc.id] = {
      "21:00": possibleRooms2100[i % possibleRooms2100.length],
      "22:00": "", // decideremo tra un attimo
      "23:00": possibleRooms2300[i % possibleRooms2300.length],
    };

    // se è l'assassino, alle 22:00 è sul luogo del delitto
    if (npc.id === killerProfile.id) {
      physicalMovement[npc.id]["22:00"] = crimeRoomId;
    } else {
      // per gli altri, posizioni distinte diverse dal luogo del delitto e diverse tra loro
      const otherRooms = ["sala_sicurezza", "bar_neon", "palestra", "uffici_direttivi", "lab_1", "eliporto", "magazzino"].filter(r => r !== crimeRoomId);
      physicalMovement[npc.id]["22:00"] = otherRooms[i % otherRooms.length];
    }
  });

  // 4. Determina l'Alibi dichiarato da ciascuno
  // Gli innocenti dichiarano il vero.
  // L'assassino DICHIARA un alibi FALSO per le 22:00. Dirà che si trovava in un'altra stanza (es: palestra o appartamenti)
  // e inventerà un testimone (che smentirà) o sosterrà di essere isolato.
  // Inoltre creiamo dei "segreti" per gli innocenti che li portano a omettere dettagli spontaneamente per paura finché non li interroghi correttamente.
  npcs.forEach(npc => {
    const isKiller = nycIsKiller(npc.id, killerProfile.id);

    // Alibi 21:00 (Veritiero per tutti)
    const room21 = physicalMovement[npc.id]["21:00"];
    npc.alibi["21:00"] = {
      ora: "21:00",
      luogoId: room21,
      descrizioneDichiarata: getAlibiDescription(npc.id, "21:00", room21),
      testimoneId: null,
      isFalso: false,
      veritaLuogoId: room21,
      veritaDescrizione: getAlibiDescription(npc.id, "21:00", room21),
    };

    // Alibi 23:00 (Veritiero per tutti)
    const room23 = physicalMovement[npc.id]["23:00"];
    npc.alibi["23:00"] = {
      ora: "23:00",
      luogoId: room23,
      descrizioneDichiarata: getAlibiDescription(npc.id, "23:00", room23),
      testimoneId: null,
      isFalso: false,
      veritaLuogoId: room23,
      veritaDescrizione: getAlibiDescription(npc.id, "23:00", room23),
    };

    // Alibi 22:00 (Il momento chiave)
    const room22Real = physicalMovement[npc.id]["22:00"];
    if (isKiller) {
      // L'assassino mente! Sostiene di essere stato da un'altra parte
      const lieRooms = ["palestra", "appartamenti", "saletta_relax"].filter(r => r !== crimeRoomId && r !== room22Real);
      const chosenLieRoom = lieRooms[Math.floor(Math.random() * lieRooms.length)];
      
      // Sceglie un testimone a caso fra gli innocenti per incolparli o usarli come falso alibi
      const innocentNpcs = npcs.filter(n => n.id !== killerProfile.id);
      const chosenWitness = innocentNpcs[Math.floor(Math.random() * innocentNpcs.length)].id;

      npc.alibi["22:00"] = {
        ora: "22:00",
        luogoId: chosenLieRoom,
        descrizioneDichiarata: `Ero nella ${getRoomName(chosenLieRoom)} in quel momento. Credo di aver visto passare ${getNpcName(chosenWitness)} nei corridoi limitrofi, quindi può confermare che ero lì.`,
        testimoneId: chosenWitness,
        isFalso: true,
        veritaLuogoId: room22Real,
        veritaDescrizione: `Ero nella ${getRoomName(room22Real)}... per eliminare Kenji Sato. Non potevo permettere che parlasse.`
      };
    } else {
      // Gli innocenti dicono la verità
      // C'è un piccolo twist: a volte un innocente si trovava in un luogo vietato o stava facendo qualcosa di losco/segreto (come Luna Chen che contrabbandava nel magazzino).
      // Dichiareranno comunque l'alibi base, ma se li interroghi emergeranno le discordanze finché non scopri il loro segreto.
      npc.alibi["22:00"] = {
        ora: "22:00",
        luogoId: room22Real,
        descrizioneDichiarata: getAlibiDescription(npc.id, "22:00", room22Real),
        testimoneId: null,
        isFalso: false,
        veritaLuogoId: room22Real,
        veritaDescrizione: getAlibiDescription(npc.id, "22:00", room22Real),
      };
    }
  });

  // Costruisci le Memorie e relazioni degli NPC
  npcs.forEach(npc => {
    // Memorie relative ad eventi
    ["21:00", "22:00", "23:00"].forEach(hour => {
      const actualRoom = physicalMovement[npc.id][hour];
      // Chi altro c'era nella stessa stanza a quell'ora?
      const seen: string[] = [];
      npcs.forEach(otherNpc => {
        if (otherNpc.id !== npc.id && physicalMovement[otherNpc.id][hour] === actualRoom) {
          seen.push(otherNpc.id);
        }
      });

      let eventDesc = `Mi trovavo nella ${getRoomName(actualRoom)}.`;
      if (seen.length > 0) {
        eventDesc += ` Ho incontrato ${seen.map(s => getNpcName(s)).join(" e ")}.`;
      } else {
        eventDesc += ` Non c'era nessuno in giro. Silenzio completo.`;
      }

      npc.memoria.push({
        ora: hour,
        luogoId: actualRoom,
        evento: `Presenza in ${getRoomName(actualRoom)}`,
        dettagli: eventDesc,
        personeViste: seen
      });
    });

    // Relazioni e Segreti specifici
    // Rachel
    if (npc.id === "rachel") {
      npc.relazioni.push(
        { npcTargetId: "silas", tipo: "rival", intensita: 40, segretoCondiviso: null },
        { npcTargetId: "vektor", tipo: "colleague", intensita: 60, segretoCondiviso: "Sperimentazione IA clonate" },
        { npcTargetId: "luna", tipo: "secret_lover", intensita: 80, segretoCondiviso: "Romance clandestina" }
      );
      npc.segreti.push({
        tipo: "corporate_theft",
        descrizione: "Rachel Hawke sta segretamente drenando i registri dati della corporazione per conto del mercato sotterraneo di Luna Chen.",
        gravita: 70,
        sbloccato: false
      });
    }
    // Silas
    if (npc.id === "silas") {
      npc.relazioni.push(
        { npcTargetId: "jax", tipo: "blackmailer", intensita: 30, segretoCondiviso: "Tangente per sicurezza fallita" },
        { npcTargetId: "rachel", tipo: "rival", intensita: 20, segretoCondiviso: null },
        { npcTargetId: "vektor", tipo: "colleague", intensita: 50, segretoCondiviso: null }
      );
      npc.segreti.push({
        tipo: "blackmail",
        descrizione: "Silas Vance ha autorizzato segretamente transazioni finanziarie fittizie per coprire perdite d'azzardo nei club dei bassifondi.",
        gravita: 85,
        sbloccato: false
      });
    }
    // Vektor
    if (npc.id === "vektor") {
      npc.relazioni.push(
        { npcTargetId: "rachel", tipo: "colleague", intensita: 65, segretoCondiviso: "Sperimentazione IA clonate" },
        { npcTargetId: "luna", tipo: "friend", intensita: 70, segretoCondiviso: null }
      );
      npc.segreti.push({
        tipo: "sabotage",
        descrizione: "Vektor Cross raccoglie organi sintetici scartati per assemblare innesti biomorfi non approvati dal regime sanitario.",
        gravita: 60,
        sbloccato: false
      });
    }
    // Jax
    if (npc.id === "jax") {
      npc.relazioni.push(
        { npcTargetId: "silas", tipo: "blackmailer", intensita: 45, segretoCondiviso: "Tangente per sicurezza fallita" },
        { npcTargetId: "luna", tipo: "rival", intensita: 15, segretoCondiviso: null }
      );
      npc.segreti.push({
        tipo: "debt",
        descrizione: "Jax Colton riceve pagamenti clandestini per disattivare periodicamente lo scanner biometrico d'ingresso.",
        gravita: 75,
        sbloccato: false
      });
    }
    // Luna
    if (npc.id === "luna") {
      npc.relazioni.push(
        { npcTargetId: "rachel", tipo: "secret_lover", intensita: 85, segretoCondiviso: "Romance clandestina" },
        { npcTargetId: "vektor", tipo: "friend", intensita: 75, segretoCondiviso: null }
      );
      npc.segreti.push({
        tipo: "relationship",
        descrizione: "La giacca gialla di Luna ha fili intrecciati in fibra sintetica magica e lei ha accesso criptato ad appartamenti d'alto rango.",
        gravita: 50,
        sbloccato: false
      });
    }
  });

  // 5. Genera indizi fisici e distribuiscili sul campo
  // Indizio 1: Il corpo di Sato Kenji con annesso Datapad criptato
  const bodyDescription = `Il corpo svestito di Kenji Sato giace a terra nella ${getRoomName(crimeRoomId)}. Sul collo è visibile la letale ferita causata dall'arma '${selectedWeapon.nome}'. Accanto a lui c'è un datapad di sicurezza crittografato.`;
  const clueCorpo: Evidence = {
    id: "corpo_sato",
    nome: "Corteccia Cerebrale di Sato",
    tipo: "digital",
    descrizione: bodyDescription,
    luogoId: crimeRoomId,
    isArmaDelitto: false,
    scoperto: false,
    iconName: "BrainCircuit"
  };
  currentEvidence.push(clueCorpo);

  // Indizio 2: Datapad crittografato di Sato
  const clueDatapad: Evidence = {
    id: "datapad_sato",
    nome: "Cyber-Datapad di Sato",
    tipo: "digital",
    descrizione: "Un datapad aziendale criptato trovato accanto al corpo di Sato. Se rimosso lo schermo visualizza: SECURE CODES REQD. Contiene la cronologia dei suoi scambi segreti e delle minacce ricevute.",
    luogoId: crimeRoomId,
    isArmaDelitto: false,
    scoperto: false,
    iconName: "Tablet"
  };
  currentEvidence.push(clueDatapad);

  // Indizio 3: La fibra tessile dell'assassino (indizio chiave)
  const colors: Record<string, string> = {
    rachel: "microfili in carbonio turchese fluorescente",
    silas: "frammento di lanugine grigio-argentea pregiata (lana liofiliata)",
    vektor: "fibra di polimero sintetico Bio-Green luminoso (camice)",
    jax: "scheggia di cromo sintetico e pittura rossa militare scrostata",
    luna: "porzione di nastro isolante giallo lucido ad alto isolamento"
  };
  const targetFiberDesc = `Un minuscolo frammento ritrovato vicino alla grata di ventilazione della stanza del delitto. L'analisi molecolare identifica l'elemento come: '${colors[killerProfile.id]}'.`;
  const clueFibra: Evidence = {
    id: "indizio_fibra",
    nome: "Residuo Chimico / Fibra Tessile",
    tipo: "physical",
    descrizione: targetFiberDesc,
    luogoId: crimeRoomId,
    isArmaDelitto: false,
    scoperto: false,
    iconName: "Sparkles"
  };
  currentEvidence.push(clueFibra);

  // Indivio 4: Registro degli accessi fisici swippati
  const accessRooms = ["ingresso", "stanza_server", "cold_room", "sala_sicurezza"];
  const doorLogRoom = accessRooms[Math.floor(Math.random() * accessRooms.length)];
  const clueLocks: Evidence = {
    id: "access_logs_clue",
    nome: "Registro Porte Elettroniche",
    tipo: "digital",
    descrizione: `Un report digitale stampato dalla console di manutenzione a ${getRoomName(doorLogRoom)}. Mostra che alle 22:01 il varco biometrico per ${getRoomName(crimeRoomId)} ha registrato un accesso forzato di sicurezza con codice assegnato al ruolo di '${killerProfile.ruolo}'.`,
    luogoId: doorLogRoom,
    isArmaDelitto: false,
    scoperto: false,
    iconName: "FileText"
  };
  currentEvidence.push(clueLocks);

  // Spargiamo i Clues nelle Clues List delle singole Room
  currentEvidence.forEach(ev => {
    const room = currentRooms.find(r => r.id === ev.luogoId);
    if (room) {
      room.clues.push(ev.id);
    }
  });

  // 6. Configura i Feed CCTV delle telecamere della sicurezza
  // Eclipse City ha 5 telecamere posizionate strategicamente
  // Cam 1: Atrio (bar_neon, reception, waiting_room)
  // Cam 2: Laboratori (lab_1, lab_2, sala_sicurezza)
  // Cam 3: Sotterranei (cold_room, magazzino, deposito_chimico)
  // Cam 4: Server Area (stanza_server, backup_storage)
  // Cam 5: Personale (appartamenti, palestra)
  const cameras: SecurityCamera[] = [
    { id: "cam_atrium", nome: "CCTV-01 [Atrium Level]", cameraFeed: { "21:00": [], "22:00": [], "23:00": [] } },
    { id: "cam_labs", nome: "CCTV-02 [Research Division]", cameraFeed: { "21:00": [], "22:00": [], "23:00": [] } },
    { id: "cam_underground", nome: "CCTV-03 [Sub-Level Warehouse]", cameraFeed: { "21:00": [], "22:00": [], "23:00": [] } },
    { id: "cam_server", nome: "CCTV-04 [Mainframe Area]", cameraFeed: { "21:00": [], "22:00": [], "23:00": [] } },
    { id: "cam_residence", nome: "CCTV-05 [Crew Quarters]", cameraFeed: { "21:00": [], "22:00": [], "23:00": [] } },
  ];

  // Mappiamo stanze alle rispettive telecamere
  const roomToCamMap: Record<string, string> = {
    // Level -2
    stanza_server: "cam_server", backup_storage: "cam_server", generatori: "cam_server",
    // Level -1
    magazzino: "cam_underground", cold_room: "cam_underground", deposito_chimico: "cam_underground",
    // Level 0
    ingresso: "cam_atrium", reception: "cam_atrium", bar_neon: "cam_atrium", waiting_room: "cam_atrium",
    // Level 1
    uffici_direttivi: "cam_labs", sala_riunioni: "cam_labs", archivio: "cam_labs", ufficio_privato: "cam_labs", // map level 1 to labs too for high tech surveillance
    // Level 2
    lab_1: "cam_labs", lab_2: "cam_labs", sala_sicurezza: "cam_labs", bio_storage: "cam_labs",
    // Level 3
    appartamenti: "cam_residence", palestra: "cam_residence", messa_privata: "cam_residence", saletta_relax: "cam_residence",
    // Level 4 fallback
    eliporto: "cam_residence", trasmettitori: "cam_residence", generatori_backup: "cam_residence"
  };

  // Popola i feed in base alle posizioni REALI delle persone
  ["21:00", "22:00", "23:00"].forEach(hour => {
    npcs.forEach(npc => {
      const room = physicalMovement[npc.id][hour];
      const camId = roomToCamMap[room];
      const camera = cameras.find(c => c.id === camId);
      if (camera) {
        camera.cameraFeed[hour].push({
          npcId: npc.id,
          timeOffset: Math.floor(Math.random() * 50) + 5 // random offset minutes e.g. 21:15
        });
      }
    });

    // Se Sato fosse vivo a quell'ora (alle 21:00), aggiungiamolo al feed della sua posizione (Ufficio privato o Server)
    if (hour === "21:00") {
      const satoCam = roomToCamMap["ufficio_privato"];
      const camera = cameras.find(c => c.id === satoCam);
      if (camera) {
        camera.cameraFeed[hour].push({ npcId: "vittima_sato", timeOffset: 12 });
      }
    }
  });

  // 7. Genera i file digitali cifrate in Cyberspace
  const files: CyberFile[] = [
    {
      id: "mail_blackmail",
      titolo: "URGENTE: Negoziazione Termini",
      tipo: "email",
      mittente: "kenji.sato@eclipse.corp",
      destinatario: `${killerProfile.id}.${killerProfile.ruolo.toLowerCase().replace(" ", "")}@eclipse.corp`,
      data: "2026-05-26",
      corpo: `Ascoltami bene. Ho scoperto ciò che stai complottando. So esattamente del tuo schema illegale e che stai rimuovendo dati riservati per conto dei concorrenti. Se entro domani a mezzanotte non verserai 50.000 crediti sul mio cold-wallet primario, trasmetterò i file di diagnostica direttamente al Consiglio. Sei avvisato.`,
      isLocked: true,
      lockType: "hex_matrix",
      indiziSbloccabili: ["reclamato_riscatto"]
    },
    {
      id: "bank_ledger",
      titolo: "ALERT: Transazione Sospetta Offshore",
      tipo: "transaction",
      data: "2026-05-27 21:30",
      corpo: `BANCO DI ECLIPSE CITY - NOTIFICA AUTOMATICA\nTransazione approvata con successo.\nMittente: Cripto-conto S.Vance (Manager)\nDestinatario: J.Colton (Guardia)\nImporto: 100.000 Crediti Corporativi\nCausale: Servizio Straordinario / Bypass di Sicurezza.`,
      isLocked: true,
      lockType: "grid_bypass",
      indiziSbloccabili: ["corruzione_jax"]
    },
    {
      id: "system_audit",
      titolo: "LOG DI SISTEMA: Porte Logiche Livello -2 / -1",
      tipo: "system_log",
      data: "2026-05-27 22:00",
      corpo: `LOG SENSORI BIOMETRICI [21:55 - 22:15]\n21:58 - VARCO 08 (Cella Fredda) aperto con tessera di sblocco d'emergenza.\n22:00 - VARCO 09 (Stanza Server) ingresso registrato. Rilevamento anomalia di pressione spinale.\n22:05 - VARCO 09 (Stanza Server) uscita registrata. Rilevatore d'impronte termiche attivato. Profilo d'uscita corrispondente a un individuo vestito con '${colors[killerProfile.id]}'. CONFLITTO DI SEGNALE: Telecamere di zona oscurate temporaneamente.`,
      isLocked: false,
      lockType: "hex_matrix",
      indiziSbloccabili: []
    }
  ];

  // Spieghiamo il caso finale
  const gameCase: Case = {
    vittima: "Kenji Sato",
    assassinoId: killerProfile.id,
    armaDelittoId: selectedWeapon.id,
    motive: murderMotive,
    oraDelitto: "22:00",
    luogoDelittoId: crimeRoomId,
    proveLocazione: currentRooms.reduce((acc, r) => {
      acc[r.id] = r.clues;
      return acc;
    }, {} as Record<string, string[]>),
    testimonianzaFalsaIniziale: {
      [killerProfile.id]: `Ero spaventato e non sapevo cosa fare, stavo camminando tranquillo quando improvvisamente è saltata la luce...`
    },
    timelineMenzogne: npcs.reduce((acc, npc) => {
      acc[npc.id] = npc.alibi["22:00"].descrizioneDichiarata;
      return acc;
    }, {} as Record<string, string>)
  };

  return {
    rooms: currentRooms,
    npcs,
    evidence: currentEvidence,
    cameras,
    files,
    gameCase
  };
}

// Utility Helpers
function nycIsKiller(npcId: string, killerId: string): boolean {
  return npcId === killerId;
}

function getRoomName(roomId: string): string {
  const rs = ALL_ROOMS_SPEC.find(r => r.id === roomId);
  return rs ? rs.nome : "Zona Sconosciuta";
}

function getNpcName(npcId: string): string {
  const np = SUSPECT_PROFILES.find(n => n.id === npcId);
  return np ? np.nome : "Soggetto Ignoto";
}

function getAlibiDescription(npcId: string, hour: string, roomId: string): string {
  const roomName = getRoomName(roomId);
  switch (npcId) {
    case "rachel":
      if (hour === "21:00") return `Ero nella ${roomName} per calibrare i nodi quantistici della rete neurale del server.`;
      if (hour === "22:00") return `Stavo monitorando la stabilità del codice nella ${roomName}. Non ho visto nessuno.`;
      return `Mi sono ritirata per dormire nella ${roomName}. Ero sfinita dalla fatica.`;
    case "silas":
      if (hour === "21:00") return `Discutevo dell'avanzamento dei budget negli ${roomName}.`;
      if (hour === "22:00") return `Ero nella ${roomName} a controllare i miei report di rendimento trimestrali. Tutto normale.`;
      return `Ho concluso la mia giornata firmando report finanziari nella ${roomName}.`;
    case "vektor":
      if (hour === "21:00") return `Ero occupato a verificare gli inoculatori nel ${roomName}.`;
      if (hour === "22:00") return `Stavo isolando campioni biologici sensibili all'interno della ${roomName}.`;
      return `Mi sono diretto nella ${roomName} per purificare la mia maschera protettiva dai contaminanti.`;
    case "jax":
      if (hour === "21:00") return `Controllavo l'ingresso principale e gli scanner d'accesso elettronici alla ${roomName}.`;
      if (hour === "22:00") return `Ero in servizio di pattugliamento regolare alla ${roomName}. Nessun allarme anomalo.`;
      return `Facevo rapporto finale sulla sicurezza locale della zona nella ${roomName}.`;
    case "luna":
      if (hour === "21:00") return `Ero nel ${roomName} ordinando distillati sintetici con dei contatti locali.`;
      if (hour === "22:00") return `Cercavo pezzi di ricambio elettronici retrò nella ${roomName} per riparare il mio deck cibernetico.`;
      return `Riposavo e sistemavo le borse degli attrezzi nella ${roomName} prima di andare via.`;
    default:
      return `Mi trovavo nella ${roomName} a svolgere le mie mansioni abituali.`;
  }
}
