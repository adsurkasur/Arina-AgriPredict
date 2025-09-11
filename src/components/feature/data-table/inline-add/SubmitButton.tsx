import React from 'react';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SubmitButtonProps } from './types';

export const SubmitButton: React.FC<SubmitButtonProps> = ({
  isValid,
  isPending,
  onSubmit
}) => {
  return (
    <div className="flex justify-start md:col-span-1 col-span-1 pt-8">
      <Button
        type="submit"
        onClick={onSubmit}
        disabled={!isValid || isPending}
        className="w-full h-10 px-3 py-2 text-base md:text-sm transition-smooth"
        aria-disabled={!isValid || isPending}
        aria-label="Add sales record"
      >
        <PlusCircle className="mr-2 h-4 w-4" />
        {isPending ? 'Adding...' : 'Add Record'}
      </Button>
    </div>
  );
};
