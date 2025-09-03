import axios, { AxiosResponse } from 'axios';
import {
  DemandResponse,
  DemandQueryParams,
  CreateDemandRequest,
  UpdateDemandRequest,
  ForecastRequest,
  ForecastResponse,
  ChatRequest,
  ChatResponse,
  Product,
} from '@/types/api';
import { mockApi } from './mock-api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';

// Configure axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for consistent error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    const apiError = {
      message: error.response?.data?.message || error.message || 'An unexpected error occurred',
      code: error.response?.status?.toString(),
      details: error.response?.data,
    };
    return Promise.reject(apiError);
  }
);

// Use mock API in development, real API in production
const isDevelopment = process.env.NODE_ENV === 'development';

// Demands API
export const demandsApi = {
  // Get paginated demands with filtering and sorting
  async getDemands(params: DemandQueryParams = {}): Promise<DemandResponse> {
    if (isDevelopment) {
      return mockApi.getDemands(params);
    }
    const response = await apiClient.get<DemandResponse>('/demands', { params });
    return response.data;
  },

  // Create new demand record
  async createDemand(data: CreateDemandRequest) {
    if (isDevelopment) {
      return mockApi.createDemand(data);
    }
    const response = await apiClient.post('/demands', data);
    return response.data;
  },

  // Update existing demand record
  async updateDemand(id: string, data: UpdateDemandRequest) {
    if (isDevelopment) {
      return mockApi.updateDemand(id, data);
    }
    const response = await apiClient.put(`/demands/${id}`, data);
    return response.data;
  },

  // Delete demand record
  async deleteDemand(id: string) {
    if (isDevelopment) {
      return mockApi.deleteDemand(id);
    }
    const response = await apiClient.delete(`/demands/${id}`);
    return response.data;
  },
};

// Forecast API
export const forecastApi = {
  // Generate forecast for product
  async generateForecast(data: ForecastRequest): Promise<ForecastResponse> {
    if (isDevelopment) {
      return mockApi.generateForecast(data.productId, data.days);
    }
    const response = await apiClient.post<ForecastResponse>('/forecast', data);
    return response.data;
  },
};

// Chat API
export const chatApi = {
  // Send message to AI assistant
  async sendMessage(data: ChatRequest): Promise<ChatResponse> {
    if (isDevelopment) {
      return mockApi.sendChatMessage(data.message);
    }
    const response = await apiClient.post<ChatResponse>('/chat', data);
    return response.data;
  },
};

// Products API
export const productsApi = {
  // Get all available products
  async getProducts(): Promise<Product[]> {
    if (isDevelopment) {
      // Mock data
      return [
        { id: 'red-chili', name: 'Red Chili', category: 'Spices', unit: 'kg' },
        { id: 'onions', name: 'Onions', category: 'Vegetables', unit: 'kg' },
        { id: 'tomatoes', name: 'Tomatoes', category: 'Vegetables', unit: 'kg' },
        { id: 'potatoes', name: 'Potatoes', category: 'Vegetables', unit: 'kg' },
        { id: 'rice', name: 'Rice', category: 'Grains', unit: 'kg' },
        { id: 'wheat', name: 'Wheat', category: 'Grains', unit: 'kg' }
      ];
    }
    const response = await apiClient.get<Product[]>('/products');
    return response.data;
  },
};

export default apiClient;