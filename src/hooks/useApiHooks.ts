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

// Helper function to extract error message
const getErrorMessage = (error: unknown): string => {
  return typeof error === 'object' && error !== null && 'message' in error
    ? (error as { message?: string }).message || "An unexpected error occurred"
    : "An unexpected error occurred";
};

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
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success("Record added successfully", {
        description: "The new demand record has been created."
      });
    },
    onError: (error: unknown) => {
      toast.error("Error adding record", {
        description: getErrorMessage(error)
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
      toast.error("Error updating record", {
        description: getErrorMessage(error)
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
      toast.error("Error deleting record", {
        description: getErrorMessage(error)
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
      toast.error("Error generating forecast", {
        description: getErrorMessage(error)
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
      toast.error("Error sending message", {
        description: getErrorMessage(error)
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
    gcTime: 1000 * 60 * 30, // 30 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
}

// Process data hooks
export function useProcessData() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (text: string) => demandsApi.processData(text),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['demands'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success("Data processed successfully", {
        description: `Processed ${data.processed} records from your input.`
      });
    },
    onError: (error: unknown) => {
      toast.error("Error processing data", {
        description: getErrorMessage(error)
      });
    },
  });
}