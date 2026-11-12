import React, { useState } from 'react';
import type { VillageEntity, ActiveTimer } from '../db/db';
import type { EntityCategory, CatalogEntity } from '../types';
import {
  catalog,
  getEntityAsset,
  getCategoryAsset,
  getResourceAsset,
  getMaxLevelForTH,
  getLevelData,
  formatCost,
  formatDuration
} from '../services/catalog';
import { Shield, Swords, Crown, Blocks, Database, FlaskConical, Check, ArrowUpRight, Search } from 'lucide-react';

interface VillageCatalogProps {
  entities: VillageEntity[];
  townHallLevel: number;
  activeTimers: ActiveTimer[];
  onStartManualUpgrade: (entity: CatalogEntity, targetLevel: number) => void;
  onSetEntityLevel: (dataId: number, newLevel: number) => void;
  isHammerJamActive: boolean;
}

export const VillageCatalog: React.FC<VillageCatalogProps> = ({
  entities,
  townHallLevel,
  activeTimers,
  onStartManualUpgrade,
  onSetEntityLevel,
  isHammerJamActive
}) => {
  const [activeTab, setActiveTab] = useState<EntityCategory>('defense');
  const [searchQuery, setSearchQuery] = useState('');

  const entityMap = new Map<number, VillageEntity>();
  for (const ent of entities) {
    entityMap.set(ent.dataId, ent);
  }

  const ongoingUpgradeIds = new Set(activeTimers.map(t => t.entityId));

  const tabs: Array<{ key: EntityCategory; label: string; icon: React.ReactNode; asset: string }> = [
    { key: 'defense', label: 'Verteidigung', icon: <Shield className="w-4 h-4" />, asset: getCategoryAsset('defense') },
    { key: 'offense', label: 'Offensive', icon: <Swords className="w-4 h-4" />, asset: getCategoryAsset('offense') },
    { key: 'heroes', label: 'Helden', icon: <Crown className="w-4 h-4" />, asset: getCategoryAsset('heroes') },
    { key: 'walls', label: 'Mauern', icon: <Blocks className="w-4 h-4" />, asset: getCategoryAsset('walls') },
    { key: 'resources', label: 'Ressourcen', icon: <Database className="w-4 h-4" />, asset: getCategoryAsset('resources') },
    { key: 'lab', label: 'Labor', icon: <FlaskConical className="w-4 h-4" />, asset: '/assets/builders/lab.webp' }
  ];

  const filteredEntities = Object.values(catalog.entities).filter(ent => {
    if (ent.category !== activeTab) return false;
    if (searchQuery.trim()) {
      return ent.name.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  return (
    <section className="my-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 px-1">
        <div>
          <h2 className="text-base sm:text-lg font-black tracking-wide uppercase text-slate-200">
            Katalog & Dorf-Übersicht
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Stufen, Max-Caps und Upgrades für Rathaus {townHallLevel}
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Gebäude oder Truppe suchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar px-1">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === tab.key
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <img
              src={tab.asset}
              alt={tab.label}
              className="w-5 h-5 object-contain"
            />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Entity Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 mt-4">
        {filteredEntities.map(ent => {
          const userEnt = entityMap.get(ent.id);
          const currentLevel = userEnt ? userEnt.level : 0;
          const maxLevel = getMaxLevelForTH(ent.id, townHallLevel);
          const isMaxed = currentLevel >= maxLevel && maxLevel > 0;
          const isUpgrading = ongoingUpgradeIds.has(ent.id);
          const targetLevel = currentLevel + 1;
          const nextLevelData = getLevelData(ent.id, targetLevel);

          const cost = nextLevelData ? (isHammerJamActive ? Math.round(nextLevelData.cost * 0.5) : nextLevelData.cost) : 0;
          const duration = nextLevelData?.duration || 0;
          const resource = nextLevelData?.resource || ent.resource;

          return (
            <div
              key={ent.id}
              className={`bg-slate-900/80 border rounded-2xl p-4 flex flex-col justify-between shadow-md transition-all ${
                isMaxed
                  ? 'border-emerald-500/30 bg-emerald-950/10'
                  : isUpgrading
                  ? 'border-amber-500/40 bg-amber-950/10'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={getEntityAsset(ent.id, currentLevel || 1)}
                        alt={ent.name}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/assets/categories/tab_defense.webp';
                        }}
                        className="w-12 h-12 object-contain rounded-xl bg-slate-800 p-1 border border-slate-700 shadow"
                      />
                      <span className="absolute -bottom-1 -right-1 bg-slate-950 text-[10px] font-black text-amber-400 px-1.5 py-0.2 rounded border border-slate-700 shadow">
                        L{currentLevel}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-100">{ent.name}</h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-slate-400 font-mono">
                          Stufe {currentLevel} / {maxLevel}
                        </span>
                        {userEnt?.count && userEnt.count > 1 && (
                          <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded font-mono">
                            {userEnt.count}x
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Status Badges */}
                  <div>
                    {isMaxed ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                        <Check className="w-3 h-3" />
                        Max TH{townHallLevel}
                      </span>
                    ) : isUpgrading ? (
                      <span className="text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full animate-pulse">
                        Wird aufgewertet
                      </span>
                    ) : null}
                  </div>
                </div>

                {/* Next Level Info (if not maxed) */}
                {!isMaxed && nextLevelData && (
                  <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 font-mono">
                      <div className="flex items-center gap-1 text-slate-200">
                        <img
                          src={getResourceAsset(resource)}
                          alt={resource}
                          className="w-3.5 h-3.5 object-contain"
                        />
                        <span>{formatCost(cost)}</span>
                      </div>
                      <span className="text-slate-600">•</span>
                      <span className="text-slate-400">{formatDuration(duration)}</span>
                    </div>
                    <span className="text-amber-400 font-bold text-[11px]">
                      ➔ L{targetLevel}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-2 border-t border-slate-800/50 flex items-center justify-between gap-2">
                {/* Level Stepper */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onSetEntityLevel(ent.id, Math.max(0, currentLevel - 1))}
                    disabled={currentLevel <= 0}
                    className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-xs font-bold text-slate-300 flex items-center justify-center transition-colors"
                  >
                    -
                  </button>
                  <span className="w-7 text-center font-mono text-xs font-bold text-slate-300">
                    {currentLevel}
                  </span>
                  <button
                    onClick={() => onSetEntityLevel(ent.id, Math.min(maxLevel || 30, currentLevel + 1))}
                    disabled={isMaxed}
                    className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-xs font-bold text-slate-300 flex items-center justify-center transition-colors"
                  >
                    +
                  </button>
                </div>

                {/* Upgrade Button */}
                {!isMaxed && (
                  <button
                    onClick={() => onStartManualUpgrade(ent, targetLevel)}
                    disabled={isUpgrading}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      isUpgrading
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-sm shadow-amber-500/20 active:scale-95'
                    }`}
                  >
                    <span>{isUpgrading ? 'Aktiv' : 'Upgrade starten'}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
