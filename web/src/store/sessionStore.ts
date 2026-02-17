import { create } from 'zustand';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface SessionState {
  sessionId: string | null;
  messages: Message[];
  isLoading: boolean;
  createSession: () => Promise<void>;
  addMessage: (role: 'user' | 'assistant', content: string) => void;
  clearMessages: () => void;
  setSessionId: (id: string) => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  sessionId: null,
  messages: [],
  isLoading: false,

  createSession: async () => {
    try {
      const response = await fetch('http://localhost:8000/api/sessions/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      set({ sessionId: data.sessionId });
    } catch (error) {
      console.error('Failed to create session:', error);
    }
  },

  addMessage: (role: 'user' | 'assistant', content: string) => {
    set((state) => ({
      messages: [...state.messages, { role, content, timestamp: new Date() }]
    }));
  },

  clearMessages: () => {
    set({ messages: [] });
  },

  setSessionId: (id: string) => {
    set({ sessionId: id });
  }
}));
