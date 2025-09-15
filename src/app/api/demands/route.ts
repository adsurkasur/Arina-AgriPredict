import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { DemandRecord, CreateDemandRequest } from '@/types/api';
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

    const { db } = await connectToDatabase();
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const sortKey = searchParams.get('sortKey') || 'date';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;

    // Build query
    const query: any = { userId };
    if (search) {
      query.$or = [
        { productName: { $regex: search, $options: 'i' } },
        { productId: { $regex: search, $options: 'i' } }
      ];
    }

    // Get total count
    const totalItems = await db.collection('demands').countDocuments(query);
    const totalPages = Math.ceil(totalItems / limit);

    // Get data with sorting and pagination
    const demands = await db.collection('demands')
      .find(query)
      .sort({ [sortKey]: sortOrder })
      .skip(skip)
      .limit(limit)
      .toArray();

    const response = {
      data: demands.map(demand => ({
        ...demand,
        id: demand._id.toString(),
        _id: undefined
      })),
      pagination: {
        currentPage: page,
        totalPages,
        totalItems
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching demands:', error);
    return NextResponse.json(
      { error: 'Failed to fetch demands' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    const { db } = await connectToDatabase();
    const body: CreateDemandRequest = await request.json();

    // Validate required fields
    const requiredFields = ['date', 'productName', 'quantity', 'price'];
    const missingFields = requiredFields.filter(field => !body[field as keyof CreateDemandRequest]);

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Generate productId from productName
    const productId = generateProductId(body.productName);

    const newDemand: Omit<DemandRecord, 'id'> = {
      date: body.date,
      productName: body.productName,
      productId,
      quantity: body.quantity,
      price: body.price,
      unit: body.unit || 'kg',
      userId
    };

    const result = await db.collection('demands').insertOne(newDemand);

    const createdDemand: DemandRecord = {
      ...newDemand,
      id: result.insertedId.toString()
    };

    return NextResponse.json(createdDemand, { status: 201 });
  } catch (error) {
    console.error('Error creating demand:', error);
    return NextResponse.json(
      { error: 'Failed to create demand' },
      { status: 500 }
    );
  }
}

// Helper function to generate productId from productName
function generateProductId(productName: string): string {
  return productName
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .trim();
}
