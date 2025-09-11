import React, { useState } from 'react';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { ProductSelectorProps, Product } from './types';

export const ProductSelector: React.FC<ProductSelectorProps> = ({
  selectedProductIds,
  onProductChange,
  products,
  disabled
}) => {
  const [productSelectOpen, setProductSelectOpen] = useState(false);

  const handleProductToggle = (productId: string) => {
    const newSelection = selectedProductIds.includes(productId)
      ? selectedProductIds.filter(id => id !== productId)
      : [...selectedProductIds, productId];

    onProductChange(newSelection);
  };

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Select Products</Label>
      <Popover open={productSelectOpen} onOpenChange={setProductSelectOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={productSelectOpen}
            className="w-full justify-between"
            disabled={disabled}
          >
            {selectedProductIds.length === 0
              ? "Select products..."
              : `${selectedProductIds.length} product${selectedProductIds.length === 1 ? '' : 's'} selected`
            }
            <Settings className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder="Search products..." />
            <CommandEmpty>No products found.</CommandEmpty>
            <CommandGroup className="max-h-64 overflow-auto">
              {products.map((product: Product) => (
                <CommandItem
                  key={product.id}
                  onSelect={() => {
                    handleProductToggle(product.id);
                    setProductSelectOpen(false);
                  }}
                  className="cursor-pointer"
                >
                  <Checkbox
                    checked={selectedProductIds.includes(product.id)}
                    className="mr-2"
                    onChange={() => {}} // Handled by onSelect
                  />
                  <span className="flex-1">{product.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {product.category}
                  </Badge>
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
      {selectedProductIds.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedProductIds.map(id => {
            const product = products.find((p: Product) => p.id === id);
            return product ? (
              <Badge key={id} variant="secondary" className="text-xs">
                {product.name}
              </Badge>
            ) : null;
          })}
        </div>
      )}
    </div>
  );
};
