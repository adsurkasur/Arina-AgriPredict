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

A FastAPI-based service for advanced agricultural demand forecasting using multiple ML models including ensemble methods, statistical models, and machine learning algorithms.

## Features

- **Multi-Model Forecasting**: Ensemble, ARIMA, Exponential Smoothing, CatBoost, and more
- **Scenario Planning**: Optimistic, pessimistic, and realistic forecast scenarios
- **Confidence Intervals**: Uncertainty quantification for all predictions
- **Revenue Projections**: Automatic revenue forecasting based on demand predictions
- **Real-time Processing**: Asynchronous processing for high performance
- **RESTful API**: Clean, documented API endpoints

## API Endpoints

### Health Check
```
GET /health
```
Returns service health status and version information.

### Generate Forecast
```
POST /forecast
```
Generate demand forecast using specified models and parameters.

**Request Body:**
```json
{
  "product_id": "string",
  "historical_data": [
    {
      "date": "2024-01-01",
      "quantity": 100.0,
      "price": 25.0
    }
  ],
  "days": 30,
  "selling_price": 25.0,
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

1. **Ensemble** - Combines multiple models for best accuracy
2. **SMA** - Simple Moving Average (basic trend analysis)
3. **WMA** - Weighted Moving Average (recent data weighted more)
4. **ES** - Exponential Smoothing (seasonal trend analysis)
5. **ARIMA** - Statistical time series model
6. **CatBoost** - Machine learning model (ready for training)

## Usage

### Local Development

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Run the service:
```bash
python main.py
```

The API will be available at `http://localhost:8000`

### API Documentation

Once running, visit `http://localhost:8000/docs` for interactive API documentation.

## Deployment

This service is designed to run on Hugging Face Spaces with the following configuration:

- **Runtime**: Python 3.10+
- **Framework**: FastAPI
- **GPU**: Not required (CPU-only ML models)
- **Memory**: 2GB minimum recommended

## Training the CatBoost Model

The CatBoost model is currently using a placeholder implementation. To train it with real data:

1. Prepare your training dataset with features like:
   - Historical prices and quantities
   - Date-based features (day of week, month, etc.)
   - Lag features (previous days' data)
   - Rolling statistics

2. Train the model using the prepared dataset

3. Replace the placeholder implementation in `models/forecast_models.py`

## Architecture

```
analysis-service/
├── main.py              # FastAPI application
├── models/
│   ├── forecast_models.py    # Forecasting algorithms
│   └── data_processor.py     # Data processing utilities
├── utils/
│   ├── config.py            # Configuration settings
│   └── logger.py            # Logging setup
└── requirements.txt         # Python dependencies
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.
