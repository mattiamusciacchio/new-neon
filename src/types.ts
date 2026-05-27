/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Role = "Manager" | "Technician" | "Security Guard" | "Bio-Researcher" | "Underground Dealer" | "AI Specialist";

export interface Personality {
  simpatia: number;       // 0-100
  aggressivita: number;   // 0-100
  intelligence: number;   // 0-100
  furbizia: number;       // 0-100
  nervosismo: number;     // 0-100
}

export interface Memory {
  ora: string;       // "21:00", "22:00", "23:00"
  luogoId: string;
  evento: string;
  dettagli: string;
  personeViste: string[]; // NPC IDs seen
}

export type RelationType = "friend" | "rival" | "colleague" | "secret_lover" | "blackmailer";

export interface Relation {
  npcTargetId: string;
  tipo: RelationType;
  intensita: number; // 0-100
  segretoCondiviso: string | null;
}

export interface Secret {
  tipo: "relationship" | "debt" | "corporate_theft" | "blackmail" | "sabotage";
  descrizione: string;
  gravita: number; // 0-100 (high is more sensitive)
  sbloccato: boolean;
}

export interface Alibi {
  ora: string;
  luogoId: string;
  descrizioneDichiarata: string;
  testimoneId: string | null; // claimed witness
  isFalso: boolean;
  veritaLuogoId: string; // where they actually were
  veritaDescrizione: string;
}

export interface NPC {
  id: string;
  nome: string;
  ruolo: Role;
  avatarColor: string; // neon color hex
  immagineSfondo: string; // custom generated color gradient style
  personality: Personality;
  memoria: Memory[];
  relazioni: Relation[];
  segreti: Secret[];
  alibi: Record<string, Alibi>; // Key: hour ("21:00", "22:00", "23:00")
  statoPsicologico: {
    stress: number; // 0-100
    paura: number;  // 0-100
    rabbia: number; // 0-100
    cooperazione: number; // 0-100
  };
  descrizione: string;
}

export interface Evidence {
  id: string;
  nome: string;
  tipo: "physical" | "digital" | "weapon";
  descrizione: string;
  luogoId: string; // where it is found (or hacked from)
  oraRilevamento?: string;
  isArmaDelitto: boolean;
  scoperto: boolean;
  iconName: string;
}

export type MotiveType = "vendetta" | "denaro" | "gelosia" | "sabotaggio" | "ricatto" | "tradimento";

export interface Motive {
  tipo: MotiveType;
  titolo: string;
  descrizione: string;
}

export interface TimelineMark {
  ora: string;
  npcId: string;
  luogoId: string;
}

export interface Case {
  vittima: string; // Sato Kenji (fixed name for plot consistency)
  assassinoId: string;
  armaDelittoId: string;
  motive: Motive;
  oraDelitto: string; // "22:00"
  luogoDelittoId: string; // "server_room" or "cold_room"
  proveLocazione: Record<string, string[]>; // locationId to ClueIds
  testimonianzaFalsaIniziale: Record<string, string>; // npcId to alibi lie
  timelineMenzogne: Record<string, string>; // suspectId -> liar's alibi statement
}

export interface Room {
  id: string;
  nome: string;
  descrizione: string;
  piano: number; // -2 to +3
  x: number; // grid coords for drawing
  y: number;
  w: number;
  h: number;
  neonColor: string;
  clues: string[]; // clue IDs lying in the room
}

export interface SecurityCamera {
  id: string;
  nome: string;
  cameraFeed: Record<string, { npcId: string; timeOffset: number }[]>; // hour -> timeline of who passed by
}

export interface CyberFile {
  id: string;
  titolo: string;
  tipo: "email" | "system_log" | "transaction";
  mittente?: string;
  destinatario?: string;
  data: string;
  corpo: string;
  isLocked: boolean;
  lockType: "hex_matrix" | "grid_bypass";
  indiziSbloccabili: string[]; // clus disclosed upon decryption
}

export interface GameState {
  currentFloor: number;
  playerX: number;
  playerY: number;
  selectedNpcId: string | null;
  selectedClueId: string | null;
  activeTab: "map" | "notebook" | "cctv" | "cyberspace" | "interrogations" | "accuse";
  notebookTab: "timeline" | "clues" | "profiles" | "relations" | "notes";
  cluesOwned: string[]; // clue IDs
  notes: string;
  timelineMarks: TimelineMark[];
  hackedFileIds: string[]; // files decrypted
  case: Case | null;
  npcs: NPC[];
  evidence: Evidence[];
  rooms: Room[];
  cameras: SecurityCamera[];
  files: CyberFile[];
  soundVolume: number;
  blackoutActive: boolean;
  gameTimeInHours: number; // e.g. 23:00 is timeline limit
  gameLog: string[];
  victoryState: "playing" | "success" | "failure" | "compromise";
  endingText: string;
}
