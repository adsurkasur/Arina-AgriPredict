import { useState } from 'react';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { DatePickerProps } from './types';

export function DatePicker({
  selectedDate,
  onDateChange,
  error,
  disabled = false
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleDateSelect = (date: Date | undefined) => {
    onDateChange(date);
    setIsOpen(false);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="edit-date" className="text-sm font-medium">
        Date
      </Label>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            id="edit-date"
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !selectedDate && "text-muted-foreground",
              error && "border-destructive"
            )}
            disabled={disabled}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {selectedDate ? format(selectedDate, "dd/MM/yyyy") : "Pick a date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <CalendarComponent
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            initialFocus
            className="pointer-events-auto"
          />
        </PopoverContent>
      </Popover>
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  );
}
