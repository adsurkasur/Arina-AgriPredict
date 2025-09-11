interface FormActionsProps {
  onCancel: () => void;
  isLoading?: boolean;
  isValid?: boolean;
  isDirty?: boolean;
}

export function FormActions({
  onCancel,
  isLoading = false,
  isValid = false,
  isDirty = false
}: FormActionsProps) {
  return (
    <div className="flex justify-end space-x-2 pt-4">
      <button
        type="button"
        onClick={onCancel}
        disabled={isLoading}
        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={!isValid || isLoading || !isDirty}
        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Saving...' : 'Save Changes'}
      </button>
    </div>
  );
}
