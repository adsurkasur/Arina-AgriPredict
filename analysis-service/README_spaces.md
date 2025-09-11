title: AgriPredict Analysis Service
emoji: 🌾
colorFrom: green
colorTo: blue
sdk: gradio
sdk_version: "4.0.0"
app_file: main.py
pinned: false

# Hugging Face Spaces Configuration for AgriPredict Analysis Service
# This service provides advanced agricultural demand forecasting

# Python version requirement
python_version: "3.10"

# Build configuration
build:
  python_version: "3.10"

# Environment variables
env:
  PORT: 7860
  PYTHONPATH: /app

# Startup command
start_command: "python main.py"
