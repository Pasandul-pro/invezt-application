const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Import routes
const financialRoutes = require('./routes/financialRoutes');
const stockRoutes = require('./routes/stockRoutes'); // NEW: Real-time stock routes

// Import services
const cseIntegrationService = require('./services/cseIntegrationService');
const realTimeStockService = require('./services/realTimeStockService'); // NEW: Real-time stock service

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/invezt')
.then(() => {
  console.log('✅ MongoDB connected successfully');
  console.log('🔄 Starting CSE auto-polling service...');
  cseIntegrationService.startPolling();
  
  // Start real-time stock polling (every 60 seconds)
  console.log('📊 Starting real-time stock polling...');
  realTimeStockService.startRealTimePolling(60);
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

// Routes
app.use('/api/financial', financialRoutes);
app.use('/api/stocks', stockRoutes); // NEW: Real-time stock API endpoints

// Health check route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Invezt API is running with CSE auto-detection and real-time stock data',
    timestamp: new Date(),
    services: {
      financial: '/api/financial',
      stocks: '/api/stocks' // NEW: Added to services list
    },
    endpoints: {
      // Financial endpoints
      liveRatios: 'GET /api/financial/live/:symbol',
      historicalRatios: 'GET /api/financial/ratios/:symbol',
      manualCalculate: 'POST /api/financial/calculate/:symbol',
      health: 'GET /api/financial/health',
      
      // NEW: Real-time stock endpoints
      realtimeStock: 'GET /api/stocks/realtime/:symbol',
      marketSnapshot: 'GET /api/stocks/market/snapshot',
      topGainers: 'GET /api/stocks/market/gainers',
      topLosers: 'GET /api/stocks/market/losers',
      mostActive: 'GET /api/stocks/market/active',
      marketIndices: 'GET /api/stocks/market/indices',
      stockHistory: 'GET /api/stocks/history/:symbol',
      stockChart: 'GET /api/stocks/chart/:symbol'
    },
    features: {
      cseAutoDetect: 'Active (checks every 5 minutes)',
      ratiosCalculated: '10 ratios (P/E, P/B, ROE, ROA, D/E, Current, Quick, EPS, Div Yield, PEG)',
      realTimeStocks: 'Active (updates every 60 seconds)' // NEW
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Financial ratios API: http://localhost:${PORT}/api/financial`);
  console.log(`📈 Real-time stock API: http://localhost:${PORT}/api/stocks`);
  console.log(`🔄 CSE auto-polling: Active (every 5 minutes)`);
  console.log(`📊 Real-time stock polling: Active (every 60 seconds)`);
  console.log(`🧮 10 Ratios: P/E, P/B, ROE, ROA, D/E, Current, Quick, EPS, Div Yield, PEG`);
  console.log(`📝 Test financial live: http://localhost:${PORT}/api/financial/live/JKH.N0000`);
  console.log(`📝 Test stock realtime: http://localhost:${PORT}/api/stocks/realtime/JKH.N0000`);
  console.log(`📝 Test market snapshot: http://localhost:${PORT}/api/stocks/market/snapshot`);
});