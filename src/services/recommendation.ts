import { db, type ActiveTimer, type GlobalEvent, type VillageEntity } from '../db/db';
import { catalog, getEntityById, getLevelData, getMaxLevelForTH } from './catalog';
import type { RecommendationScore, ResourceType } from '../types';

export interface RecommendationContext {
  accountTag: string;
  townHallLevel: number;
  activeTimers: ActiveTimer[];
  entities: VillageEntity[];
  activeEvents: GlobalEvent[];
}

export function calculateRecommendationScores(ctx: RecommendationContext): RecommendationScore[] {
  const { townHallLevel, activeTimers, entities, activeEvents } = ctx;
  const nowMs = Date.now();

  // Find active discount events (e.g. Hammer Jam 50% cost discount)
  const hammerJamEvent = activeEvents.find(
    e => e.isActive && (e.discountCost > 0 || e.name.toLowerCase().includes('hammer jam'))
  );
  const costMultiplier = hammerJamEvent ? (1 - hammerJamEvent.discountCost) : 1;
  const timeMultiplier = hammerJamEvent ? hammerJamEvent.discountTime : 1;

  // Active builder timers end times
  const builderTimers = activeTimers.filter(t => t.slotType === 'builder');
  const runningEndTimesMs = builderTimers.map(t => t.endsAt);

  // Check running builders' resources
  let goldBuildersCount = 0;
  let elixirBuildersCount = 0;
  let darkElixirBuildersCount = 0;
  let heroFinishingSoon = false;

  for (const timer of builderTimers) {
    const ent = getEntityById(timer.entityId);
    if (ent) {
      if (ent.resource === 'gold') goldBuildersCount++;
      if (ent.resource === 'elixir') elixirBuildersCount++;
      if (ent.resource === 'dark_elixir') darkElixirBuildersCount++;
    }
    // Check if hero timer finishes in less than 24 hours
    const isHero = ent?.category === 'heroes';
    const remainingHours = (timer.endsAt - nowMs) / (1000 * 3600);
    if (isHero && remainingHours > 0 && remainingHours < 24) {
      heroFinishingSoon = true;
    }
  }

  // Calculate free builders count
  const maxBuilders = catalog.townhalls[townHallLevel]?.max_builder_count || 6;
  const freeBuildersCount = Math.max(0, maxBuilders - builderTimers.length);

  // Entity map for current levels
  const entityMap = new Map<number, VillageEntity>();
  for (const ent of entities) {
    entityMap.set(ent.dataId, ent);
  }

  // Set of entity IDs currently being upgraded
  const ongoingUpgradeIds = new Set<number>(activeTimers.map(t => t.entityId));

  const candidateRecommendations: RecommendationScore[] = [];

  // Iterate over all entities in catalog
  for (const entityDef of Object.values(catalog.entities)) {
    // Skip if already being upgraded in a slot
    if (ongoingUpgradeIds.has(entityDef.id)) {
      continue;
    }

    const currentEntity = entityMap.get(entityDef.id);
    const currentLevel = currentEntity ? currentEntity.level : 0;
    const maxLevelForTH = getMaxLevelForTH(entityDef.id, townHallLevel);

    // Skip if already maxed for current Town Hall or if not unlocked yet
    if (currentLevel >= maxLevelForTH || maxLevelForTH === 0) {
      continue;
    }

    const targetLevel = currentLevel + 1;
    const levelData = getLevelData(entityDef.id, targetLevel);
    if (!levelData) continue;

    const baseCost = levelData.cost;
    const originalDuration = levelData.duration;
    const discountedCost = Math.round(baseCost * costMultiplier);
    const effectiveDuration = Math.round(originalDuration * timeMultiplier);
    const resource: ResourceType = (levelData.resource || entityDef.resource) as ResourceType;

    const tags: string[] = [];
    const reasons: string[] = [];

    // --- 1. S_stagger (40 % – Zeitversatz) ---
    // Idealer Abstand: Δt_ideal = 28 Stunden.
    // T_finish = Date.now() + duration(u).
    // Δt_min = min_i |T_finish - T_i|
    const hypotheticalFinishMs = nowMs + effectiveDuration * 1000;
    let minGapHours = 28; // Default optimal if no running builders

    if (runningEndTimesMs.length > 0) {
      let minGapMs = Infinity;
      for (const tEnd of runningEndTimesMs) {
        const gap = Math.abs(hypotheticalFinishMs - tEnd);
        if (gap < minGapMs) {
          minGapMs = gap;
        }
      }
      minGapHours = minGapMs / (1000 * 3600);
    }

    let S_stagger = 100;
    if (minGapHours < 3) {
      // Bottleneck warning
      S_stagger = 0;
      tags.push('⚠️ Bottleneck-Gefahr (<3h)');
      reasons.push(`Endet fast zeitgleich mit einem anderen Bauarbeiter (Abstand: ${minGapHours.toFixed(1)}h).`);
    } else if (minGapHours >= 28) {
      S_stagger = 100;
      tags.push('+28h Stagger Gap');
      reasons.push(`Optimaler Bauarbeiterabstand von ${minGapHours.toFixed(1)}h verhindert Leerlauf.`);
    } else {
      // Linear interpolation between 3h and 28h
      S_stagger = Math.round((100 * (minGapHours - 3)) / (28 - 3));
      tags.push(`Stagger Gap: ${minGapHours.toFixed(1)}h`);
      reasons.push(`Bauarbeiterabstand liegt bei soliden ${minGapHours.toFixed(1)}h.`);
    }

    // --- 2. S_resource (35 % – Anti-Cap & Burn-Rate) ---
    // Prüft, welche Rohstoffe die aktuellen Bauarbeiter verbauen.
    // Wenn >= 3 Builder Gold beanspruchen: Elixier +40, Gold -20
    let S_resource = 50; // Neutral base

    if (goldBuildersCount >= 3) {
      if (resource === 'elixir') {
        S_resource += 40;
        tags.push('Verhindert Elixier-Überlauf');
        reasons.push(`${goldBuildersCount} Bauarbeiter binden Gold. Elixier-Bau verhindert Ressourcen-Cap.`);
      } else if (resource === 'gold') {
        S_resource -= 20;
        reasons.push(`Hoher Gold-Verbrauch aktiv (${goldBuildersCount} Bauarbeiter binden bereits Gold).`);
      }
    } else if (elixirBuildersCount >= 3) {
      if (resource === 'gold') {
        S_resource += 40;
        tags.push('Verhindert Gold-Überlauf');
        reasons.push(`${elixirBuildersCount} Bauarbeiter binden Elixier. Gold-Bau gleicht den Verbrauch aus.`);
      }
    }

    // Dunkles Elixier priorisieren wenn Held in < 24h fertig
    if (heroFinishingSoon && resource === 'dark_elixir') {
      S_resource += 30;
      tags.push('DE-Held frei <24h');
      reasons.push('Ein Held wird in Kürze fertig – Dunkles Elixier rechtzeitig verbauen.');
    }

    S_resource = Math.max(0, Math.min(100, S_resource));

    // --- 3. S_offense (15 % – Baseline-Nutzen) ---
    // Labor, Armeelager, Clanburg: 100 Punkte.
    // Helden: 85 Punkte (Warden -> Queen -> King -> RC).
    // Kern-Defensiven: 70 Punkte.
    let S_offense = 50;

    if (entityDef.category === 'offense' && (entityDef.name === 'Laboratory' || entityDef.name === 'Army Camp' || entityDef.name === 'Clan Castle')) {
      S_offense = 100;
      tags.push('Offense Priorität');
      reasons.push('Offensive Schlüsselinfrastruktur (Truppenstärke / Kapazität).');
    } else if (entityDef.category === 'heroes') {
      if (entityDef.name === 'Grand Warden') S_offense = 95;
      else if (entityDef.name === 'Archer Queen') S_offense = 90;
      else if (entityDef.name === 'Barbarian King') S_offense = 85;
      else S_offense = 80;
      tags.push('Held-Upgrade');
      reasons.push('Helden-Stufe steigert Angriffskraft nachhaltig.');
    } else if (
      entityDef.category === 'defense' &&
      ['Eagle Artillery', 'Monolith', 'Spell Tower', 'Inferno Tower', 'Scattershot'].includes(entityDef.name)
    ) {
      S_offense = 70;
      tags.push('Kern-Defensive');
      reasons.push('Wichtige Verteidigungsachse gegen 3-Sterne-Angriffe.');
    } else if (entityDef.category === 'resources') {
      S_offense = 60;
    }

    // --- 4. S_idle (10 % – Leerlauf-Vermeidung) ---
    // Gibt freien Bauarbeitern +100 Dringlichkeitspunkte für sofort bezahlbare Bauten.
    let S_idle = 30;
    if (freeBuildersCount > 0) {
      S_idle = 100;
      tags.push('Freier Bauarbeiter!');
      reasons.push(`${freeBuildersCount} Bauarbeiter sind untätig – Upgrade sofort starten.`);
    }

    // --- Event Boost (Hammer Jam) ---
    let eventBoost = 0;
    if (hammerJamEvent) {
      const savedAmount = baseCost - discountedCost;
      if (savedAmount > 0) {
        // Boost for significant savings
        eventBoost = Math.min(25, Math.round((savedAmount / 1000000) * 2));
        tags.push('⚡ Hammer Jam Rabatt (-50%)');
        reasons.push(`Hammer Jam spart ${((baseCost - discountedCost) / 1000000).toFixed(1)}M Rohstoffe!`);
      }
    }

    // --- FinalScore Formel ---
    // FinalScore = 0.40 * S_stagger + 0.35 * S_resource + 0.15 * S_offense + 0.10 * S_idle (+ eventBoost)
    const baseFinalScore =
      0.40 * S_stagger +
      0.35 * S_resource +
      0.15 * S_offense +
      0.10 * S_idle;

    const finalScore = Math.min(100, Math.round(baseFinalScore + eventBoost));

    candidateRecommendations.push({
      entityId: entityDef.id,
      entityName: entityDef.name,
      category: entityDef.category,
      resource,
      currentLevel,
      targetLevel,
      cost: discountedCost,
      originalCost: baseCost,
      duration: effectiveDuration,
      finalScore,
      staggerScore: Math.round(S_stagger),
      resourceScore: Math.round(S_resource),
      offenseScore: Math.round(S_offense),
      idleScore: Math.round(S_idle),
      staggerGapHours: Math.round(minGapHours * 10) / 10,
      tags: Array.from(new Set(tags)),
      reasons
    });
  }

  // Sort descending by finalScore
  candidateRecommendations.sort((a, b) => b.finalScore - a.finalScore);

  return candidateRecommendations;
}

// Helper to start an upgrade timer for a recommendation
export async function startUpgradeTimer(accountTag: string, recommendation: RecommendationScore): Promise<void> {
  const nowMs = Date.now();
  const endsAt = nowMs + recommendation.duration * 1000;
  const isLab = recommendation.category === 'lab';
  const isPet = recommendation.category === 'pets';
  const slotType = isLab ? 'lab' : (isPet ? 'pet' : 'builder');

  // Find next free slot number
  const existingTimers = await db.timers
    .where('accountTag')
    .equals(accountTag)
    .filter(t => t.slotType === slotType)
    .toArray();

  const usedSlots = new Set(existingTimers.map(t => t.slotNumber || 1));
  let slotNumber = 1;
  while (usedSlots.has(slotNumber)) {
    slotNumber++;
  }

  const newTimer: ActiveTimer = {
    id: crypto.randomUUID(),
    accountTag,
    entityId: recommendation.entityId,
    targetLevel: recommendation.targetLevel,
    endsAt,
    slotType,
    slotNumber,
    isRecurrentHelper: false
  };

  await db.timers.add(newTimer);
}
