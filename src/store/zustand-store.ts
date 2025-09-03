import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Message, ChartConfig, UIState } from '@/types';

interface AppState {
  // UI State
  ui: UIState;
  
  // Chat State
  chatMessages: Message[];
  isAiTyping: boolean;
  currentChatId: string | null;
  chatSessions: { [key: string]: { name: string; messages: Message[]; createdAt: string } };
  
  // Forecast State
  forecastConfig: ChartConfig;
  isForecasting: boolean;
  
  // Table State
  selectedRowIds: string[];
  
  // Actions
  setUI: (updates: Partial<UIState>) => void;
  addChatMessage: (message: Message) => void;
  setChatMessages: (messages: Message[]) => void;
  setAiTyping: (typing: boolean) => void;
  setCurrentChatId: (_id: string | null) => void;
  createNewChat: (_name?: string) => string;
  loadChat: (_id: string) => void;
  renameChat: (_id: string, _name: string) => void;
  deleteChat: (_id: string) => void;
  clearChat: () => void;
  setForecastConfig: (config: Partial<ChartConfig>) => void;
  setForecasting: (forecasting: boolean) => void;
  setSelectedRowIds: (ids: string[]) => void;
  reset: () => void;
}

const initialState = {
  ui: {
    sidebarCollapsed: false,
    activePanel: 'data' as const,
    theme: 'light' as const,
  },
  chatMessages: [],
  isAiTyping: false,
  currentChatId: null,
  chatSessions: {},
  forecastConfig: {
    showForecast: false,
    forecastDays: 14,
    selectedProductId: null,
  },
  isForecasting: false,
  selectedRowIds: [],
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      ...initialState,
      
      setUI: (updates) =>
        set((state) => ({
          ui: { ...state.ui, ...updates },
        })),
      
      addChatMessage: (message) =>
        set((state) => ({
          chatMessages: [...state.chatMessages, message],
        })),
      
      setChatMessages: (messages) =>
        set({ chatMessages: messages }),
      
      setAiTyping: (typing: boolean) =>
        set({ isAiTyping: typing }),
      
      setCurrentChatId: (id: string | null) =>
        set({ currentChatId: id }),
      
      createNewChat: (name?: string) => {
        const chatId = `chat-${Date.now()}`;
        const chatName = name || `Chat ${Object.keys(initialState.chatSessions).length + 1}`;
        set((state) => ({
          currentChatId: chatId,
          chatSessions: {
            ...state.chatSessions,
            [chatId]: {
              name: chatName,
              messages: [],
              createdAt: new Date().toISOString(),
            },
          },
          chatMessages: [],
        }));
        return chatId;
      },
      
      loadChat: (id: string) =>
        set((state) => {
          const session = state.chatSessions[id];
          if (session) {
            return {
              currentChatId: id,
              chatMessages: session.messages,
            };
          }
          return state;
        }),
      
      renameChat: (id: string, name: string) =>
        set((state) => ({
          chatSessions: {
            ...state.chatSessions,
            [id]: {
              ...state.chatSessions[id],
              name,
            },
          },
        })),
      
      deleteChat: (id: string) =>
        set((state) => {
          const newSessions = { ...state.chatSessions };
          delete newSessions[id];
          
          const newCurrentId = state.currentChatId === id ? null : state.currentChatId;
          const newMessages = state.currentChatId === id ? [] : state.chatMessages;
          
          return {
            chatSessions: newSessions,
            currentChatId: newCurrentId,
            chatMessages: newMessages,
          };
        }),
      
      setForecastConfig: (config: Partial<ChartConfig>) =>
        set((state) => ({
          forecastConfig: { ...state.forecastConfig, ...config },
        })),
      
      setForecasting: (forecasting: boolean) =>
        set({ isForecasting: forecasting }),
      
      setSelectedRowIds: (ids: string[]) =>
        set({ selectedRowIds: ids }),
      
      clearChat: () =>
        set({ chatMessages: [], isAiTyping: false }),
      
      reset: () =>
        set(initialState),
    }),
    {
      name: 'agripredict-store',
      partialize: (state) => ({
        ui: state.ui,
        forecastConfig: state.forecastConfig,
        chatMessages: state.chatMessages,
        currentChatId: state.currentChatId,
        chatSessions: state.chatSessions,
      }),
    }
  )
);