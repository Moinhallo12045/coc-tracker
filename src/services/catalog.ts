import catalogRaw from '../data/catalog.json';
import type { CatalogData, CatalogEntity, EntityCategory, ResourceType } from '../types';

export const catalog: CatalogData = catalogRaw as unknown as CatalogData;

export function getEntityById(dataId: number): CatalogEntity | undefined {
  return catalog.entities[dataId] || catalog.entities[String(dataId)];
}

export function getAllEntities(): CatalogEntity[] {
  return Object.values(catalog.entities);
}

export function getEntitiesByCategory(category: EntityCategory): CatalogEntity[] {
  return Object.values(catalog.entities).filter(e => e.category === category);
}

export function getMaxLevelForTH(dataId: number, townHallLevel: number): number {
  const ent = getEntityById(dataId);
  if (!ent) return 0;
  return ent.th_caps[townHallLevel] || 0;
}

export function getLevelData(dataId: number, level: number) {
  const ent = getEntityById(dataId);
  if (!ent || !ent.levels) return null;
  return ent.levels[level] || ent.levels[String(level)] || null;
}

export function getResourceAsset(resource: ResourceType | string): string {
  switch (resource) {
    case 'gold':
      return '/assets/resources/gold.webp';
    case 'elixir':
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
  const clamped = Math.max(1, Math.min(19, level || 1));
  return `/assets/townhalls/th_${clamped}.webp`;
}

export function getBuilderAsset(slotType: 'builder' | 'lab' | 'pet', slotNumber?: number, isHelper?: boolean): string {
  if (slotType === 'lab') return '/assets/builders/lab.webp';
  if (slotType === 'pet') return '/assets/builders/pet.webp';
  if (isHelper) return '/assets/builders/goblin_builder.webp';
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
