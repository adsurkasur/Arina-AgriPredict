---
title: AgriPredict Analysis Service
emoji: 🌾
colorFrom: green
colorTo: blue
sdk: docker
app_file: main.py
pinned: false
---

# AgriPredict Analysis Service

A production-ready FastAPI service for agricultural demand forecasting with multiple ML models including CatBoost ensemble methods.

## Features

- **Multi-Model Forecasting**: SMA, WMA, Exponential Smoothing, ARIMA, and CatBoost
- **RESTful API**: Clean endpoints for health checks, model listing, and forecasting
- **Docker Ready**: Containerized for easy deployment
- **Hugging Face Spaces**: Configured for cloud deployment
- **Comprehensive Testing**: Built-in test suite for validation
- **Confidence Intervals**: Uncertainty quantification for predictions
- **Real-time Processing**: Asynchronous processing for high performance

## Quick Start

### 1. Install Dependencies
```bash
python run.py install
```

### 2. Run the Service
```bash
python run.py run
```

The API will be available at:
- **Local Service**: http://localhost:7860
- **Local Documentation**: http://localhost:7860/docs
- **Local Health Check**: http://localhost:7860/health

### Production (Hugging Face Spaces)
- **Live Service**: https://adsurkasur-agripredict-analysis.hf.space
- **Live Documentation**: https://adsurkasur-agripredict-analysis.hf.space/docs
- **Live Health Check**: https://adsurkasur-agripredict-analysis.hf.space/health

### 3. Test the Service
```bash
python run.py test
```

### 4. Train CatBoost Model (Optional)
```bash
python run.py train
```

## API Endpoints

### GET /health
Health check endpoint
```json
{
  "status": "healthy",
  "service": "AgriPredict Analysis Service",
  "version": "1.0.0"
}
```

### GET /models
List available forecasting models
```json
{
  "models": ["SMA", "WMA", "ES", "ARIMA", "CatBoost"]
}
```

### POST /forecast
Generate demand forecasts

**Request Body:**
```json
{
  "historical_data": [
    {
      "date": "2023-01-01",
      "demand": 100,
      "price": 50.0,
      "weather_temp": 25.0
    }
  ],
  "forecast_horizon": 7,
  "models": ["SMA", "WMA", "ES"],
  "confidence_level": 0.95
}
```

**Response:**
```json
{
  "forecast_horizon": 7,
  "models_used": ["SMA", "WMA", "ES"],
  "forecast_dates": ["2023-01-08", "2023-01-09", ...],
  "forecasts": {
    "SMA": [105.2, 107.8, ...],
    "WMA": [108.5, 110.2, ...],
    "ES": [106.1, 108.9, ...]
  }
}
```
  "models": ["ensemble"],
  "include_confidence": true,
  "scenario": "realistic"
}
```

### List Models
```
GET /models
```
Returns list of available forecasting models.

## Models Available

1. **SMA** - Simple Moving Average (basic trend analysis)
2. **WMA** - Weighted Moving Average (recent data weighted more)
3. **ES** - Exponential Smoothing (seasonal trend analysis)
4. **ARIMA** - Statistical time series model
5. **CatBoost** - Machine learning model (gradient boosting)

## Usage

### Local Development

1. Install dependencies:
```bash
python run.py install
```

2. Run the service:
```bash
python run.py run
```

The API will be available at `http://localhost:7860`

### API Documentation

Once running, visit `http://localhost:7860/docs` for interactive API documentation.

### Testing

Test the service with the built-in test suite:
```bash
python run.py test
```

## Deployment

This service is designed to run on Hugging Face Spaces with the following configuration:

- **Runtime**: Python 3.10+
- **Framework**: FastAPI with Uvicorn
- **Container**: Docker-based deployment
- **Port**: 7860
- **GPU**: Not required (CPU-only ML models)
- **Memory**: 2GB minimum recommended

## Training the CatBoost Model

The CatBoost model includes a training script for artificial data:

```bash
python run.py train
```

For production use with real data:
1. Prepare your training dataset with features like:
   - Historical demand and prices
   - Date-based features (day of week, month, season)
   - Lag features (previous days' data)
   - Rolling statistics
   - Weather data

2. Modify `train_catboost.py` to use your real dataset

3. Train the model and update the implementation in `models/forecast_models.py`

## Project Structure

```
analysis-service/
├── main.py                 # FastAPI application
├── models/
│   ├── forecast_models.py  # Forecasting algorithms
│   └── data_processor.py   # Data validation & processing
├── utils/
│   ├── config.py          # Configuration management
│   └── logger.py          # Logging setup
├── train_catboost.py      # Model training script
├── test_service.py        # API testing script
├── run.py                 # Development runner
├── requirements.txt       # Python dependencies
├── Dockerfile            # Container configuration
└── README.md             # This file
```

## Development Commands

- `python run.py install` - Install dependencies
- `python run.py run` - Start the service
- `python run.py test` - Test the running service
- `python run.py train` - Train CatBoost model

## Error Handling

The API includes comprehensive error handling:
- Input validation with Pydantic models
- Graceful error responses with appropriate HTTP status codes
- Detailed error messages for debugging
- Logging for monitoring and troubleshooting

## Contributing

1. Test locally before committing: `python run.py test`
2. Ensure all tests pass
3. Update documentation as needed
4. Follow the existing code style and structure

## License

MIT License - see LICENSE file for details.
