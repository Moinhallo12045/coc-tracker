import React, { useState } from 'react';
import type { RecommendationScore } from '../types';
import {
  getEntityAsset,
  getResourceAsset,
  formatDuration,
  formatCost
} from '../services/catalog';
import { Sparkles, Star, Clock, Info, CheckCircle2, ChevronRight } from 'lucide-react';

interface SmartRecommendationsProps {
  recommendations: RecommendationScore[];
  onStartUpgrade: (rec: RecommendationScore) => void;
  isHammerJamActive: boolean;
}

export const SmartRecommendations: React.FC<SmartRecommendationsProps> = ({
  recommendations,
  onStartUpgrade,
  isHammerJamActive
}) => {
  const [showFormulaDetails, setShowFormulaDetails] = useState(false);

  if (recommendations.length === 0) {
    return (
      <section className="my-6 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 text-center">
        <Sparkles className="w-8 h-8 text-amber-400 mx-auto mb-2" />
        <h3 className="text-base font-bold text-slate-200">Keine offenen Upgrades verfügbar</h3>
        <p className="text-xs text-slate-400 mt-1">
          Dein Dorf ist für das aktuelle Rathaus voll ausgebaut oder alle Gebäude werden bereits aufgewertet!
        </p>
      </section>
    );
  }

  const topRec = recommendations[0];
  const otherRecs = recommendations.slice(1, 4);

  return (
    <section className="my-6">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <h2 className="text-base sm:text-lg font-black tracking-wide uppercase text-slate-200">
            Smart Recommendations
          </h2>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
            F2P Stagger & Anti-Cap
          </span>
        </div>
        <button
          onClick={() => setShowFormulaDetails(!showFormulaDetails)}
          className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors"
        >
          <Info className="w-3.5 h-3.5" />
          <span>Scoring-Logik</span>
        </button>
      </div>

      {/* Formula Explanation Accordion */}
      {showFormulaDetails && (
        <div className="mb-4 bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs text-slate-300 space-y-2 animate-fadeIn">
          <div className="font-bold text-amber-400 flex items-center gap-1">
            <Info className="w-4 h-4" />
            <span>F2P Multi-Faktor Scoring-Formel</span>
          </div>
          <div className="font-mono bg-slate-950 p-2.5 rounded border border-slate-800 text-slate-300">
            FinalScore = 0.40 × Stagger(28h-Gap) + 0.35 × Resource(Anti-Cap) + 0.15 × Offense + 0.10 × Idle
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 pt-1">
            <div className="bg-slate-800/60 p-2 rounded border border-slate-700/50">
              <span className="font-bold text-indigo-400">40% Stagger:</span> Verhindert Bauarbeiter-Stau; zielt auf 28h Abstand ab (&lt;3h erzeugt Bottleneck-Abzug).
            </div>
            <div className="bg-slate-800/60 p-2 rounded border border-slate-700/50">
              <span className="font-bold text-pink-400">35% Anti-Cap:</span> Balanciert Gold/Elixier; bevorzugt Rohstoffe, die nicht blockiert sind.
            </div>
            <div className="bg-slate-800/60 p-2 rounded border border-slate-700/50">
              <span className="font-bold text-emerald-400">15% Offense:</span> Priorisiert Labor, Helden und Armeelager für maximale Kampfkraft.
            </div>
            <div className="bg-slate-800/60 p-2 rounded border border-slate-700/50">
              <span className="font-bold text-amber-400">10% Idle Urgency:</span> Gibt sofort bezahlbaren Gebäuden Dringlichkeitspunkte.
            </div>
          </div>
        </div>
      )}

      {/* ★ TOP RECOMMENDATION CARD ★ */}
      <div className="relative bg-gradient-to-r from-slate-900 via-slate-900/95 to-amber-950/20 border-2 border-amber-500/60 rounded-2xl p-5 shadow-2xl backdrop-blur-md overflow-hidden">
        {/* Glow corner */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Badge Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs px-2.5 py-1 rounded-lg shadow-sm">
              <Star className="w-3.5 h-3.5 fill-slate-950" />
              <span>TOP EMPFEHLUNG</span>
            </span>
            <span className="text-xs font-bold text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-md">
              Score: {topRec.finalScore}/100
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {topRec.tags.map((tag, idx) => (
              <span
                key={idx}
                className="text-[11px] font-semibold bg-slate-800/90 text-slate-300 border border-slate-700 px-2 py-0.5 rounded-md"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Content Layout */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            {/* Visual Icon with Level transition */}
            <div className="flex items-center gap-2">
              <img
                src={getEntityAsset(topRec.entityId, topRec.currentLevel || 1)}
                alt={topRec.entityName}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/assets/categories/tab_defense.webp';
                }}
                className="w-14 h-14 object-contain rounded-xl bg-slate-800/90 p-1 border border-slate-700 shadow"
              />
              <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
              <div className="relative">
                <img
                  src={getEntityAsset(topRec.entityId, topRec.targetLevel)}
                  alt={topRec.entityName}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/assets/categories/tab_defense.webp';
                  }}
                  className="w-14 h-14 object-contain rounded-xl bg-slate-800/90 p-1 border border-amber-500/60 shadow-lg ring-2 ring-amber-500/30"
                />
                <span className="absolute -bottom-1 -right-1 bg-amber-500 text-[10px] font-black text-slate-950 px-1.5 py-0.2 rounded shadow">
                  L{topRec.targetLevel}
                </span>
              </div>
            </div>

            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-100">
                {topRec.entityName} <span className="text-amber-400 font-semibold">(Stufe {topRec.targetLevel})</span>
              </h3>
              <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs">
                {/* Cost */}
                <div className="flex items-center gap-1.5 bg-slate-800/90 px-2 py-1 rounded-md border border-slate-700/80">
                  <img
                    src={getResourceAsset(topRec.resource)}
                    alt={topRec.resource}
                    className="w-4 h-4 object-contain"
                  />
                  <span className="font-bold text-slate-100 font-mono">
                    {formatCost(topRec.cost)}
                  </span>
                  {isHammerJamActive && (
                    <span className="text-[10px] text-amber-400 line-through">
                      {formatCost(topRec.originalCost)}
                    </span>
                  )}
                </div>

                {/* Duration */}
                <div className="flex items-center gap-1.5 bg-slate-800/90 px-2 py-1 rounded-md border border-slate-700/80 font-mono text-slate-200">
                  <Clock className="w-3.5 h-3.5 text-blue-400" />
                  <span>{formatDuration(topRec.duration)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="w-full sm:w-auto shrink-0">
            <button
              onClick={() => onStartUpgrade(topRec)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-black text-sm bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 shadow-lg shadow-amber-500/25 active:scale-98 transition-all"
            >
              <CheckCircle2 className="w-4 h-4 fill-slate-950 text-amber-300" />
              <span>Als aktiv setzen</span>
            </button>
          </div>
        </div>

        {/* Top Recommendation Reasons */}
        {topRec.reasons.length > 0 && (
          <div className="mt-3.5 pt-3 border-t border-slate-800/80 flex flex-wrap gap-2 text-xs text-slate-300">
            {topRec.reasons.map((reason, idx) => (
              <span key={idx} className="flex items-center gap-1 bg-slate-800/40 px-2 py-0.5 rounded border border-slate-750">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                {reason}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Secondary Recommendations */}
      {otherRecs.length > 0 && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          {otherRecs.map((rec) => (
            <div
              key={rec.entityId}
              className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-xl p-3.5 flex flex-col justify-between shadow-md transition-all hover:translate-y-[-1px]"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-slate-400">
                    Rang #{recommendations.indexOf(rec) + 1}
                  </span>
                  <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    {rec.finalScore} Pkt.
                  </span>
                </div>

                <div className="flex items-center gap-2.5">
                  <img
                    src={getEntityAsset(rec.entityId, rec.targetLevel)}
                    alt={rec.entityName}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/assets/categories/tab_defense.webp';
                    }}
                    className="w-11 h-11 object-contain rounded-lg bg-slate-800 p-1 border border-slate-700 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-bold text-slate-200 truncate">
                      {rec.entityName}
                    </h4>
                    <div className="text-xs text-amber-400 font-semibold">
                      ➔ L{rec.targetLevel}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-2.5 text-xs">
                  <div className="flex items-center gap-1 font-mono text-slate-300">
                    <img
                      src={getResourceAsset(rec.resource)}
                      alt={rec.resource}
                      className="w-3.5 h-3.5 object-contain"
                    />
                    <span>{formatCost(rec.cost)}</span>
                  </div>
                  <span className="text-slate-600">•</span>
                  <div className="flex items-center gap-1 font-mono text-slate-400">
                    <Clock className="w-3 h-3 text-blue-400" />
                    <span>{formatDuration(rec.duration)}</span>
                  </div>
                </div>

                {rec.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700 truncate max-w-full">
                      {rec.tags[0]}
                    </span>
                  </div>
                )}
              </div>

              <button
                onClick={() => onStartUpgrade(rec)}
                className="mt-3 w-full py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white border border-slate-700 hover:border-slate-600 transition-colors"
              >
                Starten
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
