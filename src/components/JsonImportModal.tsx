import React, { useState } from 'react';
import { getSampleClashNinjaJson, parseAndIngestClashNinjaJson, type ParseResult } from '../services/parser';
import { X, Upload, FileText, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

interface JsonImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (result: ParseResult) => void;
}

export const JsonImportModal: React.FC<JsonImportModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess
}) => {
  const [jsonInput, setJsonInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleImport = async () => {
    if (!jsonInput.trim()) {
      setError('Bitte füge gültiges JSON ein oder lade eine Datei hoch.');
      return;
    }
    setError(null);
    setIsProcessing(true);

    try {
      const result = await parseAndIngestClashNinjaJson(jsonInput);
      setIsProcessing(false);
      onImportSuccess(result);
      onClose();
    } catch (err: unknown) {
      setIsProcessing(false);
      const msg = err instanceof Error ? err.message : String(err);
      setError(`Fehler beim Verarbeiten des JSON: ${msg}`);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setJsonInput(content);
      setError(null);
    };
    reader.onerror = () => {
      setError('Fehler beim Lesen der Datei.');
    };
    reader.readAsText(file);
  };

  const handleLoadSample = () => {
    const sample = getSampleClashNinjaJson();
    setJsonInput(sample);
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-bold text-slate-100 text-base">Clash-Ninja JSON Import</h3>
              <p className="text-[11px] text-slate-400">Automatische Timer-Delta-Berechnung & Multi-Account-Sync</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 overflow-y-auto space-y-3.5 flex-1">
          {/* Quick Sample Button */}
          <div className="flex items-center justify-between bg-slate-800/60 p-3 rounded-xl border border-slate-750">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Möchtest du das System mit realistischen Daten testen?</span>
            </div>
            <button
              onClick={handleLoadSample}
              className="text-xs font-bold px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-sm shrink-0 transition-all"
            >
              Demo-Daten laden
            </button>
          </div>

          {/* File Upload Drop Area */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              JSON Datei auswählen oder per Drag & Drop ablegen
            </label>
            <div className="relative border-2 border-dashed border-slate-700 hover:border-amber-500/50 rounded-xl p-4 text-center cursor-pointer transition-colors bg-slate-950/40">
              <input
                type="file"
                accept=".json,application/json"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <FileText className="w-6 h-6 text-slate-400 mx-auto mb-1" />
              <div className="text-xs text-slate-300 font-medium">
                Klicke hier oder ziehe deine <span className="text-amber-400 font-mono">export.json</span> hierher
              </div>
            </div>
          </div>

          {/* Text Area */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-300">
                Oder JSON-Inhalt hier einfügen
              </label>
              {jsonInput && (
                <button
                  onClick={() => setJsonInput('')}
                  className="text-[11px] text-slate-500 hover:text-slate-300"
                >
                  Leeren
                </button>
              )}
            </div>
            <textarea
              rows={8}
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder="Paste JSON here... { &quot;timestamp&quot;: 1716000000, &quot;tag&quot;: &quot;#Q9C0YQYJR&quot; ... }"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-500 resize-none"
            />
          </div>

          {/* Error Notice */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Delta Timer Formula Note */}
          <div className="bg-slate-800/40 border border-slate-800 p-2.5 rounded-xl text-[11px] text-slate-400 space-y-1">
            <span className="font-bold text-slate-300">Delta-Timer-Berechnung:</span>
            <div>
              <code className="text-amber-400 font-mono text-[10px]">
                Δt = floor(Date.now() / 1000) - json.timestamp
              </code>
            </div>
            <p>
              Verbleibende Timer-Zeiten werden exakt um die seit dem Export vergangene Zeit korrigiert.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900 flex items-center justify-end gap-2 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            Abbrechen
          </button>
          <button
            onClick={handleImport}
            disabled={isProcessing || !jsonInput.trim()}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 disabled:opacity-40 text-slate-950 shadow-md shadow-amber-500/20 transition-all active:scale-95"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isProcessing ? 'Verarbeite...' : 'Jetzt Importieren'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
