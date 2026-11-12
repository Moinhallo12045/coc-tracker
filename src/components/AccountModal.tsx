import React, { useState } from 'react';
import type { AccountProfile } from '../db/db';
import { getTownHallAsset } from '../services/catalog';
import { X, UserPlus, Check, Trash2, Users } from 'lucide-react';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: AccountProfile[];
  currentAccount: AccountProfile | null;
  onSelectAccount: (tag: string) => void;
  onAddAccount: (account: { name: string; tag: string; townHallLevel: number }) => void;
  onDeleteAccount: (tag: string) => void;
}

export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  onClose,
  accounts,
  currentAccount,
  onSelectAccount,
  onAddAccount,
  onDeleteAccount
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [tag, setTag] = useState('');
  const [townHallLevel, setTownHallLevel] = useState(16);

  if (!isOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const cleanTag = tag.trim().startsWith('#') ? tag.trim().toUpperCase() : `#${tag.trim().toUpperCase() || 'TAG'}`;
    onAddAccount({
      name: name.trim(),
      tag: cleanTag,
      townHallLevel
    });
    setName('');
    setTag('');
    setIsAdding(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-slate-100 text-base">Account-Verwaltung</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 max-h-[70vh] overflow-y-auto space-y-3">
          {/* List of Accounts */}
          {accounts.map(acc => {
            const isSelected = currentAccount?.tag === acc.tag;
            return (
              <div
                key={acc.tag}
                onClick={() => {
                  onSelectAccount(acc.tag);
                  onClose();
                }}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500/10 border-amber-500/50 shadow-md ring-1 ring-amber-500/30'
                    : 'bg-slate-800/60 border-slate-750 hover:bg-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={getTownHallAsset(acc.townHallLevel)}
                      alt={`TH ${acc.townHallLevel}`}
                      className="w-10 h-10 object-contain"
                    />
                    <span className="absolute -bottom-1 -right-1 bg-amber-500 text-[9px] font-black text-slate-950 px-1 rounded-full">
                      {acc.townHallLevel}
                    </span>
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
                      <span>{acc.name}</span>
                      {isSelected && (
                        <span className="text-[10px] font-semibold bg-amber-500 text-slate-950 px-1.5 py-0.2 rounded">
                          Aktiv
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 font-mono">{acc.tag}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  {isSelected ? (
                    <div className="w-7 h-7 rounded-full bg-amber-500 flex items-center justify-center text-slate-950">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        onSelectAccount(acc.tag);
                        onClose();
                      }}
                      className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200"
                    >
                      Wählen
                    </button>
                  )}

                  {accounts.length > 1 && (
                    <button
                      onClick={() => onDeleteAccount(acc.tag)}
                      title="Account löschen"
                      className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-700/50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {/* Add Account Section */}
          {!isAdding ? (
            <button
              onClick={() => setIsAdding(true)}
              className="w-full py-2.5 rounded-xl border border-dashed border-slate-700 hover:border-amber-500/50 bg-slate-800/40 hover:bg-slate-800 text-slate-300 hover:text-amber-400 flex items-center justify-center gap-2 text-xs font-bold transition-all"
            >
              <UserPlus className="w-4 h-4" />
              <span>Neuen Account anlegen</span>
            </button>
          ) : (
            <form onSubmit={handleCreate} className="bg-slate-800/80 border border-slate-700 rounded-xl p-3.5 space-y-3">
              <div className="font-bold text-xs text-slate-200">Account Details</div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Account-Name</label>
                <input
                  type="text"
                  required
                  placeholder="z.B. Main, Mini, CWL..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-750 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Spieler-Tag</label>
                  <input
                    type="text"
                    placeholder="#Q9C0YQYJR"
                    value={tag}
                    onChange={(e) => setTag(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-750 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Rathaus-Stufe</label>
                  <select
                    value={townHallLevel}
                    onChange={(e) => setTownHallLevel(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-750 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    {Array.from({ length: 19 }, (_, i) => i + 1).map(lvl => (
                      <option key={lvl} value={lvl}>
                        TH {lvl}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-slate-200"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950"
                >
                  Speichern
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
