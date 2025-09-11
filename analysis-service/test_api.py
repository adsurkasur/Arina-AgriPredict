#!/usr/bin/env python3
"""
Example script showing how to use the AgriPredict Analysis Service API
"""

import requests
import json
from datetime import datetime, timedelta
import random

def generate_sample_data(days: int = 30):
    """Generate sample historical data for testing"""
    data = []
    base_date = datetime.now() - timedelta(days=days)

    for i in range(days):
        date = base_date + timedelta(days=i)
        # Generate realistic agricultural data
        quantity = random.randint(50, 150) + random.randint(-20, 20)
        price = round(20 + random.uniform(-5, 5), 2)

        data.append({
            "date": date.strftime("%Y-%m-%d"),
            "quantity": max(1, quantity),  # Ensure positive quantity
            "price": max(5, price)  # Ensure positive price
        })

    return data

def test_health_check(base_url: str = "http://localhost:8000"):
    """Test the health check endpoint"""
    print("Testing health check...")
    try:
        response = requests.get(f"{base_url}/health")
        if response.status_code == 200:
            print("✅ Health check passed")
            print(f"Response: {response.json()}")
        else:
            print(f"❌ Health check failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Health check error: {e}")

def test_list_models(base_url: str = "http://localhost:8000"):
    """Test the list models endpoint"""
    print("\nTesting list models...")
    try:
        response = requests.get(f"{base_url}/models")
        if response.status_code == 200:
            print("✅ Models list retrieved")
            models = response.json()["models"]
            print(f"Available models: {len(models)}")
            for model in models:
                print(f"  - {model['name']} ({model['id']})")
        else:
            print(f"❌ Models list failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Models list error: {e}")

def test_forecast_generation(base_url: str = "http://localhost:8000"):
    """Test forecast generation"""
    print("\nTesting forecast generation...")

    # Generate sample data
    historical_data = generate_sample_data(30)

    # Prepare forecast request
    forecast_request = {
        "product_id": "sample_crop",
        "historical_data": historical_data,
        "days": 14,
        "selling_price": 25.0,
        "models": ["ensemble"],
        "include_confidence": True,
        "scenario": "realistic"
    }

    try:
        response = requests.post(
            f"{base_url}/forecast",
            json=forecast_request,
            headers={"Content-Type": "application/json"}
        )

        if response.status_code == 200:
            print("✅ Forecast generated successfully")
            result = response.json()

            print(f"Models used: {result['models_used']}")
            print(f"Forecast points: {len(result['forecast_data'])}")
            print(f"Confidence: {result.get('confidence', 'N/A')}%")

            if result.get('revenue_projection'):
                print(f"Revenue projections: {len(result['revenue_projection'])}")

            # Show first few forecast points
            print("\nFirst 3 forecast points:")
            for i, point in enumerate(result['forecast_data'][:3]):
                print(f"  Day {i+1}: {point['predicted_value']:.2f} "
                      f"(±{point.get('confidence_upper', 0) - point.get('confidence_lower', 0):.2f})")

        else:
            print(f"❌ Forecast failed: {response.status_code}")
            print(f"Error: {response.text}")

    except Exception as e:
        print(f"❌ Forecast error: {e}")

def main():
    """Main test function"""
    print("🚀 AgriPredict Analysis Service API Test")
    print("=" * 50)

    # Test with local service (change URL for deployed service)
    base_url = "http://localhost:8000"

    # Run tests
    test_health_check(base_url)
    test_list_models(base_url)
    test_forecast_generation(base_url)

    print("\n" + "=" * 50)
    print("API test completed!")

if __name__ == "__main__":
    main()
