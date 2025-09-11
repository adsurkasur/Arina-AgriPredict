# AgriPredict Forecasting Feature Testing Guide

This guide explains how to test the forecasting feature of AgriPredict using the enhanced import system and generated CSV datasets.

## 📋 Prerequisites

1. **Generated Datasets**: Ensure you have run the dataset generation script:
   ```bash
   python generate_datasets.py
   ```

2. **Running Services**: Start both frontend and backend services:
   ```bash
   python start_services.py
   ```

3. **MongoDB Connection**: Ensure MongoDB is running and accessible

## 🚀 Step-by-Step Testing Instructions

### Step 1: Load CSV Data into Database (Enhanced Import System)

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

### Step 2: Test Complete Data Clearing

1. **Clear All Data**:
   - Click the **"Clear All Data"** button
   - Confirm the action in the dialog (this removes ALL data from database)
   - Verify that all records are cleared (should show "Total Records: 0")

2. **Re-import Data**:
   - Use the enhanced import system again to reload data
   - Verify that the forecast page now shows products immediately

### Step 3: Explore Enhanced Data Management Page

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

### Step 4: Test Forecasting Feature (Enhanced Integration)

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

### Step 5: Test Performance with Large Datasets

1. **Large Dataset Testing**:
   - Import datasets with 10,000+ records
   - Monitor import time (should complete in seconds with bulk import)
   - Test forecast generation speed
   - Verify system responsiveness

2. **Import Method Comparison**:
   - Test with small files (<100 rows) → Uses regular import
   - Test with large files (>100 rows) → Uses bulk import automatically
   - Compare performance differences

### Step 6: Test Different Scenarios

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

### Step 7: Advanced Testing

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

## 🔧 API Testing (Updated Endpoints)

If you want to test the APIs directly:

### Enhanced Import APIs
```bash
# Bulk import (for large files)
curl -X POST http://localhost:3000/api/bulk-import \
  -F "file=@large_dataset.csv"

# Regular import (for small files)
curl -X POST http://localhost:3000/api/demands \
  -F "file=@small_dataset.csv"

# Clear all data
curl -X DELETE http://localhost:3000/api/demands/clear-all
```

### Forecast API
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

### Demands API
```bash
# Get paginated data
curl "http://localhost:3000/api/demands?page=1&limit=20&sortKey=date&sortOrder=desc"

# Search data
curl "http://localhost:3000/api/demands?search=rice"

# Get products list
curl "http://localhost:3000/api/products"
```

## 📊 Expected Results

### Enhanced Import System
- ✅ **Unified Import Button**: Single button handles all import types automatically
- ✅ **Smart Method Selection**: Large files use bulk import, small files use regular import
- ✅ **Progress Tracking**: Real-time progress indicators during import
- ✅ **Performance**: 10-50x faster imports for large datasets
- ✅ **Complete Data Clearing**: Clear-all functionality removes ALL database records

### Data Management Page
- ✅ Records loaded successfully with enhanced import system
- ✅ Data table displays with pagination
- ✅ Search and filtering work correctly
- ✅ Summary statistics show correct counts
- ✅ Products immediately available for forecasting

### Forecasting Feature
- ✅ Historical data fetched from imported data
- ✅ Forecast generated with confidence intervals
- ✅ Multiple models work (SMA, WMA, ARIMA, etc.)
- ✅ AI summary provides insights
- ✅ Revenue projections calculated when price provided
- ✅ **Real-time Integration**: Products appear immediately after import

### Performance
- ✅ **Bulk Import**: Large datasets load in seconds instead of minutes
- ✅ **Forecast Generation**: Completes within 10 seconds
- ✅ **Page Loads**: Responsive interactions
- ✅ **Memory Efficient**: Handles large files without memory issues

## 🆕 New Features to Test

### 1. Unified Import Experience
- Test the single "Import Data" button with different file sizes
- Verify automatic method selection works correctly
- Test progress tracking and error handling

### 2. Complete Data Management
- Test "Clear All Data" functionality
- Verify complete database cleanup
- Test re-importing after clearing

### 3. Enhanced Forecast Integration
- Import data and immediately see products in forecast dropdown
- Test forecast generation without page refresh
- Verify cache invalidation works properly

### 4. Performance Improvements
- Compare import times for large datasets
- Test system responsiveness with 10,000+ records
- Monitor memory usage during bulk operations

## 🐛 Troubleshooting (Updated)

### Common Issues

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

### Debug Steps

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

## 🎯 Success Criteria (Updated)

✅ **Enhanced Import System**: Unified button with automatic method selection
✅ **Performance**: 10-50x faster imports for large datasets
✅ **Complete Data Clearing**: All database records removed successfully
✅ **Real-time Integration**: Products appear immediately in forecast dropdown
✅ **Data Management**: CSV data loads successfully and displays correctly
✅ **Forecasting**: Generates accurate forecasts with confidence intervals
✅ **Integration**: Frontend and analysis service communicate properly
✅ **User Experience**: Interface is responsive and intuitive
✅ **Error Handling**: Graceful handling of edge cases and errors

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review service logs for error messages
3. Verify all prerequisites are met
4. Test individual components in isolation
5. Check browser developer tools for frontend errors
6. Monitor network requests for API failures

## 🚀 Recent Enhancements

The forecasting feature now includes:
- **Unified Import Experience**: Single button handles all import scenarios
- **Bulk Import Performance**: 10-50x faster for large datasets
- **Complete Data Management**: Clear all data functionality
- **Real-time Forecast Integration**: Products appear immediately after import
- **Enhanced Error Handling**: Better user feedback and error recovery
- **Performance Monitoring**: Progress tracking and system health indicators

The enhanced system is now ready for comprehensive testing with improved performance and user experience! 🚀
   - Test "Realistic", "Optimistic", and "Pessimistic" scenarios
   - Compare how different assumptions affect forecasts

### Step 5: Advanced Testing

1. **Data Filtering**:
   - Test forecasting with filtered data (specific regions, date ranges)
   - Verify that the forecast API correctly applies filters

2. **Performance Testing**:
   - Test with large datasets (50,000+ records)
   - Monitor response times and system performance

3. **Error Handling**:
   - Test with insufficient historical data
   - Test with invalid product IDs
   - Test network connectivity issues

## 🔧 API Testing (Optional)

If you want to test the APIs directly:

### Load CSV Data API
```bash
# Check data status
curl http://localhost:3000/api/load-csv

# Load CSV data
curl -X POST http://localhost:3000/api/load-csv
```

### Forecast API
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

### Demands API
```bash
# Get paginated data
curl "http://localhost:3000/api/demands?page=1&limit=20&sortKey=date&sortOrder=desc"

# Search data
curl "http://localhost:3000/api/demands?search=rice"
```

## 📊 Expected Results

### Data Management Page
- ✅ 10,000 records loaded successfully
- ✅ Data table displays with pagination
- ✅ Search and filtering work correctly
- ✅ Summary statistics show correct counts

### Forecasting Feature
- ✅ Historical data fetched from CSV/database
- ✅ Forecast generated with confidence intervals
- ✅ Multiple models work (SMA, WMA, ARIMA, etc.)
- ✅ AI summary provides insights
- ✅ Revenue projections calculated when price provided

### Performance
- ✅ Data loading completes within 30 seconds
- ✅ Forecast generation completes within 10 seconds
- ✅ Page loads and interactions are responsive

## 🐛 Troubleshooting

### Common Issues

1. **CSV File Not Found**:
   - Ensure `data/data_management.csv` exists
   - Run `python generate_datasets.py` if missing

2. **Database Connection Issues**:
   - Check MongoDB is running
   - Verify connection string in environment variables

3. **Analysis Service Not Responding**:
   - Ensure analysis service is running on port 7860
   - Check `ANALYSIS_SERVICE_URL` environment variable

4. **Forecast Generation Fails**:
   - Check if selected product has sufficient historical data
   - Verify analysis service logs for errors

5. **Data Not Appearing in Table**:
   - Refresh the data management page
   - Check browser console for errors
   - Verify API endpoints are responding

### Debug Steps

1. **Check Service Status**:
   ```bash
   # Check if services are running
   python start_services.py --help
   ```

2. **View Logs**:
   - Frontend: Check browser developer tools
   - Backend: Check analysis service console output
   - Database: Check MongoDB logs

3. **API Testing**:
   ```bash
   # Test individual APIs
   curl http://localhost:3000/api/demands
   curl http://localhost:7860/docs
   ```

## 🎯 Success Criteria

✅ **Data Management**: CSV data loads successfully and displays correctly
✅ **Forecasting**: Generates accurate forecasts with confidence intervals
✅ **Integration**: Frontend and analysis service communicate properly
✅ **Performance**: System handles large datasets efficiently
✅ **User Experience**: Interface is responsive and intuitive

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review service logs for error messages
3. Verify all prerequisites are met
4. Test individual components in isolation

The forecasting feature is now fully integrated with the data management system and ready for comprehensive testing! 🚀
