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
        set((state) => {
          const newMessages = [...state.chatMessages, message];
          let updatedSessions = { ...state.chatSessions };
          
          // Update the current chat session with the new messages
          if (state.currentChatId && state.chatSessions[state.currentChatId]) {
            updatedSessions[state.currentChatId] = {
              ...state.chatSessions[state.currentChatId],
              messages: newMessages
            };
          }
          
          // If this is the first user message and the chat name is still generic, update it
          if (message.role === 'user' && state.currentChatId && state.chatMessages.length === 0) {
            const currentSession = updatedSessions[state.currentChatId];
            if (currentSession && currentSession.name.startsWith('Chat ')) {
              // Generate a title from the first message (truncate to 50 chars)
              const titleFromMessage = message.content.length > 50 
                ? message.content.substring(0, 50) + '...'
                : message.content;
              
              updatedSessions[state.currentChatId] = {
                ...currentSession,
                name: titleFromMessage
              };
            }
          }
          
          return {
            chatMessages: newMessages,
            chatSessions: updatedSessions
          };
        }),
      
      setChatMessages: (messages) =>
        set({ chatMessages: messages }),
      
      setAiTyping: (typing: boolean) =>
        set({ isAiTyping: typing }),
      
      setCurrentChatId: (id: string | null) =>
        set({ currentChatId: id }),
      
      createNewChat: (name?: string) => {
        const chatId = `chat-${Date.now()}`;
        
        set((state) => {
          let chatName = name;
          
          if (!chatName) {
            // Generate unique name by checking existing names
            const existingNames = Object.values(state.chatSessions).map((session: any) => session.name);
            let counter = 1;
            do {
              chatName = `Chat ${counter}`;
              counter++;
            } while (existingNames.includes(chatName));
          }
          
          return {
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
          };
        });
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
          
          let newCurrentId = state.currentChatId;
          let newMessages = state.chatMessages;
          
          // If we're deleting the current chat
          if (state.currentChatId === id) {
            const remainingChatIds = Object.keys(newSessions);
            
            if (remainingChatIds.length > 0) {
              // Switch to the most recent chat (last in the array)
              const mostRecentChatId = remainingChatIds[remainingChatIds.length - 1];
              newCurrentId = mostRecentChatId;
              newMessages = newSessions[mostRecentChatId].messages;
            } else {
              // No chats left, go to "no chat" state
              newCurrentId = null;
              newMessages = [];
            }
          }
          
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