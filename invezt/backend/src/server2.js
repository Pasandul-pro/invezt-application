require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const app = express();

// Import your route files
const stockRoutes = require('./routes/stockRoutes');
const authRoutes = require('./routes/authRoutes');

// Middleware to parse JSON bodies
app.use(helmet());

//Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: 'Too many requests, please try again later.' }
});
app.use(limiter);


// Middleware to parse JSON bodies
app.use(express.json());

// Register your API routes
app.use('/api/stocks', stockRoutes);
app.use('/api/auth', authRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB Atlas (Cloud)!'))
  .catch(err => console.error('Cloud Connection Error:', err));
// ----------------------------------------------------------

// Start the server
app.listen(3000, () => console.log('Server running on port 3000'));