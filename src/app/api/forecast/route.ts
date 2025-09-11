import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ForecastRequest, ForecastResponse, ForecastDataPoint } from '@/types/api';
import { GoogleGenerativeAI } from '@google/generative-ai';

const ANALYSIS_SERVICE_URL = process.env.ANALYSIS_SERVICE_URL || 'http://localhost:7860';
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const body: ForecastRequest = await request.json();

    if (!body.productId || !body.days) {
      return NextResponse.json(
        { error: 'Missing required fields: productId and days' },
        { status: 400 }
      );
    }

    // Get historical data for the product
    const historicalData = await db.collection('demands')
      .find({ productId: body.productId })
      .sort({ date: -1 })
      .limit(100) // Get more data for better forecasting
      .toArray();

    if (historicalData.length === 0) {
      return NextResponse.json(
        { error: 'No historical data found for this product' },
        { status: 404 }
      );
    }

    // Try to use the analysis service
    try {
      const analysisResponse = await fetch(`${ANALYSIS_SERVICE_URL}/forecast`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_id: body.productId,
          historical_data: historicalData.map(item => ({
            date: item.date,
            quantity: item.quantity,
            price: item.price
          })),
          days: body.days,
          selling_price: body.sellingPrice
        }),
      });

      if (analysisResponse.ok) {
        const analysisResult = await analysisResponse.json();

        // Transform the response to match our API format
        const forecastData: ForecastDataPoint[] = analysisResult.forecast_data.map((item: any) => ({
          date: item.date,
          predictedValue: item.predicted_value, // Updated to match our API
          confidenceLower: item.confidence_lower,
          confidenceUpper: item.confidence_upper,
          modelUsed: item.model_used
        }));

        const response: ForecastResponse = {
          forecastData,
          revenueProjection: analysisResult.revenue_projection,
          modelsUsed: analysisResult.models_used,
          summary: analysisResult.summary,
          confidence: analysisResult.confidence,
          scenario: analysisResult.scenario
        };

        return NextResponse.json(response);
      }
    } catch (serviceError) {
      console.warn('Analysis service unavailable, falling back to simple forecast:', serviceError);
    }

    // Get product name from historical data
    const productName = historicalData[0]?.productName || body.productId;

    // Fallback to simple forecasting if service is unavailable
    const forecastData = generateSimpleForecast(historicalData, body.days);

    // Generate AI summary using Gemini if available
    let summary = generateForecastSummary(productName, forecastData, historicalData);

    try {
      const geminiSummary = await generateGeminiSummary(productName, forecastData, historicalData);
      if (geminiSummary) {
        summary = geminiSummary;
      }
    } catch (error) {
      console.warn('Gemini summary generation failed:', error);
    }

    const response: ForecastResponse = {
      forecastData,
      summary
    };

    return NextResponse.json(response);
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
      predictedValue: Math.round(predictedPrice * 100) / 100
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


