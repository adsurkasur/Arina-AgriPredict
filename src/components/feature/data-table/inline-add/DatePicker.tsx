import React, { useState } from 'react';
import { Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { DatePickerProps } from './types';

export const DatePicker: React.FC<DatePickerProps> = ({
  selectedDate,
  onDateChange,
  disabled,
  error
}) => {
  const [open, setOpen] = useState(false);

  const handleDateSelect = (date: Date | undefined) => {
    onDateChange(date);
    setOpen(false);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="date" className="text-xs">Date</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !selectedDate && "text-muted-foreground",
              error && "border-destructive"
            )}
            disabled={disabled}
          >
            <Calendar className="mr-2 h-4 w-4" />
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
};
