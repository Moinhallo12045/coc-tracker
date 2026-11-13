import { db, type AccountProfile, type VillageEntity, type ActiveTimer } from '../db/db';

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

    // Clean previous records for this account
    await db.entities.where('accountTag').equals(tag).delete();
    await db.timers.where('accountTag').equals(tag).delete();

    const entitiesToInsert: VillageEntity[] = [];
    const timersToInsert: ActiveTimer[] = [];

    let builderSlotCounter = 1;

    const processItem = (item: ClashNinjaExportItem, slotType: 'builder' | 'lab' | 'pet') => {
      const dataId = Number(item.data || item.id || item.dataId || 0);
      if (!dataId) return;

      const level = Number(item.lvl ?? item.level ?? 1);
      const count = Number(item.cnt ?? item.count ?? 1);
      const gearUp = (item.gear_up || item.gearUp) ? 1 : 0;
      const weaponLevel = item.weapon ? Number(item.weapon) : undefined;

      entitiesToInsert.push({
        id: `${tag}_${dataId}_${level}_${entitiesToInsert.length}`,
        accountTag: tag,
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

    // Parse all Clash Ninja categories
    if (Array.isArray(json.buildings)) {
      for (const b of json.buildings) processItem(b, 'builder');
    }
    if (Array.isArray(json.traps)) {
      for (const t of json.traps) processItem(t, 'builder');
    }
    if (Array.isArray(json.heroes)) {
      for (const h of json.heroes) processItem(h, 'builder');
    }
    if (Array.isArray(json.units)) {
      for (const u of json.units) processItem(u, 'lab');
    }
    if (Array.isArray(json.spells)) {
      for (const s of json.spells) processItem(s, 'lab');
    }
    if (Array.isArray(json.siege_machines)) {
      for (const sm of json.siege_machines) processItem(sm, 'lab');
    }
    if (Array.isArray(json.pets)) {
      for (const p of json.pets) processItem(p, 'pet');
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

// User export as default demo sample
export function getSampleClashNinjaJson(): string {
  return JSON.stringify(
    {
      "tag": "#Q9C0YQYJR",
      "name": "Main (#Q9C0YQYJR)",
      "timestamp": Math.floor(Date.now() / 1000) - 120,
      "buildings": [
        {"data": 1000001, "lvl": 16, "weapon": 1},
        {"data": 1000008, "lvl": 21, "gear_up": 1},
        {"data": 1000009, "lvl": 21, "gear_up": 1},
        {"data": 1000013, "lvl": 16, "gear_up": 1},
        {"data": 1000000, "lvl": 12, "cnt": 4},
        {"data": 1000002, "lvl": 17, "cnt": 7},
        {"data": 1000003, "lvl": 17, "cnt": 4},
        {"data": 1000004, "lvl": 17, "cnt": 7},
        {"data": 1000005, "lvl": 17, "cnt": 4},
        {"data": 1000006, "lvl": 18, "cnt": 1},
        {"data": 1000007, "lvl": 14, "cnt": 1},
        {"data": 1000008, "lvl": 21, "cnt": 2},
        {"data": 1000009, "lvl": 21, "cnt": 3},
        {"data": 1000010, "lvl": 17, "cnt": 325},
        {"data": 1000011, "lvl": 16, "cnt": 5},
        {"data": 1000012, "lvl": 14, "cnt": 4},
        {"data": 1000013, "lvl": 16, "cnt": 3},
        {"data": 1000014, "lvl": 12, "cnt": 1},
        {"data": 1000015, "lvl": 6, "cnt": 5},
        {"data": 1000019, "lvl": 15, "cnt": 5},
        {"data": 1000020, "lvl": 9, "cnt": 1},
        {"data": 1000021, "lvl": 11, "cnt": 4},
        {"data": 1000023, "lvl": 11, "cnt": 3},
        {"data": 1000024, "lvl": 11, "cnt": 1},
        {"data": 1000026, "lvl": 13, "cnt": 1},
        {"data": 1000027, "lvl": 10, "cnt": 3},
        {"data": 1000028, "lvl": 7, "cnt": 2},
        {"data": 1000029, "lvl": 8, "cnt": 1},
        {"data": 1000031, "lvl": 7, "cnt": 1},
        {"data": 1000032, "lvl": 11, "cnt": 2},
        {"data": 1000059, "lvl": 8, "cnt": 1},
        {"data": 1000067, "lvl": 5, "cnt": 2},
        {"data": 1000068, "lvl": 10, "cnt": 1},
        {"data": 1000070, "lvl": 9, "cnt": 1},
        {"data": 1000071, "lvl": 10, "cnt": 1},
        {"data": 1000072, "lvl": 3, "cnt": 2},
        {"data": 1000077, "lvl": 3, "cnt": 1},
        {"data": 1000084, "lvl": 2, "cnt": 2},
        {"data": 1000085, "lvl": 2, "cnt": 2}
      ],
      "traps": [
        {"data": 12000002, "lvl": 9, "timer": 100251},
        {"data": 12000001, "lvl": 10, "timer": 23488},
        {"data": 12000006, "lvl": 5, "timer": 5134},
        {"data": 12000006, "lvl": 5, "timer": 31556},
        {"data": 12000000, "lvl": 12, "cnt": 8},
        {"data": 12000001, "lvl": 10, "cnt": 1},
        {"data": 12000001, "lvl": 11, "cnt": 7},
        {"data": 12000002, "lvl": 9, "cnt": 3},
        {"data": 12000002, "lvl": 10, "cnt": 3},
        {"data": 12000005, "lvl": 10, "cnt": 3},
        {"data": 12000005, "lvl": 11, "cnt": 4},
        {"data": 12000006, "lvl": 5, "cnt": 1},
        {"data": 12000006, "lvl": 6, "cnt": 5},
        {"data": 12000008, "lvl": 4, "cnt": 4},
        {"data": 12000016, "lvl": 3, "cnt": 1}
      ],
      "heroes": [
        {"data": 28000000, "lvl": 90, "timer": 31138},
        {"data": 28000001, "lvl": 91, "timer": 7256},
        {"data": 28000002, "lvl": 66},
        {"data": 28000004, "lvl": 41},
        {"data": 28000006, "lvl": 72},
        {"data": 28000007, "lvl": 12}
      ],
      "units": [
        {"data": 4000006, "lvl": 10, "timer": 192982},
        {"data": 4000000, "lvl": 10},
        {"data": 4000008, "lvl": 11},
        {"data": 4000095, "lvl": 2}
      ],
      "pets": [
        {"data": 73000011, "lvl": 5, "timer": 208671},
        {"data": 73000000, "lvl": 11},
        {"data": 73000001, "lvl": 10}
      ]
    },
    null,
    2
  );
}
