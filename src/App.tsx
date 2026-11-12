import { useEffect, useState, useMemo, useCallback } from 'react';
import { db, type AccountProfile, type VillageEntity, type ActiveTimer, type GlobalEvent } from './db/db';
import { useTimerWorker } from './hooks/useTimerWorker';
import { Header } from './components/Header';
import { BuilderLabDock } from './components/BuilderLabDock';
import { SmartRecommendations } from './components/SmartRecommendations';
import { VillageCatalog } from './components/VillageCatalog';
import { AccountModal } from './components/AccountModal';
import { JsonImportModal } from './components/JsonImportModal';
import { calculateRecommendationScores, startUpgradeTimer } from './services/recommendation';
import { parseAndIngestClashNinjaJson, getSampleClashNinjaJson, type ParseResult } from './services/parser';
import { catalog, getMaxLevelForTH } from './services/catalog';
import type { CatalogEntity, RecommendationScore } from './types';
import confetti from 'canvas-confetti';

export function App() {
  const currentTimestamp = useTimerWorker();

  const [accounts, setAccounts] = useState<AccountProfile[]>([]);
  const [currentAccount, setCurrentAccount] = useState<AccountProfile | null>(null);
  const [entities, setEntities] = useState<VillageEntity[]>([]);
  const [timers, setTimers] = useState<ActiveTimer[]>([]);
  const [events, setEvents] = useState<GlobalEvent[]>([]);

  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [bannerMessage, setBannerMessage] = useState<string | null>(null);

  // Load database state
  const refreshDbState = useCallback(async () => {
    const allAccounts = await db.accounts.toArray();
    setAccounts(allAccounts);

    let active = allAccounts.find(a => a.isActive);

    // If no accounts exist yet, seed initial mock data from sample JSON
    if (allAccounts.length === 0) {
      const sample = getSampleClashNinjaJson();
      const res = await parseAndIngestClashNinjaJson(sample);
      active = res.account;
      const refreshedAccounts = await db.accounts.toArray();
      setAccounts(refreshedAccounts);
    } else if (!active && allAccounts.length > 0) {
      active = allAccounts[0];
      await db.accounts.update(active.tag, { isActive: true });
    }

    setCurrentAccount(active || null);

    if (active) {
      const currentEntities = await db.entities.where('accountTag').equals(active.tag).toArray();
      const currentTimers = await db.timers.where('accountTag').equals(active.tag).toArray();
      setEntities(currentEntities);
      setTimers(currentTimers);
    } else {
      setEntities([]);
      setTimers([]);
    }

    // Load or initialize Hammer Jam global event
    let allEvents = await db.events.toArray();
    if (allEvents.length === 0) {
      const initialHammerJam: GlobalEvent = {
        id: 'hammer-jam-2026',
        name: 'Hammer Jam',
        discountCost: 0.5,
        discountTime: 1.0,
        category: 'all',
        startsAt: Date.now() - 86400000,
        endsAt: Date.now() + 86400000 * 14,
        isActive: true
      };
      await db.events.add(initialHammerJam);
      allEvents = [initialHammerJam];
    }
    setEvents(allEvents);
  }, []);

  useEffect(() => {
    refreshDbState();
  }, [refreshDbState]);

  // Check if Hammer Jam is active
  const isHammerJamActive = useMemo(() => {
    return events.some(e => e.isActive && (e.discountCost > 0 || e.name.toLowerCase().includes('hammer jam')));
  }, [events]);

  // Calculate TH Progress %
  const progressPercent = useMemo(() => {
    if (!currentAccount) return 0;
    const th = currentAccount.townHallLevel;
    let totalMaxLevels = 0;
    let totalCurrentLevels = 0;

    const entityMap = new Map<number, VillageEntity>();
    for (const e of entities) {
      entityMap.set(e.dataId, e);
    }

    for (const ent of Object.values(catalog.entities)) {
      const maxLvl = getMaxLevelForTH(ent.id, th);
      if (maxLvl > 0) {
        totalMaxLevels += maxLvl;
        const current = entityMap.get(ent.id)?.level || 0;
        totalCurrentLevels += Math.min(current, maxLvl);
      }
    }

    if (totalMaxLevels === 0) return 100;
    return Math.min(100, (totalCurrentLevels / totalMaxLevels) * 100);
  }, [currentAccount, entities]);

  // Calculate Smart Recommendations
  const recommendations = useMemo(() => {
    if (!currentAccount) return [];
    return calculateRecommendationScores({
      accountTag: currentAccount.tag,
      townHallLevel: currentAccount.townHallLevel,
      activeTimers: timers,
      entities,
      activeEvents: events
    });
  }, [currentAccount, timers, entities, events]);

  // Trigger mobile haptic feedback if supported
  const triggerHaptics = () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([40, 60, 40]);
      } catch {
        // ignore
      }
    }
  };

  // Actions
  const handleSelectAccount = async (tag: string) => {
    await db.transaction('rw', db.accounts, async () => {
      await db.accounts.toCollection().modify({ isActive: false });
      await db.accounts.update(tag, { isActive: true });
    });
    triggerHaptics();
    await refreshDbState();
  };

  const handleAddAccount = async (newAcc: { name: string; tag: string; townHallLevel: number }) => {
    await db.transaction('rw', db.accounts, async () => {
      await db.accounts.toCollection().modify({ isActive: false });
      await db.accounts.add({
        tag: newAcc.tag,
        name: newAcc.name,
        townHallLevel: newAcc.townHallLevel,
        lastSyncTimestamp: Date.now(),
        isActive: true
      });
    });
    triggerHaptics();
    await refreshDbState();
  };

  const handleDeleteAccount = async (tag: string) => {
    await db.transaction('rw', db.accounts, db.entities, db.timers, async () => {
      await db.accounts.delete(tag);
      await db.entities.where('accountTag').equals(tag).delete();
      await db.timers.where('accountTag').equals(tag).delete();

      const remaining = await db.accounts.toArray();
      if (remaining.length > 0) {
        await db.accounts.update(remaining[0].tag, { isActive: true });
      }
    });
    triggerHaptics();
    await refreshDbState();
  };

  const handleToggleHammerJam = async () => {
    const hj = events.find(e => e.name.toLowerCase().includes('hammer jam'));
    if (hj) {
      await db.events.update(hj.id, { isActive: !hj.isActive });
    }
    triggerHaptics();
    await refreshDbState();
  };

  const handleStartUpgrade = async (rec: RecommendationScore) => {
    if (!currentAccount) return;
    await startUpgradeTimer(currentAccount.tag, rec);
    triggerHaptics();
    setBannerMessage(`Upgrade für ${rec.entityName} (➔ L${rec.targetLevel}) gestartet!`);
    setTimeout(() => setBannerMessage(null), 3500);
    await refreshDbState();
  };

  const handleStartManualUpgrade = async (entity: CatalogEntity, targetLevel: number) => {
    if (!currentAccount) return;
    const isLab = entity.category === 'lab';
    const isPet = entity.category === 'pets';
    const slotType = isLab ? 'lab' : (isPet ? 'pet' : 'builder');

    const lvlData = entity.levels[targetLevel];
    const duration = lvlData?.duration || 86400;

    await db.timers.add({
      id: crypto.randomUUID(),
      accountTag: currentAccount.tag,
      entityId: entity.id,
      targetLevel,
      endsAt: Date.now() + duration * 1000,
      slotType,
      isRecurrentHelper: false
    });

    triggerHaptics();
    setBannerMessage(`Upgrade für ${entity.name} gestartet!`);
    setTimeout(() => setBannerMessage(null), 3500);
    await refreshDbState();
  };

  const handleSetEntityLevel = async (dataId: number, newLevel: number) => {
    if (!currentAccount) return;
    const existing = entities.find(e => e.dataId === dataId);
    if (existing) {
      await db.entities.update(existing.id, { level: newLevel });
    } else {
      await db.entities.add({
        id: `${currentAccount.tag}_${dataId}`,
        accountTag: currentAccount.tag,
        dataId,
        level: newLevel,
        count: 1
      });
    }
    triggerHaptics();
    await refreshDbState();
  };

  const handleFinishTimer = async (timer: ActiveTimer) => {
    if (!currentAccount) return;

    await db.transaction('rw', db.entities, db.timers, async () => {
      // Update entity level
      const existing = entities.find(e => e.dataId === timer.entityId);
      if (existing) {
        await db.entities.update(existing.id, { level: timer.targetLevel });
      } else {
        await db.entities.add({
          id: `${currentAccount.tag}_${timer.entityId}`,
          accountTag: currentAccount.tag,
          dataId: timer.entityId,
          level: timer.targetLevel,
          count: 1
        });
      }
      // Remove timer
      await db.timers.delete(timer.id);
    });

    triggerHaptics();
    setBannerMessage(`Stufe ${timer.targetLevel} erfolgreich abgeschlossen! 🎉`);
    setTimeout(() => setBannerMessage(null), 3500);
    await refreshDbState();
  };

  const handleCancelTimer = async (timerId: string) => {
    await db.timers.delete(timerId);
    triggerHaptics();
    await refreshDbState();
  };

  const handleImportSuccess = (result: ParseResult) => {
    triggerHaptics();
    confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
    setBannerMessage(
      `Sync erfolgreich: ${result.entityCount} Gebäude & ${result.activeTimersCount} aktive Timer importiert (Δt: ${result.deltaSeconds}s).`
    );
    setTimeout(() => setBannerMessage(null), 4500);
    refreshDbState();
  };

  const maxBuilders = currentAccount ? (catalog.townhalls[currentAccount.townHallLevel]?.max_builder_count || 6) : 6;

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950">
      {/* Header */}
      <Header
        currentAccount={currentAccount}
        progressPercent={progressPercent}
        activeEvents={events}
        onOpenAccountModal={() => setIsAccountModalOpen(true)}
        onOpenImportModal={() => setIsImportModalOpen(true)}
        onToggleHammerJam={handleToggleHammerJam}
      />

      {/* Toast Notification Banner */}
      {bannerMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs px-4 py-2 rounded-full shadow-2xl animate-bounce">
          {bannerMessage}
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-4 safe-area-bottom">
        {/* Builder & Lab Dock */}
        <BuilderLabDock
          timers={timers}
          currentTimestamp={currentTimestamp}
          maxBuilders={maxBuilders}
          onFinishTimer={handleFinishTimer}
          onCancelTimer={handleCancelTimer}
          onSelectFreeSlot={() => {
            // Scroll smoothly down to recommendations
            window.scrollTo({ top: 320, behavior: 'smooth' });
          }}
        />

        {/* Smart Recommendations */}
        <SmartRecommendations
          recommendations={recommendations}
          onStartUpgrade={handleStartUpgrade}
          isHammerJamActive={isHammerJamActive}
        />

        {/* Village Catalog & Overview */}
        <VillageCatalog
          entities={entities}
          townHallLevel={currentAccount?.townHallLevel || 16}
          activeTimers={timers}
          onStartManualUpgrade={handleStartManualUpgrade}
          onSetEntityLevel={handleSetEntityLevel}
          isHammerJamActive={isHammerJamActive}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/60 py-4 px-4 text-center text-xs text-slate-500 safe-area-bottom">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            Clash Upgrade Tracker PWA • 100% Offline-fähig • Lokale Dexie.js DB
          </div>
          <div className="text-[11px] text-slate-600">
            Skaliert von TH1 bis TH19 • F2P Stagger & Anti-Cap Algorithmus
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AccountModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        accounts={accounts}
        currentAccount={currentAccount}
        onSelectAccount={handleSelectAccount}
        onAddAccount={handleAddAccount}
        onDeleteAccount={handleDeleteAccount}
      />

      <JsonImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={handleImportSuccess}
      />
    </div>
  );
}

export default App;
