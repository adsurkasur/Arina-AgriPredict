import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Message, ChartConfig, UIState } from '@/types';

interface AppState {
  // UI State
  ui: UIState;
  
  // Chat State
  chatMessages: Message[];
  isAiTyping: boolean;
  
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
  setForecastConfig: (config: Partial<ChartConfig>) => void;
  setForecasting: (forecasting: boolean) => void;
  setSelectedRowIds: (ids: string[]) => void;
  clearChat: () => void;
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
      
      setAiTyping: (typing) =>
        set({ isAiTyping: typing }),
      
      setForecastConfig: (config) =>
        set((state) => ({
          forecastConfig: { ...state.forecastConfig, ...config },
        })),
      
      setForecasting: (forecasting) =>
        set({ isForecasting: forecasting }),
      
      setSelectedRowIds: (ids) =>
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
        // Don't persist chat messages for privacy
      }),
    }
  )
);