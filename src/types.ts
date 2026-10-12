export type AssistantModeId = 'general' | 'coding' | 'writing' | 'study' | 'creative';

export interface AssistantMode {
  id: AssistantModeId;
  name: string;
  tagline: string;
  description: string;
  icon: string;
  color: string;
  badgeBg: string;
  starterPrompts: {
    title: string;
    description: string;
    prompt: string;
  }[];
}

export interface MessageAttachment {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  textContent?: string;
  base64Data?: string;
  previewUrl?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  attachments?: MessageAttachment[];
  isError?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  mode: AssistantModeId;
  messages: ChatMessage[];
}

export interface AppSettings {
  theme: 'dark' | 'light' | 'system';
  temperature: number;
  customSystemPrompt: string;
  responseStyle: 'detailed' | 'concise';
  codeWrapping: boolean;
}
