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
    model_config = {"protected_namespaces": ()}
    
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


# Model Comparison Data Models
class ModelMetrics(BaseModel):
    mae: Optional[float] = Field(None, description="Mean Absolute Error")
    rmse: Optional[float] = Field(None, description="Root Mean Square Error")
    mape: Optional[float] = Field(None, description="Mean Absolute Percentage Error")
    bias: Optional[float] = Field(None, description="Forecast Bias")
    mase: Optional[float] = Field(None, description="Mean Absolute Scaled Error")
    r_squared: Optional[float] = Field(None, description="R-Squared (Coefficient of Determination)")


class ModelComparisonResult(BaseModel):
    model_config = {"protected_namespaces": ()}
    
    model_id: str = Field(..., description="Model identifier")
    model_name: str = Field(..., description="Human-readable model name")
    forecast_data: List[ForecastDataPoint] = Field(..., description="Model forecast data")
    metrics: ModelMetrics = Field(..., description="Model accuracy metrics")
    weight: float = Field(..., description="Weight in weighted ensemble")
    computation_time_ms: Optional[float] = Field(None, description="Time to generate forecast")


class ComparisonRequest(BaseModel):
    product_id: str = Field(..., description="Product identifier")
    historical_data: List[DemandData] = Field(..., min_items=7, description="Historical demand data (min 7 for comparison)")
    days: int = Field(..., ge=1, le=90, description="Forecast horizon in days (max 90 for comparison)")
    include_ensemble: bool = Field(True, description="Include ensemble model in comparison")


class ComparisonResponse(BaseModel):
    models: List[ModelComparisonResult] = Field(..., description="Comparison results for each model")
    best_model: str = Field(..., description="ID of best performing model based on MAE")
    ranking: List[str] = Field(..., description="Models ranked by accuracy (best to worst)")
    summary: str = Field(..., description="Markdown summary of comparison results")
    metadata: Dict[str, Any] = Field(..., description="Comparison metadata")

# Dependency injection
def get_forecast_engine() -> ForecastEngine:
    """Dependency injection for forecast engine"""
    return ForecastEngine()

def get_data_processor() -> DataProcessor:
    """Dependency injection for data processor"""
    return DataProcessor()

# API Endpoints
@app.get("/")
async def root():
    """Root endpoint - provides service info for HuggingFace Spaces"""
    return {
        "service": "AgriPredict Analysis Service",
        "status": "running",
        "version": "1.0.0",
        "description": "Advanced agricultural demand forecasting using ensemble ML models",
        "endpoints": {
            "health": "/health",
            "docs": "/docs",
            "forecast": "/forecast",
            "compare": "/compare"
        },
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "analysis-service",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0"
    }

# Helper functions for forecast generation
def validate_historical_data(df: pd.DataFrame) -> None:
    """Validate that historical data meets minimum requirements"""
    if len(df) < 3:
        raise HTTPException(
            status_code=400,
            detail="Insufficient historical data. Need at least 3 data points."
        )

def prepare_forecast_metadata(request: ForecastRequest, df: pd.DataFrame) -> Dict[str, Any]:
    """Prepare metadata for forecast response"""
    return {
        "data_points": len(df),
        "forecast_horizon": request.days,
        "product_id": request.product_id,
        "generated_at": datetime.utcnow().isoformat(),
        "scenario": request.scenario
    }

def calculate_revenue_if_needed(
    forecast_engine: ForecastEngine,
    request: ForecastRequest,
    forecast_result: Dict[str, Any],
    df: pd.DataFrame
) -> Optional[List[RevenueProjection]]:
    """Calculate revenue projection if selling price is provided"""
    if request.selling_price and request.selling_price > 0:
        return forecast_engine.calculate_revenue_projection(
            forecast_data=forecast_result["forecast_data"],
            selling_price=request.selling_price,
            historical_data=df
        )
    return None

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
        validate_historical_data(df)

        # Generate forecast
        forecast_result = await forecast_engine.generate_forecast(
            df=df,
            days=request.days,
            models=request.models or ["ensemble"],
            include_confidence=request.include_confidence,
            scenario=request.scenario
        )

        # Calculate revenue projection if needed
        revenue_projection = calculate_revenue_if_needed(forecast_engine, request, forecast_result, df)

        # Generate AI summary and confidence
        summary = forecast_engine.generate_summary(
            forecast_data=forecast_result["forecast_data"],
            historical_data=df,
            models_used=forecast_result["models_used"],
            scenario=request.scenario
        )

        confidence = forecast_engine.calculate_overall_confidence(
            forecast_data=forecast_result["forecast_data"]
        )

        # Prepare response
        metadata = prepare_forecast_metadata(request, df)
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


# Model names mapping
MODEL_NAMES = {
    "sma": "Simple Moving Average",
    "wma": "Weighted Moving Average",
    "es": "Exponential Smoothing",
    "arima": "ARIMA",
    "catboost": "CatBoost",
    "ensemble": "Weighted Ensemble"
}


@app.post("/compare", response_model=ComparisonResponse)
async def compare_models(
    request: ComparisonRequest,
    forecast_engine: ForecastEngine = Depends(get_forecast_engine),
    data_processor: DataProcessor = Depends(get_data_processor)
):
    """
    Compare all forecasting models on the same historical data.
    Returns forecasts, accuracy metrics, and rankings for each model.
    """
    try:
        import time
        logger.info(f"Running model comparison for product {request.product_id}")
        
        # Process and validate data
        df = data_processor.process_historical_data(request.historical_data)
        validate_historical_data(df)
        
        if len(df) < 7:
            raise HTTPException(
                status_code=400,
                detail="Model comparison requires at least 7 historical data points for holdout validation."
            )
        
        # Define models to compare
        all_models = ["sma", "wma", "es", "arima", "catboost"]
        if request.include_ensemble:
            all_models.append("ensemble")
        
        comparison_results: List[ModelComparisonResult] = []
        
        # Generate forecasts for each model
        for model_id in all_models:
            start_time = time.time()
            
            try:
                # Generate forecast with metrics calculation
                forecast_result = await forecast_engine.generate_forecast(
                    df=df,
                    days=request.days,
                    models=[model_id],
                    include_confidence=True,
                    scenario="realistic",
                    calculate_metrics=True
                )
                
                computation_time = (time.time() - start_time) * 1000  # ms
                
                # Extract forecast data
                forecast_data = forecast_result.get("forecast_data", [])
                
                # Get metrics from forecast engine
                model_metrics = forecast_engine.model_metrics.get(model_id, {})
                
                # Create response structure
                result = ModelComparisonResult(
                    model_id=model_id,
                    model_name=MODEL_NAMES.get(model_id, model_id.upper()),
                    forecast_data=forecast_data,
                    metrics=ModelMetrics(
                        mae=model_metrics.get("mae"),
                        rmse=model_metrics.get("rmse"),
                        mape=model_metrics.get("mape"),
                        bias=model_metrics.get("bias"),
                        mase=model_metrics.get("mase"),
                        r_squared=model_metrics.get("r_squared")
                    ),
                    weight=forecast_engine.model_weights.get(model_id, 0.0),
                    computation_time_ms=round(computation_time, 2)
                )
                comparison_results.append(result)
                
            except Exception as model_error:
                logger.warning(f"Model {model_id} failed: {str(model_error)}")
                # Add failed model with null metrics
                comparison_results.append(ModelComparisonResult(
                    model_id=model_id,
                    model_name=MODEL_NAMES.get(model_id, model_id.upper()),
                    forecast_data=[],
                    metrics=ModelMetrics(),
                    weight=0.0,
                    computation_time_ms=None
                ))
        
        # Rank models by MAE (lower is better)
        valid_results = [r for r in comparison_results if r.metrics.mae is not None]
        ranked_results = sorted(valid_results, key=lambda r: r.metrics.mae)
        ranking = [r.model_id for r in ranked_results]
        best_model = ranking[0] if ranking else "ensemble"
        
        # Generate comparison summary
        summary = generate_comparison_summary(comparison_results, ranking, best_model)
        
        # Prepare metadata
        metadata = {
            "product_id": request.product_id,
            "data_points": len(df),
            "forecast_horizon": request.days,
            "models_compared": len(all_models),
            "generated_at": datetime.utcnow().isoformat()
        }
        
        response = ComparisonResponse(
            models=comparison_results,
            best_model=best_model,
            ranking=ranking,
            summary=summary,
            metadata=metadata
        )
        
        logger.info(f"Model comparison completed. Best model: {best_model}")
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Model comparison failed: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Model comparison failed: {str(e)}"
        )


def generate_comparison_summary(
    results: List[ModelComparisonResult],
    ranking: List[str],
    best_model: str
) -> str:
    """Generate a markdown summary of model comparison results"""
    
    summary_parts = ["## Model Comparison Results\n"]
    
    # Best model highlight
    best_result = next((r for r in results if r.model_id == best_model), None)
    if best_result and best_result.metrics.mae is not None:
        summary_parts.append(f"**Best Model:** {best_result.model_name}\n")
        summary_parts.append(f"- MAE: {best_result.metrics.mae:.2f}\n")
        summary_parts.append(f"- RMSE: {best_result.metrics.rmse:.2f}\n")
        if best_result.metrics.mape is not None:
            summary_parts.append(f"- MAPE: {best_result.metrics.mape:.2f}%\n")
        if best_result.metrics.r_squared is not None:
            summary_parts.append(f"- R²: {best_result.metrics.r_squared:.4f}\n")
        summary_parts.append("\n")
    
    # Model ranking table
    summary_parts.append("### Model Rankings (by MAE)\n\n")
    summary_parts.append("| Rank | Model | MAE | RMSE | MAPE (%) | R² |\n")
    summary_parts.append("|------|-------|-----|------|----------|----|\n")
    
    for i, model_id in enumerate(ranking, 1):
        result = next((r for r in results if r.model_id == model_id), None)
        if result and result.metrics.mae is not None:
            mape_str = f"{result.metrics.mape:.2f}" if result.metrics.mape is not None else "N/A"
            r2_str = f"{result.metrics.r_squared:.4f}" if result.metrics.r_squared is not None else "N/A"
            summary_parts.append(
                f"| {i} | {result.model_name} | {result.metrics.mae:.2f} | "
                f"{result.metrics.rmse:.2f} | {mape_str} | {r2_str} |\n"
            )
    
    # Weight information
    weighted_models = [r for r in results if r.weight > 0]
    if weighted_models:
        summary_parts.append("\n### Ensemble Weights\n")
        for result in sorted(weighted_models, key=lambda r: r.weight, reverse=True):
            weight_pct = result.weight * 100
            summary_parts.append(f"- {result.model_name}: {weight_pct:.1f}%\n")
    
    return "".join(summary_parts)

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
