import { DemandRecord, UpdateDemandRequest } from '@/types/api';

export interface EditDemandDialogProps {
  record: DemandRecord;
  trigger?: React.ReactNode;
}

export interface FormData {
  date: Date;
  productName: string;
  quantity: number;
  price: number;
  unit: string;
}

export interface DatePickerProps {
  selectedDate: Date;
  onDateChange: (_date: Date | undefined) => void;
  error?: string;
  disabled?: boolean;
}

export interface FormFieldProps {
  label: string;
  id: string;
  error?: string;
  disabled?: boolean;
  children: React.ReactNode;
}

export interface EditDemandFormProps {
  record: DemandRecord;
  onSubmit: (_data: UpdateDemandRequest) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export interface UseEditDemandFormResult {
  formData: FormData;
  errors: Record<string, string>;
  isValid: boolean;
  isDirty: boolean;
  selectedDate: Date;
  handleDateChange: (_date: Date | undefined) => void;
  handleSubmit: (_e: React.FormEvent) => void;
  handleCancel: () => void;
  resetForm: () => void;
}
