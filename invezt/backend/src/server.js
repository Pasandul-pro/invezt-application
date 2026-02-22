const dns = require('node:dns/promises');
dns.setServers(['8.8.8.8', '1.1.1.1']); // Use Google and Cloudflare maps

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// 1. THE IMPORTS (Tell the computer where your files are)
const authRoutes = require('./routes/authRoutes');
const portfolioRoutes = require('./routes/portfolio.routes.js');
const userRoutes = require('./routes/userRoutes');

// 👇 YOUR IMPORTS (News, Alerts, Notifications, Stocks)
const newsRoutes = require('./routes/news.routes.js');
const alertRoutes = require('./routes/alert.routes.js');
const notificationSettingsRoutes = require('./routes/notificationSettings.routes.js');
const stockRoutes = require('./routes/stock.routes.js');

// Middleware - This allows the server to understand JSON sent from the frontend
app.use(express.json());
app.use(cors()); // Allows your React frontend to talk to this backend

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch(err => console.error("❌ Connection error:", err));

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/user', userRoutes);

// 👇 YOUR ROUTES (News, Alerts, Notifications, Stocks)
app.use('/api/news', newsRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/notification-settings', notificationSettingsRoutes);
app.use('/api/stocks', stockRoutes);

// Test endpoint to check if server is running
app.get('/', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Invezt API is running - Sprint 1 Complete!',
    endpoints: {
      auth: '/api/auth',
      portfolio: '/api/portfolio',
      user: '/api/user',
      stocks: '/api/stocks',
      news: '/api/news',
      alerts: '/api/alerts',
      settings: '/api/notification-settings'
    },
    completed_by: 'Chamath - Sprint 1'
  });
});

// Test endpoint specifically for your News API
app.get('/api/test/news', async (req, res) => {
  try {
    const News = require('./models/News');
    const newsCount = await News.countDocuments();
    const recentNews = await News.find().sort({ date: -1 }).limit(3);
    
    res.json({ 
      success: true, 
      message: '✅ News schema is working!',
      totalNewsArticles: newsCount,
      recentNews: recentNews.map(n => ({
        title: n.title,
        category: n.category,
        date: n.date
      })),
      note: 'Sprint 1 enhanced with pagination and search'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Test endpoint specifically for your Alerts API
app.get('/api/test/alerts', async (req, res) => {
  try {
    const Alert = require('./models/Alert');
    const alertsCount = await Alert.countDocuments();
    
    res.json({ 
      success: true, 
      message: '✅ Alert schema is working!',
      totalAlerts: alertsCount,
      note: 'Ready for Sprint 1'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Test endpoint specifically for your Notification Settings API
app.get('/api/test/settings', async (req, res) => {
  try {
    const NotificationSettings = require('./models/NotificationSettings');
    const settingsCount = await NotificationSettings.countDocuments();
    
    res.json({ 
      success: true, 
      message: '✅ NotificationSettings schema is working!',
      totalSettings: settingsCount,
      note: 'Ready for Sprint 1'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Test endpoint specifically for your Stock API
app.get('/api/test/stocks', async (req, res) => {
  try {
    const Stock = require('./models/Stock');
    const stockCount = await Stock.countDocuments();
    const recentStocks = await Stock.find().limit(5);
    
    res.json({ 
      success: true, 
      message: '✅ Stock schema is working!',
      totalStocks: stockCount,
      recentStocks: recentStocks.map(s => ({
        symbol: s.symbol,
        name: s.name,
        sector: s.sector
      })),
      note: 'Sprint 1 - Stock Metadata API ready for frontend dropdown'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Test endpoint specifically for your Portfolio API
app.get('/api/test/portfolio', async (req, res) => {
  try {
    const Portfolio = require('./models/Portfolio');
    const portfolioCount = await Portfolio.countDocuments();
    
    res.json({ 
      success: true, 
      message: '✅ Portfolio schema is working!',
      totalPortfolios: portfolioCount,
      note: 'Sprint 1 - Basic Portfolio API ready!',
      endpoints: {
        getAll: 'GET /api/portfolio',
        getValue: 'GET /api/portfolio/value',
        addHolding: 'POST /api/portfolio/holdings',
        updateHolding: 'PUT /api/portfolio/holdings/:symbol',
        removeHolding: 'DELETE /api/portfolio/holdings/:symbol',
        updateName: 'PUT /api/portfolio/name',
        reset: 'POST /api/portfolio/reset'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Your APIs:`);
  console.log(`   News API: http://localhost:${PORT}/api/news`);
  console.log(`   Alerts API: http://localhost:${PORT}/api/alerts`);
  console.log(`   Settings API: http://localhost:${PORT}/api/notification-settings`);
  console.log(`   Stocks API: http://localhost:${PORT}/api/stocks`);
  console.log(`   Portfolio API: http://localhost:${PORT}/api/portfolio`);
  console.log(`🧪 Test your schemas:`);
  console.log(`   http://localhost:${PORT}/api/test/news`);
  console.log(`   http://localhost:${PORT}/api/test/alerts`);
  console.log(`   http://localhost:${PORT}/api/test/settings`);
  console.log(`   http://localhost:${PORT}/api/test/stocks`);
  console.log(`   http://localhost:${PORT}/api/test/portfolio`);
  console.log(`✅ Sprint 1 Complete! - Chamath`);
});