from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from statsmodels.tsa.holtwinters import ExponentialSmoothing
from statsmodels.tsa.arima.model import ARIMA
from catboost import CatBoostRegressor
import uvicorn

app = FastAPI(title="AgriPredict Analysis Service", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data models
class DemandData(BaseModel):
    date: str
    quantity: float
    price: float

class ForecastRequest(BaseModel):
    product_id: str
    historical_data: List[DemandData]
    days: int
    selling_price: float = None

class ForecastResponse(BaseModel):
    forecast_data: List[Dict[str, Any]]
    revenue_projection: List[Dict[str, Any]]
    models_used: List[str]
    summary: str

# Forecasting functions
def simple_moving_average(data: pd.DataFrame, window: int = 7) -> pd.Series:
    """Simple Moving Average forecast"""
    return data['price'].rolling(window=window).mean().iloc[-1]

def weighted_moving_average(data: pd.DataFrame, window: int = 7) -> float:
    """Weighted Moving Average forecast"""
    weights = np.arange(1, window + 1)
    weights = weights / weights.sum()
    return (data['price'].tail(window) * weights).sum()

def exponential_smoothing(data: pd.DataFrame, days: int) -> pd.Series:
    """Exponential Smoothing forecast"""
    model = ExponentialSmoothing(data['price'], seasonal='add', seasonal_periods=7)
    fitted_model = model.fit()
    forecast = fitted_model.forecast(days)
    return forecast

def arima_forecast(data: pd.DataFrame, days: int) -> pd.Series:
    """ARIMA forecast"""
    try:
        model = ARIMA(data['price'], order=(5, 1, 0))
        fitted_model = model.fit()
        forecast = fitted_model.forecast(days)
        return forecast
    except:
        # Fallback to simple average if ARIMA fails
        return pd.Series([data['price'].mean()] * days)

def catboost_forecast(data: pd.DataFrame, days: int) -> pd.Series:
    """CatBoost forecast with feature engineering"""
    # Feature engineering
    df = data.copy()
    df['date'] = pd.to_datetime(df['date'])
    df['day_of_week'] = df['date'].dt.dayofweek
    df['month'] = df['date'].dt.month
    df['day_of_month'] = df['date'].dt.day
    df['lag_1'] = df['price'].shift(1)
    df['lag_7'] = df['price'].shift(7)
    df['rolling_mean_7'] = df['price'].rolling(7).mean()
    df['rolling_std_7'] = df['price'].rolling(7).std()

    # Drop NaN values
    df = df.dropna()

    if len(df) < 10:
        # Not enough data for ML, fallback to simple average
        return pd.Series([data['price'].mean()] * days)

    # Prepare features for training
    feature_cols = ['day_of_week', 'month', 'day_of_month', 'lag_1', 'lag_7', 'rolling_mean_7', 'rolling_std_7']
    X = df[feature_cols]
    y = df['price']

    # Train CatBoost model
    model = CatBoostRegressor(iterations=100, learning_rate=0.1, depth=6, verbose=False)
    model.fit(X, y)

    # Generate future features for forecasting
    last_date = df['date'].max()
    future_dates = [last_date + timedelta(days=i) for i in range(1, days + 1)]

    future_features = []
    last_price = df['price'].iloc[-1]

    for date in future_dates:
        features = {
            'day_of_week': date.weekday(),
            'month': date.month,
            'day_of_month': date.day,
            'lag_1': last_price,
            'lag_7': df['price'].iloc[-7] if len(df) >= 7 else last_price,
            'rolling_mean_7': df['price'].tail(7).mean(),
            'rolling_std_7': df['price'].tail(7).std()
        }
        future_features.append(features)
        last_price = model.predict([list(features.values())])[0]

    future_df = pd.DataFrame(future_features)
    predictions = model.predict(future_df)

    return pd.Series(predictions, index=future_dates)

@app.post("/forecast", response_model=ForecastResponse)
async def generate_forecast(request: ForecastRequest):
    try:
        # Convert data to DataFrame
        df = pd.DataFrame([{
            'date': item.date,
            'quantity': item.quantity,
            'price': item.price
        } for item in request.historical_data])

        if len(df) < 3:
            raise HTTPException(status_code=400, detail="Not enough historical data for forecasting")

        df['date'] = pd.to_datetime(df['date'])
        df = df.sort_values('date').set_index('date')

        days = request.days
        models_used = []

        # Generate forecasts from different models
        forecasts = {}

        try:
            sma_forecast = simple_moving_average(df)
            forecasts['SMA'] = [sma_forecast] * days
            models_used.append('SMA')
        except:
            pass

        try:
            wma_forecast = weighted_moving_average(df)
            forecasts['WMA'] = [wma_forecast] * days
            models_used.append('WMA')
        except:
            pass

        try:
            es_forecast = exponential_smoothing(df, days)
            forecasts['ES'] = es_forecast.values
            models_used.append('ES')
        except:
            pass

        try:
            arima_pred = arima_forecast(df, days)
            forecasts['ARIMA'] = arima_pred.values
            models_used.append('ARIMA')
        except:
            pass

        try:
            catboost_pred = catboost_forecast(df, days)
            forecasts['CatBoost'] = catboost_pred.values
            models_used.append('CatBoost')
        except:
            pass

        if not forecasts:
            raise HTTPException(status_code=500, detail="Failed to generate any forecasts")

        # Ensemble forecast (average of all available models)
        forecast_values = []
        for i in range(days):
            values = [forecasts[model][i] for model in forecasts.keys()]
            forecast_values.append(np.mean(values))

        # Generate forecast data points
        last_date = df.index.max()
        forecast_data = []
        for i, price in enumerate(forecast_values):
            forecast_date = last_date + timedelta(days=i+1)
            forecast_data.append({
                'date': forecast_date.isoformat(),
                'predicted_price': round(float(price), 2),
                'models_contributing': list(forecasts.keys())
            })

        # Revenue projection
        selling_price = request.selling_price or df['price'].iloc[-1]
        revenue_projection = []
        for forecast in forecast_data:
            # Assume average quantity from historical data
            avg_quantity = df['quantity'].mean()
            projected_revenue = avg_quantity * selling_price
            revenue_projection.append({
                'date': forecast['date'],
                'projected_quantity': round(float(avg_quantity), 2),
                'selling_price': round(float(selling_price), 2),
                'projected_revenue': round(float(projected_revenue), 2)
            })

        # Generate summary
        avg_forecast_price = np.mean(forecast_values)
        avg_historical_price = df['price'].mean()
        trend = "increasing" if avg_forecast_price > avg_historical_price else "decreasing"
        change_percent = abs((avg_forecast_price - avg_historical_price) / avg_historical_price * 100)

        summary = f"""# {request.product_id.replace('-', ' ').title()} Price Forecast

## Summary
Based on historical demand data, the ensemble forecast shows a **{trend}** trend over the next {days} days.

## Key Insights
- **Average Historical Price**: ${avg_historical_price:.2f}
- **Average Forecasted Price**: ${avg_forecast_price:.2f}
- **Expected Change**: {change_percent:.1f}% {trend}
- **Models Used**: {', '.join(models_used)}

## Recommendations
{'Consider increasing inventory to meet potential higher demand.' if trend == 'increasing' else 'Monitor market conditions closely as prices may decline.'}
Track actual prices against this forecast and adjust strategies accordingly."""

        return ForecastResponse(
            forecast_data=forecast_data,
            revenue_projection=revenue_projection,
            models_used=models_used,
            summary=summary
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Forecast generation failed: {str(e)}")

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "analysis-service"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
