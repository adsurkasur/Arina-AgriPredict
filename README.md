# AgriPredict Platform - Agricultural Demand Forecasting

A comprehensive AI-powered platform for agricultural demand forecasting and data management.

## 🚀 Features

### AI Assistant

- **Intent Classification**: Automatically understands user requests and executes appropriate actions
- **Smart Chat**: Context-aware conversations with message history
- **Action Execution**: Can create records, analyze data, and generate forecasts
- **Suggestion Chips**: Quick action buttons for common tasks
- **Clear Chat**: Easy chat history management

### Forecasting System

- **Multiple ML Models**: SMA, WMA, ES, ARIMA, CatBoost algorithms
- **Interactive Visualization**: Real-time charts and data visualization
- **Revenue Projections**: Calculate revenue based on forecasted demand and selling prices
- **Loading States**: User feedback during forecast generation
- **Product Integration**: Filter forecasts by specific products

### Data Management

- **CRUD Operations**: Complete create, read, update, delete functionality
- **AI-Powered Input**: Intelligent data processing and validation
- **Real-time Updates**: Live data synchronization
- **Data Summary Dashboard**: Key metrics and insights
- **Export Capabilities**: Data export functionality

### Technical Features

- **Responsive Design**: Works on all device sizes
- **Performance Optimized**: Hardware acceleration and efficient rendering
- **Error Handling**: Comprehensive error boundaries and user feedback
- **Accessibility**: WCAG compliant with proper ARIA labels
- **State Management**: Persistent state with Zustand

## � Deployment

### Vercel Deployment

1. **Connect your repository** to Vercel
2. **Configure environment variables** in Vercel dashboard:
   - Go to Project Settings → Environment Variables
   - Add all required variables from `.env.example`
3. **Deploy**: Vercel will automatically build and deploy your app

### Environment Variables for Vercel

**Important**: Since `.env*` files are gitignored, you must manually set these in Vercel:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`
- `GEMINI_API_KEY`
- `MONGODB_URI`
- `ANALYSIS_SERVICE_URL`

### Troubleshooting Vercel Builds

If you encounter build errors:

1. **Check environment variables** are properly set in Vercel
2. **Verify Firebase configuration** matches your project
3. **Ensure all dependencies** are listed in `package.json`
4. **Check build logs** for specific error messages

## �🛠️ Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Backend**: Vercel Serverless Functions, Python FastAPI
- **Database**: MongoDB
- **AI**: Google Gemini API
- **State Management**: Zustand with persistence
- **Data Fetching**: TanStack Query
- **UI Components**: Radix UI, shadcn/ui
- **Charts**: Recharts

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- MongoDB database
- Python 3.8+ (for analysis service)
- Google Gemini API key

## 🚀 Getting Started

1. **Clone the repository**

   ```bash
   git clone <YOUR_GIT_URL>
   cd data-agri-buddy
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory:

   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   MONGODB_URI=your_mongodb_connection_string
   ANALYSIS_SERVICE_URL=http://localhost:8000
   ```

4. **Start the development server**

   ```bash
   npm run dev
   ```

5. **Start the analysis service** (in a separate terminal)

   ```bash
   cd analysis-service
   pip install -r requirements.txt
   uvicorn main:app --reload
   ```

## 🛠️ Service Manager

This directory contains scripts to easily start both the frontend (Next.js) and backend (Python analysis service) for the AgriPredict application.

### Available Scripts

#### 1. Python Script (Recommended) - `start_services.py`

A comprehensive Python script that manages both services with proper error handling, monitoring, and graceful shutdown.

**Features:**

- ✅ Dependency checking
- ✅ Automatic dependency installation
- ✅ Process monitoring and logging
- ✅ Graceful shutdown (Ctrl+C)
- ✅ Status reporting
- ✅ **Dynamic port detection** (automatically detects actual ports used)
- ✅ **Network IP detection** (shows both localhost and network URLs)
- ✅ **Configurable ports and hostname** via command line arguments
- ✅ Cross-platform compatibility

**Usage:**

```bash
# Start both services (with dynamic port detection)
python start_services.py

# Start only frontend
python start_services.py --frontend-only

# Start only backend
python start_services.py --backend-only

# Custom ports and hostname
python start_services.py --frontend-port 3001 --backend-port 8000 --hostname 192.168.1.100
```

#### 2. Windows Batch Script - `start_services.bat`

Simple Windows batch file for quick startup on Windows systems.

**Usage:**

```cmd
start_services.bat
```

#### 3. PowerShell Script - `start_services.ps1`

PowerShell script with parameter support for advanced configuration.

**Usage:**

```powershell
# Start both services with defaults
.\start_services.ps1

# Custom configuration
.\start_services.ps1 -FrontendPort 3001 -BackendPort 8000 -Hostname "192.168.1.100"

# Start only frontend
.\start_services.ps1 -FrontendOnly

# Start only backend
.\start_services.ps1 -BackendOnly
```

#### 4. Shell Script - `start_services.sh`

Shell script for Unix-like systems (Linux/Mac).

**Usage:**

```bash
./start_services.sh
```

### What the Scripts Do

1. **Check Dependencies**: Verify that Node.js, npm, and Python are installed
2. **Install Dependencies**: Automatically install npm packages if needed
3. **Start Frontend**: Launch Next.js development server (usually on port 3000 or 3001)
4. **Start Backend**: Launch Python analysis service (on port 7860)
5. **Monitor Services**: Display logs from both services in real-time
6. **Handle Shutdown**: Gracefully stop both services when you press Ctrl+C

### Service URLs

After starting both services, you can access:

- **Frontend (Local)**: `http://localhost:[detected-port]`
- **Frontend (Network)**: `http://[network-ip]:[detected-port]`
- **Backend API (Local)**: `http://localhost:[backend-port]`
- **Backend API (Network)**: `http://[network-ip]:[backend-port]`
- **API Docs (Local)**: `http://localhost:[backend-port]/docs`
- **API Docs (Network)**: `http://[network-ip]:[backend-port]/docs`

The script automatically detects the actual ports being used and your network IP address for external access.

### Troubleshooting

#### Port Conflicts

If port 3000 is busy, Next.js will automatically use port 3001.

#### Backend Issues

- Make sure Python dependencies are installed: `cd analysis-service && pip install -r requirements.txt`
- Check if port 7860 is available

#### Frontend Issues

- Make sure Node.js dependencies are installed: `npm install`
- Clear npm cache if needed: `npm cache clean --force`

### Manual Startup

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

### Development Tips

- Use the Python script (`start_services.py`) for the best development experience
- Check the console output for any error messages
- Both services will restart automatically when you make code changes
- Use Ctrl+C to stop all services gracefully

## 🌐 Usage

The platform will be available at `http://localhost:3000` with the following main sections:

- **Dashboard**: Overview and key metrics
- **Data**: Manage agricultural demand records
- **Forecast**: Generate and view demand forecasts
- **Assistant**: AI-powered chat and assistance

## 🧪 Forecasting Testing Guide

This guide explains how to test the forecasting feature of AgriPredict using the enhanced import system and generated CSV datasets.

### 📋 Testing Prerequisites

1. **Generated Datasets**: Ensure you have run the dataset generation script:

   ```bash
   python generate_datasets.py
   ```

2. **Running Services**: Start both frontend and backend services:

   ```bash
   python start_services.py
   ```

3. **MongoDB Connection**: Ensure MongoDB is running and accessible

### 🚀 Step-by-Step Testing Instructions

#### Step 1: Load CSV Data into Database (Enhanced Import System)

1. **Open the Data Management Page**:
   - Navigate to `http://localhost:3000/data`
   - You should see the enhanced "Import Data" section with a unified import button

2. **Check Current Data Status**:
   - Click "Check Data Status" to see if any data is currently loaded
   - Initially, it should show "Total Records: 0"

3. **Test Enhanced Import System**:
   - Click the **"Import Data"** button (single unified button)
   - Select a CSV file to import
   - The system will **automatically** choose the best import method:
     - **Bulk Import** (10-50x faster): For files >1MB or >100 rows
     - **Regular Import**: For smaller files
   - Watch the progress indicator during import
   - You should see a success message with import statistics

4. **Verify Data Loading**:
   - Click "Check Data Status" again
   - Should show the total number of imported records
   - View sample records to confirm data structure
   - Check that products appear in the forecast dropdown

#### Step 2: Test Complete Data Clearing

1. **Clear All Data**:
   - Click the **"Clear All Data"** button
   - Confirm the action in the dialog (this removes ALL data from database)
   - Verify that all records are cleared (should show "Total Records: 0")

2. **Re-import Data**:
   - Use the enhanced import system again to reload data
   - Verify that the forecast page now shows products immediately

#### Step 3: Explore Enhanced Data Management Page

1. **Browse the Data Table**:
   - Scroll through the data table to see all loaded records
   - Use pagination controls (bottom of table)
   - Test sorting by clicking column headers
   - Test filtering using the search box

2. **Data Summary Dashboard**:
   - View summary statistics at the top
   - Check category distribution, regional data, etc.

3. **Test Data Operations**:
   - Try adding new records using the inline form
   - Test editing existing records
   - Verify data persistence

#### Step 4: Test Forecasting Feature (Enhanced Integration)

1. **Navigate to Forecast Page**:
   - Go to `http://localhost:3000/forecast`
   - You should see the forecasting interface with products loaded from imported data

2. **Select a Product for Forecasting**:
   - Choose a product from the dropdown (populated from imported data)
   - The system will automatically fetch historical data from the database

3. **Configure Forecast Parameters**:
   - **Forecast Days**: Set to 30, 60, or 90 days
   - **Selling Price**: Enter a price (e.g., 50.00)
   - **Models**: Select forecasting models (SMA, WMA, ARIMA, etc.)
   - **Scenario**: Choose realistic, optimistic, or pessimistic

4. **Generate Forecast**:
   - Click "Generate Forecast" button
   - Wait for the analysis service to process the data
   - View the forecast results with confidence intervals

5. **Analyze Results**:
   - **Forecast Chart**: View predicted demand over time
   - **Confidence Intervals**: See upper and lower bounds
   - **AI Summary**: Read the generated insights
   - **Revenue Projections**: If selling price was provided

#### Step 5: Test Performance with Large Datasets

1. **Large Dataset Testing**:
   - Import datasets with 10,000+ records
   - Monitor import time (should complete in seconds with bulk import)
   - Test forecast generation speed
   - Verify system responsiveness

2. **Import Method Comparison**:
   - Test with small files (<100 rows) → Uses regular import
   - Test with large files (>100 rows) → Uses bulk import automatically
   - Compare performance differences

#### Step 6: Test Different Scenarios

1. **Product Variations**:
   - Test forecasting for different products (Rice, Wheat, Corn, etc.)
   - Compare results across different categories (Grains, Vegetables, Fruits)

2. **Time Horizons**:
   - Test short-term forecasts (7-30 days)
   - Test medium-term forecasts (30-90 days)
   - Test long-term forecasts (90-365 days)

3. **Model Comparisons**:
   - Compare results from different models (SMA vs ARIMA vs Ensemble)
   - Note accuracy differences and confidence levels

4. **Scenario Analysis**:
   - Test "Realistic", "Optimistic", and "Pessimistic" scenarios
   - Compare how different assumptions affect forecasts

#### Step 7: Advanced Testing

1. **Data Filtering**:
   - Test forecasting with filtered data (specific regions, date ranges)
   - Verify that the forecast API correctly applies filters

2. **Performance Testing**:
   - Test with large datasets (50,000+ records)
   - Monitor response times and system performance
   - Test concurrent imports and forecasts

3. **Error Handling**:
   - Test with insufficient historical data
   - Test with invalid product IDs
   - Test network connectivity issues
   - Test malformed CSV files

### 🐛 Troubleshooting

#### Common Issues

1. **Import Method Not Selected Correctly**:
   - Check file size (>1MB or >100 rows triggers bulk import)
   - Verify CSV format and headers

2. **Products Not Appearing in Forecast**:
   - Ensure data was imported successfully
   - Check browser network tab for API calls
   - Try refreshing the forecast page

3. **Clear All Not Working**:
   - Verify API endpoint `/api/demands/clear-all` is accessible
   - Check MongoDB connection and permissions

4. **Slow Import Performance**:
   - Large files should use bulk import automatically
   - Check MongoDB performance and connection
   - Verify system has sufficient memory

5. **Database Connection Issues**:
   - Check MongoDB is running
   - Verify connection string in environment variables
   - Test database connectivity

6. **Analysis Service Not Responding**:
   - Ensure analysis service is running on port 7860
   - Check `ANALYSIS_SERVICE_URL` environment variable
   - Verify service logs for errors

7. **Forecast Generation Fails**:
   - Check if selected product has sufficient historical data
   - Verify analysis service logs for errors
   - Test with different products or time ranges

8. **Data Not Appearing in Table**:
   - Refresh the data management page
   - Check browser console for errors
   - Verify API endpoints are responding
   - Test cache invalidation

#### Debug Steps

1. **Check Service Status**:

   ```bash
   # Check if services are running
   python start_services.py --help
   ```

2. **View Enhanced Logs**:
   - Frontend: Check browser developer tools
   - Backend: Check analysis service console output
   - Database: Check MongoDB logs
   - Import: Monitor progress indicators and error messages

3. **API Testing**:

   ```bash
   # Test individual APIs
   curl http://localhost:3000/api/demands
   curl http://localhost:3000/api/products
   curl http://localhost:7860/docs
   ```

4. **Performance Monitoring**:

   ```bash
   # Check system resources during import
   # Monitor browser network tab for API calls
   # Check MongoDB performance metrics
   ```

### 🎯 Success Criteria

✅ **Enhanced Import System**: Unified button with automatic method selection
✅ **Performance**: 10-50x faster imports for large datasets
✅ **Complete Data Clearing**: All database records removed successfully
✅ **Real-time Integration**: Products appear immediately in forecast dropdown
✅ **Data Management**: CSV data loads successfully and displays correctly
✅ **Forecasting**: Generates accurate forecasts with confidence intervals
✅ **Integration**: Frontend and analysis service communicate properly
✅ **User Experience**: Interface is responsive and intuitive
✅ **Error Handling**: Graceful handling of edge cases and errors

### 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review service logs for error messages
3. Verify all prerequisites are met
4. Test individual components in isolation
5. Check browser developer tools for frontend errors
6. Monitor network requests for API failures

### 🚀 Recent Enhancements

The forecasting feature now includes:

- **Unified Import Experience**: Single button handles all import scenarios
- **Bulk Import Performance**: 10-50x faster for large datasets
- **Complete Data Management**: Clear all data functionality
- **Real-time Forecast Integration**: Products appear immediately after import
- **Enhanced Error Handling**: Better user feedback and error recovery
- **Performance Monitoring**: Progress tracking and system health indicators

The enhanced system is now ready for comprehensive testing with improved performance and user experience! 🚀

### 🔧 API Testing (Optional)

If you want to test the APIs directly:

#### Load CSV Data API

```bash
# Check data status
curl http://localhost:3000/api/load-csv

# Load CSV data
curl -X POST http://localhost:3000/api/load-csv
```

#### Forecast API

```bash
curl -X POST http://localhost:3000/api/forecast \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "rice_premium",
    "days": 30,
    "sellingPrice": 45.50,
    "models": ["ensemble"],
    "scenario": "realistic"
  }'
```

#### Demands API

```bash
# Get paginated data
curl "http://localhost:3000/api/demands?page=1&limit=20&sortKey=date&sortOrder=desc"

# Search data
curl "http://localhost:3000/api/demands?search=rice"
```

### 📊 Expected Results

#### Data Management Page

- ✅ 10,000 records loaded successfully
- ✅ Data table displays with pagination
- ✅ Search and filtering work correctly
- ✅ Summary statistics show correct counts

#### Forecasting Feature

- ✅ Historical data fetched from CSV/database
- ✅ Forecast generated with confidence intervals
- ✅ Multiple models work (SMA, WMA, ARIMA, etc.)
- ✅ AI summary provides insights
- ✅ Revenue projections calculated when price provided

#### Performance

- ✅ Data loading completes within 30 seconds
- ✅ Forecast generation completes within 10 seconds
- ✅ Page loads and interactions are responsive

## 📊 API Endpoints

### Data Management APIs

- `GET/POST /api/demands` - Demand records CRUD
- `GET/POST /api/products` - Product management

### Forecasting

- `POST /api/forecast` - Generate forecasts

### AI Chat API

- `POST /api/chat` - Chat with AI assistant

## 🔧 Configuration

### Environment Variables

#### Required Environment Variables

**Firebase Configuration (Client-side):**
- `NEXT_PUBLIC_FIREBASE_API_KEY`: Your Firebase API key
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`: Your Firebase auth domain
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`: Your Firebase project ID
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`: Your Firebase storage bucket
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`: Your Firebase messaging sender ID
- `NEXT_PUBLIC_FIREBASE_APP_ID`: Your Firebase app ID
- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`: Your Firebase measurement ID (optional)

**Firebase Admin Configuration (Server-side):**
- `FIREBASE_PROJECT_ID`: Your Firebase project ID
- `FIREBASE_CLIENT_EMAIL`: Your Firebase service account email
- `FIREBASE_PRIVATE_KEY`: Your Firebase service account private key

**API Configuration:**
- `GEMINI_API_KEY`: Your Google Gemini API key
- `MONGODB_URI`: MongoDB connection string
- `ANALYSIS_SERVICE_URL`: URL for the Python analysis service
- `NEXT_PUBLIC_API_BASE_URL`: Base URL for API calls (defaults to `/api`)

### Setup Instructions

1. **Copy environment template:**
   ```bash
   cp .env.example .env.local
   ```

2. **Fill in your actual values** in `.env.local`

3. **For Vercel deployment:**
   - Go to your Vercel project dashboard
   - Navigate to Settings → Environment Variables
   - Add all the required environment variables listed above
   - Redeploy your application

### Analysis Service

The Python FastAPI service provides:

- Multiple forecasting algorithms
- Data preprocessing
- Model evaluation metrics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support or questions, please open an issue in the repository.

---

**Status**: ✅ Fully functional and production-ready
**Last Updated**: September 2025

---

© 2025 AgriPredict "Developed by Ade Surya Ananda"
