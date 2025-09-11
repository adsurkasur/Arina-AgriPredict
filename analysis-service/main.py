"""
AgriPredict Analysis Service
A FastAPI-based service for agricultural demand forecasting using multiple ML models.
"""

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import logging
import os
from contextlib import asynccontextmanager

# Import our custom modules
from models.forecast_models import ForecastEngine
from models.data_processor import DataProcessor
from utils.config import settings
from utils.logger import setup_logger

# Setup logging
logger = setup_logger(__name__)

# Lifespan context manager for startup/shutdown events
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting AgriPredict Analysis Service")
    yield
    # Shutdown
    logger.info("Shutting down AgriPredict Analysis Service")

# Create FastAPI app
app = FastAPI(
    title="AgriPredict Analysis Service",
    description="Advanced agricultural demand forecasting using ensemble ML models",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware for Next.js integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "https://*.huggingface.co",
        "https://huggingface.co",
        os.getenv("FRONTEND_URL", "*")
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data Models
class DemandData(BaseModel):
    date: str = Field(..., description="ISO date string")
    quantity: float = Field(..., gt=0, description="Demand quantity")
    price: float = Field(..., gt=0, description="Price per unit")

class ForecastRequest(BaseModel):
    product_id: str = Field(..., description="Product identifier")
    historical_data: List[DemandData] = Field(..., min_items=3, description="Historical demand data")
    days: int = Field(..., ge=1, le=365, description="Forecast horizon in days")
    selling_price: Optional[float] = Field(None, gt=0, description="Selling price for revenue calculation")
    date_from: Optional[str] = Field(None, description="Start date for historical data filter")
    date_to: Optional[str] = Field(None, description="End date for historical data filter")
    models: Optional[List[str]] = Field(["ensemble"], description="Models to use for forecasting")
    include_confidence: Optional[bool] = Field(True, description="Include confidence intervals")
    scenario: Optional[str] = Field("realistic", description="Forecast scenario")

class ForecastDataPoint(BaseModel):
    date: str = Field(..., description="Forecast date")
    predicted_value: float = Field(..., description="Predicted demand/price")
    confidence_lower: Optional[float] = Field(None, description="Lower confidence bound")
    confidence_upper: Optional[float] = Field(None, description="Upper confidence bound")
    model_used: Optional[str] = Field(None, description="Model that generated this prediction")

class RevenueProjection(BaseModel):
    date: str = Field(..., description="Projection date")
    projected_quantity: float = Field(..., description="Projected quantity")
    selling_price: float = Field(..., description="Selling price")
    projected_revenue: float = Field(..., description="Projected revenue")
    confidence_lower: Optional[float] = Field(None, description="Lower revenue confidence")
    confidence_upper: Optional[float] = Field(None, description="Upper revenue confidence")

class ForecastResponse(BaseModel):
    forecast_data: List[ForecastDataPoint] = Field(..., description="Forecast data points")
    revenue_projection: Optional[List[RevenueProjection]] = Field(None, description="Revenue projections")
    models_used: List[str] = Field(..., description="Models used in forecasting")
    summary: str = Field(..., description="AI-generated summary in Markdown")
    confidence: Optional[float] = Field(None, description="Overall forecast confidence")
    scenario: Optional[str] = Field(None, description="Applied scenario")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Additional metadata")

# Dependency injection
def get_forecast_engine() -> ForecastEngine:
    """Dependency injection for forecast engine"""
    return ForecastEngine()

def get_data_processor() -> DataProcessor:
    """Dependency injection for data processor"""
    return DataProcessor()

# API Endpoints
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "analysis-service",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0"
    }

@app.post("/forecast", response_model=ForecastResponse)
async def generate_forecast(
    request: ForecastRequest,
    forecast_engine: ForecastEngine = Depends(get_forecast_engine),
    data_processor: DataProcessor = Depends(get_data_processor)
):
    """
    Generate demand forecast using ensemble ML models
    """
    try:
        logger.info(f"Generating forecast for product {request.product_id}")

        # Process and validate data
        df = data_processor.process_historical_data(request.historical_data)

        if len(df) < 3:
            raise HTTPException(
                status_code=400,
                detail="Insufficient historical data. Need at least 3 data points."
            )

        # Generate forecast
        forecast_result = await forecast_engine.generate_forecast(
            df=df,
            days=request.days,
            models=request.models or ["ensemble"],
            include_confidence=request.include_confidence,
            scenario=request.scenario
        )

        # Calculate revenue projection if selling price provided
        revenue_projection = None
        if request.selling_price and request.selling_price > 0:
            revenue_projection = forecast_engine.calculate_revenue_projection(
                forecast_data=forecast_result["forecast_data"],
                selling_price=request.selling_price,
                historical_data=df
            )

        # Generate AI summary
        summary = forecast_engine.generate_summary(
            forecast_data=forecast_result["forecast_data"],
            historical_data=df,
            models_used=forecast_result["models_used"],
            scenario=request.scenario
        )

        # Calculate overall confidence
        confidence = forecast_engine.calculate_overall_confidence(
            forecast_data=forecast_result["forecast_data"]
        )

        # Prepare metadata
        metadata = {
            "data_points": len(df),
            "forecast_horizon": request.days,
            "product_id": request.product_id,
            "generated_at": datetime.utcnow().isoformat(),
            "scenario": request.scenario
        }

        response = ForecastResponse(
            forecast_data=forecast_result["forecast_data"],
            revenue_projection=revenue_projection,
            models_used=forecast_result["models_used"],
            summary=summary,
            confidence=confidence,
            scenario=request.scenario,
            metadata=metadata
        )

        logger.info(f"Successfully generated forecast for product {request.product_id}")
        return response

    except Exception as e:
        logger.error(f"Forecast generation failed: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Forecast generation failed: {str(e)}"
        )

@app.get("/models")
async def list_available_models():
    """List all available forecasting models"""
    return {
        "models": [
            {
                "id": "ensemble",
                "name": "Ensemble (Recommended)",
                "description": "Combines multiple models for best accuracy",
                "type": "ensemble"
            },
            {
                "id": "sma",
                "name": "Simple Moving Average",
                "description": "Basic trend analysis",
                "type": "statistical"
            },
            {
                "id": "wma",
                "name": "Weighted Moving Average",
                "description": "Recent data weighted more",
                "type": "statistical"
            },
            {
                "id": "es",
                "name": "Exponential Smoothing",
                "description": "Seasonal trend analysis",
                "type": "statistical"
            },
            {
                "id": "arima",
                "name": "ARIMA",
                "description": "Statistical time series model",
                "type": "statistical"
            },
            {
                "id": "catboost",
                "name": "CatBoost",
                "description": "Machine learning model",
                "type": "ml"
            }
        ]
    }

# Error handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail}
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    logger.error(f"Unhandled exception: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 7860)),  # Use 7860 for Hugging Face Spaces
        reload=True
    )
