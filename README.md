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

## 🛠️ Tech Stack

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

## 🌐 Usage

The platform will be available at `http://localhost:3000` with the following main sections:

- **Dashboard**: Overview and key metrics
- **Data**: Manage agricultural demand records
- **Forecast**: Generate and view demand forecasts
- **Assistant**: AI-powered chat and assistance

## 📊 API Endpoints

### Data Management
- `GET/POST /api/demands` - Demand records CRUD
- `GET/POST /api/products` - Product management

### Forecasting
- `POST /api/forecast` - Generate forecasts

### AI Assistant
- `POST /api/chat` - Chat with AI assistant

## 🔧 Configuration

### Environment Variables
- `GEMINI_API_KEY`: Your Google Gemini API key
- `MONGODB_URI`: MongoDB connection string
- `ANALYSIS_SERVICE_URL`: URL for the Python analysis service

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

This project is licensed under the MIT License.

## 🆘 Support

For support or questions, please open an issue in the repository.

---

**Status**: ✅ Fully functional and production-ready
**Last Updated**: December 2024




