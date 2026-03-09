const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Import routes
const financialRoutes = require('./routes/financialRoutes');

// Import CSE integration service
const cseIntegrationService = require('./services/cseIntegrationService');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB connection - FIXED: removed deprecated options
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/invezt')
.then(() => {
  console.log('✅ MongoDB connected successfully');
  console.log('🔄 Starting CSE auto-polling service...');
  cseIntegrationService.startPolling();
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

// Routes
app.use('/api/financial', financialRoutes);

// Health check route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Invezt API is running with CSE auto-detection',
    timestamp: new Date(),
    services: {
      financial: '/api/financial'
    },
    endpoints: {
      liveRatios: 'GET /api/financial/live/:symbol',
      historicalRatios: 'GET /api/financial/ratios/:symbol',
      manualCalculate: 'POST /api/financial/calculate/:symbol',
      health: 'GET /api/financial/health'
    },
    features: {
      cseAutoDetect: 'Active (checks every 5 minutes)',
      ratiosCalculated: '10 ratios (P/E, P/B, ROE, ROA, D/E, Current, Quick, EPS, Div Yield, PEG)'
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
  console.log(`🔄 CSE auto-polling: Active (every 5 minutes)`);
  console.log(`🧮 10 Ratios: P/E, P/B, ROE, ROA, D/E, Current, Quick, EPS, Div Yield, PEG`);
  console.log(`📝 Test live: http://localhost:${PORT}/api/financial/live/JKH.N0000`);
});