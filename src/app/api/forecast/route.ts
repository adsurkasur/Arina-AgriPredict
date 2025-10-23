import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ForecastRequest, ForecastResponse, ForecastDataPoint } from '@/types/api';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { verifyIdToken } from '@/lib/auth';

const ANALYSIS_SERVICE_URL = process.env.ANALYSIS_SERVICE_URL || 'http://localhost:7860';
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

async function validateForecastRequest(body: ForecastRequest): Promise<{ isValid: boolean; error?: string }> {
  if (!body.productId || !body.days) {
    return { isValid: false, error: 'Missing required fields: productId and days' };
  }
  if (body.days < 1 || body.days > 365) {
    return { isValid: false, error: 'Days must be between 1 and 365' };
  }
  return { isValid: true };
}

async function fetchHistoricalData(db: any, productId: string, userId: string): Promise<any[]> {
  return await db.collection('demands')
    .find({ productId, userId })
    .sort({ date: -1 })
    .limit(100)
    .toArray();
}

async function callAnalysisService(productId: string, historicalData: any[], days: number, sellingPrice?: number): Promise<any | null> {
  try {
    const analysisResponse = await fetch(`${ANALYSIS_SERVICE_URL}/forecast`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        product_id: productId,
        historical_data: historicalData.map(item => ({
          date: item.date,
          quantity: item.quantity,
          price: item.price
        })),
        days,
        selling_price: sellingPrice
      }),
    });

    if (analysisResponse.ok) {
      return await analysisResponse.json();
    }
  } catch (error) {
    console.warn('Analysis service call failed:', error);
  }
  return null;
}

function transformAnalysisResult(analysisResult: any): ForecastResponse {
  const forecastData: ForecastDataPoint[] = analysisResult.forecast_data.map((item: any) => ({
    date: item.date,
    predictedValue: item.predicted_value,
    confidenceLower: item.confidence_lower,
    confidenceUpper: item.confidence_upper,
    modelUsed: item.model_used
  }));

  return {
    forecastData,
    revenueProjection: analysisResult.revenue_projection,
    modelsUsed: analysisResult.models_used,
    summary: analysisResult.summary,
    confidence: analysisResult.confidence,
    scenario: analysisResult.scenario
  };
}

async function generateFallbackForecast(historicalData: any[], productId: string, days: number): Promise<ForecastResponse> {
  const productName = historicalData[0]?.productName || productId;
  const forecastData = generateSimpleForecast(historicalData, days);

  let summary = generateForecastSummary(productName, forecastData, historicalData);

  try {
    const geminiSummary = await generateGeminiSummary(productName, forecastData, historicalData);
    if (geminiSummary) {
      summary = geminiSummary;
    }
  } catch (error) {
    console.warn('Gemini summary generation failed:', error);
  }

  return { forecastData, summary };
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
    const body: ForecastRequest = await request.json();

    // Validate request
    const validation = await validateForecastRequest(body);
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Fetch historical data
    const historicalData = await fetchHistoricalData(db, body.productId, userId);
    if (historicalData.length === 0) {
      return NextResponse.json(
        { error: 'No historical data found for this product' },
        { status: 404 }
      );
    }

    // Try analysis service first
    const analysisResult = await callAnalysisService(body.productId, historicalData, body.days, body.sellingPrice);
    if (analysisResult) {
      const response = transformAnalysisResult(analysisResult);
      return NextResponse.json(response);
    }

    // Fallback to simple forecast
    console.warn('Analysis service unavailable, using fallback forecast');
    const fallbackResponse = await generateFallbackForecast(historicalData, body.productId, body.days);
    return NextResponse.json(fallbackResponse);

  } catch (error) {
    console.error('Error generating forecast:', error);
    return NextResponse.json(
      { error: 'Failed to generate forecast' },
      { status: 500 }
    );
  }
}

function generateSimpleForecast(historicalData: any[], days: number): ForecastDataPoint[] {
  const forecast: ForecastDataPoint[] = [];
  const lastDate = new Date(historicalData[0].date);

  // Calculate average price from recent data
  const recentData = historicalData.slice(0, 10);
  const avgPrice = recentData.reduce((sum, item) => sum + item.price, 0) / recentData.length;

  // Simple trend calculation
  const priceTrend = recentData.length > 1 ?
    (recentData[0].price - recentData[recentData.length - 1].price) / recentData.length : 0;

  for (let i = 1; i <= days; i++) {
    const forecastDate = new Date(lastDate);
    forecastDate.setDate(forecastDate.getDate() + i);

    // Apply simple trend and some randomness
    const trendMultiplier = 1 + (priceTrend / avgPrice) * (i / days);
    const randomFactor = 0.9 + Math.random() * 0.2; // ±10% randomness
    const predictedPrice = avgPrice * trendMultiplier * randomFactor;

    forecast.push({
      date: forecastDate.toISOString(),
      predictedValue: Math.round(predictedPrice * 100) / 100,
      confidenceLower: Math.round(predictedPrice * 0.85 * 100) / 100, // -15% confidence interval
      confidenceUpper: Math.round(predictedPrice * 1.15 * 100) / 100  // +15% confidence interval
    });
  }

  return forecast;
}

function generateForecastSummary(productName: string, forecastData: ForecastDataPoint[], historicalData: any[]): string {
  const avgHistoricalPrice = historicalData.reduce((sum, item) => sum + item.price, 0) / historicalData.length;
  const avgForecastPrice = forecastData.reduce((sum, item) => sum + item.predictedValue, 0) / forecastData.length;

  const trend = avgForecastPrice > avgHistoricalPrice ? 'increasing' : 'decreasing';
  const changePercent = Math.abs(((avgForecastPrice - avgHistoricalPrice) / avgHistoricalPrice) * 100);

  return `# ${productName} Price Forecast

## Summary
Based on historical demand data, the forecasted prices for ${productName} show a **${trend}** trend over the next ${forecastData.length} days.

## Key Insights
- **Average Historical Price**: $${avgHistoricalPrice.toFixed(2)}
- **Average Forecasted Price**: $${avgForecastPrice.toFixed(2)}
- **Expected Change**: ${changePercent.toFixed(1)}% ${trend === 'increasing' ? 'increase' : 'decrease'}

## Recommendations
${trend === 'increasing' ? '- Consider increasing inventory to meet potential higher demand' : '- Monitor market conditions closely as prices may decline'}
- Track actual prices against this forecast and adjust strategies accordingly

*This forecast is based on historical patterns and should be used as a guide, not definitive prediction.*`;
}

async function generateGeminiSummary(productName: string, forecastData: ForecastDataPoint[], historicalData: any[]): Promise<string | null> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const avgHistoricalPrice = historicalData.reduce((sum, item) => sum + item.price, 0) / historicalData.length;
    const avgForecastPrice = forecastData.reduce((sum, item) => sum + item.predictedValue, 0) / forecastData.length;

    const prompt = `
You are an agricultural market analyst. Based on the following data, generate a comprehensive and insightful summary of the price forecast for ${productName}.

Historical Data Summary:
- Average historical price: $${avgHistoricalPrice.toFixed(2)}
- Number of historical records: ${historicalData.length}
- Date range: ${historicalData[historicalData.length - 1]?.date} to ${historicalData[0]?.date}

Forecast Data Summary:
- Forecast period: ${forecastData.length} days
- Average forecasted price: $${avgForecastPrice.toFixed(2)}
- Forecast dates: ${forecastData[0]?.date} to ${forecastData[forecastData.length - 1]?.date}

Please provide:
1. An analysis of the current market trend
2. Key insights about price movements
3. Practical recommendations for farmers/businesses
4. Risk factors to consider
5. Market opportunities or challenges

Format your response in Markdown with clear headings and bullet points. Keep it professional yet accessible for micro and small-scale agricultural businesses.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini summary generation failed:', error);
    return null;
  }
}


