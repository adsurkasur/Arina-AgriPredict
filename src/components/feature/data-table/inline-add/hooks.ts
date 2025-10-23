import { useState, useEffect, useCallback, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useCreateDemand, useProducts } from '@/hooks/useApiHooks';
import { FormData, SmartDefaultsHookResult, ProductSuggestionsHookResult, FormSubmissionHookResult } from './types';

export const useSmartDefaults = (
  setValue: (_name: keyof FormData, _value: any, _options?: any) => void
): SmartDefaultsHookResult => {
  const hasSetDefaults = useRef(false);

  const generateDefaults = useCallback(() => {
    if (hasSetDefaults.current) return;

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    // Set yesterday as default date for data entry
    setValue('date', yesterday, { shouldValidate: true });
    hasSetDefaults.current = true;

    // Could add more smart defaults here based on historical data
    // For example: most common product, average prices, etc.
  }, [setValue]);

  return { generateDefaults };
};

export const useProductSuggestions = (
  productNameValue: string
): ProductSuggestionsHookResult => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { data: availableProducts = [] } = useProducts();

  const generateProductSuggestions = useCallback((input: string): string[] => {
    const lowerInput = input.toLowerCase();

    return availableProducts.filter(product =>
      product.name.toLowerCase().includes(lowerInput) ||
      product.name.toLowerCase().replace(/\s+/g, '').includes(lowerInput.replace(/\s+/g, ''))
    ).map(product => product.name).slice(0, 3);
  }, [availableProducts]);

  useEffect(() => {
    if (productNameValue && productNameValue.length > 1) {
      const newSuggestions = generateProductSuggestions(productNameValue);
      setSuggestions(newSuggestions);
      setShowSuggestions(newSuggestions.length > 0);
    } else {
      setShowSuggestions(false);
      setSuggestions([]);
    }
  }, [productNameValue, generateProductSuggestions]);

  return { suggestions, showSuggestions };
};

export const useFormSubmission = (
  reset: () => void,
  onSuccess?: () => void,
  onError?: (_error: Error) => void
): FormSubmissionHookResult => {
  const [pending, setPending] = useState(false);
  const createMutation = useCreateDemand();

  const submitForm = useCallback((data: FormData) => {
    if (!data.date) {
      return;
    }

    setPending(true);

    const requestData = {
      date: data.date!.toISOString(),
      productName: data.productName,
      quantity: data.quantity!,
      price: data.price!,
      unit: data.unit || 'pcs',
    };

    createMutation.mutate(requestData, {
      onSuccess: () => {
        setPending(false);
        reset();
        onSuccess?.();
      },
      onError: (error) => {
        setPending(false);
        onError?.(error as Error);
      },
    });
  }, [createMutation, reset, onSuccess, onError]);

  return {
    isPending: pending || createMutation.isPending,
    submitForm
  };
};

export const useInlineAddForm = (
  onSuccess?: () => void,
  onError?: (_error: Error) => void
) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    trigger,
    formState: { errors, isValid },
  } = useForm<FormData>({
    mode: 'all',
    defaultValues: {
      date: undefined,
      productName: '',
      quantity: undefined,
      price: undefined,
      unit: '',
    },
  });

  const selectedDate = watch('date');
  const productNameValue = watch('productName');

  const { generateDefaults } = useSmartDefaults(setValue);
  const { suggestions, showSuggestions } = useProductSuggestions(productNameValue);
  const { isPending, submitForm } = useFormSubmission(reset, onSuccess, onError);

  // Apply smart defaults when component mounts
  useEffect(() => {
    generateDefaults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // generateDefaults uses a ref to prevent multiple executions

  const handleSuggestionClick = useCallback((suggestion: string) => {
    setValue('productName', suggestion, { shouldValidate: true });
  }, [setValue]);

  const onSubmit = useCallback((data: FormData) => {
    submitForm(data);
  }, [submitForm]);

  return {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    trigger,
    errors,
    isValid,
    selectedDate,
    productNameValue,
    suggestions,
    showSuggestions,
    isPending,
    handleSuggestionClick,
    onSubmit
  };
};
