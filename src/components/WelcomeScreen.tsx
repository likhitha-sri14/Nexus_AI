import React from 'react';
import {
  Sparkles,
  Code2,
  PenTool,
  BookOpen,
  Compass,
  ArrowUpRight,
} from 'lucide-react';
import { AssistantModeId } from '../types';
import { ASSISTANT_MODES } from '../utils/modes';

interface WelcomeScreenProps {
  activeMode: AssistantModeId;
  onSelectPrompt: (promptText: string) => void;
  onSelectMode: (mode: AssistantModeId) => void;
  isDark: boolean;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  activeMode,
  onSelectPrompt,
  onSelectMode,
  isDark,
}) => {
  const currentModeConfig = ASSISTANT_MODES[activeMode] || ASSISTANT_MODES.general;

  // The 4 core suggestion cards
  const coreSuggestions = [
    {
      title: 'Learn Something',
      description: 'Explain quantum computing in simple terms with everyday analogies',
      prompt: 'Explain the core principles of quantum computing in simple terms using everyday analogies. How do qubits differ from classical bits?',
      icon: BookOpen,
      modeId: 'study' as AssistantModeId,
      accent: 'text-indigo-500',
      badgeBg: 'bg-indigo-500/10 text-indigo-500',
    },
    {
      title: 'Write Content',
      description: 'Draft a crisp, persuasive product announcement email',
      prompt: 'Draft a compelling, professional announcement email for a new high-performance AI assistant platform named NEXUS AI.',
      icon: PenTool,
      modeId: 'writing' as AssistantModeId,
      accent: 'text-amber-500',
      badgeBg: 'bg-amber-500/10 text-amber-500',
    },
    {
      title: 'Build Software',
      description: 'Write a React hook for debouncing input and API requests',
      prompt: 'Write a production-grade TypeScript React hook for debouncing input with cancel, flush, and immediate execution options.',
      icon: Code2,
      modeId: 'coding' as AssistantModeId,
      accent: 'text-cyan-500',
      badgeBg: 'bg-cyan-500/10 text-cyan-500',
    },
    {
      title: 'Analyze Ideas',
      description: 'Evaluate pros and cons of microservices vs monolithic architecture',
      prompt: 'Evaluate the pros and cons of microservices vs monolithic architecture. When should an engineering team choose one over the other?',
      icon: Compass,
      modeId: 'general' as AssistantModeId,
      accent: 'text-emerald-500',
      badgeBg: 'bg-emerald-500/10 text-emerald-500',
    },
  ];

  return (
    <div className="max-w-3xl w-full mx-auto px-4 py-8 flex flex-col items-center justify-center text-center my-auto">
      {/* Visual Glowing Badge */}
      <div className="relative mb-5 group">
        <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500 via-cyan-400 to-indigo-600 rounded-3xl blur-xl opacity-30 group-hover:opacity-60 transition duration-500"></div>
        <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-neutral-900 via-indigo-950 to-neutral-900 border border-indigo-500/30 flex items-center justify-center shadow-2xl">
          <Sparkles className="w-8 h-8 text-indigo-400" />
        </div>
      </div>

      {/* Main Heading with crisp contrast */}
      <h2
        className={`text-2xl md:text-4xl font-extrabold tracking-tight mb-2 ${
          isDark ? 'text-white' : 'text-neutral-900'
        }`}
      >
        What can I help you explore today?
      </h2>

      {/* Mode Tag and Description */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${currentModeConfig.badgeBg}`}
        >
          <span>{currentModeConfig.name}</span>
        </span>
        <span
          className={`text-xs max-w-md ${
            isDark ? 'text-neutral-400' : 'text-neutral-600 font-medium'
          }`}
        >
          {currentModeConfig.tagline}
        </span>
      </div>

      {/* Mode Switcher Tabs */}
      <div
        className={`flex flex-wrap items-center justify-center gap-1.5 mb-8 p-1.5 rounded-xl border max-w-fit shadow-xs ${
          isDark
            ? 'bg-neutral-900/60 border-neutral-800'
            : 'bg-neutral-200/60 border-neutral-300'
        }`}
      >
        {Object.values(ASSISTANT_MODES).map((mode) => {
          const isActive = mode.id === activeMode;
          return (
            <button
              key={mode.id}
              onClick={() => onSelectMode(mode.id)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                isActive
                  ? isDark
                    ? 'bg-neutral-800 text-white shadow-xs font-bold'
                    : 'bg-white text-neutral-900 shadow-sm font-bold border border-neutral-200/80'
                  : isDark
                  ? 'text-neutral-400 hover:text-white'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              {mode.name.replace(' Assistant', '')}
            </button>
          );
        })}
      </div>

      {/* Four Clickable Suggestion Cards with high contrast */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full text-left">
        {coreSuggestions.map((card, idx) => {
          const Icon = card.icon;
          return (
            <button
              key={idx}
              onClick={() => {
                if (activeMode !== card.modeId) {
                  onSelectMode(card.modeId);
                }
                onSelectPrompt(card.prompt);
              }}
              className={`group p-4.5 rounded-2xl border transition-all duration-200 text-left flex flex-col justify-between cursor-pointer hover:scale-[1.01] active:scale-[0.99] ${
                isDark
                  ? 'bg-neutral-900/70 hover:bg-neutral-800/90 border-neutral-800 hover:border-neutral-700 shadow-xs'
                  : 'bg-white hover:bg-neutral-50/90 border-neutral-200/90 hover:border-indigo-300 shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between w-full mb-3">
                <div className={`p-2 rounded-xl ${card.badgeBg}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <ArrowUpRight
                  className={`w-4 h-4 transition-opacity ${
                    isDark
                      ? 'text-neutral-400 opacity-0 group-hover:opacity-100 group-hover:text-white'
                      : 'text-neutral-400 opacity-0 group-hover:opacity-100 group-hover:text-neutral-900'
                  }`}
                />
              </div>
              <div>
                <h3
                  className={`font-bold text-sm mb-1 transition-colors ${
                    isDark
                      ? 'text-neutral-100 group-hover:text-white'
                      : 'text-neutral-900 group-hover:text-indigo-600'
                  }`}
                >
                  {card.title}
                </h3>
                <p
                  className={`text-xs line-clamp-2 leading-relaxed ${
                    isDark ? 'text-neutral-400' : 'text-neutral-600 font-normal'
                  }`}
                >
                  {card.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
