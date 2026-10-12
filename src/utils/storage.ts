import { AppSettings, AssistantModeId, Conversation } from '../types';

const STORAGE_KEY_CONVERSATIONS = 'nexus_ai_conversations_v1';
const STORAGE_KEY_ACTIVE_ID = 'nexus_ai_active_conv_id';
const STORAGE_KEY_SETTINGS = 'nexus_ai_settings_v1';

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  temperature: 0.7,
  customSystemPrompt: '',
  responseStyle: 'detailed',
  codeWrapping: true,
};

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
}

export function loadConversations(): Conversation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CONVERSATIONS);
    if (!raw) return [];
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch (e) {
    console.error('Failed to load conversations:', e);
    return [];
  }
}

export function saveConversations(conversations: Conversation[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_CONVERSATIONS, JSON.stringify(conversations));
  } catch (e) {
    console.error('Failed to save conversations:', e);
  }
}

export function loadActiveConversationId(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY_ACTIVE_ID);
  } catch (e) {
    return null;
  }
}

export function saveActiveConversationId(id: string | null): void {
  try {
    if (id) {
      localStorage.setItem(STORAGE_KEY_ACTIVE_ID, id);
    } else {
      localStorage.removeItem(STORAGE_KEY_ACTIVE_ID);
    }
  } catch (e) {
    console.error('Failed to save active conversation ID:', e);
  }
}

export function createNewConversation(mode: AssistantModeId = 'general'): Conversation {
  return {
    id: `conv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    title: 'New Conversation',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    mode,
    messages: [],
  };
}
