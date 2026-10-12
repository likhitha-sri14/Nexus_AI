import React, { useState } from 'react';
import {
  MessageSquare,
  Plus,
  Search,
  Trash2,
  Edit2,
  Check,
  X,
  Settings,
  Sun,
  Moon,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Database,
  ExternalLink,
} from 'lucide-react';
import { Conversation, AssistantModeId } from '../types';
import { ASSISTANT_MODES } from '../utils/modes';

interface SidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
  onRenameConversation: (id: string, newTitle: string) => void;
  onOpenSettings: () => void;
  onOpenClearModal: () => void;
  isOpen: boolean;
  onToggleOpen: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  activeMode: AssistantModeId;
  onSelectMode: (mode: AssistantModeId) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  conversations,
  activeId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  onRenameConversation,
  onOpenSettings,
  onOpenClearModal,
  isOpen,
  onToggleOpen,
  isDark,
  onToggleTheme,
  activeMode,
  onSelectMode,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  // Filter conversations by search query
  const filteredConversations = conversations.filter((conv) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const titleMatch = conv.title.toLowerCase().includes(query);
    const messageMatch = conv.messages.some((m) => m.content.toLowerCase().includes(query));
    return titleMatch || messageMatch;
  });

  // Group conversations by relative time
  const now = Date.now();
  const ONE_DAY = 24 * 60 * 60 * 1000;
  const groups: { [key: string]: Conversation[] } = {
    Today: [],
    Yesterday: [],
    'Previous 7 Days': [],
    Older: [],
  };

  filteredConversations.forEach((conv) => {
    const diff = now - conv.updatedAt;
    if (diff < ONE_DAY) {
      groups.Today.push(conv);
    } else if (diff < 2 * ONE_DAY) {
      groups.Yesterday.push(conv);
    } else if (diff < 7 * ONE_DAY) {
      groups['Previous 7 Days'].push(conv);
    } else {
      groups.Older.push(conv);
    }
  });

  const startEditing = (conv: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(conv.id);
    setEditTitle(conv.title);
  };

  const saveEdit = (id: string, e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (editTitle.trim()) {
      onRenameConversation(id, editTitle.trim());
    }
    setEditingId(null);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onToggleOpen}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 flex flex-col w-72 md:w-80 shrink-0 transition-transform duration-300 ease-in-out border-r ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:-translate-x-full'
        } ${
          isDark
            ? 'bg-neutral-900 border-neutral-800 text-neutral-200'
            : 'bg-neutral-50 border-neutral-200 text-neutral-800'
        }`}
      >
        {/* Top Branding & New Chat */}
        <div className="p-4 flex flex-col gap-3 border-b border-inherit">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-md shadow-indigo-500/20 text-white font-black text-lg tracking-wider">
                N
              </div>
              <div>
                <h1 className="font-bold text-base tracking-tight leading-none flex items-center gap-1.5">
                  NEXUS <span className="text-indigo-500 font-extrabold">AI</span>
                </h1>
                <span
                  className={`text-[10px] font-semibold tracking-wider uppercase ${
                    isDark ? 'text-neutral-400' : 'text-neutral-500'
                  }`}
                >
                  Powered by Gemini 3.8
                </span>
              </div>
            </div>

            <button
              onClick={onToggleOpen}
              className={`p-1.5 rounded-lg md:hidden ${
                isDark ? 'hover:bg-neutral-800 text-neutral-400' : 'hover:bg-neutral-200 text-neutral-600'
              }`}
              title="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* New Chat Primary Button */}
          <button
            onClick={() => {
              onNewConversation();
              if (window.innerWidth < 768) onToggleOpen();
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-medium text-sm text-white bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] transition-all shadow-md shadow-indigo-600/25 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>New Conversation</span>
          </button>

          {/* Search Conversations Input */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className={`w-full pl-9 pr-8 py-1.5 text-xs rounded-lg border transition-colors outline-hidden ${
                isDark
                  ? 'bg-neutral-950/50 border-neutral-800 focus:border-indigo-500 text-neutral-200 placeholder:text-neutral-500'
                  : 'bg-white border-neutral-200 focus:border-indigo-500 text-neutral-800 placeholder:text-neutral-400'
              }`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Conversation History List */}
        <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4 scrollbar-thin">
          {conversations.length === 0 ? (
            <div className="text-center py-10 px-4 text-xs text-neutral-400">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p>No conversations yet.</p>
              <p className="mt-1 text-[11px] opacity-70">Start asking questions or explore ideas!</p>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="text-center py-8 text-xs text-neutral-400">
              <p>No results found for "{searchQuery}"</p>
            </div>
          ) : (
            Object.entries(groups).map(([groupName, groupItems]) => {
              if (groupItems.length === 0) return null;
              return (
                <div key={groupName} className="space-y-1">
                  <div
                    className={`px-3 py-1 text-[11px] font-bold tracking-wider uppercase ${
                      isDark ? 'text-neutral-400' : 'text-neutral-600'
                    }`}
                  >
                    {groupName}
                  </div>
                  {groupItems.map((conv) => {
                    const isActive = conv.id === activeId;
                    const isEditing = editingId === conv.id;

                    return (
                      <div
                        key={conv.id}
                        onClick={() => {
                          onSelectConversation(conv.id);
                          if (window.innerWidth < 768) onToggleOpen();
                        }}
                        className={`group relative flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium cursor-pointer transition-all ${
                          isActive
                            ? isDark
                              ? 'bg-neutral-800/90 text-white shadow-xs border border-neutral-700/60'
                              : 'bg-white text-indigo-950 shadow-sm border border-neutral-300 font-bold'
                            : isDark
                            ? 'text-neutral-300 hover:bg-neutral-800/50 hover:text-white'
                            : 'text-neutral-700 hover:bg-neutral-200/80 hover:text-neutral-950'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <MessageSquare
                            className={`w-4 h-4 shrink-0 ${
                              isActive
                                ? 'text-indigo-500'
                                : isDark
                                ? 'text-neutral-400 group-hover:text-neutral-300'
                                : 'text-neutral-500 group-hover:text-neutral-800'
                            }`}
                          />

                          {isEditing ? (
                            <form
                              onSubmit={(e) => saveEdit(conv.id, e)}
                              className="flex items-center gap-1 flex-1 min-w-0"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <input
                                type="text"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                autoFocus
                                onBlur={() => saveEdit(conv.id)}
                                className={`w-full px-1.5 py-0.5 text-xs rounded border outline-hidden ${
                                  isDark
                                    ? 'bg-neutral-900 border-indigo-500 text-white'
                                    : 'bg-neutral-100 border-indigo-500 text-neutral-900'
                                }`}
                              />
                              <button
                                type="submit"
                                className="p-1 hover:text-emerald-400"
                                title="Save"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            </form>
                          ) : (
                            <span className="truncate flex-1 text-left">
                              {conv.title || 'Untitled Conversation'}
                            </span>
                          )}
                        </div>

                        {/* Action buttons (Rename / Delete) */}
                        {!isEditing && (
                          <div
                            className={`flex items-center gap-1 shrink-0 ${
                              isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                            } transition-opacity`}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={(e) => startEditing(conv, e)}
                              className="p-1 rounded-md text-neutral-400 hover:text-indigo-400 hover:bg-neutral-700/50"
                              title="Rename"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onDeleteConversation(conv.id)}
                              className="p-1 rounded-md text-neutral-400 hover:text-rose-400 hover:bg-neutral-700/50"
                              title="Delete conversation"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Preferences & Actions */}
        <div className="p-3 border-t border-inherit flex flex-col gap-1.5 bg-inherit">
          <div className="flex items-center justify-between px-2 py-1">
            <span className={`text-xs font-semibold ${isDark ? 'text-neutral-400' : 'text-neutral-700'}`}>
              Theme
            </span>
            <button
              onClick={onToggleTheme}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                isDark
                  ? 'bg-neutral-800 text-neutral-200 hover:bg-neutral-700'
                  : 'bg-neutral-200 text-neutral-900 hover:bg-neutral-300 font-semibold shadow-xs'
              }`}
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? (
                <>
                  <Moon className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Dark</span>
                </>
              ) : (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  <span>Light</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center gap-1 pt-1">
            <button
              onClick={onOpenSettings}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                isDark
                  ? 'hover:bg-neutral-800 text-neutral-300 hover:text-white'
                  : 'hover:bg-neutral-200 text-neutral-800 hover:text-neutral-950 font-semibold'
              }`}
            >
              <Settings className="w-4 h-4 text-neutral-400" />
              <span>Settings</span>
            </button>

            {conversations.length > 0 && (
              <button
                onClick={onOpenClearModal}
                className={`flex items-center justify-center p-2 rounded-lg text-xs font-medium transition-colors ${
                  isDark
                    ? 'hover:bg-rose-500/10 text-neutral-400 hover:text-rose-400'
                    : 'hover:bg-rose-500/10 text-neutral-500 hover:text-rose-600'
                }`}
                title="Clear all conversations"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
