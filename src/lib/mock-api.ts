// Mock API implementation for development
import {
  DemandRecord,
  DemandResponse,
  DemandQueryParams,
  CreateDemandRequest,
  UpdateDemandRequest,
  ForecastResponse,
  ForecastRequest,
  ChatResponse,
  Product
} from '@/types/api';

// LocalStorage helpers
const DEMANDS_KEY = 'agriBuddy:demands';

function getLocalDemands(): DemandRecord[] {
  const raw = typeof window !== 'undefined' ? window.localStorage.getItem(DEMANDS_KEY) : null;
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }
  // Start with empty array - no hardcoded initial data
  return [];
}
function setLocalDemands(data: DemandRecord[]) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(DEMANDS_KEY, JSON.stringify(data));
  }
}

// Helper function to simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockApi = {
  async getDemands(params: DemandQueryParams = {}): Promise<DemandResponse> {
    await delay(500); // Simulate network delay
    
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      sortKey = 'date', 
      sortOrder = 'desc',
      dateFrom,
      dateTo,
      priceMin,
      priceMax,
      quantityMin,
      quantityMax,
      productIds
    } = params;
    
    // Filter by search (only if search is provided)
    const demands = getLocalDemands();
    let filtered = demands;
    
    if (search && search.trim()) {
      filtered = demands.filter(demand => 
        demand.productName.toLowerCase().includes(search.toLowerCase()) ||
        demand.productId.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // Apply additional filters
    if (dateFrom) {
      filtered = filtered.filter(demand => new Date(demand.date) >= new Date(dateFrom));
    }
    if (dateTo) {
      filtered = filtered.filter(demand => new Date(demand.date) <= new Date(dateTo));
    }
    if (priceMin !== undefined) {
      filtered = filtered.filter(demand => demand.price >= priceMin);
    }
    if (priceMax !== undefined) {
      filtered = filtered.filter(demand => demand.price <= priceMax);
    }
    if (quantityMin !== undefined) {
      filtered = filtered.filter(demand => demand.quantity >= quantityMin);
    }
    if (quantityMax !== undefined) {
      filtered = filtered.filter(demand => demand.quantity <= quantityMax);
    }
    if (productIds && productIds.length > 0) {
      filtered = filtered.filter(demand => productIds.includes(demand.productId));
    }
    
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
    
    // Generate productId from productName
    const productId = data.productName
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .trim();
    
    const newRecord: DemandRecord = {
      id: `${Date.now()}`,
      date: data.date,
      productName: data.productName,
      productId,
      quantity: data.quantity,
      price: data.price,
      unit: data.unit || 'pcs',
    };
    
    const demands = getLocalDemands();
    demands.unshift(newRecord);
    setLocalDemands(demands);
    return newRecord;
  },  async updateDemand(id: string, data: UpdateDemandRequest): Promise<DemandRecord> {
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
      productName: data.productName || existing.productName
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

  async getProducts(): Promise<Product[]> {
    await delay(300); // Simulate network delay

    // Get unique products from the actual demand data
    const demands = getLocalDemands();
    const uniqueProducts = new Map<string, Product>();

    demands.forEach(demand => {
      if (!uniqueProducts.has(demand.productId)) {
        // Determine category based on common product patterns
        let category = 'Vegetables';
        const productName = demand.productName.toLowerCase();

        if (productName.includes('chili') || productName.includes('spice') ||
            productName.includes('garlic') || productName.includes('ginger')) {
          category = 'Spices';
        } else if (productName.includes('rice') || productName.includes('wheat') ||
                   productName.includes('grain')) {
          category = 'Grains';
        }

        uniqueProducts.set(demand.productId, {
          id: demand.productId,
          name: demand.productName,
          category,
          unit: 'kg'
        });
      }
    });

    // Return products sorted by name
    return Array.from(uniqueProducts.values()).sort((a, b) => a.name.localeCompare(b.name));
  },

  async generateForecast(_productId: string, days: number, _options?: Partial<ForecastRequest>): Promise<ForecastResponse> {
    await delay(2000); // Longer delay to simulate ML processing

    // Get product info from demand data
    const demands = getLocalDemands();
    const productDemand = demands.find(d => d.productId === _productId);

    if (!productDemand) {
      throw new Error('Product not found');
    }

    const product = {
      id: productDemand.productId,
      name: productDemand.productName,
      category: 'Unknown', // Could be determined from product name patterns
      unit: 'kg'
    };
    
    // Generate mock forecast data with enhanced features
    const forecastData = Array.from({ length: days }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() + i + 1);
      
      // Enhanced mock algorithm with scenario-based adjustments
      const baseValue = 150 + Math.sin(i / 7) * 20; // Weekly pattern
      let scenarioMultiplier = 1;
      
      if (_options?.scenario === 'optimistic') {
        scenarioMultiplier = 1.2;
      } else if (_options?.scenario === 'pessimistic') {
        scenarioMultiplier = 0.8;
      }
      
      const randomVariation = (Math.random() - 0.5) * 30;
      const predictedValue = Math.max(0, (baseValue + randomVariation) * scenarioMultiplier);
      
      // Generate confidence intervals if requested
      const confidenceLower = _options?.includeConfidence ? predictedValue * 0.85 : undefined;
      const confidenceUpper = _options?.includeConfidence ? predictedValue * 1.15 : undefined;
      
      return {
        date: date.toISOString(),
        predictedValue: Math.round(predictedValue),
        confidenceLower: confidenceLower ? Math.round(confidenceLower) : undefined,
        confidenceUpper: confidenceUpper ? Math.round(confidenceUpper) : undefined,
        modelUsed: _options?.models?.[0] || 'ensemble'
      };
    });
    
    // Enhanced summary with scenario information
    const scenarioText = _options?.scenario ? ` (${_options.scenario} scenario)` : '';
    const modelsText = _options?.models ? ` using ${(_options.models).join(', ')}` : '';
    
    const summary = `
# Enhanced Forecast Analysis for ${product.name}${scenarioText}

Based on advanced analysis${modelsText}, here are the key insights for the ${days}-day forecast:

## Key Findings
- **Average predicted demand**: ${Math.round(forecastData.reduce((sum, d) => sum + d.predictedValue, 0) / days)} units/day
- **Peak demand expected**: ${Math.max(...forecastData.map(d => d.predictedValue))} units
- **Lowest demand expected**: ${Math.min(...forecastData.map(d => d.predictedValue))} units
- **Forecast confidence**: ${Math.round(Math.random() * 20 + 80)}%

## Scenario Analysis
${_options?.scenario === 'optimistic' ? '- Optimistic scenario assumes favorable market conditions' : 
  _options?.scenario === 'pessimistic' ? '- Pessimistic scenario accounts for potential challenges' : 
  '- Realistic scenario based on current market trends'}

## Recommendations
1. **Stock Management**: Maintain inventory levels around the average predicted demand
2. **Price Optimization**: Consider dynamic pricing during peak demand periods
3. **Supply Chain**: Coordinate with suppliers for consistent availability
4. **Risk Mitigation**: Monitor actual performance against forecast ranges

## Model Performance
${_options?.models ? `Models used: ${(_options.models).join(', ')}` : 'Ensemble model combining multiple algorithms'}
${_options?.includeConfidence ? 'Confidence intervals included for risk assessment' : ''}

*This forecast is generated using advanced time series analysis and machine learning algorithms.*
    `;
    
    // Generate revenue projection if selling price is provided
    const revenueProjection = _options?.sellingPrice ? forecastData.map(point => ({
      date: point.date,
      projectedQuantity: point.predictedValue,
      sellingPrice: _options.sellingPrice!,
      projectedRevenue: point.predictedValue * _options.sellingPrice!,
      confidenceLower: point.confidenceLower ? point.confidenceLower * _options.sellingPrice! : undefined,
      confidenceUpper: point.confidenceUpper ? point.confidenceUpper * _options.sellingPrice! : undefined
    })) : undefined;
    
    return {
      forecastData,
      revenueProjection,
      summary: summary.trim(),
      modelsUsed: _options?.models || ['ensemble'],
      confidence: Math.round(Math.random() * 20 + 80) / 100,
      scenario: _options?.scenario || 'realistic',
      metadata: {
        dataPoints: 100, // Mock data points
        forecastHorizon: days,
        lastTrainingDate: new Date().toISOString()
      }
    };
  },

  async sendChatMessage(message: string): Promise<ChatResponse> {
    await delay(1500); // Simulate AI processing time
    
    // Get available products for dynamic suggestions
    const products = await this.getProducts();
    const productNames = products.map(p => p.name);
    
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
        "Show me all records",
        "Delete the latest record",
        "Remove all records from yesterday"
      ];
    } else if (lowerMessage.includes('add') || lowerMessage.includes('create')) {
      response = "I can help you add a new sales record! Please provide the product, quantity, price, and date for the new record.";
      actionTaken = 'CREATE';
      suggestions = [
        "Add a new sales record",
        "Create record for a product",
        "Add multiple records"
      ];
    } else if (lowerMessage.includes('forecast') || lowerMessage.includes('predict')) {
      response = "I can generate a demand forecast for any product in your inventory. Which product would you like me to forecast, and for how many days?";
      actionTaken = 'FORECAST';
      if (productNames.length > 0) {
        suggestions = [
          `Forecast ${productNames[0]} for 14 days`,
          `Predict ${productNames[0]} demand for next month`,
          "Generate forecast for all products"
        ];
      } else {
        suggestions = [
          "Add some products first to generate forecasts",
          "Create sales records to enable forecasting"
        ];
      }
    } else if (lowerMessage.includes('analyze') || lowerMessage.includes('insight')) {
      if (productNames.length > 0) {
        response = `
# Data Analysis Summary

Based on your current sales data, here are some key insights:

## Available Products
${productNames.map(name => `- ${name}`).join('\n')}

## Recent Trends
- Your data shows ${productNames.length} different products
- Analysis available once you have more sales records

## Recommendations
- Add more sales records to get detailed insights
- Track different products to see market patterns

Would you like me to dive deeper into any specific product or time period?
        `;
      } else {
        response = "I need some sales data to provide analysis. Please add some sales records first!";
      }
      actionTaken = 'READ';
      suggestions = [
        "Analyze sales trends",
        "Compare products",
        "Show profit margins"
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

// Override API client in development
if (process.env.NODE_ENV === 'development') {
  // This would be imported and used by the API client
  console.log('Using mock API for development');
}