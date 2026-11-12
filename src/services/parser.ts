import { db, type AccountProfile, type VillageEntity, type ActiveTimer } from '../db/db';
import { getEntityById } from './catalog';

export interface ClashNinjaExportRaw {
  timestamp?: number;
  tag?: string;
  playerTag?: string;
  name?: string;
  playerName?: string;
  townHallLevel?: number;
  th?: number;
  buildings?: Array<{
    id?: number;
    dataId?: number;
    lvl?: number;
    level?: number;
    count?: number;
    timer?: number;
    gearUp?: number;
  }>;
  heroes?: Array<{
    id?: number;
    dataId?: number;
    lvl?: number;
    level?: number;
    timer?: number;
  }>;
  lab?: Array<{
    id?: number;
    dataId?: number;
    lvl?: number;
    level?: number;
    timer?: number;
  }>;
  pets?: Array<{
    id?: number;
    dataId?: number;
    lvl?: number;
    level?: number;
    timer?: number;
  }>;
  entities?: Array<{
    dataId: number;
    level: number;
    count?: number;
    timer?: number;
  }>;
}

export interface ParseResult {
  account: AccountProfile;
  entityCount: number;
  activeTimersCount: number;
  deltaSeconds: number;
}

export async function parseAndIngestClashNinjaJson(rawJson: string | object): Promise<ParseResult> {
  const json: ClashNinjaExportRaw = typeof rawJson === 'string' ? JSON.parse(rawJson) : rawJson;

  // 1. Calculate time delta Δt = floor(Date.now() / 1000) - json.timestamp
  const nowMs = Date.now();
  const currentTimestampSec = Math.floor(nowMs / 1000);
  const jsonTimestamp = json.timestamp || currentTimestampSec;
  const deltaSeconds = Math.max(0, currentTimestampSec - jsonTimestamp);

  // 2. Multi-Account Mapping
  const tag = (json.tag || json.playerTag || '#Q9C0YQYJR').toUpperCase().trim();
  const name = json.name || json.playerName || `Chief ${tag.replace('#', '')}`;
  const townHallLevel = Math.max(1, Math.min(19, Number(json.townHallLevel || json.th || 16)));

  // Deactivate other accounts and set this one as active
  await db.transaction('rw', db.accounts, db.entities, db.timers, async () => {
    await db.accounts.toCollection().modify({ isActive: false });

    const existingAccount = await db.accounts.get(tag);
    const accountProfile: AccountProfile = {
      tag,
      name,
      townHallLevel,
      lastSyncTimestamp: nowMs,
      isActive: true
    };

    if (existingAccount) {
      await db.accounts.update(tag, accountProfile);
    } else {
      await db.accounts.add(accountProfile);
    }

    // Clear previous entities and timers for this account to guarantee a clean sync
    await db.entities.where('accountTag').equals(tag).delete();
    await db.timers.where('accountTag').equals(tag).delete();

    const entitiesToInsert: VillageEntity[] = [];
    const timersToInsert: ActiveTimer[] = [];

    let builderSlotCounter = 1;

    // Helper to process list of items
    const processItem = (
      item: { id?: number; dataId?: number; lvl?: number; level?: number; count?: number; timer?: number; gearUp?: number },
      slotType: 'builder' | 'lab' | 'pet'
    ) => {
      const dataId = Number(item.id || item.dataId || 0);
      if (!dataId) return;

      const level = Number(item.lvl ?? item.level ?? 1);
      const count = Number(item.count ?? 1);
      const gearUp = item.gearUp ? 1 : 0;

      entitiesToInsert.push({
        id: `${tag}_${dataId}`,
        accountTag: tag,
        dataId,
        level,
        count,
        gearUp
      });

      // Timer delta calculation
      if (item.timer && item.timer > 0) {
        const remainingSeconds = Math.max(0, item.timer - deltaSeconds);
        if (remainingSeconds > 0) {
          const endsAt = nowMs + remainingSeconds * 1000;
          const targetLevel = level + 1;

          let slotNumber = 1;
          if (slotType === 'builder') {
            slotNumber = builderSlotCounter++;
          }

          timersToInsert.push({
            id: crypto.randomUUID(),
            accountTag: tag,
            entityId: dataId,
            targetLevel,
            endsAt,
            slotType,
            slotNumber,
            isRecurrentHelper: false
          });
        }
      }
    };

    // Process all categories
    if (Array.isArray(json.buildings)) {
      for (const b of json.buildings) processItem(b, 'builder');
    }
    if (Array.isArray(json.heroes)) {
      for (const h of json.heroes) processItem(h, 'builder');
    }
    if (Array.isArray(json.lab)) {
      for (const l of json.lab) processItem(l, 'lab');
    }
    if (Array.isArray(json.pets)) {
      for (const p of json.pets) processItem(p, 'pet');
    }
    if (Array.isArray(json.entities)) {
      for (const e of json.entities) {
        const entityMeta = getEntityById(e.dataId);
        const slotType = entityMeta?.category === 'lab' ? 'lab' : (entityMeta?.category === 'pets' ? 'pet' : 'builder');
        processItem(e, slotType);
      }
    }

    if (entitiesToInsert.length > 0) {
      await db.entities.bulkPut(entitiesToInsert);
    }
    if (timersToInsert.length > 0) {
      await db.timers.bulkPut(timersToInsert);
    }
  });

  const createdAccount = (await db.accounts.get(tag))!;
  const entityCount = await db.entities.where('accountTag').equals(tag).count();
  const activeTimersCount = await db.timers.where('accountTag').equals(tag).count();

  return {
    account: createdAccount,
    entityCount,
    activeTimersCount,
    deltaSeconds
  };
}

// Generate sample Clash Ninja JSON matching the architectural plan
export function getSampleClashNinjaJson(): string {
  const now = Math.floor(Date.now() / 1000);
  return JSON.stringify(
    {
      timestamp: now - 3600, // Exported 1 hour ago
      tag: "#Q9C0YQYJR",
      name: "Main (#Q9C0YQYJR)",
      townHallLevel: 16,
      buildings: [
        { id: 1000008, lvl: 21, count: 6, timer: 138120 }, // Archer Tower -> L22, remaining ~1d 14h 22m
        { id: 1000000, lvl: 21, count: 7 }, // Cannon
        { id: 1000004, lvl: 16, count: 4 }, // Air Defense L16 (4/4 Max)
        { id: 1000002, lvl: 16, count: 4 }, // Gold Storage L16 -> can upgrade to L17
        { id: 1000024, lvl: 16, count: 4 }, // Elixir Storage L16
        { id: 1000025, lvl: 10, count: 1 }, // Dark Elixir Storage L10
        { id: 1000010, lvl: 17, count: 325 }, // Walls L17 (325/325)
        { id: 1000030, lvl: 14, count: 1 }, // Laboratory
        { id: 1000031, lvl: 13, count: 4 }, // Army Camp
        { id: 1000026, lvl: 12, count: 1 }, // Clan Castle
        { id: 1000013, lvl: 6, count: 1 }, // Eagle Artillery
        { id: 1000012, lvl: 9, count: 3 }, // Inferno Tower
        { id: 1000016, lvl: 2, count: 1 } // Monolith
      ],
      heroes: [
        { id: 28000000, lvl: 90, timer: 267010 }, // Barbarian King -> L91, remaining ~3d 02h 10m
        { id: 28000001, lvl: 90 }, // Archer Queen
        { id: 28000002, lvl: 70 }, // Grand Warden
        { id: 28000003, lvl: 40 }  // Royal Champion
      ],
      lab: [
        { id: 4000095, lvl: 1, timer: 583200 } // Electro Titan -> L2, remaining ~6d 18h
      ]
    },
    null,
    2
  );
}
