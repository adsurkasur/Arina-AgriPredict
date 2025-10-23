import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { verifyIdToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    const decodedToken = await verifyIdToken(token);
    if (!decodedToken) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    const userId = decodedToken.uid;

    console.log('Products API called');
    const { db } = await connectToDatabase();

    // First, let's check if there are any demands at all
    const totalDemands = await db.collection('demands').countDocuments({ userId });
    console.log(`Total demands in database for user: ${totalDemands}`);

    // Get a sample of demands to see the structure
    const sampleDemands = await db.collection('demands').find({ userId }).limit(5).toArray();
    console.log('Sample demands:', sampleDemands.map(d => ({
      productName: d.productName,
      productId: d.productId,
      date: d.date
    })));

    // Get all unique products from the demands collection
    const uniqueProducts = await db.collection('demands').aggregate([
      {
        $match: {
          userId,
          productId: { $exists: true, $nin: [null, ''] }
        }
      },
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

    console.log(`Found ${uniqueProducts.length} unique products`);
    console.log('Raw unique products from aggregation:', uniqueProducts);
    console.log('Sample demands structure:', sampleDemands.map((d: any) => ({
      productName: d.productName,
      productId: d.productId,
      date: d.date
    })));

    return NextResponse.json(uniqueProducts);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
