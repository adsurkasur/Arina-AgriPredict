import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function DELETE() {
  try {
    const { db } = await connectToDatabase();

    // Get count before deletion for reporting
    const countBefore = await db.collection('demands').countDocuments();

    if (countBefore === 0) {
      return NextResponse.json({
        success: true,
        message: 'No data to clear',
        data: { deletedCount: 0 }
      });
    }

    // Delete all documents from demands collection
    const result = await db.collection('demands').deleteMany({});

    // Also clear any cached metadata
    await db.collection('metadata').deleteMany({ key: 'products_updated' });

    return NextResponse.json({
      success: true,
      message: `Successfully cleared all data`,
      data: {
        deletedCount: result.deletedCount,
        previousCount: countBefore
      }
    });

  } catch (error) {
    console.error('Error clearing all data:', error);
    return NextResponse.json(
      {
        error: 'Failed to clear all data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
