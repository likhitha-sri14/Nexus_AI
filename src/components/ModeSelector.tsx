import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Code2,
  PenTool,
  GraduationCap,
  Palette,
  ChevronDown,
  Check,
} from 'lucide-react';
import { AssistantModeId } from '../types';
import { ASSISTANT_MODES } from '../utils/modes';

interface ModeSelectorProps {
  currentMode: AssistantModeId;
  onSelectMode: (mode: AssistantModeId) => void;
  isDark: boolean;
}

const ICONS: Record<string, React.ElementType> = {
  Sparkles,
  Code2,
  PenTool,
  GraduationCap,
  Palette,
};

export const ModeSelector: React.FC<ModeSelectorProps> = ({
  currentMode,
  onSelectMode,
  isDark,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeModeConfig = ASSISTANT_MODES[currentMode] || ASSISTANT_MODES.general;
  const ActiveIcon = ICONS[activeModeConfig.icon] || Sparkles;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer shadow-xs ${
          isDark
            ? 'bg-neutral-800/80 hover:bg-neutral-700/80 border-neutral-700 text-neutral-200'
            : 'bg-white hover:bg-neutral-100 border-neutral-200 text-neutral-800'
        }`}
      >
        <span className={`p-1 rounded-md ${activeModeConfig.badgeBg}`}>
          <ActiveIcon className="w-3.5 h-3.5" />
        </span>
        <span className="font-semibold tracking-tight">{activeModeConfig.name}</span>
        <ChevronDown className="w-3.5 h-3.5 text-neutral-400 ml-0.5" />
      </button>

      {isOpen && (
        <div
          className={`absolute left-0 mt-2 w-72 origin-top-left rounded-2xl p-1.5 shadow-2xl border z-50 backdrop-blur-md transition-all ${
            isDark
              ? 'bg-neutral-900/95 border-neutral-700/80 text-neutral-200'
              : 'bg-white/95 border-neutral-200 text-neutral-800'
          }`}
        >
          <div className="px-2.5 py-2 border-b border-inherit mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
              Select AI Assistant Mode
            </span>
          </div>

          <div className="space-y-1">
            {Object.values(ASSISTANT_MODES).map((mode) => {
              const isSelected = mode.id === currentMode;
              const Icon = ICONS[mode.icon] || Sparkles;

              return (
                <button
                  key={mode.id}
                  onClick={() => {
                    onSelectMode(mode.id);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left flex items-start gap-3 p-2.5 rounded-xl text-xs transition-colors cursor-pointer ${
                    isSelected
                      ? isDark
                        ? 'bg-neutral-800 text-white font-medium'
                        : 'bg-indigo-50 text-indigo-950 font-medium'
                      : isDark
                      ? 'hover:bg-neutral-800/60 text-neutral-300'
                      : 'hover:bg-neutral-100 text-neutral-700'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${mode.badgeBg}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{mode.name}</span>
                      {isSelected && <Check className="w-4 h-4 text-indigo-400 shrink-0" />}
                    </div>
                    <p className="text-[11px] text-neutral-400 mt-0.5 line-clamp-1">
                      {mode.tagline}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
