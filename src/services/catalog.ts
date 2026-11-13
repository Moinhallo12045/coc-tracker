import catalogRaw from '../data/catalog.json';
import type { CatalogData, CatalogEntity, EntityCategory, ResourceType } from '../types';

export const catalog: CatalogData = catalogRaw as unknown as CatalogData;

// Name mapping for ClashKing URL resolution
const entitySlugMap: Record<number, { path: string; slug: string }> = {
  1000000: { path: 'buildings/home-village', slug: 'army_camp' },
  1000001: { path: 'buildings/home-village', slug: 'town_hall' },
  1000002: { path: 'buildings/home-village', slug: 'elixir_collector' },
  1000003: { path: 'buildings/home-village', slug: 'elixir_storage' },
  1000004: { path: 'buildings/home-village', slug: 'gold_mine' },
  1000005: { path: 'buildings/home-village', slug: 'gold_storage' },
  1000006: { path: 'buildings/home-village', slug: 'barracks' },
  1000007: { path: 'buildings/home-village', slug: 'laboratory' },
  1000008: { path: 'buildings/home-village', slug: 'cannon' },
  1000009: { path: 'buildings/home-village', slug: 'archer_tower' },
  1000010: { path: 'buildings/home-village', slug: 'wall' },
  1000011: { path: 'buildings/home-village', slug: 'wizard_tower' },
  1000012: { path: 'buildings/home-village', slug: 'air_defense' },
  1000013: { path: 'buildings/home-village', slug: 'mortar' },
  1000014: { path: 'buildings/home-village', slug: 'clan_castle' },
  1000015: { path: 'buildings/home-village', slug: "builder's_hut" },
  1000019: { path: 'buildings/home-village', slug: 'hidden_tesla' },
  1000020: { path: 'buildings/home-village', slug: 'spell_factory' },
  1000021: { path: 'buildings/home-village', slug: 'x-bow' },
  1000023: { path: 'buildings/home-village', slug: 'dark_elixir_drill' },
  1000024: { path: 'buildings/home-village', slug: 'dark_elixir_storage' },
  1000026: { path: 'buildings/home-village', slug: 'dark_barracks' },
  1000027: { path: 'buildings/home-village', slug: 'inferno_tower' },
  1000028: { path: 'buildings/home-village', slug: 'air_sweeper' },
  1000029: { path: 'buildings/home-village', slug: 'dark_spell_factory' },
  1000031: { path: 'buildings/home-village', slug: 'eagle_artillery' },
  1000032: { path: 'buildings/home-village', slug: 'bomb_tower' },
  1000059: { path: 'buildings/home-village', slug: 'workshop' },
  1000064: { path: 'buildings/builder-base', slug: 'bob_control' },
  1000067: { path: 'buildings/home-village', slug: 'scattershot' },
  1000068: { path: 'buildings/home-village', slug: 'pet_house' },
  1000070: { path: 'buildings/home-village', slug: 'blacksmith' },
  1000071: { path: 'buildings/home-village', slug: 'hero_hall' },
  1000072: { path: 'buildings/home-village', slug: 'spell_tower' },
  1000077: { path: 'buildings/home-village', slug: 'monolith' },
  1000084: { path: 'buildings/home-village', slug: 'multi-archer_tower' },
  1000085: { path: 'buildings/home-village', slug: 'ricochet_cannon' },
  1000089: { path: 'buildings/home-village', slug: 'firespitter' },
  1000097: { path: 'buildings/home-village', slug: 'town_hall' },
  1000098: { path: 'buildings/home-village', slug: 'revenge_tower' },

  // Traps
  12000000: { path: 'traps', slug: 'bomb' },
  12000001: { path: 'traps', slug: 'spring_trap' },
  12000002: { path: 'traps', slug: 'giant_bomb' },
  12000005: { path: 'traps', slug: 'air_bomb' },
  12000006: { path: 'traps', slug: 'seeking_air_mine' },
  12000008: { path: 'traps', slug: 'skeleton_trap' },
  12000016: { path: 'traps', slug: 'tornado_trap' },

  // Heroes
  28000000: { path: 'heroes', slug: 'barbarian_king' },
  28000001: { path: 'heroes', slug: 'archer_queen' },
  28000002: { path: 'heroes', slug: 'grand_warden' },
  28000004: { path: 'heroes', slug: 'royal_champion' },
  28000006: { path: 'heroes', slug: 'minion_prince' },
  28000007: { path: 'heroes', slug: 'dragon_duke' },

  // Pets
  73000000: { path: 'pets', slug: 'lassi' },
  73000001: { path: 'pets', slug: 'electro_owl' },
  73000002: { path: 'pets', slug: 'mighty_yak' },
  73000003: { path: 'pets', slug: 'unicorn' },
  73000004: { path: 'pets', slug: 'phoenix' },
  73000007: { path: 'pets', slug: 'poison_lizard' },
  73000008: { path: 'pets', slug: 'diggy' },
  73000009: { path: 'pets', slug: 'frosty' },
  73000010: { path: 'pets', slug: 'spirit_fox' },
  73000011: { path: 'pets', slug: 'angry_jelly' },

  // Builder Base Buildings
  1000040: { path: 'buildings/builder-base', slug: 'builder_hall' },
  1000033: { path: 'buildings/builder-base', slug: 'wall' },
  1000034: { path: 'buildings/builder-base', slug: 'cannon' },
  1000035: { path: 'buildings/builder-base', slug: 'archer_tower' },
  1000036: { path: 'buildings/builder-base', slug: 'double_cannon' },
  1000037: { path: 'buildings/builder-base', slug: 'hidden_tesla' },
  1000038: { path: 'buildings/builder-base', slug: 'firecrackers' },
  1000039: { path: 'buildings/builder-base', slug: 'crusher' },
  1000041: { path: 'buildings/builder-base', slug: 'guard_post' },
  1000042: { path: 'buildings/builder-base', slug: 'army_camp' },
  1000043: { path: 'buildings/builder-base', slug: 'elixir_collector' },
  1000044: { path: 'buildings/builder-base', slug: 'gold_mine' },
  1000045: { path: 'buildings/builder-base', slug: 'elixir_storage' },
  1000046: { path: 'buildings/builder-base', slug: 'gold_storage' },
  1000048: { path: 'buildings/builder-base', slug: 'air_bombs' },
  1000049: { path: 'buildings/builder-base', slug: 'builder_barracks' },
  1000050: { path: 'traps/builder-base', slug: 'push_trap' },
  1000051: { path: 'buildings/builder-base', slug: 'multi_mortar' },
  1000052: { path: 'buildings/builder-base', slug: 'star_laboratory' },
  1000053: { path: 'buildings/builder-base', slug: 'clock_tower' },
  1000054: { path: 'buildings/builder-base', slug: 'roaster' },
  1000055: { path: 'buildings/builder-base', slug: 'giant_cannon' },
  1000056: { path: 'buildings/builder-base', slug: 'mega_tesla' },
  1000057: { path: 'buildings/builder-base', slug: 'gem_mine' },
  1000058: { path: 'buildings/builder-base', slug: 'lava_launcher' },
  1000063: { path: 'buildings/builder-base', slug: 'healing_hut' },
  1000065: { path: 'buildings/builder-base', slug: "otto's_outpost" },
  1000078: { path: 'buildings/builder-base', slug: 'x-bow' },
  1000080: { path: 'buildings/builder-base', slug: 'bob_control' },
  1000082: { path: 'buildings/builder-base', slug: 'army_camp' },

  // Builder Base Traps
  12000010: { path: 'traps/builder-base', slug: 'mine' },
  12000011: { path: 'traps/builder-base', slug: 'mega_mine' },
  12000013: { path: 'traps/builder-base', slug: 'push_trap' },
  12000014: { path: 'traps/builder-base', slug: 'spring_trap' },

  // Builder Base Heroes
  28000003: { path: 'heroes', slug: 'battle_machine' },
  28000005: { path: 'heroes', slug: 'battle_copter' },

  // Builder Base Troops
  4000031: { path: 'troops', slug: 'raged_barbarian' },
  4000032: { path: 'troops', slug: 'sneaky_archer' },
  4000033: { path: 'troops', slug: 'boxer_giant' },
  4000034: { path: 'troops', slug: 'beta_minion' },
  4000035: { path: 'troops', slug: 'bomber' },
  4000036: { path: 'troops', slug: 'baby_dragon' },
  4000037: { path: 'troops', slug: 'cannon_cart' },
  4000038: { path: 'troops', slug: 'night_witch' },
  4000041: { path: 'troops', slug: 'drop_ship' },
  4000042: { path: 'troops', slug: 'power_P.E.K.K.A' },
  4000070: { path: 'troops', slug: 'hog_glider' }
};

export function getEntityById(dataId: number): CatalogEntity | undefined {
  return catalog.entities[dataId] || catalog.entities[String(dataId)];
}

export function getAllEntities(): CatalogEntity[] {
  return Object.values(catalog.entities);
}

export function getEntitiesByVillage(village: 'home' | 'builderBase'): CatalogEntity[] {
  return Object.values(catalog.entities).filter(e => (e.villageType || 'home') === village);
}

export function getEntitiesByCategory(category: EntityCategory, village: 'home' | 'builderBase' = 'home'): CatalogEntity[] {
  return Object.values(catalog.entities).filter(e => e.category === category && (e.villageType || 'home') === village);
}

export function getMaxLevelForTH(dataId: number, hallLevel: number): number {
  const ent = getEntityById(dataId);
  if (!ent) return 0;
  return ent.th_caps[hallLevel] || 0;
}

export function getLevelData(dataId: number, level: number) {
  const ent = getEntityById(dataId);
  if (!ent || !ent.levels) return null;
  return ent.levels[level] || ent.levels[String(level)] || null;
}

export function getResourceAsset(resource: ResourceType | string): string {
  switch (resource) {
    case 'gold':
    case 'builder_gold':
      return '/assets/resources/gold.webp';
    case 'elixir':
    case 'builder_elixir':
      return '/assets/resources/elixir.webp';
    case 'dark_elixir':
      return '/assets/resources/dark_elixir.webp';
    case 'ore_shiny':
      return '/assets/resources/ore_shiny.webp';
    case 'ore_glowy':
      return '/assets/resources/ore_glowy.webp';
    case 'ore_starry':
      return '/assets/resources/ore_starry.webp';
    default:
      return '/assets/resources/gold.webp';
  }
}

export function getTownHallAsset(level: number): string {
  const clamped = Math.max(1, Math.min(18, level || 1));
  return `/assets/townhalls/th_${clamped}.webp`;
}

export function getBuilderHallAsset(level: number): string {
  const clamped = Math.max(1, Math.min(10, level || 1));
  return `https://assets.clashk.ing/buildings/builder-base/builder_hall/level_${clamped}.webp`;
}

export function getBuilderAsset(slotType: 'builder' | 'lab' | 'pet', slotNumber?: number, isHelper?: boolean, village: 'home' | 'builderBase' = 'home'): string {
  if (slotType === 'lab') return '/assets/builders/lab.webp';
  if (slotType === 'pet') return '/assets/builders/pet.webp';
  if (isHelper) return '/assets/builders/goblin_builder.webp';
  if (village === 'builderBase') {
    if (slotNumber === 2) return 'https://assets.clashk.ing/buildings/builder-base/bob_control/level_1.webp';
    return '/assets/builders/master_builder.webp';
  }
  if (slotNumber === 6) return '/assets/builders/master_builder.webp';
  return '/assets/builders/builder_head.webp';
}

export function getCategoryAsset(category: EntityCategory): string {
  switch (category) {
    case 'defense':
      return '/assets/categories/tab_defense.webp';
    case 'offense':
      return '/assets/categories/tab_offense.webp';
    case 'heroes':
      return '/assets/categories/tab_heroes.webp';
    case 'walls':
      return '/assets/categories/tab_walls.webp';
    case 'resources':
      return '/assets/categories/tab_resources.webp';
    default:
      return '/assets/categories/tab_defense.webp';
  }
}

export function getEntityAsset(dataId: number, level: number): string {
  const meta = entitySlugMap[dataId];
  if (meta) {
    if (meta.path === 'heroes') {
      return `https://assets.clashk.ing/heroes/${meta.slug}/icon.webp`;
    }
    if (meta.path === 'pets') {
      return `https://assets.clashk.ing/pets/${meta.slug}/icon.webp`;
    }
    if (meta.path === 'troops') {
      return `https://assets.clashk.ing/troops/${meta.slug}/icon.webp`;
    }
    if (meta.path === 'buildings/home-village') {
      return `https://assets.clashk.ing/buildings/home-village/${meta.slug}/level_${level}.webp`;
    }
    if (meta.path === 'buildings/builder-base') {
      const clamped = Math.min(10, Math.max(1, level));
      return `https://assets.clashk.ing/buildings/builder-base/${meta.slug}/level_${clamped}.webp`;
    }
    if (meta.path === 'traps/builder-base') {
      const clamped = Math.min(10, Math.max(1, level));
      return `https://assets.clashk.ing/traps/builder-base/${meta.slug}/level_${clamped}.webp`;
    }
    if (meta.path === 'traps') {
      return `https://assets.clashk.ing/traps/${meta.slug}/level_${level}.webp`;
    }
  }
  // Local fallback
  return `/assets/game/${dataId}_${level}.webp`;
}

export function formatDuration(seconds: number): string {
  if (seconds <= 0) return 'Fertig';
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  if (d > 0) {
    return `${d}d ${h.toString().padStart(2, '0')}h ${m.toString().padStart(2, '0')}m`;
  }
  if (h > 0) {
    return `${h}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`;
  }
  return `${m}m ${s.toString().padStart(2, '0')}s`;
}

export function formatCost(cost: number): string {
  if (cost >= 1000000) {
    return `${(cost / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
  }
  if (cost >= 1000) {
    return `${(cost / 1000).toFixed(0)}k`;
  }
  return cost.toLocaleString();
}
