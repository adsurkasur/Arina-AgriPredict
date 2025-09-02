import { useFormContext } from "react-hook-form";
import * as React from "react";

type FormFieldContextValue = {
  name: string | number | symbol;
};

const FormFieldContext = React.createContext<FormFieldContextValue>({} as FormFieldContextValue);
const FormItemContext = React.createContext<{ id: string }>({} as { id: string });

export const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState, formState } = useFormContext();

  let fieldState;
  if (typeof fieldContext.name === 'string') {
    fieldState = getFieldState(fieldContext.name, formState);
  } else {
    fieldState = {};
  }

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>");
  }

  const { id } = itemContext;

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  };
};
