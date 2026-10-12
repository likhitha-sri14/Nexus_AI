import React from 'react';
import {
  Menu,
  Plus,
  Moon,
  Sun,
  Settings,
  Sparkles,
} from 'lucide-react';
import { AssistantModeId } from '../types';
import { ModeSelector } from './ModeSelector';

interface HeaderProps {
  onToggleSidebar: () => void;
  activeMode: AssistantModeId;
  onSelectMode: (mode: AssistantModeId) => void;
  title?: string;
  onNewChat: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  activeMode,
  onSelectMode,
  title,
  onNewChat,
  isDark,
  onToggleTheme,
  onOpenSettings,
}) => {
  return (
    <header
      className={`h-14 border-b flex items-center justify-between px-3 md:px-5 shrink-0 transition-colors z-20 ${
        isDark
          ? 'bg-neutral-900/90 border-neutral-800 text-neutral-200 backdrop-blur-md'
          : 'bg-white/90 border-neutral-200 text-neutral-800 backdrop-blur-md'
      }`}
    >
      <div className="flex items-center gap-2 md:gap-3 min-w-0">
        <button
          onClick={onToggleSidebar}
          className={`p-2 rounded-xl transition-colors cursor-pointer ${
            isDark ? 'hover:bg-neutral-800 text-neutral-300' : 'hover:bg-neutral-100 text-neutral-700'
          }`}
          title="Toggle sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Mode Selector */}
        <ModeSelector
          currentMode={activeMode}
          onSelectMode={onSelectMode}
          isDark={isDark}
        />

        {/* Title if active */}
        {title && (
          <span
            className={`hidden lg:inline-block text-xs font-semibold truncate max-w-xs pl-2 border-l border-inherit ${
              isDark ? 'text-neutral-400' : 'text-neutral-700'
            }`}
          >
            {title}
          </span>
        )}
      </div>

      <div className="flex items-center gap-1.5 md:gap-2">
        <button
          onClick={onNewChat}
          className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
            isDark
              ? 'border-neutral-700 hover:bg-neutral-800 text-neutral-200'
              : 'border-neutral-200 hover:bg-neutral-100 text-neutral-800'
          }`}
          title="Start new conversation"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Chat</span>
        </button>

        <button
          onClick={onToggleTheme}
          className={`p-2 rounded-xl transition-colors cursor-pointer ${
            isDark ? 'hover:bg-neutral-800 text-neutral-300' : 'hover:bg-neutral-100 text-neutral-700'
          }`}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
        </button>

        <button
          onClick={onOpenSettings}
          className={`p-2 rounded-xl transition-colors cursor-pointer ${
            isDark ? 'hover:bg-neutral-800 text-neutral-300' : 'hover:bg-neutral-100 text-neutral-700'
          }`}
          title="Open settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
