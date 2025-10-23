import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { DemandRecord, UpdateDemandRequest } from '@/types/api';
import { ObjectId } from 'mongodb';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { db } = await connectToDatabase();
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid demand ID' },
        { status: 400 }
      );
    }

    const demand = await db.collection('demands').findOne({ _id: new ObjectId(id) });

    if (!demand) {
      return NextResponse.json(
        { error: 'Demand not found' },
        { status: 404 }
      );
    }

    const response: DemandRecord = {
      id: demand._id.toString(),
      date: demand.date,
      productName: demand.productName,
      productId: demand.productId,
      quantity: demand.quantity,
      price: demand.price,
      unit: demand.unit || 'kg',
      userId: demand.userId
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching demand:', error);
    return NextResponse.json(
      { error: 'Failed to fetch demand' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { db } = await connectToDatabase();
    const { id } = await params;
    const body: UpdateDemandRequest = await request.json();

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid demand ID' },
        { status: 400 }
      );
    }

    // Build update object
    const updateData: Partial<DemandRecord> = {};
    if (body.date) updateData.date = body.date;
    if (body.productId) {
      updateData.productId = body.productId;
      // Use provided productName or fallback to productId
      updateData.productName = body.productName || body.productId;
    }
    if (body.productName) {
      updateData.productName = body.productName;
      updateData.productId = generateProductId(body.productName);
    }
    if (body.quantity !== undefined) updateData.quantity = body.quantity;
    if (body.price !== undefined) updateData.price = body.price;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    const result = await db.collection('demands').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Demand not found' },
        { status: 404 }
      );
    }

    // Fetch updated demand
    const updatedDemand = await db.collection('demands').findOne({ _id: new ObjectId(id) });

    const response: DemandRecord = {
      id: updatedDemand!._id.toString(),
      date: updatedDemand!.date,
      productName: updatedDemand!.productName,
      productId: updatedDemand!.productId,
      quantity: updatedDemand!.quantity,
      price: updatedDemand!.price,
      unit: updatedDemand!.unit || 'kg'
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error updating demand:', error);
    return NextResponse.json(
      { error: 'Failed to update demand' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { db } = await connectToDatabase();
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid demand ID' },
        { status: 400 }
      );
    }

    const result = await db.collection('demands').deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Demand not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Demand deleted successfully' });
  } catch (error) {
    console.error('Error deleting demand:', error);
    return NextResponse.json(
      { error: 'Failed to delete demand' },
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
