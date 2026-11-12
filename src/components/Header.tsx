import React from 'react';
import type { AccountProfile, GlobalEvent } from '../db/db';
import { getTownHallAsset } from '../services/catalog';
import { Users, Upload, Zap, ChevronDown, Plus } from 'lucide-react';

interface HeaderProps {
  currentAccount: AccountProfile | null;
  progressPercent: number;
  activeEvents: GlobalEvent[];
  onOpenAccountModal: () => void;
  onOpenImportModal: () => void;
  onToggleHammerJam: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentAccount,
  progressPercent,
  activeEvents,
  onOpenAccountModal,
  onOpenImportModal,
  onToggleHammerJam
}) => {
  const isHammerJamActive = activeEvents.some(
    e => e.isActive && (e.discountCost > 0 || e.name.toLowerCase().includes('hammer jam'))
  );

  const thLevel = currentAccount?.townHallLevel || 16;
  const thAsset = getTownHallAsset(thLevel);

  return (
    <header className="sticky top-0 z-40 bg-[#0F172A]/90 backdrop-blur-md border-b border-slate-800 safe-area-top shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Left: Account & Townhall Info */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="relative group cursor-pointer" onClick={onOpenAccountModal}>
            <img
              src={thAsset}
              alt={`Town Hall ${thLevel}`}
              className="w-12 h-12 object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)] transition-transform group-hover:scale-105"
            />
            <span className="absolute -bottom-1 -right-1 bg-amber-500 text-slate-950 font-black text-[10px] px-1.5 py-0.2 rounded-full shadow">
              {thLevel}
            </span>
          </div>

          <div className="flex flex-col">
            <button
              onClick={onOpenAccountModal}
              className="flex items-center gap-1.5 text-left font-bold text-slate-100 hover:text-amber-400 transition-colors"
            >
              <span className="truncate max-w-[160px] sm:max-w-[220px]">
                {currentAccount ? currentAccount.name : 'Kein Account gewählt'}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                ({currentAccount?.tag || '#NEW'})
              </span>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[11px] font-semibold text-slate-400">
                Progress TH{thLevel}:
              </span>
              <div className="w-24 sm:w-32 bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
                <div
                  className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
                />
              </div>
              <span className="text-[11px] font-bold text-emerald-400 font-mono">
                {progressPercent.toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Quick Add Account button on mobile */}
          <div className="md:hidden flex items-center gap-1">
            <button
              onClick={onOpenImportModal}
              title="JSON Import"
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs"
            >
              <Upload className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right: Actions, Hammer Jam & Multi-Account Switcher */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          {/* Hammer Jam Toggle Button */}
          <button
            onClick={onToggleHammerJam}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm ${
              isHammerJamActive
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-amber-500/20 shadow-lg scale-102 ring-1 ring-amber-300'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-700 border border-slate-700'
            }`}
          >
            <Zap className={`w-3.5 h-3.5 ${isHammerJamActive ? 'fill-slate-950 text-slate-950' : 'text-slate-400'}`} />
            <span>Hammer Jam: {isHammerJamActive ? '50% ⚡ Aktiv' : 'Inaktiv'}</span>
          </button>

          {/* Import JSON button */}
          <button
            onClick={onOpenImportModal}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            <Upload className="w-3.5 h-3.5 text-blue-400" />
            <span>JSON Import</span>
          </button>

          {/* Accounts Switcher / Add Account */}
          <button
            onClick={onOpenAccountModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-600/80 hover:bg-indigo-600 text-white shadow-sm transition-colors border border-indigo-500/30"
          >
            <Users className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Accounts</span>
            <Plus className="w-3 h-3 ml-0.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
