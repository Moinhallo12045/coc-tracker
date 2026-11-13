export type ResourceType = 'gold' | 'elixir' | 'dark_elixir' | 'ore_shiny' | 'ore_glowy' | 'ore_starry' | 'builder_gold' | 'builder_elixir';

export type EntityCategory = 'defense' | 'offense' | 'resources' | 'heroes' | 'walls' | 'lab' | 'pets';

export type VillageMode = 'home' | 'builderBase';

export interface EntityLevelData {
  cost: number;
  duration: number; // in seconds
  resource?: ResourceType;
}

export interface CatalogEntity {
  id: number;
  name: string;
  villageType: VillageMode;
  category: EntityCategory;
  resource: ResourceType;
  maxCounts?: Record<number, number>; // hallLevel -> max count
  th_caps: Record<string | number, number>; // hallLevel -> max level
  levels: Record<string | number, EntityLevelData>;
}

export interface TownHallCapData {
  max_walls: number;
  giga_weapon_levels?: number;
  max_builder_count: number;
}

export interface CatalogData {
  townhalls: Record<string | number, TownHallCapData>;
  builderhalls: Record<string | number, TownHallCapData>;
  entities: Record<string | number, CatalogEntity>;
}

export interface RecommendationScore {
  entityId: number;
  entityName: string;
  category: EntityCategory;
  resource: ResourceType;
  currentLevel: number;
  targetLevel: number;
  cost: number;
  originalCost: number;
  duration: number; // in seconds
  finalScore: number;
  staggerScore: number;
  resourceScore: number;
  offenseScore: number;
  idleScore: number;
  staggerGapHours: number;
  tags: string[];
  reasons: string[];
}

export interface CountdownTickMessage {
  type: 'TICK';
  timestamp: number;
}

export interface CountdownState {
  remainingSeconds: number;
  formatted: string;
  progressPercent: number;
  isCompleted: boolean;
}
