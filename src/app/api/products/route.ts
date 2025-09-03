import { NextResponse } from 'next/server';
import { Product } from '@/types/api';

export async function GET() {
  try {
    const products: Product[] = [
      { id: 'red-chili', name: 'Red Chili', category: 'Spices', unit: 'kg' },
      { id: 'onions', name: 'Onions', category: 'Vegetables', unit: 'kg' },
      { id: 'tomatoes', name: 'Tomatoes', category: 'Vegetables', unit: 'kg' },
      { id: 'potatoes', name: 'Potatoes', category: 'Vegetables', unit: 'kg' },
      { id: 'rice', name: 'Rice', category: 'Grains', unit: 'kg' },
      { id: 'wheat', name: 'Wheat', category: 'Grains', unit: 'kg' }
    ];

    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
