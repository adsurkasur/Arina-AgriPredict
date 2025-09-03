import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/lib/toast';
import {
  demandsApi,
  forecastApi,
  chatApi,
  productsApi
} from '@/lib/api-client';
import {
  DemandQueryParams,
  CreateDemandRequest,
  UpdateDemandRequest,
  ForecastRequest,
  ChatRequest
} from '@/types/api';

// Demands hooks
export function useDemands(params: DemandQueryParams = {}) {
  return useQuery({
    queryKey: ['demands', params],
    queryFn: () => demandsApi.getDemands(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useCreateDemand() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDemandRequest) => demandsApi.createDemand(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['demands'] });
      toast.success("Record added successfully", {
        description: "The new demand record has been created."
      });
    },
    onError: (error: unknown) => {
      const message = typeof error === 'object' && error !== null && 'message' in error ? (error as { message?: string }).message : undefined;
      toast.error("Error adding record", {
        description: message || "Failed to create demand record."
      });
    },
  });
}

export function useUpdateDemand() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDemandRequest }) =>
      demandsApi.updateDemand(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['demands'] });
      toast.success("Record updated successfully", {
        description: "The demand record has been updated."
      });
    },
    onError: (error: unknown) => {
      const message = typeof error === 'object' && error !== null && 'message' in error ? (error as { message?: string }).message : undefined;
      toast.error("Error updating record", {
        description: message || "Failed to update demand record."
      });
    },
  });
}

export function useDeleteDemand() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => demandsApi.deleteDemand(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['demands'] });
      toast.success("Record deleted successfully", {
        description: "The demand record has been removed."
      });
    },
    onError: (error: unknown) => {
      const message = typeof error === 'object' && error !== null && 'message' in error ? (error as { message?: string }).message : undefined;
      toast.error("Error deleting record", {
        description: message || "Failed to delete demand record."
      });
    },
  });
}

// Forecast hooks
export function useForecast() {
  return useMutation({
    mutationFn: (data: ForecastRequest) => forecastApi.generateForecast(data),
    onSuccess: (data) => {
      toast.success("Forecast generated successfully", {
        description: `Generated ${data.forecastData.length} day forecast.`
      });
    },
    onError: (error: unknown) => {
      const message = typeof error === 'object' && error !== null && 'message' in error ? (error as { message?: string }).message : undefined;
      toast.error("Error generating forecast", {
        description: message || "Failed to generate forecast."
      });
    },
  });
}

// Chat hooks
export function useChat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ChatRequest) => chatApi.sendMessage(data),
    onSuccess: (response) => {
      // If AI action requires data refetch, invalidate relevant queries
      if (response.response.requiresRefetch) {
        queryClient.invalidateQueries({ queryKey: ['demands'] });
        toast.success("AI action completed", {
          description: "Data has been updated based on your request."
        });
      } else {
        toast.success("AI response received", {
          description: "Your message has been processed successfully."
        });
      }
    },
    onError: (error: unknown) => {
      const message = typeof error === 'object' && error !== null && 'message' in error ? (error as { message?: string }).message : undefined;
      toast.error("Error sending message", {
        description: message || "Failed to communicate with AI assistant."
      });
    },
  });
}

// Products hooks
export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: () => productsApi.getProducts(),
    staleTime: 1000 * 60 * 15, // 15 minutes
  });
}