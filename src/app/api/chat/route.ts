import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ChatRequest, ChatResponse } from '@/types/api';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const body: ChatRequest = await request.json();

    if (!body.message) {
      return NextResponse.json(
        { error: 'Missing message field' },
        { status: 400 }
      );
    }

    // Analyze the message to determine intent and generate response
    const analysis = await analyzeMessage(body.message, db, body.history);

    // Generate response based on analysis
    const response = await generateAIResponse(analysis, db, body.message, body.history);

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error processing chat:', error);

    // Provide more specific error messages based on the error type
    let errorMessage = 'Failed to process chat message';
    let statusCode = 500;

    if (error?.status === 503 || error?.message?.includes('503') || error?.message?.includes('Service Unavailable')) {
      errorMessage = 'AI service is temporarily overloaded. Please try again in a moment.';
      statusCode = 503;
    } else if (error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('quota')) {
      errorMessage = 'API quota exceeded. Please try again later.';
      statusCode = 429;
    } else if (error?.status === 401 || error?.message?.includes('401') || error?.message?.includes('unauthorized')) {
      errorMessage = 'Authentication failed. Please check API configuration.';
      statusCode = 401;
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    );
  }
}

interface MessageAnalysis {
  intent: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'FORECAST' | 'GENERAL';
  productId?: string;
  action: string;
  requiresRefetch: boolean;
}

async function analyzeMessage(message: string, db: any, _history: any[] = []): Promise<MessageAnalysis> {
  const lowerMessage = message.toLowerCase();

  // Check for forecast requests
  if (lowerMessage.includes('forecast') || lowerMessage.includes('predict') || lowerMessage.includes('future')) {
    const productId = await extractProductId(lowerMessage, db);
    return {
      intent: 'FORECAST',
      productId,
      action: 'forecast',
      requiresRefetch: false
    };
  }

  // Check for create/add requests
  if (lowerMessage.includes('add') || lowerMessage.includes('create') || lowerMessage.includes('new')) {
    return {
      intent: 'CREATE',
      action: 'create',
      requiresRefetch: true
    };
  }

  // Check for update/edit requests
  if (lowerMessage.includes('update') || lowerMessage.includes('edit') || lowerMessage.includes('change')) {
    return {
      intent: 'UPDATE',
      action: 'update',
      requiresRefetch: true
    };
  }

  // Check for delete/remove requests
  if (lowerMessage.includes('delete') || lowerMessage.includes('remove')) {
    return {
      intent: 'DELETE',
      action: 'delete',
      requiresRefetch: true
    };
  }

  // Check for view/show requests
  if (lowerMessage.includes('show') || lowerMessage.includes('view') || lowerMessage.includes('list')) {
    return {
      intent: 'READ',
      action: 'read',
      requiresRefetch: false
    };
  }

  // Default to general
  return {
    intent: 'GENERAL',
    action: 'general',
    requiresRefetch: false
  };
}

async function extractProductId(message: string, db: any): Promise<string | undefined> {
  // Get all unique product IDs from the demands collection
  const products = await db.collection('demands').distinct('productId');
  const lowerMessage = message.toLowerCase();

  for (const product of products) {
    if (lowerMessage.includes(product.replace('-', ' ')) || lowerMessage.includes(product)) {
      return product;
    }
  }
  return undefined;
}

async function generateAIResponse(analysis: MessageAnalysis, db: any, message: string, _history: any[] = []): Promise<ChatResponse> {
  const maxRetries = 3;
  let lastError: any;

  // Get available products for dynamic suggestions
  const availableProducts = await db.collection('demands').distinct('productName');
  const topProducts = availableProducts.slice(0, 3); // Use top 3 products for suggestions

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

      // Get recent data for context
      const recentDemands = await db.collection('demands')
        .find({})
        .sort({ date: -1 })
        .limit(10)
        .toArray();

      const contextPrompt = `
You are AgriPredict, an intelligent AI assistant for agricultural demand forecasting and data management.

Current Context:
- Recent sales data: ${JSON.stringify(recentDemands.slice(0, 5), null, 2)}
- User message: "${message}"
- Detected intent: ${analysis.intent}
- Product mentioned: ${analysis.productId || 'None'}

Available actions:
- CREATE: Add new demand data
- READ: View existing data
- UPDATE: Modify existing records
- DELETE: Remove records
- FORECAST: Generate price forecasts
- GENERAL: Provide information or assistance

Please provide a helpful, contextual response. If the user wants to perform an action, guide them through it.
Keep responses professional, concise, and focused on agricultural business needs.

Response format: Provide a natural, conversational response with any relevant suggestions or next steps.
`;

      const result = await model.generateContent(contextPrompt);
      const aiResponse = await result.response;
      const content = aiResponse.text();

      let suggestions: string[] = [];
      let actionTaken: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'FORECAST' | 'NONE' = analysis.intent === 'GENERAL' ? 'NONE' : analysis.intent;

      // Generate contextual suggestions based on intent
      switch (analysis.intent) {
        case 'FORECAST':
          if (analysis.productId) {
            const productName = await getProductNameFromId(analysis.productId, db);
            suggestions = [
              `Forecast ${productName} for 7 days`,
              `Show historical data for ${productName}`,
              'View all products'
            ];
          } else {
            suggestions = [
              ...topProducts.map((product: string) => `Forecast ${product} prices`),
              'View all available products'
            ];
          }
          break;

        case 'CREATE':
          suggestions = [
            ...topProducts.map((product: string) => `Add new ${product} demand`),
            'View current data'
          ];
          break;

        case 'READ':
          suggestions = [
            'Show all demand data',
            ...topProducts.map((product: string) => `Show ${product} data`),
            'Show recent entries'
          ];
          break;

        case 'UPDATE':
          suggestions = [
            'Update latest entry',
            'Search for record to update',
            'View all data first'
          ];
          break;

        case 'DELETE':
          suggestions = [
            'Show all records first',
            'Search for record to delete',
            'Cancel'
          ];
          break;

        default:
          suggestions = [
            'View demand data',
            'Generate forecast',
            'Add new data'
          ];
      }

      return {
        response: {
          id: Date.now().toString(),
          role: 'assistant',
          content,
          suggestions,
          actionTaken,
          requiresRefetch: analysis.requiresRefetch
        }
      };
    } catch (error: any) {
      lastError = error;
      console.error(`Gemini API attempt ${attempt}/${maxRetries} failed:`, error);

      // Check if it's a 503 error (service unavailable)
      if (error?.status === 503 || error?.message?.includes('503') || error?.message?.includes('Service Unavailable')) {
        if (attempt < maxRetries) {
          // Wait with exponential backoff: 1s, 2s, 4s
          const waitTime = Math.pow(2, attempt - 1) * 1000;
          console.log(`Retrying in ${waitTime}ms due to service overload...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }
      }

      // For other errors or if we've exhausted retries, break and use fallback
      break;
    }
  }

  // If we get here, all retries failed - use fallback response
  console.error('All Gemini API attempts failed, using fallback response. Last error:', lastError);
  return generateFallbackResponse(analysis, lastError);
}

function generateFallbackResponse(analysis: MessageAnalysis, error?: any): ChatResponse {
  let content = '';
  let suggestions: string[] = [];

  // Check if this is due to API overload
  const isOverloadError = error && (
    error?.status === 503 ||
    error?.message?.includes('503') ||
    error?.message?.includes('Service Unavailable') ||
    error?.message?.includes('overloaded')
  );

  if (isOverloadError) {
    content = "I'm currently experiencing high demand and my AI service is temporarily overloaded. I'll provide you with helpful guidance using my local knowledge instead.\n\n";
  }

  switch (analysis.intent) {
    case 'FORECAST':
      if (analysis.productId) {
        // In error case, use productId as fallback since we can't query DB
        const productName = analysis.productId;
        content += `I'll help you forecast prices for ${productName}. Please specify the number of days you'd like to forecast (e.g., "forecast for 7 days").`;
        suggestions = [
          `Forecast ${productName} for 7 days`,
          `Show historical data for ${productName}`,
          'View all products'
        ];
      } else {
        content += 'I can help you forecast prices for agricultural products. Which product would you like to forecast?';
        suggestions = [
          'Forecast prices for available products',
          'View all available products'
        ];
      }
      break;

    case 'CREATE':
      content += 'I can help you add new demand data. What product and details would you like to add?';
      suggestions = [
        'Add new demand data',
        'View current data'
      ];
      break;

    case 'READ':
      content += 'I can show you the current demand data. Would you like to see all records or filter by product?';
      suggestions = [
        'Show all demand data',
        'Show recent entries'
      ];
      break;

    case 'UPDATE':
      content += 'I can help you update existing demand records. Which record would you like to modify?';
      suggestions = [
        'Update latest entry',
        'Search for record to update',
        'View all data first'
      ];
      break;

    case 'DELETE':
      content += 'I can help you remove demand records. Please be careful as this action cannot be undone. Which record would you like to delete?';
      suggestions = [
        'Show all records first',
        'Search for record to delete',
        'Cancel'
      ];
      break;

    default:
      if (isOverloadError) {
        content += "Hello! I'm your AgriPredict assistant. While my AI service is temporarily busy, I can still help you with:\n\n• Viewing and managing demand data\n• Analyzing your existing records\n• Guiding you through data entry\n\nWhat would you like to do?";
      } else {
        content += "Hello! I'm your AgriPredict assistant. I can help you with:\n\n• Viewing and managing demand data\n• Generating price forecasts\n• Analyzing market trends\n\nWhat would you like to do?";
      }
      suggestions = [
        'View demand data',
        'Generate forecast',
        'Add new data'
      ];
  }

  return {
    response: {
      id: Date.now().toString(),
      role: 'assistant',
      content,
      suggestions,
      actionTaken: analysis.intent === 'GENERAL' ? 'NONE' : analysis.intent,
      requiresRefetch: analysis.requiresRefetch
    }
  };
}

async function getProductNameFromId(productId: string, db: any): Promise<string> {
  try {
    const product = await db.collection('demands').findOne(
      { productId },
      { projection: { productName: 1 } }
    );
    return product?.productName || productId;
  } catch {
    return productId;
  }
}
