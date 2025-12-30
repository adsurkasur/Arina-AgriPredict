"""
Forecasting models for AgriPredict Analysis Service
Includes comprehensive accuracy metrics: MAE, RMSE, MAPE, Bias, MASE, R-Squared
Supports weighted ensemble based on model performance
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass, field
import asyncio
from concurrent.futures import ThreadPoolExecutor
import traceback
import os
import json

# Import ML libraries (lazy loading to avoid startup issues)
STATS_MODELS_AVAILABLE = True
CATBOOST_AVAILABLE = True
CATBOOST_MODEL_LOADED = False
_catboost_model = None
_catboost_feature_names = None
_catboost_metrics = None

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

def _load_catboost_model():
    """Load trained CatBoost model"""
    global _catboost_model, _catboost_feature_names, _catboost_metrics, CATBOOST_MODEL_LOADED
    
    if CATBOOST_MODEL_LOADED:
        return _catboost_model is not None
    
    try:
        import joblib
        model_path = os.path.join(os.path.dirname(__file__), 'catboost_model.pkl')
        
        if os.path.exists(model_path):
            model_data = joblib.load(model_path)
            _catboost_model = model_data.get('model')
            _catboost_feature_names = model_data.get('feature_names', [])
            _catboost_metrics = model_data.get('metrics', {})
            CATBOOST_MODEL_LOADED = True
            logger.info(f"Loaded trained CatBoost model from {model_path}")
            logger.info(f"Model metrics: {_catboost_metrics}")
            return True
        else:
            logger.warning(f"CatBoost model not found at {model_path}")
            CATBOOST_MODEL_LOADED = True  # Mark as attempted
            return False
    except Exception as e:
        logger.error(f"Failed to load CatBoost model: {e}")
        CATBOOST_MODEL_LOADED = True
        return False

from utils.logger import setup_logger
from utils.config import settings

logger = setup_logger(__name__)


class ForecastMetrics:
    """Comprehensive forecast accuracy metrics calculator"""
    
    @staticmethod
    def calculate_all_metrics(y_true: np.ndarray, y_pred: np.ndarray, 
                               y_train: Optional[np.ndarray] = None) -> Dict[str, Optional[float]]:
        """
        Calculate all forecast accuracy metrics
        
        Args:
            y_true: Actual values
            y_pred: Predicted values
            y_train: Training data (for MASE calculation)
            
        Returns:
            Dictionary with all metrics
        """
        from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
        
        y_true = np.array(y_true).flatten()
        y_pred = np.array(y_pred).flatten()
        
        # Remove any NaN or infinite values
        mask = np.isfinite(y_true) & np.isfinite(y_pred)
        y_true = y_true[mask]
        y_pred = y_pred[mask]
        
        if len(y_true) == 0 or len(y_true) != len(y_pred):
            return {
                'mae': None, 'rmse': None, 'mape': None,
                'bias': None, 'mase': None, 'r_squared': None
            }
        
        try:
            # MAE - Mean Absolute Error
            mae = mean_absolute_error(y_true, y_pred)
            
            # RMSE - Root Mean Squared Error
            rmse = np.sqrt(mean_squared_error(y_true, y_pred))
            
            # MAPE - Mean Absolute Percentage Error (handle zero values)
            non_zero_mask = y_true != 0
            if np.any(non_zero_mask):
                mape = np.mean(np.abs((y_true[non_zero_mask] - y_pred[non_zero_mask]) / y_true[non_zero_mask])) * 100
            else:
                mape = None
            
            # Bias - Mean Forecast Error (MFE)
            bias = np.mean(y_pred - y_true)
            
            # MASE - Mean Absolute Scaled Error
            mase = None
            if y_train is not None and len(y_train) > 1:
                y_train = np.array(y_train).flatten()
                naive_errors = np.abs(np.diff(y_train))
                scaling_factor = np.mean(naive_errors)
                if scaling_factor > 0:
                    mase = mae / scaling_factor
            
            # R-Squared
            r_squared = r2_score(y_true, y_pred)
            
            return {
                'mae': round(float(mae), 4),
                'rmse': round(float(rmse), 4),
                'mape': round(float(mape), 4) if mape is not None else None,
                'bias': round(float(bias), 4),
                'mase': round(float(mase), 4) if mase is not None else None,
                'r_squared': round(float(r_squared), 4)
            }
        except Exception as e:
            logger.error(f"Error calculating metrics: {e}")
            return {
                'mae': None, 'rmse': None, 'mape': None,
                'bias': None, 'mase': None, 'r_squared': None
            }


@dataclass
class ForecastResult:
    """Container for forecast results"""
    values: List[float]
    confidence_lower: Optional[List[float]] = None
    confidence_upper: Optional[List[float]] = None
    model_name: str = ""
    metrics: Optional[Dict[str, Optional[float]]] = field(default_factory=dict)
    weight: float = 1.0  # Weight for ensemble (based on accuracy)

class ForecastEngine:
    """Main forecasting engine with multiple models and weighted ensemble"""

    def __init__(self):
        self.logger = logger
        self.executor = ThreadPoolExecutor(max_workers=4)
        self.model_weights = {}  # Store model weights based on historical performance
        self.model_metrics = {}  # Store metrics for each model
        
        # Try to load CatBoost model on init
        _load_catboost_model()

    async def generate_forecast(
        self,
        df: pd.DataFrame,
        days: int,
        models: List[str],
        include_confidence: bool = True,
        scenario: str = "realistic",
        calculate_metrics: bool = True
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

            # Calculate metrics using holdout validation if we have enough data
            if calculate_metrics and len(adjusted_df) > days + 10:
                self._calculate_model_metrics(adjusted_df, days, models)

            # Generate model forecasts
            model_results = await self._generate_model_forecasts(adjusted_df, days, models, include_confidence)

            # Handle fallback if no models succeeded
            if not model_results:
                model_results = self._handle_fallback_forecast(adjusted_df, days)

            # Generate weighted ensemble if requested
            if self._should_generate_ensemble(models):
                ensemble_result = self._generate_weighted_ensemble_forecast(model_results, days, include_confidence)
                model_results['Ensemble'] = ensemble_result

            # Prepare final forecast data with metrics
            final_forecast = self._prepare_forecast_data(model_results, adjusted_df, days)

            return {
                "forecast_data": final_forecast,
                "models_used": list(model_results.keys()),
                "scenario": scenario,
                "model_metrics": self.model_metrics,
                "model_weights": self.model_weights
            }

        except Exception as e:
            self.logger.error(f"Forecast generation failed: {str(e)}")
            raise
    
    def _calculate_model_metrics(self, df: pd.DataFrame, forecast_days: int, models: List[str]):
        """Calculate accuracy metrics for each model using holdout validation"""
        try:
            # Use last 'forecast_days' as holdout set
            train_df = df.iloc[:-forecast_days].copy()
            test_df = df.iloc[-forecast_days:].copy()
            
            if len(train_df) < 10:
                self.logger.warning("Not enough data for metric calculation")
                return
            
            y_true = test_df['price'].values
            y_train = train_df['price'].values
            
            for model_name in models:
                if model_name.lower() == 'ensemble':
                    continue
                    
                try:
                    method_name = f'_generate_{model_name.lower()}_forecast'
                    if hasattr(self, method_name):
                        result = getattr(self, method_name)(train_df.copy(), forecast_days, False)
                        if result and result.values:
                            y_pred = np.array(result.values[:len(y_true)])
                            metrics = ForecastMetrics.calculate_all_metrics(y_true, y_pred, y_train)
                            self.model_metrics[model_name] = metrics
                            
                            # Calculate weight based on MAE (lower is better)
                            if metrics.get('mae') is not None and metrics['mae'] > 0:
                                self.model_weights[model_name] = 1.0 / metrics['mae']
                            else:
                                self.model_weights[model_name] = 1.0
                except Exception as e:
                    self.logger.warning(f"Failed to calculate metrics for {model_name}: {e}")
                    self.model_weights[model_name] = 1.0
            
            # Normalize weights
            total_weight = sum(self.model_weights.values())
            if total_weight > 0:
                self.model_weights = {k: v / total_weight for k, v in self.model_weights.items()}
                
            self.logger.info(f"Calculated model weights: {self.model_weights}")
            
        except Exception as e:
            self.logger.error(f"Error calculating model metrics: {e}")

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
        """CatBoost forecast using trained model"""
        try:
            # Lazy import CatBoost
            _import_catboost()

            if not CATBOOST_AVAILABLE:
                raise ImportError("CatBoost not available")

            if len(df) < 10:
                raise ValueError("Insufficient data for CatBoost")

            # Try to load the trained model
            model_loaded = _load_catboost_model()
            
            if model_loaded and _catboost_model is not None:
                # Use trained model for prediction
                self.logger.info("Using trained CatBoost model")
                values = self._predict_with_catboost(df, days)
            else:
                # Fallback to trend-based forecast if model not available
                self.logger.info("Using CatBoost trend-based fallback (no trained model)")
                values = self._catboost_trend_fallback(df, days)

            # Calculate confidence intervals based on historical volatility
            std_dev = df['price'].std()
            volatility_factor = std_dev / df['price'].mean() if df['price'].mean() > 0 else 0.1
            
            confidence_lower = None
            confidence_upper = None
            if include_confidence:
                # Widen confidence intervals over time
                confidence_lower = []
                confidence_upper = []
                for i, v in enumerate(values):
                    width = std_dev * (1 + 0.1 * i)  # Increasing uncertainty
                    confidence_lower.append(max(0, v - width))
                    confidence_upper.append(v + width)

            return ForecastResult(
                values=values,
                confidence_lower=confidence_lower,
                confidence_upper=confidence_upper,
                model_name="CatBoost",
                metrics=_catboost_metrics if _catboost_metrics else {}
            )

        except Exception as e:
            self.logger.error(f"CatBoost forecast failed: {str(e)}")
            raise
    
    def _predict_with_catboost(self, df: pd.DataFrame, days: int) -> List[float]:
        """Generate predictions using trained CatBoost model"""
        try:
            values = []
            last_date = df['date'].max()
            last_price = df['price'].iloc[-1]
            
            # Create a simple feature set for prediction
            # Since we don't have all the features the model was trained on,
            # we'll use the available data and fill in defaults
            for i in range(days):
                forecast_date = last_date + timedelta(days=i+1)
                
                # Build features similar to training data
                features = {
                    'year': forecast_date.year,
                    'month': forecast_date.month,
                    'day': forecast_date.day,
                    'day_of_week': forecast_date.weekday(),
                    'week_of_year': forecast_date.isocalendar()[1],
                    'quarter': (forecast_date.month - 1) // 3 + 1,
                    'is_weekend': 1 if forecast_date.weekday() >= 5 else 0,
                    'is_holiday': 0,  # Simplified
                }
                
                # Add lag features from historical data
                if len(df) > 0:
                    features['price_lag_1'] = df['price'].iloc[-1] if len(df) >= 1 else last_price
                    features['price_lag_7'] = df['price'].iloc[-7] if len(df) >= 7 else last_price
                    features['price_lag_30'] = df['price'].iloc[-30] if len(df) >= 30 else last_price
                    features['quantity_sold_lag_1'] = df['quantity'].iloc[-1] if 'quantity' in df.columns and len(df) >= 1 else 100
                    features['quantity_sold_lag_7'] = df['quantity'].iloc[-7] if 'quantity' in df.columns and len(df) >= 7 else 100
                    features['quantity_sold_lag_30'] = df['quantity'].iloc[-30] if 'quantity' in df.columns and len(df) >= 30 else 100
                    
                    # Rolling statistics
                    features['market_price'] = df['price'].mean()
                    features['supply_index'] = 100  # Default
                    features['demand_index'] = 100  # Default
                
                # Create DataFrame for prediction
                feature_df = pd.DataFrame([features])
                
                # Fill missing features with defaults
                for feat in _catboost_feature_names:
                    if feat not in feature_df.columns:
                        feature_df[feat] = 0
                
                # Reorder columns to match training
                feature_df = feature_df.reindex(columns=_catboost_feature_names, fill_value=0)
                
                # Make prediction
                try:
                    pred = _catboost_model.predict(feature_df)[0]
                    values.append(float(pred))
                except Exception as e:
                    self.logger.warning(f"CatBoost prediction failed for day {i+1}: {e}")
                    values.append(last_price)
            
            return values
            
        except Exception as e:
            self.logger.error(f"CatBoost prediction failed: {e}")
            return self._catboost_trend_fallback(df, days)
    
    def _catboost_trend_fallback(self, df: pd.DataFrame, days: int) -> List[float]:
        """Fallback trend-based forecast for CatBoost"""
        recent_trend = df['price'].pct_change().mean()
        if pd.isna(recent_trend):
            recent_trend = 0
        last_price = df['price'].iloc[-1]

        values = []
        for i in range(days):
            trend_factor = 1 + (recent_trend * (i + 1) / days)
            predicted_price = last_price * trend_factor
            values.append(float(predicted_price))
        
        return values

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
        """Generate simple average ensemble forecast from multiple models (deprecated, use weighted)"""
        return self._generate_weighted_ensemble_forecast(model_results, days, include_confidence)
    
    def _generate_weighted_ensemble_forecast(
        self,
        model_results: Dict[str, ForecastResult],
        days: int,
        include_confidence: bool = True
    ) -> ForecastResult:
        """Generate weighted ensemble forecast based on model accuracy"""
        try:
            if not model_results:
                raise ValueError("No model results available for ensemble")

            # Collect valid predictions with weights
            valid_predictions = []
            weights = []
            
            for model_name, result in model_results.items():
                if model_name.lower() == 'ensemble':
                    continue
                if len(result.values) >= days:
                    valid_predictions.append(result.values[:days])
                    # Get weight from calculated weights or use default
                    weight = self.model_weights.get(model_name, 1.0 / len(model_results))
                    weights.append(weight)
            
            if not valid_predictions:
                raise ValueError("No valid predictions for ensemble")
            
            # Normalize weights
            total_weight = sum(weights)
            if total_weight > 0:
                weights = [w / total_weight for w in weights]
            else:
                weights = [1.0 / len(weights)] * len(weights)

            # Calculate weighted ensemble predictions
            ensemble_values = []
            for i in range(days):
                weighted_sum = sum(
                    values[i] * weight 
                    for values, weight in zip(valid_predictions, weights)
                )
                ensemble_values.append(weighted_sum)

            # Calculate weighted confidence intervals if needed
            confidence_bounds = None
            if include_confidence:
                confidence_bounds = self._calculate_weighted_ensemble_confidence(
                    model_results, ensemble_values, days, weights
                )

            # Aggregate metrics from component models
            ensemble_metrics = self._aggregate_ensemble_metrics(model_results)

            return ForecastResult(
                values=ensemble_values,
                confidence_lower=confidence_bounds[0] if confidence_bounds else None,
                confidence_upper=confidence_bounds[1] if confidence_bounds else None,
                model_name="Ensemble",
                metrics=ensemble_metrics
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
            std_dev = np.std(ensemble_values) if len(ensemble_values) > 1 else np.mean(ensemble_values) * 0.1
            confidence_lower = [v - std_dev for v in ensemble_values]
            confidence_upper = [v + std_dev for v in ensemble_values]

        return confidence_lower, confidence_upper
    
    def _calculate_weighted_ensemble_confidence(
        self,
        model_results: Dict[str, ForecastResult],
        ensemble_values: List[float],
        days: int,
        weights: List[float]
    ) -> Tuple[List[float], List[float]]:
        """Calculate weighted confidence intervals for ensemble"""
        all_lower = []
        all_upper = []
        model_weights_list = []
        
        for model_name, result in model_results.items():
            if model_name.lower() == 'ensemble':
                continue
            if result.confidence_lower and len(result.confidence_lower) >= days:
                all_lower.append(result.confidence_lower[:days])
                all_upper.append(result.confidence_upper[:days])
                model_weights_list.append(self.model_weights.get(model_name, 1.0))
        
        if all_lower and all_upper:
            # Normalize weights
            total_weight = sum(model_weights_list)
            if total_weight > 0:
                model_weights_list = [w / total_weight for w in model_weights_list]
            
            confidence_lower = []
            confidence_upper = []
            for i in range(days):
                lower_weighted = sum(
                    lower[i] * w for lower, w in zip(all_lower, model_weights_list)
                )
                upper_weighted = sum(
                    upper[i] * w for upper, w in zip(all_upper, model_weights_list)
                )
                confidence_lower.append(lower_weighted)
                confidence_upper.append(upper_weighted)
        else:
            # Fallback
            std_dev = np.std(ensemble_values) if len(ensemble_values) > 1 else np.mean(ensemble_values) * 0.1
            confidence_lower = [v - std_dev for v in ensemble_values]
            confidence_upper = [v + std_dev for v in ensemble_values]
        
        return confidence_lower, confidence_upper
    
    def _aggregate_ensemble_metrics(self, model_results: Dict[str, ForecastResult]) -> Dict[str, Optional[float]]:
        """Aggregate metrics from component models for ensemble"""
        aggregated = {
            'mae': [], 'rmse': [], 'mape': [], 'bias': [], 'mase': [], 'r_squared': []
        }
        
        for model_name, result in model_results.items():
            if model_name.lower() == 'ensemble':
                continue
            metrics = self.model_metrics.get(model_name, {})
            for key in aggregated:
                if metrics.get(key) is not None:
                    aggregated[key].append(metrics[key])
        
        # Calculate weighted averages
        final_metrics = {}
        for key, values in aggregated.items():
            if values:
                final_metrics[key] = round(np.mean(values), 4)
            else:
                final_metrics[key] = None
        
        final_metrics['component_models'] = len(model_results) - 1  # Exclude ensemble itself
        return final_metrics

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
