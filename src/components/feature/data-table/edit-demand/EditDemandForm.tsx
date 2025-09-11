import { useForm } from 'react-hook-form';
import { DatePicker } from './DatePicker';
import { ProductNameField } from './ProductNameField';
import { QuantityField } from './QuantityField';
import { UnitField } from './UnitField';
import { PriceField } from './PriceField';
import { FormActions } from './FormActions';
import { EditDemandFormProps, FormData } from './types';
import { useFormValidation } from './hooks';

export function EditDemandForm({
  record,
  onSubmit,
  onCancel,
  isLoading = false
}: EditDemandFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
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
  const validation = useFormValidation();

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setValue('date', date, { shouldValidate: true });
      formTrigger('date');
    }
  };

  const handleFormSubmit = (data: FormData) => {
    if (!data.date) return;

    const updateData = {
      date: data.date.toISOString(),
      productName: data.productName,
      quantity: data.quantity,
      price: data.price,
      unit: data.unit,
    };

    onSubmit(updateData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {/* Hidden date input for validation */}
      <input
        type="hidden"
        {...register('date', {
          validate: validation.validateDate
        })}
      />

      {/* Date Picker */}
      <DatePicker
        selectedDate={selectedDate}
        onDateChange={handleDateChange}
        error={errors.date?.message}
        disabled={isLoading}
      />

      {/* Product Name */}
      <ProductNameField
        error={errors.productName?.message}
        disabled={isLoading}
        register={register}
        validation={validation}
      />

      {/* Quantity */}
      <QuantityField
        error={errors.quantity?.message}
        disabled={isLoading}
        register={register}
        validation={validation}
      />

      {/* Unit */}
      <UnitField
        error={errors.unit?.message}
        disabled={isLoading}
        register={register}
        validation={validation}
      />

      {/* Price */}
      <PriceField
        error={errors.price?.message}
        disabled={isLoading}
        register={register}
        validation={validation}
      />

      {/* Form Actions */}
      <FormActions
        onCancel={onCancel}
        isLoading={isLoading}
        isValid={isValid}
        isDirty={isDirty}
      />
    </form>
  );
}
