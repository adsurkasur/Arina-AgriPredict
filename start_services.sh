#!/bin/bash

echo "🚀 Starting AgriPredict Services..."
echo "======================================"

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Function to cleanup background processes
cleanup() {
    echo ""
    echo "🛑 Stopping services..."
    kill 0
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup EXIT INT TERM

# Start frontend in background
echo "Starting Next.js frontend..."
cd "$PROJECT_ROOT"
npm run dev &
FRONTEND_PID=$!

# Wait a moment for frontend to start
sleep 3

# Start backend
echo "Starting analysis service..."
cd "$PROJECT_ROOT/analysis-service"
python run.py run &
BACKEND_PID=$!

# Wait for both processes
echo ""
echo "🎉 Services started successfully!"
echo "📱 Frontend: http://localhost:3000 (or 3001 if 3000 is busy)"
echo "🔧 Backend:  http://localhost:7860"
echo "📚 API Docs: http://localhost:7860/docs"
echo "======================================"
echo "Press Ctrl+C to stop all services"

# Wait for background processes
wait
