import React, { useState, useEffect, useRef } from 'react';
import {
  Copy,
  Check,
  RotateCcw,
  Volume2,
  VolumeX,
  FileText,
  AlertCircle,
  Sparkles,
  User,
} from 'lucide-react';
import { ChatMessage } from '../types';
import { renderMarkdown } from '../utils/markdown';
import { formatFileSize } from '../utils/fileParser';

interface MessageItemProps {
  message: ChatMessage;
  isLast: boolean;
  isStreaming: boolean;
  onRegenerate?: () => void;
  onRetry?: () => void;
  isDark: boolean;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  isLast,
  isStreaming,
  onRegenerate,
  onRetry,
  isDark,
}) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // Copy full response text to clipboard
  const handleCopyResponse = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy message:', err);
    }
  };

  // Text-To-Speech using native browser SpeechSynthesis
  const toggleSpeech = () => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel(); // Reset any previous speech
    const cleanText = message.content.replace(/[#*`_~]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  useEffect(() => {
    return () => {
      if (isSpeaking && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isSpeaking]);

  // Handle delegated clicks on "Copy Code" buttons inside rendered markdown
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const handleCodeCopy = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('.copy-code-btn') as HTMLButtonElement | null;
      if (!target) return;

      const codeToCopy = target.getAttribute('data-code');
      if (codeToCopy) {
        navigator.clipboard.writeText(codeToCopy).then(() => {
          const label = target.querySelector('.copy-label');
          if (label) {
            const originalText = label.textContent;
            label.textContent = 'Copied!';
            target.classList.add('text-emerald-400');
            setTimeout(() => {
              label.textContent = originalText;
              target.classList.remove('text-emerald-400');
            }, 2000);
          }
        });
      }
    };

    el.addEventListener('click', handleCodeCopy);
    return () => el.removeEventListener('click', handleCodeCopy);
  }, [message.content]);

  const renderedHtml = !isUser ? renderMarkdown(message.content) : '';

  return (
    <div
      className={`group w-full py-5 px-3 sm:px-6 transition-colors ${
        isUser
          ? isDark
            ? 'bg-neutral-900/40 border-b border-neutral-800/40'
            : 'bg-neutral-100/70 border-b border-neutral-200/80'
          : isDark
          ? 'bg-neutral-950/20'
          : 'bg-white'
      }`}
    >
      <div className="max-w-3xl mx-auto flex gap-3.5 sm:gap-4.5">
        {/* Avatar */}
        <div className="shrink-0 mt-0.5">
          {isUser ? (
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-neutral-800 to-neutral-700 text-white flex items-center justify-center shadow-xs">
              <User className="w-4 h-4" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
          )}
        </div>

        {/* Message Content Body */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span
              className={`font-bold text-xs tracking-tight ${
                isDark ? 'text-neutral-200' : 'text-neutral-900'
              }`}
            >
              {isUser ? 'You' : 'NEXUS AI'}
            </span>
            <span
              className={`text-[10px] ${
                isDark ? 'text-neutral-400' : 'text-neutral-500'
              }`}
            >
              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          {/* User Attachments Preview */}
          {isUser && message.attachments && message.attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {message.attachments.map((att) => (
                <div
                  key={att.id}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs max-w-sm ${
                    isDark
                      ? 'bg-neutral-800/90 border-neutral-700/70 text-neutral-200'
                      : 'bg-white border-neutral-300 text-neutral-900 shadow-xs'
                  }`}
                >
                  {att.previewUrl ? (
                    <img
                      src={att.previewUrl}
                      alt={att.name}
                      className="w-7 h-7 rounded-lg object-cover shrink-0 border border-neutral-300 dark:border-neutral-700"
                    />
                  ) : (
                    <div className="p-1 rounded-md bg-indigo-500/10 text-indigo-500 shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className={`font-semibold truncate ${isDark ? 'text-neutral-100' : 'text-neutral-900'}`}>
                      {att.name}
                    </p>
                    <p className={`text-[10px] ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
                      {formatFileSize(att.size)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error Message Box */}
          {message.isError ? (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
              <div className="flex-1">
                <p className="font-bold">Generation Error</p>
                <p className="mt-0.5 opacity-90">{message.content}</p>
                {onRetry && (
                  <button
                    onClick={onRetry}
                    className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white transition-colors cursor-pointer shadow-xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Retry Request</span>
                  </button>
                )}
              </div>
            </div>
          ) : isUser ? (
            /* User text with crystal clear high contrast */
            <div
              className={`text-sm leading-relaxed whitespace-pre-wrap font-normal ${
                isDark ? 'text-neutral-100' : 'text-neutral-900'
              }`}
            >
              {message.content}
            </div>
          ) : (
            /* AI Markdown Response with high contrast */
            <div>
              <div
                ref={contentRef}
                className={`markdown-body text-sm leading-relaxed ${
                  isDark ? 'text-neutral-100' : 'text-neutral-900'
                }`}
                dangerouslySetInnerHTML={{ __html: renderedHtml }}
              />
              {isStreaming && isLast && (
                <span className="streaming-cursor" title="Generating..." />
              )}
            </div>
          )}

          {/* AI Response Action Toolbar */}
          {!isUser && !message.isError && message.content && (
            <div className="flex items-center gap-1 mt-3.5 pt-1">
              <button
                onClick={handleCopyResponse}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  isDark
                    ? 'text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200'
                    : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                }`}
                title="Copy entire response"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500 stroke-[2.5]" />
                    <span className="text-emerald-500 font-semibold">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>

              {'speechSynthesis' in window && (
                <button
                  onClick={toggleSpeech}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    isDark
                      ? 'text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200'
                      : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                  }`}
                  title={isSpeaking ? 'Stop reading' : 'Read response aloud'}
                >
                  {isSpeaking ? (
                    <>
                      <VolumeX className="w-3.5 h-3.5 text-indigo-500" />
                      <span className="text-indigo-500 font-semibold">Stop</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Read Aloud</span>
                    </>
                  )}
                </button>
              )}

              {isLast && onRegenerate && !isStreaming && (
                <button
                  onClick={onRegenerate}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    isDark
                      ? 'text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200'
                      : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                  }`}
                  title="Regenerate this response"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Regenerate</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
