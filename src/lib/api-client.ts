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
import { auth } from './firebase';
import { getIdToken } from 'firebase/auth';

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

// Request interceptor to add auth token
apiClient.interceptors.request.use(async (config) => {
  if (auth.currentUser) {
    try {
      const token = await getIdToken(auth.currentUser);
      config.headers.Authorization = `Bearer ${token}`;
    } catch (error) {
      console.error('Error getting ID token:', error);
    }
  }
  return config;
});

// Demands API
export const demandsApi = {
  // Get paginated demands with filtering and sorting
  async getDemands(params: DemandQueryParams = {}): Promise<DemandResponse> {
    // Always use real API - remove mock data dependency
    const response = await apiClient.get<DemandResponse>('/demands', { params });
    return response.data;
  },

  // Create new demand record
  async createDemand(data: CreateDemandRequest) {
    const response = await apiClient.post('/demands', data);
    return response.data;
  },

  // Update existing demand record
  async updateDemand(id: string, data: UpdateDemandRequest) {
    const response = await apiClient.put(`/demands/${id}`, data);
    return response.data;
  },

  // Delete demand record
  async deleteDemand(id: string) {
    const response = await apiClient.delete(`/demands/${id}`);
    return response.data;
  },

  // Process unstructured text data with AI
  async processData(text: string) {
    const response = await apiClient.post('/demands/process', { text });
    return response.data;
  },
};

// Forecast API
export const forecastApi = {
  // Generate forecast for product
  async generateForecast(data: ForecastRequest): Promise<ForecastResponse> {
    const response = await apiClient.post<ForecastResponse>('/forecast', data);
    return response.data;
  },
};

// Chat API
export const chatApi = {
  // Send message to AI assistant
  async sendMessage(data: ChatRequest): Promise<ChatResponse> {
    // Always use real API for chat to enable AI functionality
    const response = await apiClient.post<ChatResponse>('/chat', data);
    return response.data;
  },
};

// Products API
export const productsApi = {
  // Get all available products
  async getProducts(): Promise<Product[]> {
    const response = await apiClient.get<Product[]>('/products');
    return response.data;
  },
};

export default apiClient;