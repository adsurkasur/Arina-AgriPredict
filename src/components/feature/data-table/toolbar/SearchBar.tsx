import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { SearchBarProps } from './types';

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = "Search products, dates..."
}) => {
  return (
    <div className="relative w-64 mr-2">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10 transition-smooth"
        aria-label="Search sales records"
        role="searchbox"
      />
    </div>
  );
};
