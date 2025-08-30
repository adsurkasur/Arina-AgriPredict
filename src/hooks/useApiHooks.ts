import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
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
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: (data: CreateDemandRequest) => demandsApi.createDemand(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['demands'] });
      toast({
        title: "Record added successfully",
        description: "The new demand record has been created.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error adding record",
        description: error.message || "Failed to create demand record.",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateDemand() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDemandRequest }) => 
      demandsApi.updateDemand(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['demands'] });
      toast({
        title: "Record updated successfully",
        description: "The demand record has been updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error updating record",
        description: error.message || "Failed to update demand record.",
        variant: "destructive",
      });
    },
  });
}

export function useDeleteDemand() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: (id: string) => demandsApi.deleteDemand(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['demands'] });
      toast({
        title: "Record deleted successfully",
        description: "The demand record has been removed.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error deleting record",
        description: error.message || "Failed to delete demand record.",
        variant: "destructive",
      });
    },
  });
}

// Forecast hooks
export function useForecast() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: (data: ForecastRequest) => forecastApi.generateForecast(data),
    onError: (error: any) => {
      toast({
        title: "Error generating forecast",
        description: error.message || "Failed to generate forecast.",
        variant: "destructive",
      });
    },
  });
}

// Chat hooks
export function useChat() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: (data: ChatRequest) => chatApi.sendMessage(data),
    onSuccess: (response) => {
      // If AI action requires data refetch, invalidate relevant queries
      if (response.response.requiresRefetch) {
        queryClient.invalidateQueries({ queryKey: ['demands'] });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error sending message",
        description: error.message || "Failed to communicate with AI assistant.",
        variant: "destructive",
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