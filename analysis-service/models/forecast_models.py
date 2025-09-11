"""
Forecasting models for AgriPredict Analysis Service
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from dataclasses import dataclass
import asyncio
from concurrent.futures import ThreadPoolExecutor
import traceback

# Import ML libraries (lazy loading to avoid startup issues)
STATS_MODELS_AVAILABLE = True
CATBOOST_AVAILABLE = True

def _import_statsmodels():
    """Lazy import of statsmodels"""
    global ExponentialSmoothing, ARIMA, STATS_MODELS_AVAILABLE
    try:
        if 'ExponentialSmoothing' not in globals():
            from statsmodels.tsa.holtwinters import ExponentialSmoothing
            from statsmodels.tsa.arima.model import ARIMA
    except ImportError:
        STATS_MODELS_AVAILABLE = False
        logger.warning("Statsmodels not available")

def _import_catboost():
    """Lazy import of CatBoost"""
    global CatBoostRegressor, CATBOOST_AVAILABLE
    try:
        if 'CatBoostRegressor' not in globals():
            from catboost import CatBoostRegressor
    except ImportError:
        CATBOOST_AVAILABLE = False
        logger.warning("CatBoost not available")

from utils.logger import setup_logger
from utils.config import settings

logger = setup_logger(__name__)

logger = setup_logger(__name__)

@dataclass
class ForecastResult:
    """Container for forecast results"""
    values: List[float]
    confidence_lower: Optional[List[float]] = None
    confidence_upper: Optional[List[float]] = None
    model_name: str = ""

class ForecastEngine:
    """Main forecasting engine with multiple models"""

    def __init__(self):
        self.logger = logger
        self.executor = ThreadPoolExecutor(max_workers=4)

    async def generate_forecast(
        self,
        df: pd.DataFrame,
        days: int,
        models: List[str],
        include_confidence: bool = True,
        scenario: str = "realistic"
    ) -> Dict[str, Any]:
        """
        Generate forecast using specified models

        Args:
            df: Historical data DataFrame
            days: Number of days to forecast
            models: List of model names to use
            include_confidence: Whether to include confidence intervals
            scenario: Forecast scenario (optimistic, pessimistic, realistic)

        Returns:
            Dictionary with forecast results
        """
        try:
            self.logger.info(f"Generating {days}-day forecast using models: {models}")

            # Apply scenario adjustment
            scenario_multiplier = self._get_scenario_multiplier(scenario)
            adjusted_df = self._apply_scenario_adjustment(df, scenario_multiplier)

            # Generate model forecasts
            model_results = await self._generate_model_forecasts(adjusted_df, days, models, include_confidence)

            # Handle fallback if no models succeeded
            if not model_results:
                model_results = self._handle_fallback_forecast(adjusted_df, days)

            # Generate ensemble if requested
            if self._should_generate_ensemble(models):
                ensemble_result = self._generate_ensemble_forecast(model_results, days, include_confidence)
                model_results['Ensemble'] = ensemble_result

            # Prepare final forecast data
            final_forecast = self._prepare_forecast_data(model_results, adjusted_df, days)

            return {
                "forecast_data": final_forecast,
                "models_used": list(model_results.keys()),
                "scenario": scenario
            }

        except Exception as e:
            self.logger.error(f"Forecast generation failed: {str(e)}")
            raise

    def _apply_scenario_adjustment(self, df: pd.DataFrame, multiplier: float) -> pd.DataFrame:
        """Apply scenario multiplier to price data"""
        adjusted_df = df.copy()
        adjusted_df['price'] = adjusted_df['price'] * multiplier
        return adjusted_df

    async def _generate_model_forecasts(
        self,
        df: pd.DataFrame,
        days: int,
        models: List[str],
        include_confidence: bool
    ) -> Dict[str, ForecastResult]:
        """Generate forecasts from individual models"""
        forecast_tasks = []
        model_results = {}

        # Create forecast tasks for each model
        for model_name in models:
            if model_name.lower() != 'ensemble' and hasattr(self, f'_generate_{model_name.lower()}_forecast'):
                task = asyncio.get_event_loop().run_in_executor(
                    self.executor,
                    getattr(self, f'_generate_{model_name.lower()}_forecast'),
                    df.copy(),
                    days,
                    include_confidence
                )
                forecast_tasks.append((model_name, task))

        # Execute all forecast tasks
        if forecast_tasks:
            results = await asyncio.gather(*[task for _, task in forecast_tasks], return_exceptions=True)

            for (model_name, _), result in zip(forecast_tasks, results):
                if isinstance(result, Exception):
                    self.logger.warning(f"Model {model_name} failed: {str(result)}")
                    continue

                if result and result.values:
                    model_results[model_name] = result

        return model_results

    def _handle_fallback_forecast(self, df: pd.DataFrame, days: int) -> Dict[str, ForecastResult]:
        """Handle fallback when all models fail"""
        self.logger.warning("All models failed, using fallback forecast")
        fallback_result = self._generate_fallback_forecast(df, days)
        return {'Fallback': fallback_result}

    def _should_generate_ensemble(self, models: List[str]) -> bool:
        """Check if ensemble forecast should be generated"""
        return 'ensemble' in [m.lower() for m in models]

    def _get_scenario_multiplier(self, scenario: str) -> float:
        """Get multiplier for scenario adjustment"""
        multipliers = {
            'optimistic': 1.1,  # 10% increase
            'pessimistic': 0.9,  # 10% decrease
            'realistic': 1.0    # No change
        }
        return multipliers.get(scenario.lower(), 1.0)

    def _generate_sma_forecast(
        self,
        df: pd.DataFrame,
        days: int,
        include_confidence: bool = True
    ) -> ForecastResult:
        """Simple Moving Average forecast"""
        try:
            if len(df) < 7:
                raise ValueError("Insufficient data for SMA")

            window = min(7, len(df))
            sma_value = df['price'].rolling(window=window).mean().iloc[-1]

            if pd.isna(sma_value):
                sma_value = df['price'].mean()

            values = [float(sma_value)] * days

            # Simple confidence interval
            std_dev = df['price'].std()
            confidence_lower = [v - std_dev * 0.5 for v in values] if include_confidence else None
            confidence_upper = [v + std_dev * 0.5 for v in values] if include_confidence else None

            return ForecastResult(
                values=values,
                confidence_lower=confidence_lower,
                confidence_upper=confidence_upper,
                model_name="SMA"
            )

        except Exception as e:
            self.logger.error(f"SMA forecast failed: {str(e)}")
            raise

    def _generate_wma_forecast(
        self,
        df: pd.DataFrame,
        days: int,
        include_confidence: bool = True
    ) -> ForecastResult:
        """Weighted Moving Average forecast"""
        try:
            if len(df) < 7:
                raise ValueError("Insufficient data for WMA")

            window = min(7, len(df))
            weights = np.arange(1, window + 1)
            weights = weights / weights.sum()

            wma_value = (df['price'].tail(window) * weights).sum()

            if pd.isna(wma_value):
                wma_value = df['price'].mean()

            values = [float(wma_value)] * days

            # Confidence interval
            std_dev = df['price'].std()
            confidence_lower = [v - std_dev * 0.3 for v in values] if include_confidence else None
            confidence_upper = [v + std_dev * 0.3 for v in values] if include_confidence else None

            return ForecastResult(
                values=values,
                confidence_lower=confidence_lower,
                confidence_upper=confidence_upper,
                model_name="WMA"
            )

        except Exception as e:
            self.logger.error(f"WMA forecast failed: {str(e)}")
            raise

    def _generate_es_forecast(
        self,
        df: pd.DataFrame,
        days: int,
        include_confidence: bool = True
    ) -> ForecastResult:
        """Exponential Smoothing forecast"""
        try:
            # Lazy import statsmodels
            _import_statsmodels()

            if not STATS_MODELS_AVAILABLE:
                raise ImportError("statsmodels not available")

            if len(df) < 7:
                raise ValueError("Insufficient data for Exponential Smoothing")

            # Prepare data for exponential smoothing
            ts_data = df.set_index('date')['price']

            model = ExponentialSmoothing(ts_data, seasonal='add', seasonal_periods=7)
            fitted_model = model.fit()

            forecast = fitted_model.forecast(days)
            values = forecast.values.tolist()

            # Get confidence intervals if available
            if include_confidence:
                try:
                    pred = fitted_model.get_prediction()
                    confidence_intervals = pred.conf_int()
                    confidence_lower = confidence_intervals.iloc[:, 0].tail(days).values.tolist()
                    confidence_upper = confidence_intervals.iloc[:, 1].tail(days).values.tolist()
                except:
                    # Fallback confidence interval
                    std_dev = df['price'].std()
                    confidence_lower = [v - std_dev for v in values]
                    confidence_upper = [v + std_dev for v in values]
            else:
                confidence_lower = None
                confidence_upper = None

            return ForecastResult(
                values=values,
                confidence_lower=confidence_lower,
                confidence_upper=confidence_upper,
                model_name="ES"
            )

        except Exception as e:
            self.logger.error(f"ES forecast failed: {str(e)}")
            raise

    def _generate_arima_forecast(
        self,
        df: pd.DataFrame,
        days: int,
        include_confidence: bool = True
    ) -> ForecastResult:
        """ARIMA forecast"""
        try:
            # Lazy import statsmodels
            _import_statsmodels()

            if not STATS_MODELS_AVAILABLE:
                raise ImportError("statsmodels not available")

            if len(df) < 10:
                raise ValueError("Insufficient data for ARIMA")

            # Prepare data
            ts_data = df.set_index('date')['price']

            model = ARIMA(ts_data, order=(5, 1, 0))
            fitted_model = model.fit()

            forecast = fitted_model.forecast(days)
            values = forecast.values.tolist()

            # Get confidence intervals
            if include_confidence:
                try:
                    pred = fitted_model.get_forecast(days)
                    confidence_intervals = pred.conf_int()
                    confidence_lower = confidence_intervals.iloc[:, 0].values.tolist()
                    confidence_upper = confidence_intervals.iloc[:, 1].values.tolist()
                except:
                    # Fallback confidence interval
                    std_dev = df['price'].std()
                    confidence_lower = [v - std_dev for v in values]
                    confidence_upper = [v + std_dev for v in values]
            else:
                confidence_lower = None
                confidence_upper = None

            return ForecastResult(
                values=values,
                confidence_lower=confidence_lower,
                confidence_upper=confidence_upper,
                model_name="ARIMA"
            )

        except Exception as e:
            self.logger.error(f"ARIMA forecast failed: {str(e)}")
            raise

    def _generate_catboost_forecast(
        self,
        df: pd.DataFrame,
        days: int,
        include_confidence: bool = True
    ) -> ForecastResult:
        """CatBoost forecast (placeholder for future training)"""
        try:
            # Lazy import CatBoost
            _import_catboost()

            if not CATBOOST_AVAILABLE:
                raise ImportError("CatBoost not available")

            if len(df) < 10:
                raise ValueError("Insufficient data for CatBoost")

            # For now, use a simple fallback since model isn't trained yet
            # This will be replaced with actual trained model later
            self.logger.info("Using CatBoost placeholder (model not trained yet)")

            # Simple trend-based forecast as placeholder
            recent_trend = df['price'].pct_change().mean()
            last_price = df['price'].iloc[-1]

            values = []
            for i in range(days):
                trend_factor = 1 + (recent_trend * (i + 1) / days)
                predicted_price = last_price * trend_factor
                values.append(float(predicted_price))

            # Simple confidence intervals
            std_dev = df['price'].std()
            confidence_lower = [v - std_dev for v in values] if include_confidence else None
            confidence_upper = [v + std_dev for v in values] if include_confidence else None

            return ForecastResult(
                values=values,
                confidence_lower=confidence_lower,
                confidence_upper=confidence_upper,
                model_name="CatBoost"
            )

        except Exception as e:
            self.logger.error(f"CatBoost forecast failed: {str(e)}")
            raise

    def _generate_fallback_forecast(self, df: pd.DataFrame, days: int) -> ForecastResult:
        """Fallback forecast using simple average"""
        try:
            avg_price = df['price'].mean()
            values = [float(avg_price)] * days

            # Wide confidence intervals for fallback
            std_dev = df['price'].std() if len(df) > 1 else avg_price * 0.1
            confidence_lower = [v - std_dev * 2 for v in values]
            confidence_upper = [v + std_dev * 2 for v in values]

            return ForecastResult(
                values=values,
                confidence_lower=confidence_lower,
                confidence_upper=confidence_upper,
                model_name="Fallback"
            )

        except Exception as e:
            self.logger.error(f"Fallback forecast failed: {str(e)}")
            # Ultimate fallback
            return ForecastResult(
                values=[100.0] * days,
                confidence_lower=[80.0] * days,
                confidence_upper=[120.0] * days,
                model_name="Fallback"
            )

    def _generate_ensemble_forecast(
        self,
        model_results: Dict[str, ForecastResult],
        days: int,
        include_confidence: bool = True
    ) -> ForecastResult:
        """Generate ensemble forecast from multiple models"""
        try:
            if not model_results:
                raise ValueError("No model results available for ensemble")

            # Collect valid predictions
            valid_predictions = self._collect_valid_predictions(model_results, days)
            if not valid_predictions:
                raise ValueError("No valid predictions for ensemble")

            # Calculate ensemble predictions
            ensemble_values = self._calculate_ensemble_values(valid_predictions, days)

            # Calculate confidence intervals if needed
            confidence_bounds = None
            if include_confidence:
                confidence_bounds = self._calculate_ensemble_confidence(model_results, ensemble_values, days)

            return ForecastResult(
                values=ensemble_values,
                confidence_lower=confidence_bounds[0] if confidence_bounds else None,
                confidence_upper=confidence_bounds[1] if confidence_bounds else None,
                model_name="Ensemble"
            )

        except Exception as e:
            self.logger.error(f"Ensemble forecast failed: {str(e)}")
            raise

    def _collect_valid_predictions(self, model_results: Dict[str, ForecastResult], days: int) -> List[List[float]]:
        """Collect valid predictions from all models"""
        valid_predictions = []
        for result in model_results.values():
            if len(result.values) >= days:
                valid_predictions.append(result.values[:days])
        return valid_predictions

    def _calculate_ensemble_values(self, valid_predictions: List[List[float]], days: int) -> List[float]:
        """Calculate ensemble values by averaging predictions"""
        ensemble_values = []
        for i in range(days):
            day_predictions = [values[i] for values in valid_predictions if i < len(values)]
            ensemble_values.append(np.mean(day_predictions))
        return ensemble_values

    def _calculate_ensemble_confidence(
        self,
        model_results: Dict[str, ForecastResult],
        ensemble_values: List[float],
        days: int
    ) -> tuple:
        """Calculate ensemble confidence intervals"""
        all_lower = self._collect_confidence_bounds(model_results, 'confidence_lower', days)
        all_upper = self._collect_confidence_bounds(model_results, 'confidence_upper', days)

        if all_lower and all_upper:
            confidence_lower = [np.mean([lower[i] for lower in all_lower]) for i in range(days)]
            confidence_upper = [np.mean([upper[i] for upper in all_upper]) for i in range(days)]
        else:
            # Fallback confidence intervals based on standard deviation
            std_dev = np.std(ensemble_values)
            confidence_lower = [v - std_dev for v in ensemble_values]
            confidence_upper = [v + std_dev for v in ensemble_values]

        return confidence_lower, confidence_upper

    def _collect_confidence_bounds(
        self,
        model_results: Dict[str, ForecastResult],
        bound_type: str,
        days: int
    ) -> List[List[float]]:
        """Collect confidence bounds from all models"""
        bounds = []
        for result in model_results.values():
            bound_values = getattr(result, bound_type)
            if bound_values and len(bound_values) >= days:
                bounds.append(bound_values[:days])
        return bounds

    def _prepare_forecast_data(
        self,
        model_results: Dict[str, ForecastResult],
        df: pd.DataFrame,
        days: int
    ) -> List[Dict[str, Any]]:
        """Prepare final forecast data for API response"""
        try:
            last_date = df['date'].max()

            forecast_data = []
            for i in range(days):
                forecast_date = last_date + timedelta(days=i+1)

                # Use ensemble if available, otherwise use first available model
                if 'Ensemble' in model_results:
                    result = model_results['Ensemble']
                else:
                    result = next(iter(model_results.values()))

                data_point = {
                    "date": forecast_date.isoformat(),
                    "predicted_value": round(result.values[i], 2),
                    "model_used": result.model_name
                }

                if result.confidence_lower and i < len(result.confidence_lower):
                    data_point["confidence_lower"] = round(result.confidence_lower[i], 2)

                if result.confidence_upper and i < len(result.confidence_upper):
                    data_point["confidence_upper"] = round(result.confidence_upper[i], 2)

                forecast_data.append(data_point)

            return forecast_data

        except Exception as e:
            self.logger.error(f"Forecast data preparation failed: {str(e)}")
            raise

    def calculate_revenue_projection(
        self,
        forecast_data: List[Dict[str, Any]],
        selling_price: float,
        historical_data: pd.DataFrame
    ) -> List[Dict[str, Any]]:
        """Calculate revenue projections"""
        try:
            # Use average quantity from historical data
            avg_quantity = historical_data['quantity'].mean()

            revenue_projection = []
            for point in forecast_data:
                projected_quantity = avg_quantity
                projected_revenue = projected_quantity * selling_price

                projection = {
                    "date": point["date"],
                    "projected_quantity": round(float(projected_quantity), 2),
                    "selling_price": round(float(selling_price), 2),
                    "projected_revenue": round(float(projected_revenue), 2)
                }

                # Add confidence intervals if available
                if "confidence_lower" in point:
                    projection["confidence_lower"] = round(point["confidence_lower"] * projected_quantity, 2)
                if "confidence_upper" in point:
                    projection["confidence_upper"] = round(point["confidence_upper"] * projected_quantity, 2)

                revenue_projection.append(projection)

            return revenue_projection

        except Exception as e:
            self.logger.error(f"Revenue projection calculation failed: {str(e)}")
            return []

    def generate_summary(
        self,
        forecast_data: List[Dict[str, Any]],
        historical_data: pd.DataFrame,
        models_used: List[str],
        scenario: str
    ) -> str:
        """Generate AI-like summary of forecast results"""
        try:
            # Calculate key metrics
            metrics = self._calculate_forecast_metrics(forecast_data, historical_data)

            # Generate summary sections
            overview = self._generate_overview_section(metrics, forecast_data, scenario)
            key_metrics = self._generate_metrics_section(metrics, forecast_data, models_used)
            analysis = self._generate_analysis_section()
            recommendations = self._generate_recommendations_section(metrics['trend'])

            return f"""# Price Forecast Summary

{overview}

{key_metrics}

{analysis}

{recommendations}"""

        except Exception as e:
            self.logger.error(f"Summary generation failed: {str(e)}")
            return "Forecast summary generation failed."

    def _calculate_forecast_metrics(
        self,
        forecast_data: List[Dict[str, Any]],
        historical_data: pd.DataFrame
    ) -> Dict[str, Any]:
        """Calculate key metrics for the forecast"""
        forecast_values = [point["predicted_value"] for point in forecast_data]
        avg_forecast = np.mean(forecast_values)
        avg_historical = historical_data['price'].mean()

        trend = "increasing" if avg_forecast > avg_historical else "decreasing"
        change_percent = abs((avg_forecast - avg_historical) / avg_historical * 100)

        return {
            'avg_forecast': avg_forecast,
            'avg_historical': avg_historical,
            'trend': trend,
            'change_percent': change_percent
        }

    def _generate_overview_section(
        self,
        metrics: Dict[str, Any],
        forecast_data: List[Dict[str, Any]],
        scenario: str
    ) -> str:
        """Generate the overview section of the summary"""
        return f"""## Overview
Based on historical demand data, the forecast shows a **{metrics['trend']}** trend over the next {len(forecast_data)} days using {scenario} scenario."""

    def _generate_metrics_section(
        self,
        metrics: Dict[str, Any],
        forecast_data: List[Dict[str, Any]],
        models_used: List[str]
    ) -> str:
        """Generate the key metrics section"""
        return f"""## Key Metrics
- **Average Historical Price**: ${metrics['avg_historical']:.2f}
- **Average Forecasted Price**: ${metrics['avg_forecast']:.2f}
- **Expected Change**: {metrics['change_percent']:.1f}% {metrics['trend']}
- **Models Used**: {', '.join(models_used)}
- **Forecast Horizon**: {len(forecast_data)} days"""

    def _generate_analysis_section(self) -> str:
        """Generate the analysis section"""
        return """## Analysis
The forecast combines multiple statistical and machine learning models to provide reliable predictions. Confidence intervals are included to help assess prediction uncertainty."""

    def _generate_recommendations_section(self, trend: str) -> str:
        """Generate the recommendations section"""
        if trend == 'increasing':
            recommendation = "Consider increasing inventory to meet potential higher demand."
        else:
            recommendation = "Monitor market conditions closely as prices may decline."

        return f"""## Recommendations
{recommendation}
Track actual prices against this forecast and adjust strategies accordingly."""

    def calculate_overall_confidence(self, forecast_data: List[Dict[str, Any]]) -> Optional[float]:
        """Calculate overall confidence score"""
        try:
            confidence_scores = []

            for point in forecast_data:
                if "confidence_lower" in point and "confidence_upper" in point:
                    lower = point["confidence_lower"]
                    upper = point["confidence_upper"]
                    predicted = point["predicted_value"]

                    # Calculate confidence interval width relative to prediction
                    if predicted != 0:
                        interval_width = (upper - lower) / predicted
                        # Convert to confidence score (0-100)
                        confidence = max(0, min(100, 100 - (interval_width * 50)))
                        confidence_scores.append(confidence)

            if confidence_scores:
                return round(np.mean(confidence_scores), 1)

            return None

        except Exception as e:
            self.logger.error(f"Confidence calculation failed: {str(e)}")
            return None
