import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Helper function to generate productId from productName
function generateProductId(productName: string): string {
  return productName
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .trim();
}
function extractJsonFromMarkdown(text: string): string {
  // Remove markdown code block markers
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (jsonMatch) {
    return jsonMatch[1].trim();
  }

  // If no code blocks found, try to find JSON-like content
  const jsonStart = text.indexOf('{');
  const jsonEnd = text.lastIndexOf('}');
  if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
    return text.substring(jsonStart, jsonEnd + 1);
  }

  // Fallback to the original text
  return text;
}

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
You are an AI assistant that extracts agricultural sales/demand data from unstructured text.
Your task is to identify and extract specific information about agricultural transactions.

Look for these key elements in the text:
- ACTION: Words indicating sale ("sold", "selling") or purchase ("need", "buy", "purchase", "bought")
- PRODUCT: Agricultural products (spinach, tomatoes, potatoes, onions, rice, wheat, etc.)
- QUANTITY: Numbers with units (kg, tons, pounds, etc.)
- PRICE: Monetary values ($2.50, $1.80/kg, etc.) - may be missing
- DATE: Specific dates or relative terms ("yesterday", "today", "last week")

Text to analyze: "${text}"

IMPORTANT: Return ONLY a valid JSON object. No markdown, no explanations, just JSON.

Examples of expected output:
- "sold 150 kg of spinach yesterday" → {"date": "2025-09-10T12:00:00.000Z", "productName": "Spinach", "quantity": 150, "price": null, "transactionType": "sale"}
- "need 100 kg tomatoes at $2.50" → {"date": "2025-09-11T12:00:00.000Z", "productName": "Tomatoes", "quantity": 100, "price": 2.50, "transactionType": "purchase"}

Return format:
{
  "date": "ISO date string or null",
  "productName": "extracted product name or null",
  "quantity": number or null,
  "price": number or null,
  "transactionType": "sale" or "purchase" or null,
  "notes": "any additional context"
}

If you cannot extract meaningful data, return: {"error": "No agricultural transaction data found"}
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const rawText = response.text();
    
    // Extract JSON from markdown code blocks if present
    const jsonText = extractJsonFromMarkdown(rawText);
    
    let extractedData;
    try {
      extractedData = JSON.parse(jsonText);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      console.error('Raw AI response:', rawText);
      console.error('Extracted JSON text:', jsonText);
      const errorMessage = parseError instanceof Error ? parseError.message : 'Unknown parsing error';
      return NextResponse.json(
        { error: 'Failed to parse AI response', details: errorMessage },
        { status: 500 }
      );
    }

    // If extracted data is an array, process each item, or if it's a single object, process it
    const dataArray = Array.isArray(extractedData) ? extractedData : 
                     (extractedData && Object.keys(extractedData).length > 0 && !extractedData.error ? [extractedData] : []);

    console.log('AI extracted data:', extractedData);
    console.log('Data array to process:', dataArray);

    // If AI returned an error, handle it gracefully
    if (extractedData && extractedData.error) {
      return NextResponse.json({
        success: false,
        processed: 0,
        message: extractedData.error,
        data: []
      });
    }

    const processedData = [];

    for (const item of dataArray) {
      // Check if we have the minimum required fields (productName and quantity)
      if (item.productName && item.quantity) {
        // Handle date parsing
        let date = item.date;
        if (!date) {
          // Check if the original text contains "yesterday"
          if (text.toLowerCase().includes('yesterday')) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            date = yesterday.toISOString();
          } else {
            date = new Date().toISOString();
          }
        }

        const demandData = {
          date,
          productName: item.productName,
          productId: item.productId || generateProductId(item.productName),
          quantity: Number(item.quantity),
          price: item.price ? Number(item.price) : null,
          transactionType: item.transactionType || (text.toLowerCase().includes('sold') ? 'sale' : 'purchase'),
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
      message: processedData.length > 0 
        ? `Successfully processed ${processedData.length} record${processedData.length > 1 ? 's' : ''} from your input.`
        : 'No valid agricultural transaction data could be extracted from your input.',
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
