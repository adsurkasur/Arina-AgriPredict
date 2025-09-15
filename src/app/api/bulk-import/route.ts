import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { DemandRecord } from '@/types/api';
import { verifyIdToken } from '@/lib/auth';

// Helper function to generate productId from productName
function generateProductId(productName: string): string {
  return productName
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .trim();
}

// Helper function to parse CSV content
function parseCSV(csvContent: string): { headers: string[], rows: string[][] } {
  const lines = csvContent.split('\n').filter(line => line.trim());
  if (lines.length === 0) {
    throw new Error('CSV file is empty');
  }

  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const rows = lines.slice(1).map(line =>
    line.split(',').map(cell => cell.trim().replace(/^"|"$/g, ''))
  );

  return { headers, rows };
}

// Helper function to validate and transform row data
function validateAndTransformRow(
  row: string[],
  headers: string[],
  rowIndex: number,
  userId: string
): { date: string; productName: string; productId: string; quantity: number; price: number; unit: string; userId: string } | null {
  if (row.length !== headers.length) {
    console.warn(`Row ${rowIndex + 1}: Column count mismatch`);
    return null;
  }

  const expectedHeaders = ['Date', 'Product', 'Quantity', 'Price'];
  const headerMap: { [key: string]: number } = {};

  headers.forEach((header, index) => {
    headerMap[header] = index;
  });

  // Check if required headers exist
  for (const expected of expectedHeaders) {
    if (!(expected in headerMap)) {
      throw new Error(`Missing required column: ${expected}`);
    }
  }

  const dateStr = row[headerMap['Date']];
  const productName = row[headerMap['Product']];
  const quantityStr = row[headerMap['Quantity']];
  const priceStr = row[headerMap['Price']];

  // Validate data
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    console.warn(`Row ${rowIndex + 1}: Invalid date format: ${dateStr}`);
    return null;
  }

  const quantity = parseFloat(quantityStr);
  if (isNaN(quantity) || quantity <= 0) {
    console.warn(`Row ${rowIndex + 1}: Invalid quantity: ${quantityStr}`);
    return null;
  }

  const price = parseFloat(priceStr);
  if (isNaN(price) || price <= 0) {
    console.warn(`Row ${rowIndex + 1}: Invalid price: ${priceStr}`);
    return null;
  }

  return {
    date: date.toISOString(),
    productName,
    productId: generateProductId(productName),
    quantity,
    price,
    unit: 'kg',
    userId
  };
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

    // Get the uploaded file
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.csv')) {
      return NextResponse.json(
        { error: 'Only CSV files are supported' },
        { status: 400 }
      );
    }

    // Read file content
    const csvContent = await file.text();

    // Parse CSV
    const { headers, rows } = parseCSV(csvContent);

    console.log(`Processing ${rows.length} rows from CSV...`);

    // Process rows in batches
    const batchSize = 100;
    let totalProcessed = 0;
    let totalErrors = 0;
    const processedData: Omit<DemandRecord, 'id'>[] = [];

    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize);
      const batchResults = batch.map((row, index) =>
        validateAndTransformRow(row, headers, i + index, userId)
      ).filter(result => result !== null) as Omit<DemandRecord, 'id'>[];

      if (batchResults.length > 0) {
        try {
          const result = await db.collection('demands').insertMany(batchResults);
          totalProcessed += result.insertedCount;
          processedData.push(...batchResults);
        } catch (error) {
          console.error(`Error inserting batch ${Math.floor(i / batchSize) + 1}:`, error);
          totalErrors += batchResults.length;
        }
      }

      // Log progress
      console.log(`Processed ${Math.min(i + batchSize, rows.length)}/${rows.length} rows...`);
    }

    // Invalidate products cache by updating a timestamp
    await db.collection('metadata').updateOne(
      { key: 'products_updated' },
      { $set: { timestamp: new Date() } },
      { upsert: true }
    );

    const response = {
      success: true,
      message: `Successfully imported ${totalProcessed} records`,
      data: {
        totalRows: rows.length,
        processed: totalProcessed,
        errors: totalErrors,
        products: [...new Set(processedData.map(d => d.productName))]
      }
    };

    console.log(`Bulk import completed: ${totalProcessed} processed, ${totalErrors} errors`);

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('Bulk import error:', error);
    return NextResponse.json(
      {
        error: 'Failed to process bulk import',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check import status (optional)
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

    const stats = await db.collection('demands').aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: null,
          totalRecords: { $sum: 1 },
          uniqueProducts: { $addToSet: '$productName' },
          dateRange: {
            $mergeObjects: {
              min: { $min: '$date' },
              max: { $max: '$date' }
            }
          }
        }
      }
    ]).toArray();

    const result = stats[0] || {
      totalRecords: 0,
      uniqueProducts: [],
      dateRange: { min: null, max: null }
    };

    return NextResponse.json({
      success: true,
      data: {
        totalRecords: result.totalRecords,
        uniqueProductsCount: result.uniqueProducts.length,
        dateRange: result.dateRange
      }
    });

  } catch (error) {
    console.error('Error fetching import stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch import statistics' },
      { status: 500 }
    );
  }
}
