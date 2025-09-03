// Mock API implementation for development
import {
  DemandRecord,
  DemandResponse,
  DemandQueryParams,
  CreateDemandRequest,
  UpdateDemandRequest,
  ForecastResponse,
  ChatResponse,
  Product
} from '@/types/api';
import { toast } from '@/lib/toast';

// LocalStorage helpers
const DEMANDS_KEY = 'agriBuddy:demands';

// Show dev mode toast when localStorage is used
function showDevToast() {
  if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
    if (!(window as any).__localStorageToastShown) {
      (window as any).__localStorageToastShown = true;
      toast.info("Development Mode - Using localStorage", {
        description: "Data is being stored locally. Switch to production for MongoDB.",
        duration: 8000,
      });
    }
  }
}

function getLocalDemands(): DemandRecord[] {
  const raw = typeof window !== 'undefined' ? window.localStorage.getItem(DEMANDS_KEY) : null;
  if (raw) {
    showDevToast(); // Show toast when reading data
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }
  // If not present, seed with initial data
  const initial = [
    {
      id: '1',
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      productName: 'Red Chili',
      productId: 'red-chili',
      quantity: 150,
      price: 8.50,
    },
    {
      id: '2',
      date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      productName: 'Onions',
      productId: 'onions',
      quantity: 200,
      price: 3.20,
    },
    {
      id: '3',
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      productName: 'Tomatoes',
      productId: 'tomatoes',
      quantity: 180,
      price: 4.75,
    },
    {
      id: '4',
      date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      productName: 'Red Chili',
      productId: 'red-chili',
      quantity: 120,
      price: 8.75,
    },
    {
      id: '5',
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      productName: 'Potatoes',
      productId: 'potatoes',
      quantity: 300,
      price: 2.80,
    },
  ];
  if (typeof window !== 'undefined') {
    showDevToast(); // Show toast when writing initial data
    window.localStorage.setItem(DEMANDS_KEY, JSON.stringify(initial));
  }
  return initial;
}
function setLocalDemands(data: DemandRecord[]) {
  if (typeof window !== 'undefined') {
    showDevToast(); // Show toast when writing data
    window.localStorage.setItem(DEMANDS_KEY, JSON.stringify(data));
  }
}

const mockProducts: Product[] = [
  { id: 'red-chili', name: 'Red Chili', category: 'Spices', unit: 'kg' },
  { id: 'green-chili', name: 'Green Chili', category: 'Spices', unit: 'kg' },
  { id: 'onions', name: 'Onions', category: 'Vegetables', unit: 'kg' },
  { id: 'tomatoes', name: 'Tomatoes', category: 'Vegetables', unit: 'kg' },
  { id: 'potatoes', name: 'Potatoes', category: 'Vegetables', unit: 'kg' },
  { id: 'shallots', name: 'Shallots', category: 'Vegetables', unit: 'kg' },
  { id: 'garlic', name: 'Garlic', category: 'Spices', unit: 'kg' },
  { id: 'ginger', name: 'Ginger', category: 'Spices', unit: 'kg' },
];

// Helper function to simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockApi = {
  async getDemands(params: DemandQueryParams = {}): Promise<DemandResponse> {
    await delay(500); // Simulate network delay
    
    const { page = 1, limit = 10, search = '', sortKey = 'date', sortOrder = 'desc' } = params;
    
    // Filter by search
  const demands = getLocalDemands();
  const filtered = demands.filter(demand => 
      demand.productName.toLowerCase().includes(search.toLowerCase()) ||
      demand.productId.toLowerCase().includes(search.toLowerCase())
    );
    
    // Sort
    filtered.sort((a, b) => {
      const aVal = a[sortKey as keyof DemandRecord];
      const bVal = b[sortKey as keyof DemandRecord];
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      }
      
      return 0;
    });
    
    // Paginate
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedData = filtered.slice(startIndex, endIndex);
    
    return {
      data: paginatedData,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(filtered.length / limit),
        totalItems: filtered.length,
      },
    };
  },

  async createDemand(data: CreateDemandRequest): Promise<DemandRecord> {
    await delay(300);
    
    const product = mockProducts.find(p => p.id === data.productId);
    if (!product) {
      throw new Error('Product not found');
    }
    
    const newRecord: DemandRecord = {
      id: `${Date.now()}`,
      date: data.date,
      productName: product.name,
      productId: data.productId,
      quantity: data.quantity,
      price: data.price,
    };
    
  const demands = getLocalDemands();
  demands.unshift(newRecord);
  setLocalDemands(demands);
    return newRecord;
  },

  async updateDemand(id: string, data: UpdateDemandRequest): Promise<DemandRecord> {
    await delay(300);

    const demands = getLocalDemands();
    const index = demands.findIndex(d => d.id === id);
    if (index === -1) {
      throw new Error('Record not found');
    }

    const existing = demands[index];
    const updated: DemandRecord = {
      ...existing,
      ...data,
      productName: data.productId ? getProductNameFromId(data.productId) : existing.productName
    };

    demands[index] = updated;
    setLocalDemands(demands);
    return updated;
  },

  async deleteDemand(id: string): Promise<void> {
    await delay(200);
    
  const demands = getLocalDemands();
  const index = demands.findIndex(d => d.id === id);
    if (index === -1) {
      throw new Error('Record not found');
    }
    
  demands.splice(index, 1);
  setLocalDemands(demands);
  },

  async generateForecast(productId: string, days: number): Promise<ForecastResponse> {
    await delay(2000); // Longer delay to simulate ML processing
    
    const product = mockProducts.find(p => p.id === productId);
    if (!product) {
      throw new Error('Product not found');
    }
    
    // Generate mock forecast data
    const forecastData = Array.from({ length: days }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() + i + 1);
      
      // Simple mock algorithm - add some randomness to current trend
      const baseValue = 150 + Math.sin(i / 7) * 20; // Weekly pattern
      const randomVariation = (Math.random() - 0.5) * 30;
      const predictedValue = Math.max(0, baseValue + randomVariation);
      
      return {
        date: date.toISOString(),
        predictedValue: Math.round(predictedValue),
      };
    });
    
    const summary = `
# Forecast Analysis for ${product.name}

Based on historical data analysis, here are the key insights for the ${days}-day forecast:

## Key Findings
- **Average predicted demand**: ${Math.round(forecastData.reduce((sum, d) => sum + d.predictedValue, 0) / days)} kg/day
- **Peak demand expected**: ${Math.max(...forecastData.map(d => d.predictedValue))} kg
- **Lowest demand expected**: ${Math.min(...forecastData.map(d => d.predictedValue))} kg

## Recommendations
1. **Stock Management**: Maintain inventory levels around the average predicted demand
2. **Price Optimization**: Consider dynamic pricing during peak demand periods
3. **Supply Chain**: Coordinate with suppliers for consistent availability

## Market Trends
- The forecast shows seasonal patterns typical for ${product.category.toLowerCase()}
- Weekly cycles indicate higher demand mid-week
- Consider external factors like weather and festivals that may impact actual demand

*This forecast is generated using advanced time series analysis and machine learning algorithms.*
    `;
    
    return {
      forecastData,
      summary: summary.trim(),
    };
  },

  async sendChatMessage(message: string): Promise<ChatResponse> {
    await delay(1500); // Simulate AI processing time
    
    // Simple mock AI responses
    const lowerMessage = message.toLowerCase();
    
    let response = '';
    let actionTaken: ChatResponse['response']['actionTaken'] = 'NONE';
  const requiresRefetch = false;
    let suggestions: string[] = [];
    
    if (lowerMessage.includes('delete') || lowerMessage.includes('remove')) {
      response = "I understand you want to delete a record. To help you with this, I would need to identify the specific record. Could you provide more details like the product name and date?";
      actionTaken = 'READ';
      suggestions = [
        "Show me all records for tomatoes",
        "Delete the latest record",
        "Remove all records from yesterday"
      ];
    } else if (lowerMessage.includes('add') || lowerMessage.includes('create')) {
      response = "I can help you add a new sales record! Please provide the product, quantity, price, and date for the new record.";
      actionTaken = 'CREATE';
      suggestions = [
        "Add 100kg tomatoes at $4.50 for today",
        "Create record for red chili",
        "Add multiple records"
      ];
    } else if (lowerMessage.includes('forecast') || lowerMessage.includes('predict')) {
      response = "I can generate a demand forecast for any product in your inventory. Which product would you like me to forecast, and for how many days?";
      actionTaken = 'FORECAST';
      suggestions = [
        "Forecast red chili for 14 days",
        "Predict tomato demand for next month",
        "Generate forecast for all products"
      ];
    } else if (lowerMessage.includes('analyze') || lowerMessage.includes('insight')) {
      response = `
# Data Analysis Summary

Based on your current sales data, here are some key insights:

## Top Performing Products
1. **Red Chili** - Highest price per kg ($8.50-8.75)
2. **Tomatoes** - Consistent demand with good volume
3. **Potatoes** - High volume, lower margin product

## Recent Trends
- Red chili shows price volatility, indicating strong market dynamics
- Vegetable categories show steady demand patterns
- Average daily sales value: $1,200-1,500

## Recommendations
- Focus on red chili for higher margins
- Maintain consistent tomato inventory
- Consider bulk pricing for potatoes

Would you like me to dive deeper into any specific product or time period?
      `;
      actionTaken = 'READ';
      suggestions = [
        "Analyze red chili trends",
        "Compare this month vs last month",
        "Show profit margins by product"
      ];
    } else {
      response = `Hello! I'm your AgriPredict AI assistant. I can help you with:

- **Data Management**: Add, edit, or delete sales records
- **Forecasting**: Generate demand predictions for any product
- **Analysis**: Provide insights on sales trends and patterns
- **Reports**: Create summaries and recommendations

What would you like to do today?`;
      suggestions = [
        "Add a new sales record",
        "Generate a forecast",
        "Analyze my sales data",
        "Show recent trends"
      ];
    }
    
    return {
      response: {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: response,
        suggestions,
        actionTaken,
        requiresRefetch,
      },
    };
  },
};

// Helper function to map productId to productName
function getProductNameFromId(productId: string): string {
  const productMap: Record<string, string> = {
    'red-chili': 'Red Chili',
    'onions': 'Onions',
    'tomatoes': 'Tomatoes',
    'potatoes': 'Potatoes',
    'rice': 'Rice',
    'wheat': 'Wheat'
  };
  return productMap[productId] || productId;
}

// Override API client in development
if (process.env.NODE_ENV === 'development') {
  // This would be imported and used by the API client
  console.log('Using mock API for development');
}