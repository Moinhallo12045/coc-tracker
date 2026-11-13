import Dexie, { type Table } from 'dexie';

export interface AccountProfile {
  tag: string;              // Primary Key, z.B. "#Q9C0YQYJR"
  name: string;             // Alias oder Ingame-Name
  townHallLevel: number;    // Stufe 1 bis 19
  builderHallLevel?: number;// Stufe 1 bis 10 (Builder Base)
  lastSyncTimestamp: number;
  isActive: boolean;        // Aktuell im UI gewählter Account
}

export interface VillageEntity {
  id: string;               // Zusammengesetzt: `${accountTag}_${dataId}`
  accountTag: string;       // Foreign Key -> AccountProfile.tag
  villageType?: 'home' | 'builderBase'; // 'home' or 'builderBase'
  dataId: number;           // Supercell-ID (z.B. 1000008 = Archer Tower)
  level: number;
  count: number;            // Anzahl auf dieser Stufe (z.B. 325 für Mauern)
  gearUp?: number;          // 0 oder 1
  weaponLevel?: number;     // Waffenstufe (Rathaus)
}

export interface ActiveTimer {
  id: string;               // UUID
  accountTag: string;       // Foreign Key -> AccountProfile.tag
  villageType?: 'home' | 'builderBase';
  entityId: number;         // Supercell-ID
  targetLevel: number;
  endsAt: number;           // Berechneter Unix-Timestamp des Endes (in ms)
  slotType: 'builder' | 'lab' | 'pet';
  slotNumber?: number;      // 1 to 6 (builder), 1 (lab), 1 (pet)
  isRecurrentHelper?: boolean; // Goblin-Builder / Helper-Flag
}

export interface GlobalEvent {
  id: string;
  name: string;
  discountCost: number;     // z.B. 0.5 bei Hammer Jam
  discountTime: number;     // z.B. 1.0
  category: 'buildings' | 'lab' | 'all';
  startsAt: number;         // Unix-Timestamp
  endsAt: number;           // Unix-Timestamp
  isActive: boolean;
}

export class ClashDatabase extends Dexie {
  accounts!: Table<AccountProfile, string>;
  entities!: Table<VillageEntity, string>;
  timers!: Table<ActiveTimer, string>;
  events!: Table<GlobalEvent, string>;

  constructor() {
    super('ClashTrackerDB');
    this.version(2).stores({
      accounts: 'tag, name, isActive',
      entities: 'id, accountTag, dataId, villageType',
      timers: 'id, accountTag, endsAt, slotType, villageType',
      events: 'id, startsAt, endsAt, isActive'
    });
  }
}

export const db = new ClashDatabase();
