export interface FormData {
  date: Date | undefined;
  productName: string;
  quantity: number | undefined;
  price: number | undefined;
  unit: string;
}

export interface InlineAddRowProps {
  onSuccess?: () => void;
  onError?: (_error: Error) => void;
}

export interface DatePickerProps {
  selectedDate: Date | undefined;
  onDateChange: (_date: Date | undefined) => void;
  disabled?: boolean;
  error?: string;
}

export interface ProductInputProps {
  value: string;
  onChange: (_value: string) => void;
  suggestions: string[];
  showSuggestions: boolean;
  onSuggestionClick: (_suggestion: string) => void;
  disabled?: boolean;
  error?: string;
}

export interface NumericInputProps {
  id: string;
  label: string;
  value: number | undefined;
  onChange: (_value: number | undefined) => void;
  placeholder?: string;
  min?: number;
  step?: number;
  disabled?: boolean;
  error?: string;
  required?: boolean;
}

export interface TextInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (_value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  required?: boolean;
}

export interface SubmitButtonProps {
  isValid: boolean;
  isPending: boolean;
  onSubmit: () => void;
}

export interface AISuggestionsProps {
  suggestions: string[];
  onSuggestionClick: (_suggestion: string) => void;
  disabled?: boolean;
}

export interface SmartDefaultsHookResult {
  generateDefaults: () => void;
}

export interface ProductSuggestionsHookResult {
  suggestions: string[];
  showSuggestions: boolean;
}

export interface FormSubmissionHookResult {
  isPending: boolean;
  submitForm: (_data: FormData) => void;
}
