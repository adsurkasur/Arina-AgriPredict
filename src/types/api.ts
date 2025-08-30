// Core API types for AgriPredict platform

export interface DemandRecord {
  id: string;
  date: string; // ISO string
  productName: string;
  productId: string;
  quantity: number;
  price: number;
}

export interface DemandResponse {
  data: DemandRecord[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
  };
}

export interface DemandQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortKey?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateDemandRequest {
  date: string; // ISO string
  productId: string;
  quantity: number;
  price: number;
}

export interface UpdateDemandRequest {
  date?: string;
  productId?: string;
  quantity?: number;
  price?: number;
}

export interface ForecastRequest {
  productId: string;
  days: number;
}

export interface ForecastDataPoint {
  date: string; // ISO string
  predictedValue: number;
}

export interface ForecastResponse {
  forecastData: ForecastDataPoint[];
  summary: string; // AI-generated interpretation in Markdown
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  suggestions?: string[];
}

export interface ChatRequest {
  message: string;
  history: Message[];
}

export interface ChatResponse {
  response: {
    id: string;
    role: 'assistant';
    content: string; // Markdown format
    suggestions: string[];
    actionTaken: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'FORECAST' | 'NONE';
    requiresRefetch: boolean;
  };
}

export interface Product {
  id: string;
  name: string;
  category: string;
  unit: string;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

// API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}