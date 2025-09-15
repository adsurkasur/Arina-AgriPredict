// Core API types for AgriPredict platform

export interface DemandRecord {
  id: string;
  date: string; // ISO string
  productName: string;
  productId: string;
  quantity: number;
  price: number;
  unit: string;
  userId?: string;
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
  // Filter parameters
  dateFrom?: string;
  dateTo?: string;
  priceMin?: number;
  priceMax?: number;
  quantityMin?: number;
  quantityMax?: number;
  productIds?: string[];
}

export interface CreateDemandRequest {
  date: string; // ISO string
  productName: string;
  quantity: number;
  price: number;
  unit: string;
}

export interface UpdateDemandRequest {
  date?: string;
  productId?: string;
  productName?: string;
  quantity?: number;
  price?: number;
  unit?: string;
}

export interface ForecastDataPoint {
  date: string; // ISO string
  predictedValue: number;
  confidenceLower?: number;
  confidenceUpper?: number;
  modelUsed?: string;
}

export interface ForecastRequest {
  productId: string;
  days: number;
  sellingPrice?: number;
  // Enhanced options
  dateFrom?: string;
  dateTo?: string;
  models?: string[];
  includeConfidence?: boolean;
  scenario?: 'optimistic' | 'pessimistic' | 'realistic';
}

export interface RevenueProjection {
  date: string;
  projectedQuantity: number;
  sellingPrice: number;
  projectedRevenue: number;
  confidenceLower?: number;
  confidenceUpper?: number;
}

export interface ForecastResponse {
  forecastData: ForecastDataPoint[];
  revenueProjection?: RevenueProjection[];
  modelsUsed?: string[];
  summary: string; // AI-generated interpretation in Markdown
  confidence?: number;
  scenario?: string;
  metadata?: {
    dataPoints: number;
    forecastHorizon: number;
    lastTrainingDate: string;
  };
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
  details?: unknown;
}

// API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}