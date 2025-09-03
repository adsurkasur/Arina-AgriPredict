import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const { text } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: 'Missing text field' },
        { status: 400 }
      );
    }

    // Use Gemini to extract structured data from unstructured text
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
You are an AI assistant that extracts agricultural demand data from unstructured text.
Extract the following information from the provided text:
- Date (in ISO format, use current date if not specified)
- Product name
- Quantity (number)
- Price per unit (number)
- Any additional notes

Text: "${text}"

Return the extracted information as a JSON object with the following structure:
{
  "date": "YYYY-MM-DDTHH:mm:ss.sssZ",
  "productName": "string",
  "productId": "string (lowercase, hyphen-separated)",
  "quantity": number,
  "price": number,
  "notes": "string (optional)"
}

If multiple products are mentioned, return an array of such objects.
If no clear data can be extracted, return an empty array.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const extractedData = JSON.parse(response.text());

    // If extracted data is an array, process each item
    const dataArray = Array.isArray(extractedData) ? extractedData : [extractedData];

    const processedData = [];

    for (const item of dataArray) {
      if (item.productName && item.quantity && item.price) {
        // Ensure date is valid
        const date = item.date || new Date().toISOString();

        const demandData = {
          date,
          productName: item.productName,
          productId: item.productId || item.productName.toLowerCase().replace(/\s+/g, '-'),
          quantity: Number(item.quantity),
          price: Number(item.price),
          notes: item.notes || ''
        };

        // Insert into database
        const result = await db.collection('demands').insertOne(demandData);

        processedData.push({
          ...demandData,
          id: result.insertedId.toString()
        });
      }
    }

    return NextResponse.json({
      success: true,
      processed: processedData.length,
      data: processedData
    });

  } catch (error) {
    console.error('Error processing data:', error);
    return NextResponse.json(
      { error: 'Failed to process data' },
      { status: 500 }
    );
  }
}
