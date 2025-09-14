#!/usr/bin/env python3
"""
Generate large artificial datasets for AgriPredict testing
"""

import pandas as pd
import numpy as np
import random
from datetime import datetime, timedelta
import os

def generate_data_management_dataset(num_rows=10000):
    """Generate data management table dataset"""

    # Product data
    products = {
        'Grains': ['Rice Premium', 'Rice Basmati', 'Wheat Organic', 'Wheat Durum', 'Corn Yellow', 'Corn White', 'Soybeans', 'Barley', 'Oats', 'Quinoa'],
        'Vegetables': ['Tomatoes Fresh', 'Tomatoes Cherry', 'Potatoes', 'Potatoes Sweet', 'Onions Red', 'Onions White', 'Carrots', 'Carrots Baby', 'Spinach', 'Lettuce', 'Cabbage', 'Broccoli', 'Cauliflower', 'Peppers Bell', 'Eggplant', 'Cucumbers', 'Zucchini'],
        'Fruits': ['Apples Red', 'Apples Green', 'Oranges', 'Oranges Navel', 'Bananas', 'Grapes Red', 'Grapes Green', 'Mangoes', 'Pineapple', 'Strawberries', 'Blueberries', 'Raspberries', 'Peaches', 'Pears', 'Plums'],
        'Dairy': ['Milk Fresh', 'Milk Almond', 'Cheese Cheddar', 'Cheese Mozzarella', 'Cheese Feta', 'Yogurt Plain', 'Yogurt Greek', 'Yogurt Strawberry', 'Butter', 'Cream', 'Eggs', 'Eggs Organic']
    }

    regions = ['North Delhi', 'South Delhi', 'East Delhi', 'West Delhi', 'Central Delhi', 'Gurgaon', 'Noida', 'Faridabad', 'Ghaziabad', 'Greater Noida']
    suppliers = ['AgriCorp Ltd', 'GreenFields', 'FarmFresh', 'NatureHarvest', 'UrbanFarms', 'FreshFruits', 'DairyBest', 'OrganicValley', 'PremiumAgri', 'SmartFarms']
    customer_types = ['Retail', 'Wholesale', 'Restaurant', 'Institution', 'Export']
    seasons = ['Winter', 'Summer', 'Monsoon', 'Spring', 'Autumn']
    weather_conditions = ['Sunny', 'Cloudy', 'Rainy', 'Foggy', 'Windy', 'Stormy']

    # Generate data
    data = []
    start_date = datetime(2023, 1, 1)
    end_date = datetime(2025, 12, 31)

    for i in range(num_rows):
        # Select random category and product
        category = random.choice(list(products.keys()))
        product_name = random.choice(products[category])

        # Generate date
        random_days = random.randint(0, (end_date - start_date).days)
        date = start_date + timedelta(days=random_days)

        # Generate other fields
        region = random.choice(regions)
        supplier = random.choice(suppliers)
        customer_type = random.choice(customer_types)
        season = seasons[date.month % 5]  # Rough seasonal mapping
        weather = random.choice(weather_conditions)

        # Generate quantity based on product type and seasonality
        base_quantity = {
            'Grains': (500, 2000),
            'Vegetables': (100, 600),
            'Fruits': (50, 400),
            'Dairy': (20, 500)
        }[category]

        # Add seasonal variation
        seasonal_multiplier = 1.0
        if season == 'Summer' and category in ['Fruits', 'Vegetables']:
            seasonal_multiplier = 1.3
        elif season == 'Winter' and category == 'Grains':
            seasonal_multiplier = 1.2

        quantity_sold = round(random.uniform(*base_quantity) * seasonal_multiplier, 1)

        # Generate prices
        base_prices = {
            'Grains': (30, 60),
            'Vegetables': (15, 40),
            'Fruits': (40, 100),
            'Dairy': (25, 150)
        }[category]

        unit_price = round(random.uniform(*base_prices), 2)
        total_revenue = round(quantity_sold * unit_price, 2)

        # Generate demand score (1-10)
        demand_score = round(random.uniform(5.0, 10.0), 1)

        # Add some realistic correlations
        if weather == 'Rainy' and category == 'Vegetables':
            demand_score += 0.5
        if customer_type == 'Export':
            unit_price *= 1.2

        demand_score = min(10.0, demand_score)

        data.append({
            'id': i + 1,
            'product_name': product_name,
            'category': category,
            'region': region,
            'date': date.strftime('%Y-%m-%d'),
            'quantity_sold': quantity_sold,
            'unit_price': unit_price,
            'total_revenue': total_revenue,
            'supplier': supplier,
            'customer_type': customer_type,
            'season': season,
            'weather_condition': weather,
            'demand_score': demand_score
        })

    return pd.DataFrame(data)

    return pd.DataFrame(data)

def _generate_temporal_features(num_rows: int, start_date: datetime) -> dict:
    """Generate temporal features for the dataset"""
    dates = [start_date + timedelta(days=i) for i in range(num_rows)]

    return {
        'date': dates,
        'year': [d.year for d in dates],
        'month': [d.month for d in dates],
        'day': [d.day for d in dates],
        'day_of_week': [d.weekday() for d in dates],
        'week_of_year': [d.isocalendar()[1] for d in dates],
        'quarter': [((d.month - 1) // 3) + 1 for d in dates],
        'is_weekend': [1 if d.weekday() >= 5 else 0 for d in dates],
        'is_holiday': [random.choice([0, 0, 0, 0, 1]) for _ in range(num_rows)],  # 20% holidays
    }

def _generate_product_features(num_rows: int) -> dict:
    """Generate product-related features"""
    products = ['Rice', 'Wheat', 'Corn', 'Soybeans', 'Tomatoes', 'Potatoes', 'Onions', 'Carrots', 'Apples', 'Oranges', 'Bananas', 'Milk', 'Cheese', 'Eggs']
    product_ids = [random.randint(1, len(products)) for _ in range(num_rows)]

    return {
        'product_id': product_ids,
        'product_name': [products[pid-1] for pid in product_ids]
    }

def _generate_regional_features(num_rows: int) -> dict:
    """Generate regional features"""
    regions = ['North Delhi', 'South Delhi', 'East Delhi', 'West Delhi', 'Central Delhi', 'Gurgaon', 'Noida', 'Faridabad']
    region_ids = [random.randint(1, len(regions)) for _ in range(num_rows)]

    return {
        'region_id': region_ids,
        'region_name': [regions[rid-1] for rid in region_ids]
    }

def _generate_weather_features(num_rows: int) -> dict:
    """Generate weather-related features"""
    return {
        'temperature': np.random.normal(25, 8, num_rows).clip(5, 45),  # Celsius
        'humidity': np.random.normal(65, 15, num_rows).clip(20, 100),  # Percentage
        'rainfall': np.random.exponential(2, num_rows).clip(0, 50),  # mm
        'wind_speed': np.random.normal(15, 5, num_rows).clip(0, 40),  # km/h
    }

def _generate_economic_features(num_rows: int) -> dict:
    """Generate economic features"""
    return {
        'inflation_rate': np.random.normal(4.5, 1.5, num_rows).clip(1, 10),  # Percentage
        'gdp_growth': np.random.normal(6.5, 2, num_rows).clip(-2, 12),  # Percentage
        'unemployment_rate': np.random.normal(7.5, 2, num_rows).clip(2, 15),  # Percentage
        'exchange_rate': np.random.normal(15000, 500, num_rows).clip(14000, 16000),  # IDR/USD
    }

def _generate_market_features(num_rows: int) -> dict:
    """Generate market-related features"""
    market_price = np.random.normal(50, 20, num_rows).clip(10, 200)

    return {
        'market_price': market_price,
        'supply_index': np.random.normal(100, 15, num_rows).clip(50, 150),
        'demand_index': np.random.normal(100, 20, num_rows).clip(30, 180),
        'competitor_price_avg': [price * random.uniform(0.9, 1.1) for price in market_price],
        'competitor_count': [random.randint(3, 12) for _ in range(num_rows)],
        'market_share': np.random.normal(15, 5, num_rows).clip(1, 40),
    }

def _generate_seasonal_multiplier(months: list) -> list:
    """Generate seasonal multipliers based on months"""
    seasonal_multiplier = []
    for month in months:
        if month in [3, 4, 5]:  # Summer
            seasonal_multiplier.append(random.uniform(1.1, 1.3))
        elif month in [6, 7, 8, 9]:  # Monsoon
            seasonal_multiplier.append(random.uniform(0.8, 1.0))
        elif month in [10, 11, 12, 1, 2]:  # Winter
            seasonal_multiplier.append(random.uniform(0.9, 1.1))
        else:
            seasonal_multiplier.append(1.0)
    return seasonal_multiplier

def _generate_historical_features(base_quantity: list, seasonal_multiplier: list, market_price: list) -> dict:
    """Generate historical (lagged) features"""
    quantity_lag_1 = [q * m * random.uniform(0.9, 1.1) for q, m in zip(base_quantity, seasonal_multiplier)]
    quantity_lag_7 = [q * random.uniform(0.85, 1.15) for q in quantity_lag_1]
    quantity_lag_30 = [q * random.uniform(0.8, 1.2) for q in quantity_lag_7]

    price_lag_1 = [p * random.uniform(0.95, 1.05) for p in market_price]
    price_lag_7 = [p * random.uniform(0.9, 1.1) for p in price_lag_1]
    price_lag_30 = [p * random.uniform(0.85, 1.15) for p in price_lag_7]

    return {
        'quantity_sold_lag_1': quantity_lag_1,
        'quantity_sold_lag_7': quantity_lag_7,
        'quantity_sold_lag_30': quantity_lag_30,
        'price_lag_1': price_lag_1,
        'price_lag_7': price_lag_7,
        'price_lag_30': price_lag_30,
    }

def _calculate_target_quantity(data: dict, seasonal_multiplier: list, num_rows: int) -> list:
    """Calculate target quantity based on various factors"""
    target_quantity = []
    for i in range(num_rows):
        base = data['quantity_sold_lag_1'][i]

        # Weather influence
        weather_factor = 1.0
        if data['temperature'][i] > 30:
            weather_factor *= 0.9  # Hot weather reduces demand
        elif data['temperature'][i] < 15:
            weather_factor *= 1.1  # Cold weather increases demand

        if data['rainfall'][i] > 10:
            weather_factor *= 1.2  # Rain increases vegetable demand

        # Economic influence
        economic_factor = 1.0
        if data['inflation_rate'][i] > 6:
            economic_factor *= 0.95  # High inflation reduces demand
        if data['gdp_growth'][i] > 8:
            economic_factor *= 1.05  # High growth increases demand

        # Calculate final target
        seasonal_factor = seasonal_multiplier[i]
        market_factor = data['demand_index'][i] / 100
        noise = random.uniform(0.8, 1.2)

        target = base * weather_factor * economic_factor * seasonal_factor * market_factor * noise
        target_quantity.append(round(target, 2))

    return target_quantity

def generate_catboost_dataset(num_rows=50000):
    """Generate CatBoost training dataset"""
    start_date = datetime(2020, 1, 1)

    # Generate all feature sets
    data = {}
    data.update(_generate_temporal_features(num_rows, start_date))
    data.update(_generate_product_features(num_rows))
    data.update(_generate_regional_features(num_rows))
    data.update(_generate_weather_features(num_rows))
    data.update(_generate_economic_features(num_rows))
    data.update(_generate_market_features(num_rows))

    # Generate seasonal patterns
    seasonal_multiplier = _generate_seasonal_multiplier(data['month'])

    # Generate historical features
    base_quantity = np.random.normal(1000, 300, num_rows).clip(100, 3000)
    historical_features = _generate_historical_features(base_quantity, seasonal_multiplier, data['market_price'])
    data.update(historical_features)

    # Calculate target variable
    data['target_quantity'] = _calculate_target_quantity(data, seasonal_multiplier, num_rows)

    # Convert to DataFrame
    df = pd.DataFrame(data)

    # Add some categorical encodings
    df['product_category'] = df['product_name'].map({
        'Rice': 'Grains', 'Wheat': 'Grains', 'Corn': 'Grains', 'Soybeans': 'Grains',
        'Tomatoes': 'Vegetables', 'Potatoes': 'Vegetables', 'Onions': 'Vegetables', 'Carrots': 'Vegetables',
        'Apples': 'Fruits', 'Oranges': 'Fruits', 'Bananas': 'Fruits',
        'Milk': 'Dairy', 'Cheese': 'Dairy', 'Eggs': 'Dairy'
    })

    return df

def main():
    print("🚀 Generating large artificial datasets...")

    # Create data directory if it doesn't exist
    os.makedirs('data', exist_ok=True)

    # Generate data management dataset
    print("📊 Generating data management dataset (10,000 rows)...")
    dm_df = generate_data_management_dataset(10000)
    dm_df.to_csv('data/data_management.csv', index=False)
    print(f"✅ Data management dataset saved: {len(dm_df)} rows, {len(dm_df.columns)} columns")

    # Generate CatBoost dataset
    print("🤖 Generating CatBoost training dataset (50,000 rows)...")
    cb_df = generate_catboost_dataset(50000)
    cb_df.to_csv('data/catboost_training_data.csv', index=False)
    print(f"✅ CatBoost dataset saved: {len(cb_df)} rows, {len(cb_df.columns)} columns")

    # Print dataset info
    print("\n📋 Dataset Information:")
    print("=" * 50)

    print("\n📊 Data Management Dataset:")
    print(f"Shape: {dm_df.shape}")
    print(f"Date range: {dm_df['date'].min()} to {dm_df['date'].max()}")
    print(f"Total revenue range: Rp {dm_df['total_revenue'].min():,.0f} - Rp {dm_df['total_revenue'].max():,.0f}")

    print("\n🤖 CatBoost Training Dataset:")
    print(f"Shape: {cb_df.shape}")
    print(f"Date range: {cb_df['date'].min()} to {cb_df['date'].max()}")
    print(f"Features: {len(cb_df.columns) - 1}")  # Excluding target
    print(f"Target variable: target_quantity")
    print(f"Target range: {cb_df['target_quantity'].min():.2f} - {cb_df['target_quantity'].max():.2f}")

    print("\n🎯 Ready for testing!")

if __name__ == "__main__":
    main()
