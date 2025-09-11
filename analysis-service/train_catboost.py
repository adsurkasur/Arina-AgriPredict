"""
CatBoost Model Training Script for AgriPredict
This script demonstrates how to train the CatBoost model with artificial agricultural data.
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from catboost import CatBoostRegressor, Pool
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error
import joblib
import os
from typing import Dict, Any
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class CatBoostTrainer:
    """CatBoost model trainer for agricultural demand forecasting"""

    def __init__(self):
        self.model = None
        self.feature_names = None

    def generate_artificial_data(self, n_samples: int = 1000) -> pd.DataFrame:
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

    def prepare_features(self, df: pd.DataFrame) -> tuple:
        """
        Prepare features for training

        Args:
            df: Input DataFrame

        Returns:
            Tuple of (X, y, feature_names)
        """
        # Define feature columns (exclude target and non-feature columns)
        exclude_cols = ['date', 'quantity', 'price']
        feature_cols = [col for col in df.columns if col not in exclude_cols]

        # Prepare features and target
        X = df[feature_cols]
        y = df['price']  # We're predicting price

        logger.info(f"Prepared {len(feature_cols)} features for training")
        return X, y, feature_cols

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
        # Default parameters
        default_params = {
            'iterations': 1000,
            'learning_rate': 0.1,
            'depth': 6,
            'loss_function': 'MAE',
            'eval_metric': 'MAE',
            'random_seed': 42,
            'verbose': 100,
            'early_stopping_rounds': 50
        }

        # Update with custom parameters
        default_params.update(kwargs)

        # Create model
        model = CatBoostRegressor(**default_params)

        # Prepare data
        train_pool = Pool(X_train, y_train)

        if X_val is not None and y_val is not None:
            val_pool = Pool(X_val, y_val)
            model.fit(train_pool, eval_set=val_pool)
        else:
            model.fit(train_pool)

        self.model = model
        self.feature_names = list(X_train.columns)

        logger.info(f"Trained CatBoost model with {model.tree_count_} trees")
        return model

    def evaluate_model(self, X_test, y_test) -> Dict[str, float]:
        """
        Evaluate model performance

        Args:
            X_test: Test features
            y_test: Test target

        Returns:
            Dictionary with evaluation metrics
        """
        if self.model is None:
            raise ValueError("Model not trained yet")

        # Make predictions
        y_pred = self.model.predict(X_test)

        # Calculate metrics
        mae = mean_absolute_error(y_test, y_pred)
        mse = mean_squared_error(y_test, y_pred)
        rmse = np.sqrt(mse)

        # Calculate MAPE (Mean Absolute Percentage Error)
        mape = np.mean(np.abs((y_test - y_pred) / y_test)) * 100

        metrics = {
            'mae': mae,
            'mse': mse,
            'rmse': rmse,
            'mape': mape
        }

        logger.info(".2f")
        return metrics

    def save_model(self, filepath: str):
        """
        Save trained model to file

        Args:
            filepath: Path to save the model
        """
        if self.model is None:
            raise ValueError("Model not trained yet")

        # Create directory if it doesn't exist
        os.makedirs(os.path.dirname(filepath), exist_ok=True)

        # Save model
        joblib.dump({
            'model': self.model,
            'feature_names': self.feature_names,
            'training_date': datetime.now().isoformat()
        }, filepath)

        logger.info(f"Model saved to {filepath}")

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
        self.feature_names = model_data['feature_names']

        logger.info(f"Model loaded from {filepath}")

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
            features = features[self.feature_names]

        return self.model.predict(features)

def main():
    """Main training function"""
    logger.info("Starting CatBoost model training")

    # Initialize trainer
    trainer = CatBoostTrainer()

    # Generate artificial data
    df = trainer.generate_artificial_data(n_samples=2000)

    # Prepare features
    X, y, feature_names = trainer.prepare_features(df)

    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    # Further split training data for validation
    X_train, X_val, y_train, y_val = train_test_split(
        X_train, y_train, test_size=0.2, random_state=42
    )

    # Train model
    model = trainer.train_model(X_train, y_train, X_val, y_val)

    # Evaluate model
    metrics = trainer.evaluate_model(X_test, y_test)

    # Save model
    model_path = "models/catboost_model.pkl"
    trainer.save_model(model_path)

    logger.info("Training completed successfully!")
    logger.info(f"Model saved to: {model_path}")
    logger.info(f"Test Metrics: {metrics}")

    return trainer

if __name__ == "__main__":
    trained_trainer = main()
