#!/usr/bin/env python3
"""
Comprehensive test script for AgriPredict Analysis Service
Tests all API endpoints to ensure they are working correctly
"""

import requests
import json
import time
from typing import Dict, Any
from datetime import datetime, timedelta
import random

class APITester:
    def __init__(self, base_url: str = "http://localhost:7860"):
        self.base_url = base_url
        self.session = requests.Session()

    def generate_sample_data(self, days: int = 30) -> list:
        """Generate sample historical data for testing"""
        data = []
        base_date = datetime.now() - timedelta(days=days)

        for i in range(days):
            date = base_date + timedelta(days=i)
            # Generate realistic agricultural data
            demand = random.randint(80, 150) + random.randint(-15, 15)
            price = round(40 + random.uniform(-8, 8), 2)
            temp = round(20 + random.uniform(-5, 10), 1)

            data.append({
                "date": date.strftime("%Y-%m-%d"),
                "demand": max(1, demand),
                "price": max(10, price),
                "weather_temp": temp
            })

        return data

    def test_health_endpoint(self) -> Dict[str, Any]:
        """Test the health check endpoint"""
        print("🔍 Testing health endpoint...")
        try:
            response = self.session.get(f"{self.base_url}/health")
            if response.status_code == 200:
                data = response.json()
                print("✅ Health check passed!")
                print(f"   Status: {data.get('status')}")
                print(f"   Service: {data.get('service')}")
                return {"success": True, "data": data}
            else:
                print(f"❌ Health check failed with status {response.status_code}")
                return {"success": False, "error": f"Status {response.status_code}"}
        except Exception as e:
            print(f"❌ Health check error: {str(e)}")
            return {"success": False, "error": str(e)}

    def test_models_endpoint(self) -> Dict[str, Any]:
        """Test the models endpoint"""
        print("🔍 Testing models endpoint...")
        try:
            response = self.session.get(f"{self.base_url}/models")
            if response.status_code == 200:
                data = response.json()
                print("✅ Models endpoint passed!")
                models = data.get('models', [])
                print(f"   Available models: {len(models)}")
                for model in models:
                    print(f"   - {model}")
                return {"success": True, "data": data}
            else:
                print(f"❌ Models endpoint failed with status {response.status_code}")
                return {"success": False, "error": f"Status {response.status_code}"}
        except Exception as e:
            print(f"❌ Models endpoint error: {str(e)}")
            return {"success": False, "error": str(e)}

    def test_forecast_endpoint(self) -> Dict[str, Any]:
        """Test the forecast endpoint with sample data"""
        print("🔍 Testing forecast endpoint...")

        # Generate sample historical data
        historical_data = self.generate_sample_data(21)

        # Prepare forecast request matching our API structure
        forecast_request = {
            "historical_data": historical_data,
            "forecast_horizon": 7,
            "models": ["SMA", "WMA", "ES"],
            "confidence_level": 0.95
        }

        try:
            response = self.session.post(
                f"{self.base_url}/forecast",
                json=forecast_request,
                headers={"Content-Type": "application/json"}
            )

            if response.status_code == 200:
                data = response.json()
                print("✅ Forecast endpoint passed!")
                print(f"   Forecast horizon: {data.get('forecast_horizon')}")
                print(f"   Models used: {len(data.get('forecasts', {}))}")
                print(f"   Forecast dates: {len(data.get('forecast_dates', []))}")

                # Show sample forecast values
                forecasts = data.get('forecasts', {})
                if forecasts:
                    first_model = list(forecasts.keys())[0]
                    forecast_values = forecasts[first_model]
                    print(f"   Sample {first_model} forecast: {forecast_values[:3]}...")

                return {"success": True, "data": data}
            else:
                print(f"❌ Forecast endpoint failed with status {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error details: {error_data}")
                except:
                    print(f"   Response text: {response.text}")
                return {"success": False, "error": f"Status {response.status_code}"}
        except Exception as e:
            print(f"❌ Forecast endpoint error: {str(e)}")
            return {"success": False, "error": str(e)}

    def test_error_handling(self) -> Dict[str, Any]:
        """Test error handling with invalid data"""
        print("🔍 Testing error handling...")

        # Test with invalid data
        invalid_request = {
            "historical_data": [],  # Empty data should cause error
            "forecast_horizon": 7,
            "models": ["SMA"]
        }

        try:
            response = self.session.post(
                f"{self.base_url}/forecast",
                json=invalid_request,
                headers={"Content-Type": "application/json"}
            )

            if response.status_code >= 400:
                print("✅ Error handling works correctly!")
                print(f"   Status: {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error message: {error_data.get('detail', 'Unknown error')}")
                except:
                    print(f"   Response: {response.text}")
                return {"success": True, "status_code": response.status_code}
            else:
                print(f"⚠️  Expected error but got status {response.status_code}")
                return {"success": False, "error": "Expected error response"}
        except Exception as e:
            print(f"❌ Error handling test failed: {str(e)}")
            return {"success": False, "error": str(e)}

    def run_all_tests(self) -> bool:
        """Run all API tests"""
        print("🧪 Starting AgriPredict API Tests")
        print("=" * 50)

        # Wait a moment for service to be ready
        print("⏳ Waiting for service to be ready...")
        time.sleep(3)

        results = []

        # Test health endpoint
        health_result = self.test_health_endpoint()
        results.append(health_result)
        print()

        # Test models endpoint
        models_result = self.test_models_endpoint()
        results.append(models_result)
        print()

        # Test forecast endpoint
        forecast_result = self.test_forecast_endpoint()
        results.append(forecast_result)
        print()

        # Test error handling
        error_result = self.test_error_handling()
        results.append(error_result)
        print()

        # Summary
        print("=" * 50)
        successful_tests = sum(1 for r in results if r["success"])
        total_tests = len(results)

        if successful_tests == total_tests:
            print(f"🎉 All tests passed! ({successful_tests}/{total_tests})")
            return True
        else:
            print(f"⚠️  Some tests failed: {successful_tests}/{total_tests} passed")
            for i, result in enumerate(results):
                if not result["success"]:
                    print(f"   - Test {i+1} failed: {result.get('error', 'Unknown error')}")
            return False

def main():
    """Main function to run the tests"""
    import argparse

    parser = argparse.ArgumentParser(description="Test AgriPredict Analysis Service")
    parser.add_argument("--url", default="http://localhost:7860",
                       help="Base URL of the service to test")
    parser.add_argument("--wait", type=int, default=5,
                       help="Seconds to wait before starting tests")

    args = parser.parse_args()

    print(f"🧪 Testing service at: {args.url}")
    if args.wait > 0:
        print(f"⏳ Waiting {args.wait} seconds for service to start...")
        time.sleep(args.wait)

    tester = APITester(args.url)
    success = tester.run_all_tests()

    exit(0 if success else 1)

if __name__ == "__main__":
    main()
