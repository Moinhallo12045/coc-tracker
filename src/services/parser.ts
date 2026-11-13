import { db, type AccountProfile, type VillageEntity, type ActiveTimer } from '../db/db';
import userExportRaw from '../data/user_export.json';

export interface ClashNinjaExportItem {
  data?: number;
  id?: number;
  dataId?: number;
  lvl?: number;
  level?: number;
  cnt?: number;
  count?: number;
  timer?: number;
  gear_up?: number;
  gearUp?: number;
  weapon?: number;
}

export interface ClashNinjaExportFull {
  tag?: string;
  playerTag?: string;
  name?: string;
  timestamp?: number;
  buildings?: ClashNinjaExportItem[];
  traps?: ClashNinjaExportItem[];
  heroes?: ClashNinjaExportItem[];
  units?: ClashNinjaExportItem[];
  spells?: ClashNinjaExportItem[];
  pets?: ClashNinjaExportItem[];
  siege_machines?: ClashNinjaExportItem[];
  equipment?: ClashNinjaExportItem[];
  helpers?: ClashNinjaExportItem[];
  buildings2?: ClashNinjaExportItem[];
  traps2?: ClashNinjaExportItem[];
  heroes2?: ClashNinjaExportItem[];
  units2?: ClashNinjaExportItem[];
  boosts?: Record<string, unknown>;
}

export interface ParseResult {
  account: AccountProfile;
  entityCount: number;
  activeTimersCount: number;
  deltaSeconds: number;
}

export async function parseAndIngestClashNinjaJson(rawJson: string | object): Promise<ParseResult> {
  const json: ClashNinjaExportFull = typeof rawJson === 'string' ? JSON.parse(rawJson) : rawJson;

  const nowMs = Date.now();
  const currentTimestampSec = Math.floor(nowMs / 1000);
  const jsonTimestamp = json.timestamp || currentTimestampSec;
  const deltaSeconds = Math.max(0, currentTimestampSec - jsonTimestamp);

  const tag = (json.tag || json.playerTag || '#Q9C0YQYJR').toUpperCase().trim();
  const name = json.name || `Chief ${tag.replace('#', '')}`;

  // Deduce Town Hall level from buildings array (ID 1000001)
  let townHallLevel = 16;
  if (Array.isArray(json.buildings)) {
    const thItem = json.buildings.find(b => (b.data || b.id) === 1000001);
    if (thItem && (thItem.lvl || thItem.level)) {
      townHallLevel = Number(thItem.lvl || thItem.level);
    }
  }

  // Deduce Builder Hall level from buildings2 array (ID 1000040)
  let builderHallLevel = 10;
  if (Array.isArray(json.buildings2)) {
    const bhItem = json.buildings2.find(b => (b.data || b.id) === 1000040);
    if (bhItem && (bhItem.lvl || bhItem.level)) {
      builderHallLevel = Number(bhItem.lvl || bhItem.level);
    }
  }

  await db.transaction('rw', db.accounts, db.entities, db.timers, async () => {
    await db.accounts.toCollection().modify({ isActive: false });

    const existingAccount = await db.accounts.get(tag);
    const accountProfile: AccountProfile = {
      tag,
      name,
      townHallLevel,
      builderHallLevel,
      lastSyncTimestamp: nowMs,
      isActive: true
    };

    if (existingAccount) {
      await db.accounts.update(tag, accountProfile);
    } else {
      await db.accounts.add(accountProfile);
    }

    // Clean previous records for this account
    await db.entities.where('accountTag').equals(tag).delete();
    await db.timers.where('accountTag').equals(tag).delete();

    const entitiesToInsert: VillageEntity[] = [];
    const timersToInsert: ActiveTimer[] = [];

    let homeBuilderSlotCounter = 1;
    let bbBuilderSlotCounter = 1;

    const processItem = (
      item: ClashNinjaExportItem,
      slotType: 'builder' | 'lab' | 'pet',
      villageType: 'home' | 'builderBase' = 'home'
    ) => {
      const dataId = Number(item.data || item.id || item.dataId || 0);
      if (!dataId) return;

      const level = Number(item.lvl ?? item.level ?? 1);
      const count = Number(item.cnt ?? item.count ?? 1);
      const gearUp = (item.gear_up || item.gearUp) ? 1 : 0;
      const weaponLevel = item.weapon ? Number(item.weapon) : undefined;

      entitiesToInsert.push({
        id: `${tag}_${villageType}_${dataId}_${level}_${entitiesToInsert.length}`,
        accountTag: tag,
        villageType,
        dataId,
        level,
        count,
        gearUp,
        weaponLevel
      });

      // Timer delta sync
      if (item.timer && item.timer > 0) {
        const remainingSeconds = Math.max(0, item.timer - deltaSeconds);
        if (remainingSeconds > 0) {
          const endsAt = nowMs + remainingSeconds * 1000;
          const targetLevel = level + 1;

          let slotNumber = 1;
          if (slotType === 'builder') {
            if (villageType === 'builderBase') {
              slotNumber = bbBuilderSlotCounter++;
            } else {
              slotNumber = homeBuilderSlotCounter++;
            }
          }

          timersToInsert.push({
            id: crypto.randomUUID(),
            accountTag: tag,
            villageType,
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

    // Parse Home Village categories
    if (Array.isArray(json.buildings)) {
      for (const b of json.buildings) processItem(b, 'builder', 'home');
    }
    if (Array.isArray(json.traps)) {
      for (const t of json.traps) processItem(t, 'builder', 'home');
    }
    if (Array.isArray(json.heroes)) {
      for (const h of json.heroes) processItem(h, 'builder', 'home');
    }
    if (Array.isArray(json.units)) {
      for (const u of json.units) processItem(u, 'lab', 'home');
    }
    if (Array.isArray(json.spells)) {
      for (const s of json.spells) processItem(s, 'lab', 'home');
    }
    if (Array.isArray(json.siege_machines)) {
      for (const sm of json.siege_machines) processItem(sm, 'lab', 'home');
    }
    if (Array.isArray(json.pets)) {
      for (const p of json.pets) processItem(p, 'pet', 'home');
    }

    // Parse Builder Base categories
    if (Array.isArray(json.buildings2)) {
      for (const b of json.buildings2) processItem(b, 'builder', 'builderBase');
    }
    if (Array.isArray(json.traps2)) {
      for (const t of json.traps2) processItem(t, 'builder', 'builderBase');
    }
    if (Array.isArray(json.heroes2)) {
      for (const h of json.heroes2) processItem(h, 'builder', 'builderBase');
    }
    if (Array.isArray(json.units2)) {
      for (const u of json.units2) processItem(u, 'lab', 'builderBase');
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

// User export as default demo sample (contains full Home Village & Builder Base)
export function getSampleClashNinjaJson(): string {
  return JSON.stringify(userExportRaw, null, 2);
}
