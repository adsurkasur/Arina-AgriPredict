#!/usr/bin/env python3
"""
Development script for AgriPredict Analysis Service
"""

import subprocess
import sys
import os
from pathlib import Path

def install_dependencies():
    """Install Python dependencies"""
    print("Installing dependencies...")
    subprocess.run([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"], check=True)

def run_service():
    """Run the FastAPI service"""
    print("🚀 Starting AgriPredict Analysis Service...")
    print("📍 API will be available at: http://localhost:7860")
    print("📚 API documentation at: http://localhost:7860/docs")
    print("💚 Health check at: http://localhost:7860/health")
    print("🔧 Press Ctrl+C to stop the service")

    # Set environment variables
    env = os.environ.copy()
    env["PYTHONPATH"] = str(Path(__file__).parent)
    env["PORT"] = "7860"  # Ensure consistent port

    subprocess.run([sys.executable, "main.py"], env=env)

def train_model():
    """Train the CatBoost model with artificial data"""
    print("Training CatBoost model with artificial data...")
    subprocess.run([sys.executable, "train_catboost.py"], check=True)

def test_service():
    """Test the running service"""
    print("🧪 Testing AgriPredict Analysis Service...")
    print("📍 Assuming service is running on: http://localhost:7860")

    # Set environment variables
    env = os.environ.copy()
    env["PYTHONPATH"] = str(Path(__file__).parent)

    subprocess.run([sys.executable, "test_service.py"], env=env)

def main():
    if len(sys.argv) < 2:
        print("Usage: python run.py [install|run|train|test]")
        print("  install - Install dependencies")
        print("  run     - Run the service")
        print("  train   - Train the CatBoost model")
        print("  test    - Test the running service")
        return

    command = sys.argv[1].lower()

    if command == "install":
        install_dependencies()
    elif command == "run":
        run_service()
    elif command == "train":
        train_model()
    elif command == "test":
        test_service()
    else:
        print(f"Unknown command: {command}")

if __name__ == "__main__":
    main()
