import React, { useState } from 'react';
import { X, Sliders, Sparkles, Moon, Sun, RotateCcw } from 'lucide-react';
import { AppSettings } from '../types';
import { DEFAULT_SETTINGS } from '../utils/storage';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
  isDark: boolean;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  isDark,
}) => {
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveSettings(localSettings);
    onClose();
  };

  const handleReset = () => {
    setLocalSettings(DEFAULT_SETTINGS);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
      />

      {/* Modal Dialog */}
      <div
        className={`relative w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden z-10 transition-all ${
          isDark
            ? 'bg-neutral-900 border-neutral-800 text-neutral-200'
            : 'bg-white border-neutral-200 text-neutral-800'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-inherit">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">Assistant Preferences</h3>
              <p className="text-xs text-neutral-400">Customize NEXUS AI intelligence and behavior</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors ${
              isDark ? 'hover:bg-neutral-800 text-neutral-400' : 'hover:bg-neutral-100 text-neutral-600'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto scrollbar-thin">
          {/* Active Model Indicator */}
          <div
            className={`p-3.5 rounded-xl border flex items-center justify-between ${
              isDark ? 'bg-neutral-950/50 border-neutral-800' : 'bg-neutral-50 border-neutral-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <div>
                <p className="text-xs font-semibold">Gemini 3.8 Flash</p>
                <p className="text-[11px] text-neutral-400">Latest multi-turn reasoning and fast streaming</p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
              Connected
            </span>
          </div>

          {/* Theme Selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">
              Appearance Theme
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setLocalSettings((prev) => ({ ...prev, theme: 'dark' }))}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-medium transition-all ${
                  localSettings.theme === 'dark'
                    ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400 font-semibold'
                    : isDark
                    ? 'border-neutral-800 hover:bg-neutral-800/60 text-neutral-400'
                    : 'border-neutral-200 hover:bg-neutral-100 text-neutral-600'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                <span>Dark Theme</span>
              </button>

              <button
                type="button"
                onClick={() => setLocalSettings((prev) => ({ ...prev, theme: 'light' }))}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-medium transition-all ${
                  localSettings.theme === 'light'
                    ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400 font-semibold'
                    : isDark
                    ? 'border-neutral-800 hover:bg-neutral-800/60 text-neutral-400'
                    : 'border-neutral-200 hover:bg-neutral-100 text-neutral-600'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                <span>Light Theme</span>
              </button>
            </div>
          </div>

          {/* Temperature Slider */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Creativity & Temperature
              </label>
              <span className="font-mono text-xs font-bold text-indigo-400">
                {localSettings.temperature.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min="0.0"
              max="1.2"
              step="0.05"
              value={localSettings.temperature}
              onChange={(e) =>
                setLocalSettings((prev) => ({
                  ...prev,
                  temperature: parseFloat(e.target.value),
                }))
              }
              className="w-full accent-indigo-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-neutral-400 mt-1">
              <span>Precise & Deterministic (0.0)</span>
              <span>Balanced (0.7)</span>
              <span>Imaginative (1.2)</span>
            </div>
          </div>

          {/* Custom System Prompt Override */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
              Custom Instruction Overlay
            </label>
            <textarea
              rows={3}
              value={localSettings.customSystemPrompt}
              onChange={(e) =>
                setLocalSettings((prev) => ({
                  ...prev,
                  customSystemPrompt: e.target.value,
                }))
              }
              placeholder="e.g. Always structure explanations with bullet points and avoid unnecessary preamble."
              className={`w-full p-3 rounded-xl border text-xs outline-hidden resize-none transition-colors ${
                isDark
                  ? 'bg-neutral-950/60 border-neutral-800 focus:border-indigo-500 text-neutral-200 placeholder:text-neutral-500'
                  : 'bg-neutral-50 border-neutral-200 focus:border-indigo-500 text-neutral-800 placeholder:text-neutral-400'
              }`}
            />
            <p className="text-[11px] text-neutral-400 mt-1">
              These guidelines will be appended to the current mode's system instructions.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-inherit bg-inherit">
          <button
            type="button"
            onClick={handleReset}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              isDark ? 'hover:bg-neutral-800 text-neutral-400' : 'hover:bg-neutral-100 text-neutral-600'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                isDark ? 'hover:bg-neutral-800 text-neutral-300' : 'hover:bg-neutral-100 text-neutral-700'
              }`}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 active:scale-95 transition-all cursor-pointer"
            >
              Save Preferences
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
