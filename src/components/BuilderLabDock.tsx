import React from 'react';
import type { ActiveTimer } from '../db/db';
import {
  getEntityById,
  getEntityAsset,
  getBuilderAsset,
  formatDuration,
  getLevelData
} from '../services/catalog';
import confetti from 'canvas-confetti';
import { Check, X, Hammer, Clock, Sparkles } from 'lucide-react';

interface BuilderLabDockProps {
  timers: ActiveTimer[];
  currentTimestamp: number;
  maxBuilders: number;
  village?: 'home' | 'builderBase';
  onFinishTimer: (timer: ActiveTimer) => void;
  onCancelTimer: (timerId: string) => void;
  onSelectFreeSlot?: (slotType: 'builder' | 'lab' | 'pet') => void;
}

export const BuilderLabDock: React.FC<BuilderLabDockProps> = ({
  timers,
  currentTimestamp,
  maxBuilders,
  village = 'home',
  onFinishTimer,
  onCancelTimer,
  onSelectFreeSlot
}) => {
  const triggerConfetti = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { x, y },
      colors: ['#F59E0B', '#10B981', '#3B82F6', '#EC4899']
    });
  };

  const isBB = village === 'builderBase';

  // Filter timers for active village
  const villageTimers = timers.filter(t => (t.villageType || 'home') === village);
  const builderTimers = villageTimers.filter(t => t.slotType === 'builder');
  const labTimer = villageTimers.find(t => t.slotType === 'lab');
  const petTimer = isBB ? undefined : villageTimers.find(t => t.slotType === 'pet');

  // Generate builder slots array
  const totalBuilders = isBB ? 2 : Math.max(2, Math.min(6, maxBuilders || 6));
  const builderSlots = [];

  for (let slotNum = 1; slotNum <= totalBuilders; slotNum++) {
    const activeTimer = builderTimers.find(t => t.slotNumber === slotNum) || builderTimers[slotNum - 1];
    builderSlots.push({
      slotNumber: slotNum,
      slotType: 'builder' as const,
      isMasterBuilder: isBB ? slotNum === 1 : slotNum === 6,
      timer: activeTimer
    });
  }

  const renderSlotCard = (
    title: string,
    slotIcon: string,
    timer: ActiveTimer | undefined,
    slotType: 'builder' | 'lab' | 'pet',
    badgeText?: string
  ) => {
    if (!timer) {
      // Empty / Free slot card
      return (
        <div
          onClick={() => onSelectFreeSlot && onSelectFreeSlot(slotType)}
          className="snap-start shrink-0 w-[260px] sm:w-[280px] bg-slate-900/60 hover:bg-slate-900/90 border border-dashed border-slate-700/80 hover:border-amber-500/50 rounded-2xl p-4 flex flex-col justify-between transition-all duration-200 cursor-pointer group shadow-inner"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img
                src={slotIcon}
                alt={title}
                className="w-7 h-7 object-contain opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-transform"
              />
              <span className="text-xs font-bold text-slate-400 group-hover:text-slate-200">
                {title}
              </span>
            </div>
            {badgeText && (
              <span className="text-[10px] font-semibold bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full border border-slate-700">
                {badgeText}
              </span>
            )}
          </div>

          <div className="my-5 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-full bg-slate-800/80 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500/20 group-hover:scale-105 transition-all mb-2">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div className="text-sm font-bold text-emerald-400">Freier Slot</div>
            <div className="text-xs text-slate-400 mt-0.5">Bereit für neues Upgrade</div>
          </div>

          <div className="w-full py-1.5 px-3 rounded-lg bg-slate-800/80 group-hover:bg-amber-500/20 text-center text-xs font-semibold text-slate-300 group-hover:text-amber-300 border border-slate-700/60 group-hover:border-amber-500/30 transition-colors">
            + Upgrade wählen
          </div>
        </div>
      );
    }

    // Active Timer Card
    const entity = getEntityById(timer.entityId);
    const entityName = entity ? entity.name : `Gebäude #${timer.entityId}`;
    const entityAsset = getEntityAsset(timer.entityId, timer.targetLevel);

    const remainingMs = Math.max(0, timer.endsAt - currentTimestamp);
    const remainingSec = Math.floor(remainingMs / 1000);
    const isCompleted = remainingSec <= 0;

    // Total duration calculation
    const lvlData = getLevelData(timer.entityId, timer.targetLevel);
    const totalDurationSec = lvlData?.duration || 86400;
    const elapsedSec = Math.max(0, totalDurationSec - remainingSec);
    const progressPercent = Math.min(100, Math.max(0, (elapsedSec / totalDurationSec) * 100));

    return (
      <div className="snap-start shrink-0 w-[260px] sm:w-[280px] bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-700/80 hover:border-slate-600 rounded-2xl p-4 flex flex-col justify-between shadow-xl backdrop-blur-sm relative overflow-hidden group">
        {/* Glow accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-indigo-500 to-pink-500" />

        {/* Top bar */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <img
              src={slotIcon}
              alt={title}
              className="w-7 h-7 object-contain drop-shadow"
            />
            <span className="text-xs font-bold text-slate-300">
              {title}
            </span>
          </div>
          <button
            onClick={() => onCancelTimer(timer.id)}
            title="Timer abbrechen"
            className="text-slate-500 hover:text-red-400 p-1 rounded-md hover:bg-slate-800 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Entity details & icon */}
        <div className="flex items-center gap-3 my-2">
          <div className="relative shrink-0">
            <img
              src={entityAsset}
              alt={entityName}
              onError={(e) => {
                // Fallback to generic icon if specific level image not rendered
                (e.target as HTMLImageElement).src = '/assets/categories/tab_defense.webp';
              }}
              className="w-14 h-14 object-contain rounded-xl bg-slate-800/80 p-1 border border-slate-700 shadow-md group-hover:scale-105 transition-transform"
            />
            <span className="absolute -bottom-1 -right-1 bg-indigo-600 text-[10px] font-black text-white px-1.5 py-0.2 rounded-md border border-indigo-400 shadow">
              L{timer.targetLevel}
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="text-sm font-bold text-slate-100 truncate">
              {entityName}
            </div>
            <div className="text-xs font-semibold text-amber-400 flex items-center gap-1 mt-0.5">
              <span>➔ Stufe {timer.targetLevel}</span>
            </div>
            <div className="flex items-center gap-1 text-xs font-mono text-slate-300 mt-1">
              <Clock className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span className={isCompleted ? 'text-emerald-400 font-bold' : ''}>
                {isCompleted ? 'Bereit zum Abschluss!' : formatDuration(remainingSec)}
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-3">
          <div className="flex justify-between items-center text-[11px] mb-1">
            <span className="text-slate-400 font-medium">Fortschritt</span>
            <span className="font-mono font-bold text-amber-400">
              {progressPercent.toFixed(0)}%
            </span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-750">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isCompleted
                  ? 'bg-emerald-400 animate-pulse'
                  : 'bg-gradient-to-r from-amber-500 to-indigo-500'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
          <button
            onClick={(e) => {
              triggerConfetti(e);
              onFinishTimer(timer);
            }}
            className={`w-full py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              isCompleted
                ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700'
            }`}
          >
            <Check className="w-3.5 h-3.5" />
            <span>{isCompleted ? 'Einsammeln & Erhöhen' : 'Sofort abschließen'}</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <section className="my-6">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <Hammer className="w-5 h-5 text-amber-400" />
          <h2 className="text-base sm:text-lg font-black tracking-wide uppercase text-slate-200">
            {isBB ? 'Bauarbeiterbasis Bauhütten & Sternenlabor' : 'Bauarbeiter & Labor Dock'}
          </h2>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
            {villageTimers.length} aktiv
          </span>
        </div>
        <div className="text-xs text-slate-400 hidden sm:block">
          Horizontal scrollbar • Live Sekunden-Counter
        </div>
      </div>

      {/* Snap Carousel */}
      <div className="flex gap-3.5 overflow-x-auto pb-4 pt-1 snap-x-mandatory no-scrollbar px-1">
        {/* Builder Slots */}
        {builderSlots.map(slot => {
          let slotName = `Builder #${slot.slotNumber}`;
          let badge: string | undefined = undefined;

          if (isBB) {
            if (slot.slotNumber === 1) {
              slotName = 'Meisterbauarbeiter';
              badge = 'Meister';
            } else {
              slotName = 'B.O.B';
              badge = 'Roboter';
            }
          } else if (slot.isMasterBuilder) {
            slotName = 'B.O.B #6';
            badge = 'Master Builder';
          }

          return renderSlotCard(
            slotName,
            getBuilderAsset('builder', slot.slotNumber, false, village),
            slot.timer,
            'builder',
            badge
          );
        })}

        {/* Laboratory Slot */}
        {renderSlotCard(
          isBB ? 'Sternenlabor' : 'Laboratorium',
          getBuilderAsset('lab', undefined, false, village),
          labTimer,
          'lab',
          isBB ? 'BB Truppen' : 'Forschung'
        )}

        {/* Pet House Slot (Home Village only) */}
        {!isBB && renderSlotCard('Haustierhaus', getBuilderAsset('pet'), petTimer, 'pet', 'Pets')}
      </div>
    </section>
  );
};
