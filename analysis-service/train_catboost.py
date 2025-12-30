"""
CatBoost Model Training Script for AgriPredict
This script trains the CatBoost model using the existing training dataset.
Includes comprehensive accuracy metrics: MAE, RMSE, MAPE, Bias, MASE, R-Squared
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from catboost import CatBoostRegressor, Pool
from sklearn.model_selection import train_test_split, TimeSeriesSplit
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import joblib
import os
from typing import Dict, Any, Tuple, Optional
import logging
import json

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


class ForecastMetrics:
    """Comprehensive forecast accuracy metrics calculator"""
    
    @staticmethod
    def calculate_all_metrics(y_true: np.ndarray, y_pred: np.ndarray, 
                               y_train: Optional[np.ndarray] = None) -> Dict[str, float]:
        """
        Calculate all forecast accuracy metrics
        
        Args:
            y_true: Actual values
            y_pred: Predicted values
            y_train: Training data (for MASE calculation)
            
        Returns:
            Dictionary with all metrics
        """
        y_true = np.array(y_true).flatten()
        y_pred = np.array(y_pred).flatten()
        
        # Remove any NaN or infinite values
        mask = np.isfinite(y_true) & np.isfinite(y_pred)
        y_true = y_true[mask]
        y_pred = y_pred[mask]
        
        if len(y_true) == 0:
            return {
                'mae': np.nan, 'rmse': np.nan, 'mape': np.nan,
                'bias': np.nan, 'mase': np.nan, 'r_squared': np.nan
            }
        
        # MAE - Mean Absolute Error
        mae = mean_absolute_error(y_true, y_pred)
        
        # RMSE - Root Mean Squared Error
        rmse = np.sqrt(mean_squared_error(y_true, y_pred))
        
        # MAPE - Mean Absolute Percentage Error (handle zero values)
        non_zero_mask = y_true != 0
        if np.any(non_zero_mask):
            mape = np.mean(np.abs((y_true[non_zero_mask] - y_pred[non_zero_mask]) / y_true[non_zero_mask])) * 100
        else:
            mape = np.nan
        
        # Bias - Mean Forecast Error (MFE)
        bias = np.mean(y_pred - y_true)
        
        # MASE - Mean Absolute Scaled Error
        if y_train is not None and len(y_train) > 1:
            y_train = np.array(y_train).flatten()
            # Naive forecast error (one-step ahead)
            naive_errors = np.abs(np.diff(y_train))
            scaling_factor = np.mean(naive_errors)
            if scaling_factor > 0:
                mase = mae / scaling_factor
            else:
                mase = np.nan
        else:
            mase = np.nan
        
        # R-Squared
        r_squared = r2_score(y_true, y_pred)
        
        return {
            'mae': round(float(mae), 4),
            'rmse': round(float(rmse), 4),
            'mape': round(float(mape), 4) if not np.isnan(mape) else None,
            'bias': round(float(bias), 4),
            'mase': round(float(mase), 4) if not np.isnan(mase) else None,
            'r_squared': round(float(r_squared), 4)
        }

class CatBoostTrainer:
    """CatBoost model trainer for agricultural demand forecasting"""

    def __init__(self):
        self.model = None
        self.feature_names = None
        self.metrics = None
        self.training_config = None

    def load_training_data(self, filepath: str = None) -> pd.DataFrame:
        """
        Load training data from CSV file
        
        Args:
            filepath: Path to training data CSV
            
        Returns:
            DataFrame with training data
        """
        if filepath is None:
            # Default to the existing training data
            filepath = os.path.join(os.path.dirname(__file__), '..', 'data', 'catboost_training_data.csv')
            if not os.path.exists(filepath):
                filepath = os.path.join(os.path.dirname(__file__), '..', '..', 'data', 'catboost_training_data.csv')
        
        if not os.path.exists(filepath):
            logger.warning(f"Training data not found at {filepath}, generating synthetic data")
            return self.generate_artificial_data(n_samples=5000)
        
        logger.info(f"Loading training data from {filepath}")
        df = pd.read_csv(filepath)
        
        # Parse date column
        if 'date' in df.columns:
            df['date'] = pd.to_datetime(df['date'])
        
        logger.info(f"Loaded {len(df)} samples with {len(df.columns)} features")
        return df

    def generate_artificial_data(self, n_samples: int = 5000) -> pd.DataFrame:
        """
        Generate artificial agricultural data for training

        Args:
            n_samples: Number of samples to generate

        Returns:
            DataFrame with artificial agricultural data
        """
        logger.info(f"Generating {n_samples} artificial data samples")

        # Generate date range
        start_date = datetime(2023, 1, 1)
        dates = [start_date + timedelta(days=i) for i in range(n_samples)]

        np.random.seed(42)  # For reproducible results

        data = []

        for date in dates:
            # Seasonal patterns
            day_of_year = date.timetuple().tm_yday
            seasonal_factor = 1 + 0.3 * np.sin(2 * np.pi * day_of_year / 365)

            # Base demand with seasonal variation
            base_quantity = np.random.normal(100, 20) * seasonal_factor

            # Price influenced by season and demand
            base_price = 25 + 5 * np.sin(2 * np.pi * day_of_year / 365)
            price_noise = np.random.normal(0, 2)
            price = base_price + price_noise

            # Add some correlation between price and quantity
            quantity_noise = np.random.normal(0, 15)
            quantity = base_quantity + quantity_noise - 0.1 * (price - 25)

            # Ensure positive values
            quantity = max(1, quantity)
            price = max(5, price)

            data.append({
                'date': date,
                'quantity': round(quantity, 2),
                'price': round(price, 2),
                'day_of_week': date.weekday(),
                'month': date.month,
                'day_of_month': date.day,
                'quarter': (date.month - 1) // 3 + 1,
                'is_weekend': 1 if date.weekday() >= 5 else 0,
                'season': self._get_season(date.month)
            })

        df = pd.DataFrame(data)

        # Add lag features
        for lag in [1, 7, 14, 30]:
            df[f'price_lag_{lag}'] = df['price'].shift(lag)
            df[f'quantity_lag_{lag}'] = df['quantity'].shift(lag)

        # Add rolling statistics
        for window in [7, 14, 30]:
            df[f'price_rolling_mean_{window}'] = df['price'].rolling(window).mean()
            df[f'price_rolling_std_{window}'] = df['price'].rolling(window).std()
            df[f'quantity_rolling_mean_{window}'] = df['quantity'].rolling(window).mean()

        # Add price change features
        df['price_change'] = df['price'].pct_change()
        df['price_change_7d'] = df['price'].pct_change(7)

        # Drop rows with NaN values
        df = df.dropna().reset_index(drop=True)

        logger.info(f"Generated dataset with {len(df)} samples and {len(df.columns)} features")
        return df

    def _get_season(self, month: int) -> str:
        """Get season based on month"""
        if month in [12, 1, 2]:
            return 'winter'
        elif month in [3, 4, 5]:
            return 'spring'
        elif month in [6, 7, 8]:
            return 'summer'
        else:
            return 'fall'

    def prepare_features(self, df: pd.DataFrame, target_col: str = 'target_quantity') -> tuple:
        """
        Prepare features for training

        Args:
            df: Input DataFrame
            target_col: Name of target column

        Returns:
            Tuple of (X, y, feature_names, categorical_features)
        """
        # Define columns to exclude from features
        exclude_cols = ['date', 'target_quantity', 'product_name', 'region_name', 'product_category']
        
        # Check if target column exists
        if target_col not in df.columns:
            # Fallback to price if target_quantity doesn't exist
            target_col = 'price' if 'price' in df.columns else df.columns[-1]
            logger.warning(f"target_quantity not found, using {target_col} as target")
        
        # Define feature columns
        feature_cols = [col for col in df.columns if col not in exclude_cols and col != target_col]
        
        # Identify categorical features
        categorical_features = []
        for col in feature_cols:
            if df[col].dtype == 'object' or df[col].dtype.name == 'category':
                categorical_features.append(col)
        
        # Remove categorical features for now (CatBoost handles them, but we'll use numeric only)
        feature_cols = [col for col in feature_cols if col not in categorical_features]
        
        # Prepare features and target
        X = df[feature_cols].copy()
        y = df[target_col].copy()
        
        # Handle any remaining NaN values
        X = X.fillna(X.median())
        
        logger.info(f"Prepared {len(feature_cols)} features for training, target: {target_col}")
        return X, y, feature_cols, categorical_features

    def train_model(self, X_train, y_train, X_val=None, y_val=None, **kwargs) -> CatBoostRegressor:
        """
        Train CatBoost model

        Args:
            X_train: Training features
            y_train: Training target
            X_val: Validation features (optional)
            y_val: Validation target (optional)
            **kwargs: Additional CatBoost parameters

        Returns:
            Trained CatBoost model
        """
        # Default parameters optimized for demand forecasting
        default_params = {
            'iterations': 1000,
            'learning_rate': 0.05,
            'depth': 8,
            'loss_function': 'MAE',
            'eval_metric': 'MAE',
            'random_seed': 42,
            'verbose': 100,
            'early_stopping_rounds': 100,
            'l2_leaf_reg': 3,
            'border_count': 128,
            'thread_count': -1
        }

        # Update with custom parameters
        default_params.update(kwargs)
        self.training_config = default_params.copy()

        # Create model
        model = CatBoostRegressor(**default_params)

        # Prepare data
        train_pool = Pool(X_train, y_train)

        if X_val is not None and y_val is not None:
            val_pool = Pool(X_val, y_val)
            model.fit(train_pool, eval_set=val_pool, use_best_model=True)
        else:
            model.fit(train_pool)

        self.model = model
        self.feature_names = list(X_train.columns)

        logger.info(f"Trained CatBoost model with {model.tree_count_} trees")
        return model

    def evaluate_model(self, X_test, y_test, y_train=None) -> Dict[str, float]:
        """
        Evaluate model performance with comprehensive metrics

        Args:
            X_test: Test features
            y_test: Test target
            y_train: Training target (for MASE calculation)

        Returns:
            Dictionary with evaluation metrics
        """
        if self.model is None:
            raise ValueError("Model not trained yet")

        # Make predictions
        y_pred = self.model.predict(X_test)

        # Calculate all metrics
        self.metrics = ForecastMetrics.calculate_all_metrics(
            y_true=y_test, 
            y_pred=y_pred, 
            y_train=y_train
        )

        logger.info(f"Model Evaluation Metrics:")
        logger.info(f"  MAE: {self.metrics['mae']}")
        logger.info(f"  RMSE: {self.metrics['rmse']}")
        logger.info(f"  MAPE: {self.metrics['mape']}%")
        logger.info(f"  Bias: {self.metrics['bias']}")
        logger.info(f"  MASE: {self.metrics['mase']}")
        logger.info(f"  R²: {self.metrics['r_squared']}")

        return self.metrics

    def save_model(self, filepath: str):
        """
        Save trained model to file with metadata

        Args:
            filepath: Path to save the model
        """
        if self.model is None:
            raise ValueError("Model not trained yet")

        # Create directory if it doesn't exist
        os.makedirs(os.path.dirname(filepath) if os.path.dirname(filepath) else '.', exist_ok=True)

        # Prepare model data with metadata
        model_data = {
            'model': self.model,
            'feature_names': self.feature_names,
            'metrics': self.metrics,
            'training_config': self.training_config,
            'training_date': datetime.now().isoformat(),
            'version': '2.0'
        }
        
        # Save model using joblib
        joblib.dump(model_data, filepath)
        
        # Also save the CatBoost native format for faster loading
        native_path = filepath.replace('.pkl', '.cbm')
        self.model.save_model(native_path)
        
        # Save metrics to JSON for easy access
        metrics_path = filepath.replace('.pkl', '_metrics.json')
        with open(metrics_path, 'w') as f:
            json.dump({
                'metrics': self.metrics,
                'feature_names': self.feature_names,
                'training_date': model_data['training_date'],
                'training_config': {k: str(v) for k, v in (self.training_config or {}).items()}
            }, f, indent=2)

        logger.info(f"Model saved to {filepath}")
        logger.info(f"Native model saved to {native_path}")
        logger.info(f"Metrics saved to {metrics_path}")

    def load_model(self, filepath: str):
        """
        Load trained model from file

        Args:
            filepath: Path to the saved model
        """
        if not os.path.exists(filepath):
            raise FileNotFoundError(f"Model file not found: {filepath}")

        # Load model
        model_data = joblib.load(filepath)
        self.model = model_data['model']
        self.feature_names = model_data.get('feature_names', [])
        self.metrics = model_data.get('metrics', {})
        self.training_config = model_data.get('training_config', {})

        logger.info(f"Model loaded from {filepath}")
        logger.info(f"Model metrics: {self.metrics}")

    def predict(self, features: pd.DataFrame) -> np.ndarray:
        """
        Make predictions with trained model

        Args:
            features: Input features

        Returns:
            Predictions array
        """
        if self.model is None:
            raise ValueError("Model not trained or loaded yet")

        # Ensure features are in correct order
        if self.feature_names:
            # Only use features that exist in both
            available_features = [f for f in self.feature_names if f in features.columns]
            missing_features = [f for f in self.feature_names if f not in features.columns]
            
            if missing_features:
                logger.warning(f"Missing features: {missing_features[:5]}...")
                # Add missing features with default values
                for f in missing_features:
                    features[f] = 0
            
            features = features[self.feature_names]

        return self.model.predict(features)
    
    def get_feature_importance(self, top_n: int = 20) -> Dict[str, float]:
        """
        Get feature importance from trained model
        
        Args:
            top_n: Number of top features to return
            
        Returns:
            Dictionary of feature names and their importance scores
        """
        if self.model is None:
            raise ValueError("Model not trained yet")
        
        importance = self.model.get_feature_importance()
        feature_importance = dict(zip(self.feature_names, importance))
        
        # Sort by importance
        sorted_importance = dict(sorted(feature_importance.items(), key=lambda x: x[1], reverse=True)[:top_n])
        
        return sorted_importance


def main():
    """Main training function"""
    logger.info("=" * 60)
    logger.info("Starting CatBoost Model Training for AgriPredict")
    logger.info("=" * 60)

    # Initialize trainer
    trainer = CatBoostTrainer()

    # Load training data (use existing CSV or generate synthetic)
    df = trainer.load_training_data()
    
    logger.info(f"Dataset shape: {df.shape}")
    logger.info(f"Columns: {list(df.columns)[:10]}...")

    # Prepare features
    X, y, feature_names, categorical_features = trainer.prepare_features(df)
    
    logger.info(f"Feature matrix shape: {X.shape}")
    logger.info(f"Target shape: {y.shape}")
    logger.info(f"Target statistics: mean={y.mean():.2f}, std={y.std():.2f}, min={y.min():.2f}, max={y.max():.2f}")

    # Split data (use time-based split for time series data)
    # Reserve last 20% for testing
    split_idx = int(len(X) * 0.8)
    X_train_full, X_test = X.iloc[:split_idx], X.iloc[split_idx:]
    y_train_full, y_test = y.iloc[:split_idx], y.iloc[split_idx:]
    
    # Further split training data for validation
    val_split_idx = int(len(X_train_full) * 0.8)
    X_train, X_val = X_train_full.iloc[:val_split_idx], X_train_full.iloc[val_split_idx:]
    y_train, y_val = y_train_full.iloc[:val_split_idx], y_train_full.iloc[val_split_idx:]
    
    logger.info(f"Train set: {len(X_train)} samples")
    logger.info(f"Validation set: {len(X_val)} samples")
    logger.info(f"Test set: {len(X_test)} samples")

    # Train model
    logger.info("-" * 40)
    logger.info("Training CatBoost model...")
    model = trainer.train_model(X_train, y_train, X_val, y_val)

    # Evaluate model on test set
    logger.info("-" * 40)
    logger.info("Evaluating model on test set...")
    metrics = trainer.evaluate_model(X_test, y_test, y_train=y_train)
    
    # Get feature importance
    logger.info("-" * 40)
    logger.info("Top 10 Feature Importance:")
    importance = trainer.get_feature_importance(top_n=10)
    for feat, imp in importance.items():
        logger.info(f"  {feat}: {imp:.2f}")

    # Save model
    model_dir = os.path.join(os.path.dirname(__file__), 'models')
    os.makedirs(model_dir, exist_ok=True)
    model_path = os.path.join(model_dir, "catboost_model.pkl")
    trainer.save_model(model_path)

    logger.info("=" * 60)
    logger.info("Training completed successfully!")
    logger.info(f"Model saved to: {model_path}")
    logger.info("=" * 60)
    
    # Print final summary
    print("\n" + "=" * 60)
    print("TRAINING SUMMARY")
    print("=" * 60)
    print(f"Total samples: {len(df)}")
    print(f"Features used: {len(feature_names)}")
    print(f"Trees in model: {model.tree_count_}")
    print("\nTest Set Metrics:")
    print(f"  MAE:       {metrics['mae']:.4f}")
    print(f"  RMSE:      {metrics['rmse']:.4f}")
    print(f"  MAPE:      {metrics['mape']:.2f}%" if metrics['mape'] else "  MAPE:      N/A")
    print(f"  Bias:      {metrics['bias']:.4f}")
    print(f"  MASE:      {metrics['mase']:.4f}" if metrics['mase'] else "  MASE:      N/A")
    print(f"  R²:        {metrics['r_squared']:.4f}")
    print("=" * 60)

    return trainer


if __name__ == "__main__":
    trained_trainer = main()
