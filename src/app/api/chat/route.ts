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
    const analysis = analyzeMessage(body.message, body.history);

    // Generate response based on analysis
    const response = await generateAIResponse(analysis, db, body.message, body.history);

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error processing chat:', error);
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    );
  }
}

interface MessageAnalysis {
  intent: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'FORECAST' | 'GENERAL';
  productId?: string;
  action: string;
  requiresRefetch: boolean;
}

function analyzeMessage(message: string, _history: any[] = []): MessageAnalysis {
  const lowerMessage = message.toLowerCase();

  // Check for forecast requests
  if (lowerMessage.includes('forecast') || lowerMessage.includes('predict') || lowerMessage.includes('future')) {
    const productId = extractProductId(lowerMessage);
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

function extractProductId(message: string): string | undefined {
  const products = ['red-chili', 'onions', 'tomatoes', 'potatoes', 'rice', 'wheat'];
  const lowerMessage = message.toLowerCase();

  for (const product of products) {
    if (lowerMessage.includes(product.replace('-', ' ')) || lowerMessage.includes(product)) {
      return product;
    }
  }
  return undefined;
}

async function generateAIResponse(analysis: MessageAnalysis, db: any, message: string, _history: any[] = []): Promise<ChatResponse> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

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
          suggestions = [
            `Forecast ${getProductNameFromId(analysis.productId)} for 7 days`,
            `Show historical data for ${getProductNameFromId(analysis.productId)}`,
            'View all products'
          ];
        } else {
          suggestions = [
            'Forecast Red Chili prices',
            'Forecast Onion prices',
            'View all available products'
          ];
        }
        break;

      case 'CREATE':
        suggestions = [
          'Add new Red Chili demand',
          'Add new Onion demand',
          'View current data'
        ];
        break;

      case 'READ':
        suggestions = [
          'Show all demand data',
          'Show Red Chili data',
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
  } catch (error) {
    console.error('Gemini response generation failed:', error);
    // Fallback to basic response
    return generateFallbackResponse(analysis);
  }
}

function generateFallbackResponse(analysis: MessageAnalysis): ChatResponse {
  let content = '';
  let suggestions: string[] = [];

  switch (analysis.intent) {
    case 'FORECAST':
      if (analysis.productId) {
        content = `I'll help you forecast prices for ${getProductNameFromId(analysis.productId)}. Please specify the number of days you'd like to forecast (e.g., "forecast for 7 days").`;
        suggestions = [
          `Forecast ${getProductNameFromId(analysis.productId)} for 7 days`,
          `Show historical data for ${getProductNameFromId(analysis.productId)}`,
          'View all products'
        ];
      } else {
        content = 'I can help you forecast prices for agricultural products. Which product would you like to forecast?';
        suggestions = [
          'Forecast Red Chili prices',
          'Forecast Onion prices',
          'View all available products'
        ];
      }
      break;

    case 'CREATE':
      content = 'I can help you add new demand data. What product and details would you like to add?';
      suggestions = [
        'Add new Red Chili demand',
        'Add new Onion demand',
        'View current data'
      ];
      break;

    case 'READ':
      content = 'I can show you the current demand data. Would you like to see all records or filter by product?';
      suggestions = [
        'Show all demand data',
        'Show Red Chili data',
        'Show recent entries'
      ];
      break;

    case 'UPDATE':
      content = 'I can help you update existing demand records. Which record would you like to modify?';
      suggestions = [
        'Update latest entry',
        'Search for record to update',
        'View all data first'
      ];
      break;

    case 'DELETE':
      content = 'I can help you remove demand records. Please be careful as this action cannot be undone. Which record would you like to delete?';
      suggestions = [
        'Show all records first',
        'Search for record to delete',
        'Cancel'
      ];
      break;

    default:
      content = "Hello! I'm your AgriPredict assistant. I can help you with:\n\n• Viewing and managing demand data\n• Generating price forecasts\n• Analyzing market trends\n\nWhat would you like to do?";
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

function getProductNameFromId(productId: string): string {
  const productMap: Record<string, string> = {
    'red-chili': 'Red Chili',
    'onions': 'Onions',
    'tomatoes': 'Tomatoes',
    'potatoes': 'Potatoes',
    'rice': 'Rice',
    'wheat': 'Wheat'
  };
  return productMap[productId] || productId;
}
