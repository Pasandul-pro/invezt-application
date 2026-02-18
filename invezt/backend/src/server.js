const dns = require('node:dns/promises');
dns.setServers(['8.8.8.8', '1.1.1.1']); // Use Google and Cloudflare maps

require('dotenv').config();
const express = require('express');
// ... the rest of your code

const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// 1. THE IMPORTS (Tell the computer where your files are)
const authRoutes = require('./routes/authRoutes');
const portfolioRoutes = require('./routes/portfolioRoutes');

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
app.use('/api/user', require('./routes/userRoutes'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

