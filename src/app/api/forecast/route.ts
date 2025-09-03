import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ForecastRequest, ForecastResponse, ForecastDataPoint } from '@/types/api';

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
      .limit(30) // Last 30 records for forecasting
      .toArray();

    if (historicalData.length === 0) {
      return NextResponse.json(
        { error: 'No historical data found for this product' },
        { status: 404 }
      );
    }

    // Simple forecasting algorithm (moving average)
    const forecastData = generateForecast(historicalData, body.days);

    // Generate AI summary
    const summary = generateForecastSummary(body.productId, forecastData, historicalData);

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

function generateForecast(historicalData: any[], days: number): ForecastDataPoint[] {
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

function generateForecastSummary(productId: string, forecastData: ForecastDataPoint[], historicalData: any[]): string {
  const productName = getProductNameFromId(productId);
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
