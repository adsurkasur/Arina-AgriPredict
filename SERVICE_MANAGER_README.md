# AgriPredict Service Manager

This directory contains scripts to easily start both the frontend (Next.js) and backend (Python analysis service) for the AgriPredict application.

## Available Scripts

### 1. Python Script (Recommended) - `start_services.py`

A comprehensive Python script that manages both services with proper error handling, monitoring, and graceful shutdown.

**Features:**

- ✅ Dependency checking
- ✅ Automatic dependency installation
- ✅ Process monitoring and logging
- ✅ Graceful shutdown (Ctrl+C)
- ✅ Status reporting
- ✅ Cross-platform compatibility

**Usage:**

```bash
# Start both services
python start_services.py

# Start only frontend
python start_services.py --frontend-only

# Start only backend
python start_services.py --backend-only
```

### 2. Windows Batch Script - `start_services.bat`

Simple Windows batch file for quick startup on Windows systems.

**Usage:**

```cmd
start_services.bat
```

### 3. Shell Script - `start_services.sh`

Shell script for Unix-like systems (Linux/Mac).

**Usage:**

```bash
./start_services.sh
```

## What the Scripts Do

1. **Check Dependencies**: Verify that Node.js, npm, and Python are installed
2. **Install Dependencies**: Automatically install npm packages if needed
3. **Start Frontend**: Launch Next.js development server (usually on port 3000 or 3001)
4. **Start Backend**: Launch Python analysis service (on port 7860)
5. **Monitor Services**: Display logs from both services in real-time
6. **Handle Shutdown**: Gracefully stop both services when you press Ctrl+C

## Service URLs

After starting both services, you can access:

- **Frontend**: `http://localhost:3000` (or `http://localhost:3001` if 3000 is busy)
- **Backend API**: `http://localhost:7860`
- **API Documentation**: `http://localhost:7860/docs`

## Troubleshooting

### Port Conflicts

If port 3000 is busy, Next.js will automatically use port 3001.

### Backend Issues

- Make sure Python dependencies are installed: `cd analysis-service && pip install -r requirements.txt`
- Check if port 7860 is available

### Frontend Issues

- Make sure Node.js dependencies are installed: `npm install`
- Clear npm cache if needed: `npm cache clean --force`

## Manual Startup

If you prefer to start services manually:

**Frontend:**

```bash
npm run dev
```

**Backend:**

```bash
cd analysis-service
python run.py run
```

## Development Tips

- Use the Python script (`start_services.py`) for the best development experience
- Check the console output for any error messages
- Both services will restart automatically when you make code changes
- Use Ctrl+C to stop all services gracefully
