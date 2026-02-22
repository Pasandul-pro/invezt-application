const dns = require('node:dns/promises');
dns.setServers(['8.8.8.8', '1.1.1.1']); // Use Google and Cloudflare maps

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// 1. THE IMPORTS (Tell the computer where your files are)
const authRoutes = require('./routes/authRoutes');
const portfolioRoutes = require('./routes/portfolioRoutes');
const userRoutes = require('./routes/userRoutes');

// 👇 YOUR IMPORTS (News, Alerts, Notifications)
const newsRoutes = require('./routes/news.routes.js');
const alertRoutes = require('./routes/alert.routes.js');
const notificationSettingsRoutes = require('./routes/notificationSettings.routes.js');

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

// 👇 YOUR ROUTES (News, Alerts, Notifications)
app.use('/api/news', newsRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/notification-settings', notificationSettingsRoutes);

// Test endpoint to check if server is running
app.get('/', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Invezt API is running',
    endpoints: {
      auth: '/api/auth',
      portfolio: '/api/portfolio',
      user: '/api/user',
      news: '/api/news',                    // Your endpoint
      alerts: '/api/alerts',                 // Your endpoint
      settings: '/api/notification-settings' // Your endpoint
    }
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
      note: 'Your Sprint 0 is complete!'
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
      note: 'Your Sprint 0 is complete!'
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
      note: 'Your Sprint 0 is complete!'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Your News API: http://localhost:${PORT}/api/news`);
  console.log(`📝 Your Alerts API: http://localhost:${PORT}/api/alerts`);
  console.log(`📝 Your Settings API: http://localhost:${PORT}/api/notification-settings`);
  console.log(`🧪 Test your schemas:`);
  console.log(`   http://localhost:${PORT}/api/test/news`);
  console.log(`   http://localhost:${PORT}/api/test/alerts`);
  console.log(`   http://localhost:${PORT}/api/test/settings`);
});