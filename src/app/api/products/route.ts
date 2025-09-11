import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET() {
  try {
    const { db } = await connectToDatabase();

    // Get all unique products from the demands collection
    const uniqueProducts = await db.collection('demands').aggregate([
      {
        $group: {
          _id: '$productId',
          name: { $first: '$productName' },
          count: { $sum: 1 },
          lastUpdated: { $max: '$date' }
        }
      },
      {
        $project: {
          _id: 0,
          id: '$_id',
          name: 1,
          category: {
            $cond: {
              if: {
                $or: [
                  { $regexMatch: { input: '$name', regex: /chili|spice|garlic|ginger/i } },
                  { $in: ['$name', ['Garlic', 'Ginger']] }
                ]
              },
              then: 'Spices',
              else: {
                $cond: {
                  if: {
                    $or: [
                      { $regexMatch: { input: '$name', regex: /rice|wheat|grain/i } },
                      { $in: ['$name', ['Rice', 'Wheat']] }
                    ]
                  },
                  then: 'Grains',
                  else: 'Vegetables'
                }
              }
            }
          },
          unit: 'kg'
        }
      },
      {
        $sort: { name: 1 }
      }
    ]).toArray();

    // If no products in database, return empty array
    if (uniqueProducts.length === 0) {
      return NextResponse.json([]);
    }

    return NextResponse.json(uniqueProducts);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
