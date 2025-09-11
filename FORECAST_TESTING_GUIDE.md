# AgriPredict Forecasting Feature Testing Guide

This guide explains how to test the forecasting feature of AgriPredict using the generated CSV datasets.

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

### Step 1: Load CSV Data into Database

1. **Open the Data Management Page**:
   - Navigate to `http://localhost:3000/data`
   - You should see the "CSV Data Loader" component at the top

2. **Check Current Data Status**:
   - Click "Check Data Status" to see if any data is currently loaded
   - Initially, it should show "Total Records: 0"

3. **Load CSV Data**:
   - Click "Load CSV Data" button
   - Wait for the process to complete (may take 10-30 seconds for 10,000 records)
   - You should see a success message: "Successfully loaded X records from CSV"

4. **Verify Data Loading**:
   - Click "Check Data Status" again
   - Should now show "Total Records: 10000"
   - View sample records to confirm data structure

### Step 2: Explore Data Management Page

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

### Step 3: Test Forecasting Feature

1. **Navigate to Forecast Page**:
   - Go to `http://localhost:3000/forecast`
   - You should see the forecasting interface

2. **Select a Product for Forecasting**:
   - Choose a product from the dropdown (e.g., "Rice Premium", "Wheat Organic")
   - The system will automatically fetch historical data from the loaded CSV

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

### Step 4: Test Different Scenarios

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
