import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowUp,
  Square,
  Paperclip,
  Mic,
  MicOff,
  X,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { MessageAttachment } from '../types';
import { parseUploadedFile, formatFileSize } from '../utils/fileParser';

interface ChatInputProps {
  onSendMessage: (content: string, attachments: MessageAttachment[]) => void;
  onStopGeneration: () => void;
  isGenerating: boolean;
  disabled?: boolean;
  isDark: boolean;
  placeholder?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  onStopGeneration,
  isGenerating,
  disabled = false,
  isDark,
  placeholder,
}) => {
  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState<MessageAttachment[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Dynamic placeholder
  const activePlaceholder =
    placeholder ||
    (attachments.length > 0
      ? 'Ask a question about the attached file(s), or press Enter to analyze...'
      : 'Ask NEXUS AI anything... (Shift+Enter for new line)');

  // Auto-resize textarea based on content
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [input]);

  // Speech Recognition setup (Web Speech API)
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      setUploadError('Voice input is not supported in this browser. Please use Chrome, Edge, or Safari.');
      setTimeout(() => setUploadError(null), 4000);
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.error('Failed to start speech recognition:', err);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (isGenerating) {
      onStopGeneration();
      return;
    }

    const trimmed = input.trim();
    if (!trimmed && attachments.length === 0) return;

    onSendMessage(trimmed, attachments);
    setInput('');
    setAttachments([]);
    setUploadError(null);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadError(null);
    const newAttachments: MessageAttachment[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const parsed = await parseUploadedFile(file);
        newAttachments.push(parsed);
      } catch (err: any) {
        setUploadError(err.message || `Failed to read file ${file.name}`);
        setTimeout(() => setUploadError(null), 5000);
      }
    }

    if (newAttachments.length > 0) {
      setAttachments((prev) => [...prev, ...newAttachments]);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const hasContent = input.trim().length > 0 || attachments.length > 0;

  return (
    <div className="w-full max-w-3xl mx-auto px-3 sm:px-6 pb-4">
      {/* Upload Error Banner */}
      {uploadError && (
        <div className="mb-2.5 px-3 py-2 rounded-xl text-xs bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300 flex items-center justify-between font-medium">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{uploadError}</span>
          </div>
          <button onClick={() => setUploadError(null)} className="text-rose-500 hover:text-rose-700 dark:hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Attached Files Preview Chips */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2 px-1">
          {attachments.map((att) => (
            <div
              key={att.id}
              className={`flex items-center gap-2 pl-2.5 pr-2 py-1.5 rounded-xl border text-xs shadow-xs transition-all ${
                isDark
                  ? 'bg-neutral-800/90 border-neutral-700/80 text-neutral-100'
                  : 'bg-white border-neutral-300 text-neutral-900 shadow-xs'
              }`}
            >
              {att.previewUrl ? (
                <img
                  src={att.previewUrl}
                  alt={att.name}
                  className="w-5 h-5 rounded-md object-cover shrink-0 border border-neutral-300 dark:border-neutral-700"
                />
              ) : (
                <FileText className="w-4 h-4 text-indigo-500 shrink-0" />
              )}
              <span className="font-semibold max-w-[140px] truncate">{att.name}</span>
              <span className={`text-[10px] ${isDark ? 'text-neutral-400' : 'text-neutral-500 font-medium'}`}>
                {formatFileSize(att.size)}
              </span>
              <button
                type="button"
                onClick={() => removeAttachment(att.id)}
                className={`p-0.5 rounded-md ml-0.5 transition-colors ${
                  isDark
                    ? 'text-neutral-400 hover:text-rose-400 hover:bg-neutral-700/40'
                    : 'text-neutral-500 hover:text-rose-600 hover:bg-neutral-100'
                }`}
                title="Remove attachment"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Main Input Box */}
      <div
        className={`relative rounded-2xl border transition-all shadow-md ${
          isDark
            ? 'bg-neutral-900/90 border-neutral-800 focus-within:border-indigo-500/80 focus-within:ring-2 focus-within:ring-indigo-500/20'
            : 'bg-white border-neutral-300 focus-within:border-indigo-600 focus-within:ring-2 focus-within:ring-indigo-500/15'
        }`}
      >
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={activePlaceholder}
          disabled={disabled}
          rows={1}
          className={`w-full max-h-48 resize-none py-3.5 pl-4 pr-32 text-sm leading-relaxed rounded-2xl outline-hidden scrollbar-thin ${
            isDark
              ? 'text-neutral-100 placeholder:text-neutral-500 bg-transparent'
              : 'text-neutral-900 placeholder:text-neutral-500 font-normal bg-transparent'
          }`}
        />

        {/* Input Action Controls (Attachment, Mic, Send) */}
        <div className="absolute right-2.5 bottom-2.5 flex items-center gap-1">
          {/* File Attachment Button */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || isGenerating}
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              isDark
                ? 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
            title="Attach documents, PDFs, code, or images"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          {/* Microphone Voice Button */}
          <button
            type="button"
            onClick={toggleRecording}
            disabled={disabled || isGenerating}
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              isRecording
                ? 'bg-rose-500/20 text-rose-500 animate-pulse'
                : isDark
                ? 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
            title={isRecording ? 'Stop voice recording' : 'Voice input (Speech to Text)'}
          >
            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          {/* Send or Stop Generation Button */}
          {isGenerating ? (
            <button
              type="button"
              onClick={onStopGeneration}
              className="p-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/20 active:scale-95 transition-all cursor-pointer"
              title="Stop generating"
            >
              <Square className="w-4 h-4 fill-current" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSend}
              disabled={!hasContent || disabled}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                hasContent
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/25 active:scale-95'
                  : isDark
                  ? 'bg-neutral-800 text-neutral-600 cursor-not-allowed'
                  : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
              }`}
              title="Send message (Enter)"
            >
              <ArrowUp className="w-4 h-4 stroke-[2.5]" />
            </button>
          )}
        </div>
      </div>

      <div
        className={`flex items-center justify-between mt-2 px-1 text-[11px] ${
          isDark ? 'text-neutral-400' : 'text-neutral-600 font-medium'
        }`}
      >
        <span className="truncate">
          Attach any file (PDF, code, text, CSV) and ask questions to get grounded AI answers.
        </span>
        <span className="hidden sm:inline-block shrink-0 ml-2">
          Press <kbd className="px-1.5 py-0.5 rounded bg-neutral-200/80 dark:bg-neutral-800/60 border border-neutral-300 dark:border-neutral-700 font-mono text-[10px] text-neutral-800 dark:text-neutral-300">Enter ↵</kbd> to send
        </span>
      </div>
    </div>
  );
};
