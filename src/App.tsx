import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Conversation,
  ChatMessage,
  MessageAttachment,
  AssistantModeId,
  AppSettings,
} from './types';
import {
  loadConversations,
  saveConversations,
  loadActiveConversationId,
  saveActiveConversationId,
  loadSettings,
  saveSettings,
  createNewConversation,
} from './utils/storage';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { WelcomeScreen } from './components/WelcomeScreen';
import { MessageItem } from './components/MessageItem';
import { ChatInput } from './components/ChatInput';
import { SettingsModal } from './components/SettingsModal';
import { ClearConfirmModal } from './components/ClearConfirmModal';

export default function App() {
  const [conversations, setConversations] = useState<Conversation[]>(() => loadConversations());
  const [activeId, setActiveId] = useState<string | null>(() => loadActiveConversationId());
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Active assistant mode for new conversation or current conversation
  const [currentMode, setCurrentMode] = useState<AssistantModeId>('general');

  // Ref to abort ongoing fetch streams
  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync theme to <html> class
  const isDark = settings.theme === 'dark' || (settings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Persist conversations
  useEffect(() => {
    saveConversations(conversations);
  }, [conversations]);

  // Persist active ID
  useEffect(() => {
    saveActiveConversationId(activeId);
  }, [activeId]);

  // Persist settings
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  // Find active conversation
  const activeConversation = conversations.find((c) => c.id === activeId) || null;

  // When active conversation changes, sync its mode
  useEffect(() => {
    if (activeConversation) {
      setCurrentMode(activeConversation.mode);
    }
  }, [activeConversation?.id]);

  // Scroll to bottom when messages update
  const scrollToBottom = useCallback((smooth = true) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: smooth ? 'smooth' : 'auto',
      });
    }
  }, []);

  useEffect(() => {
    scrollToBottom(false);
  }, [activeId]);

  useEffect(() => {
    if (isGenerating) {
      scrollToBottom(true);
    }
  }, [activeConversation?.messages, isGenerating, scrollToBottom]);

  // Create a new conversation
  const handleNewConversation = (mode: AssistantModeId = currentMode) => {
    if (isGenerating) {
      handleStopGeneration();
    }
    const newConv = createNewConversation(mode);
    setConversations((prev) => [newConv, ...prev]);
    setActiveId(newConv.id);
    setCurrentMode(mode);
  };

  // Select an existing conversation
  const handleSelectConversation = (id: string) => {
    if (isGenerating) {
      handleStopGeneration();
    }
    setActiveId(id);
    const target = conversations.find((c) => c.id === id);
    if (target) {
      setCurrentMode(target.mode);
    }
  };

  // Delete a conversation
  const handleDeleteConversation = (id: string) => {
    if (activeId === id && isGenerating) {
      handleStopGeneration();
    }
    setConversations((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      if (activeId === id) {
        const nextId = updated.length > 0 ? updated[0].id : null;
        setActiveId(nextId);
      }
      return updated;
    });
  };

  // Rename a conversation
  const handleRenameConversation = (id: string, newTitle: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title: newTitle, updatedAt: Date.now() } : c))
    );
  };

  // Clear all conversations
  const handleConfirmClearAll = () => {
    if (isGenerating) {
      handleStopGeneration();
    }
    setConversations([]);
    setActiveId(null);
  };

  // Switch assistant mode
  const handleSelectMode = (mode: AssistantModeId) => {
    setCurrentMode(mode);
    if (activeConversation) {
      // If current conversation is empty, update its mode
      if (activeConversation.messages.length === 0) {
        setConversations((prev) =>
          prev.map((c) => (c.id === activeConversation.id ? { ...c, mode } : c))
        );
      }
    }
  };

  // Toggle Theme
  const handleToggleTheme = () => {
    setSettings((prev) => ({
      ...prev,
      theme: isDark ? 'light' : 'dark',
    }));
  };

  // Stop Generation
  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsGenerating(false);
  };

  // Generate conversation title via Gemini API
  const generateConversationTitle = async (convId: string, promptText: string) => {
    try {
      const res = await fetch('/api/chat/title', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: promptText }),
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data?.title) {
        setConversations((prev) =>
          prev.map((c) => (c.id === convId ? { ...c, title: data.title } : c))
        );
      }
    } catch (e) {
      console.warn('Failed to generate title:', e);
    }
  };

  // Send message and stream response from Gemini API
  const handleSendMessage = async (
    content: string,
    attachments: MessageAttachment[] = [],
    overrideMessages?: ChatMessage[]
  ) => {
    if (isGenerating) return;

    let targetConv = activeConversation;
    let targetConvId = activeId;

    // If no conversation exists yet, create one
    if (!targetConv || !targetConvId) {
      const newConv = createNewConversation(currentMode);
      targetConv = newConv;
      targetConvId = newConv.id;
      setConversations((prev) => [newConv, ...prev]);
      setActiveId(newConv.id);
    }

    const isFirstMessage = targetConv.messages.length === 0 && !overrideMessages;

    // Build user message
    const userMessage: ChatMessage = {
      id: `msg_u_${Date.now()}`,
      role: 'user',
      content,
      timestamp: Date.now(),
      attachments: attachments.length > 0 ? attachments : undefined,
    };

    // Placeholder assistant message
    const assistantMessageId = `msg_a_${Date.now()}`;
    const assistantPlaceholder: ChatMessage = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
    };

    const messagesToSend = overrideMessages || [...targetConv.messages, userMessage];

    // Optimistically update conversation state
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== targetConvId) return c;
        return {
          ...c,
          updatedAt: Date.now(),
          messages: [...messagesToSend, assistantPlaceholder],
        };
      })
    );

    setIsGenerating(true);
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    // Trigger title generation if this is the first message
    if (isFirstMessage && content) {
      generateConversationTitle(targetConvId, content);
    }

    try {
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: abortController.signal,
        body: JSON.stringify({
          messages: messagesToSend.map((m) => ({
            role: m.role,
            content: m.content,
            attachments: m.attachments,
          })),
          mode: targetConv.mode || currentMode,
          customSystemPrompt: settings.customSystemPrompt,
          temperature: settings.temperature,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Server responded with status ${response.status}`);
      }

      if (!response.body) {
        throw new Error('ReadableStream not supported by browser.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let accumulatedText = '';
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        // Keep the last partial line in buffer
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data: ')) continue;
          const jsonStr = trimmed.slice(6).trim();
          if (!jsonStr) continue;

          try {
            const data = JSON.parse(jsonStr);

            if (data.error) {
              throw new Error(data.error);
            }

            if (data.text) {
              accumulatedText += data.text;

              setConversations((prev) =>
                prev.map((c) => {
                  if (c.id !== targetConvId) return c;
                  return {
                    ...c,
                    messages: c.messages.map((m) =>
                      m.id === assistantMessageId
                        ? { ...m, content: accumulatedText }
                        : m
                    ),
                  };
                })
              );
            }
          } catch (e: any) {
            if (e.message && !e.message.includes('JSON')) {
              throw e;
            }
          }
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Stream generation aborted by user.');
      } else {
        console.error('Chat stream error:', err);
        const errMsg = err?.message || 'Failed to generate response. Please verify connection and retry.';
        setConversations((prev) =>
          prev.map((c) => {
            if (c.id !== targetConvId) return c;
            return {
              ...c,
              messages: c.messages.map((m) =>
                m.id === assistantMessageId
                  ? {
                      ...m,
                      content: errMsg,
                      isError: true,
                    }
                  : m
              ),
            };
          })
        );
      }
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  };

  // Regenerate last assistant response
  const handleRegenerate = () => {
    if (!activeConversation || isGenerating) return;
    const msgs = activeConversation.messages;
    if (msgs.length === 0) return;

    // Find the last assistant message
    const lastMsg = msgs[msgs.length - 1];
    if (lastMsg.role !== 'assistant') return;

    // Remove the last assistant message
    const truncated = msgs.slice(0, -1);
    // Find the preceding user message
    const lastUserMsg = truncated[truncated.length - 1];
    if (!lastUserMsg) return;

    handleSendMessage(
      lastUserMsg.content,
      lastUserMsg.attachments || [],
      truncated
    );
  };

  // Retry when last message encountered an error
  const handleRetry = () => {
    handleRegenerate();
  };

  return (
    <div
      className={`flex h-screen w-screen overflow-hidden ${
        isDark ? 'bg-neutral-950 text-neutral-100' : 'bg-neutral-100 text-neutral-900'
      }`}
    >
      {/* Collapsible Left Sidebar */}
      <Sidebar
        conversations={conversations}
        activeId={activeId}
        onSelectConversation={handleSelectConversation}
        onNewConversation={() => handleNewConversation()}
        onDeleteConversation={handleDeleteConversation}
        onRenameConversation={handleRenameConversation}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenClearModal={() => setIsClearModalOpen(true)}
        isOpen={isSidebarOpen}
        onToggleOpen={() => setIsSidebarOpen(!isSidebarOpen)}
        isDark={isDark}
        onToggleTheme={handleToggleTheme}
        activeMode={currentMode}
        onSelectMode={handleSelectMode}
      />

      {/* Main Conversation Layout */}
      <main className="flex-1 flex flex-col h-full min-w-0 relative">
        {/* Top Header */}
        <Header
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          activeMode={currentMode}
          onSelectMode={handleSelectMode}
          title={activeConversation?.title}
          onNewChat={() => handleNewConversation()}
          isDark={isDark}
          onToggleTheme={handleToggleTheme}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />

        {/* Conversation Message Area or Welcome Screen */}
        <div className="flex-1 overflow-y-auto flex flex-col scrollbar-thin">
          {!activeConversation || activeConversation.messages.length === 0 ? (
            <WelcomeScreen
              activeMode={currentMode}
              onSelectPrompt={(text) => handleSendMessage(text)}
              onSelectMode={handleSelectMode}
              isDark={isDark}
            />
          ) : (
            <div className="flex-1 flex flex-col divide-y divide-inherit">
              {activeConversation.messages.map((msg, index) => {
                const isLast = index === activeConversation.messages.length - 1;
                return (
                  <MessageItem
                    key={msg.id}
                    message={msg}
                    isLast={isLast}
                    isStreaming={isGenerating && isLast && msg.role === 'assistant'}
                    onRegenerate={isLast && msg.role === 'assistant' ? handleRegenerate : undefined}
                    onRetry={msg.isError ? handleRetry : undefined}
                    isDark={isDark}
                  />
                );
              })}
              <div ref={messagesEndRef} className="h-4 shrink-0" />
            </div>
          )}
        </div>

        {/* Fixed Bottom Message Input */}
        <footer className="shrink-0 bg-transparent pt-1">
          <ChatInput
            onSendMessage={handleSendMessage}
            onStopGeneration={handleStopGeneration}
            isGenerating={isGenerating}
            isDark={isDark}
          />
        </footer>
      </main>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={setSettings}
        isDark={isDark}
      />

      {/* Clear Confirmation Modal */}
      <ClearConfirmModal
        isOpen={isClearModalOpen}
        onClose={() => setIsClearModalOpen(false)}
        onConfirmClear={handleConfirmClearAll}
        isDark={isDark}
      />
    </div>
  );
}
