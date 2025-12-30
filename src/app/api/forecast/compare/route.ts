import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ComparisonRequest, ComparisonResponse, ModelComparisonResult, ForecastDataPoint } from '@/types/api';
import { verifyIdToken } from '@/lib/auth';

const ANALYSIS_SERVICE_URL = process.env.ANALYSIS_SERVICE_URL || 'http://localhost:7860';

interface DemandRecord {
  date: string;
  quantity: number;
  price: number;
}

async function fetchHistoricalData(db: any, productId: string, userId: string): Promise<DemandRecord[]> {
  const records = await db.collection('demands')
    .find({ productId, userId })
    .sort({ date: -1 })
    .limit(100)
    .toArray();
  
  return records.map((item: any) => ({
    date: item.date,
    quantity: item.quantity,
    price: item.price
  }));
}

function transformComparisonResult(analysisResult: any): ComparisonResponse {
  const models: ModelComparisonResult[] = analysisResult.models.map((model: any) => ({
    modelId: model.model_id,
    modelName: model.model_name,
    forecastData: model.forecast_data.map((item: any) => ({
      date: item.date,
      predictedValue: item.predicted_value,
      confidenceLower: item.confidence_lower,
      confidenceUpper: item.confidence_upper,
      modelUsed: item.model_used
    })),
    metrics: {
      mae: model.metrics.mae,
      rmse: model.metrics.rmse,
      mape: model.metrics.mape,
      bias: model.metrics.bias,
      mase: model.metrics.mase,
      rSquared: model.metrics.r_squared
    },
    weight: model.weight,
    computationTimeMs: model.computation_time_ms
  }));

  return {
    models,
    bestModel: analysisResult.best_model,
    ranking: analysisResult.ranking,
    summary: analysisResult.summary,
    metadata: {
      productId: analysisResult.metadata.product_id,
      dataPoints: analysisResult.metadata.data_points,
      forecastHorizon: analysisResult.metadata.forecast_horizon,
      modelsCompared: analysisResult.metadata.models_compared,
      generatedAt: analysisResult.metadata.generated_at
    }
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

    const body: ComparisonRequest = await request.json();
    
    // Validate request
    if (!body.productId || !body.days) {
      return NextResponse.json(
        { error: 'Missing required fields: productId and days' },
        { status: 400 }
      );
    }
    
    if (body.days < 1 || body.days > 90) {
      return NextResponse.json(
        { error: 'Days must be between 1 and 90 for model comparison' },
        { status: 400 }
      );
    }

    // Connect to database and fetch historical data
    const db = await connectToDatabase();
    const historicalData = await fetchHistoricalData(db, body.productId, decodedToken.uid);

    if (historicalData.length < 7) {
      return NextResponse.json(
        { error: 'Model comparison requires at least 7 historical data points' },
        { status: 400 }
      );
    }

    // Call analysis service for comparison
    try {
      const analysisResponse = await fetch(`${ANALYSIS_SERVICE_URL}/compare`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: body.productId,
          historical_data: historicalData,
          days: body.days,
          include_ensemble: body.includeEnsemble ?? true
        }),
      });

      if (!analysisResponse.ok) {
        const errorData = await analysisResponse.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Analysis service error');
      }

      const analysisResult = await analysisResponse.json();
      const response = transformComparisonResult(analysisResult);

      return NextResponse.json(response);
    } catch (error) {
      console.error('Analysis service comparison failed:', error);
      return NextResponse.json(
        { error: 'Model comparison service unavailable. Please try again later.' },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error('Comparison API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}