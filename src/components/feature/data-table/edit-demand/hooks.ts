import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { DemandRecord, UpdateDemandRequest } from '@/types/api';
import { FormData, UseEditDemandFormResult } from './types';

export function useEditDemandForm(record: DemandRecord): UseEditDemandFormResult {
  const {
    handleSubmit,
    setValue,
    watch,
    reset,
    trigger: formTrigger,
    formState: { errors, isValid, isDirty },
  } = useForm<FormData>({
    mode: 'onChange',
    defaultValues: {
      date: new Date(record.date),
      productName: record.productName,
      quantity: record.quantity,
      price: record.price,
      unit: record.unit || 'pcs',
    },
  });

  const selectedDate = watch('date');

  // Reset form when record changes
  useEffect(() => {
    reset({
      date: new Date(record.date),
      productName: record.productName,
      quantity: record.quantity,
      price: record.price,
      unit: record.unit || 'pcs',
    });
  }, [record, reset]);

  const handleDateChange = (_date: Date | undefined) => {
    if (_date) {
      setValue('date', _date, { shouldValidate: true });
      formTrigger('date');
    }
  };

  const handleCancel = () => {
    if (isDirty) {
      if (window.confirm('You have unsaved changes. Are you sure you want to cancel?')) {
        resetForm();
      }
    } else {
      resetForm();
    }
  };

  const resetForm = () => {
    reset({
      date: new Date(record.date),
      productName: record.productName,
      quantity: record.quantity,
      price: record.price,
      unit: record.unit || 'pcs',
    });
  };

  const onSubmit = (data: FormData) => {
    if (!data.date) {
      return;
    }
    const updateData: UpdateDemandRequest = {
      date: data.date.toISOString(),
      productName: data.productName,
      quantity: data.quantity,
      price: data.price,
      unit: data.unit,
    };

    // This will be handled by the parent component
    return updateData;
  };

  const handleFormSubmit = (_e: React.FormEvent) => {
    handleSubmit(onSubmit)();
  };

  return {
    formData: watch(),
    errors: Object.fromEntries(
      Object.entries(errors).map(([key, error]) => [key, error?.message || ''])
    ),
    isValid,
    isDirty,
    selectedDate,
    handleDateChange,
    handleSubmit: handleFormSubmit,
    handleCancel,
    resetForm,
  };
}

export function useFormValidation() {
  const validateDate = (value: Date | undefined) => {
    if (!value || !(value instanceof Date)) {
      return 'Date is required';
    }
    return true;
  };

  const validateProductName = (value: string | undefined) => {
    if (!value || value.trim() === '') {
      return 'Product name is required';
    }
    return true;
  };

  const validateQuantity = (value: number | undefined) => {
    if (!value && value !== 0) {
      return 'Quantity is required';
    }
    if (value < 0) {
      return 'Quantity must be at least 0';
    }
    return true;
  };

  const validatePrice = (value: number | undefined) => {
    if (!value && value !== 0) {
      return 'Price is required';
    }
    if (value < 0) {
      return 'Price must be at least 0';
    }
    return true;
  };

  const validateUnit = (value: string | undefined) => {
    if (!value || value.trim() === '') {
      return 'Unit is required';
    }
    return true;
  };

  return {
    validateDate,
    validateProductName,
    validateQuantity,
    validatePrice,
    validateUnit,
  };
}
